import React from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Unlink } from 'lucide-react';

export const BibleEntityComponent = (props: NodeViewProps) => {
  const { node, getPos, editor } = props;
  const { id, name } = node.attrs;

  const handleUnlink = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof getPos === 'function') {
      const pos = getPos();
      editor.chain().focus()
        .insertContentAt({ from: pos, to: pos + node.nodeSize }, name)
        .setTextSelection({ from: pos, to: pos + name.length })
        .setMark('noLink')
        .setTextSelection(pos + name.length) // move cursor to end of word
        .run();
    }
  };

  return (
    <NodeViewWrapper as="span" className="inline-block relative group" contentEditable={false}>
      <span 
        className="cursor-pointer border-b border-transparent hover:border-gray-400 border-dashed transition-colors text-inherit"
        onClick={() => {
          window.dispatchEvent(new CustomEvent('open-bible-entity', { detail: { id } }));
        }}
        title="View in Bible"
      >
        {name}
      </span>
      
      <button
        onClick={handleUnlink}
        contentEditable={false}
        className="absolute -top-8 left-1/2 -translate-x-1/2 p-1.5 bg-black text-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex items-center gap-1 z-50 text-xs pointer-events-auto"
        title="Unlink"
      >
        <Unlink className="w-3 h-3" />
        Unlink
      </button>
    </NodeViewWrapper>
  );
};

