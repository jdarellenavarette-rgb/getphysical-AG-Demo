-- New enum values live in their own migration: Postgres cannot use a value
-- in the same transaction that adds it.

-- Coach enrolment requests created by scanning a coach QR await approval.
alter type public.membership_status add value if not exists 'PENDING';

-- Maya Checkout (test provider while the production gateway is decided).
alter type public.payment_provider add value if not exists 'MAYA';
