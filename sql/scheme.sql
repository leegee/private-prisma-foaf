SET search_path TO public;

DROP TABLE IF EXISTS Person2Person;
DROP TABLE IF EXISTS Person;

CREATE TABLE IF NOT EXISTS Person (
  id            SERIAL PRIMARY KEY,
  fullname      VARCHAR(255) NOT NULL,
  published     BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS Person2Person (
  a SERIAL REFERENCES person,
  b SERIAL REFERENCES person
);
