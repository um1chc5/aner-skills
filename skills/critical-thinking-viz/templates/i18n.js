// Shared language helpers for page.html and card.html. Inlined into both by the build script.
// Any text in the data file can be a plain string or an object keyed by language,
// e.g. { "vi": "Khái quát vội vàng", "en": "Hasty generalization" }. Arrays work the same way.
const CTV_LABELS = {
  en: {
    mapTitle: 'The argument, written out', vennTitle: 'The same claim as sets', testsTitle: 'Test the weak premises',
    legendStated: 'stated premise', legendHidden: 'unstated premise the claim needs',
    strike: 'Strike', restore: 'Restore', refuted: 'Refuted', after: 'No longer follows',
    stateNone: 'Every premise is standing, so the conclusion still follows.',
    stateSome: 'A premise the conclusion needs is gone. It no longer follows.',
    langLabel: 'Language', themeLabel: 'Theme', themeAuto: 'Auto', themeLight: 'Light', themeDark: 'Dark',
    sources: 'Sources',
  },
  vi: {
    mapTitle: 'Lập luận, viết đầy đủ', vennTitle: 'Cùng khẳng định, vẽ bằng tập hợp', testsTitle: 'Thử từng chỗ yếu',
    legendStated: 'tiền đề được nói ra', legendHidden: 'tiền đề ngầm mà kết luận cần',
    strike: 'Gạch bỏ', restore: 'Khôi phục', refuted: 'Bị bác bỏ', after: 'Không còn đứng được',
    stateNone: 'Mọi tiền đề còn đứng, kết luận vẫn được suy ra.',
    stateSome: 'Một tiền đề mà kết luận cần đã bị gạch. Kết luận không còn đứng được.',
    langLabel: 'Ngôn ngữ', themeLabel: 'Giao diện', themeAuto: 'Tự động', themeLight: 'Sáng', themeDark: 'Tối',
    sources: 'Nguồn',
  },
}

/** Languages the data provides, first one is the default. */
function ctvLangs(raw) {
  return raw.langs && raw.langs.length ? raw.langs : [raw.lang || 'en']
}

/** A copy of the data with every per-language object replaced by the text for `lang`. */
function ctvLocalize(raw, lang) {
  const langs = ctvLangs(raw)
  const isTr = (v) => {
    if (!v || typeof v !== 'object' || Array.isArray(v)) return false
    const keys = Object.keys(v)
    return keys.length > 0 && keys.every((k) => langs.includes(k))
  }
  const walk = (v) => {
    if (isTr(v)) return walk(v[lang] ?? v[langs[0]] ?? Object.values(v)[0])
    if (Array.isArray(v)) return v.map(walk)
    if (v && typeof v === 'object') {
      const o = {}
      for (const k in v) o[k] = walk(v[k])
      return o
    }
    return v
  }
  const D = walk(raw)
  D.lang = lang
  D.L = Object.assign({}, CTV_LABELS.en, CTV_LABELS[lang] || {}, D.labels || {})
  return D
}
