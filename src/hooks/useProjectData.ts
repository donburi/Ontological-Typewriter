import { useState, useEffect } from 'react';
import { WorkspaceData, ProjectData, createNewProject, Theme } from '../types';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const STORAGE_KEY = 'ontological-typewriter-workspace';
const OLD_STORAGE_KEY = 'ontological-typewriter-data';

export function useProjectData() {
  const [user, authLoading] = useAuthState(auth);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUserUid, setCurrentUserUid] = useState<string | null | undefined>(undefined);
  
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
    if (authLoading) return; // Wait until auth state is resolved

    if (user) {
      if (currentUserUid === user.uid) return; // Already loaded for this user
      
      setIsLoaded(false); // Prevent saving while loading
      
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
                  return { ...p, books: [{ id: crypto.randomUUID(), title: 'Book 1', scenes: p.scenes }]  };
                }
                return p;
              });
            }
            
            setWorkspace(prevWorkspace => {
              const mergedProjects = new Map<string, ProjectData>();
              prevWorkspace.projects.forEach(p => mergedProjects.set(p.id, p));
              (cloudData.projects || []).forEach(cp => {
                const lp = mergedProjects.get(cp.id);
                if (!lp || (cp.lastModified > lp.lastModified)) {
                  mergedProjects.set(cp.id, cp);
                }
              });

              const mergedWorkspace: WorkspaceData = {
                ...cloudData,
                theme: prevWorkspace.theme,
                projects: Array.from(mergedProjects.values()).sort((a, b) => b.lastModified - a.lastModified),
                activeProjectId: prevWorkspace.activeProjectId || cloudData.activeProjectId,
              };
              
              setDoc(docRef, JSON.parse(JSON.stringify(mergedWorkspace))).catch(e => console.error('Failed to sync merged data', e));
              return mergedWorkspace;
            });
          } else {
            // First time login, save local workspace to cloud
            await setDoc(docRef, JSON.parse(JSON.stringify(workspace)));
          }
          setCurrentUserUid(user.uid);
          setIsLoaded(true);
        } catch (e) {
          console.error("Failed to load from cloud", e);
          setCurrentUserUid(user.uid);
          setIsLoaded(true);
        }
      };
      loadCloudData();
    } else {
      if (currentUserUid !== null) {
        setCurrentUserUid(null);
      }
      setIsLoaded(true);
    }
  }, [user, authLoading, currentUserUid]);

  // Save changes to local and cloud
  useEffect(() => {
    if (!isLoaded) return; // Don't save initial state back immediately before loading cloud
    if (user && currentUserUid !== user.uid) return; // Don't save if cloud data hasn't been loaded for this user yet
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
      setLastSaved(Date.now());
      
      if (user) {
        const docRef = doc(db, 'workspaces', user.uid);
        // We use a timeout to debounce slightly if needed, or just write directly.
        // For now direct write since it's a simple app.
        setDoc(docRef, JSON.parse(JSON.stringify(workspace))).catch(e => console.error('Cloud save failed', e));
      }
    } catch (e) {
      console.error('Failed to save workspace data', e);
    }
  }, [workspace, user, isLoaded, currentUserUid]);

  const syncWithCloud = async () => {
    if (!user) {
      alert("Please log in to sync data with the cloud.");
      return;
    }
    try {
      const docRef = doc(db, 'workspaces', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const cloudData = docSnap.data() as WorkspaceData;
        if (cloudData.projects) {
          cloudData.projects = cloudData.projects.map((p: any) => {
            if (p.scenes && !p.books) {
              return { ...p, books: [{ id: crypto.randomUUID(), title: 'Book 1', scenes: p.scenes }]  };
            }
            return p;
          });
        }
        
        setWorkspace(prevWorkspace => {
          const mergedProjects = new Map<string, ProjectData>();
          prevWorkspace.projects.forEach(p => mergedProjects.set(p.id, p));
          (cloudData.projects || []).forEach(cp => {
            const lp = mergedProjects.get(cp.id);
            if (!lp || (cp.lastModified > lp.lastModified)) {
              mergedProjects.set(cp.id, cp);
            }
          });

          const mergedWorkspace: WorkspaceData = {
            ...cloudData,
            theme: prevWorkspace.theme,
            projects: Array.from(mergedProjects.values()).sort((a, b) => b.lastModified - a.lastModified),
            activeProjectId: prevWorkspace.activeProjectId || cloudData.activeProjectId,
          };
          
          setDoc(docRef, JSON.parse(JSON.stringify(mergedWorkspace))).catch(e => console.error('Failed to sync merged data', e));
          return mergedWorkspace;
        });
        alert('Successfully synced with cloud!');
      } else {
        await setDoc(docRef, JSON.parse(JSON.stringify(workspace)));
        alert('Successfully uploaded local data to cloud!');
      }
    } catch (e) {
      console.error('Manual sync failed', e);
      alert('Failed to sync with cloud. Please try again.');
    }
  };

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

  
  const importProjectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) return;

      try {
        if (file.name.endsWith('.json')) {
          const importedData = JSON.parse(result);
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
        } else if (file.name.endsWith('.md')) {
          const lines = result.split('\n');
          const newProject: ProjectData = {
            id: crypto.randomUUID(),
            title: 'Imported Project',
            lastModified: Date.now(),
            books: [],
            bible: []
          };

          let projectTitleSet = false;
          let currentBook: any = null;
          let currentScene: any = null;
          let currentEntity: any = null;
          let inStoryBible = false;

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (line.trim() === '# Story Bible') {
              inStoryBible = true;
              currentScene = null;
              currentBook = null;
              continue;
            }

            if (inStoryBible) {
              if (line.startsWith('### ')) {
                const match = line.match(/^###\s+(.+?)(?:\s+\((.+?)\))?$/);
                if (match) {
                  currentEntity = {
                    id: crypto.randomUUID(),
                    name: match[1].trim(),
                    type: (match[2]?.trim()) || 'Character',
                    description: ''
                  };
                  newProject.bible.push(currentEntity);
                }
              } else if (currentEntity) {
                if (currentEntity.description) {
                  currentEntity.description += '\n' + line;
                } else {
                  if (line.trim() !== '') {
                    currentEntity.description = line;
                  }
                }
              }
            } else {
              if (line.startsWith('# ')) {
                const title = line.substring(2).trim();
                if (!projectTitleSet) {
                  newProject.title = title;
                  projectTitleSet = true;
                } else {
                  currentBook = {
                    id: crypto.randomUUID(),
                    title: title,
                    scenes: []
                  };
                  newProject.books.push(currentBook);
                  currentScene = null;
                }
              } else if (line.startsWith('## ')) {
                const title = line.substring(3).trim();
                currentScene = {
                  id: crypto.randomUUID(),
                  title: title,
                  content: '',
                  vibe: 'Neutral'
                };
                if (!currentBook) {
                  currentBook = {
                    id: crypto.randomUUID(),
                    title: 'Imported Book',
                    scenes: []
                  };
                  newProject.books.push(currentBook);
                }
                currentBook.scenes.push(currentScene);
              } else if (currentScene) {
                if (currentScene.content === '' && line.trim() === '') {
                  continue;
                }
                if (currentScene.content !== '') {
                  currentScene.content += '\n' + line;
                } else {
                  currentScene.content = line;
                }
              }
            }
          }

          newProject.books.forEach(b => {
            b.scenes.forEach(s => {
              s.content = s.content.trimEnd();
            });
          });

          setWorkspace(prev => ({
            ...prev,
            projects: [newProject, ...prev.projects]
          }));
        } else {
           alert('Unsupported file type. Please upload a .json or .md file.');
        }
      } catch (err) {
        alert('Failed to parse file.');
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

  return { workspace, updateActiveProject, updateProject, addProject, deleteProject, exportProjectJSON, importProjectFile, exportMarkdown, lastSaved, setTheme, setActiveProjectId, syncWithCloud };
}
