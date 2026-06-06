/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, GraduationCap, ShieldAlert, Award, FileSpreadsheet, PlusCircle, LayoutDashboard, Database, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, GradeFeeStructure } from './types';
import { INITIAL_STUDENTS, GRADE_FEES, PREDEFINED_COURSES } from './data';
import RegistrationForm from './components/RegistrationForm';
import AdminPortal from './components/AdminPortal';
import { API_BASE_URL } from './config';

const parseStudentFromBackend = (s: any): Student => ({
  ...s,
  totalFees: Number(s.totalFees || 0),
  paidFees: Number(s.paidFees || 0),
  outstandingFees: Number(s.outstandingFees || 0),
  feeLedgerItems: (s.feeLedgerItems || []).map((l: any) => ({
    ...l,
    amount: Number(l.amount || 0)
  })),
  payments: (s.payments || []).map((p: any) => ({
    ...p,
    amount: Number(p.amount || 0)
  }))
});

export default function App() {
  const [view, setView] = useState<'register' | 'admin'>('register');
  const [students, setStudents] = useState<Student[]>([]);
  const [gradeFees, setGradeFees] = useState<GradeFeeStructure[]>([]);
  const [predefinedCourses, setPredefinedCourses] = useState<{ code: string; name: string; cost: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from backend APIs on mounting
  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const [studentsRes, feesRes, coursesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/students`),
          fetch(`${API_BASE_URL}/api/grade-fees`),
          fetch(`${API_BASE_URL}/api/courses`)
        ]);
        
        if (!studentsRes.ok || !feesRes.ok || !coursesRes.ok) {
          throw new Error('Failed to fetch initial configuration from server.');
        }

        const studentsData = await studentsRes.json();
        const feesData = await feesRes.json();
        const coursesData = await coursesRes.json();

        const studentsDataParsed = studentsData.map(parseStudentFromBackend);
        const feesDataParsed = feesData.map((f: any) => ({
          ...f,
          tuitionFee: Number(f.tuitionFee || 0),
          activityFee: Number(f.activityFee || 0),
          facilitiesFee: Number(f.facilitiesFee || 0),
          registrationFee: Number(f.registrationFee || 0)
        }));
        const coursesDataParsed = coursesData.map((c: any) => ({
          ...c,
          cost: Number(c.cost || 0)
        }));

        if (active) {
          setStudents(studentsDataParsed);
          setGradeFees(feesDataParsed);
          setPredefinedCourses(coursesDataParsed);
        }
      } catch (err) {
        console.error('Error fetching backend registry details:', err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, []);

  // Sync to backend Grade Fees List
  const handleUpdateGradeFees = async (updatedFees: GradeFeeStructure[]) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/grade-fees`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFees)
      });
      if (!res.ok) throw new Error('Sync failed');
      setGradeFees(updatedFees);
    } catch (err) {
      console.error('Failed to update grade fees structure on server:', err);
      alert('Error: Failed to sync grade fees structure to server.');
    }
  };

  // Sync to backend Predefined Courses List
  const handleUpdatePredefinedCourses = async (updatedCourses: { code: string; name: string; cost: number }[]) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCourses)
      });
      if (!res.ok) throw new Error('Sync failed');
      setPredefinedCourses(updatedCourses);
    } catch (err) {
      console.error('Failed to update custom courses on server:', err);
      alert('Error: Failed to sync custom courses to server.');
    }
  };

  // Callback: Public form registrations
  const handleRegisterSubmit = async (newReg: Omit<Student, 'id' | 'registrationDate' | 'admissionStatus' | 'paidFees' | 'outstandingFees' | 'payments'>) => {
    const feeStructure = gradeFees.find(g => g.gradeLevel === newReg.gradeLevel) || gradeFees[0];
    const baseFee = (feeStructure?.tuitionFee || 0) + (feeStructure?.activityFee || 0) + (feeStructure?.facilitiesFee || 0) + (feeStructure?.registrationFee || 0);
    const coursesCost = newReg.courses.reduce((sum, courseName) => {
      const cls = predefinedCourses.find(c => c.name === courseName);
      return sum + (cls ? cls.cost : 150);
    }, 0);
    const totalFeesVal = baseFee + coursesCost;
    
    const customRefId = `REG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const studentWithMeta = {
      ...newReg,
      id: customRefId,
      admissionStatus: 'Pending' as const,
      totalFees: totalFeesVal,
      paidFees: 0,
      outstandingFees: totalFeesVal,
      registrationDate: new Date().toISOString().split('T')[0],
      payments: []
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentWithMeta)
      });
      if (!res.ok) throw new Error('Create student failed');
      const savedStudent = await res.json();
      setStudents(prev => [parseStudentFromBackend(savedStudent), ...prev]);
    } catch (err) {
      console.error('Failed to create student on server:', err);
      alert('Error: Failed to submit student registration to backend database.');
    }
  };

  // Callback: Update a student's values
  const handleUpdateStudent = async (updatedStudent: Student) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/students/${updatedStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStudent)
      });
      if (!res.ok) throw new Error('Update student failed');
      const savedStudent = await res.json();
      setStudents(prev => prev.map(s => s.id === savedStudent.id ? parseStudentFromBackend(savedStudent) : s));
    } catch (err) {
      console.error('Failed to update student on server:', err);
      alert('Error: Failed to save updated student record to backend database.');
    }
  };

  // Callback: Add a manually entered student
  const handleAddManualStudent = async (newStudent: Student) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent)
      });
      if (!res.ok) throw new Error('Add manual student failed');
      const savedStudent = await res.json();
      setStudents(prev => [parseStudentFromBackend(savedStudent), ...prev]);
    } catch (err) {
      console.error('Failed to add manual student on server:', err);
      alert('Error: Failed to save manual student record to backend database.');
    }
  };

  // Callback: Delete a student
  const handleDeleteStudent = async (studentId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/students/${studentId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Delete student failed');
      setStudents(prev => prev.filter(s => s.id !== studentId));
    } catch (err) {
      console.error('Failed to delete student on server:', err);
      alert('Error: Failed to delete student record from backend database.');
    }
  };

  const pendingCount = students.filter(s => s.admissionStatus === 'Pending').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <Sparkles className="w-12 h-12 text-blue-600 animate-pulse" />
          <h2 className="font-display font-semibold text-slate-800">Booting Intake Registry...</h2>
          <span className="text-xs text-slate-400">Loading Safe Space securely</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans flex flex-col">
      {/* Dynamic Master Headway Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-3xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo & Academic emblem */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <GraduationCap className="w-5 h-5 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]" />
            </div>
            <div>
              <strong className="font-display text-sm font-bold block tracking-tight text-slate-900 leading-none font-sans">Safe Space</strong>
              <span className="text-[10px] text-slate-500 font-mono font-medium">ACADEMIC & RESEARCH ADVISORY</span>
            </div>
          </div>

          {/* Tab Selection Navigation */}
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              id="nav-btn-register"
              onClick={() => setView('register')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition cursor-pointer ${
                view === 'register'
                  ? 'bg-white text-blue-600 shadow-3xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
              Registration Form
            </button>
            <button
              id="nav-btn-admin"
              onClick={() => setView('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition relative cursor-pointer ${
                view === 'admin'
                  ? 'bg-white text-blue-600 shadow-3xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
              Admin Portal
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-yellow-400 text-slate-900 text-[9px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Workspace viewport */}
      <main className="flex-1 py-8 px-4">
        <AnimatePresence mode="wait">
          {view === 'register' ? (
            <motion.div
              key="register-route"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <RegistrationForm 
                onRegisterSubmit={handleRegisterSubmit} 
                onNavigateToAdmin={() => setView('admin')}
                gradeFees={gradeFees}
                predefinedCourses={predefinedCourses}
              />
            </motion.div>
          ) : (
            <motion.div
              key="admin-route"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AdminPortal 
                students={students} 
                onUpdateStudent={handleUpdateStudent}
                onAddStudent={handleAddManualStudent}
                onDeleteStudent={handleDeleteStudent}
                onNavigateToRegister={() => setView('register')}
                gradeFees={gradeFees}
                predefinedCourses={predefinedCourses}
                onUpdateGradeFees={handleUpdateGradeFees}
                onUpdatePredefinedCourses={handleUpdatePredefinedCourses}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>


    </div>
  );
}
