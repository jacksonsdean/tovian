from collections import OrderedDict
import argparse
import csv

from format_words import format_for_latex, get_dictionary_csv, get_dictionary_latex, romanization
from sound_changes import apply_sound_changes, borrowed_sound_changes, mark_stress

# Auxiliaries: aspect roots + tense suffixes (see site/guide/verbs.md)
AUX_TENSE_SUFFIXES = OrderedDict([
    ("past", "e"),
    ("present", "a"),
    ("future", "o"),
])

# IPA roots (romanization() will render these as th/lh/tl/sh/y, etc.)
AUX_ASPECT_ROOTS = OrderedDict([
    ("simple", "f"),
    ("imperfective", "θ"),
    ("perfect", "ɬ"),
    ("near", "ƛ"),
    ("immediate", "k"),
    ("habitual", "m"),
    ("progressive", "s"),
    ("continuous", "ʃ"),
    ("iterative", "n"),
    ("inceptive", "j"),
    ("cessative", "p"),
    ("remote", "h"),
])

# Person prefixes (auxiliary agreement)
# 3rd person is normally unmarked but may optionally be marked with a-
AUX_PERSON_PREFIXES = OrderedDict([
    ("1st", "i"),
    ("2nd", "o"),
    ("3rd", ""),
    ("3rd (explicit)", "a"),
])

# Mood prefixes (normalized for concatenation; hyphens/0 placeholders removed)
# Notes:
# - roots.csv lists these as wi-, se-, ko-, ks-o, ɬe-, ƛ0-, ʃo-
# - We treat ƛ0- as ƛo- (surface-like, matches examples such as tlo-te-ma)
# - We treat ks-o as kso- (concatenated)
AUX_MOOD_PREFIXES = OrderedDict([
    ("(none)", ""),
    ("subjunctive", "wi"),
    ("imperative", "se"),
    ("conditional", "ko"),
    ("counterfactual", "kso"),
    ("optative", "ɬe"),
    ("obligative", "ƛo"),
    ("potential", "ʃo"),
])

# Voice prefixes
AUX_VOICE_PREFIXES = OrderedDict([
    ("(none)", ""),
    ("reflexive", "te"),
    ("passive", "pa"),
    ("middle", "mo"),
    ("causative", "ke"),
    ("reciprocal", "ra"),
])


def build_auxiliary_tense_aspect_entries():
    """Generate all (aspect × tense) auxiliary forms as dictionary entries.

    Returns tuples shaped like roots.csv rows:
    (year, word, translation, roots, pos, note)
    """
    entries = []
    for aspect_name, aspect_root in AUX_ASPECT_ROOTS.items():
        for tense_name, tense_suffix in AUX_TENSE_SUFFIXES.items():
            word = f"{aspect_root}{tense_suffix}"
            translation = f"auxiliary: {aspect_name} ({tense_name})"
            entries.append((-1, word, translation, "_", "AUX", "_"))
    return entries


def build_all_auxiliary_entries():
    """Generate every possible auxiliary word.

    Includes:
    - base aspect × tense auxiliaries (fa, fe, fo, ...)
    - all person × mood × voice × aspect × tense combinations
    """
    entries = []

    # Base set (used by the aspect×tense table in the guide)
    entries.extend(build_auxiliary_tense_aspect_entries())

    # Full combinations
    for person_name, person_prefix in AUX_PERSON_PREFIXES.items():
        for mood_name, mood_prefix in AUX_MOOD_PREFIXES.items():
            for voice_name, voice_prefix in AUX_VOICE_PREFIXES.items():
                for aspect_name, aspect_root in AUX_ASPECT_ROOTS.items():
                    for tense_name, tense_suffix in AUX_TENSE_SUFFIXES.items():
                        word = f"{person_prefix}{mood_prefix}{voice_prefix}{aspect_root}{tense_suffix}"

                        parts = [person_name]
                        if mood_name != "(none)":
                            parts.append(mood_name)
                        if voice_name != "(none)":
                            parts.append(voice_name)
                        parts.append(aspect_name)
                        translation = f"auxiliary-form: {' '.join(parts)} ({tense_name})"

                        entries.append((-1, word, translation, "_", "AUX", "_"))

    # Deduplicate by (word, translation)
    seen = set()
    unique = []
    for e in entries:
        key = (e[1], e[2])
        if key in seen:
            continue
        seen.add(key)
        unique.append(e)
    return unique


def load_roots():
    words = []
    with open('roots.csv', 'r', encoding='utf-8') as file:
        reader = csv.reader(file)
        next(reader)  # Skip the header
        for row in reader:
            if len(row) == 0:
                continue
            words.append((int(row[0]), row[1], row[2], row[3], row[4], row[5]))
    return words


def load_borrowed():
    words = []
    with open('borrowed.csv', 'r', encoding='utf-8') as file:
        reader = csv.reader(file)
        next(reader)  # Skip the header
        for row in reader:
            if len(row) == 0:
                continue
            words.append((int(row[0]), row[1], row[2], row[3], row[4], row[6]))
    words = borrowed_sound_changes(words)
    return words


def remove_obsolete_marker(word):
    return word.replace(" (obsolete)", "")


def find_root_or_compound(word, roots, compounds):
    for root in roots:
        r = remove_obsolete_marker(root[2]).strip()
        if r == word:
            return root
        if word in r.split('/'):
            return root
    for compound in compounds:
        c = remove_obsolete_marker(compound[2]).strip()
        if c == word:
            return compound
        if word in c.split('/'):
            return compound
    print(f"Could not find {word}")
    return None


def form_compounds(roots):
    compounds = []
    for f in ['compounds.csv', 'calendar.csv']:
        print(f'Loading compounds from {f}')
        with open(f, 'r', encoding='utf-8') as file:
            reader = csv.reader(file)
            next(reader)  # Skip the header
            for row in reader:
                if len(row) == 0:
                    continue
                compound_roots = row[2].split('+')
                for R in compound_roots:
                    root = find_root_or_compound(R, roots, compounds)
                    if root is None:
                        raise ValueError(f"Root {R} not found")
                    # apply sound changes up to the year of the compound to each root
                    root = apply_sound_changes(root, int(row[0]))[0]
                    compound_roots[compound_roots.index(R)] = root
                compound = "".join(compound_roots)
                compounds.append((int(row[0]), compound, row[1], row[2], row[3], row[4]))
    return compounds


def main():
    parser = argparse.ArgumentParser(description='Build a dictionary from roots, compounds, and borrowed words.')
    parser.add_argument('--interactive', '-i', action='store_true', help='Run in interactive mode')
    parser.add_argument('--max_year', '-y', type=int, help='Maximum year for sound changes')
    args = parser.parse_args()

    roots = load_roots()
    compounds = form_compounds(roots)
    borrowed = load_borrowed()

    auxiliaries = build_all_auxiliary_entries()

    input_words = roots + compounds + borrowed + auxiliaries
    interactive_dict = {}
    latex_histories = {}
    csv_histories = []
    for input_word in input_words:
        translation = input_word[2]
        roots_gloss = input_word[3]
        pos = input_word[4]
        notes = input_word[-1]
        word_after_changes, history = apply_sound_changes(input_word, max_year=args.max_year)

        final_word = format_for_latex(word_after_changes)
        if not args.interactive:
            for rule, word in history:
                print(f'{rule}: {mark_stress(word)}')

        rom = romanization(word_after_changes)
        stress = mark_stress(word_after_changes)
        csv_history = get_dictionary_csv(word_after_changes, translation, stress, rom, pos, notes, roots_gloss)
        csv_histories.append(csv_history)

        for definition in translation.split('/'):
            interactive_dict[definition.strip()] = (final_word, pos, history, rom, stress, notes)

        if not args.interactive:
            print(stress)
            print(rom)
            print()

        # Do not include auxiliaries in the LaTeX dictionary.
        if pos != 'AUX':
            latex_history = get_dictionary_latex(history, translation, roots_gloss, pos, notes)
            latex_histories[translation] = latex_history

    latex_histories = OrderedDict(sorted(latex_histories.items(), key=lambda x: x[0].lower()))

    expanded_csv_histories = []
    for csv_history in csv_histories:
        csv_history = csv_history.replace("+", " + ")
        words = csv_history.strip().split(',')[0].split('/')
        csv_history = csv_history.replace("/", " / ")
        if len(words) > 1:
            for w in words:
                parts = csv_history.strip().split(',')
                new_csv = f'{w.strip()},' + ','.join(parts[1:])
                new_csv = new_csv.rsplit(',', 0)[0] + "," + " / ".join(words)
                expanded_csv_histories.append(new_csv)
        else:
            expanded_csv_histories.append(csv_history.strip() + ',_')

    def sort_dict(x):
        first_line = x.splitlines()[0]
        first_word = first_line.split('\",\"')[0].strip('"').lower()
        pos_val = first_line.split(',')[3].strip('"')
        if pos_val in ['CASE', 'CLASS', 'PLURAL', 'MOOD', 'VOICE', 'ASPECT', 'AUX', 'PLACEHOLDER']:
            return 'zzz' + first_word
        if not first_word[0].isdigit():
            return first_word
        return 'zzzz' + first_word

    expanded_csv_histories = sorted(expanded_csv_histories, key=sort_dict)
    expanded_csv_histories = [','.join(line.split(',')[:-1]) for line in expanded_csv_histories]
    expanded_csv_histories = [','.join(line.split(',')[:3] + line.split(',')[4:]) for line in expanded_csv_histories]

    filename = 'dictionary.tex'
    if args.max_year is not None:
        filename = f'dictionary_{args.max_year}.tex'
    with open(filename, 'w', encoding='utf-8') as file:
        file.write(r'\\twocolumn' + '\n')
        for translation, latex_history in latex_histories.items():
            file.write(latex_history + '\n\n')
        file.write(r'\\onecolumn' + '\n')

    csv_filename = 'dictionary.csv'
    if args.max_year is not None:
        csv_filename = f'dictionary_{args.max_year}.csv'
    pages_filename = 'site/' + csv_filename
    for fname in [csv_filename, pages_filename]:
        with open(fname, 'w', encoding='utf-8') as file:
            file.write('English,Tovian,IPA,Roots\n')
            for csv_history in expanded_csv_histories:
                file.write(csv_history.rstrip('\n') + '\n')

    if args.interactive:
        print("Interactive mode enabled. Type 'q' to quit.")
        while True:
            user_input = input("Enter a word or definition: ").strip().lower()
            if user_input == 'q':
                break
            dict_lower_keys = {k.lower(): v for k, v in interactive_dict.items()}
            if user_input in dict_lower_keys.keys():
                final_word, pos_val, history, rom, stress, note = dict_lower_keys[user_input]
                print(f"Final Word: {final_word}, POS: {pos_val}, Romanization: {rom}, Stress: {stress}")
                if note != "_" and note:
                    print(f"Note: {note}")
                for rule, word in history:
                    print(f'{rule}: {mark_stress(word)}')
            else:
                print("Word not found in the dictionary. 'q' to quit.")


if __name__ == "__main__":
    main()
    