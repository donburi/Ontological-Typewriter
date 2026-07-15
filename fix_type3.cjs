const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

// For UserAuth missing theme
appCode = appCode.replace(/<UserAuth \/>/g, '<UserAuth theme={workspace.theme} />');

// For StoryBible using entities instead of bible
appCode = appCode.replace(/entities=\{activeProject\.bible\}/g, 'bible={activeProject.bible} project={activeProject}');

fs.writeFileSync('src/App.tsx', appCode);

