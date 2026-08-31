#!/usr/bin/env python3
"""Serve the static site locally with Vercel-style clean HTML URLs."""

import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class CleanUrlHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        resolved = Path(super().translate_path(path))
        if resolved.is_dir() and not path.endswith("/"):
            index_file = resolved / "index.html"
            if index_file.is_file():
                return str(index_file)
        if not resolved.exists() and not resolved.suffix:
            html_file = resolved.with_suffix(".html")
            if html_file.is_file():
                return str(html_file)
        return str(resolved)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", default=8765, type=int)
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), CleanUrlHandler)
    print(f"Serving Borage at http://{args.host}:{args.port}/")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
