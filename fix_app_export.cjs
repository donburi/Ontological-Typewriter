const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const publisherProp = `<PublisherEditor
            key={\`scene-pub-\${activeScene.id}\`}
            title={activeScene.title}
            content={activeScene.content}
            onUpdate={(content: string) => handleUpdateScene({ content })}
            theme={workspace.theme}
            onExportEPUB={() => exportEPUB(activeProject)}
          />`;

code = code.replace(/<PublisherEditor[\s\S]*?\/>/, publisherProp);

fs.writeFileSync('src/App.tsx', code);
