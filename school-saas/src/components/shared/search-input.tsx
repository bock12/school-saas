'use client';

import { Search } from 'lucide-react';
import { useCallback, useState } from 'react';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
  debounceMs?: number;
}

export function SearchInput({
  placeholder = 'Search...',
  onSearch,
  className = '',
  debounceMs = 300,
}: SearchInputProps) {
  const [value, setValue] = useState('');
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);

      if (timer) clearTimeout(timer);

      const newTimer = setTimeout(() => {
        onSearch(newValue);
      }, debounceMs);

      setTimer(newTimer);
    },
    [onSearch, debounceMs, timer]
  );

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--text-tertiary))]" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full h-9 pl-9 pr-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] focus:ring-1 focus:ring-[hsl(var(--accent))] transition-all duration-200"
      />
    </div>
  );
}
