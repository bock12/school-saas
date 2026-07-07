'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Package, Plus, Search, AlertTriangle, TrendingDown, Wrench, Truck, Shield,
  Layers, Brain, Zap, Link2, Download, History, Settings, Save, Sparkles, Check,
  Play, Upload, QrCode, ShieldCheck, UserCheck, Trash2, Key, Clock, Landmark, Laptop, Video,
  Trophy, CheckCircle2, ChevronRight, Menu, HelpCircle, Eye, FileText, ShoppingCart, BarChart3,
  DollarSign, RefreshCw, Archive, Users
} from 'lucide-react';

type InventoryTab =
  | 'overview'
  | 'purchase-requests'
  | 'purchase-orders'
  | 'goods-received'
  | 'suppliers'
  | 'inventory'
  | 'warehouses'
  | 'movements'
  | 'assets'
  | 'assignments'
  | 'maintenance'
  | 'depreciation'
  | 'disposal'
  | 'reports'
  | 'settings';

export default function InventoryManagementPage() {
  const params = useParams();
  const tenant = params.tenant as string;
  const [activeTab, setActiveTab] = useState<InventoryTab>('overview');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // States for procurement items
  const [purchaseRequests, setPurchaseRequests] = useState([
    { id: 'PR-901', item: 'A4 Printing Paper (50 reams)', dept: 'Administration', cost: '₦125,000', status: 'Pending Approval', date: '2026-07-07' },
    { id: 'PR-900', item: 'Laboratory Chemical Kit B', dept: 'Science Lab', cost: '₦380,000', status: 'Approved', date: '2026-07-06' }
  ]);

  const [purchaseOrders, setPurchaseOrders] = useState([
    { id: 'PO-8820', vendor: 'Academic Supplies Ltd', total: '₦720,000', delivery: '2026-07-15', status: 'Sent to Vendor' },
    { id: 'PO-8819', vendor: 'Global Office Technologies', total: '₦1,450,000', delivery: '2026-07-12', status: 'Fully Received' }
  ]);

  const [stockItems, setStockItems] = useState([
    { code: 'SKU-A4-PAP', name: 'A4 Printer Paper Reams', category: 'Stationery', qty: 20, min: 25, reorder: 30, warehouse: 'Main Store', cost: '₦2,500', status: 'low' },
    { code: 'SKU-CHEM-HCL', name: 'Hydrochloric Acid 1L', category: 'Science Lab', qty: 15, min: 5, reorder: 10, warehouse: 'Science Store', cost: '₦8,200', status: 'ok' },
    { code: 'SKU-INK-HP85', name: 'HP LaserJet Ink Black', category: 'Office Supplies', qty: 2, min: 5, reorder: 8, warehouse: 'ICT Store', cost: '₦18,500', status: 'critical' },
  ]);

  const [warehouses, setWarehouses] = useState([
    { name: 'Main Store', manager: 'Bursar Assistant', value: '₦4,200,000', alerts: 2 },
    { name: 'ICT Store', manager: 'ICT Assistant', value: '₦22,400,000', alerts: 1 },
    { name: 'Science Store', manager: 'Lab Technician', value: '₦8,150,000', alerts: 0 },
    { name: 'Sports Store', manager: 'P.E. Coach', value: '₦1,800,000', alerts: 0 },
    { name: 'Medical Store', manager: 'School Nurse', value: '₦1,200,000', alerts: 0 }
  ]);

  const [suppliers, setSuppliers] = useState([
    { id: 'SPL-101', name: 'Academic Supplies Ltd', contact: 'Musa Bello', phone: '+2348031122334', rating: '4.8/5.0', outstanding: '₦0' },
    { id: 'SPL-102', name: 'Global Office Technologies', contact: 'Chidi Okafor', phone: '+2348092233445', rating: '4.2/5.0', outstanding: '₦1,450,000' }
  ]);

  const [fixedAssets, setFixedAssets] = useState([
    { num: 'AST-FIX-001', name: 'School Bus (35 Seater Toyota)', cost: '₦35,000,000', value: '₦28,000,000', depreciation: 'Straight-line (7yr life)', condition: 'Good' },
    { num: 'AST-FIX-002', name: 'ICT Lab AC Units (x4)', cost: '₦1,800,000', value: '₦1,260,000', depreciation: 'Straight-line (5yr life)', condition: 'Excellent' },
  ]);

  const [disposalRequests, setDisposalRequests] = useState([
    { num: 'AST-FIX-091', name: 'Dell Projector Model 2018', reason: 'Lamp bulb exploded twice, outdated model', value: '₦15,000 (Scrap)', status: 'Awaiting Board Approval' }
  ]);

  const handleAction = (action: string) => {
    setSaving(true);
    setSavedMessage(null);
    setTimeout(() => {
      setSaving(false);
      setSavedMessage(`Action "${action}" completed successfully.`);
      setTimeout(() => setSavedMessage(null), 3000);
    }, 800);
  };

  const menuItems = [
    { id: 'overview', label: 'Inventory Dashboard', icon: Package },
    { id: 'purchase-requests', label: 'Purchase Requests', icon: ShoppingCart },
    { id: 'purchase-orders', label: 'Purchase Orders', icon: FileText },
    { id: 'goods-received', label: 'Goods Received Logs', icon: CheckCircle2 },
    { id: 'suppliers', label: 'Suppliers Profiles', icon: Users },
    { id: 'inventory', label: 'Consumable Stock', icon: Package },
    { id: 'warehouses', label: 'Warehouses / Stores', icon: Landmark },
    { id: 'movements', label: 'Stock Movements', icon: RefreshCw },
    { id: 'assets', label: 'Fixed Assets Registry', icon: Laptop },
    { id: 'assignments', label: 'Asset Assignments', icon: UserCheck },
    { id: 'maintenance', label: 'Preventive Maintenance', icon: Wrench },
    { id: 'depreciation', label: 'Depreciation Scheduler', icon: TrendingDown },
    { id: 'disposal', label: 'Disposal Register', icon: Archive },
    { id: 'reports', label: 'Procurement Reports', icon: BarChart3 },
    { id: 'settings', label: 'Inventory Settings', icon: Save }
  ];

  return (
    <div className="space-y-8 max-w-[1600px] animate-fade-in px-4 sm:px-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))] bg-clip-text bg-gradient-to-r from-[hsl(var(--text-primary))] to-[hsl(var(--text-secondary))] flex items-center gap-3">
            <Package className="w-8 h-8 text-[hsl(var(--accent))]" />
            Inventory &amp; Procurement Management
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Track fixed assets depreciation, purchase order lifecycle requests, consumable reorder points, and supplier valuations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold shadow-glow">
            Suppliers: {suppliers.length} Active | Value: ₦{fixedAssets.length * 15}M
          </span>
        </div>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" /> {savedMessage}
        </div>
      )}

      {/* Desktop Horizontal Tabs */}
      <div className="hidden md:flex flex-wrap gap-2 pb-2 border-b border-[hsl(var(--border))] overflow-x-auto whitespace-nowrap scrollbar-none">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id as InventoryTab);
              setShowMoreMenu(false);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === item.id
                ? 'bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white shadow-md shadow-[hsl(var(--accent)/0.15)]'
                : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]'
            }`}
          >
            <item.icon className="w-3.5 h-3.5" />
            {item.label}
          </button>
        ))}
      </div>

      {/* Mobile/Tablet Sticky Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[hsl(var(--bg-secondary))] border-t border-[hsl(var(--border))] flex items-center justify-around py-2 px-4 shadow-2xl md:hidden">
        {menuItems.slice(0, 4).map(item => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id as InventoryTab);
              setShowMoreMenu(false);
            }}
            className={`flex flex-col items-center gap-1 py-1 px-3 text-center transition-all ${
              activeTab === item.id && !showMoreMenu
                ? 'text-[hsl(var(--accent))] font-bold'
                : 'text-[hsl(var(--text-tertiary))]'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[9px] font-medium tracking-tight">{item.label.split(' ')[0]}</span>
          </button>
        ))}
        <button
          onClick={() => setShowMoreMenu(prev => !prev)}
          className={`flex flex-col items-center gap-1 py-1 px-3 text-center transition-all ${
            showMoreMenu
              ? 'text-[hsl(var(--accent))] font-bold'
              : 'text-[hsl(var(--text-tertiary))]'
          }`}
        >
          <div className="relative">
            <Menu className="w-5 h-5" />
            {!menuItems.slice(0, 4).map(i => i.id).includes(activeTab) && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[hsl(var(--accent))]" />
            )}
          </div>
          <span className="text-[9px] font-medium tracking-tight">More</span>
        </button>
      </div>

      {/* Bottom Sheet Backdrop & Panel for Mobile */}
      {showMoreMenu && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-fade-in"
            onClick={() => setShowMoreMenu(false)}
          />
          <div className="fixed bottom-14 left-0 right-0 z-50 bg-[hsl(var(--bg-secondary))] border-t border-[hsl(var(--border))] rounded-t-2xl p-4 max-h-[70vh] overflow-y-auto md:hidden animate-slide-up">
            <div className="flex justify-between items-center pb-3 border-b border-[hsl(var(--border))] mb-3">
              <span className="text-xs font-extrabold uppercase text-[hsl(var(--text-tertiary))]">Inventory Menu</span>
              <button onClick={() => setShowMoreMenu(false)} className="text-[10px] font-bold text-[hsl(var(--text-tertiary))]">Close</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {menuItems.slice(4).map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as InventoryTab);
                    setShowMoreMenu(false);
                  }}
                  className={`flex items-center gap-2.5 p-3 rounded-xl text-left transition-all ${
                    activeTab === item.id
                      ? 'bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] font-bold'
                      : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'
                  }`}
                >
                  <item.icon className="w-4 h-4 text-[hsl(var(--accent))]" />
                  <span className="text-xs font-semibold">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Main Configurations Container */}
      <div className="pb-20 md:pb-0">
        {/* Dashboard Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: 'Total Inventory Items', value: '482 SKUs', sub: 'Stationery, cleaning', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
                { label: 'Total Fixed Assets', value: '84 Assets', sub: 'Buses, ACs, generators', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                { label: 'Low Stock Items', value: '12 Items', sub: 'Under reorder thresholds', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                { label: 'Out-of-Stock Items', value: '2 Items', sub: 'LaserJet Ink Cartridges', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
                { label: 'Pending Purchase Orders', value: '3 Active', sub: 'Awaiting vendor dispatch', color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
                { label: 'Active Suppliers', value: '18 Partners', sub: '98% Delivery SLA score', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
                { label: 'Under Maintenance', value: '2 Fixed Assets', sub: 'AC repair at ICT lab', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
                { label: 'Fixed Assets Book Value', value: '₦42.8M', sub: '₦3.2M accumulated dep.', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                { label: 'Consumables Value', value: '₦5.8M', sub: 'Main Store asset ledger', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
                { label: 'Disposal Requests', value: '1 Pending', sub: 'Awaiting Principal sign-off', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' }
              ].map(card => (
                <div key={card.label} className={`glass-card p-4 border flex flex-col justify-between ${card.bg}`}>
                  <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider block mb-2">{card.label}</span>
                  <div>
                    <p className="text-base font-extrabold text-[hsl(var(--text-primary))]">{card.value}</p>
                    <p className="text-[9px] text-[hsl(var(--text-tertiary))] truncate mt-0.5">{card.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions Panel */}
            <div className="glass-card p-5 border border-[hsl(var(--border))] space-y-4">
              <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Quick Actions</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button onClick={() => handleAction('Purchase Request Created')} className="p-3 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] rounded-xl text-left border border-[hsl(var(--border))]">
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">+ Create Purchase Request</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Initiate internal procurement workflow</p>
                </button>
                <button onClick={() => handleAction('Purchase Order Issued')} className="p-3 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] rounded-xl text-left border border-[hsl(var(--border))]">
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Generate Purchase Order</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Send official PO to registered vendor</p>
                </button>
                <button onClick={() => handleAction('Goods Checked')} className="p-3 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] rounded-xl text-left border border-[hsl(var(--border))]">
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Log Goods Received</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Verify incoming delivery count discrepancies</p>
                </button>
                <button onClick={() => handleAction('Depreciation Updated')} className="p-3 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--border))] rounded-xl text-left border border-[hsl(var(--border))]">
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Run Depreciation</p>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">Recalculate straight line ledger book values</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Purchase Requests */}
        {activeTab === 'purchase-requests' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Internal Procurement Purchase Requests</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Departments log requisitions which routes to finance for official Purchase Order issuance.</p>
              </div>
              <button onClick={() => {
                const newPR = { id: `PR-${900 + purchaseRequests.length + 1}`, item: 'Standard Whiteboards (x10)', dept: 'Admin Block', cost: '₦320,000', status: 'Pending Approval', date: '2026-07-07' };
                setPurchaseRequests([...purchaseRequests, newPR]);
              }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] text-xs font-bold hover:bg-[hsl(var(--accent))] hover:text-white transition-all">
                <Plus className="w-3.5 h-3.5" /> Log Purchase Requisition
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] font-semibold">
                    <th className="py-2.5 px-2">Request ID</th>
                    <th className="py-2.5 px-2">Requested Item</th>
                    <th className="py-2.5 px-2">Department</th>
                    <th className="py-2.5 px-2">Estimated Cost</th>
                    <th className="py-2.5 px-2">Date Submitted</th>
                    <th className="py-2.5 px-2 text-right">Approval Status</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseRequests.map((pr, idx) => (
                    <tr key={idx} className="border-b border-[hsl(var(--border))/0.4] hover:bg-[hsl(var(--bg-tertiary)/0.2)] transition-colors">
                      <td className="py-3 px-2 font-mono text-[hsl(var(--text-secondary))]">{pr.id}</td>
                      <td className="py-3 px-2 font-bold text-[hsl(var(--text-primary))]">{pr.item}</td>
                      <td className="py-3 px-2 text-[hsl(var(--text-tertiary))]">{pr.dept}</td>
                      <td className="py-3 px-2 font-mono text-[hsl(var(--text-secondary))]">{pr.cost}</td>
                      <td className="py-3 px-2 text-[hsl(var(--text-tertiary))] font-mono">{pr.date}</td>
                      <td className="py-3 px-2 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${pr.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{pr.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Consumables Stock */}
        {activeTab === 'inventory' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Consumables Inventory Stock Levels</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Auto triggers warning alarms when current counts drop below minimum reorder points.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] font-semibold">
                    <th className="py-2.5 px-2">Item Code</th>
                    <th className="py-2.5 px-2">Item Name</th>
                    <th className="py-2.5 px-2">Category</th>
                    <th className="py-2.5 px-2">Storage Warehouse</th>
                    <th className="py-2.5 px-2">Available Qty</th>
                    <th className="py-2.5 px-2">Reorder Level</th>
                    <th className="py-2.5 px-2 text-right">Stock Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stockItems.map((item, idx) => (
                    <tr key={idx} className="border-b border-[hsl(var(--border))/0.4] hover:bg-[hsl(var(--bg-tertiary)/0.2)] transition-colors">
                      <td className="py-3.5 px-2 font-mono text-[hsl(var(--text-secondary))]">{item.code}</td>
                      <td className="py-3.5 px-2 font-bold text-[hsl(var(--text-primary))]">{item.name}</td>
                      <td className="py-3.5 px-2 text-[hsl(var(--text-tertiary))]">{item.category}</td>
                      <td className="py-3.5 px-2 text-[hsl(var(--text-secondary))]">{item.warehouse}</td>
                      <td className="py-3.5 px-2 font-mono font-bold text-[hsl(var(--text-primary))]">{item.qty} units</td>
                      <td className="py-3.5 px-2 font-mono text-[hsl(var(--text-tertiary))]">Min: {item.min} | Reorder: {item.reorder}</td>
                      <td className="py-3.5 px-2 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${item.status === 'ok' ? 'bg-emerald-500/10 text-emerald-400' : item.status === 'low' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>{item.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Warehouses / Stores */}
        {activeTab === 'warehouses' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Multi-Store Warehouse Allocations</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Segregated inventory valuation tracking across secondary science labs, medical center, and sports stores.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {warehouses.map((w, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-[hsl(var(--text-primary))]">{w.name}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">Manager: {w.manager}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-emerald-400 font-bold">{w.value}</p>
                    {w.alerts > 0 && (
                      <span className="text-[9px] text-amber-400 font-semibold">{w.alerts} Low Stock Warning</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fixed Assets Registry */}
        {activeTab === 'assets' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Fixed Asset General Ledger</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Physical high-value items with straight line depreciation models and tracked book values.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] font-semibold">
                    <th className="py-2.5 px-2">Asset Code</th>
                    <th className="py-2.5 px-2">Asset Name</th>
                    <th className="py-2.5 px-2">Purchase Cost</th>
                    <th className="py-2.5 px-2">Current Book Value</th>
                    <th className="py-2.5 px-2">Depreciation Rate</th>
                    <th className="py-2.5 px-2 text-right">Condition</th>
                  </tr>
                </thead>
                <tbody>
                  {fixedAssets.map((asset, idx) => (
                    <tr key={idx} className="border-b border-[hsl(var(--border))/0.4] hover:bg-[hsl(var(--bg-tertiary)/0.2)] transition-colors">
                      <td className="py-3 px-2 font-mono text-[hsl(var(--text-secondary))]">{asset.num}</td>
                      <td className="py-3 px-2 font-bold text-[hsl(var(--text-primary))]">{asset.name}</td>
                      <td className="py-3 px-2 text-[hsl(var(--text-secondary))] font-mono">{asset.cost}</td>
                      <td className="py-3 px-2 font-bold text-emerald-400 font-mono">{asset.value}</td>
                      <td className="py-3 px-2 text-[hsl(var(--text-tertiary))]">{asset.depreciation}</td>
                      <td className="py-3 px-2 text-right font-semibold text-emerald-400">{asset.condition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Asset Disposal Register */}
        {activeTab === 'disposal' && (
          <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
            <div className="border-b border-[hsl(var(--border))] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Asset Disposal Register (Retirements)</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Disposed assets are retained for auditing records instead of database deletion.</p>
              </div>
              <button onClick={() => alert('Log asset retirement form triggered.')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] text-xs font-bold hover:bg-[hsl(var(--accent))] hover:text-white transition-all">
                <Trash2 className="w-3.5 h-3.5" /> Lodge Disposal Request
              </button>
            </div>

            <div className="space-y-3">
              {disposalRequests.map((req, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)] flex justify-between items-center flex-wrap gap-4 text-xs">
                  <div>
                    <p className="font-bold text-[hsl(var(--text-primary))]">{req.name}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">Disposal Reason: <strong className="text-[hsl(var(--text-secondary))]">{req.reason}</strong></p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[hsl(var(--text-primary))]">Estimated Scrap Value: {req.value}</p>
                    <span className="text-[9px] font-bold text-amber-400 mt-1 block uppercase">{req.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
