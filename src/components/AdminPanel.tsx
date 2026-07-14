import React, { useState } from 'react';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { useCollectionData, useCollection } from 'react-firebase-hooks/firestore';
import { db, auth } from '../lib/firebase';
import { ShieldAlert, Users, MessageSquare, X } from 'lucide-react';
import { THEME_UI, Theme } from '../types';

interface AdminPanelProps {
  theme: Theme;
  onClose: () => void;
}

export function AdminPanel({ theme, onClose }: AdminPanelProps) {
  const ui = THEME_UI[theme];
  const [activeTab, setActiveTab] = useState<'users' | 'feedback'>('users');

const isAdmin = auth.currentUser?.email === 'procyin@gmail.com';
  const [users, loadingUsers, errorUsers] = useCollectionData(
    isAdmin ? query(collection(db, 'users'), orderBy('createdAt', 'desc')) : null
  );
  
  const [feedbackSnapshot, loadingFeedback, errorFeedback] = useCollection(
    isAdmin ? query(collection(db, 'feedback'), orderBy('createdAt', 'desc')) : null
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



  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className={`border ${ui.panelBorder} ${ui.panelBg} p-8 rounded-xl max-w-sm w-full text-center`}>
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className={`${ui.textMuted} mb-6`}>You do not have permission to view this page.</p>
          <button onClick={onClose} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`border ${ui.panelBorder} ${ui.panelBg} rounded-xl max-w-4xl w-full h-[80vh] flex flex-col shadow-2xl overflow-hidden`}>
        <div className={`p-4 border-b ${ui.panelBorder} flex justify-between items-center bg-black/5`}>
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-serif font-bold">Admin Panel</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('users')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'users' ? 'bg-indigo-600 text-white' : ui.hoverBg}`}
              >
                <Users className="w-4 h-4" />
                Users
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'feedback' ? 'bg-indigo-600 text-white' : ui.hoverBg}`}
              >
                <MessageSquare className="w-4 h-4" />
                Feedback
              </button>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg ${ui.hoverBg} transition-colors`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'users' && (
            <div>
              {loadingUsers ? <p className={ui.textMuted}>Loading users...</p> : errorUsers ? <p className="text-red-500">Error: {errorUsers.message}</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className={`border-b ${ui.panelBorder}`}>
                        <th className="pb-3 font-semibold">Email</th>
                        <th className="pb-3 font-semibold">Joined</th>
                        <th className="pb-3 font-semibold">Last Login</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users?.map((u, i) => (
                        <tr key={i} className={`border-b ${ui.panelBorder} ${ui.hoverBg}`}>
                          <td className="py-3">{u.email}</td>
                          <td className="py-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="py-3">{new Date(u.lastLoginAt).toLocaleString()}</td>
                        </tr>
                      ))}
                      {users?.length === 0 && (
                        <tr>
                          <td colSpan={3} className={`py-8 text-center ${ui.textMuted}`}>No users found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-4">
              {loadingFeedback ? <p className={ui.textMuted}>Loading feedback...</p> : errorFeedback ? <p className="text-red-500">Error: {errorFeedback.message}</p> : (
                
                <>
                  {feedback?.map((f: any) => (
                    <div key={f.id} className={`p-4 border ${ui.panelBorder} rounded-lg bg-black/5`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{f.email}</span>
                        <span className={`text-xs ${ui.textMuted}`}>{new Date(f.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{f.message}</p>
                      
                      {f.reply ? (
                        <div className={`mt-4 p-3 rounded bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30`}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-indigo-700 dark:text-indigo-300 text-sm">Reply from Admin</span>
                            <span className={`text-xs ${ui.textMuted}`}>{f.repliedAt ? new Date(f.repliedAt).toLocaleString() : ''}</span>
                          </div>
                          <p className="whitespace-pre-wrap text-sm">{f.reply}</p>
                        </div>
                      ) : (
                        <div className="mt-4 flex gap-2">
                          <textarea
                            value={replyText[f.id] || ''}
                            onChange={(e) => setReplyText({ ...replyText, [f.id]: e.target.value })}
                            placeholder="Type a reply..."
                            className={`flex-1 p-2 bg-transparent border ${ui.panelBorder} rounded-lg outline-none text-sm resize-none focus:ring-1 focus:ring-indigo-500 min-h-[40px]`}
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
                    <div className={`py-8 text-center ${ui.textMuted}`}>No feedback yet.</div>
                  )}
                </>

              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
