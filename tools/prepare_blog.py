"""Preparar un borrador revisable. Ejecutar desde la raíz del sitio:
python3 tools/prepare_blog.py ficha.json > borrador.md
Solo lee la ficha y el índice local; no publica ni hace solicitudes de red.
"""
import json
import re
import sys
import unicodedata
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit


def normalize(value):
    value = unicodedata.normalize("NFKD", value.casefold())
    return " ".join(re.findall(r"[a-z0-9]+", "".join(c for c in value if not unicodedata.combining(c))))


class ArticleTitle(HTMLParser):
    def __init__(self):
        super().__init__()
        self.inside = False
        self.parts = []

    def handle_starttag(self, tag, attrs):
        if tag == "h1":
            self.inside = True

    def handle_endtag(self, tag):
        if tag == "h1":
            self.inside = False

    def handle_data(self, data):
        if self.inside:
            self.parts.append(data)


def prepare(brief, blog):
    for key in ("slug", "title", "intent", "difference", "query", "draft", "reviewer"):
        if not isinstance(brief.get(key), str) or not brief[key].strip():
            raise ValueError(f"Falta {key}")
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", brief["slug"]):
        raise ValueError("Slug inválido")
    articles = list(blog.glob("*/index.html"))
    if not articles:
        raise ValueError("No se encontró el catálogo de artículos del sitio")
    title = normalize(brief["title"])
    for article in articles:
        parser = ArticleTitle()
        parser.feed(article.read_text(encoding="utf-8"))
        if article.parent.name == brief["slug"] or normalize(" ".join(parser.parts)) == title:
            raise ValueError("El título o el slug ya existe. Evaluar actualizar esa guía.")
    sources = brief.get("sources")
    if not isinstance(sources, list) or not sources:
        raise ValueError("Faltan fuentes de revisión")
    evidence = []
    for source in sources:
        url = urlsplit(source["url"])
        if url.scheme != "https" or not url.hostname or not source.get("supports", "").strip():
            raise ValueError("Indicar URL HTTPS y qué afirmación respalda")
        evidence.append(f"- {source['supports']} — {source['url']}")
    return "\n".join([
        "# " + brief["title"], "", "BORRADOR INTERNO · pendiente de revisión", "",
        "Consulta objetivo · " + brief["query"], "Intención · " + brief["intent"],
        "Diferencia con las guías existentes · " + brief["difference"],
        "Responsable de revisión · " + brief["reviewer"], "", brief["draft"], "",
        "## Fuentes que debe contrastar la persona revisora", *evidence, "",
        "## Antes de publicar", "Revisar solapamiento por intención, exactitud de las fuentes, "
        "autorización de ejemplos y vigencia del CTA. Tras aprobación humana, "
        "verificar URL, canonical, índice del blog, sitemap y destino en móvil."
    ])


if __name__ == "__main__":
    try:
        brief = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
        print(prepare(brief, Path(__file__).resolve().parents[1] / "blog"))
    except (IndexError, KeyError, OSError, TypeError, ValueError) as error:
        sys.exit(f"Borrador bloqueado: {error}")
