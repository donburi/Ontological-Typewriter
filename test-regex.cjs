const regex1 = /<span([^>]*)data-bible-entity([^>]*)id="123"([^>]*)name="([^"]*)"([^>]*)>([^<]*)<\/span>/g;
const html = `<span id="123" name="Bob" data-bible-entity="">Bob</span>`;
// This won't match if data-bible-entity comes after id in the regex!
