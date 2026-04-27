CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO categories (id, name)
SELECT gen_random_uuid(), v.name
FROM (VALUES
  ('Materiales'),
  ('Herramientas')
) AS v(name)
WHERE NOT EXISTS (
  SELECT 1 FROM categories c WHERE lower(c.name) = lower(v.name)
);