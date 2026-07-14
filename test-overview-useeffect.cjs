const fs = require('fs');
let code = fs.readFileSync('src/components/OverviewEditor.tsx', 'utf8');

const useEffectCode = `
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);
`;

code = code.replace(/return \(/, useEffectCode + '\n  return (');
fs.writeFileSync('src/components/OverviewEditor.tsx', code);
