const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
let changed = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let newContent = content;
  
  // Find supabase.from('cms_sections') without "as any" immediately following
  // We'll just aggressively cast them
  newContent = newContent.replace(/(?<!\(\s*)supabase\.from\(\s*['"]cms_sections['"]\s*\)(?!\s*as\s+any)/g, "(supabase.from('cms_sections') as any)");
  
  if (newContent !== content) {
    fs.writeFileSync(f, newContent);
    changed++;
    console.log('Fixed', f);
  }
});
console.log('Total fixed:', changed);
