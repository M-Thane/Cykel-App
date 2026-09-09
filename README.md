# Cykel-App

En webapp med de værktøjer man som cyklist har brug for i hverdagen:

- **Sliddele** — hold styr på hvor mange km kæde, kassette, dæk, bremseklodser mv. har kørt pr. cykel, med advarsler når de nærmer sig deres forventede levetid.
- **Dæktryk** — beregn et vejledende dæktryk ud fra rytter-/cykelvægt, dækbredde, underlag, kørestil og dæktype.
- **Gear** — se udveksling, meter-udrulning og hastighed ved given kadence for dine klinger og kassette.
- **Bikefit** — få et vejledende udgangspunkt for sadelhøjde, rammestørrelse og styrposition.

Al data gemmes lokalt i browseren (localStorage) — der kræves ingen konto eller server.

## Udvikling

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Tech

React + TypeScript + Vite, Tailwind CSS, Zustand (persist til localStorage), React Router. Appen har en `manifest.webmanifest`, så den kan installeres på hjemmeskærmen på mobil (PWA) som et første skridt mod en fremtidig mobil-app.
