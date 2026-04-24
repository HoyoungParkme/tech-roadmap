"""마인드맵 노드 좌표를 0.65배로 축소"""
import re, pathlib

f = pathlib.Path("mindmap/index.html")
content = f.read_text(encoding="utf-8")

def scale(m):
    return f"{m.group(1)}: {int(int(m.group(2)) * 0.65)}"

start = content.find("const NODES = [")
end = content.find("const EDGES = [")
section = content[start:end]
section = re.sub(r"(x): (\d+)", scale, section)
section = re.sub(r"(y): (\d+)", scale, section)
content = content[:start] + section + content[end:]

f.write_text(content, encoding="utf-8")
print("done")
