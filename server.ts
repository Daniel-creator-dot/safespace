import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const app = express();
app.use(express.json());

// Enable CORS for all origins
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

const PORT = process.env.PORT || 5000;

// Setup PostgreSQL pool
const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'safespace',
        password: process.env.DB_PASSWORD || 'Admin',
        port: parseInt(process.env.DB_PORT || '5432'),
      }
);

// Database schema and seeding script
async function initDb() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS grade_fees (
        grade_level VARCHAR(100) PRIMARY KEY,
        tuition_fee NUMERIC NOT NULL,
        activity_fee NUMERIC NOT NULL,
        facilities_fee NUMERIC NOT NULL,
        registration_fee NUMERIC NOT NULL
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS predefined_courses (
        code VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        cost NUMERIC NOT NULL
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id VARCHAR(50) PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id VARCHAR(50) PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        date_of_birth DATE NOT NULL,
        gender VARCHAR(20) NOT NULL,
        grade_level VARCHAR(100) NOT NULL REFERENCES grade_fees(grade_level) ON UPDATE CASCADE,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        address TEXT NOT NULL,
        parent_name VARCHAR(100),
        parent_email VARCHAR(100),
        parent_phone VARCHAR(50),
        parent_relationship VARCHAR(50),
        admission_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
        total_fees NUMERIC NOT NULL,
        paid_fees NUMERIC NOT NULL DEFAULT 0,
        outstanding_fees NUMERIC NOT NULL,
        registration_date DATE NOT NULL,
        admin_notes TEXT,
        courses TEXT[] DEFAULT '{}'
      );
    `);

    // Schema migration: drop NOT NULL constraints for parent fields if table already exists
    await client.query(`
      ALTER TABLE students ALTER COLUMN parent_name DROP NOT NULL;
      ALTER TABLE students ALTER COLUMN parent_email DROP NOT NULL;
      ALTER TABLE students ALTER COLUMN parent_phone DROP NOT NULL;
      ALTER TABLE students ALTER COLUMN parent_relationship DROP NOT NULL;
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS student_documents (
        id VARCHAR(50) PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        uploaded_at DATE NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Pending'
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS fee_payments (
        id VARCHAR(50) PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        amount NUMERIC NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_date DATE NOT NULL,
        reference VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        term VARCHAR(50) NOT NULL
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS fee_ledger_items (
        id VARCHAR(50) PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        description VARCHAR(255) NOT NULL,
        amount NUMERIC NOT NULL,
        date DATE NOT NULL
      );
    `);

    // Seed grade_fees if empty
    const { rows: feesRows } = await client.query('SELECT COUNT(*) FROM grade_fees');
    if (parseInt(feesRows[0].count) === 0) {
      console.log('Seeding default grade fee structure...');
      const defaultFees = [
        { gradeLevel: 'Initial Consultation', tuitionFee: 1200, activityFee: 150, facilitiesFee: 100, registrationFee: 50 },
        { gradeLevel: 'PhD Writing Advising', tuitionFee: 1200, activityFee: 150, facilitiesFee: 100, registrationFee: 50 },
        { gradeLevel: "Master's Thesis Guidance", tuitionFee: 1200, activityFee: 150, facilitiesFee: 100, registrationFee: 50 },
        { gradeLevel: 'Research Design Coach', tuitionFee: 1200, activityFee: 150, facilitiesFee: 100, registrationFee: 50 },
        { gradeLevel: 'Dissertation Mentoring', tuitionFee: 1200, activityFee: 150, facilitiesFee: 100, registrationFee: 50 },
        { gradeLevel: 'Proposal Defense Prep', tuitionFee: 1200, activityFee: 150, facilitiesFee: 100, registrationFee: 50 },
        { gradeLevel: 'Literature Review Lab', tuitionFee: 1600, activityFee: 200, facilitiesFee: 150, registrationFee: 50 },
        { gradeLevel: 'Advanced Academic Syntax', tuitionFee: 1600, activityFee: 200, facilitiesFee: 150, registrationFee: 50 },
        { gradeLevel: 'Research Methods Bootcamp', tuitionFee: 1600, activityFee: 200, facilitiesFee: 150, registrationFee: 50 },
        { gradeLevel: 'Quantitative Analysis Advisory', tuitionFee: 2200, activityFee: 250, facilitiesFee: 200, registrationFee: 50 },
        { gradeLevel: 'Qualitative Framework Coaching', tuitionFee: 2200, activityFee: 250, facilitiesFee: 200, registrationFee: 50 },
        { gradeLevel: 'Grant Proposal Mentoring', tuitionFee: 2200, activityFee: 250, facilitiesFee: 200, registrationFee: 50 },
        { gradeLevel: 'Academic Journal Prep', tuitionFee: 2200, activityFee: 250, facilitiesFee: 200, registrationFee: 50 },
      ];
      for (const fee of defaultFees) {
        await client.query(
          `INSERT INTO grade_fees (grade_level, tuition_fee, activity_fee, facilities_fee, registration_fee) 
           VALUES ($1, $2, $3, $4, $5)`,
          [fee.gradeLevel, fee.tuitionFee, fee.activityFee, fee.facilitiesFee, fee.registrationFee]
        );
      }
    }

    // Seed predefined_courses if empty
    const { rows: coursesRows } = await client.query('SELECT COUNT(*) FROM predefined_courses');
    if (parseInt(coursesRows[0].count) === 0) {
      console.log('Seeding default elective courses...');
      const defaultCourses = [
        { code: 'RES-101', name: 'Mixed Methods Design', cost: 150 },
        { code: 'WRIT-202', name: 'Academic Syntax & Style', cost: 200 },
        { code: 'STAT-110', name: 'R & SPSS Data Analysis', cost: 120 },
        { code: 'BIB-150', name: 'LaTeX, Mendeley & Zotero', cost: 180 },
        { code: 'PRES-104', name: 'PhD Viva & Oral Defense Sim', cost: 100 },
        { code: 'PUB-102', name: 'Peer Review & Indexing Standards', cost: 130 }
      ];
      for (const course of defaultCourses) {
        await client.query(
          `INSERT INTO predefined_courses (code, name, cost) VALUES ($1, $2, $3)`,
          [course.code, course.name, course.cost]
        );
      }
    }

    // Seed admins if empty
    const { rows: adminsRows } = await client.query('SELECT COUNT(*) FROM admins');
    if (parseInt(adminsRows[0].count) === 0) {
      console.log('Seeding default administrative users...');
      const defaultAdmins = [
        { id: 'ADM-001', username: 'admin', name: 'Academic Director', email: 'director@safespaceconsult.com', role: 'Super Admin', passwordHash: 'password' },
        { id: 'ADM-002', username: 'registrar', name: 'Sarah Peterson', email: 's.peterson@safespaceconsult.com', role: 'Registrar', passwordHash: 'registrar123' }
      ];
      for (const admin of defaultAdmins) {
        await client.query(
          `INSERT INTO admins (id, username, name, email, role, password_hash) VALUES ($1, $2, $3, $4, $5, $6)`,
          [admin.id, admin.username, admin.name, admin.email, admin.role, admin.passwordHash]
        );
      }
    }

    // Seed students if empty
    const { rows: studentsRows } = await client.query('SELECT COUNT(*) FROM students');
    if (parseInt(studentsRows[0].count) === 0) {
      console.log('Seeding default student registry list...');
      const defaultStudents = [
        {
          id: 'REG-2026-0012',
          firstName: 'Sophia',
          lastName: 'Garcia',
          dateOfBirth: '1998-03-14',
          gender: 'Female',
          gradeLevel: 'Initial Consultation',
          email: 'sophiagarcia@gmail.com',
          phone: '+1 (555) 234-5678',
          address: '423 Pine Avenue, Willowbrook, NY 10023',
          courses: ['Mixed Methods Design', 'PhD Viva & Oral Defense Sim'],
          parentName: 'Prof. Maria Garcia',
          parentEmail: 'm.garcia@outlook.com',
          parentPhone: '+1 (555) 765-4321',
          parentRelationship: 'Other',
          admissionStatus: 'Approved',
          totalFees: 1500,
          paidFees: 750,
          outstandingFees: 750,
          registrationDate: '2026-05-12',
          adminNotes: 'Scholar has excellent research synopsis. Enrolled in part-time flexible plan for start of dissertation consultation program.',
          documents: [
            { id: 'doc-1', name: 'Sophia_Student_ID.pdf', type: 'Student ID Proof', uploadedAt: '2026-05-12', status: 'Verified' },
            { id: 'doc-2', name: 'Methodology_Draft_S.pdf', type: 'Research Synopsis', uploadedAt: '2026-05-12', status: 'Verified' }
          ],
          payments: [
            { id: 'p-1', amount: 750, paymentMethod: 'Bank Transfer', paymentDate: '2026-05-13', reference: 'TXN-9021-502', status: 'Paid', term: 'Fall Term 1' }
          ],
          feeLedgerItems: []
        },
        {
          id: 'REG-2026-0018',
          firstName: 'Ethan',
          lastName: 'Chen',
          dateOfBirth: '1995-08-25',
          gender: 'Male',
          gradeLevel: 'PhD Writing Advising',
          email: 'ethanchen@outlook.com',
          phone: '+1 (555) 345-6789',
          address: '89 Maple Road, Apt 3B, New York, NY 10002',
          courses: ['Academic Syntax & Style'],
          parentName: 'Dr. David Chen',
          parentEmail: 'dchen.biz@gmail.com',
          parentPhone: '+1 (555) 987-6543',
          parentRelationship: 'Other',
          admissionStatus: 'Pending',
          totalFees: 2700,
          paidFees: 0,
          outstandingFees: 2700,
          registrationDate: '2026-05-28',
          adminNotes: 'Application registered. Awaiting completed research draft and reference surveys from primary academic supervisor.',
          documents: [
            { id: 'doc-3', name: 'Ethan_Thesis_Chapters.pdf', type: 'Research Synopsis', uploadedAt: '2026-05-28', status: 'Verified' },
            { id: 'doc-4', name: 'Address_UtilityBill.pdf', type: 'Academic Transcripts', uploadedAt: '2026-05-28', status: 'Pending' }
          ],
          payments: [],
          feeLedgerItems: []
        },
        {
          id: 'REG-2026-0024',
          firstName: 'Liam',
          lastName: 'Smith',
          dateOfBirth: '1999-11-02',
          gender: 'Male',
          gradeLevel: "Master's Thesis Guidance",
          email: 'lsmith_parent@gmail.com',
          phone: '+1 (555) 456-7890',
          address: '15 Ocean Drive, Red Hook, NY 11231',
          courses: [],
          parentName: 'Sarah Smith',
          parentEmail: 'lsmith_parent@gmail.com',
          parentPhone: '+1 (555) 123-9876',
          parentRelationship: 'Mother',
          admissionStatus: 'Approved',
          totalFees: 1500,
          paidFees: 1500,
          outstandingFees: 0,
          registrationDate: '2026-05-15',
          adminNotes: 'Fully paid and verified. Ready for onboarding consultation with dissertation advisor. Scheduled for Desk 2B.',
          documents: [
            { id: 'doc-5', name: 'Liam_ID_Cert.pdf', type: 'Research Synopsis', uploadedAt: '2026-05-15', status: 'Verified' },
            { id: 'doc-6', name: 'Intake_Report_Liam.pdf', type: 'Academic Transcripts', uploadedAt: '2026-05-15', status: 'Verified' },
            { id: 'doc-7', name: 'Clinical_Consent_Form.pdf', type: 'Ethical Clearance Draft', uploadedAt: '2026-05-15', status: 'Verified' }
          ],
          payments: [
            { id: 'p-2', amount: 1500, paymentMethod: 'Credit Card', paymentDate: '2026-05-16', reference: 'TXN-0004-991', status: 'Paid', term: 'Fall Term 1' }
          ],
          feeLedgerItems: []
        },
        {
          id: 'REG-2026-0031',
          firstName: 'Ava',
          lastName: 'Johnson',
          dateOfBirth: '1997-04-18',
          gender: 'Female',
          gradeLevel: 'Literature Review Lab',
          email: 'ajohnson@gmail.com',
          phone: '+1 (555) 567-8901',
          address: '772 Riverdale Lane, Bronx, NY 10471',
          courses: ['LaTeX, Mendeley & Zotero', 'Peer Review & Indexing Standards'],
          parentName: 'Robert Johnson',
          parentEmail: 'rjohnson@gmail.com',
          parentPhone: '+1 (555) 890-1234',
          parentRelationship: 'Father',
          admissionStatus: 'In Review',
          totalFees: 2000,
          paidFees: 0,
          outstandingFees: 2000,
          registrationDate: '2026-06-01',
          adminNotes: 'Initial advisory session conducted on June 3. Draft literature review shows good scope. Awaiting lead advisory committee approval.',
          documents: [
            { id: 'doc-8', name: 'Ava_Assessment_Form.pdf', type: 'Academic Transcripts', uploadedAt: '2026-06-01', status: 'Verified' },
            { id: 'doc-9', name: 'Ava_ID_Copy.pdf', type: 'Research Synopsis', uploadedAt: '2026-06-01', status: 'Verified' }
          ],
          payments: [],
          feeLedgerItems: []
        },
        {
          id: 'REG-2026-0035',
          firstName: 'Marcus',
          lastName: 'Miller',
          dateOfBirth: '1993-02-12',
          gender: 'Male',
          gradeLevel: 'Research Methods Bootcamp',
          email: 'marcusmiller@gmail.com',
          phone: '+1 (555) 678-9012',
          address: '33 Valley Stream Rd, Queens, NY 11413',
          courses: ['R & SPSS Data Analysis', 'LaTeX, Mendeley & Zotero', 'Academic Syntax & Style'],
          parentName: 'Patricia Miller',
          parentEmail: 'pmiller@yahoo.com',
          parentPhone: '+1 (555) 345-0987',
          parentRelationship: 'Mother',
          admissionStatus: 'Approved',
          totalFees: 2700,
          paidFees: 2700,
          outstandingFees: 0,
          registrationDate: '2026-05-10',
          adminNotes: 'Enrolled in dissertation methodology bootcamp. Analytical modules fully allocated. Fees processed.',
          documents: [
            { id: 'doc-10', name: 'Marcus_Intake_Survey.pdf', type: 'Academic Transcripts', uploadedAt: '2026-05-10', status: 'Verified' },
            { id: 'doc-11', name: 'ID_Marcus_Miller.pdf', type: 'Student ID Proof', uploadedAt: '2026-05-10', status: 'Verified' },
            { id: 'doc-12', name: 'Verification_Miller_Address.pdf', type: 'Academic Transcripts', uploadedAt: '2026-05-10', status: 'Verified' }
          ],
          payments: [
            { id: 'p-3', amount: 2700, paymentMethod: 'Bank Transfer', paymentDate: '2026-05-11', reference: 'TXN-1102-540', status: 'Paid', term: 'Fall Term 1' }
          ],
          feeLedgerItems: []
        },
        {
          id: 'REG-2026-0038',
          firstName: 'Isabella',
          lastName: 'Davis',
          dateOfBirth: '1996-07-22',
          gender: 'Female',
          gradeLevel: 'PhD Writing Advising',
          email: 'idavis_g4@gmail.com',
          phone: '+1 (555) 789-0123',
          address: '109 Hillside Court, Staten Island, NY 10301',
          courses: [],
          parentName: 'Kenneth Davis',
          parentEmail: 'kdavis@gmail.com',
          parentPhone: '+1 (555) 456-7811',
          parentRelationship: 'Father',
          admissionStatus: 'Rejected',
          totalFees: 1500,
          paidFees: 0,
          outstandingFees: 1500,
          registrationDate: '2026-05-22',
          adminNotes: 'Application cancelled per student request due to thesis deferral plans.',
          documents: [
            { id: 'doc-13', name: 'Izzy_ID_Document.pdf', type: 'Research Synopsis', uploadedAt: '2026-05-22', status: 'Rejected' }
          ],
          payments: [],
          feeLedgerItems: []
        }
      ];

      for (const student of defaultStudents) {
        await client.query(
          `INSERT INTO students (
             id, first_name, last_name, date_of_birth, gender, grade_level, email, phone, address,
             parent_name, parent_email, parent_phone, parent_relationship, admission_status,
             total_fees, paid_fees, outstanding_fees, registration_date, admin_notes, courses
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
          [
            student.id, student.firstName, student.lastName, student.dateOfBirth, student.gender, student.gradeLevel,
            student.email, student.phone, student.address, student.parentName, student.parentEmail, student.parentPhone,
            student.parentRelationship, student.admissionStatus, student.totalFees, student.paidFees,
            student.outstandingFees, student.registrationDate, student.adminNotes, student.courses
          ]
        );

        for (const doc of student.documents) {
          await client.query(
            `INSERT INTO student_documents (id, student_id, name, type, uploaded_at, status) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [doc.id, student.id, doc.name, doc.type, doc.uploadedAt, doc.status]
          );
        }

        for (const payment of student.payments) {
          await client.query(
            `INSERT INTO fee_payments (id, student_id, amount, payment_method, payment_date, reference, status, term) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [payment.id, student.id, payment.amount, payment.paymentMethod, payment.paymentDate, payment.reference, payment.status, payment.term]
          );
        }
      }
    }

    await client.query('COMMIT');
    console.log('Database initialized and seeded.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error during database initialization:', err);
    throw err;
  } finally {
    client.release();
  }
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Admin authentication login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try {
    const { rows } = await pool.query(
      `SELECT id, username, name, email, role, password_hash AS "passwordHash"
       FROM admins WHERE LOWER(username) = $1`,
      [username.trim().toLowerCase()]
    );
    if (rows.length === 0 || rows[0].passwordHash !== password) {
      return res.status(401).json({ error: 'Invalid administrator credentials.' });
    }
    const user = { ...rows[0] };
    delete user.passwordHash;
    res.json(user);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server login failure.' });
  }
});

// Fetch all administrative users
app.get('/api/admins', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, username, name, email, role, password_hash AS "passwordHash", TO_CHAR(created_at, 'YYYY-MM-DD') AS "createdAt" 
       FROM admins ORDER BY created_at ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching admins:', err);
    res.status(500).json({ error: 'Failed to fetch administrators list.' });
  }
});

// Create a new sub-admin
app.post('/api/admins', async (req, res) => {
  const { id, username, name, email, role, passwordHash } = req.body;
  if (!username || !name || !email || !role || !passwordHash) {
    return res.status(400).json({ error: 'Missing mandatory administrator fields.' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO admins (id, username, name, email, role, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, username, name, email, role, password_hash AS "passwordHash", TO_CHAR(created_at, 'YYYY-MM-DD') AS "createdAt"`,
      [id || `ADM-${Math.floor(100 + Math.random() * 900)}`, username.toLowerCase().trim(), name.trim(), email.trim(), role, passwordHash]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating admin:', err);
    if (err.code === '23505') {
      res.status(409).json({ error: 'An administrator username with that name already exists.' });
    } else {
      res.status(500).json({ error: 'Failed to create administrator profile.' });
    }
  }
});

// Fetch grade/advisory level fees
app.get('/api/grade-fees', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT grade_level AS "gradeLevel", tuition_fee AS "tuitionFee", activity_fee AS "activityFee",
              facilities_fee AS "facilitiesFee", registration_fee AS "registrationFee"
       FROM grade_fees ORDER BY tuition_fee ASC, grade_level ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching grade fees:', err);
    res.status(500).json({ error: 'Failed to retrieve grade fee structure.' });
  }
});

// Sync/bulk update grade fees
app.put('/api/grade-fees', async (req, res) => {
  const fees = req.body;
  if (!Array.isArray(fees)) {
    return res.status(400).json({ error: 'Expected an array of grade fees.' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const fee of fees) {
      await client.query(
        `INSERT INTO grade_fees (grade_level, tuition_fee, activity_fee, facilities_fee, registration_fee)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (grade_level) DO UPDATE SET
           tuition_fee = EXCLUDED.tuition_fee,
           activity_fee = EXCLUDED.activity_fee,
           facilities_fee = EXCLUDED.facilities_fee,
           registration_fee = EXCLUDED.registration_fee`,
        [fee.gradeLevel, fee.tuitionFee, fee.activityFee, fee.facilitiesFee, fee.registrationFee]
      );
    }
    const gradeLevels = fees.map(f => f.gradeLevel);
    await client.query('DELETE FROM grade_fees WHERE NOT (grade_level = ANY($1))', [gradeLevels]);
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error syncing grade fees:', err);
    res.status(500).json({ error: 'Failed to synchronize grade fees structure.' });
  } finally {
    client.release();
  }
});

// Fetch all courses
app.get('/api/courses', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT code, name, cost FROM predefined_courses ORDER BY code ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ error: 'Failed to fetch course modules.' });
  }
});

// Sync/bulk update predefined courses
app.put('/api/courses', async (req, res) => {
  const courses = req.body;
  if (!Array.isArray(courses)) {
    return res.status(400).json({ error: 'Expected an array of courses.' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const course of courses) {
      await client.query(
        `INSERT INTO predefined_courses (code, name, cost)
         VALUES ($1, $2, $3)
         ON CONFLICT (code) DO UPDATE SET
           name = EXCLUDED.name,
           cost = EXCLUDED.cost`,
        [course.code, course.name, course.cost]
      );
    }
    const codes = courses.map(c => c.code);
    await client.query('DELETE FROM predefined_courses WHERE NOT (code = ANY($1))', [codes]);
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error syncing courses:', err);
    res.status(500).json({ error: 'Failed to synchronize predefined course modules.' });
  } finally {
    client.release();
  }
});

// Fetch all students (with nested preloads)
app.get('/api/students', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT s.id, s.first_name AS "firstName", s.last_name AS "lastName", 
             TO_CHAR(s.date_of_birth, 'YYYY-MM-DD') AS "dateOfBirth",
             s.gender, s.grade_level AS "gradeLevel", s.email, s.phone, s.address,
             s.parent_name AS "parentName", s.parent_email AS "parentEmail", s.parent_phone AS "parentPhone",
             s.parent_relationship AS "parentRelationship", s.admission_status AS "admissionStatus",
             s.total_fees AS "totalFees", s.paid_fees AS "paidFees", s.outstanding_fees AS "outstandingFees",
             TO_CHAR(s.registration_date, 'YYYY-MM-DD') AS "registrationDate", s.admin_notes AS "adminNotes", s.courses,
             (
               SELECT COALESCE(JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'id', d.id,
                   'name', d.name,
                   'type', d.type,
                   'uploadedAt', TO_CHAR(d.uploaded_at, 'YYYY-MM-DD'),
                   'status', d.status
                 )
               ), '[]'::json)
               FROM student_documents d WHERE d.student_id = s.id
             ) as documents,
             (
               SELECT COALESCE(JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'id', p.id,
                   'amount', p.amount,
                   'paymentMethod', p.payment_method,
                   'paymentDate', TO_CHAR(p.payment_date, 'YYYY-MM-DD'),
                   'reference', p.reference,
                   'status', p.status,
                   'term', p.term
                 )
               ), '[]'::json)
               FROM fee_payments p WHERE p.student_id = s.id
             ) as payments,
             (
               SELECT COALESCE(JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'id', l.id,
                   'description', l.description,
                   'amount', l.amount,
                   'date', TO_CHAR(l.date, 'YYYY-MM-DD')
                 )
               ), '[]'::json)
               FROM fee_ledger_items l WHERE l.student_id = s.id
             ) as "feeLedgerItems"
      FROM students s
      ORDER BY s.registration_date DESC, s.id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Failed to retrieve scholar student records.' });
  }
});

// Create student (with optional nested elements)
app.post('/api/students', async (req, res) => {
  const s = req.body;
  if (!s.firstName || !s.lastName || !s.email || !s.phone) {
    return res.status(400).json({ error: 'Missing mandatory client profile fields.' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const studentId = s.id || `REG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const regDate = s.registrationDate || new Date().toISOString().split('T')[0];
    
    await client.query(
      `INSERT INTO students (
         id, first_name, last_name, date_of_birth, gender, grade_level, email, phone, address,
         parent_name, parent_email, parent_phone, parent_relationship, admission_status,
         total_fees, paid_fees, outstanding_fees, registration_date, admin_notes, courses
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
      [
        studentId, s.firstName, s.lastName, s.dateOfBirth, s.gender, s.gradeLevel, s.email, s.phone, s.address,
        s.parentName, s.parentEmail, s.parentPhone, s.parentRelationship, s.admissionStatus || 'Pending',
        s.totalFees || 0, s.paidFees || 0, s.outstandingFees || s.totalFees || 0, regDate, s.adminNotes || '', s.courses || []
      ]
    );

    // Insert documents
    if (s.documents && Array.isArray(s.documents)) {
      for (const doc of s.documents) {
        await client.query(
          `INSERT INTO student_documents (id, student_id, name, type, uploaded_at, status) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [doc.id || `doc-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`, studentId, doc.name, doc.type, doc.uploadedAt || regDate, doc.status || 'Pending']
        );
      }
    }

    // Insert payments
    if (s.payments && Array.isArray(s.payments)) {
      for (const payment of s.payments) {
        await client.query(
          `INSERT INTO fee_payments (id, student_id, amount, payment_method, payment_date, reference, status, term) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [payment.id || `p-${Math.floor(1000 + Math.random() * 9000)}`, studentId, payment.amount, payment.paymentMethod, payment.paymentDate || regDate, payment.reference, payment.status || 'Paid', payment.term || 'Fall Term 1']
        );
      }
    }

    await client.query('COMMIT');
    
    // Fetch the newly created student back to return
    const { rows } = await pool.query(`
      SELECT s.id, s.first_name AS "firstName", s.last_name AS "lastName", 
             TO_CHAR(s.date_of_birth, 'YYYY-MM-DD') AS "dateOfBirth",
             s.gender, s.grade_level AS "gradeLevel", s.email, s.phone, s.address,
             s.parent_name AS "parentName", s.parent_email AS "parentEmail", s.parent_phone AS "parentPhone",
             s.parent_relationship AS "parentRelationship", s.admission_status AS "admissionStatus",
             s.total_fees AS "totalFees", s.paid_fees AS "paidFees", s.outstanding_fees AS "outstandingFees",
             TO_CHAR(s.registration_date, 'YYYY-MM-DD') AS "registrationDate", s.admin_notes AS "adminNotes", s.courses,
             (SELECT COALESCE(JSON_AGG(d.*), '[]'::json) FROM student_documents d WHERE d.student_id = s.id) as documents,
             (SELECT COALESCE(JSON_AGG(p.*), '[]'::json) FROM fee_payments p WHERE p.student_id = s.id) as payments,
             (SELECT COALESCE(JSON_AGG(l.*), '[]'::json) FROM fee_ledger_items l WHERE l.student_id = s.id) as "feeLedgerItems"
      FROM students s WHERE s.id = $1
    `, [studentId]);
    
    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error inserting student:', err);
    res.status(500).json({ error: 'Failed to submit post-graduate intake form.' });
  } finally {
    client.release();
  }
});

// Update student (syncs details + nested sub-records)
app.put('/api/students/:id', async (req, res) => {
  const studentId = req.params.id;
  const s = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Update core student row
    await client.query(
      `UPDATE students SET
         first_name = $1, last_name = $2, date_of_birth = $3, gender = $4, grade_level = $5,
         email = $6, phone = $7, address = $8, parent_name = $9, parent_email = $10,
         parent_phone = $11, parent_relationship = $12, admission_status = $13,
         total_fees = $14, paid_fees = $15, outstanding_fees = $16, admin_notes = $17,
         courses = $18
       WHERE id = $19`,
      [
        s.firstName, s.lastName, s.dateOfBirth, s.gender, s.gradeLevel,
        s.email, s.phone, s.address, s.parentName, s.parentEmail,
        s.parentPhone, s.parentRelationship, s.admissionStatus,
        s.totalFees, s.paidFees, s.outstandingFees, s.adminNotes,
        s.courses || [], studentId
      ]
    );

    // Sync Documents
    if (s.documents && Array.isArray(s.documents)) {
      const docIds = s.documents.map((d: any) => d.id);
      await client.query('DELETE FROM student_documents WHERE student_id = $1 AND NOT (id = ANY($2))', [studentId, docIds]);
      for (const doc of s.documents) {
        await client.query(
          `INSERT INTO student_documents (id, student_id, name, type, uploaded_at, status)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, name = EXCLUDED.name, type = EXCLUDED.type`,
          [doc.id, studentId, doc.name, doc.type, doc.uploadedAt, doc.status]
        );
      }
    } else {
      await client.query('DELETE FROM student_documents WHERE student_id = $1', [studentId]);
    }

    // Sync Payments
    if (s.payments && Array.isArray(s.payments)) {
      const paymentIds = s.payments.map((p: any) => p.id);
      await client.query('DELETE FROM fee_payments WHERE student_id = $1 AND NOT (id = ANY($2))', [studentId, paymentIds]);
      for (const p of s.payments) {
        await client.query(
          `INSERT INTO fee_payments (id, student_id, amount, payment_method, payment_date, reference, status, term)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, reference = EXCLUDED.reference, amount = EXCLUDED.amount`,
          [p.id, studentId, p.amount, p.paymentMethod, p.paymentDate, p.reference, p.status, p.term]
        );
      }
    } else {
      await client.query('DELETE FROM fee_payments WHERE student_id = $1', [studentId]);
    }

    // Sync Fee Ledger Items
    if (s.feeLedgerItems && Array.isArray(s.feeLedgerItems)) {
      const ledgerIds = s.feeLedgerItems.map((l: any) => l.id);
      await client.query('DELETE FROM fee_ledger_items WHERE student_id = $1 AND NOT (id = ANY($2))', [studentId, ledgerIds]);
      for (const l of s.feeLedgerItems) {
        await client.query(
          `INSERT INTO fee_ledger_items (id, student_id, description, amount, date)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, amount = EXCLUDED.amount`,
          [l.id, studentId, l.description, l.amount, l.date]
        );
      }
    } else {
      await client.query('DELETE FROM fee_ledger_items WHERE student_id = $1', [studentId]);
    }

    await client.query('COMMIT');
    
    // Fetch the updated student profile to return
    const { rows } = await pool.query(`
      SELECT s.id, s.first_name AS "firstName", s.last_name AS "lastName", 
             TO_CHAR(s.date_of_birth, 'YYYY-MM-DD') AS "dateOfBirth",
             s.gender, s.grade_level AS "gradeLevel", s.email, s.phone, s.address,
             s.parent_name AS "parentName", s.parent_email AS "parentEmail", s.parent_phone AS "parentPhone",
             s.parent_relationship AS "parentRelationship", s.admission_status AS "admissionStatus",
             s.total_fees AS "totalFees", s.paid_fees AS "paidFees", s.outstanding_fees AS "outstandingFees",
             TO_CHAR(s.registration_date, 'YYYY-MM-DD') AS "registrationDate", s.admin_notes AS "adminNotes", s.courses,
             (
               SELECT COALESCE(JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'id', d.id,
                   'name', d.name,
                   'type', d.type,
                   'uploadedAt', TO_CHAR(d.uploaded_at, 'YYYY-MM-DD'),
                   'status', d.status
                 )
               ), '[]'::json)
               FROM student_documents d WHERE d.student_id = s.id
             ) as documents,
             (
               SELECT COALESCE(JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'id', p.id,
                   'amount', p.amount,
                   'paymentMethod', p.payment_method,
                   'paymentDate', TO_CHAR(p.payment_date, 'YYYY-MM-DD'),
                   'reference', p.reference,
                   'status', p.status,
                   'term', p.term
                 )
               ), '[]'::json)
               FROM fee_payments p WHERE p.student_id = s.id
             ) as payments,
             (
               SELECT COALESCE(JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'id', l.id,
                   'description', l.description,
                   'amount', l.amount,
                   'date', TO_CHAR(l.date, 'YYYY-MM-DD')
                 )
               ), '[]'::json)
               FROM fee_ledger_items l WHERE l.student_id = s.id
             ) as "feeLedgerItems"
      FROM students s WHERE s.id = $1
    `, [studentId]);

    res.json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating student:', err);
    res.status(500).json({ error: 'Failed to update student profile.' });
  } finally {
    client.release();
  }
});

// Delete student
app.delete('/api/students/:id', async (req, res) => {
  const studentId = req.params.id;
  try {
    await pool.query('DELETE FROM students WHERE id = $1', [studentId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ error: 'Failed to delete student record.' });
  }
});

// Serve static assets in production
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

// For React Router single page app support
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// Initialize database and start listening
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server successfully listening on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server due to database init error:', err);
  process.exit(1);
});
