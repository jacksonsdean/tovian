// Guide scaffolding: sidebar, prev/next, and page ToC
(function(){
  window.addEventListener('DOMContentLoaded', async () => {
    try {
      const base = location.pathname.includes('/guide/') ? '' : 'guide/';
      const pages = await fetch(base + 'manifest.json').then(r => r.json());
      // Normalize current path to '/guide/<file>.html' regardless of site base
      const match = location.pathname.match(/\/guide\/[^?#]*/);
      const currentPath = match ? match[0] : location.pathname; // e.g., '/guide/verbs.html'

      // Sidebar
      const aside = document.getElementById('guideSidebar');
      const article = document.querySelector('.guide-content');



      if (aside && Array.isArray(pages)) {
        const nav = document.createElement('nav');
        pages.forEach(p => {
          const a = document.createElement('a');
          a.href = p.path; a.textContent = p.title;
          if (currentPath.endsWith('/' + p.path)) a.classList.add('active');
          nav.appendChild(a);
        });
        aside.innerHTML = '<div></div>'; // clear
        const guide_title = document.createElement('h4', { className: 'section-title' });

        guide_title.textContent = 'GUIDE';        
        guide_title.className = 'section-title';
        // add space
        guide_title.style.marginTop = '1em';

        // Per-page mini navigation (horizontal list at top)
        const mini = document.getElementById('guideMiniNav') || document.createElement('nav');
        mini.className = 'guide-mini-nav';
        mini.innerHTML = '';
        const heads = document.querySelectorAll('.guide-content h2, .guide-content h3');
        heads.forEach((h, i) => {
            if (!h.id) h.id = 's' + (i + 1);
            const a = document.createElement('a');
            a.href = '#' + h.id; a.textContent = h.textContent;
            mini.appendChild(a);
        });
        if (!mini.id) mini.id = 'guideMiniNav';
        if (article && !document.getElementById('guideMiniNav')) {
            article.insertBefore(mini, article.firstChild);
        }
        // Page ToC
        const toc = document.createElement('div');
        toc.className = 'guide-toc';
        const headings = document.querySelectorAll('.guide-content h2, .guide-content h3');
        if (headings.length) {
            const title = document.createElement('h3');
            title.className = 'section-title';
            title.textContent = 'On this page';
            toc.appendChild(title);
            headings.forEach((h, i) => {
                if (!h.id) h.id = 's' + (i+1);
                const link = document.createElement('a');
                link.href = '#' + h.id;
                link.textContent = h.textContent;
                toc.appendChild(link);
            });
            aside.appendChild(toc);
        }
        aside.appendChild(guide_title);
        aside.appendChild(nav);
    }
    
    // Prev/Next
    const file = currentPath.split('/').pop();
      let idx = pages.findIndex(p => (p.path || '') === file);
      const prev = idx > 0 ? pages[idx - 1] : null;
      const next = idx >= 0 && idx < pages.length - 1 ? pages[idx + 1] : null;
      const navHost = document.getElementById('guideNav');
      if (navHost) {
        navHost.innerHTML = '';
        if (prev) {
          const a = document.createElement('a');
          a.className = 'btn'; a.href = prev.path; a.textContent = '← ' + prev.title;
          navHost.appendChild(a);
        }
        if (next) {
          const a = document.createElement('a');
          a.className = 'btn'; a.href = next.path; a.textContent = next.title + ' →';
          navHost.appendChild(a);
        }
      }

      // Auto-build auxiliaries table on Verbs page (and anywhere the host exists)
      const auxHost = document.getElementById('auxiliariesAuto');
      if (auxHost) {
        const dictPath = location.pathname.includes('/guide/') ? '../dictionary.csv' : 'dictionary.csv';
        try {
          const csvText = await fetch(dictPath).then(r => r.text());
          const lines = csvText.split(/\r?\n/).filter(Boolean);
          const rows = lines.map(l => l.split(','));
          rows.shift(); // header

          const re = /^auxiliary:\s*([^()]+)\(([^)]+)\)\s*$/i;
          const byAspect = new Map();
          for (const r of rows) {
            const english = (r[0] || '').trim();
            const tovian = (r[1] || '').trim();
            const ipa = (r[2] || '').trim();
            const m = english.match(re);
            if (!m) continue;
            const aspect = (m[1] || '').trim().toLowerCase();
            const tense = (m[2] || '').trim().toLowerCase();
            if (!byAspect.has(aspect)) byAspect.set(aspect, new Map());
            byAspect.get(aspect).set(tense, { tovian, ipa });
          }

          const tenses = ['past', 'present', 'future'];
          const aspects = Array.from(byAspect.keys()).sort((a,b) => a.localeCompare(b));
          if (!aspects.length) {
            auxHost.textContent = 'No auxiliary entries found in dictionary.csv.';
            return;
          }

          const esc = (s) => (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
          const head = `<thead><tr><th>Aspect</th>${tenses.map(t => `<th>${t}</th>`).join('')}</tr></thead>`;
          const body = aspects.map(a => {
            const m = byAspect.get(a);
            const cells = tenses.map(t => {
              const v = m.get(t);
              if (!v) return '<td class="muted">—</td>';
              return `<td><div class="tovian">${esc(v.tovian)}</div><div class="muted" style="font-size:.9em;">${esc(v.ipa)}</div></td>`;
            }).join('');
            return `<tr><td><b>${esc(a)}</b></td>${cells}</tr>`;
          }).join('');

          auxHost.classList.remove('muted');
          auxHost.innerHTML = `<div style="overflow:auto;"><table>${head}<tbody>${body}</tbody></table></div>`;
        } catch (e) {
          auxHost.textContent = 'Failed to load dictionary.csv for auxiliaries.';
        }
      }

      // Auto-build full auxiliary dropdown (person × mood × voice × aspect × tense)
      const allAuxSelect = document.getElementById('allAuxSelect');
      const allAuxFilter = document.getElementById('allAuxFilter');
      const allAuxPreview = document.getElementById('allAuxPreview');
      if (allAuxSelect && allAuxFilter && allAuxPreview) {
        const dictPath = location.pathname.includes('/guide/') ? '../dictionary.csv' : 'dictionary.csv';
        try {
          const csvText = await fetch(dictPath).then(r => r.text());
          const lines = csvText.split(/\r?\n/).filter(Boolean);
          const rows = lines.map(l => l.split(','));
          rows.shift();

          const auxRows = [];
          for (const r of rows) {
            const english = (r[0] || '').trim();
            if (!/^auxiliary-form:/i.test(english)) continue;
            auxRows.push({
              english,
              tovian: (r[1] || '').trim(),
              ipa: (r[2] || '').trim(),
              roots: (r[3] || '').trim(),
            });
          }

          if (!auxRows.length) {
            allAuxPreview.textContent = 'No auxiliary-form entries found in dictionary.csv.';
            return;
          }

          auxRows.sort((a,b) => a.english.localeCompare(b.english));

          const esc = (s) => (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
          const renderOptions = (needle) => {
            const q = (needle || '').trim().toLowerCase();
            const list = q
              ? auxRows.filter(e => `${e.english} ${e.tovian} ${e.ipa}`.toLowerCase().includes(q))
              : auxRows;

            allAuxSelect.innerHTML = list.map((e, i) => {
              const label = e.english.replace(/^auxiliary-form:\s*/i, '');
              return `<option value="${esc(label)}" data-i="${i}">${esc(label)} — ${esc(e.tovian)}</option>`;
            }).join('');

            allAuxPreview.textContent = `Showing ${list.length} auxiliary forms.`;
          };

          const showSelected = () => {
            const opt = allAuxSelect.selectedOptions?.[0];
            if (!opt) return;
            const label = opt.value;
            // Re-find in auxRows by label (safe enough; labels are unique-ish)
            const match = auxRows.find(e => e.english.toLowerCase().includes(label.toLowerCase()));
            if (!match) return;
            allAuxPreview.innerHTML = `<div><b>${esc(match.tovian)}</b> <span class="muted">${esc(match.ipa)}</span></div>`;
          };

          allAuxFilter.addEventListener('input', () => {
            renderOptions(allAuxFilter.value);
            showSelected();
          });
          allAuxSelect.addEventListener('change', showSelected);

          renderOptions('');
          // Select first option by default
          if (allAuxSelect.options.length) allAuxSelect.selectedIndex = 0;
          showSelected();
        } catch (e) {
          allAuxPreview.textContent = 'Failed to load dictionary.csv for full auxiliary list.';
        }
      }
    } catch (e) {
      // silent
    }
  });
})();
