import Dexie from 'dexie';
import type { DailyRecord, FoodItem } from './types';

class GutFlowDB extends Dexie {
  dailyRecords!: Dexie.Table<DailyRecord, number>;
  foods!: Dexie.Table<FoodItem, number>;
  constructor() {
    super('gutflow-v4');
    this.version(1).stores({
      dailyRecords: '++id, date',
      foods: '++id, name, category, classification',
    });
  }
}
export const db = new GutFlowDB();
