/**
 * wc.ts — Soquel PENS Custom Elements (TypeScript)
 * ─────────────────────────────────────────────────────────────────────────────
 * All Web Components used across the PENS site, typed with TypeScript.
 * Compile with:
 *   tsc wc.ts --target ES2017 --lib ES2017,DOM --outFile wc.js
 *
 * ── GLOBAL / SHARED ───────────────────────────────────────────────────────────
 *  1.  <pens-banner>               Terracotta announcement strip
 *  2.  <pens-nav>                  Sticky nav + hamburger mobile drawer
 *  3.  <pens-page-hero>            Dark hero with breadcrumb + animated heading
 *  4.  <pens-alert>                Callout box (terracotta / sage variants)
 *  5.  <pens-chip>                 Inline pill badge
 *  6.  <pens-btn>                  Link-button (5 colour variants)
 *  7.  <pens-contact-info>         Address / phone / email block
 *
 * ── PAYMENTS PAGE ─────────────────────────────────────────────────────────────
 *  8.  <pens-accordion>            Animated expand/collapse fee card
 *  9.  <pens-tuition-table>        Tuition schedule table
 * 10.  <pens-memo>                 Monospace payment-reference box
 * 11.  <pens-fee-item>             Fee card for the 2-column fees grid
 * 12.  <pens-quick-link>           Anchor row for the Quick Pay sidebar
 * 13.  <pens-timeline-item>        One step in the payment timeline
 * 14.  <pens-sidebar-card>         Sticky sidebar card wrapper
 *
 * ── HOME / ABOUT PAGE ─────────────────────────────────────────────────────────
 * 15.  <pens-feature-card>         Icon + heading + body feature tile
 * 16.  <pens-stat-card>            Large year/stat card on dark bark background
 * 17.  <pens-value-item>           Icon + heading + body value-prop row
 * 18.  <pens-participation-grid>   Self-contained 4-col "what parents do" grid
 * 19.  <pens-dark-stat>            Stat cell for the stats strip
 * 20.  <pens-enrollment-steps>     Self-contained numbered enrollment checklist
 * 21.  <pens-instagram>            Instagram tile grid + follow CTA
 *
 * ── TEACHER / ABOUT PAGE ──────────────────────────────────────────────────────
 * 22.  <pens-teacher-photo>        Framed hero photo with caption overlay
 * 23.  <pens-profile-card>         Teacher credential card on dark background
 * 24.  <pens-principle-card>       Icon + heading educational-principle card
 * 25.  <pens-experience-card>      Stat + label + description experience card
 * 26.  <pens-dark-influence-card>  Influence card on dark/glass background
 * 27.  <pens-seminar-topic>        Seminar topic card on cream background
 *
 * ── RESOURCES PAGE ────────────────────────────────────────────────────────────
 * 28.  <pens-resource-card>        External resource link card
 * 29.  <pens-suggest-box>          "Suggest a resource" call-to-action strip
 * 30.  <pens-biz-card>             Local business card
 * 31.  <pens-sponsor-card>         Sponsor listing card
 * 32.  <pens-sponsor-cta>          "Become a Sponsor" call-to-action bar
 * 33.  <pens-handout>              Downloadable handout link row
 *
 * ── JOBS / PARTICIPATION PAGE ─────────────────────────────────────────────────
 * 34.  <pens-jobs-overview>        Self-contained stats strip for job categories
 * 35.  <pens-job-card>             Individual volunteer job card
 * 36.  <pens-toc-card>             "Jump to category" table-of-contents card
 * 37.  <pens-effort-key>           Time-commitment legend card
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Shared types ─────────────────────────────────────────────────────────────

/** Colour variant keys shared across icon badges and chip components. */
type ColorVariant = 'terra' | 'sage' | 'ochre' | 'bark';

/** Colour variant keys available for chip/badge pills (no bark). */
type ChipVariant = 'terra' | 'sage' | 'ochre';

/** Volunteer job level keys used by <pens-job-card>. */
type LevelVariant = 'board' | 'classroom' | 'grounds' | 'events' | 'comms';

/** Alert component variants. */
type AlertVariant = 'default' | 'info';

/** Button component variants. */
type BtnVariant = 'primary' | 'sage' | 'ochre' | 'paypal' | 'outline';

/** Button size options. */
type BtnSize = 'normal' | 'sm';

/** Sidebar card variants. */
type SidebarVariant = 'default' | 'mist';

/** Timeline item variants. */
type TimelineVariant = 'ok' | 'warn';

interface ChipColor {
  bg: string;
  color: string;
}

interface LevelStyle {
  bg: string;
  accent: string;
  label: string;
}

interface StatItem {
  num: string;
  label: string;
  sub: string;
}

interface ParticipationItem {
  icon: string;
  text: string;
}

interface EnrollmentStep {
  n: string;
  title: string;
  desc: string;
}

interface InstagramTile {
  img: string;
  label: string;
}

interface TocItem {
  href: string;
  icon: string;
  label: string;
}

interface EffortLevel {
  label: string;
  desc: string;
  color: string;
  text: string;
}

// ─── Shared utilities ─────────────────────────────────────────────────────────

/**
 * Base CSS injected at the top of every shadow root.
 * Normalises box-sizing and sets the host's display + font.
 */
const BASE_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :host { display: block; font-family: var(--font-body, sans-serif); }
`;

/**
 * Escapes a string for safe insertion into an innerHTML attribute.
 * Prevents XSS when rendering attribute values as HTML.
 */
function esc(str: string | null | undefined): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Maps an `icon-variant` / `color` attribute value to a translucent
 * background colour used for icon badge backgrounds.
 */
const ICON_BG: Record<ColorVariant, string> = {
  terra: 'rgba(196,96,58,0.12)',
  sage:  'rgba(122,158,126,0.15)',
  ochre: 'rgba(212,168,75,0.14)',
  bark:  'rgba(61,43,31,0.08)',
};

/**
 * Background + foreground colour pairs for <pens-chip> pill badges.
 */
const CHIP_COLORS: Record<ChipVariant, ChipColor> = {
  terra: { bg: 'rgba(196,96,58,0.12)',   color: 'var(--terracotta)' },
  sage:  { bg: 'rgba(122,158,126,0.16)', color: 'var(--sage-dark)'  },
  ochre: { bg: 'rgba(212,168,75,0.14)',  color: '#8a6a1a'            },
};

/**
 * Styling tokens for volunteer-job level badges (<pens-job-card>).
 */
const LEVEL_STYLES: Record<LevelVariant, LevelStyle> = {
  board:     { bg: 'rgba(212,168,75,0.12)',   accent: 'var(--ochre)',      label: 'Leadership' },
  classroom: { bg: 'rgba(122,158,126,0.12)',  accent: 'var(--sage-dark)',  label: 'Classroom'  },
  grounds:   { bg: 'rgba(61,43,31,0.07)',     accent: 'var(--bark-light)', label: 'Grounds'    },
  events:    { bg: 'rgba(196,96,58,0.10)',    accent: 'var(--terracotta)', label: 'Events'     },
  comms:     { bg: 'rgba(122,158,126,0.10)',  accent: 'var(--sage-dark)',  label: 'Comms'      },
};

/** Helper: resolve an ICON_BG entry, falling back to 'terra'. */
function iconBg(variant: string): string {
  return ICON_BG[variant as ColorVariant] ?? ICON_BG.terra;
}

/** Helper: resolve a CHIP_COLORS entry, falling back to 'terra'. */
function chipColor(variant: string): ChipColor {
  return CHIP_COLORS[variant as ChipVariant] ?? CHIP_COLORS.terra;
}

/** Helper: resolve a LEVEL_STYLES entry, falling back to 'classroom'. */
function levelStyle(variant: string): LevelStyle {
  return LEVEL_STYLES[variant as LevelVariant] ?? LEVEL_STYLES.classroom;
}


// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL / SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ── 1. <pens-banner> ───────────────────────────────────────────────────────────
// Full-width terracotta announcement strip. Content goes in the slot;
// any <a> slotted directly inside is styled in warm ivory.
// ──────────────────────────────────────────────────────────────────────────────

class PensBanner extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_CSS}
        :host { background: var(--terracotta); color: #fff; }
        .wrap {
          text-align: center;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.02em;
          line-height: 1.4;
        }
        ::slotted(a) { color: #ffe9c4; text-underline-offset: 3px; }
      </style>
      <div class="wrap"><slot></slot></div>
    `;
  }
}
customElements.define('pens-banner', PensBanner);


// ── 2. <pens-nav page="payments"> ─────────────────────────────────────────────
// Sticky site navigation with desktop links + hamburger mobile drawer.
//
// Attributes:
//   page — key of the currently active link (e.g. "payments")
//
// All open/close state lives in _open. The drawer uses a CSS max-height
// transition for a smooth slide animation.
// ──────────────────────────────────────────────────────────────────────────────

interface NavLink {
  href: string;
  label: string;
  key?: string;
  active: boolean;
}

class PensNav extends HTMLElement {
  private _open: boolean = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this._render();
    this._attachEvents();
  }

  /** Returns nav link definitions, marking the active one. */
  private _links(): NavLink[] {
    const page = this.getAttribute('page') ?? '';
    const items: Omit<NavLink, 'active'>[] = [
      { href: 'index.html#about',   label: 'About'    },
      { href: 'index.html#program', label: 'Program'  },
      { href: 'index.html#classes', label: 'Classes'  },
      { href: 'payments',           label: 'Payments', key: 'payments' },
    ];
    return items.map(l => ({ ...l, active: l.key === page }));
  }

  /** Builds the full shadow DOM. Only called once on connect. */
  private _render(): void {
    const links = this._links();

    const desktopLinks = links.map(l =>
      `<li><a href="${esc(l.href)}"${l.active ? ' class="active"' : ''}>${l.label}</a></li>`
    ).join('');

    // Mobile links carry class="ml" so the close handler can target them
    const mobileLinks = links.map(l =>
      `<li><a href="${esc(l.href)}" class="ml">${l.label}</a></li>`
    ).join('');

    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_CSS}
        :host { display: block; position: sticky; top: 0; z-index: 200; }

        nav {
          background: rgba(253,246,237,0.96);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(122,158,126,0.2);
          height: var(--nav-h, 64px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 5vw;
          gap: 16px;
        }

        .logo {
          font-family: var(--font-display);
          font-size: 1.25rem;
          color: var(--bark);
          text-decoration: none;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .logo span { color: var(--terracotta); }

        ul { display: flex; align-items: center; gap: 1.8rem; list-style: none; }
        ul a {
          font-size: 14px;
          font-weight: 500;
          color: var(--bark-light);
          text-decoration: none;
          letter-spacing: 0.03em;
          transition: color 0.2s;
          white-space: nowrap;
        }
        ul a:hover, ul a.active { color: var(--terracotta); }

        .cta {
          background: var(--sage) !important;
          color: #fff !important;
          padding: 8px 20px;
          border-radius: 100px;
          transition: background 0.2s !important;
        }
        .cta:hover { background: var(--sage-dark) !important; }

        /* ── Hamburger ── */
        .burger {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 5px;
          width: 40px;
          height: 40px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 8px;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .burger:hover { background: rgba(61,43,31,0.07); }
        .burger span {
          display: block;
          width: 22px;
          height: 2px;
          background: var(--bark);
          border-radius: 2px;
          transition: transform 0.3s, opacity 0.3s;
          transform-origin: center;
        }
        .burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .burger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* ── Mobile drawer (max-height slide) ── */
        .drawer {
          position: fixed;
          top: var(--nav-h, 64px);
          left: 0; right: 0;
          background: var(--warm-white);
          border-bottom: 2px solid rgba(122,158,126,0.2);
          z-index: 199;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.36s ease, padding 0.3s;
          box-shadow: 0 8px 30px rgba(61,43,31,0.1);
        }
        .drawer.open { max-height: 520px; padding: 8px 0 24px; }
        .drawer ul { flex-direction: column; gap: 0; }
        .drawer ul a {
          display: block;
          padding: 13px 6vw;
          font-size: 16px;
          border-bottom: 1px solid rgba(61,43,31,0.06);
        }
        .drawer ul li:last-child a { border-bottom: none; }
        .drawer ul a:hover { background: var(--mist); }

        .drawer-cta {
          display: block;
          margin: 16px 6vw 0;
          background: var(--terracotta);
          color: #fff;
          text-align: center;
          padding: 14px 20px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 500;
          text-decoration: none;
          transition: background 0.2s;
        }
        .drawer-cta:hover { background: #a84e2e; }

        @media (max-width: 900px) {
          ul { display: none; }
          .burger { display: flex; }
        }
      </style>

      <nav>
        <a class="logo" href="index.html">Soquel <span>PENS</span></a>
        <ul>
          ${desktopLinks}
          <li><a href="index.html#enroll" class="cta">Enroll Now</a></li>
        </ul>
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

  /** Wires click, keyboard, and outside-click handlers after first render. */
  private _attachEvents(): void {
    const sr     = this.shadowRoot!;
    const burger = sr.getElementById('burger') as HTMLButtonElement;
    const drawer = sr.getElementById('drawer') as HTMLDivElement;

    const close = (): void => {
      this._open = false;
      burger.classList.remove('open');
      drawer.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    };

    const toggle = (): void => {
      this._open = !this._open;
      burger.classList.toggle('open', this._open);
      drawer.classList.toggle('open', this._open);
      burger.setAttribute('aria-expanded', String(this._open));
    };

    // stopPropagation prevents the document handler from immediately closing on open
    burger.addEventListener('click', (e: MouseEvent) => { e.stopPropagation(); toggle(); });

    // All mobile links close the drawer when tapped
    sr.querySelectorAll<HTMLAnchorElement>('.ml').forEach(l =>
      l.addEventListener('click', close)
    );

    // Close on outside click
    document.addEventListener('click', (e: MouseEvent) => {
      if (!this.contains(e.target as Node)) close();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    });
  }
}
customElements.define('pens-nav', PensNav);


// ── 3. <pens-page-hero heading="" heading-accent="" subheading="" breadcrumb="" bgimage=""> ──
// Dark bark-background hero for inner pages.
// heading="How to" heading-accent="Join"  →  How to <em>Join</em>
//
// The h1 and p fade + slide up on load via the `fu` keyframe animation.
// ──────────────────────────────────────────────────────────────────────────────

class PensPageHero extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    const heading    = this.getAttribute('heading')        ?? '';
    const accent     = this.getAttribute('heading-accent') ?? '';
    const subheading = this.getAttribute('subheading')     ?? '';
    const breadcrumb = this.getAttribute('breadcrumb')     ?? 'Page';
    const bgimage    = this.getAttribute('bgimage')
      ?? '/uploads/6/4/9/4/64940231/background-images/1134880908.jpg';

    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_CSS}
        :host { background: var(--bark); display: block; overflow: hidden; position: relative; }

        .bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse 60% 80% at 90% 50%, rgba(122,158,126,.14) 0%, transparent 70%),
            radial-gradient(ellipse 40% 60% at 10% 80%, rgba(212,168,75,.10)  0%, transparent 65%);
        }

        .inner { position: relative; max-width: 1140px; margin: 0 auto; padding: 10px 5vw 30px; }

        .crumb {
          display: flex; align-items: center; gap: 8px;
          font-size: 12.5px; color: rgba(253,246,237,.45); margin-bottom: 20px;
        }
        .crumb a { color: rgba(253,246,237,.45); text-decoration: none; transition: color .2s; }
        .crumb a:hover { color: var(--ochre); }

        h1 {
          font-family: var(--font-display);
          font-size: clamp(2.2rem, 5vw, 3.8rem);
          color: var(--cream);
          line-height: 1.15;
          margin-bottom: 16px;
          opacity: 0;
          animation: fu .7s .1s ease forwards;
        }
        h1 em { font-style: italic; color: var(--ochre); }

        p {
          color: rgba(253,246,237,.62);
          font-size: 1.05rem;
          max-width: 540px;
          line-height: 1.65;
          opacity: 0;
          animation: fu .7s .25s ease forwards;
        }

        @keyframes fu {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: none; }
        }

        @media (max-width: 600px) { .inner { padding: 44px 5vw 30px; } }
      </style>

      <div class="bg"></div>
      <div class="inner">
        <div class="crumb">
          <a href="index.html">Home</a>
          <span>›</span>
          <span style="color:rgba(253,246,237,.65)">${esc(breadcrumb)}</span>
        </div>
        <h1>${esc(heading)} <em>${esc(accent)}</em></h1>
        <p>${esc(subheading)}</p>
      </div>
    `;
  }
}
customElements.define('pens-page-hero', PensPageHero);


// ── 4. <pens-alert variant="default|info" icon="📅"> ──────────────────────────
// Callout box. Body content goes in the slot.
//
// Attributes:
//   variant — "info" renders sage-green; anything else is terracotta
//   icon    — optional emoji to the left of the message
// ──────────────────────────────────────────────────────────────────────────────

class PensAlert extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    const variant: AlertVariant = (this.getAttribute('variant') ?? 'default') as AlertVariant;
    const icon    = this.getAttribute('icon') ?? '';
    const isInfo  = variant === 'info';

    const bg          = isInfo ? 'rgba(122,158,126,0.1)'  : 'rgba(196,96,58,0.08)';
    const border      = isInfo ? 'rgba(122,158,126,0.28)' : 'rgba(196,96,58,0.22)';
    const strongColor = isInfo ? 'var(--sage-dark)'       : 'var(--terracotta)';

    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_CSS}
        :host { display: block; }
        .wrap {
          display: flex; gap: 14px; align-items: flex-start;
          background: ${bg};
          border: 1.5px solid ${border};
          border-radius: 14px;
          padding: 18px 20px;
          font-size: 14.5px;
          line-height: 1.6;
        }
        .icon { font-size: 20px; flex-shrink: 0; line-height: 1.5; }
        ::slotted(strong) { color: ${strongColor}; }
      </style>
      <div class="wrap">
        ${icon ? `<span class="icon">${icon}</span>` : ''}
        <div><slot></slot></div>
      </div>
    `;
  }
}
customElements.define('pens-alert', PensAlert);


// ── 5. <pens-chip color="terra|sage|ochre"> ───────────────────────────────────
// Inline pill badge. Slot provides the label text.
// ──────────────────────────────────────────────────────────────────────────────

class PensChip extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    const { bg, color: fg } = chipColor(this.getAttribute('color') ?? 'terra');

    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_CSS}
        :host { display: inline-block; }
        .chip {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 12.5px;
          font-weight: 500;
          background: ${bg};
          color: ${fg};
          line-height: 1.3;
        }
      </style>
      <span class="chip"><slot></slot></span>
    `;
  }
}
customElements.define('pens-chip', PensChip);


// ── 6. <pens-btn href="" variant="primary|sage|ochre|paypal|outline" size="normal|sm" full> ──
// Styled link-button rendered as an <a> element inside shadow DOM.
//
// Attributes:
//   href    — link destination
//   variant — controls background/colour (see COLOR map below)
//   size    — "sm" for compact sizing; "normal" (default) for standard
//   full    — boolean; stretches to 100% width when present
// ──────────────────────────────────────────────────────────────────────────────

class PensBtn extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    const href    = this.getAttribute('href')    ?? '#';
    const variant = (this.getAttribute('variant') ?? 'primary') as BtnVariant;
    const size    = (this.getAttribute('size')    ?? 'normal') as BtnSize;
    const full    = this.hasAttribute('full');

    const COLOR: Record<BtnVariant, string> = {
      primary: 'background: var(--terracotta); color: #fff;',
      sage:    'background: var(--sage); color: #fff;',
      ochre:   'background: var(--ochre); color: var(--bark);',
      paypal:  'background: #0070ba; color: #fff;',
      outline: 'background: transparent; color: var(--bark); border: 1.5px solid rgba(61,43,31,0.25);',
    };

    const padding  = size === 'sm' ? '10px 20px' : '13px 28px';
    const fontSize = size === 'sm' ? '13.5px'    : '15px';

    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_CSS}
        :host { display: ${full ? 'block' : 'inline-block'}; }
        a {
          display: ${full ? 'flex' : 'inline-flex'};
          align-items: center;
          justify-content: center;
          ${full ? 'width: 100%;' : ''}
          padding: ${padding};
          border-radius: 100px;
          font-size: ${fontSize};
          font-weight: 500;
          text-decoration: none;
          font-family: var(--font-body);
          white-space: nowrap;
          transition: transform 0.2s, box-shadow 0.2s;
          ${COLOR[variant] ?? COLOR.primary}
        }
        a:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(61,43,31,0.14);
          ${variant === 'outline' ? 'border-color: var(--terracotta); color: var(--terracotta);' : ''}
        }
      </style>
      <a href="${esc(href)}"><slot></slot></a>
    `;
  }
}
customElements.define('pens-btn', PensBtn);


// ── 7. <pens-contact-info> ────────────────────────────────────────────────────
// Self-contained contact details block. No attributes — data is baked in.
// ──────────────────────────────────────────────────────────────────────────────

class PensContactInfo extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.shadowRoot!.innerHTML = `
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


// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENTS PAGE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ── 8. <pens-accordion icon="" title="" subtitle="" amount="" icon-variant="" open> ──
// Animated expand/collapse card.
//
// _render() writes the shadow DOM once. _update() only toggles .open
// so the slot distribution is never destroyed on click.
// ──────────────────────────────────────────────────────────────────────────────

class PensAccordion extends HTMLElement {
  private _open: boolean = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this._open = this.hasAttribute('open');
    this._render();
    this.shadowRoot!.querySelector('.header')!.addEventListener('click', () => {
      this._open = !this._open;
      this._update();
    });
  }

  private _render(): void {
    const icon     = this.getAttribute('icon')         ?? '📄';
    const title    = esc(this.getAttribute('title')    ?? '');
    const subtitle = esc(this.getAttribute('subtitle') ?? '');
    const amount   = esc(this.getAttribute('amount')   ?? '');
    const bg       = iconBg(this.getAttribute('icon-variant') ?? 'terra');

    this.shadowRoot!.innerHTML = `
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
          flex-shrink: 0; background: ${bg};
        }

        .title    { font-family: var(--font-display); font-size: 1.1rem; color: var(--bark); margin-bottom: 2px; }
        .subtitle { font-size: 13px; color: var(--bark-light); }
        .amount   { font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; color: var(--terracotta); white-space: nowrap; }

        .chevron { font-size: 16px; color: var(--bark-light); transition: transform 0.3s; flex-shrink: 0; }
        .card.open .chevron { transform: rotate(180deg); }

        .body { max-height: 0; overflow: hidden; transition: max-height 0.4s ease; }
        .card.open .body { max-height: 800px; }

        .body-inner { padding: 20px 24px 24px; border-top: 1px solid rgba(61,43,31,0.07); }

        ::slotted(p)              { font-size: 14.5px; color: var(--bark-light); margin-bottom: 14px; line-height: 1.6; }
        ::slotted(p:last-of-type) { margin-bottom: 0; }
        ::slotted(pens-memo)      { display: block; margin: 12px 0 16px; }
        ::slotted(pens-btn)       { display: inline-block; margin-top: 18px; }
        ::slotted(pens-alert)     { display: block; margin-top: 14px; }

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

  /** Toggles .open without re-rendering, preserving slot distribution. */
  private _update(): void {
    this.shadowRoot!.querySelector('.card')!.classList.toggle('open', this._open);
  }
}
customElements.define('pens-accordion', PensAccordion);


// ── 9. <pens-tuition-table> ───────────────────────────────────────────────────
// Self-contained tuition schedule table. All data is baked in.
// The sibling-discount column hides at ≤ 640px via .col-discount.
// ──────────────────────────────────────────────────────────────────────────────

class PensTuitionTable extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.shadowRoot!.innerHTML = `
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

        .badge { display: inline-block; font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 100px; }
        .mwf   { background: rgba(196,96,58,0.1);   color: var(--terracotta); }
        .tth   { background: rgba(122,158,126,0.14); color: var(--sage-dark); }

        .price     { font-family: var(--font-display); font-weight: 700; color: var(--terracotta); font-size: 1.1rem; }
        .price-sub { font-size: 12px; color: var(--bark-light); margin-top: 2px; }
        .sib       { font-size: 13px; color: var(--bark-light); }

        @media (max-width: 640px) { .col-discount { display: none; } }
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


// ── 10. <pens-memo> ───────────────────────────────────────────────────────────
// Monospace payment-reference box. <strong> in the slot renders terracotta.
// ──────────────────────────────────────────────────────────────────────────────

class PensMemo extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.shadowRoot!.innerHTML = `
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


// ── 11. <pens-fee-item icon="" heading="" amount="" memo=""> ──────────────────
// Compact fee card for the 2-column fees grid.
// ──────────────────────────────────────────────────────────────────────────────

class PensFeeItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    const icon    = this.getAttribute('icon')    ?? '📄';
    const heading = this.getAttribute('heading') ?? '';
    const amount  = this.getAttribute('amount')  ?? '';
    const memo    = this.getAttribute('memo')    ?? '';

    this.shadowRoot!.innerHTML = `
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
          font-weight: 700; color: var(--terracotta); margin-top: 6px;
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


// ── 12. <pens-quick-link href="" icon=""> ─────────────────────────────────────
// Full-width anchor row for the "Quick Pay" sidebar. Slides right on hover.
// ──────────────────────────────────────────────────────────────────────────────

class PensQuickLink extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    const href = this.getAttribute('href') ?? '#';
    const icon = this.getAttribute('icon') ?? '→';

    this.shadowRoot!.innerHTML = `
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


// ── 13. <pens-timeline-item date="" variant="ok|warn"> ────────────────────────
// One step in the payment timeline. The connecting line hides automatically
// on the last item via :host(:last-child) .line — no JS needed.
// ──────────────────────────────────────────────────────────────────────────────

class PensTimelineItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    const date      = esc(this.getAttribute('date') ?? '');
    const variant   = (this.getAttribute('variant') ?? 'ok') as TimelineVariant;
    const isWarn    = variant === 'warn';
    const dotColor  = isWarn ? 'var(--terracotta)' : 'var(--sage)';
    const dateColor = isWarn ? 'var(--terracotta)' : 'var(--sage-dark)';

    this.shadowRoot!.innerHTML = `
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
          color: ${dateColor}; margin-bottom: 3px;
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


// ── 14. <pens-sidebar-card heading="" variant="default|mist"> ────────────────
// Card wrapper for sidebar content. Accepts quick-links, timeline items, etc.
// ──────────────────────────────────────────────────────────────────────────────

class PensSidebarCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    const heading = esc(this.getAttribute('heading') ?? '');
    const variant = (this.getAttribute('variant') ?? 'default') as SidebarVariant;
    const bg     = variant === 'mist' ? 'var(--mist)'               : 'var(--warm-white)';
    const border = variant === 'mist' ? 'rgba(122,158,126,0.22)'    : 'rgba(61,43,31,0.08)';

    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_CSS}
        :host { display: block; }
        .card {
          background: ${bg};
          border-radius: var(--radius-card, 18px);
          padding: 24px 22px;
          border: 1.5px solid ${border};
        }
        h3 { font-family: var(--font-display); font-size: 1.05rem; color: var(--bark); margin-bottom: 14px; }

        ::slotted(pens-quick-link)              { display: block; margin-bottom: 8px; }
        ::slotted(pens-quick-link:last-of-type) { margin-bottom: 0; }
        ::slotted(pens-timeline-item)           { display: flex; }
        ::slotted(p)                            { font-size: 13.5px; color: var(--bark-light); line-height: 1.6; margin-bottom: 12px; }
        ::slotted(p:last-child)                 { margin-bottom: 0; }
        ::slotted(pens-btn)                     { display: block; }
      </style>
      <div class="card">
        <h3>${heading}</h3>
        <slot></slot>
      </div>
    `;
  }
}
customElements.define('pens-sidebar-card', PensSidebarCard);


// ═══════════════════════════════════════════════════════════════════════════════
// HOME / ABOUT PAGE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ── 15. <pens-feature-card icon="" title="" color="terra|sage|ochre"> ─────────

class PensFeatureCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    const icon  = this.getAttribute('icon')  ?? '📄';
    const title = esc(this.getAttribute('title') ?? '');
    const bg    = iconBg(this.getAttribute('color') ?? 'terra');

    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_CSS}
        :host { display: block; }
        .card {
          background: var(--warm-white); border-radius: 18px; padding: 28px 24px;
          border: 1px solid rgba(61,43,31,.07); height: 100%;
          position: relative; overflow: hidden;
          transition: transform .25s, box-shadow .25s;
        }
        .card:hover { transform: translateY(-5px); box-shadow: 0 16px 44px rgba(61,43,31,.1); }
        .icon { width: 48px; height: 48px; border-radius: 13px; display: grid; place-items: center; font-size: 24px; margin-bottom: 16px; background: ${bg}; }
        h3 { font-family: var(--font-display); font-size: 1.1rem; margin-bottom: 8px; color: var(--bark); }
        p  { font-size: 14.5px; color: var(--bark-light); line-height: 1.65; }
        ::slotted(strong) { color: var(--bark); }
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


// ── 16. <pens-stat-card year="" year-label="" headline="" detail=""> ──────────

class PensStatCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    const year      = esc(this.getAttribute('year')       ?? '');
    const yearLabel = esc(this.getAttribute('year-label') ?? '');
    const headline  = esc(this.getAttribute('headline')   ?? '');
    const detail    = esc(this.getAttribute('detail')     ?? '');

    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_CSS}
        :host { display: block; }
        .card { background: var(--bark); border-radius: 24px; padding: 44px 36px; position: relative; overflow: hidden; }
        .deco { position: absolute; top: -30px; right: -30px; width: 180px; height: 180px; border-radius: 50%; background: radial-gradient(circle, rgba(122,158,126,.25) 0%, transparent 70%); }
        .year-row  { display: flex; align-items: baseline; gap: 10px; margin-bottom: 6px; }
        .year      { font-family: var(--font-display); font-size: 4rem; font-weight: 700; color: var(--ochre); line-height: 1; }
        .year-lbl  { font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: rgba(253,246,237,.45); font-weight: 500; }
        .divider   { width: 40px; height: 2px; background: var(--sage); margin: 18px 0; border-radius: 2px; }
        .headline  { font-family: var(--font-display); font-size: 1.2rem; color: var(--cream); line-height: 1.4; margin-bottom: 12px; }
        .detail    { font-size: 14px; color: rgba(253,246,237,.55); line-height: 1.65; }
      </style>
      <div class="card">
        <div class="deco"></div>
        <div class="year-row"><div class="year">${year}</div><div class="year-lbl">${yearLabel}</div></div>
        <div class="divider"></div>
        <div class="headline">${headline}</div>
        <div class="detail">${detail}</div>
      </div>
    `;
  }
}
customElements.define('pens-stat-card', PensStatCard);


// ── 17. <pens-value-item icon="" heading=""> ──────────────────────────────────

class PensValueItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    const icon    = this.getAttribute('icon')    ?? '✦';
    const heading = esc(this.getAttribute('heading') ?? '');

    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_CSS}
        :host { display: block; }
        .item { display: flex; gap: 14px; align-items: flex-start; background: var(--warm-white); border-radius: 16px; padding: 22px 20px; border: 1px solid rgba(61,43,31,.07); }
        .ico { font-size: 22px; flex-shrink: 0; margin-top: 2px; line-height: 1; }
        h3   { font-family: var(--font-display); font-size: 1rem; color: var(--bark); margin-bottom: 6px; }
        p    { font-size: 14px; color: var(--bark-light); line-height: 1.6; }
      </style>
      <div class="item">
        <div class="ico">${icon}</div>
        <div><h3>${heading}</h3><p><slot></slot></p></div>
      </div>
    `;
  }
}
customElements.define('pens-value-item', PensValueItem);


// ── 18. <pens-participation-grid> ────────────────────────────────────────────
// Self-contained 4-col grid. All content is baked in — no attributes.
// ──────────────────────────────────────────────────────────────────────────────

class PensParticipationGrid extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    const items: ParticipationItem[] = [
      { icon: '🏫', text: "Work in your child's class one day each week, arriving early to help the teacher set up" },
      { icon: '🧹', text: 'Stay after class to clean up and meet with the teacher and other parents for the weekly seminar' },
      { icon: '🌙', text: 'Attend Fun, Inspirational Education Nights — included with tuition, open to you and adult caregivers' },
      { icon: '👥', text: "Attend small-group Class Meetings twice a year to discuss the class and your child's development" },
      { icon: '🍎', text: "Provide a nutritious snack for your child's class approximately once a month" },
      { icon: '🔧', text: 'Take on a Support Job: Board Director, class photographer, gardening, shopping, and more' },
      { icon: '🎉', text: 'Contribute 4 hours of fundraising time and raise at least $100 per school year' },
      { icon: '💛', text: 'Be an active, invested partner in the school — because your participation is the heart of everything we do' },
    ];

    const cards = items.map(i => `
      <div class="item">
        <span class="ico">${i.icon}</span>
        <p>${i.text}</p>
      </div>
    `).join('');

    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_CSS}
        :host { display: block; }
        .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; background: rgba(255,255,255,.05); border-radius: 16px; overflow: hidden; margin-bottom: 28px; }
        .item { background: var(--bark); padding: 28px 22px; transition: background .2s; }
        .item:hover { background: rgba(255,255,255,.04); }
        .ico { font-size: 24px; display: block; margin-bottom: 12px; }
        p    { font-size: 13.5px; color: rgba(253,246,237,.58); line-height: 1.65; }
        @media (max-width: 900px) { .grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 500px) { .grid { grid-template-columns: 1fr; } }
      </style>
      <div class="grid">${cards}</div>
    `;
  }
}
customElements.define('pens-participation-grid', PensParticipationGrid);


// ── 19. <pens-dark-stat number="" label="" sub=""> ────────────────────────────

class PensDarkStat extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    const number = esc(this.getAttribute('number') ?? '');
    const label  = esc(this.getAttribute('label')  ?? '');
    const sub    = esc(this.getAttribute('sub')    ?? '');

    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_CSS}
        :host { display: block; }
        .stat { background: var(--bark); padding: 32px 24px; text-align: center; transition: background .2s; }
        .stat:hover { background: rgba(255,255,255,.04); }
        .num { font-family: var(--font-display); font-size: 2.2rem; font-weight: 700; color: var(--ochre); line-height: 1; margin-bottom: 8px; }
        .lbl { font-size: 13px; color: rgba(253,246,237,.62); line-height: 1.4; }
        .sub { font-size: 11.5px; color: rgba(253,246,237,.35); margin-top: 4px; }
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


// ── 20. <pens-enrollment-steps> ──────────────────────────────────────────────
// Self-contained numbered enrollment checklist. All steps are baked in.
// ──────────────────────────────────────────────────────────────────────────────

class PensEnrollmentSteps extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    const steps: EnrollmentStep[] = [
      { n: '01', title: 'Contact the Membership Coordinator',         desc: '<a href="/join-waitlist">Express interest here</a>. All families are considered first-come, first-served.' },
      { n: '02', title: 'Download &amp; sign the Requirements Contract', desc: 'Once offered a space, <a href="/registration">complete the enrollment deposit and requirements contract</a>.' },
      { n: '03', title: 'Pick up your Registration Packet',            desc: 'Collect the full packet at school or at the WASCAE office in Santa Cruz.' },
      { n: '04', title: 'Submit paperwork &amp; fees',                   desc: 'Return fully completed forms with your TB test, immunization records, deposits, and registration fees.' },
      { n: '05', title: 'Receive fingerprint clearance',               desc: "Once your Live Scan fingerprint clearance is confirmed (1–3 weeks), you're ready to start!" },
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

    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_CSS}
        :host { display: block; }
        .step { display: flex; gap: 16px; padding-bottom: 22px; position: relative; }
        .step:last-child { padding-bottom: 0; }
        .step::before { content: ''; position: absolute; left: 19px; top: 36px; bottom: 0; width: 1.5px; background: rgba(61,43,31,.1); }
        .step:last-child::before { display: none; }
        .num   { font-size: 13px; font-weight: 700; color: var(--terracotta); width: 40px; height: 40px; border-radius: 50%; background: rgba(196,96,58,.1); display: grid; place-items: center; flex-shrink: 0; }
        .title { font-size: 14px; font-weight: 500; color: var(--bark); margin-bottom: 4px; }
        .desc  { font-size: 13px; color: var(--bark-light); line-height: 1.55; }
      </style>
      ${html}
    `;
  }
}
customElements.define('pens-enrollment-steps', PensEnrollmentSteps);


// ── 21. <pens-instagram handle="soquelpens"> ──────────────────────────────────
// Instagram section with 6-up tile grid + follow CTA. No API key required.
//
// Attributes:
//   handle — Instagram username without @ (default: "soquelpens")
// ──────────────────────────────────────────────────────────────────────────────

class PensInstagram extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    const handle     = this.getAttribute('handle') ?? 'soquelpens';
    const profileUrl = `https://www.instagram.com/${handle}/`;

    const tiles: InstagramTile[] = [
      { img: '/uploads/instanature.jpg', label: 'Nature play' },
      { img: '/uploads/instaart.jpg',    label: 'Art time'    },
      { img: '/uploads/instastory.jpg',  label: 'Story time'  },
      { img: '/uploads/instaout.jpg',    label: 'Outdoor fun' },
      { img: '/uploads/instapub.jpg',    label: 'Community'   },
      { img: '/uploads/instafam.jpg',    label: 'Families'    },
    ];

    const tilesHTML = tiles.map(t => `
      <a class="tile" href="${profileUrl}" target="_blank" rel="noopener"
         title="See our ${t.label} photos on Instagram"
         style="background: url('${t.img}') center / cover no-repeat;">
        <span class="tile-label">${t.label}</span>
      </a>
    `).join('');

    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_CSS}
        :host { display: block; background: var(--bark); }

        .section { padding: 80px 5vw; max-width: 1140px; margin: 0 auto; }

        .header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; margin-bottom: 44px; }
        .eyebrow { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(253,246,237,0.42); font-weight: 500; margin-bottom: 8px; }
        h2 { font-family: var(--font-display); font-size: clamp(1.8rem, 3.5vw, 2.6rem); color: var(--cream); line-height: 1.2; }
        h2 em { font-style: italic; color: var(--ochre); }

        .profile-card { display: inline-flex; align-items: center; gap: 14px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 100px; padding: 10px 20px 10px 10px; text-decoration: none; transition: background 0.2s, transform 0.2s; }
        .profile-card:hover { background: rgba(255,255,255,0.13); transform: translateY(-1px); }
        .ig-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); display: grid; place-items: center; font-size: 20px; flex-shrink: 0; }
        .profile-handle { font-size: 14px; font-weight: 500; color: var(--cream); display: block; }
        .profile-sub    { font-size: 11.5px; color: rgba(253,246,237,0.5); }
        .ig-icon        { width: 18px; height: 18px; margin-left: 4px; }

        .grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }

        .tile { aspect-ratio: 1; border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-decoration: none; position: relative; overflow: hidden; cursor: pointer; transition: transform 0.28s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s; }
        .tile:hover { transform: scale(1.06) translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.35); z-index: 1; }
        .tile::after { content: ''; position: absolute; inset: 0; background: linear-gradient(45deg, rgba(240,148,51,0.22), rgba(230,104,60,0.18), rgba(220,39,67,0.18), rgba(188,24,136,0.18)); opacity: 0; transition: opacity 0.25s; }
        .tile:hover::after { opacity: 1; }
        .tile-label { font-size: 15px; font-weight: 500; color: #fff; text-transform: uppercase; letter-spacing: 0.07em; position: relative; z-index: 1; margin-top: 8px; text-shadow: 0 1px 3px rgba(0,0,0,0.4); }

        .cta-bar { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 32px; flex-wrap: wrap; }
        .cta-text { font-size: 14px; color: rgba(253,246,237,0.5); }
        .follow-btn { display: inline-flex; align-items: center; gap: 9px; padding: 12px 26px; border-radius: 100px; background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #bc1888); color: #fff; text-decoration: none; font-size: 14.5px; font-weight: 500; font-family: var(--font-body); transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s; box-shadow: 0 4px 20px rgba(220,39,67,0.35); }
        .follow-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(220,39,67,0.45); opacity: 0.93; }

        @media (max-width: 800px) { .grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 480px) { .grid { grid-template-columns: repeat(2, 1fr); gap: 8px; } }
        @media (max-width: 600px) { .section { padding: 60px 5vw; } }
      </style>

      <div class="section">
        <div class="header">
          <div class="header-left">
            <div class="eyebrow">Follow Along</div>
            <h2>We're on <em>Instagram</em></h2>
          </div>
          <a class="profile-card" href="${profileUrl}" target="_blank" rel="noopener">
            <div class="ig-avatar"><img src="/uploads/instaimage.jpg" width="40" alt="@${handle}"></div>
            <div>
              <span class="profile-handle">@${handle}</span>
              <span class="profile-sub">Soquel PENS · Santa Cruz, CA</span>
            </div>
            <svg class="ig-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="20" height="20" rx="5" stroke="rgba(253,246,237,0.55)" stroke-width="1.8"/>
              <circle cx="12" cy="12" r="4.5" stroke="rgba(253,246,237,0.55)" stroke-width="1.8"/>
              <circle cx="17.5" cy="6.5" r="1" fill="rgba(253,246,237,0.55)"/>
            </svg>
          </a>
        </div>

        <div class="grid">${tilesHTML}</div>

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


// ═══════════════════════════════════════════════════════════════════════════════
// TEACHER / ABOUT PAGE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ── 22. <pens-teacher-photo> ──────────────────────────────────────────────────

class PensTeacherPhoto extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_CSS}
        :host { display: block; margin-bottom: 20px; }
        .frame { position: relative; border-radius: 24px; overflow: hidden; aspect-ratio: 4 / 3; box-shadow: 0 24px 60px rgba(61,43,31,0.22); }
        img { width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block; transition: transform 0.5s ease; }
        .frame:hover img { transform: scale(1.03); }
        .frame::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 40%; background: linear-gradient(to top, rgba(61,43,31,0.35) 0%, transparent 100%); pointer-events: none; }
        .orb { position: absolute; width: 200px; height: 200px; border-radius: 50%; background: radial-gradient(circle, rgba(122,158,126,0.3) 0%, transparent 70%); top: -30px; right: -30px; z-index: -1; }
        .caption { position: absolute; bottom: 16px; left: 16px; z-index: 1; background: rgba(253,246,237,0.92); backdrop-filter: blur(8px); border-radius: 10px; padding: 8px 14px; font-size: 12.5px; font-weight: 500; color: var(--bark); letter-spacing: 0.03em; }
        .caption span { color: var(--terracotta); }
      </style>
      <div style="position: relative;">
        <div class="orb"></div>
        <div class="frame">
          <img src="/uploads/6/4/9/4/64940231/published/colleen-s-website-bio-photo.jpg" alt="Soquel PENS Head Teacher" loading="eager">
          <div class="caption">Head Teacher · <span>Soquel PENS</span></div>
        </div>
      </div>
    `;
  }
}
customElements.define('pens-teacher-photo', PensTeacherPhoto);


// ── 23. <pens-profile-card> ───────────────────────────────────────────────────

class PensProfileCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_CSS}
        :host { display: block; }
        .card { background: var(--bark); border-radius: 24px; padding: 44px 36px; position: relative; overflow: hidden; }
        .orb  { position: absolute; top: -40px; right: -40px; width: 200px; height: 200px; border-radius: 50%; background: radial-gradient(circle, rgba(122,158,126,.22) 0%, transparent 70%); }
        .avatar { width: 100px; height: 100px; border-radius: 50%; overflow: hidden; margin-bottom: 20px; box-shadow: 0 8px 24px rgba(0,0,0,.35); border: 3px solid rgba(255,255,255,.12); }
        .avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .name    { font-family: var(--font-display); font-size: 1.4rem; color: var(--cream); margin-bottom: 4px; }
        .role    { font-size: 13px; letter-spacing: .08em; text-transform: uppercase; color: rgba(253,246,237,.45); margin-bottom: 24px; }
        .divider { width: 36px; height: 2px; background: var(--ochre); margin-bottom: 24px; border-radius: 2px; }
        .facts   { display: flex; flex-direction: column; gap: 14px; }
        .fact    { display: flex; align-items: flex-start; gap: 12px; }
        .fact-icon { font-size: 16px; flex-shrink: 0; margin-top: 2px; }
        .fact-text { font-size: 13.5px; color: rgba(253,246,237,.62); line-height: 1.55; }
        .fact-text strong { color: rgba(253,246,237,.88); }
        .badge-row   { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 24px; }
        .badge       { display: inline-block; padding: 5px 12px; border-radius: 100px; font-size: 11.5px; font-weight: 500; }
        .badge-ochre { background: rgba(212,168,75,.18); color: var(--ochre); }
        .badge-sage  { background: rgba(122,158,126,.18); color: rgba(180,230,180,1); }
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
      </div>
    `;
  }
}
customElements.define('pens-profile-card', PensProfileCard);


// ── 24. <pens-principle-card icon="" title="" color=""> ───────────────────────

class PensPrincipleCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    const icon  = this.getAttribute('icon')  ?? '✦';
    const title = esc(this.getAttribute('title') ?? '');
    const bg    = iconBg(this.getAttribute('color') ?? 'terra');

    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_CSS}
        :host { display: block; }
        .card { background: var(--warm-white); border-radius: 16px; padding: 22px; border: 1px solid rgba(61,43,31,.07); display: flex; gap: 16px; align-items: flex-start; transition: transform .2s, box-shadow .2s; }
        .card:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(61,43,31,.09); }
        .icon { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; font-size: 22px; flex-shrink: 0; background: ${bg}; }
        h3 { font-family: var(--font-display); font-size: 1rem; margin-bottom: 6px; color: var(--bark); }
        p  { font-size: 14px; color: var(--bark-light); line-height: 1.6; }
      </style>
      <div class="card">
        <div class="icon">${icon}</div>
        <div><h3>${title}</h3><p><slot></slot></p></div>
      </div>
    `;
  }
}
customElements.define('pens-principle-card', PensPrincipleCard);


// ── 25. <pens-experience-card icon="" number="" unit="" label=""> ──────────────

class PensExperienceCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    const icon   = this.getAttribute('icon')   ?? '📄';
    const number = esc(this.getAttribute('number') ?? '');
    const unit   = esc(this.getAttribute('unit')   ?? '');
    const label  = esc(this.getAttribute('label')  ?? '');

    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_CSS}
        :host { display: block; }
        .card { background: var(--warm-white); border-radius: 18px; padding: 28px 24px; border: 1px solid rgba(61,43,31,.07); height: 100%; transition: transform .25s, box-shadow .25s; }
        .card:hover { transform: translateY(-4px); box-shadow: 0 14px 40px rgba(61,43,31,.1); }
        .top   { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
        .ico   { font-size: 26px; }
        .stat  { display: flex; align-items: baseline; gap: 4px; }
        .num   { font-family: var(--font-display); font-size: 1.8rem; font-weight: 700; color: var(--terracotta); line-height: 1; }
        .unit  { font-size: 12px; color: var(--bark-light); text-transform: uppercase; letter-spacing: .05em; }
        .label { font-size: 11.5px; font-weight: 500; letter-spacing: .07em; text-transform: uppercase; color: var(--sage-dark); margin-bottom: 8px; }
        p      { font-size: 14px; color: var(--bark-light); line-height: 1.6; }
      </style>
      <div class="card">
        <div class="top">
          <span class="ico">${icon}</span>
          <div class="stat">
            <span class="num">${number}</span>
            ${unit ? `<span class="unit">${unit}</span>` : ''}
          </div>
        </div>
        <div class="label">${label}</div>
        <p><slot></slot></p>
      </div>
    `;
  }
}
customElements.define('pens-experience-card', PensExperienceCard);


// ── 26. <pens-dark-influence-card icon="" title="" author=""> ─────────────────

class PensDarkInfluenceCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    const icon   = this.getAttribute('icon')   ?? '✦';
    const title  = esc(this.getAttribute('title')  ?? '');
    const author = esc(this.getAttribute('author') ?? '');

    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_CSS}
        :host { display: block; }
        .card { background: rgba(255,255,255,.05); border: 1.5px solid rgba(255,255,255,.1); border-radius: 20px; padding: 36px 30px; transition: background .2s, transform .2s; }
        .card:hover { background: rgba(255,255,255,.08); transform: translateY(-2px); }
        .header  { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
        .ico     { font-size: 32px; }
        .title   { font-family: var(--font-display); font-size: 1.2rem; color: var(--cream); }
        .author  { font-size: 12px; color: rgba(253,246,237,.4); letter-spacing: .05em; margin-top: 3px; }
        .divider { width: 32px; height: 1.5px; background: var(--ochre); border-radius: 2px; margin-bottom: 18px; }
        p        { font-size: 14.5px; color: rgba(253,246,237,.6); line-height: 1.7; }
      </style>
      <div class="card">
        <div class="header">
          <span class="ico">${icon}</span>
          <div><div class="title">${title}</div><div class="author">${author}</div></div>
        </div>
        <div class="divider"></div>
        <p><slot></slot></p>
      </div>
    `;
  }
}
customElements.define('pens-dark-influence-card', PensDarkInfluenceCard);


// ── 27. <pens-seminar-topic icon="" title=""> ─────────────────────────────────

class PensSeminarTopic extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    const icon  = this.getAttribute('icon')  ?? '📌';
    const title = esc(this.getAttribute('title') ?? '');

    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_CSS}
        :host { display: block; }
        .card { background: var(--cream); border-radius: 16px; padding: 22px 20px; border: 1px solid rgba(61,43,31,.07); transition: transform .2s, box-shadow .2s; }
        .card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(61,43,31,.09); }
        .top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .ico { font-size: 20px; }
        h4   { font-family: var(--font-display); font-size: .95rem; color: var(--bark); }
        p    { font-size: 13.5px; color: var(--bark-light); line-height: 1.6; }
      </style>
      <div class="card">
        <div class="top"><span class="ico">${icon}</span><h4>${title}</h4></div>
        <p><slot></slot></p>
      </div>
    `;
  }
}
customElements.define('pens-seminar-topic', PensSeminarTopic);


// ═══════════════════════════════════════════════════════════════════════════════
// RESOURCES PAGE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ── 28. <pens-resource-card icon="" category="" title="" url="" tag=""> ────────

class PensResourceCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    const icon  = this.getAttribute('icon')         ?? '🔗';
    const cat   = esc(this.getAttribute('category') ?? '');
    const title = esc(this.getAttribute('title')    ?? '');
    const url   = this.getAttribute('url')          ?? '#';
    const tag   = esc(this.getAttribute('tag')      ?? '');

    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_CSS}
        :host { display: block; }
        .card { background: var(--warm-white); border-radius: 16px; padding: 22px 20px; border: 1px solid rgba(61,43,31,.07); height: 100%; display: flex; flex-direction: column; transition: transform .22s, box-shadow .22s; }
        .card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(61,43,31,.09); }
        .top  { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 10px; }
        .ico  { font-size: 22px; flex-shrink: 0; margin-top: 1px; }
        .cat  { font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--sage-dark); font-weight: 500; margin-bottom: 3px; }
        h3    { font-family: var(--font-display); font-size: 1rem; color: var(--bark); line-height: 1.3; }
        p     { font-size: 13.5px; color: var(--bark-light); line-height: 1.6; flex: 1; margin: 8px 0 14px; }
        a     { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 500; color: var(--terracotta); text-decoration: none; transition: gap .2s; }
        a:hover { gap: 10px; }
        .tag  { font-size: 11px; color: var(--bark-light); opacity: .7; font-family: monospace; }
      </style>
      <div class="card">
        <div class="top">
          <span class="ico">${icon}</span>
          <div><div class="cat">${cat}</div><h3>${title}</h3></div>
        </div>
        <p><slot></slot></p>
        <a href="${esc(url)}" target="_blank" rel="noopener">
          <span class="tag">${tag}</span> →
        </a>
      </div>
    `;
  }
}
customElements.define('pens-resource-card', PensResourceCard);


// ── 29. <pens-suggest-box> ────────────────────────────────────────────────────

class PensSuggestBox extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_CSS}
        :host { display: block; margin-top: 24px; }
        .box { background: var(--mist); border-radius: 14px; padding: 20px 22px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .txt { flex: 1; min-width: 200px; }
        .txt p { font-size: 13.5px; color: var(--bark-light); line-height: 1.6; }
        .txt strong { color: var(--bark); }
        a { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 100px; background: var(--sage); color: #fff; font-size: 13.5px; font-weight: 500; text-decoration: none; white-space: nowrap; transition: background .2s, transform .2s; }
        a:hover { background: var(--sage-dark); transform: translateY(-1px); }
      </style>
      <div class="box">
        <div class="txt">
          <p><strong>Know a great local resource?</strong> We'd love to add it to our directory. Email us with the name, link, and a brief description.</p>
        </div>
        <a href="mailto:soquelpens@gmail.com">Suggest a Resource →</a>
      </div>
    `;
  }
}
customElements.define('pens-suggest-box', PensSuggestBox);


// ── 30. <pens-biz-card icon="" name="" tagline="" color=""> ───────────────────

class PensBizCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    const icon    = this.getAttribute('icon')        ?? '🏪';
    const name    = esc(this.getAttribute('name')    ?? '');
    const tagline = esc(this.getAttribute('tagline') ?? '');
    const { bg }  = chipColor(this.getAttribute('color') ?? 'terra');

    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_CSS}
        :host { display: block; }
        .card { background: var(--warm-white); border-radius: 16px; padding: 24px 20px; border: 1px solid rgba(61,43,31,.07); height: 100%; transition: transform .22s, box-shadow .22s; }
        .card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(61,43,31,.09); }
        .name { font-family: var(--font-display); font-size: 1.05rem; color: var(--bark); margin-bottom: 3px; }
        .tag  { font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--sage-dark); font-weight: 500; margin-bottom: 10px; }
        p     { font-size: 13.5px; color: var(--bark-light); line-height: 1.6; }
      </style>
      <div class="card">
        <div class="name">${icon} ${name}</div>
        <div class="tag">${tagline}</div>
        <p><slot></slot></p>
      </div>
    `;
  }
}
customElements.define('pens-biz-card', PensBizCard);


// ── 31. <pens-sponsor-card name="" type="" icon=""> ───────────────────────────

class PensSponsorCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    const name = esc(this.getAttribute('name') ?? '');
    const type = esc(this.getAttribute('type') ?? '');
    const icon = this.getAttribute('icon')     ?? '⭐';

    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_CSS}
        :host { display: block; }
        .card { background: var(--warm-white); border-radius: 16px; padding: 24px 22px; border: 1px solid rgba(61,43,31,.07); display: flex; gap: 16px; align-items: flex-start; transition: transform .22s, box-shadow .22s; }
        .card:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(61,43,31,.08); }
        .ico  { font-size: 28px; flex-shrink: 0; line-height: 1; margin-top: 2px; }
        .type { font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--sage-dark); font-weight: 500; margin-bottom: 4px; }
        h3    { font-family: var(--font-display); font-size: 1rem; color: var(--bark); margin-bottom: 8px; line-height: 1.3; }
        p     { font-size: 13.5px; color: var(--bark-light); line-height: 1.6; }
      </style>
      <div class="card">
        <span class="ico">${icon}</span>
        <div><div class="type">${type}</div><h3>${name}</h3><p><slot></slot></p></div>
      </div>
    `;
  }
}
customElements.define('pens-sponsor-card', PensSponsorCard);


// ── 32. <pens-sponsor-cta> ────────────────────────────────────────────────────

class PensSponsorCta extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_CSS}
        :host { display: block; margin-top: 28px; }
        .box { background: var(--bark); border-radius: 18px; padding: 32px 28px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; }
        .txt h3 { font-family: var(--font-display); font-size: 1.2rem; color: var(--cream); margin-bottom: 6px; }
        .txt p  { font-size: 13.5px; color: rgba(253,246,237,.55); line-height: 1.6; max-width: 380px; }
        a { display: inline-flex; align-items: center; gap: 8px; padding: 13px 26px; border-radius: 100px; background: var(--ochre); color: var(--bark); font-size: 14.5px; font-weight: 500; text-decoration: none; white-space: nowrap; transition: opacity .2s, transform .2s; }
        a:hover { opacity: .88; transform: translateY(-1px); }
      </style>
      <div class="box">
        <div class="txt">
          <h3>Become a Sponsor</h3>
          <p>Your business or donation directly supports child and parent education programs at Soquel PENS. We'd love to recognize your generosity here.</p>
        </div>
        <a href="mailto:soquelpens@gmail.com">💛 Get in Touch →</a>
      </div>
    `;
  }
}
customElements.define('pens-sponsor-cta', PensSponsorCta);


// ── 33. <pens-handout icon="" title="" category="" url=""> ────────────────────

class PensHandout extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    const icon  = this.getAttribute('icon')         ?? '📄';
    const title = esc(this.getAttribute('title')    ?? '');
    const cat   = esc(this.getAttribute('category') ?? '');
    const url   = this.getAttribute('url')          ?? '#';

    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_CSS}
        :host { display: block; }
        a { display: flex; align-items: center; gap: 16px; padding: 16px 20px; background: var(--warm-white); border-radius: 14px; border: 1px solid rgba(61,43,31,.07); text-decoration: none; transition: background .18s, transform .18s, box-shadow .18s; }
        a:hover { background: var(--mist); transform: translateX(4px); box-shadow: 0 4px 18px rgba(61,43,31,.07); }
        .ico   { font-size: 22px; flex-shrink: 0; }
        .body  { flex: 1; min-width: 0; }
        .cat   { font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--sage-dark); font-weight: 500; margin-bottom: 3px; }
        h4     { font-size: 14.5px; font-weight: 500; color: var(--bark); line-height: 1.35; margin-bottom: 4px; }
        p      { font-size: 13px; color: var(--bark-light); line-height: 1.5; }
        .arrow { font-size: 18px; color: var(--bark-light); flex-shrink: 0; transition: color .18s, transform .18s; }
        a:hover .arrow { color: var(--terracotta); transform: translateX(4px); }
      </style>
      <a href="${esc(url)}">
        <span class="ico">${icon}</span>
        <div class="body">
          <div class="cat">${cat}</div>
          <h4>${title}</h4>
          <p><slot></slot></p>
        </div>
        <span class="arrow">→</span>
      </a>
    `;
  }
}
customElements.define('pens-handout', PensHandout);


// ═══════════════════════════════════════════════════════════════════════════════
// JOBS / PARTICIPATION PAGE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ── 34. <pens-jobs-overview> ──────────────────────────────────────────────────

class PensJobsOverview extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    const stats: StatItem[] = [
      { num: '1',   label: 'support job per family',      sub: 'Assigned each school year'                    },
      { num: '5',   label: 'job categories',              sub: 'Board · Classroom · Grounds · Events · Comms' },
      { num: '25+', label: 'roles available',             sub: 'Something for every skill set'                },
      { num: '2',   label: 'fundraising events per year', sub: 'Plus a minimum raised amount'                 },
    ];

    const cells = stats.map(s => `
      <div class="cell">
        <div class="num">${s.num}</div>
        <div class="lbl">${s.label}</div>
        <div class="sub">${s.sub}</div>
      </div>
    `).join('');

    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_CSS}
        :host { display: block; }
        .strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; background: rgba(255,255,255,.06); border-radius: 16px; overflow: hidden; }
        .cell { background: var(--bark); padding: 28px 20px; text-align: center; transition: background .2s; }
        .cell:hover { background: var(--bark-light); }
        .num { font-family: var(--font-display); font-size: 2rem; font-weight: 700; color: var(--ochre); line-height: 1; margin-bottom: 8px; }
        .lbl { font-size: 13px; color: rgba(253,246,237,.7); line-height: 1.4; margin-bottom: 4px; }
        .sub { font-size: 11px; color: rgba(253,246,237,.35); line-height: 1.4; }
        @media (max-width: 700px) { .strip { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 420px) { .strip { grid-template-columns: 1fr; } }
      </style>
      <div class="strip">${cells}</div>
    `;
  }
}
customElements.define('pens-jobs-overview', PensJobsOverview);


// ── 35. <pens-job-card icon="" title="" time="" level="board|classroom|grounds|events|comms"> ──
// The `level` attribute drives the badge colour via LEVEL_STYLES.
// ──────────────────────────────────────────────────────────────────────────────

class PensJobCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    const icon  = this.getAttribute('icon')  ?? '📌';
    const title = esc(this.getAttribute('title') ?? '');
    const time  = esc(this.getAttribute('time')  ?? '');
    const st    = levelStyle(this.getAttribute('level') ?? 'classroom');

    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_CSS}
        :host { display: block; }
        .card { background: var(--warm-white); border-radius: 16px; padding: 22px 20px; border: 1px solid rgba(61,43,31,.07); height: 100%; display: flex; flex-direction: column; transition: transform .22s, box-shadow .22s; }
        .card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(61,43,31,.09); }
        .top { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
        .ico-wrap { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; font-size: 22px; flex-shrink: 0; background: ${st.bg}; }
        .badge { display: inline-block; font-size: 10.5px; font-weight: 500; padding: 2px 9px; border-radius: 100px; background: ${st.bg}; color: ${st.accent}; letter-spacing: .05em; text-transform: uppercase; margin-bottom: 6px; }
        h3    { font-family: var(--font-display); font-size: 1rem; color: var(--bark); margin-bottom: 4px; line-height: 1.3; }
        .time { font-size: 11.5px; color: var(--bark-light); }
        p     { font-size: 13.5px; color: var(--bark-light); line-height: 1.6; flex: 1; }
        ::slotted(strong) { color: var(--bark); }
      </style>
      <div class="card">
        <div class="top">
          <div class="ico-wrap">${icon}</div>
          <div>
            <div class="badge">${st.label}</div>
            <h3>${title}</h3>
            <div class="time">⏱ ${time}</div>
          </div>
        </div>
        <p><slot></slot></p>
      </div>
    `;
  }
}
customElements.define('pens-job-card', PensJobCard);


// ── 36. <pens-toc-card> ───────────────────────────────────────────────────────

class PensTocCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    const items: TocItem[] = [
      { href: '#board',     icon: '👑', label: 'Board of Directors'    },
      { href: '#classroom', icon: '🎉', label: 'Classroom Support'     },
      { href: '#grounds',   icon: '🌱', label: 'Grounds & Maintenance' },
      { href: '#comms',     icon: '📱', label: 'Communications'        },
    ];

    const links = items.map(i => `
      <a href="${i.href}" class="lk">
        <span class="ic">${i.icon}</span>
        <span>${i.label}</span>
        <span class="ar">→</span>
      </a>
    `).join('');

    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_CSS}
        :host { display: block; }
        .card { background: var(--warm-white); border-radius: 18px; padding: 22px 20px; border: 1.5px solid rgba(61,43,31,.08); }
        h3 { font-family: var(--font-display); font-size: 1rem; color: var(--bark); margin-bottom: 14px; }
        .lk { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 10px; text-decoration: none; color: var(--bark); font-size: 13px; font-weight: 500; background: var(--cream); border: 1px solid rgba(61,43,31,.06); margin-bottom: 7px; transition: background .15s, transform .15s; }
        .lk:last-child { margin-bottom: 0; }
        .lk:hover { background: var(--mist); transform: translateX(3px); }
        .ic { font-size: 15px; flex-shrink: 0; }
        .ar { margin-left: auto; font-size: 11px; color: var(--bark-light); }
      </style>
      <div class="card"><h3>Job categories</h3>${links}</div>
    `;
  }
}
customElements.define('pens-toc-card', PensTocCard);


// ── 37. <pens-effort-key> ─────────────────────────────────────────────────────

class PensEffortKey extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    const levels: EffortLevel[] = [
      { label: 'Leadership', desc: 'Monthly meetings + ongoing responsibility', color: 'rgba(212,168,75,.18)',   text: '#8a6a1a'           },
      { label: 'Classroom',  desc: 'Weekly or monthly classroom tasks',         color: 'rgba(122,158,126,.16)', text: 'var(--sage-dark)'  },
      { label: 'Grounds',    desc: 'Work parties + as-needed maintenance',      color: 'rgba(61,43,31,.08)',    text: 'var(--bark-light)' },
      { label: 'Events',     desc: 'Intensive planning for specific events',    color: 'rgba(196,96,58,.11)',   text: 'var(--terracotta)' },
      { label: 'Comms',      desc: 'Ongoing communications & coordination',     color: 'rgba(122,158,126,.12)', text: 'var(--sage-dark)'  },
    ];

    const rows = levels.map(l => `
      <div class="row">
        <span class="badge" style="background: ${l.color}; color: ${l.text};">${l.label}</span>
        <span class="desc">${l.desc}</span>
      </div>
    `).join('');

    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_CSS}
        :host { display: block; }
        .card { background: var(--warm-white); border-radius: 18px; padding: 22px 20px; border: 1.5px solid rgba(61,43,31,.08); }
        h3 { font-family: var(--font-display); font-size: 1rem; color: var(--bark); margin-bottom: 14px; }
        .row { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
        .row:last-child { margin-bottom: 0; }
        .badge { display: inline-block; font-size: 10.5px; font-weight: 500; padding: 3px 10px; border-radius: 100px; letter-spacing: .05em; text-transform: uppercase; white-space: nowrap; flex-shrink: 0; margin-top: 1px; }
        .desc { font-size: 12.5px; color: var(--bark-light); line-height: 1.5; }
      </style>
      <div class="card"><h3>Time commitment key</h3>${rows}</div>
    `;
  }
}
customElements.define('pens-effort-key', PensEffortKey);


// ─── Bootstrap ────────────────────────────────────────────────────────────────
// Register components once Custom Elements are confirmed available.
// Modern browsers support `customElements` natively; the else branch handles
// the WebComponents polyfill which fires 'WebComponentsReady' once patched.
if (window.customElements) {
  // Native support — already bootstrapped above via top-level class definitions
  // (no-op: classes call customElements.define() at parse time)
} else {
  // Polyfill path — shouldn't be reached in modern browsers but kept for safety
  window.addEventListener('WebComponentsReady', () => {
    // Components are already defined via customElements.define() above.
    // This branch exists as a safety net if the polyfill defers the registry.
    console.warn('WebComponentsReady fired — polyfill path active.');
  });
}