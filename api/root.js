export default async function handler(req, res) {
  const html = `<!doctype html><html lang="ru"><meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Tiger.com Feedback</title>
  <style>
    :root{--bg:#0f172a;--panel:#111827;--text:#e5e7eb;--muted:#94a3b8;--accent:#2563eb;--btn:#1e40af;}
    *{box-sizing:border-box} body{margin:0;background:radial-gradient(1200px 600px at 70% -50%,#1e293b00,#1e293b88),var(--bg);color:var(--text);font:16px/1.5 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu}
    .wrap{min-height:100vh;display:grid;place-items:center;padding:28px}
    .card{width:min(860px,94vw);background:rgba(17,24,39,.85);backdrop-filter: blur(6px);border:1px solid #334155;border-radius:14px;padding:22px 22px 18px;box-shadow:0 18px 50px rgba(0,0,0,.45)}
    .hdr{display:flex;gap:12px;align-items:center;justify-content:space-between;margin-bottom:10px}
    .brand{font-weight:700;letter-spacing:.2px}
    .step{display:flex;gap:6px}
    .dot{width:6px;height:6px;border-radius:999px;background:#334155}
    .dot.on{background:#60a5fa}
    .title{font-weight:700;margin:10px 0 12px}
    .row{display:flex;flex-wrap:wrap;gap:8px}
    .choice{border:1px solid #334155;background:#0b1220;color:#cbd5e1;padding:10px 12px;border-radius:999px;cursor:pointer}
    .choice.sel{outline:2px solid #2563eb;background:#0c1b38}
    .btn{background:#1f2a5b;border:1px solid #334155;color:#fff;padding:10px 14px;border-radius:10px;cursor:pointer}
    .btn:hover{filter:brightness(1.1)}
    .muted{color:#94a3b8}
    textarea{width:100%;min-height:140px;background:#0b1220;border:1px solid #334155;color:#e5e7eb;border-radius:10px;padding:12px;resize:vertical}
    .bar{display:flex;gap:8px;margin-top:14px}
    .link{color:#60a5fa;text-decoration:none}
  </style>
  <body><div class="wrap"><div class="card">
    <div class="hdr">
      <div class="brand">Tiger.com Feedback</div>
      <div class="step" id="dots"><span class="dot on"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
    </div>

    <div id="s1">
      <div class="title">Кто вы?</div>
      <div class="row" id="who">
        <button class="choice" data-v="user">Я пользователь</button>
        <button class="choice" data-v="admin">Я админ</button>
      </div>
      <div class="bar"><button class="btn" id="next1">Далее</button></div>
    </div>

    <div id="s2" hidden>
      <div class="title">Выберите продукт</div>
      <div class="row" id="product">
        <button class="choice" data-v="Tiger for Windows">Tiger.com Windows</button>
        <button class="choice" data-v="Tiger for macOS">Tiger.com macOS</button>
        <button class="choice" data-v="Tiger Broker">Tiger.com Broker</button>
      </div>
      <div class="bar"><button class="btn" id="back2">Назад</button><button class="btn" id="next2">Далее</button></div>
    </div>

    <div id="s3" hidden>
      <div class="title">Выберите тему</div>
      <div class="row" id="topic">
        <button class="choice" data-v="Стакан">Стакан</button>
        <button class="choice" data-v="График">График</button>
        <button class="choice" data-v="Котировки">Котировки</button>
        <button class="choice" data-v="Подключения">Подключения</button>
        <button class="choice" data-v="Кастомизация">Кастомизация</button>
        <button class="choice" data-v="Индикаторы">Индикаторы</button>
        <button class="choice" data-v="Графические объекты">Графические объекты</button>
        <button class="choice" data-v="Другое">Другое</button>
      </div>
      <div class="bar"><button class="btn" id="back3">Назад</button><button class="btn" id="next3">Далее</button></div>
    </div>

    <div id="s4" hidden>
      <div class="title">Опишите ваше предложение</div>
      <label class="muted">Текст предложения</label>
      <textarea id="text" placeholder="Опишите улучшение…"></textarea>
      <div class="bar"><button class="btn" id="back4">Назад</button><button class="btn" id="send">Отправить</button></div>
      <p class="muted">Админка: <a class="link" href="/api/admin">/api/admin</a> · Ping: <a class="link" href="/api/ping">/api/ping</a></p>
    </div>
  </div></div>
  <script>
    const dots = [...document.querySelectorAll('#dots .dot')];
    const show = i => { ['s1','s2','s3','s4'].forEach((id,idx)=>{document.getElementById(id).hidden = idx!==i; dots[idx].classList.toggle('on', idx<=i);}); step=i;};
    const pick = (id) => {
      const box=document.getElementById(id);
      box.onclick = (e)=>{ if(e.target.classList.contains('choice')){ [...box.children].forEach(b=>b.classList.remove('sel')); e.target.classList.add('sel'); vals[id]=e.target.dataset.v; } };
    };
    let step=0, vals={};
    pick('who'); pick('product'); pick('topic');
    document.getElementById('next1').onclick = ()=> show(1);
    document.getElementById('back2').onclick = ()=> show(0);
    document.getElementById('next2').onclick = ()=> show(2);
    document.getElementById('back3').onclick = ()=> show(1);
    document.getElementById('next3').onclick = ()=> show(3);
    document.getElementById('back4').onclick = ()=> show(2);
    document.getElementById('send').onclick = async ()=>{
      const payload = {
        role: vals.who || 'user',
        product: vals.product || null,
        topic: vals.topic || null,
        text: document.getElementById('text').value.trim()
      };
      try{
        const r = await fetch('/api/suggestions',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
        if(r.ok){ alert('Спасибо! Ваше предложение отправлено.'); location.reload(); }
        else { alert('Ошибка: '+r.status+' '+await r.text()); }
      }catch(e){ alert('Сеть недоступна'); }
    };
    show(0);
  </script>
  </body></html>`;
  res.setHeader("content-type","text/html; charset=utf-8");
  res.status(200).send(html);
}
