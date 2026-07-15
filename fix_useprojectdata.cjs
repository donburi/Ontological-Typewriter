const fs = require('fs');
let code = fs.readFileSync('src/hooks/useProjectData.ts', 'utf8');

const imports = `import { ProjectData, WorkspaceData, Theme, Scene, BookData } from '../types';
import { exportProjectPDF, exportProjectTXT } from '../lib/exportHelpers';
`;
code = code.replace(/import { ProjectData, WorkspaceData, Theme, Scene, BookData } from '\.\.\/types';/, imports);

const exportsAdd = `
  const exportPDF = (project: ProjectData) => exportProjectPDF(project);
  
  const exportTXT = (project: ProjectData) => exportProjectTXT(project);

  const exportEPUB = async (project: ProjectData) => {
    try {
      const response = await fetch('/api/export/epub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });
      if (!response.ok) throw new Error('EPUB export failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = \`\${project.title.replace(/\\s+/g, '_').toLowerCase()}.epub\`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch(e) {
      console.error(e);
      alert('Failed to generate EPUB');
    }
  };

  const setTheme = `;
code = code.replace(/  const setTheme = /, exportsAdd);

const returnExport = `  return { workspace, updateActiveProject, updateProject, addProject, deleteProject, exportProjectJSON, importProjectFile, exportMarkdown, exportPDF, exportTXT, exportEPUB, lastSaved, setTheme, setActiveProjectId, syncWithCloud };`;
code = code.replace(/  return \{ workspace, updateActiveProject, updateProject, addProject, deleteProject, exportProjectJSON, importProjectFile, exportMarkdown, lastSaved, setTheme, setActiveProjectId, syncWithCloud \};/, returnExport);

fs.writeFileSync('src/hooks/useProjectData.ts', code);
