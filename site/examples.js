// Load examples from CSV and populate subpages

// Base prefix for path (from Eleventy pathPrefix)
const BASE = (typeof window !== 'undefined' && window.__BASE) || '/';

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && next === '\n') i += 1;
      row.push(field);
      field = '';
      if (row.some((c) => c.trim() !== '')) rows.push(row);
      row = [];
      continue;
    }

    field += ch;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((c) => c.trim() !== '')) rows.push(row);
  }

  return rows;
}

function normalizeTemplateToken(token) {
  const t = (token || '').trim();
  if (!t) return '';
  if (/^aux_/i.test(t)) return t.replace(/-/g, '_').toUpperCase();
  return t.replace(/-/g, '_').toLowerCase();
}

function buildTemplateResolver(replacements, options = {}) {
  const preserveHyphens = !!options.preserveHyphens;

  function splitTokenAffixes(rawToken) {
    const token = rawToken || '';
    let start = 0;
    let end = token.length;

    while (start < end && /[^A-Za-z0-9_]/.test(token[start])) start += 1;
    while (end > start && /[^A-Za-z0-9_]/.test(token[end - 1])) end -= 1;

    return {
      leading: token.slice(0, start),
      core: token.slice(start, end),
      trailing: token.slice(end)
    };
  }

  function normalizeResolved(value) {
    if (preserveHyphens) return value;
    return (value || '').replace(/-/g, '');
  }

  function lookupSingle(token) {
    const normalized = normalizeTemplateToken(token);
    const hit = replacements.get(token) || replacements.get(normalized) || null;
    return hit == null ? null : normalizeResolved(hit);
  }

  function joinWithConditionalHyphen(left, right) {
    if (!left) return right;
    if (!right) return left;
    if (left.endsWith('-') || right.startsWith('-')) return `${left}${right}`;
    return `${left}-${right}`;
  }

  function resolveSegment(rawSegment) {
    if (!rawSegment) return '';

    const { leading, core, trailing } = splitTokenAffixes(rawSegment);
    if (!core) return rawSegment;

    const direct = lookupSingle(core);
    if (direct) return `${leading}${direct}${trailing}`;

    const pieces = core.split(/([.+-])/).filter((p) => p !== '');
    if (pieces.length === 1) return `${leading}${core}${trailing}`;

    let out = lookupSingle(pieces[0]) || pieces[0];
    for (let i = 1; i < pieces.length; i += 2) {
      const op = pieces[i];
      const rawNext = pieces[i + 1] || '';
      const next = lookupSingle(rawNext) || rawNext;

      if (op === '.') out = `${out}${next}`;
      else if (op === '+') out = `${out}${next}`.replace(/-/g, '');
      else if (op === '-') out = joinWithConditionalHyphen(out, next);
    }

    return `${leading}${out}${trailing}`;
  }

  return function resolve(tokenString = '') {
    if (!tokenString || typeof tokenString !== 'string') return '';
    const resolved = tokenString.trim().split(/\s+/).map(resolveSegment).join(' ');
    return resolved.replace(/\s+([,;:.!?])/g, '$1');
  };
}

function parseTemplateExpression(value) {
  const m = (value || '').trim().match(/^\{%\s*(tov|tovc|tovch|tovscript|tovp|tovph|tovscriptp|tovipa)\s+"([\s\S]*?)"\s*%\}$/i);
  if (!m) return null;
  return { name: m[1].toLowerCase(), tokenString: m[2] };
}

async function loadTemplateReplacementResolvers() {
  const response = await fetch(BASE + 'template_replacements.csv');
  const csv = await response.text();
  const rows = parseCSV(csv);
  const [, ...data] = rows;

  const tovianMap = new Map();
  const ipaMap = new Map();

  data.forEach((r) => {
    const english = (r[0] || '').trim();
    const tovian = (r[1] || '').trim();
    const ipa = (r[2] || '').trim();
    if (!english) return;
    if (tovian) {
      tovianMap.set(english, tovian);
      tovianMap.set(english.toLowerCase(), tovian);
    }
    if (ipa) {
      ipaMap.set(english, ipa);
      ipaMap.set(english.toLowerCase(), ipa);
    }
  });

  const resolveTovian = buildTemplateResolver(tovianMap, { preserveHyphens: false });
  const resolveTovianHyphen = buildTemplateResolver(tovianMap, { preserveHyphens: true });
  const resolveIpaRaw = buildTemplateResolver(ipaMap, { preserveHyphens: false });
  const resolveIpa = (tokenString = '') => {
    const resolved = resolveIpaRaw(tokenString).trim();
    if (!resolved) return '';
    const bare = resolved
      .split(/\s+/)
      .map((token) => token.replace(/^\/+|\/+$/g, ''))
      .join(' ');
    return `/${bare}/`;
  };

  return { resolveTovian, resolveTovianHyphen, resolveIpa };
}

async function loadExamplesFromCSV() {
  try {
    // Prefer build-time resolved output to avoid runtime resolver drift.
    const parallelsResponse = await fetch(BASE + 'parallels.csv');
    if (parallelsResponse.ok) {
      const csv = await parallelsResponse.text();
      const allRows = parseCSV(csv);
      const rows = allRows.slice(1).map((values) => ({
        english: values[0],
        tovian: values[1],
        ipa: values[2],
        category: values[3]
      }));

      const grouped = {};
      rows.forEach(row => {
        if (!grouped[row.category]) grouped[row.category] = [];
        grouped[row.category].push(row);
      });

      return { rows, grouped, categories: Object.keys(grouped) };
    }

    const [response, resolvers] = await Promise.all([
      fetch(BASE + 'examples.csv'),
      loadTemplateReplacementResolvers()
    ]);
    const csv = await response.text();
    
    // Parse CSV
    const allRows = parseCSV(csv);
    const rows = allRows.slice(1).map((values) => {
      const rawTovian = values[1] || '';
      const rawIpa = values[2] || '';

      const tovExpr = parseTemplateExpression(rawTovian);
      const ipaExpr = parseTemplateExpression(rawIpa);

      const tovian = tovExpr
        ? ((tovExpr.name === 'tovch' || tovExpr.name === 'tovph')
            ? resolvers.resolveTovianHyphen(tovExpr.tokenString)
            : resolvers.resolveTovian(tovExpr.tokenString))
        : rawTovian;
      const ipa = ipaExpr
        ? (ipaExpr.name === 'tovipa'
            ? resolvers.resolveIpa(ipaExpr.tokenString)
            : resolvers.resolveTovian(ipaExpr.tokenString))
        : rawIpa;

      return {
        english: values[0],
        tovian,
        ipa,
        category: values[3]
      };
    });
    
    // Group by category
    const grouped = {};
    rows.forEach(row => {
      if (!grouped[row.category]) {
        grouped[row.category] = [];
      }
      grouped[row.category].push(row);
    });
    
    return { rows, grouped, categories: Object.keys(grouped) };
  } catch (error) {
    console.error('Error loading examples CSV:', error);
    return null;
  }
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderExampleCards(containerId, examples = []) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!examples.length) {
    container.innerHTML = '<p><em>No examples available yet.</em></p>';
    return;
  }

  const cards = examples.map((ex, index) => {
    const tovian = escapeHtml(ex.tovian || '');
    const ipa = escapeHtml(ex.ipa || '');
    const english = escapeHtml(ex.english || '');

    return `
      <article class="example-card">
        <div class="example-index">${index + 1}</div>
        <p class="example-tovian"><strong>${tovian}</strong></p>
        <p class="example-ipa">${ipa}</p>
        <p class="example-english">${english}</p>
      </article>
    `;
  }).join('');

  container.innerHTML = `<div class="examples-grid">${cards}</div>`;
}

// For dynamically populating page content
window.loadExamplesFromCSV = loadExamplesFromCSV;
window.renderExampleCards = renderExampleCards;
