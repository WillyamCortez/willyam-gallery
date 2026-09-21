const fs = require('fs');
const path = require('path');
function walk(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      walk(file);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(file, 'utf8');
      const original = content;
      content = content.replace(/transition=\{\{\s*duration:\s*[\d.]+,\s*ease:\s*"[^"]+"\s*\}\}/g, 'transition={{ type: "spring", bounce: 0, duration: 0.4 }}');
      if (original !== content) {
        fs.writeFileSync(file, content);
        console.log('Updated', file);
      }
    }
  });
}
walk('./src');
