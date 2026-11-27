# 사용: PYTHONUTF8=1 python scripts/fix_josa.py [--dry] <파일>...
# 영문·숫자·코드 뒤에 띄어 쓴 조사를 붙인다 ("LoRA 로" → "LoRA로").
#  - .anim.js: 파일 안의 모든 문자열(장면 그림 글자, quiz / summary / review). 숫자 뒤 "만"·"도"는 단위라 붙이지 않는다
#  - .html  : STEPS 의 caption / desc / keyPoint / label / title / alert / text / note 문자열과 window.LESSON 의 wrap
# 코드 블록(CODE)은 건드리지 않는다.
import pathlib, re, sys

J = "까지만|에서만|에게서|에만|으로만|로만|만큼|이라도|라도|으로서|로서|보다는|에서의|이라고|이라는|이라서|이라면|이라|이란|이고|이며|이면|이다|이지만|에서는|에서도|에서|에게|에는|에도|으로는|으로도|으로|로는|로도|로|와|과|은|는|이|가|을|를|의|에|도|만|처럼|까지|부터|보다|마다|란|라|라고|라는|라서|라면|다|면|인|일|이나|나|조차|밖에|뿐|끼리|하고|한테"
PAT = re.compile(r"(?<=[A-Za-z0-9_)\]}%'`²³⁴/])\s(" + J + r")(?=[\s,.!?;:·)\]'\"`]|$)")

# 숫자 바로 뒤의 "만"·"도"는 단위로 읽힌다("95 만" → "95만" 은 95만=950,000, "3 도" → "3도" 는 온도). 숫자 뒤에서는 붙이지 않는다.
NUM_UNIT = re.compile(r"(?<=[0-9])\s(만|도)(?=[\s,.!?;:·)\]'\"`]|$)")

def fix_str(s):
    keep = {m.start() for m in NUM_UNIT.finditer(s)}
    return PAT.sub(lambda m: m.group(0) if m.start() in keep else m.group(1), s)

STR = re.compile(r"'(?:[^'\\\n]|\\.)*'|\"(?:[^\"\\\n]|\\.)*\"|`(?:[^`\\]|\\.)*`")

def fix_strings(src):
    n = 0
    def rep(m):
        nonlocal n
        t = m.group(0); u = t[0] + fix_str(t[1:-1]) + t[-1]
        if u != t: n += 1
        return u
    return STR.sub(rep, src), n

dry = "--dry" in sys.argv
for f in [a for a in sys.argv[1:] if a != "--dry"]:
    p = pathlib.Path(f); s = p.read_text(encoding="utf-8"); total = 0
    if f.endswith(".anim.js"):
        # 장면 그림 글자(SVG 텍스트)와 quiz / summary / review 모두 — .anim.js 의 문자열은 화면에 보이는 글이다
        s2, total = fix_strings(s)
    else:
        s2 = s
        for key in ("caption", "desc", "keyPoint", "label", "title", "alert", "text", "note"):
            # caption: '…' 꼴과 "caption":"…"(JSON) 꼴 모두
            s2, k = re.subn(r"(\"?\b" + key + r"\"?\s*:\s*)(" + STR.pattern + ")", lambda m: m.group(1) + fix_strings(m.group(2))[0], s2)
        s2, _ = re.subn(r'("wrap": )("(?:[^"\\]|\\.)*")', lambda m: m.group(1) + fix_strings(m.group(2))[0], s2)
        total = sum(1 for a, b in zip(s.splitlines(), s2.splitlines()) if a != b)
    if s2 != s:
        print(f"{f}: {total}곳")
        if not dry: p.write_text(s2, encoding="utf-8", newline="\n")
