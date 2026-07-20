# Dhira notification templates (approve & use in Emergent)

Copy these into Emergent / Meta. Edit wording if you like, then keep the `templateKey` names in sync with Dhira (`src/lib/notify.ts`).

---

## Email — proactive check-in

**templateKey:** `dhira_checkin_email_v1`  
**Subject:** `Just checking in — no pressure`

```
Hi {{alias}},

{{content}}

Whenever you're ready, open Dhira and talk — I'm listening, not advising.

If things feel overwhelming, India's Tele-MANAS helpline is available 24×7 at 14416.

— Dhira
```

---

## Email — weekly summary

**templateKey:** `dhira_weekly_email_v1`  
**Subject:** `Your week with Dhira`

```
Hi {{alias}},

{{content}}

Your full week view is in My Dhira → Timeline.

Tele-MANAS 14416 is always there if you need a human tonight.

— Dhira
```

---

## WhatsApp — proactive check-in

**templateKey / Meta name:** `dhira_checkin_v1`

```
Dhira check-in

Hi {{1}}, {{2}}

Open Dhira anytime you're ready. If you need urgent help in India, call Tele-MANAS 14416.
```

- `{{1}}` = alias  
- `{{2}}` = short safety-approved line (`content`, keep brief)

**Fixed fallback (easier Meta approval):**
```
Hi {{1}}, Dhira is thinking of you. Open the app when you're ready to talk. Tele-MANAS 14416 if you need urgent support.
```

---

## WhatsApp — weekly summary

**templateKey / Meta name:** `dhira_weekly_v1`

```
Your week with Dhira

Hi {{1}}, {{2}}

See more in My Dhira → Timeline. Tele-MANAS 14416 if you need help.
```

---

## Demo Day tip

Keep `WHATSAPP_ENABLED=false` until Meta approves templates. Email works immediately via Emergent’s Gmail (or similar) connection.
