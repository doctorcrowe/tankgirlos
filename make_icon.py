#!/usr/bin/env python3
"""Generate and apply a custom Tank Girl icon for start.command"""
from PIL import Image, ImageDraw, ImageFont
import os, subprocess, math

SIZE = 512
ICON_PATH = os.path.join(os.path.dirname(__file__), 'icon.png')
CMD_PATH  = os.path.join(os.path.dirname(__file__), 'start.command')

# Colors
BG        = (13, 13, 26, 255)
PINK      = (255, 45, 120, 255)
PINK_DIM  = (255, 45, 120, 140)
PINK_SOFT = (255, 130, 170, 255)
SKIN      = (255, 200, 155, 255)
SKIN_SH   = (220, 155, 105, 255)
GOGGLE    = (30, 20, 50, 255)
GOGGLE_L  = (80, 200, 255, 220)   # lens tint
KHAKI     = (110, 120, 60, 255)
KHAKI_D   = (75, 82, 35, 255)
HAIR      = (255, 45, 120, 255)   # pink mohawk
WHITE     = (255, 255, 255, 255)
GRID      = (255, 45, 120, 14)

img = Image.new('RGBA', (SIZE, SIZE), BG)
d   = ImageDraw.Draw(img, 'RGBA')

cx = SIZE // 2

# ── Background grid ──────────────────────────────────────────────────────────
for x in range(0, SIZE, 28):
    d.line([(x, 0), (x, SIZE)], fill=GRID, width=1)
for y in range(0, SIZE, 28):
    d.line([(0, y), (SIZE, y)], fill=GRID, width=1)

# ── Corner brackets ───────────────────────────────────────────────────────────
T, L, M = 18, 70, 36
for (bx, by) in [(M, M), (SIZE-M, M), (M, SIZE-M), (SIZE-M, SIZE-M)]:
    dx = 1 if bx < SIZE/2 else -1
    dy = 1 if by < SIZE/2 else -1
    x0,x1 = sorted([bx, bx+dx*L]); y0,y1 = sorted([by, by+dy*T])
    d.rectangle([x0,y0,x1,y1], fill=PINK)
    x0,x1 = sorted([bx, bx+dx*T]); y0,y1 = sorted([by, by+dy*L])
    d.rectangle([x0,y0,x1,y1], fill=PINK)

# ── Shoulders / jacket ────────────────────────────────────────────────────────
# wide military jacket coming up from the bottom
shoulder_y = 370
jacket_pts = [
    (0, SIZE),
    (0, shoulder_y + 30),
    (cx - 130, shoulder_y),
    (cx - 60,  shoulder_y + 10),
    (cx,       shoulder_y - 5),
    (cx + 60,  shoulder_y + 10),
    (cx + 130, shoulder_y),
    (SIZE, shoulder_y + 30),
    (SIZE, SIZE),
]
d.polygon(jacket_pts, fill=KHAKI)
# jacket highlight seam
d.line([(cx, shoulder_y - 5), (cx, SIZE)], fill=KHAKI_D, width=3)
# epaulette studs
for side in [-1, 1]:
    sx = cx + side * 115
    sy = shoulder_y + 10
    for i in range(3):
        d.ellipse([sx + side*i*10 - 5, sy - 5, sx + side*i*10 + 5, sy + 5], fill=PINK)

# ── Neck ─────────────────────────────────────────────────────────────────────
neck_top = 310
neck_bot = shoulder_y
d.rectangle([cx-28, neck_top, cx+28, neck_bot], fill=SKIN)
# neck shadow
d.rectangle([cx+10, neck_top, cx+28, neck_bot], fill=SKIN_SH)

# ── Head ─────────────────────────────────────────────────────────────────────
head_cx, head_cy = cx, 235
head_rx, head_ry = 88, 100
d.ellipse([head_cx-head_rx, head_cy-head_ry,
           head_cx+head_rx, head_cy+head_ry], fill=SKIN)
# jaw shadow on right
d.ellipse([head_cx, head_cy-head_ry+20,
           head_cx+head_rx, head_cy+head_ry], fill=SKIN_SH)

# ── Mohawk spikes ─────────────────────────────────────────────────────────────
# 5 spikes fanning upward from the top of the head
spike_base_y = head_cy - head_ry + 10
spike_configs = [
    # (base_x_offset, tip_x_offset, tip_y, base_half_width)
    (-60, -78, 52,  14),
    (-28, -38, 18,  16),
    (  0,   0,  0,  18),   # tallest center spike
    ( 28,  38, 18,  16),
    ( 60,  78, 52,  14),
]
for (bx, tx, ty_off, hw) in spike_configs:
    tip_y   = spike_base_y - 130 + ty_off
    tip_x   = head_cx + tx
    base_y  = spike_base_y + 10
    base_x  = head_cx + bx
    pts = [
        (base_x - hw, base_y),
        (base_x + hw, base_y),
        (tip_x + hw//2, tip_y + 20),
        (tip_x, tip_y),
        (tip_x - hw//2, tip_y + 20),
    ]
    d.polygon(pts, fill=HAIR)
    # highlight stripe on each spike
    d.line([(base_x, base_y), (tip_x, tip_y + 10)],
           fill=(255, 130, 170, 180), width=3)

# ── Ear ──────────────────────────────────────────────────────────────────────
d.ellipse([head_cx - head_rx - 12, head_cy - 18,
           head_cx - head_rx + 10, head_cy + 22], fill=SKIN)
# earring — small pink hoop
d.ellipse([head_cx - head_rx - 10, head_cy + 10,
           head_cx - head_rx + 2,  head_cy + 24],
          outline=PINK, width=3)

# ── Goggles ───────────────────────────────────────────────────────────────────
goggle_y  = head_cy - 18
goggle_r  = 30
goggle_sep = 68   # center-to-center
# strap across top
strap_y = goggle_y - 8
d.rectangle([head_cx - head_rx + 8, strap_y - 7,
             head_cx + head_rx - 8, strap_y + 7], fill=(40, 35, 60, 255))
# left lens
lx = head_cx - goggle_sep // 2
d.ellipse([lx-goggle_r, goggle_y-goggle_r, lx+goggle_r, goggle_y+goggle_r],
          fill=GOGGLE, outline=PINK, width=4)
d.ellipse([lx-goggle_r+6, goggle_y-goggle_r+6,
           lx+goggle_r-6, goggle_y+goggle_r-6],
          fill=GOGGLE_L)
# right lens
rx = head_cx + goggle_sep // 2
d.ellipse([rx-goggle_r, goggle_y-goggle_r, rx+goggle_r, goggle_y+goggle_r],
          fill=GOGGLE, outline=PINK, width=4)
d.ellipse([rx-goggle_r+6, goggle_y-goggle_r+6,
           rx+goggle_r-6, goggle_y+goggle_r-6],
          fill=GOGGLE_L)
# bridge between lenses
d.rectangle([lx+goggle_r-4, goggle_y-5, rx-goggle_r+4, goggle_y+5],
            fill=(40, 35, 60, 255))
# lens glare highlights
for lensX in [lx, rx]:
    d.ellipse([lensX-goggle_r+8, goggle_y-goggle_r+8,
               lensX-goggle_r+18, goggle_y-goggle_r+18],
              fill=(255, 255, 255, 160))

# ── Smirk / mouth ─────────────────────────────────────────────────────────────
mouth_y = head_cy + 42
# slight asymmetric smirk — more raised on the right
d.arc([head_cx - 28, mouth_y - 12, head_cx + 28, mouth_y + 12],
      start=10, end=170, fill=(180, 80, 100, 255), width=4)
# tiny top lip line
d.line([(head_cx - 20, mouth_y - 2), (head_cx + 20, mouth_y - 2)],
       fill=(160, 70, 90, 200), width=2)

# ── Nose (simple) ────────────────────────────────────────────────────────────
d.ellipse([head_cx - 6, head_cy + 15, head_cx + 6, head_cy + 27],
          fill=SKIN_SH)

# ── "TANK_GIRL OS" label at bottom ───────────────────────────────────────────
try:
    font_big  = ImageFont.truetype('/System/Library/Fonts/Courier.dfont', 32)
    font_tiny = ImageFont.truetype('/System/Library/Fonts/Courier.dfont', 18)
except:
    font_big  = ImageFont.load_default()
    font_tiny = font_big

label = 'TANK_GIRL OS'
bbox  = d.textbbox((0, 0), label, font=font_big)
tw    = bbox[2] - bbox[0]
# glow layer
d.text((cx - tw//2 + 2, SIZE - 62 + 2), label,
       fill=(255, 45, 120, 60), font=font_big)
d.text((cx - tw//2, SIZE - 62), label, fill=PINK, font=font_big)

sub = '// BOOT'
bbox2 = d.textbbox((0, 0), sub, font=font_tiny)
tw2   = bbox2[2] - bbox2[0]
d.text((cx - tw2//2, SIZE - 30), sub,
       fill=(255, 45, 120, 140), font=font_tiny)

# Save PNG
img.save(ICON_PATH)
print(f'Icon saved to {ICON_PATH}')

# Apply icon to start.command using macOS APIs
try:
    apply_script = f'''
import AppKit
img = AppKit.NSImage.alloc().initWithContentsOfFile_('{ICON_PATH}')
AppKit.NSWorkspace.sharedWorkspace().setIcon_forFile_options_(img, '{CMD_PATH}', 0)
print('Icon applied to start.command')
'''
    result = subprocess.run(['python3', '-c', apply_script],
                            capture_output=True, text=True)
    if result.returncode == 0:
        print(result.stdout.strip())
    else:
        print('Could not apply icon automatically.')
        print(f'To apply manually: open {ICON_PATH} in Preview, Cmd+A Cmd+C, then Get Info on start.command and paste on the icon.')
except Exception as e:
    print(f'Icon application skipped: {e}')
    print(f'PNG saved at {ICON_PATH} — apply it manually via Get Info.')
