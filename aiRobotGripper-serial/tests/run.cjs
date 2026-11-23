const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const root = path.resolve(__dirname, '..');
const out = path.join(root, '.test-build');
// TS 7은 exports에 bin/tsc를 노출하지 않으므로 package.json 위치에서 bin/tsc를 찾는다
const tsc = path.join(path.dirname(require.resolve('typescript/package.json', {paths:[path.join(root,'main')]})), 'bin', 'tsc');
fs.rmSync(out, {recursive:true,force:true});
const built=spawnSync(process.execPath,[tsc,'src/hw/protocol.ts','src/hw/RobotController.ts','--ignoreConfig','--target','ES2020','--module','commonjs','--lib','ES2020,DOM','--types','w3c-web-serial','--skipLibCheck','--strict','--outDir',out],{cwd:path.join(root,'main'),stdio:'inherit'});
if(built.status!==0)process.exit(built.status||1);
const result=spawnSync(process.execPath,['--test',path.join(__dirname,'unit.cjs')],{cwd:root,stdio:'inherit'});
process.exitCode=result.status||0;
