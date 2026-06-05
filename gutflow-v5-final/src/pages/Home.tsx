import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/db';

function getMonthData(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  return { startOffset, daysInMonth };
}

export default function Home() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [recordDates, setRecordDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    db.dailyRecords.toArray().then(recs => {
      setRecordDates(new Set(recs.map(r => r.date)));
    });
  }, []);

  const { startOffset, daysInMonth } = getMonthData(year, month);
  const todayStr = today.toISOString().split('T')[0];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setMonth(m => m === 0 ? (setYear(y => y - 1), 11) : m - 1)} className="text-2xl text-[#8E8E93] w-10 h-10">←</button>
        <h1 className="text-lg font-semibold">{year}年{month + 1}月</h1>
        <button onClick={() => setMonth(m => m === 11 ? (setYear(y => y + 1), 0) : m + 1)} className="text-2xl text-[#8E8E93] w-10 h-10">→</button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['一','二','三','四','五','六','日'].map(d => (
          <div key={d} className="text-center text-xs text-[#8E8E93] py-2">周{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startOffset }, (_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const hasRecord = recordDates.has(dateStr);
          const isToday = dateStr === todayStr;
          return (
            <Link key={dateStr} to={`/diary/${dateStr}`}
              className={`relative flex items-center justify-center h-10 rounded-lg text-sm
                ${isToday ? 'bg-[#00D4AA] text-black font-bold' : 'text-white hover:bg-[#1C1C1E]'}`}>
              {day}
              {hasRecord && !isToday && (
                <span className="absolute bottom-1 w-1.5 h-1.5 bg-[#34C759] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>

      <Link to={`/diary/${todayStr}`}
        className="mt-6 block w-full py-3 rounded-2xl text-center font-semibold text-black"
        style={{ background: '#00D4AA' }}>
        记今天
      </Link>
    </div>
  );
}
