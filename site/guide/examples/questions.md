---
layout: guide_page.njk
permalink: /guide/examples/questions.html
title: Forming Questions | Examples | Tovian Guide
---

# Forming Questions

Building yes/no and information questions in Tovian.

## Examples

<div id="questionsContent">
  <p><em>Loading examples from CSV...</em></p>
</div>

## Question Words

The root `lhan` combines with case markers:
- `si-lhan` — how (instrumental case)
- `ti-lhan` — where (locative case)
- `tu-lhan` — when (temporal case)
- `hi-lhan` — whose/of whom (genitive case)

<script src="/examples.js"></script>
<script>
window.loadExamplesFromCSV().then(data => {
  if (!data) return;
  
  const questionExamples = data.rows.filter(ex => 
    ex.category === 'Question' || ex.category === 'Question with Case'
  );
  let html = '<ul>\n';
  
  questionExamples.forEach(ex => {
    html += `<li><strong><code>${ex.tovian}</code></strong><br/>${ex.ipa}<br/><em>${ex.english}</em></li>\n`;
  });
  
  html += '</ul>';
  document.getElementById('questionsContent').innerHTML = html;
});
</script>

