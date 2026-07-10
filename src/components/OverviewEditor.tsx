import React, { useEffect } from 'react';
import { VIBE_COLORS, Theme, THEME_UI, Vibe } from '../types';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote, Link as LinkIcon, Unlink } from 'lucide-react';

interface OverviewEditorProps {
  title: string;
  subtitle: string;
  content: string;
  onUpdate: (content: string) => void;
  theme: Theme;
  vibe?: Vibe;
  editorFont: string;
}

export function OverviewEditor({ title, subtitle, content, onUpdate, theme, vibe = 'Neutral', editorFont }: OverviewEditorProps) {
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
      })
    ],
    content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
  });

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

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-black/5">
      <div className={`p-8 pb-4 border-b ${colors.border}`}>
        <h3 className={`text-sm font-semibold tracking-widest uppercase ${ui.textMuted} mb-2`}>{subtitle} Overview</h3>
        <h1 className={`text-4xl ${editorFont} font-bold tracking-tight ${colors.text}`}>{title}</h1>
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

      <div className="flex-1 relative p-8 max-w-4xl w-full overflow-y-auto">
        <EditorContent editor={editor} className={`w-full h-full prose-editor outline-none text-lg leading-relaxed ${editorFont} ${colors.editorText} selection:bg-indigo-500/30`} />
      </div>
    </div>
  );
}
