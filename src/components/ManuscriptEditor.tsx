import React, { useState } from 'react';
import { Theme, THEME_UI } from '../types';

export const ManuscriptEditor = ({ title, content, onUpdate, theme, readOnly = false }: any) => {
  const ui = THEME_UI[theme as Theme];
  
  // A simple plain text fallback for the HTML content.
  // We'll strip HTML for now, or assume it's markdown.
  // This is a minimal raw editor where authors can focus on the text itself.
  
  return (
    <div className={`flex-1 flex flex-col h-full ${ui.panelBg} ${ui.textMain} items-center overflow-y-auto`}>
      <div className="w-full max-w-3xl my-12 bg-white text-black p-12 min-h-screen shadow-md rounded-sm border border-black/5">
        <h1 className="text-4xl font-serif text-center mb-12 uppercase tracking-widest">{title || 'Untitled'}</h1>
        <textarea 
          className="w-full min-h-[800px] bg-transparent border-none outline-none font-serif text-lg leading-relaxed resize-none"
          value={content}
          onChange={(e) => onUpdate ? onUpdate(e.target.value) : null}
          placeholder="Start writing..."
          spellCheck={false}
          readOnly={readOnly || !onUpdate}
        />
      </div>
    </div>
  );
};
