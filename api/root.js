export default async function handler(req, res) {
  const html = `<!doctype html><html lang="ru"><meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Tiger.com Feedback</title>
  <style>
    :root{--bg:#0b1020;--panel:#0f172a;--muted:#94a3b8;--line:#233147;--txt:#e5e7eb;--accent:#2563eb;--btn:#1f2a5b}
    *{box-sizing:border-box}
    body{margin:0;background:radial-gradient(1200px 700px at 80% -20%,#1e293b00,#1e293b88),var(--bg);color:var(--txt);font:16px/1.5 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu}
    .shell{min-height:100vh;display:grid;place-items:center;padding:28px}
    .card{width:min(880px,94vw);background:rgba(15,23,42,.92);backdrop-filter: blur(8px);border:1px solid var(--line);border-radius:16px;padding:22px 22px 18px;box-shadow:0 28px 60px rgba(0,0,0,.5)}
    .top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:6px}
    .brand{display:flex;align-items:center;gap:10px}
    .logo{width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#1d4ed8,#22d3ee)}
    .brand b{letter-spacing:.2px}
    .role{font-size:12px;color:var(--muted);border:1px solid var(--line);padding:6px 8px;border-radius:999px}
    .steps{display:flex;gap:6px}
    .dot{width:7px;height:7px;border-radius:999px;background:#334155}
    .dot.on{background:#60a5fa}
    h2{margin:12px 2px 10px;font-size:18px}
    .row{display:flex;flex-wrap:wrap;gap:10px}
    .chip{border:1px solid var(--line);background:#0b1220;color:#cbd5e1;padding:10px 12px;border-radius:999px;cursor:pointer}
    .chip.sel{outline:2px solid var(--accent);background:#0b1630}
    .btns{display:flex;gap:8px;margin-top:14px}
    .btn{background:var(--btn);border:1px solid var(--line);color:#fff;padding:10px 14px;border-radius:12px;cursor:pointer}
    .btn.secondary{background:transparent}
    .btn:hover{filter:brightness(1.08)}
    textarea{width:100%;min-height:150px;background:#0b1220;border:1px solid var(--line);color:var(--txt);border-radius:12px;padding:12px;resize:vertical}
    .muted{color:var(--muted)}
    .links{margin-top:10px}
    .links a{color:#60a5fa;text-decoration:none}
    .links a:hover{text-decoration:underline}
  </style>
  <body><div class="shell"><div class="card">
    <div class="top">
      <div class="brand"><div class="logo"></div><b>Tiger.com Feedback</b></div>
      <div class="steps" id="dots"><span class="dot on"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
    </div>

    <section id="s1">
      <h2>Кто вы?</h2>
      <div class="row" id="who">
        <button class="chip" data-v="user">Я пользователь</button>
        <button class="chip" data-v="admin">Я админ</button>
      </div>
      <div class="btns"><button class="btn" id="next1">Далее</button></div>
    </section>

    <section id="s2" hidden>
      <h2>Выберите продукт</h2>
      <div class="row" id="product">
        <button class="chip" data-v="Tiger for Windows">Tiger.com Windows</button>
        <button class="chip" data-v="Tiger for macOS">Tiger.com macOS</button>
        <button class="chip" data-v="Tiger Broker">Tiger.com Broker</button>
      </div>
      <div class="btns">
        <button class="btn secondary" id="back2">Назад</button>
        <button class="btn" id="next2">Далее</button>
      </div>
    </section>

    <section id="s3" hidden>
      <h2>Выберите тему</h2>
      <div class="row" id="topic">
        <button class="chip" data-v="Стакан">Стакан</button>
        <button class="chip" data-v="График">График</button>
        <button class="chip" data-v="Котировки">Котировки</button>
        <button class="chip" data-v="Подключения">Подключения</button>
        <button class="chip" data-v="Кастомизация">Кастомизация</button>
        <button class="chip" data-v="Индикаторы">Индикаторы</button>
        <button class="chip" data-v="Графические объекты">Графические объекты</button>
        <button class="chip" data-v="Другое">Другое</button>
      </div>
      <div class="btns">
        <button class="btn secondary" id="back3">Назад</button>
        <button class="btn" id="next3">Далее</button>
      </div>
    </section>

    <section id="s4" hidden>
      <h2>Опишите ваше предложение</h2>
      <label class="muted">Текст предложения</label>
      <textarea id="text" placeholder="Опишите улучшение…"></textarea>
      <div class="btns">
        <button class="btn secondary" id="back4">Назад</button>
        <button class="btn" id="send">Отправить</button>
      </div>
      <div class="links muted">
        Админка: <a href="/api/admin">/api/admin</a> · Ping: <a href="/api/ping">/api/ping</a>
      </div>
    </section>
  </div></div>

  <script>
    const dots=[...document.querySelectorAll('#dots .dot')];
    const show=i=>{['s1','s2','s3','s4'].forEach((id,idx)=>{document.getElementById(id).hidden=idx!==i;dots[idx].classList.toggle('on',idx<=i)});step=i};
    const select=(id)=>{const box=document.getElementById(id);box.onclick=e=>{if(e.target.classList.contains('chip')){[...box.children].forEach(b=>b.classList.remove('sel'));e.target.classList.add('sel');vals[id]=e.target.dataset.v}}};
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
