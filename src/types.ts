export type EntityType = 'Character' | 'Setting' | 'Lore' | 'Object';

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  description: string;
  linkedEntityIds?: string[];
  lastModified?: number;
}

export type Vibe = 'Neutral' | 'Melancholic Whimsy' | 'Anxious/Overwhelmed' | 'Calm/Integrated';

export interface SceneSnapshot {
  id: string;
  timestamp: number;
  content: string;
}

export interface Scene {
  id: string;
  title: string;
  content: string;
  overview?: string;
  vibe: Vibe;
  wordGoal?: number;
  snapshots?: SceneSnapshot[];
}

export interface BookData {
  id: string;
  title: string;
  overview?: string;
  scenes: Scene[];
}

export interface WritingSession {
  date: string; // YYYY-MM-DD
  wordCount: number;
}

export interface ProjectData {
  id: string;
  title: string;
  author?: string;
  epubDescription?: string;
  generateTOC?: boolean;
  overview?: string;
  books: BookData[];
  bible: Entity[];
  lastModified: number;
  wordGoal?: number;
  sessions?: WritingSession[];
}

export type Theme = 'dark' | 'light' | 'sepia';

export interface WorkspaceData {
  projects: ProjectData[];
  activeProjectId: string | null;
  theme: Theme;
}

export const VIBE_COLORS: Record<Theme, Record<Vibe, { bg: string, text: string, editorText: string, border: string }>> = {
  dark: {
    'Neutral': { bg: 'bg-[#121214]', text: 'text-zinc-100', editorText: 'text-zinc-300', border: 'border-zinc-800' },
    'Melancholic Whimsy': { bg: 'bg-[#15131f]', text: 'text-indigo-100', editorText: 'text-indigo-200', border: 'border-indigo-900/50' },
    'Anxious/Overwhelmed': { bg: 'bg-[#1a1111]', text: 'text-rose-100', editorText: 'text-rose-200', border: 'border-rose-900/50' },
    'Calm/Integrated': { bg: 'bg-[#111815]', text: 'text-teal-100', editorText: 'text-teal-200', border: 'border-teal-900/50' }
  },
  light: {
    'Neutral': { bg: 'bg-zinc-50', text: 'text-zinc-900', editorText: 'text-zinc-700', border: 'border-zinc-200' },
    'Melancholic Whimsy': { bg: 'bg-indigo-50/50', text: 'text-indigo-950', editorText: 'text-indigo-800', border: 'border-indigo-200' },
    'Anxious/Overwhelmed': { bg: 'bg-rose-50/50', text: 'text-rose-950', editorText: 'text-rose-800', border: 'border-rose-200' },
    'Calm/Integrated': { bg: 'bg-teal-50/50', text: 'text-teal-950', editorText: 'text-teal-800', border: 'border-teal-200' }
  },
  sepia: {
    'Neutral': { bg: 'bg-[#fbf4e6]', text: 'text-[#4a3b2c]', editorText: 'text-[#695842]', border: 'border-[#e6d9c3]' },
    'Melancholic Whimsy': { bg: 'bg-[#f3efed]', text: 'text-[#3b3a4a]', editorText: 'text-[#585569]', border: 'border-[#dcd9df]' },
    'Anxious/Overwhelmed': { bg: 'bg-[#fdf4f0]', text: 'text-[#4a2c2c]', editorText: 'text-[#694242]', border: 'border-[#e6c3c3]' },
    'Calm/Integrated': { bg: 'bg-[#eff7f4]', text: 'text-[#2c4a3b]', editorText: 'text-[#426958]', border: 'border-[#c3e6d9]' }
  }
};

export const THEME_UI: Record<Theme, { panelBg: string, panelBorder: string, textMain: string, textMuted: string, hoverBg: string, activeBg: string, inputBg: string, highlight: string, tooltipBg: string }> = {
  dark: {
    panelBg: 'bg-[#0a0a0c]', panelBorder: 'border-zinc-800', textMain: 'text-zinc-200', textMuted: 'text-zinc-500', hoverBg: 'hover:bg-zinc-800/40', activeBg: 'bg-zinc-800/80', inputBg: 'bg-zinc-900', highlight: 'text-zinc-400 hover:text-white', tooltipBg: 'bg-zinc-900'
  },
  light: {
    panelBg: 'bg-zinc-100', panelBorder: 'border-zinc-300', textMain: 'text-zinc-900', textMuted: 'text-zinc-500', hoverBg: 'hover:bg-zinc-200/50', activeBg: 'bg-zinc-200', inputBg: 'bg-white', highlight: 'text-zinc-600 hover:text-black', tooltipBg: 'bg-white'
  },
  sepia: {
    panelBg: 'bg-[#f4ecd8]', panelBorder: 'border-[#d3c5a3]', textMain: 'text-[#4a3b2c]', textMuted: 'text-[#85735c]', hoverBg: 'hover:bg-[#e8ddc0]', activeBg: 'bg-[#e3d5b1]', inputBg: 'bg-[#fff9e6]', highlight: 'text-[#6b5840] hover:text-[#2c2217]', tooltipBg: 'bg-[#fff9e6]'
  }
};

export const createNewProject = (): ProjectData => ({
  id: crypto.randomUUID(),
  title: "Untitled Project",
  lastModified: Date.now(),
  books: [
    {
      id: crypto.randomUUID(),
      title: "Book 1",
      scenes: [
        {
          id: crypto.randomUUID(),
          title: "Scene 1",
          content: "",
          vibe: "Neutral"
        }
      ]
    }
  ],
  bible: []
});

export type ActiveView = 
  | { type: 'project' }
  | { type: 'book'; id: string }
  | { type: 'scene'; id: string; mode: 'draft' | 'overview' };
