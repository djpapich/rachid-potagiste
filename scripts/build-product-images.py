"""Builds web-optimised images from the photos supplied by the shop owner.

Input : <zip_dir>/photos-site-1600x1600/<id>.jpg      (studio photo, 1600x1600)
        <zip_dir>/photos-fond-transparent/<id>.png    (cut-out with transparency)
Output: <out_dir>/<id>-400.webp, -800.webp, -1200.webp   (responsive studio photo)
        <out_dir>/<id>-cutout.webp                       (640px cut-out, alpha kept)
        <out_dir>/../og-cover.jpg                        (1200x630 social share image)
Nothing is generated or altered: only resized and re-encoded.
"""
import json
import os
import sys

from PIL import Image

zip_dir, out_dir, report_path = sys.argv[1:4]
os.makedirs(out_dir, exist_ok=True)

photos = os.path.join(zip_dir, 'photos-site-1600x1600')
cutouts = os.path.join(zip_dir, 'photos-fond-transparent')
report = {'products': {}, 'bytes_out': 0}

for name in sorted(os.listdir(photos)):
    pid = os.path.splitext(name)[0]
    src = Image.open(os.path.join(photos, name)).convert('RGB')
    assert src.size == (1600, 1600), (name, src.size)
    entry = {'sizes': []}
    for w in (400, 800, 1200):
        dst = os.path.join(out_dir, f'{pid}-{w}.webp')
        src.resize((w, w), Image.LANCZOS).save(dst, 'WEBP', quality=82, method=6)
        entry['sizes'].append(w)
        report['bytes_out'] += os.path.getsize(dst)

    cut_path = os.path.join(cutouts, pid + '.png')
    if os.path.exists(cut_path):
        cut = Image.open(cut_path).convert('RGBA')
        # crop the transparent margin so the product fills the frame, keep it square
        bbox = cut.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
        if bbox:
            l, t, r, b = bbox
            side = max(r - l, b - t)
            pad = int(side * 0.06)
            side += 2 * pad
            cx, cy = (l + r) // 2, (t + b) // 2
            box = (cx - side // 2, cy - side // 2, cx + side // 2, cy + side // 2)
            canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
            canvas.paste(cut, (-box[0], -box[1]))
            cut = canvas
        dst = os.path.join(out_dir, f'{pid}-cutout.webp')
        cut.resize((640, 640), Image.LANCZOS).save(dst, 'WEBP', quality=86, method=6, exact=True)
        entry['cutout'] = True
        report['bytes_out'] += os.path.getsize(dst)
    report['products'][pid] = entry

# --- social share image: four real cut-outs on the brand cream background
og = Image.new('RGB', (1200, 630), (244, 241, 234))
picks = ['chou-vert-carotte-lacto-fermente', 'huile-ortie', 'savon-luffa-ortie', 'creme-ortie']
slot = 1200 // len(picks)
for i, pid in enumerate(picks):
    c = Image.open(os.path.join(out_dir, f'{pid}-cutout.webp')).convert('RGBA').resize((420, 420), Image.LANCZOS)
    og.paste(c, (i * slot + (slot - 420) // 2, (630 - 420) // 2), c)
og_path = os.path.join(os.path.dirname(out_dir.rstrip('/')), 'og-cover.jpg')
og.save(og_path, 'JPEG', quality=85, optimize=True, progressive=True)
report['og'] = {'path': og_path, 'bytes': os.path.getsize(og_path)}

json.dump(report, open(report_path, 'w'), indent=1)
print('products:', len(report['products']), ' output MB: %.2f' % (report['bytes_out'] / 1e6))
