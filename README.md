# Chordlings: Island Orchestra

A fully original musical-creature collection game inspired by the island breeding genre. It is intentionally not a copy of any existing game's monsters, art, audio, names, or files.

## What is included
- 4 playable islands
- 40 original base species
- Common, Rare, Epic, and Legendary variants for 160 Chordex entries
- Breeding recipes, rarity rolls, nursery hatching, and gem speed-ups
- **Hard 60-minute maximum from Breed -> Hatch for every monster**
- Early monsters take seconds or a few minutes
- Offline/passive coin production with per-monster storage caps
- Leveling and passive coin production
- 20 quests, stars, and coin-based island unlocks
- Coin Rush, Memory Match, and Beat Echo mini-games
- Procedural WebAudio island music that changes with your owned monsters
- Local save data plus save-code export/import
- Daily gift with a lightweight streak bonus
- iPhone/iPad safe-area UI, touch controls, haptics where supported
- PWA manifest + service worker + Apple touch icon
- No libraries, CDNs, servers, accounts, or asset folders required

## Put it on GitHub Pages
Every file in the ZIP belongs directly in the repository root. Do not create folders.

1. Create a GitHub repository.
2. Upload all files from the ZIP directly into the repository.
3. Commit the files.
4. Open **Settings -> Pages**.
5. Choose **Deploy from a branch**, select your main branch and `/ (root)`, then save.
6. Open the Pages URL once deployment finishes.

## iPhone / iPad install
Open the GitHub Pages URL in Safari, tap **Share**, then **Add to Home Screen**. Chordlings will launch in standalone mode with the included app icon.

## Files
- `index.html` - game shell and UI
- `style.css` - responsive/iOS styling
- `game.js` - all gameplay, monsters, saves, breeding, quests, games, and audio
- `manifest.json` - installable web-app metadata
- `sw.js` - offline caching
- `icon.png` - 512x512 app icon / Apple touch icon
- `README.md` - setup instructions

## Save data
Progress is stored in the browser with `localStorage`. Deleting Safari website data can remove it, so Settings includes a save-code export/import option.
