# WLexperience

WLexperience è una webapp realizzata con Next.js App Router, TypeScript e Tailwind CSS per aiutare Silvia e Nicolò a migliorare le abitudini alimentari attraverso un live blog condiviso dei pasti.

## Caratteristiche

- Pagine responsive mobile-first: `Live Blog` e `Resoconto`
- Integrazione con Supabase per archiviazione pasti
- Dashboard con grafici Recharts per monitorare soddisfazione e andamento settimanale
- Componenti riutilizzabili e design moderno a card
- Footer con disclaimer medico

## Struttura del progetto

- `app/`: App Router, pagine e API route
- `components/`: componenti UI riutilizzabili
- `lib/`: client Supabase e funzioni di accesso ai dati
- `types/`: tipi TypeScript
- `.env.example`: esempio di variabili ambiente

## Setup locale

1. Clona la repository

```bash
git clone <repository-url>
cd WLexperience
```

2. Installa dipendenze

```bash
npm install
```

3. Crea il file `.env` usando `.env.example`

```bash
cp .env.example .env
```

4. Configura le variabili ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

5. Avvia l’app in sviluppo

```bash
npm run dev
```

Apri `http://localhost:3000`

## Configurazione Supabase

1. Accedi a Supabase e crea un nuovo progetto.
2. Nella sezione `Settings > API` copia `URL` e `anon key`.
3. Crea una tabella chiamata `meals` utilizzando SQL:

```sql
create extension if not exists "uuid-ossp";

create table if not exists meals (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  meal_datetime timestamptz not null,
  user_name text check (user_name in ('Silvia', 'Nicolò')) not null,
  description text not null,
  meal_type text check (meal_type in ('Primo', 'Secondo', 'Dessert', 'Snack', 'Altro')) not null,
  satisfied boolean not null,
  hunger_level int check (hunger_level between 1 and 5),
  notes text
);
```

4. Imposta le variabili environment nella tua app Vercel o nel file `.env` locale.

## Deploy su Vercel

1. Collega il repository a Vercel.
2. Configura le variabili ambiente in Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Avvia il deploy automatico.

## Note tecniche

- `app/page.tsx`: pagina `Live Blog` con inserimento e visualizzazione dei pasti
- `app/report/page.tsx`: dashboard con grafici Recharts
- `app/api/meals/route.ts`: API route di backend per lettura/inserimento pasti
- `lib/supabaseClient.ts`: client Supabase lato browser
- `lib/supabaseServer.ts`: client Supabase lato server

## Eseguire in GitHub Codespaces

1. Apri il repository in Codespaces.
2. Assicurati che `.env` sia presente e configurato.
3. Esegui `npm install` e poi `npm run dev`.
4. Usa la porta 3000 o la porta esposta dal Codespace per accedere all’app.
