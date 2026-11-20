# 사용: PYTHONUTF8=1 python scripts/check_anim.py redis/part1/I-1-1.html [...]   (tech-roadmap 루트 기준 경로, http://localhost:8766 이 저장소를 서비스 중이어야 함)
# 각 페이지에 대해:
#  1) 콘솔 오류 / 페이지 오류
#  2) 모든 beat 에서 장면을 u = 0.4, 1.5, 2.95 초 시점으로 그려 보고
#     - 무대(viewBox) 밖으로 나간 글자
#     - 서로 겹친 글자 (작은 쪽 면적의 25% 이상 겹침)
#  3) beat 마다 끝 장면을 찍어 한 장으로 모은 캡처: ratools/out/<id>_sheet.png
#     단계(Step)마다 첫 beat 의 전체 화면: <id>_g<n>.png  (저장 위치: $ANIM_OUT, 없으면 임시 폴더/redis-anim-check)
import pathlib, sys, json
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont

import os, tempfile
OUT = pathlib.Path(os.environ.get("ANIM_OUT") or pathlib.Path(tempfile.gettempdir()) / "anim-check"); OUT.mkdir(parents=True, exist_ok=True)
FONT = next((ImageFont.truetype(f, 22) for f in ["C:/Windows/Fonts/malgun.ttf", "/System/Library/Fonts/AppleSDGothicNeo.ttc", "/usr/share/fonts/truetype/nanum/NanumGothic.ttf"] if os.path.exists(f)), ImageFont.load_default())

PROBE = r"""() => {
  const B = RA.BEAT, gEl = document.querySelector('.rp-stage svg g'), svg = gEl.ownerSVGElement;
  const vb = svg.viewBox.baseVal, probs = [];
  const boxes = () => { const r = svg.getBoundingClientRect(), sx = vb.width / r.width, sy = vb.height / r.height;
    return [...gEl.querySelectorAll('text')].filter(t => t.textContent.trim() && +(getComputedStyle(t).opacity) > 0.05 && !t.closest('[opacity="0"]')).map(t => { const b = t.getBoundingClientRect();
      let op = 1; for (let n = t; n && n !== svg; n = n.parentNode) { const o = n.getAttribute && n.getAttribute('opacity'); if (o != null) op *= +o; }
      return { s: t.textContent.slice(0, 24), x0: vb.x + (b.left - r.left) * sx, y0: vb.y + (b.top - r.top) * sy, x1: vb.x + (b.right - r.left) * sx, y1: vb.y + (b.bottom - r.top) * sy, op }; }).filter(b => b.op > 0.15 && b.x1 > b.x0); };
  STEPS.forEach((st, i) => { const { g, k, n } = raGroupOf(i), steps = STEPS.filter((_, j) => raGroupOf(j).g === g);
    const c = { k, n, beat: st, prev: k > 0 ? STEPS[i - 1] : null, steps };
    for (const u of [0.4, 1.5, 2.95]) { RA.render(gEl, g, k * B + u, { ...c, u });
      const bs = boxes();
      bs.forEach(b => { if (b.x0 < vb.x - 2 || b.y0 < vb.y - 2 || b.x1 > vb.x + vb.width + 2 || b.y1 > vb.y + vb.height + 2) probs.push(`beat ${i} u=${u}: 무대 밖 "${b.s}"`); });
      for (let a = 0; a < bs.length; a++) for (let b = a + 1; b < bs.length; b++) { const A = bs[a], Bb = bs[b];
        const ix = Math.min(A.x1, Bb.x1) - Math.max(A.x0, Bb.x0), iy = Math.min(A.y1, Bb.y1) - Math.max(A.y0, Bb.y0);
        if (ix > 0 && iy > 0) { const small = Math.min((A.x1 - A.x0) * (A.y1 - A.y0), (Bb.x1 - Bb.x0) * (Bb.y1 - Bb.y0));
          if (ix * iy > small * 0.25) probs.push(`beat ${i} u=${u}: 글자 겹침 "${A.s}" ↔ "${Bb.s}"`); } } } });
  return probs; }"""

def sheet(pid, shots, labels):
    w, h = shots[0].size; cols = 3; rows = (len(shots) + cols - 1) // cols
    img = Image.new("RGB", (cols * w, rows * (h + 34)), "white"); d = ImageDraw.Draw(img)
    for i, (s, l) in enumerate(zip(shots, labels)):
        x, y = (i % cols) * w, (i // cols) * (h + 34); d.text((x + 8, y + 4), l, fill="black", font=FONT); img.paste(s, (x, y + 34))
    img.save(OUT / f"{pid}_sheet.png")

total = 0
with sync_playwright() as p:
    b = p.chromium.launch()
    for rel in sys.argv[1:]:
        pid = pathlib.Path(rel).stem; errs = []
        pg = b.new_page(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
        pg.on("console", lambda m: m.type == "error" and errs.append(m.text))
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(f"http://localhost:8766/{rel}"); pg.wait_for_selector(".rp-stage svg g", timeout=20000); pg.wait_for_timeout(600)
        probs = pg.evaluate(PROBE)
        n = pg.evaluate("STEPS.length"); groups = pg.evaluate("STEPS.map((_, i) => raGroupOf(i).k)")
        labels = pg.evaluate("STEPS.map((s, i) => i + '. ' + (s.beat ? s.beat.label : s.title))")
        pg.reload(); pg.wait_for_selector(".rp-stage svg g"); pg.wait_for_timeout(500)
        shots = []
        for i in range(n):
            if i: pg.get_by_role("button", name="다음 단계").click(); pg.wait_for_timeout(250)
            if groups[i] == 0: pg.screenshot(path=str(OUT / f"{pid}_g{sum(1 for x in groups[:i+1] if x == 0) - 1}.png"), full_page=True)
            pth = OUT / f"_tmp_{pid}.png"; pg.locator(".rp-stage").screenshot(path=str(pth)); im = Image.open(pth).convert("RGB")
            shots.append(im.resize((640, int(640 * im.height / im.width))))
        hh = max(s.height for s in shots); shots = [s.crop((0, 0, 640, hh)) if s.height >= hh else Image.new("RGB", (640, hh), "white") for s in shots] if False else [s.resize((640, hh)) for s in shots]
        sheet(pid, shots, labels)
        bad = errs + probs; total += len(bad)
        print(f"== {pid}: beat {n}개, 문제 {len(bad)}건  (캡처 {OUT / (pid + '_sheet.png')})")
        for x in bad[:40]: print("   ", x)
        pg.close()
    b.close()
print("문제 합계:", total)
