---
layout: guide_page.njk
permalink: /guide/examples/sentences.html
title: Simple Sentences | Examples | Tovian Guide
---

# Simple Sentences

Building basic declarative and descriptive sentences.

## Core Structures

<div id="sentencesContent">
  <p><em>Loading examples from CSV...</em></p>
</div>

## Word Order

- **Basic order**: Subject — Verb — Object/Locative
- **Attributive nouns** (adjectives) follow directly after the noun they modify
- **Case markers** attach to the beginning of noun phrases to indicate grammatical role

<script src="/examples.js"></script>
<script>
window.loadExamplesFromCSV().then(data => {
  if (!data) return;
  
  const sentenceExamples = data.rows.filter(ex => ex.category === 'Simple Sentence');
  let html = '<ul>\n';
  
  sentenceExamples.forEach(ex => {
    html += `<li><strong><code>${ex.tovian}</code></strong><br/>${ex.ipa}<br/><em>${ex.english}</em></li>\n`;
  });
  
  html += '</ul>';
  document.getElementById('sentencesContent').innerHTML = html;
});
</script>

