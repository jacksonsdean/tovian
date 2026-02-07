---
layout: guide_page.njk
permalink: /guide/examples/basics.html
title: Basic Phrases | Examples | Tovian Guide
---

# Basic Phrases

Simple vocabulary and short phrases to get started.

<div id="basicsContent">
  <p><em>Loading examples from CSV...</em></p>
</div>

<script src="/examples.js"></script>
<script>
window.loadExamplesFromCSV().then(data => {
  if (!data) return;
  
  const basicExamples = data.rows.filter(ex => ex.category === 'Basics');
  let html = '<table>\n<tr><th>Tovian</th><th>IPA</th><th>English</th></tr>\n';
  
  basicExamples.forEach(ex => {
    html += `<tr><td><code>${ex.tovian}</code></td><td>${ex.ipa}</td><td>${ex.english}</td></tr>\n`;
  });
  
  html += '</table>';
  document.getElementById('basicsContent').innerHTML = html;
});
</script>

