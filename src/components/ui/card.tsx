import React from 'react'

import classNames from 'classnames'

import styles from './card.module.scss'

type CardSize = 'default' | 'sm'

type CardRootProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: CardSize
}

type CardSectionProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: CardSize
}

const CardContext = React.createContext<CardSize>('default')

export function Card({
  className,
  size = 'default',
  ...props
}: CardRootProps) {
  return (
    <CardContext.Provider value={size}>
      <div
        className={classNames(styles.card, styles[`size_${size}`], className)}
        {...props}
      />
    </CardContext.Provider>
  )
}

export function CardHeader({ className, ...props }: CardSectionProps) {
  const size = React.useContext(CardContext)

  return (
    <div
      className={classNames(
        styles.header,
        styles[`header_${size}`],
        className
      )}
      {...props}
    />
  )
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={classNames(styles.title, className)}
      {...props}
    />
  )
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={classNames(styles.description, className)}
      {...props}
    />
  )
}

export function CardAction({ className, ...props }: CardSectionProps) {
  return (
    <div
      className={classNames(styles.action, className)}
      {...props}
    />
  )
}

export function CardContent({ className, ...props }: CardSectionProps) {
  const size = React.useContext(CardContext)

  return (
    <div
      className={classNames(
        styles.content,
        styles[`content_${size}`],
        className
      )}
      {...props}
    />
  )
}

export function CardFooter({ className, ...props }: CardSectionProps) {
  const size = React.useContext(CardContext)

  return (
    <div
      className={classNames(
        styles.footer,
        styles[`footer_${size}`],
        className
      )}
      {...props}
    />
  )
}
