'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { applyCursor } from '@/lib/cursors'

export default function CursorApplier() {
    useEffect(() => {
        const supabase = createClient()
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                applyCursor(null)
                return
            }
            const { data } = await supabase
                .from('profiles')
                .select('cursor_style')
                .eq('id', user.id)
                .single()
            applyCursor(data?.cursor_style)
        }
        load()
    }, [])

    return null
}
