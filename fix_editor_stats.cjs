const fs = require('fs');
let code = fs.readFileSync('src/components/Editor.tsx', 'utf8');

const calcStatsCode = `
  // Readability Stats
  const rawText = scene.content.replace(/<[^>]+>/g, ' ');
  const words = rawText.match(/\\b\\w+\\b/g)?.length || 0;
  const sentences = rawText.match(/[^.!?]+[.!?]+/g)?.length || 1; // avoid div by 0
  const avgSentenceLength = words > 0 ? (words / sentences).toFixed(1) : 0;
  const readingTime = Math.ceil(words / 200);

  const ui = THEME_UI[theme];
  const activeColors = VIBE_COLORS[theme][scene.vibe];
`;

code = code.replace(/const ui = THEME_UI\[theme\];\n  const activeColors = VIBE_COLORS\[theme\]\[scene\.vibe\];/, calcStatsCode);

const statOverlay = `
        {/* Readability Stats Overlay */}
        <div className={\`absolute top-4 right-4 flex gap-3 px-3 py-1.5 rounded-full text-xs font-medium bg-black/5 \${ui.textMuted} backdrop-blur-sm z-10\`}>
          <span title="Average Sentence Length">{avgSentenceLength} words/sentence</span>
          <div className="w-px h-3 bg-black/10 self-center"></div>
          <span title="Estimated Reading Time">{readingTime} min read</span>
        </div>
`;

code = code.replace('<div className={`flex-1 relative ${activeColors.bg}`}>', '<div className={`flex-1 relative ${activeColors.bg}`}>' + statOverlay);

fs.writeFileSync('src/components/Editor.tsx', code);
