---
layout: guide_page.njk
permalink: /examples/compounds.html
title: Compound Sentences | Tovian Examples
---

# Compound Sentences

Building linked and multi-clause sentence patterns.

## Core Structures

<div id="compoundsContent">
  <p><em>Loading examples...</em></p>
</div>

<script src="{{ '/examples.js' | url }}"></script>
<script>
window.loadExamplesFromCSV().then(data => {
  if (!data) return;
  
  const sentenceExamples = data.rows.filter(ex => ex.category === 'Compound Sentences');

  window.renderExampleCards('compoundsContent', sentenceExamples);
});
</script>

