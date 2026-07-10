import { HierarchyFilterParams, PaginatedResponse, TenantNode, HierarchyType } from '../types/hierarchy';

// Mock data generator
const generateMockData = (): TenantNode[] => {
  const nodes: TenantNode[] = [];
  
  // Create 5 Orgs
  for (let i = 1; i <= 5; i++) {
    const orgId = `org-${i}`;
    nodes.push({
      id: orgId,
      name: `Educational Organization ${i}`,
      type: 'organization',
      childrenCount: 3,
      usersCount: 1500 * i,
      studentsCount: 25000 * i,
      storageUsed: 50 * i,
      status: i === 1 ? 'active' : i === 2 ? 'trial' : 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Create Groups under Org
    for (let j = 1; j <= 3; j++) {
      const groupId = `grp-${i}-${j}`;
      nodes.push({
        id: groupId,
        name: `Regional Group ${j}`,
        type: 'group',
        parentId: orgId,
        childrenCount: 2,
        usersCount: 500 * j,
        studentsCount: 8000 * j,
        storageUsed: 15 * j,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      // Create Districts under Group
      for (let k = 1; k <= 2; k++) {
        const districtId = `dst-${i}-${j}-${k}`;
        nodes.push({
          id: districtId,
          name: `School District ${k}`,
          type: 'district',
          parentId: groupId,
          childrenCount: 4,
          usersCount: 250 * k,
          studentsCount: 4000 * k,
          storageUsed: 7 * k,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        
        // Create Schools under District
        for (let l = 1; l <= 4; l++) {
          nodes.push({
            id: `sch-${i}-${j}-${k}-${l}`,
            name: `High School ${l}`,
            type: 'school',
            parentId: districtId,
            childrenCount: 0,
            usersCount: 60 * l,
            studentsCount: 1000 * l,
            storageUsed: 1.5 * l,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }
  }
  return nodes;
};

const MOCK_DB = generateMockData();

// Simulated delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const hierarchyApi = {
  getNodes: async (params: HierarchyFilterParams): Promise<PaginatedResponse<TenantNode>> => {
    await delay(600); // Simulate network latency

    let filtered = [...MOCK_DB];

    if (params.search) {
      const lowerSearch = params.search.toLowerCase();
      filtered = filtered.filter(node => 
        node.name.toLowerCase().includes(lowerSearch) || 
        node.id.toLowerCase().includes(lowerSearch)
      );
    }

    if (params.type) {
      filtered = filtered.filter(node => node.type === params.type);
    }

    if (params.status) {
      filtered = filtered.filter(node => node.status === params.status);
    }
    
    // Default sort by name if no sort order
    if (params.sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[params.sortBy!] ?? '';
        const bVal = b[params.sortBy!] ?? '';

        if (aVal < bVal) return params.sortOrder === 'desc' ? 1 : -1;
        if (aVal > bVal) return params.sortOrder === 'desc' ? -1 : 1;
        return 0;
      });
    }

    const page = params.page || 1;
    const limit = params.limit || 20;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);

    const data = filtered.slice((page - 1) * limit, page * limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages
    };
  }
};
