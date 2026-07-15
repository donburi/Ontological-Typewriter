const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// We will use stringify from @vivliostyle/vfm and validate with @likecoin/epubcheck-ts
code = code.replace(
  /import EpubModule from "epub-gen-memory";/,
  `import EpubModule from "epub-gen-memory";
import { stringify } from "@vivliostyle/vfm";
import epubcheck from "@likecoin/epubcheck-ts";`
);

const newEpubLogic = `
  app.post("/api/export/epub", async (req, res) => {
    try {
      const project = req.body;
      
      const chapters = [];
      project.books.forEach((book: any) => {
        book.scenes.forEach((scene: any) => {
          // Check if content looks like HTML or VFM Markdown
          // If it starts with < and has >, it's probably HTML from standard editor.
          // Otherwise, it might be markdown from Manuscript Mode. We can safely process it with stringify.
          // Wait, stringify from @vivliostyle/vfm converts Markdown to HTML.
          // To be safe, we always use stringify. If it's already HTML, markdown parsers usually keep it intact.
          let processedContent = scene.content;
          try {
            processedContent = stringify(scene.content || '');
          } catch (e) {
            console.error("VFM Parse error:", e);
          }
          
          chapters.push({
            title: \`\${book.title} - \${scene.title}\`,
            author: 'Ontological Typewriter',
            content: \`<h1>\${scene.title}</h1><br/>\${processedContent}\`
          });
        });
      });

      const epubBuffer = await Epub({
        title: project.title || 'Untitled',
        author: 'Ontological Typewriter',
        cover: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070&auto=format&fit=crop',
      }, chapters);
      
      // Save buffer to temporary file for checking
      const tmpPath = path.join(process.cwd(), 'temp-' + Date.now() + '.epub');
      fs.writeFileSync(tmpPath, epubBuffer);
      
      // Validate using epubcheck
      let isValid = true;
      let checkMessages = [];
      try {
        const checkResult = await epubcheck(tmpPath);
        isValid = checkResult.checker.isSuccess;
        checkMessages = checkResult.messages;
      } catch (checkErr) {
        console.error("Epubcheck error:", checkErr);
      } finally {
        fs.unlinkSync(tmpPath); // Cleanup
      }

      res.setHeader('Content-Type', 'application/epub+zip');
      res.setHeader('X-Epub-Valid', isValid ? 'true' : 'false');
      res.setHeader('Content-Disposition', \`attachment; filename="\${project.title.replace(/\\s+/g, '_')}.epub"\`);
      res.send(epubBuffer);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Failed to generate EPUB" });
    }
  });
`;

code = code.replace(
  /app\.post\("\/api\/export\/epub", async \(req, res\) => \{[\s\S]*?res\.status\(500\)\.json\(\{ error: "Failed to generate EPUB" \}\);\n    \}\n  \}\);/,
  newEpubLogic.trim()
);

// We need to import fs if not already imported
if (!code.includes("import fs from")) {
  code = code.replace(/import path from "path";/, 'import path from "path";\nimport fs from "fs";');
}

fs.writeFileSync('server.ts', code);
