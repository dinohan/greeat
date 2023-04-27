import { Menu } from '@/types/Menu'

interface MealsDTO {
  meal_date: string
  weekday_ko: string
  breakfast_menu: string
  number_of_breakfast: number
  bf_main_of_g: string
  bf_number_of_g: number
  bf_main_of_r: string
  bf_number_of_r: number
  bf_main_of_e: string
  bf_number_of_e: number
  main_of_g: string
  group_of_g: string
  main_of_r: string
  group_of_r: string
  main_of_e: string
  group_of_e: string
  number_of_g: number
  number_of_r: number
  number_of_e: number
  sum_of_lunch: number
  bf_calorie_g: number
  bf_calorie_r: number
  bf_calorie_e: number
  calorie_g: number
  calorie_r: number
  calorie_e: number
  bf_image_url_g: string
  bf_image_url_r: string
  bf_image_url_e: string
  image_url_g?: string
  image_url_r?: string
  image_url_e?: string
}

export async function getMeal(dateString: string) {
  const url = `https://api-greeat.52g.gs/meals/${dateString}`
  const resposne = await fetch(url)

  const data = await resposne.json()
  const meal = data?.data?.meal

  return meal as MealsDTO | undefined
}

export async function getMenus(dateString: string) {
  const meal = await getMeal(dateString)

  if (!meal) {
    return []
  }

  const G = {
    name: meal.main_of_g,
    calorie: meal.calorie_g,
    image: meal.image_url_g,
    group: meal.group_of_g,
    id: 'G',
    color: '#FFB71E',
  }

  const R = {
    name: meal.main_of_r,
    calorie: meal.calorie_r,
    image: meal.image_url_r,
    group: meal.group_of_r,
    id: 'R',
    color: '#FF6D2E',
  }

  const E = {
    name: meal.main_of_e,
    calorie: meal.calorie_e,
    image: meal.image_url_e,
    group: meal.group_of_e,
    id: 'E',
    color: '#00CD7C',
  }

  const menus = [G, R, E]

  return menus as Menu[]
}
