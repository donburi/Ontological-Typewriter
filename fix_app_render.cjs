const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const renderMainContent = \(\) => \{[\s\S]*?\};\n\n  return \(/;
const newRender = `const renderMainContent = () => {
    if (activeView.type === 'project') {
      return (
        <OverviewEditor
          key="project"
          title={activeProject.title}
          subtitle="Project"
          content={activeProject.overview || ''}
          onUpdate={(content) => updateActiveProject({ overview: content })}
          onUpdateTitle={(title) => updateActiveProject({ title })}
          theme={workspace.theme}
          vibe="Neutral"
          bible={activeProject.bible}
          onAddToBible={handleAddToBible}
        />
      );
    }

    if (activeView.type === 'book' && activeBook) {
      return (
        <OverviewEditor
          key={\`book-\${activeBook.id}\`}
          title={activeBook.title}
          subtitle="Book"
          content={activeBook.overview || ''}
          onUpdate={(content) => handleUpdateBook(activeBook!.id, { overview: content })}
          onUpdateTitle={(title) => handleUpdateBook(activeBook!.id, { title })}
          theme={workspace.theme}
          vibe="Neutral"
          bible={activeProject.bible}
          onAddToBible={handleAddToBible}
        />
      );
    }

    if (activeView.type === 'scene' && activeScene) {
      if (activeView.mode === 'overview') {
        return (
          <OverviewEditor
            key={\`scene-overview-\${activeScene.id}\`}
            title={activeScene.title}
            subtitle="Scene"
            content={activeScene.overview || ''}
            onUpdate={(content) => handleUpdateScene({ overview: content })}
            onUpdateTitle={(title) => handleUpdateScene({ title })}
            theme={workspace.theme}
            vibe={activeScene.vibe}
            editorFont={editorFont}
            bible={activeProject.bible}
            onAddToBible={handleAddToBible}
          />
        );
      }
      
      if (activeView.mode === 'publisher') {
        return (
          <PublisherEditor
            key={\`scene-pub-\${activeScene.id}\`}
            title={activeScene.title}
            content={activeScene.content}
            onUpdate={(content) => handleUpdateScene({ content })}
            theme={workspace.theme}
          />
        );
      }
      
      if (activeView.mode === 'manuscript') {
        return (
          <ManuscriptEditor
            key={\`scene-manu-\${activeScene.id}\`}
            title={activeScene.title}
            content={activeScene.content}
            onUpdate={(content) => handleUpdateScene({ content })}
            theme={workspace.theme}
          />
        );
      }

      return (
        <Editor
          key={\`scene-\${activeScene.id}\`}
          scene={activeScene}
          updateScene={handleUpdateScene}
          theme={workspace.theme}
          editorFont={editorFont}
          bible={activeProject.bible}
          onAddToBible={handleAddToBible}
        />
      );
    }

    return null;
  };

  return (`;

code = code.replace(regex, newRender);
fs.writeFileSync('src/App.tsx', code);
