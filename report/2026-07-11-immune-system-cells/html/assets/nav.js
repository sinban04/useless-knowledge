/* Shared left sidebar — injected into every page of the immune-system report.
   Emoji icons are meaningful: each encodes the chapter's core idea. */
(function () {
  const NAV = [
    {
      title: 'Overview',
      items: [
        { href: 'index.html', icon: '🏠', label: 'Home · Report map', c: 'primary' },
      ],
    },
    {
      title: 'Foundations',
      items: [
        { href: '01-introduction.html', icon: '🧭', label: '01 · Introduction', c: 'primary' },
      ],
    },
    {
      title: 'Innate Immunity',
      items: [
        { href: '02-innate-recognition-inflammation.html', icon: '🚨', label: '02 · Recognition & Inflammation', c: 'innate' },
        { href: '03-macrophages.html', icon: '🍽️', label: '03 · Macrophages', c: 'macro' },
      ],
    },
    {
      title: 'The Bridge',
      items: [
        { href: '04-antigen-presentation.html', icon: '🪪', label: '04 · Antigen Presentation', c: 'primary' },
      ],
    },
    {
      title: 'Adaptive Immunity',
      items: [
        { href: '05-b-cells-antibodies.html', icon: '🏹', label: '05 · B Cells & Antibodies', c: 'bcell' },
        { href: '06-t-cells.html', icon: '🎯', label: '06 · T Cells', c: 'tcell' },
        { href: '07-t-cell-immunotherapy.html', icon: '💉', label: '07 · T-Cell Immunotherapy', c: 'tcell' },
        { href: '12-vdj-recombination-germinal-centers.html', icon: '🧬', label: '12 · V(D)J & GC', c: 'bcell' },
      ],
    },
    {
      title: 'Innate Lymphocytes',
      items: [
        { href: '08-nk-cells.html', icon: '⚖️', label: '08 · NK Cells', c: 'nk' },
      ],
    },
    {
      title: 'Dynamics & Outcomes',
      items: [
        { href: '09-immune-response-timeline.html', icon: '⏱️', label: '09 · Response Timeline', c: 'primary' },
        { href: '10-memory-tolerance-failure.html', icon: '🧠', label: '10 · Memory, Tolerance, Failure', c: 'primary' },
        { href: '11-system-synthesis.html', icon: '🧩', label: '11 · System Synthesis', c: 'primary' },
      ],
    },
    {
      title: 'Reference',
      items: [
        { href: 'sources.html', icon: '📚', label: 'Sources & Figures', c: 'primary' },
      ],
    },
  ];

  const ACCENT = {
    primary: '#7c3aed', macro: '#14b8a6', bcell: '#3b82f6',
    tcell: '#a855f7', nk: '#f43f5e', innate: '#f59e0b',
  };

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  sidebar.id = 'sidebar';

  let html = `
    <div class="sidebar-header">
      <div class="sidebar-eyebrow">🧬 Recherche · Biology</div>
      <div class="sidebar-title">How the Immune System Works</div>
      <div class="sidebar-meta">2026-04-30 · 12 chapters</div>
    </div>
  `;

  for (const sec of NAV) {
    html += `<div class="nav-section"><div class="nav-section-title">${sec.title}</div>`;
    for (const it of sec.items) {
      const active = currentPath === it.href ? ' active' : '';
      const accent = ACCENT[it.c] || ACCENT.primary;
      html += `<a class="nav-link${active}" href="${it.href}" style="--accent:${accent}">` +
              `<span class="nav-icon">${it.icon}</span><span>${it.label}</span></a>`;
    }
    html += `</div>`;
  }

  sidebar.innerHTML = html;
  document.body.insertBefore(sidebar, document.body.firstChild);

  const toggle = document.createElement('button');
  toggle.className = 'menu-toggle';
  toggle.innerHTML = '☰';
  toggle.setAttribute('aria-label', 'Toggle navigation');
  toggle.onclick = () => sidebar.classList.toggle('open');
  document.body.appendChild(toggle);

  // Close the drawer when a link is tapped on mobile.
  sidebar.addEventListener('click', (e) => {
    if (e.target.closest('.nav-link') && window.innerWidth <= 920) {
      sidebar.classList.remove('open');
    }
  });
})();
