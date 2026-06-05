export interface BowelMovement {
  time: string;
  bristolType: number;
  comfort: number;
  urgency: number;
  hemorrhoids: number;
}
export interface SymptomEvent {
  time: string;
  type: '反流' | '胀气' | '腹痛' | '恶心' | '喉咙异物' | '烧心' | '其他';
  severity: number;
  notes?: string;
}
export interface DailyRecord {
  id?: number;
  date: string;
  breakfastFoods?: string;
  breakfastTime?: string;
  breakfastComfort?: number;
  lunchFoods?: string;
  lunchTime?: string;
  lunchComfort?: number;
  dinnerFoods?: string;
  dinnerTime?: string;
  dinnerComfort?: number;
  snackFoods?: string;
  snackTime?: string;
  snackComfort?: number;
  drink1Type?: string;
  drink1Time?: string;
  drink1Amount?: number;
  drink1Temp?: string;
  drink1Comfort?: number;
  drink2Type?: string;
  drink2Time?: string;
  drink2Amount?: number;
  drink2Temp?: string;
  drink2Comfort?: number;
  bowelMovements?: BowelMovement[];
  symptomEvents?: SymptomEvent[];
  morningFatigue?: number;
  energyMorning?: number;
  energyAfternoon?: number;
  energyEvening?: number;
  whoopRecovery?: number;
  exerciseType?: string;
  exerciseDuration?: number;
  medications?: string;
  phlegm?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
export interface FoodItem {
  id?: number;
  name: string;
  category: string;
  fodmap: string;
  gerd: string;
  ibs: string;
  classification: string;
  tcmDampness?: string;
  tcmGas?: string;
  tcmNature?: string;
  note: string;
  alternatives?: string;
}
