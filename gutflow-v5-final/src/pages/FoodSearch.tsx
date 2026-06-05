import { useState, useMemo } from 'react';
import { foodDatabase } from '../lib/foods';
import { Search } from 'lucide-react';

const filters = [
  { key: 'all', label: '全部' },
  { key: 'green', label: '绿榜' },
  { key: 'yellow', label: '黄榜' },
  { key: 'red', label: '红榜' },
];

const badgeColors: Record<string, string> = { green: '#34C759', yellow: '#FF9500', red: '#FF3B30' };
const badgeLabels: Record<string, string> = { green: '绿', yellow: '黄', red: '红' };

export default function FoodSearch() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selected, setSelected] = useState<typeof foodDatabase[0] | null>(null);

  const results = useMemo(() => {
    let filtered = foodDatabase;
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(f => f.name.toLowerCase().includes(q) || f.category.includes(q));
    }
    if (activeFilter !== 'all') {
      filtered = filtered.filter(f => f.classification === activeFilter);
    }
    return filtered.slice(0, 100);
  }, [query, activeFilter]);

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold mb-4">食物库 ({foodDatabase.length}种)</h1>

      <div className="relative mb-3">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#636366]" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索食物..." className="w-full pl-10" />
      </div>

      <div className="flex gap-2 mb-4">
        {filters.map(f => (
          <button key={f.key} onClick={() => setActiveFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm ${activeFilter === f.key ? 'bg-[#00D4AA] text-black' : 'bg-[#2C2C2E] text-[#8E8E93]'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {results.map(f => (
          <div key={f.name} onClick={() => setSelected(f)}
            className="flex items-center justify-between bg-[#1C1C1E] rounded-xl p-3 cursor-pointer">
            <div>
              <div className="text-sm font-medium">{f.name}</div>
              <div className="text-xs text-[#8E8E93]">{f.category}</div>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ background: badgeColors[f.classification] }}>
              {badgeLabels[f.classification]}
            </span>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative bg-[#1C1C1E] rounded-2xl p-5 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-[#8E8E93]">✕</button>
            </div>
            <span className="inline-block px-3 py-1 rounded-full text-sm text-white mb-3" style={{ background: badgeColors[selected.classification] }}>
              {selected.classification === 'red' ? '红榜 - 建议避免' : selected.classification === 'yellow' ? '黄榜 - 适量' : '绿榜 - 推荐'}
            </span>
            <div className="text-sm text-[#8E8E93] mb-3">{selected.note}</div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-[#2C2C2E] rounded-lg p-2"><div className="text-[#8E8E93]">FODMAP</div><div className={selected.fodmap === 'high' ? 'text-[#FF3B30]' : selected.fodmap === 'low' ? 'text-[#34C759]' : 'text-[#FF9500]'}>{selected.fodmap}</div></div>
              <div className="bg-[#2C2C2E] rounded-lg p-2"><div className="text-[#8E8E93]">GERD</div><div className={selected.gerd === 'high' ? 'text-[#FF3B30]' : selected.gerd === 'low' ? 'text-[#34C759]' : 'text-[#FF9500]'}>{selected.gerd}</div></div>
              <div className="bg-[#2C2C2E] rounded-lg p-2"><div className="text-[#8E8E93]">IBS</div><div className={selected.ibs === 'high' ? 'text-[#FF3B30]' : selected.ibs === 'low' ? 'text-[#34C759]' : 'text-[#FF9500]'}>{selected.ibs}</div></div>
            </div>
            {selected.alternatives && <div className="mt-3 text-xs text-[#8E8E93]">替代: {selected.alternatives}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
