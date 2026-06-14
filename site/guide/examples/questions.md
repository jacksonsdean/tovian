---
layout: guide_page.njk
permalink: /examples/questions.html
title: Forming Questions | Tovian Examples
---

# Forming Questions

Building yes/no and information questions in Tovian.

## Examples

<div id="questionsContent">
  <p><em>Loading examples...</em></p>
</div>

## Question Words

The root `lhan` combines with case markers:
- `si-lhan` — how (instrumental case)
- `ti-lhan` — where (locative case)
- `tu-lhan` — when (temporal case)
- `hi-lhan` — whose/of whom (genitive case)

<script src="{{ '/examples.js' | url }}"></script>
<script>
window.loadExamplesFromCSV().then(data => {
  if (!data) return;
  
  const questionExamples = data.rows.filter(ex => 
    ex.category === 'Question' || ex.category === 'Question with Case'
  );

  window.renderExampleCards('questionsContent', questionExamples);
});
</script>

