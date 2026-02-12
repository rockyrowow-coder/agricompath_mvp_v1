-- Update Inventory for Capacity Management
    ALTER TABLE public.inventory 
    ADD COLUMN IF NOT EXISTS capacity numeric,
    ADD COLUMN IF NOT EXISTS capacity_unit text;

    -- Update Records for Detailed Fertilizer Info
    ALTER TABLE public.records 
    ADD COLUMN IF NOT EXISTS components jsonb, -- Stores {n, p, k, etc}
    ADD COLUMN IF NOT EXISTS application_amount text; -- Specific amount per area (e.g. 20kg/10a)

    -- Update Profiles for LINE Integration (Placeholder)
    ALTER TABLE public.user_settings
    ADD COLUMN IF NOT EXISTS line_group_id text;
