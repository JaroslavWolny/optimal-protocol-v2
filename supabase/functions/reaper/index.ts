import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("The Reaper is awakening...")

serve(async (req) => {
    // Create a Supabase client with the Auth context of the logged in user.
    const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Invoke the "reap_souls" database function
    const { data, error } = await supabaseClient.rpc('reap_souls')

    if (error) {
        console.error("The Reaper failed:", error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 400,
        })
    }

    console.log(`The Reaper has claimed ${data} souls today.`)

    return new Response(
        JSON.stringify({
            message: "Harvest complete.",
            souls_claimed: data
        }),
        { headers: { 'Content-Type': 'application/json' } },
    )
})
