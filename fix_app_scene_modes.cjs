const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /{activeView\.type === 'scene' && activeScene && \(\s*<span className={`text-sm \$\{ui\.textMuted\}`}>\s*\/ \{activeScene\.title || 'Untitled'\}\s*<\/span>\s*\)}/g,
  `{activeView.type === 'scene' && activeScene && (
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
        )}`
);
fs.writeFileSync('src/App.tsx', code);
