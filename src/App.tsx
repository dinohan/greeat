import React, { Suspense, useDeferredValue, useState } from 'react'

import Meal, { MealSkeleton } from '@/components/Meal'
import Status, { StatusSkeleton } from '@/components/Status'

import styles from './App.module.scss'

function App() {
  const [date, setDate] = useState(() => {
    const today = new Date()

    function nextDay(offset: number) {
      today.setDate(today.getDate() + offset)
    }

    if (today.getHours() >= 14) {
      nextDay(1)
    }
    if (today.getDay() === 6) {
      nextDay(2)
    } else if (today.getDay() === 0) {
      nextDay(1)
    }

    return today
  })

  const handlePrevDay = () => {
    const prevDay = new Date(date)

    // if current day is monday go to friday
    if (prevDay.getDay() === 1) {
      prevDay.setDate(prevDay.getDate() - 3)
    } else {
      prevDay.setDate(prevDay.getDate() - 1)
    }

    setDate(prevDay)
  }

  const handleNextDay = () => {
    const nextDay = new Date(date)

    // if current day is friday go to monday
    if (nextDay.getDay() === 5) {
      nextDay.setDate(nextDay.getDate() + 3)
    } else {
      nextDay.setDate(nextDay.getDate() + 1)
    }

    setDate(nextDay)
  }

  const dateString = date.toISOString().slice(0, 10).replace(/-/g, '')

  const deferredDateString = useDeferredValue(dateString)

  const isPending = deferredDateString !== dateString

  return (
    <>
      <header className={styles.App_header}>
        <button onClick={handlePrevDay}>이전</button>
        <time>
          <h2>
            {Intl.DateTimeFormat('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'short',
            }).format(date)}
          </h2>
        </time>
        <button onClick={handleNextDay}>다음</button>
      </header>

      <main>
        <Suspense fallback={<MealSkeleton />}>
          <Meal
            dateString={deferredDateString}
            isPending={isPending}
          />
        </Suspense>
        <Suspense fallback={<StatusSkeleton />}>
          <Status
            dateString={deferredDateString}
            isPending={isPending}
          />
        </Suspense>
      </main>
    </>
  )
}

export default App
