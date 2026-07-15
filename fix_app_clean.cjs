const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Find the start and end of the repeated blocks
const startIdx = code.indexOf('{activeView.type === \'scene\' && activeScene && (');
const endIdx = code.lastIndexOf('Overview') + 100; // rough guess
// Actually, I can just use a regex to strip all that junk
code = code.replace(/\{activeView\.type === 'scene' && activeScene && \(\s*<>\s*<span className=\{\`text-sm \$\{ui\.textMuted\}\`\}>\s*\/ \{activeScene\.title \|\| 'Untitled'\}\s*<\/span>[\s\S]*?<\/button>\s*<\/div>\s*<\/>\s*\)\}(R|e|)/g, '');

code = code.replace(/\{activeView\.type === 'scene' && activeScene && \([\s\S]*?<\/button>\s*<\/div>\s*<\/>\s*\)\}/g, '');

code = code.replace(/<div className="flex-1 max-w-md mx-4">/, `{activeView.type === 'scene' && activeScene && (
          <>
            <span className={\`text-sm \${ui.textMuted}\`}>
              / {activeScene.title || 'Untitled'}
            </span>
            <div className="flex items-center gap-1 ml-4 bg-black/5 p-1 rounded-md">
              <button 
                onClick={() => setActiveView({ type: 'scene', id: activeScene.id, mode: 'draft' })}
                className={\`px-2 py-1 text-xs rounded transition-colors \${activeView.mode === 'draft' ? 'bg-white shadow-sm text-black' : ui.textMuted}\`}
              >
                Draft
              </button>
              <button 
                onClick={() => setActiveView({ type: 'scene', id: activeScene.id, mode: 'overview' })}
                className={\`px-2 py-1 text-xs rounded transition-colors \${activeView.mode === 'overview' ? 'bg-white shadow-sm text-black' : ui.textMuted}\`}
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveView({ type: 'scene', id: activeScene.id, mode: 'publisher' })}
                className={\`px-2 py-1 text-xs rounded transition-colors \${activeView.mode === 'publisher' ? 'bg-white shadow-sm text-black' : ui.textMuted}\`}
              >
                Publisher
              </button>
              <button 
                onClick={() => setActiveView({ type: 'scene', id: activeScene.id, mode: 'manuscript' })}
                className={\`px-2 py-1 text-xs rounded transition-colors \${activeView.mode === 'manuscript' ? 'bg-white shadow-sm text-black' : ui.textMuted}\`}
              >
                Manuscript
              </button>
            </div>
          </>
        )}
        <div className="flex-1 max-w-md mx-4">`);
        
fs.writeFileSync('src/App.tsx', code);
