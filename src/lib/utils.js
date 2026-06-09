 import { formatRelative, differenceInCalendarDays, format } from "date-fns";

export const getInitials = (name = "") => {
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (parts.length > 1 ? first + last : first).toUpperCase();
};


export const formatRelativeDate = (dateInput) => {
  if (!dateInput) return "N/A";
  
  const date = new Date(dateInput);
  const now = new Date();
  const diff = Math.abs(differenceInCalendarDays(now, date));

  if (diff < 7) {
    const result = formatRelative(date, now);
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  return format(date, "dd-MM-yyyy hh:mm:ss a");
};
export const getCurrencySymbol = (currency = "NGN") => {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .formatToParts(0)
    .find((p) => p.type === "currency")?.value ?? currency;
};


export const fmtAmount = (val, currency = "NGN") => {
  const symbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : "₦";
  return `${symbol}${(val ).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
};

export const getFullName = (user) => {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || "N/A";
};




// utils/devtoolOverlay.js

// utils/devtoolOverlay.js

const TOTAL = 5;
let timer = null;
let redirectScheduled = false;

function getOrCreateOverlay() {
  let overlay = document.getElementById('dev-overlay');
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = 'dev-overlay';
  overlay.innerHTML = `
    <div class="dtov-icon-row">
      <svg class="dtov-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3L4 7v5c0 5.25 3.5 10.1 8 11 4.5-.9 8-5.75 8-11V7L12 3z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none"/>
      </svg>
      <div>
        <div class="dtov-title">DevTools Detected</div>
        <div class="dtov-subtitle">Redirecting you shortly</div>
      </div>
    </div>

    <div class="dtov-ring-wrap">
      <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(-90deg); position: absolute; inset: 0;">
        <circle class="dtov-ring-bg" cx="40" cy="40" r="35"/>
        <circle class="dtov-ring-track" id="dtov-ring" cx="40" cy="40" r="35"/>
      </svg>
      <div class="dtov-ring-label">
        <span class="dtov-ring-num" id="dtov-num">${TOTAL}</span>
        <span class="dtov-ring-unit">sec</span>
      </div>
    </div>

    <div class="dtov-bar-wrap">
      <div class="dtov-bar-fill" id="dtov-bar"></div>
    </div>

    <div class="dtov-msg">Redirecting to <span id="dtov-route">/not-found</span></div>
    <div class="dtov-tag" id="dtov-type">type: —</div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #dev-overlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      background: rgba(10,10,10,0.97);
      backdrop-filter: blur(6px);
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 24px;
      font-family: monospace;
    }
    #dev-overlay.visible { display: flex; }
    .dtov-icon-row { display: flex; align-items: center; gap: 12px; }
    .dtov-shield { width: 44px; height: 44px; color: #e24b4a; animation: dtov-pulse 1.4s ease-in-out infinite; }
    .dtov-title { font-size: 20px; font-weight: 700; color: #f0f0f0; text-transform: uppercase; letter-spacing: 0.03em; }
    .dtov-subtitle { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.08em; }
    .dtov-ring-wrap { position: relative; width: 120px; height: 120px; }
    .dtov-ring-bg { stroke: #2a2a2a; fill: none; stroke-width: 6; }
    .dtov-ring-track {
      fill: none;
      stroke: #e24b4a;
      stroke-width: 6;
      stroke-linecap: round;
      stroke-dasharray: 220;
      stroke-dashoffset: 220;  /* starts empty, fills toward 0 */
      transition: stroke-dashoffset 1s linear;
    }
    .dtov-ring-label { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .dtov-ring-num { font-size: 38px; font-weight: 700; color: #f0f0f0; line-height: 1; }
    .dtov-ring-unit { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 0.1em; }
    .dtov-bar-wrap { width: 260px; height: 3px; background: #1a1a1a; border-radius: 2px; overflow: hidden; }
    .dtov-bar-fill { height: 100%; background: #e24b4a; border-radius: 2px; width: 0%; transition: width 1s linear; }
    .dtov-msg { font-size: 13px; color: #555; }
    .dtov-msg span { color: #e24b4a; }
    .dtov-tag { font-size: 11px; color: #333; }
    @keyframes dtov-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
  `;

  document.head.appendChild(style);
  document.body.appendChild(overlay);
  return overlay;
}

const CIRCUMFERENCE = 2 * Math.PI * 35;

function resetVisuals(numEl, ring, bar) {
  numEl.textContent = TOTAL;
  ring.style.transition = 'none';
  ring.style.strokeDashoffset = CIRCUMFERENCE; // empty
  bar.style.transition = 'none';
  bar.style.width = '0%';
}

export function triggerOverlay(type = 'unknown', redirectUrl = '/not-found') {
  // Clear any running countdown
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  redirectScheduled = false;

  const overlay = getOrCreateOverlay();
  const numEl = document.getElementById('dtov-num');
  const ring = document.getElementById('dtov-ring');
  const bar = document.getElementById('dtov-bar');

  document.getElementById('dtov-type').textContent = `type: ${type}`;
  document.getElementById('dtov-route').textContent = redirectUrl;

  resetVisuals(numEl, ring, bar);
  overlay.classList.add('visible');

  let remaining = TOTAL;

  // Double rAF so the transition reset is painted before we re-enable it
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const frac = 1 / TOTAL;
      ring.style.transition = 'stroke-dashoffset 1s linear';
      ring.style.strokeDashoffset = CIRCUMFERENCE * (1 - frac); // fill first step
      bar.style.transition = 'width 1s linear';
      bar.style.width = `${frac * 100}%`;
    });
  });

  timer = setInterval(() => {
    remaining--;
    numEl.textContent = remaining;

    const frac = (TOTAL - remaining) / TOTAL;
    // strokeDashoffset goes from CIRCUMFERENCE → 0 as frac goes 0 → 1
    ring.style.strokeDashoffset = CIRCUMFERENCE * (1 - frac);
    bar.style.width = `${frac * 100}%`;

    if (remaining <= 0) {
      clearInterval(timer);
      timer = null;
      redirectScheduled = true;
      window.location.href = redirectUrl;
    }
  }, 1000); // ← was 5000, must be 1000 for per-second ticks
}

export function dismissOverlay() {
  // Called by disable-devtool's ondevtoolclose (if available) or polled
  if (redirectScheduled) return; // already navigating, don't interrupt

  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  const overlay = document.getElementById('dev-overlay');
  if (!overlay) return;

  overlay.classList.remove('visible');

  // Reset ring and bar for next open
  const ring = document.getElementById('dtov-ring');
  const bar = document.getElementById('dtov-bar');
  const numEl = document.getElementById('dtov-num');
  if (ring && bar && numEl) resetVisuals(numEl, ring, bar);
}
