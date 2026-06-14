const fs = require('fs');

function loadTemplateReplacements(csvPath) {
  const tovianReplacements = new Map();
  const tovianIpaReplacements = new Map();

  if (!fs.existsSync(csvPath)) {
    console.warn(`[eleventy] Missing template replacements CSV: ${csvPath}`);
    return { tovianReplacements, tovianIpaReplacements };
  }

  const text = fs.readFileSync(csvPath, 'utf8');
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length <= 1) {
    return { tovianReplacements, tovianIpaReplacements };
  }

  for (let i = 1; i < lines.length; i += 1) {
    const cols = lines[i].split(',');
    if (cols.length < 3) {
      continue;
    }

    const english = cols[0].trim();
    const tovian = cols[1].trim();
    const tovianIpa = cols[2].trim();
    if (!english) {
      continue;
    }

    if (tovian) {
      tovianReplacements.set(english, tovian);
      tovianReplacements.set(english.toLowerCase(), tovian);
    }
    if (tovianIpa) {
      tovianIpaReplacements.set(english, tovianIpa);
      tovianIpaReplacements.set(english.toLowerCase(), tovianIpa);
    }
  }

  return { tovianReplacements, tovianIpaReplacements };
}

function normalizeTemplateToken(token) {
  const t = token.trim();
  if (!t) {
    return '';
  }

  if (/^aux_/i.test(t)) {
    return t.replace(/-/g, '_').toUpperCase();
  }

  return t.replace(/-/g, '_').toLowerCase();
}

function buildTemplateReplacementFn(replacements, options = {}) {
  const preserveHyphens = !!options.preserveHyphens;

  function splitTokenAffixes(rawToken) {
    const token = rawToken || '';
    let start = 0;
    let end = token.length;

    while (start < end && /[^A-Za-z0-9_]/.test(token[start])) {
      start += 1;
    }
    while (end > start && /[^A-Za-z0-9_]/.test(token[end - 1])) {
      end -= 1;
    }

    return {
      leading: token.slice(0, start),
      core: token.slice(start, end),
      trailing: token.slice(end),
    };
  }

  function normalizeResolved(value) {
    if (preserveHyphens) {
      return value;
    }
    return (value || '').replace(/-/g, '');
  }

  function lookupSingle(token) {
    const normalized = normalizeTemplateToken(token);
    const hit = replacements.get(token) || replacements.get(normalized) || null;
    return hit == null ? null : normalizeResolved(hit);
  }

  function joinWithConditionalHyphen(left, right) {
    if (!left) {
      return right;
    }
    if (!right) {
      return left;
    }
    if (left.endsWith('-') || right.startsWith('-')) {
      return `${left}${right}`;
    }
    return `${left}-${right}`;
  }

  function resolveSegment(rawSegment) {
    if (!rawSegment) {
      return '';
    }

    const { leading, core, trailing } = splitTokenAffixes(rawSegment);
    if (!core) {
      return rawSegment;
    }

    const direct = lookupSingle(core);
    if (direct) {
      return `${leading}${direct}${trailing}`;
    }

    // Segment grammar:
    // - token.token => concatenate with no separator
    // - token-token => concatenate with conditional hyphen insertion
    // - token+token => concatenate with no separator and remove only boundary hyphens
    // Operators are evaluated left-to-right.
    const pieces = core.split(/([.+-])/).filter((p) => p !== '');
    if (pieces.length === 1) {
      return `${leading}${core}${trailing}`;
    }

    const first = pieces[0];
    let out = lookupSingle(first) || first;
    for (let i = 1; i < pieces.length; i += 2) {
      const op = pieces[i];
      const rawNext = pieces[i + 1] || '';
      const next = lookupSingle(rawNext) || rawNext;

      if (op === '.') {
        out = `${out}${next}`;
      } else if (op === '+') {
        out = `${out.replace(/-+$/g, '')}${next.replace(/^-+/g, '')}`;
      } else if (op === '-') {
        out = joinWithConditionalHyphen(out, next);
      }
    }

    return `${leading}${out}${trailing}`;
  }

  return function(tokenString = '') {
    if (!tokenString || typeof tokenString !== 'string') {
      return '';
    }

    const resolved = tokenString
      .trim()
      .split(/\s+/)
      .map(resolveSegment)
      .join(' ');

    return resolved.replace(/\s+([,;:.!?])/g, '$1');
  };
}

function registerTovianShortcodes(eleventyConfig, options = {}) {
  const { csvPath } = options;
  const { tovianReplacements, tovianIpaReplacements } = loadTemplateReplacements(csvPath);

  const replaceWithTovian = buildTemplateReplacementFn(tovianReplacements, { preserveHyphens: false });
  const replaceWithTovianHyphen = buildTemplateReplacementFn(tovianReplacements, { preserveHyphens: true });
  const replaceWithTovianIpaRaw = buildTemplateReplacementFn(tovianIpaReplacements, { preserveHyphens: false });

  const replaceWithTovianIpa = (tokenString = '') => {
    const resolved = replaceWithTovianIpaRaw(tokenString).trim();
    if (!resolved) {
      return '';
    }

    const bare = resolved
      .split(/\s+/)
      .map((token) => token.replace(/^\/+|\/+$/g, ''))
      .join(' ');

    return `/${bare}/`;
  };

  const replaceWithTovianScript = (tokenString = '') => {
    const resolved = replaceWithTovian(tokenString).trim();
    if (!resolved) {
      return '';
    }
    return `<span class="tovian tovian-script">${resolved}</span>`;
  };

  const replaceWithTovianScriptPre = (tokenString = '') => {
    const resolved = replaceWithTovian(tokenString).trim();
    if (!resolved) {
      return '';
    }
    return `<pre class="tovian tovian-script">${resolved}</pre>`;
  };

  const replaceWithTovianPre = (tokenString = '') => {
    const resolved = replaceWithTovian(tokenString).trim();
    if (!resolved) {
      return '';
    }
    return `<pre>${resolved}</pre>`;
  };

  const replaceWithTovianCode = (tokenString = '') => {
    const resolved = replaceWithTovian(tokenString).trim();
    if (!resolved) {
      return '';
    }
    return `<code>${resolved}</code>`;
  };

  const replaceWithTovianCodeHyphen = (tokenString = '') => {
    const resolved = replaceWithTovianHyphen(tokenString).trim();
    if (!resolved) {
      return '';
    }
    return `<code>${resolved}</code>`;
  };

  const replaceWithTovianPreHyphen = (tokenString = '') => {
    const resolved = replaceWithTovianHyphen(tokenString).trim();
    if (!resolved) {
      return '';
    }
    return `<pre>${resolved}</pre>`;
  };

  eleventyConfig.addShortcode('tov', replaceWithTovian);
  eleventyConfig.addFilter('tov', replaceWithTovian);

  eleventyConfig.addShortcode('tovipa', replaceWithTovianIpa);
  eleventyConfig.addFilter('tovipa', replaceWithTovianIpa);

  eleventyConfig.addShortcode('tovscript', replaceWithTovianScript);
  eleventyConfig.addFilter('tovscript', replaceWithTovianScript);

  eleventyConfig.addShortcode('tovscriptp', replaceWithTovianScriptPre);
  eleventyConfig.addFilter('tovscriptp', replaceWithTovianScriptPre);

  eleventyConfig.addShortcode('tovp', replaceWithTovianPre);
  eleventyConfig.addFilter('tovp', replaceWithTovianPre);

  eleventyConfig.addShortcode('tovc', replaceWithTovianCode);
  eleventyConfig.addFilter('tovc', replaceWithTovianCode);

  eleventyConfig.addShortcode('tovch', replaceWithTovianCodeHyphen);
  eleventyConfig.addFilter('tovch', replaceWithTovianCodeHyphen);

  eleventyConfig.addShortcode('tovph', replaceWithTovianPreHyphen);
  eleventyConfig.addFilter('tovph', replaceWithTovianPreHyphen);
}

module.exports = {
  registerTovianShortcodes,
};