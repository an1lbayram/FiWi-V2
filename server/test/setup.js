// server/index.js and wifiService.js are plain CommonJS files loaded via
// Node's native `require()` even when imported from an ESM test file — that
// require chain bypasses Vitest's ESM-only vi.mock() interception entirely,
// so mocking `child_process` via vi.mock() silently falls through to the
// REAL netsh/arp/ping commands on the machine running the tests.
//
// Node's built-in modules are process-wide singletons: `require('child_process')`
// always returns the exact same object, everywhere. So instead of relying on
// vi.mock, this setup file mutates that singleton's `exec`/`execFile`
// properties directly, before any test file (and therefore before
// wifiService.js) is loaded. Test files then read `require('child_process').exec`
// to get the same vi.fn() and drive it with mockImplementation/mockReset.
import { vi } from 'vitest';

const cp = require('child_process');

cp.exec = vi.fn();
cp.execFile = vi.fn();
