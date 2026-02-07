import argparse
import csv
import difflib

from format_words import romanization
from sound_changes import apply_sound_changes, mark_stress


Entry = tuple[int, str, str, str, str, str]


def deromanize(word: str) -> str:
    """Best-effort romanization -> IPA-ish conversion.

    Notes:
    - Some romanization is inherently ambiguous (e.g., z vs ʒ, e vs ə, f vs ɸ, h vs ħ).
    - This keeps plain 'z' as /z/ and supports 'zh' for /ʒ/.
    - This keeps plain 'e' as /e/ and requires explicit 'ə' for schwa.
    """

    # stress mark from romanization()
    word = word.replace("'", "ˈ")

    # Longest-first replacements
    replacements = [
        ("hh", "ħ"),
        ("zh", "ʒ"),
        ("sh", "ʃ"),
        ("ng", "ŋ"),
        ("th", "θ"),
        ("dh", "ð"),
        ("lh", "ɬ"),
        ("tl", "ƛ"),
        ("ph", "ɸ"),
    ]
    for src, dst in replacements:
        word = word.replace(src, dst)

    # Single-letter conventions used by romanization()
    word = word.replace("y", "j")

    return word


def _index_entry(index: dict[str, Entry], entry: Entry) -> None:
    translation = entry[2]
    for definition in translation.split('/'):
        key = definition.strip().lower()
        if not key:
            continue
        index.setdefault(key, entry)


def load_roots_index(path: str = 'roots.csv') -> dict[str, Entry]:
    index: dict[str, Entry] = {}
    with open(path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            if not row:
                continue
            year = int(row['Year'])
            word = row['Word']
            translation = row['Translation']
            roots = row.get('Roots', '_') or '_'
            pos = row.get('POS', '_') or '_'
            note = row.get('Note', '_') or '_'
            entry: Entry = (year, word, translation, roots, pos, note)
            _index_entry(index, entry)
    return index


def build_compounds_index(roots_index: dict[str, Entry], path: str = 'compounds.csv') -> dict[str, Entry]:
    index: dict[str, Entry] = {}
    compounds: list[Entry] = []
    with open(path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            if not row:
                continue

            year = int(row['Year'])
            translation = row['Translation']
            roots_spec = row['Roots']
            pos = row.get('POS', '_') or '_'
            note = row.get('Note', '_') or '_'

            parts: list[str] = []
            for token in roots_spec.split('+'):
                key = token.strip().lower()
                entry = roots_index.get(key) or index.get(key)
                if entry is None:
                    # allow forward references within compounds.csv only if already built
                    suggestions = difflib.get_close_matches(key, list(roots_index.keys()) + list(index.keys()), n=5)
                    raise SystemExit(f"Unknown compound root '{token}' in {path}. Suggestions: {suggestions}")
                # dictionary behavior: apply changes to each root up to the compound's year before joining
                part_word = apply_sound_changes(entry, max_year=year)[0]
                parts.append(part_word)

            compound_word = ''.join(parts)
            compound_entry: Entry = (year, compound_word, translation, roots_spec, pos, note)
            compounds.append(compound_entry)
            _index_entry(index, compound_entry)

    return index


def lookup_definition(term: str, roots_index: dict[str, Entry], compounds_index: dict[str, Entry]) -> Entry:
    key = term.strip().lower()
    entry = roots_index.get(key) or compounds_index.get(key)
    if entry is not None:
        return entry

    candidates = list(roots_index.keys()) + list(compounds_index.keys())
    suggestions = difflib.get_close_matches(key, candidates, n=8)
    raise SystemExit(f"Unknown definition '{term}'. Suggestions: {suggestions}")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Apply Tovian sound changes to a word and print the full history."
    )
    parser.add_argument(
        "word",
        help="Input word. By default treated as romanization; use --ipa if already IPA.",
    )
    parser.add_argument(
        "--ipa",
        action="store_true",
        help="Treat input word as IPA (no deromanization step).",
    )
    parser.add_argument(
        "--year",
        "-y",
        type=int,
        default=0,
        help="Year to start applying sound changes (default: 0).",
    )
    parser.add_argument(
        "--max-year",
        "-m",
        type=int,
        default=None,
        help="Maximum year for sound changes (default: no limit).",
    )
    args = parser.parse_args()

    original = args.word.strip()

    if '+' in original and not args.ipa:
        roots_index = load_roots_index('roots.csv')
        compounds_index = build_compounds_index(roots_index, 'compounds.csv')

        english_parts = [p.strip() for p in original.split('+') if p.strip()]
        if not english_parts:
            raise SystemExit("Empty compound input.")

        tovian_parts: list[str] = []
        for part in english_parts:
            entry = lookup_definition(part, roots_index, compounds_index)
            # apply changes up to the compound year before joining (dictionary behavior)
            tovian_part = apply_sound_changes(entry, max_year=args.year)[0] if args.year != 0 else entry[1]
            tovian_parts.append(tovian_part)

        ipa = ''.join(tovian_parts)
        print(f"Detected compound: {'+'.join(tovian_parts)}")
    else:
        ipa = original if args.ipa else deromanize(original)

    # apply_sound_changes expects a 6-tuple: (year, word, _, _, pos, _)
    # pos '_' avoids plural logic.
    _, history = apply_sound_changes((args.year, ipa, "_", "_", "_", "_"), max_year=args.max_year)

    print(f"Input: {original}{' (IPA)' if args.ipa else ''}")
    if not args.ipa and '+' not in original:
        print(f"Deromanized: {ipa}")
    print(f"Start year: {args.year}")
    if args.max_year is not None:
        print(f"Max year: {args.max_year}")
    print()

    print("History:")
    for rule, form in history:
        print(f"{rule}: {mark_stress(form)}")

    final_form = history[-1][1] if history else ipa
    print()
    print(f"Result (IPA): {mark_stress(final_form)}")
    print(f"Result (roman): {romanization(final_form)}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
