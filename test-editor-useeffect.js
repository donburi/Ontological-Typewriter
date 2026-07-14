const fs = require('fs');
let code = fs.readFileSync('src/components/Editor.tsx', 'utf8');

const useEffectCode = `
  useEffect(() => {
    if (editor && scene.content !== editor.getHTML()) {
      // Store current cursor position if possible
      const { from, to } = editor.state.selection;
      editor.commands.setContent(scene.content);
      // We don't restore cursor because this usually happens when Bible modal is closed,
      // so the editor is not focused anyway.
    }
  }, [scene.content, editor]);
`;

code = code.replace(/const startTrashDraft = \(\) => \{/, useEffectCode + '\n  const startTrashDraft = () => {');
fs.writeFileSync('src/components/Editor.tsx', code);
