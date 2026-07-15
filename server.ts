import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import EpubModule from "epub-gen-memory";

import { stringify } from '@vivliostyle/vfm';
import { EpubCheck } from "@likecoin/epubcheck-ts";
const Epub = (EpubModule as any).default || EpubModule;

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for large projects
  app.use(express.json({ limit: '50mb' }));

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/gemini/vibe-check", async (req, res) => {
    try {
      const { text, vibe, bible } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "API key not configured" });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `Analyze this text snippet for consistency with the intended vibe: "${vibe}". 
Text: "${text}"

Relevant story entities for context (if any):
${JSON.stringify(bible)}

Please provide a brief, constructive "silent AI" critique (max 2 sentences) on how well the text matches the intended vibe, and optionally suggest one thematic word or phrase to enhance it. Do not format with markdown, just plain text.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ feedback: response.text });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Failed to generate AI feedback" });
    }
  });

  app.post("/api/export/epub", async (req, res) => {
    try {
      const project = req.body;
      
      const chapters: any[] = [];
      let globalIdCounter = 0;
      const tocEntries: {text: string, level: number, filename: string, id: string}[] = [];
      
      project.books.forEach((book: any, bookIndex: number) => {
        book.scenes.forEach((scene: any, sceneIndex: number) => {
          let processedContent = scene.content;
          try {
            processedContent = stringify(scene.content || '');
          } catch (e) {
            console.error("VFM Parse error:", e);
          }
          
          let chapterContent = `<h1>${scene.title}</h1><br/>${processedContent}`;
          const filename = `chapter-${bookIndex}-${sceneIndex}.xhtml`;

          if (project.generateTOC) {
            chapterContent = chapterContent.replace(/<(h[12])\b([^>]*)>(.*?)<\/\1>/gi, (match, tag, attrs, innerText) => {
              const plainText = innerText.replace(/<[^>]+>/g, '').trim();
              
              let idMatch = attrs.match(/id=['"]([^'"]+)['"]/i);
              let id = '';
              let newAttrs = attrs;
              
              if (idMatch) {
                id = idMatch[1];
              } else {
                id = `toc-${globalIdCounter++}`;
                newAttrs = ` id="${id}"${attrs}`;
              }
              
              tocEntries.push({
                text: plainText,
                level: tag.toLowerCase() === 'h1' ? 1 : 2,
                filename,
                id
              });
              
              return `<${tag}${newAttrs}>${innerText}</${tag}>`;
            });
          }
          
          chapters.push({
            title: `${book.title} - ${scene.title}`,
            author: project.author || 'Ontological Typewriter',
            content: chapterContent,
            filename
          });
        });
      });

      if (project.generateTOC && tocEntries.length > 0) {
        let tocHtml = `<h1 id="toc-title">Table of Contents</h1>\n<ul class="toc-list" style="list-style-type: none; padding-left: 0;">\n`;
        let currentLevel = 1;
        
        tocEntries.forEach(entry => {
          if (entry.level > currentLevel) {
            tocHtml += `<ul style="list-style-type: none; padding-left: 1.5rem;">\n`;
            currentLevel = entry.level;
          } else if (entry.level < currentLevel) {
            tocHtml += `</ul>\n`;
            currentLevel = entry.level;
          }
          
          const margin = entry.level === 1 ? 'margin-top: 1rem; font-weight: bold;' : 'margin-top: 0.5rem;';
          tocHtml += `<li style="${margin}"><a href="${entry.filename}#${entry.id}" style="text-decoration: none; color: inherit;">${entry.text}</a></li>\n`;
        });
        
        while (currentLevel > 1) {
          tocHtml += `</ul>\n`;
          currentLevel--;
        }
        tocHtml += `</ul>`;
        
        chapters.unshift({
          title: "Table of Contents",
          author: project.author || 'Ontological Typewriter',
          content: tocHtml,
          filename: "toc-page.xhtml",
          beforeToc: true
        });
      }

      const epubBuffer = await Epub({
        title: project.title || 'Untitled',
        author: project.author || 'Ontological Typewriter',
        description: project.epubDescription || '',
        cover: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070&auto=format&fit=crop',
      }, chapters);
      
      // Validate using epubcheck
      let isValid = true;
      let checkMessages = [];
      try {
        const checkResult = await EpubCheck.validate(epubBuffer);
        isValid = checkResult.valid;
        checkMessages = checkResult.messages;
      } catch (checkErr) {
        console.error("Epubcheck error:", checkErr);
      }

      res.setHeader('Content-Type', 'application/epub+zip');
      res.setHeader('X-Epub-Valid', isValid ? 'true' : 'false');
      res.setHeader('Content-Disposition', `attachment; filename="${project.title.replace(/\s+/g, '_')}.epub"`);
      res.send(epubBuffer);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Failed to generate EPUB" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Express 4 uses * for catch-all
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
