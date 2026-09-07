// Twoslash-only shim for `@clack/core`, wired through `paths` in astro.config.mjs.
// Core 1.5.0 narrows `isCancel` to `typeof CANCEL_SYMBOL` while prompts still
// return `T | symbol`, so the guard no longer removes `symbol` and every example
// that uses a prompt result after `isCancel` fails to type-check. This restores
// the pre-1.5.0 guard for the docs build only. Delete once clack ships a fix.
export * from '../../node_modules/@clack/core/dist/index.d.mts';
export declare function isCancel(value: unknown): value is symbol;
