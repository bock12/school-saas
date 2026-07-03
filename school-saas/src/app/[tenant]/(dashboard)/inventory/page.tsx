import { Package, Plus, Search, AlertTriangle, TrendingDown, Wrench, Truck } from 'lucide-react';

const assets = [
  { id: '1', name: 'Dell Projector XG450', category: 'Electronics', location: 'Room 201', quantity: 1, condition: 'good', lastMaintenance: 'Mar 2026', assetTag: 'AST-1001' },
  { id: '2', name: 'HP Laptop 15s', category: 'Electronics', location: 'ICT Lab', quantity: 35, condition: 'good', lastMaintenance: 'Jan 2026', assetTag: 'AST-1002' },
  { id: '3', name: 'Classroom Desks', category: 'Furniture', location: 'Various', quantity: 420, condition: 'fair', lastMaintenance: 'Sep 2025', assetTag: 'AST-1003' },
  { id: '4', name: 'Science Lab Equipment Set', category: 'Lab Equipment', location: 'Science Lab', quantity: 12, condition: 'good', lastMaintenance: 'Feb 2026', assetTag: 'AST-1004' },
  { id: '5', name: 'Sports Equipment (Footballs)', category: 'Sports', location: 'Sports Store', quantity: 24, condition: 'fair', lastMaintenance: 'N/A', assetTag: 'AST-1005' },
  { id: '6', name: 'Photocopier Canon IR2025', category: 'Electronics', location: 'Admin Office', quantity: 2, condition: 'poor', lastMaintenance: 'Nov 2025', assetTag: 'AST-1006' },
];

const stockItems = [
  { name: 'A4 Paper Reams', category: 'Stationery', stock: 45, reorderLevel: 20, unit: 'Reams', status: 'ok' },
  { name: 'Whiteboard Markers', category: 'Stationery', stock: 8, reorderLevel: 15, unit: 'Packs', status: 'low' },
  { name: 'Printer Ink Cartridges', category: 'Office Supplies', stock: 3, reorderLevel: 10, unit: 'Units', status: 'critical' },
  { name: 'Hand Sanitizer 500ml', category: 'Health', stock: 30, reorderLevel: 25, unit: 'Bottles', status: 'ok' },
  { name: 'Exercise Books (80 pages)', category: 'Stationery', stock: 200, reorderLevel: 100, unit: 'Books', status: 'ok' },
  { name: 'Chalk (white)', category: 'Stationery', stock: 12, reorderLevel: 20, unit: 'Boxes', status: 'low' },
];

const conditionColors: Record<string, string> = {
  good: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  fair: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  poor: 'text-red-400 bg-red-500/10 border-red-500/20',
};

const stockStatusColors: Record<string, { bar: string; badge: string }> = {
  ok: { bar: 'bg-emerald-500', badge: 'text-emerald-400 bg-emerald-500/10' },
  low: { bar: 'bg-amber-500', badge: 'text-amber-400 bg-amber-500/10' },
  critical: { bar: 'bg-red-500', badge: 'text-red-400 bg-red-500/10' },
};

export default function InventoryPage() {
  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Inventory & Assets</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Track school assets, stock levels and maintenance</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all">
            <Truck className="w-4 h-4" />Purchase Order
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />Add Asset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Assets', value: assets.length, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Good Condition', value: assets.filter(a => a.condition === 'good').length, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Need Attention', value: assets.filter(a => a.condition !== 'good').length, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Low Stock Items', value: stockItems.filter(s => s.status !== 'ok').length, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 text-center ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Assets Table */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
            <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Asset Register</h2>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
              <input type="text" placeholder="Search..." className="h-8 pl-8 pr-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors w-32" />
            </div>
          </div>
          <div className="divide-y divide-[hsl(var(--border)/0.5)]">
            {assets.map(asset => (
              <div key={asset.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[hsl(var(--bg-tertiary))] flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[hsl(var(--text-primary))] truncate">{asset.name}</p>
                  <p className="text-xs text-[hsl(var(--text-tertiary))]">{asset.location} · Qty: {asset.quantity}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${conditionColors[asset.condition]}`}>
                    {asset.condition}
                  </span>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5 flex items-center gap-1 justify-end">
                    <Wrench className="w-2.5 h-2.5" />{asset.lastMaintenance}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Levels */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
            <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Stock Levels</h2>
            <button className="text-xs text-[hsl(var(--accent))] hover:underline flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />View Alerts
            </button>
          </div>
          <div className="divide-y divide-[hsl(var(--border)/0.5)]">
            {stockItems.map((item, i) => {
              const cfg = stockStatusColors[item.status];
              const pct = Math.min(100, Math.round((item.stock / (item.reorderLevel * 3)) * 100));
              return (
                <div key={i} className="px-5 py-3.5 hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{item.name}</p>
                      <p className="text-xs text-[hsl(var(--text-tertiary))]">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
                        {item.stock} {item.unit}
                      </span>
                      <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">Reorder at {item.reorderLevel}</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
