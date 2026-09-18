import { createClient } from
"https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://bkgzpitwokgcvhgzrfwf.supabase.co/rest/v1/";

const supabaseKey = "sb_publishable_R3lFTUqNmwz8OfmmgeVuNg_BcLABKbW";

export const supabase =
    createClient(supabaseUrl, supabaseKey);
