import React, { Suspense, useDeferredValue } from 'react'
import { useQueries, useQuery } from 'react-query';
import { Menu as TMenu, getMenus, getStatuses } from '../apis';
import Menu from './Menu';
import Status, { StatusSkeleton } from './Status';

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
    },
  )

  return (
    <>
      <ul className="menu_list" style={{
        opacity: isPending ? 0.5 : 1,
      }}>
        { menus?.map((menu) => (
          <Menu
            key={`${dateString}-${menu.id}`}
            id={menu.id}
            name={menu.name}
            group={menu.group}
            calorie={menu.calorie}
            image={menu.image}
          />
        )) }
      </ul>
    </>
  )
}

export function MealSkeleton() {
  return (
      <ul className="menu_list" style={{
        opacity: 0.5,
      }}>
        { ['G', 'R', 'E' ].map((i) => (
          <Menu
            key={i}
            id={i}
            name="메뉴 이름"
            group="그룹"
            calorie={0}
          />
        )) }
      </ul>
  )
}