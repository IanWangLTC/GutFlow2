import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import type { DailyRecord, BowelMovement, SymptomEvent } from '../lib/types';

interface Props { type: string; date: string; record: DailyRecord | null; onClose: () => void; }

const comfortLabels = ['','很难受','不太舒服','一般','还行','很好'];

export default function EditPanel({ type, date, record, onClose }: Props) {
  const [form, setForm] = useState<Partial<DailyRecord>>({});
  const [newBowel, setNewBowel] = useState<BowelMovement>({ time: '', bristolType: 4, comfort: 3, urgency: 5, hemorrhoids: 0 });
  const [newSymptom, setNewSymptom] = useState<SymptomEvent>({ time: '', type: '反流', severity: 5, notes: '' });

  useEffect(() => {
    if (record) setForm({ ...record });
    else setForm({ date });
  }, [record, date]);

  async function save(data: Partial<DailyRecord>) {
    const existing = await db.dailyRecords.where('date').equals(date).first();
    if (existing) {
      await db.dailyRecords.update(existing.id!, { ...data, updatedAt: new Date().toISOString() });
    } else {
      await db.dailyRecords.add({ ...data, date, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as DailyRecord);
    }
    onClose();
  }

  const timeInput = (label: string, value: string, onChange: (v: string) => void) => (
    <div className="mb-3">
      <label className="text-sm text-[#8E8E93] block mb-1">{label}</label>
      <input type="time" value={value} onChange={e => onChange(e.target.value)} className="w-full" />
    </div>
  );

  const comfortSelect = (value: number | undefined, onChange: (v: number) => void) => (
    <div className="mb-3">
      <label className="text-sm text-[#8E8E93] block mb-1">感受</label>
      <div className="flex gap-2">
        {[1,2,3,4,5].map(n => (
          <button key={n} onClick={() => onChange(n)}
            className={`flex-1 py-2 rounded-lg text-sm border ${value === n ? 'border-[#00D4AA] bg-[#00D4AA]/10 text-[#00D4AA]' : 'border-[#38383A] text-[#8E8E93]'}`}>
            {comfortLabels[n]}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-[#1C1C1E] rounded-t-3xl p-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-1 bg-[#38383A] rounded-full" />
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#2C2C2E] text-[#8E8E93] text-sm">✕</button>
        </div>

        {/* Breakfast / Lunch / Dinner / Snack */}
        {(type === 'breakfast' || type === 'lunch' || type === 'dinner' || type === 'snack') && (
          <>
            <h2 className="text-lg font-semibold mb-4">{type === 'breakfast' ? '早餐' : type === 'lunch' ? '午餐' : type === 'dinner' ? '晚餐' : '加餐/零食'}</h2>
            {timeInput('时间', (type === 'breakfast' ? form.breakfastTime : type === 'lunch' ? form.lunchTime : type === 'dinner' ? form.dinnerTime : form.snackTime) || '', v => {
              const key = type === 'breakfast' ? 'breakfastTime' : type === 'lunch' ? 'lunchTime' : type === 'dinner' ? 'dinnerTime' : 'snackTime';
              setForm({ ...form, [key]: v });
            })}
            <div className="mb-3">
              <label className="text-sm text-[#8E8E93] block mb-1">食物（逗号分隔）</label>
              <textarea
                value={(type === 'breakfast' ? form.breakfastFoods : type === 'lunch' ? form.lunchFoods : type === 'dinner' ? form.dinnerFoods : form.snackFoods) || ''}
                onChange={e => {
                  const key = type === 'breakfast' ? 'breakfastFoods' : type === 'lunch' ? 'lunchFoods' : type === 'dinner' ? 'dinnerFoods' : 'snackFoods';
                  setForm({ ...form, [key]: e.target.value });
                }}
                placeholder="米饭 鸡胸肉 西兰花（空格/逗号/换行均可分隔）"
                rows={2}
                className="w-full"
              />
            </div>
            {comfortSelect(
              type === 'breakfast' ? form.breakfastComfort : type === 'lunch' ? form.lunchComfort : type === 'dinner' ? form.dinnerComfort : form.snackComfort,
              v => {
                const key = type === 'breakfast' ? 'breakfastComfort' : type === 'lunch' ? 'lunchComfort' : type === 'dinner' ? 'dinnerComfort' : 'snackComfort';
                setForm({ ...form, [key]: v });
              }
            )}
            <button onClick={() => save(form)} className="w-full py-3 rounded-xl bg-[#00D4AA] text-black font-semibold">保存</button>
          </>
        )}

        {/* Drink */}
        {(type === 'drink1' || type === 'drink2') && (
          <>
            <h2 className="text-lg font-semibold mb-4">{type === 'drink1' ? '饮料1' : '饮料2'}</h2>
            {timeInput('时间', (type === 'drink1' ? form.drink1Time : form.drink2Time) || '', v => {
              const key = type === 'drink1' ? 'drink1Time' : 'drink2Time';
              setForm({ ...form, [key]: v });
            })}
            <div className="mb-3">
              <label className="text-sm text-[#8E8E93] block mb-1">类型</label>
              <select value={(type === 'drink1' ? form.drink1Type : form.drink2Type) || ''} onChange={e => {
                const key = type === 'drink1' ? 'drink1Type' : 'drink2Type';
                setForm({ ...form, [key]: e.target.value });
              }} className="w-full">
                <option value="">选择</option>
                <option>茶</option><option>咖啡</option><option>奶茶</option>
                <option>水</option><option>气泡水</option><option>酒</option><option>其他</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="text-sm text-[#8E8E93] block mb-1">量 (ml)</label>
              <input type="number" value={(type === 'drink1' ? form.drink1Amount : form.drink2Amount) || ''} onChange={e => {
                const key = type === 'drink1' ? 'drink1Amount' : 'drink2Amount';
                setForm({ ...form, [key]: Number(e.target.value) });
              }} placeholder="250" className="w-full" />
            </div>
            <div className="mb-3">
              <label className="text-sm text-[#8E8E93] block mb-1">温度</label>
              <div className="flex gap-2">
                {['冰','常温','热'].map(t => (
                  <button key={t} onClick={() => {
                    const key = type === 'drink1' ? 'drink1Temp' : 'drink2Temp';
                    setForm({ ...form, [key]: t });
                  }} className={`flex-1 py-2 rounded-lg text-sm border ${(type === 'drink1' ? form.drink1Temp : form.drink2Temp) === t ? 'border-[#00D4AA] bg-[#00D4AA]/10' : 'border-[#38383A]'}`}>{t}</button>
                ))}
              </div>
            </div>
            {comfortSelect(type === 'drink1' ? form.drink1Comfort : form.drink2Comfort, v => {
              const key = type === 'drink1' ? 'drink1Comfort' : 'drink2Comfort';
              setForm({ ...form, [key]: v });
            })}
            <button onClick={() => save(form)} className="w-full py-3 rounded-xl bg-[#00D4AA] text-black font-semibold">保存</button>
          </>
        )}

        {/* Bowel */}
        {type === 'bowel' && (
          <>
            <h2 className="text-lg font-semibold mb-4">大便记录</h2>
            {form.bowelMovements && form.bowelMovements.length > 0 && (
              <div className="mb-4">
                <div className="text-sm text-[#8E8E93] mb-2">已记录:</div>
                {form.bowelMovements.map((bm, i) => (
                  <div key={i} className="flex items-center justify-between bg-[#2C2C2E] rounded-lg p-2 mb-2">
                    <span className="text-sm">{bm.time} · Bristol {bm.bristolType}</span>
                    <button onClick={() => {
                      const updated = [...(form.bowelMovements || [])];
                      updated.splice(i, 1);
                      setForm({ ...form, bowelMovements: updated });
                    }} className="text-[#FF3B30] text-sm">删除</button>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-[#38383A] pt-4">
              <div className="text-sm text-[#8E8E93] mb-3">新增:</div>
              {timeInput('时间', newBowel.time, v => setNewBowel({ ...newBowel, time: v }))}
              <div className="mb-3">
                <label className="text-sm text-[#8E8E93] block mb-1">Bristol (1-7)</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5,6,7].map(n => (
                    <button key={n} onClick={() => setNewBowel({ ...newBowel, bristolType: n })}
                      className={`w-10 h-10 rounded-lg text-sm border ${newBowel.bristolType === n ? 'border-[#00D4AA] bg-[#00D4AA]/10 text-[#00D4AA]' : 'border-[#38383A]'}`}>{n}</button>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <label className="text-sm text-[#8E8E93] block mb-1">感受 1-5</label>
                <input type="range" min={1} max={5} value={newBowel.comfort} onChange={e => setNewBowel({ ...newBowel, comfort: Number(e.target.value) })} className="w-full" />
              </div>
              <div className="mb-3">
                <label className="text-sm text-[#8E8E93] block mb-1">急迫感 0-10</label>
                <input type="range" min={0} max={10} value={newBowel.urgency} onChange={e => setNewBowel({ ...newBowel, urgency: Number(e.target.value) })} className="w-full" />
              </div>
              <button onClick={() => {
                if (!newBowel.time) return;
                const updated = [...(form.bowelMovements || []), newBowel];
                setForm({ ...form, bowelMovements: updated });
                setNewBowel({ time: '', bristolType: 4, comfort: 3, urgency: 5, hemorrhoids: 0 });
              }} className="w-full py-2 rounded-lg border border-[#00D4AA] text-[#00D4AA] mb-4">+ 添加</button>
            </div>
            <button onClick={() => save(form)} className="w-full py-3 rounded-xl bg-[#00D4AA] text-black font-semibold">保存</button>
          </>
        )}

        {/* Symptom */}
        {type === 'symptom' && (
          <>
            <h2 className="text-lg font-semibold mb-4">症状记录</h2>
            {form.symptomEvents && form.symptomEvents.length > 0 && (
              <div className="mb-4">
                <div className="text-sm text-[#8E8E93] mb-2">已记录:</div>
                {form.symptomEvents.map((se, i) => (
                  <div key={i} className="flex items-center justify-between bg-[#2C2C2E] rounded-lg p-2 mb-2">
                    <span className="text-sm">{se.time} · {se.type} {se.severity}/10</span>
                    <button onClick={() => {
                      const updated = [...(form.symptomEvents || [])];
                      updated.splice(i, 1);
                      setForm({ ...form, symptomEvents: updated });
                    }} className="text-[#FF3B30] text-sm">删除</button>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-[#38383A] pt-4">
              <div className="text-sm text-[#8E8E93] mb-3">新增:</div>
              {timeInput('时间', newSymptom.time, v => setNewSymptom({ ...newSymptom, time: v }))}
              <div className="mb-3">
                <label className="text-sm text-[#8E8E93] block mb-1">类型</label>
                <select value={newSymptom.type} onChange={e => setNewSymptom({ ...newSymptom, type: e.target.value as any })} className="w-full">
                  {['反流','胀气','腹痛','恶心','喉咙异物','烧心','其他'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="text-sm text-[#8E8E93] block mb-1">严重程度 0-10</label>
                <input type="range" min={0} max={10} value={newSymptom.severity} onChange={e => setNewSymptom({ ...newSymptom, severity: Number(e.target.value) })} className="w-full" />
              </div>
              <div className="mb-3">
                <label className="text-sm text-[#8E8E93] block mb-1">备注</label>
                <input value={newSymptom.notes || ''} onChange={e => setNewSymptom({ ...newSymptom, notes: e.target.value })} placeholder="可选" className="w-full" />
              </div>
              <button onClick={() => {
                if (!newSymptom.time) return;
                const updated = [...(form.symptomEvents || []), newSymptom];
                setForm({ ...form, symptomEvents: updated });
                setNewSymptom({ time: '', type: '反流', severity: 5, notes: '' });
              }} className="w-full py-2 rounded-lg border border-[#00D4AA] text-[#00D4AA] mb-4">+ 添加</button>
            </div>
            <button onClick={() => save(form)} className="w-full py-3 rounded-xl bg-[#00D4AA] text-black font-semibold">保存</button>
          </>
        )}

        {/* Daily */}
        {type === 'daily' && (
          <>
            <h2 className="text-lg font-semibold mb-4">每日综合</h2>
            {[
              { label: '晨疲 0-10', key: 'morningFatigue', min: 0, max: 10 },
              { label: '精力-早上 1-10', key: 'energyMorning', min: 1, max: 10 },
              { label: '精力-中午 1-10', key: 'energyAfternoon', min: 1, max: 10 },
              { label: '精力-晚上 1-10', key: 'energyEvening', min: 1, max: 10 },
              { label: 'WHOOP Recovery 0-100', key: 'whoopRecovery', min: 0, max: 100 },
              { label: '痰量 0-10', key: 'phlegm', min: 0, max: 10 },
            ].map(({ label, key, min, max }) => (
              <div className="mb-3" key={key}>
                <label className="text-sm text-[#8E8E93] block mb-1">{label}: {(form as any)[key] || 0}</label>
                <input type="range" min={min} max={max} value={(form as any)[key] || min}
                  onChange={e => setForm({ ...form, [key]: Number(e.target.value) })} className="w-full" />
              </div>
            ))}
            <div className="mb-3">
              <label className="text-sm text-[#8E8E93] block mb-1">运动类型</label>
              <input value={form.exerciseType || ''} onChange={e => setForm({ ...form, exerciseType: e.target.value })} placeholder="散步/慢跑/游泳" className="w-full" />
            </div>
            <div className="mb-3">
              <label className="text-sm text-[#8E8E93] block mb-1">运动时长(分钟)</label>
              <input type="number" value={form.exerciseDuration || ''} onChange={e => setForm({ ...form, exerciseDuration: Number(e.target.value) })} className="w-full" />
            </div>
            <div className="mb-3">
              <label className="text-sm text-[#8E8E93] block mb-1">药物</label>
              <input value={form.medications || ''} onChange={e => setForm({ ...form, medications: e.target.value })} placeholder="益生菌, 达喜" className="w-full" />
            </div>
            <div className="mb-3">
              <label className="text-sm text-[#8E8E93] block mb-1">备注</label>
              <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} className="w-