const fs = require('fs');
const { execSync } = require('child_process');
fs.mkdirSync('/home/kali/Bureau/autolib/screenshots', { recursive: true });
const out = '/home/kali/Bureau/autolib/screenshots/logo-render.png';
const html = `<!doctype html><html><head><style>
  body { margin:0; background:#0a0a0a; display:flex; gap:32px; padding:32px; align-items:center; font-family:sans-serif; }
  .panel { padding:20px; border-radius:8px; text-align:center; }
  .light { background:#f5f1e8; }
  .dark  { background:#0a0a0a; }
  .label { font: 600 10px monospace; margin-top:10px; }
  .lbl-light { color:#0a0a0a; }
  .lbl-dark  { color:#9a9a9a; }
</style></head><body>
  <div><div class="panel light"><img src="public/img/logo-mark.svg" width="120" height="120"></div><div class="panel light label lbl-light">mark/light</div></div>
  <div><div class="panel dark"><img src="public/img/logo-mark.svg" width="120" height="120"></div><div class="panel dark label lbl-dark">mark/dark</div></div>
  <div style="flex:1"><div class="panel light"><img src="public/img/logo-horizontal.svg" width="380" height="95"></div><div class="panel light label lbl-light">horizontal/light</div></div>
  <div style="flex:1"><div class="panel dark"><img src="public/img/logo-horizontal-inverse.svg" width="380" height="95"></div><div class="panel dark label lbl-dark">horizontal/dark</div></div>
  <div><div class="panel light"><img src="public/img/favicon.svg" width="80" height="80"></div><div class="panel light label lbl-light">favicon</div></div>
</body></html>`;
fs.writeFileSync('/tmp/logo-preview.html', html);
execSync(`chromium --headless --no-sandbox --disable-gpu --hide-scrollbars --window-size=1500,500 --screenshot=${out} file:///tmp/logo-preview.html 2>/dev/null`);
console.log('OK', fs.statSync(out).size);
