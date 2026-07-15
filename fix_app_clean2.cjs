const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /\{activeView\.type === 'scene' && activeScene && \(\s*<span className=\{\`text-sm \$\{ui\.textMuted\}\`\}>\s*<\/span>\s*\)\}/g,
  `{activeView.type === 'scene' && activeScene && (
          <span className={\`text-sm \${ui.textMuted}\`}>
            / {activeScene.title || 'Untitled'}
          </span>
        )}`
);

fs.writeFileSync('src/App.tsx', code);
