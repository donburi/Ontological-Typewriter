import React, { useState } from 'react';
import { ProjectData, Theme, THEME_UI } from '../types';
import { Plus, Trash2, Download, BookOpen, Clock, Moon, Sun, Coffee, Settings, RefreshCw } from 'lucide-react';

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
          <label className={`cursor-pointer px-4 py-2 text-sm font-medium border ${ui.panelBorder} rounded-lg ${ui.hoverBg} transition-colors`}>
            Import JSON
            <input type="file" accept=".json" onChange={onImportProject} className="hidden" />
          </label>
          <button onClick={onAddProject} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </header>

      <div className="flex-1 p-8 max-w-6xl mx-auto w-full">
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
                    <button onClick={(e) => { e.stopPropagation(); onExportProject(project); }} className={`p-1.5 rounded-md ${ui.highlight}`} title="Export JSON">
                      <Download className="w-4 h-4" />
                    </button>
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
