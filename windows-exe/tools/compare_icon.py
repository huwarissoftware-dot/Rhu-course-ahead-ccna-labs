#!/usr/bin/env python3
"""Pixel-compare every size in an .ico against the source logo PNG.
Handles both PNG-compressed and BMP/DIB icon entries.
Usage: compare_icon.py <icon.ico> <source.png>
Exit code 0 if every size matches the source logo (exact or near-exact)."""
import sys, struct, io
from PIL import Image

def ico_entries(path):
    d = open(path, 'rb').read()
    assert d[0:4] == b'\x00\x00\x01\x00', 'not an ico file'
    count = struct.unpack('<H', d[4:6])[0]
    out = []
    for i in range(count):
        e = d[6 + i * 16: 6 + (i + 1) * 16]
        w, h = e[0] or 256, e[1] or 256
        size, off = struct.unpack('<II', e[8:16])
        out.append((w, h, d[off:off + size]))
    return out

def decode_entry(blob, w, h):
    if blob[:8] == b'\x89PNG\r\n\x1a\n':
        return Image.open(io.BytesIO(blob)).convert('RGBA')
    # BMP/DIB: BITMAPINFOHEADER with double height, BGRA pixels, then AND mask
    hdr = 40
    bi_size, bi_w, bi_h = struct.unpack('<Iii', blob[:12])
    bitcount = struct.unpack('<H', blob[14:16])[0]
    px = blob[hdr: hdr + w * h * 4]
    img = Image.frombytes('RGBA', (w, h), px, 'raw', 'BGRA')
    img = img.transpose(Image.FLIP_TOP_BOTTOM)  # stored bottom-up, height halved already
    return img

def main():
    ico_path, src_path = sys.argv[1], sys.argv[2]
    src = Image.open(src_path).convert('RGBA')
    entries = ico_entries(ico_path)
    print(f'{ico_path}: {len(entries)} icon sizes')
    ok = True
    for w, h, blob in entries:
        img = decode_entry(blob, w, h)
        ref = src.resize((w, h), Image.LANCZOS)
        a, b = list(img.getdata()), list(ref.getdata())
        if a == b:
            print(f'  {w}x{h}: EXACT pixel match')
        else:
            diff = sum(abs(a[i][c] - b[i][c]) for i in range(len(a)) for c in range(4)) / (len(a) * 4)
            print(f'  {w}x{h}: mean|diff| = {diff:.2f}')
            if diff > 12:
                ok = False
    print('VERDICT:', 'IS the RHU logo' if ok else 'NOT the RHU logo')
    sys.exit(0 if ok else 1)

if __name__ == '__main__':
    main()
