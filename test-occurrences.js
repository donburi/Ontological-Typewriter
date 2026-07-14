const content = '<p>Hello John, how are you? <span data-bible-entity id="123" name="John">John</span></p>';
const name = 'John';

const stripped = content.replace(/<[^>]*>?/gm, '');
const regex = new RegExp(`\\b(${name})\\b`, 'gi');
const matches = [...stripped.matchAll(regex)];
console.log(matches.length);
