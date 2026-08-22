import fs from 'fs';
import https from 'https';
import path from 'path';

const candidates = [
  'https://raw.githubusercontent.com/Starklord17/threejs-t-shirt/main/public/shirt_baked.glb',
  'https://raw.githubusercontent.com/meros-debray/3D-shirt/main/public/shirt_baked.glb',
  'https://raw.githubusercontent.com/AriyanMLZM/threejs-react-TDesigner/main/public/shirt_baked.glb',
  'https://raw.githubusercontent.com/adrianhajdin/project_threejs_ai/master/public/shirt_baked.glb',
  'https://raw.githubusercontent.com/adrianhajdin/project_threejs_ai/main/public/shirt_baked.glb',
  'https://project-threejs-ai.vercel.app/shirt_baked.glb'
];

const dest = path.join(process.cwd(), 'public', 'shirt_baked.glb');

async function download(url) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        fs.unlink(dest, () => {});
        reject(new Error(`Status ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  for (const url of candidates) {
    try {
      console.log(`Trying URL: ${url}`);
      await download(url);
      console.log(`Success! Saved to ${dest}`);
      return;
    } catch (e) {
      console.log(`Failed for ${url}: ${e.message}`);
    }
  }
  console.error('All download candidates failed.');
  process.exit(1);
}

main();
