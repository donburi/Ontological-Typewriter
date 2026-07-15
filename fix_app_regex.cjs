const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacements = [
  ['import act', 'import React'],
  ['usStat', 'useState'],
  ['ract', 'react'],
  ['usProjctData', 'useProjectData'],
  ['componnts', 'components'],
  ['Sidbar', 'Sidebar'],
  ['OvrviwEditor', 'OverviewEditor'],
  ['StoryBibl', 'StoryBible'],
  ['typs', 'types'],
  ['frshCw', 'RefreshCw'],
  ['FilTxt', 'FileText'],
  ['LayoutPanlLft', 'LayoutPanelLeft'],
  ['Typ', 'Type'],
  ['ArrowLft', 'ArrowLeft'],
  ['Sarch', 'Search'],
  ['Maximiz', 'Maximize'],
  ['LayoutTmplat', 'LayoutTemplate'],
  ['lucid-ract', 'lucide-react'],
  ['xport typ', 'export type'],
  ['ActivViw', 'ActiveView'],
  ['projct', 'project'],
  ['scn', 'scene'],
  ['mod', 'mode'],
  ['publishr', 'publisher'],
  ['AdminPanl', 'AdminPanel'],
  ['FdbackModal', 'FeedbackModal'],
  ['firbas', 'firebase'],
  ['usAuthStat', 'useAuthState'],
  ['Shild', 'Shield'],
  ['MssagSquar', 'MessageSquare'],
  ['UsrAuth', 'UserAuth'],
  ['xport dfault', 'export default'],
  ['workspac', 'workspace'],
  ['updatActivProjct', 'updateActiveProject'],
  ['updatProjct', 'updateProject'],
  ['addProjct', 'addProject'],
  ['dltProjct', 'deleteProject'],
  ['xportProjctJSON', 'exportProjectJSON'],
  ['importProjctFil', 'importProjectFile'],
  ['xportMarkdown', 'exportMarkdown'],
  ['xportPDF', 'exportPDF'],
  ['xportTXT', 'exportTXT'],
  ['xportEPUB', 'exportEPUB'],
  ['lastSavd', 'lastSaved'],
  ['stThm', 'setTheme'],
  ['stActivProjctId', 'setActiveProjectId'],
  ['stActivViw', 'setActiveView'],
  ['fals', 'false'],
  ['tru', 'true'],
  ['pndingBiblEntity', 'pendingBibleEntity'],
  ['stPndingBiblEntity', 'setPendingBibleEntity'],
  ['slctdBiblEntityId', 'selectedBibleEntityId'],
  ['stSlctdBiblEntityId', 'setSelectedBibleEntityId'],
  ['isDistractionFr', 'isDistractionFree'],
  ['stIsDistractionFr', 'setIsDistractionFree'],
  ['isAdminOpn', 'isAdminOpen'],
  ['stIsAdminOpn', 'setIsAdminOpen'],
  ['isFdbackOpn', 'isFeedbackOpen'],
  ['stIsFdbackOpn', 'setIsFeedbackOpen'],
  ['stIsBiblOpn', 'setIsBibleOpen'],
  ['stIsSidbarOpn', 'setIsSidebarOpen'],
  ['stIsTrashDraftMod', 'setIsTrashDraftMode'],
  ['isTrashDraftMod', 'isTrashDraftMode'],
  ['isSidbarOpn', 'isSidebarOpen'],
  ['isBiblOpn', 'isBibleOpen'],
  ['usr', 'user'],
  ['activProjct', 'activeProject'],
  ['activBook', 'activeBook'],
  ['activScn', 'activeScene'],
  ['ditorFont', 'editorFont'],
  ['activColors', 'activeColors'],
  ['thm', 'theme'],
  ['bibl', 'bible'],
  ['handlAddToBibl', 'handleAddToBible'],
  ['handlUpdatScn', 'handleUpdateScene'],
  ['handlUpdatBook', 'handleUpdateBook'],
  ['onDltScn', 'onDeleteScene'],
  ['onSlctViw', 'onSelectView'],
  ['gtVibColor', 'getVibeColor'],
  ['rturn', 'return'],
  ['classNam', 'className'],
  ['flx', 'flex'],
  ['itms-cntr', 'items-center'],
  ['justify-btwn', 'justify-between'],
  ['justify-cntr', 'justify-center'],
  ['h-scrn', 'h-screen'],
  ['bordr-b', 'border-b'],
  ['bordr', 'border'],
  ['ovrflow-hiddn', 'overflow-hidden'],
  ['undfind', 'undefined'],
  ['titl', 'title'],
  ['subtitl', 'subtitle'],
  ['contnt', 'content'],
  ['ovrviw', 'overview'],
  ['onUpdat', 'onUpdate'],
  ['onUpdatTitl', 'onUpdateTitle'],
  ['vib', 'vibe'],
  ['Savd', 'Saved'],
  ['Txt', 'Text'],
  ['stActiv', 'setActive'],
  ['Dlt', 'Delete'],
  ['Scn', 'Scene'],
  ['Book', 'Book'], // no e
  ['updat', 'update'],
  ['dlt', 'delete'],
  ['slct', 'select'],
  ['activ', 'active'],
  ['Tmplat', 'Template'],
  ['Panl', 'Panel'],
  ['Lft', 'Left'],
  ['Typ', 'Type'], // already handled maybe
  ['hadr', 'header'],
  ['dfault', 'default'],
  ['xport', 'export'],
  ['stIs', 'setIs'],
  ['stPnd', 'setPend'],
  ['rpl', 'replace'],
  ['val', 'value'],
  ['rquir', 'require'],
  ['usAuth', 'useAuth'],
  ['Stat', 'State'],
  ['ky=', 'key='],
  ['typ', 'type'],
  ['mod=', 'mode='],
  ['pub', 'pub'],
  ['manu', 'manu'],
  ['ditor', 'editor'],
  ['Editor', 'Editor'],
  ['rturn', 'return'],
  ['nd', 'nd'],
  ['n', 'n'],
];

replacements.forEach(([from, to]) => {
  // We use word boundaries where possible, but not for all.
  // Actually, string replace global:
  const re = new RegExp(`\\b${from}\\b`, 'g');
  code = code.replace(re, to);
  
  // also some specific strings like ky=, mod= which are not word boundaries
  if (from === 'ky=') code = code.replace(/ky=/g, 'key=');
  if (from === 'mod=') code = code.replace(/mod=/g, 'mode=');
  if (from === 'classNam') code = code.replace(/classNam/g, 'className');
  if (from === 'flx') code = code.replace(/flx/g, 'flex');
  if (from === 'itms-cntr') code = code.replace(/itms-cntr/g, 'items-center');
  if (from === 'justify-btwn') code = code.replace(/justify-btwn/g, 'justify-between');
  if (from === 'justify-cntr') code = code.replace(/justify-cntr/g, 'justify-center');
  if (from === 'h-scrn') code = code.replace(/h-scrn/g, 'h-screen');
  if (from === 'bordr-b') code = code.replace(/bordr-b/g, 'border-b');
  if (from === 'bordr') code = code.replace(/bordr/g, 'border');
  if (from === 'ovrflow-hiddn') code = code.replace(/ovrflow-hiddn/g, 'overflow-hidden');
  if (from === 'hadr') code = code.replace(/hadr/g, 'header');
  if (from === 'lucid-ract') code = code.replace(/lucid-ract/g, 'lucide-react');
  if (from === 'xport') code = code.replace(/xport/g, 'export');
  if (from === 'typ') code = code.replace(/typ/g, 'type');
  if (from === 'mod') code = code.replace(/mod/g, 'mode');
  if (from === 'undfind') code = code.replace(/undfind/g, 'undefined');
});

fs.writeFileSync('src/App.tsx', code);
