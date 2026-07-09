'use client';

import { useState } from 'react';
import { 
  Building2, CreditCard, Blocks, Palette, User, CheckCircle2, 
  Database, Server, Settings, Globe, Shield, ArrowRight, ArrowLeft 
} from 'lucide-react';

const steps = [
  { id: 'basic', label: 'Basic Info', icon: Building2 },
  { id: 'subscription', label: 'Subscription', icon: CreditCard },
  { id: 'modules', label: 'Modules', icon: Blocks },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'admin', label: 'Admin Setup', icon: User },
  { id: 'review', label: 'Review', icon: CheckCircle2 },
];

export default function ProvisioningWizardPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionProgress, setProvisionProgress] = useState(0);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleProvision = () => {
    setIsProvisioning(true);
    // Simulate provisioning
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setProvisionProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsProvisioning(false);
          // show success or redirect
        }, 1000);
      }
    }, 200);
  };

  return (
    <div className="space-y-8 max-w-[1000px] mx-auto animate-fade-in">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Provision New Tenant</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))]">Automated multi-tenant database provisioning and onboarding wizard.</p>
      </div>

      {/* Stepper */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[hsl(var(--border))] -translate-y-1/2 z-0" />
        <div className="absolute top-1/2 left-0 h-0.5 bg-[hsl(var(--accent))] -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }} />
        
        <div className="flex justify-between relative z-10">
          {steps.map((step, idx) => {
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            return (
              <div key={step.id} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isActive ? 'bg-[hsl(var(--accent))] border-[hsl(var(--accent))] text-white shadow-glow' :
                  isCompleted ? 'bg-[hsl(var(--accent))] border-[hsl(var(--accent))] text-white' :
                  'bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))]'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive || isCompleted ? 'text-[hsl(var(--text-primary))]' : 'text-[hsl(var(--text-tertiary))]'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Area */}
      <div className="glass-card p-8 border border-[hsl(var(--border))] rounded-2xl min-h-[400px]">
        
        {currentStep === 0 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-lg font-bold text-[hsl(var(--text-primary))] flex items-center gap-2"><Building2 className="w-5 h-5 text-[hsl(var(--accent))]" /> Organization Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5 uppercase">Legal Organization Name</label>
                <input type="text" placeholder="e.g. DreamDay Education Group" className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl px-4 py-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5 uppercase">Primary Domain Slug</label>
                  <div className="flex">
                    <input type="text" placeholder="dreamday" className="flex-1 bg-[hsl(var(--bg-tertiary))] border border-r-0 border-[hsl(var(--border))] rounded-l-xl px-4 py-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]" />
                    <span className="bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border))] rounded-r-xl px-4 py-3 text-sm text-[hsl(var(--text-tertiary))] font-mono">.schoolsaas.com</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5 uppercase">Region / Data Center</label>
                  <select className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl px-4 py-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]">
                    <option>US East (N. Virginia)</option>
                    <option>EU (Frankfurt)</option>
                    <option>Asia Pacific (Singapore)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-lg font-bold text-[hsl(var(--text-primary))] flex items-center gap-2"><CreditCard className="w-5 h-5 text-[hsl(var(--accent))]" /> Subscription Tier</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Starter', desc: 'Up to 100 students', price: '$29/mo' },
                { name: 'Professional', desc: 'Up to 500 students', price: '$79/mo' },
                { name: 'Enterprise', desc: 'Unlimited students', price: '$199/mo' }
              ].map(plan => (
                <label key={plan.name} className="flex flex-col p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.5)] hover:border-[hsl(var(--accent))] cursor-pointer transition-all relative overflow-hidden group">
                  <input type="radio" name="plan" className="absolute top-4 right-4 accent-[hsl(var(--accent))]" />
                  <span className="text-sm font-bold text-[hsl(var(--text-primary))] mb-1">{plan.name}</span>
                  <span className="text-xs text-[hsl(var(--text-tertiary))] mb-4">{plan.desc}</span>
                  <span className="text-lg font-black text-[hsl(var(--accent))] mt-auto">{plan.price}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-lg font-bold text-[hsl(var(--text-primary))] flex items-center gap-2"><Blocks className="w-5 h-5 text-[hsl(var(--accent))]" /> Provision Feature Modules</h2>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'core', name: 'Core SIS', desc: 'Student info, attendance, grades', required: true },
                { id: 'finance', name: 'Finance & Billing', desc: 'Invoices, fee collection, payroll' },
                { id: 'lms', name: 'Learning Management', desc: 'Assignments, quizzes, course content' },
                { id: 'hr', name: 'HR & Staffing', desc: 'Leave management, staff portal' },
                { id: 'transport', name: 'Transport & Fleet', desc: 'Bus tracking, routes, fees' },
                { id: 'hostel', name: 'Hostel & Dormitory', desc: 'Room allocation, wardens, visitors' },
              ].map(mod => (
                <label key={mod.id} className={`flex items-start gap-3 p-4 rounded-xl border border-[hsl(var(--border))] transition-all ${mod.required ? 'bg-[hsl(var(--bg-tertiary))] cursor-not-allowed opacity-70' : 'bg-[hsl(var(--bg-tertiary)/0.3)] hover:border-[hsl(var(--accent))] cursor-pointer'}`}>
                  <input type="checkbox" defaultChecked={mod.required} disabled={mod.required} className="mt-1 accent-[hsl(var(--accent))]" />
                  <div>
                    <span className="text-sm font-bold text-[hsl(var(--text-primary))]">{mod.name}</span> {mod.required && <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded ml-2">REQUIRED</span>}
                    <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{mod.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-lg font-bold text-[hsl(var(--text-primary))] flex items-center gap-2"><Palette className="w-5 h-5 text-[hsl(var(--accent))]" /> Tenant Branding</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5 uppercase">Primary Brand Color</label>
                  <div className="flex gap-2">
                    <input type="color" defaultValue="#6366f1" className="w-12 h-10 rounded cursor-pointer bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]" />
                    <input type="text" defaultValue="#6366f1" className="flex-1 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl px-4 py-2 text-sm text-[hsl(var(--text-primary))] font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5 uppercase">Logo Upload</label>
                  <div className="border-2 border-dashed border-[hsl(var(--border))] rounded-xl p-6 text-center hover:border-[hsl(var(--accent))] cursor-pointer transition-colors bg-[hsl(var(--bg-tertiary)/0.5)]">
                    <Palette className="w-8 h-8 text-[hsl(var(--text-tertiary))] mx-auto mb-2" />
                    <p className="text-xs text-[hsl(var(--text-secondary))] font-medium">Drag & drop logo file here</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">PNG, SVG up to 2MB</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] p-6 flex items-center justify-center relative overflow-hidden">
                {/* Preview window */}
                <div className="w-full max-w-[250px] bg-white rounded-lg shadow-xl border border-gray-200 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-indigo-500"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="h-2 w-full bg-indigo-500/20 rounded"></div>
                    <div className="h-2 w-3/4 bg-gray-100 rounded"></div>
                    <div className="h-8 w-full bg-indigo-500 rounded text-[10px] text-white flex items-center justify-center font-bold">Login</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-lg font-bold text-[hsl(var(--text-primary))] flex items-center gap-2"><User className="w-5 h-5 text-[hsl(var(--accent))]" /> Initial Admin Setup</h2>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">Create the first super-user for this tenant.</p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5 uppercase">Admin Full Name</label>
                  <input type="text" placeholder="John Doe" className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl px-4 py-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5 uppercase">Admin Email</label>
                  <input type="email" placeholder="admin@organization.com" className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl px-4 py-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5 uppercase">Temporary Password</label>
                <div className="relative">
                  <input type="text" defaultValue="Temp@2026!xK" readOnly className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl px-4 py-3 text-sm text-[hsl(var(--text-primary))] font-mono focus:outline-none" />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[hsl(var(--accent))] font-bold hover:underline">Regenerate</button>
                </div>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1.5">User will be forced to change this password on first login.</p>
              </div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-6 animate-fade-in relative">
            
            {isProvisioning ? (
              <div className="absolute inset-0 bg-[hsl(var(--bg-secondary))] z-10 flex flex-col items-center justify-center space-y-6 py-12 animate-fade-in">
                <div className="w-20 h-20 relative">
                  <svg className="w-full h-full text-[hsl(var(--border))]" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" />
                  </svg>
                  <svg className="w-full h-full text-[hsl(var(--accent))] absolute top-0 left-0 -rotate-90 transition-all duration-200" viewBox="0 0 100 100" strokeDasharray="283" strokeDashoffset={283 - (283 * provisionProgress) / 100}>
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Database className="w-6 h-6 text-[hsl(var(--accent))] animate-pulse" />
                  </div>
                </div>
                
                <div className="text-center space-y-1">
                  <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Provisioning Tenant Infrastructure</h3>
                  <p className="text-xs text-[hsl(var(--text-secondary))] font-mono">
                    {provisionProgress < 30 ? 'Creating database schema [sch_dreamday]...' :
                     provisionProgress < 60 ? 'Applying core templates and feature modules...' :
                     provisionProgress < 90 ? 'Configuring SSO and admin accounts...' : 'Finalizing routing rules...'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-[hsl(var(--text-primary))] flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-[hsl(var(--accent))]" /> Review & Provision</h2>
                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-500 text-xs font-medium flex gap-2">
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  <p>You are about to execute an automated terraform script to provision a new tenant database schema, S3 storage buckets, and DNS subdomains. This action is immutable.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)] space-y-1">
                    <p className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase">Tenant Name</p>
                    <p className="text-sm font-bold text-[hsl(var(--text-primary))]">DreamDay Education Group</p>
                    <p className="text-xs text-[hsl(var(--text-secondary))] font-mono">dreamday.schoolsaas.com</p>
                  </div>
                  <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)] space-y-1">
                    <p className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase">Infrastructure</p>
                    <p className="text-sm font-bold text-[hsl(var(--text-primary))]">Enterprise Tier</p>
                    <p className="text-xs text-[hsl(var(--text-secondary))] font-mono">US East (N. Virginia)</p>
                  </div>
                </div>
              </>
            )}

          </div>
        )}

      </div>

      {/* Footer Controls */}
      <div className="flex justify-between">
        <button 
          onClick={prevStep} 
          disabled={currentStep === 0 || isProvisioning}
          className="px-5 py-2.5 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] font-bold text-sm hover:bg-[hsl(var(--bg-tertiary))] disabled:opacity-30 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        
        {currentStep < steps.length - 1 ? (
          <button 
            onClick={nextStep}
            className="px-6 py-2.5 rounded-xl bg-[hsl(var(--text-primary))] text-[hsl(var(--bg-primary))] font-bold text-sm hover:opacity-90 flex items-center gap-2"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button 
            onClick={handleProvision}
            disabled={isProvisioning}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-2 shadow-glow"
          >
            {isProvisioning ? 'Executing...' : 'Deploy Tenant Infrastructure'}
          </button>
        )}
      </div>

    </div>
  );
}
