import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { snapshot } from '@webcontainer/snapshot';
import {x} from 'tinyexec';
import { createHash } from "node:crypto";

const PACKAGE_JSON = {
    name: 'example',
    type: 'module',
    version: '0.0.0',
    dependencies: {
        "@bomb.sh/args": "latest",
        "@clack/core": "1.0.0-alpha.0",
        "@clack/prompts": "1.0.0-alpha.0"
    }
}
const IGNORE_FILES = ['*.md', '*.d.*', '*.map', 'LICENSE', 'license'];
const rootDir = new URL('../', import.meta.url);
const snapshotDir = new URL(`./snapshot-${hash()}/`, rootDir);
const outFile = new URL('./public/snapshot', rootDir);

async function run() {
    await fs.mkdir(snapshotDir, { recursive: true });
    await fs.writeFile(new URL('package.json', snapshotDir), JSON.stringify(PACKAGE_JSON));
    await x('npm', ['install'], {
        nodeOptions: {
            cwd: fileURLToPath(snapshotDir),
        }
    })
    for await (const file of fs.glob(IGNORE_FILES.map(file => `**/${file}`), { cwd: fileURLToPath(snapshotDir) })) {
        await fs.rm(new URL(file, snapshotDir));
    }
    const output = await snapshot(fileURLToPath(snapshotDir));
    await fs.writeFile(outFile, output);
    await fs.rm(snapshotDir, { recursive: true, force: true });
    console.log('snapshot generated');
}

run();

function hash() {
    return createHash("shake256", { outputLength: 8 })
      .update(Date.now().toString())
      .digest("hex");
}
