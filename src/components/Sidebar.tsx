import React, { useState } from 'react';
import { Scene, Vibe, Theme, THEME_UI, BookData } from '../types';
import { Plus, Settings2, Trash2, Play, Square, ChevronDown, ChevronRight, Folder, FileText, LayoutTemplate } from 'lucide-react';
import { ActiveView } from '../App';

interface SidebarProps {
  books: BookData[];
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  onAddBook: () => void;
  onAddScene: (bookId: string) => void;
  onDeleteBook: (bookId: string) => void;
  onDeleteScene: (bookId: string, sceneId: string) => void;
  updateBook: (bookId: string, updates: Partial<BookData>) => void;
  updateScene: (updates: Partial<Scene>) => void;
  isTrashDraftMode: boolean;
  setIsTrashDraftMode: (active: boolean) => void;
  theme: Theme;
}

export function Sidebar({ books, activeView, onSelectView, onAddBook, onAddScene, onDeleteBook, onDeleteScene, updateBook, updateScene, isTrashDraftMode, setIsTrashDraftMode, theme }: SidebarProps) {
  const [expandedBooks, setExpandedBooks] = useState<Record<string, boolean>>(
    books.reduce((acc, book) => ({ ...acc, [book.id]: true }), {})
  );

  const toggleBook = (id: string) => {
    setExpandedBooks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const ui = THEME_UI[theme];
  
  // Find active scene for bottom footer
  let activeScene: Scene | undefined;
  if (activeView.type === 'scene') {
    for (const b of books) {
      const s = b.scenes.find(sc => sc.id === activeView.id);
      if (s) activeScene = s;
    }
  }
  
  const wordCount = activeScene?.content.trim() ? activeScene.content.trim().split(/\s+/).length : 0;

  return (
    <div className={`w-64 border-r ${ui.panelBorder} ${ui.panelBg} flex flex-col h-full ${ui.textMain} shrink-0 transition-colors duration-500`}>
      <div className={`p-4 border-b ${ui.panelBorder} flex items-center justify-between`}>
        <h2 className={`text-xs font-semibold uppercase tracking-widest ${ui.textMuted}`}>Books & Scenes</h2>
        <button onClick={onAddBook} className={`${ui.highlight} transition-colors`} title="Add Book">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {books.map((book) => (
          <div key={book.id} className="space-y-0.5">
            <div 
              className={`group flex items-center justify-between p-1.5 rounded-md cursor-pointer ${
                activeView.type === 'book' && activeView.id === book.id 
                  ? `${ui.activeBg} font-medium` 
                  : `${ui.hoverBg} ${ui.textMuted}`
              }`}
              onClick={() => onSelectView({ type: 'book', id: book.id })}
            >
              <div className="flex items-center gap-2 truncate flex-1">
                <div onClick={(e) => { e.stopPropagation(); toggleBook(book.id); }} className={`p-0.5 rounded hover:bg-black/10`}>
                  {expandedBooks[book.id] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>
                <Folder className="w-3.5 h-3.5" />
                <input
                  type="text"
                  value={book.title}
                  onChange={(e) => updateBook(book.id, { title: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className={`bg-transparent border-none outline-none text-xs font-semibold truncate flex-1 ${ui.textMain}`}
                />
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); onAddScene(book.id); setExpandedBooks(p => ({...p, [book.id]: true})); }}
                  className={`p-1 ${ui.highlight}`}
                  title="Add Scene to Book"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onSelectView({ type: 'book', id: book.id }); }}
                  className={`p-1 ${ui.highlight} ${activeView.type === 'book' && activeView.id === book.id ? 'text-indigo-500' : ''}`}
                  title="Book Overview"
                >
                  <LayoutTemplate className="w-3 h-3" />
                </button>
                {books.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteBook(book.id); }}
                    className="p-1 text-red-400 hover:text-red-500"
                    title="Delete Book"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
            
            {expandedBooks[book.id] && (
              <div className="pl-6 space-y-0.5 mt-0.5">
                {book.scenes.map((scene) => (
                  <div
                    key={scene.id}
                    onClick={() => onSelectView({ type: 'scene', id: scene.id, mode: 'draft' })}
                    className={`group flex items-center justify-between p-1.5 rounded-md cursor-pointer transition-colors ${
                      activeView.type === 'scene' && activeView.id === scene.id ? `${ui.activeBg} font-medium` : `${ui.hoverBg} ${ui.textMuted} ${ui.highlight}`
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getVibeColor(scene.vibe) }} />
                      <span className="text-sm truncate">{scene.title || 'Untitled'}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelectView({ type: 'scene', id: scene.id, mode: 'overview' }); }}
                        className={`p-1 ${ui.highlight} ${activeView.type === 'scene' && activeView.id === scene.id && activeView.mode === 'overview' ? 'text-indigo-500' : ''}`}
                        title="Scene Overview"
                      >
                        <LayoutTemplate className="w-3 h-3" />
                      </button>
                      {(books.length > 1 || book.scenes.length > 1) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteScene(book.id, scene.id); }}
                          className={`p-1 text-red-400 hover:text-red-500`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {book.scenes.length === 0 && (
                  <div className={`text-xs p-2 ${ui.textMuted} italic opacity-50`}>No scenes</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {activeScene && (
        <div className={`border-t ${ui.panelBorder} p-4 bg-black/5 flex flex-col gap-4`}>
          <div className={`flex items-center gap-2 ${ui.textMuted}`}>
            <Settings2 className="w-4 h-4" />
            <h2 className="text-xs font-semibold uppercase tracking-widest">Scene Settings</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className={ui.textMuted}>Words</span>
              <span className={`font-mono ${ui.textMain}`}>{wordCount} {activeScene.wordGoal ? `/ ${activeScene.wordGoal}` : ''}</span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className={ui.textMuted}>Vibe</span>
              <select
                value={activeScene.vibe}
                onChange={(e) => updateScene({ vibe: e.target.value as Vibe })}
                className={`bg-transparent text-right ${ui.textMain} outline-none ${ui.highlight} cursor-pointer appearance-none max-w-[120px] truncate`}
              >
                <option value="Neutral" className="text-black bg-white">Neutral</option>
                <option value="Melancholic Whimsy" className="text-black bg-white">Melancholic Whimsy</option>
                <option value="Anxious/Overwhelmed" className="text-black bg-white">Anxious/Overwhelmed</option>
                <option value="Calm/Integrated" className="text-black bg-white">Calm/Integrated</option>
              </select>
            </div>
            
            <button
              onClick={() => setIsTrashDraftMode(!isTrashDraftMode)}
              className={`w-full flex items-center justify-center gap-2 py-1.5 rounded text-xs font-medium transition-colors border ${
                isTrashDraftMode 
                  ? 'bg-red-950/40 text-red-500 border-red-900/50 hover:bg-red-900/40' 
                  : `${ui.panelBg} ${ui.textMuted} ${ui.panelBorder} ${ui.hoverBg} ${ui.highlight}`
              }`}
            >
              {isTrashDraftMode ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isTrashDraftMode ? 'Stop Trash Draft' : 'Start Trash Draft'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getVibeColor(vibe: Vibe) {
  switch (vibe) {
    case 'Neutral': return '#71717a'; // zinc-500
    case 'Melancholic Whimsy': return '#818cf8'; // indigo-400
    case 'Anxious/Overwhelmed': return '#fb7185'; // rose-400
    case 'Calm/Integrated': return '#2dd4bf'; // teal-400
  }
}
