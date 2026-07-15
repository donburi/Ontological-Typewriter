const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const exportMenu = `
                        <div className="relative group/export inline-block" onClick={(e) => e.stopPropagation()}>
                          <button className={\`p-1.5 rounded-md \${ui.highlight}\`} title="Export Project">
                            <Download className="w-4 h-4" />
                          </button>
                          <div className={\`absolute right-0 top-full mt-1 w-32 rounded-lg shadow-xl border \${ui.panelBorder} \${ui.panelBg} opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all z-50 flex flex-col overflow-hidden\`}>
                            <button onClick={(e) => { e.stopPropagation(); onExportProject(project); }} className={\`px-3 py-1.5 text-xs text-left \${ui.hoverBg}\`}>JSON</button>
                          </div>
                        </div>
`;

code = code.replace(/                        <button onClick=\{\(e\) => \{ e\.stopPropagation\(\); onExportProject\(project\); \}\} className=\{`p-1\.5 rounded-md \$\{ui\.highlight\}`\} title="Export JSON">\s*<Download className="w-4 h-4" \/>\s*<\/button>/, exportMenu);

fs.writeFileSync('src/components/Dashboard.tsx', code);
