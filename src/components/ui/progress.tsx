import React from 'react'

import classNames from 'classnames'
import * as ProgressPrimitive from '@radix-ui/react-progress'

import styles from './progress.module.scss'

export const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value = 0, ...props }, ref) => {
  const safeValue =
    typeof value === 'number' ? Math.max(0, Math.min(100, value)) : 0

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={classNames(styles.progress_root, className)}
      value={safeValue}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={styles.progress_indicator}
        style={{
          transform: `translateX(-${100 - safeValue}%)`,
        }}
      />
    </ProgressPrimitive.Root>
  )
})

Progress.displayName = ProgressPrimitive.Root.displayName
