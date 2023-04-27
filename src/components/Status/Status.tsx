import React from 'react'
import { useQuery } from 'react-query'
import classNames from 'classnames'

import { getStatuses } from '@/apis/getStatuses'
import commonStyles from '@/styles/common.module.scss'
import styles from './Status.module.scss'

const ONE_MINUTE = 1000 * 60

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

  if (!statuses?.every((status) => !!status.current && !!status.total)) {
    return <StatusSkeleton />
  }

  return (
    <ul
      className={commonStyles.menu_list}
      style={{
        opacity: isPending ? 0.5 : 1,
      }}
    >
      {statuses?.map((status) => (
        <li
          key={status.id}
          className={classNames([
            commonStyles.list_item_wrapper,
            styles.status_wrapper,
          ])}
        >
          <progress
            value={status.current}
            max={status.total}
          />
          <span className={styles.status_number}>
            {status.current} / {status.total}
          </span>
        </li>
      ))}
    </ul>
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
          <progress
            value={0}
            max={100}
          />
          <span className={styles.status_number}>-- / --</span>
        </li>
      ))}
    </ul>
  )
}
