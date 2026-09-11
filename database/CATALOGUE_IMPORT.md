# Nationwide catalogue operations

1. Apply `schema.sql` and `seed.sql` to the Supabase/PostgreSQL database.
   The schema registers all 28 States and all 8 Union Territories.
2. Copy `catalogue-template.csv` and replace the example row with data verified
   from an official government source. Use `|` to separate multiple benefits or
   required documents. Leave an unverified optional value blank.
3. From `backend`, with `DATABASE_URL` set in the environment, run:

   ```powershell
   .\.venv\Scripts\python.exe scripts\import_catalogue.py ..\database\catalogue.csv
   ```

   `.xlsx` files are also supported. Imports are deliberately stored as
   `PENDING_ADMIN_REVIEW`; an authorised administrator must validate the source
   and application URLs before setting `verification_status` to
   `OFFICIAL_SOURCE`.

Never put database, Supabase, or Gemini credentials in the CSV/XLSX file.
