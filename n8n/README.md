# Reminder scheduling for Dhira

**Demo Day path: use Emergent** — see the founder attachable guide:

→ [`docs/emergent/EMERGENT_DEMO_DAY_WORKFLOW.md`](../docs/emergent/EMERGENT_DEMO_DAY_WORKFLOW.md)  
→ Templates: [`docs/emergent/TEMPLATES.md`](../docs/emergent/TEMPLATES.md)

That document is the single source of truth to re-create the clock → due list → check-in → send email/WhatsApp → callback flow in Emergent (or optionally with n8n as the timer only).

## What Dhira already exposes

| Endpoint | Purpose |
|---|---|
| `GET /api/notifications/due?type=proactive\|weekly` | Who should get a message |
| `POST /api/checkin` | Draft + Safety Monitor + enqueue Emergent send |
| `POST /api/notifications/weekly` | Weekly summary (also Monitor-gated) |
| `POST /api/notifications/callback` | Emergent reports delivered/failed |

Header for scheduler calls: `x-checkin-secret: <CHECKIN_SECRET>`

## Optional: n8n instead of Emergent’s clock

If you prefer n8n only as the *timer* (Emergent still sends):

1. Schedule every hour  
2. GET due list  
3. POST check-in / weekly per user  

Do **not** add a separate n8n Email node for Demo Day — delivery goes through Emergent’s webhook from `src/lib/notify.ts`.
