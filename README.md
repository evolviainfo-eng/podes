# Podes — aliuminės, stumdomos langų sistemos

Vieno puslapio (one-page) verslo svetainė įmonei **Podes** — aliuminės stumdomos
stiklo sistemos, terasų ir balkonų stiklinimas. Kaunas, dirbama visoje Lietuvoje.

Statinė svetainė (HTML / CSS / vanilla JS), be jokių priklausomybių.

## Paleidimas lokaliai

```bash
node server.js
# arba bet koks statinis serveris kataloge
```

Atidaryti: <http://localhost:3026>

## Struktūra

```
index.html      – visas turinys (viena sekcija po kitos)
styles.css      – dizaino sistema + visi stiliai
script.js       – reveal animacijos, galerijos lightbox, DUK, kontaktų forma
server.js       – minimalus statinis serveris peržiūrai
assets/
  hero.jpg          – pagrindinė (hero) nuotrauka
  pano.jpg          – plačiaformatė juosta (Pexels, nemokama komercinė licencija)
  podes-mark.png    – logotipas (apvalus, permatomas fonas)
  podes-logo.png    – originalus logotipas
  gallery/          – realios darbų nuotraukos
```

## Dizainas

- **Spalvos:** antracitas `#0E0F11` + šiltai balta `#F4F3F0` (monochromas).
- **Šriftai:** Clash Display (antraštės) + General Sans (tekstas), per Fontshare CDN.
- **Parašas:** plonas aliuminio „rėmas“, kuris pats išsibraižo slenkant (hero + „threshold“ sekcija).

## Turinys ir įrodymai

- Galerija — realios Podes darbų nuotraukos.
- Atsiliepimai ir įvertinimai (4,8★ / paslaugos.lt, 100 % rekomenduoja / Facebook) — realūs.
- Nuotraukų / failų skaičius **nenaudojamas** kaip atliktų darbų skaičius.

## Kontaktų forma

Forma veikia su **Formspree**. Įrašykite savo formos ID į `index.html`:

```html
<form ... action="https://formspree.io/f/JŪSŲ-ID" ...>
```

Kol ID neįrašytas, forma atidaro el. laišką (`mailto:`) į `podessistemos@gmail.com`.

## Kontaktai

Podes · +370 686 40272 · podessistemos@gmail.com · Pienių g. 16, Kaunas, LT-47446
