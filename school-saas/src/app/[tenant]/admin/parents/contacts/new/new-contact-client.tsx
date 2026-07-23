'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, User, Phone, Mail, MapPin, Search } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { createParent } from '../../actions';

export function NewContactClient({ tenant, students }: { tenant: string, students: any[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactType, setContactType] = useState('Parent');
  const [search, setSearch] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [relationships, setRelationships] = useState<Record<string, string>>({});

  const filteredStudents = students.filter(s => 
    (s.first_name + ' ' + s.last_name).toLowerCase().includes(search.toLowerCase()) ||
    (s.admission_number || '').toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    formData.append('studentIds', JSON.stringify(selectedStudents));
    formData.append('relationships', JSON.stringify(relationships));

    try {
      await createParent(tenant, formData);
      router.push(`/${tenant}/admin/parents/contacts`);
    } catch (error) {
      console.error(error);
      alert('Failed to create parent.');
      setIsSubmitting(false);
    }
  };

  const toggleStudent = (id: string) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(prev => prev.filter(s => s !== id));
      const newRels = { ...relationships };
      delete newRels[id];
      setRelationships(newRels);
    } else {
      setSelectedStudents(prev => [...prev, id]);
      setRelationships(prev => ({ ...prev, [id]: contactType }));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div className="flex items-center gap-4">
        <Link 
          href={`/${tenant}/admin/parents/contacts`}
          className="p-2 rounded-lg bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Add New Contact</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Register a new parent, guardian, or sponsor in the directory.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card p-6">
          <h2 className="text-base font-bold text-[hsl(var(--text-primary))] mb-4 border-b border-[hsl(var(--border))] pb-2">Contact Classification</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {['Parent', 'Guardian', 'Sponsor', 'Other'].map(type => (
              <label 
                key={type}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all",
                  contactType === type 
                    ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--text-primary))]" 
                    : "border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-elevated))]"
                )}
              >
                <input 
                  type="radio" 
                  name="contactType" 
                  value={type} 
                  checked={contactType === type}
                  onChange={(e) => setContactType(e.target.value)}
                  className="hidden"
                />
                <div className={cn(
                  "w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0",
                  contactType === type ? "border-[hsl(var(--accent))]" : "border-[hsl(var(--text-tertiary))]"
                )}>
                  {contactType === type && <div className="w-2 h-2 rounded-full bg-[hsl(var(--accent))]" />}
                </div>
                <span className="text-sm font-semibold">{type}</span>
              </label>
            ))}
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-3 p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))] cursor-pointer hover:bg-[hsl(var(--bg-elevated))] transition-colors">
              <input type="checkbox" className="mt-1 w-4 h-4 rounded border-[hsl(var(--border))] text-[hsl(var(--accent))]" defaultChecked />
              <div>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">Grant Portal Access</p>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">Allow this contact to log in and view student information.</p>
              </div>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-start gap-3 p-3 rounded-lg border border-rose-500/20 bg-rose-500/5 cursor-pointer hover:bg-rose-500/10 transition-colors">
                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-rose-500/50 text-rose-500" defaultChecked={contactType === 'Parent'} />
                <div>
                  <p className="text-sm font-semibold text-rose-500">Emergency Contact</p>
                  <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">Authorized to be contacted during emergencies.</p>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 cursor-pointer hover:bg-emerald-500/10 transition-colors">
                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-emerald-500/50 text-emerald-500" defaultChecked={contactType === 'Sponsor' || contactType === 'Parent'} />
                <div>
                  <p className="text-sm font-semibold text-emerald-500">Financial Sponsor</p>
                  <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">Responsible for paying student tuition and fees.</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-base font-bold text-[hsl(var(--text-primary))] mb-4 border-b border-[hsl(var(--border))] pb-2">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
                <input type="text" name="firstName" required placeholder={contactType === 'Sponsor' ? "Organization Name" : "John"} className="w-full h-10 pl-9 pr-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Last Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
                <input type="text" name="lastName" required placeholder={contactType === 'Sponsor' ? "Department" : "Doe"} className="w-full h-10 pl-9 pr-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" />
              </div>
            </div>
            {contactType !== 'Sponsor' && (
              <div>
                <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Occupation / Employer</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
                  <input type="text" name="occupation" placeholder="Software Engineer at Acme Corp" className="w-full h-10 pl-9 pr-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" />
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
                <input type="email" name="email" required placeholder="contact@example.com" className="w-full h-10 pl-9 pr-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
                <input type="tel" name="phone" required placeholder="+1 (555) 000-0000" className="w-full h-10 pl-9 pr-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Physical Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
                <textarea name="address" rows={3} placeholder="Full residential or office address..." className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:border-[hsl(var(--accent))] transition-colors resize-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-base font-bold text-[hsl(var(--text-primary))] mb-4 border-b border-[hsl(var(--border))] pb-2">Link Students</h2>
          <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">Search and select students to link to this contact.</p>
          <div className="relative max-w-md mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
            <input 
              type="text" 
              placeholder="Search students by name or ID..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" 
            />
          </div>

          {search && (
            <div className="mb-4 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg overflow-hidden">
              {filteredStudents.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--bg-elevated))]">
                  <div>
                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{s.first_name} {s.last_name}</p>
                    <p className="text-xs text-[hsl(var(--text-tertiary))]">{s.admission_number || 'No ID'}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => toggleStudent(s.id)}
                    className={cn("px-3 py-1 rounded text-xs font-semibold", selectedStudents.includes(s.id) ? "bg-rose-500/10 text-rose-500" : "bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))]")}
                  >
                    {selectedStudents.includes(s.id) ? 'Remove' : 'Add'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedStudents.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-[hsl(var(--border))] text-center text-sm text-[hsl(var(--text-tertiary))]">
              No students selected yet.
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-[hsl(var(--text-primary))] uppercase tracking-wider">Selected Students</p>
              {selectedStudents.map(id => {
                const s = students.find(x => x.id === id);
                if (!s) return null;
                return (
                  <div key={id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))]">
                    <div>
                      <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{s.first_name} {s.last_name}</p>
                      <p className="text-xs text-[hsl(var(--text-tertiary))]">{s.admission_number}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select 
                        value={relationships[id] || 'Parent'}
                        onChange={(e) => setRelationships(prev => ({...prev, [id]: e.target.value}))}
                        className="h-8 px-2 rounded-lg bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border))] text-xs focus:outline-none"
                      >
                        <option>Father</option>
                        <option>Mother</option>
                        <option>Guardian</option>
                        <option>Sponsor</option>
                        <option>Other</option>
                      </select>
                      <button 
                        type="button"
                        onClick={() => toggleStudent(id)}
                        className="text-xs text-rose-400 font-medium px-2 py-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[hsl(var(--border))]">
          <Link href={`/${tenant}/admin/parents/contacts`} className="px-5 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Contact Record'}
          </button>
        </div>
      </form>
    </div>
  );
}
