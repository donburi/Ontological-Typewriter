import React, { useState } from 'react';
import { Theme, THEME_UI } from '../types';
import { stringify } from '@vivliostyle/vfm';
import { Download } from 'lucide-react';

const PREDEFINED_THEMES: Record<string, string> = {
  'Standard Manuscript': `body {
  font-family: "Courier New", Courier, monospace;
  font-size: 12pt;
  line-height: 2;
  color: black;
  margin: 1in;
}
p {
  text-indent: 0.5in;
  margin-top: 0;
  margin-bottom: 0;
}
h1 {
  text-align: center;
  font-weight: normal;
  margin-bottom: 2em;
}`,
  'Novel Print': `body {
  font-family: "Garamond", "Georgia", serif;
  font-size: 11pt;
  line-height: 1.5;
  color: #111;
  margin: 40px auto;
  max-width: 600px;
}
p {
  text-indent: 1.5em;
  margin-top: 0;
  margin-bottom: 0;
  text-align: justify;
}
p:first-of-type {
  text-indent: 0;
}
p:first-of-type::first-letter {
  font-size: 3em;
  float: left;
  line-height: 0.8;
  padding-right: 0.1em;
}
h1 {
  text-align: center;
  font-weight: normal;
  font-size: 2.5em;
  margin-bottom: 1.5em;
}`,
  'Minimalist': `body {
  font-family: "Inter", "Helvetica Neue", sans-serif;
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  margin: 40px auto;
  max-width: 650px;
}
p {
  margin-top: 0;
  margin-bottom: 1.5em;
}
h1 {
  font-weight: 600;
  font-size: 2.5em;
  letter-spacing: -0.02em;
  margin-bottom: 1em;
  color: #000;
}`
};

export const PublisherEditor = ({ title, content, onUpdate, theme, onExportEPUB, project, onUpdateProject }: any) => {
  const ui = THEME_UI[theme as Theme];
  const [css, setCss] = useState(PREDEFINED_THEMES['Novel Print']);

  const [activeTab, setActiveTab] = useState<'html'|'css'|'preview'|'metadata'>('preview');

  let processedContent = content;
  try {
    processedContent = stringify(content || '');
  } catch (e) {
    console.error("VFM processing error:", e);
  }

  const previewHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>${css}</style>
      </head>
      <body>
        <h1>${title}</h1>
        ${processedContent}
      </body>
    </html>
  `;

  return (
    <div className={`flex-1 flex flex-col h-full ${ui.panelBg} ${ui.textMain} p-6 overflow-hidden`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold font-serif tracking-tight">Publisher Mode</h2>
        <div className="flex gap-2 items-center">
          <button onClick={() => setActiveTab('metadata')} className={`px-4 py-1.5 rounded-full text-sm font-medium ${activeTab === 'metadata' ? ui.activeBg : ui.hoverBg}`}>EPUB Metadata</button>
          <button onClick={() => setActiveTab('html')} className={`px-4 py-1.5 rounded-full text-sm font-medium ${activeTab === 'html' ? ui.activeBg : ui.hoverBg}`}>HTML / VFM</button>
          <button onClick={() => setActiveTab('css')} className={`px-4 py-1.5 rounded-full text-sm font-medium ${activeTab === 'css' ? ui.activeBg : ui.hoverBg}`}>Custom CSS</button>
          <button onClick={() => setActiveTab('preview')} className={`px-4 py-1.5 rounded-full text-sm font-medium ${activeTab === 'preview' ? ui.activeBg : ui.hoverBg}`}>Typeset Preview</button>
          <div className="w-px h-6 bg-black/10 mx-2"></div>
          <button onClick={onExportEPUB} className={`px-4 py-1.5 rounded-full text-sm font-medium bg-black text-white hover:bg-black/80 flex items-center gap-2`}>
            <Download className="w-4 h-4" /> Export EPUB
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl shadow-sm border border-black/10 overflow-hidden">
        {activeTab === 'metadata' && (
          <div className="flex-1 overflow-auto p-8 bg-[#f8f9fa] text-black">
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-1">EPUB Metadata</h3>
                <p className="text-sm text-gray-500">Configure the metadata that will be included in the exported EPUB file.</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Title</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-black/20 rounded-md outline-none focus:border-black/50 bg-white"
                    value={project?.title || ''}
                    onChange={(e) => onUpdateProject({ title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Author</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-black/20 rounded-md outline-none focus:border-black/50 bg-white"
                    value={project?.author || ''}
                    onChange={(e) => onUpdateProject({ author: e.target.value })}
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Description</label>
                  <textarea 
                    className="w-full px-3 py-2 border border-black/20 rounded-md outline-none focus:border-black/50 bg-white min-h-[120px] resize-y"
                    value={project?.epubDescription || ''}
                    onChange={(e) => onUpdateProject({ epubDescription: e.target.value })}
                    placeholder="A brief summary of the book..."
                  />
                </div>
                
                <div className="pt-4 border-t border-black/10">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox"
                      className="w-4 h-4 rounded border-black/20 cursor-pointer"
                      checked={!!project?.generateTOC}
                      onChange={(e) => onUpdateProject({ generateTOC: e.target.checked })}
                    />
                    <div>
                      <div className="text-sm font-semibold">Auto-generate Table of Contents</div>
                      <div className="text-xs text-gray-500">Automatically extract H1 and H2 headers from the manuscript content to include in the EPUB.</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'html' && (
           <textarea 
             className="flex-1 w-full p-6 font-mono text-sm outline-none text-black bg-[#f8f9fa] resize-none"
             value={content}
             onChange={(e) => onUpdate(e.target.value)}
             placeholder="Raw HTML or VFM content..."
           />
        )}
        {activeTab === 'css' && (
          <div className="flex-1 flex flex-col md:flex-row min-h-0 w-full h-full">
            <div className="w-full md:w-1/3 flex flex-col border-b md:border-b-0 md:border-r border-black/10">
              <div className="p-3 bg-[#f8f9fa] text-xs font-mono text-gray-500 font-bold border-b border-black/10 flex justify-between items-center tracking-wider">
                <span>styles.css</span>
                <select 
                  className="bg-white border border-black/20 rounded px-2 py-1 text-xs outline-none"
                  onChange={(e) => {
                    const selected = e.target.value;
                    if (selected && PREDEFINED_THEMES[selected]) {
                      setCss(PREDEFINED_THEMES[selected]);
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>Load Template...</option>
                  {Object.keys(PREDEFINED_THEMES).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <textarea 
                className="flex-1 p-4 font-mono text-sm outline-none text-black bg-[#f8f9fa] resize-none"
                value={css}
                onChange={(e) => setCss(e.target.value)}
                placeholder="body { ... }"
                spellCheck={false}
              />
            </div>
            <div className="w-full md:w-2/3 flex flex-col bg-gray-100">
              <div className="p-3 bg-gray-200/50 text-xs font-mono text-gray-500 font-bold border-b border-black/10 uppercase tracking-wider">Live Preview</div>
              <iframe 
                className="flex-1 w-full h-full bg-white"
                srcDoc={previewHtml}
                title="CSS Live Preview"
              />
            </div>
          </div>
        )}
        {activeTab === 'preview' && (
           <iframe 
             className="flex-1 w-full h-full bg-white"
             srcDoc={previewHtml}
             title="Typeset Preview"
           />
        )}
      </div>
    </div>
  );
};
