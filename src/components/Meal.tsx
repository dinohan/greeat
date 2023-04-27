import React from 'react'
import { useQuery } from 'react-query'
import { getMenus } from '../apis'
import Menu from './Menu/Menu'

import commonStyles from './commonStyles.module.scss'

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

  return (
    <>
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
          />
        ))}
      </ul>
    </>
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
          color="#000"
        />
      ))}
    </ul>
  )
}
