/**
 * Export the app's courses/notices/home-texts from the legacy RN data module
 * into backend/src/content-defaults.json for the Flutter-era server-driven flow.
 * Run: node ../../scripts-anywhere — just do: node export-content.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataFile = readFileSync(path.join(here, '..', 'mobile', 'src', 'data.js'), 'utf8');

// data.js is ESM with big object literals; reuse it directly by import trick
const asDataUrl = 'file:///' + path.resolve(here, '..', 'mobile', 'src', 'data.js').replace(/\\/g, '/');
const { COURSES, NOTICES } = await import(asDataUrl);

const content = {
  exportedFrom: 'mobile/src/data.js',
  exportedAt: new Date().toISOString(),
  courses: COURSES,
  notices: NOTICES,
  texts: {
    homeHeadline: "Let's keep the momentum going",
    homeSub: 'Your next lesson is waiting for you.',
    signupDialogTitle: 'Request submitted',
    signupDialogBody: 'Thank you for signing up! We will confirm you via email once your account is approved.',
    pendingEmailNote: 'We will confirm you via email once the admin approves your account.',
    appName: 'MindLink.AI',
  },
};

const outPath = path.join(here, '..', 'backend', 'src', 'content-defaults.json');
mkdirSync(path.dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(content, null, 2), 'utf8');
console.log(
  'exported:', Object.keys(content.courses).length || content.courses.length, 'courses,',
  content.notices.length, 'notices ->', outPath
);
