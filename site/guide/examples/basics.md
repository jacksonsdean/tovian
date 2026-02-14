---
layout: guide_page.njk
permalink: /examples/basics.html
title: Basic Phrases | Tovian Examples
---

# Basic Phrases

Simple vocabulary and short phrases to get started.

<div id="basicsContent">
  <p><em>Loading examples...</em></p>
</div>

<script src="/examples.js"></script>
<script>
window.loadExamplesFromCSV().then(data => {
  if (!data) return;
  
  const basicExamples = data.rows.filter(ex => ex.category === 'Basics');

  window.renderExampleCards('basicsContent', basicExamples);
});
</script>

