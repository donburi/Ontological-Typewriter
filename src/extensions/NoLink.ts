import { Mark, mergeAttributes } from '@tiptap/core';

export const NoLink = Mark.create({
  name: 'noLink',

  parseHTML() {
    return [
      {
        tag: 'span[data-no-link]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-no-link': 'true' }), 0];
  },
});
