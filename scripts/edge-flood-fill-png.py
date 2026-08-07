#!/usr/bin/env python3
"""Edge flood-fill background removal for buddy PNGs (see references/calmlink-assets/ASSETS.md)."""
from __future__ import annotations

import sys
from collections import deque
from pathlib import Path

from PIL import Image


def is_bg(r: int, g: int, b: int, a: int, threshold: int = 28) -> bool:
    if a < 8:
        return True
    return r <= threshold and g <= threshold and b <= threshold


def flood_fill_transparent(path: Path, threshold: int = 28) -> None:
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    px = im.load()
    visited = [[False] * w for _ in range(h)]
    q: deque[tuple[int, int]] = deque()

    for x in range(w):
        for y in (0, h - 1):
            if is_bg(*px[x, y], threshold):
                q.append((x, y))
                visited[y][x] = True
    for y in range(h):
        for x in (0, w - 1):
            if not visited[y][x] and is_bg(*px[x, y], threshold):
                q.append((x, y))
                visited[y][x] = True

    while q:
        x, y = q.popleft()
        px[x, y] = (px[x, y][0], px[x, y][1], px[x, y][2], 0)
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx]:
                if is_bg(*px[nx, ny], threshold):
                    visited[ny][nx] = True
                    q.append((nx, ny))

    im.save(path, optimize=True)
    print(f"OK {path} -> RGBA flood-fill")


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: edge-flood-fill-png.py <file.png> [...]")
        sys.exit(1)
    for arg in sys.argv[1:]:
        flood_fill_transparent(Path(arg))


if __name__ == "__main__":
    main()
