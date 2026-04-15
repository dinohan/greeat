import React from 'react'

import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      closeButton
      position="top-center"
      richColors
      theme="light"
      toastOptions={{
        style: {
          fontFamily: 'inherit',
        },
      }}
      {...props}
    />
  )
}
