---
layout: guide_page.njk
permalink: /examples/sentences.html
title: Simple Sentences | Tovian Examples
---

# Simple Sentences

Building basic declarative and descriptive sentences.

## Core Structures

<div id="sentencesContent">
  <p><em>Loading examples...</em></p>
</div>

## Word Order

- **Basic order**: Subject — Verb — Object/Locative
- **Attributive nouns** (adjectives) follow directly after the noun they modify
- **Case markers** attach to the beginning of noun phrases to indicate grammatical role

<script src="{{ '/examples.js' | url }}"></script>
<script>
window.loadExamplesFromCSV().then(data => {
  if (!data) return;
  
  const sentenceExamples = data.rows.filter(ex => ex.category === 'Simple Sentence');

  window.renderExampleCards('sentencesContent', sentenceExamples);
});
</script>

