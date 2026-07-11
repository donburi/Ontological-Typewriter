const admin = require('firebase-admin');
admin.initializeApp({
  projectId: "gen-lang-client-0019843499",
});
const db = admin.firestore();
db.settings({ databaseId: "ai-studio-ontologicaltypew-7e81ec13-8129-4729-8503-8c446134755c" });
async function test() {
  const snapshot = await db.collection('workspaces').get();
  snapshot.forEach(doc => {
    console.log(doc.id, '=>', JSON.stringify(doc.data(), null, 2));
  });
}
test().catch(console.error);
