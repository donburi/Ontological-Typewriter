import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { BibleEntityComponent } from './BibleEntityComponent';

export const BibleEntityNode = Node.create({
  name: 'bibleEntity',

  group: 'inline',

  inline: true,

  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
      },
      name: {
        default: null,
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-bible-entity]',
        getAttrs: (dom) => {
          if (typeof dom === 'string') return {};
          return {
            id: dom.getAttribute('id'),
            name: dom.getAttribute('name'),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-bible-entity': '' }), HTMLAttributes.name];
  },

  addNodeView() {
    return ReactNodeViewRenderer(BibleEntityComponent);
  },
});
