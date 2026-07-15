import { ProjectData } from '../types';

export const exportProjectPDF = async (project: ProjectData) => {
  const content = document.createElement('div');
  content.innerHTML = `<h1>${project.title}</h1>`;
  
  project.books.forEach(book => {
    content.innerHTML += `<h2>${book.title}</h2>`;
    book.scenes.forEach(scene => {
      content.innerHTML += `<h3>${scene.title}</h3>`;
      content.innerHTML += `<div>${scene.content}</div>`;
    });
  });

  const opt = {
    margin:       1,
    filename:     `${project.title || 'project'}.pdf`,
    image:        { type: 'jpeg' as const, quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter' as const, orientation: 'portrait' as const }
  };
  
  const html2pdf = (await import('html2pdf.js')).default;
  html2pdf().set(opt).from(content).save();
};

export const exportProjectTXT = (project: ProjectData) => {
  let content = `${project.title.toUpperCase()}\n\n`;
  
  project.books.forEach(book => {
    content += `\n--- ${book.title.toUpperCase()} ---\n\n`;
    book.scenes.forEach(scene => {
      content += `\n# ${scene.title}\n\n`;
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = scene.content;
      content += tempDiv.innerText + '\n\n';
    });
  });

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.title || 'project'}_manuscript.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};


