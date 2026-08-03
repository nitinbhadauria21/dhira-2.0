repo: nitinbhadauria21/dhira-2.0
branch: main

## Last sync
date: 2026-08-01T18:40:00Z

### Updated in this project
- Recreated all user-facing pages as clickable Design Components, plus a new Notebook (journal) section
- Placed illustrations throughout; floating buddy with warm halo on Landing, Notebook, Profile, Sign in / Sign up
- Adaptive time-of-day + user-chosen shift panels on Sign in, Sign up and Home
- Brand lockup changed to DHIRA over C A L M L I N K across every page

## Screen map
| Screen | Repo files |
|---|---|
| Landing.dc.html | src/app/page.tsx, src/app/components/Landing*.tsx, src/lib/artifactDesign.ts, src/lib/artifactIllustrations.ts, src/styles/tailwind.css |
| SignIn.dc.html | src/app/sign-in/page.tsx |
| SignUp.dc.html | src/app/sign-up/page.tsx |
| Onboarding.dc.html | src/app/onboarding/components/*.tsx |
| Home.dc.html | src/app/home-dashboard/components/*.tsx, src/components/AppNav.tsx |
| Chat.dc.html | src/app/chat-with-dhira/components/*.tsx |
| Notebook.dc.html | new in this project — no repo counterpart yet |
| Timeline.dc.html | src/app/timeline/page.tsx |
| Profile.dc.html | src/app/profile/page.tsx |

## Sync history
- 2026-07-31T17:02:00Z — initial recreation of 8 pages, illustrations added, Landing animations reproduced
