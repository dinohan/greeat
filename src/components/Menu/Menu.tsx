import React from 'react'

import styles from './Menu.module.scss'
import commonStyles from '../commonStyles.module.scss'
import classNames from 'classnames'

export default function Menu({
  id,
  name,
  group,
  calorie,
  image,
  color,
}: {
  id: string
  name: string
  group: string
  calorie: number
  image?: string
  color: string
}) {
  return (
    <li
      className={classNames([
        styles.menu_wrapper,
        commonStyles.list_item_wrapper,
      ])}
    >
      <h2 className={styles.menu_name}>{name}</h2>
      <div className={styles.menu_image_wrapper}>
        {image ? (
          <img
            src={image}
            alt={name}
          />
        ) : (
          <div className={styles.no_image} />
        )}
        <div
          className={styles.menu_id}
          style={{
            backgroundColor: `${color}88`,
          }}
        >
          {id}{' '}
        </div>
      </div>
      <div className={styles.menu_description}>
        <div>{group}</div>
        <div>{calorie} kcal</div>
      </div>
    </li>
  )
}
