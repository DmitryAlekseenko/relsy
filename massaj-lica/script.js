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
    cards.forEach((c) => c.classList.toggle('is-hidden', f !== 'all' && !c.dataset.c.split(' ').includes(f)));
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
    form.dataset.sent = ok ? '1' : '';
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
    !el.closest('.imm') && !el.closest('dialog') && !all.some((o) => o !== el && o.contains(el)));

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
  tiles.forEach((t) => t.addEventListener('click', () => select(t)));
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
    const sb = dlg.querySelector('[data-book-sel]'); if (sb) sb.hidden = false;
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    dlg.querySelector('[name=name]').focus();
  };
  root.querySelector('[data-open-booking]').addEventListener('click', open);
  dlg.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => dlg.close()));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); }); // клик по затемнению
})();

/* ── Попап записи: открывается по любой кнопке «Записаться» (href="#order") ── */
(function booking() {
  const dlg = document.getElementById('book-dialog');
  if (!dlg) return;
  const form = dlg.querySelector('[data-form]');
  const box = dlg.querySelector('[data-book-sel]');
  const list = dlg.querySelector('[data-book-list]');
  const fmt = (n) => Number(n).toLocaleString('ru-RU').replace(/\u00a0/g, ' ') + ' ₽';
  const txt = (el) => (el ? el.textContent.replace(/\s+/g, ' ').replace(/\s*→$/, '').trim() : '');

  // что выбрал гость: строки для окна, текст в поле «Пожелания», студия
  function context(a) {
    const tag = a.closest('[data-book]');
    if (tag) return { rows: [[tag.dataset.book, tag.dataset.price || '']], wish: `Программа: ${tag.dataset.book}` };
    const b = a.closest('[data-builder]');
    if (b) {
      const t = b.querySelector('[name=time]:checked');
      const techs = [...b.querySelectorAll('[name=tech]:checked')].map((i) => i.value.toLowerCase());
      const ex = [...b.querySelectorAll('input[type=checkbox][data-price]:checked')];
      const total = txt(b.querySelector('[data-total]'));
      const rows = [[`Сеанс ${t.value} минут`, fmt(t.dataset.price)]];
      if (techs.length) rows.push([`Техника: ${techs.join(', ')}`, '']);
      ex.forEach((i) => rows.push([i.value, '+' + fmt(i.dataset.price)]));
      rows.push(['Итого', total, 'is-total']);
      return { rows, wish: `Конструктор: ${t.value} минут${techs.length ? '; ' + techs.join(', ') : ''}${ex.length ? '; ' + ex.map((i) => i.value).join(', ') : ''}. Итого ${total}` };
    }
    const card = a.closest('.card');
    if (card) {
      const id = card.closest('section').id;
      const kind = id === 'services' ? 'Массаж' : id === 'programs' ? 'Программа' : 'Мастер';
      const label = `${kind}: ${txt(card.querySelector('h3'))}`;
      return { rows: [[label, txt(card.querySelector('.buy b, .price'))]], wish: label, place: txt(card.querySelector('.card__meta')) };
    }
    const pc = a.closest('.price-card');
    if (pc) {
      const label = `Абонемент ${txt(pc.querySelector('h3'))}`;
      return { rows: [[label, txt(pc.querySelector(':scope > b'))]], wish: label };
    }
    const panel = a.closest('#contacts .panel');
    if (panel) return { rows: [], wish: '', place: txt(panel.querySelector('h3')) };
    return { rows: [], wish: '' };
  }

  function open(a) {
    const c = context(a);
    form.elements.wish.value = c.wish || '';
    if (/Ленин/.test(c.place || '')) form.elements.studio.selectedIndex = 0;
    if (/Игнатьев/.test(c.place || '')) form.elements.studio.selectedIndex = 1;
    list.innerHTML = '';
    c.rows.forEach(([label, price, cls]) => {
      const li = document.createElement('li');
      if (cls) li.className = cls;
      const s = document.createElement('span');
      s.textContent = label;
      li.append(s);
      if (price) { const b = document.createElement('b'); b.textContent = price; li.append(b); }
      list.append(li);
    });
    box.hidden = !c.rows.length;
    form.querySelector('.form__status').hidden = true;
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    form.elements.name.focus();
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href="#order"]');
    if (!a || a.closest('dialog')) return;
    e.preventDefault();
    open(a);
  });
  dlg.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => dlg.close()));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); }); // клик по затемнению
  dlg.addEventListener('close', () => {
    if (form.dataset.sent !== '1') return;
    form.reset(); form.dataset.sent = ''; form.querySelector('.form__status').hidden = true;
  });
})();

/* ── Картинка не загрузилась: прячем её, остаётся фон карточки ── */
(function brokenImages() {
  const mark = (img) => img.classList.add('is-broken');
  document.addEventListener('error', (e) => { if (e.target.tagName === 'IMG') mark(e.target); }, true);
  document.querySelectorAll('img').forEach((i) => { if (i.complete && !i.naturalWidth) mark(i); });
})();
