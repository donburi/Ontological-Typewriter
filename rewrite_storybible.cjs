const fs = require('fs');
let code = fs.readFileSync('src/components/StoryBible.tsx', 'utf8');

// 1. Add sort and expanded states
const stateAdd = `
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<EntityType>('Character');
  const [newDesc, setNewDesc] = useState('');
  const [newLinkedIds, setNewLinkedIds] = useState<string[]>([]);
  
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'lastModified'>('name');
  const [expandedId, setExpandedId] = useState<string | null>(null);
`;
code = code.replace(/  const \[newName, setNewName\] = useState\(''\);\s*const \[newType, setNewType\] = useState<EntityType>\('Character'\);\s*const \[newDesc, setNewDesc\] = useState\(''\);\s*const \[newLinkedIds, setNewLinkedIds\] = useState<string\[\]>\(\[\]\);\s*const \[viewMode, setViewMode\] = useState<'list' \| 'graph'>\('list'\);/, stateAdd);

// 2. Add lastModified when adding/editing
const saveNewAdd = `
    onAddEntity({
      name: newName.trim(),
      type: newType,
      description: newDesc.trim(),
      linkedEntityIds: newLinkedIds,
      lastModified: Date.now()
    });
`;
code = code.replace(/    onAddEntity\(\{[\s\S]*?linkedEntityIds: newLinkedIds\s*\}\);/, saveNewAdd);

const saveEditAdd = `
    onUpdateEntity(editingId, {
      name: newName.trim(),
      type: newType,
      description: newDesc.trim(),
      linkedEntityIds: newLinkedIds,
      lastModified: Date.now()
    });
`;
code = code.replace(/    onUpdateEntity\(editingId, \{[\s\S]*?linkedEntityIds: newLinkedIds\s*\}\);/, saveEditAdd);

// 3. Add Sort By UI near Search
const searchUI = `
                <div className="p-4 pb-0 shrink-0 space-y-2">
                  <div className="relative">
                    <Search className={\`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 \${ui.textMuted}\`} />
                    <input
                      type="text"
                      placeholder="Search entities..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className={\`w-full \${ui.inputBg} border \${ui.panelBorder} rounded-md py-1.5 pl-9 pr-3 text-sm \${ui.textMain} outline-none focus:border-indigo-500 transition-colors\`}
                    />
                  </div>
                  <div className="flex justify-end items-center">
                    <label className={\`text-xs \${ui.textMuted} mr-2\`}>Sort by:</label>
                    <select 
                      value={sortBy} 
                      onChange={e => setSortBy(e.target.value as any)}
                      className={\`bg-transparent text-xs \${ui.textMain} outline-none border-b \${ui.panelBorder}\`}
                    >
                      <option value="name">Name</option>
                      <option value="type">Category</option>
                      <option value="lastModified">Last Modified</option>
                    </select>
                  </div>
                </div>
`;
code = code.replace(/                <div className="p-4 pb-0 shrink-0">[\s\S]*?<\/div>\s*<\/div>/, searchUI);

// 4. Update filtering and sorting
const sortCode = `
  const filteredBible = useMemo(() => {
    let filtered = bible.filter(e => 
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'type') return a.type.localeCompare(b.type);
      if (sortBy === 'lastModified') return (b.lastModified || 0) - (a.lastModified || 0);
      return 0;
    });
    return filtered;
  }, [bible, searchTerm, sortBy]);
`;
code = code.replace(/  const filteredBible = bible.filter\([\s\S]*?\);/, sortCode);

fs.writeFileSync('src/components/StoryBible.tsx', code);
