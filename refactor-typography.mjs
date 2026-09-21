import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const dir = './src';
let count = 0;

walkDir(dir, function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    let newContent = content
      // Remove uppercase
      .replace(/\s*\buppercase\b/g, '')
      // Remove tracking variants
      .replace(/\s*\btracking-(wider|widest|tight|tighter|loose)\b/g, '')
      .replace(/\s*\btracking-\[[^\]]+\]/g, '')
      // Change tiny buttons to Apple-like sizes:
      // Replace text-xs font-semibold with text-sm font-medium for standard buttons
      .replace(/text-xs font-semibold/g, 'text-sm font-medium')
      // Make active states smooth like Apple springs
      .replace(/active:scale-95/g, 'active:scale-[0.98] transition-transform duration-200 ease-out')
      // Clean up multiple spaces in class strings
      .replace(/className="([^"]+)"/g, (match, p1) => {
        return `className="${p1.replace(/\s+/g, ' ').trim()}"`;
      })
      .replace(/className=\{`([^`]+)`\}/g, (match, p1) => {
        return `className={\`${p1.replace(/\s+(?![^{]*\})/g, ' ').trim()}\`}`;
      });

    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.log(`Updated ${filePath}`);
      count++;
    }
  }
});

console.log(`Updated ${count} files.`);
