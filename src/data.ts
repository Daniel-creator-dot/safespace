/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, GradeFeeStructure } from './types';

export const GRADE_FEES: GradeFeeStructure[] = [
  { gradeLevel: 'Initial Consultation', tuitionFee: 1200, activityFee: 150, facilitiesFee: 100, registrationFee: 50 },
  { gradeLevel: 'PhD Writing Advising', tuitionFee: 1200, activityFee: 150, facilitiesFee: 100, registrationFee: 50 },
  { gradeLevel: 'Master\'s Thesis Guidance', tuitionFee: 1200, activityFee: 150, facilitiesFee: 100, registrationFee: 50 },
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

export const PREDEFINED_COURSES = [
  { code: 'RES-101', name: 'Mixed Methods Design', cost: 150 },
  { code: 'WRIT-202', name: 'Academic Syntax & Style', cost: 200 },
  { code: 'STAT-110', name: 'R & SPSS Data Analysis', cost: 120 },
  { code: 'BIB-150', name: 'LaTeX, Mendeley & Zotero', cost: 180 },
  { code: 'PRES-104', name: 'PhD Viva & Oral Defense Sim', cost: 100 },
  { code: 'PUB-102', name: 'Peer Review & Indexing Standards', cost: 130 }
];

export function calculateTotalFees(gradeLevel: string, addedCoursesCount: number = 0): number {
  const fee = GRADE_FEES.find(g => g.gradeLevel === gradeLevel);
  if (!fee) return 1500; // fallback standard primary fee
  const courseCharges = addedCoursesCount * 150; // default extra charge per elective
  return fee.tuitionFee + fee.activityFee + fee.facilitiesFee + fee.registrationFee + courseCharges;
}

export const INITIAL_STUDENTS: Student[] = [
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
    gradeLevel: 'Master\'s Thesis Guidance',
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
