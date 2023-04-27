import { Status } from '../types/Status'

interface StatusDTO {
  bf_number_of_meals: {
    g: number | null
    r: number
    e: number
  }
  number_of_meals: {
    g: number
    r: number
    e: number
  }
  bf_number_of_meals_by_manager: {
    g: number | null
    r: number
    e: number | null
  }
  number_of_meals_by_manager: {
    g: number
    r: number
    e: number
  }
  number_of_meals_by_ml: {
    g: number | null
    r: number | null
    e: number | null
  }
}

export async function getDailyMealStatus(dateString: string) {
  const url = `https://api-greeat.52g.gs/status/date/${dateString}`
  const resposne = await fetch(url)
  const data = await resposne.json()
  const dailyMealStatus = data.data.daily_meal_status

  return dailyMealStatus as StatusDTO
}

export async function getStatuses(dateString: string) {
  const dailyMealStatus = await getDailyMealStatus(dateString)

  const G = {
    id: 'G',
    total: dailyMealStatus.number_of_meals_by_manager.g,
    current: dailyMealStatus.number_of_meals.g,
  }

  const R = {
    id: 'R',
    total: dailyMealStatus.number_of_meals_by_manager.r,
    current: dailyMealStatus.number_of_meals.r,
  }

  const E = {
    id: 'E',
    total: dailyMealStatus.number_of_meals_by_manager.e,
    current: dailyMealStatus.number_of_meals.e,
  }

  const statuses = [G, R, E]

  return statuses as Status[]
}
