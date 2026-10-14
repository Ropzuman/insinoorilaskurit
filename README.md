# insinöörilaskurit

Interaktiivisia ja salamannopeita hyötylaskureita insinööreille, ammattilaisille ja
DIY-harrastajille. Sivusto on toteutettu kevyenä client-side-sovelluksena ilman
palvelinkustannuksia.

## Kehitys

Asenna Node.js 24 LTS ja npm macOS- tai Windows-ympäristöösi. Projektin
`.nvmrc`-tiedosto ja GitHub Actions käyttävät samaa Node.js-pääversiota. Tarkista
asennus komennoilla `node --version` ja `npm --version`, asenna lukitut riippuvuudet
ja käynnistä kehityspalvelin:

```sh
npm ci
npm run dev
```

`npm ci` asentaa täsmälleen `package-lock.json`-tiedoston riippuvuudet ja epäonnistuu,
jos Node.js-versio ei täytä projektin vaatimusta. Riippuvuuksien päivityksen jälkeen
päivitä lukitustiedosto komennolla `npm install` ja tarkista muutokset versionhallinnasta.

| Komento | Kuvaus |
| --- | --- |
| `npm run dev` | Käynnistää paikallisen kehityspalvelimen. |
| `npm run build` | Muodostaa staattisen tuotantoversion `dist/`-hakemistoon. |
| `npm run preview` | Esikatselee tuotantoversion paikallisesti. |
| `npm test` | Suorittaa laskurien yksikkötestit. |
| `npm run coverage` | Suorittaa yksikkötestit ja kattavuusraportin. |

## Projektirakenne

```text
src/
├── components/calculators/   # React-käyttöliittymät
├── layouts/                  # Jaetut Astro-sivupohjat
├── lib/calculators/          # Käyttöliittymästä riippumaton laskentalogiikka
│   └── __tests__/            # Laskentalogiikan Vitest-testit
├── pages/                    # Astro-reitit
└── styles/                   # Yhteiset tyylit
```

Uuden laskurin laskentalogiikka pidetään puhtaana ja käyttöliittymästä erillään
`src/lib/calculators/`-hakemistossa. Käyttöliittymä ja sivu sijoitetaan vastaavasti
`src/components/calculators/`- ja `src/pages/<kategoria>/`-hakemistoihin. Tiedostonimet
ovat kebab-case-muodossa; testit sijaitsevat laskentalogiikan `__tests__/`-hakemistossa.
Käyttöliittymän tekstit kirjoitetaan suomeksi.
