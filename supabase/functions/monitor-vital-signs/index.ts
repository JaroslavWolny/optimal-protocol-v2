import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export default async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Create a Supabase client with the SERVICE_ROLE_KEY to bypass RLS
        // This is required because we are modifying other users' data
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Calculate the "Death Threshold"
        // If today is Friday (2023-10-27), yesterday was Thursday (2023-10-26).
        // If the last log was Wednesday (2023-10-25), they missed Thursday.
        // So if last_log_date < Yesterday, they are dead.

        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        const deadThreshold = yesterday.toISOString().split('T')[0] // YYYY-MM-DD

        console.log(`[Vital Signs] Checking for users inactive since before ${deadThreshold}...`)

        // 2. Identify "Dead" Users
        // Logic: Hardcore users who haven't logged something since "Day Before Yesterday"
        const { data: deadUsers, error: fetchError } = await supabase
            .from('profiles')
            .select('id')
            .eq('hardcore_mode', true)
            .lt('last_log_date', deadThreshold)
            .gt('streak', 0) // Only kill those who have something to lose

        if (fetchError) {
            console.error('Error fetching dead users:', fetchError)
            throw fetchError
        }

        if (!deadUsers || deadUsers.length === 0) {
            console.log('[Vital Signs] No casualties found.')
            return new Response(
                JSON.stringify({ message: 'No casualties found.', count: 0 }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        const deadUserIds = deadUsers.map(u => u.id)
        console.log(`[Vital Signs] Found ${deadUserIds.length} casualties:`, deadUserIds)

        // 3. Execute The Reaper (Batch Operations)

        // A. Wipe Logs (This ensures client calculates 0 streak)
        const { error: deleteLogsError } = await supabase
            .from('logs')
            .delete()
            .in('user_id', deadUserIds)

        if (deleteLogsError) {
            console.error('Error deleting logs:', deleteLogsError)
            throw deleteLogsError
        }

        // B. Mark as DEAD (Do NOT reset stats yet - we need them for the Death Certificate)
        const { error: updateProfileError } = await supabase
            .from('profiles')
            .update({
                status: 'DEAD',
                // streak: 0, // Don't reset yet! Let them see what they lost.
                // avatar_stage: 0,
                last_active: new Date().toISOString()
            })
            .in('id', deadUserIds)

        if (updateProfileError) {
            console.error('Error resetting profiles:', updateProfileError)
            throw updateProfileError
        }

        // 4. Send Notifications (Placeholder)
        // In a real app, you'd fetch push_tokens and send via FCM/APNS here.
        // await sendPushNotifications(deadUserIds, "PROTOCOL FAILED. RESETTING.")

        return new Response(
            JSON.stringify({
                success: true,
                casualties: deadUserIds.length,
                message: 'Permadeath logic executed successfully.'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
}
