---
layout: guide_page.njk
permalink: /guide/syntax.html
title: Syntax & Word Order | Tovian Guide
---
# Syntax & Word Order

Canonical word order is historically SOV (Subject–Object–Verb):

- {% tovc "ani-person loc-inan-city aux_3_sim_prs sight" %} — “The person sees in the city.”

Modern Tovian allows fronting for emphasis. Elements can be moved to the beginning for focus, while case marking preserves roles:

- {% tovc "loc-inan-city ani-person aux_3_sim_prs sight" %} — “In the city, the person sees.”

**Important**: attributive nouns (adjectives) follow the nouns they modify and should remain adjacent:

- {% tovc "ani-person loc-inan-city large aux_3_sim_prs sight" %} — “The person sees the big city.”
- {% tovc "loc-inan-city ani-person large aux_3_sim_prs sight" %} — “The big person sees the city.” (meaning changes)
