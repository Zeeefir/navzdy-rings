import fs from 'node:fs';
const html=fs.readFileSync('index.html','utf8');
const backend=fs.readFileSync('server.mjs','utf8');
const photos=fs.readFileSync('embedded-photos.json','utf8');
fs.mkdirSync('dist/server',{recursive:true});
fs.writeFileSync('dist/server/index.js','const HTML='+JSON.stringify(html)+';\nconst IMAGE_ASSETS='+photos+';\n'+backend);
console.log('Built dist/server/index.js');
