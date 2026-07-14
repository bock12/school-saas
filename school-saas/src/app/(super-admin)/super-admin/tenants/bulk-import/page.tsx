'use client';

import React, { useState, useRef, useMemo } from 'react';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { hierarchyApi } from '@/features/tenant-management/api/hierarchy.api';
import Papa from 'papaparse';
import { UploadCloud, CheckCircle2, AlertCircle, Play, Server, ArrowLeft, Loader2, Info, RefreshCw, X, Download } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SubscriptionPlan } from '@/features/tenant-management/types/hierarchy';

interface ParsedSchool {
  id: string; // temp id
  name: string;
  slug: string;
  schoolType: string;
  adminName: string;
  adminEmail: string;
  plan: SubscriptionPlan;
  status: 'pending' | 'success' | 'error';
  errorMessage?: string;
  _rowNum: number;
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

const DEFAULT_PLAN: SubscriptionPlan = 'starter';

function BulkImportSchoolsContent() {
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(DEFAULT_PLAN);
  
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedSchool[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: orgs = [], isLoading: orgsLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: hierarchyApi.getOrganizations,
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setIsParsing(true);
    setParseError(null);
    setParsedData([]);

    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setIsParsing(false);
        if (results.errors && results.errors.length > 0) {
          setParseError(`CSV Parsing Error on line ${results.errors[0].row}: ${results.errors[0].message}`);
          return;
        }

        const mapped: ParsedSchool[] = results.data.map((row: any, i) => {
          // Flexible header matching
          const name = row['School Name'] || row['Name'] || row['school_name'] || '';
          const slug = row['Slug'] || row['slug'] || row['Subdomain'] || '';
          const type = row['School Type'] || row['Type'] || row['type'] || 'Primary';
          const aName = row['Admin Name'] || row['admin_name'] || '';
          const aEmail = row['Admin Email'] || row['admin_email'] || row['Email'] || '';
          const planStr = (row['Plan'] || row['plan'] || '').toLowerCase();
          
          let plan = selectedPlan;
          if (['trial', 'starter', 'pro', 'enterprise'].includes(planStr)) {
            plan = planStr as SubscriptionPlan;
          }

          let errorMsg = undefined;
          if (!name) errorMsg = 'Missing School Name';
          else if (!slug) errorMsg = 'Missing Slug';
          else if (!/^[a-z0-9-]+$/.test(slug)) errorMsg = 'Invalid Slug Format';
          else if (!aName) errorMsg = 'Missing Admin Name';
          else if (!aEmail || !aEmail.includes('@')) errorMsg = 'Invalid Admin Email';

          return {
            id: `row_${i}`,
            _rowNum: i + 2,
            name: name.trim(),
            slug: slug.trim().toLowerCase(),
            schoolType: type.trim(),
            adminName: aName.trim(),
            adminEmail: aEmail.trim().toLowerCase(),
            plan,
            status: errorMsg ? 'error' : 'pending',
            errorMessage: errorMsg,
          };
        });

        setParsedData(mapped);
      },
      error: (error) => {
        setIsParsing(false);
        setParseError(`File read error: ${error.message}`);
      }
    });
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,School Name,Slug,School Type,Admin Name,Admin Email,Plan\nLincoln High,lincoln,High School,John Doe,john@lincoln.edu,starter\nWashington Prep,washington,Primary,Jane Smith,jane@washington.edu,pro";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "school_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStartImport = async () => {
    if (!selectedParentId) {
      alert('Please select a parent organization first.');
      return;
    }

    const validSchools = parsedData.filter(d => d.status !== 'error' && d.status !== 'success');
    if (validSchools.length === 0) return;

    setIsImporting(true);
    setImportProgress({ current: 0, total: validSchools.length, success: 0, failed: 0 });

    const newData = [...parsedData];

    for (let i = 0; i < validSchools.length; i++) {
      const school = validSchools[i];
      const indexInData = newData.findIndex(d => d.id === school.id);
      
      try {
        await hierarchyApi.createNode({
          name: school.name,
          slug: school.slug,
          type: 'tenant', // It's a school, which is a tenant node
          parentId: selectedParentId,
          schoolType: school.schoolType,
          plan: school.plan,
          modules: ['core'],
          adminName: school.adminName,
          adminEmail: school.adminEmail,
        });

        newData[indexInData] = { ...school, status: 'success', errorMessage: undefined };
        setImportProgress(prev => ({ ...prev, current: i + 1, success: prev.success + 1 }));
      } catch (err: any) {
        newData[indexInData] = { ...school, status: 'error', errorMessage: err.message || 'API Error' };
        setImportProgress(prev => ({ ...prev, current: i + 1, failed: prev.failed + 1 }));
      }
      
      // Update state so UI reflects each row progressing
      setParsedData([...newData]);
    }

    setIsImporting(false);
  };

  const validCount = parsedData.filter(d => d.status !== 'error' && d.status !== 'success').length;
  const errorCount = parsedData.filter(d => d.status === 'error').length;
  const successCount = parsedData.filter(d => d.status === 'success').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fade-in px-4 sm:px-0">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))] tracking-tight">Bulk Import Schools</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Provision multiple schools under an organization from a CSV file.
          </p>
        </div>
        <Link 
          href="/super-admin/tenants/directory"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Directory
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Config & Upload */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-sm font-bold text-[hsl(var(--text-primary))] mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] flex items-center justify-center text-xs">1</span>
              Configuration
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1.5">
                  Parent Organization <span className="text-[hsl(var(--accent))]">*</span>
                </label>
                <select
                  value={selectedParentId}
                  onChange={e => setSelectedParentId(e.target.value)}
                  disabled={isImporting}
                  className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors disabled:opacity-50"
                >
                  <option value="">-- Select Organization --</option>
                  {orgs.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
                {orgsLoading && <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1 animate-pulse">Loading organizations...</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1.5">
                  Default Plan
                </label>
                <select
                  value={selectedPlan}
                  onChange={e => setSelectedPlan(e.target.value as SubscriptionPlan)}
                  disabled={isImporting}
                  className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors disabled:opacity-50"
                >
                  <option value="trial">Trial</option>
                  <option value="starter">Starter</option>
                  <option value="pro">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">Used if the CSV row does not specify a valid plan.</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] flex items-center justify-center text-xs">2</span>
                Upload CSV
              </h2>
              <button 
                onClick={downloadTemplate}
                className="text-[10px] font-bold text-[hsl(var(--accent))] hover:underline flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> Template
              </button>
            </div>

            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              disabled={isImporting}
            />

            <div 
              onClick={() => !isImporting && fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-colors text-center cursor-pointer",
                file 
                  ? "border-[hsl(var(--accent)/0.5)] bg-[hsl(var(--accent)/0.05)]" 
                  : "border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.5)] hover:bg-[hsl(var(--bg-tertiary))]",
                isImporting && "opacity-50 cursor-not-allowed pointer-events-none"
              )}
            >
              {isParsing ? (
                <Loader2 className="w-8 h-8 text-[hsl(var(--accent))] animate-spin" />
              ) : file ? (
                <>
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  <div>
                    <p className="text-sm font-bold text-[hsl(var(--text-primary))]">{file.name}</p>
                    <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </>
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 text-[hsl(var(--text-tertiary))]" />
                  <div>
                    <p className="text-sm font-bold text-[hsl(var(--text-primary))]">Click to upload CSV</p>
                    <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">Required: Name, Slug, Type, Admin Name, Email</p>
                  </div>
                </>
              )}
            </div>

            {parseError && (
              <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{parseError}</p>
              </div>
            )}
          </div>

          <div className="glass-card p-6">
            <h2 className="text-sm font-bold text-[hsl(var(--text-primary))] mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] flex items-center justify-center text-xs">3</span>
              Provision
            </h2>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-xs">
                <span className="text-[hsl(var(--text-tertiary))]">Valid Rows</span>
                <span className="font-bold text-[hsl(var(--text-primary))]">{validCount}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[hsl(var(--text-tertiary))]">Errors</span>
                <span className="font-bold text-red-400">{errorCount}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[hsl(var(--text-tertiary))]">Successfully Provisioned</span>
                <span className="font-bold text-emerald-400">{successCount}</span>
              </div>
            </div>

            {isImporting && importProgress.total > 0 && (
              <div className="mb-5 space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">
                  <span>Progress</span>
                  <span>{importProgress.current} / {importProgress.total}</span>
                </div>
                <div className="h-1.5 w-full bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[hsl(var(--accent))] transition-all duration-300" 
                    style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleStartImport}
              disabled={isImporting || validCount === 0 || !selectedParentId}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              {isImporting ? 'Provisioning...' : 'Start Import'}
            </button>
            {!selectedParentId && parsedData.length > 0 && (
              <p className="text-[10px] text-center text-amber-500 mt-2">Select an organization above to start.</p>
            )}
          </div>
        </div>

        {/* Right Column: Preview Table */}
        <div className="lg:col-span-2 glass-card flex flex-col min-h-[600px] max-h-[800px] overflow-hidden">
          <div className="px-5 py-4 border-b border-[hsl(var(--border))] flex items-center justify-between flex-shrink-0">
            <h2 className="text-sm font-bold text-[hsl(var(--text-primary))]">Data Preview</h2>
            {parsedData.length > 0 && (
              <span className="text-xs font-mono text-[hsl(var(--text-tertiary))]">{parsedData.length} rows</span>
            )}
          </div>
          
          <div className="flex-1 overflow-auto bg-[hsl(var(--bg-tertiary)/0.3)]">
            {parsedData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[hsl(var(--text-tertiary))] gap-2 p-8">
                <Server className="w-8 h-8 opacity-20" />
                <p className="text-sm">Upload a CSV to see preview</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[hsl(var(--bg-primary))] border-b border-[hsl(var(--border))] z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider whitespace-nowrap">Row</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider min-w-[150px]">School</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Slug</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider min-w-[150px]">Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
                  {parsedData.map((row) => (
                    <tr key={row.id} className={cn(
                      "group transition-colors",
                      row.status === 'error' ? 'bg-red-500/5' : 
                      row.status === 'success' ? 'bg-emerald-500/5' : 
                      'hover:bg-[hsl(var(--bg-tertiary))]'
                    )}>
                      <td className="px-4 py-3 text-xs text-[hsl(var(--text-tertiary))] font-mono">{row._rowNum}</td>
                      <td className="px-4 py-3">
                        {row.status === 'error' ? (
                          <div className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
                            <X className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[100px]" title={row.errorMessage}>{row.errorMessage}</span>
                          </div>
                        ) : row.status === 'success' ? (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Done</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-secondary))] font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--text-tertiary))]" />
                            <span>Ready</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-bold text-[hsl(var(--text-primary))]">{row.name}</p>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{row.schoolType} • {row.plan}</p>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-[hsl(var(--text-secondary))]">
                        {row.slug}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-[hsl(var(--text-primary))]">{row.adminName}</p>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{row.adminEmail}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BulkImportSchoolsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <BulkImportSchoolsContent />
    </QueryClientProvider>
  );
}
