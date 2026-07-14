const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Replace useCollectionData with useCollection for feedback
code = code.replace(/import \{ useCollectionData \} from 'react-firebase-hooks\/firestore';/, 'import { useCollectionData, useCollection } from \'react-firebase-hooks/firestore\';');
code = code.replace(/import \{ collection, query, orderBy \} from 'firebase\/firestore';/, 'import { collection, query, orderBy, doc, updateDoc } from \'firebase/firestore\';');

const feedbackState = `
  const [feedbackSnapshot, loadingFeedback, errorFeedback] = useCollection(
    query(collection(db, 'feedback'), orderBy('createdAt', 'desc'))
  );
  
  const feedback = feedbackSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [];
  
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [submittingReply, setSubmittingReply] = useState<string | null>(null);

  const handleReply = async (id: string) => {
    const text = replyText[id];
    if (!text?.trim()) return;
    setSubmittingReply(id);
    try {
      await updateDoc(doc(db, 'feedback', id), {
        reply: text.trim(),
        repliedAt: Date.now()
      });
    } catch (e) {
      console.error(e);
    }
    setSubmittingReply(null);
  };
`;

code = code.replace(/const \[feedback, loadingFeedback, errorFeedback\] = useCollectionData\([\s\S]*?\);/, feedbackState);

const feedbackList = `
                <>
                  {feedback?.map((f: any) => (
                    <div key={f.id} className={\`p-4 border \${ui.panelBorder} rounded-lg bg-black/5\`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{f.email}</span>
                        <span className={\`text-xs \${ui.textMuted}\`}>{new Date(f.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{f.message}</p>
                      
                      {f.reply ? (
                        <div className={\`mt-4 p-3 rounded bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30\`}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-indigo-700 dark:text-indigo-300 text-sm">Reply from Admin</span>
                            <span className={\`text-xs \${ui.textMuted}\`}>{f.repliedAt ? new Date(f.repliedAt).toLocaleString() : ''}</span>
                          </div>
                          <p className="whitespace-pre-wrap text-sm">{f.reply}</p>
                        </div>
                      ) : (
                        <div className="mt-4 flex gap-2">
                          <textarea
                            value={replyText[f.id] || ''}
                            onChange={(e) => setReplyText({ ...replyText, [f.id]: e.target.value })}
                            placeholder="Type a reply..."
                            className={\`flex-1 p-2 bg-transparent border \${ui.panelBorder} rounded-lg outline-none text-sm resize-none focus:ring-1 focus:ring-indigo-500 min-h-[40px]\`}
                          />
                          <button
                            onClick={() => handleReply(f.id)}
                            disabled={submittingReply === f.id || !replyText[f.id]?.trim()}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm transition-colors hover:bg-indigo-700 disabled:opacity-50 self-end"
                          >
                            {submittingReply === f.id ? '...' : 'Reply'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {feedback?.length === 0 && (
                    <div className={\`py-8 text-center \${ui.textMuted}\`}>No feedback yet.</div>
                  )}
                </>
`;

code = code.replace(/<>\s*\{feedback\?\.map\(\(f, i\) => \([\s\S]*?<\/>\s*\)\}/, feedbackList + '\n              )}');

fs.writeFileSync('src/components/AdminPanel.tsx', code);
