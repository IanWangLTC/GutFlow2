import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/db';
import type { DailyRecord } from '../lib/types';

export default function Dashboard() {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    db.dailyRecords.orderBy('date').reverse().limit(7).toArray().then(setRecords);
  }, []);

  const todayRecord = useMemo(() => records.find(r => r.date === today), [records, today]);
  const recent3 = useMemo(() => records.slice(0, 3), [records]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 6) return '夜深了';
    if (h < 11) return '早上好';
    if (h < 14) return '中午好';
    if (h < 18) return '下午好';
    return '晚上好';
  }, []);

  // Symptom trend for last 7 days (CSS bar chart)
  const symptomBars = useMemo(() => {
    return [...records].reverse().map(r => {
      const count = r.symptomEvents?.length || 0;
      let color = '#38383A';
      if (count >= 3) color = '#FF3B30';
      else if (count >= 1) color = '#FF9500';
      return { date: r.date.slice(5), count, color };
    });
  }, [records]);

  // Warnings
  const warnings = useMemo(() => {
    const w: string[] = [];
    const last3 = records.slice(0, 3);
    const refluxDays = last3.filter(r => r.symptomEvents?.some(s => s.type === '反流' && s.severity >= 5));
    if (refluxDays.length >= 3) w.push('连续3天出现较严重反流，建议回顾近期饮食');
    const badBristol = last3.filter(r => r.bowelMovements?.some(b => b.bristolType >= 6));
    if (badBristol.length >= 2) w.push('连续腹泻，注意补水和电解质');
    if (todayRecord?.symptomEvents?.some(s => s.severity >= 7)) w.push('今日症状较重，建议休息');
    return w;
  }, [records, todayRecord]);

  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  return (
    <div className="p-4">
      {/* Greeting */}
      <div className="mb-4">
        <h1 className="text-xl font-bold">{greeting}</h1>
        <p className="text-sm text-[#8E8E93]">{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}</p>
      </div>

      {/* Today overview */}
      <div className="bg-[#1C1C1E] rounded-2xl p-4 mb-4">
        <div className="text-sm text-[#8E8E93] mb-2">今日概览</div>
        {todayRecord ? (
          <div className="flex gap-4 text-center">
            <div className="flex-1">
              <div className="text-2xl font-bold text-[#00D4AA]">{[todayRecord.breakfastFoods, todayRecord.lunchFoods, todayRecord.dinnerFoods].filter(Boolean).length}</div>
              <div className="text-xs text-[#8E8E93]">已记录餐</div>
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold" style={{ color: todayRecord.symptomEvents && todayRecord.symptomEvents.length > 0 ? '#FF9500' : '#34C759' }}>{todayRecord.symptomEvents?.length || 0}</div>
              <div className="text-xs text-[#8E8E93]">症状事件</div>
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-[#00D4AA]">{todayRecord.bowelMovements?.length || 0}</div>
              <div className="text-xs text-[#8E8E93]">排便</div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-[#636366]">今天还没有记录</div>
        )}
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mb-4">
          {warnings.map((w, i) => (
            <div key={i} className="bg-[#FF3B30]/10 border border-[#FF3B30]/30 rounded-xl p-3 mb-2 text-sm text-[#FF3B30]">
              {w}
            </div>
          ))}
        </div>
      )}

      {/* Symptom trend (7 days) */}
      <div className="bg-[#1C1C1E] rounded-2xl p-4 mb-4">
        <div className="text-sm text-[#8E8E93] mb-3">近7天症状趋势</div>
        <div className="flex items-end gap-2 h-24">
          {symptomBars.map((bar, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end">
              <div className="w-full rounded-t" style={{ height: `${Math.max(bar.count * 8 + 4, 4)}px`, background: bar.color }} />
              <div className="text-[10px] text-[#636366] mt-1">{bar.date}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent 3 days summary */}
      <div className="mb-4">
        <div className="text-sm text-[#8E8E93] mb-2">最近记录</div>
        {recent3.map(r => {
          const d = new Date(r.date + 'T12:00:00');
          const label = `${d.getMonth() + 1}/${d.getDate()} ${weekdays[d.getDay()]}`;
          const mainSymptom = r.symptomEvents?.[0];
          const bristol = r.bowelMovements?.[0];
          return (
            <Link key={r.date} to={`/diary/${r.date}`} className="block bg-[#1C1C1E] rounded-2xl p-3 mb-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs text-[#8E8E93]">{r.breakfastFoods?.split(/[,，、\s]+/)[0] || '...'}</span>
              </div>
              <div className="flex gap-2 mt-1 text-xs text-[#8E8E93]">
                {bristol && <span>Bristol {bristol.bristolType}</span>}
                {mainSymptom && <span style={{ color: mainSymptom.severity >= 6 ? '#FF3B30' : '#FF9500' }}>{mainSymptom.type} {mainSymptom.severity}/10</span>}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick record */}
      <Link to={`/diary/${today}`} className="block w-full py-3 rounded-2xl text-center font-semibold text-black bg-[#00D4AA]">
        记今天
      </Link>
    </div>
  );
}
