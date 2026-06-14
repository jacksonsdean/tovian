---
layout: guide_page.njk
permalink: /guide/questions.html
title: Forming Questions | Tovian Guide
---
# Forming Questions

## Yes/No

Add <code>lhan</code> at the start of a question.

- <code>lhan yule-fethr wa ofa fethr?</code>  
  English: Do you speak Tovian?
Add {% tovc "what" %} at the start of a yes/no question.

- {% tovc "int you aux_2_sim_prs speech" %}?  
  English: Do you speak?

## Information (wh- style)

Combine a case prefix with {% tovc "what" %} to ask for a specific role:

<table>
  <thead>
    <tr><th>Form</th><th>Meaning</th></tr>
  </thead>
  <tbody>
    <tr><td><code>si-lhan</code></td><td>how</td></tr>
    <tr><td><code>ti-lhan</code></td><td>where</td></tr>
    <tr><td><code>tu-lhan</code></td><td>when</td></tr>
    <tr><td><code>mi-lhan</code></td><td>to whom / what</td></tr>
    <tr><td>{% tovc "who" %}</td><td>who</td></tr>
    <tr><td>{% tovc "whom" %}</td><td>whom</td></tr>
    <tr><td>{% tovc "what" %}</td><td>what</td></tr>
    <tr><td>{% tovc "when" %}</td><td>when</td></tr>
    <tr><td>{% tovc "where" %}</td><td>where</td></tr>
    <tr><td>{% tovc "how" %}</td><td>how</td></tr>
  </tbody>
</table>

Examples:

- <code>si-lhan ta fe fethr?</code> — English: How did he speak?
- <code>ti-lhan ta fa fethr?</code> — English: Where does he speak?
- <code>mi-lhan wa ofa fethr?</code> — English: To whom are you speaking?
- {% tovc "ins-what he aux_3_sim_pst speech" %}? — English: How did he speak?
- {% tovc "loc-what he aux_3_sim_prs speech" %}? — English: Where does he speak?
- {% tovc "dat-what you aux_2_sim_prs speech" %}? — English: To whom are you speaking?
