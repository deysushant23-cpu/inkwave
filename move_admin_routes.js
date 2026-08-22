const fs = require('fs');
const path = require('path');

const adminDir = path.join('c:', 'Users', 'Sushant', 'inkwave_J', 'src', 'app', '(admin)', 'admin');
const protectedDir = path.join(adminDir, '(protected)');

if (!fs.existsSync(protectedDir)) {
  fs.mkdirSync(protectedDir);
}

const itemsToMove = [
  'catalog',
  'categories',
  'cms',
  'customers',
  'inventory',
  'orders',
  'settings',
  'page.tsx',
  'layout.tsx'
];

itemsToMove.forEach(item => {
  const oldPath = path.join(adminDir, item);
  const newPath = path.join(protectedDir, item);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Moved ${item}`);
  }
});

// We created a `(protected)` directory at the root in the previous failed command. Let's delete it.
const badProtected = path.join('c:', 'Users', 'Sushant', 'inkwave_J', '(protected)');
if (fs.existsSync(badProtected)) {
  fs.rmSync(badProtected, { recursive: true, force: true });
}
