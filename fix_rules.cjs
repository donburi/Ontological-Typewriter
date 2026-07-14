const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

code = code.replace(/&& incoming\(\)\.createdAt == request\.time\.toMillis\(\)/g, '');

const feedbackMatch = `
    match /feedback/{feedbackId} {
      allow read: if isAdmin() || (isSignedIn() && resource.data.userId == request.auth.uid);
      allow create: if isSignedIn() && incoming().userId == request.auth.uid && isValidFeedback(incoming());
      allow update: if isAdmin();
    }`;

code = code.replace(/match \/feedback\/\{feedbackId\} \{[\s\S]*?\}/, feedbackMatch);

fs.writeFileSync('firestore.rules', code);
