# Licensed Font Delivery Record

## Scope

- Added 24 OFL-licensed body and display fonts to `frontend/public/fonts/`.
- The set includes Chinese text, Chinese calligraphy, pixel and Japanese display styles, and six English decorative title styles.
- Added an `已授权字体` section to the editor's 文字 panel; selecting a card creates a text layer in that font. Japanese and English display fonts use an appropriate `DESIGN` or `ART TEXT` sample so missing Chinese glyphs are not mistaken for a font-loading failure. The property selector and canvas exporter use the same list.

## License Review

- License: SIL Open Font License 1.1 (`OFL-1.1`). The license text is stored with the files.
- Screening evidence is recorded in `frontend/public/fonts/fonts.json` for 字体家, 字体天下, 100font, and Google Fonts. The three user-provided sites are used for commercial-use screening; every added display font is independently confirmed against Google Fonts' official OFL directory.
- Binary download sources are the original project repositories, Google Fonts, and Google Fonts' official static distribution. File hashes are recorded in the manifest.
- Excluded any font whose reviewed page only demonstrated free commercial use and not open redistribution for web bundling.

## Risk

- The 24 font files total about 122 MiB. `font-display: swap` avoids blocking text rendering, but production optimization should subset glyph ranges before adding additional weights.

## Verification

- `node --test test/font-catalog.test.mjs`
- `npm test`
- `npm run build`
- `pwsh -File scripts/quality-gate.ps1`
- `node scripts/codex-code-review.mjs --scope changed-files --format json`
