DO $$
DECLARE
    r record;
    role_type text;
BEGIN
    -- Drop any existing check constraints that reference the role column.
    FOR r IN
        SELECT c.conname
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE t.relname = 'users'
          AND n.nspname = 'public'
          AND c.contype = 'c'
          AND pg_get_constraintdef(c.oid) ILIKE '%role%'
    LOOP
        EXECUTE format('ALTER TABLE public.users DROP CONSTRAINT IF EXISTS %I', r.conname);
    END LOOP;

    SELECT data_type
    INTO role_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'role';

    IF role_type IS NOT NULL THEN
        IF role_type <> 'character varying' THEN
            EXECUTE 'ALTER TABLE public.users ALTER COLUMN role TYPE varchar(20) USING CASE role WHEN 0 THEN ''USER'' WHEN 1 THEN ''ADMIN'' ELSE ''USER'' END';
        ELSE
            EXECUTE 'UPDATE public.users SET role = CASE role WHEN ''0'' THEN ''USER'' WHEN ''1'' THEN ''ADMIN'' ELSE role END';
        END IF;
    END IF;

    -- Normalize legacy lowercase gender values to enum names.
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'users'
          AND column_name = 'gender'
    ) THEN
        EXECUTE 'UPDATE public.users SET gender = CASE LOWER(gender)
            WHEN ''male'' THEN ''MALE''
            WHEN ''female'' THEN ''FEMALE''
            WHEN ''other'' THEN ''OTHER''
            ELSE gender END
            WHERE gender IS NOT NULL';
    END IF;

    -- Legacy schema: orders.price / orders.quantity / orders.product used to exist and be NOT NULL.
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'orders'
          AND column_name = 'price'
    ) THEN
        EXECUTE 'ALTER TABLE public.orders ALTER COLUMN price DROP NOT NULL';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'orders'
          AND column_name = 'quantity'
    ) THEN
        EXECUTE 'ALTER TABLE public.orders ALTER COLUMN quantity DROP NOT NULL';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'orders'
          AND column_name = 'product'
    ) THEN
        EXECUTE 'ALTER TABLE public.orders ALTER COLUMN product DROP NOT NULL';
    END IF;
END $$;
__END__
