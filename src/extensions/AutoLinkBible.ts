import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Entity } from '../types';

export interface AutoLinkBibleOptions {
  getEntities: () => Entity[];
}

export const AutoLinkBible = Extension.create<AutoLinkBibleOptions>({
  name: 'autoLinkBible',
  
  addOptions() {
    return {
      getEntities: () => [],
    };
  },

  addProseMirrorPlugins() {
    const { getEntities } = this.options;
    
    return [
      new Plugin({
        key: new PluginKey('autoLinkBibleSuggestions'),
        state: {
          init(config, instance) {
            return DecorationSet.empty;
          },
          apply(tr, oldSet, oldState, newState) {
            const entities = getEntities();
            if (entities.length === 0) return DecorationSet.empty;
            
            // Recompute decorations
            const decos: Decoration[] = [];
            const sortedEntities = [...entities].sort((a, b) => b.name.length - a.name.length);
            
            newState.doc.descendants((node, pos) => {
              if (node.isText) {
                const text = node.text || '';
                if (node.marks && node.marks.some(m => m.type.name === 'noLink')) return false;

                for (const entity of sortedEntities) {
                   const regex = new RegExp(`\\b(${escapeRegExp(entity.name)})\\b`, 'gi');
                   let match;
                   
                   while ((match = regex.exec(text)) !== null) {
                     const start = pos + match.index;
                     const end = start + match[0].length;
                     
                     // Avoid overlap
                     const overlaps = decos.some(d => (start < d.to && end > d.from));
                     if (!overlaps) {
                       decos.push(Decoration.inline(start, end, {
                         class: 'cursor-pointer border-b-2 border-indigo-500/40 hover:bg-indigo-500/20 hover:border-indigo-500 transition-colors rounded-sm px-0.5 -mx-0.5 bible-entity-suggestion',
                         'data-entity-id': entity.id,
                         'data-entity-name': entity.name,
                         title: 'Click to link to Story Bible'
                       }));
                     }
                   }
                }
              }
              return true;
            });
            
            return DecorationSet.create(newState.doc, decos);
          }
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
          handleClick(view, pos, event) {
            const target = event.target as HTMLElement;
            if (target && target.classList && target.classList.contains('bible-entity-suggestion')) {
              const entityId = target.getAttribute('data-entity-id');
              const entityName = target.getAttribute('data-entity-name') || target.innerText;
              
              if (entityId) {
                const pluginState = this.getState(view.state) as DecorationSet;
                const decos = pluginState.find(pos, pos);
                const deco = decos.find(d => d.spec['data-entity-id'] === entityId);
                
                if (deco) {
                  const { from, to } = deco;
                  const tr = view.state.tr;
                  const bibleNode = view.state.schema.nodes.bibleEntity.create({ id: entityId, name: entityName });
                  tr.replaceWith(from, to, bibleNode);
                  view.dispatch(tr);
                  return true; // handled
                }
              }
            }
            return false;
          }
        }
      })
    ];
  },
});

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
