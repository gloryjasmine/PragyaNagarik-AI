# PRAGYANAGARIK AI

> Democratizing Intelligence for Every Citizen.

An Indian government-service guidance platform: Next.js web app, native Expo mobile client, FastAPI API, PostgreSQL/Supabase-ready schema, deterministic eligibility/recommendation engines, and a visual application navigator.

## Quick start

1. Copy `.env.example` to `.env` and add real Supabase/Gemini values when ready. Never put service-role or Gemini keys in web/mobile env files.
2. Backend: `cd backend`, `python -m venv .venv`, activate it, then `pip install -r requirements.txt` and `uvicorn app.main:app --reload`.
3. Web: `cd frontend`, run `npm.cmd install` then `npm.cmd run dev`.
4. Mobile: `cd mobile`, run `npm.cmd install` then `npx expo start`.

The API includes safe demo records clearly labelled **Demo/seed information — verify with the official source**. Deploy Supabase SQL from `database/schema.sql`, then replace demo content with department-verified records.

## Architecture

`Web + Expo Mobile → FastAPI → verified scheme data/rule engines → Gemini (explanation only)`

Supabase Auth should issue the user token. The FastAPI layer verifies it and enforces role/department boundaries before privileged actions. Gemini is deliberately not treated as a source of scheme facts.
