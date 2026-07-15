import React, { useState } from 'react';
import { PublisherEditor } from './PublisherEditor';
import { ManuscriptEditor } from './ManuscriptEditor';
import { ChevronDown, ChevronRight, BookOpen, FileText } from 'lucide-react';
import { Theme, THEME_UI, ProjectData } from '../types';

interface PublicationPanelProps {
  project: ProjectData;
  theme: Theme;
  onUpdateProject: (updates: any) => void;
  onExportEPUB: () => void;
}

export function PublicationPanel({ project, theme, onUpdateProject, onExportEPUB }: PublicationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'publisher' | 'manuscript'>('publisher');
  const ui = THEME_UI[theme];

  const publisherContent = project.books.map(b => b.scenes.map(s => `<h2>${s.title}</h2><br/>${s.content}`).join('<br/><br/>')).join('<br/><br/>');
  const manuscriptContent = project.books.map(b => b.scenes.map(s => s.title + '\n\n' + (s.content||'').replace(/<[^>]+>/g, '')).join('\n\n')).join('\n\n');

  return (
    <div className={`border-t ${ui.panelBorder} bg-black/5 flex flex-col transition-all duration-300 ${isOpen ? 'h-full flex-1 min-h-[500px]' : 'h-auto'}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 p-4 w-full text-left font-semibold hover:bg-black/5 transition-colors ${ui.textMain}`}
      >
        {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        Publication Panel
      </button>

      {isOpen && (
        <div className="flex-1 flex flex-col overflow-hidden border-t border-black/5">
          <div className="flex items-center gap-4 px-4 py-2 bg-black/5 border-b border-black/5">
            <button
              onClick={() => setActiveTab('publisher')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'publisher' ? 'bg-white shadow-sm text-black' : ui.textMuted}`}
            >
              <BookOpen className="w-4 h-4" />
              Publisher
            </button>
            <button
              onClick={() => setActiveTab('manuscript')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'manuscript' ? 'bg-white shadow-sm text-black' : ui.textMuted}`}
            >
              <FileText className="w-4 h-4" />
              Manuscript
            </button>
          </div>
          
          <div className="flex-1 overflow-hidden">
            {activeTab === 'publisher' ? (
              <PublisherEditor
                title={project.title}
                content={publisherContent}
                theme={theme}
                onExportEPUB={onExportEPUB}
                project={project}
                onUpdateProject={onUpdateProject}
              />
            ) : (
              <ManuscriptEditor
                title={project.title}
                content={manuscriptContent}
                theme={theme}
                readOnly={true}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
