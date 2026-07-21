'use client';

import { useState } from 'react';
import { Camera, CheckCircle2 } from 'lucide-react';
import { submitPublicApplication } from './actions';

export function ApplyClient({ tenantSlug, schoolName }: { tenantSlug: string, schoolName: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'Male',
    bloodGroup: '',
    nin: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    grade: 'Grade 7',
    prevSchool: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    parentRelation: 'Father',
    photo: ''
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const [referenceCode, setReferenceCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.parentName) return;

    setIsSubmitting(true);
    const formDataObj = new FormData();
    formDataObj.append('tenantSlug', tenantSlug);
    formDataObj.append('first_name', formData.firstName);
    formDataObj.append('last_name', formData.lastName);
    formDataObj.append('dob', formData.dob);
    formDataObj.append('gender', formData.gender);
    formDataObj.append('blood_group', formData.bloodGroup);
    formDataObj.append('nin', formData.nin);
    formDataObj.append('email', formData.email);
    formDataObj.append('phone', formData.phone);
    formDataObj.append('address', formData.address);
    formDataObj.append('city', formData.city);
    formDataObj.append('target_grade', formData.grade);
    formDataObj.append('previous_school', formData.prevSchool);
    formDataObj.append('parent_name', formData.parentName);
    formDataObj.append('parent_phone', formData.parentPhone);
    formDataObj.append('parent_email', formData.parentEmail);
    formDataObj.append('parent_relation', formData.parentRelation);
    
    if (formData.photo) {
      formDataObj.append('avatar_url', ''); 
    }

    const res = await submitPublicApplication(formDataObj);
    setIsSubmitting(false);

    if (res.success && res.referenceCode) {
      setReferenceCode(res.referenceCode);
      setIsSuccess(true);
    } else {
      alert(res.error || 'Failed to submit application');
    }
  };

  if (isSuccess) {
    return (
      <div className="glass-card p-8 sm:p-12 text-center flex flex-col items-center justify-center animate-fade-in min-h-[50vh] space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        
        <div>
          <h2 className="text-3xl font-bold text-[hsl(var(--text-primary))]">Application Submitted!</h2>
          <p className="text-[hsl(var(--text-secondary))] max-w-md mx-auto mt-2 text-sm">
            Thank you for applying to {schoolName}. We have successfully received your application.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] max-w-md w-full space-y-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-[hsl(var(--text-tertiary))]">Your Application Reference Code</span>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl font-mono font-extrabold text-[hsl(var(--accent))] tracking-widest bg-[hsl(var(--bg-primary))] px-4 py-2 rounded-xl border border-[hsl(var(--border))] select-all">
              {referenceCode}
            </span>
          </div>
          <p className="text-xs text-[hsl(var(--text-secondary))] pt-1">
            Save this code! You can use it to track your child's application status in real-time.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <a
            href="/apply/status"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Track Application Status Now
          </a>
          <a
            href="/"
            className="px-6 py-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] font-semibold text-sm hover:bg-[hsl(var(--border))] transition-colors"
          >
            Return to School Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 sm:p-8 animate-fade-in">
      <div className="mb-8 border-b border-[hsl(var(--border))] pb-6">
        <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Student Application Form</h2>
        <p className="text-[hsl(var(--text-secondary))] mt-2">
          Please fill out the form below to apply for admission to {schoolName}. All fields marked with an asterisk (*) are required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Photo Upload Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-xl bg-[hsl(var(--bg-tertiary)/0.5)] border border-[hsl(var(--border))]">
          <div className="relative w-28 h-28 rounded-full bg-[hsl(var(--bg-primary))] border-2 border-dashed border-[hsl(var(--border))] flex flex-col items-center justify-center overflow-hidden group hover:border-[hsl(var(--accent))] transition-colors cursor-pointer">
            {formData.photo ? (
              <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <Camera className="w-8 h-8 text-[hsl(var(--text-tertiary))] group-hover:scale-110 group-hover:text-[hsl(var(--accent))] transition-all" />
                <span className="text-xs text-[hsl(var(--text-tertiary))] mt-2 font-medium">Upload Photo</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <div className="text-center sm:text-left">
            <h4 className="text-sm font-bold text-[hsl(var(--text-primary))]">Student Passport Photograph</h4>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Clear, recent passport photo. Supports PNG, JPG (Max 2MB).</p>
          </div>
        </div>

        {/* Personal Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[hsl(var(--accent))] uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[hsl(var(--accent)/0.1)] flex items-center justify-center text-xs">1</span> 
            Student Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full h-11 px-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full h-11 px-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Date of Birth *</label>
              <input
                type="date"
                required
                value={formData.dob}
                onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                className="w-full h-11 px-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                className="w-full h-11 px-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Blood Group</label>
              <input
                type="text"
                value={formData.bloodGroup}
                onChange={(e) => setFormData(prev => ({ ...prev, bloodGroup: e.target.value }))}
                placeholder="e.g. O+"
                className="w-full h-11 px-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5">National ID / NIN</label>
              <input
                type="text"
                value={formData.nin}
                onChange={(e) => setFormData(prev => ({ ...prev, nin: e.target.value }))}
                className="w-full h-11 px-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="space-y-4 pt-4 border-t border-[hsl(var(--border))]">
          <h3 className="text-sm font-bold text-[hsl(var(--accent))] uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[hsl(var(--accent)/0.1)] flex items-center justify-center text-xs">2</span> 
            Contact Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Student Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full h-11 px-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Student Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full h-11 px-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Home Address *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full h-11 px-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full h-11 px-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
            </div>
          </div>
        </div>

        {/* Academic Details */}
        <div className="space-y-4 pt-4 border-t border-[hsl(var(--border))]">
          <h3 className="text-sm font-bold text-[hsl(var(--accent))] uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[hsl(var(--accent)/0.1)] flex items-center justify-center text-xs">3</span> 
            Academic Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Applying for Grade *</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                className="w-full h-11 px-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              >
                <option>Grade 7</option>
                <option>Grade 8</option>
                <option>Grade 9</option>
                <option>Grade 10</option>
                <option>Grade 11</option>
                <option>Grade 12</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Previous School Attended</label>
              <input
                type="text"
                value={formData.prevSchool}
                onChange={(e) => setFormData(prev => ({ ...prev, prevSchool: e.target.value }))}
                className="w-full h-11 px-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
            </div>
          </div>
        </div>

        {/* Parent Details */}
        <div className="space-y-4 pt-4 border-t border-[hsl(var(--border))]">
          <h3 className="text-sm font-bold text-[hsl(var(--accent))] uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[hsl(var(--accent)/0.1)] flex items-center justify-center text-xs">4</span> 
            Parent / Guardian Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Full Name *</label>
              <input
                type="text"
                required
                value={formData.parentName}
                onChange={(e) => setFormData(prev => ({ ...prev, parentName: e.target.value }))}
                className="w-full h-11 px-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Relationship *</label>
              <select
                value={formData.parentRelation}
                onChange={(e) => setFormData(prev => ({ ...prev, parentRelation: e.target.value }))}
                className="w-full h-11 px-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              >
                <option>Father</option>
                <option>Mother</option>
                <option>Guardian</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.parentPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, parentPhone: e.target.value }))}
                className="w-full h-11 px-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Email Address *</label>
              <input
                type="email"
                required
                value={formData.parentEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, parentEmail: e.target.value }))}
                className="w-full h-11 px-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white font-bold hover:opacity-90 transition-opacity shadow-lg shadow-[hsl(var(--accent)/0.2)] disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
}
