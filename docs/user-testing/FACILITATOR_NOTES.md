# Facilitator notes — Google Form + Sheet

This kit lives in `docs/user-testing/`. You create the live Google Form once; responses collect in a Sheet automatically.

---

## Create the Form (about 15 minutes)

1. Open [Google Forms](https://forms.google.com) → **Blank form**.
2. Title: **Dhira — Team user testing feedback**
3. Paste the description from [`GOOGLE_FORM_QUESTIONS.md`](./GOOGLE_FORM_QUESTIONS.md).
4. Add sections and questions **exactly as listed** in that file (types and options matter for clean Sheet columns).
5. Form settings:
   - Progress bar: On  
   - Collect email: Optional  
   - Limit to 1 response: Off (unless you want one try per Google account)
6. **Preview** the Form once end-to-end.

---

## Link the Sheet

1. In the Form, open the **Responses** tab.
2. Click the green **Sheets** icon → **Create a new spreadsheet**.
3. Name it e.g. `Dhira user testing — responses`.
4. Share:
   - **Form link** → all teammate testers (edit access not needed)  
   - **Sheet** → facilitators only  

Optional: add a second Sheet tab named `Session log` with columns:

`Date | Tester | Facilitator | Start | End | App URL | liveBrain (Y/N) | Notes`

---

## Before each testing session

1. App running at **http://localhost:4028** (or share your demo URL).
2. Send testers:
   - Link to [`TEST_SCRIPT.md`](./TEST_SCRIPT.md) (or paste the walkthrough into Slack/Docs)
   - The **Google Form** link
3. Decide crisis-path policy:
   - With facilitator: allow Q15 / safety section  
   - Solo testers: tell them to choose **N/A** / **Did not test**
4. Optional check: open `/api/status` and note `liveBrain` / `supabaseAuth` in the Session log.

---

## How to read results

On the Form Responses Sheet:

| Look for | How |
|---|---|
| Drop-off | Count of **No** / **Partial** on Q6–Q15 (signup, chat, onboarding) |
| UX quality | Average of rating columns Q16–Q22 (and Q23 if answered) |
| Safety | Q24 must be **Yes** when crisis was tested; investigate any **No** |
| Demo Day priorities | Read Q29 (“one thing to change”) first |
| Delight | Q28 themes |

### Suggested score formulas (Sheet)

Assume ratings start in columns matching export order (adjust letters after your Form links):

- Average “ease / purpose / warmth / listen / trust / design / nav”:  
  `=AVERAGE(Q2:W2)` — replace with your actual rating columns for that row  
- Count critical failures (example if Chat completion is column K):  
  `=COUNTIF(K:K,"No")`

Add a **Summary** tab with:

- Number of responses  
- % Yes for Signup, Chat, Timeline  
- Mean of each 1–5 rating  
- List of open comments from Q26–Q30  

---

## Manual Sheet instead of Forms

If you prefer typing during live observation:

1. Create a blank Google Sheet.
2. Paste the header row from [`SHEET_COLUMNS.csv`](./SHEET_COLUMNS.csv) into row 1.
3. One row per tester; use the same Yes/Partial/No/N/A and 1–5 scales.

---

## Safety reminder for facilitators

- Do not ask teammates to role-play graphic self-harm alone.
- Prefer the in-app **Test safety path** control when available.
- Confirm Tele-MANAS **14416** is visible and clear.
- Dhira’s product promise: *listens, never advises* — flag any “you should…” style replies in Q27/Q29.

---

## Out of scope for this Form

- Admin Console (`/admin`)
- Production RBAC
- Real Emergent WhatsApp delivery (unless you explicitly add a later Form version)
