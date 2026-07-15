import React, { useState } from 'react';
import { ProjectData, Theme, THEME_UI } from '../types';
import { Plus, Trash2, Download, BookOpen, Clock, Moon, Sun, Coffee, Settings, RefreshCw, Upload } from 'lucide-react';

import { UserAuth } from './UserAuth';

interface DashboardProps {
  projects: ProjectData[];
  theme: Theme;
  onSelectProject: (id: string) => void;
  onAddProject: () => void;
  onDeleteProject: (id: string) => void;
  onUpdateProject: (id: string, updates: Partial<ProjectData>) => void;
  onExportProject: (project: ProjectData) => void;
  onChangeTheme: (theme: Theme) => void;
  onImportProject: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSyncWithCloud?: () => void;
}

export function Dashboard({ projects, theme, onSelectProject, onAddProject, onDeleteProject, onUpdateProject, onExportProject, onChangeTheme, onImportProject, onSyncWithCloud }: DashboardProps) {
  const ui = THEME_UI[theme];
  const sortedProjects = [...projects].sort((a, b) => b.lastModified - a.lastModified);
  
  const [settingsProject, setSettingsProject] = useState<ProjectData | null>(null);
  const [isImportPageOpen, setIsImportPageOpen] = useState(false);
  const [tempWordGoal, setTempWordGoal] = useState<string>('');
  const [tempProjectTitle, setTempProjectTitle] = useState<string>('');

  const handleOpenSettings = (project: ProjectData, e: React.MouseEvent) => {
    e.stopPropagation();
    setSettingsProject(project);
    setTempWordGoal(project.wordGoal ? project.wordGoal.toString() : '');
    setTempProjectTitle(project.title || '');
  };

  const handleSaveSettings = () => {
    if (settingsProject) {
      const goal = parseInt(tempWordGoal, 10);
      onUpdateProject(settingsProject.id, { 
        wordGoal: isNaN(goal) ? undefined : goal,
        title: tempProjectTitle.trim() || 'Untitled Project'
      });
      setSettingsProject(null);
    }
  };

  return (
    <div className={`h-screen w-full flex flex-col ${ui.panelBg} ${ui.textMain} transition-colors duration-500 overflow-y-auto font-sans`}>
      
      
      <header className={`px-8 py-6 border-b ${ui.panelBorder} flex items-center justify-between shrink-0`}>
        <div className="flex items-center gap-3">
          <BookOpen className={`w-6 h-6 ${ui.textMuted}`} />
          <h1 className="text-xl font-serif font-semibold tracking-tight">Ontological Typewriter</h1>
        </div>
        <div className="flex items-center gap-4">
          <UserAuth theme={theme} />
          <div className={`flex bg-black/5 rounded-lg p-1 border ${ui.panelBorder}`}>
            <button onClick={() => onChangeTheme('light')} className={`p-1.5 rounded-md transition-colors ${theme === 'light' ? 'bg-white shadow-sm text-black' : ui.textMuted}`}>
              <Sun className="w-4 h-4" />
            </button>
            <button onClick={() => onChangeTheme('sepia')} className={`p-1.5 rounded-md transition-colors ${theme === 'sepia' ? 'bg-[#e3d5b1] shadow-sm text-[#4a3b2c]' : ui.textMuted}`}>
              <Coffee className="w-4 h-4" />
            </button>
            <button onClick={() => onChangeTheme('dark')} className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'bg-zinc-800 shadow-sm text-white' : ui.textMuted}`}>
              <Moon className="w-4 h-4" />
            </button>
          </div>
          {onSyncWithCloud && (
            <button onClick={onSyncWithCloud} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border ${ui.panelBorder} rounded-lg ${ui.hoverBg} transition-colors`}>
              <RefreshCw className="w-4 h-4" />
              Sync
            </button>
          )}
          
          {isImportPageOpen ? (
            <button onClick={() => setIsImportPageOpen(false)} className={`px-4 py-2 text-sm font-medium border ${ui.panelBorder} rounded-lg ${ui.hoverBg} transition-colors`}>
              Cancel Import
            </button>
          ) : (
            <button onClick={() => setIsImportPageOpen(true)} className={`px-4 py-2 text-sm font-medium border ${ui.panelBorder} rounded-lg ${ui.hoverBg} transition-colors`}>
              Import
            </button>
          )}

          <button onClick={onAddProject} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </header>



      
      
      <div className="flex-1 p-8 max-w-6xl mx-auto w-full">
        {isImportPageOpen ? (
          <div className="max-w-3xl mx-auto mt-8">
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => setIsImportPageOpen(false)}
                className={`p-2 rounded-lg ${ui.hoverBg} transition-colors`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <h2 className="text-3xl font-serif font-bold">Import Project</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className={`border ${ui.panelBorder} rounded-xl p-8 flex flex-col ${ui.panelBg} shadow-sm`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>
                  </div>
                  <h3 className="font-semibold text-xl">JSON Backup</h3>
                </div>
                <p className={`text-base leading-relaxed ${ui.textMuted} mb-8 flex-1`}>
                  Restore a complete project backup. This preserves your entire structure including books, scenes, the Story Bible, vibes, and word goals.
                </p>
                <label className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload .json
                  <input type="file" accept=".json" onChange={(e) => { onImportProject(e); setIsImportPageOpen(false); }} className="hidden" />
                </label>
              </div>

              <div className={`border ${ui.panelBorder} rounded-xl p-8 flex flex-col ${ui.panelBg} shadow-sm`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
                  </div>
                  <h3 className="font-semibold text-xl">Markdown</h3>
                </div>
                <p className={`text-base leading-relaxed ${ui.textMuted} mb-8 flex-1`}>
                  Import a manuscript. Headings (#) become Books and (##) become Scenes. The "# Story Bible" section is parsed back into entities.
                </p>
                <label className={`w-full cursor-pointer border ${ui.panelBorder} ${ui.hoverBg} px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}>
                  <Upload className="w-5 h-5" />
                  Upload .md
                  <input type="file" accept=".md" onChange={(e) => { onImportProject(e); setIsImportPageOpen(false); }} className="hidden" />
                </label>
              </div>

            </div>
          </div>
        ) : (
          <>
            <h2 className={`text-sm font-semibold uppercase tracking-widest ${ui.textMuted} mb-6`}>Your Projects</h2>
            
            {projects.length === 0 ? (
              <div className={`text-center py-24 border-2 border-dashed ${ui.panelBorder} rounded-xl`}>
                <BookOpen className={`w-12 h-12 mx-auto mb-4 opacity-20 ${ui.textMain}`} />
                <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                <p className={`${ui.textMuted} mb-6 max-w-md mx-auto`}>Create your first project to start writing. Your work will be saved locally to your device.</p>
                <button onClick={onAddProject} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
                  Start Writing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedProjects.map(project => {
                  const booksCount = project.books ? project.books.length : 0;
                  const scenesCount = project.books ? project.books.reduce((acc, book) => acc + book.scenes.length, 0) : 0;
                  const wordCount = project.books ? project.books.reduce((acc, book) => acc + book.scenes.reduce((sAcc, scene) => sAcc + (scene.content.trim() ? scene.content.trim().split(/\s+/).length : 0), 0), 0) : 0;
                  
                  const today = new Date().toISOString().split('T')[0];
                  const todaySession = project.sessions?.find(s => s.date === today);
                  const todayWordCount = todaySession ? todaySession.wordCount : 0;
                  
                  const wordGoal = project.wordGoal || 0;
                  const progress = wordGoal > 0 ? Math.min(100, Math.max(0, (todayWordCount / wordGoal) * 100)) : 0;
                  const radius = 14;
                  const circumference = 2 * Math.PI * radius;
                  const offset = circumference - (progress / 100) * circumference;
                  
                  return (
                    <div key={project.id} className={`group border ${ui.panelBorder} rounded-xl p-5 ${ui.hoverBg} transition-colors flex flex-col relative`}>
                      <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => handleOpenSettings(project, e)} className={`p-1.5 rounded-md ${ui.highlight}`} title="Project Settings">
                          <Settings className="w-4 h-4" />
                        </button>

                        <div className="relative group/export inline-block" onClick={(e) => e.stopPropagation()}>
                          <button className={`p-1.5 rounded-md ${ui.highlight}`} title="Export Project">
                            <Download className="w-4 h-4" />
                          </button>
                          <div className={`absolute right-0 top-full mt-1 w-32 rounded-lg shadow-xl border ${ui.panelBorder} ${ui.panelBg} opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all z-50 flex flex-col overflow-hidden`}>
                            <button onClick={(e) => { e.stopPropagation(); onExportProject(project); }} className={`px-3 py-1.5 text-xs text-left ${ui.hoverBg}`}>JSON</button>
                          </div>
                        </div>

                        <button onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }} className="p-1.5 rounded-md text-red-500 hover:text-red-600 hover:bg-red-500/10" title="Delete Project">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="cursor-pointer flex-1" onClick={() => onSelectProject(project.id)}>
                        <div className="flex items-start justify-between pr-24 mb-2">
                          <h3 className="font-serif text-xl font-semibold truncate">{project.title}</h3>
                          {wordGoal > 0 && (
                            <div className="relative flex items-center justify-center shrink-0 ml-4" title={`Today's Goal: ${todayWordCount} / ${wordGoal} words`}>
                              <svg className="transform -rotate-90 w-8 h-8">
                                <circle cx="16" cy="16" r={radius} stroke="currentColor" strokeWidth="3" fill="transparent" className="opacity-20" />
                                <circle cx="16" cy="16" r={radius} stroke="currentColor" strokeWidth="3" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} className={`text-indigo-500 transition-all duration-1000 ${progress === 100 ? 'text-green-500' : ''}`} />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-xs font-mono ${ui.textMuted}`}>
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            {booksCount} Books ({scenesCount} Scenes)
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(project.lastModified).toLocaleDateString()}
                          </div>
                          <div>
                            {wordCount.toLocaleString()} Words
                          </div>
                          <div>
                            {project.bible?.length || 0} Entities
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
      
      {settingsProject && (


        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${ui.panelBg} border ${ui.panelBorder} rounded-xl shadow-2xl p-6 w-full max-w-sm`}>
            <h2 className="text-xl font-serif font-bold mb-4">Project Settings</h2>
            <div className="mb-4">
              <label className={`block text-sm font-medium ${ui.textMuted} mb-2`}>
                Project Title
              </label>
              <input
                type="text"
                value={tempProjectTitle}
                onChange={(e) => setTempProjectTitle(e.target.value)}
                placeholder="e.g. My Great Novel"
                className={`w-full bg-black/5 border ${ui.panelBorder} rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors`}
              />
            </div>
            <div className="mb-6">
              <label className={`block text-sm font-medium ${ui.textMuted} mb-2`}>
                Daily Word Count Goal
              </label>
              <input
                type="number"
                value={tempWordGoal}
                onChange={(e) => setTempWordGoal(e.target.value)}
                placeholder="e.g. 500"
                className={`w-full bg-black/5 border ${ui.panelBorder} rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors`}
              />
              <p className={`text-xs mt-2 ${ui.textMuted}`}>
                Set a daily writing goal to track your progress on the dashboard.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSettingsProject(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${ui.hoverBg} transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
