/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FeePayment {
  id: string;
  amount: number;
  paymentMethod: 'Credit Card' | 'Bank Transfer' | 'Cash' | 'Mobile Money';
  paymentDate: string;
  reference: string;
  status: 'Paid' | 'Processing';
  term: string;
}

export interface StudentDocument {
  id: string;
  name: string;
  type: 'Research Synopsis' | 'Academic Transcripts' | 'Student ID Proof' | 'Ethical Clearance Draft';
  uploadedAt: string;
  status: 'Verified' | 'Pending' | 'Rejected';
}

export interface Student {
  id: string;           // e.g. "REG-2026-0041"
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  gradeLevel: string;   // e.g., "Kindergarten", "Grade 1" through "Grade 12"
  email: string;
  phone: string;
  address: string;
  courses: string[];    // Courses/Electives chosen, e.g. ["Pre-Calculus", "Robotics"]
  
  // Emergency/Parent contact info
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  parentRelationship: 'Mother' | 'Father' | 'Guardian' | 'Other';
  
  // School Admin Tracking
  admissionStatus: 'Pending' | 'In Review' | 'Approved' | 'Rejected';
  totalFees: number;
  paidFees: number;
  outstandingFees: number;
  registrationDate: string;
  adminNotes?: string;
  
  // Sub-records
  documents: StudentDocument[];
  payments: FeePayment[];
  feeLedgerItems: { id: string; description: string; amount: number; date: string }[];
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Registrar' | 'Finance Officer';
  passwordHash: string; // Plain password for this sandbox context
  createdAt: string;
}

export interface GradeFeeStructure {
  gradeLevel: string;
  tuitionFee: number;
  activityFee: number;
  facilitiesFee: number;
  registrationFee: number;
}
