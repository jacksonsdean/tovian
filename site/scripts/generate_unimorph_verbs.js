const fs = require('fs');
const path = require('path');
const https = require('https');

const UNIMORPH_URL = 'https://raw.githubusercontent.com/unimorph/eng/master/eng';

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function download(url, outPath) {
  return new Promise((resolve, reject) => {
    function request(currentUrl) {
      https.get(currentUrl, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const next = new URL(res.headers.location, currentUrl).toString();
          res.resume();
          request(next);
          return;
        }

        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode} while downloading ${currentUrl}`));
          return;
        }

        const file = fs.createWriteStream(outPath);
        res.pipe(file);
        file.on('finish', () => {
          file.close(() => resolve(outPath));
        });
        file.on('error', reject);
      }).on('error', reject);
    }

    request(url);
  });
}

function parseUniMorph(tsvText) {
  const byLemma = new Map();
  const lines = tsvText.split(/\r?\n/);

  lines.forEach((line) => {
    if (!line) return;
    const cols = line.split(/\t+/);
    if (cols.length < 3) return;

    const lemma = (cols[0] || '').trim().toLowerCase();
    const form = (cols[1] || '').trim().toLowerCase();
    const feats = (cols[2] || '').trim().toUpperCase();

    if (!lemma || !form || !feats.startsWith('V;')) return;

    if (!byLemma.has(lemma)) byLemma.set(lemma, {});
    const entry = byLemma.get(lemma);

    if (feats.includes('V.PTCP;PRS') && !entry.cont_prs) entry.cont_prs = form;
    if (feats.includes('V.PTCP;PST') && !entry.ptcp_pst) entry.ptcp_pst = form;
    if (feats.includes(';PRS;3;SG') && !entry.prs_3sg) entry.prs_3sg = form;
    if (feats.includes(';PST') && !feats.includes('V.PTCP') && !entry.pst) entry.pst = form;
  });

  const compact = {};
  byLemma.forEach((entry, lemma) => {
    if (entry.cont_prs || entry.ptcp_pst || entry.prs_3sg || entry.pst) {
      compact[lemma] = entry;
    }
  });
  return compact;
}

async function main() {
  const root = path.resolve(__dirname, '..');
  const cacheDir = path.join(root, '.cache');
  const cachePath = path.join(cacheDir, 'unimorph_eng.tsv');
  const outputPath = path.join(root, 'unimorph_en_verbs.json');

  ensureDir(cacheDir);

  let haveTsv = false;
  try {
    await download(UNIMORPH_URL, cachePath);
    haveTsv = true;
    console.log(`Downloaded UniMorph ENG: ${cachePath}`);
  } catch (err) {
    if (fs.existsSync(cachePath)) {
      haveTsv = true;
      console.warn(`Using cached UniMorph ENG at ${cachePath} (${err.message})`);
    } else {
      console.warn(`Skipping UniMorph download: ${err.message}`);
    }
  }

  if (!haveTsv) {
    if (fs.existsSync(outputPath)) {
      console.log(`Keeping existing ${outputPath}`);
      return;
    }
    fs.writeFileSync(outputPath, JSON.stringify({
      source: UNIMORPH_URL,
      generatedAt: new Date().toISOString(),
      lemmas: {}
    }), 'utf8');
    console.log(`Wrote empty ${outputPath}`);
    return;
  }

  const tsv = fs.readFileSync(cachePath, 'utf8');
  const lemmas = parseUniMorph(tsv);
  const payload = {
    source: UNIMORPH_URL,
    generatedAt: new Date().toISOString(),
    lemmaCount: Object.keys(lemmas).length,
    lemmas
  };

  fs.writeFileSync(outputPath, JSON.stringify(payload), 'utf8');
  console.log(`Wrote ${outputPath} (${payload.lemmaCount} lemmas)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
