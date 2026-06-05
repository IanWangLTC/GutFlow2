import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { exportToExcel, exportToCSV, importFromExcel } from '../lib/export';

export default function Settings() {
  const [recordCount, setRecordCount] = useState(0);
  const [themeColor, setThemeColor] = useState('#00D4AA');
  const [fontSize, setFontSize] = useState('medium');
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [importResult, setImportResult] = useState('');
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  useEffect(() => {
    db.dailyRecords.count().then(setRecordCount);
  }, []);

  async function clearAll() {
    if (confirmText !== 'DELETE') return;
    await db.dailyRecords.clear();
    setConfirmClear(false);
    setConfirmText('');
    window.location.reload();
  }

  async function handleExportExcel() {
    await exportToExcel();
    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 2000);
  }

  async function handleExportCSV() {
    await exportToCSV();
    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 2000);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const n = await importFromExcel(file);
      setImportResult(`成功导入 ${n} 条记录`);
      db.dailyRecords.count().then(setRecordCount);
    } catch (err: any) {
      setImportResult(`导入失败: ${err.message}`);
    }
    e.target.value = '';
  }

  const colors = [
    { name: '薄荷绿', value: '#00D4AA' },
    { name: '蓝', value: '#007AFF' },
    { name: '橙', value: '#FF9500' },
    { name: '红', value: '#FF3B30' },
  ];

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">设置</h1>

      {/* Appearance */}
      <div className="mb-4">
        <div className="text-xs text-[#8E8E93] uppercase mb-2 tracking-wider">外观</div>
        <div className="bg-[#1C1C1E] rounded-2xl p-4">
          <div className="mb-4">
            <div className="text-sm mb-2">主题色</div>
            <div className="flex gap-3">
              {colors.map(c => (
                <button key={c.value} onClick={() => setThemeColor(c.value)}
                  className={`w-10 h-10 rounded-full ${themeColor === c.value ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1C1C1E]' : ''}`}
                  style={{ background: c.value }} title={c.name} />
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm mb-2">字体大小</div>
            <div className="flex gap-2">
              {[{ k: 'small', l: '小' }, { k: 'medium', l: '中' }, { k: 'large', l: '大' }].map(s => (
                <button key={s.k} onClick={() => setFontSize(s.k)}
                  className={`flex-1 py-2 rounded-lg text-sm ${fontSize === s.k ? 'bg-[#00D4AA] text-black' : 'bg-[#2C2C2E] text-[#8E8E93]'}`}>{s.l}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Data */}
      <div className="mb-4">
        <div className="text-xs text-[#8E8E93] uppercase mb-2 tracking-wider">数据管理</div>
        <div className="bg-[#1C1C1E] rounded-2xl p-4">
          <div className="text-sm text-[#8E8E93] mb-3">已记录 {recordCount} 天</div>

          <button onClick={handleExportExcel} className="w-full py-3 rounded-xl bg-[#00D4AA] text-black font-semibold mb-2">
            导出 Excel
          </button>
          <button onClick={handleExportCSV} className="w-full py-3 rounded-xl bg-[#2C2C2E] text-white mb-4">
            导出 CSV
          </button>

          {showExportSuccess && <div className="text-sm text-[#00D4AA] mb-2">导出成功！</div>}

          <div className="border-t border-[#38383A] pt-4">
            <div className="text-sm mb-2">从 Excel 导入</div>
            <label className="block w-full py-3 rounded-xl bg-[#2C2C2E] text-center text-sm text-[#8E8E93] cursor-pointer">
              选择文件 (.xlsx / .csv)
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} className="hidden" />
            </label>
            {importResult && <div className="text-sm mt-2 text-[#00D4AA]">{importResult}</div>}
          </div>
        </div>
      </div>

      {/* About */}
      <div className="mb-8">
        <div className="text-xs text-[#8E8E93] uppercase mb-2 tracking-wider">关于</div>
        <div className="bg-[#1C1C1E] rounded-2xl p-4 text-center">
          <div className="text-lg font-bold">GutFlow</div>
          <div className="text-sm text-[#8E8E93] mt-1">v5.0</div>
          <div className="text-xs text-[#636366] mt-2">数据完全存储在您的设备本地<br/>不会上传到任何服务器</div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="mt-8 pt-6 border-t border-[#38383A]">
        <button onClick={() => setConfirmClear(true)} className="text-xs text-[#636366] underline">
          清除所有数据
        </button>
      </div>

      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => { setConfirmClear(false); setConfirmText(''); }}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative bg-[#1C1C1E] rounded-2xl p-5 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[#FF3B30] mb-2">清除所有数据</h2>
            <p className="text-sm text-[#8E8E93] mb-3">此操作不可撤销。建议先导出备份。</p>
            <p className="text-sm text-[#8E8E93] mb-2">输入 DELETE 确认：</p>
            <input value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder="DELETE" className="w-full mb-4" />
            <div className="flex gap-3">
              <button onClick={() => { setConfirmClear(false); setConfirmText(''); }} className="flex-1 py-2 rounded-xl bg-[#2C2C2E]">取消</button>
              <button onClick={clearAll} className={`flex-1 py-2 rounded-xl font-semibold ${confirmText === 'DELETE' ? 'bg-[#FF3B30] text-white' : 'bg-[#38383A] text-[#636366]'}`}>确认清除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
