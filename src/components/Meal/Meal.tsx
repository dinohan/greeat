import React from 'react'

import { useQuery } from 'react-query'

import { getMenus } from '@/apis/getMenus'
import { getStatuses } from '@/apis/getStatuses'
import Menu from '@/components/Menu'
import commonStyles from '@/styles/common.module.scss'
import { Menu as MenuType } from '@/types/Menu'

const ONE_MINUTE = 1000 * 60
const DEFAULT_MENUS: MenuType[] = [
  {
    id: 'G',
    name: '메뉴 정보 없음',
    group: '-',
    calorie: 0,
    color: '#FFB71E',
  },
  {
    id: 'R',
    name: '메뉴 정보 없음',
    group: '-',
    calorie: 0,
    color: '#FF6D2E',
  },
  {
    id: 'E',
    name: '메뉴 정보 없음',
    group: '-',
    calorie: 0,
    color: '#00CD7C',
  },
]

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
  const visibleMenus = menus?.length ? menus : DEFAULT_MENUS

  return (
    <ul
      className={commonStyles.menu_list}
      style={{
        opacity: isPending ? 0.5 : 1,
      }}
    >
      {visibleMenus.map((menu) => (
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
