export default async function handler(req, res) {
  const html = `<!doctype html><html lang="ru"><meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Tiger.com Feedback</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#0b1220;color:#e7ecf3;margin:0;padding:32px}
    .card{max-width:760px;margin:0 auto;background:#111a2b;border:1px solid #20304d;border-radius:16px;padding:24px;box-shadow:0 10px 30px rgba(0,0,0,.35)}
    h1{margin:0 0 2px;font-size:24px}
    .muted{color:#98a4b3}
    .row{display:flex;gap:12px;flex-wrap:wrap;margin:10px 0}
    .chip{padding:8px 12px;border:1px solid #2a3d63;border-radius:999px;cursor:pointer}
    .chip.sel{background:#1e2b47}
    textarea, input[type=text]{width:100%;background:#0c1527;border:1px solid #24365a;color:#e7ecf3;border-radius:12px;padding:12px;font-size:15px}
    textarea{min-height:140px;resize:vertical}
    .bar{display:flex;justify-content:space-between;align-items:center;margin-top:16px}
    button{background:#2563eb;border:none;color:#fff;border-radius:12px;padding:10px 16px;font-weight:600;cursor:pointer}
    button.secondary{background:#1f2a44}
    .steps{display:flex;gap:6px;margin-bottom:16px}
    .dot{width:8px;height:8px;border-radius:999px;background:#27385a}
    .dot.on{background:#5b7bd6}
    .badge{display:inline-flex;gap:8px;align-items:center;border:1px solid #2a3d63;border-radius:999px;padding:6px 10px;color:#98a4b3}
    a{color:#7aa2ff}
  </style>
  <div class="card">
    <div class="bar"><div><h1>Tiger.com Feedback</h1><div class="muted">Поделитесь предложением по продукту</div></div><div class="badge"><span id="roleBadge">Пользователь</span></div></div>
    <div class="steps" id="dots"><div class="dot on"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>

    <section id="s1">
      <div class="muted">Кто вы?</div>
      <div class="row" id="who">
        <div class="chip" data-v="user">Пользователь</div>
        <div class="chip" data-v="admin">Админ</div>
      </div>
      <div class="bar"><span></span><button id="next1">Далее</button></div>
    </section>

    <section id="s2" hidden>
      <div class="muted">Какой продукт?</div>
      <div class="row" id="product">
        <div class="chip" data-v="Tiger.com Windows">Tiger.com Windows</div>
        <div class="chip" data-v="Tiger.com Broker">Tiger.com Broker</div>
      </div>
      <div class="bar"><button class="secondary" id="back2">Назад</button><button id="next2">Далее</button></div>
    </section>

    <section id="s3" hidden>
      <div class="muted">Тема</div>
      <div class="row" id="topic">
        <div class="chip" data-v="Подключения">Подключения</div>
        <div class="chip" data-v="Стайки">Стайки</div>
        <div class="chip" data-v="Прочее">Прочее</div>
      </div>
      <div class="bar"><button class="secondary" id="back3">Назад</button><button id="next3">Далее</button></div>
    </section>

    <section id="s4" hidden>
      <div class="muted">Короткое название (до 120 символов)</div>
      <input type="text" id="title" placeholder="Например: Быстрый поиск по заявкам" maxlength="120"/>
      <div class="bar"><button class="secondary" id="back4">Назад</button><button id="next4">Далее</button></div>
    </section>

    <section id="s5" hidden>
      <div class="muted">Содержание предложения</div>
      <textarea id="text" placeholder="Опишите проблему/идею, ожидаемое поведение и пользу"></textarea>
      <div class="bar"><button class="secondary" id="back5">Назад</button><button id="send">Отправить предложение</button></div>
      <div class="muted" style="margin-top:12px">Админка: <a href="/api/admin">/api/admin</a> · Пинг: <a href="/api/ping">/api/ping</a></div>
    </section>
  </div>

<script>
  const dots=[...document.querySelectorAll('#dots .dot')];
  const show=i=>{['s1','s2','s3','s4','s5'].forEach((id,idx)=>{document.getElementById(id).hidden=idx!==i;dots[idx].classList.toggle('on',idx<=i)});step=i};
  const select=(id)=>{const box=document.getElementById(id);box.onclick=e=>{if(e.target.classList.contains('chip')){[...box.children].forEach(b=>b.classList.remove('sel'));e.target.classList.add('sel');vals[id]=e.target.dataset.v; if(id==='who') document.getElementById('roleBadge').textContent=(vals[id]==='admin'?'Админ':'Пользователь');}}};
  let step=0, vals={};
  select('who');select('product');select('topic');
  document.getElementById('next1').onclick=()=>show(1);
  document.getElementById('back2').onclick=()=>show(0);
  document.getElementById('next2').onclick=()=>show(2);
  document.getElementById('back3').onclick=()=>show(1);
  document.getElementById('next3').onclick=()=>show(3);
  document.getElementById('back4').onclick=()=>show(2);
  document.getElementById('next4').onclick=()=>show(4);
  document.getElementById('back5').onclick=()=>show(3);
  document.getElementById('send').onclick=async()=>{
    const payload={
      title:document.getElementById('title').value.trim(),
      text:document.getElementById('text').value.trim(),
      role:vals.who||'user',
      product:vals.product||null,
      topic:vals.topic||null
    };
    if(!payload.title){alert('Введите короткое название');return}
    if(!payload.text){alert('Опишите предложение');return}
    try{
      const r=await fetch('/api/suggestions',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
      if(r.ok){const j=await r.json(); alert('Спасибо! Создано #' + j.id + (j.jiraUrl? '\\nВ Jira: '+j.jiraUrl : '')); location.reload();}
      else{alert('Ошибка: '+r.status+' '+await r.text())}
    }catch(e){alert('Сеть недоступна')}
  };
  show(0);
</script>
</body></html>`;
  res.setHeader("content-type","text/html; charset=utf-8");
  res.status(200).send(html);
}
