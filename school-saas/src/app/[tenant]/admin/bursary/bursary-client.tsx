'use client';

import { useState } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, Clock, CheckCircle2, AlertCircle,
  FileText, Search, Filter, Eye, Printer, ShieldCheck, Download, RefreshCw, X, Check, FileCheck, Layers, Smartphone, Building, Plus
} from 'lucide-react';
import { bursaryVerifyAndClearPayment, bursaryRejectPaymentReceipt, updateBursarySettingsAction } from './actions';

export interface BursaryRecord {
  id: string;
  referenceCode: string;
  name: string;
  grade: string;
  parentName: string;
  parentPhone?: string;
  appliedDate: string;
  stage: string;
  paymentCleared: boolean;
  receiptNumber?: string;
  paymentMethod?: string;
  paymentReceiptUrl?: string;
  paymentPhone?: string;
  transactionId?: string;
}

interface BursaryClientProps {
  serverRecords: BursaryRecord[];
  tenantSlug: string;
  bursarySettings?: any;
}

export default function BursaryClient({ serverRecords, tenantSlug, bursarySettings }: BursaryClientProps) {
  const [records, setRecords] = useState<BursaryRecord[]>(serverRecords);
  const [activeTab, setActiveTab] = useState<'pending' | 'ledger' | 'settings'>('pending');
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  
  // Lightbox & Modal states
  const [selectedDoc, setSelectedDoc] = useState<{ name: string; url: string; record: BursaryRecord } | null>(null);
  const [clearingRecord, setClearingRecord] = useState<BursaryRecord | null>(null);
  const [clearingPaymentMethod, setClearingPaymentMethod] = useState('Cash (In-Person Cash Desk)');
  const [receiptRefInput, setReceiptRefInput] = useState('');
  const [bursarNotesInput, setBursarNotesInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reject Modal
  const [rejectingRecord, setRejectingRecord] = useState<BursaryRecord | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');

  // Official Receipt Print Modal
  const [printingReceiptRecord, setPrintingReceiptRecord] = useState<BursaryRecord | null>(null);

  const defaultFeeItems = [
    { id: '1', name: 'Tuition & Academic Fee', amount: 4500 },
    { id: '2', name: 'Registration & Portal Processing', amount: 500 },
    { id: '3', name: 'Learning Resources & Tech Kit', amount: 800 },
  ];

  // Bursary Configuration Form State
  const [bursaryForm, setBursaryForm] = useState(() => {
    const initial = bursarySettings || {};
    return {
      bankName: initial.bankName || 'Sierra Leone Commercial Bank (SLCB)',
      accountName: initial.accountName || 'Albert Academy Admissions Account',
      accountNumber: initial.accountNumber || '0030010928371',
      mobileProviders: initial.mobileProviders || 'Orange Money / Africell Afrimoney',
      merchantCode: initial.merchantCode || '88912',
      mobileAccountName: initial.mobileAccountName || 'Albert Academy Bursary',
      ussdCode: initial.ussdCode || '*144*3*88912*5800#',
      cashBranch: initial.cashBranch || 'SLCB Freetown Main Branch (Cash Desk 3)',
      currency: initial.currency || 'SLE',
      feeItems: initial.feeItems || defaultFeeItems,
    };
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Dynamic Fee calculation helper
  const feeAmount = (bursaryForm.feeItems || []).reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0);
  const currency = bursaryForm.currency || 'SLE';

  // Statistics
  const pendingRecords = records.filter(r => (r.stage === 'Enrollment' || r.paymentReceiptUrl) && !r.paymentCleared);
  const clearedRecords = records.filter(r => r.paymentCleared);
  
  const totalExpectedRevenue = records.length * feeAmount;
  const totalClearedRevenue = clearedRecords.length * feeAmount;
  const totalPendingRevenue = pendingRecords.length * feeAmount;
  const totalOutstanding = totalExpectedRevenue - totalClearedRevenue;

  // Filtered List for Table
  const filteredList = (activeTab === 'pending' ? pendingRecords : clearedRecords).filter(r => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.referenceCode.toLowerCase().includes(search.toLowerCase()) ||
      (r.transactionId && r.transactionId.toLowerCase().includes(search.toLowerCase())) ||
      (r.paymentPhone && r.paymentPhone.includes(search));
    const matchesMethod = methodFilter === 'all' || r.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const handleVerifyClear = async () => {
    if (!clearingRecord) return;
    setIsSubmitting(true);
    const generatedRef = receiptRefInput || `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const res = await bursaryVerifyAndClearPayment(
      tenantSlug,
      clearingRecord.id,
      generatedRef,
      clearingPaymentMethod,
      bursarNotesInput
    );
    setIsSubmitting(false);

    if (res.success) {
      setRecords(prev => prev.map(r => r.id === clearingRecord.id ? { ...r, paymentCleared: true, receiptNumber: generatedRef, paymentMethod: clearingPaymentMethod } : r));
      setClearingRecord(null);
      setReceiptRefInput('');
      setBursarNotesInput('');
      alert(`Financial clearance approved! Official Receipt Issued: ${generatedRef}`);
    } else {
      alert(res.error || 'Failed to clear payment');
    }
  };

  const handleRejectReceipt = async () => {
    if (!rejectingRecord || !rejectReasonInput) {
      alert('Please provide a reason for rejecting the receipt proof.');
      return;
    }
    setIsSubmitting(true);
    const res = await bursaryRejectPaymentReceipt(tenantSlug, rejectingRecord.id, rejectReasonInput);
    setIsSubmitting(false);

    if (res.success) {
      setRecords(prev => prev.map(r => r.id === rejectingRecord.id ? { ...r, paymentReceiptUrl: undefined, transactionId: undefined, paymentCleared: false } : r));
      setRejectingRecord(null);
      setRejectReasonInput('');
      alert('Payment receipt rejected. Parent notified to re-upload valid proof.');
    } else {
      alert(res.error || 'Failed to reject receipt');
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))]">
              <DollarSign className="w-6 h-6" />
            </div>
            Bursary &amp; Financial Clearance Dashboard
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Audit student tuition payment proofs, reconcile mobile money &amp; bank deposits, issue official receipts, and manage fee schedules.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-[hsl(var(--accent))] text-white border-[hsl(var(--accent))]'
                : 'bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--border))]'
            }`}
          >
            ⚙️ Configure Payment Accounts
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 border-l-4 border-l-emerald-500 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[hsl(var(--text-tertiary))] uppercase">Cleared Revenue</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-400">{currency} {totalClearedRevenue.toLocaleString()}</p>
          <p className="text-xs text-[hsl(var(--text-secondary))]">{clearedRecords.length} Students Financially Cleared</p>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-amber-500 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[hsl(var(--text-tertiary))] uppercase">Pending Verification</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-400">{currency} {totalPendingRevenue.toLocaleString()}</p>
          <p className="text-xs text-[hsl(var(--text-secondary))]">{pendingRecords.length} Receipts Awaiting Audit</p>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-red-500 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[hsl(var(--text-tertiary))] uppercase">Outstanding Balance</span>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-red-400">{currency} {totalOutstanding.toLocaleString()}</p>
          <p className="text-xs text-[hsl(var(--text-secondary))]">Uncollected Tuition Fees</p>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-[hsl(var(--accent))] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[hsl(var(--text-tertiary))] uppercase">Expected Total</span>
            <div className="p-2 rounded-lg bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[hsl(var(--text-primary))]">{currency} {totalExpectedRevenue.toLocaleString()}</p>
          <p className="text-xs text-[hsl(var(--text-secondary))]">{records.length} Total Admissions Candidates</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[hsl(var(--border))] pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]'
          }`}
        >
          <Clock className="w-4 h-4" /> Pending Payment Verification Queue ({pendingRecords.length})
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'ledger'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]'
          }`}
        >
          <FileCheck className="w-4 h-4" /> Verified Financial Ledger ({clearedRecords.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-[hsl(var(--accent)/0.2)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.3)]'
              : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]'
          }`}
        >
          ⚙️ Payment Accounts &amp; Fee Schedule
        </button>
      </div>

      {/* TAB 1 & TAB 2: TABLES */}
      {(activeTab === 'pending' || activeTab === 'ledger') && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 glass-card p-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[hsl(var(--text-tertiary))]" />
              <input
                type="text"
                placeholder="Search name, ref code (APP-XXXX), TxID, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-[hsl(var(--text-tertiary))] font-semibold">Payment Channel:</span>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="h-9 px-2.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-primary))]"
              >
                <option value="all">All Channels</option>
                <option value="Mobile Money">Mobile Money (Orange/Africell)</option>
                <option value="Bank Transfer">Bank Transfer / Teller</option>
                <option value="Cash Deposit">Bank Cash Deposit</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.5)] text-[10px] uppercase font-bold text-[hsl(var(--text-tertiary))] tracking-wider">
                    <th className="px-4 py-3">Student &amp; Ref Code</th>
                    <th className="px-4 py-3">Target Grade</th>
                    <th className="px-4 py-3">Payment Channel</th>
                    <th className="px-4 py-3">Transaction ID / Ref</th>
                    <th className="px-4 py-3">Sender Phone</th>
                    <th className="px-4 py-3">Receipt Slip</th>
                    <th className="px-4 py-3">Fee Amount</th>
                    <th className="px-4 py-3">Bursary Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border)/0.5)] text-xs">
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-[hsl(var(--text-tertiary))]">
                        No financial records found in this view.
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((record) => (
                      <tr key={record.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-bold text-[hsl(var(--text-primary))]">{record.name}</p>
                          <p className="text-[10px] font-mono text-[hsl(var(--accent))]">{record.referenceCode}</p>
                        </td>
                        <td className="px-4 py-3 font-semibold text-[hsl(var(--text-secondary))]">{record.grade}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))]">
                            {record.paymentMethod || 'Bank Transfer'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-cyan-300">
                          {record.transactionId || record.receiptNumber || 'N/A'}
                        </td>
                        <td className="px-4 py-3 font-mono text-[hsl(var(--text-secondary))]">
                          {record.paymentPhone || 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          {record.paymentReceiptUrl ? (
                            <button
                              onClick={() => setSelectedDoc({ name: 'Payment Slip', url: record.paymentReceiptUrl!, record })}
                              className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 font-semibold hover:bg-cyan-500/30 flex items-center gap-1 text-[11px]"
                            >
                              <Eye className="w-3.5 h-3.5" /> Preview Slip
                            </button>
                          ) : (
                            <span className="text-[10px] text-[hsl(var(--text-tertiary))]">No Slip Uploaded</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-[hsl(var(--text-primary))]">
                          {currency} {feeAmount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          {record.paymentCleared ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              ✓ Cleared ({record.receiptNumber})
                            </span>
                          ) : record.paymentReceiptUrl ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              ⏳ Receipt Uploaded
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30">
                              Unpaid
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {record.paymentCleared ? (
                              <button
                                onClick={() => setPrintingReceiptRecord(record)}
                                className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-500 flex items-center gap-1"
                              >
                                <Printer className="w-3.5 h-3.5" /> Official Receipt
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setClearingRecord(record);
                                    setClearingPaymentMethod(record.paymentMethod || 'Cash (In-Person Cash Desk)');
                                    setReceiptRefInput(`REC-2026-${Math.floor(1000 + Math.random() * 9000)}`);
                                  }}
                                  className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-500 flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" /> Clear Payment
                                </button>
                                {record.paymentReceiptUrl && (
                                  <button
                                    onClick={() => setRejectingRecord(record)}
                                    className="px-2 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-semibold hover:bg-red-500/30 text-[11px]"
                                  >
                                    Reject
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BURSARY PAYMENT ACCOUNTS CONFIGURATION */}
      {activeTab === 'settings' && (
        <div className="glass-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-[hsl(var(--border))] pb-3">
            <h3 className="text-lg font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[hsl(var(--accent))]" /> Configure Bursary Payment Accounts &amp; Fee Schedule
            </h3>
            <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">
              Customize your institution&apos;s bank accounts, mobile money merchant codes, USSD quick dial strings, and fee schedule amounts.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
            {/* Left Column: Bank Accounts, Mobile Money & Cash Desk */}
            <div className="space-y-5">
              {/* Bank Accounts Section */}
              <div className="p-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] space-y-3">
                <h4 className="font-bold text-[hsl(var(--text-primary))] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  🏛️ Bank Transfer Account Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={bursaryForm.bankName}
                      onChange={(e) => setBursaryForm({ ...bursaryForm, bankName: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-primary))]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Account Number</label>
                    <input
                      type="text"
                      value={bursaryForm.accountNumber}
                      onChange={(e) => setBursaryForm({ ...bursaryForm, accountNumber: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-mono font-bold text-[hsl(var(--text-primary))]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Account Name / Title</label>
                    <input
                      type="text"
                      value={bursaryForm.accountName}
                      onChange={(e) => setBursaryForm({ ...bursaryForm, accountName: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-primary))]"
                    />
                  </div>
                </div>
              </div>

              {/* Mobile Money Section */}
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-3">
                <h4 className="font-bold text-cyan-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  📱 Mobile Money Merchant Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Mobile Providers</label>
                    <input
                      type="text"
                      value={bursaryForm.mobileProviders}
                      onChange={(e) => setBursaryForm({ ...bursaryForm, mobileProviders: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-primary))]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Merchant Code / Till ID</label>
                    <input
                      type="text"
                      value={bursaryForm.merchantCode}
                      onChange={(e) => setBursaryForm({ ...bursaryForm, merchantCode: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-mono font-bold text-cyan-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">Mobile Account Name</label>
                    <input
                      type="text"
                      value={bursaryForm.mobileAccountName}
                      onChange={(e) => setBursaryForm({ ...bursaryForm, mobileAccountName: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-primary))]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">USSD Quick Dial Code (*144*3*88912*5800#)</label>
                    <input
                      type="text"
                      value={bursaryForm.ussdCode}
                      onChange={(e) => setBursaryForm({ ...bursaryForm, ussdCode: e.target.value })}
                      placeholder="e.g. *144*3*88912*5800#"
                      className="w-full h-9 px-2.5 rounded-lg bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-mono font-bold text-emerald-400"
                    />
                  </div>
                </div>
              </div>

              {/* Cash Deposit Location Section */}
              <div className="p-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] space-y-2">
                <h4 className="font-bold text-[hsl(var(--text-primary))] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  🏢 Bank Cash Desk Location
                </h4>
                <input
                  type="text"
                  value={bursaryForm.cashBranch}
                  onChange={(e) => setBursaryForm({ ...bursaryForm, cashBranch: e.target.value })}
                  placeholder="e.g. SLCB Freetown Main Branch (Cash Desk 3)"
                  className="w-full h-9 px-2.5 rounded-lg bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-primary))]"
                />
              </div>
            </div>

            {/* Right Column: Dynamic Itemized Fee Invoice Configuration */}
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-4 h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        🧾 Dynamic Itemized Fee Invoice Configuration
                      </h4>
                      <p className="text-[11px] text-emerald-200/80 mt-0.5">
                        Configure custom fee line items displayed on the parent portal invoice and official receipts.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newItem = { id: Date.now().toString(), name: 'New Fee Line Item', amount: 0 };
                        setBursaryForm({ ...bursaryForm, feeItems: [...(bursaryForm.feeItems || []), newItem] });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Fee Line Item
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {(bursaryForm.feeItems || []).map((item: any, index: number) => (
                      <div key={item.id || index} className="flex items-center gap-3 p-2.5 rounded-lg bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))]">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            const updated = [...(bursaryForm.feeItems || [])];
                            updated[index].name = e.target.value;
                            setBursaryForm({ ...bursaryForm, feeItems: updated });
                          }}
                          placeholder="Fee Description / Name"
                          className="flex-1 h-8 px-2.5 rounded bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-primary))]"
                        />
                        <div className="flex items-center gap-1.5 w-36">
                          <span className="text-xs font-bold text-[hsl(var(--text-tertiary))]">{bursaryForm.currency}</span>
                          <input
                            type="number"
                            value={item.amount}
                            onChange={(e) => {
                              const updated = [...(bursaryForm.feeItems || [])];
                              updated[index].amount = Number(e.target.value);
                              setBursaryForm({ ...bursaryForm, feeItems: updated });
                            }}
                            placeholder="0"
                            className="w-full h-8 px-2 rounded bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (bursaryForm.feeItems || []).filter((_: any, i: number) => i !== index);
                            setBursaryForm({ ...bursaryForm, feeItems: updated });
                          }}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                          title="Remove Item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-emerald-500/20 flex justify-between items-center text-xs font-bold text-emerald-300 px-1">
                  <span>Total Aggregate Fee Payable:</span>
                  <span className="font-mono text-sm">{bursaryForm.currency} {feeAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-[hsl(var(--border))]">
            <button
              onClick={async () => {
                setIsSavingSettings(true);
                const res = await updateBursarySettingsAction(tenantSlug, bursaryForm);
                setIsSavingSettings(false);
                if (res.success) {
                  alert('Bursary Payment Accounts & Fee Schedule updated successfully!');
                } else {
                  alert(res.error || 'Failed to update settings');
                }
              }}
              disabled={isSavingSettings}
              className="px-6 py-2.5 rounded-xl bg-[hsl(var(--accent))] text-white font-bold text-xs hover:bg-[hsl(var(--accent-hover))] transition-colors disabled:opacity-50"
            >
              {isSavingSettings ? 'Saving Settings...' : 'Save Bursary Configuration'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL 1: RECEIPT SLIP LIGHTBOX */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card max-w-2xl w-full p-6 space-y-4 border border-[hsl(var(--border))] max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <div>
                <h3 className="font-bold text-sm text-[hsl(var(--text-primary))]">
                  Proof of Payment Slip — {selectedDoc.record.name}
                </h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] font-mono">
                  Ref: {selectedDoc.record.referenceCode} | Channel: {selectedDoc.record.paymentMethod || 'Bank Transfer'}
                </p>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="p-1 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex items-center justify-center bg-black/40 rounded-xl p-4 min-h-[300px]">
              {selectedDoc.url.startsWith('data:image/') || selectedDoc.url.includes('http') ? (
                <img src={selectedDoc.url} alt="Receipt Slip" className="max-h-[60vh] max-w-full rounded-lg object-contain" />
              ) : (
                <iframe src={selectedDoc.url} title="Receipt PDF" className="w-full h-[50vh] rounded-lg" />
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[hsl(var(--border))] text-xs">
              <div className="font-mono text-[hsl(var(--text-secondary))] space-y-0.5">
                <p>TxID: <strong className="text-cyan-300">{selectedDoc.record.transactionId || 'N/A'}</strong></p>
                <p>Sender Phone: <strong className="text-[hsl(var(--text-primary))]">{selectedDoc.record.paymentPhone || 'N/A'}</strong></p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-primary))]"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CLEAR PAYMENT MODAL */}
      {clearingRecord && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card max-w-md w-full p-6 space-y-4 border border-[hsl(var(--border))]">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <h3 className="font-bold text-sm text-[hsl(var(--text-primary))] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Confirm Bursary Financial Clearance
              </h3>
              <button onClick={() => setClearingRecord(null)} className="p-1 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
              <p>Candidate: <strong>{clearingRecord.name}</strong> ({clearingRecord.grade})</p>
              <p>Reference Code: <strong>{clearingRecord.referenceCode}</strong></p>
              <p>Channel: <strong>{clearingRecord.paymentMethod || 'Bank Transfer'}</strong> | TxID: <strong>{clearingRecord.transactionId || 'N/A'}</strong></p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1">
                  Payment Collection Channel *
                </label>
                <select
                  value={clearingPaymentMethod}
                  onChange={(e) => setClearingPaymentMethod(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-primary))]"
                >
                  <option value="Cash (In-Person Cash Desk)">💵 Cash (In-Person Cash Desk)</option>
                  <option value="Bank Transfer">🏛️ Bank Transfer / Teller</option>
                  <option value="Mobile Money">📱 Mobile Money (Orange/Africell)</option>
                  <option value="Cash Deposit">🏢 Bank Cash Deposit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1">
                  Official Receipt Reference Number *
                </label>
                <input
                  type="text"
                  value={receiptRefInput}
                  onChange={(e) => setReceiptRefInput(e.target.value)}
                  placeholder="e.g. REC-2026-9812"
                  className="w-full h-9 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-mono font-bold text-[hsl(var(--text-primary))]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1">
                  Bursar Audit Notes / Remarks
                </label>
                <textarea
                  value={bursarNotesInput}
                  onChange={(e) => setBursarNotesInput(e.target.value)}
                  placeholder="e.g. Verified deposit with SLCB bank statement on Jul 22..."
                  className="w-full min-h-[70px] p-2.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[hsl(var(--border))]">
              <button
                onClick={() => setClearingRecord(null)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-secondary))]"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyClear}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Clearing...' : 'Approve & Issue Official Receipt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REJECT RECEIPT MODAL */}
      {rejectingRecord && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card max-w-md w-full p-6 space-y-4 border border-[hsl(var(--border))]">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <h3 className="font-bold text-sm text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Reject Payment Proof
              </h3>
              <button onClick={() => setRejectingRecord(null)} className="p-1 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[hsl(var(--text-secondary))]">
              Provide a reason for rejecting the receipt slip uploaded for candidate <strong>{rejectingRecord.name}</strong>. The parent will be requested to upload a clear scan or valid TxID.
            </p>

            <textarea
              value={rejectReasonInput}
              onChange={(e) => setRejectReasonInput(e.target.value)}
              placeholder="e.g. Deposit slip image is blurry / TxID could not be verified on bank portal..."
              className="w-full min-h-[90px] p-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))]"
            />

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[hsl(var(--border))]">
              <button
                onClick={() => setRejectingRecord(null)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-secondary))]"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectReceipt}
                disabled={isSubmitting || !rejectReasonInput}
                className="px-5 py-2 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: OFFICIAL PRINTABLE BURSARY RECEIPT PDF */}
      {printingReceiptRecord && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card max-w-xl w-full p-8 space-y-6 border border-[hsl(var(--border))] max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-emerald-500 pb-4">
              <div>
                <h2 className="text-lg font-bold text-[hsl(var(--text-primary))]">OFFICIAL BURSARY RECEIPT</h2>
                <p className="text-xs text-[hsl(var(--text-secondary))] font-medium">Albert Academy — Bursary &amp; Finance Office</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs border border-emerald-500/30">
                  {printingReceiptRecord.receiptNumber || 'REC-2026-9812'}
                </span>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Candidate & Payment Details */}
            <div className="grid grid-cols-2 gap-4 text-xs p-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]">
              <div>
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-semibold block">Student Name</span>
                <p className="font-bold text-[hsl(var(--text-primary))]">{printingReceiptRecord.name}</p>
              </div>
              <div>
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-semibold block">Target Grade</span>
                <p className="font-bold text-[hsl(var(--text-primary))]">{printingReceiptRecord.grade}</p>
              </div>
              <div>
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-semibold block">Reference Code</span>
                <p className="font-bold text-[hsl(var(--accent))] font-mono">{printingReceiptRecord.referenceCode}</p>
              </div>
              <div>
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-semibold block">Payment Channel</span>
                <p className="font-bold text-[hsl(var(--text-primary))]">{printingReceiptRecord.paymentMethod || 'Bank Transfer'}</p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-[hsl(var(--text-primary))] uppercase text-[11px]">Itemized Fee Settlement</h4>
              <div className="border border-[hsl(var(--border))] rounded-xl overflow-hidden divide-y divide-[hsl(var(--border))]">
                {(bursaryForm.feeItems || defaultFeeItems).map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between p-2.5 bg-[hsl(var(--bg-tertiary))]">
                    <span>{item.name}</span>
                    <span className="font-mono font-bold">{currency} {(Number(item.amount) || 0).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between p-3 bg-emerald-500/10 text-emerald-400 font-bold text-sm">
                  <span>Total Amount Paid &amp; Cleared</span>
                  <span className="font-mono">{currency} {feeAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Stamp of Clearance */}
            <div className="flex items-center justify-between pt-4 border-t border-[hsl(var(--border))]">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <ShieldCheck className="w-5 h-5" /> Official Institution Financial Clearance Verified
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPrintingReceiptRecord(null)}
                  className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-secondary))]"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print / Save PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
