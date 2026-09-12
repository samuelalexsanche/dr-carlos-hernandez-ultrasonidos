/* ═══════════════════════════════════════════════════════════════════════
   Dr. Carlos Hernández · Ultrasonidos
   Movimiento: un solo lenguaje — todo "se resuelve del moteado",
   igual que una imagen de ultrasonido al pasar el haz.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HAS_ANIME = typeof window.anime === 'function';
  var WA = '523313182911';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ─────────────────────────────────────────────────────────────────
     Utilidad: anima desenfoque + opacidad + desplazamiento por proxy.
     Anime.js no interpola `filter`, así que animamos objetos planos
     y escribimos el estilo en cada frame.
     ───────────────────────────────────────────────────────────────── */
  function resolveIn(els, opts) {
    opts = opts || {};
    if (!els.length) return null;

    if (REDUCED || !HAS_ANIME) {
      els.forEach(function (el) { el.style.cssText += ';opacity:1;filter:none;transform:none;'; });
      return null;
    }

    var proxies = els.map(function () {
      return { b: opts.blur == null ? 12 : opts.blur, o: 0, y: opts.y == null ? 14 : opts.y };
    });

    return anime({
      targets: proxies,
      b: 0, o: 1, y: 0,
      duration: opts.duration || 900,
      delay: anime.stagger(opts.stagger == null ? 70 : opts.stagger, { start: opts.start || 0 }),
      easing: opts.easing || 'easeOutQuart',
      update: function () {
        for (var i = 0; i < els.length; i++) {
          var p = proxies[i], s = els[i].style;
          s.filter = p.b < 0.06 ? 'none' : 'blur(' + p.b.toFixed(2) + 'px)';
          s.opacity = p.o;
          s.transform = p.y < 0.06 ? 'none' : 'translateY(' + p.y.toFixed(2) + 'px)';
        }
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     1. HÉROE — cono sectorial, campo de moteado y barrido
     ═══════════════════════════════════════════════════════════════ */
  var APEX_X = 600, APEX_Y = 40, HALF_ANGLE = 38;

  function buildSpeckle() {
    var g = $('#speckleField');
    if (!g) return [];
    var frag = document.createDocumentFragment();
    var nodes = [];

    for (var i = 0; i < 240; i++) {
      // Distribución dentro del sector: ángulo uniforme, profundidad sesgada
      var a = (Math.random() * 2 - 1) * HALF_ANGLE * Math.PI / 180;
      var r = 60 + Math.pow(Math.random(), 0.62) * 720;
      var x = APEX_X + r * Math.sin(a);
      var y = APEX_Y + r * Math.cos(a);

      var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', x.toFixed(1));
      c.setAttribute('cy', y.toFixed(1));
      c.setAttribute('r', (0.6 + Math.random() * 1.9).toFixed(2));
      c.setAttribute('fill', Math.random() > 0.78 ? '#F6D9A0' : '#E8A33D');
      c.setAttribute('opacity', '0');
      frag.appendChild(c);
      nodes.push(c);
    }
    g.appendChild(frag);
    return nodes;
  }

  function buildDepthArcs() {
    var g = $('#depthArcs');
    if (!g) return;
    var radii = [190, 330, 470, 610, 750];
    var a = HALF_ANGLE * Math.PI / 180;

    radii.forEach(function (r) {
      var x1 = APEX_X - r * Math.sin(a), y1 = APEX_Y + r * Math.cos(a);
      var x2 = APEX_X + r * Math.sin(a), y2 = APEX_Y + r * Math.cos(a);
      var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) +
                          ' A' + r + ' ' + r + ' 0 0 1 ' + x2.toFixed(1) + ' ' + y2.toFixed(1));
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', '#F6D9A0');
      p.setAttribute('stroke-width', '0.9');
      p.setAttribute('opacity', '0.14');
      g.appendChild(p);
    });
  }

  function buildDopplerTrace() {
    var path = $('#dopplerTrace');
    if (!path) return;

    var BASE = 70, PERIOD = 150, BLOCK = 900, STEP = 2, d = '';

    // Un solo bloque de 900 px (6 periodos exactos) con su ruido.
    var block = [];
    for (var x = 0; x < BLOCK; x += STEP) {
      var t = (x % PERIOD) / PERIOD, y;

      if (t < 0.10) {                       // sístole: ascenso rápido
        y = BASE - 56 * Math.pow(t / 0.10, 0.75);
      } else if (t < 0.34) {                // descenso
        y = BASE - 56 * Math.pow(1 - (t - 0.10) / 0.24, 1.5);
      } else if (t < 0.44) {                // muesca dícrota
        y = BASE - 13 * Math.sin((t - 0.34) / 0.10 * Math.PI);
      } else {                              // diástole
        y = BASE - 6 * Math.exp(-(t - 0.44) * 7);
      }
      y += (Math.random() - 0.5) * 1.4;     // ruido espectral
      block.push(y);
    }

    // El bucle desplaza exactamente 900 px, así que el trazo tiene que ser
    // ese mismo bloque dos veces: si el ruido se regenera, la repetición
    // no coincide y el salto del bucle se ve.
    for (var i = 0; i <= BLOCK; i++) {
      d += (i === 0 ? 'M' : 'L') + (i * STEP) + ' ' + block[i % block.length].toFixed(1);
    }
    path.setAttribute('d', d);
  }

  function heroSequence() {
    var speckle = buildSpeckle();
    buildDepthArcs();
    buildDopplerTrace();

    var words   = $$('.hero__title .w');
    var kicker  = $('#heroKicker');
    var lede    = $('#heroLede');
    var actions = $('#heroActions');
    var sweep   = $('#sweepGroup');
    var arcs    = $('#depthArcs');
    var trace   = $('#dopplerTrace');

    if (REDUCED || !HAS_ANIME) {
      words.forEach(function (w) { w.style.cssText += ';opacity:1;filter:none;'; });
      speckle.forEach(function (c) { c.setAttribute('opacity', '0.32'); });
      if (arcs) arcs.setAttribute('opacity', '1');
      return;
    }

    // Estado inicial
    [kicker, lede, actions].forEach(function (el) {
      if (el) { el.style.opacity = '0'; el.style.transform = 'translateY(12px)'; }
    });
    if (sweep) sweep.style.opacity = '0';

    // El bucle se crea al terminar la pasada inicial: si se crea antes,
    // las dos animaciones escriben sobre #sweepGroup en el mismo frame y
    // gana la última, que se queda en su valor de arranque durante su delay.
    var tl = anime.timeline({
      easing: 'easeOutQuart',
      complete: function () { loopSweep(); }
    });

    // El haz aparece y hace su primera pasada completa
    tl.add({
      targets: sweep,
      opacity: [0, 1],
      rotate: [-HALF_ANGLE, HALF_ANGLE],
      duration: 2100,
      easing: 'easeInOutSine'
    })
    // El tejido se ilumina a su paso
    .add({
      targets: arcs,
      opacity: [0, 1],
      duration: 900
    }, 600)
    .add({
      targets: speckle,
      opacity: [0, function () { return 0.16 + Math.random() * 0.3; }],
      duration: 1100,
      delay: anime.stagger(3, { from: 'center' })
    }, 500)
    // El titular se resuelve del desenfoque, palabra por palabra
    .add({
      targets: kicker,
      opacity: [0, 1], translateY: [12, 0], duration: 700
    }, 750);

    resolveIn(words, { blur: 16, y: 18, stagger: 78, start: 0, duration: 1000, easing: 'easeOutExpo' });
    setTimeout(function () {
      resolveIn([lede], { blur: 6, y: 12, duration: 800 });
      resolveIn([actions], { blur: 0, y: 14, duration: 700, start: 120 });
    }, 1450);

    // El haz sigue barriendo, ya en segundo plano
    function loopSweep() {
      anime({
        targets: sweep,
        rotate: [HALF_ANGLE, -HALF_ANGLE],
        opacity: 0.42,
        duration: 5200,
        delay: 300,
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutSine'
      });
    }

    // La traza Doppler se dibuja y luego corre en bucle continuo
    if (trace) {
      anime({
        targets: trace,
        strokeDashoffset: [anime.setDashoffset, 0],
        duration: 2600,
        delay: 900,
        easing: 'easeInOutSine',
        complete: function () {
          trace.style.strokeDasharray = 'none';
          anime({
            targets: trace,
            translateX: [0, -900],
            duration: 9000,
            loop: true,
            easing: 'linear'
          });
        }
      });
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     2. Revelado de encabezados: un haz recorre el título
     ═══════════════════════════════════════════════════════════════ */
  function headingWipes() {
    var heads = $$('.wipe');
    if (!heads.length) return;

    if (REDUCED || !HAS_ANIME) {
      $$('.wipe__text').forEach(function (t) { t.style.transform = 'none'; });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);

        var text = $('.wipe__text', e.target);
        var beam = $('.wipe__beam', e.target);
        var w = e.target.offsetWidth;

        anime.timeline({ easing: 'easeOutQuart' })
          .add({ targets: beam, opacity: [0, 1], translateX: [0, 0], duration: 160 })
          .add({ targets: beam, translateX: [0, w], duration: 620, easing: 'easeInOutQuad' }, 0)
          .add({ targets: text, translateY: ['105%', '0%'], duration: 720 }, 120)
          .add({ targets: beam, opacity: [1, 0], duration: 240 }, 560);
      });
    }, { threshold: 0.35, rootMargin: '0px 0px -8% 0px' });

    heads.forEach(function (h) { io.observe(h); });
  }

  /* ═══════════════════════════════════════════════════════════════
     3. Navegación
     ═══════════════════════════════════════════════════════════════ */
  function nav() {
    var bar = $('#nav'), toggle = $('#navToggle'), drawer = $('#navDrawer');

    var onScroll = function () { bar.classList.toggle('is-stuck', window.scrollY > 40); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (!toggle || !drawer) return;

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Abrir menú' : 'Cerrar menú');

      if (open) {
        drawer.hidden = true;
      } else {
        drawer.hidden = false;
        bar.classList.add('is-stuck');
        if (!REDUCED && HAS_ANIME) {
          anime({ targets: $$('a', drawer), opacity: [0, 1], translateX: [-10, 0], duration: 340, delay: anime.stagger(38), easing: 'easeOutQuart' });
        }
      }
    });

    drawer.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        drawer.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     4. Catálogo: filtro y búsqueda
     ═══════════════════════════════════════════════════════════════ */
  function catalog() {
    var list = $('#catalog');
    if (!list) return;

    var items  = $$('.study', list);
    var chips  = $$('.chipset [data-filter]');
    var search = $('#studySearch');
    var count  = $('#catalogCount');
    var empty  = $('#catalogEmpty');
    var group  = 'todos';

    function apply() {
      var q = (search && search.value || '').trim().toLowerCase();
      var shown = [];

      items.forEach(function (li) {
        var okGroup = group === 'todos' || li.dataset.group === group;
        var okText  = !q || li.textContent.toLowerCase().indexOf(q) !== -1;
        var ok = okGroup && okText;
        li.classList.toggle('is-hidden', !ok);
        if (ok) shown.push(li);
      });

      count.textContent = shown.length === 29
        ? 'Mostrando los 29 estudios'
        : shown.length === 1
          ? 'Mostrando 1 estudio'
          : 'Mostrando ' + shown.length + ' estudios';

      empty.hidden = shown.length > 0;
      resolveIn(shown, { blur: 9, y: 10, stagger: 16, duration: 520 });
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) {
          c.classList.remove('is-on');
          c.setAttribute('aria-pressed', 'false');
        });
        chip.classList.add('is-on');
        chip.setAttribute('aria-pressed', 'true');
        group = chip.dataset.filter;
        apply();
      });
    });

    if (search) {
      var timer;
      search.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(apply, 140);
      });
    }

    // Clic en un estudio → lo carga en el formulario de citas
    items.forEach(function (li) {
      $('.study__btn', li).addEventListener('click', function () {
        var select = $('#bkStudy');
        if (select) {
          select.value = li.dataset.id;
          select.dispatchEvent(new Event('change'));
        }
        goToStep(1);
        var target = document.getElementById('agendar');
        if (target && target.scrollIntoView) {
          target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
        }

        if (!REDUCED && HAS_ANIME) {
          setTimeout(function () {
            anime({ targets: '#bookingForm', scale: [1, 1.012, 1], duration: 620, easing: 'easeOutQuad' });
          }, 520);
        }
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     5. Acordeones
     ═══════════════════════════════════════════════════════════════ */
  function accordions() {
    $$('.acc__btn').forEach(function (btn) {
      var panel = btn.parentElement.nextElementSibling;
      if (!panel) return;

      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));

        if (REDUCED || !HAS_ANIME) {
          panel.hidden = open;
          return;
        }

        if (open) {
          anime({
            targets: panel,
            height: [panel.scrollHeight, 0],
            opacity: [1, 0],
            duration: 320,
            easing: 'easeInQuad',
            complete: function () { panel.hidden = true; panel.style.height = ''; }
          });
        } else {
          panel.hidden = false;
          panel.style.height = '0px';
          anime({
            targets: panel,
            height: [0, panel.scrollHeight],
            opacity: [0, 1],
            duration: 420,
            easing: 'easeOutQuart',
            complete: function () { panel.style.height = 'auto'; }
          });
        }
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     6. Agendado de citas
     ═══════════════════════════════════════════════════════════════ */
  var PREP = {
    'ayuno':        'Ayuno de 6 a 8 horas. Puedes tomar agua simple y tus medicamentos habituales.',
    'ayuno-vejiga': 'Ayuno de 6 a 8 horas y vejiga llena: toma un litro de agua una hora antes y no orines.',
    'ayuno-boyden': 'Ayuno de 6 a 8 horas. El estudio se hace en dos tiempos, con un alimento graso de por medio.',
    'vejiga':       'Vejiga llena: toma un litro de agua una hora antes de tu cita y no orines hasta terminar.',
    'vejiga-vacia': 'Vejiga vacía. Orina justo antes de pasar al estudio. No requiere ayuno.',
    'transrectal':  'Requiere el recto libre de heces, normalmente con un enema evacuante previo. Lo confirmamos contigo al agendar.',
    'agua':         'Toma agua abundante una hora antes. No requiere ayuno.',
    'ninguna':      'No requiere preparación. Ven con ropa cómoda que permita descubrir la zona a explorar.',
    'ninguna-mama': 'No requiere preparación. Ven sin talco, crema ni desodorante en la zona a explorar.'
  };

  var STUDIES = [];
  var currentStep = 1;
  var slot = '';

  function mxn(n) { return '$' + Number(n).toLocaleString('es-MX'); }

  function buildStudySelect() {
    var select = $('#bkStudy');
    if (!select) return;

    var GROUPS = {
      abdomen: 'Abdomen y digestivo',
      gineco:  'Ginecología y embarazo',
      uro:     'Urología y riñón',
      cuello:  'Cuello y partes blandas',
      musculo: 'Articulaciones',
      doppler: 'Doppler vascular'
    };
    var buckets = {};

    // El HTML es la única fuente de verdad: leemos el catálogo del DOM
    $$('#catalog .study').forEach(function (li) {
      var s = {
        id: li.dataset.id,
        name: $('.study__name', li).textContent.trim(),
        price: +li.dataset.price,
        prep: li.dataset.prep,
        dur: +li.dataset.dur,
        group: li.dataset.group
      };
      STUDIES.push(s);
      (buckets[s.group] = buckets[s.group] || []).push(s);
    });

    Object.keys(GROUPS).forEach(function (key) {
      if (!buckets[key]) return;
      var og = document.createElement('optgroup');
      og.label = GROUPS[key];
      buckets[key].forEach(function (s) {
        var o = document.createElement('option');
        o.value = s.id;
        o.textContent = s.name + ' — ' + mxn(s.price);
        og.appendChild(o);
      });
      select.appendChild(og);
    });

    select.addEventListener('change', function () {
      var s = STUDIES.filter(function (x) { return x.id === select.value; })[0];
      var card = $('#prepCard');
      if (!s) { card.hidden = true; return; }

      $('#prepText').textContent  = PREP[s.prep] || PREP.ninguna;
      $('#prepDur').textContent   = 'Duración aproximada ' + s.dur + ' minutos';
      $('#prepPrice').textContent = mxn(s.price) + ' MXN';
      card.hidden = false;
      select.classList.remove('is-invalid');

      if (!REDUCED && HAS_ANIME) {
        anime({ targets: card, opacity: [0, 1], translateY: [-6, 0], duration: 380, easing: 'easeOutQuart' });
      }
    });
  }

  function goToStep(n) {
    var steps = $$('.fstep');
    if (!steps.length) return;

    var from = $('.fstep.is-active');
    var to   = $('.fstep[data-step="' + n + '"]');
    if (!to || from === to) { if (to) { currentStep = n; } return; }

    var forward = n > currentStep;
    currentStep = n;

    $$('.booking__progress li').forEach(function (li) {
      li.classList.toggle('is-on', +li.dataset.step <= n);
    });

    var swap = function () {
      steps.forEach(function (s) { s.classList.remove('is-active'); });
      to.classList.add('is-active');
      if (!REDUCED && HAS_ANIME) {
        anime({
          targets: to,
          opacity: [0, 1],
          translateX: [forward ? 22 : -22, 0],
          duration: 400,
          easing: 'easeOutQuart'
        });
      }
    };

    if (REDUCED || !HAS_ANIME || !from) { swap(); return; }

    anime({
      targets: from,
      opacity: [1, 0],
      translateX: [0, forward ? -22 : 22],
      duration: 220,
      easing: 'easeInQuad',
      complete: swap
    });
  }

  function bookingData() {
    var s = STUDIES.filter(function (x) { return x.id === ($('#bkStudy') || {}).value; })[0];
    return {
      study: s,
      name:  ($('#bkName')  || {}).value || '',
      phone: ($('#bkPhone') || {}).value || '',
      date:  ($('#bkDate')  || {}).value || '',
      order: ($('#bkOrder') || {}).value || '',
      notes: ($('#bkNotes') || {}).value || '',
      slot:  slot
    };
  }

  function prettyDate(iso) {
    if (!iso) return '';
    var p = iso.split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  function renderSummary() {
    var d = bookingData();
    var dl = $('#bkSummary');
    if (!dl) return;

    var rows = [
      ['Estudio',     d.study ? d.study.name : '—'],
      ['Precio',      d.study ? mxn(d.study.price) + ' MXN' : '—'],
      ['Preparación', d.study ? (PREP[d.study.prep] || PREP.ninguna) : '—'],
      ['Nombre',      d.name || '—'],
      ['WhatsApp',    d.phone || '—'],
      ['Día',         prettyDate(d.date) || '—'],
      ['Horario',     d.slot || 'Sin preferencia'],
      ['Orden médica', d.order || '—']
    ];
    if (d.notes) rows.push(['Notas', d.notes]);

    dl.innerHTML = rows.map(function (r) {
      return '<div><dt>' + r[0] + '</dt><dd>' + String(r[1]).replace(/</g, '&lt;') + '</dd></div>';
    }).join('');
  }

  function validate(step) {
    var err = $('#bkError');
    err.hidden = true;

    var missing = [];
    if (step >= 1) {
      var sel = $('#bkStudy');
      if (!sel.value) { missing.push('el estudio'); sel.classList.add('is-invalid'); }
    }
    if (step >= 2) {
      [['#bkName', 'tu nombre'], ['#bkPhone', 'tu WhatsApp'], ['#bkDate', 'el día que prefieres']]
        .forEach(function (f) {
          var el = $(f[0]);
          if (!el.value.trim()) { missing.push(f[1]); el.classList.add('is-invalid'); }
          else { el.classList.remove('is-invalid'); }
        });
    }

    if (missing.length) {
      err.textContent = 'Falta ' + missing.join(', ').replace(/,([^,]*)$/, ' y$1') + '.';
      err.hidden = false;
      if (!REDUCED && HAS_ANIME) {
        anime({ targets: err, translateX: [-8, 8, -5, 5, 0], duration: 380, easing: 'easeOutQuad' });
      }
      return false;
    }
    return true;
  }

  function booking() {
    var form = $('#bookingForm');
    if (!form) return;

    buildStudySelect();

    // Fecha mínima: hoy
    var dateEl = $('#bkDate');
    if (dateEl) {
      var t = new Date();
      dateEl.min = t.getFullYear() + '-' +
        String(t.getMonth() + 1).padStart(2, '0') + '-' +
        String(t.getDate()).padStart(2, '0');
    }

    // Horario preferido
    $$('.chipset--slots .chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        $$('.chipset--slots .chip').forEach(function (c) { c.setAttribute('aria-checked', 'false'); });
        chip.setAttribute('aria-checked', 'true');
        slot = chip.dataset.slot;
      });
    });

    $$('[data-go]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = +btn.dataset.go;
        if (target > currentStep && !validate(currentStep)) return;
        if (target === 3) renderSummary();
        goToStep(target);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(2)) return;

      var d = bookingData();
      var lines = [
        'Hola, quiero agendar un ultrasonido.',
        '',
        'Estudio: ' + d.study.name + ' (' + mxn(d.study.price) + ' MXN)',
        'Nombre: ' + d.name,
        'Teléfono: ' + d.phone,
        'Día que prefiero: ' + prettyDate(d.date),
        'Horario: ' + (d.slot || 'Sin preferencia'),
        d.order
      ];
      if (d.notes) lines.push('Notas: ' + d.notes);
      lines.push('', 'Enviado desde el sitio web.');

      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     Arranque
     ═══════════════════════════════════════════════════════════════ */
  function init() {
    window.__siteReady = true;

    var y = $('#year');
    if (y) y.textContent = new Date().getFullYear();

    nav();
    heroSequence();
    headingWipes();
    catalog();
    accordions();
    booking();

    // Imágenes marcadas como placeholder: si el archivo aún no existe,
    // dejamos un degradado del sistema en lugar de un icono roto.
    $$('[data-placeholder]').forEach(function (img) {
      img.addEventListener('error', function () {
        img.style.background = 'linear-gradient(155deg,#2B1D26 0%,#5E1529 48%,#8E2440 100%)';
        img.removeAttribute('src');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
