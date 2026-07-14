const fs = require('fs');
let code = fs.readFileSync('src/components/FeedbackModal.tsx', 'utf8');

code = code.replace(/import \{ collection, addDoc \} from 'firebase\/firestore';/, 'import { collection, addDoc, query, where, orderBy } from \'firebase/firestore\';\nimport { useCollectionData } from \'react-firebase-hooks/firestore\';');

const stateChanges = `
  const [activeTab, setActiveTab] = useState<'submit' | 'past'>('submit');
  
  const [pastFeedback, loadingPast] = useCollectionData(
    auth.currentUser ? query(
      collection(db, 'feedback'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    ) : null
  );
`;

code = code.replace(/const \[errorMsg, setErrorMsg\] = useState\(''\);/, 'const [errorMsg, setErrorMsg] = useState(\'\');\n' + stateChanges);

const formCode = `
        {auth.currentUser && (
          <div className="flex gap-4 mb-4 border-b border-black/10 dark:border-white/10">
            <button
              onClick={() => setActiveTab('submit')}
              className={\`pb-2 text-sm font-medium transition-colors \${activeTab === 'submit' ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400' : ui.textMuted}\`}
            >
              Submit Feedback
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={\`pb-2 text-sm font-medium transition-colors flex items-center gap-2 \${activeTab === 'past' ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400' : ui.textMuted}\`}
            >
              My Feedback
              {pastFeedback && pastFeedback.length > 0 && (
                <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs px-1.5 rounded-full">
                  {pastFeedback.length}
                </span>
              )}
            </button>
          </div>
        )}

        {activeTab === 'submit' ? (
          status === 'success' ? (
            <div className="text-center py-8 text-green-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-4" />
              <p className="font-medium text-lg">Thank you for your feedback!</p>
              <button 
                onClick={() => {
                  setStatus('idle');
                  setMessage('');
                  setActiveTab('past');
                }}
                className="mt-4 text-sm underline opacity-80 hover:opacity-100"
              >
                View my feedback
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className={\`text-sm \${ui.textMuted}\`}>
                We'd love to hear your thoughts, suggestions, or any issues you're experiencing.
              </p>
              
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What's on your mind?"
                className={\`w-full h-32 p-3 bg-transparent border \${ui.panelBorder} rounded-lg outline-none text-sm resize-none focus:ring-1 focus:ring-indigo-500\`}
                required
              />

              {status === 'error' && (
                <div className="flex items-start gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{errorMsg}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'submitting' || !message.trim()}
                className={\`w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50\`}
              >
                <Send className="w-4 h-4" />
                {status === 'submitting' ? 'Sending...' : 'Send Feedback'}
              </button>
            </form>
          )
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-auto">
            {loadingPast ? (
              <p className={\`text-sm \${ui.textMuted}\`}>Loading...</p>
            ) : pastFeedback?.length === 0 ? (
              <p className={\`text-sm \${ui.textMuted}\`}>You haven't submitted any feedback yet.</p>
            ) : (
              pastFeedback?.map((f: any, i: number) => (
                <div key={i} className={\`p-4 border \${ui.panelBorder} rounded-lg bg-black/5\`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm">You wrote:</span>
                    <span className={\`text-xs \${ui.textMuted}\`}>{new Date(f.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{f.message}</p>
                  
                  {f.reply && (
                    <div className="mt-4 p-3 rounded bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-indigo-700 dark:text-indigo-300 text-sm">Reply from Admin</span>
                        <span className={\`text-xs \${ui.textMuted}\`}>{f.repliedAt ? new Date(f.repliedAt).toLocaleString() : ''}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm">{f.reply}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
`;

code = code.replace(/\{status === 'success' \? \([\s\S]*?<\/form>\s*\)/, formCode);
// setTimeout(onClose, 2000) inside handleSubmit should be removed so user can see it in 'past'
code = code.replace(/setTimeout\(onClose, 2000\);/, '');

fs.writeFileSync('src/components/FeedbackModal.tsx', code);
