'use strict';

(function abonementPreview() {
  const money = (value) => Number(value).toLocaleString('ru-RU').replace(/\u00a0/g, ' ') + ' ₽';
  const rateButtons = [...document.querySelectorAll('[data-rate-kind]')];
  const rateRows = [...document.querySelectorAll('[data-rate-row]')];
  const rateNote = document.querySelector('[data-rate-note]');

  function showRates(kind) {
    rateButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.rateKind === kind)));
    rateRows.forEach((row) => {
      const minutes = Number(row.dataset.rateRow);
      const prices = abonPrices[kind][minutes];
      row.querySelectorAll('[data-count]').forEach((cell) => {
        const count = Number(cell.dataset.count);
        const total = prices[count];
        cell.innerHTML = `<b>${money(total)}</b><small>${money(Math.round(total / count))} за сеанс</small>`;
      });
      row.querySelector('h3').textContent = `${minutes} минут${kind === 'morning' ? ' · утро' : ''}`;
      row.querySelector('[data-rate-per]').textContent = 'Цена за сеанс — под каждым пакетом';
    });
    rateNote.textContent = kind === 'morning'
      ? 'Утренний абонемент действует по будням с 9:00 до 15:00 по местному времени. Скидка до 22%.'
      : 'Обычный абонемент действует в любое время работы студии: ежедневно с 9:00 до 21:00.';
  }

  rateButtons.forEach((button) => button.addEventListener('click', () => showRates(button.dataset.rateKind)));

  const calculator = document.querySelector('[data-abon]');
  document.querySelectorAll('[data-preset-count]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!calculator) return;
      const values = {
        kind: button.dataset.presetKind,
        dur: button.dataset.presetDuration,
        cnt: button.dataset.presetCount
      };
      Object.entries(values).forEach(([name, value]) => {
        const input = calculator.querySelector(`[name="${name}"][value="${value}"]`);
        if (input) input.checked = true;
      });
      calculator.dispatchEvent(new Event('change', { bubbles: true }));
      document.getElementById('choose').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
