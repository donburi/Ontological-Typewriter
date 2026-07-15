const fs = require('fs');
let code = fs.readFileSync('src/components/StoryBible.tsx', 'utf8');

const renderBlock = `                const occurrences = getOccurrences(entity);
                const linkedEntities = (entity.linkedEntityIds || []).map(id => bible.find(e => e.id === id)).filter(Boolean) as Entity[];
                const isExpanded = expandedId === entity.id;

                return (
                  <div 
                    key={entity.id} 
                    ref={el => { entityRefs.current[entity.id] = el; }}
                    onClick={() => setExpandedId(isExpanded ? null : entity.id)}
                    className={\`\${ui.inputBg} border \${selectedEntityId === entity.id ? 'border-indigo-500 shadow-md' : ui.panelBorder} rounded-lg p-3 group relative transition-all cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-800\`}
                  >
                     <button 
                        onClick={(e) => { e.stopPropagation(); startEditing(entity); }}
                        className={\`absolute top-2 right-2 \${ui.textMuted} hover:\${ui.textMain} opacity-0 group-hover:opacity-100 transition-opacity\`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={\`text-[10px] px-1.5 py-0.5 rounded bg-black/10 \${ui.textMuted} font-mono uppercase tracking-tight\`}>{entity.type}</span>
                      <h3 className={\`text-sm font-semibold \${ui.textMain} truncate pr-6\`}>{entity.name}</h3>
                    </div>
                    
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden">
                        <p className={\`text-xs \${ui.textMuted} leading-relaxed whitespace-pre-wrap mt-2\`}>{entity.description || 'No description provided.'}</p>
                        
                        {linkedEntities.length > 0 && (
                          <div className="mt-3">
                            <h4 className={\`text-[10px] font-semibold uppercase tracking-wider \${ui.textMuted} mb-1.5 flex items-center gap-1\`}><LinkIcon className="w-3 h-3" /> Linked</h4>
                            <div className="flex flex-wrap gap-1">
                              {linkedEntities.map(linked => (
                                <span key={linked.id} className={\`px-1.5 py-0.5 rounded bg-black/5 text-[10px] \${ui.textMuted}\`}>
                                  {linked.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {occurrences.length > 0 && (
                          <div className="mt-3">
                            <h4 className={\`text-[10px] font-semibold uppercase tracking-wider \${ui.textMuted} mb-1.5 flex items-center gap-1\`}><FileText className="w-3 h-3" /> Occurrences</h4>
                            <ul className="space-y-1">
                              {occurrences.map((occ, idx) => (
                                <li key={idx} className={\`text-[10px] \${ui.textMuted} truncate flex justify-between\`}>
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
                      </motion.div>
                    )}
                  </div>
                );
`;

code = code.replace(/                const occurrences = getOccurrences\(entity\);[\s\S]*?<\/div>\s*\);\s*\}\)/, renderBlock + '\n              )}');

fs.writeFileSync('src/components/StoryBible.tsx', code);
