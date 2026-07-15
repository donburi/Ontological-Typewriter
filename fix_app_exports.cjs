const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const hookCall = `  const { workspace, updateActiveProject, updateProject, addProject, deleteProject, exportProjectJSON, importProjectFile, exportMarkdown, exportPDF, exportTXT, exportEPUB, lastSaved, setTheme, setActiveProjectId, syncWithCloud } = useProjectData();`;
code = code.replace(/  const \{ workspace, updateActiveProject, updateProject, addProject, deleteProject, exportProjectJSON, importProjectFile, exportMarkdown, lastSaved, setTheme, setActiveProjectId, syncWithCloud \} = useProjectData\(\);/, hookCall);

const exportMenu = `
          <div className="relative group">
            <button className={\`\${ui.textMuted} \${ui.highlight} transition-colors flex items-center gap-1.5\`} title="Export Project">
              <Download className="w-4 h-4" />
            </button>
            <div className={\`absolute right-0 top-full mt-2 w-48 rounded-lg shadow-xl border \${ui.panelBorder} \${ui.panelBg} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden flex flex-col\`}>
              <button onClick={() => exportProjectJSON(activeProject)} className={\`px-4 py-2 text-left text-sm \${ui.hoverBg} \${ui.textMain}\`}>Export JSON</button>
              <button onClick={() => exportMarkdown(activeProject)} className={\`px-4 py-2 text-left text-sm \${ui.hoverBg} \${ui.textMain}\`}>Export Markdown</button>
              <button onClick={() => exportTXT(activeProject)} className={\`px-4 py-2 text-left text-sm \${ui.hoverBg} \${ui.textMain}\`}>Export Text (.txt)</button>
              <button onClick={() => exportPDF(activeProject)} className={\`px-4 py-2 text-left text-sm \${ui.hoverBg} \${ui.textMain}\`}>Export PDF</button>
              <button onClick={() => exportEPUB(activeProject)} className={\`px-4 py-2 text-left text-sm \${ui.hoverBg} \${ui.textMain}\`}>Export EPUB</button>
            </div>
          </div>
`;

code = code.replace(/          <button onClick=\{\(\) => exportProjectJSON\(activeProject\)\} className=\{`\$\{ui.textMuted\} \$\{ui.highlight\} transition-colors`\} title="Export JSON">[\s\S]*?<\/button>\s*<div className=\{`w-px h-4 \$\{activeColors.border\} mx-1`\}><\/div>\s*<button onClick=\{\(\) => exportMarkdown\(activeProject\)\} className=\{`\$\{ui.textMuted\} \$\{ui.highlight\} transition-colors flex items-center gap-1\.5`\} title="Export Manuscript \(\.md\)">[\s\S]*?<\/button>/, exportMenu);

fs.writeFileSync('src/App.tsx', code);
