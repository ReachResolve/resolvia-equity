
-- Create a function to increment a number in the database
CREATE OR REPLACE FUNCTION increment(num numeric)
RETURNS numeric AS $$
BEGIN
  RETURN (current_setting('num', true)::numeric + num);
END;
$$ LANGUAGE plpgsql;

-- Create a function to decrement a number in the database
CREATE OR REPLACE FUNCTION decrement(num numeric)
RETURNS numeric AS $$
BEGIN
  RETURN (current_setting('num', true)::numeric - num);
END;
$$ LANGUAGE plpgsql;
