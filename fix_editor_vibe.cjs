const fs = require('fs');
let code = fs.readFileSync('src/components/Editor.tsx', 'utf8');

const importsAdd = `import { Play, Square, BookPlus, History, Save, RotateCcw, Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote, Sparkles } from 'lucide-react';`;
code = code.replace(/import { Play, Square, BookPlus, History, Save, RotateCcw, Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote } from 'lucide-react';/, importsAdd);

const stateAdd = `
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [vibeFeedback, setVibeFeedback] = useState<string | null>(null);
  const [isCheckingVibe, setIsCheckingVibe] = useState(false);
`;
code = code.replace(/  const \[showSnapshots, setShowSnapshots\] = useState\(false\);/, stateAdd);

const funcAdd = `
  const handleVibeCheck = async () => {
    setIsCheckingVibe(true);
    setVibeFeedback(null);
    try {
      const text = editor?.getText() || '';
      const response = await fetch('/api/gemini/vibe-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, vibe: scene.vibe, bible })
      });
      if (response.ok) {
        const data = await response.json();
        setVibeFeedback(data.feedback);
      } else {
        const data = await response.json();
        setVibeFeedback("Error: " + (data.error || "Failed to check vibe"));
      }
    } catch (e: any) {
      setVibeFeedback("Error: " + e.message);
    }
    setIsCheckingVibe(false);
    
    // Auto-hide feedback after 10 seconds
    setTimeout(() => {
      setVibeFeedback(null);
    }, 10000);
  };

  const bibleRef = useRef(bible);
`;
code = code.replace(/  const bibleRef = useRef\(bible\);/, funcAdd);

const buttonAdd = `
          <div className="relative">
            <button
              onClick={handleVibeCheck}
              disabled={isCheckingVibe}
              className={\`flex items-center gap-1.5 hover:opacity-100 \${isCheckingVibe ? 'opacity-50' : 'opacity-80'} transition-opacity\`}
            >
              <Sparkles className={\`w-3.5 h-3.5 \${isCheckingVibe ? 'animate-pulse text-indigo-400' : ''}\`} />
              Vibe Check
            </button>
            <AnimatePresence>
              {vibeFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={\`absolute bottom-full right-0 mb-2 w-64 rounded-lg shadow-xl border \${ui.panelBorder} \${ui.panelBg} \${ui.textMain} p-3 text-xs leading-relaxed z-50\`}
                >
                  <p className="opacity-90">{vibeFeedback}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowSnapshots(!showSnapshots)}
`;
code = code.replace(/          <div className="relative">\s*<button\s*onClick=\{\(\) => setShowSnapshots\(!showSnapshots\)\}/, buttonAdd);

fs.writeFileSync('src/components/Editor.tsx', code);
