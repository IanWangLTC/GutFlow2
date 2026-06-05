import { useState, useEffect } from 'react';
import { exportToExcel, exportToCSV, importFromExcel } from '../lib/export';
import { db } from '../lib/db';
import { FileSpreadsheet, Download, Upload } from 'lucide-react';

export default function ExportPage() {
  const [count, setCount] = useState(0);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState('');

  useEffect(() => {
    db.dailyRecords.count().then(setCount);
  }, []);

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const n = await importFromExcel(file);
      setImportResult(`成功导入 ${n} 条记录`);
      db.dailyRecords.count().then(setCount);
    } catch (err: any) {
      setImportResult(`导入失败: ${err.message}`);
    }
    setImporting(false);
  }

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold mb-4">数据管理</h1>

      <div className="bg-[#1C1C1E] rounded-2xl p-4 mb-4 text-center">
        <div className="text-3xl font-bold text-[#00D4AA]">{count}</div>
        <div className="text-sm text-[#8E8E93]">已记录天数</div>
      </div>

      <button onClick={exportToExcel} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#00D4AA] text-black font-semibold mb-3">
        <FileSpreadsheet size={18} /> 导出 Excel
      </button>

      <button onClick={exportToCSV} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#2C2C2E] text-white mb-4">
        <Download size={18} /> 导出 CSV
      </button>

      <div className="border-t border-[#38383A] pt-4">
        <div className="text-sm text-[#8E8E93] mb-3">从 Excel 导入</div>
        <label className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#2C2C2E] text-white cursor-pointer">
          <Upload size={18} /> {importing ? '导入中...' : '选择 Excel 文件'}
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} className="hidden" />
        </label>
        {importResult && <div className="text-sm mt-2 text-[#00D4AA]">{importResult}</div>}
      </div>
    </div>
  );
}
