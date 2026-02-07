# Tovian Language

A constructed language by Jackson Dean with a complete phonological system, grammar, and dictionary.

## Project Description

Tovian is a conlang featuring:
- **Phonology**: 24 consonants and 5 vowels with complex phonotactics
- **Grammar**: Case and mood marking, multiple voice types, and rich morphology
- **Dictionary**: 1000+ words built from roots, compounds, and borrowed words
- **Historical Development**: Sound changes tracked across 15,000 years of diachronic evolution
- **Interactive Tools**: Dictionary builder, IPA mapper, and diachronic word tracker

## Setup & Installation

### Prerequisites
- Python 3.x
- Node.js and npm (for running the website)

### Install Dependencies

```bash
# For the dictionary builder
pip install -r requirements.txt

# For the website
cd site
npm install
```

## Building the Dictionary

The `build_dictionary.py` script generates the dictionary with historical sound changes tracked.

```bash
# Generate dictionary in interactive mode
python build_dictionary.py -i

# Generate dictionary up to a specific year
python build_dictionary.py -y 5000

# Normal generation (creates dictionary.csv and dictionary.tex)
python build_dictionary.py
```

**Output files:**
- `dictionary.csv` - Dictionary in CSV format
- `dictionary.tex` - LaTeX-formatted dictionary with word histories
- `site/dictionary.csv` - Copy for the website

## Running the Site Locally

The website is built with [Eleventy](https://www.11ty.dev/) (11ty), a static site generator.

```bash
cd site

# Start the development server
npm start
# or: eleventy --serve

# Visit http://localhost:8080
```

The site features:
- **Dictionary**: Full word listings with IPA, syllable breaks, and etymologies
- **Guide**: Grammar, phonology, and syntax explanations
- **Gloss**: Interactive word glosser
- **Calendar**: Constructed calendar system

## Project Structure

```
/
├── build_dictionary.py          # Dictionary builder with diachronic tracking
├── roots.csv                    # Root morphemes
├── compounds.csv                # Compound words
├── borrowed.csv                 # Borrowed words
├── dictionary.csv               # Generated dictionary (CSV)
├── dictionary.tex               # Generated dictionary (LaTeX)
├── site/                        # Website (Eleventy)
│   ├── app.js                   # Site JavaScript
│   ├── index.njk                # Homepage
│   ├── guide/                   # Grammar guide pages
│   ├── gloss/                   # Word glosser
│   ├── assets/                  # CSS, JS, images
│   └── _includes/               # Layout templates
└── pdf_guide/                   # LaTeX source for PDF guide
```

## Data Files

- **roots.csv**: Base morphemes with year of origin and translation
- **compounds.csv**: Compound words formed from roots (year, translation, component roots)
- **borrowed.csv**: Words borrowed from other languages
- **calendar.csv**: Calendar day names (also compounds)

## License

See LICENSE file for details.
