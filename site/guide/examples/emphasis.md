---
layout: guide_page.njk
permalink: /guide/examples/emphasis.html
title: Emphasis & Word Order | Examples | Tovian Guide
---

# Emphasis & Word Order

Using fronting and word order for emphasis and clarity.

## Examples

<div id="emphasisContent">
  <p><em>Loading examples from CSV...</em></p>
</div>

## Principles

- Move elements to the beginning of the sentence for focus
- Case marking preserves grammatical role after fronting
- Attributive nouns (adjectives) follow the noun they modify
- These techniques create stylistic variation while maintaining meaning

<script src="/examples.js"></script>
<script>
window.loadExamplesFromCSV().then(data => {
  if (!data) return;
  
  const emphasisExamples = data.rows.filter(ex => 
    ex.category === 'Emphasis/Fronting' || ex.category === 'Attributive Noun'
  );
  let html = '<ul>\n';
  
  emphasisExamples.forEach(ex => {
    html += `<li><strong><code>${ex.tovian}</code></strong><br/>${ex.ipa}<br/><em>${ex.english}</em></li>\n`;
  });
  
  html += '</ul>';
  document.getElementById('emphasisContent').innerHTML = html;
});
</script>
