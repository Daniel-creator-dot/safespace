/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Users, CheckCircle, AlertCircle, Clock, DollarSign, Search, Filter, 
  Plus, X, FileText, Check, Save, Printer, CreditCard, Mail, Phone, Calendar, 
  MapPin, Notebook, RefreshCw, BarChart3, UserCheck, ShieldAlert, Award, GraduationCap,
  Lock, Unlock, LogOut, UserPlus, Shield, Key
} from 'lucide-react';
import { Student, StudentDocument, FeePayment, GradeFeeStructure, AdminUser } from '../types';
import { calculateTotalFees } from '../data';
import { API_BASE_URL } from '../config';

interface AdminPortalProps {
  students: Student[];
  onUpdateStudent: (updatedStudent: Student) => void;
  onAddStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onNavigateToRegister: () => void;
  gradeFees: GradeFeeStructure[];
  predefinedCourses: { code: string; name: string; cost: number }[];
  onUpdateGradeFees: (fees: GradeFeeStructure[]) => void;
  onUpdatePredefinedCourses: (courses: { code: string; name: string; cost: number }[]) => void;
}

export default function AdminPortal({ 
  students, 
  onUpdateStudent, 
  onAddStudent, 
  onDeleteStudent,
  onNavigateToRegister,
  gradeFees,
  predefinedCourses,
  onUpdateGradeFees,
  onUpdatePredefinedCourses
}: AdminPortalProps) {
  // Session Authentication & Admins List State
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('active_admin_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [adminsList, setAdminsList] = useState<AdminUser[]>([]);

  // Load admins list from backend dynamically when user logs in
  React.useEffect(() => {
    if (!currentUser) return;
    async function loadAdmins() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admins`);
        if (res.ok) {
          const data = await res.json();
          setAdminsList(data);
        }
      } catch (err) {
        console.error('Failed to load admins list:', err);
      }
    }
    loadAdmins();
  }, [currentUser]);

  // Login inputs path
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active workspace page/tab state inside authenticated dashboard
  const [activeAdminTab, setActiveAdminTab] = useState<'students' | 'admins' | 'settings'>('students');

  // Dynamic cost calculation based on selected dynamic program fee structure
  const calculateTotalFeesDynamic = (level: string) => {
    const fee = gradeFees.find(g => g.gradeLevel === level);
    if (!fee) return 1500;
    return fee.tuitionFee + fee.activityFee + fee.facilitiesFee + fee.registrationFee;
  };

  // Editing state for Programs/Rates
  const [editingGradeLevel, setEditingGradeLevel] = useState<string | null>(null);
  const [editTuition, setEditTuition] = useState('');
  const [editActivity, setEditActivity] = useState('');
  const [editFacilities, setEditFacilities] = useState('');
  const [editReg, setEditReg] = useState('');

  // Editing state for Courses/Modules
  const [editingCourseCode, setEditingCourseCode] = useState<string | null>(null);
  const [editCourseName, setEditCourseName] = useState('');
  const [editCourseCost, setEditCourseCost] = useState('');

  // New Program adding form fields
  const [newGradeLevel, setNewGradeLevel] = useState('');
  const [newTuition, setNewTuition] = useState('');
  const [newActivity, setNewActivity] = useState('');
  const [newFacilities, setNewFacilities] = useState('');
  const [newReg, setNewReg] = useState('');

  // New Course adding form fields
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCost, setNewCourseCost] = useState('');

  // Create new sub-admin form fields
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'Super Admin' | 'Registrar' | 'Finance Officer'>('Registrar');
  const [newAdminSuccessMsg, setNewAdminSuccessMsg] = useState('');
  const [newAdminErrorMsg, setNewAdminErrorMsg] = useState('');

  // Recording extra charges / custom fee state
  const [activeBillingTab, setActiveBillingTab] = useState<'payment' | 'charge'>('payment');
  const [extraChargeAmount, setExtraChargeAmount] = useState<string>('');
  const [extraChargeDesc, setExtraChargeDesc] = useState<string>('');
  const [extraChargeSuccess, setExtraChargeSuccess] = useState<string>('');

  // Navigation & UI control state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [gradeFilter, setGradeFilter] = useState<string>('All');
  const [feeFilter, setFeeFilter] = useState<string>('All'); // All, Fully Paid, Outstanding, Unpaid
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Student editing state variables
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editDOB, setEditDOB] = useState('');
  const [editGender, setEditGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editGradeLevel, setEditGradeLevel] = useState('');
  const [editParentName, setEditParentName] = useState('');
  const [editParentEmail, setEditParentEmail] = useState('');
  const [editParentPhone, setEditParentPhone] = useState('');
  const [editParentRelationship, setEditParentRelationship] = useState<'Mother' | 'Father' | 'Guardian' | 'Other'>('Mother');
  const [editStudentCourses, setEditStudentCourses] = useState<string[]>([]);

  const [isAddingManually, setIsAddingManually] = useState(false);
  const [isAddingProgramModalOpen, setIsAddingProgramModalOpen] = useState(false);
  const [isAddingCourseModalOpen, setIsAddingCourseModalOpen] = useState(false);
  const [showPrintInvoice, setShowPrintInvoice] = useState<boolean>(false);

  // New manual student form state
  const [newManualStudent, setNewManualStudent] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    gradeLevel: 'Initial Consultation',
    email: '',
    phone: '',
    address: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    parentRelationship: 'Mother' as 'Mother' | 'Father' | 'Guardian' | 'Other',
    adminNotes: ''
  });

  // Logging payment sub-state
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'Bank Transfer' | 'Cash' | 'Mobile Money'>('Bank Transfer');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');

  // Editing notes/status sub-state for selected student
  const [adminNotesText, setAdminNotesText] = useState<string>('');

  // 1. Calculations metrics
  const stats = useMemo(() => {
    const total = students.length;
    const pending = students.filter(s => s.admissionStatus === 'Pending').length;
    const inReview = students.filter(s => s.admissionStatus === 'In Review').length;
    const approved = students.filter(s => s.admissionStatus === 'Approved').length;
    const rejected = students.filter(s => s.admissionStatus === 'Rejected').length;
    
    let totalFeesBilled = 0;
    let totalFeesCollected = 0;
    
    students.forEach(s => {
      totalFeesBilled += s.totalFees;
      totalFeesCollected += s.paidFees;
    });
    
    const outstandingFees = totalFeesBilled - totalFeesCollected;
    const collectionPercent = totalFeesBilled > 0 ? Math.round((totalFeesCollected / totalFeesBilled) * 100) : 0;

    return {
      total,
      pending,
      inReview,
      approved,
      rejected,
      totalFeesBilled,
      totalFeesCollected,
      outstandingFees,
      collectionPercent
    };
  }, [students]);

  // 2. Multi-filter matching pipeline
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Search matching
      const query = searchTerm.toLowerCase();
      const matchesSearch = 
        student.firstName.toLowerCase().includes(query) ||
        student.lastName.toLowerCase().includes(query) ||
        student.id.toLowerCase().includes(query) ||
        student.parentName.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query);

      // Status matching
      const matchesStatus = statusFilter === 'All' || student.admissionStatus === statusFilter;

      // Grade matching
      const matchesGrade = gradeFilter === 'All' || student.gradeLevel === gradeFilter;

      // Fee metrics matching
      let matchesFee = true;
      if (feeFilter === 'Fully Paid') {
        matchesFee = student.outstandingFees <= 0;
      } else if (feeFilter === 'Outstanding') {
        matchesFee = student.outstandingFees > 0;
      } else if (feeFilter === 'Unpaid') {
        matchesFee = student.paidFees === 0;
      }

      return matchesSearch && matchesStatus && matchesGrade && matchesFee;
    });
  }, [students, searchTerm, statusFilter, gradeFilter, feeFilter]);

  // Handle student clicking from directory
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setAdminNotesText(student.adminNotes || '');
    setPaymentSuccessMsg('');
    setPaymentAmount('');
    setPaymentReference('');
    setShowPrintInvoice(false);
    
    // Initialize editing values
    setEditFirstName(student.firstName || '');
    setEditLastName(student.lastName || '');
    setEditDOB(student.dateOfBirth || '');
    setEditGender(student.gender || 'Male');
    setEditEmail(student.email || '');
    setEditPhone(student.phone || '');
    setEditAddress(student.address || '');
    setEditGradeLevel(student.gradeLevel || '');
    setEditParentName(student.parentName || '');
    setEditParentEmail(student.parentEmail || '');
    setEditParentPhone(student.parentPhone || '');
    setEditParentRelationship(student.parentRelationship || 'Mother');
    setEditStudentCourses(student.courses || []);
    setIsEditingStudent(false);
    setShowDeleteConfirm(false);
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Save edited student's information and recalculate fees
  const handleSaveStudentEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    if (!editFirstName.trim() || !editLastName.trim()) {
      alert('First and Last student name are mandatory.');
      return;
    }

    // Determine the base fee of the selected advisory program level
    const feeStructure = gradeFees.find(g => g.gradeLevel === editGradeLevel) || gradeFees[0];
    const baseFee = (feeStructure?.tuitionFee || 0) + (feeStructure?.activityFee || 0) + (feeStructure?.facilitiesFee || 0) + (feeStructure?.registrationFee || 0);
    
    // Determine the total cost of any custom elective courses
    const coursesCost = editStudentCourses.reduce((sum, courseName) => {
      const cls = predefinedCourses.find(c => c.name === courseName);
      return sum + (cls ? cls.cost : 150);
    }, 0);

    // Dynamic ledger items
    const ledgerExtras = (selectedStudent.feeLedgerItems || []).reduce((sum, item) => sum + item.amount, 0);

    const calculatedTotalFees = baseFee + coursesCost + ledgerExtras;
    const calculatedOutstanding = calculatedTotalFees - selectedStudent.paidFees;

    const updated: Student = {
      ...selectedStudent,
      firstName: editFirstName.trim(),
      lastName: editLastName.trim(),
      dateOfBirth: editDOB,
      gender: editGender,
      email: editEmail.trim(),
      phone: editPhone.trim(),
      address: editAddress.trim(),
      gradeLevel: editGradeLevel,
      parentName: editParentName.trim(),
      parentEmail: editParentEmail.trim(),
      parentPhone: editParentPhone.trim(),
      parentRelationship: editParentRelationship,
      courses: editStudentCourses,
      totalFees: calculatedTotalFees,
      outstandingFees: calculatedOutstanding
    };

    onUpdateStudent(updated);
    setSelectedStudent(updated);
    setIsEditingStudent(false);
  };

  // Delete student and close modal
  const handleDeleteStudentClick = () => {
    if (!selectedStudent) return;
    onDeleteStudent(selectedStudent.id);
    setSelectedStudent(null);
    setShowDeleteConfirm(false);
  };

  // Toggle single document verification status
  const handleToggleDocStatus = (docId: string, currentStatus: StudentDocument['status']) => {
    if (!selectedStudent) return;
    
    const nextStatusMap: Record<StudentDocument['status'], StudentDocument['status']> = {
      'Pending': 'Verified',
      'Verified': 'Rejected',
      'Rejected': 'Pending'
    };

    const updatedDocuments = selectedStudent.documents.map(doc => {
      if (doc.id === docId) {
        return { ...doc, status: nextStatusMap[currentStatus] };
      }
      return doc;
    });

    const updated = {
      ...selectedStudent,
      documents: updatedDocuments
    };

    onUpdateStudent(updated);
    setSelectedStudent(updated);
  };

  // Update overall class admissions status
  const handleUpdateAdmissionStatus = (newStatus: Student['admissionStatus']) => {
    if (!selectedStudent) return;
    const updated = {
      ...selectedStudent,
      admissionStatus: newStatus
    };
    onUpdateStudent(updated);
    setSelectedStudent(updated);
  };

  // Save admin notes string
  const handleSaveNotes = () => {
    if (!selectedStudent) return;
    const updated = {
      ...selectedStudent,
      adminNotes: adminNotesText
    };
    onUpdateStudent(updated);
    setSelectedStudent(updated);
    alert('Administrative notes updated successfully!');
  };

  // Post fee payment
  const handlePostPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const parsedAmount = parseFloat(paymentAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount greater than GH₵0.');
      return;
    }

    if (parsedAmount > selectedStudent.outstandingFees) {
      alert(`Amount high! Maximum allowable payment transaction represents outstanding balance of GH₵${selectedStudent.outstandingFees}`);
      return;
    }

    setIsProcessingPayment(true);
    
    setTimeout(() => {
      const newPayment: FeePayment = {
        id: `p-${Math.floor(1000 + Math.random() * 9000)}`,
        amount: parsedAmount,
        paymentMethod: paymentMethod,
        paymentDate: new Date().toISOString().split('T')[0],
        reference: paymentReference.trim() || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'Paid',
        term: 'Fall Term 1'
      };

      const updatedPayments = [...selectedStudent.payments, newPayment];
      const nextPaid = selectedStudent.paidFees + parsedAmount;
      const nextOutstanding = selectedStudent.totalFees - nextPaid;

      const updated: Student = {
        ...selectedStudent,
        paidFees: nextPaid,
        outstandingFees: nextOutstanding,
        payments: updatedPayments
      };

      onUpdateStudent(updated);
      setSelectedStudent(updated);
      setIsProcessingPayment(false);
      setPaymentAmount('');
      setPaymentReference('');
      setPaymentSuccessMsg(`Successfully credited GH₵${parsedAmount.toLocaleString()} to ledger!`);
    }, 850);
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginUsername.trim() || !loginPassword.trim()) {
      setLoginError('Both Username and password are required.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername.trim(), password: loginPassword.trim() })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Invalid username or password');
      }

      const userData = await res.json();
      localStorage.setItem('active_admin_session', JSON.stringify(userData));
      setCurrentUser(userData);
      setLoginUsername('');
      setLoginPassword('');
    } catch (err: any) {
      setLoginError(err.message || 'Invalid administrator credentials. Please check spelling & retry.');
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('active_admin_session');
    setCurrentUser(null);
    setActiveAdminTab('students');
  };

  // Create new administrative user
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewAdminErrorMsg('');
    setNewAdminSuccessMsg('');

    if (!newAdminUsername.trim() || !newAdminPassword.trim() || !newAdminName.trim() || !newAdminEmail.trim()) {
      setNewAdminErrorMsg('All administrator credential fields are required.');
      return;
    }

    const newAdmin = {
      id: `ADM-${Math.floor(100 + Math.random() * 900)}`,
      username: newAdminUsername.trim().toLowerCase(),
      name: newAdminName.trim(),
      email: newAdminEmail.trim(),
      role: newAdminRole,
      passwordHash: newAdminPassword.trim()
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/admins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create sub-admin');
      }

      const savedAdmin = await res.json();
      setAdminsList(prev => [...prev, savedAdmin]);

      // Reset inputs
      setNewAdminUsername('');
      setNewAdminPassword('');
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminRole('Registrar');
      setNewAdminSuccessMsg(`Successfully registered new admin profile: "${savedAdmin.name}" with role (${savedAdmin.role})!`);
    } catch (err: any) {
      setNewAdminErrorMsg(err.message || 'Failed to create administrator profile.');
    }
  };

  // Add a new Advisory Program Category
  const handleAddGradeFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGradeLevel.trim()) return;
    const exists = gradeFees.some(g => g.gradeLevel.toLowerCase() === newGradeLevel.trim().toLowerCase());
    if (exists) {
      alert("An advisory program with this title already exists.");
      return;
    }
    const added: GradeFeeStructure = {
      gradeLevel: newGradeLevel.trim(),
      tuitionFee: Number(newTuition) || 0,
      activityFee: Number(newActivity) || 0,
      facilitiesFee: Number(newFacilities) || 0,
      registrationFee: Number(newReg) || 0
    };
    onUpdateGradeFees([...gradeFees, added]);
    setNewGradeLevel('');
    setNewTuition('');
    setNewActivity('');
    setNewFacilities('');
    setNewReg('');
    setIsAddingProgramModalOpen(false);
    alert('Advisory program added successfully!');
  };

  // Save changes to an existing Advisory Program
  const handleSaveGradeFee = (level: string) => {
    const updated = gradeFees.map(g => {
      if (g.gradeLevel === level) {
        return {
          ...g,
          tuitionFee: Number(editTuition) || 0,
          activityFee: Number(editActivity) || 0,
          facilitiesFee: Number(editFacilities) || 0,
          registrationFee: Number(editReg) || 0
        };
      }
      return g;
    });
    onUpdateGradeFees(updated);
    setEditingGradeLevel(null);
    alert('Program fees updated successfully!');
  };

  // Add a brand-new Predefined Academic Seminar/Module
  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseCode.trim() || !newCourseName.trim()) return;
    const exists = predefinedCourses.some(c => c.code.toLowerCase() === newCourseCode.trim().toLowerCase());
    if (exists) {
      alert("A seminar module with this course code already exists.");
      return;
    }
    const added = {
      code: newCourseCode.trim().toUpperCase(),
      name: newCourseName.trim(),
      cost: Number(newCourseCost) || 0
    };
    onUpdatePredefinedCourses([...predefinedCourses, added]);
    setNewCourseCode('');
    setNewCourseName('');
    setNewCourseCost('');
    setIsAddingCourseModalOpen(false);
    alert('Academic seminar/course module added successfully!');
  };

  // Save changes to an existing Predefined Course/Module
  const handleSaveCourse = (code: string) => {
    const updated = predefinedCourses.map(c => {
      if (c.code === code) {
        return {
          ...c,
          name: editCourseName.trim(),
          cost: Number(editCourseCost) || 0
        };
      }
      return c;
    });
    onUpdatePredefinedCourses(updated);
    setEditingCourseCode(null);
    alert('Predefined seminar/course module updated successfully!');
  };

  // Charge extra fees/fine to student ledger
  const handleApplyExtraCharge = (e: React.FormEvent) => {
    e.preventDefault();
    setExtraChargeSuccess('');
    if (!selectedStudent) return;

    const parsedAmount = parseFloat(extraChargeAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid fine/fee amount greater than GH₵0.');
      return;
    }
    if (!extraChargeDesc.trim()) {
      alert('Description/item purpose cannot be left empty.');
      return;
    }

    const newChargeItem = {
      id: `fee-${Date.now()}`,
      description: extraChargeDesc.trim(),
      amount: parsedAmount,
      date: new Date().toISOString().split('T')[0]
    };

    const nextLedger = [...(selectedStudent.feeLedgerItems || []), newChargeItem];
    const nextTotal = selectedStudent.totalFees + parsedAmount;
    const nextOutstanding = nextTotal - selectedStudent.paidFees;

    const updated: Student = {
      ...selectedStudent,
      totalFees: nextTotal,
      outstandingFees: nextOutstanding,
      feeLedgerItems: nextLedger
    };

    onUpdateStudent(updated);
    setSelectedStudent(updated);
    setExtraChargeAmount('');
    setExtraChargeDesc('');
    setExtraChargeSuccess(`Applied ledger fee "${newChargeItem.description}" for GH₵${parsedAmount.toLocaleString()}`);
  };

  // Submit manual student form
  const handleAddManualStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManualStudent.firstName.trim() || !newManualStudent.lastName.trim()) {
      alert('First and Last student name are mandatory.');
      return;
    }

    const cost = calculateTotalFeesDynamic(newManualStudent.gradeLevel);
    const generatedId = `REG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const studentWithMetadata: Student = {
      ...newManualStudent,
      id: generatedId,
      admissionStatus: 'Approved', // Auto-approved when entered manually by official adm
      totalFees: cost,
      paidFees: 0,
      outstandingFees: cost,
      registrationDate: new Date().toISOString().split('T')[0],
      courses: [],
      feeLedgerItems: [],
      documents: [
        { id: `doc-${Date.now()}`, name: 'manual_verification_override.pdf', type: 'Birth Certificate', uploadedAt: new Date().toISOString().split('T')[0], status: 'Verified' }
      ],
      payments: []
    };

    onAddStudent(studentWithMetadata);
    setIsAddingManually(false);
    
    // Reset form
    setNewManualStudent({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'Male',
      gradeLevel: 'Initial Consultation',
      email: '',
      phone: '',
      address: '',
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      parentRelationship: 'Mother',
      adminNotes: ''
    });

    handleSelectStudent(studentWithMetadata);
  };

  if (!currentUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-slate-100 shadow-xl">
          <div className="text-center">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/20 mb-4 mx-auto overflow-hidden">
              <GraduationCap className="h-7 w-7 relative z-10 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]" />
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">
              Safe Space Audit Login
            </h2>
            <p className="mt-2 text-xs text-slate-400">
              Authorized academic administrators only. Access is tracked and audited.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-amber-50 border-l-3 border-amber-500 rounded text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
              <span>{loginError}</span>
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <div>
              <label htmlFor="login-username" className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Administrator Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="login-username"
                  name="username"
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
                  placeholder="e.g. admin"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Staff Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              id="btn-perform-login"
              type="submit"
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm hover:shadow-md cursor-pointer mt-2"
            >
              Sign In to Console
            </button>
          </form>

          <div className="border-t border-slate-100 pt-5 text-center mt-6">
            <button
              id="btn-login-back-to-public"
              onClick={onNavigateToRegister}
              className="mt-4 text-xs font-semibold text-slate-500 hover:text-slate-800 transition block mx-auto underline"
            >
              Back to Client Registry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-2 px-1 sm:px-4">
      {/* Officer Signed-In Banner */}
      <div className="bg-slate-900 text-slate-100 px-4 py-2.5 rounded-t-xl text-xs flex flex-wrap justify-between items-center gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Logged in as: <strong className="text-white">{currentUser.name}</strong> ({currentUser.role})</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">Safe Space Secure Console</span>
          <button
            id="admin-logout-btn"
            onClick={handleLogout}
            className="text-slate-300 hover:text-white flex items-center gap-1 font-semibold transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </div>

      {/* Admin Title Banner */}
      <div className="bg-white border-x border-b border-slate-100 rounded-b-xl shadow-3xs p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Safe Space Administration Console
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Manage administrative logins, add care fees, approve client advisory status, and record payments.</p>
          
          {/* TAB BAR MOUNTED HERE */}
          <div className="flex gap-2 mt-5">
            <button
              id="tab-students"
              onClick={() => {
                setActiveAdminTab('students');
                setEditingGradeLevel(null);
                setEditingCourseCode(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all outline-none ${
                activeAdminTab === 'students'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Client Directory
            </button>
            <button
              id="tab-admins"
              onClick={() => {
                setActiveAdminTab('admins');
                setEditingGradeLevel(null);
                setEditingCourseCode(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all outline-none ${
                activeAdminTab === 'admins'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              Manage Administrators
            </button>
            <button
              id="tab-settings"
              onClick={() => {
                setActiveAdminTab('settings');
                setEditingGradeLevel(null);
                setEditingCourseCode(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all outline-none ${
                activeAdminTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              Settings & Fees
            </button>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto pt-2 md:pt-0 shrink-0">
          <button
            id="admin-btn-register-student"
            onClick={onNavigateToRegister}
            className="flex-1 md:flex-none border border-blue-600 hover:bg-blue-50 text-blue-700 px-4 py-2.5 rounded-lg text-sm font-semibold transition bg-white"
          >
            Public Client View
          </button>
          <button
            id="admin-btn-manual-add"
            onClick={() => setIsAddingManually(true)}
            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Client Intake
          </button>
        </div>
      </div>

      {activeAdminTab === 'students' && (
        <>
          {/* METRICS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-3xs flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-50 text-slate-650 rounded-lg flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-slate-550" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Total Clients</span>
            <strong className="text-xl font-bold text-slate-800">{stats.total} Active</strong>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-3xs flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-50 text-amber-605 rounded-lg flex items-center justify-center shrink-0 animate-pulse">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Under Review</span>
            <strong className="text-xl font-bold text-slate-800">{stats.pending + stats.inReview} Active</strong>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-3xs flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Intakes Approved</span>
            <strong className="text-xl font-bold text-slate-800">{stats.approved} Files</strong>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-3xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Fees Rate</span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{stats.collectionPercent}%</span>
          </div>
          <div className="text-xs text-slate-500 gap-1 flex items-baseline">
            <span className="font-bold text-sm text-slate-800">GH₵{stats.totalFeesCollected.toLocaleString()}</span>
            <span>of GH₵{stats.totalFeesBilled.toLocaleString()}</span>
          </div>
          {/* Progress bar container */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${stats.collectionPercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS GRID */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-3xs mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
          <input
            id="admin-search-input"
            type="text"
            placeholder="Search name, phone, guarantor or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Admission Status filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs font-medium whitespace-nowrap">Status:</span>
          <select
            id="admin-filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending Review</option>
            <option value="In Review">In Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>


        {/* Outstanding dues filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs font-medium whitespace-nowrap">Fees:</span>
          <select
            id="admin-filter-fees"
            value={feeFilter}
            onChange={(e) => setFeeFilter(e.target.value)}
            className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white"
          >
            <option value="All">All Records</option>
            <option value="Fully Paid">Fully Paid</option>
            <option value="Outstanding">Outstanding Balance</option>
            <option value="Unpaid">No Fees Logged</option>
          </select>
        </div>
      </div>

      {/* DIRECTORY BOARD */}
      <div className="space-y-6">
        
        {/* DIRECTORY LIST - Full width */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-3xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-display font-semibold text-slate-800 text-sm flex items-center gap-1.5">
              <BarChart3 className="w-4.5 h-4.5 text-slate-500" />
              Client Intake Database ({filteredStudents.length} entries)
            </h2>
            <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-wider">
              Secure
            </span>
          </div>

          <div className="overflow-x-auto min-h-[350px]">
            {filteredStudents.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-xs space-y-2">
                <Users className="w-10 h-10 mx-auto text-slate-200" />
                <p>No matching client records found using those criteria.</p>
                <button 
                  id="btn-reset-filters"
                  onClick={() => { setSearchTerm(''); setStatusFilter('All'); setGradeFilter('All'); setFeeFilter('All'); }}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Reset queries
                </button>
              </div>
            ) : (
              <table className="w-full text-left font-sans border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-semibold uppercase tracking-wider border-b border-slate-100">
                    <th className="px-4 py-3">REF ID & Name</th>
                    <th className="px-4 py-3">Registration Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Fee Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredStudents.map((student) => {
                    const statusColors = {
                      'Pending': 'bg-slate-50 text-slate-600 border-slate-200',
                      'In Review': 'bg-amber-50 text-amber-700 border-amber-200',
                      'Approved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      'Rejected': 'bg-slate-100 text-slate-700 border-slate-200'
                    };

                    const outstanding = student.outstandingFees;
                    const isPaid = outstanding <= 0;
                    const isPartial = student.paidFees > 0 && outstanding > 0;

                    return (
                      <tr 
                        key={student.id}
                        id={`student-row-${student.id}`}
                        onClick={() => handleSelectStudent(student)}
                        className="hover:bg-slate-50/80 cursor-pointer transition"
                      >
                        <td className="px-4 py-3.5">
                          <div>
                            <span className="font-mono text-[10px] text-slate-400 block mb-0.5">{student.id}</span>
                            <span className="font-semibold text-slate-800">{student.firstName} {student.lastName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-medium text-slate-650">{student.registrationDate}</span>
                          <span className="block text-[10px] text-slate-400">{student.email}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${statusColors[student.admissionStatus]}`}>
                            {student.admissionStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex flex-col items-end">
                            <span className={`font-semibold font-mono ${isPaid ? 'text-emerald-600' : isPartial ? 'text-amber-600' : 'text-slate-500'}`}>
                              GH₵{student.paidFees.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-404 block mt-0.5">
                              {isPaid ? 'Fully Paid' : `Owes GH₵${outstanding.toLocaleString()}`}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

      {/* STUDENT DETAILS & LEDGER MODAL POPUP */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-40 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-8 flex flex-col max-h-[92vh] animate-fadeIn">
            
            {/* MODAL HEADER */}
            <div className="relative border-b border-slate-100 p-5 shrink-0 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-mono text-slate-400 block uppercase tracking-widest">{selectedStudent.id}</span>
                  <h3 className="font-display font-bold text-base text-slate-900 leading-tight">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">{selectedStudent.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded text-[10px] tracking-wider uppercase font-semibold border ${
                  selectedStudent.admissionStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  selectedStudent.admissionStatus === 'Rejected' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                  selectedStudent.admissionStatus === 'In Review' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-slate-100 text-slate-605 border-slate-205'
                }`}>
                  {selectedStudent.admissionStatus}
                </span>
                
                <button 
                  type="button"
                  onClick={() => { setSelectedStudent(null); setIsEditingStudent(false); }}
                  className="p-1 px-2.5 text-slate-450 hover:text-slate-800 rounded-full hover:bg-slate-150 transition cursor-pointer flex items-center gap-1 border border-slate-200 ml-2 bg-white text-xs font-semibold"
                >
                  <X className="w-4 h-4" />
                  Close
                </button>
              </div>
            </div>

            {/* MODAL BODY (SCROLLABLE) */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-slate-705">
              
              {showDeleteConfirm ? (
                /* DELETION CONFIRMATION DIALOG */
                <div className="text-center p-8 space-y-4 max-w-md mx-auto my-12 bg-rose-50 border border-rose-150 rounded-2xl animate-fadeIn">
                  <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                    <ShieldAlert className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="font-bold text-rose-900 text-sm">Delete Client Profile?</h4>
                    <p className="text-xs text-rose-600/80 mt-1">
                      Are you sure you want to permanently delete <strong>{selectedStudent.firstName} {selectedStudent.lastName}</strong>? This will remove all verification files, comments, and invoice payment ledger records.
                    </p>
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-220 rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteStudentClick}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              ) : isEditingStudent ? (
                /* ELEVENTH HOUR EDIT FORM */
                <form onSubmit={handleSaveStudentEdit} className="space-y-6 text-xs text-slate-700">
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <h4 className="font-display font-semibold text-slate-800 text-xs mb-3 flex items-center gap-1.5 border-b border-slate-200 pb-1.5 uppercase tracking-wider text-[10px]">
                      <Plus className="w-3.5 h-3.5 text-blue-600" />
                      Client Personal Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">First Name *</label>
                        <input
                          type="text"
                          required
                          value={editFirstName}
                          onChange={(e) => setEditFirstName(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-850 text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Last Name *</label>
                        <input
                          type="text"
                          required
                          value={editLastName}
                          onChange={(e) => setEditLastName(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-850 text-xs font-medium"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Date of Birth *</label>
                        <input
                          type="date"
                          required
                          value={editDOB}
                          onChange={(e) => setEditDOB(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded text-slate-850 font-mono text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Gender *</label>
                        <select
                          value={editGender}
                          onChange={(e) => setEditGender(e.target.value as any)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded text-slate-850 text-xs font-medium"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Client Email *</label>
                        <input
                          type="email"
                          required
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded text-slate-850 text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Phone Number *</label>
                        <input
                          type="text"
                          required
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded text-slate-850 font-mono text-xs font-medium"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Primary Address *</label>
                      <input
                        type="text"
                        required
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded text-slate-850 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <h4 className="font-display font-semibold text-slate-800 text-xs mb-3 flex items-center gap-1.5 border-b border-slate-200 pb-1.5 uppercase tracking-wider text-[10px]">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                      Advanced Seminars & Elective Modules
                    </h4>
                    <div className="grid grid-cols-1 gap-4">

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">Elective Modules</label>
                        <div className="space-y-1.5 max-h-32 overflow-y-auto bg-white p-2 border border-slate-200 rounded scrollbar-thin">
                          {predefinedCourses.map(course => {
                            const isChecked = editStudentCourses.includes(course.name);
                            return (
                              <label key={course.code} className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer p-1 rounded hover:bg-slate-50 transition">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    if (isChecked) {
                                      setEditStudentCourses(editStudentCourses.filter(name => name !== course.name));
                                    } else {
                                      setEditStudentCourses([...editStudentCourses, course.name]);
                                    }
                                  }}
                                  className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                                />
                                <span className="text-[11px] truncate">{course.name} (+GH₵{course.cost})</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <h4 className="font-display font-semibold text-slate-800 text-xs mb-3 flex items-center gap-1.5 border-b border-slate-200 pb-1.5 uppercase tracking-wider text-[10px]">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      Responsible Guarantor & Representative Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Guarantor Name</label>
                        <input
                          type="text"
                          value={editParentName}
                          onChange={(e) => setEditParentName(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded text-slate-850 text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Relationship</label>
                        <select
                          value={editParentRelationship}
                          onChange={(e) => setEditParentRelationship(e.target.value as any)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded text-slate-850 text-xs font-medium"
                        >
                          <option value="Mother">Mother</option>
                          <option value="Father">Father</option>
                          <option value="Guardian">Guardian</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Guarantor Email</label>
                        <input
                          type="email"
                          value={editParentEmail}
                          onChange={(e) => setEditParentEmail(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded text-slate-850 text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Guarantor Phone</label>
                        <input
                          type="text"
                          value={editParentPhone}
                          onChange={(e) => setEditParentPhone(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded text-slate-850 font-mono text-xs font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 font-semibold text-xs">
                    <button
                      type="button"
                      onClick={() => setIsEditingStudent(false)}
                      className="px-4 py-2 hover:bg-slate-100 text-slate-600 rounded-lg transition cursor-pointer border border-slate-250"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold transition shadow-xs cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                /* VIEW & WORK LEDGER VIEW DETAILS */
                <div className="space-y-6">
                  
                  {/* EDIT & DELETE CONTROLS ROW */}
                  <div className="flex justify-end gap-2 bg-slate-50 border border-slate-100 p-2 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setIsEditingStudent(true)}
                      className="px-3.5 py-1.5 bg-white hover:bg-slate-55 border border-slate-200 rounded-lg text-xs font-bold shadow-3xs cursor-pointer flex items-center gap-1.5 text-slate-850 transition"
                    >
                      <Save className="w-3.5 h-3.5 text-blue-600" />
                      Edit Client Info
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 transition animate-pulse"
                    >
                      <X className="w-3.5 h-3.5" />
                      Delete Client Record
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    
                    {/* LEFT SECTION: ENROLLMENT PERSONAL DOSSIER */}
                    <div className="space-y-6">
                      
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4">
                        <div>
                          <h4 className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200 pb-1 mb-2">General Information</h4>
                          <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                            <div>
                              <span className="text-slate-400 block mb-0.5 text-[10px]">Date of Birth</span>
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                {selectedStudent.dateOfBirth}
                              </div>
                            </div>
                            <div>
                              <span className="text-slate-400 block mb-0.5 text-[10px]">Gender</span>
                              <div className="font-semibold text-slate-800">{selectedStudent.gender}</div>
                            </div>
                            <div>
                              <span className="text-slate-400 block mb-0.5 text-[10px]">Client Email</span>
                              <div className="flex items-center gap-1.5 truncate" title={selectedStudent.email}>
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                {selectedStudent.email}
                              </div>
                            </div>
                            <div>
                              <span className="text-slate-400 block mb-0.5 text-[10px]">Phone Number</span>
                              <div className="flex items-center gap-1.5 font-mono text-slate-800">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                {selectedStudent.phone}
                              </div>
                            </div>
                            <div className="col-span-2">
                              <span className="text-slate-400 block mb-0.5 text-[10px]">Location</span>
                              <div className="flex items-center gap-1.5 truncate" title={selectedStudent.address}>
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {selectedStudent.address}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Guarantor Info */}
                        <div className="border-t border-slate-200 pt-4">
                          <h4 className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mb-2">Guarantor / Contact Info</h4>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-400">FullName</span>
                              <strong className="text-slate-800">{selectedStudent.parentName} ({selectedStudent.parentRelationship})</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Phone</span>
                              <a href={`tel:${selectedStudent.parentPhone}`} className="text-blue-600 hover:underline font-mono">{selectedStudent.parentPhone}</a>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Email</span>
                              <a href={`mailto:${selectedStudent.parentEmail}`} className="text-blue-600 hover:underline">{selectedStudent.parentEmail}</a>
                            </div>
                          </div>
                        </div>

                        {/* Selected Elective Seminars Tag list */}
                        {selectedStudent.courses && selectedStudent.courses.length > 0 && (
                          <div className="border-t border-slate-200 pt-4">
                            <h4 className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mb-2">Registered Special Seminars</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedStudent.courses.map(cName => (
                                <span key={cName} className="bg-blue-50 text-blue-700 text-[10px] font-semibold px-2 py-0.5 border border-blue-100 rounded">
                                  📚 {cName}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Verification Checklist */}
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-3">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Verification Checklist</h4>
                          <span className="text-[9px] text-slate-400">Click to flip verifying state</span>
                        </div>
                        <div className="space-y-2">
                          {selectedStudent.documents.map(doc => (
                            <div 
                              key={doc.id}
                              onClick={() => handleToggleDocStatus(doc.id, doc.status)}
                              className="flex items-center justify-between p-2 pl-3 bg-white border border-slate-150 rounded-lg cursor-pointer hover:bg-slate-50 transition text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-slate-400" />
                                <div>
                                  <span className="font-semibold text-slate-800 block truncate max-w-[150px]" title={doc.name}>
                                    {doc.name}
                                  </span>
                                  <span className="text-[9px] text-slate-400 block">{doc.type} • Uploaded {doc.uploadedAt}</span>
                                </div>
                              </div>
                              
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                doc.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                doc.status === 'Rejected' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                                'bg-slate-100 text-slate-500 border-slate-200'
                              }`}>
                                {doc.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Determination board actions */}
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-3">
                        <h4 className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mb-2">Enrollment admissions Actions</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleUpdateAdmissionStatus('In Review')}
                            className={`text-center py-2 rounded text-xs font-semibold border transition ${
                              selectedStudent.admissionStatus === 'In Review'
                                ? 'bg-amber-500 text-white border-amber-500'
                                : 'bg-white hover:bg-amber-55 text-amber-600 border-amber-250'
                            }`}
                          >
                            Set In Review
                          </button>
                          <button
                            onClick={() => handleUpdateAdmissionStatus('Approved')}
                            className={`text-center py-2 rounded text-xs font-semibold border transition flex items-center justify-center gap-1 ${
                              selectedStudent.admissionStatus === 'Approved'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white hover:bg-emerald-50 text-emerald-600 border-emerald-200'
                            }`}
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Approve Intake
                          </button>
                          <button
                            onClick={() => handleUpdateAdmissionStatus('Rejected')}
                            className={`text-center py-2 rounded text-xs font-semibold border transition ${
                              selectedStudent.admissionStatus === 'Rejected'
                                ? 'bg-slate-700 text-white border-slate-700'
                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            Deny Admission
                          </button>
                          <button
                            onClick={() => handleUpdateAdmissionStatus('Pending')}
                            className={`text-center py-2 rounded text-xs font-semibold border transition ${
                              selectedStudent.admissionStatus === 'Pending'
                                ? 'bg-slate-600 text-white border-slate-650'
                                : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-200'
                            }`}
                          >
                            Reset Review
                          </button>
                        </div>
                      </div>

                      {/* Official Staff notes journal */}
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-2">
                        <label className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">Administrative Notes Journal</label>
                        <textarea
                          rows={2}
                          value={adminNotesText}
                          onChange={(e) => setAdminNotesText(e.target.value)}
                          placeholder="Record review notes..."
                          className="w-full text-xs p-2.5 border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                        ></textarea>
                        <button
                          onClick={handleSaveNotes}
                          className="bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-semibold px-3 py-1.5 rounded flex items-center gap-1 transition cursor-pointer"
                        >
                          <Save className="w-3 h-3" />
                          Save Journal Entry
                        </button>
                      </div>

                    </div>

                    {/* RIGHT SECTION: TUITION LEDGER & RECORDING PAYMENTS */}
                    <div className="space-y-6">
                      
                      <div className="bg-white rounded-xl border border-slate-100 shadow-3xs overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                          <h4 className="font-display font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-emerald-600" />
                            Student Financial Tuition Ledger
                          </h4>
                          <button 
                            onClick={() => setShowPrintInvoice(!showPrintInvoice)}
                            className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            {showPrintInvoice ? 'Hide Statement' : 'Statement View'}
                          </button>
                        </div>

                        {showPrintInvoice ? (
                          /* COMPRESSED PRINT STATEMENT VIEW */
                          <div className="p-5 bg-amber-50/20 border-b border-slate-150 space-y-4 text-xs font-sans text-slate-700 animate-fadeIn">
                            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                              <div>
                                <strong className="text-slate-800 uppercase block tracking-wider font-display font-bold">Safe Space Advisory</strong>
                                <span className="text-slate-400 text-[9px] block font-mono">CLIENT METRICS DIRECTORY LEDGER</span>
                              </div>
                              <div className="text-right">
                                <strong className="text-slate-800 block uppercase font-display text-xs tracking-tight text-blue-700">Tuition Invoice Statement</strong>
                                <span className="text-slate-450 text-[10px]">Generated: {new Date().toLocaleDateString()}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Enrolled Scholar</span>
                                <span className="font-bold text-slate-800 block text-[13px]">{selectedStudent.firstName} {selectedStudent.lastName}</span>
                                <span className="block text-slate-500 font-medium text-[11px]">{selectedStudent.email}</span>
                                <span className="block text-[10px] text-slate-400 font-mono">Ref: {selectedStudent.id}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Guarantor Party</span>
                                <span className="font-bold text-slate-800 block text-[13px]">{selectedStudent.parentName}</span>
                                <span className="block text-slate-500 font-medium text-[11px]">{selectedStudent.parentEmail}</span>
                                <span className="block text-[10px] text-slate-400 font-mono italic">{selectedStudent.parentPhone}</span>
                              </div>
                            </div>

                            {/* Billed Items inside layout */}
                            <div className="border-t border-b border-dashed border-slate-200 py-2.5">
                              <table className="w-full">
                                <thead>
                                  <tr className="text-slate-400 text-[9px] font-semibold text-left uppercase">
                                    <th>Fee description Item</th>
                                    <th className="text-right">Billed Cost</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-[11px]">

                                  {selectedStudent.courses && selectedStudent.courses.map(cName => {
                                    const crs = predefinedCourses.find(c => c.name === cName);
                                    return (
                                      <tr key={cName}>
                                        <td className="py-1 font-semibold text-indigo-750">📚 Module: {cName}</td>
                                        <td className="text-right font-mono">GH₵{(crs ? crs.cost : 150).toLocaleString()}</td>
                                      </tr>
                                    );
                                  })}
                                  {selectedStudent.feeLedgerItems && selectedStudent.feeLedgerItems.map(item => (
                                    <tr key={item.id}>
                                      <td className="py-1 text-amber-700 font-semibold">➕ Extra Charge: {item.description}</td>
                                      <td className="text-right font-mono">GH₵{item.amount.toLocaleString()}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Totals section */}
                            <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-100/60 text-left">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-slate-400">Class Total Charges:</span>
                                <span className="font-mono font-medium">GH₵{selectedStudent.totalFees.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-[11px] font-semibold border-b border-slate-205 pb-1">
                                <span className="text-slate-400">Confirmed Payments:</span>
                                <span className="font-mono text-emerald-600">-GH₵{selectedStudent.paidFees.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between font-extrabold text-blue-600 text-sm pt-1 uppercase">
                                <span>Outstanding Net balance:</span>
                                <span className="font-mono">GH₵{selectedStudent.outstandingFees.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* LEDGER STATISTICS & RECORDING FORMS */
                          <div className="p-5 space-y-5">
                            
                            {/* Visual metrics split */}
                            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <span className="text-slate-400 block mb-0.5">Charged Cost</span>
                                <strong className="font-mono font-bold text-slate-850 block">GH₵{selectedStudent.totalFees.toLocaleString()}</strong>
                              </div>
                              <div className="bg-emerald-50/40 p-2 rounded-lg border border-emerald-100 text-emerald-800">
                                <span className="text-slate-400 block mb-0.5">Paid Billed</span>
                                <strong className="font-mono font-bold block">GH₵{selectedStudent.paidFees.toLocaleString()}</strong>
                              </div>
                              <div className="bg-amber-50/40 p-2 rounded-lg border border-amber-100 text-amber-800">
                                <span className="text-slate-400 block mb-0.5">Owed Out</span>
                                <strong className="font-mono font-bold block">GH₵{selectedStudent.outstandingFees.toLocaleString()}</strong>
                              </div>
                            </div>

                            {/* Previous history logs list */}
                            <div>
                              <h5 className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1.5">Payments Log History ({selectedStudent.payments.length})</h5>
                              {selectedStudent.payments.length === 0 ? (
                                <div className="p-3 bg-slate-50 rounded text-slate-400 text-center italic text-[11px]">
                                  No verified wire payments logged under ledger.
                                </div>
                              ) : (
                                <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1.5 scrollbar-thin">
                                  {selectedStudent.payments.map((pay) => (
                                    <div key={pay.id} className="flex justify-between items-center text-[11px] bg-slate-50/60 p-2 rounded border border-slate-100">
                                      <div>
                                        <span className="font-bold text-slate-700 font-mono">GH₵{pay.amount}</span>
                                        <span className="text-[9px] text-slate-400 block">{pay.paymentMethod} • ID: {pay.reference}</span>
                                      </div>
                                      <span className="text-[9px] text-slate-400">{pay.paymentDate}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Billing tab selectors */}
                            <div className="flex border-b border-slate-100 pb-2 gap-2 text-[11px]">
                              <button
                                type="button"
                                onClick={() => { setActiveBillingTab('payment'); setExtraChargeSuccess(''); setPaymentSuccessMsg(''); }}
                                className={`px-3 py-1 font-semibold transition rounded cursor-pointer ${
                                  activeBillingTab === 'payment'
                                    ? 'bg-slate-800 text-white shadow-3xs'
                                    : 'bg-slate-105 bg-slate-50 text-slate-500 hover:bg-slate-200'
                                }`}
                              >
                                💵 Record Billed Payment
                              </button>
                              <button
                                type="button"
                                onClick={() => { setActiveBillingTab('charge'); setPaymentSuccessMsg(''); setExtraChargeSuccess(''); }}
                                className={`px-3 py-1 font-semibold transition rounded cursor-pointer ${
                                  activeBillingTab === 'charge'
                                    ? 'bg-slate-800 text-white shadow-3xs'
                                    : 'bg-slate-105 bg-slate-50 text-slate-500 hover:bg-slate-200'
                                }`}
                              >
                                ➕ Levy Custom Charge
                              </button>
                            </div>

                            {/* Payments Form conditional inputs */}
                            {activeBillingTab === 'payment' ? (
                              selectedStudent.outstandingFees > 0 ? (
                                <form onSubmit={handlePostPayment} className="space-y-3 pt-1">
                                  <h5 className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Post Tuition Payment Received</h5>
                                  
                                  {paymentSuccessMsg && (
                                    <div className="p-2 bg-emerald-50 text-emerald-800 border-l-2 border-emerald-500 rounded text-[11px] flex items-center justify-between">
                                      <span>{paymentSuccessMsg}</span>
                                      <button type="button" onClick={() => setPaymentSuccessMsg('')}><X className="w-3 h-3" /></button>
                                    </div>
                                  )}

                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="text-[10px] text-slate-404 block mb-1">Receipted Amount (GH₵) *</label>
                                      <input
                                        type="number"
                                        step="any"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        placeholder={`Max outstanding: GH₵${selectedStudent.outstandingFees}`}
                                        className="w-full p-2 border border-slate-200 rounded font-mono text-slate-800 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] text-slate-404 block mb-1">payment Channel *</label>
                                      <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                                        className="w-full p-2 border border-slate-200 rounded bg-white text-slate-800 text-xs focus:outline-none"
                                      >
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Credit Card">Credit Card</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Mobile Money">Mobile Money</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="text-[10px] text-slate-400 block mb-1">Payment Reference ID (Optional)</label>
                                    <input
                                      type="text"
                                      value={paymentReference}
                                      onChange={(e) => setPaymentReference(e.target.value)}
                                      placeholder="e.g. Wire Receipt reference #"
                                      className="w-full p-2 border border-slate-200 rounded font-mono text-slate-800 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                  </div>

                                  <button
                                    type="submit"
                                    disabled={isProcessingPayment}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    {isProcessingPayment ? 'Processing transactions...' : 'Post General Payment'}
                                  </button>
                                </form>
                              ) : (
                                <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded text-center text-xs font-semibold">
                                  ✓ Pupil ledger accounts are fully settled (GH₵0.00 outstanding balance).
                                </div>
                              )
                            ) : (
                              <form onSubmit={handleApplyExtraCharge} className="space-y-3 pt-1">
                                <h5 className="text-[10px] text-slate-404 uppercase tracking-wider font-semibold">Levy custom Extra Charge / Levy</h5>
                                
                                {extraChargeSuccess && (
                                  <div className="p-2 bg-emerald-50 text-emerald-800 border-l-2 border-emerald-500 rounded text-[11px] flex items-center justify-between">
                                    <span>{extraChargeSuccess}</span>
                                    <button type="button" onClick={() => setExtraChargeSuccess('')}><X className="w-3.5 h-3.5" /></button>
                                  </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[10px] text-slate-400 block mb-1">Levy Amount (GH₵) *</label>
                                    <input
                                      type="number"
                                      step="any"
                                      value={extraChargeAmount}
                                      onChange={(e) => setExtraChargeAmount(e.target.value)}
                                      placeholder="50"
                                      className="w-full p-2 border border-slate-200 rounded font-mono text-slate-800 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-slate-400 block mb-1">Ledger Description *</label>
                                    <input
                                      type="text"
                                      value={extraChargeDesc}
                                      onChange={(e) => setExtraChargeDesc(e.target.value)}
                                      placeholder="e.g. Document copy, specialist assess"
                                      className="w-full p-2 border border-slate-200 rounded text-slate-805 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      required
                                    />
                                  </div>
                                </div>

                                <button
                                  type="submit"
                                  className="w-full bg-slate-850 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2 rounded transition flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  Apply Custom Charge Fee
                                </button>
                              </form>
                            )}

                          </div>
                        )}
                      </div>

                    </div>
                    
                  </div>

                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  )}

  {activeAdminTab === 'admins' && (
    /* MANAGE ADMINISTRATORS DIRECTORY WORKSPACE */
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* List of current administrators */}
      <div className="lg:col-span-7 bg-white rounded-xl border border-slate-100 shadow-3xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-display font-semibold text-slate-800 text-sm flex items-center gap-1.5">
            <Shield className="w-4.5 h-4.5 text-brand-600" />
            Active Governance Administrators ({adminsList.length})
          </h2>
          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-100">
            System Online
          </span>
        </div>

        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-left font-sans border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-semibold uppercase tracking-wider border-b border-slate-100">
                <th className="px-4 py-3">Representative Officer</th>
                <th className="px-4 py-3">Login Username</th>
                <th className="px-4 py-3">Assigned Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {adminsList.map((adm) => {
                const roleColors = {
                  'Super Admin': 'bg-slate-900 text-white',
                  'Registrar': 'bg-brand-50 text-brand-700 border-brand-200',
                  'Finance Officer': 'bg-emerald-50 text-emerald-700 border-emerald-200'
                };

                return (
                  <tr key={adm.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-4">
                      <div>
                        <strong className="text-slate-800 block text-sm">{adm.name}</strong>
                        <span className="text-slate-400 text-[10px] block font-mono">{adm.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono bg-slate-50 px-2 py-1 rounded text-slate-600 border border-slate-100">@{adm.username}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${roleColors[adm.role] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {adm.role}
                      </span>
                      <span className="block text-[9px] text-slate-400 mt-1">Appointed {adm.createdAt || '2026-06-06'}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register / Appoint new administrative user */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white rounded-xl border border-slate-100 shadow-3xs p-6 md:p-8">
          <div className="border-b border-slate-150 pb-4 mb-5 flex items-center gap-2.5">
            <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center border border-brand-100">
              <UserPlus className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-800 text-sm">Appoint New System Administrator</h3>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">Create and register standard login credentials for secure registrar dashboard access.</p>
            </div>
          </div>

          {newAdminSuccessMsg && (
            <div className="p-3 mb-4 bg-emerald-50 text-emerald-800 border-l-3 border-emerald-500 rounded text-xs">
              {newAdminSuccessMsg}
            </div>
          )}
          {newAdminErrorMsg && (
            <div className="p-3 mb-4 bg-amber-50 text-amber-800 border-l-3 border-amber-500 rounded text-xs">
              {newAdminErrorMsg}
            </div>
          )}

          <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Representative Full Name *
              </label>
              <input
                id="create-admin-name"
                type="text"
                required
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                placeholder="e.g. Officer Jack Mercer"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-600 focus:bg-white transition text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Official Staff Email *
              </label>
              <input
                id="create-admin-email"
                type="email"
                required
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="jack.mercer@beaconhill.org"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-600 focus:bg-white transition text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Login Username *
                </label>
                <input
                  id="create-admin-username"
                  type="text"
                  required
                  value={newAdminUsername}
                  onChange={(e) => setNewAdminUsername(e.target.value)}
                  placeholder="e.g. jmercer"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-600 focus:bg-white transition font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Access Password *
                </label>
                <input
                  id="create-admin-password"
                  type="text"
                  required
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Password string"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-600 focus:bg-white transition font-mono text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Assigned Authority Role *
              </label>
              <select
                id="create-admin-role"
                value={newAdminRole}
                onChange={(e) => setNewAdminRole(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white scrollbar-thin font-semibold text-slate-800"
              >
                <option value="Registrar">Registrar (Read, Annotate Files)</option>
                <option value="Finance Officer">Finance Officer (Record, Invoice Accounts)</option>
                <option value="Super Admin">Super Admin (Universal Access)</option>
              </select>
            </div>

            <button
              id="btn-confirm-create-admin"
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold py-2.5 rounded-lg transition shadow-xs hover:shadow-md flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <UserPlus className="w-4 h-4" />
              Appoint Governance Officer
            </button>
          </form>
        </div>
      </div>

    </div>
  )}

  {activeAdminTab === 'settings' && (
    <div className="space-y-8 animate-fadeIn">
      {/* Dynamic Program Category Tuition Fees Editor */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-3xs p-6">
        <div className="border-b border-slate-100 pb-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-sm font-sans flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-blue-600" />
              Advisory Programs & Fee Structure Categories
            </h3>
            <p className="text-slate-400 text-xs font-sans mt-0.5">Live rates editor. Direct changes will update all registration screens immediately.</p>
          </div>
          <button
            id="btn-open-add-program"
            onClick={() => setIsAddingProgramModalOpen(true)}
            className="self-start sm:self-auto flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Advisory Program
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <th className="px-4 py-3">Program Grade level</th>
                <th className="px-4 py-3 text-right">Base Tuition</th>
                <th className="px-4 py-3 text-right">Assessment</th>
                <th className="px-4 py-3 text-right">Design Audit</th>
                <th className="px-4 py-3 text-right">Reg Fee</th>
                <th className="px-4 py-3 text-right">Total Fee</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-750">
              {gradeFees.map((fee) => {
                const rowSum = fee.tuitionFee + fee.activityFee + fee.facilitiesFee + fee.registrationFee;

                return (
                  <tr key={fee.gradeLevel} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3.5 font-semibold text-slate-800">
                      {fee.gradeLevel}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-750">GH₵{fee.tuitionFee.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-750">GH₵{fee.activityFee.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-750">GH₵{fee.facilitiesFee.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-750">GH₵{fee.registrationFee.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">GH₵{rowSum.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => {
                          setEditingGradeLevel(fee.gradeLevel);
                          setEditTuition(String(fee.tuitionFee));
                          setEditActivity(String(fee.activityFee));
                          setEditFacilities(String(fee.facilitiesFee));
                          setEditReg(String(fee.registrationFee));
                        }}
                        className="text-blue-600 hover:underline hover:text-blue-800 font-semibold cursor-pointer"
                      >
                        Edit Rate
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Predefined Courses/Modules Editor */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-3xs p-6">
        <div className="border-b border-slate-100 pb-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-sm font-sans flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              Academic Modules & Elective Costing list
            </h3>
            <p className="text-slate-400 text-xs font-sans mt-0.5">Edit course-specific hourly research audits or tool bootcamp costs directly.</p>
          </div>
          <button
            id="btn-open-add-course"
            onClick={() => setIsAddingCourseModalOpen(true)}
            className="self-start sm:self-auto flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Module / Course
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <th className="px-4 py-3">Course Code</th>
                <th className="px-4 py-3">Academic Course / Module Title</th>
                <th className="px-4 py-3 text-right">Elective Tuition Fee</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {predefinedCourses.map((crs) => {
                return (
                  <tr key={crs.code} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-650">
                      {crs.code}
                    </td>
                    <td className="px-4 py-3.5 text-slate-800 font-medium">{crs.name}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-700">GH₵{crs.cost.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => {
                          setEditingCourseCode(crs.code);
                          setEditCourseName(crs.name);
                          setEditCourseCost(String(crs.cost));
                        }}
                        className="text-blue-600 hover:underline hover:text-blue-800 font-semibold cursor-pointer"
                      >
                        Edit Seminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}

      {/* MANUALLY REGISTER MODAL */}
      {isAddingManually && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" />
                  Manual Registry Enrollment Override
                </h3>
                <p className="text-slate-400 text-xs">For clients submitting payments or manual offline intake paperwork in person.</p>
              </div>
              <button 
                id="btn-close-modal"
                onClick={() => setIsAddingManually(false)}
                className="p-1 text-slate-400 hover:text-slate-650 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddManualStudent} className="space-y-4 text-xs text-slate-700">
              <span className="font-display font-semibold uppercase text-[10px] tracking-wider text-slate-400 block mb-2">Client Particulars</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-slate-500 font-semibold">First Name *</label>
                  <input
                    id="manual-firstName"
                    type="text"
                    required
                    value={newManualStudent.firstName}
                    onChange={(e) => setNewManualStudent(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="First Name"
                    className="w-full p-2.5 border border-slate-200 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500 font-semibold">Last Name *</label>
                  <input
                    id="manual-lastName"
                    type="text"
                    required
                    value={newManualStudent.lastName}
                    onChange={(e) => setNewManualStudent(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Last Name"
                    className="w-full p-2.5 border border-slate-200 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1 text-slate-500 font-semibold">Date of Birth *</label>
                  <input
                    id="manual-dob"
                    type="date"
                    required
                    value={newManualStudent.dateOfBirth}
                    onChange={(e) => setNewManualStudent(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="w-full p-2.5 border border-slate-200 rounded text-slate-705"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500 font-semibold">Gender *</label>
                  <select
                    id="manual-gender"
                    value={newManualStudent.gender}
                    onChange={(e) => setNewManualStudent(prev => ({ ...prev, gender: e.target.value as any }))}
                    className="w-full p-2.5 border border-slate-200 rounded bg-white text-slate-700 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-slate-500 font-semibold">Client Direct Contact / Mobile</label>
                  <input
                    id="manual-phone"
                    type="tel"
                    value={newManualStudent.phone}
                    onChange={(e) => setNewManualStudent(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 000-0000"
                    className="w-full p-2.5 border border-slate-200 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500 font-semibold">Home Residence Address</label>
                  <input
                    id="manual-address"
                    type="text"
                    required
                    value={newManualStudent.address}
                    onChange={(e) => setNewManualStudent(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Street, City, ZIP"
                    className="w-full p-2.5 border border-slate-200 rounded"
                  />
                </div>
              </div>

              {/* Guarantor details */}
              <span className="font-display font-semibold uppercase text-[10px] tracking-wider text-slate-400 block pt-2 border-t border-slate-100">Guarantor / Emergency contact</span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-slate-500 font-semibold">Guarantor Full Name</label>
                  <input
                    id="manual-parentName"
                    type="text"
                    value={newManualStudent.parentName}
                    onChange={(e) => setNewManualStudent(prev => ({ ...prev, parentName: e.target.value }))}
                    placeholder="Guarantor block letters"
                    className="w-full p-2.5 border border-slate-200 rounded focus-border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500 font-semibold">Relationship to Client</label>
                  <select
                    id="manual-parentRelation"
                    value={newManualStudent.parentRelationship}
                    onChange={(e) => setNewManualStudent(prev => ({ ...prev, parentRelationship: e.target.value as any }))}
                    className="w-full p-2.5 border border-slate-200 rounded bg-white text-slate-700 focus:outline-none"
                  >
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-slate-500 font-semibold">Guarantor Phone</label>
                  <input
                    id="manual-parentPhone"
                    type="tel"
                    value={newManualStudent.parentPhone}
                    onChange={(e) => setNewManualStudent(prev => ({ ...prev, parentPhone: e.target.value }))}
                    placeholder="+1 (555) 000-0000"
                    className="w-full p-2.5 border border-slate-200 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500 font-semibold">Guarantor Email</label>
                  <input
                    id="manual-parentEmail"
                    type="email"
                    value={newManualStudent.parentEmail}
                    onChange={(e) => setNewManualStudent(prev => ({ ...prev, parentEmail: e.target.value }))}
                    placeholder="guarantor@domain"
                    className="w-full p-2.5 border border-slate-200 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-slate-500 font-semibold">Administrative Intake Notes</label>
                <textarea
                  id="manual-notes"
                  rows={2}
                  value={newManualStudent.adminNotes}
                  onChange={(e) => setNewManualStudent(prev => ({ ...prev, adminNotes: e.target.value }))}
                  placeholder="Record payment details or special background guidelines..."
                  className="w-full p-2.5 border border-slate-200 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  id="btn-manual-dismiss"
                  type="button"
                  onClick={() => setIsAddingManually(false)}
                  className="px-5 py-2.5 rounded text-slate-500 hover:text-slate-800 border border-slate-150 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  id="btn-manual-submit"
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Create & Auto-Approve Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD ADVISORY PROGRAM MODAL */}
      {isAddingProgramModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl p-6 space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-600" />
                  Add Advisory Program
                </h3>
                <p className="text-slate-400 text-[11px]">Register a brand-new degree consult, research track or dissertation plan segment.</p>
              </div>
              <button 
                onClick={() => setIsAddingProgramModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-650 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddGradeFee} className="space-y-4 text-xs text-slate-700">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Advisory Program Title *</label>
                <input
                  type="text"
                  required
                  value={newGradeLevel}
                  onChange={(e) => setNewGradeLevel(e.target.value)}
                  placeholder="e.g. PhD Thesis Mentoring"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-850"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Base Tuition (GH₵) *</label>
                  <input
                    type="number"
                    required
                    value={newTuition}
                    onChange={(e) => setNewTuition(e.target.value)}
                    placeholder="1200"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded text-right font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Assessment (GH₵) *</label>
                  <input
                    type="number"
                    required
                    value={newActivity}
                    onChange={(e) => setNewActivity(e.target.value)}
                    placeholder="150"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded text-right font-mono text-slate-800"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Design Audit (GH₵) *</label>
                  <input
                    type="number"
                    required
                    value={newFacilities}
                    onChange={(e) => setNewFacilities(e.target.value)}
                    placeholder="100"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded text-right font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Reg Fee (GH₵) *</label>
                  <input
                    type="number"
                    required
                    value={newReg}
                    onChange={(e) => setNewReg(e.target.value)}
                    placeholder="50"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded text-right font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingProgramModalOpen(false)}
                  className="px-4 py-2 rounded text-slate-505 hover:text-slate-800 border border-slate-150 font-semibold cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition shadow-xs cursor-pointer text-xs"
                >
                  Add Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ADVISORY PROGRAM MODAL */}
      {editingGradeLevel !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl p-6 space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  Edit Advisory Program Base Rates
                </h3>
                <p className="text-slate-400 text-[11px]">Updating core tuition and levies structure for <strong className="text-slate-800">{editingGradeLevel}</strong></p>
              </div>
              <button 
                onClick={() => setEditingGradeLevel(null)}
                className="p-1 text-slate-400 hover:text-slate-650 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Base Tuition (GH₵) *</label>
                  <input
                    type="number"
                    value={editTuition}
                    onChange={(e) => setEditTuition(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded text-right font-mono text-slate-850 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Assessment (GH₵) *</label>
                  <input
                    type="number"
                    value={editActivity}
                    onChange={(e) => setEditActivity(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded text-right font-mono text-slate-855 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Design Audit (GH₵) *</label>
                  <input
                    type="number"
                    value={editFacilities}
                    onChange={(e) => setEditFacilities(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded text-right font-mono text-slate-855 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Reg Fee (GH₵) *</label>
                  <input
                    type="number"
                    value={editReg}
                    onChange={(e) => setEditReg(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded text-right font-mono text-slate-855 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-100/50 flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-600">Calculated Program Total:</span>
                <strong className="font-mono text-sm text-blue-600 font-bold">
                  GH₵{(Number(editTuition) + Number(editActivity) + Number(editFacilities) + Number(editReg)).toLocaleString()}
                </strong>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingGradeLevel(null)}
                  className="px-4 py-2 rounded text-slate-505 hover:text-slate-800 border border-slate-150 font-semibold cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveGradeFee(editingGradeLevel)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition shadow-xs cursor-pointer text-xs"
                >
                  Save Rates
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD SEMINAR MODULE MODAL */}
      {isAddingCourseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl p-6 space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-600" />
                  Add Seminar / Module
                </h3>
                <p className="text-slate-400 text-[11px]">Define a new research method tool workshop or syntax seminar segment.</p>
              </div>
              <button 
                onClick={() => setIsAddingCourseModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-650 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCourse} className="space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    placeholder="RES-102"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-850 font-mono text-center uppercase focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Cost (GH₵) *</label>
                  <input
                    type="number"
                    required
                    value={newCourseCost}
                    onChange={(e) => setNewCourseCost(e.target.value)}
                    placeholder="200"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded text-right font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Elective Seminar name *</label>
                <input
                  type="text"
                  required
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="e.g. Advanced Meta-Analysis"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-850"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingCourseModalOpen(false)}
                  className="px-4 py-2 rounded text-slate-505 hover:text-slate-800 border border-slate-150 font-semibold cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition shadow-xs cursor-pointer text-xs"
                >
                  Add Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SEMINAR MODULE MODAL */}
      {editingCourseCode !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl p-6 space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Edit Academic Module Details
                </h3>
                <p className="text-slate-400 text-[11px]">Updating core curriculum metadata for code <strong className="font-mono text-slate-800">{editingCourseCode}</strong></p>
              </div>
              <button 
                onClick={() => setEditingCourseCode(null)}
                className="p-1 text-slate-400 hover:text-slate-650 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Course Title *</label>
                <input
                  type="text"
                  value={editCourseName}
                  onChange={(e) => setEditCourseName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-850 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Elective tuition Cost (GH₵) *</label>
                <input
                  type="number"
                  value={editCourseCost}
                  onChange={(e) => setEditCourseCost(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded text-right font-mono text-slate-850 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCourseCode(null)}
                  className="px-4 py-2 rounded text-slate-505 hover:text-slate-800 border border-slate-150 font-semibold cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveCourse(editingCourseCode)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition shadow-xs cursor-pointer text-xs"
                >
                  Save Module Info
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
