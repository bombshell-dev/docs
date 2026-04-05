/**
 * Builds `public/snapshot`: a serialized node_modules tree for StackBlitz WebContainer.
 * The docs site mounts this in the browser so live examples can `import` Clack without
 * running `npm install` inside the VM. Versions come from the repo root package.json
 * so playground code matches Twoslash / the docs.
 */
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { snapshot } from '@webcontainer/snapshot';
import { x } from 'tinyexec';
import { createHash } from 'node:crypto';

const rootDir = new URL('../', import.meta.url);

async function packageJsonForSnapshot() {
    const raw = await fs.readFile(new URL('package.json', rootDir), 'utf8');
    const root = JSON.parse(raw) as {
        dependencies: Record<string, string>;
    };
    const { dependencies: d } = root;
    return {
        name: 'example',
        type: 'module',
        version: '0.0.0',
        dependencies: {
            '@bomb.sh/args': d['@bomb.sh/args'],
            '@clack/core': d['@clack/core'],
            '@clack/prompts': d['@clack/prompts'],
        },
    };
}
const IGNORE_FILES = ['*.md', '*.d.*', '*.map', 'LICENSE', 'license'];
const snapshotDir = new URL(`./snapshot-${hash()}/`, rootDir);
const outFile = new URL('./public/snapshot', rootDir);

async function run() {
    const pkg = await packageJsonForSnapshot();
    await fs.mkdir(snapshotDir, { recursive: true });
    await fs.writeFile(new URL('package.json', snapshotDir), JSON.stringify(pkg));
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
