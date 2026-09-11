/**
 * `npm run content:validate` — structural check over the bundled library.
 * Exits non-zero on any issue so it can gate a content release.
 */

import { ALL_SCENARIOS, CALIBRATION_SCENARIOS, TRAINING_SCENARIOS } from '../src/content';
import { formatIssues, validateLibrary } from '../src/engine/validate';

const issues = validateLibrary(ALL_SCENARIOS);

console.log(
  `Checked ${ALL_SCENARIOS.length} scenarios ` +
    `(${CALIBRATION_SCENARIOS.length} calibration, ${TRAINING_SCENARIOS.length} training)`,
);

if (issues.length) {
  console.error(`\n${issues.length} issue(s):\n${formatIssues(issues)}`);
  process.exit(1);
}

console.log('No issues.');
