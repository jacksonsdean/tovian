import re

from sound_changes import (
    find_syllables,
    mark_stress,
    mark_syllable_boundaries,
    stress_mark,
    unmark_stress,
    vowels,
)

SPACE_BETWEEN_ENTRIES = '15pt'
FONT_SIZE = '20pt'


def dotted_with_stress(word: str) -> str:
    """Return a display-only IPA with syllable dots and stress mark.
    Expects an undecorated word (no stress marks)."""

    syllables = find_syllables(word)
    if len(syllables) == 0:
        return word

    idx = 0 if len(syllables) == 1 else len(syllables) - 2
    m = re.search(fr'[{vowels}]', syllables[idx])
    if m:
        s = syllables[idx]
        syllables[idx] = s[:m.start()] + stress_mark + s[m.start():]

    return '.'.join(syllables)


def format_for_latex(word: str) -> str:
    word_chars = list(word)
    replacements = {
        'ʃ': r'{\textesh}',
        'ŋ': r'{\ng}',
        'θ': r'{\texttheta}',
        'ð': r'{\dh}',
        'ɟ': r'{\textbardotlessj}',
        'ɬ': r'{\textbeltl}',
        'ʒ': r'{\textyogh}',
        'ƛ': r'{\texttoptiebar{t\textbeltl}}',
        'ə': r'{\textschwa}',
        'ˈ': r'{\textprimstress}',
        'j': r'y',
        'ɸ': r'{\textphi}',
        't': r'{\textsubbridge{t}}',
        ':': r'{\textlengthmark}',
    }

    for ipa_char, latex_char in replacements.items():
        for i, char in enumerate(word_chars):
            if char == ipa_char:
                word_chars[i] = latex_char
    return ''.join(word_chars)


def romanization(word: str) -> str:
    replacements = {
        'ʃ': r'sh',
        'ŋ': r'ng',
        'θ': r'th',
        'ð': r'dh',
        'ɟ': r'j',
        'ɬ': r'lh',
        'ʒ': r'z',
        'j': r'y',
        'ƛ': r'tl',
        'ə': r'e',
        'ɸ': r'f',
        'ħ': r'h',
        'ˈ': r"'",
        ':': r':',
    }
    for roman_char, latex_char in replacements.items():
        word = word.replace(roman_char, latex_char)
    return word


def get_dictionary_csv(word_after_changes: str, translation: str, stress: str, rom: str, pos: str, notes: str, roots: str) -> str:
    display_ipa = dotted_with_stress(unmark_stress(word_after_changes))
    csv_lines = []
    csv_lines.append(f"{translation.strip()},{rom},/{display_ipa}/,{pos},{roots}")
    return "\n".join(csv_lines)


def get_dictionary_latex(history, translation, roots, pos, notes) -> str:
    raw_word = history[-1][1]

    max_rows = 1000

    text = ''
    text += fr'\\vspace{{{SPACE_BETWEEN_ENTRIES}}}' + '\n'
    text += r'\\begin{nopagebreak}' + '\n'
    text += rf'\\noindent{{\\fontsize{{{FONT_SIZE}}}{{10pt}}\\textbf{{{romanization(raw_word)}}} }} \\textit{{{translation}}}'
    text += f' ({pos})'
    text += r'\\\\' + '\n'
    text += rf'\\noindent {{\\tovian \\fontsize{{{FONT_SIZE}}}{{10pt}} \\textbf{{{romanization(raw_word)}}} }}'
    text += r'\\\\' + '\n'
    text += rf'\\noindent /{format_for_latex(mark_stress(raw_word))}/'
    text += r'\\\\' + '\n'
    text += rf'\\noindent Syllables: {mark_syllable_boundaries(raw_word)}'
    text += r'\\\\' + '\n'
    if roots != '_':
        text += rf'\\noindent lit. {roots}'
        text += r'\\\\' + '\n'
    if notes != '_':
        text += rf'\\noindent \\textit{{{notes}}}'
        text += r'\\\\' + '\n'
    text += '\n\n'
    text += r'\\noindent History:' + '\n'

    groups = [history[i:i + max_rows] for i in range(0, len(history), max_rows)]
    for idx, group in enumerate(groups):
        num_columns = 3
        column_format = '' + 'c' * num_columns
        text += '\n' + r'\\vspace{-0pt}' + '\n' + r'\\hspace{40pt}' + '\n'
        text += rf'\\begin{{tabular}}{{{column_format}}}' + '\n'

        this_group = group

        for j, (rule, word) in enumerate(this_group):
            text += fr'\\textit{{{rule}}} & '
            text += fr'/{format_for_latex(word)}/'
            if (j != len(this_group) - 1) or (idx != len(groups) - 1):
                text += r'&$\\rightarrow$ & '
            else:
                text += r'& '

        text += r'\\\\'

        text += '\n' + r'\\end{tabular}' + '\n\n'

    text += r'\\vspace{20pt}\\hline' + '\n\n'
    text += r'\\end{nopagebreak}' + '\n'
    text += r'\\filbreak' + '\n\n'
    return text
