import csv
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]


class AuxiliaryBuildTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        cls.output = Path(cls.temp.name)
        (cls.output / "site").mkdir()
        for name in ["roots.csv", "compounds.csv", "calendar.csv", "borrowed.csv"]:
            shutil.copyfile(ROOT / name, cls.output / name)
        subprocess.run(
            [sys.executable, str(ROOT / "build_dictionary.py"), "--final-words-only"],
            cwd=cls.output, check=True, stdout=subprocess.DEVNULL,
        )
        with (cls.output / "template_replacements.csv").open() as stream:
            cls.words = {row["english"]: row["tovian"] for row in csv.DictReader(stream)}

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    def test_formal_and_casual_examples_remain_distinct(self):
        self.assertEqual(self.words["aux_3_sim_prs"], "afa")
        self.assertEqual(self.words["aux_3C_sim_prs"], "fa")
        self.assertEqual(self.words["aux_1_sim_prs"], "ifa")
        self.assertEqual(self.words["aux_2_sim_prs"], "ofa")
        with (self.output / "dictionary.csv").open() as stream:
            rows = list(csv.DictReader(stream))
        formal = [row for row in rows if row["English"].startswith("auxiliary-form: 3rd ")
                  and "(casual)" not in row["English"]]
        self.assertEqual(len(formal), 1728)
        self.assertTrue(all(row["Tovian"].startswith("a") for row in formal))

    def test_scope_examples_use_the_expected_marked_forms(self):
        self.assertEqual(self.words["aux_3_pot_ces_prs"], "ashopa")
        self.assertEqual(self.words["aux_3_ces_prs"], "apa")
        self.assertEqual(self.words["aux_3_pot_sim_prs"], "ashofa")
        self.assertEqual(self.words["aux_3_pot_pas_sim_prs"], "ashopafa")
        self.assertEqual(self.words["aux_3_pas_prf_prs"], "apalha")

    def test_all_dictionary_aliases_survive_template_generation(self):
        for aliases, expected in [
            (["eye", "sight", "seeing", "watching"], "muril"),
            (["thinking", "believing", "pondering"], "nalh"),
            (["hardness", "strength"], "lha"),
            (["writing", "painting"], "for"),
        ]:
            for alias in aliases:
                with self.subTest(alias=alias):
                    self.assertEqual(self.words[alias], expected)
        self.assertEqual((self.output / "dictionary.csv").read_bytes(),
                         (self.output / "site/dictionary.csv").read_bytes())
        self.assertEqual((self.output / "template_replacements.csv").read_bytes(),
                         (self.output / "site/template_replacements.csv").read_bytes())

    def test_filtered_build_does_not_empty_the_site_replacements(self):
        before = (self.output / "template_replacements.csv").read_bytes()
        subprocess.run(
            [sys.executable, str(ROOT / "build_dictionary.py"), "-f", "truth"],
            cwd=self.output, check=True, stdout=subprocess.DEVNULL,
        )
        self.assertEqual((self.output / "template_replacements.csv").read_bytes(), before)


if __name__ == "__main__":
    unittest.main()
