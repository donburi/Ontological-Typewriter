const fs = require('fs');
let code = fs.readFileSync('src/components/StoryBible.tsx', 'utf8');

const escapeRegExp = `  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^$\{()|[\\]\\\\]/g, '\\\\$&');
  };`;

const newGetOcc = `
  const getOccurrences = (entity: Entity) => {
    const occurrences: { bookTitle: string, scene: any, count: number }[] = [];
    project.books.forEach(book => {
      book.scenes.forEach(scene => {
        if (!scene.content) return;
        const stripped = scene.content.replace(/<[^>]*>?/gm, '');
        const regex = new RegExp(\`\\\\b(\${escapeRegExp(entity.name)})\\\\b\`, 'gi');
        const matches = [...stripped.matchAll(regex)];
        if (matches.length > 0) {
          occurrences.push({ bookTitle: book.title, scene, count: matches.length });
        }
      });
    });
    return occurrences;
  };
`;

code = code.replace(/const getOccurrences = \(entityId: string\) => \{[\s\S]*?return occurrences;\n  \};/, escapeRegExp + '\n' + newGetOcc);

// Fix getOccurrences calls
code = code.replace(/getOccurrences\(entity\.id\)/g, 'getOccurrences(entity)');
code = code.replace(/const occ = getOccurrences\(entity\)\.length;/g, 'const occ = getOccurrences(entity).reduce((acc, curr) => acc + curr.count, 0);');

// Fix occurrences display
const oldOccurrencesList = /<ul className="space-y-1">[\s\S]*?<\/ul>/;
const newOccurrencesList = `<ul className="space-y-1">
                          {occurrences.map((occ, idx) => (
                            <li key={idx} className={\`text-[10px] \${ui.textMuted} truncate flex justify-between\`}>
                              <span>
                                <span className="opacity-60">{occ.bookTitle} &rarr; </span> 
                                <span className="font-medium">{occ.scene.title}</span>
                              </span>
                              <span className="opacity-50">×{occ.count}</span>
                            </li>
                          ))}
                        </ul>`;
code = code.replace(oldOccurrencesList, newOccurrencesList);

fs.writeFileSync('src/components/StoryBible.tsx', code);
