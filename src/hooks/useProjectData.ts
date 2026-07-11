import { useState, useEffect } from 'react';
import { WorkspaceData, ProjectData, createNewProject, Theme } from '../types';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const STORAGE_KEY = 'ontological-typewriter-workspace';
const OLD_STORAGE_KEY = 'ontological-typewriter-data';

export function useProjectData() {
  const [user] = useAuthState(auth);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [workspace, setWorkspace] = useState<WorkspaceData>(() => {
    // Initial local load for immediate render if logged out or while loading
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        let parsed = JSON.parse(stored);
        if (parsed.projects) {
          parsed.projects = parsed.projects.map((p: any) => {
            if (p.scenes && !p.books) {
              return { ...p, books: [{ id: crypto.randomUUID(), title: 'Book 1', scenes: p.scenes }],  };
            }
            return p;
          });
        }
        return parsed;
      }
      
      const oldStored = localStorage.getItem(OLD_STORAGE_KEY);
      if (oldStored) {
        const parsed = JSON.parse(oldStored);
        const migratedProject: ProjectData = {
          ...parsed,
          id: crypto.randomUUID(),
          lastModified: Date.now(),
          books: parsed.scenes ? [{ id: crypto.randomUUID(), title: 'Book 1', scenes: parsed.scenes }] : [],
          
        };
        return { projects: [migratedProject], activeProjectId: null, theme: 'dark' };
      }
    } catch (e) {
      console.error('Failed to load project data', e);
    }
    return { projects: [], activeProjectId: null, theme: 'dark' };
  });

  const [lastSaved, setLastSaved] = useState<number>(Date.now());

  // Load from Firestore when user logs in
  useEffect(() => {
    if (user) {
      const loadCloudData = async () => {
        try {
          const docRef = doc(db, 'workspaces', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const cloudData = docSnap.data() as WorkspaceData;
            // Basic migration for cloud data as well
            if (cloudData.projects) {
              cloudData.projects = cloudData.projects.map((p: any) => {
                if (p.scenes && !p.books) {
                  return { ...p, books: [{ id: crypto.randomUUID(), title: 'Book 1', scenes: p.scenes }],  };
                }
                return p;
              });
            }
            // Merge with local data? For simplicity, we just override with cloud data if it exists
            // Or we could check lastModified. Let's just override with cloud data.
            setWorkspace(cloudData);
          } else {
            // First time login, save local workspace to cloud
            await setDoc(docRef, workspace);
          }
          setIsLoaded(true);
        } catch (e) {
          console.error("Failed to load from cloud", e);
          setIsLoaded(true);
        }
      };
      loadCloudData();
    } else {
      setIsLoaded(true);
    }
  }, [user]);

  // Save changes to local and cloud
  useEffect(() => {
    if (!isLoaded) return; // Don't save initial state back immediately before loading cloud
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
      setLastSaved(Date.now());
      
      if (user) {
        const docRef = doc(db, 'workspaces', user.uid);
        // We use a timeout to debounce slightly if needed, or just write directly.
        // For now direct write since it's a simple app.
        setDoc(docRef, workspace).catch(e => console.error('Cloud save failed', e));
      }
    } catch (e) {
      console.error('Failed to save workspace data', e);
    }
  }, [workspace, user, isLoaded]);

  const updateActiveProject = (updates: Partial<ProjectData>) => {
    setWorkspace(prev => ({
      ...prev,
      projects: prev.projects.map(p => 
         p.id === prev.activeProjectId ? { ...p, ...updates, lastModified: Date.now() } : p
      )
    }));
  };

  const updateProject = (id: string, updates: Partial<ProjectData>) => {
    setWorkspace(prev => ({
      ...prev,
      projects: prev.projects.map(p => 
         p.id === id ? { ...p, ...updates, lastModified: Date.now() } : p
      )
    }));
  };

  const addProject = () => {
    const newProject = createNewProject();
    setWorkspace(prev => ({
      ...prev,
      projects: [newProject, ...prev.projects],
      activeProjectId: newProject.id
    }));
  };

  const deleteProject = (id: string) => {
    if (!confirm("Are you sure you want to delete this project? This cannot be undone.")) return;
    setWorkspace(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id),
      activeProjectId: prev.activeProjectId === id ? null : prev.activeProjectId
    }));
  };

  const exportProjectJSON = (project: ProjectData) => {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '_').toLowerCase()}_export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importProjectJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (importedData) {
          let books = importedData.books || [];
          if (importedData.scenes && !importedData.books) {
            books = [{ id: crypto.randomUUID(), title: 'Book 1', scenes: importedData.scenes }];
          }
          
          const newProject: ProjectData = {
            ...importedData,
            books,
            id: crypto.randomUUID(),
            lastModified: Date.now()
          };
          setWorkspace(prev => ({
            ...prev,
            projects: [newProject, ...prev.projects]
          }));
        }
      } catch (err) {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const exportMarkdown = (project: ProjectData) => {
    let md = `# ${project.title}\n\n`;
    project.books.forEach(book => {
      md += `# ${book.title}\n\n`;
      book.scenes.forEach(scene => {
        md += `## ${scene.title}\n\n${scene.content}\n\n`;
      });
    });
    
    if (project.bible.length > 0) {
      md += `---\n\n# Story Bible\n\n`;
      project.bible.forEach(entity => {
        md += `### ${entity.name} (${entity.type})\n${entity.description}\n\n`;
      });
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '_').toLowerCase()}_manuscript.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const setTheme = (theme: Theme) => setWorkspace(prev => ({ ...prev, theme }));
  const setActiveProjectId = (id: string | null) => setWorkspace(prev => ({ ...prev, activeProjectId: id }));

  return { workspace, updateActiveProject, updateProject, addProject, deleteProject, exportProjectJSON, importProjectJSON, exportMarkdown, lastSaved, setTheme, setActiveProjectId };
}
