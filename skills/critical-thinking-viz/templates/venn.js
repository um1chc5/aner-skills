// Shared Venn renderer for page.html and card.html. Inlined into both by the build scripts.
// spec: { layout: 'inside' | 'overlap' | 'disjoint', a: {label}, b: {label},
//         items: { a: [lines], b: [lines], both: [lines] }, dots: n }
// In 'inside', A sits inside B. Colours come from the CSS classes .va/.vb/.vt/.vdot.
function vennSVG(spec, W, H, fs) {
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const it = spec.items || {}
  const lines = (arr, x, y, cls, anchor) =>
    (arr || [])
      .map((l, i) => `<text x="${x}" y="${y + i * fs * 1.3}" class="${cls}" text-anchor="${anchor || 'middle'}">${esc(l)}</text>`)
      .join('')
  const block = (arr, x, cy, cls) => lines(arr, x, cy - (((arr || []).length - 1) * fs * 1.3) / 2 + fs * 0.35, cls)
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc((spec.a?.label || '') + ' / ' + (spec.b?.label || ''))}">`
  const L = fs * 1.5
  if (spec.layout === 'inside') {
    // outer label sits above the big circle; the inner circle is wide enough for its own label
    const R = Math.min((H - L - 14) / 2, W * 0.36)
    const cx = W / 2, cy = L + 12 + R
    const r = R * 0.56, ax = cx + R * 0.16, ay = cy + R * 0.1
    s += `<circle cx="${cx}" cy="${cy}" r="${R}" class="vb"/><circle cx="${ax}" cy="${ay}" r="${r}" class="va"/>`
    s += `<text x="${cx}" y="${cy - R - 8}" class="vl vbt" text-anchor="middle" style="font-size:${L}px">${esc(spec.b.label)}</text>`
    s += `<text x="${ax}" y="${ay + L * 0.3}" class="vl vat" text-anchor="middle" style="font-size:${L * 0.8}px">${esc(spec.a.label)}</text>`
    s += block(it.b, cx - R * 0.62, cy + R * 0.05, 'vt')
  } else if (spec.layout === 'disjoint') {
    const r = Math.min(H * 0.36, (W - 24) / 4.6)
    const cy = H / 2 + L * 0.5, ca = W / 2 - r * 1.15, cb = W / 2 + r * 1.15
    s += `<circle cx="${ca}" cy="${cy}" r="${r}" class="va"/><circle cx="${cb}" cy="${cy}" r="${r}" class="vb"/>`
    s += `<text x="${ca}" y="${cy - r - 10}" class="vl vat" text-anchor="middle" style="font-size:${L}px">${esc(spec.a.label)}</text>`
    s += `<text x="${cb}" y="${cy - r - 10}" class="vl vbt" text-anchor="middle" style="font-size:${L}px">${esc(spec.b.label)}</text>`
    s += block(it.a, ca, cy, 'vt') + block(it.b, cb, cy, 'vt')
  } else {
    const both = (it.both || []).length
    // leave room under the circles for the overlap label
    const r = Math.min((H - L - 14 - (both ? fs * 1.3 * both + 8 : 0)) / 2, (W - 16) / 3.1)
    const d = r * 0.55, cy = r + L + 10
    const ca = W / 2 - d, cb = W / 2 + d
    s += `<circle cx="${ca}" cy="${cy}" r="${r}" class="va"/><circle cx="${cb}" cy="${cy}" r="${r}" class="vb"/>`
    // titles sit above each circle, each kept on its own half so they never touch
    const tw = (t) => String(t).length * L * 0.56
    const wa = tw(spec.a.label), wb = tw(spec.b.label)
    const xa = Math.max(4 + wa / 2, Math.min(ca - r * 0.3, W / 2 - 8 - wa / 2))
    const xb = Math.min(W - 4 - wb / 2, Math.max(cb + r * 0.3, W / 2 + 8 + wb / 2))
    s += `<text x="${xa}" y="${cy - r - 8}" class="vl vat" text-anchor="middle" style="font-size:${L}px">${esc(spec.a.label)}</text>`
    s += `<text x="${xb}" y="${cy - r - 8}" class="vl vbt" text-anchor="middle" style="font-size:${L}px">${esc(spec.b.label)}</text>`
    s += block(it.a, ca - r * 0.47, cy, 'vt') + block(it.b, cb + r * 0.47, cy, 'vt')
    const n = Math.min(spec.dots || 0, 4)
    for (let i = 0; i < n; i++) {
      const y = cy - r * 0.5 + i * r * 0.2
      s += `<circle cx="${W / 2 + (i % 2 ? -4 : 4)}" cy="${y}" r="${fs * 0.45}" class="vdot"/>`
    }
    if (both) {
      // the lens is too narrow for text: label it under the circles with a short pointer
      s += `<line x1="${W / 2}" y1="${cy + r * 0.3}" x2="${W / 2}" y2="${cy + r + 4}" class="vptr"/>`
      s += lines(it.both, W / 2, cy + r + fs * 1.3, 'vt vtb')
    }
  }
  return s + '</svg>'
}
