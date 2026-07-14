const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importAdminFeedback = `import { AdminPanel } from './components/AdminPanel';
import { FeedbackModal } from './components/FeedbackModal';
import { auth } from './lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Shield, MessageSquare } from 'lucide-react';`;

code = code.replace(/import \{ UserAuth \} from '\.\/components\/UserAuth';/, importAdminFeedback + '\nimport { UserAuth } from \'./components/UserAuth\';');

const stateCode = `
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [user] = useAuthState(auth);
`;

code = code.replace(/const \[isDistractionFree, setIsDistractionFree\] = useState\(false\);/, 'const [isDistractionFree, setIsDistractionFree] = useState(false);\n' + stateCode);

const buttonsCode = `
          <button onClick={() => setIsFeedbackOpen(true)} className={\`\${ui.textMuted} \${ui.highlight} transition-colors flex items-center gap-1.5\`} title="Send Feedback">
            <MessageSquare className="w-4 h-4" />
          </button>
          <div className={\`w-px h-4 \${activeColors.border} mx-1\`}></div>
          
          {user?.email === 'procyin@gmail.com' && (
            <>
              <button onClick={() => setIsAdminOpen(true)} className={\`\${ui.textMuted} \${ui.highlight} transition-colors flex items-center gap-1.5\`} title="Admin Panel">
                <Shield className="w-4 h-4" />
              </button>
              <div className={\`w-px h-4 \${activeColors.border} mx-1\`}></div>
            </>
          )}

          <button 
`;
code = code.replace(/<button \n\s*onClick=\{\(\) => setIsBibleOpen\(!isBibleOpen\)\}/, buttonsCode + '          <button \n            onClick={() => setIsBibleOpen(!isBibleOpen)}');

const modalsCode = `
      {isAdminOpen && (
        <AdminPanel theme={workspace.theme} onClose={() => setIsAdminOpen(false)} />
      )}
      {isFeedbackOpen && (
        <FeedbackModal theme={workspace.theme} onClose={() => setIsFeedbackOpen(false)} />
      )}
    </div>
  );
}`;

code = code.replace(/<\/div>\n\s*<\/div>\n\s*\);\n\}/, '      </div>\n' + modalsCode);

fs.writeFileSync('src/App.tsx', code);
