// 사용: node dump_steps.js <page.html>  — STEPS 를 단계/beat 별로 요약해 보여 준다 (코드 본문은 줄 수만)
const fs = require('fs');
const src = fs.readFileSync(process.argv[2], 'utf8');
const m = src.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
let js = m[1];
const end = js.search(/\n    const TONE\b|\n    function [A-Z]/);
js = js.slice(0, end).replace(/const \{[^}]*\} = React;/, '');
const STEPS = new Function(js + '\n;return STEPS;')();
let last = null, g = -1;
STEPS.forEach((s, i) => {
  if (s.title !== last) { g++; last = s.title;
    console.log(`\n## 그룹 ${g} (${s.title})\n   desc: ${s.desc}\n   code: ${s.code.filename} [${s.code.lang}] ${s.code.lines.length}줄`); }
  const { title, desc, code, beat, ...rest } = s;
  console.log(`  [${i}] ${beat ? beat.label + ' | ' + beat.at : '(beat 없음)'}`);
  if (beat) { console.log(`      cap: ${beat.caption}`); if (beat.changes) console.log('      changes: ' + beat.changes.map(c => c.mark + ':' + c.text).join(' / ')); }
  console.log(`      hl: ${JSON.stringify(code.highlight)}  data: ${JSON.stringify(rest)}`);
});
