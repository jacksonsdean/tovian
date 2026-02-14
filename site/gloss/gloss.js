// Simple glosser and draft translator using the site dictionary
(function(){
  const BASE = (window.__BASE || '/');

  function el(html){ const d=document.createElement('div'); d.innerHTML=html.trim(); return d.firstChild; }

  function tokenizeTovian(text){
    // Keep letters, apostrophes, hyphens, and UniMorph tag punctuation (; .)
    const raw = text.split(/\s+/).filter(Boolean);
    const tokens = [];
    raw.forEach(r => {
      const parts = r.match(/[A-Za-z0-9’'_\-.;]+|[^A-Za-z0-9’'_\-.;]+/g) || [r];
      parts.forEach(p => { if (/^[A-Za-z0-9’'_\-.;]+$/.test(p)) tokens.push(p); });
    });
    return tokens;
  }

  function normalizeTovian(s){ return (s || '').toLowerCase().replace(/[’']/g, "'"); }
  function normalizeTovianForGloss(s){ return normalizeTovian(s).replace(/[-']/g, ''); }
  function normalizeEnglish(s){ return (s || '').toLowerCase(); }

  async function loadDict(){
    const csv = await fetch(BASE + 'dictionary.csv').then(r=>r.text());
    const lines = csv.split(/\r?\n/).filter(Boolean);
    const [header, ...rows] = lines;
    return rows.map(l => {
      const [en, to, ipa, roots] = l.split(',');
      return { english:(en||'').trim(), tovian:(to||'').trim(), ipa:(ipa||'').trim(), roots:(roots||'').trim() };
    }).filter(e => e.english && e.tovian && !/\(obsolete\)/i.test(e.english));
  }

  async function loadTemplateGlossReverse(){
    const csv = await fetch(BASE + 'template_replacements.csv').then(r=>r.text());
    const lines = csv.split(/\r?\n/).filter(Boolean);
    const [, ...rows] = lines;
    const reverse = new Map();
    rows.forEach(l => {
      const cols = l.split(',');
      if (cols.length < 3) return;
      const tovian = (cols[1] || '').trim();
      const ipa = (cols[2] || '').trim();
      const gloss = ((cols[3] || '').trim() || (cols[0] || '').trim());
      if (!tovian || !gloss) return;
      const key = normalizeTovianForGloss(tovian);
      if (!key) return;
      if (!reverse.has(key)) {
        reverse.set(key, { glosses: [gloss], tovian, ipa });
      } else {
        const entry = reverse.get(key);
        if (!entry.glosses.includes(gloss)) entry.glosses.push(gloss);
        if (!entry.ipa && ipa) entry.ipa = ipa;
      }
    });

    // Collapse gloss lists into slash-joined gloss strings for display.
    const collapsed = new Map();
    reverse.forEach((v, k) => {
      collapsed.set(k, {
        gloss: v.glosses.join(' / '),
        tovian: v.tovian,
        ipa: v.ipa
      });
    });
    return collapsed;
  }

  async function loadUniMorphVerbs(){
    const res = await fetch(BASE + 'unimorph_en_verbs.json');
    if (!res.ok) return {};
    const data = await res.json();
    return data?.lemmas || {};
  }

  function bestMatchToken(dict, token){
    const t = normalizeTovian(token);
    // exact match by Tovian
    let hit = dict.find(e => normalizeTovian(e.tovian) === t);
    if (hit) return hit;
    // try stripping hyphens/apostrophes
    const t2 = t.replace(/[-']/g,'');
    hit = dict.find(e => normalizeTovian(e.tovian).replace(/[-']/g,'') === t2);
    if (hit) return hit;
    // try startsWith for compounds
    hit = dict.find(e => t.startsWith(normalizeTovian(e.tovian)));
    return hit || null;
  }

  function firstGloss(glossText){
    if (!glossText) return '';
    return glossText.split('/')[0].trim();
  }

  function markerCodeFromGloss(gloss){
    const g = (gloss || '').trim();
    if (!g) return null;
    const low = g.toLowerCase();
    const upper = g.toUpperCase();
    if (/^(NOM|ACC|GEN|DAT|LOC|TEMP|INS|PUR|ABL|COM|ALL|ESS|ANIM|ANI|INAN|ABS)$/.test(upper)) {
      return upper === 'ANI' ? 'ANIM' : upper;
    }
    if (low === 'possession' || low.includes('genitive')) return 'GEN';
    if (low.includes('nominative')) return 'NOM';
    if (low.includes('accusative')) return 'ACC';
    if (low.includes('dative')) return 'DAT';
    if (low.includes('locative')) return 'LOC';
    if (low.includes('temporal')) return 'TEMP';
    if (low.includes('instrumental')) return 'INS';
    if (low.includes('purpose') || low === 'for') return 'PUR';
    if (low.includes('ablative')) return 'ABL';
    if (low.includes('comitative') || low === 'with' || low === 'together with') return 'COM';
    if (low.includes('allative')) return 'ALL';
    if (low.includes('essive')) return 'ESS';
    if (low.includes('animate')) return 'ANIM';
    if (low.includes('inanimate')) return 'INAN';
    if (low.includes('abstract')) return 'ABS';
    return null;
  }

  function parseAuxGloss(gloss){
    const m = (gloss || '').match(/^auxiliary(?:[-\s]form)?:\s*([^()]+)\((past|present|future)\)/i);
    if (!m) return null;
    const descriptor = (m[1] || '').trim().toLowerCase();
    const tense = (m[2] || '').trim().toLowerCase();
    return { descriptor, tense };
  }

  function auxDescriptorCode(descriptor){
    const d = (descriptor || '').toLowerCase().trim();
    if (!d) return 'IND';
    // UniMorph-aligned labels where possible.
    if (d.includes('continuous') || d.includes('progressive')) return 'V.PTCP';
    if (d.includes('perfect')) return 'PRF';
    if (d.includes('habitual')) return 'HAB';
    if (d.includes('simple')) return 'IND';
    if (d.includes('iterative')) return 'ITER';
    if (d.includes('inceptive')) return 'INCH';
    const cleaned = d.replace(/[^a-z]/g, '').toUpperCase();
    return cleaned.slice(0, 5) || 'IND';
  }

  function auxTenseCode(tense){
    const t = (tense || '').toLowerCase().trim();
    if (t === 'present') return 'PRS';
    if (t === 'past') return 'PST';
    if (t === 'future') return 'FUT';
    return 'TNS';
  }

  function auxTag(aux){
    if (!aux) return '';
    return `${auxDescriptorCode(aux.descriptor)};${auxTenseCode(aux.tense)}`;
  }

  function compactAuxGloss(gloss){
    const parsed = parseAuxGloss(gloss);
    if (!parsed) return gloss;
    return auxTag(parsed);
  }

  function normalizeVerbCandidate(v){
    let s = (v || '').toLowerCase().trim();
    if (!s) return '';
    s = s.replace(/\([^)]*\)/g, '').trim();
    if (s.startsWith('to ')) return s.replace(/^to\s+/, '').trim();
    if (s.endsWith('ing')) {
      const stem = s.slice(0, -3);
      // simple de-gerunding heuristic
      if (stem.length >= 3 && stem[stem.length - 1] === stem[stem.length - 2]) return stem.slice(0, -1);
      if (stem.endsWith('v')) return stem + 'e';
      return stem;
    }
    if (s.endsWith('es') && s.length > 3) return s.slice(0, -2);
    if (s.endsWith('s') && s.length > 3) return s.slice(0, -1);
    return s;
  }

  function isVerbLikeGloss(g){
    const s = (g || '').toLowerCase().trim();
    return /^to\s+/.test(s) || /ing$/.test(s);
  }

  function englishTokenStem(t){
    let s = (t || '').toLowerCase().replace(/[^a-z]/g, '');
    if (!s) return '';
    if (s.endsWith('tion')) s = s.slice(0, -4) + 'te';
    else if (s.endsWith('sion')) s = s.slice(0, -4) + 'de';
    else if (s.endsWith('ment')) s = s.slice(0, -4);
    else if (s.endsWith('ness')) s = s.slice(0, -4);
    else if (s.endsWith('ance') || s.endsWith('ence')) s = s.slice(0, -4);
    else if (s.endsWith('ity')) s = s.slice(0, -3);
    else if (s.endsWith('ship')) s = s.slice(0, -4);
    else if (s.endsWith('ism')) s = s.slice(0, -3);
    else if (s.endsWith('al') && s.length > 4) s = s.slice(0, -2);
    else if (s.endsWith('er') && s.length > 4) s = s.slice(0, -2);
    else if (s.endsWith('or') && s.length > 4) s = s.slice(0, -2);
    else if (s.endsWith('ies') && s.length > 4) s = s.slice(0, -3) + 'y';
    else if (s.endsWith('es') && s.length > 3) s = s.slice(0, -2);
    else if (s.endsWith('s') && s.length > 3) s = s.slice(0, -1);
    return s;
  }

  function levenshtein(a, b){
    const s = a || '';
    const t = b || '';
    if (!s) return t.length;
    if (!t) return s.length;
    const dp = Array.from({ length: s.length + 1 }, () => Array(t.length + 1).fill(0));
    for (let i = 0; i <= s.length; i += 1) dp[i][0] = i;
    for (let j = 0; j <= t.length; j += 1) dp[0][j] = j;
    for (let i = 1; i <= s.length; i += 1) {
      for (let j = 1; j <= t.length; j += 1) {
        const cost = s[i - 1] === t[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }
    return dp[s.length][t.length];
  }

  function wordSimilarity(a, b){
    const x = englishTokenStem(a);
    const y = englishTokenStem(b);
    if (!x || !y) return 0;
    if (x === y) return 1;
    if (x.startsWith(y) || y.startsWith(x)) {
      return Math.min(x.length, y.length) / Math.max(x.length, y.length);
    }
    const dist = levenshtein(x, y);
    return 1 - (dist / Math.max(x.length, y.length));
  }

  function bestVerbLemmaForConcept(concept, verbLemmas){
    const cleaned = (concept || '').toLowerCase().replace(/\([^)]*\)/g, '').replace(/[^a-z\s]/g, ' ').trim();
    if (!cleaned) return null;
    const conceptTokens = cleaned.split(/\s+/).filter(Boolean);
    if (!conceptTokens.length) return null;

    let best = null;
    let bestScore = 0;
    verbLemmas.forEach((lemma) => {
      const lemmaTokens = lemma.split(/\s+/).filter(Boolean);
      if (!lemmaTokens.length) return;
      let localBest = 0;
      conceptTokens.forEach(ct => {
        lemmaTokens.forEach(lt => {
          localBest = Math.max(localBest, wordSimilarity(ct, lt));
        });
      });
      if (cleaned.includes(lemma) || lemma.includes(cleaned)) localBest = Math.max(localBest, 0.92);
      if (localBest > bestScore) {
        bestScore = localBest;
        best = lemma;
      }
    });
    return bestScore >= 0.72 ? best : null;
  }

  function deriveConceptVerbMap(rows){
    // Group dictionary entries by Tovian form, then infer noun->verb links from
    // sibling English glosses (e.g., "speech" + "speaking" on same form).
    const byTovian = new Map();
    const allGlosses = [];
    rows.forEach(r => {
      const key = normalizeTovianForGloss(r.tovian);
      if (!key) return;
      if (!byTovian.has(key)) byTovian.set(key, []);
      const variants = (r.english || '').split('/').map(x => x.trim().toLowerCase()).filter(Boolean);
      byTovian.get(key).push(...variants);
      allGlosses.push(...variants);
    });

    const map = new Map();
    const globalVerbLemmas = [...new Set(allGlosses.filter(isVerbLikeGloss).map(normalizeVerbCandidate).filter(Boolean))];

    byTovian.forEach((glosses) => {
      const unique = [...new Set(glosses)];
      const verbLike = unique.filter(isVerbLikeGloss);
      if (!verbLike.length) return;
      const lemma = normalizeVerbCandidate(verbLike[0]);
      if (!lemma) return;
      unique.forEach(g => {
        if (!isVerbLikeGloss(g)) {
          map.set(g, lemma);
        }
      });
    });

    // NLP fallback: map remaining concept glosses to nearest known verb lemma.
    [...new Set(allGlosses)].forEach((g) => {
      if (isVerbLikeGloss(g) || map.has(g)) return;
      const best = bestVerbLemmaForConcept(g, globalVerbLemmas);
      if (best) map.set(g, best);
    });

    // Small fallback set for opaque nominal concepts that may not have paired
    // verb glosses in dictionary rows.
    const fallback = {
      speech: 'speak',
      sight: 'see',
      thought: 'think',
      movement: 'move',
      knowledge: 'know',
      possession: 'have'
    };
    Object.entries(fallback).forEach(([k, v]) => { if (!map.has(k)) map.set(k, v); });

    return map;
  }

  function conceptToVerbLemma(word, conceptVerbMap){
    const w = (word || '').toLowerCase().trim();
    if (!w) return null;
    return conceptVerbMap.get(w) || conceptVerbMap.get(englishTokenStem(w)) || null;
  }

  function conceptToVerbFromGlossText(glossText, conceptVerbMap){
    const parts = (glossText || '').split('/').map(x => x.trim().toLowerCase()).filter(Boolean);
    if (!parts.length) return null;

    // If a gloss variant is already verbal, use that lemma directly.
    for (const p of parts) {
      if (isVerbLikeGloss(p)) {
        const v = normalizeVerbCandidate(p);
        if (v) return v;
      }
    }

    // Otherwise try concept-noun -> verb mapping.
    for (const p of parts) {
      const v = conceptToVerbLemma(p, conceptVerbMap);
      if (v) return v;
    }
    return null;
  }

  function inflectEnglishVerb(lemma, tense){
    const irregularPast = { be: 'was', have: 'had', do: 'did', go: 'went', see: 'saw', speak: 'spoke', think: 'thought' };
    const irregular3sg = { be: 'is', have: 'has', do: 'does', go: 'goes' };
    if (tense === 'future') return `will ${lemma}`;
    if (tense === 'past') return irregularPast[lemma] || (lemma.endsWith('e') ? `${lemma}d` : `${lemma}ed`);
    // present default: 3rd singular
    if (irregular3sg[lemma]) return irregular3sg[lemma];
    if (/(s|x|z|ch|sh)$/.test(lemma)) return `${lemma}es`;
    if (/[^aeiou]y$/.test(lemma)) return `${lemma.slice(0, -1)}ies`;
    return `${lemma}s`;
  }

  function getUniMorphForm(unimorphVerbs, lemma, slot){
    const l = (lemma || '').toLowerCase().trim();
    if (!l || !unimorphVerbs) return null;
    return unimorphVerbs?.[l]?.[slot] || null;
  }

  function buildUniMorphReverseIndex(unimorphVerbs){
    const reverse = new Map();
    Object.entries(unimorphVerbs || {}).forEach(([lemma, forms]) => {
      const l = (lemma || '').toLowerCase();
      if (!l) return;
      reverse.set(l, l);
      ['cont_prs', 'ptcp_pst', 'prs_3sg', 'pst'].forEach((k) => {
        const f = (forms?.[k] || '').toLowerCase().trim();
        if (f && !reverse.has(f)) reverse.set(f, l);
      });
    });
    return reverse;
  }

  function parseVerbTag(tag){
    const s = (tag || '').toUpperCase().trim();
    if (!s) return { isVerb: false, tense: null, participle: false };
    const feats = s.split(';').filter(Boolean);
    const hasVerbFeat = feats.some(f => f === 'V' || f.startsWith('V.'));
    const participle = feats.includes('V.PTCP');
    let tense = null;
    if (feats.includes('PRS')) tense = 'present';
    else if (feats.includes('PST')) tense = 'past';
    else if (feats.includes('FUT')) tense = 'future';
    const isVerb = hasVerbFeat || (!!tense && (feats.includes('IND') || feats.includes('PRF') || feats.includes('HAB')));
    return { isVerb, tense, participle };
  }

  function lemmaFromSurface(surface, unimorphReverse){
    const s = (surface || '').toLowerCase().trim();
    if (!s) return '';
    return unimorphReverse?.get(s) || normalizeVerbCandidate(s);
  }

  function realizeTaggedVerb(surface, tag, unimorphVerbs, unimorphReverse){
    const parsed = parseVerbTag(tag);
    if (!parsed.isVerb) return null;
    const lemma = lemmaFromSurface(surface, unimorphReverse);
    if (!lemma) return surface;
    if (parsed.tense === 'future') return `will ${lemma}`;
    if (parsed.tense === 'past') {
      return getUniMorphForm(unimorphVerbs, lemma, 'pst') || inflectEnglishVerb(lemma, 'past');
    }
    // Present defaults to finite present for readability.
    if (parsed.tense === 'present') {
      return getUniMorphForm(unimorphVerbs, lemma, 'prs_3sg') || inflectEnglishVerb(lemma, 'present');
    }
    return surface;
  }

  function presentParticiple(lemma){
    const l = (lemma || '').toLowerCase();
    if (!l) return '';
    if (l === 'be') return 'being';
    if (l === 'see') return 'seeing';
    if (l.endsWith('ie')) return `${l.slice(0, -2)}ying`;
    if (l.endsWith('e') && !/(ee|ye|oe)$/.test(l)) return `${l.slice(0, -1)}ing`;
    if (/[^aeiou][aeiou][^aeiouwxy]$/.test(l)) return `${l}${l.slice(-1)}ing`;
    return `${l}ing`;
  }

  function inflectByAux(lemma, aux, unimorphVerbs){
    const descriptor = (aux?.descriptor || '').toLowerCase();
    if (descriptor.includes('continuous') || descriptor.includes('progressive')) {
      return getUniMorphForm(unimorphVerbs, lemma, 'cont_prs') || presentParticiple(lemma);
    }
    if (descriptor.includes('perfect')) {
      return getUniMorphForm(unimorphVerbs, lemma, 'ptcp_pst') || inflectEnglishVerb(lemma, aux?.tense || 'past');
    }
    if ((aux?.tense || '') === 'past') {
      return getUniMorphForm(unimorphVerbs, lemma, 'pst') || inflectEnglishVerb(lemma, 'past');
    }
    if ((aux?.tense || '') === 'present') {
      return getUniMorphForm(unimorphVerbs, lemma, 'prs_3sg') || inflectEnglishVerb(lemma, 'present');
    }
    return inflectEnglishVerb(lemma, aux?.tense || 'present');
  }

  function predictedTranslation(tokens, rows, reverseGloss, conceptVerbMap, unimorphVerbs, unimorphReverse){
    const fromReverse = (token) => reverseGloss?.get(normalizeTovianForGloss(token)) || null;
    const tokenData = (token) => {
      const rev = fromReverse(token);
      let m = bestMatchToken(rows, token);
      if (!m && rev?.tovian) m = bestMatchToken(rows, rev.tovian);
      return {
        gloss: rev?.gloss || (m ? m.english : '')
      };
    };

    const tokenInfos = tokens.map(tok => {
      const tagMatch = tok.match(/^([A-Za-z'’]+)-([A-Z][A-Z0-9.;]*)$/i);
      if (tagMatch) {
        const realized = realizeTaggedVerb(tagMatch[1], tagMatch[2], unimorphVerbs, unimorphReverse);
        if (realized) return { pred: realized, aux: null };
      }
      const segs = tok.split('-');
      if (segs.length > 1) {
        const segGlosses = segs.map(s => firstGloss(tokenData(s).gloss) || s);
        const markers = [];
        const lexical = [];
        segGlosses.forEach(g => {
          const code = markerCodeFromGloss(g);
          if (code) markers.push(code);
          else lexical.push(g);
        });
        const pred = (lexical.length === 1 && markers.length)
          ? `${lexical[0]}-${markers.join('.')}`
          : segGlosses.join(' ');
        const fullGloss = tokenData(tok).gloss || '';
        return { pred, fullGloss, aux: parseAuxGloss(firstGloss(fullGloss)) };
      }
      const fullGloss = tokenData(tok).gloss || '';
      const g = firstGloss(fullGloss) || tok;
      return { pred: g, fullGloss, aux: parseAuxGloss(g) };
    });

    const out = [];
    for (let i = 0; i < tokenInfos.length; i += 1) {
      const cur = tokenInfos[i];
      if (cur.aux && i + 1 < tokenInfos.length) {
        const next = tokenInfos[i + 1];
        const head = (next.pred || '').split('-')[0].trim().split(/\s+/)[0];
        const lemma = conceptToVerbFromGlossText(next.fullGloss, conceptVerbMap) || conceptToVerbLemma(head, conceptVerbMap);
        if (lemma) {
          const inflected = inflectByAux(lemma, cur.aux, unimorphVerbs);
          out.push(inflected);
          i += 1; // consume concept noun token
          continue;
        }
        if (next.pred) {
          const tag = auxTag(cur.aux);
          const realized = tag ? realizeTaggedVerb(next.pred, tag, unimorphVerbs, unimorphReverse) : null;
          out.push(realized || next.pred);
          i += 1; // consume concept noun token
          continue;
        }
      }
      out.push(cur.pred);
    }

    return out.join(' ');
  }

  function glossTable(tokens, rows, reverseGloss){
    const head = `<thead><tr><th>Token</th><th>Segments</th><th>Gloss</th><th>IPA</th><th>Roots</th></tr></thead>`;
    const fromReverse = (token) => reverseGloss?.get(normalizeTovianForGloss(token)) || null;
    const tokenData = (token) => {
      const rev = fromReverse(token);
      let m = bestMatchToken(rows, token);
      if (!m && rev?.tovian) m = bestMatchToken(rows, rev.tovian);
      return {
        gloss: rev?.gloss || (m ? m.english : null),
        glossCompact: compactAuxGloss(rev?.gloss || (m ? m.english : null)),
        ipa: (m?.ipa || rev?.ipa || ''),
        roots: (m?.roots || ''),
        tovian: (m?.tovian || rev?.tovian || token)
      };
    };

    const body = tokens.map(tok => {
      const segs = tok.split('-');
      const parts = segs.map(s => ({ s, d: tokenData(s) }));
      if (parts.length > 1) {
        const segText = parts.map(p => `<span class="tovian">${p.s}</span>`).join('‑');
        const gloss = parts.map(p => p.d.glossCompact || p.d.gloss || '(?)').join(' + ');
        const ipa = parts.map(p => p.d.ipa || '').filter(Boolean).join(' ');
        const roots = parts.map(p => p.d.roots || '').filter(Boolean).join(' | ');
        return `<tr><td>${tok}</td><td>${segText}</td><td>${gloss}</td><td>${ipa}</td><td>${roots}</td></tr>`;
      }
      const d = tokenData(tok);
      if (!d.gloss && !d.ipa && !d.roots) return `<tr><td>${tok}</td><td class="muted" colspan="4">(no match)</td></tr>`;
      return `<tr><td>${tok}</td><td class="tovian">${d.tovian}</td><td>${d.glossCompact || d.gloss || '(?)'}</td><td>${d.ipa || ''}</td><td>${d.roots || ''}</td></tr>`;
    }).join('');
    return `<table>${head}<tbody>${body}</tbody></table>`;
  }

  function choosePersonSuffix(words){
    const w0 = (words[0]||'').toLowerCase();
    if (w0 === 'i' || w0 === 'we') return 'i'; // 1st
    if (w0 === 'you') return 'o'; // 2nd
    return 'a'; // 3rd default
  }

  function buildCaseObject(rows, tokens){
    // Simple PP detection with determiners: in/at/with/for/from/to/towards/together with
    // Returns { phrase, consumed } where phrase is the Tovian case-marked object and consumed is indices removed
    const lower = tokens.map(t => t.toLowerCase());
    const detWords = new Set(['the','a','an']);
    const caseMap = {
      'in': 'ti-', 'at': 'ti-', 'on': 'ti-',
      'with': 'si-', 'by': 'si-',
      'for': 'lhu-',
      'from': 'di-', 'away': 'di-',
      'to': 'su-', 'towards': 'su-',
      'together': 'yi-'
    };
    for (let i=0; i<lower.length; i++) {
      const w = lower[i];
      if (w in caseMap || caseMap[w]) {
        let j = i + 1;
        if (detWords.has(lower[j])) j++;
        const head = tokens[j];
        if (!head) continue;
        // Lookup noun
        const norm = normalizeEnglish(head.replace(/[.,!?;:]+$/,''));
        let hit = rows.find(e => normalizeEnglish(e.english) === norm);
        if (!hit) hit = rows.find(e => normalizeEnglish(e.english).startsWith(norm));
        if (!hit) continue;
        // Build: definiteness 'a-' or 'o-' for non-subject
        const def = (j-1 >= 0 && detWords.has(lower[j-1]) && lower[j-1] === 'a') ? 'o-' : 'a-';
        const casePref = caseMap[w] || 'ti-';
        const noun = hit.tovian; // includes class prefix
        const phrase = `${def}${casePref}${noun}`;
        // consumed indices: i, (i+1 if det), j
        const consumed = new Set([i]);
        if (detWords.has(lower[i+1])) consumed.add(i+1);
        consumed.add(j);
        return { phrase, consumed };
      }
    }
    return null;
  }

  function draftTranslateENtoTovian(rows, text){
    const words = text.split(/\s+/).filter(Boolean);
    const out = [];
    // Determine tense from English hints
    const joined = words.join(' ').toLowerCase();
    let aux = 'fa';
    if (/\b(will|tomorrow)\b/.test(joined)) aux = 'fo';
    else if (/(ed\b|yesterday|ago)\b/.test(joined)) aux = 'fe';
    // Determine person suffix for main verb (heuristic)
    const first = (words[0]||'').toLowerCase();
    let personSuf = 'a'; // default aligns with example; adjust per grammar
    if (first === 'you') personSuf = 'o';
    const subjPron = first === 'i' ? 'na' : (first === 'you' ? 'wa' : '');
    // Map words to Tovian and mark verbs
    const verbSet = new Set(['see','speak','go','walk','be','have','do','eat','sleep','love','know','want','give','take','come','make','say','think','hear','look']);
    const mapped = words.map(w => {
      const raw = w.replace(/[.,!?;:]+$/,'');
      const norm = normalizeEnglish(raw);
      let hit = rows.find(e => normalizeEnglish(e.english) === norm);
      if (!hit) hit = rows.find(e => normalizeEnglish(e.english).startsWith(norm));
      const isVerb = !!(hit && verbSet.has(normalizeEnglish(hit.english).split(/\s+/)[0]));
      return { en: raw, to: hit ? hit.tovian : raw, ipa: hit ? hit.ipa : '', isVerb };
    });
    // Case-marked object phrase detection
    const cpp = buildCaseObject(rows, words);
    // Find first verb and move AUX+VERB to sentence end (SOV)
    const vi = mapped.findIndex(m => m.isVerb);
    if (vi !== -1) {
      const verb = mapped[vi];
      // person suffix on main verb
      let main = verb.to + (personSuf || '');
      main = main.replace(/([aeiou])\1+$/,'$1');
      const pre = mapped.slice(0, vi);
      const post = mapped.slice(vi + 1);
      // Remove consumed tokens from rest if any
      let rest = [...pre, ...post].map(m => m.to).filter(Boolean);
      if (cpp && cpp.consumed) {
        // Remove consumed tokens by original word indices: rebuild rest from words
        rest = words
          .map((w, idx) => ({ idx, w }))
          .filter(x => !cpp.consumed.has(x.idx) && x.idx !== vi)
          .map(x => {
            const raw = x.w.replace(/[.,!?;:]+$/,'');
            const norm = normalizeEnglish(raw);
            let hit = rows.find(e => normalizeEnglish(e.english) === norm);
            if (!hit) hit = rows.find(e => normalizeEnglish(e.english).startsWith(norm));
            return hit ? hit.tovian : raw;
          });
      }
      const parts = [];
      if (subjPron) parts.push(subjPron);
      if (cpp && cpp.phrase) parts.push(cpp.phrase);
      parts.push(aux, main);
      return parts.filter(Boolean).join(' ');
    }
    // Fallback: just prefix aux
    return [subjPron, aux, ...mapped.map(m => m.to)].filter(Boolean).join(' ');
  }

  window.addEventListener('DOMContentLoaded', async () => {
    const loadingEl = document.getElementById('glossLoading');
    const glossIn = document.getElementById('glossInput');
    const glossBtn = document.getElementById('glossBtn');
    const glossOut = document.getElementById('glossOut');
    const clearGloss = document.getElementById('clearGloss');
    const tranIn = document.getElementById('tranInput');
    const tranBtn = document.getElementById('tranBtn');
    const tranOut = document.getElementById('tranOut');
    const clearTran = document.getElementById('clearTran');

    if (glossOut) {
      glossOut.innerHTML = `<div class="card"><div class="muted">Loading…</div></div>`;
    }
    [glossIn, glossBtn, clearGloss, tranIn, tranBtn, clearTran].forEach((el) => {
      if (el) el.disabled = true;
    });

    let dict = [];
    let reverseGloss = new Map();
    let conceptVerbMap = new Map();
    let unimorphVerbs = {};
    let unimorphReverse = new Map();
    try { dict = await loadDict(); } catch {}
    try { conceptVerbMap = deriveConceptVerbMap(dict); } catch {}
    try { reverseGloss = await loadTemplateGlossReverse(); } catch {}
    try { unimorphVerbs = await loadUniMorphVerbs(); } catch {}
    try { unimorphReverse = buildUniMorphReverseIndex(unimorphVerbs); } catch {}

    [glossIn, glossBtn, clearGloss, tranIn, tranBtn, clearTran].forEach((el) => {
      if (el) el.disabled = false;
    });
    if (loadingEl) loadingEl.style.display = 'none';
    if (glossOut && /Loading…/.test(glossOut.textContent || '')) glossOut.innerHTML = '';

    glossBtn?.addEventListener('click', () => {
      const text = (glossIn?.value || '').trim();
      if (!text) { glossOut.innerHTML = ''; return; }
      const tokens = tokenizeTovian(text);
      const predicted = predictedTranslation(tokens, dict, reverseGloss, conceptVerbMap, unimorphVerbs, unimorphReverse);
      glossOut.innerHTML = `<div class="card" style="margin-bottom:10px"><div><b>Predicted translation:</b> ${predicted}</div></div>` + glossTable(tokens, dict, reverseGloss);
    });
    clearGloss?.addEventListener('click', () => { if (glossIn) glossIn.value=''; glossOut.innerHTML=''; });

    tranBtn?.addEventListener('click', () => {
      const text = (tranIn?.value || '').trim();
      if (!text) { tranOut.innerHTML = ''; return; }
      const draft = draftTranslateENtoTovian(dict, text);
      tranOut.innerHTML = '';
      // Line 1: Tovian (with .tovian)
      tranOut.appendChild(el(`<div class="card"><div class="tovian" style="font-size:22px">${draft}</div></div>`));
      // Line 2: Romanization (same text, no .tovian)
      tranOut.appendChild(el(`<div class="card"><div style="font-size:18px">${draft}</div></div>`));
      // Line 3: IPA (best-effort per-token)
      const ipa = draft.split(/\s+/).map(tok => {
        const m = bestMatchToken(dict, tok);
        return m && m.ipa ? m.ipa.replace(/\s+/g, '') : tok;
      }).join(' ');
      tranOut.appendChild(el(`<div class="card"><div class="ipa" style="font-size:14px">${ipa}</div></div>`));
    });
    clearTran?.addEventListener('click', () => { if (tranIn) tranIn.value=''; tranOut.innerHTML=''; });
  });
})();
