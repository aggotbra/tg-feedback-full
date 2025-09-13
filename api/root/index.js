export default function handler(req, res) {
  const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Tiger.com Feedback</title>
<style>
  :root { --bg:#0a0f1a; --panel:#0f1729; --text:#dbe6ff; --muted:#8aa0c7; --accent:#3b82f6; --accent-2:#60a5fa; --chip:#1b2540; --chip-on:#2563eb; --error:#ef4444; }
  *{box-sizing:border-box} body{margin:0;font:16px/1.5 system-ui, -apple-system, Segoe UI, Roboto, sans-serif;color:var(--text);background:radial-gradient(1000px 600px at 20% -10%,#18233b,transparent),var(--bg)}
  .wrap{max-width:720px;margin:40px auto;padding:0 16px}
  .card{background:var(--panel);border:1px solid #1f2a44;border-radius:20px;padding:24px 24px 28px;box-shadow:0 10px 30px rgba(0,0,0,.35)}
  h1{margin:0 0 8px 0;font-size:28px;letter-spacing:.2px}
  .muted{color:var(--muted)}
  /* точки прогресса — отодвинуты дальше от подзаголовка */
  #dots{display:flex;gap:8px;margin:12px 0 20px} 
  .dot{width:8px;height:8px;border-radius:50%;background:#223152;opacity:.6}
  .dot.on{background:var(--accent);opacity:1}

  .row{display:flex;gap:12px;flex-wrap:wrap}
  .chip{background:var(--chip);color:#c9dafd;border:1px solid #263356;padding:10px 14px;border-radius:12px;cursor:pointer;user-select:none;transition:.15s}
  .chip:hover{transform:translateY(-1px)}
  .chip.sel{background:var(--chip-on);border-color:#2a53b7;color:white}
  .pill{display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border-radius:999px;border:1px solid #253458;background:#11203e;color:#9eb7ea;font-size:12px}

  label{display:block;margin:0 0 8px 2px;color:#9fb3d9}
  input[type="text"], textarea{width:100%;background:#0e1930;border:1px solid #213154;color:var(--text);padding:12px 14px;border-radius:12px;outline:none}
  input[type="text"]:focus, textarea:focus{border-color:#2c5de5;box-shadow:0 0 0 3px rgba(60,120,255,.15)}
  textarea{min-height:140px;resize:vertical}

  .actions{display:flex;gap:12px;margin-top:18px}
  button{appearance:none;border:none;border-radius:12px;padding:12px 16px;cursor:pointer;font-weight:600}
  .btn{background:linear-gradient(180deg,#3b82f6,#2563eb);color:#fff}
  .btn:disabled{opacity:.55;cursor:not-allowed}
  .ghost{background:#162137;color:#aec2ef;border:1px solid #24365f}

  .hint{font-size:13px;color:#89a2d6;margin-top:8px}
  .err{color:var(--error);font-size:14px;margin-top:10px}
  .sp-lg{margin-top:16px}
  .sp-xl{margin-top:22px}
  .hidden{display:none}

  /* расстояния, о которых просил */
  /* Страница 4: прямоугольник-инпут ниже заголовка */
  #titleInput{margin-top:12px}
  /* Страница 5: поле текста дальше от заголовка */
  #textInput{margin-top:12px}
</style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="row" style="justify-content:space-between;align-items:center">
        <h1>Tiger.com Feedback</h1>
        <span class="pill"><span id="roleBadge">Пользователь</span></span>
      </div>
      <div class="muted">Поделитесь предложением по продукту</div>

      <div id="dots" aria-hidden="true">
        <div class="dot on"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>

      <!-- Шаг 1 -->
      <section id="s1">
        <label>Кто вы?</label>
        <div id="who" class="row sp-lg">
          <div class="chip" data-v="user">Пользователь</div>
          <div class="chip" data-v="admin">Админ</div>
        </div>
        <div class="actions sp-xl">
          <button class="btn" id="next1">Далее</button>
        </div>
      </section>

      <!-- Шаг 2 -->
      <section id="s2" class="hidden">
        <label>Выберите продукт</label>
        <div id="product" class="row sp-lg">
          <div class="chip" data-v="Tiger.com Windows">Tiger.com Windows</div>
          <div class="chip" data-v="Tiger.com macOS">Tiger.com macOS</div>
          <div class="chip" data-v="Tiger.com Broker">Tiger.com Broker</div>
        </div>
        <div class="actions sp-xl">
          <button class="ghost" id="back2">Назад</button>
          <button class="btn"   id="next2">Далее</button>
        </div>
      </section>

      <!-- Шаг 3 -->
      <section id="s3" class="hidden">
        <label>Выберите категорию</label>
        <div id="topic" class="row sp-lg"></div>
        <div id="otherBox" class="hidden sp-lg">
          <label>Введите вашу категорию</label>
          <input type="text" id="otherInput" placeholder="Например: Обучение / Горячие клавиши"/>
        </div>
        <div class="err hidden" id="topicErr">Пожалуйста, выберите категорию</div>
        <div class="actions sp-xl">
          <button class="ghost" id="back3">Назад</button>
          <button class="btn"   id="next3">Далее</button>
        </div>
      </section>

      <!-- Шаг 4 -->
      <section id="s4" class="hidden">
        <label>Введите краткое название вашего предложения</label>
        <input type="text" id="titleInput" maxlength="100" placeholder="Например: Быстрый поиск по заявкам"/>
        <div class="hint" id="titleCounter">0 / 100</div>
        <div class="err hidden" id="titleErr">Пожалуйста, введите название</div>
        <div class="actions sp-xl">
          <button class="ghost" id="back4">Назад</button>
          <button class="btn"   id="next4">Далее</button>
        </div>
      </section>

      <!-- Шаг 5 -->
      <section id="s5" class="hidden">
        <label>Содержание предложения</label>
        <textarea id="textInput" placeholder="Опишите идею. Что улучшит? Как понять, что получилось?"></textarea>
        <div class="err hidden" id="textErr">Пожалуйста, опишите предложение</div>
        <div class="actions sp-xl">
          <button class="ghost" id="back5">Назад</button>
          <button class="btn"   id="send">Отправить предложение</button>
        </div>
      </section>

      <!-- Шаг 6 (Спасибо) -->
      <section id="s6" class="hidden">
        <h2 style="margin:0 0 10px">Спасибо!</h2>
        <div class="muted">Уведомление о вашем предложении уже отправлено нашей команде, а пользователи смогут посмотреть его в канале.</div>
        <div class="actions sp-xl">
          <button class="btn" id="again">Отправить ещё</button>
        </div>
      </section>

    </div>
  </div>

<script>
  // Справочники тем
  const TOPICS = {
    "Tiger.com Windows": ["Стакан","График","Котировки","Подключения","Кастомизация","Индикаторы","Графические объекты","Другое"],
    "Tiger.com macOS":   ["Стакан","График","Котировки","Подключения","Кастомизация","Индикаторы","Графические объекты","Другое"],
    "Tiger.com Broker":  ["Риск-менеджер","Субаккаунты","TigerX","Плечо","Депозит","Вывод","Безопасность","Кастомизация"]
  };

  const dots=[...document.querySelectorAll('#dots .dot')];
  const show=i=>{
    ['s1','s2','s3','s4','s5','s6'].forEach((id,idx)=>{
      const el=document.getElementById(id);
      el.classList.toggle('hidden', idx!==i);
      if(idx<5) dots[idx].classList.toggle('on', idx<=i);
    });
    step=i;
  };

  // Выбор-один helper
  const select=(id)=>{ const box=document.getElementById(id);
    box.onclick=e=>{
      if(!e.target.classList.contains('chip')) return;
      [...box.children].forEach(b=>b.classList.remove('sel'));
      e.target.classList.add('sel');
      vals[id]=e.target.dataset.v;
      if(id==='who') document.getElementById('roleBadge').textContent = (vals[id]==='admin'?'Админ':'Пользователь');
      if(id==='product'){ populateTopics(vals.product); }
      if(id==='topic'){ handleTopicChange(); }
    };
  };

  // Топики по продукту
  function populateTopics(product){
    const box=document.getElementById('topic');
    box.innerHTML='';
    const list = TOPICS[product] || [];
    list.forEach(name=>{
      const div=document.createElement('div');
      div.className='chip';
      div.dataset.v=name;
      div.textContent=name;
      box.appendChild(div);
    });
    vals.topic=null;
    document.getElementById('otherBox').classList.add('hidden');
    document.getElementById('otherInput').value='';
  }

  function handleTopicChange(){
    const other = vals.topic === 'Другое';
    document.getElementById('otherBox').classList.toggle('hidden', !other);
  }

  // Валидации
  function needTopic(){
    const err = document.getElementById('topicErr');
    const other = vals.topic === 'Другое';
    if(!vals.topic){ err.classList.remove('hidden'); return false; }
    if(other){
      const v = document.getElementById('otherInput').value.trim();
      if(!v){ err.textContent = 'Введите вашу категорию'; err.classList.remove('hidden'); return false; }
      vals.topic = v; // подменяем выбранной пользовательской
    }
    err.textContent='Пожалуйста, выберите категорию';
    err.classList.add('hidden');
    return true;
  }

  function needTitle(){
    const t = document.getElementById('titleInput').value.trim();
    const err = document.getElementById('titleErr');
    if(!t){ err.classList.remove('hidden'); return false; }
    vals.title=t.slice(0,100);
    err.classList.add('hidden');
    return true;
  }

  function needText(){
    const t = document.getElementById('textInput').value.trim();
    const err = document.getElementById('textErr');
    if(!t){ err.classList.remove('hidden'); return false; }
    vals.text=t;
    err.classList.add('hidden');
    return true;
  }

  // Счётчик символов для title
  const titleInput = document.getElementById('titleInput');
  const titleCounter = document.getElementById('titleCounter');
  titleInput.addEventListener('input', ()=>{ titleCounter.textContent = \`\${titleInput.value.length} / 100\`; });

  // Навигация
  let step=0, vals={who:'user'};
  select('who'); select('product'); select('topic');
  document.getElementById('next1').onclick = ()=>show(1);
  document.getElementById('back2').onclick = ()=>show(0);
  document.getElementById('next2').onclick = ()=>show(2);
  document.getElementById('back3').onclick = ()=>show(1);
  document.getElementById('next3').onclick = ()=>{ if(needTopic()) show(3); };
  document.getElementById('back4').onclick = ()=>show(2);
  document.getElementById('next4').onclick = ()=>{ if(needTitle()) show(4); };
  document.getElementById('back5').onclick = ()=>show(3);

  // Отправка
  document.getElementById('send').onclick = async ()=>{
    if(!needText()) return;
    const payload={
      role: vals.who || 'user',
      product: vals.product || null,
      topic: vals.topic || null,
      title: vals.title || '',
      text: vals.text || '',
      username: null
    };
    try{
      const r=await fetch('/api/suggestions',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
      if(r.ok){ show(5); }
      else{
        const t=await r.text().catch(()=>r.statusText);
        alert('Ошибка: '+r.status+' '+t);
      }
    }catch(e){
      alert('Сеть недоступна');
    }
  };

  document.getElementById('again').onclick = ()=>{ vals={who:'user'}; document.getElementById('roleBadge').textContent='Пользователь'; ['product','topic'].forEach(id=>{document.getElementById(id).innerHTML=''}); document.getElementById('otherInput').value=''; titleInput.value=''; titleCounter.textContent='0 / 100'; document.getElementById('textInput').value=''; show(0); };
  show(0);
</script>
</body></html>`;
  res.setHeader("content-type","text/html; charset=utf-8");
  res.status(200).send(html);
}
