'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const onboarded = localStorage.getItem('scalecraft_onboarded')
    if (onboarded) {
      router.replace('/dashboard')
    } else {
      router.replace('/onboarding')
    }
  }, [router])

  return null
}
