import React, { useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { TenantNode } from '../types/hierarchy';
import { STATUS_MAP } from '../constants/hierarchy.constants';
import { RowActions } from './RowActions';
import { Users, HardDrive, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';

interface HierarchyTableProps {
  data: TenantNode[];
  isLoading: boolean;
  onRowClick: (node: TenantNode) => void;
}

// Mobile Card renders one row as a card — shown on small screens
function MobileCard({ node, onRowClick }: { node: TenantNode; onRowClick: (n: TenantNode) => void }) {
  const statusConfig = STATUS_MAP[node.status];
  return (
    <div
      onClick={() => onRowClick(node)}
      className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] hover:border-[hsl(var(--border-hover))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-[hsl(var(--text-primary))] truncate">{node.name}</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-mono mt-0.5 truncate">{node.id}</p>
        </div>
        <span className={`flex-shrink-0 px-2.5 py-1 text-[10px] rounded-full font-semibold ${statusConfig.color}`}>
          {statusConfig.label}
        </span>
      </div>
      <div className="flex items-center gap-4 text-[11px] text-[hsl(var(--text-tertiary))]">
        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {node.usersCount.toLocaleString()}</span>
        <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {node.studentsCount.toLocaleString()}</span>
        <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" /> {node.storageUsed} GB</span>
      </div>
    </div>
  );
}

export function HierarchyTable({ data, isLoading, onRowClick }: HierarchyTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const columns = React.useMemo<ColumnDef<TenantNode>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: (info) => (
          <div className="flex flex-col">
            <span className="font-semibold text-[hsl(var(--text-primary))] text-sm">
              {info.getValue() as string}
            </span>
            <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-mono mt-0.5">
              {info.row.original.id}
            </span>
          </div>
        ),
        size: 280,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const status = info.getValue() as keyof typeof STATUS_MAP;
          const config = STATUS_MAP[status];
          return (
            <span className={`px-2.5 py-1 text-[10px] rounded-full font-semibold ${config.color}`}>
              {config.label}
            </span>
          );
        },
        size: 130,
      },
      {
        accessorKey: 'metrics',
        header: 'Metrics',
        cell: (info) => {
          const node = info.row.original;
          return (
            <div className="flex items-center gap-4 text-xs text-[hsl(var(--text-tertiary))]">
              <span className="flex items-center gap-1" title="Staff"><Users className="w-3.5 h-3.5" /> {node.usersCount.toLocaleString()}</span>
              <span className="flex items-center gap-1" title="Students"><GraduationCap className="w-3.5 h-3.5" /> {node.studentsCount.toLocaleString()}</span>
              <span className="flex items-center gap-1" title="Storage"><HardDrive className="w-3.5 h-3.5" /> {node.storageUsed} GB</span>
            </div>
          );
        },
        size: 240,
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: (info) => (
          <span className="text-xs text-[hsl(var(--text-tertiary))]">
            {format(new Date(info.getValue() as string), 'MMM d, yyyy')}
          </span>
        ),
        size: 140,
      },
      {
        id: 'actions',
        header: '',
        cell: (info) => (
          <div className="flex justify-end">
            <RowActions node={info.row.original} onView={onRowClick} />
          </div>
        ),
        size: 60,
      },
    ],
    [onRowClick]
  );

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 60,
    overscan: 10,
  });

  if (isLoading) {
    return (
      <>
        {/* Desktop skeleton */}
        <div className="hidden md:block border border-[hsl(var(--border))] rounded-xl overflow-hidden bg-[hsl(var(--bg-secondary))]">
          <div className="animate-pulse">
            <div className="h-11 bg-[hsl(var(--bg-tertiary))] border-b border-[hsl(var(--border))]" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-[60px] border-b border-[hsl(var(--border)/0.4)] flex items-center px-6 gap-6">
                <div className="h-3 bg-[hsl(var(--bg-tertiary))] rounded w-1/4" />
                <div className="h-3 bg-[hsl(var(--bg-tertiary))] rounded w-20" />
                <div className="h-3 bg-[hsl(var(--bg-tertiary))] rounded w-1/3" />
                <div className="h-3 bg-[hsl(var(--bg-tertiary))] rounded w-24" />
              </div>
            ))}
          </div>
        </div>
        {/* Mobile skeleton */}
        <div className="md:hidden space-y-2.5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] animate-pulse" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      {/* Desktop full table */}
      <div
        ref={tableContainerRef}
        className="hidden md:block border border-[hsl(var(--border))] rounded-xl overflow-auto bg-[hsl(var(--bg-secondary))] max-h-[calc(100vh-380px)]"
        style={{ minWidth: 0 }}
      >
        <table className="w-full text-left border-collapse" style={{ minWidth: '720px' }}>
          <thead className="sticky top-0 bg-[hsl(var(--bg-tertiary))] backdrop-blur-sm border-b border-[hsl(var(--border))] z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-5 py-3 text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider whitespace-nowrap"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody
            style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}
          >
            {rowVirtualizer.getVirtualItems().map(virtualRow => {
              const row = rows[virtualRow.index];
              return (
                <tr
                  key={row.id}
                  onClick={() => onRowClick(row.original)}
                  className="absolute w-full flex border-b border-[hsl(var(--border)/0.3)] hover:bg-[hsl(var(--bg-tertiary)/0.5)] transition-colors cursor-pointer group"
                  style={{
                    top: 0,
                    left: 0,
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className="px-5 py-3 flex items-center"
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-2.5">
        {data.map(node => (
          <MobileCard key={node.id} node={node} onRowClick={onRowClick} />
        ))}
      </div>
    </>
  );
}
