import * as XLSX from 'xlsx';
import { db } from './db';

export async function exportToExcel() {
  const records = await db.dailyRecords.toArray();
  const rows = records.map(r => ({
    '日期': r.date,
    '早餐': r.breakfastFoods || '',
    '早餐时间': r.breakfastTime || '',
    '午餐': r.lunchFoods || '',
    '午餐时间': r.lunchTime || '',
    '晚餐': r.dinnerFoods || '',
    '晚餐时间': r.dinnerTime || '',
    '加餐/零食': r.snackFoods || '',
    '加餐时间': r.snackTime || '',
    '饮料1': r.drink1Type || '',
    '饮料1时间': r.drink1Time || '',
    '饮料1量(ml)': r.drink1Amount || '',
    '饮料2': r.drink2Type || '',
    '饮料2时间': r.drink2Time || '',
    '饮料2量(ml)': r.drink2Amount || '',
    'WHOOP recovery': r.whoopRecovery || '',
    '喉咙异物感': r.phlegm || '',
    'IBS胀气': '',
    '运动': r.exerciseType || '',
    '反流次数': r.symptomEvents?.filter(s => s.type === '反流').length || '',
    '排便急迫感': r.bowelMovements?.map(b => b.urgency).join(', ') || '',
    '排气情况': '',
    '排便次数': r.bowelMovements?.length || '',
    '大便Bristol': r.bowelMovements?.map(b => b.bristolType).join(', ') || '',
    '排便感受': r.bowelMovements?.map(b => b.comfort).join(', ') || '',
    '痔疮': r.bowelMovements?.map(b => b.hemorrhoids).join(', ') || '',
    '药物': r.medications || '',
    '备注': r.notes || '',
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'GutFlow记录');
  XLSX.writeFile(wb, `gutflow-export-${new Date().toISOString().split('T')[0]}.xlsx`);
}

export async function exportToCSV() {
  const records = await db.dailyRecords.toArray();
  const rows = records.map(r => ({
    date: r.date,
    breakfast: r.breakfastFoods || '',
    lunch: r.lunchFoods || '',
    dinner: r.dinnerFoods || '',
    symptoms: r.symptomEvents?.map(s => `${s.type}(${s.severity})`).join('; ') || '',
    bristol: r.bowelMovements?.map(b => b.bristolType).join(', ') || '',
    notes: r.notes || '',
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gutflow-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importFromExcel(file: File): Promise<number> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
      if (json.length < 2) { resolve(0); return; }
      const headers = json[0].map(h => String(h).trim());
      let imported = 0;
      for (let i = 1; i < json.length; i++) {
        const row = json[i];
        const get = (name: string) => {
          const idx = headers.indexOf(name);
          return idx >= 0 && row[idx] != null ? String(row[idx]) : '';
        };
        const getN = (name: string) => {
          const v = get(name);
          return v ? Number(v) : undefined;
        };
        const date = get('日期');
        if (!date) continue;
        await db.dailyRecords.put({
          date,
          breakfastFoods: get('早餐') || undefined,
          breakfastTime: get('早餐时间') || undefined,
          lunchFoods: get('午餐') || undefined,
          lunchTime: get('午餐时间') || undefined,
          dinnerFoods: get('晚餐') || undefined,
          dinnerTime: get('晚餐时间') || undefined,
          snackFoods: get('加餐/零食') || undefined,
          drink1Type: get('饮料1') || undefined,
          drink1Time: get('饮料1时间') || undefined,
          drink1Amount: getN('饮料1量(ml)'),
          drink2Type: get('饮料2') || undefined,
          medications: get('药物') || undefined,
          notes: get('备注') || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as any);
        imported++;
      }
      resolve(imported);
    };
    reader.readAsArrayBuffer(file);
  });
}
