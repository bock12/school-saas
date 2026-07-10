import React from 'react';
import { Plus } from 'lucide-react';
import { HierarchyType } from '../types/hierarchy';
import { HIERARCHY_CONFIG } from '../config/hierarchy.config';

interface EmptyStateProps {
  type: HierarchyType;
  searchQuery?: string;
  onAdd: () => void;
  onClearSearch?: () => void;
}

export function EmptyState({ type, searchQuery, onAdd, onClearSearch }: EmptyStateProps) {
  const config = HIERARCHY_CONFIG[type];

  if (searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900/50">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <SearchIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
          No results found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
          We couldn&apos;t find any {config.plural.toLowerCase()} matching &quot;{searchQuery}&quot;.
        </p>
        <button 
          onClick={onClearSearch}
          className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
        >
          Clear search
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900/50">
      <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
        <config.icon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
        No {config.plural.toLowerCase()} yet
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
        Get started by creating your first {config.label.toLowerCase()}. This will allow you to structure and manage your educational network effectively.
      </p>
      <button 
        onClick={onAdd}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center shadow-sm"
      >
        <Plus className="w-5 h-5 mr-2" />
        Create {config.label}
      </button>
    </div>
  );
}

// Temporary internal component
function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
