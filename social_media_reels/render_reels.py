import os, sys, math, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg

work_dir = '/Users/mustafaenescalimli/Documents/antigravity/katılım/social_media_reels'
audio_path = os.path.join(work_dir, 'reels_master_audio.wav')
output_mp4 = os.path.join(work_dir, 'mizan_reels_tanitim_720x1280.mp4')
cover_png = os.path.join(work_dir, 'mizan_reels_kapak_720x1280.png')
ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

width, height = 720, 1280
fps = 30
duration = 30.0
total_frames = int(fps * duration)

# Fonts
font_bold_path = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
font_reg_path = '/System/Library/Fonts/Supplemental/Arial.ttf'

def get_font(size, bold=True):
    try:
        p = font_bold_path if bold else font_reg_path
        return ImageFont.truetype(p, size)
    except:
        return ImageFont.load_default()

font_huge = get_font(46, True)
font_large = get_font(34, True)
font_med = get_font(24, True)
font_small = get_font(18, True)
font_tiny = get_font(14, False)
font_mono = get_font(20, True)

# Subtitles Definition
subtitles = [
    (0.0, 2.5, "Borsada 626 şirket var...", "626 şirket"),
    (2.5, 5.3, "Peki hangisi GERÇEKTEN katılım fıkhına uygun?", "GERÇEKTEN"),
    (5.3, 7.5, "Tanışın: Mizan!", "Mizan!"),
    (7.5, 9.6, "Borsa İstanbul Katılım ve Arındırma Çözümü.", "Katılım ve Arındırma"),
    (9.6, 14.0, "238 resmi Katılım hissesi ve 57 Halka Arz şirketi...", "238 Katılım • 57 Halka Arz"),
    (14.0, 18.2, "AAOIFI ve TKBB kurallarıyla 7/24 taranıyor!", "7/24 taranıyor!"),
    (18.2, 21.0, "Kuruşu kuruşuna şüpheli kazanç arındırması...", "Kuruşu kuruşuna"),
    (21.0, 24.0, "ve hisse senedi zekâtı tek tıkla cebinizde!", "tek tıkla cebinizde!"),
    (24.0, 27.0, "Borsada helal kazanç, şüphesiz yatırım.", "helal kazanç"),
    (27.0, 30.0, "Hemen ücretsiz keşfedin: mizanapp.tr", "mizanapp.tr")
]

# Random particles
np.random.seed(42)
num_particles = 45
particle_x = np.random.uniform(0, width, num_particles)
particle_y = np.random.uniform(0, height, num_particles)
particle_vy = np.random.uniform(1.0, 2.5, num_particles)

# Confetti for Scene 5
num_confetti = 60
confetti_x = np.random.uniform(0, width, num_confetti)
confetti_y = np.random.uniform(-height, 0, num_confetti)
confetti_vy = np.random.uniform(3.0, 6.0, num_confetti)
confetti_colors = [(56, 189, 248), (16, 185, 129), (245, 158, 11), (255, 255, 255), (99, 102, 241)]

def draw_round_rect(draw, bbox, radius, fill=None, outline=None, width=1):
    x0, y0, x1, y1 = bbox
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=fill, outline=outline, width=width)

def render_frame(frame_idx):
    t = frame_idx / float(fps)
    img = Image.new('RGB', (width, height), (7, 12, 24))
    draw = ImageDraw.Draw(img)

    # -------------------------------------------------------------
    # 1. SCENE SELECTION & DRAWING
    # -------------------------------------------------------------
    if t < 5.3:
        # SCENE 1: HOOK (0 - 5.3s)
        # Background: Radial deep navy
        for y in range(0, height, 4):
            factor = y / float(height)
            r = int(10 * (1 - factor) + 2 * factor)
            g = int(18 * (1 - factor) + 6 * factor)
            b = int(38 * (1 - factor) + 16 * factor)
            draw.line([(0, y), (width, y)], fill=(r, g, b), width=4)

        # Ambient particles
        for i in range(num_particles):
            py = (particle_y[i] - t * 40 * particle_vy[i]) % height
            draw.ellipse([particle_x[i]-2, py-2, particle_x[i]+2, py+2], fill=(148, 163, 184, 80))

        # Alert Tag
        draw_round_rect(draw, [150, 200, 570, 248], 24, fill=(50, 18, 24), outline=(239, 68, 68), width=2)
        draw.text((360, 224), "⚠️  626 HİSSE ARASINDA KAYBOLMA", fill=(248, 113, 113), font=font_small, anchor="mm")

        # Big Kinetic Typography
        draw.text((360, 320), "Borsada 626", fill=(255, 255, 255), font=font_huge, anchor="mm")
        draw.text((360, 380), "Şirket Var...", fill=(255, 255, 255), font=font_huge, anchor="mm")
        draw.text((360, 450), "Peki Hangisi GERÇEKTEN", fill=(56, 189, 248), font=font_large, anchor="mm")
        draw.text((360, 500), "Katılım Fıkhına Uygun?", fill=(16, 185, 129), font=font_large, anchor="mm")

        # Ticker Alarm Cards
        y_cards = 620
        # Card 1: THYAO
        draw_round_rect(draw, [60, y_cards, 660, y_cards+90], 20, fill=(24, 32, 50), outline=(239, 68, 68), width=1)
        draw_round_rect(draw, [76, y_cards+16, 136, y_cards+74], 14, fill=(15, 23, 42))
        draw.text((106, y_cards+45), "THYAO", fill=(255, 255, 255), font=font_mono, anchor="mm")
        draw.text((156, y_cards+33), "THY Bilanço Analizi", fill=(248, 250, 252), font=font_small, anchor="lm")
        draw.text((156, y_cards+58), "Faizli Borç Oranı: %48,2 (Eşik Aşıldı)", fill=(148, 163, 184), font=font_tiny, anchor="lm")
        draw.text((640, y_cards+45), "KAPSAM DIŞI", fill=(239, 68, 68), font=font_mono, anchor="rm")

        # Card 2: EREGL
        y2 = y_cards + 105
        draw_round_rect(draw, [60, y2, 660, y2+90], 20, fill=(24, 32, 50), outline=(245, 158, 11), width=1)
        draw_round_rect(draw, [76, y2+16, 136, y2+74], 14, fill=(15, 23, 42))
        draw.text((106, y2+45), "EREGL", fill=(255, 255, 255), font=font_mono, anchor="mm")
        draw.text((156, y2+33), "Ereğli Demir Çelik", fill=(248, 250, 252), font=font_small, anchor="lm")
        draw.text((156, y2+58), "Faizli Varlık Oranı: %37,8", fill=(148, 163, 184), font=font_tiny, anchor="lm")
        draw.text((640, y2+45), "EŞİK AŞILDI", fill=(245, 158, 11), font=font_mono, anchor="rm")

        # Card 3: BIMAS
        y3 = y_cards + 210
        draw_round_rect(draw, [60, y3, 660, y3+90], 20, fill=(24, 32, 50), outline=(16, 185, 129), width=1)
        draw_round_rect(draw, [76, y3+16, 136, y3+74], 14, fill=(15, 23, 42))
        draw.text((106, y3+45), "BIMAS", fill=(255, 255, 255), font=font_mono, anchor="mm")
        draw.text((156, y3+33), "BİM Mağazalar", fill=(248, 250, 252), font=font_small, anchor="lm")
        draw.text((156, y3+58), "Borç: %14,2 • Gelir: %0,8", fill=(148, 163, 184), font=font_tiny, anchor="lm")
        draw.text((640, y3+45), "%100 KATILIM UYGUN", fill=(16, 185, 129), font=font_mono, anchor="rm")

    elif t < 9.6:
        # SCENE 2: MIZAN REVEAL (5.3 - 9.6s)
        # Background: Payno Glacial Sky-Mist
        for y in range(0, height, 4):
            factor = y / float(height)
            r = int(199 * (1 - factor) + 250 * factor)
            g = int(230 * (1 - factor) + 252 * factor)
            b = int(253 * (1 - factor) + 255 * factor)
            draw.line([(0, y), (width, y)], fill=(r, g, b), width=4)

        # Logo Squircle
        draw_round_rect(draw, [285, 180, 435, 330], 36, fill=(255, 255, 255), outline=(226, 232, 240), width=2)
        draw.text((360, 255), "m", fill=(24, 37, 66), font=ImageFont.truetype(font_bold_path, 80), anchor="mm")

        # Heading
        draw.text((360, 375), "tanışın: mizan", fill=(24, 37, 66), font=font_huge, anchor="mm")
        draw.text((360, 420), "Borsa İstanbul Katılım & Arındırma Platformu", fill=(110, 129, 160), font=font_small, anchor="mm")

        # Pill Nav
        draw_round_rect(draw, [110, 455, 610, 505], 25, fill=(255, 255, 255), outline=(220, 229, 242), width=2)
        draw.text((360, 480), "Hisse Tarayıcı (626)  •  Halka Arz  •  Arındırma  •  Zekât", fill=(24, 37, 66), font=font_tiny, anchor="mm")

        # Phone Mockup Hero
        py = 530
        draw_round_rect(draw, [130, py, 590, py+600], 38, fill=(255, 255, 255), outline=(226, 234, 244), width=3)
        # Phone top bar
        draw_round_rect(draw, [320, py+12, 400, py+20], 4, fill=(15, 23, 42))

        # BIMAS Phone Screen Card
        draw.text((160, py+60), "BIMAS", fill=(24, 37, 66), font=font_large, anchor="lm")
        draw.text((270, py+60), "● BIST KATILIM UYGUN", fill=(13, 159, 110), font=font_small, anchor="lm")
        draw.text((160, py+115), "₺ 482,50", fill=(24, 37, 66), font=font_huge, anchor="lm")

        # Ratio Box
        draw_round_rect(draw, [155, py+150, 565, py+280], 20, fill=(248, 250, 253))
        draw.text((175, py+175), "Faizli Borç Oranı", fill=(24, 37, 66), font=font_small, anchor="lm")
        draw.text((545, py+175), "%14,2 / %33", fill=(13, 159, 110), font=font_mono, anchor="rm")
        # Progress Bar Track
        draw_round_rect(draw, [175, py+195, 545, py+210], 8, fill=(226, 232, 240))
        draw_round_rect(draw, [175, py+195, 335, py+210], 8, fill=(13, 159, 110))
        draw.text((175, py+235), "Eşik: %33 • Güvenli Bölgede (+18,8% Marj)", fill=(110, 129, 160), font=font_tiny, anchor="lm")

        # Halka Arz Box
        draw_round_rect(draw, [155, py+300, 565, py+400], 20, fill=(24, 37, 66))
        draw.text((175, py+330), "57 Halka Arz Şirketi", fill=(255, 255, 255), font=font_med, anchor="lm")
        draw.text((175, py+360), "Resmi XHARZ & XKTUM Canlı Karnesi", fill=(148, 163, 184), font=font_tiny, anchor="lm")

    elif t < 18.2:
        # SCENE 3: 626 CANLI TARAMA (9.6 - 18.2s)
        # Background: Cyber Navy Grid
        draw.rectangle([0, 0, width, height], fill=(11, 19, 43))
        # Grid lines
        for gx in range(0, width, 60):
            draw.line([(gx, 0), (gx, height)], fill=(16, 28, 60), width=1)
        for gy in range(0, height, 60):
            draw.line([(0, gy), (width, gy)], fill=(16, 28, 60), width=1)

        # Scanning Line
        scan_y = int((t * 220) % height)
        draw.line([(0, scan_y), (width, scan_y)], fill=(56, 189, 248), width=3)

        # Header
        draw.text((360, 140), "⚡ 7/24 BIST VERİ BORU HATTI", fill=(56, 189, 248), font=font_small, anchor="mm")
        draw.text((360, 195), "Tüm 626 BIST Hissesi", fill=(255, 255, 255), font=font_huge, anchor="mm")
        draw.text((360, 235), "Canlı Fiyat & Resmi Endeks Verileriyle Elinizin Altında", fill=(148, 163, 184), font=font_small, anchor="mm")

        # 3 Big KPI cards
        draw_round_rect(draw, [60, 280, 240, 360], 18, fill=(30, 41, 59), outline=(255, 255, 255), width=1)
        draw.text((150, 315), "626", fill=(255, 255, 255), font=font_large, anchor="mm")
        draw.text((150, 342), "BIST EVRENİ", fill=(148, 163, 184), font=font_tiny, anchor="mm")

        draw_round_rect(draw, [270, 280, 450, 360], 18, fill=(30, 41, 59), outline=(16, 185, 129), width=1)
        draw.text((360, 315), "238", fill=(16, 185, 129), font=font_large, anchor="mm")
        draw.text((360, 342), "XKTUM KATILIM", fill=(148, 163, 184), font=font_tiny, anchor="mm")

        draw_round_rect(draw, [480, 280, 660, 360], 18, fill=(30, 41, 59), outline=(56, 189, 248), width=1)
        draw.text((570, 315), "57", fill=(56, 189, 248), font=font_large, anchor="mm")
        draw.text((570, 342), "XHARZ HALKA ARZ", fill=(148, 163, 184), font=font_tiny, anchor="mm")

        # Stock Rows
        stocks = [
            ("BIMAS", "BİM Mağazalar", "₺482,50", "KATILIMA UYGUN", (16, 185, 129), "%14,2"),
            ("ASELS", "Aselsan Elektronik", "₺68,40", "KATILIMA UYGUN", (16, 185, 129), "%19,8"),
            ("TABGD", "TAB Gıda (Halka Arz)", "₺164,00", "XKTUM ONAYLI", (16, 185, 129), "%8,4"),
            ("THYAO", "Türk Hava Yolları", "₺312,00", "KAPSAM DIŞI", (239, 68, 68), "%48,2"),
            ("FROTO", "Ford Otosan", "₺985,00", "KATILIMA UYGUN", (16, 185, 129), "%24,1"),
            ("EREGL", "Ereğli Demir Çelik", "₺52,80", "HOŞGÖRÜDE", (245, 158, 11), "%34,1")
        ]
        sy = 390
        for tick, name, prc, st_txt, col, dbt in stocks:
            draw_round_rect(draw, [60, sy, 660, sy+74], 16, fill=(24, 34, 56), outline=col, width=1)
            draw.text((80, sy+25), tick, fill=(255, 255, 255), font=font_med, anchor="lm")
            draw.text((80, sy+52), name, fill=(148, 163, 184), font=font_tiny, anchor="lm")
            draw.text((450, sy+25), prc, fill=(248, 250, 252), font=font_mono, anchor="rm")
            draw.text((450, sy+52), "Borç: " + dbt, fill=(100, 116, 139), font=font_tiny, anchor="rm")
            draw.text((640, sy+37), st_txt, fill=col, font=font_mono, anchor="rm")
            sy += 85

    elif t < 24.0:
        # SCENE 4: ZERO-FLOAT ARINDIRMA (18.2 - 24.0s)
        # Background: Brushed Platinum Dark Gradient
        for y in range(0, height, 4):
            factor = y / float(height)
            r = int(15 * (1 - factor) + 10 * factor)
            g = int(23 * (1 - factor) + 15 * factor)
            b = int(42 * (1 - factor) + 29 * factor)
            draw.line([(0, y), (width, y)], fill=(r, g, b), width=4)

        draw.text((360, 140), "✨ KURUŞU KURUŞUNA (ZERO-FLOAT)", fill=(245, 158, 11), font=font_small, anchor="mm")
        draw.text((360, 195), "Şüpheli Kazanç Arındırması", fill=(255, 255, 255), font=font_huge, anchor="mm")
        draw.text((360, 235), "& Hisse Senedi Zekâtı", fill=(148, 163, 184), font=font_large, anchor="mm")

        # Platinum Card
        py = 310
        draw_round_rect(draw, [70, py, 650, py+350], 30, fill=(30, 49, 92), outline=(139, 165, 206), width=2)
        draw.text((105, py+40), "MİZAN PLATINUM ARINDIRMA", fill=(255, 255, 255), font=font_small, anchor="lm")
        draw.text((105, py+65), "TKBB & AAOIFI No. 21 Standart", fill=(180, 200, 230), font=font_tiny, anchor="lm")

        draw.text((105, py+130), "SATIŞ ANINDA İNFAK EDİLECEK ŞÜPHELİ TUTAR:", fill=(200, 215, 240), font=font_tiny, anchor="lm")
        draw.text((105, py+185), "₺ 3.480,25", fill=(255, 255, 255), font=font_huge, anchor="lm")

        # Divider
        draw.line([(105, py+235), (615, py+235)], fill=(100, 130, 180), width=1)

        draw.text((105, py+280), "Hisse Zekâtı (%2,5):", fill=(255, 255, 255), font=font_med, anchor="lm")
        draw.text((615, py+280), "₺ 1.840,00", fill=(16, 185, 129), font=font_large, anchor="rm")
        draw.text((105, py+315), "Al-Sat & Temettü niyetine göre zekata tabi dönen varlık", fill=(180, 200, 230), font=font_tiny, anchor="lm")

        # Feature Bullets Below
        by = 700
        draw_round_rect(draw, [60, by, 660, by+85], 18, fill=(24, 34, 56), outline=(255, 255, 255), width=1)
        draw.text((90, by+42), "🛡️", font=font_large, anchor="mm")
        draw.text((130, by+30), "Fıkhi İhtiyat Kuralı (ROUND_CEIL)", fill=(248, 250, 252), font=font_small, anchor="lm")
        draw.text((130, by+55), "Kuruş küsuratları şüpheden kaçınmak için yukarı yuvarlanır.", fill=(148, 163, 184), font=font_tiny, anchor="lm")

        draw_round_rect(draw, [60, by+100, 660, by+185], 18, fill=(24, 34, 56), outline=(255, 255, 255), width=1)
        draw.text((90, by+142), "📅", font=font_large, anchor="mm")
        draw.text((130, by+130), "Otomatik Takvim Günü (Pro-Rata)", fill=(248, 250, 252), font=font_small, anchor="lm")
        draw.text((130, by+155), "Hisseleri elde tuttuğunuz gün oranında kesin arındırma payı.", fill=(148, 163, 184), font=font_tiny, anchor="lm")

        draw_round_rect(draw, [60, by+200, 660, by+285], 18, fill=(24, 34, 56), outline=(255, 255, 255), width=1)
        draw.text((90, by+242), "⚡", font=font_large, anchor="mm")
        draw.text((130, by+230), "Canlı BIST Portföy Takibi", fill=(248, 250, 252), font=font_small, anchor="lm")
        draw.text((130, by+255), "Piyasa dalgalanmalarında arındırma borcunuz anlık hesaplanır.", fill=(148, 163, 184), font=font_tiny, anchor="lm")

    else:
        # SCENE 5: CALL TO ACTION (24.0 - 30.0s)
        # Background: Sky-Mist with Confetti
        for y in range(0, height, 4):
            factor = y / float(height)
            r = int(191 * (1 - factor) + 255 * factor)
            g = int(226 * (1 - factor) + 255 * factor)
            b = int(253 * (1 - factor) + 255 * factor)
            draw.line([(0, y), (width, y)], fill=(r, g, b), width=4)

        # Confetti
        for i in range(num_confetti):
            cy = (confetti_y[i] + (t - 24.0) * 120 * confetti_vy[i]) % height
            col = confetti_colors[i % len(confetti_colors)]
            draw.rectangle([confetti_x[i]-5, cy-3, confetti_x[i]+5, cy+3], fill=col)

        # Mizan Logo
        draw_round_rect(draw, [280, 200, 440, 360], 40, fill=(255, 255, 255), outline=(220, 229, 242), width=2)
        draw.text((360, 280), "m", fill=(24, 37, 66), font=ImageFont.truetype(font_bold_path, 88), anchor="mm")

        # Headings
        draw.text((360, 420), "mizan", fill=(24, 37, 66), font=ImageFont.truetype(font_bold_path, 56), anchor="mm")
        draw.text((360, 470), "Borsada Helal Kazanç, Şüphesiz Yatırım.", fill=(46, 108, 246), font=font_med, anchor="mm")
        draw.text((360, 505), "BIST Katılım, Halka Arz ve Arındırma Çözümü", fill=(110, 129, 160), font=font_small, anchor="mm")

        # CTA Button
        draw_round_rect(draw, [110, 560, 610, 644], 42, fill=(24, 37, 66), outline=(46, 108, 246), width=2)
        draw.text((360, 602), "Hemen İncele: mizanapp.tr", fill=(255, 255, 255), font=font_large, anchor="mm")

        # 3 Value Badges
        draw_round_rect(draw, [130, 690, 590, 736], 23, fill=(255, 255, 255), outline=(220, 229, 242), width=1)
        draw.text((360, 713), "✓ ÜCRETSİZ & KAYIT GEREKTİRMEZ", fill=(13, 159, 110), font=font_small, anchor="mm")

        draw_round_rect(draw, [130, 750, 590, 796], 23, fill=(255, 255, 255), outline=(220, 229, 242), width=1)
        draw.text((360, 773), "✓ 626 BIST HİSSESİ & 7/24 CANLI VERİ", fill=(13, 159, 110), font=font_small, anchor="mm")

        draw_round_rect(draw, [130, 810, 590, 856], 23, fill=(255, 255, 255), outline=(220, 229, 242), width=1)
        draw.text((360, 833), "✓ TKBB & AAOIFI NO. 21 TAM UYUMLU", fill=(13, 159, 110), font=font_small, anchor="mm")

        # Social Prompt
        draw_round_rect(draw, [100, 910, 620, 1000], 25, fill=(240, 245, 252), outline=(200, 215, 235), width=1)
        draw.text((360, 940), "Arkadaşına Gönder ✈️ & Kaydet 💾", fill=(24, 37, 66), font=font_med, anchor="mm")
        draw.text((360, 972), "Takip et: @mizanapp • Web: mizanapp.tr", fill=(110, 129, 160), font=font_small, anchor="mm")

    # -------------------------------------------------------------
    # 2. OVERLAYS: TOP STORY PROGRESS BAR & WATERMARK
    # -------------------------------------------------------------
    progress = min(1.0, t / duration)
    draw.rectangle([24, 20, 696, 24], fill=(100, 116, 139))
    draw.rectangle([24, 20, 24 + int(672 * progress), 24], fill=(255, 255, 255))

    # Watermark
    draw.text((696, 45), "mizanapp.tr", fill=(255, 255, 255), font=font_small, anchor="rt")

    # -------------------------------------------------------------
    # 3. OVERLAYS: KARAOKE SUBTITLES
    # -------------------------------------------------------------
    for s_st, s_en, full_txt, hl_txt in subtitles:
        if s_st <= t < s_en:
            sub_y = 1060
            draw_round_rect(draw, [45, sub_y, 675, sub_y+84], 24, fill=(11, 19, 43), outline=(255, 255, 255), width=1)
            draw.text((360, sub_y+28), full_txt, fill=(255, 255, 255), font=font_med, anchor="mm")
            draw.text((360, sub_y+60), hl_txt, fill=(250, 204, 21), font=font_small, anchor="mm")
            break

    return img

print(f"Starting Video Render: {total_frames} frames ({duration}s @ {fps}fps)...")

# Open FFmpeg pipe
cmd = [
    ffmpeg_exe,
    '-y',
    '-f', 'rawvideo',
    '-vcodec', 'rawvideo',
    '-s', f'{width}x{height}',
    '-pix_fmt', 'rgb24',
    '-r', str(fps),
    '-i', '-',
    '-i', audio_path,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '20',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-pix_fmt', 'yuv420p',
    '-shortest',
    output_mp4
]

proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)

for f in range(total_frames):
    img = render_frame(f)
    if f == int(6.5 * fps): # Frame at 6.5s as Cover Photo
        img.save(cover_png)
    proc.stdin.write(img.tobytes())
    if f % 150 == 0 or f == total_frames - 1:
        print(f"Rendered {f+1}/{total_frames} frames ({((f+1)/total_frames)*100:.1f}%)...")

proc.stdin.close()
proc.wait()

print("Video successfully generated!")
print(f"MP4 Path: {output_mp4} ({os.path.getsize(output_mp4)/(1024*1024):.2f} MB)")
print(f"Cover Path: {cover_png} ({os.path.getsize(cover_png)/(1024*1024):.2f} MB)")
