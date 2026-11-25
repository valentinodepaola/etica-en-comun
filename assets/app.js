(function(){
  const $ = (s, r=document) => r.querySelector(s);
  const store = {
    get(k){ try { return localStorage.getItem(k); } catch(e){ return null; } },
    set(k,v){ try { localStorage.setItem(k,v); } catch(e){} }
  };
  function el(tag, attrs, text){
    const n = document.createElement(tag);
    if (attrs) for (const [k,v] of Object.entries(attrs)) { if (k === 'class') n.className = v; else n.setAttribute(k, v); }
    if (text != null) n.textContent = text;
    return n;
  }
  function shuffle(a){ a = a.slice(); for (let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

  if (document.querySelector('#memo')) {
  /* ---------- Memorama (11) ---------- */
  const pairs = [
    {id:12, art:'Art. 12', name:'Vida privada', sit:'Una app te pide tu domicilio y la ocupación de tus padres para prestarte un libro.'},
    {id:2,  art:'Art. 2',  name:'Sin distinción', sit:'No aceptan a una estudiante en un equipo por su origen étnico.'},
    {id:19, art:'Art. 19', name:'Opinión y expresión', sit:'Borran la publicación de un alumno por criticar con respeto una decisión de la escuela.'},
    {id:23, art:'Art. 23', name:'Trabajo y salario igual', sit:'Dos personas hacen el mismo trabajo y a una le pagan menos por ser mujer.'},
    {id:25, art:'Art. 25', name:'Nivel de vida y salud', sit:'Una familia no puede recibir atención médica cuando la necesita.'},
    {id:26, art:'Art. 26', name:'Educación', sit:'No inscriben a un niño en la primaria porque su familia no puede pagar.'}
  ];
  const memo = $('#memo'), memoStatus = $('#memo-status');
  let open = [], matched = 0, tries = 0, lock = false;
  function memoStatusText(){ memoStatus.textContent = matched === 6 ? `Completaste las 6 parejas en ${tries} intentos` : `${matched} de 6 parejas, ${tries} intentos`; }
  function buildMemo(){
    memo.textContent = ''; open = []; matched = 0; tries = 0; lock = false;
    const cards = shuffle(pairs.flatMap(p => [{p, kind:'sit'}, {p, kind:'art'}]));
    cards.forEach((c, i) => {
      const b = el('button', {class:'card', type:'button', 'aria-label':`Tarjeta ${i+1}, boca abajo`});
      b.dataset.id = c.p.id;
      const back = el('span', {class:'back'}, 'DUDH');
      const face = el('span', {class:'face'});
      if (c.kind === 'sit') { face.append(el('span',{class:'tag'},'Situación'), el('span',{class:'txt'}, c.p.sit)); }
      else { face.append(el('span',{class:'tag'},'Artículo'), el('span',{class:'art'}, c.p.art), el('span',{class:'txt'}, c.p.name)); }
      b.append(back, face);
      b.addEventListener('click', () => flip(b, c));
      memo.append(b);
    });
    memoStatusText();
  }
  function flip(b, c){
    if (lock || b.classList.contains('up') || b.classList.contains('done')) return;
    b.classList.add('up');
    b.setAttribute('aria-label', c.kind === 'sit' ? `Situación: ${c.p.sit}` : `${c.p.art}: ${c.p.name}`);
    open.push(b);
    if (open.length < 2) return;
    tries++;
    const [a, d] = open;
    if (a.dataset.id === d.dataset.id) {
      a.classList.replace('up','done'); d.classList.replace('up','done'); matched++; open = [];
      memoStatusText();
    } else {
      lock = true; a.classList.add('miss'); d.classList.add('miss'); memoStatusText();
      setTimeout(() => { [a,d].forEach(x => { x.classList.remove('up','miss'); x.setAttribute('aria-label','Tarjeta boca abajo'); }); open = []; lock = false; }, 1100);
    }
  }
  $('#memo-reset').addEventListener('click', buildMemo);
  buildMemo();

  }
  if (document.querySelector('#cit')) {
  /* ---------- Test ciudadano (12) ---------- */
  const types = {
    R:{name:'Personalmente responsable', desc:'Cumples, ayudas y respetas las reglas. Tu aporte es constante y confiable. Para dar el siguiente paso, prueba sumarte a algo organizado con más personas.'},
    P:{name:'Participativo', desc:'Te involucras y organizas a otros. Tus redes de confianza son tu fuerza. Para dar el siguiente paso, pregúntate por qué existe el problema que estás resolviendo.'},
    J:{name:'Orientado a la justicia', desc:'Buscas las causas de los problemas y quieres cambiar las reglas que los producen. Para que tus propuestas avancen, necesitas redes que tiendan puentes con gente distinta a ti.'}
  };
  const citQs = [
    {q:'Tu universidad organiza una colecta de alimentos.', o:[['R','Dono algunas latas.'],['P','Me ofrezco para organizar la colecta en mi salón.'],['J','Investigo por qué hay estudiantes que no tienen para comer.']]},
    {q:'Una calle de tu colonia lleva meses sin alumbrado.', o:[['R','Evito pasar de noche y aviso a mis vecinos que tengan cuidado.'],['P','Convoco a una junta de vecinos para comprar lámparas.'],['J','Averiguo por qué la calle no está en el programa municipal y presento una solicitud con firmas.']]},
    {q:'El parque cerca de tu casa siempre está lleno de basura.', o:[['R','Recojo mi basura y la de mi familia.'],['P','Organizo una jornada de limpieza con amigos.'],['J','Pido al municipio contenedores y pregunto por qué no pasa la recolección.']]},
    {q:'Hay elecciones de la sociedad de alumnos.', o:[['R','Me informo y voto.'],['P','Me uno a una planilla o ayudo a organizar un debate.'],['J','Reviso qué reglas dejan fuera a ciertos estudiantes y propongo cambiarlas.']]},
    {q:'Un compañero en silla de ruedas no puede entrar a uno de los salones.', o:[['R','Le ayudo a subir cada vez que lo necesita.'],['P','Me pongo de acuerdo con el grupo para pedir que la clase cambie de salón.'],['J','Solicito por escrito una rampa y una revisión de accesibilidad de todo el edificio.']]}
  ];
  const cit = $('#cit'), citRes = $('#cit-result'), citStatus = $('#cit-status');
  let citAns = {};
  function buildCit(){
    cit.textContent = ''; citAns = {}; citRes.hidden = true; citStatus.textContent = '0 de 5 respondidas';
    citQs.forEach((item, i) => {
      const q = el('div',{class:'q'});
      const t = el('p',{class:'q-title'}); t.append(el('span',{class:'q-num'}, `${i+1}/5`), document.createTextNode(item.q));
      const opts = el('div',{class:'opts stack', role:'group', 'aria-label':item.q});
      shuffle(item.o).forEach(([k, txt]) => {
        const b = el('button',{class:'opt', type:'button', 'aria-pressed':'false'}, txt);
        b.addEventListener('click', () => {
          opts.querySelectorAll('.opt').forEach(x => x.setAttribute('aria-pressed','false'));
          b.setAttribute('aria-pressed','true'); citAns[i] = k; renderCit();
        });
        opts.append(b);
      });
      q.append(t, opts); cit.append(q);
    });
  }
  function renderCit(){
    const n = Object.keys(citAns).length;
    citStatus.textContent = `${n} de 5 respondidas`;
    if (n < 5) { citRes.hidden = true; return; }
    const c = {R:0,P:0,J:0}; Object.values(citAns).forEach(k => c[k]++);
    const max = Math.max(c.R,c.P,c.J);
    const top = ['R','P','J'].filter(k => c[k] === max);
    citRes.textContent = '';
    citRes.append(el('p',{class:'eyebrow'},'Tu resultado'));
    citRes.append(el('h3',null, top.map(k => types[k].name).join(' y ')));
    top.forEach(k => citRes.append(el('p',null, types[k].desc)));
    const bars = el('div',{class:'bars'});
    ['R','P','J'].forEach(k => {
      const row = el('div',{class:'bar'});
      const i = el('i'); i.style.width = (c[k]/5*100) + '%';
      const track = el('span'); track.append(i);
      row.append(el('span',null, types[k].name), track, el('b',null, String(c[k])));
      bars.append(row);
    });
    citRes.append(bars);
    citRes.hidden = false;
  }
  $('#cit-reset').addEventListener('click', buildCit);
  buildCit();

  }
  /* ---------- Generic classify quiz ---------- */
  function classify({root, status, total, items, choices, label}){
    let done = 0, ok = 0;
    root.textContent = '';
    const upd = () => status.textContent = `${done} de ${total}, ${ok} aciertos`;
    shuffle(items).forEach((it, i) => {
      const q = el('div',{class:'q'});
      const t = el('p',{class:'q-title'}); t.append(el('span',{class:'q-num'}, `${i+1}/${total}`), document.createTextNode(it.t));
      const opts = el('div',{class:'opts', role:'group', 'aria-label':label});
      const fb = el('p',{class:'fb', 'aria-live':'polite'});
      choices.forEach(ch => {
        const b = el('button',{class:'opt', type:'button'}, ch);
        b.addEventListener('click', () => {
          if (q.dataset.answered) return;
          q.dataset.answered = '1'; done++;
          const right = ch === it.a;
          if (right) ok++;
          opts.querySelectorAll('.opt').forEach(x => { x.disabled = true; if (x.textContent === it.a) x.classList.add('right'); });
          if (!right) b.classList.add('wrong');
          fb.className = 'fb ' + (right ? 'ok' : 'no');
          fb.textContent = (right ? 'Correcto. ' : `Es ${it.a.toLowerCase()}. `) + it.why;
          upd();
        });
        opts.append(b);
      });
      q.append(t, opts, fb); root.append(q);
    });
    upd();
  }

  if (document.querySelector('#exc')) {
  /* ---------- Exclusión (13) ---------- */
  const excItems = [
    {t:'En el chat del equipo nadie le responde a la nueva integrante y no la invitan a las reuniones informales.', a:'Abandono', why:'No la atacan, simplemente la ignoran y la dejan sola.'},
    {t:'A un compañero le dicen que puede quedarse en el equipo si deja de hablar con su acento.', a:'Asimilación', why:'Lo aceptan solo si deja de ser distinto.'},
    {t:'Las decisiones técnicas siempre las toman los mismos dos; al resto solo le toca ejecutar.', a:'Dominación', why:'Los demás se quedan en una posición inferior de forma permanente.'},
    {t:'Sacan a una persona del proyecto por su religión.', a:'Eliminación', why:'Se le expulsa por ser quien es.'},
    {t:'Una familia migrante pide información en la colonia y los vecinos fingen no escucharla.', a:'Abandono', why:'Se le niega la atención y se le deja sola.'},
    {t:'En una empresa, las personas indígenas solo pueden ocupar puestos de limpieza.', a:'Dominación', why:'Se les mantiene abajo en la jerarquía.'},
    {t:'Una escuela acepta a estudiantes de comunidades indígenas solo si dejan de hablar su lengua materna.', a:'Asimilación', why:'La condición para entrar es borrar la diferencia.'},
    {t:'Un grupo de vecinos presiona a una familia hasta que se va de la cuadra.', a:'Eliminación', why:'El objetivo es sacarla del espacio común.'}
  ];
  const excCfg = {root:$('#exc'), status:$('#exc-status'), total:8, items:excItems, choices:['Eliminación','Asimilación','Dominación','Abandono'], label:'Formas de exclusión'};
  $('#exc-reset').addEventListener('click', () => classify(excCfg));
  classify(excCfg);

  }
  if (document.querySelector('#ben')) {
  /* ---------- Bennett (14) ---------- */
  const benItems = [
    {t:'“No conozco a nadie de otra cultura y no veo para qué.”', a:'Negación', why:'La diferencia cultural ni siquiera aparece en el radar.'},
    {t:'“Nuestra forma de trabajar es la correcta; los demás deberían adaptarse.”', a:'Defensa', why:'La diferencia se ve como amenaza y la cultura propia como superior.'},
    {t:'“En el fondo todos somos iguales, así que las diferencias culturales no importan.”', a:'Minimización', why:'Se reconoce la diferencia pero se le resta importancia.'},
    {t:'“Entiendo que otras culturas tienen valores distintos y que tienen sentido en su contexto.”', a:'Aceptación', why:'La diferencia se reconoce y se respeta. Es la primera etapa etnorrelativa.'},
    {t:'“Cambio mi forma de dar retroalimentación según con quién hablo.”', a:'Adaptación', why:'Ajusto mi conducta a otra perspectiva cultural.'},
    {t:'“Me muevo entre dos culturas y las dos forman parte de quien soy.”', a:'Integración', why:'La identidad incluye más de una perspectiva cultural.'}
  ];
  classify({root:$('#ben'), status:$('#ben-status'), total:6, items:benItems, choices:['Negación','Defensa','Minimización','Aceptación','Adaptación','Integración'], label:'Etapas de Bennett'});
  const story = $('#story');
  story.value = store.get('etica-story') || '';
  story.addEventListener('input', () => store.set('etica-story', story.value));

  }
  if (document.querySelector('#planets')) {
  /* ---------- Compromiso (15) ---------- */
  const planets = $('#planets'), change = $('#change');
  planets.value = store.get('etica-planets') || '';
  change.value = store.get('etica-change') || '';
  function renderPledge(){
    store.set('etica-planets', planets.value); store.set('etica-change', change.value);
    const p = parseFloat(planets.value);
    $('#pledge-num').textContent = isFinite(p) && p > 0 ? `${p.toLocaleString('es-MX',{maximumFractionDigits:1})} ${p === 1 ? 'planeta' : 'planetas'}` : '— planetas';
    const txt = change.value.trim();
    const t = $('#pledge-text');
    if (isFinite(p) && p > 0 && txt) {
      t.className = '';
      t.textContent = (p > 1 ? `Si todos vivieran como yo, harían falta ${p.toLocaleString('es-MX',{maximumFractionDigits:1})} Tierras. ` : 'Mi estilo de vida cabe en un planeta, y quiero mantenerlo así. ') + `Este mes me comprometo a: ${txt}.`;
    } else { t.className = 'note'; t.textContent = 'Completa los dos campos para ver tu compromiso.'; }
  }
  planets.addEventListener('input', renderPledge); change.addEventListener('input', renderPledge);
  renderPledge();

    }

  /* ---------- Comentarios (GitHub Issues) ---------- */
  const form = document.getElementById('comment-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#c-name').value.trim();
      const topic = $('#c-topic').value.trim();
      const text = $('#c-text').value.trim();
      const msg = $('#c-msg');
      if (!text) { msg.textContent = 'Escribe tu comentario antes de publicarlo.'; $('#c-text').focus(); return; }
      const title = 'Comentario' + (topic ? ': ' + topic : '') + (name ? ' (' + name + ')' : '');
      const body = text + (name ? '\n\n— ' + name : '');
      const url = 'https://github.com/valentinodepaola/etica-en-comun/issues/new?labels=comentario&title=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(body);
      window.open(url, '_blank', 'noopener');
      msg.textContent = 'Se abrió GitHub en otra pestaña. Revisa el texto y pulsa "Create" para publicarlo.';
    });
  }
})();
