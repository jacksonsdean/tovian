import re

# Phonology / inventory
consonants = 'pbmfvθðtdnrszlɬʃʒkgŋhħjwƛ'
vowels = 'aeiouə'

voiced_consonants = 'bdgmnlrvzʒŋ'
voiceless_consonants = 'ptfθsʃkhħƛɬ'

stops = 'ptkbdg'
voiceless_stops = 'ptk'

sonorants = 'lmnŋrjw'
glides = 'jw'
liquids = 'lr'
nasals = 'mnŋ'

fricatives = 'fvθðszʒʃhħɬ'
affricates = 'ƛ'
approximates = 'ɹj'

stress_mark = "ˈ"
plural_marker = 'e'

light_morphemes = ['fe', 'la', 're', 'li']


def _char_class(chars: str) -> str:
    """Escape characters for safe inclusion inside a regex character class []."""
    return re.escape(chars)


def find_syllables(word: str, consonant_inventory: str = consonants, vowel_inventory: str = vowels) -> list[str]:
    pattern = fr'([{_char_class(consonant_inventory)}]*[{_char_class(vowel_inventory)}][{_char_class(consonant_inventory)}]*)'
    return re.findall(pattern, word)


def count_syllables(word: str, consonant_inventory: str = consonants, vowel_inventory: str = vowels) -> int:
    return len(find_syllables(word, consonant_inventory=consonant_inventory, vowel_inventory=vowel_inventory))


def mark_syllable_boundaries(word: str, consonant_inventory: str = consonants, vowel_inventory: str = vowels) -> str:
    syllables = find_syllables(word, consonant_inventory=consonant_inventory, vowel_inventory=vowel_inventory)
    if len(syllables) == 0:
        return word
    return '.'.join(syllables)


def mark_stress(word: str) -> str:
    syllables = find_syllables(word)
    if len(syllables) == 0:
        print(f'No syllables found in {word}')
        return word

    if len(syllables) > 1:
        stressed_index = -2
    else:
        stressed_index = 0

    match = re.search(fr'[{vowels}]', syllables[stressed_index])
    if match:
        s = syllables[stressed_index]
        syllables[stressed_index] = s[:match.start()] + stress_mark + s[match.start():]

    return ''.join(syllables)


def unmark_stress(word: str) -> str:
    return word.replace(stress_mark, "")


def vowel_loss_between_voiceless_consonants_unless_stressed(word: str) -> str:
    pattern = f"([{voiceless_consonants}])([{vowels}])([{voiceless_consonants}])"
    stressed = mark_stress(word)

    def replacement(match: re.Match[str]) -> str:
        preceding, _, following = match.groups()
        return preceding + following

    return unmark_stress(re.sub(pattern, replacement, stressed))


def h_to_ħ(word: str) -> str:
    return word.replace('h', 'ħ')


def b_to_d(word: str) -> str:
    return word.replace('b', 'd')


def voiceless_stop_to_voiced_between_voiced(word: str) -> str:
    voiced_sounds = f'{vowels}{voiced_consonants}'
    voiceless_stops_map = {
        'p': 'b',
        't': 'd',
        'k': 'g',
    }
    for voiceless, voiced in voiceless_stops_map.items():
        pattern = f"([{voiced_sounds}]){voiceless}([{voiced_sounds}])"
        word = re.sub(pattern, r'\1' + voiced + r'\2', word)
    return word


def no_voiceless_stops_in_clusters(word: str) -> str:
    pattern = f"([{consonants}]+[{voiceless_stops}])"

    def replacement(match: re.Match[str]) -> str:
        cluster = match.group(0)
        return cluster[:-1]

    return re.sub(pattern, replacement, word)


def change_bardotlessj(word: str) -> str:
    return word.replace('ɟ', 'j')


def no_stops_after_fricatives(word: str) -> str:
    for fric in fricatives:
        for stop in stops:
            word = word.replace(fric + stop, fric)
    return word


def no_stops_after_liquids(word: str) -> str:
    for liquid in liquids:
        for stop in stops:
            word = word.replace(liquid + stop, liquid)
    return word


def no_stops_after_glides(word: str) -> str:
    for glide in glides:
        for stop in stops:
            word = word.replace(glide + stop, glide)
    return word


def velar_hardening(word: str) -> str:
    pattern = fr'k(?=[{voiceless_consonants}]|$)'
    return re.sub(pattern, 'k', word)


def no_fricative_clusters(word: str) -> str:
    pattern = f"[{fricatives}][{fricatives}]"
    return re.sub(pattern, lambda x: x.group()[0], word)


def loss_of_h(word: str) -> str:
    word = re.sub(fr'(?<=[{vowels}])h([{vowels}])', r'\1', word)
    word = re.sub(r'h$', '', word)
    return word


def vowel_combinations(word: str) -> str:
    word = re.sub(fr'ai(?=[^{vowels}]|$)', 'i', word)
    word = re.sub(r'aa', 'a', word)
    word = re.sub(r'ei', 'e', word)
    return word


def no_double_consonants(word: str) -> str:
    for consonant in consonants:
        word = word.replace(f"{consonant}{consonant}", consonant)
    return word


def no_repeated_vowels(word: str) -> str:
    for vowel in vowels:
        word = word.replace(f"{vowel}{vowel}", vowel)
    return word


def approximate_loss_after_o_or_u(word: str) -> str:
    pattern = fr'([ou])([{approximates}])'
    return re.sub(pattern, r'\1', word)


def vowel_loss_before_approximate(word: str) -> str:
    pattern = fr'([{vowels}])([{approximates}])'
    return re.sub(pattern, r'\2', word)


def nasal_assimilation(word: str) -> str:
    replacements = {
        r'md': 'nd',
        r'np': 'mp',
        r'nk': 'ŋg',
        r'ng': 'ŋg',
        r'nt': 'nd',
        r'nc': 'ŋg',
        r'nj': 'ndʒ',
        r'ŋk': 'ŋg',
    }

    for pat, repl in replacements.items():
        word = re.sub(pat, repl, word)

    return word


def word_initial_vowel_loss_unless_stressed(word: str) -> str:
    stressed = mark_stress(word)
    if re.match(fr'^{stress_mark}[{vowels}]', stressed):
        return word
    return re.sub(fr'^([{vowels}])', '', word)


def f_to_phi_at_word_end(word: str) -> str:
    return re.sub(r'f$', 'ɸ', word)


def word_final_vowel_loss_unless_stressed(word: str) -> str:
    stressed = mark_stress(word)
    if re.search(fr'{stress_mark}[{vowels}]$', stressed):
        return word
    return re.sub(fr'([{vowels}])$', '', word)


def theta_s_before_k(word: str) -> str:
    return re.sub(r'θ(?=k)', 's', word)


def theta_t_after_voiceless_stops(word: str) -> str:
    return re.sub(fr'(?<=[{voiceless_stops}])θ', 't', word)


def theta_r(word: str) -> str:
    stressed = mark_stress(word)
    matches = list(re.finditer(r'θir', word))
    new_word = list(word)
    offset = 0
    for match in matches:
        start, end = match.span()
        if not re.search(rf"θ{stress_mark}i", stressed[start:end]):
            new_word[start + offset:end + offset] = 'θr'
            offset += -1
    return ''.join(new_word)


def no_stops_after_nasals(word: str) -> str:
    return re.sub(fr'([{nasals}])([{stops}])', r'\1', word)


def no_stops_after_nasals_except_when_split_syllable(word: str) -> str:
    syl = mark_syllable_boundaries(word)
    parts = syl.split('.')
    new_parts: list[str] = []
    for part in parts:
        for nasal in nasals:
            for stop in stops:
                pattern = nasal + stop
                if pattern in part:
                    if len(part) > 2 and part.index(pattern) != 0 and part.index(pattern) != len(part) - 2:
                        part = part.replace(pattern, nasal)
        new_parts.append(part)
    return ''.join(new_parts)


def no_stops_after_sonorants(word: str) -> str:
    for sonorant in sonorants:
        for stop in stops:
            word = word.replace(sonorant + stop, sonorant)
    return word


def ae_to_a(word: str) -> str:
    return word.replace('ae', 'a')


def p_b_to_m(word: str) -> str:
    local_stops = 'pb'
    for stop in local_stops:
        word = re.sub(f'{stop}(?=[^{vowels}]|$)', 'm', word)
    return word


def no_final_e(word: str) -> str:
    return re.sub(fr'([e])$', '', word)


def y_to_sh(word: str) -> str:
    return word.replace('ʒ', 'ʃ')


def z_to_s(word: str) -> str:
    return word.replace('z', 's')


def unvoice_th(word: str) -> str:
    return word.replace('ð', 'θ')


def rhotacism_between_glides(word: str) -> str:
    return re.sub(f'([{glides}])r([{glides}])', r'\1r\2', word)


def rhotacism_between_vowels(word: str) -> str:
    return re.sub(f'([{vowels}])r([{vowels}])', r'\1r\2', word)


def no_fricatives_after_affricates(word: str) -> str:
    return re.sub(f'([{affricates}])([{fricatives}])', r'\1', word)


def no_affricates_after_fricatives(word: str) -> str:
    return re.sub(f'([{fricatives}])([{affricates}])', r'\1', word)


def loss_of_s_between_vowels(word: str) -> str:
    return re.sub(fr'(?<=[{vowels}])s(?=[{vowels}])', '', word)


def stop_cluster_simplification(word: str) -> str:
    return re.sub(r'pt|kt|pk', lambda m: m.group()[0], word)


def fricative_cluster_hardening(word: str) -> str:
    return re.sub(r'sʃ|ɬʃ', lambda m: 't' + m.group(), word)


def shd_to_lht(word: str) -> str:
    return re.sub(r'ʃd', 'ɬt', word)


def nasal_deletion_before_voiceless_obstruents(word: str) -> str:
    return re.sub(fr'n(?=[{voiceless_consonants}])', '', word)


def schwa_deletion(word: str) -> str:
    return word.replace('ə', '')


def reduplicant_vowel_reduction(word: str) -> str:
    stressed_word = mark_stress(word)
    stressed_pattern = fr'^([{consonants}]){stress_mark}([{vowels}])\1([{vowels}])'
    if re.match(stressed_pattern, stressed_word):
        return word
    pattern = fr'^([{consonants}])([{vowels}])\1([{vowels}])'
    return re.sub(pattern, r'\1ə\1\3', word)


def simplify_hn_to_n(word: str) -> str:
    return re.sub(r'hn', 'n', word)


def simplify_final_clusters(word: str) -> str:
    pattern = fr'([{consonants}])([{consonants}])$'
    if word.endswith('θr'):
        return word
    return re.sub(pattern, r'\1', word)


def medial_syncope_unless_stressed(word: str) -> str:
    stressed = mark_stress(word)
    syllables = find_syllables(word)
    if len(syllables) < 3:
        return word

    middle_index = len(syllables) // 2
    middle_syllable = syllables[middle_index]
    if stress_mark in middle_syllable:
        return word

    pattern = fr'([{consonants}])([{vowels}])([{consonants}])'
    parts = stressed.split('.')
    new_parts: list[str] = []
    for i, part in enumerate(parts):
        if i == middle_index:
            part = re.sub(pattern, r'\1\3', part)
        new_parts.append(part)
    return ''.join(new_parts)


def light_morpheme_simplification(word: str) -> str:
    stressed = mark_stress(word)
    for morpheme in light_morphemes:
        pattern = f'([a-z]+){morpheme}([a-z]+)'
        new_word = re.sub(pattern, r'\1\2', stressed)
        if new_word != word:
            return unmark_stress(new_word)
    return unmark_stress(word)


def reduplication_simplification(word: str) -> str:
    if count_syllables(word) < 3:
        return word
    return re.sub(r'(\b\w{1,2})\1', r'\1', word)


def onset_cluster_simplification(word: str) -> str:
    return re.sub(fr'\b([{consonants}])([{consonants}])([{consonants}])', r'\2\3', word)


def medial_vowel_loss(word: str) -> str:
    stressed = mark_stress(word)
    return unmark_stress(re.sub(fr'([{consonants}])([{vowels}])([{consonants}])', r'\1\3', stressed))


def simplify_sonorant_clusters_excluding_initial_mr(word: str) -> str:
    if word.startswith('mr'):
        rest = word[2:]
        simplified_rest = re.sub(fr'([{sonorants}])([{sonorants}])', r'\2', rest)
        return 'mr' + simplified_rest
    return re.sub(fr'([{sonorants}])([{sonorants}])', r'\2', word)


def simplify_fricative_nasal_clusters(word: str) -> str:
    for fric in fricatives:
        for nasal in nasals:
            word = word.replace(fric + nasal, nasal)
    return word


def simplify_initial_tl_n_cluster(word: str) -> str:
    return re.sub(r'^ƛn', 'n', word)


def simplify_initial_mf_to_m(word: str) -> str:
    return re.sub(r'^mf', 'm', word)


def epenthesis_in_initial_ml(word: str) -> str:
    return re.sub(r'^ml', 'mel', word)


def epenthesis_in_initial_lm(word: str) -> str:
    return re.sub(r'^lm', 'lem', word)


def epenthesis_in_initial_fm(word: str) -> str:
    return re.sub(r'^fm', 'fem', word)


def simplify_fricative_liquid_clusters(word: str) -> str:
    for fric in fricatives:
        for liquid in liquids:
            cluster = fric + liquid
            if cluster == 'θr':
                continue
            if cluster in word:
                word = word.replace(cluster, fric)
    return word


def epenthetic_vowel_in_initial_double_nasal(word: str) -> str:
    return re.sub(fr'^([{nasals}])([{nasals}])', r'\1u\2', word)


def simplify_final_stop_sonorant_clusters(word: str) -> str:
    return re.sub(fr'([{stops}])([{sonorants}])$', r'\2', word)


def simplify_g_tl(word: str) -> str:
    return re.sub(r'gƛ', 'ƛ', word)


def simplify_tl_to_ƛ(word: str) -> str:
    return re.sub(r'tl', 'ƛ', word)


def simplify_lh_to_ɬ(word: str) -> str:
    return re.sub(r'lh', 'ɬ', word)


def wiw_to_win(word: str) -> str:
    return re.sub(r'wiw', 'win', word)


def epenthesis_in_ƛd_cluster(word: str) -> str:
    return re.sub(r'ƛd', 'ƛod', word)


def epenthesis_in_initial_t_sh_cluster(word: str) -> str:
    return re.sub(r'^tʃ', 'teʃ', word)


def epenthesis_in_all_initial_clusters(word: str) -> str:
    match = re.match(fr'^([{_char_class(consonants)}])([{_char_class(consonants)}])', word)
    if not match:
        return word

    first, second = match.groups()
    if first in glides or second in glides:
        epenthetic = 'i'
    elif first in nasals or second in nasals:
        epenthetic = 'e'
    else:
        epenthetic = 'u'

    return first + epenthetic + second + word[2:]


def simplify_lθ_to_θ(word: str) -> str:
    return re.sub(r'lθ', 'θ', word)


def dissimilate_fricative_reduplication(word: str) -> str:
    replacements = {
        'θ': 't',
        'ʃ': 'd',
        'ɬ': 'l',
    }
    for k, v in replacements.items():
        pattern = fr'([{vowels}]){k}([{vowels}]){k}'
        word = re.sub(pattern, fr'\1{k}\2{v}', word)
    return word


def metathesize_lr(word: str) -> str:
    return re.sub(r'lr', 'rl', word)


def metathesize_jf(word: str) -> str:
    return re.sub(r'jf', 'fj', word)


def epenthesize_initial_nθ(word: str) -> str:
    return re.sub(r'^nθ', 'meθ', word)


def nasal_assimilation_mθ_to_nθ(word: str) -> str:
    return re.sub(r'mθ', 'nθ', word)


def simplify_dg_cluster(word: str) -> str:
    return word.replace('dg', 'g')


def unstressed_ie_to_e(word: str) -> str:
    stressed = mark_stress(word)
    return unmark_stress(re.sub(r'(?<!ˈ)ie', 'e', stressed))


def stressed_ie_to_long_i(word: str) -> str:
    stressed = mark_stress(word)
    return unmark_stress(re.sub(r'iˈe', 'i:', stressed))


def glide_epenthesis_after_unstressed_i(word: str) -> str:
    return re.sub(fr'(?<!ˈ)i([{vowels}])', r'ij\1', word)


def glide_epenthesis_after_unstressed_u(word: str) -> str:
    return re.sub(fr'(?<!ˈ)u([{vowels}])', r'uw\1', word)


def epenthesis_initial_n_sh_z(word: str) -> str:
    word = re.sub(r'^nʃ', 'anʃ', word)
    word = re.sub(r'^nʒ', 'anʒ', word)
    return word


sound_changes = [
    {'rule': 1000, 'description': 'Vowel loss between voiceless consonants in unstressed syllables', 'function': vowel_loss_between_voiceless_consonants_unless_stressed},
    {'rule': 2000, 'description': 'Voiceless stop between voiced sounds become voiced', 'function': voiceless_stop_to_voiced_between_voiced},
    {'rule': 2100, 'description': 'Vowel loss before affricate', 'function': vowel_loss_before_approximate},
    {'rule': 2200, 'description': 'Velar hardening k > k', 'function': velar_hardening},
    {'rule': 2201, 'description': 'Glide epenthesis after unstressed i', 'function': glide_epenthesis_after_unstressed_i},
    {'rule': 2202, 'description': 'Glide epenthesis after unstressed u', 'function': glide_epenthesis_after_unstressed_u},
    {'rule': 2300, 'description': 'ə lost', 'function': schwa_deletion},
    {'rule': 3000, 'description': 'No voiceless stops in clusters', 'function': no_voiceless_stops_in_clusters},
    {'rule': 3200, 'description': 'Medial vowel loss', 'function': medial_vowel_loss},
    {'rule': 3201, 'description': 'Unstressed ie to e', 'function': unstressed_ie_to_e},
    {'rule': 3202, 'description': 'Stressed ie to long i', 'function': stressed_ie_to_long_i},
    {'rule': 3500, 'description': 'ɟ to j', 'function': change_bardotlessj},
    {'rule': 3501, 'description': 'Rhotacism GsG > GrG and GʒG > GrG', 'function': rhotacism_between_glides},
    {'rule': 3502, 'description': 'Rhotacism VsV > VrV to VʒV > VrV', 'function': rhotacism_between_vowels},
    {'rule': 3503, 'description': 'Nasal assimilation mth > nth', 'function': nasal_assimilation_mθ_to_nθ},
    {'rule': 3503, 'description': 'epenthesize_initial_nθ', 'function': epenthesize_initial_nθ},
    {'rule': 4500, 'description': 'No stops after fricatives', 'function': no_stops_after_fricatives},
    {'rule': 4501, 'description': 'No stops after liquids', 'function': no_stops_after_liquids},
    {'rule': 4502, 'description': 'No fricative clusters', 'function': no_fricative_clusters},
    {'rule': 4503, 'description': 'No stops after glides', 'function': no_stops_after_glides},
    {'rule': 5000, 'description': 'h is lost between vowels and at the end of words', 'function': loss_of_h},
    {'rule': 5100, 'description': 's is lost between vowels', 'function': loss_of_s_between_vowels},
    {'rule': 5500, 'description': 'Vowel combinations', 'function': vowel_combinations},
    {'rule': 6000, 'description': 'Nasal assimilation', 'function': nasal_assimilation},
    {'rule': 6200, 'description': 'Approximate loss after o or u', 'function': approximate_loss_after_o_or_u},
    {'rule': 6240, 'description': 'hn > n', 'function': simplify_hn_to_n},
    {'rule': 6300, 'description': 'Vowel loss before approximates', 'function': vowel_loss_before_approximate},
    {'rule': 6400, 'description': 'Nasal deletion before voiceless obstruents', 'function': nasal_deletion_before_voiceless_obstruents},
    {'rule': 6401, 'description': 'tl → ƛ', 'function': simplify_tl_to_ƛ},
    {'rule': 6402, 'description': 'lh → ɬ', 'function': simplify_lh_to_ɬ},
    {'rule': 6500, 'description': 'No double consonants', 'function': no_double_consonants},
    {'rule': 6501, 'description': 'Simplify initial ƛn cluster', 'function': simplify_initial_tl_n_cluster},
    {'rule': 6502, 'description': 'Epenthesis in initial fm', 'function': epenthesis_in_initial_fm},
    {'rule': 6503, 'description': 'Metathesize lr', 'function': metathesize_lr},
    {'rule': 7400, 'description': 'Epenthesis in initial lm', 'function': epenthesis_in_initial_lm},
    {'rule': 7500, 'description': 'Word-initial vowel loss', 'function': word_initial_vowel_loss_unless_stressed},
    {'rule': 7501, 'description': 'f to ɸ at the end of words', 'function': f_to_phi_at_word_end},
    {'rule': 7501, 'description': 'Onset cluster simplification', 'function': onset_cluster_simplification},
    {'rule': 7502, 'description': 'Epenthesis in initial ml', 'function': epenthesis_in_initial_ml},
    {'rule': 7503, 'description': 'Metathesize jf', 'function': metathesize_jf},
    {'rule': 7600, 'description': 'Simplify sonorant clusters', 'function': simplify_sonorant_clusters_excluding_initial_mr},
    {'rule': 8000, 'description': 'θr unless stressed', 'function': theta_r},
    {'rule': 8500, 'description': 'No stops after nasals', 'function': no_stops_after_nasals_except_when_split_syllable},
    {'rule': 8750, 'description': 'No stops after any sonorant', 'function': no_stops_after_sonorants},
    {'rule': 8760, 'description': 'epenthesis_initial_n_sh_z', 'function': epenthesis_initial_n_sh_z},
    {'rule': 9200, 'description': 'Reduplicant vowel reduction', 'function': reduplicant_vowel_reduction},
    {'rule': 9300, 'description': 'Epenthesis in ƛd clusters', 'function': epenthesis_in_ƛd_cluster},
    {'rule': 9500, 'description': 'Word-final vowel loss', 'function': word_final_vowel_loss_unless_stressed},
    {'rule': 10000, 'description': 'ae to a', 'function': ae_to_a},
    {'rule': 10500, 'description': 'θ to s before k', 'function': theta_s_before_k},
    {'rule': 10700, 'description': 'θ to t after voiceless stops', 'function': theta_t_after_voiceless_stops},
    {'rule': 11000, 'description': 'No coda stops', 'function': p_b_to_m},
    {'rule': 11001, 'description': 'b to d', 'function': b_to_d},
    {'rule': 11500, 'description': 'Stop cluster simplification', 'function': stop_cluster_simplification},
    {'rule': 11501, 'description': 'Simplify gƛ', 'function': simplify_g_tl},
    {'rule': 11600, 'description': 'Medial syncope', 'function': medial_syncope_unless_stressed},
    {'rule': 11990, 'description': 'ə lost', 'function': schwa_deletion},
    {'rule': 11995, 'description': 'Simplify initial mf to m', 'function': simplify_initial_mf_to_m},
    {'rule': 11996, 'description': 'Epenthetic vowel in initial double nasal', 'function': epenthetic_vowel_in_initial_double_nasal},
    {'rule': 12000, 'description': 'z to s', 'function': z_to_s},
    {'rule': 12001, 'description': 'ʒ to ʃ', 'function': y_to_sh},
    {'rule': 12002, 'description': 'ð to θ', 'function': unvoice_th},
    {'rule': 12003, 'description': 'Light morpheme simplification', 'function': light_morpheme_simplification},
    {'rule': 12004, 'description': 'Reduplication simplification', 'function': reduplication_simplification},
    {'rule': 12005, 'description': 'No repeated vowels', 'function': no_repeated_vowels},
    {'rule': 12006, 'description': 'No word-final e', 'function': no_final_e},
    {'rule': 12007, 'description': 'No repeated consonants', 'function': no_double_consonants},
    {'rule': 12400, 'description': 'Epenthetic vowel in initial tʃ', 'function': epenthesis_in_initial_t_sh_cluster},
    {'rule': 12500, 'description': 'Simplify fricative-liquid clusters', 'function': simplify_fricative_liquid_clusters},
    {'rule': 12501, 'description': 'Dissimilate fricative reduplication', 'function': dissimilate_fricative_reduplication},
    {'rule': 12502, 'description': 'Simplify lθ → l', 'function': simplify_lθ_to_θ},
    {'rule': 12503, 'description': 'Simplify dg → g', 'function': simplify_dg_cluster},
    {'rule': 13000, 'description': 'No fricative clusters', 'function': no_fricative_clusters},
    {'rule': 13001, 'description': 'Simplify final consonant clusters to single consonant', 'function': simplify_final_clusters},
    {'rule': 13002, 'description': 'Simplify fricative-nasal clusters', 'function': simplify_fricative_nasal_clusters},
    {'rule': 13003, 'description': 'wiw to win', 'function': wiw_to_win},
    {'rule': 13004, 'description': 'Simplify stop sonorany clusters word finally', 'function': simplify_final_stop_sonorant_clusters},
    {'rule': 14000, 'description': 'No fricatives after affricates', 'function': no_fricatives_after_affricates},
    {'rule': 14001, 'description': 'No affricates after fricatives', 'function': no_affricates_after_fricatives},
    {'rule': 14005, 'description': 'Epenthesis and metathesis /ʃd/ → [ɬt]', 'function': shd_to_lht},
    {'rule': 14006, 'description': 'Voiceless glottal fricative h to pharyngeal fricative ħ', 'function': h_to_ħ},
    {'rule': 15000, 'description': 'No repeated consonants', 'function': no_double_consonants},
    {'rule': 16001, 'description': 'Epenthesis in all initial clusters (u default, e with nasals, i with glides)', 'function': epenthesis_in_all_initial_clusters},
]


def apply_sound_changes(year_and_word, max_year=None):
    year, word, _, _, pos, _ = year_and_word
    history = [(year, word)]
    if year == -1:
        return word, [(0, word)]

    for change in sound_changes:
        if change['rule'] < year:
            continue
        if max_year is not None and change['rule'] > max_year:
            break

        word = change['function'](unmark_stress(word))
        if unmark_stress(word) != history[-1][1]:
            history.append((change['rule'], word))

    word = history[-1][1]

    if pos == 'Ns' or pos == 'Ps':
        if not word.endswith(plural_marker):
            word += plural_marker

    return word, history


def borrowed_sound_changes(borrowed):
    always_replaced = {
        'ɹ': 'r',
        'β': 'b',
    }
    borrowed_replaced = []
    for b in borrowed:
        word = b[1]
        for s, r in always_replaced.items():
            word = word.replace(s, r)
            print(b[1], word, s, r)
        borrowed_replaced.append((b[0], word, b[2], b[3], b[4], b[-1]))
    return borrowed_replaced
