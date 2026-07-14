import React, { useEffect, useRef } from 'react';
import { VIBE_COLORS, Theme, THEME_UI, Vibe } from '../types';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { BibleEntityNode } from '../extensions/BibleEntityNode';
import { AutoLinkBible } from '../extensions/AutoLinkBible';
import { NoLink } from '../extensions/NoLink';
import { Entity } from '../types';
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote, Link as LinkIcon, Unlink } from 'lucide-react';

interface OverviewEditorProps {
  onUpdateTitle?: (title: string) => void;
  title: string;
  subtitle: string;
  content: string;
  onUpdate: (content: string) => void;
  theme: Theme;
  vibe?: Vibe;
  editorFont: string;
  bible: Entity[];
  onAddToBible: (text: string) => void;
}

export function OverviewEditor({ title, subtitle, content, onUpdate, onUpdateTitle, theme, vibe = 'Neutral', editorFont, bible, onAddToBible }: OverviewEditorProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [selectedText, setSelectedText] = React.useState('');
  const bibleRef = useRef(bible);
  
  const colors = VIBE_COLORS[theme][vibe];
  const ui = THEME_UI[theme];

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false
      }),
      Placeholder.configure({
        placeholder: "Write summary, structure, notes, research...",
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-indigo-500 hover:text-indigo-600 underline cursor-pointer',
        },
      }),
      BibleEntityNode,
      NoLink,
      AutoLinkBible.configure({
        getEntities: () => bibleRef.current
      })
    ],
    content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
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
  });

  useEffect(() => { bibleRef.current = bible; }, [bible]);
  
  useEffect(() => {
    if (editor && bibleRef.current !== bible) {
      bibleRef.current = bible;
      editor.view.dispatch(editor.state.tr.setMeta("update-bible", true));
    }
  }, [bible, editor]);

  // Sync content if it changes externally
  const prevContentRef = useRef(content);
  useEffect(() => {
    if (editor && content !== prevContentRef.current && content !== editor.getHTML()) {
      const { from, to } = editor.state.selection;
      editor.commands.setContent(content, { emitUpdate: false }); // false was wrong type for SetContentOptions
      try {
        editor.commands.setTextSelection({ from, to });
      } catch (e) {}
      prevContentRef.current = content;
    }
  }, [content, editor]);

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-black/5">
      <div className={`p-8 pb-4 border-b ${colors.border}`}>
        <h3 className={`text-sm font-semibold tracking-widest uppercase ${ui.textMuted} mb-2`}>{subtitle} Overview</h3>
        {onUpdateTitle ? (
          <input
            value={title}
            onChange={(e) => onUpdateTitle(e.target.value)}
            className={`text-4xl ${editorFont} font-bold tracking-tight ${colors.text} bg-transparent border-none outline-none focus:ring-0 w-full`}
            placeholder={`${subtitle} Title...`}
          />
        ) : (
          <h1 className={`text-4xl ${editorFont} font-bold tracking-tight ${colors.text}`}>{title}</h1>
        )}
      </div>

      {editor && (
        <div className={`px-6 py-2 border-b flex flex-wrap items-center gap-1 transition-colors duration-700 ${colors.border} bg-black/5`}>
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
          <div className={`w-px h-4 mx-2 bg-current opacity-20 ${colors.text}`} />
          <button
            onClick={setLink}
            className={`p-1.5 rounded hover:bg-black/10 ${editor.isActive('link') ? 'bg-black/10' : ''}`}
            title="Link"
          >
            <LinkIcon className={`w-4 h-4 ${colors.text}`} />
          </button>
          <button
            onClick={() => editor.chain().focus().unsetLink().run()}
            className={`p-1.5 rounded hover:bg-black/10`}
            disabled={!editor.isActive('link')}
            title="Unlink"
          >
            <Unlink className={`w-4 h-4 ${colors.text} ${!editor.isActive('link') ? 'opacity-30' : ''}`} />
          </button>
        </div>
      )}

      <div className="flex-1 relative p-8 max-w-none w-full overflow-y-auto">
        <EditorContent editor={editor} className={`w-full h-full prose-editor outline-none text-lg leading-relaxed ${editorFont} ${colors.editorText} selection:bg-indigo-500/30`} />
        {showTooltip && (
          <div
            className="absolute right-8 top-8 z-50 animate-in fade-in slide-in-from-top-2"
          >
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                onAddToBible(selectedText);
                setShowTooltip(false);
              }}
              className={`flex items-center gap-2 px-4 py-2 ${ui.tooltipBg || 'bg-white'} border ${ui.panelBorder} rounded-lg shadow-xl ${ui.textMain} hover:border-indigo-500 transition-colors`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M9 10h6"/><path d="M12 7v6"/></svg>
              <span className="text-sm font-medium">Add to Bible</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
