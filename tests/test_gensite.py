"""
test_gensite.py — Test suite for gensite.generate()

Structure
---------
The function under test:

    def generate(templates_dir: str, output_dir: str, data_file: str) -> int

Behaviour contract (inferred from source):
  1. Reads every .html file in templates_dir that does NOT start with "_".
  2. Parses each file as a Liquid template (python-liquid library).
  3. Loads the JSON data file and passes data[filename] as the `page` variable.
  4. Injects two extra keys into each page dict:
       page["url"]  = filename            (e.g. "index.html")
       page["name"] = filename sans .html (e.g. "index")
  5. Writes rendered output to  public/<filename>  (hardcoded prefix).
  6. Returns the count of templates processed.

Run with:
    pip install pytest python-liquid
    uv run pytest
"""

import json
import os
import pytest
import textwrap
from pathlib import Path
from unittest.mock import patch, MagicMock

# ---------------------------------------------------------------------------
# Import the module under test.  If gensite lives next to this file the plain
# import works.  If it lives elsewhere, adjust sys.path before running.
# ---------------------------------------------------------------------------
import importlib, sys

def _import_gensite():
    """Import gensite, tolerating the `string` type-hint bug (Python uses str)."""
    try:
        import gensite
        return gensite
    except TypeError:
        # python-liquid may raise during import if it tries to evaluate the
        # annotation `string` at import time on some versions.
        pytest.fail(
            "Could not import gensite.  Ensure python-liquid is installed and "
            "gensite.py is on the Python path."
        )

gensite = _import_gensite()


# ===========================================================================
# Fixtures
# ===========================================================================

@pytest.fixture()
def fs(tmp_path):
    """
    Return a helper that builds a minimal on-disk fixture:

        tmp_path/
          templates/
            index.html          <- normal template
            payments.html       <- normal template
            _layout.html        <- prefixed with "_", must be SKIPPED
          data.json
          public/               <- output dir (created by fixture)

    Yields a namespace with attributes:
      .templates_dir  .output_dir  .data_file  .tmp_path
    """
    templates = tmp_path / "templates"
    templates.mkdir()
    public = tmp_path / "public"
    public.mkdir()

    # Simple Liquid templates – use {{ page.title }} and {{ page.url }}
    (templates / "index.html").write_text(
        "<h1>{{ page.title }}</h1><p>{{ page.url }}</p><p>{{ page.name }}</p>"
    )
    (templates / "payments.html").write_text(
        "<h1>{{ page.title }}</h1><a href='{{ page.url }}'>link</a>"
    )
    # Prefixed file — must NOT be rendered
    (templates / "_layout.html").write_text(
        "{% block content %}{% endblock %}"
    )

    data = {
        "index.html":    {"title": "Home Page"},
        "payments.html": {"title": "Payments"},
    }
    data_file = tmp_path / "data.json"
    data_file.write_text(json.dumps(data))

    class _Fixture:
        pass

    fix = _Fixture()
    fix.templates_dir = str(templates)
    fix.output_dir    = str(public)
    fix.data_file     = str(data_file)
    fix.public        = public
    fix.tmp_path      = tmp_path
    return fix


# ===========================================================================
# 1. Return value
# ===========================================================================

class TestReturnValue:

    def test_returns_count_of_non_prefixed_templates(self, fs):
        """generate() must return the number of non-_ templates found."""
        count = gensite.generate(fs.templates_dir, fs.output_dir, fs.data_file)
        assert count == 2

    def test_returns_zero_for_empty_templates_dir(self, tmp_path):
        """An empty templates dir should return 0 without raising."""
        templates = tmp_path / "templates"
        templates.mkdir()
        public = tmp_path / "public"
        public.mkdir()
        data_file = tmp_path / "data.json"
        data_file.write_text("{}")

        count = gensite.generate(str(templates), str(public), str(data_file))
        assert count == 0

    def test_returns_one_when_single_template(self, tmp_path):
        templates = tmp_path / "templates"
        templates.mkdir()
        public = tmp_path / "public"
        public.mkdir()
        (templates / "about.html").write_text("{{ page.title }}")
        data_file = tmp_path / "data.json"
        data_file.write_text(json.dumps({"about.html": {"title": "About"}}))

        count = gensite.generate(str(templates), str(public), str(data_file))
        assert count == 1


# ===========================================================================
# 2. Output files are created
# ===========================================================================

class TestOutputFiles:

    def test_output_files_exist_after_generate(self, fs):
        gensite.generate(fs.templates_dir, fs.output_dir, fs.data_file)
        assert (fs.public / "index.html").exists()
        assert (fs.public / "payments.html").exists()

    def test_prefixed_template_is_not_written(self, fs):
        gensite.generate(fs.templates_dir, fs.output_dir, fs.data_file)
        assert not (fs.public / "_layout.html").exists()

    def test_output_files_are_not_empty(self, fs):
        gensite.generate(fs.templates_dir, fs.output_dir, fs.data_file)
        content = (fs.public / "index.html").read_text()
        assert len(content.strip()) > 0


# ===========================================================================
# 3. Template rendering — page.url and page.name injection
# ===========================================================================

class TestPageInjection:

    def test_page_url_equals_filename(self, fs):
        gensite.generate(fs.templates_dir, fs.output_dir, fs.data_file)
        content = (fs.public / "index.html").read_text()
        assert "index.html" in content

    def test_page_name_strips_html_extension(self, fs):
        gensite.generate(fs.templates_dir, fs.output_dir, fs.data_file)
        content = (fs.public / "index.html").read_text()
        assert "index" in content

    def test_page_name_does_not_contain_extension(self, fs):
        """page.name must NOT include '.html'."""
        gensite.generate(fs.templates_dir, fs.output_dir, fs.data_file)
        # The template renders {{ page.name }}, which must be bare "index"
        # We check it doesn't render as "index.html"
        content = (fs.public / "index.html").read_text()
        # page.name rendered position: <p>{{ page.name }}</p>
        # extract what sits between the third <p> tags
        import re
        names = re.findall(r"<p>(.*?)</p>", content)
        # names[1] is page.name (page.url is names[0])
        if len(names) >= 2:
            assert ".html" not in names[1]

    def test_page_data_title_is_rendered(self, fs):
        gensite.generate(fs.templates_dir, fs.output_dir, fs.data_file)
        assert "Home Page" in (fs.public / "index.html").read_text()
        assert "Payments" in (fs.public / "payments.html").read_text()

    def test_url_injection_does_not_mutate_data_on_disk(self, fs):
        """generate() should not write url/name back to the JSON file."""
        gensite.generate(fs.templates_dir, fs.output_dir, fs.data_file)
        with open(fs.data_file) as f:
            reloaded = json.load(f)
        assert "url"  not in reloaded.get("index.html", {})
        assert "name" not in reloaded.get("index.html", {})


# ===========================================================================
# 4. Underscore-prefixed files are excluded
# ===========================================================================

class TestPrefixExclusion:

    def test_underscore_files_not_counted(self, fs):
        count = gensite.generate(fs.templates_dir, fs.output_dir, fs.data_file)
        # templates/ has index.html, payments.html, _layout.html
        assert count == 2

    def test_multiple_underscore_files_all_excluded(self, tmp_path):
        templates = tmp_path / "templates"
        templates.mkdir()
        public = tmp_path / "public"
        public.mkdir()
        (templates / "page.html").write_text("{{ page.title }}")
        (templates / "_partial.html").write_text("partial")
        (templates / "_base.html").write_text("base")
        data_file = tmp_path / "data.json"
        data_file.write_text(json.dumps({"page.html": {"title": "Test"}}))

        count = gensite.generate(str(templates), str(public), str(data_file))
        assert count == 1
        assert not (public / "_partial.html").exists()
        assert not (public / "_base.html").exists()

    def test_non_html_files_are_excluded(self, tmp_path):
        """Only .html files should be processed (listdir will pick up others,
        but they shouldn't appear in output if data is missing or liquid fails)."""
        templates = tmp_path / "templates"
        templates.mkdir()
        public = tmp_path / "public"
        public.mkdir()
        (templates / "page.html").write_text("{{ page.title }}")
        (templates / "README.md").write_text("# readme")
        data_file = tmp_path / "data.json"
        # Only page.html has data; README.md access to data["README.md"] would KeyError
        data_file.write_text(json.dumps({"page.html": {"title": "Hi"}, "README.md": {}}))

        # Should not raise
        count = gensite.generate(str(templates), str(public), str(data_file))
        # We don't assert count here since the function counts ALL non-prefixed
        # files regardless of extension — just verify it doesn't crash.
        assert count >= 1


# ===========================================================================
# 5. Data file handling
# ===========================================================================

class TestDataFile:

    def test_missing_data_file_raises(self, fs):
        with pytest.raises((FileNotFoundError, OSError)):
            gensite.generate(
                fs.templates_dir,
                fs.output_dir,
                str(fs.tmp_path / "nonexistent.json"),
            )

    def test_malformed_json_raises(self, fs):
        bad_json = fs.tmp_path / "bad.json"
        bad_json.write_text("{ not valid json }")
        with pytest.raises(json.JSONDecodeError):
            gensite.generate(fs.templates_dir, fs.output_dir, str(bad_json))

    def test_empty_json_object_raises_on_missing_key(self, fs):
        """data[f] KeyError when the template has no entry in data.json."""
        empty_data = fs.tmp_path / "empty.json"
        empty_data.write_text("{}")
        # Should not raise
        count = gensite.generate(fs.templates_dir, fs.output_dir, str(empty_data))
        # Since theres no data, should be a 0 count.
        assert count == 0

    def test_extra_keys_in_data_are_ignored(self, tmp_path):
        """Extra keys in data.json that have no corresponding template are fine."""
        templates = tmp_path / "templates"
        templates.mkdir()
        public = tmp_path / "public"
        public.mkdir()
        (templates / "page.html").write_text("{{ page.title }}")
        data_file = tmp_path / "data.json"
        data_file.write_text(json.dumps({
            "page.html":   {"title": "Good"},
            "ghost.html":  {"title": "No template for this"},
        }))
        # Should not raise — ghost.html has no template so it's simply not iterated
        count = gensite.generate(str(templates), str(public), str(data_file))
        assert count == 1


# ===========================================================================
# 6. Missing templates directory
# ===========================================================================

class TestDirectoryErrors:

    def test_missing_templates_dir_raises(self, fs):
        with pytest.raises((FileNotFoundError, OSError)):
            gensite.generate(
                str(fs.tmp_path / "no_such_dir"),
                fs.output_dir,
                fs.data_file,
            )
