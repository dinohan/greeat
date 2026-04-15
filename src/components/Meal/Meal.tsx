import React from 'react'

import { useQuery } from 'react-query'

import { getMenus } from '@/apis/getMenus'
import { getStatuses } from '@/apis/getStatuses'
import Menu from '@/components/Menu'
import commonStyles from '@/styles/common.module.scss'

const ONE_MINUTE = 1000 * 60

export default function Meal({
  dateString,
  isPending,
}: {
  dateString: string
  isPending: boolean
}) {
  const { data: menus } = useQuery(
    ['menu', dateString],
    () => getMenus(dateString),
    {
      staleTime: 1000 * 60 * 60 * 24,
      suspense: true,
    }
  )
  const { data: statuses } = useQuery(
    ['status', dateString],
    () => getStatuses(dateString),
    {
      refetchInterval: ONE_MINUTE,
      suspense: true,
    }
  )

  const statusMap = new Map(
    statuses
      ?.filter(
        (status) =>
          Number.isFinite(status.current) && Number.isFinite(status.total)
      )
      .map((status) => [status.id, status])
  )

  return (
    <ul
      className={commonStyles.menu_list}
      style={{
        opacity: isPending ? 0.5 : 1,
      }}
    >
      {menus?.map((menu) => (
        <Menu
          key={`${dateString}-${menu.id}`}
          id={menu.id}
          name={menu.name}
          group={menu.group}
          calorie={menu.calorie}
          image={menu.image}
          color={menu.color}
          status={statusMap.get(menu.id)}
        />
      ))}
    </ul>
  )
}

export function MealSkeleton() {
  return (
    <ul
      className={commonStyles.menu_list}
      style={{
        opacity: 0.5,
      }}
    >
      {['G', 'R', 'E'].map((i) => (
        <Menu
          key={i}
          id={i}
          name="메뉴 이름"
          group="그룹"
          calorie={0}
          color="#a1a1aa"
        />
      ))}
    </ul>
  )
}
