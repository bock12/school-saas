import { useQuery } from '@tanstack/react-query';
import { hierarchyApi } from '../api/hierarchy.api';
import { HierarchyFilterParams } from '../types/hierarchy';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';

export const useHierarchy = (initialParams: HierarchyFilterParams = {}) => {
  const [params, setParams] = useState<HierarchyFilterParams>({
    page: 1,
    limit: 20,
    ...initialParams,
  });

  // Debounce the search param specifically
  const [debouncedSearch] = useDebounce(params.search, 300);

  // Derive the query key params so that it triggers a refetch when they change
  const queryParams = {
    ...params,
    search: debouncedSearch,
  };

  const query = useQuery({
    queryKey: ['hierarchy', queryParams],
    queryFn: () => hierarchyApi.getNodes(queryParams),
    placeholderData: (previousData) => previousData, // keep previous data while fetching new (useful for pagination/filtering)
  });

  const setPage = (page: number) => setParams(prev => ({ ...prev, page }));
  const setSearch = (search: string) => setParams(prev => ({ ...prev, search, page: 1 }));
  const setType = (type: HierarchyFilterParams['type']) => setParams(prev => ({ ...prev, type, page: 1 }));
  const setStatus = (status: HierarchyFilterParams['status']) => setParams(prev => ({ ...prev, status, page: 1 }));

  return {
    ...query,
    params,
    setParams,
    setPage,
    setSearch,
    setType,
    setStatus,
  };
};
