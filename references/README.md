# Claude artifact → Cursor port

Source prototype: https://claude.ai/code/artifact/95d325eb-3e38-4658-9594-843bdb030151

Saved HTML snapshot: `Dhira-User-App-claude-artifact.html`  
Home screenshot: `01-home-dashboard.webp`

## Mapped into Cursor

| Artifact piece | Cursor location |
|---|---|
| `PALETTES` day/night | `src/styles/tailwind.css` CSS variables |
| `MOOD_COLORS` / legend | `src/lib/artifactDesign.ts`, `MoodBadge`, home timeline |
| Home bento (mood, streak, check-in, week, journal) | `src/app/home-dashboard/components/*` |
| Nav Home / Chat / Timeline / Profile | `src/components/AppNav.tsx` |
| Chat seed line + footer | `ChatContent.tsx`, `ChatInputBar.tsx` |
| Landing FEATURES / STEPS | `LandingFeatures.tsx`, `LandingHowItWorks.tsx` |
| Profile header copy | `src/app/profile/page.tsx` |

## Still need from founder

Please upload `Dhira User App.dc (9).html` from your Downloads folder if it is newer than this Claude artifact — Cloud Agents cannot read `c:\Users\...` paths directly.
