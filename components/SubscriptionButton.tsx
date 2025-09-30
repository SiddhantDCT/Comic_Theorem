'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { SubscriptionForm } from './SubscriptionForm'
import { Portal } from './Portal'

export function SubscriptionButton() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg"
      >
        <Calendar className="w-4 h-4 mr-2" />
        Weekly Updates @₹100
      </Button>

      {showModal && (
        <Portal>
          <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="relative w-full max-w-md">
                <SubscriptionForm onClose={() => setShowModal(false)} />
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}