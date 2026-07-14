const str = '<p>Hello <span data-bible-entity="" id="123" name="Old">Old</span></p>';
const id = "123";
const updates = { name: "New" };
const replaceStr = (str) => {
  if (!str) return str;
  return str.replace(/<span[^>]*data-bible-entity[^>]*>.*?<\/span>/g, (match) => {
    if (match.includes(`id="${id}"`)) {
      return `<span data-bible-entity="" id="${id}" name="${updates.name}">${updates.name}</span>`;
    }
    return match;
  });
};
console.log(replaceStr(str));
