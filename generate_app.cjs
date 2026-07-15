const fs = require('fs');

const code = `import React, { useState } from 'react';
import { useProjectData } from './hooks/useProjectData';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { OverviewEditor } from './components/OverviewEditor';
import { StoryBible } from './components/StoryBible';
import { PublisherEditor } from './components/PublisherEditor';
import { ManuscriptEditor } from './components/ManuscriptEditor';
import { AdminPanel } from './components/AdminPanel';
import { FeedbackModal } from './components/FeedbackModal';
import { UserAuth } from './components/UserAuth';
import { auth } from './lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Shield, MessageSquare, LayoutPanelLeft, LayoutTemplate, Search } from 'lucide-react';
import { THEME_UI, VIBE_COLORS, ActiveView } from './types';

export default function App() {
  const { workspace, updateActiveProject, updateProject, addProject, deleteProject, exportProjectJSON, importProjectFile, exportMarkdown, exportPDF, exportTXT, exportEPUB, lastSaved, setTheme, setActiveProjectId, syncWithCloud } = useProjectData();
  const [activeView, setActiveView] = useState<ActiveView>({ type: 'project' });
  const [isBibleOpen, setIsBibleOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTrashDraftMode, setIsTrashDraftMode] = useState(false);
  const [pendingBibleEntity, setPendingBibleEntity] = useState<string | undefined>();
  const [selectedBibleEntityId, setSelectedBibleEntityId] = useState<string | undefined>();
  const [isDistractionFree, setIsDistractionFree] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  
  const [user] = useAuthState(auth);

  if (!workspace || workspace.projects.length === 0) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  const activeProject = workspace.projects.find(p => p.id === workspace.activeProjectId) || workspace.projects[0];
  const ui = THEME_UI[workspace.theme];
  const activeColors = VIBE_COLORS[workspace.theme]['Neutral'];
  
  const activeBook = activeView.type === 'book' || activeView.type === 'scene' 
    ? activeProject.books.find(b => 
        (activeView.type === 'book' && b.id === activeView.id) || 
        (activeView.type === 'scene' && b.scenes.some(s => s.id === activeView.id))
      )
    : undefined;

  const activeScene = activeView.type === 'scene' 
    ? activeBook?.scenes.find(s => s.id === activeView.id)
    : undefined;

  const handleUpdateScene = (updates: any) => {
    if (!activeBook || !activeScene) return;
    const newBooks = activeProject.books.map(b => 
      b.id === activeBook.id 
        ? { ...b, scenes: b.scenes.map(s => s.id === activeScene.id ? { ...s, ...updates } : s) }
        : b
    );
    updateActiveProject({ books: newBooks });
  };

  const handleUpdateBook = (bookId: string, updates: any) => {
    const newBooks = activeProject.books.map(b => b.id === bookId ? { ...b, ...updates } : b);
    updateActiveProject({ books: newBooks });
  };

  const onDeleteScene = (bookId: string, sceneId: string) => {
    const newBooks = activeProject.books.map(b => 
      b.id === bookId ? { ...b, scenes: b.scenes.filter(s => s.id !== sceneId) } : b
    );
    updateActiveProject({ books: newBooks });
    setActiveView({ type: 'book', id: bookId });
  };

  const handleAddToBible = (text: string) => {
    setPendingBibleEntity(text);
    setIsBibleOpen(true);
  };

  const renderMainContent = () => {
    if (activeView.type === 'project') {
      return (
        <OverviewEditor
          key="project"
          title={activeProject.title}
          subtitle="Project"
          content={activeProject.overview || ''}
          onUpdate={(content: string) => updateActiveProject({ overview: content })}
          onUpdateTitle={(title: string) => updateActiveProject({ title })}
          theme={workspace.theme}
          vibe="Neutral"
          bible={activeProject.bible}
          onAddToBible={handleAddToBible}
        />
      );
    }
    if (activeView.type === 'book' && activeBook) {
      return (
        <OverviewEditor
          key={\`book-\${activeBook.id}\`}
          title={activeBook.title}
          subtitle="Book"
          content={activeBook.overview || ''}
          onUpdate={(content: string) => handleUpdateBook(activeBook.id, { overview: content })}
          onUpdateTitle={(title: string) => handleUpdateBook(activeBook.id, { title })}
          theme={workspace.theme}
          vibe="Neutral"
          bible={activeProject.bible}
          onAddToBible={handleAddToBible}
        />
      );
    }
    if (activeView.type === 'scene' && activeScene) {
      if (activeView.mode === 'overview') {
        return (
          <OverviewEditor
            key={\`scene-overview-\${activeScene.id}\`}
            title={activeScene.title}
            subtitle="Scene"
            content={activeScene.overview || ''}
            onUpdate={(content: string) => handleUpdateScene({ overview: content })}
            onUpdateTitle={(title: string) => handleUpdateScene({ title })}
            theme={workspace.theme}
            vibe={activeScene.vibe}
            editorFont="font-serif"
            bible={activeProject.bible}
            onAddToBible={handleAddToBible}
          />
        );
      }
      if (activeView.mode === 'publisher') {
        return (
          <PublisherEditor
            key={\`scene-pub-\${activeScene.id}\`}
            title={activeScene.title}
            content={activeScene.content}
            onUpdate={(content: string) => handleUpdateScene({ content })}
            theme={workspace.theme}
          />
        );
      }
      if (activeView.mode === 'manuscript') {
        return (
          <ManuscriptEditor
            key={\`scene-manu-\${activeScene.id}\`}
            title={activeScene.title}
            content={activeScene.content}
            onUpdate={(content: string) => handleUpdateScene({ content })}
            theme={workspace.theme}
          />
        );
      }
      return (
        <Editor
          key={\`scene-\${activeScene.id}\`}
          scene={activeScene}
          updateScene={handleUpdateScene}
          theme={workspace.theme}
          editorFont="font-serif"
          bible={activeProject.bible}
          onAddToBible={handleAddToBible}
          isTrashDraftMode={isTrashDraftMode}
          setIsTrashDraftMode={setIsTrashDraftMode}
          lastSaved={lastSaved}
        />
      );
    }
    return <div className="flex-1 flex items-center justify-center opacity-50">Select an item</div>;
  };

  return (
    <div className={\`h-screen w-full flex flex-col transition-colors duration-700 \${activeColors.bg} overflow-hidden font-sans\`}>
      {!isDistractionFree && (
        <header className={\`h-12 border-b \${activeColors.border} flex items-center justify-between px-4 shrink-0 bg-black/5 backdrop-blur-sm z-10\`}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={\`p-2 rounded-lg hover:bg-black/5 \${ui.textMuted} hover:\${activeColors.text} transition-colors flex shrink-0\`}
            >
              <LayoutPanelLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setActiveView({ type: 'project' })}
              className={\`bg-transparent border-none outline-none text-sm font-semibold tracking-wide hover:underline cursor-pointer \${activeView.type === 'project' ? activeColors.text : ui.textMuted} truncate max-w-[200px] text-left flex items-center gap-1.5\`}
            >
              {activeProject.title || "Untitled Project"}
              <LayoutTemplate className={\`w-3.5 h-3.5 \${activeView.type === 'project' ? 'text-indigo-500' : 'opacity-50'}\`} />
            </button>
          </div>
          
          {activeView.type === 'scene' && activeScene && (
            <div className="flex items-center gap-1 ml-4 bg-black/5 p-1 rounded-md">
              <button 
                onClick={() => setActiveView({ type: 'scene', id: activeScene.id, mode: 'draft' })}
                className={\`px-2 py-1 text-xs rounded transition-colors \${activeView.mode === 'draft' ? 'bg-white shadow-sm text-black' : ui.textMuted}\`}
              >
                Draft
              </button>
              <button 
                onClick={() => setActiveView({ type: 'scene', id: activeScene.id, mode: 'overview' })}
                className={\`px-2 py-1 text-xs rounded transition-colors \${activeView.mode === 'overview' ? 'bg-white shadow-sm text-black' : ui.textMuted}\`}
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveView({ type: 'scene', id: activeScene.id, mode: 'publisher' })}
                className={\`px-2 py-1 text-xs rounded transition-colors \${activeView.mode === 'publisher' ? 'bg-white shadow-sm text-black' : ui.textMuted}\`}
              >
                Publisher
              </button>
              <button 
                onClick={() => setActiveView({ type: 'scene', id: activeScene.id, mode: 'manuscript' })}
                className={\`px-2 py-1 text-xs rounded transition-colors \${activeView.mode === 'manuscript' ? 'bg-white shadow-sm text-black' : ui.textMuted}\`}
              >
                Manuscript
              </button>
            </div>
          )}

          <div className="flex-1 max-w-md mx-4">
            <div className={\`relative flex items-center bg-black/5 rounded-md border \${activeColors.border} px-3 py-1.5\`}>
              <Search className={\`w-4 h-4 \${ui.textMuted} mr-2\`} />
              <input 
                type="text" 
                placeholder="Search..." 
                className={\`bg-transparent border-none outline-none text-sm w-full \${activeColors.text} placeholder:opacity-50\`}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <UserAuth />
            <button onClick={() => setIsFeedbackOpen(true)} className={\`\${ui.textMuted} \${ui.highlight} transition-colors flex items-center gap-1.5\`} title="Send Feedback">
              <MessageSquare className="w-4 h-4" />
            </button>
            <div className={\`w-px h-4 \${activeColors.border} mx-1\`}></div>
            {user?.email === 'procyin@gmail.com' && (
              <>
                <button onClick={() => setIsAdminOpen(true)} className={\`\${ui.textMuted} \${ui.highlight} transition-colors flex items-center gap-1.5\`} title="Admin Panel">
                  <Shield className="w-4 h-4" />
                </button>
                <div className={\`w-px h-4 \${activeColors.border} mx-1\`}></div>
              </>
            )}
            <button 
              onClick={() => setIsBibleOpen(!isBibleOpen)}
              className={\`px-3 py-1.5 rounded-md text-sm font-medium transition-colors \${isBibleOpen ? ui.activeBg + ' ' + activeColors.text : ui.textMuted + ' ' + ui.hoverBg}\`}
            >
              Story Bible
            </button>
          </div>
        </header>
      )}

      <div className="flex-1 flex overflow-hidden">
        {isSidebarOpen && !isDistractionFree && (
          <Sidebar 
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
          />
        )}
        
        {renderMainContent()}

        <StoryBible 
          isOpen={isBibleOpen && !isDistractionFree} 
          entities={activeProject.bible}
          onClose={() => setIsBibleOpen(false)}
          onAddEntity={(entity) => updateActiveProject({ bible: [...activeProject.bible, { ...entity, id: crypto.randomUUID() }] })}
          onUpdateEntity={(id, updates) => {
            const newBible = activeProject.bible.map(e => e.id === id ? { ...e, ...updates } : e);
            updateActiveProject({ bible: newBible });
          }}
          onDeleteEntity={(id) => {
            const newBible = activeProject.bible.filter(e => e.id !== id);
            updateActiveProject({ bible: newBible });
          }}
          initialNewEntityName={pendingBibleEntity}
          onClearInitialNewEntityName={() => setPendingBibleEntity(undefined)}
          selectedEntityId={selectedBibleEntityId}
          theme={workspace.theme}
        />
      </div>

      {isAdminOpen && (
        <AdminPanel theme={workspace.theme} onClose={() => setIsAdminOpen(false)} />
      )}
      {isFeedbackOpen && (
        <FeedbackModal theme={workspace.theme} onClose={() => setIsFeedbackOpen(false)} />
      )}
    </div>
  );
}
`;

fs.writeFileSync('src/App.tsx', code);
