const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

// Exercise the browser's translator with a small, controlled lexicon.
const source = fs.readFileSync(path.join(__dirname, '../site/gloss/gloss.js'), 'utf8');
const context = { window: { addEventListener() {} } };
vm.runInNewContext(source.replace(/\}\)\(\);\s*$/, `
  window.testAPI = { draftTranslateENtoTovian, parseAuxGloss };
})();`), context);
const { draftTranslateENtoTovian, parseAuxGloss } = context.window.testAPI;
const lexicon = [{ english: 'see', tovian: 'muril' }];

test('translation marks the auxiliary and leaves the lexical predicate bare', () => {
  for (const [english, expected] of [
    ['I see', 'na ifa muril'],
    ['we see', 'ne ifa muril'],
    ['you see', 'wa ofa muril'],
    ['they see', 'afa muril'],
    ['I will see', 'na ifo muril'],
  ]) {
    assert.equal(draftTranslateENtoTovian(lexicon, english), expected, english);
  }
});

test('glosser recognizes explicitly labeled casual auxiliary forms', () => {
  const parsed = parseAuxGloss('auxiliary-form: 3rd (casual) potential simple (present)');
  assert.equal(parsed.descriptor, '3rd (casual) potential simple');
  assert.equal(parsed.tense, 'present');
});
