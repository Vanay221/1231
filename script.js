'use strict';

// Дата приезда Киры: 20 ноября 2026, 20:41 по времени Гомеля (UTC+3).
// Явное смещение +03:00: отсчёт будет точным в любом часовом поясе.
const ARRIVAL = new Date('2026-11-20T20:41:00+03:00').getTime();

const digits = {
  days: document.getElementById('days'),
  hours: document.getElementById('hours'),
  minutes: document.getElementById('minutes'),
  seconds: document.getElementById('seconds')
};
const headline = document.querySelector('h1');
const intro = document.querySelector('.intro');
const kissButton = document.getElementById('kissButton');
const effectLayer = document.getElementById('effectLayer');
const kissMessage = document.getElementById('kissMessage');
const kissCount = document.getElementById('kissCount');
const flash = document.getElementById('screenFlash');
const announcer = document.getElementById('announcer');
let count = 0;
let arrived = false;
let lastBurstAt = 0;

function pad(value) { return String(value).padStart(2, '0'); }

function updateCountdown() {
  const diff = Math.max(0, ARRIVAL - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  digits.days.textContent = pad(Math.floor(totalSeconds / 86400));
  digits.hours.textContent = pad(Math.floor((totalSeconds % 86400) / 3600));
  digits.minutes.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
  digits.seconds.textContent = pad(totalSeconds % 60);
  if (diff === 0 && !arrived) {
    arrived = true;
    headline.innerHTML = 'Кира уже <span class="highlight-name">в Гомеле!</span> ♡';
    intro.textContent = 'Всё, отсчёт закончился. Теперь самое время для объятий, улыбок и настоящей встречи.';
    kissMessage.textContent = 'Лучший момент — прямо сейчас 💗';
    announcer.textContent = 'Кира приехала!';
    setTimeout(() => burst(window.innerWidth / 2, window.innerHeight / 2, true), 200);
  }
}
updateCountdown();
setInterval(updateCountdown, 1000);

// Звёзды создаются один раз и не требуют изображений/интернета.
const starField = document.getElementById('starField');
for (let i = 0; i < 75; i++) {
  const star = document.createElement('span');
  star.className = 'star';
  star.style.left = `${Math.random() * 100}%`;
  star.style.top = `${Math.random() * 100}%`;
  star.style.setProperty('--duration', `${2.5 + Math.random() * 5}s`);
  star.style.setProperty('--delay', `${-Math.random() * 6}s`);
  if (Math.random() > .8) { star.style.width = '3px'; star.style.height = '3px'; }
  starField.append(star);
}

const responses = [
  'Этот поцелуй уже летит к Кире 💌',
  'Осторожно, ещё немного нежности 💗',
  'Кажется, кто-то очень соскучился 😉',
  'До встречи ещё ближе — хотя бы на один поцелуй 💋',
  'И ещё один. Просто потому что можно ♡',
  'Поймала? Тогда держи следующий 😘'
];
const emojis = ['💗', '💕', '💖', '💋', '😘', '♥', '💞', '♡', '✨'];

function burst(x, y, big = false) {
  // Ограничение частоты, чтобы удержание клавиши не перегружало страницу.
  const now = Date.now();
  if (now - lastBurstAt < 130 && !big) return;
  lastBurstAt = now;
  const amount = big ? 45 : 20;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const particleCount = reduced ? Math.min(amount, 4) : amount;
  const originX = Math.min(window.innerWidth - 24, Math.max(24, x));
  const originY = Math.min(window.innerHeight - 24, Math.max(24, y));

  for (let i = 0; i < particleCount; i++) {
    const item = document.createElement('span');
    item.className = 'heart-particle';
    item.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    item.style.setProperty('--sx', `${originX}px`);
    item.style.setProperty('--sy', `${originY}px`);
    const angle = (Math.PI * 2 * i / particleCount) + (Math.random() - .5) * .5;
    const radius = (big ? 160 : 105) + Math.random() * (big ? 260 : 170);
    item.style.setProperty('--dx', `${Math.cos(angle) * radius}px`);
    item.style.setProperty('--dy', `${Math.sin(angle) * radius - 90}px`);
    item.style.setProperty('--rot', `${Math.random() * 130 - 65}deg`);
    item.style.setProperty('--scale', `${.75 + Math.random() * 1.1}`);
    item.style.setProperty('--life', `${1200 + Math.random() * 950}ms`);
    item.style.setProperty('--size', `${18 + Math.random() * 20}px`);
    effectLayer.append(item);
    item.addEventListener('animationend', () => item.remove(), { once: true });
    // Если анимации отключены, всё равно удаляем элементы из DOM.
    setTimeout(() => item.remove(), 2300);
  }

  const xPct = Math.round(originX / window.innerWidth * 100);
  const yPct = Math.round(originY / window.innerHeight * 100);
  flash.style.setProperty('--flash-x', `${xPct}%`);
  flash.style.setProperty('--flash-y', `${yPct}%`);
  flash.classList.remove('show');
  void flash.offsetWidth;
  flash.classList.add('show');
  setTimeout(() => flash.classList.remove('show'), 150);

  count++;
  kissCount.textContent = `${count} 💌`;
  kissMessage.textContent = responses[(count - 1) % responses.length];
  if (count === 1 || count % 10 === 0) announcer.textContent = `Отправлено поцелуев: ${count}`;
}

kissButton.addEventListener('click', event => {
  event.stopPropagation();
  const rect = kissButton.getBoundingClientRect();
  burst(rect.left + rect.width / 2, rect.top + rect.height / 2, count !== 0 && (count + 1) % 10 === 0);
});

document.addEventListener('keydown', event => {
  if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
  const target = event.target;
  if (target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
  if ((event.key === ' ' || event.key === 'Enter') && target === kissButton) return; // браузер сам нажмёт кнопку
  burst(window.innerWidth * (.35 + Math.random() * .30), window.innerHeight * (.33 + Math.random() * .29), event.key.toLowerCase() === 'k' || event.key.toLowerCase() === 'л');
});

// Можно кликать и касаться любой пустой области страницы.
document.addEventListener('pointerdown', event => {
  if (event.target instanceof Element && event.target.closest('button, a')) return;
  burst(event.clientX, event.clientY);
});
