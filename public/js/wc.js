function defineComponents() {

/** ══════════════════════════════════════════════════════════════════
     WEB COMPONENT DEFINITIONS
     All 13 components registered after polyfill is ready via
     WebComponents.waitFor() — the canonical safe-registration pattern
     ══════════════════════════════════════════════════════════════════ -->
*/

  /* ──────────────────────────────────────────────────────────────
     Shared utilities
  ────────────────────────────────────────────────────────────── */

  /** CSS injected at the top of every shadow root */
  const BASE_CSS = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :host { display: block; font-family: var(--font-body, sans-serif); }
  `;

  /** Escape attribute values used in innerHTML */
  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Map icon-variant attribute → background color token */
  const ICON_BG = {
    terra: 'rgba(196,96,58,0.12)',
    sage:  'rgba(122,158,126,0.15)',
    ochre: 'rgba(212,168,75,0.14)',
    bark:  'rgba(61,43,31,0.08)',
  };


  /* ══════════════════════════════════════════════════════════════
     1. <pens-banner>
        Terracotta announcement strip. Uses a <slot> for content.
        ::slotted(a) styles the link inside the banner.
     ══════════════════════════════════════════════════════════════ */
  class PensBanner extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: 'open' }); }
    connectedCallback() {
      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}
          :host { background: var(--terracotta); color: #fff; }
          .wrap {
            text-align: center; padding: 10px 16px;
            font-size: 13px; font-weight: 500;
            letter-spacing: 0.02em; line-height: 1.4;
          }
          ::slotted(a) { color: #ffe9c4; text-underline-offset: 3px; }
        </style>
        <div class="wrap"><slot></slot></div>
      `;
    }
  }
  customElements.define('pens-banner', PensBanner);


  /* ══════════════════════════════════════════════════════════════
     2. <pens-nav page="payments">
        Sticky nav with desktop links + hamburger mobile drawer.
        All state (open/closed) is encapsulated in shadow DOM.
        page attribute highlights the active link.
     ══════════════════════════════════════════════════════════════ */
  class PensNav extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._open = false;
    }

    connectedCallback() {
      this._render();
      this._attachEvents();
    }

    _links() {
      const page = this.getAttribute('page') || '';
      const items = [
        { href: 'index.html#about',   label: 'About' },
        { href: 'index.html#program', label: 'Program' },
        { href: 'index.html#classes', label: 'Classes' },
        { href: 'payments',           label: 'Payments', key: 'payments' },
      ];
      return items.map(l => ({
        ...l,
        active: (l.key === page),
      }));
    }

    _render() {
      const links = this._links();
      const desktopLinks = links.map(l =>
        `<li><a href="${esc(l.href)}" ${l.active ? 'class="active"' : ''}>${l.label}</a></li>`
      ).join('');
      const mobileLinks = links.map(l =>
        `<li><a href="${esc(l.href)}" class="ml">${l.label}</a></li>`
      ).join('');

      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}
          :host { display: block; position: sticky; top: 0; z-index: 200; }
          nav {
            background: rgba(253,246,237,0.96);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            border-bottom: 1px solid rgba(122,158,126,0.2);
            height: var(--nav-h, 64px);
            display: flex; align-items: center;
            justify-content: space-between;
            padding: 0 5vw; gap: 16px;
          }
          .logo {
            font-family: var(--font-display);
            font-size: 1.25rem; color: var(--bark);
            text-decoration: none; white-space: nowrap; flex-shrink: 0;
          }
          .logo span { color: var(--terracotta); }
          ul { display: flex; align-items: center; gap: 1.8rem; list-style: none; }
          ul a {
            font-size: 14px; font-weight: 500;
            color: var(--bark-light); text-decoration: none;
            letter-spacing: 0.03em; transition: color 0.2s; white-space: nowrap;
          }
          ul a:hover, ul a.active { color: var(--terracotta); }
          .cta {
            background: var(--sage) !important; color: #fff !important;
            padding: 8px 20px; border-radius: 100px; transition: background 0.2s !important;
          }
          .cta:hover { background: var(--sage-dark) !important; }

          /* Hamburger */
          .burger {
            display: none; flex-direction: column; justify-content: center;
            align-items: center; gap: 5px; width: 40px; height: 40px;
            background: none; border: none; cursor: pointer; padding: 4px;
            border-radius: 8px; transition: background 0.2s; flex-shrink: 0;
          }
          .burger:hover { background: rgba(61,43,31,0.07); }
          .burger span {
            display: block; width: 22px; height: 2px;
            background: var(--bark); border-radius: 2px;
            transition: transform 0.3s, opacity 0.3s; transform-origin: center;
          }
          .burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
          .burger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
          .burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

          /* Mobile drawer */
          .drawer {
            position: fixed;
            top: var(--nav-h, 64px); left: 0; right: 0;
            background: var(--warm-white);
            border-bottom: 2px solid rgba(122,158,126,0.2);
            z-index: 199; max-height: 0; overflow: hidden;
            transition: max-height 0.36s ease, padding 0.3s;
            box-shadow: 0 8px 30px rgba(61,43,31,0.1);
          }
          .drawer.open { max-height: 520px; padding: 8px 0 24px; }
          .drawer ul { flex-direction: column; gap: 0; }
          .drawer ul a {
            display: block; padding: 13px 6vw; font-size: 16px;
            border-bottom: 1px solid rgba(61,43,31,0.06);
          }
          .drawer ul li:last-child a { border-bottom: none; }
          .drawer ul a:hover { background: var(--mist); }
          .drawer-cta {
            display: block; margin: 16px 6vw 0;
            background: var(--terracotta); color: #fff;
            text-align: center; padding: 14px 20px;
            border-radius: 12px; font-size: 15px; font-weight: 500;
            text-decoration: none; transition: background 0.2s;
          }
          .drawer-cta:hover { background: #a84e2e; }

          @media (max-width: 900px) {
            ul { display: none; }
            .burger { display: flex; }
          }
        </style>

        <nav>
          <a class="logo" href="index.html">Soquel <span>PENS</span></a>
          <ul>${desktopLinks}<li><a href="index.html#enroll" class="cta">Enroll Now</a></li></ul>
          <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </nav>

        <div class="drawer" id="drawer">
          <ul>${mobileLinks}</ul>
          <a href="index.html#enroll" class="drawer-cta ml">🌱 Apply for Enrollment</a>
        </div>
      `;
    }

    _attachEvents() {
      const sr = this.shadowRoot;
      const burger = sr.getElementById('burger');
      const drawer = sr.getElementById('drawer');

      const close = () => {
        this._open = false;
        burger.classList.remove('open');
        drawer.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      };
      const toggle = () => {
        this._open = !this._open;
        burger.classList.toggle('open', this._open);
        drawer.classList.toggle('open', this._open);
        burger.setAttribute('aria-expanded', String(this._open));
      };

      burger.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
      sr.querySelectorAll('.ml').forEach(l => l.addEventListener('click', close));
      document.addEventListener('click', (e) => {
        if (!this.contains(e.target)) close();
      });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    }
  }
  customElements.define('pens-nav', PensNav);


  /* ══════════════════════════════════════════════════════════════
     3. <pens-page-hero heading="" heading-accent="" subheading="" breadcrumb="">
        Dark bark hero with breadcrumb trail, animated h1, and subheading.
        heading + heading-accent are joined with the accent in <em>.
     ══════════════════════════════════════════════════════════════ */
  class PensPageHero extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: 'open' }); }
    connectedCallback() {
      const heading      = this.getAttribute('heading') || '';
      const accent       = this.getAttribute('heading-accent') || '';
      const subheading   = this.getAttribute('subheading') || '';
      const breadcrumb   = this.getAttribute('breadcrumb') || 'Page';

      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}
          :host { background: var(--bark); display: block; overflow: hidden; position: relative; }
          .bg {
            position: absolute; inset: 0; pointer-events: none;
            background:
              radial-gradient(ellipse 60% 80% at 90% 50%, rgba(122,158,126,0.14) 0%, transparent 70%),
              radial-gradient(ellipse 40% 60% at 10% 80%, rgba(212,168,75,0.1) 0%, transparent 65%);
          }
          .inner {
            position: relative; max-width: 1140px; margin: 0 auto;
            padding: 72px 5vw 64px;
          }
          .crumb {
            display: flex; align-items: center; gap: 8px;
            font-size: 12.5px; color: rgba(253,246,237,0.45);
            margin-bottom: 20px;
          }
          .crumb a { color: rgba(253,246,237,0.45); text-decoration: none; transition: color 0.2s; }
          .crumb a:hover { color: var(--ochre); }
          .crumb-sep { color: rgba(253,246,237,0.25); }
          h1 {
            font-family: var(--font-display);
            font-size: clamp(2.2rem, 5vw, 3.8rem);
            color: var(--cream); line-height: 1.15; margin-bottom: 16px;
            opacity: 0; animation: fadeUp 0.7s 0.1s ease forwards;
          }
          h1 em { font-style: italic; color: var(--ochre); }
          p {
            color: rgba(253,246,237,0.62); font-size: 1.05rem;
            max-width: 520px; line-height: 1.65;
            opacity: 0; animation: fadeUp 0.7s 0.25s ease forwards;
          }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @media (max-width: 600px) { .inner { padding: 52px 5vw 44px; } }
        </style>
        <div class="bg"></div>
        <div class="inner">
          <div class="crumb">
            <a href="index.html">Home</a>
            <span class="crumb-sep">›</span>
            <span style="color:rgba(253,246,237,0.65);">${esc(breadcrumb)}</span>
          </div>
          <h1>${esc(heading)} <em>${esc(accent)}</em></h1>
          <p>${esc(subheading)}</p>
        </div>
      `;
    }
  }
  customElements.define('pens-page-hero', PensPageHero);


  /* ══════════════════════════════════════════════════════════════
     4. <pens-alert variant="default|info" icon="📅">
        Alert/callout box. Slot receives the message content.
        variant="info" renders in sage-green; default is terracotta.
     ══════════════════════════════════════════════════════════════ */
  class PensAlert extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: 'open' }); }
    connectedCallback() {
      const variant = this.getAttribute('variant') || 'default';
      const icon    = this.getAttribute('icon') || '';
      const isInfo  = variant === 'info';

      const bg     = isInfo ? 'rgba(122,158,126,0.1)'    : 'rgba(196,96,58,0.08)';
      const border = isInfo ? 'rgba(122,158,126,0.28)'   : 'rgba(196,96,58,0.22)';

      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}
          :host { display: block; }
          .wrap {
            display: flex; gap: 14px; align-items: flex-start;
            background: ${bg};
            border: 1.5px solid ${border};
            border-radius: 14px; padding: 18px 20px;
            font-size: 14.5px; line-height: 1.6;
          }
          .icon { font-size: 20px; flex-shrink: 0; line-height: 1.5; }
          ::slotted(strong) { color: ${isInfo ? 'var(--sage-dark)' : 'var(--terracotta)'}; }
        </style>
        <div class="wrap">
          ${icon ? `<span class="icon">${icon}</span>` : ''}
          <div><slot></slot></div>
        </div>
      `;
    }
  }
  customElements.define('pens-alert', PensAlert);


  /* ══════════════════════════════════════════════════════════════
     5. <pens-accordion icon="" title="" subtitle="" amount=""
                        icon-variant="terra|sage|ochre|bark" open>
        Animated expand/collapse card. Slot receives body content.
        State (open/closed) is managed via _open property.
        _render() sets initial HTML; _update() only toggles classes
        so the slot distribution is never destroyed.
     ══════════════════════════════════════════════════════════════ */
  class PensAccordion extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._open = false;
    }

    connectedCallback() {
      this._open = this.hasAttribute('open');
      this._render();
      this.shadowRoot.querySelector('.header').addEventListener('click', () => {
        this._open = !this._open;
        this._update();
      });
    }

    _render() {
      const icon    = this.getAttribute('icon') || '📄';
      const title   = esc(this.getAttribute('title') || '');
      const subtitle= esc(this.getAttribute('subtitle') || '');
      const amount  = esc(this.getAttribute('amount') || '');
      const iv      = this.getAttribute('icon-variant') || 'terra';
      const iconBg  = ICON_BG[iv] || ICON_BG.terra;

      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}
          :host { display: block; }
          .card {
            background: var(--warm-white);
            border-radius: var(--radius-card, 18px);
            border: 1.5px solid rgba(61,43,31,0.08);
            overflow: hidden;
            transition: box-shadow 0.25s, transform 0.25s;
          }
          .card:hover { box-shadow: 0 12px 36px rgba(61,43,31,0.09); transform: translateY(-1px); }
          .header {
            display: flex; align-items: center;
            justify-content: space-between; gap: 16px;
            padding: 22px 24px; cursor: pointer; user-select: none;
          }
          .header-left { display: flex; align-items: center; gap: 16px; }
          .icon {
            width: 46px; height: 46px; border-radius: 12px;
            display: grid; place-items: center; font-size: 22px;
            flex-shrink: 0; background: ${iconBg};
          }
          .title   { font-family: var(--font-display); font-size: 1.1rem; color: var(--bark); margin-bottom: 2px; }
          .subtitle{ font-size: 13px; color: var(--bark-light); }
          .amount  { font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; color: var(--terracotta); white-space: nowrap; }
          .chevron { font-size: 16px; color: var(--bark-light); transition: transform 0.3s; flex-shrink: 0; }
          .card.open .chevron { transform: rotate(180deg); }

          /* Body animates via max-height */
          .body { max-height: 0; overflow: hidden; transition: max-height 0.4s ease; }
          .card.open .body { max-height: 800px; }
          .body-inner {
            padding: 0 24px 24px; padding-top: 20px;
            border-top: 1px solid rgba(61,43,31,0.07);
          }
          /* Style slotted paragraphs */
          ::slotted(p) { font-size: 14.5px; color: var(--bark-light); margin-bottom: 14px; line-height: 1.6; }
          ::slotted(p:last-of-type) { margin-bottom: 0; }
          ::slotted(pens-memo)  { display: block; margin: 12px 0 16px; }
          ::slotted(pens-btn)   { display: inline-block; margin-top: 18px; }
          ::slotted(pens-alert) { display: block; margin-top: 14px; }

          @media (max-width: 600px) { .amount { display: none; } }
        </style>
        <div class="card ${this._open ? 'open' : ''}">
          <div class="header">
            <div class="header-left">
              <div class="icon">${icon}</div>
              <div>
                <div class="title">${title}</div>
                ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
              </div>
            </div>
            ${amount ? `<div class="amount">${amount}</div>` : ''}
            <div class="chevron">▾</div>
          </div>
          <div class="body">
            <div class="body-inner"><slot></slot></div>
          </div>
        </div>
      `;
    }

    /** Toggles open state WITHOUT re-rendering (preserves slot) */
    _update() {
      this.shadowRoot.querySelector('.card').classList.toggle('open', this._open);
    }
  }
  customElements.define('pens-accordion', PensAccordion);


  /* ══════════════════════════════════════════════════════════════
     6. <pens-tuition-table>
        Self-contained tuition schedule table. Fully encapsulated —
        no attributes needed; data is baked into the component.
     ══════════════════════════════════════════════════════════════ */
  class PensTuitionTable extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: 'open' }); }
    connectedCallback() {
      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}
          :host { display: block; margin: 28px 0; }
          table {
            width: 100%; border-collapse: collapse;
            background: var(--warm-white);
            border-radius: var(--radius-card, 18px);
            overflow: hidden;
            border: 1.5px solid rgba(61,43,31,0.08);
          }
          thead tr { background: var(--bark); }
          th {
            padding: 14px 18px; text-align: left;
            font-size: 11px; font-weight: 500;
            letter-spacing: 0.08em; text-transform: uppercase;
            color: rgba(253,246,237,0.55);
          }
          tbody tr { border-bottom: 1px solid rgba(61,43,31,0.07); transition: background 0.15s; }
          tbody tr:last-child { border-bottom: none; }
          tbody tr:hover { background: rgba(122,158,126,0.05); }
          td { padding: 16px 18px; font-size: 14px; vertical-align: middle; }
          .name { font-weight: 500; color: var(--bark); }
          .sub  { font-size: 12px; color: var(--bark-light); margin-top: 2px; }
          .badge {
            display: inline-block; font-size: 11px; font-weight: 500;
            padding: 3px 10px; border-radius: 100px;
          }
          .mwf { background: rgba(196,96,58,0.1); color: var(--terracotta); }
          .tth { background: rgba(122,158,126,0.14); color: var(--sage-dark); }
          .price { font-family: var(--font-display); font-weight: 700; color: var(--terracotta); font-size: 1.1rem; }
          .price-sub { font-size: 12px; color: var(--bark-light); margin-top: 2px; }
          .sib { font-size: 13px; color: var(--bark-light); }

          @media (max-width: 640px) {
            .col-discount { display: none; }
          }
        </style>
        <table>
          <thead>
            <tr>
              <th>Schedule</th>
              <th>Days</th>
              <th>PayPal Total</th>
              <th class="col-discount">2nd Child</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><div class="name">MWF Class</div><div class="sub">Mon · Wed · Fri</div></td>
              <td><span class="badge mwf">MWF</span></td>
              <td><div class="price">$265.78</div><div class="price-sub">incl. 1.99% + $0.49</div></td>
              <td class="col-discount"><div class="sib">10% off lower fee</div></td>
            </tr>
            <tr>
              <td><div class="name">Tue / Thu Class</div><div class="sub">Tue · Thu</div></td>
              <td><span class="badge tth">T/TH</span></td>
              <td><div class="price" style="font-size:.95rem;">Contact treasurer</div><div class="price-sub">for current amount</div></td>
              <td class="col-discount"><div class="sib">10% off lower fee</div></td>
            </tr>
          </tbody>
        </table>
      `;
    }
  }
  customElements.define('pens-tuition-table', PensTuitionTable);


  /* ══════════════════════════════════════════════════════════════
     7. <pens-memo>
        Styled monospace memo-format example box.
        Slot receives the memo text (can include <strong> etc).
     ══════════════════════════════════════════════════════════════ */
  class PensMemo extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: 'open' }); }
    connectedCallback() {
      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}
          :host { display: block; }
          .box {
            background: var(--mist);
            border-radius: 10px;
            padding: 12px 16px;
            font-size: 13px;
            font-family: 'Courier New', monospace;
            color: var(--bark);
            letter-spacing: 0.02em;
            line-height: 1.6;
          }
          ::slotted(strong) { color: var(--terracotta); }
        </style>
        <div class="box"><slot></slot></div>
      `;
    }
  }
  customElements.define('pens-memo', PensMemo);


  /* ══════════════════════════════════════════════════════════════
     8. <pens-fee-item icon="" heading="" amount="" memo="">
        Fee card with icon, heading, description (slot), memo line,
        and amount. Used in the 2-column fees grid.
     ══════════════════════════════════════════════════════════════ */
  class PensFeeItem extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: 'open' }); }
    connectedCallback() {
      const icon    = this.getAttribute('icon') || '📄';
      const heading = this.getAttribute('heading') || '';
      const amount  = this.getAttribute('amount') || '';
      const memo    = this.getAttribute('memo') || '';

      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}
          :host { display: block; }
          .card {
            background: var(--warm-white);
            border-radius: var(--radius-card, 18px);
            padding: 20px;
            border: 1px solid rgba(61,43,31,0.07);
            display: flex; gap: 14px; align-items: flex-start;
            height: 100%;
            transition: box-shadow 0.2s, transform 0.2s;
          }
          .card:hover { box-shadow: 0 8px 28px rgba(61,43,31,0.08); transform: translateY(-2px); }
          .icon  { font-size: 20px; flex-shrink: 0; margin-top: 2px; }
          .body  { min-width: 0; }
          h4     { font-size: 14px; font-weight: 500; color: var(--bark); margin-bottom: 5px; }
          .desc  { font-size: 12.5px; color: var(--bark-light); line-height: 1.55; margin-bottom: 8px; }
          .memo  {
            background: var(--mist); border-radius: 8px;
            padding: 7px 10px; font-size: 11.5px;
            font-family: 'Courier New', monospace; color: var(--bark);
            margin: 8px 0; line-height: 1.5;
          }
          .amount {
            font-family: var(--font-display); font-size: 1.05rem;
            font-weight: 700; color: var(--terracotta);
            margin-top: 6px;
          }
          ::slotted(strong) { color: var(--terracotta); }
        </style>
        <div class="card">
          <div class="icon">${icon}</div>
          <div class="body">
            <h4>${esc(heading)}</h4>
            <div class="desc"><slot></slot></div>
            ${memo ? `<div class="memo">${esc(memo)}</div>` : ''}
            <div class="amount">${esc(amount)}</div>
          </div>
        </div>
      `;
    }
  }
  customElements.define('pens-fee-item', PensFeeItem);


  /* ══════════════════════════════════════════════════════════════
     9. <pens-quick-link href="" icon="">
        Styled link row for the Quick Pay sidebar card.
        Renders as a full-width anchor with icon, label (slot), arrow.
     ══════════════════════════════════════════════════════════════ */
  class PensQuickLink extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: 'open' }); }
    connectedCallback() {
      const href = this.getAttribute('href') || '#';
      const icon = this.getAttribute('icon') || '→';

      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}
          :host { display: block; }
          a {
            display: flex; align-items: center; gap: 10px;
            padding: 11px 14px;
            border-radius: 10px;
            background: var(--cream);
            border: 1px solid rgba(61,43,31,0.07);
            text-decoration: none; color: var(--bark);
            font-size: 13.5px; font-weight: 500;
            transition: background 0.15s, border-color 0.15s, transform 0.15s;
          }
          a:hover { background: var(--mist); border-color: rgba(122,158,126,0.3); transform: translateX(3px); }
          .ico   { font-size: 15px; flex-shrink: 0; }
          .label { flex: 1; }
          .arrow { font-size: 12px; color: var(--bark-light); }
        </style>
        <a href="${esc(href)}">
          <span class="ico">${icon}</span>
          <span class="label"><slot></slot></span>
          <span class="arrow">→</span>
        </a>
      `;
    }
  }
  customElements.define('pens-quick-link', PensQuickLink);


  /* ══════════════════════════════════════════════════════════════
     10. <pens-timeline-item date="" variant="ok|warn">
         One row in the payment timeline. Shows a colored dot,
         connecting line, date label, and description (slot).
         :host(:last-child) hides the connecting line automatically.
     ══════════════════════════════════════════════════════════════ */
  class PensTimelineItem extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: 'open' }); }
    connectedCallback() {
      const date    = esc(this.getAttribute('date') || '');
      const variant = this.getAttribute('variant') || 'ok';
      const isWarn  = variant === 'warn';
      const dotColor = isWarn ? 'var(--terracotta)' : 'var(--sage)';

      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}
          :host { display: flex; gap: 14px; padding-bottom: 18px; }
          :host(:last-child) { padding-bottom: 0; }
          .dot-col { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
          .dot  { width: 10px; height: 10px; border-radius: 50%; background: ${dotColor}; margin-top: 5px; flex-shrink: 0; }
          .line { width: 1.5px; flex: 1; background: rgba(61,43,31,0.1); margin-top: 4px; }
          :host(:last-child) .line { display: none; }
          .body { min-width: 0; padding-bottom: 4px; }
          .date {
            font-size: 11.5px; font-weight: 500;
            letter-spacing: 0.05em; text-transform: uppercase;
            color: ${isWarn ? 'var(--terracotta)' : 'var(--sage-dark)'};
            margin-bottom: 3px;
          }
          .desc { font-size: 13px; color: var(--bark-light); line-height: 1.55; }
          ::slotted(em) { font-style: italic; }
        </style>
        <div class="dot-col"><div class="dot"></div><div class="line"></div></div>
        <div class="body">
          <div class="date">${date}</div>
          <div class="desc"><slot></slot></div>
        </div>
      `;
    }
  }
  customElements.define('pens-timeline-item', PensTimelineItem);


  /* ══════════════════════════════════════════════════════════════
     11. <pens-sidebar-card heading="" variant="default|mist">
         Sticky sidebar card with heading and slot for content.
         variant="mist" gives it the green-tinted background.
     ══════════════════════════════════════════════════════════════ */
  class PensSidebarCard extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: 'open' }); }
    connectedCallback() {
      const heading = esc(this.getAttribute('heading') || '');
      const variant = this.getAttribute('variant') || 'default';
      const bg      = variant === 'mist'
        ? 'var(--mist)'
        : 'var(--warm-white)';
      const border  = variant === 'mist'
        ? 'rgba(122,158,126,0.22)'
        : 'rgba(61,43,31,0.08)';

      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}
          :host { display: block; }
          .card {
            background: ${bg};
            border-radius: var(--radius-card, 18px);
            padding: 24px 22px;
            border: 1.5px solid ${border};
          }
          h3 {
            font-family: var(--font-display); font-size: 1.05rem;
            color: var(--bark); margin-bottom: 14px;
          }
          /* Space out quick links and timeline items in the slot */
          ::slotted(pens-quick-link) { display: block; margin-bottom: 8px; }
          ::slotted(pens-quick-link:last-of-type) { margin-bottom: 0; }
          ::slotted(pens-timeline-item) { display: flex; }
          ::slotted(p) { font-size: 13.5px; color: var(--bark-light); line-height: 1.6; margin-bottom: 12px; }
          ::slotted(p:last-child) { margin-bottom: 0; }
          ::slotted(pens-btn) { display: block; }
        </style>
        <div class="card">
          <h3>${heading}</h3>
          <slot></slot>
        </div>
      `;
    }
  }
  customElements.define('pens-sidebar-card', PensSidebarCard);


  /* ══════════════════════════════════════════════════════════════
     12. <pens-btn href="" variant="primary|sage|ochre|paypal|outline"
                   size="normal|sm" full>
         Styled link-button. Full attribute makes it 100% width.
         Slot provides the label text.
     ══════════════════════════════════════════════════════════════ */
  class PensBtn extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: 'open' }); }
    connectedCallback() {
      const href    = this.getAttribute('href') || '#';
      const variant = this.getAttribute('variant') || 'primary';
      const size    = this.getAttribute('size') || 'normal';
      const full    = this.hasAttribute('full');

      const COLOR = {
        primary: 'background:var(--terracotta);color:#fff;',
        sage:    'background:var(--sage);color:#fff;',
        ochre:   'background:var(--ochre);color:var(--bark);',
        paypal:  'background:#0070ba;color:#fff;',
        outline: 'background:transparent;color:var(--bark);border:1.5px solid rgba(61,43,31,0.25);',
      };

      const padding  = size === 'sm' ? '10px 20px' : '13px 28px';
      const fontSize = size === 'sm' ? '13.5px'    : '15px';
      const display  = full ? 'flex' : 'inline-flex';
      const width    = full ? 'width:100%;' : '';

      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}
          :host { display: ${full ? 'block' : 'inline-block'}; }
          a {
            ${display === 'flex' ? 'display:flex;' : 'display:inline-flex;'}
            align-items: center; justify-content: center;
            padding: ${padding}; border-radius: 100px;
            font-size: ${fontSize}; font-weight: 500;
            text-decoration: none; font-family: var(--font-body);
            transition: transform 0.2s, box-shadow 0.2s;
            white-space: nowrap; ${width}
            ${COLOR[variant] || COLOR.primary}
          }
          a:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(61,43,31,0.14); }
          a:hover { ${variant === 'outline' ? 'border-color:var(--terracotta);color:var(--terracotta);' : ''} }
        </style>
        <a href="${esc(href)}"><slot></slot></a>
      `;
    }
  }
  customElements.define('pens-btn', PensBtn);


  /* ══════════════════════════════════════════════════════════════
     13. <pens-contact-info>
         Self-contained contact details block for the sidebar.
         All data is baked in — no attributes needed.
     ══════════════════════════════════════════════════════════════ */
  class PensContactInfo extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: 'open' }); }
    connectedCallback() {
      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}
          :host { display: block; }
          ul { list-style: none; display: flex; flex-direction: column; gap: 8px; }
          li { display: flex; align-items: center; gap: 9px; font-size: 13px; color: var(--bark-light); }
          a  { color: var(--terracotta); text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
        <ul>
          <li>📍 <span>397 Old San Jose Rd, Soquel, CA</span></li>
          <li>📞 <a href="tel:8314293464">(831) 429-3464</a></li>
          <li>✉️ <a href="mailto:soquelpens@gmail.com">soquelpens@gmail.com</a></li>
        </ul>
      `;
    }
  }
  customElements.define('pens-contact-info', PensContactInfo);


  /* ══════════════════════════════════════════════════════════════
     14. <pens-footer>
         Self-contained site footer. Fully encapsulated with
         all columns, contact strip, and bottom bar.
     ══════════════════════════════════════════════════════════════ */
  class PensFooter extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: 'open' }); }
    connectedCallback() {
      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}
          :host { display: block; background: var(--bark); }
          footer { color: var(--cream); padding: 64px 5vw 36px; }
          .grid {
            display: grid;
            grid-template-columns: 1.6fr 1fr 1fr;
            gap: 50px; margin-bottom: 50px;
          }
          .logo { font-family: var(--font-display); font-size: 1.2rem; color: var(--cream); margin-bottom: 11px; }
          .logo span { color: var(--ochre); }
          .brand p { font-size: 13px; color: rgba(253,246,237,0.48); line-height: 1.65; max-width: 230px; }
          .contact {
            background: rgba(255,255,255,0.04); border-radius: 12px;
            padding: 16px 18px; margin-top: 20px;
            display: flex; flex-direction: column; gap: 7px;
          }
          .contact-row { display: flex; align-items: center; gap: 9px; font-size: 12.5px; color: rgba(253,246,237,0.58); }
          h4 {
            font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
            color: rgba(253,246,237,0.38); margin-bottom: 14px; font-weight: 500;
          }
          ul { list-style: none; }
          li { margin-bottom: 8px; }
          a  { color: rgba(253,246,237,0.62); text-decoration: none; font-size: 13px; transition: color 0.2s; }
          a:hover { color: var(--ochre); }
          .bottom {
            border-top: 1px solid rgba(255,255,255,0.08);
            padding-top: 22px; display: flex;
            justify-content: space-between; align-items: center;
            flex-wrap: wrap; gap: 8px;
            font-size: 11.5px; color: rgba(253,246,237,0.28);
          }
          @media (max-width: 900px) {
            .grid { grid-template-columns: 1fr 1fr; gap: 36px; }
            .brand { grid-column: 1 / -1; }
            .brand p { max-width: 100%; }
          }
          @media (max-width: 600px) {
            .grid { grid-template-columns: 1fr; gap: 28px; }
            .brand { grid-column: auto; }
            .bottom { flex-direction: column; text-align: center; }
          }
        </style>
        <footer>
          <div class="grid">
            <div class="brand">
              <div class="logo">Soquel <span>PENS</span></div>
              <p>A parent cooperative preschool serving Soquel and Santa Cruz County
                since 1949. Non-profit, community-run, and open to all families.</p>
              <div class="contact">
                <div class="contact-row">📍 397 Old San Jose Rd, Soquel, CA</div>
                <div class="contact-row">📞 (831) 429-3464</div>
                <div class="contact-row">✉️ soquelpens@gmail.com</div>
              </div>
            </div>
            <div>
              <h4>School</h4>
              <ul>
                <li><a href="index.html#about">About Soquel PENS</a></li>
                <li><a href="index.html#program">Our Program</a></li>
                <li><a href="index.html#classes">Classes &amp; Tuition</a></li>
                <li><a href="#">Teachers</a></li>
                <li><a href="#">Board of Directors</a></li>
                <li><a href="#">Photos</a></li>
              </ul>
            </div>
            <div>
              <h4>Members &amp; Support</h4>
              <ul>
                <li><a href="index.html#enroll">Enrollment</a></li>
                <li><a href="#">Member Information</a></li>
                <li><a href="#">Calendar</a></li>
                <li><a href="#">Support Jobs</a></li>
                <li><a href="#">Cleaning Scholarships</a></li>
                <li><a href="#">Donate</a></li>
                <li><a href="#">Resources</a></li>
              </ul>
            </div>
          </div>
          <div class="bottom">
            <span>© 2025 Soquel Parent Education Nursery School · Non-Profit 501(c)(3)</span>
            <span>Soquel, CA · Est. 1949</span>
          </div>
        </footer>
      `;
    }
  }
  customElements.define('pens-footer', PensFooter);

  /* ══════════════════════════════════════════════════════════════
     15. <pens-instagram handle="soquelpens">
         Instagram profile section. Uses Instagram's official
         oEmbed endpoint (no auth needed for public profiles)
         to load a styled profile card, plus a tile grid that
         deep-links to the account. Instagram's embed.js is
         loaded lazily when the component connects.
     ══════════════════════════════════════════════════════════════ */
  class PensInstagram extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: 'open' }); }

    connectedCallback() {
      const handle = this.getAttribute('handle') || 'soquelpens';
      const profileUrl = `https://www.instagram.com/${handle}/`;

      // Tile data — decorative grid cells that link to the profile.
      // Each has a gradient pair and an emoji overlay to evoke the
      // kind of content the school posts (nature, art, community).
      const tiles = [
        { img: '/uploads/instanature.jpg', emoji: '🌿', label: 'Nature play' },
        { img: '/uploads/instaart.jpg', emoji: '🎨', label: 'Art time' },
        { img: '/uploads/instastory.jpg', emoji: '📚', label: 'Story time' },
        { img: '/uploads/instaout.jpg', emoji: '☀️', label: 'Outdoor fun' },
        { img: '/uploads/instapub.jpg', emoji: '🤝', label: 'Community' },
        { img: '/uploads/instafam.jpg', emoji: '👨‍👩‍👧', label: 'Families' },
      ];

      const tilesHTML = tiles.map(t => `
        <a class="tile" href="${profileUrl}" target="_blank" rel="noopener"
           title="See our ${t.label} photos on Instagram"
           style="background:url('${t.img}') center center / cover no-repeat;">
          <span class="tile-label">${t.label}</span>
        </a>
      `).join('');

      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}
          :host { display: block; background: var(--bark); }

          .section {
            padding: 80px 5vw;
            max-width: 1140px;
            margin: 0 auto;
          }

          /* ── Header row ── */
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 44px;
          }
          .header-left {}
          .eyebrow {
            font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
            color: rgba(253,246,237,0.42); font-weight: 500; margin-bottom: 8px;
          }
          h2 {
            font-family: var(--font-display);
            font-size: clamp(1.8rem, 3.5vw, 2.6rem);
            color: var(--cream); line-height: 1.2;
          }
          h2 em { font-style: italic; color: var(--ochre); }

          /* ── Profile card ── */
          .profile-card {
            display: inline-flex;
            align-items: center;
            gap: 14px;
            background: rgba(255,255,255,0.07);
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 100px;
            padding: 10px 20px 10px 10px;
            text-decoration: none;
            transition: background 0.2s, transform 0.2s;
          }
          .profile-card:hover { background: rgba(255,255,255,0.13); transform: translateY(-1px); }

          .ig-avatar {
            width: 40px; height: 40px; border-radius: 50%;
            background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
            display: grid; place-items: center;
            font-size: 20px; flex-shrink: 0;
          }
          .profile-text {}
          .profile-handle { font-size: 14px; font-weight: 500; color: var(--cream); display: block; }
          .profile-sub    { font-size: 11.5px; color: rgba(253,246,237,0.5); }

          .ig-icon {
            width: 18px; height: 18px; margin-left: 4px;
          }

          /* ── Tile grid ── */
          .grid {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 10px;
          }

          .tile {
            aspect-ratio: 1;
            border-radius: 14px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            position: relative;
            overflow: hidden;
            cursor: pointer;
            transition: transform 0.28s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s;
          }
          .tile:hover {
            transform: scale(1.06) translateY(-3px);
            box-shadow: 0 16px 40px rgba(0,0,0,0.35);
            z-index: 1;
          }
          /* Instagram-style shimmer overlay on hover */
          .tile::after {
            content: '';
            position: absolute; inset: 0;
            background: linear-gradient(45deg,
              rgba(240,148,51,0.22), rgba(230,104,60,0.18),
              rgba(220,39,67,0.18), rgba(188,24,136,0.18));
            opacity: 0;
            transition: opacity 0.25s;
          }
          .tile:hover::after { opacity: 1; }

          .tile-emoji {
            font-size: clamp(1.8rem, 3vw, 2.4rem);
            display: block; position: relative; z-index: 1;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
            transition: transform 0.25s;
          }
          .tile:hover .tile-emoji { transform: scale(1.15); }

          .tile-label {
            font-size: 15px; font-weight: 500;
            color: rgba(255,255,255,1.0);
            text-transform: uppercase; letter-spacing: 0.07em;
            position: relative; z-index: 1;
            margin-top: 8px;
            text-shadow: 0 1px 3px rgba(0,0,0,0.4);
          }

          /* ── CTA bar ── */
          .cta-bar {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            margin-top: 32px;
            flex-wrap: wrap;
          }
          .cta-text { font-size: 14px; color: rgba(253,246,237,0.5); }

          .follow-btn {
            display: inline-flex; align-items: center; gap: 9px;
            padding: 12px 26px; border-radius: 100px;
            background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #bc1888);
            color: #fff; text-decoration: none;
            font-size: 14.5px; font-weight: 500;
            font-family: var(--font-body);
            transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
            box-shadow: 0 4px 20px rgba(220,39,67,0.35);
          }
          .follow-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(220,39,67,0.45); opacity: 0.93; }

          /* ── Responsive ── */
          @media (max-width: 800px)  { .grid { grid-template-columns: repeat(3, 1fr); } }
          @media (max-width: 480px)  { .grid { grid-template-columns: repeat(2, 1fr); gap: 8px; } }
          @media (max-width: 600px)  { .section { padding: 60px 5vw; } }
        </style>

        <div class="section">

          <!-- Header -->
          <div class="header">
            <div class="header-left">
              <div class="eyebrow">Follow Along</div>
              <h2>We're on <em>Instagram</em></h2>
            </div>
            <a class="profile-card" href="${profileUrl}" target="_blank" rel="noopener">
              <div class="ig-avatar"><img src="/uploads/instaimage.jpg" width="40" /></div>
              <div class="profile-text">
                <span class="profile-handle">@${handle}</span>
                <span class="profile-sub">Soquel PENS · Santa Cruz, CA</span>
              </div>
              <!-- Instagram SVG icon -->
              <svg class="ig-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="20" height="20" rx="5" stroke="rgba(253,246,237,0.55)" stroke-width="1.8"/>
                <circle cx="12" cy="12" r="4.5" stroke="rgba(253,246,237,0.55)" stroke-width="1.8"/>
                <circle cx="17.5" cy="6.5" r="1" fill="rgba(253,246,237,0.55)"/>
              </svg>
            </a>
          </div>

          <!-- Tile grid -->
          <div class="grid">${tilesHTML}</div>

          <!-- CTA -->
          <div class="cta-bar">
            <span class="cta-text">See our latest photos and classroom moments</span>
            <a class="follow-btn" href="${profileUrl}" target="_blank" rel="noopener">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="20" height="20" rx="5" stroke="#fff" stroke-width="2"/>
                <circle cx="12" cy="12" r="4.5" stroke="#fff" stroke-width="2"/>
                <circle cx="17.5" cy="6.5" r="1.2" fill="#fff"/>
              </svg>
              Follow @${handle}
            </a>
          </div>

        </div>
      `;
    }
  }
  customElements.define('pens-instagram', PensInstagram);

} // end defineComponents

// The webcomponents-bundle polyfill fires 'WebComponentsReady' once Shadow DOM
// and Custom Elements are available (native or polyfilled). Fall back to
// DOMContentLoaded for browsers that already support everything natively.
if (window.customElements) {
  // Native support — register immediately (polyfill may not fire the event)
  defineComponents();
} else {
  window.addEventListener('WebComponentsReady', defineComponents);
}
