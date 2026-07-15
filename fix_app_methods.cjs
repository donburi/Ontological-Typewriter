const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const newMethods = `
  const handleAddBook = () => {
    const newBook = { id: crypto.randomUUID(), title: 'New Book', scenes: [] };
    updateActiveProject({ books: [...activeProject.books, newBook] });
  };

  const handleAddScene = (bookId: string) => {
    const newScene = { id: crypto.randomUUID(), title: 'New Scene', content: '', vibe: 'Neutral' };
    const newBooks = activeProject.books.map(b => b.id === bookId ? { ...b, scenes: [...b.scenes, newScene] } : b);
    updateActiveProject({ books: newBooks });
    setActiveView({ type: 'scene', id: newScene.id, mode: 'draft' });
  };

  const handleDeleteBook = (bookId: string) => {
    const newBooks = activeProject.books.filter(b => b.id !== bookId);
    updateActiveProject({ books: newBooks });
    setActiveView({ type: 'project' });
  };
`;

code = code.replace('const onDeleteScene = (bookId: string, sceneId: string) => {', newMethods + '\n  const onDeleteScene = (bookId: string, sceneId: string) => {');

const oldSidebar = `<Sidebar 
            projects={workspace.projects}
            activeProject={activeProject}
            activeView={activeView}
            onSelectView={setActiveView}
            onDeleteScene={onDeleteScene}
            onUpdateProject={updateProject}
            onAddProject={addProject}
            onDeleteProject={deleteProject}
            onExportJSON={exportProjectJSON}
            onImportFile={importProjectFile}
            onExportMarkdown={exportMarkdown}
            onExportPDF={exportPDF}
            onExportTXT={exportTXT}
            onExportEPUB={exportEPUB}
            theme={workspace.theme}
            onThemeChange={setTheme}
            onProjectChange={setActiveProjectId}
            syncWithCloud={syncWithCloud}
          />`;

const newSidebar = `<Sidebar 
            books={activeProject.books}
            activeView={activeView}
            onSelectView={setActiveView}
            onAddBook={handleAddBook}
            onAddScene={handleAddScene}
            onDeleteBook={handleDeleteBook}
            onDeleteScene={onDeleteScene}
            updateBook={handleUpdateBook}
            updateScene={handleUpdateScene}
            isTrashDraftMode={isTrashDraftMode}
            setIsTrashDraftMode={setIsTrashDraftMode}
            theme={workspace.theme}
          />`;

code = code.replace(oldSidebar, newSidebar);

fs.writeFileSync('src/App.tsx', code);
