'use strict';

/* ── Погружение: картинка липнет и сменяется вместе с шагом ── */
(function immersion() {
  const root = document.querySelector('[data-steps]');
  if (!root) return;
  const steps = [...root.querySelectorAll('.step')];
  const slides = [...root.querySelectorAll('.slide')];
  const dots = [...root.querySelectorAll('.imm__dots i')];

  const show = (i) => {
    steps.forEach((el, n) => el.classList.toggle('is-active', n === i));
    slides.forEach((el, n) => el.classList.toggle('is-active', n === i));
    dots.forEach((el, n) => el.classList.toggle('is-active', n === i));
  };

  // активным считается шаг, пересекающий горизонтальную линию примерно в центре экрана
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) show(steps.indexOf(e.target));
    });
  }, { rootMargin: '-45% 0px -45% 0px' });

  steps.forEach((s) => io.observe(s));

  // Планшет и мобильный: липкая картинка перекрывала бы текст, поэтому
  // каждая картинка переезжает внутрь своего шага и стоит статично над текстом.
  const frame = root.querySelector('.imm__frame');
  const mq = matchMedia('(max-width: 1100px)');
  const layout = () => {
    if (mq.matches) {
      steps.forEach((step, k) => { if (slides[k].parentNode !== step) step.prepend(slides[k]); });
    } else {
      slides.forEach((slide) => { if (slide.parentNode !== frame) frame.appendChild(slide); });
    }
  };
  layout();
  mq.addEventListener('change', layout);
})();

/* ── Мобильное меню ── */
(function menu() {
  const btn = document.querySelector('.burger');
  const nav = document.getElementById('menu');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', open);
  });
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      nav.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
})();

/* ── Фильтры карточек (услуги, программы) ── */
document.querySelectorAll('[data-filter]').forEach((bar) => {
  const cards = document.querySelectorAll(`[data-filter-target="${bar.dataset.filter}"] .card`);
  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-f]');
    if (!btn) return;
    bar.querySelectorAll('[data-f]').forEach((b) => {
      const on = b === btn;
      b.classList.toggle('btn--primary', on);
      b.classList.toggle('btn--soft', !on);
    });
    const f = btn.dataset.f;
    cards.forEach((c) => c.classList.toggle('is-hidden', f !== 'all' && c.dataset.c !== f));
  });
});

/* ── Онлайн-конструктор: пересчёт суммы ── */
(function builder() {
  const form = document.querySelector('[data-builder]');
  if (!form) return;
  const fmt = (n) => n.toLocaleString('ru-RU').replace(/\u00a0/g, ' ');
  const update = () => {
    const time = form.querySelector('[name=time]:checked');
    const techs = [...form.querySelectorAll('[name=tech]:checked')];
    const extras = [...form.querySelectorAll('input[type=checkbox][data-price]:checked')];
    const base = Number(time.dataset.price);
    const sum = base + extras.reduce((s, c) => s + Number(c.dataset.price), 0);

    form.querySelector('[data-total]').textContent = `${fmt(sum)} ₽`;
    const minutes = Number(time.value) + extras.reduce((s, c) => s + Number(c.dataset.minutes || 0), 0);
    form.querySelector('[data-line-time]').textContent = `Сеанс - ${minutes} минут - ${base} рублей`;
    form.querySelector('[data-line-tech]').textContent = techs.length
      ? `${techs.length > 1 ? 'Техники' : 'Техника'} - ${techs.map((t) => t.value.toLowerCase()).join(', ')}`
      : 'Техника - не выбрана';
    form.querySelector('[data-line-extra]').textContent =
      extras.length
        ? `+ ${extras.map((c) => c.value).join(', ')}${extras.some((c) => c.hasAttribute('data-ask')) ? ' (цену части допов уточнит администратор)' : ''}`
        : 'Без дополнений';
  };
  form.addEventListener('change', (e) => {
    update();
  });
  update();
})();

/* ── Форма заявки: маска телефона и проверка ── */
document.querySelectorAll('[data-form]').forEach((form) => {
  const phone = form.elements.phone;

  phone.addEventListener('input', () => {
    let d = phone.value.replace(/\D/g, '');
    if (d[0] === '8') d = '7' + d.slice(1);
    if (d[0] !== '7') d = '7' + d;
    d = d.slice(0, 11);
    const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
    phone.value = '+7' + (p[0] ? ` (${p[0]}` : '') + (p[0].length === 3 ? ')' : '') +
      (p[1] ? ` ${p[1]}` : '') + (p[2] ? `-${p[2]}` : '') + (p[3] ? `-${p[3]}` : '');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const status = form.querySelector('.form__status');
    const agree = form.querySelector('.agree input');
    const ok = form.elements.name.value.trim() && phone.value.replace(/\D/g, '').length === 11 && agree.checked;
    status.hidden = false;
    status.textContent = ok
      ? 'Спасибо! Администратор свяжется с вами в течение 5 минут.'
      : 'Укажите имя, телефон полностью и подтвердите согласие.';
    // здесь подключается отправка на сервер: fetch('/api/order', { method: 'POST', body: new FormData(form) })
    // форма в модальном окне закрывается сама после успешной отправки
    const dlg = form.closest('dialog');
    if (ok && dlg) setTimeout(() => dlg.close(), 2500);
  });
});

/* ── Плавное появление блоков при прокрутке ── */
(function reveal() {
  const sel = [
    '.head', '.hero__content > *', '.visual', '.about', '.tile', '.card', '.price-card',
    '.panel', '.banner', '.review', '.slider', '.faq details', '.builder__opts', '.builder__sum',
    '.split--ref > div', '.order__text', '.form', '.map', '.footer__cols > *'
  ].join(',');

  const items = [...document.querySelectorAll(sel)].filter((el, _, all) =>
    !el.closest('.imm') && !all.some((o) => o !== el && o.contains(el)));

  const perParent = new Map();
  items.forEach((el) => {
    const n = perParent.get(el.parentNode) || 0;
    perParent.set(el.parentNode, n + 1);
    el.dataset.reveal = el.classList.contains('visual') ? 'zoom' : '';
    el.style.setProperty('--i', Math.min(n, 4));
  });

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  items.forEach((el) => io.observe(el));
})();

/* ── Автослайдеры: отзывы, мастера, новости ── */
(function sliders() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-slider]').forEach((root) => {
    const track = root.querySelector('.slider__track');
    const viewport = root.querySelector('.slider__viewport');
    const orig = [...track.children];
    const n = orig.length;
    const delay = 5000; // пауза между слайдами, мс
    let pv = 1, i = 0, timer = null, clones = [], hovered = false, visible = false;

    // навигация: стрелки + точки
    const nav = document.createElement('div');
    nav.className = 'slider__nav';
    nav.innerHTML = '<div class="slider__dots"></div>';
    root.appendChild(nav);
    const dotsBox = nav.querySelector('.slider__dots');
    const dots = orig.map((_, k) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'slider__dot';
      b.setAttribute('aria-label', `Слайд ${k + 1}`);
      b.addEventListener('click', () => { i = k; place(true); restart(); });
      dotsBox.appendChild(b);
      return b;
    });
    if (n < 2) { nav.hidden = true; return; }

    const readPv = () => Math.max(1, Math.min(n, parseInt(getComputedStyle(root).getPropertyValue('--pv'), 10) || 1));

    // копии первых слайдов в конце — для бесконечной прокрутки без скачков
    function build() {
      clones.forEach((c) => c.remove());
      pv = readPv();
      clones = orig.slice(0, pv).map((el) => {
        const c = el.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        c.inert = true;
        track.appendChild(c);
        return c;
      });
    }

    function place(animate) {
      track.classList.toggle('no-anim', !animate);
      const offset = track.children[i].offsetLeft - track.children[0].offsetLeft;
      track.style.transform = `translateX(${-offset}px)`;
      dots.forEach((d, k) => {
        const on = k === i % n;
        d.classList.toggle('is-active', on);
        if (on) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      });
    }

    function jumpIfClone() {
      if (i >= n) { i -= n; place(false); void track.offsetWidth; }
    }
    const next = () => { jumpIfClone(); i += 1; place(true); };
    const prev = () => {
      if (i === 0) { i = n; place(false); void track.offsetWidth; }
      i -= 1; place(true);
    };

    track.addEventListener('transitionend', (e) => { if (e.target === track) jumpIfClone(); });

    // автопрокрутка: только когда слайдер на экране и курсор/фокус не внутри
    function start() {
      stop();
      if (reduce || hovered || !visible || document.hidden) return;
      timer = setInterval(next, delay);
    }
    function stop() { clearInterval(timer); timer = null; }
    function restart() { start(); }

    root.addEventListener('mouseenter', () => { hovered = true; stop(); });
    root.addEventListener('mouseleave', () => { hovered = false; start(); });
    root.addEventListener('focusin', () => { hovered = true; stop(); });
    root.addEventListener('focusout', () => { hovered = false; start(); });
    document.addEventListener('visibilitychange', start);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }, { threshold: 0.3 }).observe(root);

    // свайп
    let x0 = null;
    viewport.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    viewport.addEventListener('pointerup', (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 40) { (dx < 0 ? next : prev)(); restart(); }
    });
    viewport.addEventListener('pointercancel', () => { x0 = null; });

    // пересчёт при смене числа карточек в кадре (десктоп/планшет/мобильный)
    let rt;
    addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        if (readPv() !== pv) { i = i % n; build(); }
        place(false);
      }, 150);
    });

    build();
    place(false);
  });
})();

/* ── Выпадающий список «Услуги» ── */
(function dropdown() {
  const subs = [...document.querySelectorAll('.has-sub')];
  const close = (except) => subs.forEach((li) => {
    if (li === except) return;
    li.classList.remove('is-open');
    li.querySelector('.menu__link').setAttribute('aria-expanded', 'false');
  });
  subs.forEach((li) => {
    const btn = li.querySelector('.menu__link');
    btn.addEventListener('click', () => {
      const open = li.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open);
      close(li);
    });
    li.querySelectorAll('.submenu a').forEach((a) => a.addEventListener('click', () => close()));
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.has-sub')) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();

/* ── Страница техники: выбор длительности и СПА-плюшек, окно записи ── */
(function pricing() {
  const root = document.querySelector('[data-pricing]');
  const dlg = document.getElementById('book-dialog');
  if (!root || !dlg) return;

  const fmt = (n) => n.toLocaleString('ru-RU').replace(/\u00a0/g, ' ');
  const tiles = [...root.querySelectorAll('.price-tile')];
  const extras = [...root.querySelectorAll('.pills input')];
  const summary = root.querySelector('[data-sel-summary]');
  let current = tiles.find((t) => t.classList.contains('is-selected')) || tiles[0];

  const state = () => {
    const picked = extras.filter((i) => i.checked);
    const base = Number(current.dataset.price);
    return {
      minutes: current.dataset.minutes,
      base,
      picked,
      sum: base + picked.reduce((s, i) => s + Number(i.dataset.price || 0), 0),
      ask: picked.some((i) => i.hasAttribute('data-ask'))
    };
  };
  const describe = (s) => `${root.dataset.service || 'Проминающий массаж'}, ${s.minutes} минут` +
    (s.picked.length ? `; СПА-плюшки: ${s.picked.map((i) => i.value.toLowerCase()).join(', ')}` : '') +
    `. Итого: ${fmt(s.sum)} ₽${s.ask ? ' + часть допов по запросу' : ''}`;

  const select = (tile) => {
    current = tile;
    tiles.forEach((t) => {
      const on = t === tile;
      t.classList.toggle('is-selected', on);
      const b = t.querySelector('.btn');
      b.setAttribute('aria-pressed', on);
      b.textContent = on ? 'Выбрано' : 'Выбрать';
      b.classList.toggle('btn--gold', on);
      b.classList.toggle('btn--outline', !on);
    });
    refresh();
  };
  const refresh = () => {
    const s = state();
    summary.innerHTML = `Ваш выбор: <strong>${s.minutes} минут${s.picked.length ? ' + ' + s.picked.map((i) => i.value.toLowerCase()).join(', ') : ''}</strong> — ${fmt(s.sum)} ₽${s.ask ? ' (часть допов — по запросу)' : ''}`;
  };
  // делегирование: клик по любой части плитки (в т.ч. по кнопке) выбирает длительность
  root.addEventListener('click', (e) => {
    const t = e.target.closest('.price-tile');
    if (t && tiles.includes(t)) select(t);
  });
  extras.forEach((i) => i.addEventListener('change', refresh));
  select(current);

  // окно записи
  const list = dlg.querySelector('[data-book-list]');
  const open = () => {
    const s = state();
    list.innerHTML = '';
    const add = (label, price, cls) => {
      const li = document.createElement('li');
      if (cls) li.className = cls;
      li.innerHTML = `<span>${label}</span><b>${price}</b>`;
      list.appendChild(li);
    };
    add(`${s.minutes} минут`, `${fmt(s.base)} ₽`);
    s.picked.forEach((i) => add(i.value, i.hasAttribute('data-ask') ? 'по запросу' : `+${fmt(Number(i.dataset.price))} ₽`));
    add('Итого', `${fmt(s.sum)} ₽`, 'is-total');
    dlg.querySelector('[name=wish]').value = describe(s);
    dlg.querySelector('.form__status').hidden = true;
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    dlg.querySelector('[name=name]').focus();
  };
  root.querySelector('[data-open-booking]').addEventListener('click', open);
  dlg.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => dlg.close()));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); }); // клик по затемнению
})();

/* ── Каталог программ: подстановка названия в заявку и быстрый выбор категории ── */
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-program]');
  if (b) document.querySelectorAll('[data-form] [name=wish]').forEach((i) => { i.value = `Программа «${b.dataset.program}»`; });
  const p = e.target.closest('[data-pick]');
  if (p) {
    const chip = document.querySelector(`[data-filter="programs"] [data-f="${p.dataset.pick}"]`);
    if (chip) chip.click();
  }
});

/* ── Фото программ: запасной адрес, а затем заглушка, если картинка не загрузилась ── */
document.addEventListener('error', (e) => {
  const i = e.target;
  if (!i || i.tagName !== 'IMG' || !i.closest('.card--prog')) return;
  if (i.dataset.fallback) { const f = i.dataset.fallback; i.dataset.fallback = ''; i.src = f; return; }
  const box = i.closest('.card__img');
  box.classList.add('card__img--ph');
  box.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-leaf"/></svg>';
}, true);

/* ── Карта сеанса (Ангельское личико) ── */
(() => {
  const root = document.querySelector('[data-session]');
  if (!root) return;
  const face = root.querySelector('.sess__face'), btns = [...root.querySelectorAll('.sess__n')];
  const zones = [...root.querySelectorAll('.zone')], bar = root.querySelector('.sess__bar');
  const play = root.querySelector('[data-s-play]'), q = (s) => root.querySelector(s), STEP = 5200;
  let idx = 0, timer = null;
  const show = (i) => {
    idx = i; const b = btns[i], on = (b.dataset.zones || '').split(' ').filter(Boolean);
    btns.forEach((x, k) => x.classList.toggle('is-on', k === i));
    zones.forEach((z) => z.classList.toggle('is-on', on.includes(z.dataset.zone)));
    face.classList.toggle('is-herbs', b.hasAttribute('data-herbs'));
    q('[data-s-tag]').textContent = `- этап ${i + 1} из ${btns.length} - ${b.getAttribute('aria-label').split(': ')[1]}`;
    q('[data-s-title]').textContent = b.dataset.title; q('[data-s-text]').textContent = b.dataset.text;
    q('[data-s-quote]').textContent = b.dataset.quote;
    q('[data-s-chips]').innerHTML = b.dataset.chips.split('|').map((c) => `<i>${c}</i>`).join('');
  };
  const runBar = (on) => { bar.classList.remove('is-run'); void bar.offsetWidth; if (on) bar.classList.add('is-run'); };
  const stop = () => { clearInterval(timer); timer = null; runBar(false); play.textContent = '▶ Запустить сеанс'; };
  const start = () => {
    if (idx >= btns.length - 1) show(0);
    play.textContent = '❚❚ Пауза'; runBar(true);
    timer = setInterval(() => {
      if (idx >= btns.length - 1) { stop(); play.textContent = '↻ Пройти ещё раз'; return; }
      show(idx + 1); runBar(true);
    }, STEP);
  };
  play.addEventListener('click', () => (timer ? stop() : start()));
  btns.forEach((b, i) => b.addEventListener('click', () => { stop(); show(i); }));
  const pick = (z) => { const i = btns.findIndex((b) => (b.dataset.zones || '').split(' ').includes(z.dataset.zone)); if (i > -1) { stop(); show(i); } };
  zones.forEach((z) => { z.addEventListener('click', () => pick(z)); z.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(z); } }); });
})();

/* ── Дыхание с ароматом ── */
(() => {
  const root = document.querySelector('[data-aroma]');
  if (!root) return;
  const orb = root.querySelector('.aroma__orb'), label = root.querySelector('[data-breath]');
  const T = { mint: ['Мята', 'Свежий, прохладный аромат: бодрит и освежает, помогает собраться после долгого дня.'], lavender: ['Лаванда', 'Мягкий успокаивающий аромат: настраивает на тишину и замедляет мысли.'], eucalyptus: ['Эвкалипт', 'Глубокий лёгкий аромат: помогает дышать свободнее и расслабиться.'] };
  const go = root.querySelector('[data-a-go]'); let timers = [], busy = false;
  const clear = () => { timers.forEach(clearTimeout); timers = []; busy = false; orb.classList.remove('is-in', 'is-out'); go.textContent = 'Подышать 30 секунд'; };
  root.querySelectorAll('[data-a]').forEach((b) => b.addEventListener('click', () => {
    root.querySelectorAll('[data-a]').forEach((x) => x.classList.toggle('is-on', x === b));
    orb.dataset.tone = b.dataset.a; root.querySelector('[data-a-title]').textContent = T[b.dataset.a][0]; root.querySelector('[data-a-text]').textContent = T[b.dataset.a][1];
  }));
  go.addEventListener('click', () => {
    if (busy) { clear(); label.textContent = 'Выберите аромат'; return; }
    busy = true; go.textContent = 'Остановить'; let t = 0;
    for (let c = 0; c < 3; c++) {
      timers.push(setTimeout(() => { orb.classList.remove('is-out'); orb.classList.add('is-in'); label.textContent = 'Вдох…'; }, t)); t += 4000;
      timers.push(setTimeout(() => { orb.classList.remove('is-in'); orb.classList.add('is-out'); label.textContent = 'Выдох…'; }, t)); t += 6000;
    }
    timers.push(setTimeout(() => { clear(); label.textContent = 'Так мы начинаем финал сеанса'; }, t));
  });
})();

/* ── Брауни: разрез, слои и капли шоколада ── */
(() => {
  const root = document.querySelector('[data-brn]');
  if (root) {
    const stage = root.querySelector('[data-stage]'), layers = [...root.querySelectorAll('.brn__layer')], picks = [...root.querySelectorAll('.brn__pick')];
    const show = (i) => {
      const b = picks[i]; if (!b) return;
      picks.forEach((x, k) => x.classList.toggle('is-on', k === i));
      layers.forEach((l) => l.classList.toggle('is-on', Number(l.dataset.i) === i));
      root.querySelector('[data-b-tag]').textContent = `- слой ${i + 1} из ${picks.length} - ${b.dataset.h}`;
      root.querySelector('[data-b-title]').textContent = b.dataset.t; root.querySelector('[data-b-text]').textContent = b.dataset.p;
      root.querySelector('[data-b-feel]').textContent = b.dataset.f;
      root.querySelector('[data-b-chips]').innerHTML = b.dataset.c.split('|').map((c) => `<i>${c}</i>`).join('');
    };
    const cut = root.querySelector('[data-b-cut]');
    cut.addEventListener('click', () => { const o = stage.classList.toggle('is-open'); cut.textContent = o ? '↺ Собрать обратно' : '🔪 Разрезать брауни'; });
    picks.forEach((b, i) => b.addEventListener('click', () => { stage.classList.add('is-open'); cut.textContent = '↺ Собрать обратно'; show(i); }));
    layers.forEach((l) => { const go = () => { stage.classList.add('is-open'); cut.textContent = '↺ Собрать обратно'; show(Number(l.dataset.i)); }; l.addEventListener('click', go); l.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }); });
    layers.find((l) => l.dataset.i === '0').classList.add('is-on');
  }
  const d = document.querySelector('.drip');
  if (d) { if ('IntersectionObserver' in window) { new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { d.classList.add('is-in'); o.disconnect(); } }), { threshold: .3 }).observe(d); } else d.classList.add('is-in'); }
})();

/* ── Совершенство: сцена «зима → весна» и «оставьте позади» ── */
(() => {
  const root = document.querySelector('[data-spring]');
  if (root) {
    const range = root.querySelector('[data-sp-range]'), val = root.querySelector('[data-sp-val]'), play = root.querySelector('[data-sp-play]');
    const buds = [...root.querySelectorAll('.bud')], st = [...root.querySelectorAll('template[data-st]')], btns = [...root.querySelectorAll('.sp__st')];
    let stage = -1, raf = null;
    const q = (s) => root.querySelector(s);
    const render = (v) => {
      const p = Math.max(0, Math.min(100, v)) / 100;
      root.style.setProperty('--p', p); val.textContent = `${Math.round(p * 100)}%`; range.value = Math.round(p * 100);
      buds.forEach((b) => { const t = parseFloat(b.dataset.t); b.style.setProperty('--b', Math.max(0, Math.min(1, (p - t + .02) / .2)).toFixed(3)); });
      const s = p < .34 ? 0 : p < .67 ? 1 : 2;
      if (s !== stage) {
        stage = s; const d = st[s].dataset;
        btns.forEach((b, i) => b.classList.toggle('is-on', i === s));
        q('[data-sp-tag]').textContent = `- ${d.n} из 3 - ${d.h}`; q('[data-sp-title]').textContent = d.t; q('[data-sp-text]').textContent = d.p;
        q('[data-sp-feel]').textContent = d.f; q('[data-sp-chips]').innerHTML = d.c.split('|').map((c) => `<i>${c}</i>`).join('');
      }
    };
    const stop = () => { if (raf) cancelAnimationFrame(raf); raf = null; play.textContent = '▶ Запустить весну'; };
    const animate = (to, ms, done) => {
      stop(); const from = Number(range.value), t0 = performance.now(); play.textContent = '❚❚ Пауза';
      const step = (t) => { const k = Math.min(1, (t - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; render(from + (to - from) * e); if (k < 1) raf = requestAnimationFrame(step); else { stop(); if (done) done(); } };
      raf = requestAnimationFrame(step);
    };
    range.addEventListener('input', () => { stop(); render(Number(range.value)); });
    btns.forEach((b) => b.addEventListener('click', () => animate(Number(b.dataset.p), 1100)));
    play.addEventListener('click', () => { if (raf) { stop(); return; } if (Number(range.value) >= 99) render(0); animate(100, 9000, () => { play.textContent = '↻ Ещё раз'; }); });
    render(0);
  }
  const lv = document.querySelector('[data-leave-box]');
  if (lv) {
    const chips = [...lv.querySelectorAll('[data-leave]')], msg = lv.querySelector('[data-leave-msg]'), rs = lv.querySelector('[data-leave-reset]');
    const check = () => { const all = chips.every((c) => c.classList.contains('is-gone')); msg.hidden = !all; rs.hidden = !all; };
    chips.forEach((c) => c.addEventListener('click', () => { c.classList.add('is-gone'); check(); }));
    rs.addEventListener('click', () => { chips.forEach((c) => c.classList.remove('is-gone')); check(); });
  }
})();

/* ── Тайны нежности: шкатулка и шкала 120 минут ── */
(() => {
  const root = document.querySelector('[data-secrets]');
  if (root) {
    const cards = [...root.querySelectorAll('.sec3__card')], cnt = root.querySelector('[data-count]'), fin = root.querySelector('[data-final]'), next = root.querySelector('[data-next]');
    const upd = () => {
      const n = cards.filter((c) => c.classList.contains('is-open')).length;
      cnt.textContent = `Раскрыто тайн: ${n} из ${cards.length}`; fin.hidden = n < cards.length; next.hidden = n >= cards.length;
    };
    cards.forEach((c) => c.addEventListener('click', () => { c.classList.add('is-open'); c.setAttribute('aria-label', `Тайна ${Number(c.dataset.i) + 1}: раскрыта`); upd(); }));
    next.addEventListener('click', () => { const c = cards.find((x) => !x.classList.contains('is-open')); if (c) c.click(); });
    upd();
  }
  const t = document.querySelector('[data-t120]');
  if (t) { if ('IntersectionObserver' in window) { new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { t.classList.add('is-in'); o.disconnect(); } }), { threshold: .4 }).observe(t); } else t.classList.add('is-in'); }
})();

/* ── Афродита: сборка короны ── */
(() => {
  const root = document.querySelector('[data-crown]');
  if (!root) return;
  const gems = [...root.querySelectorAll('.cr__gem')], slots = [...root.querySelectorAll('.cr__slot')];
  const slotOf = (g) => slots[[2, 0, 1, 3, 4][Number(g.dataset.i)] === undefined ? 0 : ({ 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 })[g.dataset.i]];
  const q = (s) => root.querySelector(s), auto = q('[data-cr-auto]'), reset = q('[data-cr-reset]'), fin = q('[data-cr-final]');
  const noAnim = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let busy = false, timer = null;
  const info = (g) => {
    q('[data-cr-title]').textContent = `${g.dataset.t}`; q('[data-cr-text]').textContent = g.dataset.p; q('[data-cr-feel]').textContent = g.dataset.f;
    q('[data-cr-chips]').innerHTML = g.dataset.c.split('|').map((c) => `<i>${c}</i>`).join('');
  };
  const count = () => {
    const n = gems.filter((g) => g.classList.contains('is-used')).length;
    q('[data-cr-tag]').textContent = `- камней на короне: ${n} из ${gems.length}`;
    root.classList.toggle('is-done', n === gems.length); fin.hidden = n < gems.length; reset.hidden = n === 0; auto.hidden = n === gems.length;
    return n;
  };
  const place = (g, done) => {
    if (g.classList.contains('is-used')) { if (done) done(); return; }
    const slot = slotOf(g), a = g.querySelector('i').getBoundingClientRect(), b = slot.getBoundingClientRect();
    const fin2 = () => { slot.classList.add('is-set'); g.classList.add('is-used'); info(g); count(); if (done) done(); };
    if (noAnim || !g.querySelector('i').animate) { fin2(); return; }
    const fl = document.createElement('div'); fl.className = 'cr__fly'; fl.style.cssText = `${g.getAttribute('style')};left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px`;
    document.body.appendChild(fl);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2), s = b.width / a.width;
    g.classList.add('is-used');
    fl.animate([{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${dx * .5}px,${dy * .5 - 60}px) scale(1.15)`, offset: .5 }, { transform: `translate(${dx}px,${dy}px) scale(${s})` }], { duration: 800, easing: 'ease-in-out', fill: 'forwards' }).onfinish = () => { fl.remove(); g.classList.remove('is-used'); fin2(); };
  };
  gems.forEach((g) => g.addEventListener('click', () => { if (busy) return; place(g); }));
  const stop = () => { busy = false; clearTimeout(timer); };
  auto.addEventListener('click', () => {
    if (busy) return; busy = true;
    const todo = gems.filter((g) => !g.classList.contains('is-used'));
    const step = (i) => { if (i >= todo.length) { stop(); return; } place(todo[i], () => { timer = setTimeout(() => step(i + 1), 450); }); };
    step(0);
  });
  reset.addEventListener('click', () => {
    stop(); gems.forEach((g) => g.classList.remove('is-used')); slots.forEach((s) => s.classList.remove('is-set'));
    q('[data-cr-title]').textContent = 'Нажмите на любой камень'; q('[data-cr-text]').textContent = 'Каждый камень — отдельная часть программы «Афродита»: от мягкого скрабирования до гидрогелевой маски. Выберите, с чего начать.';
    q('[data-cr-feel]').textContent = 'Вы — королева. Корона ждёт вас.'; q('[data-cr-chips]').innerHTML = ''; count();
  });
  count();
})();

/* ── Отдых мечты: путешествие на остров ── */
(() => {
  const root = document.querySelector('[data-journey]');
  if (!root) return;
  const route = root.querySelector('#jrRoute'), done = root.querySelector('#jrDone'), boat = root.querySelector('#jrBoat');
  const sts = [...root.querySelectorAll('.jr__st')], navs = [...root.querySelectorAll('.jr__n')], tpl = [...root.querySelectorAll('template[data-jr-st]')];
  const q = (s) => root.querySelector(s), diary = q('[data-jr-diary]'), go = q('[data-jr-go]'), reset = q('[data-jr-reset]'), card = document.querySelector('[data-jr-card]');
  const L = route.getTotalLength(); done.style.setProperty('--len', L); done.style.setProperty('--off', L);
  const noAnim = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const at = sts.map((s) => { const t = s.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/), x = +t[1], y = +t[2]; let best = 0, bd = 1e9; for (let l = 0; l <= L; l += 2) { const p = route.getPointAtLength(l), d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; best = l; } } return best; });
  let cur = 0, pos = 0, raf = null, timer = null, auto = false; const visited = new Set();
  const draw = (l) => { pos = l; const p = route.getPointAtLength(l); boat.setAttribute('transform', `translate(${p.x} ${p.y - 6})`); done.style.setProperty('--off', L - l); };
  const info = (i) => {
    const d = tpl[i].dataset; cur = i;
    navs.forEach((n, k) => n.classList.toggle('is-on', k === i)); sts.forEach((s, k) => s.classList.toggle('is-here', k === i));
    q('[data-jr-tag]').textContent = `- остановка ${i + 1} из ${tpl.length} - ${d.n}`; q('[data-jr-title]').textContent = d.t; q('[data-jr-text]').textContent = d.p;
    q('[data-jr-feel]').textContent = d.f; q('[data-jr-chips]').innerHTML = d.c.split('|').map((c) => `<i>${c}</i>`).join('');
  };
  const arrive = (i) => {
    info(i); const mx = visited.size ? Math.max(...visited) : -1;
    if (i > mx) { for (let k = mx + 1; k <= i; k++) visited.add(k); } else visited.add(i);
    visited.forEach((k) => sts[k].classList.add('is-visited'));
    diary.innerHTML = [...visited].sort((a, b) => a - b).map((k) => `<li><b>${tpl[k].dataset.n}:</b> ${tpl[k].dataset.t}.</li>`).join('');
    reset.hidden = false; if (visited.size === tpl.length) { card.hidden = false; go.hidden = true; } else go.hidden = false;
  };
  const move = (i, cb) => {
    cancelAnimationFrame(raf); const from = pos, to = at[i];
    if (noAnim) { draw(to); arrive(i); if (cb) cb(); return; }
    const ms = Math.max(900, Math.abs(to - from) * 5), t0 = performance.now();
    const step = (t) => { const k = Math.min(1, (t - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; draw(from + (to - from) * e); if (k < 1) raf = requestAnimationFrame(step); else { arrive(i); if (cb) cb(); } };
    raf = requestAnimationFrame(step);
  };
  const stopAuto = () => { auto = false; clearTimeout(timer); go.textContent = visited.size ? '⛵ Продолжить путь' : '⛵ Отправиться в путь'; };
  const next = () => { const i = [...Array(tpl.length).keys()].find((k) => !visited.has(k)); if (i === undefined) { stopAuto(); return; } move(i, () => { if (auto) timer = setTimeout(next, 2200); }); };
  go.addEventListener('click', () => { if (auto) { stopAuto(); return; } auto = true; go.textContent = '❚❚ Пауза'; next(); });
  [...sts, ...navs].forEach((el) => { const h = () => { stopAuto(); move(Number(el.dataset.i)); }; el.addEventListener('click', h); el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); h(); } }); });
  reset.addEventListener('click', () => {
    stopAuto(); cancelAnimationFrame(raf); visited.clear(); sts.forEach((s) => s.classList.remove('is-visited', 'is-here')); draw(0); info(0); sts[0].classList.remove('is-here');
    diary.innerHTML = '<li class="jr__empty">Пока пусто — отправляйтесь в путь.</li>'; card.hidden = true; go.hidden = false; go.textContent = '⛵ Отправиться в путь'; reset.hidden = true;
  });
  draw(0); info(0); sts[0].classList.remove('is-here');
})();

/* ── Отдых мечты: фотографический маршрут, связанный с прокруткой ── */
(() => {
  const root = document.querySelector('[data-dream-journey]');
  if (!root) return;
  const steps = [...root.querySelectorAll('[data-dream-step]')];
  const images = [...root.querySelectorAll('[data-dream-image]')];
  const navs = [...root.querySelectorAll('[data-dream-to]')];
  const title = root.querySelector('[data-dream-title]');
  const feel = root.querySelector('[data-dream-feel]');
  const count = root.querySelector('[data-dream-count]');
  const line = root.querySelector('[data-dream-line]');
  const length = line.getTotalLength();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = -1;
  let raf = null;
  line.style.strokeDasharray = String(length);
  line.style.strokeDashoffset = String(length);

  const show = (index) => {
    if (index === current) return;
    current = index;
    steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
    images.forEach((img, i) => img.classList.toggle('is-active', i === index));
    navs.forEach((button, i) => {
      if (i === index) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    title.textContent = steps[index].querySelector('h3').textContent;
    feel.textContent = steps[index].querySelector('blockquote').textContent.replace('Ощущение: ', '');
    count.textContent = `Остановка ${String(index + 1).padStart(2, '0')} / ${String(steps.length).padStart(2, '0')}`;
    line.style.strokeDashoffset = String(length * (1 - index / (steps.length - 1)));
  };

  const update = () => {
    raf = null;
    if (innerWidth <= 850) return;
    const focusLine = innerHeight * .46;
    let best = 0;
    let distance = Infinity;
    steps.forEach((step, i) => {
      const rect = step.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const d = Math.abs(center - focusLine);
      if (d < distance) { best = i; distance = d; }
    });
    show(best);
  };
  const requestUpdate = () => { if (!raf) raf = requestAnimationFrame(update); };
  navs.forEach(button => button.addEventListener('click', () => {
    steps[Number(button.dataset.dreamTo)].scrollIntoView({ behavior: reduce ? 'instant' : 'smooth', block: 'center' });
  }));
  addEventListener('scroll', requestUpdate, { passive: true });
  addEventListener('resize', requestUpdate);
  show(0);
  update();
})();

/* ── Единый попап записи с программой, ценой и выбранной студией ── */
(() => {
  const dlg = document.getElementById('book-dialog');
  if (!dlg) return;
  const form = dlg.querySelector('[data-form]');
  const list = dlg.querySelector('[data-book-list]');
  const selection = dlg.querySelector('[data-book-sel]');
  const title = dlg.querySelector('h3');
  const row = (label, price = '') => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = label;
    li.append(span);
    if (price) { const b = document.createElement('b'); b.textContent = price; li.append(b); }
    list.append(li);
  };
  const open = (trigger) => {
    const program = trigger.dataset.program || '';
    const wish = trigger.dataset.wish || (program ? `Программа «${program}»` : '');
    const price = trigger.dataset.price || '';
    list.innerHTML = '';
    if (program) row(`Программа «${program}»`, price);
    else if (wish) row(wish);
    selection.hidden = !list.children.length;
    form.elements.wish.value = wish;
    if (trigger.dataset.studio !== undefined) form.elements.studio.selectedIndex = Number(trigger.dataset.studio);
    title.textContent = trigger.dataset.bookingTitle || (program ? 'Запись на программу' : 'Запись на сеанс');
    form.querySelector('.form__status').hidden = true;
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    form.elements.name.focus();
  };
  document.addEventListener('click', event => {
    const trigger = event.target.closest('a[href="#order"]');
    if (!trigger || trigger.closest('dialog')) return;
    event.preventDefault();
    open(trigger);
  });
  dlg.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => dlg.close()));
  dlg.addEventListener('click', event => { if (event.target === dlg) dlg.close(); });
})();
