import React, { Suspense, useDeferredValue, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  LoaderCircle,
} from 'lucide-react'
import { toast } from 'sonner'

import { getMenus } from '@/apis/getMenus'
import { getStatuses } from '@/apis/getStatuses'
import Meal, { MealSkeleton } from '@/components/Meal'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import styles from './App.module.scss'

function getLandingDate() {
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
}

function formatDateLabel(date: Date, referenceYear: number) {
  const weekday = Intl.DateTimeFormat('ko-KR', {
    weekday: 'short',
  }).format(date)
  const yearLabel =
    date.getFullYear() === referenceYear ? '' : `${date.getFullYear()}년 `

  return `${yearLabel}${date.getMonth() + 1}월 ${date.getDate()}일 (${weekday})`
}

function App() {
  const [landingDate] = useState(() => getLandingDate())
  const [isCopying, setIsCopying] = useState(false)
  const [date, setDate] = useState(() => new Date(landingDate))

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
  const formattedDate = formatDateLabel(date, landingDate.getFullYear())

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

  const handleResetDate = () => {
    setDate(new Date(landingDate))
  }

  return (
    <TooltipProvider delayDuration={120}>
      <header className={styles.App_header}>
        <div
          className={styles.App_header_spacer}
          aria-hidden="true"
        />
        <div className={styles.App_header_date_group}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevDay}
                aria-label="이전 날짜"
              >
                <ChevronLeft className={styles.nav_icon} />
                <span className={styles.sr_only}>이전</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>이전 날짜</TooltipContent>
          </Tooltip>
          <time
            className={styles.App_header_time}
            dateTime={date.toISOString().slice(0, 10)}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className={styles.date_button}
                  onClick={handleResetDate}
                  aria-label="오늘로 이동"
                >
                  <span className={styles.date_button_text}>{formattedDate}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>오늘로 이동</TooltipContent>
            </Tooltip>
          </time>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextDay}
                aria-label="다음 날짜"
              >
                <ChevronRight className={styles.nav_icon} />
                <span className={styles.sr_only}>다음</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>다음 날짜</TooltipContent>
          </Tooltip>
        </div>
        <div className={styles.App_header_actions}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyImage}
                disabled={isCopying || isPending}
                aria-label="이미지로 복사"
              >
                {isCopying ? (
                  <LoaderCircle className={styles.copy_icon_spinning} />
                ) : (
                  <Copy className={styles.copy_icon} />
                )}
                <span className={styles.sr_only}>이미지로 복사</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>이미지로 복사</TooltipContent>
          </Tooltip>
        </div>
      </header>

      <main className={styles.App_main}>
        <Suspense fallback={<MealSkeleton />}>
          <Meal
            dateString={deferredDateString}
            isPending={isPending}
          />
        </Suspense>
      </main>
    </TooltipProvider>
  )
}

export default App
