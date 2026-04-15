import React from 'react'

import classNames from 'classnames'
import { useQuery } from 'react-query'

import { getStatuses } from '@/apis/getStatuses'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import commonStyles from '@/styles/common.module.scss'
import { Status as StatusType } from '@/types/Status'

import styles from './Status.module.scss'

const ONE_MINUTE = 1000 * 60
const STATUS_COLORS = {
  G: '#FFB71E',
  R: '#FF6D2E',
  E: '#00CD7C',
} as const

export default function Status({
  dateString,
  isPending,
}: {
  dateString: string
  isPending: boolean
}) {
  const { data: statuses } = useQuery(
    ['status', dateString],
    () => getStatuses(dateString),
    {
      refetchInterval: ONE_MINUTE,
      suspense: true,
    }
  )

  if (
    !statuses?.every(
      (status) =>
        Number.isFinite(status.current) && Number.isFinite(status.total)
    )
  ) {
    return <StatusSkeleton />
  }

  return (
    <TooltipProvider delayDuration={120}>
      <ul
        className={commonStyles.menu_list}
        style={{
          opacity: isPending ? 0.5 : 1,
        }}
      >
        {statuses?.map((status) => {
          const value = getProgressValue(status)
          const color = STATUS_COLORS[status.id] ?? '#57534e'

          return (
            <li
              key={status.id}
              className={classNames([
                commonStyles.list_item_wrapper,
                styles.status_wrapper,
              ])}
            >
              <div className={styles.status_header}>
                <span
                  className={styles.status_badge}
                  style={{ backgroundColor: color }}
                >
                  {status.id}
                </span>
                <span className={styles.status_number}>
                  {status.current} / {status.total}
                </span>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={styles.progress_trigger}
                    data-status-progress={status.id}
                    aria-label={`${status.id} 식수 진행률`}
                    tabIndex={0}
                  >
                    <Progress
                      value={value}
                      style={
                        {
                          '--progress-color': color,
                        } as React.CSSProperties
                      }
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className={styles.tooltip_body}>
                    <span className={styles.tooltip_label}>
                      먹어버린 / 준비한
                    </span>
                    <strong className={styles.tooltip_value}>
                      {status.current} / {status.total}
                    </strong>
                  </div>
                </TooltipContent>
              </Tooltip>
            </li>
          )
        })}
      </ul>
    </TooltipProvider>
  )
}

export function StatusSkeleton() {
  return (
    <ul
      className={commonStyles.menu_list}
      style={{ opacity: 0.5 }}
    >
      {['G', 'R', 'E'].map((i) => (
        <li
          key={i}
          className={classNames([
            commonStyles.list_item_wrapper,
            styles.status_wrapper,
          ])}
        >
          <div className={styles.status_header}>
            <span className={styles.status_badge}>{i}</span>
            <span className={styles.status_number}>-- / --</span>
          </div>
          <div className={styles.progress_trigger}>
            <Progress value={0} />
          </div>
        </li>
      ))}
    </ul>
  )
}

function getProgressValue(status: StatusType) {
  if (!status.total) {
    return 0
  }

  return Math.max(0, Math.min(100, (status.current / status.total) * 100))
}
