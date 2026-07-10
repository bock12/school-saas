import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Eye, Edit, Settings, Trash2, ShieldBan, Archive } from 'lucide-react';
import { TenantNode } from '../types/hierarchy';

interface RowActionsProps {
  node: TenantNode;
  onView: (node: TenantNode) => void;
}

export function RowActions({ node, onView }: RowActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    setIsOpen(false);
    action();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-100 dark:border-gray-700 z-50 py-1">
          <button 
            onClick={(e) => handleAction(e, () => onView(node))}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
          >
            <Eye className="w-4 h-4 mr-2 text-gray-400" />
            View Details
          </button>
          <button 
            onClick={(e) => handleAction(e, () => console.log('Edit', node.id))}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
          >
            <Edit className="w-4 h-4 mr-2 text-gray-400" />
            Edit
          </button>
          <button 
            onClick={(e) => handleAction(e, () => console.log('Modules', node.id))}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
          >
            <Settings className="w-4 h-4 mr-2 text-gray-400" />
            Manage Modules
          </button>
          
          <div className="h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
          
          <button 
            onClick={(e) => handleAction(e, () => console.log('Suspend', node.id))}
            className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20 flex items-center"
          >
            <ShieldBan className="w-4 h-4 mr-2" />
            Suspend
          </button>
          <button 
            onClick={(e) => handleAction(e, () => console.log('Archive', node.id))}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
          >
            <Archive className="w-4 h-4 mr-2 text-gray-400" />
            Archive
          </button>
          <button 
            onClick={(e) => handleAction(e, () => console.log('Delete', node.id))}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
