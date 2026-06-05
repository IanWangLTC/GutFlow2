import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { db } from '../lib/db';
import type { DailyRecord } from '../lib/types';
import EditPanel from '../components/EditPanel';

const emojis = ['','😫','😕','😐','🙂','😊'];

export default function DiaryPage() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<DailyRecord | null>(null);
  const [editType, setEditType] = useState<string | null>(null);

  const currentDate = date === 'today' ? new Date().toISOString().split('T')[0] : (date || '');

  useEffect(() => {
    loadRecord();
  }, [currentDate]);

  async function loadRecord() {
    if (!currentDate) return;
    const r = await db.dailyRecords.where('date').equals(currentDate).first();
    setRecord(r || null);
  }

  function prevDay() {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    navigate(`/diary/${d.toISOString().split('T')[0]}`);
  }
  function nextDay() {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    navigate(`/diary/${d.toISOString().split('T')[0]}`);
  }

  const d = new Date(currentDate);
  const weekdays = ['周日','周一','周二','周三','周四','周五','周六'];
  const dateLabel = `${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`;

  // Helper to render meal section
  function MealSection({ title, icon, foods, time, comfort, type }: { title: string; icon: string; foods?: string; time?: string; comfort?: number; type: string }) {
    const hasData = foods || time;
    return (
      <div onClick={() => setEditType(type)} className="bg-[#1C1C1E] rounded-2xl p-4 mb-3 cursor-pointer">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-sm text-[#8E8E93]">
            <span>{icon}</span>
            <span>{title}</span>
          </div>
          {time && <span className="text-xs text-[#8E8E93]">{time}</span>}
          {!hasData && <Plus size={16} className="text-[#00D4AA]" />}
        </div>
        {hasData ? (
          <>
            <div className="text-sm">{foods}</div>
            {comfort && <div className="text-xs text-[#8E8E93] mt-1">感受: {emojis[comfort] || comfort}</div>}
          </>
        ) : (
          <div className="text-sm text-[#636366]">(未记录)</div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link to="/" className="text-[#8E8E93]">←</Link>
        <div className="flex items-center gap-4">
          <button onClick={prevDay} className="text-[#8E8E93] w-8 h-8">←</button>
          <h1 className="text-lg font-semibold">{dateLabel}</h1>
          <button onClick={nextDay} className="text-[#8E8E93] w-8 h-8">→</button>
        </div>
        <div />
      </div>

      {/* Meal sections */}
      <MealSection title="早餐" icon="🍽" type="breakfast" foods={record?.breakfastFoods} time={record?.breakfastTime} comfort={record?.breakfastComfort} />
      <MealSection title="饮料1" icon="🥤" type="drink1" foods={record?.drink1Type ? `${record.drink1Type} ${record.drink1Amount || ''}ml ${record.drink1Temp || ''}` : ''} time={record?.drink1Time} comfort={record?.drink1Comfort} />
      <MealSection title="午餐" icon="🍽" type="lunch" foods={record?.lunchFoods} time={record?.lunchTime} comfort={record?.lunchComfort} />
      <MealSection title="饮料2" icon="🥤" type="drink2" foods={record?.drink2Type ? `${record.drink2Type} ${record.drink2Amount || ''}ml ${record.drink2Temp || ''}` : ''} time={record?.drink2Time} comfort={record?.drink2Comfort} />
      <MealSection title="晚餐" icon="🍽" type="dinner" foods={record?.dinnerFoods} time={record?.dinnerTime} comfort={record?.dinnerComfort} />
      <MealSection title="加餐/零食" icon="🍪" type="snack" foods={record?.snackFoods} time={record?.snackTime} comfort={record?.snackComfort} />

      {/* Bowel movements */}
      <div onClick={() => setEditType('bowel')} className="bg-[#1C1C1E] rounded-2xl p-4 mb-3 cursor-pointer">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-[#8E8E93]"><span>💩</span><span>大便</span></div>
          <Plus size={16} className="text-[#00D4AA]" />
        </div>
        {record?.bowelMovements && record.bowelMovements.length > 0 ? (
          record.bowelMovements.map((bm, i) => (
            <div key={i} className="text-sm py-1 border-b border-[#38383A] last:border-0">
              {bm.time} · Bristol {bm.bristolType} · 感受{bm.comfort}/5 · 急迫{bm.urgency}/10
            </div>
          ))
        ) : <div className="text-sm text-[#636366]">(未记录)</div>}
      </div>

      {/* Symptom events */}
      <div onClick={() => setEditType('symptom')} className="bg-[#1C1C1E] rounded-2xl p-4 mb-3 cursor-pointer">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-[#8E8E93]"><span>😣</span><span>症状</span></div>
          <Plus size={16} className="text-[#00D4AA]" />
        </div>
        {record?.symptomEvents && record.symptomEvents.length > 0 ? (
          record.symptomEvents.map((se, i) => (
            <div key={i} className="text-sm py-1 border-b border-[#38383A] last:border-0">
              {se.time} · {se.type} {se.severity}/10 {se.notes ? `· ${se.notes}` : ''}
            </div>
          ))
        ) : <div className="text-sm text-[#636366]">(未记录)</div>}
      </div>

      {/* Daily summary */}
      <div onClick={() => setEditType('daily')} className="bg-[#1C1C1E] rounded-2xl p-4 mb-3 cursor-pointer">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-[#8E8E93]"><span>📊</span><span>每日综合</span></div>
          <Plus size={16} className="text-[#00D4AA]" />
        </div>
        {record ? (
          <div className="text-sm space-y-1">
            {record.morningFatigue != null && <div>晨疲: {record.morningFatigue}/10</div>}
            {record.energyMorning && <div>精力: 早{record.energyMorning} 中{record.energyAfternoon} 晚{record.energyEvening}</div>}
            {record.whoopRecovery && <div>WHOOP Recovery: {record.whoopRecovery}%</div>}
            {record.exerciseType && <div>运动: {record.exerciseType} {record.exerciseDuration}min</div>}
            {record.medications && <div>药物: {record.medications}</div>}
            {record.notes && <div className="text-[#8E8E93]">备注: {record.notes}</div>}
          </div>
        ) : <div className="text-sm text-[#636366]">(未记录)</div>}
      </div>

      {/* Edit Panel */}
      {editType && (
        <EditPanel
          type={editType}
          date={currentDate}
          record={record}
          onClose={() => { setEditType(null); loadRecord(); }}
        />
      )}
    </div>
  );
}
