export default async function handler(req, res) {
  const html = `<!doctype html>
<html lang="ru"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Tiger.com Feedback</title>
<style>
:root{--bg:#0b1220;--card:#0f172a;--muted:#94a3b8;--text:#e5e7eb;--accent:#2563eb;--accent-2:#1d4ed8;--chip:#111827;--chip-on:#1e293b}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:16px/1.5 system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"}
.container{max-width:900px;margin:40px auto;padding:0 16px}
.header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.badge{font-size:12px;padding:6px 10px;border-radius:999px;background:var(--chip);border:1px solid #334155;color:#cbd5e1}
.card{background:var(--card);border:1px solid #334155;border-radius:16px;padding:18px 18px 20px;box-shadow:0 14px 40px rgba(0,0,0,.25)}
h1{font-size:20px;margin:0 0 6px}
.muted{color:var(--muted);font-size:14px}
#wizard{margin-top:10px}
.btns{display:flex;gap:10px;margin-top:16px}
.btn{background:var(--accent);border:1px solid #3b82f6;color:#fff;padding:10px 14px;border-radius:10px;cursor:pointer}
.btn:hover{background:var(--accent-2)}
.btn.secondary{background:#111827;border:1px solid #334155;color:#fff}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.chip{padding:8px 12px;border-radius:999px;background:var(--chip);border:1px solid #334155;cursor:pointer}
.chip.sel{background:var(--chip-on);border-color:#3b82f6}
textarea{width:100%;min-height:140px;margin-top:10px;background:#0b1220;border:1px solid #334155;color:var(--text);border-radius:12px;padding:12px;resize:vertical}
.links{margin-top:16px}
#dots{display:flex;gap:6px;margin-bottom:12px}
.dot{width:7px;height:7px;border-radius:999px;background:#1f2937;border:1px solid #334155}
.dot.on{background:#60a5fa;border-color:#60a5fa}
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div id="dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
        <h1>Tiger.com Feedback</h1>
        <div class="muted">Поделитесь предложением по продукту</div>
      </div>
      <div id="roleBadge" class="badge">Гость</div>
    </div>

    <div class="card" id="wizard">
      <section id="s1">
        <div class="muted">Кто вы?</div>
        <div id="who" class="chips">
          <div class="chip" data-v="user">Вы пользователь?</div>
          <div class="chip" data-v="admin">Вы админ?</div>
        </div>
        <div class="btns">
          <button class="btn" id="next1">Далее</button>
        </div>
      </section>

      <section id="s2" hidden>
        <div class="muted">Выберите продукт</div>
        <div id="product" class="chips">
          <div class="chip" data-v="Tiger.com Windows">Tiger.com Windows</div>
          <div class="chip" data-v="Tiger.com macOS">Tiger.com macOS</div>
          <div class="chip" data-v="Tiger.com Broker">Tiger.com Broker</div>
        </div>
        <div class="btns">
          <button class="btn secondary" id="back2">Назад</button>
          <button class="btn" id="next2">Далее</button>
        </div>
      </section>

      <section id="s3" hidden>
        <div class="muted">Выберите тему</div>
        <div id="topic" class="chips">
          <div class="chip" data-v="Сделки">Сделки</div>
          <div class="chip" data-v="График">График</div>
          <div class="chip" data-v="Котировки">Котировки</div>
          <div class="chip" data-v="Подключения">Подключения</div>
          <div class="chip" data-v="Кастомизация">Кастомизация</div>
          <div class="chip" data-v="Индикаторы">Индикаторы</div>
          <div class="chip" data-v="Графические объекты">Графические объекты</div>
          <div class="chip" data-v="Другое">Другое</div>
        </div>
        <div class="btns">
          <button class="btn secondary" id="back3">Назад</button>
          <button class="btn" id="next3">Далее</button>
        </div>
      </section>

      <section id="s4" hidden>
        <div class="muted">Опишите ваше предложение</div>
        <label class="muted">Текст предложения</label>
        <textarea id="text" placeholder="Опишите улучшение…"></textarea>
        <div class="btns">
          <button class="btn secondary" id="back4">Назад</button>
          <button class="btn" id="send">Отправить</button>
        </div>
        <div class="links muted">Админка: <a href="/api/admin">/api/admin</a> · Ping: <a href="/api/ping">/api/ping</a></div>
      </section>
    </div>
  </div>

<script>
  const dots=[...document.querySelectorAll('#dots .dot')];
  const show=i=>{['s1','s2','s3','s4'].forEach((id,idx)=>{document.getElementById(id).hidden=idx!==i;dots[idx].classList.toggle('on',idx<=i)});step=i};
  const select=(id)=>{const box=document.getElementById(id);box.onclick=e=>{if(e.target.classList.contains('chip')){[...box.children].forEach(b=>b.classList.remove('sel'));e.target.classList.add('sel');vals[id]=e.target.dataset.v; if(id==='who') document.getElementById('roleBadge').textContent = (vals[id]==='admin'?'Админ':'Пользователь');}}};
  let step=0, vals={};
  select('who');select('product');select('topic');
  document.getElementById('next1').onclick=()=>show(1);
  document.getElementById('back2').onclick=()=>show(0);
  document.getElementById('next2').onclick=()=>show(2);
  document.getElementById('back3').onclick=()=>show(1);
  document.getElementById('next3').onclick=()=>show(3);
  document.getElementById('back4').onclick=()=>show(2);
  document.getElementById('send').onclick=async()=>{
    const payload={role:vals.who||'user',product:vals.product||null,topic:vals.topic||null,text:document.getElementById('text').value.trim()};
    try{
      const r=await fetch('/api/suggestions',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
      if(r.ok){alert('Спасибо! Отправлено.');location.reload()}
      else{alert('Ошибка: '+r.status+' '+await r.text())}
    }catch{alert('Сеть недоступна')}
  };
  show(0);
</script>
</body></html>`;
  res.setHeader("content-type","text/html; charset=utf-8");
  res.status(200).send(html);
}
