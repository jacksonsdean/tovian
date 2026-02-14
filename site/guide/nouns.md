---
layout: guide_page.njk
permalink: /guide/nouns.html
title: Noun Classes & Cases | Tovian Guide
---
# Noun Classes & Cases
Order: <code>[case]-[class]-stem</code>

## Case Prefixes


<table>
  <thead>
    <tr><th>Prefix</th><th>Case</th><th>Role</th></tr>
  </thead>
  <tbody>
    <tr><td>{% tovc "nom" %}</td><td>Nominative</td><td>subject</td></tr>
    <tr><td>{% tovc "acc" %}</td><td>Accusative</td><td>direct object</td></tr>
    <tr><td>{% tovc "gen" %}</td><td>Genitive</td><td>possession</td></tr>
    <tr><td>{% tovc "dat" %}</td><td>Dative</td><td>indirect object</td></tr>
    <tr><td>{% tovc "loc" %}</td><td>Locative</td><td>in / at</td></tr>
    <tr><td>{% tovc "ins" %}</td><td>Instrumental</td><td>with / by means of</td></tr>
    <tr><td>{% tovc "pur" %}</td><td>Purpose</td><td>for</td></tr>
    <tr><td>{% tovc "abl" %}</td><td>Ablative</td><td>away from</td></tr>
    <tr><td>{% tovc "com" %}</td><td>Comitative</td><td>together with</td></tr>
    <tr><td>{% tovc "all" %}</td><td>Allative</td><td>towards</td></tr>
  </tbody>
</table>

## Classes

<table>
  <thead>
    <tr><th>Prefix</th><th>Class</th><th>Example</th></tr>
  </thead>
  <tbody>
    <tr><td>{% tovc "ani" %}</td><td>animate (people, animals, plants)</td><td>{% tovc "ani-person" %} “person”</td></tr>
    <tr><td>{% tovc "inan" %}</td><td>inanimate / places</td><td>{% tovc "inan-city" %} “city”</td></tr>
    <tr><td>{% tovc "abs" %}</td><td>abstract</td><td>{% tovc "abs-wisdom" %} “wisdom”</td></tr>
  </tbody>
  </table>


### Examples

- {% tovc "acc-ani-person aux_3_sim_prs sight" %} — English: [He/She] sees the person.
- {% tovc "loc-inan-city ani-person aux_3_sim_prs sight" %} — English: The person sees in the city.
- {% tovc "gen-ani-person" %} — English: of the person.

## Definiteness

Speakers usually rely on context for definiteness, but optional prefixes can clarify. Definiteness markers are added before case and class markers, with the exception of the nomative case, where it replaces the case marker entirely.

Order with definiteness marker: <code>[definiteness]-[case]-[class]-stem</code>


### Markers
<table>
  <thead>
    <tr><th></th><th>Marker</th></tr>
  </thead>
  <tbody>
    <tr><td>Definite</td><td>{% tovc "def" %}</td></tr>
    <tr><td>Indefinite</td><td>{% tovc "indef" %}</td></tr>
  </tbody>
</table>



### Examples

- {% tovp "nom-ani-person aux_3_sim_prs sight def-loc-inan-city" %} — “The person sees in the city.”
- {% tovp "indef-ani-person aux_3_sim_prs sight indef-loc-inan-city" %} — “A person sees in a city.”


## All possible markers
<details>
<summary>All markers</summary>

<p><em>Order:</em> <code>[definiteness]-[case]-[class]</code> (except nominative, where definiteness replaces case)</p>

<table>
  <thead>
    <tr><th>Case</th><th>Definite</th><th>Indefinite</th></tr>
  </thead>
  <tbody>
    <tr>
      <td>Nominative</td>
      <td>
        {% tovc "def-ani" %},
        {% tovc "def-inan" %},
        {% tovc "def-abs" %}
      </td>
      <td>
        {% tovc "indef-ani" %},
        {% tovc "indef-inan" %},
        {% tovc "indef-abs" %}
      </td>
    </tr>
    <tr>
      <td>Accusative</td>
      <td>
        {% tovc "def-acc-ani" %},
        {% tovc "def-acc-inan" %},
        {% tovc "def-acc-abs" %}
      </td>
      <td>
        {% tovc "indef-acc-ani" %},
        {% tovc "indef-acc-inan" %},
        {% tovc "indef-acc-abs" %}
      </td>
    </tr>
    <tr>
      <td>Genitive</td>
      <td>
        {% tovc "def-gen-ani" %},
        {% tovc "def-gen-inan" %},
        {% tovc "def-gen-abs" %}
      </td>
      <td>
        {% tovc "indef-gen-ani" %},
        {% tovc "indef-gen-inan" %},
        {% tovc "indef-gen-abs" %}
      </td>
    </tr>
    <tr>
      <td>Dative</td>
      <td>
        {% tovc "def-dat-ani" %},
        {% tovc "def-dat-inan" %},
        {% tovc "def-dat-abs" %}
      </td>
      <td>
        {% tovc "indef-dat-ani" %},
        {% tovc "indef-dat-inan" %},
        {% tovc "indef-dat-abs" %}
      </td>
    </tr>
    <tr>
      <td>Locative</td>
      <td>
        {% tovc "def-loc-ani" %},
        {% tovc "def-loc-inan" %},
        {% tovc "def-loc-abs" %}
      </td>
      <td>
        {% tovc "indef-loc-ani" %},
        {% tovc "indef-loc-inan" %},
        {% tovc "indef-loc-abs" %}
      </td>
    </tr>
    <tr>
      <td>Instrumental</td>
      <td>
        {% tovc "def-ins-ani" %},
        {% tovc "def-ins-inan" %},
        {% tovc "def-ins-abs" %}
      </td>
      <td>
        {% tovc "indef-ins-ani" %},
        {% tovc "indef-ins-inan" %},
        {% tovc "indef-ins-abs" %}
      </td>
    </tr>
    <tr>
      <td>Purpose</td>
      <td>
        {% tovc "def-pur-ani" %},
        {% tovc "def-pur-inan" %},
        {% tovc "def-pur-abs" %}
      </td>
      <td>
        {% tovc "indef-pur-ani" %},
        {% tovc "indef-pur-inan" %},
        {% tovc "indef-pur-abs" %}
      </td>
    </tr>
    <tr>
      <td>Ablative</td>
      <td>
        {% tovc "def-abl-ani" %},
        {% tovc "def-abl-inan" %},
        {% tovc "def-abl-abs" %}
      </td>
      <td>
        {% tovc "indef-abl-ani" %},
        {% tovc "indef-abl-inan" %},
        {% tovc "indef-abl-abs" %}
      </td>
    </tr>
    <tr>
      <td>Comitative</td>
      <td>
        {% tovc "def-com-ani" %},
        {% tovc "def-com-inan" %},
        {% tovc "def-com-abs" %}
      </td>
      <td>
        {% tovc "indef-com-ani" %},
        {% tovc "indef-com-inan" %},
        {% tovc "indef-com-abs" %}
      </td>
    </tr>
    <tr>
      <td>Allative</td>
      <td>
        {% tovc "def-all-ani" %},
        {% tovc "def-all-inan" %},
        {% tovc "def-all-abs" %}
      </td>
      <td>
        {% tovc "indef-all-ani" %},
        {% tovc "indef-all-inan" %},
        {% tovc "indef-all-abs" %}
      </td>
    </tr>
  </tbody>
</table>
</details>