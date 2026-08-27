-- Tambahkan kolom saldo kas brankas, bank, dan pajak titipan ke tabel bos_allocations
ALTER TABLE bos_allocations 
ADD COLUMN IF NOT EXISTS cash_in_hand NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS bank_balance NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS unpaid_taxes NUMERIC DEFAULT 0;
