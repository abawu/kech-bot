# Kech Bot

Kech Bot is a Telegram food ordering bot for Hawassa cafes with bilingual customer flows, admin order management, distance-based delivery pricing, and cafe-specific takeaway fees.

## Features
- English and Amharic customer flow
- Cafe and menu browsing with categories and paging
- Cart, checkout, payment, and receipt upload flow
- Hawassa delivery-area validation
- Cafe-to-customer distance pricing
- Admin order notifications and status updates

## Tech Stack
- Node.js
- TypeScript
- Express
- Telegram Bot API

## Environment Variables
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_ADMIN_CHAT_ID`
- `TELEGRAM_WEBHOOK_SECRET`

## Scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run check`

## Notes
- Menu and cafe data are currently stored in memory in `server/storage.ts`.
- Local secrets should stay in `.env.local` and should not be committed.
