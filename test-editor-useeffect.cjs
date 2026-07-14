const fs = require('fs');
let code = fs.readFileSync('src/components/Editor.tsx', 'utf8');

const useEffectCode = `
  useEffect(() => {
    if (editor && scene.content !== editor.getHTML()) {
      editor.commands.setContent(scene.content);
    }
  }, [scene.content, editor]);
`;

code = code.replace(/const startTrashDraft = \(\) => \{/, useEffectCode + '\n  const startTrashDraft = () => {');
fs.writeFileSync('src/components/Editor.tsx', code);
