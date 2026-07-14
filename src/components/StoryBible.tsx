import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Entity, EntityType, Theme, THEME_UI, ProjectData, Scene } from '../types';
import { Book, Plus, X, Search, Edit2, Link as LinkIcon, FileText, Network } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, ResponsiveContainer, ReferenceLine, Tooltip as RechartsTooltip, Cell, LabelList } from 'recharts';

interface StoryBibleProps {
  project: ProjectData;
  bible: Entity[];
  onAddEntity: (entity: Omit<Entity, 'id'>) => void;
  onUpdateEntity: (id: string, updates: Partial<Entity>) => void;
  onDeleteEntity: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  initialNewEntityName?: string;
  onClearInitialNewEntityName?: () => void;
  selectedEntityId?: string;
  theme: Theme;
}

export function StoryBible({ project, bible, onAddEntity, onUpdateEntity, onDeleteEntity, isOpen, onClose, initialNewEntityName, onClearInitialNewEntityName, selectedEntityId, theme }: StoryBibleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<EntityType>('Character');
  const [newDesc, setNewDesc] = useState('');
  const [newLinkedIds, setNewLinkedIds] = useState<string[]>([]);
  
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');

  const entityRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const ui = THEME_UI[theme];

  // Handle auto-open for new entity from highlight
  useEffect(() => {
    if (initialNewEntityName) {
      setIsAdding(true);
      setNewName(initialNewEntityName);
      setNewLinkedIds([]);
    }
  }, [initialNewEntityName]);

  // Scroll to selected entity
  useEffect(() => {
    if (selectedEntityId && isOpen) {
      setSearchTerm(''); // Clear search to ensure it's visible
      setTimeout(() => {
        const el = entityRefs.current[selectedEntityId];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight effect could be added here
        }
      }, 100);
    }
  }, [selectedEntityId, isOpen]);

  const handleSaveNew = () => {
    if (!newName.trim()) return;
    onAddEntity({
      name: newName.trim(),
      type: newType,
      description: newDesc.trim(),
      linkedEntityIds: newLinkedIds
    });
    setIsAdding(false);
    setNewName('');
    setNewDesc('');
    setNewLinkedIds([]);
    if (onClearInitialNewEntityName) onClearInitialNewEntityName();
  };

  const handleCancelNew = () => {
    setIsAdding(false);
    setNewName('');
    setNewDesc('');
    setNewLinkedIds([]);
    if (onClearInitialNewEntityName) onClearInitialNewEntityName();
  };
  
  const startEditing = (entity: Entity) => {
    setEditingId(entity.id);
    setNewName(entity.name);
    setNewType(entity.type);
    setNewDesc(entity.description);
    setNewLinkedIds(entity.linkedEntityIds || []);
  };
  
  const handleSaveEdit = () => {
    if (!editingId || !newName.trim()) return;
    onUpdateEntity(editingId, {
      name: newName.trim(),
      type: newType,
      description: newDesc.trim(),
      linkedEntityIds: newLinkedIds
    });
    setEditingId(null);
  };

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${()|[\]\\]/g, '\\$&');
  };
  const getOccurrences = (entity: Entity) => {
    const occurrences: { bookTitle: string, scene: any, count: number }[] = [];
    project.books.forEach(book => {
      book.scenes.forEach(scene => {
        if (!scene.content) return;
        const stripped = scene.content.replace(/<[^>]*>?/gm, '');
        const regex = new RegExp(`\\b(${escapeRegExp(entity.name)})\\b`, 'gi');
        const matches = [...stripped.matchAll(regex)];
        if (matches.length > 0) {
          occurrences.push({ bookTitle: book.title, scene, count: matches.length });
        }
      });
    });
    return occurrences;
  };


  const filteredBible = bible.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const graphData = useMemo(() => {
    const nodes = bible.map((entity, i) => {
       const angle = (i / bible.length) * 2 * Math.PI;
       const r = 100;
       const x = 150 + r * Math.cos(angle);
       const y = 150 + r * Math.sin(angle);
       const occ = getOccurrences(entity).reduce((acc, curr) => acc + curr.count, 0);
       return { ...entity, x, y, size: occ * 20 + 40, occurrencesCount: occ };
    });

    const links: { source: typeof nodes[0], target: typeof nodes[0] }[] = [];
    nodes.forEach(node => {
       (node.linkedEntityIds || []).forEach(linkedId => {
          const target = nodes.find(n => n.id === linkedId);
          if (target) {
             links.push({ source: node, target });
          }
       });
    });
    return { nodes, links };
  }, [bible, project.books]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className={`border-l ${ui.panelBorder} ${ui.panelBg} flex flex-col h-full ${ui.textMain} overflow-hidden shrink-0 transition-colors duration-500`}
        >
          <div className={`p-4 border-b ${ui.panelBorder} flex items-center justify-between w-[320px]`}>
            <div className="flex items-center gap-2">
              {viewMode === 'list' ? <Book className={`w-4 h-4 ${ui.textMuted}`} /> : <Network className={`w-4 h-4 ${ui.textMuted}`} />}
              <h2 className={`text-xs font-semibold uppercase tracking-widest ${ui.textMuted}`}>
                {viewMode === 'list' ? 'Story Bible' : 'Graph View'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setViewMode(viewMode === 'list' ? 'graph' : 'list')} className={`${ui.highlight} p-1 transition-colors`} title="Toggle View">
                {viewMode === 'list' ? <Network className="w-4 h-4" /> : <Book className="w-4 h-4" />}
              </button>
              {viewMode === 'list' && (
                <button onClick={() => { setIsAdding(true); setEditingId(null); setNewName(''); setNewDesc(''); }} className={`${ui.highlight} p-1 transition-colors`} title="Add Entity">
                  <Plus className="w-4 h-4" />
                </button>
              )}
              <button onClick={onClose} className={`${ui.highlight} p-1 transition-colors`} title="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="w-[320px] flex-1 overflow-y-auto flex flex-col">
            {viewMode === 'list' ? (
              <>
                <div className="p-4 pb-0 shrink-0">
                  <div className="relative">
                    <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${ui.textMuted}`} />
                    <input
                      type="text"
                      placeholder="Search entities..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className={`w-full ${ui.inputBg} border ${ui.panelBorder} rounded-md py-1.5 pl-9 pr-3 text-sm ${ui.textMain} outline-none focus:border-indigo-500 transition-colors`}
                    />
                  </div>
                </div>

                <div className="p-4 flex-1 overflow-y-auto space-y-4">
                  {isAdding && (
                <div className={`${ui.inputBg} border ${ui.panelBorder} rounded-lg p-3 space-y-3`}>
                  <input
                    autoFocus
                    placeholder="Entity Name"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className={`w-full bg-transparent border-b ${ui.panelBorder} pb-1 text-sm ${ui.textMain} outline-none focus:border-indigo-500`}
                  />
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as EntityType)}
                    className={`w-full bg-black/5 text-xs rounded border ${ui.panelBorder} p-1.5 ${ui.textMain} outline-none appearance-none`}
                  >
                    <option value="Character" className="text-black bg-white">Character</option>
                    <option value="Setting" className="text-black bg-white">Setting</option>
                    <option value="Lore" className="text-black bg-white">Lore</option>
                    <option value="Object" className="text-black bg-white">Object</option>
                  </select>
                  <textarea
                    placeholder="Description..."
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    className={`w-full bg-black/5 rounded border ${ui.panelBorder} p-2 text-xs ${ui.textMain} outline-none resize-none h-20`}
                  />
                  <div className="mt-3">
                    <label className={`block text-xs font-semibold ${ui.textMuted} mb-1`}>Linked Entities</label>
                    <div className="flex flex-wrap gap-1">
                      {bible.map(other => {
                        const isLinked = newLinkedIds.includes(other.id);
                        return (
                          <button
                            key={other.id}
                            onClick={() => {
                              if (isLinked) {
                                setNewLinkedIds(newLinkedIds.filter(id => id !== other.id));
                              } else {
                                setNewLinkedIds([...newLinkedIds, other.id]);
                              }
                            }}
                            className={`px-2 py-0.5 rounded-full text-[10px] transition-colors ${isLinked ? 'bg-indigo-500 text-white' : 'bg-black/10 hover:bg-black/20 text-current'}`}
                          >
                            {other.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1 mt-3">
                    <button onClick={handleCancelNew} className={`text-xs ${ui.textMuted} hover:${ui.textMain}`}>Cancel</button>
                    <button onClick={handleSaveNew} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded font-medium hover:bg-indigo-700">Save</button>
                  </div>
                </div>
              )}

              {!isAdding && filteredBible.length === 0 && (
                <div className={`text-center ${ui.textMuted} text-sm mt-8`}>
                  No entities found.
                </div>
              )}

              {filteredBible.map(entity => {
                if (editingId === entity.id) {
                  return (
                    <div key={entity.id} className={`${ui.inputBg} border-2 border-indigo-500 rounded-lg p-3 space-y-3 shadow-md`}>
                      <input
                        autoFocus
                        placeholder="Entity Name"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        className={`w-full bg-transparent border-b ${ui.panelBorder} pb-1 text-sm ${ui.textMain} outline-none focus:border-indigo-500`}
                      />
                      <select
                        value={newType}
                        onChange={e => setNewType(e.target.value as EntityType)}
                        className={`w-full bg-black/5 text-xs rounded border ${ui.panelBorder} p-1.5 ${ui.textMain} outline-none appearance-none`}
                      >
                        <option value="Character" className="text-black bg-white">Character</option>
                        <option value="Setting" className="text-black bg-white">Setting</option>
                        <option value="Lore" className="text-black bg-white">Lore</option>
                        <option value="Object" className="text-black bg-white">Object</option>
                      </select>
                      <textarea
                        placeholder="Description..."
                        value={newDesc}
                        onChange={e => setNewDesc(e.target.value)}
                        className={`w-full bg-black/5 rounded border ${ui.panelBorder} p-2 text-xs ${ui.textMain} outline-none resize-none h-20`}
                      />
                      <div className="mt-2 text-xs">
                        <label className={`block mb-1 font-semibold ${ui.textMuted}`}>Linked Entities</label>
                        <div className="flex flex-wrap gap-1">
                          {bible.filter(e => e.id !== entity.id).map(other => {
                             const isLinked = newLinkedIds.includes(other.id);
                             return (
                               <button
                                 key={other.id}
                                 onClick={() => {
                                    if (isLinked) {
                                      setNewLinkedIds(newLinkedIds.filter(id => id !== other.id));
                                    } else {
                                      setNewLinkedIds([...newLinkedIds, other.id]);
                                    }
                                 }}
                                 className={`px-2 py-0.5 rounded-full text-[10px] transition-colors ${isLinked ? 'bg-indigo-500 text-white' : 'bg-black/10 hover:bg-black/20 text-current'}`}
                               >
                                 {other.name}
                               </button>
                             );
                          })}
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-1 mt-3">
                        <button onClick={() => onDeleteEntity(entity.id)} className={`text-xs text-red-500 hover:text-red-700 font-medium`}>Delete</button>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingId(null)} className={`text-xs ${ui.textMuted} hover:${ui.textMain}`}>Cancel</button>
                          <button onClick={handleSaveEdit} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded font-medium hover:bg-indigo-700">Save</button>
                        </div>
                      </div>
                    </div>
                  );
                }

                const occurrences = getOccurrences(entity);
                const linkedEntities = (entity.linkedEntityIds || []).map(id => bible.find(e => e.id === id)).filter(Boolean) as Entity[];

                return (
                  <div 
                    key={entity.id} 
                    ref={el => { entityRefs.current[entity.id] = el; }}
                    className={`${ui.inputBg} border ${selectedEntityId === entity.id ? 'border-indigo-500 shadow-md' : ui.panelBorder} rounded-lg p-3 group relative transition-all`}
                  >
                     <button 
                        onClick={() => startEditing(entity)}
                        className={`absolute top-2 right-2 ${ui.textMuted} hover:${ui.textMain} opacity-0 group-hover:opacity-100 transition-opacity`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded bg-black/10 ${ui.textMuted} font-mono uppercase tracking-tight`}>{entity.type}</span>
                      <h3 className={`text-sm font-semibold ${ui.textMain} truncate pr-6`}>{entity.name}</h3>
                    </div>
                    <p className={`text-xs ${ui.textMuted} leading-relaxed whitespace-pre-wrap mt-2`}>{entity.description || 'No description provided.'}</p>
                    
                    {linkedEntities.length > 0 && (
                      <div className="mt-3">
                        <h4 className={`text-[10px] font-semibold uppercase tracking-wider ${ui.textMuted} mb-1.5 flex items-center gap-1`}><LinkIcon className="w-3 h-3" /> Linked</h4>
                        <div className="flex flex-wrap gap-1">
                          {linkedEntities.map(linked => (
                            <span key={linked.id} className={`px-1.5 py-0.5 rounded bg-black/5 text-[10px] ${ui.textMuted}`}>
                              {linked.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {occurrences.length > 0 && (
                      <div className="mt-3">
                        <h4 className={`text-[10px] font-semibold uppercase tracking-wider ${ui.textMuted} mb-1.5 flex items-center gap-1`}><FileText className="w-3 h-3" /> Occurrences</h4>
                        <ul className="space-y-1">
                          {occurrences.map((occ, idx) => (
                            <li key={idx} className={`text-[10px] ${ui.textMuted} truncate flex justify-between`}>
                              <span>
                                <span className="opacity-60">{occ.bookTitle} &rarr; </span> 
                                <span className="font-medium">{occ.scene.title}</span>
                              </span>
                              <span className="opacity-50">×{occ.count}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
              </>
            ) : (
              <div className="flex-1 overflow-hidden p-4">
                {bible.length === 0 ? (
                  <div className={`text-center ${ui.textMuted} text-sm mt-8`}>
                    No entities to graph.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <XAxis type="number" dataKey="x" hide domain={[0, 300]} />
                      <YAxis type="number" dataKey="y" hide domain={[0, 300]} />
                      <ZAxis type="number" dataKey="size" range={[50, 400]} />
                      
                      {graphData.links.map((link, idx) => (
                        <ReferenceLine 
                          key={idx} 
                          segment={[{ x: link.source.x, y: link.source.y }, { x: link.target.x, y: link.target.y }]} 
                          stroke={theme === 'dark' ? '#3f3f46' : '#d4d4d8'} 
                          strokeWidth={1.5}
                        />
                      ))}
                      
                      <RechartsTooltip 
                        cursor={{ strokeDasharray: '3 3' }} 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                             const data = payload[0].payload;
                             return (
                                <div className={`p-2 rounded shadow border ${ui.panelBorder} ${ui.panelBg}`}>
                                   <p className="text-sm font-semibold">{data.name}</p>
                                   <p className="text-xs opacity-80">{data.type}</p>
                                   <p className="text-xs mt-1">Occurrences: {data.occurrencesCount}</p>
                                </div>
                             );
                          }
                          return null;
                        }} 
                      />

                      <Scatter name="Entities" data={graphData.nodes} fill="#6366f1">
                        {graphData.nodes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={theme === 'dark' ? '#818cf8' : '#4f46e5'} />
                        ))}
                        <LabelList dataKey="name" position="bottom" fill={theme === 'dark' ? '#a1a1aa' : '#52525b'} fontSize={10} />
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
