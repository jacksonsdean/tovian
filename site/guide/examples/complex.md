---
layout: guide_page.njk
permalink: /examples/complex.html
title: Complex Sentences | Tovian Examples
---

# Complex Sentences

Conditional, hypothetical, and nested-clause patterns.

## Examples

<div id="complexContent">
  <p><em>Loading examples...</em></p>
</div>

## Notes

- Tovian commonly uses clause chaining and punctuation for complex relations.
- Hypothetical meaning can be expressed with counterfactual auxiliary forms.
- Overt coordinators/subordinators are currently limited, so context and ordering matter.
- Explicit temporal examples use `tu-le-ngothr: P; Q`, “at the time described by P, Q.” See [temporal clauses](../guide/syntax.html) for scope and agreement.

<script src="{{ '/examples.js' | url }}"></script>
<script>
window.loadExamplesFromCSV().then(data => {
  if (!data) return;

  const complexExamples = data.rows.filter(ex => ex.category === 'Complex Sentences');
  window.renderExampleCards('complexContent', complexExamples);
});
</script>
