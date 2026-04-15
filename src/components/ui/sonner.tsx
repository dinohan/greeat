import React from 'react'

import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      closeButton={false}
      position="top-right"
      richColors
      theme="light"
      duration={1000}
      toastOptions={{
        style: {
          fontFamily: 'inherit',
          fontSize: '1.2rem',
          minWidth: '0',
          minHeight: '0',
          maxWidth: '28rem',
          padding: '0.8rem',
        },
      }}
      {...props}
    />
  )
}
