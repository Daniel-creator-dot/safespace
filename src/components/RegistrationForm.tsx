/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, Mail, Phone, Calendar, MapPin, Users, CreditCard, 
  Upload, CheckCircle, ArrowRight, ArrowLeft, Shield, AlertCircle, FileText, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, StudentDocument, GradeFeeStructure } from '../types';

interface RegistrationFormProps {
  onRegisterSubmit: (newStudent: Omit<Student, 'id' | 'registrationDate' | 'admissionStatus' | 'paidFees' | 'outstandingFees' | 'payments'>) => void;
  onNavigateToAdmin: () => void;
  gradeFees: GradeFeeStructure[];
  predefinedCourses: { code: string; name: string; cost: number }[];
}

export default function RegistrationForm({ 
  onRegisterSubmit, 
  onNavigateToAdmin,
  gradeFees,
  predefinedCourses
}: RegistrationFormProps) {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    gradeLevel: gradeFees[0]?.gradeLevel || 'Initial Consultation',
    email: '',
    phone: '',
    address: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    parentRelationship: 'Mother' as 'Mother' | 'Father' | 'Guardian' | 'Other',
    courses: [] as string[]
  });

  const [uploadedFiles, setUploadedFiles] = useState<{
    birthCert: File | null;
    reportCard: File | null;
    addressProof: File | null;
  }>({
    birthCert: null,
    reportCard: null,
    addressProof: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const selectedFeeStructure = gradeFees.find(g => g.gradeLevel === formData.gradeLevel) || gradeFees[0] || { gradeLevel: 'Initial Consultation', tuitionFee: 1200, activityFee: 150, facilitiesFee: 100, registrationFee: 50 };
  
  // Calculate total fees dynamically based on selected courses vs grade level fees
  const coursesCost = formData.courses.reduce((sum, courseName) => {
    const cls = predefinedCourses.find(c => c.name === courseName);
    return sum + (cls ? cls.cost : 150);
  }, 0);
  const baseFeesAmount = (selectedFeeStructure.tuitionFee || 0) + (selectedFeeStructure.activityFee || 0) + (selectedFeeStructure.facilitiesFee || 0) + (selectedFeeStructure.registrationFee || 0);
  const calculatedTotal = baseFeesAmount + coursesCost;

  // Form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleCourse = (courseName: string) => {
    setFormData(prev => {
      const alreadyHas = prev.courses.includes(courseName);
      if (alreadyHas) {
        return {
          ...prev,
          courses: prev.courses.filter(c => c !== courseName)
        };
      } else {
        return {
          ...prev,
          courses: [...prev.courses, courseName]
        };
      }
    });
  };

  // Step validation
  const validateStep = (currentStep: number): boolean => {
    setErrorMessage('');
    if (currentStep === 1) {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        setErrorMessage('Student first name and last name are required.');
        return false;
      }
      if (!formData.dateOfBirth) {
        setErrorMessage('Student date of birth is required.');
        return false;
      }
      if (!formData.email.trim() || !formData.phone.trim()) {
        setErrorMessage('Student contact details are required.');
        return false;
      }
      if (!formData.address.trim()) {
        setErrorMessage('Home address is required.');
        return false;
      }
    } else if (currentStep === 2) {
      // Optional fields - no validation required
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setErrorMessage('');
    setStep(prev => prev - 1);
  };

  // Simulated file upload handlers
  const handleFileChange = (type: 'birthCert' | 'reportCard' | 'addressProof', e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFiles(prev => ({
        ...prev,
        [type]: e.target.files![0]
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    setErrorMessage('');

    // Simulate network delay for polished experience
    setTimeout(() => {
      try {
        const customRefId = `REG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        
        onRegisterSubmit({
          ...formData,
          totalFees: calculatedTotal,
          feeLedgerItems: [],
          documents: [
            ...(uploadedFiles.birthCert ? [{
              id: 'doc-birth',
              name: uploadedFiles.birthCert.name,
              type: 'Student ID Proof' as const,
              uploadedAt: new Date().toISOString().split('T')[0],
              status: 'Pending' as const
            }] : []),
            ...(uploadedFiles.reportCard ? [{
              id: 'doc-report',
              name: uploadedFiles.reportCard.name,
              type: 'Research Synopsis' as const,
              uploadedAt: new Date().toISOString().split('T')[0],
              status: 'Pending' as const
            }] : []),
            ...(uploadedFiles.addressProof ? [{
              id: 'doc-address',
              name: uploadedFiles.addressProof.name,
              type: 'Academic Transcripts' as const,
              uploadedAt: new Date().toISOString().split('T')[0],
              status: 'Pending' as const
            }] : [])
          ]
        });

        setRegistrationId(customRefId);
        setStep(4);
      } catch (err: any) {
        setErrorMessage('Failed to submit application. Please check your data.');
      } finally {
        setIsSubmitting(false);
      }
    }, 1200);
  };

  const renderProgressSteps = () => {
    const steps = [
      { num: 1, label: 'Client Profile' },
      { num: 2, label: 'Secondary Contact' },
      { num: 3, label: 'Review & Options' },
    ];

    return (
      <div className="flex items-center justify-between max-w-lg mx-auto mb-10 px-4">
        {steps.map((s, idx) => (
          <React.Fragment key={s.num}>
            <div className="flex flex-col items-center relative">
              <div id={`step-bubble-${s.num}`}className={`w-9 h-9 rounded-full flex items-center justify-center font-display font-semibold transition-colors duration-300 ${
                step === s.num
                  ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                  : step > s.num
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {step > s.num ? '✓' : s.num}
              </div>
              <span className={`text-xs mt-2 font-medium ${step === s.num ? 'text-slate-800 font-semibold' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${
                step > s.num ? 'bg-emerald-200' : 'bg-slate-100'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-4 px-2 sm:px-6">
      {/* Banner / Header */}
      <div className="text-center mb-10">
        <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Intake Bookings Active • Academic Consultation & Thesis Support
        </span>
        <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 mt-3 md:text-5xl">
          Safe Space
        </h1>
        <p className="text-slate-500 mt-2 max-w-xl mx-auto text-sm sm:text-base">
          Fill out our secure postgraduate intake portal. Submissions are reviewed immediately by our senior academic consultants and research methodologists to structure your customized thesis and dissertation advising schedule.
        </p>
      </div>

      {step <= 3 && renderProgressSteps()}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start gap-3 rounded-r-md text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Actual Form Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-10">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Client Information */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <h2 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Client Personal Information
                  </h2>
                  <p className="sky-text text-xs text-slate-400 mt-1">Provide legal name and contact details of the primary client</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">First Name *</label>
                    <input 
                      id="input-firstName"
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="e.g. Liam"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-105 focus:border-blue-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Last Name *</label>
                    <input 
                      id="input-lastName"
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="e.g. Smith"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-105 focus:border-blue-500 transition"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Date of Birth *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                      <input 
                        id="input-dob"
                        type="date" 
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-105 focus:border-blue-500 transition text-slate-705"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Gender *</label>
                    <select 
                      id="select-gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-105 focus:border-blue-500 transition bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Client Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                      <input 
                        id="input-email"
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="client@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-105 focus:border-blue-500 transition"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Client Contact Phone *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                      <input 
                        id="input-phone"
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-105 focus:border-blue-500 transition"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Home Residence Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input 
                      id="input-address"
                      type="text" 
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Street number, Apartment, City, State, ZIP code"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-105 focus:border-blue-500 transition"
                      required
                    />
                  </div>
                </div>

                <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-100 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Specialist Research Methods & Writing Support Modules Selection
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Choose one or more extra custom modules to augment your academic research support or writing advising plan.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {predefinedCourses.map((course) => {
                      const isSelected = formData.courses.includes(course.name);
                      return (
                        <div 
                          key={course.code}
                          id={`course-card-${course.code}`}
                          onClick={() => handleToggleCourse(course.name)}
                          className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all flex justify-between items-center ${
                            isSelected
                              ? 'bg-blue-50/45 border-blue-600 shadow-2xs'
                              : 'bg-white border-slate-200/80 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="text-[10px] font-mono text-blue-600 uppercase font-semibold">{course.code}</span>
                            <span className="text-xs font-semibold text-slate-800">{course.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                              +GH₵{course.cost}
                            </span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                              isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                            }`}>
                              {isSelected && <Check className="w-2.5 h-2.5" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    id="btn-next-step-1"
                    type="button"
                    onClick={nextStep}
                    className="bg-blue-600 hover:bg-blue-750 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-xs hover:shadow-md cursor-pointer"
                  >
                    Secondary Contact Details
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Emergency/Alternate Contact */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Emergency Contact & Guarantor Details
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">This individual will be listed as our secondary contact and primary guarantor party</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Guarantor/Contact Name</label>
                    <input 
                      id="input-parentName"
                      type="text" 
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleChange}
                      placeholder="e.g. Johnathan Smith"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-105 focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Relationship to Client</label>
                    <select 
                      id="select-parentRelationship"
                      name="parentRelationship"
                      value={formData.parentRelationship}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-105 focus:border-blue-500 transition bg-white"
                    >
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Guardian">Legal Guardian</option>
                      <option value="Other">Other Relation</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Primary Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                      <input 
                        id="input-parentPhone"
                        type="tel" 
                        name="parentPhone"
                        value={formData.parentPhone}
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-105 focus:border-blue-500 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Guarantor Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                      <input 
                        id="input-parentEmail"
                        type="email" 
                        name="parentEmail"
                        value={formData.parentEmail}
                        onChange={handleChange}
                        placeholder="parent@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-105 focus:border-blue-500 transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 flex gap-3 items-start border border-slate-100 text-xs text-slate-500">
                  <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-700 block mb-0.5 text-sm">Academic Integrity & Research Confidentiality Standards</span>
                    Your personal contact, research drafts, abstract synopsis, and consultation notes are completely secure, protected under academic confidentiality and non-disclosure standards. Only certified senior research advisors and academic consultants of Safe Space can access your files.
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    id="btn-prev-step-2"
                    type="button"
                    onClick={prevStep}
                    className="border border-slate-200 hover:bg-slate-50 text-slate-600 px-5 py-3 rounded-lg text-sm font-semibold flex items-center gap-2 transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    id="btn-next-step-2"
                    type="button"
                    onClick={nextStep}
                    className="bg-blue-600 hover:bg-blue-750 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-xs hover:shadow-md cursor-pointer"
                  >
                    Fees & Verification Docs
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Verification & Advisory Tuition Structures */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Advisory Fees Calculation & ID Verification Upload
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Review your automated advisory plan fee quote and upload standard verification documents</p>
                </div>

                {/* Costs breakdown panel */}
                <div className="bg-blue-50/20 rounded-2xl border border-blue-100/50 p-6 md:p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-blue-100/40 pb-4 mb-4">
                    <div>
                      <h3 className="font-display font-bold text-lg text-slate-900">Fee Summary Breakdown</h3>
                      <p className="text-slate-500 text-xs">Summary of your selected modules and academic services</p>
                    </div>
                    <div className="mt-2 md:mt-0 pt-2 border-t border-blue-100 md:border-t-0 md:pt-0 w-full md:w-auto text-left md:text-right">
                      <span className="text-xs text-slate-500 uppercase tracking-wider block">Estimated Term Balance</span>
                      <strong className="text-2xl font-bold font-mono text-blue-600">GH₵{calculatedTotal.toLocaleString()}</strong>
                    </div>
                  </div>

                  {formData.courses.length > 0 ? (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Selected Academic & Research Modules Details:</h4>
                      {formData.courses.map(courseName => {
                        const course = predefinedCourses.find(c => c.name === courseName);
                        return (
                          <div key={courseName} className="flex justify-between text-xs text-slate-600 bg-white px-3 py-1.5 rounded border border-blue-100/30 shadow-3xs">
                            <span className="flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              {courseName}
                            </span>
                            <strong className="font-mono text-blue-600">GH₵{course ? course.cost : 150}</strong>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 text-center py-4 bg-white/50 rounded border border-dashed border-slate-200">
                      No specialist modules selected. Please select at least one module.
                    </div>
                  )}
                </div>

                {/* Interactive Document Dropzones */}
                <div className="space-y-4">
                  <h3 className="font-display font-semibold text-slate-800 text-sm tracking-wide uppercase">Credentials Upload</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Birth cert */}
                    <div className="border border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-blue-50/20 transition relative">
                      <input 
                        id="file-birth"
                        type="file" 
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => handleFileChange('birthCert', e)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center">
                        <Upload className={`w-8 h-8 mb-2 ${uploadedFiles.birthCert ? 'text-emerald-500' : 'text-slate-400'}`} />
                        <span className="text-xs font-semibold text-slate-700 block text-ellipsis overflow-hidden max-w-full">
                          {uploadedFiles.birthCert ? uploadedFiles.birthCert.name : 'Student / Scholar ID Proof (Optional)'}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1">PDF or Image up to 10MB</span>
                      </div>
                    </div>

                    {/* Report Card */}
                    <div className="border border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-blue-50/20 transition relative">
                      <input 
                        id="file-report"
                        type="file" 
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => handleFileChange('reportCard', e)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center">
                        <FileText className={`w-8 h-8 mb-2 ${uploadedFiles.reportCard ? 'text-emerald-500' : 'text-slate-400'}`} />
                        <span className="text-xs font-semibold text-slate-700 block text-ellipsis overflow-hidden max-w-full">
                          {uploadedFiles.reportCard ? uploadedFiles.reportCard.name : 'Research Synopsis / Outline (Optional)'}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1">Latest research proposal or abstract draft</span>
                      </div>
                    </div>

                    {/* Address Proof */}
                    <div className="border border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-blue-50/20 transition relative">
                      <input 
                        id="file-address"
                        type="file" 
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => handleFileChange('addressProof', e)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center">
                        <MapPin className={`w-8 h-8 mb-2 ${uploadedFiles.addressProof ? 'text-emerald-500' : 'text-slate-400'}`} />
                        <span className="text-xs font-semibold text-slate-700 block text-ellipsis overflow-hidden max-w-full">
                          {uploadedFiles.addressProof ? uploadedFiles.addressProof.name : 'Academic Transcripts Copy (Optional)'}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1">Utility bill or university transcripts</span>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <button
                    id="btn-prev-step-3"
                    type="button"
                    onClick={prevStep}
                    className="border border-slate-200 hover:bg-slate-50 text-slate-600 px-5 py-3 rounded-lg text-sm font-semibold flex items-center gap-2 transition"
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    id="btn-submit-registration"
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-8 py-3 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-md hover:shadow-lg cursor-pointer"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deploying Profile...
                      </>
                    ) : (
                      <>
                        Submit Consultation Intake
                        <CheckCircle className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Success confirmation screen */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10 px-4 space-y-6"
              >
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-100">
                  <CheckCircle className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h2 className="font-display text-3xl font-bold text-slate-900">Intake Submitted Successfully!</h2>
                  <p className="text-slate-500 text-sm max-w-lg mx-auto">
                    The intake registry has successfully compiled a consultation file for <strong className="text-slate-800">{formData.firstName} {formData.lastName}</strong> and structured your account.
                  </p>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl max-w-md mx-auto border border-slate-100 space-y-4 text-left">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Intake File Ref</span>
                    <strong className="text-blue-600 font-mono text-lg">{registrationId}</strong>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Advisory Quote</span>
                    <span className="font-mono text-slate-700 font-bold">GH₵{calculatedTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Review SLA</span>
                    <span className="text-amber-600 font-medium text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Usually 24 Hours</span>
                  </div>
                </div>

                <div className="bg-emerald-50/50 p-4 rounded-xl text-left text-xs max-w-lg mx-auto border border-emerald-100 text-emerald-800 flex gap-3">
                  <div className="bg-emerald-500 text-white rounded-full p-0.5 mt-0.5"><CheckCircle className="w-3.5 h-3.5" /></div>
                  <div>
                    <span className="font-bold text-slate-800 text-sm block mb-1">Automatic Admin Synchronization</span>
                    This profile is live immediately inside the Admin Portal. You can switch to the Admin Portal using the actions below to review documents, approve advisory status, and record assessment/intake fee payments.
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <button
                    id="btn-register-another"
                    type="button"
                    onClick={() => {
                      setFormData({
                        firstName: '',
                        lastName: '',
                        dateOfBirth: '',
                        gender: 'Male',
                        gradeLevel: gradeFees[0]?.gradeLevel || 'Initial Consultation',
                        email: '',
                        phone: '',
                        address: '',
                        parentName: '',
                        parentEmail: '',
                        parentPhone: '',
                        parentRelationship: 'Mother',
                        courses: []
                      });
                      setUploadedFiles({
                        birthCert: null,
                        reportCard: null,
                        addressProof: null,
                      });
                      setStep(1);
                      setRegistrationId(null);
                    }}
                    className="border border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-lg text-sm font-semibold transition cursor-pointer"
                  >
                    Register Another Scholar
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </form>
      </div>

      <div className="text-center mt-8 text-xs text-slate-400">
        Secured by Safe Space Academic Registry. © 2026. All rights reserved.
      </div>
    </div>
  );
}
