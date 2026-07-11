import React, { useState } from 'react';
import { useProjectData } from './hooks/useProjectData';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { OverviewEditor } from './components/OverviewEditor';
import { StoryBible } from './components/StoryBible';
import { Dashboard } from './components/Dashboard';
import { Scene, VIBE_COLORS, THEME_UI, ProjectData, BookData } from './types';
import { Book, RefreshCw, Download, Upload, FileText, LayoutPanelLeft, Type, ArrowLeft, Search, Maximize, LayoutTemplate } from 'lucide-react';

export type ActiveView = 
  | { type: 'project' } 
  | { type: 'book', id: string } 
  | { type: 'scene', id: string, mode: 'draft' | 'overview' };

import { UserAuth } from './components/UserAuth';

export default function App() {
  const { workspace, updateActiveProject, updateProject, addProject, deleteProject, exportProjectJSON, importProjectJSON, exportMarkdown, lastSaved, setTheme, setActiveProjectId, syncWithCloud } = useProjectData();
  const [activeView, setActiveView] = useState<ActiveView>({ type: 'project' });
  const [isBibleOpen, setIsBibleOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTrashDraftMode, setIsTrashDraftMode] = useState(false);
  const [pendingBibleEntity, setPendingBibleEntity] = useState<string | undefined>();
  const [selectedBibleEntityId, setSelectedBibleEntityId] = useState<string | undefined>();
  const [editorFont, setEditorFont] = useState<string>('font-serif');
  const [sceneSearchQuery, setSceneSearchQuery] = useState('');
  const [isDistractionFree, setIsDistractionFree] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDistractionFree) {
        setIsDistractionFree(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDistractionFree]);

  const activeProject = workspace.projects.find(p => p.id === workspace.activeProjectId);

  React.useEffect(() => {
    const handleOpenBibleEntity = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string }>;
      setIsBibleOpen(true);
      setSelectedBibleEntityId(customEvent.detail.id);
    };
    window.addEventListener('open-bible-entity', handleOpenBibleEntity);
    return () => window.removeEventListener('open-bible-entity', handleOpenBibleEntity);
  }, []);

  // Auto-select project overview when opening a project if no view is set
  React.useEffect(() => {
    if (activeProject && activeView.type !== 'project' && activeView.type !== 'book' && activeView.type !== 'scene') {
      setActiveView({ type: 'project' });
    }
  }, [activeProject, activeView]);

  if (!activeProject || !workspace.activeProjectId) {
    return (
      <Dashboard
        projects={workspace.projects}
        theme={workspace.theme}
        onSelectProject={setActiveProjectId}
        onAddProject={addProject}
        onDeleteProject={deleteProject}
        onUpdateProject={updateProject}
        onExportProject={exportProjectJSON}
        onChangeTheme={setTheme}
        onImportProject={importProjectJSON}
        onSyncWithCloud={syncWithCloud}
      />
    );
  }

  let activeScene: Scene | undefined;
  let activeBook: BookData | undefined;
  
  if (activeView.type === 'scene') {
    for (const b of activeProject.books) {
      const s = b.scenes.find(sc => sc.id === activeView.id);
      if (s) activeScene = s;
    }
  } else if (activeView.type === 'book') {
    activeBook = activeProject.books.find(b => b.id === activeView.id);
  }

  const activeColors = activeScene ? VIBE_COLORS[workspace.theme][activeScene.vibe] : VIBE_COLORS[workspace.theme]['Neutral'];
  const ui = THEME_UI[workspace.theme];

  const filteredBooks = activeProject.books.map(b => {
    const q = sceneSearchQuery.toLowerCase();
    return {
      ...b,
      scenes: b.scenes.filter(s => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q) || b.title.toLowerCase().includes(q))
    };
  }).filter(b => b.scenes.length > 0 || b.title.toLowerCase().includes(sceneSearchQuery.toLowerCase()));

  const handleUpdateScene = (updates: Partial<Scene>) => {
    if (activeView.type !== 'scene') return;
    
    let newSessions = activeProject.sessions ? [...activeProject.sessions] : [];
    
    if (updates.content !== undefined) {
      const oldScene = activeProject.books.flatMap(b => b.scenes).find(s => s.id === activeView.id);
      if (oldScene) {
        const oldWords = oldScene.content.trim() ? oldScene.content.trim().split(/\s+/).length : 0;
        const newWords = updates.content.trim() ? updates.content.trim().split(/\s+/).length : 0;
        const deltaWords = newWords - oldWords;
        
        if (deltaWords !== 0) {
          const today = new Date().toISOString().split('T')[0];
          const todaySessionIndex = newSessions.findIndex(s => s.date === today);
          if (todaySessionIndex >= 0) {
            newSessions[todaySessionIndex] = {
              ...newSessions[todaySessionIndex],
              wordCount: Math.max(0, newSessions[todaySessionIndex].wordCount + deltaWords)
            };
          } else {
            newSessions.push({ date: today, wordCount: Math.max(0, deltaWords) });
          }
        }
      }
    }

    updateActiveProject({
      sessions: newSessions,
      books: activeProject.books.map(b => ({
        ...b,
        scenes: b.scenes.map(s => s.id === activeView.id ? { ...s, ...updates } : s)
      }))
    });
  };

  const handleAddBook = () => {
    const newBook = {
      id: crypto.randomUUID(),
      title: `Book ${activeProject.books.length + 1}`,
      scenes: []
    };
    updateActiveProject({ books: [...activeProject.books, newBook] });
  };

  const handleDeleteBook = (id: string) => {
    const newBooks = activeProject.books.filter(b => b.id !== id);
    updateActiveProject({ books: newBooks });
    if (activeView.type === 'book' && activeView.id === id) {
      setActiveView({ type: 'project' });
    } else if (activeView.type === 'scene') {
      const deletedBook = activeProject.books.find(b => b.id === id);
      if (deletedBook && deletedBook.scenes.some(s => s.id === activeView.id)) {
        setActiveView({ type: 'project' });
      }
    }
  };

  const handleUpdateBook = (id: string, updates: Partial<BookData>) => {
    updateActiveProject({
      books: activeProject.books.map(b => b.id === id ? { ...b, ...updates } : b)
    });
  };

  const handleAddScene = (bookId: string) => {
    const book = activeProject.books.find(b => b.id === bookId);
    if (!book) return;
    
    const newScene: Scene = {
      id: crypto.randomUUID(),
      title: `Scene ${book.scenes.length + 1}`,
      content: '',
      overview: '',
      vibe: 'Neutral'
    };
    
    updateActiveProject({
      books: activeProject.books.map(b => 
        b.id === bookId ? { ...b, scenes: [...b.scenes, newScene] } : b
      )
    });
    setActiveView({ type: 'scene', id: newScene.id, mode: 'draft' });
  };

  const handleDeleteScene = (bookId: string, sceneId: string) => {
    const book = activeProject.books.find(b => b.id === bookId);
    if (!book) return;

    const newScenes = book.scenes.filter(s => s.id !== sceneId);
    updateActiveProject({
      books: activeProject.books.map(b =>
        b.id === bookId ? { ...b, scenes: newScenes } : b
      )
    });
    
    if (activeView.type === 'scene' && activeView.id === sceneId) {
      if (newScenes[0]) {
        setActiveView({ type: 'scene', id: newScenes[0].id, mode: 'draft' });
      } else {
        setActiveView({ type: 'book', id: bookId });
      }
    }
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
          onUpdate={(content) => updateActiveProject({ overview: content })}
          onUpdateTitle={(title) => updateActiveProject({ title })}
          theme={workspace.theme}
          editorFont={editorFont}
          bible={activeProject.bible}
          onAddToBible={handleAddToBible}
          />
      );
    }

    if (activeView.type === 'book' && activeBook) {
      return (
        <OverviewEditor
          key={`book-${activeBook.id}`}
          title={activeBook.title}
          subtitle="Book"
          content={activeBook.overview || ''}
          onUpdate={(content) => handleUpdateBook(activeBook!.id, { overview: content })}
          onUpdateTitle={(title) => handleUpdateBook(activeBook!.id, { title })}
          theme={workspace.theme}
          editorFont={editorFont}
          bible={activeProject.bible}
          onAddToBible={handleAddToBible}
          />
      );
    }

    if (activeView.type === 'scene' && activeScene) {
      if (activeView.mode === 'overview') {
        return (
          <OverviewEditor
            key={`scene-overview-${activeScene.id}`}
            title={activeScene.title}
            subtitle="Scene"
            content={activeScene.overview || ''}
            onUpdate={(content) => handleUpdateScene({ overview: content })}
          onUpdateTitle={(title) => handleUpdateScene({ title })}
            theme={workspace.theme}
            vibe={activeScene.vibe}
            editorFont={editorFont}
          bible={activeProject.bible}
          onAddToBible={handleAddToBible}
          />
        );
      }
      
      return (
        <Editor
          key={`scene-${activeScene.id}`}
          scene={activeScene}
          updateScene={handleUpdateScene}
          onAddToBible={handleAddToBible}
          isTrashDraftMode={isTrashDraftMode}
          setIsTrashDraftMode={setIsTrashDraftMode}
          lastSaved={lastSaved}
          editorFont={editorFont}
          theme={workspace.theme}
          bible={activeProject.bible}
          />
      );
    }

    return (
      <div className={`flex-1 flex items-center justify-center ${activeColors.text} opacity-50`}>
        Select an item from the sidebar
      </div>
    );
  };

  return (
    <div className={`h-screen w-full flex flex-col transition-colors duration-700 ${activeColors.bg} overflow-hidden font-sans`}>
      {/* Top Navbar */}
      {!isDistractionFree && (
        <header className={`h-12 border-b ${activeColors.border} flex items-center justify-between px-4 shrink-0 bg-black/5 backdrop-blur-sm z-10`}>
        <div className="flex items-center gap-4">
          <button onClick={() => { setActiveProjectId(null); setActiveView({ type: 'project' }); }} className={`flex items-center gap-1.5 ${ui.textMuted} ${ui.highlight} transition-colors mr-2 text-sm font-medium`} title="Back to Dashboard">
            <ArrowLeft className="w-4 h-4" />
            Projects
          </button>
          <div className={`w-px h-4 ${activeColors.border} mr-2`}></div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`${ui.textMuted} ${ui.highlight} transition-colors`} title="Toggle Sidebar">
            <LayoutPanelLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setActiveView({ type: 'project' })}
            className={`bg-transparent border-none outline-none text-sm font-semibold tracking-wide hover:underline cursor-pointer ${activeView.type === 'project' ? activeColors.text : ui.textMuted} truncate max-w-[200px] text-left flex items-center gap-1.5`}
            title="Project Overview"
          >
            {activeProject.title || "Untitled Project"}
            <LayoutTemplate className={`w-3.5 h-3.5 ${activeView.type === 'project' ? 'text-indigo-500' : 'opacity-50'}`} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4">
          <div className={`relative flex items-center bg-black/5 rounded-md border ${activeColors.border} px-3 py-1.5`}>
            <Search className={`w-4 h-4 ${ui.textMuted} mr-2`} />
            <input 
              value={sceneSearchQuery}
              onChange={e => setSceneSearchQuery(e.target.value)}
              placeholder="Search scenes..."
              className={`bg-transparent border-none outline-none text-sm w-full ${activeColors.text} placeholder:opacity-50`}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 mr-2" title="Editor Font">
            <Type className={`w-4 h-4 ${ui.textMuted}`} />
            <select
              value={editorFont}
              onChange={(e) => setEditorFont(e.target.value)}
              className={`bg-transparent text-sm font-medium ${ui.textMuted} outline-none ${ui.highlight} transition-colors cursor-pointer appearance-none`}
            >
              <option value="font-sans" className="text-black bg-white">Sans</option>
              <option value="font-serif" className="text-black bg-white">Serif</option>
              <option value="font-mono" className="text-black bg-white">Mono</option>
            </select>
          </div>
          <div className={`w-px h-4 ${activeColors.border} mx-1`}></div>
          
          <button onClick={() => syncWithCloud()} className={`${ui.textMuted} ${ui.highlight} transition-colors flex items-center gap-1.5`} title="Sync Offline Changes to Cloud">
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className={`w-px h-4 ${activeColors.border} mx-1`}></div>
          <button onClick={() => exportProjectJSON(activeProject)} className={`${ui.textMuted} ${ui.highlight} transition-colors`} title="Export JSON">
            <Download className="w-4 h-4" />
          </button>
          <div className={`w-px h-4 ${activeColors.border} mx-1`}></div>
          <button onClick={() => exportMarkdown(activeProject)} className={`${ui.textMuted} ${ui.highlight} transition-colors flex items-center gap-1.5`} title="Export Manuscript (.md)">
            <FileText className="w-4 h-4" />
          </button>
          <div className={`w-px h-4 ${activeColors.border} mx-1`}></div>
          <button onClick={() => setIsDistractionFree(true)} className={`${ui.textMuted} ${ui.highlight} transition-colors flex items-center gap-1.5`} title="Distraction Free Mode">
            <Maximize className="w-4 h-4" />
          </button>
          <div className={`w-px h-4 ${activeColors.border} mx-1`}></div>
          <button 
            onClick={() => setIsBibleOpen(!isBibleOpen)} 
            className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-md transition-colors ${isBibleOpen ? `${ui.textMain} font-medium ${ui.activeBg}` : `${ui.textMuted} ${ui.highlight} ${ui.hoverBg}`}`}
          >
            <Book className="w-4 h-4" />
            Bible
          </button>
          <div className={`w-px h-4 ${activeColors.border} mx-2`}></div>
          <UserAuth theme={workspace.theme} />
        </div>
      </header>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {isDistractionFree && (
          <div className="absolute top-4 right-4 z-50 text-xs font-mono opacity-20 hover:opacity-100 transition-opacity">
            <span className={ui.textMuted}>Press ESC to exit</span>
          </div>
        )}
        {isSidebarOpen && !isDistractionFree && (
          <Sidebar
            books={filteredBooks}
            activeView={activeView}
            onSelectView={setActiveView}
            onAddBook={handleAddBook}
            onAddScene={handleAddScene}
            onDeleteBook={handleDeleteBook}
            onDeleteScene={handleDeleteScene}
            updateBook={handleUpdateBook}
            updateScene={handleUpdateScene}
            isTrashDraftMode={isTrashDraftMode}
            setIsTrashDraftMode={setIsTrashDraftMode}
            theme={workspace.theme}
          />
        )}
        
        {renderMainContent()}

        <StoryBible
          project={activeProject}
          bible={activeProject.bible}
          isOpen={isBibleOpen}
          onClose={() => setIsBibleOpen(false)}
          onAddEntity={(entity) => updateActiveProject({ bible: [...activeProject.bible, { ...entity, id: crypto.randomUUID() }] })}
          onUpdateEntity={(id, updates) => {
            const newBible = activeProject.bible.map(e => e.id === id ? { ...e, ...updates } : e);
            let newBooks = activeProject.books;
            let newProjectOverview = activeProject.overview;
            if (updates.name) {
              const oldEntity = activeProject.bible.find(e => e.id === id);
              if (oldEntity && oldEntity.name !== updates.name) {
                const replaceStr = (str) => {
                  if (!str) return str;
                  return str.replace(/<span[^>]*data-bible-entity[^>]*>.*?<\/span>/g, (match) => {
                    if (match.includes(`id="${id}"`)) {
                      return `<span data-bible-entity="" id="${id}" name="${updates.name}">${updates.name}</span>`;
                    }
                    return match;
                  });
                };
                
                newProjectOverview = replaceStr(activeProject.overview);
                
                newBooks = activeProject.books.map(b => ({
                  ...b,
                  overview: replaceStr(b.overview),
                  scenes: b.scenes.map(s => {
                    return {
                      ...s,
                      overview: replaceStr(s.overview),
                      content: replaceStr(s.content)
                    };
                  })
                }));
              }
            }
            updateActiveProject({ bible: newBible, books: newBooks, overview: newProjectOverview });
          }}
          onDeleteEntity={(id) => {
            const newBible = activeProject.bible.filter(e => e.id !== id);
            const replaceStr = (str) => {
              if (!str) return str;
              return str.replace(/<span[^>]*data-bible-entity[^>]*>(.*?)<\/span>/g, (match, inner) => {
                if (match.includes(`id="${id}"`)) {
                  return inner;
                }
                return match;
              });
            };
            
            const newProjectOverview = replaceStr(activeProject.overview);
            
            const newBooks = activeProject.books.map(b => ({
              ...b,
              overview: replaceStr(b.overview),
              scenes: b.scenes.map(s => {
                return {
                  ...s,
                  overview: replaceStr(s.overview),
                  content: replaceStr(s.content)
                };
              })
            }));
            updateActiveProject({ bible: newBible, books: newBooks, overview: newProjectOverview });
          }}
          initialNewEntityName={pendingBibleEntity}
          onClearInitialNewEntityName={() => setPendingBibleEntity(undefined)}
          selectedEntityId={selectedBibleEntityId}
          theme={workspace.theme}
        />
      </div>
    </div>
  );
}
