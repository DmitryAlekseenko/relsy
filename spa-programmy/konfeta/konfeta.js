'use strict';

(function focusPicker() {
  const root = document.querySelector('[data-focus-picker]');
  if (!root) return;

  const descriptions = {
    'Гладкость кожи': 'Скрабирование и обёртывания дополняют массаж и делают уход более полным.',
    'Лёгкость в теле': 'В курсе сочетаются лимфодренажная и антицеллюлитная техники. Интенсивность обсудите с мастером.',
    'Работа с силуэтом': 'Десять последовательных процедур помогают выстроить регулярную заботу о выбранных зонах.'
  };
  const buttons = [...root.querySelectorAll('[data-focus]')];
  const title = root.querySelector('[data-focus-title]');
  const copy = root.querySelector('[data-focus-copy]');
  const book = root.querySelector('[data-focus-book]');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const focus = button.dataset.focus;
      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      title.textContent = focus;
      copy.textContent = descriptions[focus];
      book.dataset.book = `Курс «Конфета». Акцент: ${focus.toLowerCase()}`;
    });
  });
})();
