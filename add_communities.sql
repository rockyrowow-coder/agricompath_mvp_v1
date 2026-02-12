-- Add requested provisional communities
-- Admin user ID selection is a fallback; ideally matches a real admin.

DO $$
DECLARE
    admin_id uuid;
BEGIN
    SELECT id INTO admin_id FROM auth.users LIMIT 1;
    
    IF admin_id IS NOT NULL THEN
        -- 1. Aragawa Peach
        INSERT INTO public.communities (name, description, created_by, join_password)
        VALUES (
            '仮・あら川の桃生産者コミュニティ', 
            '和歌山県紀の川市桃山町のブランド「あら川の桃」生産者コミュニティです。栽培技術の共有や情報交換を行いましょう。', 
            admin_id, 
            NULL -- No password initially
        ) ON CONFLICT (id) DO NOTHING; -- Name is not unique constraint usually, but we want to avoid dupes. 
        -- Since name isn't unique, we check existence:
        
        IF NOT EXISTS (SELECT 1 FROM public.communities WHERE name = '仮・あら川の桃生産者コミュニティ') THEN
             INSERT INTO public.communities (name, description, created_by, join_password)
            VALUES (
                '仮・あら川の桃生産者コミュニティ', 
                '和歌山県紀の川市桃山町のブランド「あら川の桃」生産者コミュニティです。栽培技術の共有や情報交換を行いましょう。', 
                admin_id, 
                NULL
            );
        END IF;

        -- 2. JA Kimitsu Futtsu Melon
        IF NOT EXISTS (SELECT 1 FROM public.communities WHERE name = '仮・JAきみつ富津メロン部会') THEN
             INSERT INTO public.communities (name, description, created_by, join_password)
            VALUES (
                '仮・JAきみつ富津メロン部会', 
                '千葉県富津市の特産「富津メロン」の部会コミュニティです。', 
                admin_id, 
                NULL
            );
        END IF;

        -- 3. JA Toyohashi Mini Tomato
        IF NOT EXISTS (SELECT 1 FROM public.communities WHERE name = '仮・JA豊橋ミニトマト部会') THEN
             INSERT INTO public.communities (name, description, created_by, join_password)
            VALUES (
                '仮・JA豊橋ミニトマト部会', 
                'JA豊橋ミニトマト部会の情報共有コミュニティです。', 
                admin_id, 
                NULL
            );
        END IF;
    END IF;
END $$;
