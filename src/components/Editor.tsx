import React, { useState, useEffect, useRef } from 'react';
import { Scene, VIBE_COLORS, Theme, THEME_UI, SceneSnapshot, Entity } from '../types';
import { Play, Square, BookPlus, History, Save, RotateCcw, Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { BibleEntityNode } from '../extensions/BibleEntityNode';
import { AutoLinkBible } from '../extensions/AutoLinkBible';
import { NoLink } from '../extensions/NoLink';

interface EditorProps {
  scene: Scene;
  updateScene: (updates: Partial<Scene>) => void;
  onAddToBible: (text: string) => void;
  isTrashDraftMode: boolean;
  setIsTrashDraftMode: (active: boolean) => void;
  lastSaved?: number;
  editorFont: string;
  theme: Theme;
  bible: Entity[];
}

export function Editor({ scene, updateScene, onAddToBible, isTrashDraftMode, setIsTrashDraftMode, lastSaved, editorFont, theme, bible }: EditorProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [showSnapshots, setShowSnapshots] = useState(false);
  const bibleRef = useRef(bible);

  
  useEffect(() => { bibleRef.current = bible; }, [bible]);


  const colors = VIBE_COLORS[theme][scene.vibe];
  const ui = THEME_UI[theme];

  const placeholderPrompt = React.useMemo(() => {
    const prompts = [
      "Describe the silence...",
      "What is hidden in plain sight?",
      "Who is watching from the shadows?",
      "What is the scent in the air?",
      "Start typing your scene..."
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: isTrashDraftMode ? "Just write. No looking back..." : placeholderPrompt,
        emptyEditorClass: 'is-editor-empty',
      }),
      BibleEntityNode,
      NoLink,
      AutoLinkBible.configure({
        getEntities: () => bibleRef.current
      })
    ],
    content: scene.content,
    onUpdate: ({ editor }) => {
      updateScene({ content: editor.getHTML() });


    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, ' ');
      if (text && text.trim().length > 0) {
        setSelectedText(text.trim());
        setShowTooltip(true);
      } else {
        setShowTooltip(false);
      }
    },
    onBlur: () => setTimeout(() => setShowTooltip(false), 200),
    editorProps: {
      attributes: {
        class: `prose-editor w-full h-full outline-none text-lg leading-relaxed ${editorFont} transition-colors duration-700 ${isTrashDraftMode ? 'opacity-50 selection:bg-black/10' : `${colors.editorText} selection:bg-indigo-500/30`}`
      },
      handleKeyDown: (view, event) => {
        if (isTrashDraftMode) {
          if (event.key === 'Backspace' || event.key === 'Delete') {
            return true;
          }
        }
        return false;
      }
    }
  });
  
  useEffect(() => {
    if (editor) {
      editor.setOptions({
        editorProps: {
          attributes: {
            class: `prose-editor w-full h-full min-h-[500px] outline-none text-lg leading-relaxed ${editorFont} transition-colors duration-700 ${isTrashDraftMode ? 'opacity-50 selection:bg-black/10' : `${colors.editorText} selection:bg-indigo-500/30`}`
          },
          handleKeyDown: (view, event) => {
            if (isTrashDraftMode) {
              if (event.key === 'Backspace' || event.key === 'Delete') {
                return true;
              }
            }
            return false;
          }
        }
      })
    }
  }, [isTrashDraftMode, colors.editorText, editorFont]);

  useEffect(() => {
    let interval: number;
    if (isTrashDraftMode && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTrashDraftMode) {
      setIsTrashDraftMode(false);
      setTimeLeft(15 * 60); // Reset for next time
    }
    return () => clearInterval(interval);
  }, [isTrashDraftMode, timeLeft]);

  const startTrashDraft = () => {
    setIsTrashDraftMode(true);
    setTimeLeft(15 * 60);
    editor?.commands.focus();
  };

  const stopTrashDraft = () => {
    setIsTrashDraftMode(false);
    setTimeLeft(15 * 60);
  };

  const saveSnapshot = () => {
    const newSnapshot: SceneSnapshot = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      content: scene.content
    };
    updateScene({
      snapshots: [...(scene.snapshots || []), newSnapshot]
    });
  };

  const revertToSnapshot = (snapshot: SceneSnapshot) => {
    if (window.confirm('Are you sure you want to revert to this snapshot? Current unsaved changes may be lost if you haven\'t snapshotted them.')) {
      updateScene({ content: snapshot.content });
      editor?.commands.setContent(snapshot.content);
      setShowSnapshots(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const strippedContent = scene.content.replace(/<[^>]+>/g, '');
  const wordCount = strippedContent.trim() ? strippedContent.trim().split(/\s+/).length : 0;

  return (
    <div className="flex-1 flex flex-col h-full relative">
      <div className={`p-6 pb-2 flex justify-between items-center transition-colors duration-700 ${colors.border}`}>
        <input
          value={scene.title}
          onChange={(e) => updateScene({ title: e.target.value })}
          className={`text-2xl ${editorFont} tracking-tight bg-transparent border-none outline-none focus:ring-0 ${colors.text} placeholder:opacity-50 transition-colors duration-700 w-1/2`}
          placeholder="Scene Title..."
        />
        
        <div className="flex items-center gap-4">
          <select
            value={scene.vibe}
            onChange={(e) => updateScene({ vibe: e.target.value as Scene['vibe'] })}
            className={`bg-black/10 text-sm rounded-md px-3 py-1.5 border outline-none ${colors.border} ${colors.text} appearance-none cursor-pointer hover:bg-black/20 transition-colors`}
          >
            <option value="Neutral" className="text-black bg-white">Neutral</option>
            <option value="Melancholic Whimsy" className="text-black bg-white">Melancholic Whimsy</option>
            <option value="Anxious/Overwhelmed" className="text-black bg-white">Anxious/Overwhelmed</option>
            <option value="Calm/Integrated" className="text-black bg-white">Calm/Integrated</option>
          </select>

          {isTrashDraftMode ? (
            <div className="flex items-center gap-3 bg-red-950/40 text-red-500 px-4 py-1.5 rounded-full border border-red-900/50 shadow-sm">
              <span className="font-mono text-sm tracking-wider font-medium">{formatTime(timeLeft)}</span>
              <button onClick={stopTrashDraft} className="hover:text-red-700 transition-colors" title="Stop Trash Draft">
                <Square className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={startTrashDraft}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${colors.border} text-sm hover:bg-black/10 ${colors.text} opacity-80 hover:opacity-100 transition-colors`}
              title="Start 15m Trash Draft (No Backspace)"
            >
              <Play className="w-3.5 h-3.5" />
              <span className="font-medium tracking-wide">Trash Draft</span>
            </button>
          )}
          <button
            onClick={saveSnapshot}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${colors.border} text-sm hover:bg-black/10 ${colors.text} opacity-80 hover:opacity-100 transition-colors`}
            title="Save a snapshot of this scene"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="font-medium tracking-wide">Snapshot</span>
          </button>
        </div>
      </div>

      {editor && !isTrashDraftMode && (
        <div className={`px-6 py-2 border-b flex flex-wrap items-center gap-1 transition-colors duration-700 ${colors.border}`}>
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded hover:bg-black/10 ${editor.isActive('bold') ? 'bg-black/10' : ''}`}
            title="Bold"
          >
            <Bold className={`w-4 h-4 ${colors.text}`} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded hover:bg-black/10 ${editor.isActive('italic') ? 'bg-black/10' : ''}`}
            title="Italic"
          >
            <Italic className={`w-4 h-4 ${colors.text}`} />
          </button>
          <div className={`w-px h-4 mx-2 bg-current opacity-20 ${colors.text}`} />
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded hover:bg-black/10 ${editor.isActive('heading', { level: 1 }) ? 'bg-black/10' : ''}`}
            title="Heading 1"
          >
            <Heading1 className={`w-4 h-4 ${colors.text}`} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded hover:bg-black/10 ${editor.isActive('heading', { level: 2 }) ? 'bg-black/10' : ''}`}
            title="Heading 2"
          >
            <Heading2 className={`w-4 h-4 ${colors.text}`} />
          </button>
          <div className={`w-px h-4 mx-2 bg-current opacity-20 ${colors.text}`} />
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded hover:bg-black/10 ${editor.isActive('bulletList') ? 'bg-black/10' : ''}`}
            title="Bullet List"
          >
            <List className={`w-4 h-4 ${colors.text}`} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded hover:bg-black/10 ${editor.isActive('orderedList') ? 'bg-black/10' : ''}`}
            title="Ordered List"
          >
            <ListOrdered className={`w-4 h-4 ${colors.text}`} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded hover:bg-black/10 ${editor.isActive('blockquote') ? 'bg-black/10' : ''}`}
            title="Blockquote"
          >
            <Quote className={`w-4 h-4 ${colors.text}`} />
          </button>
        </div>
      )}

      <div className="flex-1 relative p-6 max-w-4xl w-full overflow-y-auto">
        <EditorContent editor={editor} className="w-full h-full" />

        <AnimatePresence>
          {showTooltip && !isTrashDraftMode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute right-8 top-8 z-50"
            >
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  onAddToBible(selectedText);
                  setShowTooltip(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 ${ui.tooltipBg} border ${ui.panelBorder} rounded-lg shadow-xl ${ui.textMain} hover:border-indigo-500 transition-colors`}
              >
                <BookPlus className="w-4 h-4" />
                <span className="text-sm font-medium">Add to Bible</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={`px-6 py-2 border-t flex justify-between items-center text-xs transition-colors duration-700 ${colors.border} ${colors.text} opacity-60 z-10 shrink-0 relative`}>
        <div className="flex items-center gap-4">
          <span className="font-mono tracking-tight">{wordCount} words</span>
          {scene.wordGoal && (
            <span className="flex items-center gap-2 font-mono tracking-tight">
              Goal: {scene.wordGoal} 
              <div className="w-24 h-1.5 bg-black/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-current transition-all duration-300" 
                  style={{ width: `${Math.min(100, (wordCount / scene.wordGoal) * 100)}%` }} 
                />
              </div>
              {wordCount >= scene.wordGoal && <span className="text-green-500 font-bold">✓</span>}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowSnapshots(!showSnapshots)}
              className="flex items-center gap-1.5 hover:opacity-100 opacity-80 transition-opacity"
            >
              <History className="w-3.5 h-3.5" />
              History
            </button>
            
            <AnimatePresence>
              {showSnapshots && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`absolute bottom-full right-0 mb-2 w-64 rounded-lg shadow-xl border ${ui.panelBorder} ${ui.panelBg} ${ui.textMain} overflow-hidden`}
                >
                  <div className={`p-3 border-b ${ui.panelBorder} flex justify-between items-center`}>
                    <span className="font-semibold text-sm">Version History</span>
                    <button
                      onClick={saveSnapshot}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${ui.highlight} ${ui.hoverBg}`}
                    >
                      <Save className="w-3 h-3" />
                      Save New
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {(!scene.snapshots || scene.snapshots.length === 0) ? (
                      <div className={`p-4 text-center ${ui.textMuted} text-xs italic`}>
                        No snapshots yet.
                      </div>
                    ) : (
                      scene.snapshots.sort((a, b) => b.timestamp - a.timestamp).map(snap => (
                        <div key={snap.id} className={`p-3 border-b ${ui.panelBorder} last:border-0 hover:bg-black/5 flex justify-between items-center group`}>
                          <div className="flex flex-col">
                            <span className="font-medium text-xs">
                              {new Date(snap.timestamp).toLocaleDateString()} {new Date(snap.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className={`text-[10px] ${ui.textMuted} truncate w-32`}>
                              {snap.content.replace(/<[^>]+>/g, '').substring(0, 30)}...
                            </span>
                          </div>
                          <button
                            onClick={() => revertToSnapshot(snap)}
                            className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-full ${ui.hoverBg} ${ui.highlight} transition-opacity`}
                            title="Revert to this snapshot"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            key={lastSaved}
            initial={{ opacity: 1, scale: 1.1 }}
            animate={{ opacity: 0.5, scale: 1 }}
            transition={{ duration: 1.5 }}
            className={`flex items-center gap-1.5 font-mono ${colors.text}`}
            title="Locally Saved"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            Saved
          </motion.div>

          <button 
            onClick={() => {
              const goal = prompt('Set word count goal for this scene:', scene.wordGoal?.toString() || '500');
              if (goal !== null) {
                const num = parseInt(goal);
                updateScene({ wordGoal: isNaN(num) ? undefined : num });
              }
            }}
            className="hover:opacity-100 opacity-80 transition-opacity underline decoration-dotted underline-offset-2"
          >
            {scene.wordGoal ? 'Edit Goal' : 'Set Goal'}
          </button>
        </div>
      </div>
      
      {isTrashDraftMode && (
         <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.04] overflow-hidden">
           <span className="font-mono text-[15vw] font-bold tracking-tighter text-red-500 whitespace-nowrap -rotate-12">TRASH DRAFT</span>
         </div>
      )}
    </div>
  );
}
