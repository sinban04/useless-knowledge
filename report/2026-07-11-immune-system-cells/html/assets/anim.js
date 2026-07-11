/* ===================================================================
   anim.js — self-contained mechanism-animation engine for the immune report.
   No external dependency. Each <figure class="anim" data-anim="NAME"> is
   auto-mounted: the harness builds a hi-DPI canvas, control bar (play / pause
   / reset / scrub), legend, live readout, and a phase label, then runs the
   named scene. Scenes draw in a fixed design space and are resolution-free.

   Scene contract:
     IMM.scene('name', () => ({
       title, kicker, aspect (w/h), duration (s), loop (bool),
       legend:  [{label, color}],
       sliders: [{id, label, min, max, value, step, color}],   // optional
       draw(g, p, ctx)   // g=draw API, p=progress 0..1, ctx={t,dt,params,W,H}
                         // may return {phase, readout} (HTML strings)
     }))
   =================================================================== */
(function () {
  const IMM = (window.IMM = window.IMM || {});
  const scenes = {};
  IMM.scene = (name, factory) => { scenes[name] = factory; };

  const DESIGN_W = 760;
  const reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- small math ---------- */
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  // local progress of a [s,e] segment, clamped to 0..1
  const seg = (p, s, e) => clamp((p - s) / (e - s), 0, 1);

  /* ---------- drawing API ---------- */
  function makeG(ctx, W, H) {
    const g = {
      ctx, W, H,
      clamp, lerp, easeInOut, easeOut, seg,
      clear(color) { ctx.clearRect(0, 0, W, H); if (color) { ctx.fillStyle = color; ctx.fillRect(0, 0, W, H); } },
      bg() {
        const grd = ctx.createLinearGradient(0, 0, 0, H);
        grd.addColorStop(0, '#161029'); grd.addColorStop(1, '#0d0a1c');
        ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
      },
      glow(x, y, r, color, alpha) {
        const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
        grd.addColorStop(0, hexA(color, alpha == null ? 0.55 : alpha));
        grd.addColorStop(1, hexA(color, 0));
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      },
      disc(x, y, r, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); },
      ring(x, y, r, color, w) { ctx.strokeStyle = color; ctx.lineWidth = w || 2; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke(); },
      // a luminous cell: glow halo + translucent body + membrane + optional nucleus
      cell(x, y, r, color, opt) {
        opt = opt || {};
        g.glow(x, y, r * 1.7, color, 0.40);
        ctx.fillStyle = hexA(color, opt.fill == null ? 0.20 : opt.fill);
        ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
        ctx.strokeStyle = hexA(color, 0.95); ctx.lineWidth = opt.lw || 2.5;
        ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
        if (opt.nucleus !== false) {
          ctx.fillStyle = hexA(color, 0.42);
          ctx.beginPath(); ctx.arc(x + r * 0.18, y - r * 0.12, r * 0.42, 0, 7); ctx.fill();
        }
      },
      dot(x, y, r, color, glow) { if (glow) g.glow(x, y, r * 3, color, 0.5); g.disc(x, y, r, color); },
      arrow(x1, y1, x2, y2, color, w) {
        const a = Math.atan2(y2 - y1, x2 - x1), h = 7 + (w || 2);
        ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w || 2.2;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - h * Math.cos(a - 0.4), y2 - h * Math.sin(a - 0.4));
        ctx.lineTo(x2 - h * Math.cos(a + 0.4), y2 - h * Math.sin(a + 0.4));
        ctx.closePath(); ctx.fill();
      },
      label(x, y, text, opt) {
        opt = opt || {};
        ctx.font = `${opt.weight || 600} ${opt.size || 13}px ${opt.mono ? 'Menlo, monospace' : '-apple-system, "Segoe UI", sans-serif'}`;
        ctx.textAlign = opt.align || 'center';
        ctx.textBaseline = opt.baseline || 'middle';
        if (opt.stroke) { ctx.lineWidth = opt.stroke; ctx.strokeStyle = '#0d0a1c'; ctx.strokeText(text, x, y); }
        ctx.fillStyle = opt.color || '#e6e1f3'; ctx.fillText(text, x, y);
        ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
      },
      roundRect(x, y, w, h, r, fill, stroke, lw) {
        ctx.beginPath();
        ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
        if (fill) { ctx.fillStyle = fill; ctx.fill(); }
        if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2; ctx.stroke(); }
      },
      // wavy membrane segment (for engulfing / surfaces)
      membrane(pts, color, w) {
        ctx.strokeStyle = color; ctx.lineWidth = w || 3; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.stroke();
      },
    };
    return g;
  }

  function hexA(hex, a) {
    // accept #rrggbb
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16), gg = parseInt(h.substring(2, 4), 16), b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${gg},${b},${a})`;
  }

  /* ---------- controller ---------- */
  function mount(el) {
    const name = el.getAttribute('data-anim');
    const factory = scenes[name];
    if (!factory) { el.innerHTML = `<div class="anim-readout">Animation "${name}" not found.</div>`; return; }
    const scene = factory();
    const aspect = scene.aspect || 1.9;
    const duration = scene.duration || 12;
    const loop = !!scene.loop;
    const caption = el.getAttribute('data-caption') || '';

    el.innerHTML = '';
    // head
    const head = document.createElement('div'); head.className = 'anim-head';
    head.innerHTML = `<div class="anim-kicker">${scene.kicker || 'Animation'}</div>` +
      `<div class="anim-title">${scene.title || name}</div>`;
    el.appendChild(head);

    // stage
    const wrap = document.createElement('div'); wrap.className = 'anim-stage-wrap';
    const canvas = document.createElement('canvas'); canvas.className = 'anim-stage';
    const phase = document.createElement('div'); phase.className = 'anim-phase';
    const replay = document.createElement('div'); replay.className = 'anim-replay';
    replay.innerHTML = '<span>↻ Replay</span>';
    wrap.appendChild(canvas); wrap.appendChild(phase); wrap.appendChild(replay);
    el.appendChild(wrap);

    // controls
    const controls = document.createElement('div'); controls.className = 'anim-controls';
    const playBtn = document.createElement('button'); playBtn.className = 'anim-btn'; playBtn.innerHTML = '❚❚ Pause';
    const resetBtn = document.createElement('button'); resetBtn.className = 'anim-btn sec'; resetBtn.innerHTML = '↺ Reset';
    const scrub = document.createElement('input'); scrub.type = 'range'; scrub.min = 0; scrub.max = 1000; scrub.value = 0; scrub.className = 'anim-scrub';
    controls.appendChild(playBtn); controls.appendChild(resetBtn); controls.appendChild(scrub);
    el.appendChild(controls);

    // sliders (interactive scenes)
    const params = {};
    if (scene.sliders) {
      const sg = document.createElement('div'); sg.className = 'anim-controls'; sg.style.paddingTop = '0';
      scene.sliders.forEach((s) => {
        params[s.id] = s.value;
        const group = document.createElement('div'); group.className = 'anim-slider-group';
        group.style.setProperty('--c', s.color || '#7c3aed');
        const out = document.createElement('span'); out.textContent = s.value;
        const inp = document.createElement('input'); inp.type = 'range';
        inp.min = s.min; inp.max = s.max; inp.step = s.step || 1; inp.value = s.value;
        inp.addEventListener('input', () => { params[s.id] = +inp.value; out.textContent = inp.value; });
        group.innerHTML = `<label>${s.label}</label>`;
        group.appendChild(inp); group.appendChild(out);
        sg.appendChild(group);
      });
      el.appendChild(sg);
    }

    // legend
    if (scene.legend) {
      const lg = document.createElement('div'); lg.className = 'anim-legend';
      lg.innerHTML = scene.legend.map((l) =>
        `<span class="lg"><span class="dot" style="color:${l.color};background:${l.color}"></span>${l.label}</span>`).join('');
      el.appendChild(lg);
    }

    // readout
    const readout = document.createElement('div'); readout.className = 'anim-readout';
    el.appendChild(readout);

    // caption
    if (caption) { const cap = document.createElement('div'); cap.className = 'anim-caption'; cap.innerHTML = caption; el.appendChild(cap); }

    // sizing
    let W = DESIGN_W, H = Math.round(DESIGN_W / aspect), ctx;
    function resize() {
      const cssW = wrap.clientWidth || 700;
      const scale = cssW / DESIGN_W;
      const cssH = Math.round(H * scale);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cssW * dpr); canvas.height = Math.round(cssH * dpr);
      canvas.style.height = cssH + 'px';
      ctx = canvas.getContext('2d');
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    }
    resize();
    const g = () => makeG(ctx, W, H);

    // loop state
    let t = 0, playing = false, last = 0, lastPhase = '', lastReadout = '';
    function render(p) {
      const gg = g();
      const out = scene.draw(gg, p, { t, dt: 0, params, W, H }) || {};
      if (out.phase != null && out.phase !== lastPhase) { phase.innerHTML = out.phase; lastPhase = out.phase; }
      if (out.readout != null && out.readout !== lastReadout) { readout.innerHTML = out.readout; lastReadout = out.readout; }
    }
    function frame(now) {
      if (!playing) return;
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      t += dt;
      let p;
      if (loop) { p = (t % duration) / duration; }
      else {
        p = t / duration;
        if (p >= 1) { p = 1; pause(); replay.classList.add('show'); }
      }
      scrub.value = Math.round(p * 1000);
      const gg = g();
      const o = scene.draw(gg, p, { t, dt, params, W, H }) || {};
      if (o.phase != null && o.phase !== lastPhase) { phase.innerHTML = o.phase; lastPhase = o.phase; }
      if (o.readout != null && o.readout !== lastReadout) { readout.innerHTML = o.readout; lastReadout = o.readout; }
      if (playing) requestAnimationFrame(frame);
    }
    function play() {
      if (playing) return;
      replay.classList.remove('show');
      if (!loop && t / duration >= 1) t = 0;
      playing = true; last = performance.now(); playBtn.innerHTML = '❚❚ Pause';
      requestAnimationFrame(frame);
    }
    function pause() { playing = false; playBtn.innerHTML = '▶ Play'; }
    function reset() { t = 0; scrub.value = 0; replay.classList.remove('show'); render(0); }

    playBtn.onclick = () => (playing ? pause() : play());
    resetBtn.onclick = () => { reset(); play(); };
    replay.onclick = () => { reset(); play(); };
    scrub.addEventListener('input', () => {
      pause(); replay.classList.remove('show');
      t = (scrub.value / 1000) * duration; render(scrub.value / 1000);
    });
    window.addEventListener('resize', () => { resize(); render((scrub.value / 1000) || 0); });

    render(0);

    // autoplay when visible (unless reduced motion)
    if (!reduceMotion && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { if (!playing && !(!loop && t / duration >= 1)) play(); }
          else pause();
        });
      }, { threshold: 0.35 });
      io.observe(el);
    } else if (reduceMotion) {
      render(loop ? 0.5 : 1); // representative static frame
      pause();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.anim[data-anim]').forEach(mount);
  });

  /* =================================================================
     SCENES
     ================================================================= */
  const C = {
    macro: '#14b8a6', bcell: '#3b82f6', tcell: '#a855f7', nk: '#f43f5e',
    innate: '#f59e0b', primary: '#a78bfa', kill: '#ef4444', safe: '#22c55e',
    microbe: '#f472b6', peptide: '#fbbf24', ink: '#e6e1f3', dim: '#9b93b8',
  };

  /* ---- 03 · Phagocytosis ---- */
  IMM.scene('phagocytosis', () => ({
    title: 'Phagocytosis — eat, seal, kill, display',
    kicker: 'Macrophage mechanism', aspect: 1.95, duration: 16,
    legend: [
      { label: 'Macrophage', color: C.macro },
      { label: 'Microbe', color: C.microbe },
      { label: 'Lysosome', color: C.innate },
      { label: 'Peptide on MHC II', color: C.peptide },
    ],
    draw(g, p) {
      g.bg();
      const cx = 300, cy = g.H / 2, R = 118;
      // microbe trajectory: drifts toward the cell, then is captured
      const capture = g.easeInOut(g.seg(p, 0.10, 0.36));
      const mx = g.lerp(660, cx + 4, capture);
      const my = g.lerp(cy - 60, cy - 6, capture);
      const inside = p > 0.36;

      // macrophage body
      g.cell(cx, cy, R, C.macro, { fill: 0.16 });
      // receptors around membrane (PRR / Fc / complement)
      for (let i = 0; i < 9; i++) {
        const a = -1.1 + i * 0.16;
        const rx = cx + Math.cos(a) * R, ry = cy + Math.sin(a) * R;
        g.dot(rx, ry, 3.2, i % 3 === 0 ? C.bcell : C.macro);
      }

      // pseudopods extend & wrap during engulfment
      const ext = g.easeOut(g.seg(p, 0.16, 0.40));
      if (p < 0.42 && ext > 0) {
        const reach = g.lerp(0, 92, ext);
        [-1, 1].forEach((s) => {
          g.ctx.strokeStyle = hexA(C.macro, 0.9); g.ctx.lineWidth = 9; g.ctx.lineCap = 'round';
          g.ctx.beginPath();
          g.ctx.moveTo(cx + R * 0.7, cy + s * 18);
          g.ctx.quadraticCurveTo(cx + R + 40, cy + s * 70, cx + R + reach, cy + s * (8 - ext * 30));
          g.ctx.stroke();
        });
      }

      // the microbe (rod-shaped, capsule)
      if (p < 0.74) {
        g.ctx.save(); g.ctx.translate(mx, my); g.ctx.rotate(-0.35 + capture * 0.4);
        g.glow(0, 0, 26, C.microbe, 0.5);
        g.roundRect(-20, -9, 40, 18, 9, hexA(C.microbe, 0.85), '#fff', 1.5);
        g.ctx.restore();
      }

      // phagosome ring once internalised
      if (inside && p < 0.92) {
        g.ring(cx + 4, cy - 6, 30, hexA(C.ink, 0.5), 2);
      }

      // lysosome approaches & fuses
      const lyMove = g.easeInOut(g.seg(p, 0.46, 0.62));
      if (p > 0.44 && p < 0.78) {
        const lx = g.lerp(cx - 80, cx + 4, lyMove), ly = g.lerp(cy + 78, cy - 6, lyMove);
        g.dot(lx, ly, 13, C.innate, true);
        g.label(lx, ly, 'pH↓', { size: 9, color: '#3b2a06', weight: 700 });
      }

      // degradation: microbe dissolves into fragments + ROS sparks
      const deg = g.seg(p, 0.62, 0.86);
      if (deg > 0) {
        for (let i = 0; i < 7; i++) {
          const a = i * 0.9 + p * 6, rr = 6 + deg * 26;
          g.dot(cx + 4 + Math.cos(a) * rr, cy - 6 + Math.sin(a) * rr, g.lerp(3, 1.5, deg), C.peptide, false);
        }
        if (deg < 0.7) for (let i = 0; i < 4; i++) { const a = i + p * 9; g.dot(cx + 4 + Math.cos(a) * 18, cy - 6 + Math.sin(a) * 18, 1.6, '#fff'); }
      }

      // MHC II display at the surface
      const disp = g.seg(p, 0.86, 1);
      if (disp > 0) {
        const sx = cx - R + 18, sy = cy - R * 0.55;
        g.arrow(cx + 4, cy - 6, sx + 6, sy + 8, hexA(C.peptide, 0.7 * disp), 2);
        // a little MHC-II stalk holding a peptide dot
        g.ctx.strokeStyle = hexA('#ffffff', 0.85); g.ctx.lineWidth = 3;
        g.ctx.beginPath(); g.ctx.moveTo(sx, sy + 14); g.ctx.lineTo(sx, sy - 4); g.ctx.stroke();
        g.dot(sx, sy - 8, 5, C.peptide, true);
      }

      // phase + readout
      let ph, rd;
      if (p < 0.16) { ph = '1 · Recognition'; rd = '<b>Recognition.</b> PRRs, Fc receptors, and complement receptors detect the microbe — opsonins like antibody and C3b make it easy prey.'; }
      else if (p < 0.40) { ph = '2 · Engulfment'; rd = '<b>Engulfment.</b> Actin-driven pseudopods extend and wrap around the target.'; }
      else if (p < 0.46) { ph = '3 · Phagosome'; rd = '<b>Phagosome.</b> The target is sealed inside an internal vesicle.'; }
      else if (p < 0.62) { ph = '4 · Phagolysosome'; rd = '<b>Phagolysosome.</b> A lysosome fuses with the phagosome; the interior acidifies.'; }
      else if (p < 0.86) { ph = '5 · Killing & degradation'; rd = '<b>Killing.</b> Acid, proteases, and reactive oxygen/nitrogen species degrade the microbe into fragments.'; }
      else { ph = '6 · Antigen display'; rd = '<b>Display.</b> Peptide fragments are loaded onto MHC II and presented at the surface for CD4 T cells.'; }
      return { phase: ph, readout: rd };
    },
  }));

  /* ---- 02 · Complement ---- */
  IMM.scene('complement', () => ({
    title: 'Complement — tag, recruit, puncture',
    kicker: 'Innate cascade', aspect: 2.0, duration: 15,
    legend: [
      { label: 'Microbe surface', color: C.microbe },
      { label: 'C3b opsonin', color: C.innate },
      { label: 'C3a / C5a (inflammation)', color: C.nk },
      { label: 'Membrane attack complex', color: C.macro },
    ],
    draw(g, p) {
      g.bg();
      const surfY = g.H - 56;
      // microbe surface band
      g.ctx.fillStyle = hexA(C.microbe, 0.16); g.ctx.fillRect(0, surfY, g.W, g.H - surfY);
      g.membrane([[0, surfY], [g.W, surfY]], hexA(C.microbe, 0.8), 3);
      g.label(70, surfY + 26, 'microbe surface', { size: 11, color: C.dim, align: 'start' });

      // C3 convertase assembles
      const conv = g.easeOut(g.seg(p, 0.05, 0.22));
      if (conv > 0) {
        const x = 180;
        g.dot(x, surfY - 18, 9 * conv, C.bcell, true);
        g.label(x, surfY - 40, 'C3 convertase', { size: 11, color: C.bcell });
      }

      // C3b opsonization: dots accumulate along the surface
      const ops = g.seg(p, 0.20, 0.50);
      const n = Math.floor(ops * 14);
      for (let i = 0; i < n; i++) {
        const x = 120 + i * 42 % (g.W - 200) + (i % 2) * 20;
        g.dot(120 + i * 40, surfY - 12, 6, C.innate, true);
      }
      if (ops > 0) g.label(g.W - 80, surfY - 30, 'C3b "eat me" tags', { size: 11, color: C.innate, align: 'end' });

      // anaphylatoxins float up (C3a / C5a)
      const ana = g.seg(p, 0.34, 0.66);
      if (ana > 0) {
        for (let i = 0; i < 6; i++) {
          const ph = (p * 1.4 + i * 0.17) % 1;
          const x = 240 + i * 70, y = surfY - 20 - ph * 150;
          g.dot(x, y, 4, C.nk, true);
        }
        g.label(g.W / 2, 40, 'C3a / C5a → recruit & activate phagocytes', { size: 12, color: C.nk });
      }

      // phagocyte arrives, drawn toward C3b (opsonization payoff)
      const phag = g.easeInOut(g.seg(p, 0.50, 0.72));
      if (p > 0.48) {
        const px = g.lerp(-60, 150, phag);
        g.cell(px, surfY - 70, 34, C.macro, { fill: 0.16 });
        if (phag > 0.6) g.arrow(px + 30, surfY - 60, 200, surfY - 14, hexA(C.macro, 0.7), 2);
      }

      // MAC pore assembles & punches the membrane
      const mac = g.seg(p, 0.72, 1);
      if (mac > 0) {
        const x = g.W - 180;
        for (let i = -3; i <= 3; i++) {
          g.ctx.strokeStyle = hexA(C.macro, 0.9 * mac); g.ctx.lineWidth = 4;
          g.ctx.beginPath(); g.ctx.moveTo(x + i * 7, surfY - 22 * mac); g.ctx.lineTo(x + i * 7, surfY + 24); g.ctx.stroke();
        }
        g.glow(x, surfY, 30 * mac, C.macro, 0.5);
        g.label(x, surfY - 44, 'MAC pore (C5b–C9)', { size: 11, color: C.macro });
      }

      let ph, rd;
      if (p < 0.20) { ph = '1 · Activation'; rd = '<b>Activation.</b> Alternative, lectin, or classical triggers converge on a <b>C3 convertase</b> on the microbial surface.'; }
      else if (p < 0.50) { ph = '2 · Opsonization'; rd = '<b>Opsonization.</b> The convertase cleaves C3; <b>C3b</b> coats the surface as an "eat me" tag.'; }
      else if (p < 0.72) { ph = '3 · Inflammation & recruitment'; rd = '<b>Anaphylatoxins.</b> C3a and C5a diffuse away, driving inflammation and pulling phagocytes toward the C3b-coated target.'; }
      else { ph = '4 · Membrane attack'; rd = '<b>Terminal pathway.</b> C5b nucleates C6–C9 into a membrane attack complex that punctures some Gram-negative bacteria.'; }
      return { phase: ph, readout: rd };
    },
  }));

  /* ---- 05 · Clonal selection ---- */
  IMM.scene('clonal-selection', () => ({
    title: 'Clonal selection — antigen picks, the clone expands',
    kicker: 'B-cell principle', aspect: 1.95, duration: 16,
    legend: [
      { label: 'Naive B cells (varied BCR)', color: C.bcell },
      { label: 'Matching antigen', color: C.microbe },
      { label: 'Plasma cell + antibody', color: C.safe },
      { label: 'Memory B cell', color: C.primary },
    ],
    draw(g, p) {
      g.bg();
      const shapes = [0, 1, 2, 3, 4]; // receptor "shapes"
      const matchIdx = 2;
      const baseY = 90, x0 = 90, gap = (g.W - 180) / 4;

      // antigen drifts in to the matching cell
      const arrive = g.easeInOut(g.seg(p, 0.08, 0.26));
      const ax = g.lerp(g.W - 30, x0 + matchIdx * gap, arrive);
      const ay = g.lerp(40, baseY - 30, arrive);

      // repertoire row
      shapes.forEach((s, i) => {
        const x = x0 + i * gap;
        const isMatch = i === matchIdx;
        const dim = (p > 0.30 && !isMatch) ? 0.35 : 1;
        g.ctx.globalAlpha = dim;
        g.cell(x, baseY, 22, C.bcell, { fill: 0.16 });
        // receptor notch (shape code)
        g.ctx.strokeStyle = hexA(isMatch ? '#fff' : C.bcell, 0.9); g.ctx.lineWidth = 2;
        g.ctx.beginPath();
        for (let k = -1; k <= 1; k++) g.ctx.lineTo(x + k * 6, baseY - 22 - (k === 0 ? (s % 2 ? 8 : 3) : 2));
        g.ctx.stroke();
        g.ctx.globalAlpha = 1;
      });

      if (p < 0.30) { g.dot(ax, ay, 7, C.microbe, true); }

      // selected clone proliferates (binary tree downward) then differentiates
      const expand = g.seg(p, 0.32, 0.66);
      const diff = g.seg(p, 0.66, 1);
      if (expand > 0) {
        const sx = x0 + matchIdx * gap;
        const rows = Math.min(3, Math.floor(expand * 3) + 1);
        for (let r = 1; r <= rows; r++) {
          const cnt = Math.pow(2, r), ry = baseY + 60 + r * 56;
          const lay = clamp(expand * 3 - (r - 1), 0, 1);
          for (let c = 0; c < cnt; c++) {
            const cxp = sx + (c - (cnt - 1) / 2) * (g.W / (cnt + 1)) * 0.8;
            g.ctx.globalAlpha = lay;
            let col = C.bcell;
            if (r === rows && diff > 0.2) col = (c % 3 === 0) ? C.primary : C.safe;
            g.cell(cxp, ry, 15, col, { fill: 0.18, nucleus: false });
            // antibodies stream from plasma cells
            if (col === C.safe && diff > 0.4) {
              for (let q = 0; q < 3; q++) { const yy = ry + 18 + ((p * 60 + q * 14) % 40); g.label(cxp, yy, 'Y', { size: 11, color: C.safe, weight: 800 }); }
            }
            g.ctx.globalAlpha = 1;
          }
        }
      }

      let ph, rd;
      if (p < 0.30) { ph = '1 · A diverse repertoire'; rd = '<b>Pre-existing diversity.</b> Each naive B cell already carries one BCR shape, built by V(D)J recombination before any antigen appears.'; }
      else if (p < 0.66) { ph = '2 · Selection & expansion'; rd = '<b>Selection.</b> Antigen binds the rare matching clone — it does not instruct, it <i>selects</i>. That clone proliferates.'; }
      else { ph = '3 · Differentiation'; rd = '<b>Output.</b> Progeny become antibody-secreting <b>plasma cells</b> and long-lived <b>memory B cells</b>.'; }
      return { phase: ph, readout: rd };
    },
  }));

  /* ---- 06 · Cytotoxic T-cell killing ---- */
  IMM.scene('ctl-killing', () => ({
    title: 'A CD8 T cell kills an infected cell',
    kicker: 'Cytotoxic mechanism', aspect: 1.95, duration: 15,
    legend: [
      { label: 'CD8 cytotoxic T cell', color: C.tcell },
      { label: 'Infected cell', color: C.macro },
      { label: 'Peptide on MHC I', color: C.peptide },
      { label: 'Perforin / granzyme', color: C.nk },
    ],
    draw(g, p) {
      g.bg();
      const ty = g.H / 2;
      // target infected cell (right)
      const tx = 540;
      const dying = g.seg(p, 0.66, 1);
      const tr = g.lerp(74, 40, dying);
      // CTL approaches from left and docks
      const dock = g.easeInOut(g.seg(p, 0.06, 0.30));
      const cx = g.lerp(110, tx - 150, dock);

      // target cell with peptide-MHC I stalks
      if (dying < 0.95) {
        g.cell(tx, ty, tr, C.macro, { fill: dying > 0 ? 0.10 : 0.16 });
        for (let i = 0; i < 5; i++) {
          const a = Math.PI + 0.5 + i * 0.32;
          const sx = tx + Math.cos(a) * tr, sy = ty + Math.sin(a) * tr;
          g.ctx.strokeStyle = hexA('#fff', 0.7); g.ctx.lineWidth = 2;
          g.ctx.beginPath(); g.ctx.moveTo(sx, sy); g.ctx.lineTo(sx - 10, sy); g.ctx.stroke();
          g.dot(sx - 14, sy, 3.5, C.peptide);
        }
      }
      // CTL
      g.cell(cx, ty, 52, C.tcell, { fill: 0.18 });
      g.label(cx, ty, 'CD8', { size: 12, color: '#fff', weight: 800 });

      // synapse forms
      const syn = g.seg(p, 0.30, 0.48);
      if (syn > 0 && dying < 0.6) {
        g.glow((cx + tx) / 2, ty, 30 * syn, C.tcell, 0.4);
        g.label((cx + tx) / 2, ty - 70, 'immunological synapse', { size: 11, color: C.primary });
      }

      // granule release
      const fire = g.seg(p, 0.46, 0.66);
      if (fire > 0 && dying < 0.5) {
        for (let i = 0; i < 5; i++) {
          const t2 = clamp(fire * 1.4 - i * 0.12, 0, 1);
          const gx = g.lerp(cx + 50, tx - tr, t2), gy = ty + (i - 2) * 9;
          if (t2 > 0) g.dot(gx, gy, 4, C.nk, true);
        }
      }

      // apoptosis: blebbing fragments
      if (dying > 0) {
        for (let i = 0; i < 8; i++) {
          const a = i * 0.8, rr = tr + dying * 26;
          g.dot(tx + Math.cos(a) * rr, ty + Math.sin(a) * rr, g.lerp(6, 2, dying), C.macro);
        }
      }

      let ph, rd;
      if (p < 0.30) { ph = '1 · Scan & dock'; rd = '<b>Recognition.</b> The CTL\'s TCR (with CD8) binds a specific <b>peptide–MHC I</b> on the target — proof the cell is making something foreign.'; }
      else if (p < 0.46) { ph = '2 · Synapse'; rd = '<b>Immunological synapse.</b> Adhesion molecules form a tight, organized interface that focuses killing onto this one cell.'; }
      else if (p < 0.66) { ph = '3 · Granule release'; rd = '<b>Lethal hit.</b> Perforin helps deliver granzymes into the target; Fas–FasL can add a second death route.'; }
      else { ph = '4 · Apoptosis'; rd = '<b>Controlled death.</b> The target undergoes apoptosis — clean, not messy rupture — and the CTL detaches to kill again.'; }
      return { phase: ph, readout: rd };
    },
  }));

  /* ---- 07 · NK balance (INTERACTIVE) ---- */
  IMM.scene('nk-balance', () => ({
    title: 'NK decision — activating vs inhibitory balance',
    kicker: 'Interactive · drag the sliders', aspect: 1.9, duration: 8, loop: true,
    legend: [
      { label: 'Inhibitory (MHC I = self)', color: C.safe },
      { label: 'Activating (stress ligand)', color: C.kill },
      { label: 'NK cell', color: C.nk },
    ],
    sliders: [
      { id: 'mhc', label: 'MHC I (self / inhibitory)', min: 0, max: 100, value: 90, color: C.safe },
      { id: 'stress', label: 'Stress ligand (activating)', min: 0, max: 100, value: 15, color: C.kill },
    ],
    draw(g, p, ctx) {
      g.bg();
      const mhc = ctx.params.mhc, stress = ctx.params.stress;
      const kill = stress > mhc + 5;
      const ty = g.H / 2, tx = 510, nx = 190;

      // probing motion
      const probe = Math.sin(p * Math.PI * 2) * 0.5 + 0.5;
      const nxx = g.lerp(nx, nx + 70, probe);

      // target cell
      const dying = kill ? (Math.sin(p * Math.PI * 2) > 0.3 ? clamp((Math.sin(p * Math.PI * 2) - 0.3) * 1.6, 0, 1) : 0) : 0;
      g.cell(tx, ty, g.lerp(78, 56, dying), kill ? C.macro : C.macro, { fill: 0.14 });

      // MHC I markers (green, inhibitory) — count scales with slider
      const nMhc = Math.round(mhc / 100 * 8);
      for (let i = 0; i < nMhc; i++) { const a = Math.PI + 0.4 + i * 0.30; g.dot(tx + Math.cos(a) * 80, ty + Math.sin(a) * 80, 5, C.safe, true); }
      // stress ligands (red, activating)
      const nStr = Math.round(stress / 100 * 8);
      for (let i = 0; i < nStr; i++) { const a = -0.4 - i * 0.30; g.dot(tx + Math.cos(a) * 80, ty + Math.sin(a) * 80, 5, C.kill, true); }

      // NK cell + its receptors
      g.cell(nxx, ty, 50, C.nk, { fill: 0.18 });
      g.label(nxx, ty, 'NK', { size: 13, color: '#fff', weight: 800 });
      g.ctx.strokeStyle = hexA(C.safe, mhc / 100); g.ctx.lineWidth = 3;
      g.ctx.beginPath(); g.ctx.moveTo(nxx + 40, ty - 20); g.ctx.lineTo(nxx + 80, ty - 30); g.ctx.stroke();
      g.ctx.strokeStyle = hexA(C.kill, stress / 100); g.ctx.lineWidth = 3;
      g.ctx.beginPath(); g.ctx.moveTo(nxx + 40, ty + 20); g.ctx.lineTo(nxx + 80, ty + 30); g.ctx.stroke();

      // balance meter
      const bx = 40, bw = g.W - 80, by = g.H - 30;
      g.roundRect(bx, by, bw, 14, 7, '#241a3f', null);
      const inhW = (mhc / (mhc + stress + 0.001)) * bw;
      g.roundRect(bx, by, inhW, 14, 7, hexA(C.safe, 0.8), null);
      g.roundRect(bx + inhW, by, bw - inhW, 14, 7, hexA(C.kill, 0.8), null);
      g.label(bx, by - 14, 'inhibition', { size: 10, color: C.safe, align: 'start' });
      g.label(bx + bw, by - 14, 'activation', { size: 10, color: C.kill, align: 'end' });

      if (kill) g.glow((nxx + tx) / 2, ty, 26, C.kill, 0.5);

      let rd;
      if (mhc > 70 && stress < 30) rd = '<b>Spared (healthy self).</b> Normal MHC I keeps inhibitory receptors engaged — the NK cell stands down.';
      else if (stress > mhc + 5 && mhc < 40) rd = '<b>Killed — missing-self + induced-self.</b> MHC I is low (virus/tumor escaped CD8) and stress ligands are high. Both signals point to kill.';
      else if (kill) rd = '<b>Killed.</b> Activating signals outweigh inhibition — the NK cell releases perforin and granzymes.';
      else rd = '<b>Spared.</b> Inhibition still wins. NK killing is an analog balance, not a single on/off switch.';
      return { phase: kill ? '⚔ KILL' : '🛡 SPARED', readout: rd };
    },
  }));

  /* ---- 08 · Response timeline ---- */
  IMM.scene('response-timeline', () => ({
    title: 'Who acts when — minutes to weeks',
    kicker: 'Response dynamics', aspect: 2.1, duration: 14,
    legend: [
      { label: 'Innate (macrophage, complement)', color: C.macro },
      { label: 'NK cells', color: C.nk },
      { label: 'Neutrophils', color: C.innate },
      { label: 'Antibody (B cells)', color: C.bcell },
      { label: 'T cells', color: C.tcell },
    ],
    draw(g, p) {
      g.bg();
      const L = 60, R = g.W - 24, T = 44, B = g.H - 46;
      // axis
      g.ctx.strokeStyle = hexA(C.ink, 0.25); g.ctx.lineWidth = 1.5;
      g.ctx.beginPath(); g.ctx.moveTo(L, B); g.ctx.lineTo(R, B); g.ctx.stroke();
      const ticks = ['min', 'hours', 'day 1–3', 'day 4–7', 'week+'];
      ticks.forEach((tk, i) => { const x = L + (R - L) * (i / (ticks.length - 1)); g.label(x, B + 16, tk, { size: 10, color: C.dim }); });

      // curves: each is a gaussian-ish bump peaking at a different time
      const curves = [
        { c: C.macro, peak: 0.10, w: 0.16, h: 0.62 },
        { c: C.nk, peak: 0.22, w: 0.13, h: 0.55 },
        { c: C.innate, peak: 0.18, w: 0.12, h: 0.7 },
        { c: C.tcell, peak: 0.62, w: 0.18, h: 0.92 },
        { c: C.bcell, peak: 0.72, w: 0.22, h: 0.85 },
      ];
      const playhead = p; // sweeps 0..1
      curves.forEach((cv) => {
        g.ctx.strokeStyle = cv.c; g.ctx.lineWidth = 2.6; g.ctx.beginPath();
        let started = false;
        for (let i = 0; i <= 100; i++) {
          const x = i / 100;
          if (x > playhead) break;
          const y = cv.h * Math.exp(-Math.pow((x - cv.peak) / cv.w, 2));
          const px = L + (R - L) * x, py = B - (B - T) * y;
          if (!started) { g.ctx.moveTo(px, py); started = true; } else g.ctx.lineTo(px, py);
        }
        g.ctx.stroke();
        // glowing leading dot
        const x = playhead;
        const y = cv.h * Math.exp(-Math.pow((x - cv.peak) / cv.w, 2));
        if (x <= 1) g.dot(L + (R - L) * x, B - (B - T) * y, 4, cv.c, true);
      });

      // playhead line
      const hx = L + (R - L) * playhead;
      g.ctx.strokeStyle = hexA(C.ink, 0.4); g.ctx.setLineDash([4, 4]); g.ctx.lineWidth = 1;
      g.ctx.beginPath(); g.ctx.moveTo(hx, T - 8); g.ctx.lineTo(hx, B); g.ctx.stroke(); g.ctx.setLineDash([]);

      let ph, rd;
      if (p < 0.16) { ph = 'Minutes'; rd = '<b>Minutes.</b> Barriers, complement, and resident macrophages act first — no clonal expansion needed.'; }
      else if (p < 0.34) { ph = 'Hours'; rd = '<b>Hours.</b> Inflammation recruits neutrophils; type I interferon and IL-12 fire up NK cells.'; }
      else if (p < 0.58) { ph = 'Day 1–3'; rd = '<b>Days.</b> Dendritic cells reach lymph nodes; rare matching B and T cells begin clonal expansion.'; }
      else if (p < 0.80) { ph = 'Day 4–7'; rd = '<b>Effector phase.</b> Cytotoxic T cells peak; antibody output climbs and matures.'; }
      else { ph = 'Week +'; rd = '<b>Resolution & memory.</b> Effectors contract, inflammation resolves, and memory B/T cells persist.'; }
      return { phase: ph, readout: rd };
    },
  }));

  /* ---- 09 · Memory — primary vs secondary response ---- */
  IMM.scene('memory-recall', () => ({
    title: 'Why the second exposure is faster and stronger',
    kicker: 'Immunological memory', aspect: 2.0, duration: 14,
    legend: [
      { label: 'Antibody titer', color: C.bcell },
      { label: '1st exposure (naive)', color: C.innate },
      { label: '2nd exposure (memory)', color: C.safe },
    ],
    draw(g, p) {
      g.bg();
      const L = 56, R = g.W - 22, T = 40, B = g.H - 42;
      g.ctx.strokeStyle = hexA(C.ink, 0.25); g.ctx.lineWidth = 1.5;
      g.ctx.beginPath(); g.ctx.moveTo(L, B); g.ctx.lineTo(R, B); g.ctx.stroke();
      g.label(L - 6, T, 'titer', { size: 10, color: C.dim, align: 'end' });
      g.label((L + R) / 2, B + 16, 'time →', { size: 10, color: C.dim });

      // two exposure events
      const e1 = 0.12, e2 = 0.58;
      // titer(x): primary bump after e1 (slow, low), secondary bump after e2 (fast, high)
      function titer(x) {
        let v = 0;
        if (x > e1) { const d = (x - e1); v += 0.42 * Math.exp(-Math.pow((d - 0.16) / 0.13, 2)); }
        if (x > e2) { const d = (x - e2); v += 0.95 * Math.exp(-Math.pow((d - 0.10) / 0.12, 2)); }
        return v;
      }
      // exposure markers appear when the playhead passes them
      [{ x: e1, c: C.innate, t: '1st exposure' }, { x: e2, c: C.safe, t: '2nd exposure (memory)' }].forEach((ev) => {
        if (p >= ev.x) {
          const px = L + (R - L) * ev.x;
          g.ctx.strokeStyle = hexA(ev.c, 0.6); g.ctx.setLineDash([4, 4]); g.ctx.lineWidth = 1.5;
          g.ctx.beginPath(); g.ctx.moveTo(px, B); g.ctx.lineTo(px, T); g.ctx.stroke(); g.ctx.setLineDash([]);
          g.label(px + 4, T + 6, ev.t, { size: 10, color: ev.c, align: 'start' });
        }
      });
      // the curve, drawn up to the playhead
      g.ctx.strokeStyle = C.bcell; g.ctx.lineWidth = 3; g.ctx.beginPath();
      let started = false;
      for (let i = 0; i <= 120; i++) {
        const x = i / 120; if (x > p) break;
        const px = L + (R - L) * x, py = B - (B - T) * titer(x);
        if (!started) { g.ctx.moveTo(px, py); started = true; } else g.ctx.lineTo(px, py);
      }
      g.ctx.stroke();
      if (p <= 1) { const py = B - (B - T) * titer(p); g.dot(L + (R - L) * p, py, 4, C.bcell, true); }

      let ph, rd;
      if (p < e1) { ph = 'Before exposure'; rd = '<b>Naive state.</b> Matching B/T cells are rare; no specific antibody is present yet.'; }
      else if (p < e2) { ph = 'Primary response'; rd = '<b>First exposure.</b> Slow (days), modest titer, lower affinity — the rare clone must be found and expanded.'; }
      else if (p < 0.78) { ph = 'Secondary response'; rd = '<b>Memory recall.</b> Expanded, pre-affinity-matured, class-switched clones respond faster and higher. Long-lived plasma cells may already hold the line.'; }
      else { ph = 'The memory advantage'; rd = '<b>Why vaccines work.</b> If protective antibody is present <i>before</i> exposure, the pathogen can be neutralized before it establishes infection.'; }
      return { phase: ph, readout: rd };
    },
  }));

})();
