import React, { Suspense, useDeferredValue, useState } from 'react'
import { Copy, LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'

import { getMenus } from '@/apis/getMenus'
import { getStatuses } from '@/apis/getStatuses'
import Meal, { MealSkeleton } from '@/components/Meal'
import Status, { StatusSkeleton } from '@/components/Status'

import styles from './App.module.scss'

function App() {
  const [isCopying, setIsCopying] = useState(false)
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

  const handleCopyImage = async () => {
    setIsCopying(true)

    try {
      const copyPromise = (async () => {
        const [menus, statuses] = await Promise.all([
          getMenus(dateString),
          getStatuses(dateString),
        ])

        const { shareMealImage } = await import('@/features/share/copyShareImage')
        return shareMealImage({
          date: new Date(date),
          dateString,
          menus,
          statuses,
        })
      })()

      toast.promise(copyPromise, {
        loading: '공유 이미지를 준비하고 있어요.',
        success: (result) =>
          result === 'copied'
            ? '이미지가 클립보드에 복사되었어요.'
            : '클립보드 복사가 지원되지 않아 PNG 파일로 저장했어요.',
        error: '이미지를 만들지 못했어요. 잠시 후 다시 시도해 주세요.',
      })

      await copyPromise
    } catch (error) {
      console.error(error)
    } finally {
      setIsCopying(false)
    }
  }

  return (
    <>
      <header className={styles.App_header}>
        <div className={styles.App_header_nav}>
          <button onClick={handlePrevDay}>이전</button>
        </div>
        <time className={styles.App_header_time}>
          <h2>
            {Intl.DateTimeFormat('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'short',
            }).format(date)}
          </h2>
        </time>
        <div className={styles.App_header_actions}>
          <button
            className={styles.copy_button}
            onClick={handleCopyImage}
            disabled={isCopying || isPending}
            aria-label="이미지로 복사"
            title="이미지로 복사"
          >
            {isCopying ? (
              <LoaderCircle className={styles.copy_icon_spinning} />
            ) : (
              <Copy className={styles.copy_icon} />
            )}
            <span className={styles.sr_only}>이미지로 복사</span>
          </button>
          <button onClick={handleNextDay}>다음</button>
        </div>
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
