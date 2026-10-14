# insinöörilaskurit

Interaktiivisia ja salamannopeita hyötylaskureita insinööreille, ammattilaisille ja
DIY-harrastajille. Sivusto on toteutettu kevyenä client-side-sovelluksena ilman
palvelinkustannuksia.

## Kehitys

Käytä projektin `.nvmrc`-tiedostossa määriteltyä Node.js-versiota.

```sh
npm ci
npm run dev
```

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
