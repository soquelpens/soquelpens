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

  const CHIP_COLORS = {
    terra: { bg:'rgba(196,96,58,0.12)', color:'var(--terracotta)' },
    sage:  { bg:'rgba(122,158,126,0.16)', color:'var(--sage-dark)' },
    ochre: { bg:'rgba(212,168,75,0.14)', color:'#8a6a1a' },
  };

  const LEVEL_STYLES = {
    board:     { bg:'rgba(212,168,75,0.12)',    accent:'var(--ochre)',     label:'Leadership' },
    classroom: { bg:'rgba(122,158,126,0.12)',   accent:'var(--sage-dark)', label:'Classroom' },
    grounds:   { bg:'rgba(61,43,31,0.07)',      accent:'var(--bark-light)',label:'Grounds' },
    events:    { bg:'rgba(196,96,58,0.10)',     accent:'var(--terracotta)',label:'Events' },
    comms:     { bg:'rgba(122,158,126,0.10)',   accent:'var(--sage-dark)', label:'Comms' },
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
     3. <pens-page-hero heading="" heading-accent="" subheading="" breadcrumb="" bgimage="">
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
      const bgimage      = this.getAttribute('bgimage') || '/uploads/6/4/9/4/64940231/background-images/1134880908.jpg';

      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}
          :host { background: var(--bark); display: block; overflow: hidden; position: relative; }
          .bg{
            position:absolute;
            inset:0;
            pointer-events:none;
            background:radial-gradient(ellipse 60% 80% at 90% 50%,rgba(122,158,126,.14) 0%,transparent 70%),radial-gradient(ellipse 40% 60% at 10% 80%,rgba(212,168,75,.1) 0%,transparent 65%);
          }
          .inner{position:relative;max-width:1140px;margin:0 auto;padding:10px 5vw 30px;}
          .crumb{display:flex;align-items:center;gap:8px;font-size:12.5px;color:rgba(253,246,237,.45);margin-bottom:20px;}
          .crumb a{color:rgba(253,246,237,.45);text-decoration:none;transition:color .2s;}.crumb a:hover{color:var(--ochre);}
          h1{font-family:var(--font-display);font-size:clamp(2.2rem,5vw,3.8rem);color:var(--cream);line-height:1.15;margin-bottom:16px;opacity:0;animation:fu .7s .1s ease forwards;}
          h1 em{font-style:italic;color:var(--ochre);}
          p{color:rgba(253,246,237,.62);font-size:1.05rem;max-width:540px;line-height:1.65;opacity:0;animation:fu .7s .25s ease forwards;}
          @keyframes fu{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
          @media(max-width:600px){.inner{padding:44px 5vw 30px;}}
        </style>
        <div class="bg"></div>
        <div class="inner">
          <div class="crumb"><a href="index.html">Home</a><span>›</span><span style="color:rgba(253,246,237,.65)">${esc(breadcrumb)}</span></div>
          <h1>${esc(heading)} <em>${esc(accent)}</em></h1><p>${esc(subheading)}</p>
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

  /* ── <pens-feature-card icon="" title="" color="terra|sage|ochre"> ── */
  class PensFeatureCard extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode:'open' }); }
    connectedCallback() {
      const icon  = this.getAttribute('icon') || '📄';
      const title = esc(this.getAttribute('title') || '');
      const color = this.getAttribute('color') || 'terra';
      const bg    = ICON_BG[color] || ICON_BG.terra;
      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}
          :host { display:block; }
          .card { background:var(--warm-white); border-radius:18px; padding:28px 24px; border:1px solid rgba(61,43,31,.07); transition:transform .25s,box-shadow .25s; position:relative; overflow:hidden; height:100%; }
          .card:hover { transform:translateY(-5px); box-shadow:0 16px 44px rgba(61,43,31,.1); }
          .icon { width:48px; height:48px; border-radius:13px; display:grid; place-items:center; font-size:24px; margin-bottom:16px; background:${bg}; }
          h3 { font-family:var(--font-display); font-size:1.1rem; margin-bottom:8px; color:var(--bark); }
          p  { font-size:14.5px; color:var(--bark-light); line-height:1.65; }
          ::slotted(strong) { color:var(--bark); }
        </style>
        <div class="card">
          <div class="icon">${icon}</div>
          <h3>${title}</h3>
          <p><slot></slot></p>
        </div>
      `;
    }
  }
  customElements.define('pens-feature-card', PensFeatureCard);


  /* ── 5. <pens-stat-card year="" year-label="" headline="" detail=""> ── */
  class PensStatCard extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode:'open' }); }
    connectedCallback() {
      const year      = esc(this.getAttribute('year') || '');
      const yearLabel = esc(this.getAttribute('year-label') || '');
      const headline  = esc(this.getAttribute('headline') || '');
      const detail    = esc(this.getAttribute('detail') || '');
      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}
          :host { display:block; }
          .card { background:var(--bark); border-radius:24px; padding:44px 36px; position:relative; overflow:hidden; }
          .deco { position:absolute; top:-30px; right:-30px; width:180px; height:180px; border-radius:50%; background:radial-gradient(circle,rgba(122,158,126,.25) 0%,transparent 70%); }
          .year-row { display:flex; align-items:baseline; gap:10px; margin-bottom:6px; }
          .year { font-family:var(--font-display); font-size:4rem; font-weight:700; color:var(--ochre); line-height:1; }
          .year-lbl { font-size:12px; letter-spacing:.1em; text-transform:uppercase; color:rgba(253,246,237,.45); font-weight:500; }
          .divider { width:40px; height:2px; background:var(--sage); margin:18px 0; border-radius:2px; }
          .headline { font-family:var(--font-display); font-size:1.2rem; color:var(--cream); line-height:1.4; margin-bottom:12px; }
          .detail { font-size:14px; color:rgba(253,246,237,.55); line-height:1.65; }
        </style>
        <div class="card">
          <div class="deco"></div>
          <div class="year-row">
            <div class="year">${year}</div>
            <div class="year-lbl">${yearLabel}</div>
          </div>
          <div class="divider"></div>
          <div class="headline">${headline}</div>
          <div class="detail">${detail}</div>
        </div>
      `;
    }
  }
  customElements.define('pens-stat-card', PensStatCard);


  /* ── 6. <pens-value-item icon="" heading=""> ── */
  class PensValueItem extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode:'open' }); }
    connectedCallback() {
      const icon    = this.getAttribute('icon') || '✦';
      const heading = esc(this.getAttribute('heading') || '');
      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}
          :host { display:block; }
          .item { display:flex; gap:14px; align-items:flex-start; background:var(--warm-white); border-radius:16px; padding:22px 20px; border:1px solid rgba(61,43,31,.07); }
          .ico { font-size:22px; flex-shrink:0; margin-top:2px; line-height:1; }
          h3 { font-family:var(--font-display); font-size:1rem; color:var(--bark); margin-bottom:6px; }
          p  { font-size:14px; color:var(--bark-light); line-height:1.6; }
        </style>
        <div class="item">
          <div class="ico">${icon}</div>
          <div><h3>${heading}</h3><p><slot></slot></p></div>
        </div>
      `;
    }
  }
  customElements.define('pens-value-item', PensValueItem);


  /* ── 7. <pens-participation-grid> — self-contained grid of what parents do ── */
  class PensParticipationGrid extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode:'open' }); }
    connectedCallback() {
      const items = [
        { icon:'🏫', text:'Work in your child\'s class one day each week, arriving early to help the teacher set up' },
        { icon:'🧹', text:'Stay after class to clean up and meet with the teacher and other parents for the weekly seminar' },
        { icon:'🌙', text:'Attend Fun, Inspirational Education Nights — included with tuition, open to you and adult caregivers' },
        { icon:'👥', text:'Attend small-group Class Meetings twice a year to discuss the class and your child\'s development' },
        { icon:'🍎', text:'Provide a nutritious snack for your child\'s class approximately once a month' },
        { icon:'🔧', text:'Take on a Support Job: Board Director, class photographer, gardening, shopping, and more' },
        { icon:'🎉', text:'Contribute 4 hours of fundraising time and raise at least $100 per school year' },
        { icon:'💛', text:'Be an active, invested partner in the school — because your participation is the heart of everything we do' },
      ];
      const cards = items.map(i => `
        <div class="item">
          <span class="ico">${i.icon}</span>
          <p>${i.text}</p>
        </div>
      `).join('');
      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}
          :host { display:block; }
          .grid { display:grid; grid-template-columns:repeat(4,1fr); gap:2px; background:rgba(255,255,255,.05); border-radius:16px; overflow:hidden; margin-bottom:28px; }
          .item { background:var(--bark); padding:28px 22px; transition:background .2s; }
          .item:hover { background:rgba(255,255,255,.04); }
          .ico { font-size:24px; display:block; margin-bottom:12px; }
          p { font-size:13.5px; color:rgba(253,246,237,.58); line-height:1.65; }
          @media(max-width:900px) { .grid { grid-template-columns:repeat(2,1fr); } }
          @media(max-width:500px) { .grid { grid-template-columns:1fr; } }
        </style>
        <div class="grid">${cards}</div>
      `;
    }
  }
  customElements.define('pens-participation-grid', PensParticipationGrid);


  /* ── 8. <pens-dark-stat number="" label="" sub=""> ── */
  class PensDarkStat extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode:'open' }); }
    connectedCallback() {
      const number = esc(this.getAttribute('number') || '');
      const label  = esc(this.getAttribute('label') || '');
      const sub    = esc(this.getAttribute('sub') || '');
      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}
          :host { display:block; }
          .stat { background:var(--bark); padding:32px 24px; text-align:center; transition:background .2s; }
          .stat:hover { background:rgba(255,255,255,.04); }
          .num { font-family:var(--font-display); font-size:2.2rem; font-weight:700; color:var(--ochre); line-height:1; margin-bottom:8px; }
          .lbl { font-size:13px; color:rgba(253,246,237,.62); line-height:1.4; }
          .sub { font-size:11.5px; color:rgba(253,246,237,.35); margin-top:4px; }
        </style>
        <div class="stat">
          <div class="num">${number}</div>
          <div class="lbl">${label}</div>
          ${sub ? `<div class="sub">${sub}</div>` : ''}
        </div>
      `;
    }
  }
  customElements.define('pens-dark-stat', PensDarkStat);


  /* ── 9. <pens-enrollment-steps> — self-contained quick-start steps ── */
  class PensEnrollmentSteps extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode:'open' }); }
    connectedCallback() {
      const steps = [
        { n:'01', title:'Contact the Membership Coordinator', desc:'Email soquelpensmembership@gmail.com — all families are considered first-come, first-served.' },
        { n:'02', title:'Download &amp; sign the Requirements Contract', desc:'Once offered a space, complete the enrollment deposit and requirements contract.' },
        { n:'03', title:'Pick up your Registration Packet', desc:'Collect the full packet at school or at the WASCAE office in Santa Cruz.' },
        { n:'04', title:'Submit paperwork &amp; fees', desc:'Return fully completed forms with your TB test, immunization records, deposits, and registration fees.' },
        { n:'05', title:'Receive fingerprint clearance', desc:'Once your Live Scan fingerprint clearance is confirmed (1–3 weeks), you\'re ready to start!' },
      ];
      const html = steps.map(s => `
        <div class="step">
          <div class="num">${s.n}</div>
          <div class="body">
            <div class="title">${s.title}</div>
            <div class="desc">${s.desc}</div>
          </div>
        </div>
      `).join('');
      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}
          :host { display:block; }
          .step { display:flex; gap:16px; padding-bottom:22px; position:relative; }
          .step:last-child { padding-bottom:0; }
          .step::before { content:''; position:absolute; left:19px; top:36px; bottom:0; width:1.5px; background:rgba(61,43,31,.1); }
          .step:last-child::before { display:none; }
          .num { font-family:var(--font-display); font-size:1.3rem; font-weight:700; color:var(--terracotta); width:40px; height:40px; border-radius:50%; background:rgba(196,96,58,.1); display:grid; place-items:center; flex-shrink:0; font-size:13px; }
          .title { font-size:14px; font-weight:500; color:var(--bark); margin-bottom:4px; }
          .desc  { font-size:13px; color:var(--bark-light); line-height:1.55; }
        </style>
        ${html}
      `;
    }
  }
  customElements.define('pens-enrollment-steps', PensEnrollmentSteps);



  /* ── 4. <pens-chip color="terra|sage|ochre"> ── */
  class PensChip extends HTMLElement {
    constructor() { super(); this.attachShadow({mode:'open'}); }
    connectedCallback() {
      const c = this.getAttribute('color')||'terra';
      const {bg, color} = CHIP_COLORS[c]||CHIP_COLORS.terra;
      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}:host{display:inline-block;}
          .chip{display:inline-block;padding:6px 14px;border-radius:100px;font-size:12.5px;font-weight:500;background:${bg};color:${color};line-height:1.3;}
        </style>
        <span class="chip"><slot></slot></span>`;
    }
  }
  customElements.define('pens-chip', PensChip);


  /* ── 5a. <pens-teacher-photo> — large hero photo with decorative frame ── */
  class PensTeacherPhoto extends HTMLElement {
    constructor() { super(); this.attachShadow({mode:'open'}); }
    connectedCallback() {
      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}
          :host { display: block; margin-bottom: 20px; }
          .frame {
            position: relative;
            border-radius: 24px;
            overflow: hidden;
            aspect-ratio: 4 / 3;
            box-shadow: 0 24px 60px rgba(61,43,31,0.22);
          }
          img {
            width: 100%; height: 100%;
            object-fit: cover; object-position: center top;
            display: block;
            transition: transform 0.5s ease;
          }
          .frame:hover img { transform: scale(1.03); }
          /* Subtle gradient overlay at bottom */
          .frame::after {
            content: '';
            position: absolute;
            bottom: 0; left: 0; right: 0;
            height: 40%;
            background: linear-gradient(to top, rgba(61,43,31,0.35) 0%, transparent 100%);
            pointer-events: none;
          }
          /* Decorative sage orb behind the photo */
          .orb {
            position: absolute;
            width: 200px; height: 200px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(122,158,126,0.3) 0%, transparent 70%);
            top: -30px; right: -30px;
            z-index: -1;
          }
          .caption {
            position: absolute;
            bottom: 16px; left: 16px;
            z-index: 1;
            background: rgba(253,246,237,0.92);
            backdrop-filter: blur(8px);
            border-radius: 10px;
            padding: 8px 14px;
            font-size: 12.5px;
            font-weight: 500;
            color: var(--bark);
            letter-spacing: 0.03em;
          }
          .caption span { color: var(--terracotta); }
        </style>
        <div style="position:relative;">
          <div class="orb"></div>
          <div class="frame">
            <img
              src="/uploads/6/4/9/4/64940231/published/colleen-s-website-bio-photo.jpg"
              alt="Soquel PENS Head Teacher"
              loading="eager">
            <div class="caption">Head Teacher · <span>Soquel PENS</span></div>
          </div>
        </div>
      `;
    }
  }
  customElements.define('pens-teacher-photo', PensTeacherPhoto);


  /* ── 5. <pens-profile-card> — self-contained teacher credential card ── */
  class PensProfileCard extends HTMLElement {
    constructor() { super(); this.attachShadow({mode:'open'}); }
    connectedCallback() {
      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}
          :host{display:block;}
          .card{background:var(--bark);border-radius:24px;padding:44px 36px;position:relative;overflow:hidden;}
          .orb{position:absolute;top:-40px;right:-40px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(122,158,126,.22) 0%,transparent 70%);}
          .avatar{width:100px;height:100px;border-radius:50%;overflow:hidden;margin-bottom:20px;box-shadow:0 8px 24px rgba(0,0,0,.35);border:3px solid rgba(255,255,255,.12);}
          .avatar img{width:100%;height:100%;object-fit:cover;display:block;}
          .name{font-family:var(--font-display);font-size:1.4rem;color:var(--cream);margin-bottom:4px;}
          .role{font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:rgba(253,246,237,.45);margin-bottom:24px;}
          .divider{width:36px;height:2px;background:var(--ochre);margin-bottom:24px;border-radius:2px;}
          .facts{display:flex;flex-direction:column;gap:14px;}
          .fact{display:flex;align-items:flex-start;gap:12px;}
          .fact-icon{font-size:16px;flex-shrink:0;margin-top:2px;}
          .fact-text{font-size:13.5px;color:rgba(253,246,237,.62);line-height:1.55;}
          .fact-text strong{color:rgba(253,246,237,.88);}
          .badge-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:24px;}
          .badge{display:inline-block;padding:5px 12px;border-radius:100px;font-size:11.5px;font-weight:500;}
          .badge-ochre{background:rgba(212,168,75,.18);color:var(--ochre);}
          .badge-sage{background:rgba(122,158,126,.18);color:rgba(180,230,180,1);}
        </style>
        <div class="card">
          <div class="orb"></div>
          <div class="avatar"><img src="/uploads/6/4/9/4/64940231/published/colleen-s-website-bio-photo.jpg" alt="Soquel PENS Teacher"></div>
          <div class="name">Our Teacher</div>
          <div class="role">Head Teacher · Soquel PENS</div>
          <div class="divider"></div>
          <div class="facts">
            <div class="fact"><span class="fact-icon">🎓</span><div class="fact-text"><strong>B.A. Childhood Education</strong>, minor in Psychology — Chico State University, 1988</div></div>
            <div class="fact"><span class="fact-icon">📍</span><div class="fact-text">Based in <strong>Santa Cruz County</strong> — committed to this community for over 35 years</div></div>
            <div class="fact"><span class="fact-icon">🌟</span><div class="fact-text"><strong>Certified Positive Discipline</strong> Educator &amp; Trainer (international program)</div></div>
            <div class="fact"><span class="fact-icon">🤲</span><div class="fact-text">Trained in <strong>Hand In Hand Parenting</strong> (Patty Wipfler)</div></div>
            <div class="fact"><span class="fact-icon">🏫</span><div class="fact-text">Taught at <strong>3 parent-participation preschools</strong> across Santa Cruz County</div></div>
          </div>
          <div class="badge-row">
            <span class="badge badge-ochre">Positive Discipline</span>
            <span class="badge badge-sage">Hand In Hand</span>
            <span class="badge badge-ochre">Cabrillo Mentor</span>
            <span class="badge badge-sage">Conference Speaker</span>
          </div>
        </div>`;
    }
  }
  customElements.define('pens-profile-card', PensProfileCard);


  /* ── 6. <pens-principle-card icon="" title="" color=""> ── */
  class PensPrincipleCard extends HTMLElement {
    constructor() { super(); this.attachShadow({mode:'open'}); }
    connectedCallback() {
      const icon  = this.getAttribute('icon')||'✦';
      const title = esc(this.getAttribute('title')||'');
      const c     = this.getAttribute('color')||'terra';
      const bg    = ICON_BG[c]||ICON_BG.terra;
      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}:host{display:block;}
          .card{background:var(--warm-white);border-radius:16px;padding:22px 22px;border:1px solid rgba(61,43,31,.07);display:flex;gap:16px;align-items:flex-start;transition:transform .2s,box-shadow .2s;}
          .card:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(61,43,31,.09);}
          .icon{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;font-size:22px;flex-shrink:0;background:${bg};}
          h3{font-family:var(--font-display);font-size:1rem;margin-bottom:6px;color:var(--bark);}
          p{font-size:14px;color:var(--bark-light);line-height:1.6;}
        </style>
        <div class="card">
          <div class="icon">${icon}</div>
          <div><h3>${title}</h3><p><slot></slot></p></div>
        </div>`;
    }
  }
  customElements.define('pens-principle-card', PensPrincipleCard);


  /* ── 7. <pens-experience-card icon="" number="" unit="" label=""> ── */
  class PensExperienceCard extends HTMLElement {
    constructor() { super(); this.attachShadow({mode:'open'}); }
    connectedCallback() {
      const icon   = this.getAttribute('icon')||'📄';
      const number = esc(this.getAttribute('number')||'');
      const unit   = esc(this.getAttribute('unit')||'');
      const label  = esc(this.getAttribute('label')||'');
      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}:host{display:block;}
          .card{background:var(--warm-white);border-radius:18px;padding:28px 24px;border:1px solid rgba(61,43,31,.07);transition:transform .25s,box-shadow .25s;height:100%;}
          .card:hover{transform:translateY(-4px);box-shadow:0 14px 40px rgba(61,43,31,.1);}
          .top{display:flex;align-items:center;gap:14px;margin-bottom:14px;}
          .ico{font-size:26px;}
          .stat{display:flex;align-items:baseline;gap:4px;}
          .num{font-family:var(--font-display);font-size:1.8rem;font-weight:700;color:var(--terracotta);line-height:1;}
          .unit{font-size:12px;color:var(--bark-light);text-transform:uppercase;letter-spacing:.05em;}
          .label{font-size:11.5px;font-weight:500;letter-spacing:.07em;text-transform:uppercase;color:var(--sage-dark);margin-bottom:8px;}
          p{font-size:14px;color:var(--bark-light);line-height:1.6;}
        </style>
        <div class="card">
          <div class="top"><span class="ico">${icon}</span><div class="stat"><span class="num">${number}</span>${unit?`<span class="unit">${unit}</span>`:''}</div></div>
          <div class="label">${label}</div>
          <p><slot></slot></p>
        </div>`;
    }
  }
  customElements.define('pens-experience-card', PensExperienceCard);


  /* ── 8. <pens-dark-influence-card icon="" title="" author=""> ── */
  class PensDarkInfluenceCard extends HTMLElement {
    constructor() { super(); this.attachShadow({mode:'open'}); }
    connectedCallback() {
      const icon   = this.getAttribute('icon')||'✦';
      const title  = esc(this.getAttribute('title')||'');
      const author = esc(this.getAttribute('author')||'');
      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}:host{display:block;}
          .card{background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.1);border-radius:20px;padding:36px 30px;transition:background .2s,transform .2s;}
          .card:hover{background:rgba(255,255,255,.08);transform:translateY(-2px);}
          .header{display:flex;align-items:center;gap:14px;margin-bottom:20px;}
          .ico{font-size:32px;}
          .title{font-family:var(--font-display);font-size:1.2rem;color:var(--cream);}
          .author{font-size:12px;color:rgba(253,246,237,.4);letter-spacing:.05em;margin-top:3px;}
          .divider{width:32px;height:1.5px;background:var(--ochre);border-radius:2px;margin-bottom:18px;}
          p{font-size:14.5px;color:rgba(253,246,237,.6);line-height:1.7;}
        </style>
        <div class="card">
          <div class="header"><span class="ico">${icon}</span><div><div class="title">${title}</div><div class="author">${author}</div></div></div>
          <div class="divider"></div>
          <p><slot></slot></p>
        </div>`;
    }
  }
  customElements.define('pens-dark-influence-card', PensDarkInfluenceCard);

  /* ── 10. <pens-seminar-topic icon="" title=""> ── */
  class PensSeminarTopic extends HTMLElement {
    constructor() { super(); this.attachShadow({mode:'open'}); }
    connectedCallback() {
      const icon  = this.getAttribute('icon')||'📌';
      const title = esc(this.getAttribute('title')||'');
      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}:host{display:block;}
          .card{background:var(--cream);border-radius:16px;padding:22px 20px;border:1px solid rgba(61,43,31,.07);transition:transform .2s,box-shadow .2s;}
          .card:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(61,43,31,.09);}
          .top{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
          .ico{font-size:20px;}
          h4{font-family:var(--font-display);font-size:.95rem;color:var(--bark);}
          p{font-size:13.5px;color:var(--bark-light);line-height:1.6;}
        </style>
        <div class="card">
          <div class="top"><span class="ico">${icon}</span><h4>${title}</h4></div>
          <p><slot></slot></p>
        </div>`;
    }
  }
  customElements.define('pens-seminar-topic', PensSeminarTopic);


  /* ── 4. <pens-resource-card icon="" category="" title="" url="" tag=""> ── */
  customElements.define('pens-resource-card', class extends HTMLElement {
    constructor() { super(); this.attachShadow({mode:'open'}); }
    connectedCallback() {
      const icon=this.getAttribute('icon')||'🔗',
            cat=esc(this.getAttribute('category')||''),
            title=esc(this.getAttribute('title')||''),
            url=this.getAttribute('url')||'#',
            tag=esc(this.getAttribute('tag')||'');
      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}:host{display:block;}
          .card{background:var(--warm-white);border-radius:16px;padding:22px 20px;border:1px solid rgba(61,43,31,.07);transition:transform .22s,box-shadow .22s;height:100%;display:flex;flex-direction:column;}
          .card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(61,43,31,.09);}
          .top{display:flex;align-items:flex-start;gap:12px;margin-bottom:10px;}
          .ico{font-size:22px;flex-shrink:0;margin-top:1px;}
          .meta{}
          .cat{font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--sage-dark);font-weight:500;margin-bottom:3px;}
          h3{font-family:var(--font-display);font-size:1rem;color:var(--bark);line-height:1.3;}
          p{font-size:13.5px;color:var(--bark-light);line-height:1.6;flex:1;margin:8px 0 14px;}
          a{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:500;color:var(--terracotta);text-decoration:none;transition:gap .2s;}
          a:hover{gap:10px;}
          .tag{font-size:11px;color:var(--bark-light);opacity:.7;font-family:monospace;}
        </style>
        <div class="card">
          <div class="top">
            <span class="ico">${icon}</span>
            <div class="meta"><div class="cat">${cat}</div><h3>${title}</h3></div>
          </div>
          <p><slot></slot></p>
          <a href="${esc(url)}" target="_blank" rel="noopener">
            <span class="tag">${tag}</span> →
          </a>
        </div>`;
    }
  });


  /* ── 5. <pens-suggest-box> ── */
  customElements.define('pens-suggest-box', class extends HTMLElement {
    constructor() { super(); this.attachShadow({mode:'open'}); }
    connectedCallback() {
      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}:host{display:block;margin-top:24px;}
          .box{background:var(--mist);border-radius:14px;padding:20px 22px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;}
          .txt{flex:1;min-width:200px;}
          .txt p{font-size:13.5px;color:var(--bark-light);line-height:1.6;}
          .txt strong{color:var(--bark);}
          a{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:100px;background:var(--sage);color:#fff;font-size:13.5px;font-weight:500;text-decoration:none;transition:background .2s,transform .2s;white-space:nowrap;}
          a:hover{background:var(--sage-dark);transform:translateY(-1px);}
        </style>
        <div class="box">
          <div class="txt"><p><strong>Know a great local resource?</strong> We'd love to add it to our directory. Email us with the name, link, and a brief description.</p></div>
          <a href="mailto:soquelpens@gmail.com">Suggest a Resource →</a>
        </div>`;
    }
  });


  /* ── 6. <pens-biz-card icon="" name="" tagline="" color="terra|sage|ochre"> ── */
  customElements.define('pens-biz-card', class extends HTMLElement {
    constructor() { super(); this.attachShadow({mode:'open'}); }
    connectedCallback() {
      const icon=this.getAttribute('icon')||'🏪',
            name=esc(this.getAttribute('name')||''),
            tag=esc(this.getAttribute('tagline')||''),
            c=this.getAttribute('color')||'terra',
            bg=CHIP_COLORS[c]||CHIP_COLORS.terra;
      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}:host{display:block;}
          .card{background:var(--warm-white);border-radius:16px;padding:24px 20px;border:1px solid rgba(61,43,31,.07);transition:transform .22s,box-shadow .22s;height:100%;}
          .card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(61,43,31,.09);}
          .icon-wrap{width:52px;height:52px;border-radius:14px;display:grid;place-items:center;font-size:26px;background:${bg};margin-bottom:14px;}
          .name{font-family:var(--font-display);font-size:1.05rem;color:var(--bark);margin-bottom:3px;}
          .tag{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--sage-dark);font-weight:500;margin-bottom:10px;}
          p{font-size:13.5px;color:var(--bark-light);line-height:1.6;}
        </style>
        <div class="card">
          <div class="name">${icon} ${name}</div>
          <div class="tag">${tag}</div>
          <p><slot></slot></p>
        </div>`;
    }
  });


  /* ── 7. <pens-sponsor-card name="" type="" icon=""> ── */
  customElements.define('pens-sponsor-card', class extends HTMLElement {
    constructor() { super(); this.attachShadow({mode:'open'}); }
    connectedCallback() {
      const name=esc(this.getAttribute('name')||''),
            type=esc(this.getAttribute('type')||''),
            icon=this.getAttribute('icon')||'⭐';
      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}:host{display:block;}
          .card{background:var(--warm-white);border-radius:16px;padding:24px 22px;border:1px solid rgba(61,43,31,.07);display:flex;gap:16px;align-items:flex-start;transition:transform .22s,box-shadow .22s;}
          .card:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(61,43,31,.08);}
          .ico{font-size:28px;flex-shrink:0;line-height:1;margin-top:2px;}
          .type{font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--sage-dark);font-weight:500;margin-bottom:4px;}
          h3{font-family:var(--font-display);font-size:1rem;color:var(--bark);margin-bottom:8px;line-height:1.3;}
          p{font-size:13.5px;color:var(--bark-light);line-height:1.6;}
        </style>
        <div class="card">
          <span class="ico">${icon}</span>
          <div><div class="type">${type}</div><h3>${name}</h3><p><slot></slot></p></div>
        </div>`;
    }
  });


  /* ── 8. <pens-sponsor-cta> ── */
  customElements.define('pens-sponsor-cta', class extends HTMLElement {
    constructor() { super(); this.attachShadow({mode:'open'}); }
    connectedCallback() {
      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}:host{display:block;margin-top:28px;}
          .box{background:var(--bark);border-radius:18px;padding:32px 28px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px;}
          .txt h3{font-family:var(--font-display);font-size:1.2rem;color:var(--cream);margin-bottom:6px;}
          .txt p{font-size:13.5px;color:rgba(253,246,237,.55);line-height:1.6;max-width:380px;}
          a{display:inline-flex;align-items:center;gap:8px;padding:13px 26px;border-radius:100px;background:var(--ochre);color:var(--bark);font-size:14.5px;font-weight:500;text-decoration:none;transition:opacity .2s,transform .2s;white-space:nowrap;}
          a:hover{opacity:.88;transform:translateY(-1px);}
        </style>
        <div class="box">
          <div class="txt">
            <h3>Become a Sponsor</h3>
            <p>Your business or donation directly supports child and parent education programs at Soquel PENS. We'd love to recognize your generosity here.</p>
          </div>
          <a href="mailto:soquelpens@gmail.com">💛 Get in Touch →</a>
        </div>`;
    }
  });


  /* ── 9. <pens-handout icon="" title="" category="" url=""> ── */
  customElements.define('pens-handout', class extends HTMLElement {
    constructor() { super(); this.attachShadow({mode:'open'}); }
    connectedCallback() {
      const icon=this.getAttribute('icon')||'📄',
            title=esc(this.getAttribute('title')||''),
            cat=esc(this.getAttribute('category')||''),
            url=this.getAttribute('url')||'#';
      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}:host{display:block;}
          a{display:flex;align-items:center;gap:16px;padding:16px 20px;background:var(--warm-white);border-radius:14px;border:1px solid rgba(61,43,31,.07);text-decoration:none;transition:background .18s,transform .18s,box-shadow .18s;}
          a:hover{background:var(--mist);transform:translateX(4px);box-shadow:0 4px 18px rgba(61,43,31,.07);}
          .ico{font-size:22px;flex-shrink:0;}
          .body{flex:1;min-width:0;}
          .cat{font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--sage-dark);font-weight:500;margin-bottom:3px;}
          h4{font-size:14.5px;font-weight:500;color:var(--bark);line-height:1.35;margin-bottom:4px;}
          p{font-size:13px;color:var(--bark-light);line-height:1.5;}
          .arrow{font-size:18px;color:var(--bark-light);flex-shrink:0;transition:color .18s,transform .18s;}
          a:hover .arrow{color:var(--terracotta);transform:translateX(4px);}
          ::slotted(*){display:none;}
        </style>
        <a href="${esc(url)}">
          <span class="ico">${icon}</span>
          <div class="body">
            <div class="cat">${cat}</div>
            <h4>${title}</h4>
            <p><slot></slot></p>
          </div>
          <span class="arrow">→</span>
        </a>`;
    }
  });


  /* ── 5. pens-jobs-overview — stats strip ── */
  customElements.define('pens-jobs-overview', class extends HTMLElement {
    constructor() { super(); this.attachShadow({mode:'open'}); }
    connectedCallback() {
      const stats=[
        {num:'1',   label:'support job per family',   sub:'Assigned each school year'},
        {num:'5',   label:'job categories',             sub:'Board · Classroom · Grounds · Events · Comms'},
        {num:'25+', label:'roles available',             sub:'Something for every skill set'},
        {num:'2',label:'fundraising events per year',      sub:'Plus a minimum raised amount'},
      ];
      const cells=stats.map(s=>`
        <div class="cell">
          <div class="num">${s.num}</div>
          <div class="lbl">${s.label}</div>
          <div class="sub">${s.sub}</div>
        </div>`).join('');
      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}:host{display:block;}
          .strip{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;background:rgba(255,255,255,.06);border-radius:16px;overflow:hidden;}
          .cell{background:var(--bark);padding:28px 20px;text-align:center;transition:background .2s;}
          .cell:hover{background:var(--bark-light);}
          .num{font-family:var(--font-display);font-size:2rem;font-weight:700;color:var(--ochre);line-height:1;margin-bottom:8px;}
          .lbl{font-size:13px;color:rgba(253,246,237,.7);line-height:1.4;margin-bottom:4px;}
          .sub{font-size:11px;color:rgba(253,246,237,.35);line-height:1.4;}
          @media(max-width:700px){.strip{grid-template-columns:1fr 1fr;}}
          @media(max-width:420px){.strip{grid-template-columns:1fr;}}
        </style>
        <div class="strip">${cells}</div>`;
    }
  });


  /* ── 6. pens-job-card ── */
  customElements.define('pens-job-card', class extends HTMLElement {
    constructor() { super(); this.attachShadow({mode:'open'}); }
    connectedCallback() {
      const icon =this.getAttribute('icon')||'📌';
      const title=esc(this.getAttribute('title')||'');
      const time =esc(this.getAttribute('time')||'');
      const lvl  =this.getAttribute('level')||'classroom';
      const st   =LEVEL_STYLES[lvl]||LEVEL_STYLES.classroom;
      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}:host{display:block;}
          .card{background:var(--warm-white);border-radius:16px;padding:22px 20px;border:1px solid rgba(61,43,31,.07);height:100%;display:flex;flex-direction:column;transition:transform .22s,box-shadow .22s;}
          .card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(61,43,31,.09);}
          .top{display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;}
          .ico-wrap{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;font-size:22px;flex-shrink:0;background:${st.bg};}
          .title-block{}
          h3{font-family:var(--font-display);font-size:1rem;color:var(--bark);margin-bottom:4px;line-height:1.3;}
          .time{font-size:11.5px;color:var(--bark-light);}
          .badge{display:inline-block;font-size:10.5px;font-weight:500;padding:2px 9px;border-radius:100px;background:${st.bg};color:${st.accent};letter-spacing:.05em;text-transform:uppercase;margin-bottom:6px;}
          p{font-size:13.5px;color:var(--bark-light);line-height:1.6;flex:1;}
          ::slotted(strong){color:var(--bark);}
        </style>
        <div class="card">
          <div class="top">
            <div class="ico-wrap">${icon}</div>
            <div class="title-block">
              <div class="badge">${st.label}</div>
              <h3>${title}</h3>
              <div class="time">⏱ ${time}</div>
            </div>
          </div>
          <p><slot></slot></p>
        </div>`;
    }
  });


  /* ── 7. pens-toc-card ── */
  customElements.define('pens-toc-card', class extends HTMLElement {
    constructor() { super(); this.attachShadow({mode:'open'}); }
    connectedCallback() {
      const items=[
        {href:'#board',       icon:'👑', label:'Board of Directors'},
        {href:'#classroom',     icon:' 🎉', label:'Classroom Support'},
        {href:'#grounds',     icon:'🌱', label:'Grounds & Maintenance'},
        {href:'#comms',       icon:'📱', label:'Communications'},

      ];
      const links=items.map(i=>`
        <a href="${i.href}" class="lk">
          <span class="ic">${i.icon}</span>
          <span>${i.label}</span>
          <span class="ar">→</span>
        </a>`).join('');
      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}:host{display:block;}
          .card{background:var(--warm-white);border-radius:18px;padding:22px 20px;border:1.5px solid rgba(61,43,31,.08);}
          h3{font-family:var(--font-display);font-size:1rem;color:var(--bark);margin-bottom:14px;}
          .lk{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;text-decoration:none;color:var(--bark);font-size:13px;font-weight:500;background:var(--cream);border:1px solid rgba(61,43,31,.06);margin-bottom:7px;transition:background .15s,transform .15s;}
          .lk:last-child{margin-bottom:0;}
          .lk:hover{background:var(--mist);transform:translateX(3px);}
          .ic{font-size:15px;flex-shrink:0;}
          .ar{margin-left:auto;font-size:11px;color:var(--bark-light);}
        </style>
        <div class="card"><h3>Job categories</h3>${links}</div>`;
    }
  });


  /* ── 8. pens-effort-key ── */
  customElements.define('pens-effort-key', class extends HTMLElement {
    constructor() { super(); this.attachShadow({mode:'open'}); }
    connectedCallback() {
      const levels=[
        {label:'Leadership', desc:'Monthly meetings + ongoing responsibility', color:'rgba(212,168,75,.18)', text:'#8a6a1a'},
        {label:'Classroom',  desc:'Weekly or monthly classroom tasks',          color:'rgba(122,158,126,.16)', text:'var(--sage-dark)'},
        {label:'Grounds',    desc:'Work parties + as-needed maintenance',       color:'rgba(61,43,31,.08)',    text:'var(--bark-light)'},
        {label:'Events',     desc:'Intensive planning for specific events',     color:'rgba(196,96,58,.11)',   text:'var(--terracotta)'},
        {label:'Comms',      desc:'Ongoing communications & coordination',      color:'rgba(122,158,126,.12)', text:'var(--sage-dark)'},
      ];
      const rows=levels.map(l=>`
        <div class="row">
          <span class="badge" style="background:${l.color};color:${l.text};">${l.label}</span>
          <span class="desc">${l.desc}</span>
        </div>`).join('');
      this.shadowRoot.innerHTML = `
        <style>
          ${BASE_CSS}:host{display:block;}
          .card{background:var(--warm-white);border-radius:18px;padding:22px 20px;border:1.5px solid rgba(61,43,31,.08);}
          h3{font-family:var(--font-display);font-size:1rem;color:var(--bark);margin-bottom:14px;}
          .row{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;}
          .row:last-child{margin-bottom:0;}
          .badge{display:inline-block;font-size:10.5px;font-weight:500;padding:3px 10px;border-radius:100px;letter-spacing:.05em;text-transform:uppercase;white-space:nowrap;flex-shrink:0;margin-top:1px;}
          .desc{font-size:12.5px;color:var(--bark-light);line-height:1.5;}
        </style>
        <div class="card"><h3>Time commitment key</h3>${rows}</div>`;
    }
  });

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
