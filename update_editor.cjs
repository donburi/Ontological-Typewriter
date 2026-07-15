const fs = require('fs');
let code = fs.readFileSync('src/components/Editor.tsx', 'utf8');

code = code.replace(
  /const strippedContent = scene\.content\.replace\(\/<\[\^>\]\+>\/g, ''\);\n\s*const wordCount = strippedContent\.trim\(\) \? strippedContent\.trim\(\)\.split\(\/\\s\+\/\)\.length : 0;/,
  `const strippedContent = scene.content.replace(/<[^>]+>/g, '');
  const words = strippedContent.trim() ? strippedContent.trim().split(/\\s+/) : [];
  const wordCount = words.length;
  const sentences = strippedContent.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const avgSentenceLength = sentences > 0 ? Math.round(wordCount / sentences) : 0;
  const readingTimeMin = Math.ceil(wordCount / 200);`
);

code = code.replace(
  /<span className="font-mono tracking-tight">\{wordCount\} words<\/span>\n\s*\{scene\.wordGoal && \(/,
  `<span className="font-mono tracking-tight">{wordCount} words</span>
          <span className="font-mono tracking-tight border-l pl-4 border-current opacity-70" title="Average Sentence Length">{avgSentenceLength} words/sentence</span>
          <span className="font-mono tracking-tight border-l pl-4 border-current opacity-70" title="Estimated Reading Time">~{readingTimeMin} min read</span>
          {scene.wordGoal && (`
);

fs.writeFileSync('src/components/Editor.tsx', code);
