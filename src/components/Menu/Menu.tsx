import React from 'react'

import classNames from 'classnames'

import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import commonStyles from '@/styles/common.module.scss'
import { Status } from '@/types/Status'

import styles from './Menu.module.scss'

export default function Menu({
  id,
  name,
  group,
  calorie,
  image,
  color,
  status,
}: {
  id: string
  name: string
  group: string
  calorie: number
  image?: string
  color: string
  status?: Status
}) {
  const current =
    status && Number.isFinite(status.current) ? status.current : undefined
  const total = status && Number.isFinite(status.total) ? status.total : undefined
  const progressValue =
    current !== undefined && total !== undefined && total > 0
      ? Math.max(0, Math.min(100, (current / total) * 100))
      : 0

  return (
    <li
      className={classNames([
        styles.menu_wrapper,
        commonStyles.list_item_wrapper,
      ])}
    >
      <Card
        size="sm"
        className={styles.menu_card}
      >
        <div className={styles.menu_image_wrapper}>
          {image ? (
            <img
              src={image}
              alt={name}
            />
          ) : (
            <div className={styles.no_image} />
          )}
        </div>
        <CardHeader className={styles.menu_header}>
          <div className={styles.menu_heading}>
            <span
              className={styles.menu_badge}
              style={{ backgroundColor: color }}
            >
              {id}
            </span>
            <CardTitle className={styles.menu_name}>{name}</CardTitle>
          </div>
        </CardHeader>
        <CardFooter className={styles.menu_footer}>
          <div className={styles.meta_row}>
            <span className={styles.meta_chip}>
              <span className={styles.meta_label}>분류</span>
              <strong className={styles.meta_value}>{group}</strong>
            </span>
            <span className={styles.meta_chip}>
              <span className={styles.meta_label}>열량</span>
              <strong className={styles.meta_value}>{calorie} kcal</strong>
            </span>
          </div>

          <div className={styles.status_section}>
            <div className={styles.status_row}>
              <span className={styles.status_label}>식수</span>
              <strong className={styles.status_value}>
                {current ?? '--'} / {total ?? '--'}
              </strong>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={styles.progress_trigger}
                  aria-label={`${id} 식수 진행률`}
                  tabIndex={0}
                >
                  <Progress
                    value={progressValue}
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
                    {current ?? '--'} / {total ?? '--'}
                  </strong>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardFooter>
      </Card>
    </li>
  )
}
