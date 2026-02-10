
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BarChart3, 
  Settings2, 
  LayoutDashboard,
  CheckCircle2,
  Loader2,
  Package,
  FileSpreadsheet,
  X,
  FileText,
  ShoppingBag,
  Search,
  UploadCloud,
  RefreshCw,
  Database,
  ShieldCheck,
  Zap,
  PackageSearch,
  TriangleAlert,
  Info,
  Edit3,
  Check,
  Lock,
  ArrowRight,
  Gift,
  ClipboardList,
  FileUp,
  FileCheck,
  Cpu,
  Link,
  Globe,
  Monitor,
  Play,
  UserCheck,
  ArrowDownToLine,
  Sparkles,
  Activity
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { GroupType, ImportItem, BasicUnitMap } from './types';
import { processImportData } from './services/geminiService';

// --- Constants ---
const DB_NAME = "MisaAmisMasterData";
const STORE_NAME = "MasterData_V7";
const SYSTEM_PASSWORD = "admin271235";
const GG_SHEET_MASTER_URL_KEY = "MISA_AMIS_GG_SHEET_MASTER_URL";
const DEFAULT_MASTER_SHEET_URL = "https://docs.google.com/spreadsheets/d/1-2j4XORAarGnhir9WDCSqSbuXNJ2lkh_v81c1QlFN_Q/edit?gid=1956479221#gid=1956479221";

// --- Sub-components ---

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) => (
  <div className="bg-white p-3 lg:p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3 transition-all hover:shadow-md">
    <div className={`p-2 lg:p-3 rounded-lg ${color} flex-shrink-0`}>
      <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] lg:text-[11px] text-slate-500 font-bold uppercase tracking-tight truncate">{title}</p>
      <p className="text-base lg:text-lg font-black text-black truncate">{value}</p>
    </div>
  </div>
);

const GroupCard = ({ 
  type, 
  isSelected, 
  onClick, 
  description, 
  color 
}: { 
  type: GroupType, 
  isSelected: boolean, 
  onClick: () => void, 
  description: string,
  color: string
}) => (
  <button
    onClick={onClick}
    className={`relative flex flex-col items-start p-3 lg:p-4 rounded-xl border-2 transition-all text-left w-full h-full
      ${isSelected 
        ? `${color} border-current shadow-md scale-[1.02]` 
        : 'border-slate-200 bg-white hover:border-slate-300'}`}
  >
    <div className="flex items-center gap-2 mb-1 lg:mb-2">
      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'animate-pulse bg-current' : 'bg-slate-300'}`}></span>
      <h3 className="font-bold text-[12px] lg:text-[13px]">[{type}]</h3>
    </div>
    <p className="text-[10px] lg:text-[11px] text-slate-600 leading-tight font-medium line-clamp-2">{description}</p>
    {isSelected && (
      <div className="absolute top-3 right-3 text-current">
        <CheckCircle2 className="w-4 h-4" />
      </div>
    )}
  </button>
);

const LoginScreen = ({ onLogin }: { onLogin: (pw: string) => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === SYSTEM_PASSWORD) {
      onLogin(password);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#020617] p-4">
      <div className="bg-white/10 backdrop-blur-3xl p-8 lg:p-12 rounded-[40px] border-2 border-white/20 w-full max-w-md shadow-2xl text-[12px]">
        <div className="flex flex-col items-center mb-10">
          <div className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[32px] shadow-2xl shadow-blue-500/40 mb-6 group">
            <Lock className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
          </div>
          <h1 className="text-[14px] font-black text-white tracking-tighter uppercase text-center mb-2">Security Access</h1>
          <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.5em]">MISA AMIS IMPORT PRO V12.5</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mã bảo mật hệ thống..."
              className={`w-full px-6 py-4 bg-white/5 border-2 rounded-[20px] text-white font-black text-center text-lg outline-none transition-all
                ${error ? 'border-red-500 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'border-white/10 focus:border-blue-500 focus:bg-white/10'}`}
              autoFocus
            />
            {error && <p className="text-red-400 text-[9px] font-black uppercase text-center mt-3 animate-bounce">Xác thực thất bại!</p>}
          </div>
          <button type="submit" className="w-full py-4 bg-white text-[#0f172a] rounded-[20px] font-black uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-3 hover:bg-blue-500 hover:text-white transition-all active:scale-95 group shadow-xl">Vào hệ thống <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></button>
        </form>
      </div>
    </div>
  );
};

// --- Nâng cấp SQL Master Data Engine Modal V12.5 ---
const BasicUnitModal = ({ 
  isOpen, 
  onClose, 
  onUpdateMap,
  currentMap 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onUpdateMap: (map: BasicUnitMap, mode: 'replace' | 'update') => void,
  currentMap: BasicUnitMap 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [ggSheetUrl, setGgSheetUrl] = useState(DEFAULT_MASTER_SHEET_URL);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isEditUrl, setIsEditUrl] = useState(false);
  const [lastSyncCount, setLastSyncCount] = useState<number | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    const savedUrl = localStorage.getItem(GG_SHEET_MASTER_URL_KEY);
    if (savedUrl) {
      setGgSheetUrl(savedUrl);
    } else {
      setGgSheetUrl(DEFAULT_MASTER_SHEET_URL);
    }
  }, [isOpen]);

  const filteredMapEntries = useMemo(() => {
    const entries = Object.entries(currentMap);
    if (!searchQuery) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(([code, info]) => 
      code.toLowerCase().includes(q) || 
      info.itemName.toLowerCase().includes(q) ||
      info.groupName?.toLowerCase().includes(q)
    );
  }, [currentMap, searchQuery]);

  const handleDownloadMaster = () => {
    if (Object.keys(currentMap).length === 0) return;
    const data = Object.entries(currentMap).map(([code, info]) => ({
      "Mã Hàng": code,
      "Tên Sản Phẩm": info.itemName,
      "Đơn Vị Tính": info.basicUnit,
      "VAT": info.vat || "8%",
      "Nhóm Hàng": info.groupName || "Chưa phân nhóm"
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DVT_Quy_Doi");
    XLSX.writeFile(wb, `DVT_QuyDoi_Master_${new Date().getTime()}.xlsx`);
  };

  const handleSyncGgSheet = async (isReload: boolean = false) => {
    const targetUrl = ggSheetUrl || DEFAULT_MASTER_SHEET_URL;
    setIsSyncing(true);
    setSyncError(null);
    
    try {
      let sheetId = "";
      let gid = "1956479221"; 
      const sheetIdMatch = targetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (sheetIdMatch) sheetId = sheetIdMatch[1];
      const gidMatch = targetUrl.match(/gid=([0-9]+)/);
      if (gidMatch) gid = gidMatch[1];
      if (!sheetId) throw new Error("Link Google Sheet không hợp lệ.");
      const fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
      const response = await fetch(fetchUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error("Không thể kết nối Google Sheet.");
      const csvData = await response.text();
      const workbook = XLSX.read(csvData, { type: 'string', codepage: 65001 });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: "" });
      if (jsonData.length <= 1) throw new Error("Tệp không có dữ liệu hàng hóa.");
      const learnedData: BasicUnitMap = {};
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length < 2) continue;
        const code = String(row[0] || "").trim();
        const name = String(row[1] || "").trim();
        const unit = String(row[2] || "").trim();
        const vat = String(row[3] || "8%").trim();
        const group = String(row[4] || "Hàng hóa").trim();
        if (code && code !== "" && code !== "null" && code !== "Mã Hàng") {
          learnedData[code] = { itemName: name, basicUnit: unit, vat: vat, groupName: group };
        }
      }
      const totalFound = Object.keys(learnedData).length;
      if (totalFound === 0) throw new Error("Không tìm thấy dữ liệu.");
      if (targetUrl !== DEFAULT_MASTER_SHEET_URL) {
        localStorage.setItem(GG_SHEET_MASTER_URL_KEY, targetUrl);
      }
      onUpdateMap(learnedData, isReload ? 'replace' : 'update');
      setLastSyncCount(totalFound);
      setIsEditUrl(false);
    } catch (err: any) {
      setSyncError(`Đồng bộ thất bại: ${err.message}.`);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 lg:p-10 bg-slate-900/96 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[1500px] overflow-hidden border border-white/20 flex flex-col h-[95vh] text-[11px] lg:text-[12px]">
        <div className="px-6 lg:px-10 py-5 lg:py-6 border-b flex justify-between items-center bg-white sticky top-0 z-20">
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="p-3 lg:p-4 bg-indigo-600 rounded-[20px] shadow-xl">
              <Database className="w-5 h-5 lg:w-7 lg:h-7 text-white" />
            </div>
            <div>
              <h2 className="text-base lg:text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">SQL MASTER DATA V12.5</h2>
              <p className="text-[9px] lg:text-[10px] text-indigo-600 font-bold uppercase tracking-[0.3em] mt-1.5 flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Infinite Sync Pipeline</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-100 rounded-full text-slate-300 transition-all active:scale-90"><X className="w-7 h-7" /></button>
        </div>

        <div className="flex-1 p-6 lg:p-8 flex flex-col gap-6 overflow-hidden bg-slate-50/30">
          <div className="bg-white p-5 lg:p-6 rounded-[24px] border shadow-sm flex flex-col gap-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
              <div className="lg:col-span-8 w-full">
                <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                  <Globe className="w-3 h-3" /> NGUỒN GOOGLE SHEET MASTER
                </p>
                <div className="relative">
                  <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300" />
                  <input 
                    type="text" 
                    placeholder="Link Google Sheet Master..." 
                    className={`w-full pl-11 pr-8 py-3.5 bg-slate-50 border-2 rounded-xl text-[12px] font-bold outline-none transition-all ${!isEditUrl ? 'text-slate-400 border-transparent cursor-not-allowed' : 'focus:border-indigo-500 shadow-sm border-slate-200 bg-white'}`}
                    value={ggSheetUrl}
                    disabled={!isEditUrl || isSyncing}
                    onChange={(e) => setGgSheetUrl(e.target.value)}
                  />
                </div>
              </div>
              <div className="lg:col-span-4 flex gap-3">
                <button onClick={() => isEditUrl ? (setIsEditUrl(false), handleSyncGgSheet(false)) : setIsEditUrl(true)} className={`flex-1 py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 ${isEditUrl ? 'bg-emerald-600 text-white' : 'bg-white text-indigo-600 border-2 border-indigo-100'}`}>
                   {isEditUrl ? <><Check className="w-4 h-4" /> Lưu & Nạp</> : <><Edit3 className="w-4 h-4" /> Sửa Link</>}
                </button>
                <button onClick={() => handleSyncGgSheet(true)} disabled={isSyncing} className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all">
                  {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Đồng Bộ
                </button>
              </div>
            </div>
            {syncError && <div className="bg-rose-50 p-3 rounded-lg border border-rose-100 text-rose-700 font-bold text-[11px] flex items-center gap-2"><TriangleAlert className="w-4 h-4" />{syncError}</div>}
            {lastSyncCount !== null && !syncError && <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Đã cập nhật {lastSyncCount} mã hàng.</div>}
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input type="text" placeholder={`Tìm kiếm mã hàng (${Object.keys(currentMap).length})...`} className="w-full pl-12 pr-6 py-3.5 bg-white border rounded-xl text-[13px] font-bold outline-none focus:border-indigo-500 shadow-sm transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <button onClick={handleDownloadMaster} className="w-full lg:w-auto px-6 py-3.5 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-black transition-all">
              <ArrowDownToLine className="w-4 h-4" /> Tải về ĐVT Quy đổi
            </button>
          </div>

          <div className="flex-1 bg-white border rounded-[24px] overflow-hidden flex flex-col shadow-sm">
            <div className="overflow-auto flex-1 scrollbar-thin">
              <table className="w-full text-left border-collapse min-w-[800px]">
                 <thead className="sticky top-0 bg-white z-10 border-b">
                    <tr className="text-[9px] lg:text-[10px] font-black uppercase text-slate-400 tracking-widest">
                       <th className="px-6 py-4">Mã Sản Phẩm</th>
                       <th className="px-6 py-4">Tên Sản Phẩm Tham Chiếu</th>
                       <th className="px-6 py-4 text-center">ĐVT Hệ Thống</th>
                       <th className="px-6 py-4 text-center">VAT</th>
                       <th className="px-6 py-4 text-right">Nhóm Hàng</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 font-bold text-slate-700">
                    {filteredMapEntries.length > 0 ? filteredMapEntries.map(([code, info]) => (
                      <tr key={code} className="hover:bg-indigo-50/10 transition-all border-b border-slate-50/50">
                         <td className="px-6 py-2.5 font-mono text-slate-400 text-[12px]">{code}</td>
                         <td className="px-6 py-2.5 text-[12px] text-slate-900 leading-tight">{info.itemName}</td>
                         <td className="px-6 py-2.5 text-center">
                            <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase border ${info.basicUnit.toLowerCase() === 'thùng' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                              {info.basicUnit}
                            </span>
                         </td>
                         <td className="px-6 py-2.5 text-center text-[11px] text-slate-500">{info.vat || '8%'}</td>
                         <td className="px-6 py-2.5 text-right">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-md text-[8px] font-black uppercase border border-slate-200/50">
                              {info.groupName || 'Hàng hóa'}
                            </span>
                         </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="py-24 text-center opacity-20 uppercase font-black tracking-widest text-slate-400">Không tìm thấy dữ liệu</td></tr>
                    )}
                 </tbody>
              </table>
            </div>
            <div className="px-6 py-3 bg-slate-50/50 border-t flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
               <div className="flex items-center gap-3">Tổng Database: <span className="text-slate-900">{Object.keys(currentMap).length}</span></div>
               <div className="flex items-center gap-2"><Monitor className="w-3.5 h-3.5" /> Optimal Resolution V12.5</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Mapping Pro Engine Modal ---
const EInvoiceModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-8 bg-slate-900/98 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-[600px] overflow-hidden border flex flex-col p-10 text-[12px]">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-5">
            <div className="p-3.5 bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-600/20"><Cpu className="w-7 h-7 text-white" /></div>
            <div>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Mapping Pro Engine</h2>
              <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1">Logic V12.5 Core</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full text-slate-300 transition-all"><X className="w-7 h-7" /></button>
        </div>
        <div className="space-y-6">
          <div className="p-5 bg-slate-50 rounded-[20px] border border-slate-100">
            <h3 className="font-black text-slate-800 uppercase mb-4 flex items-center gap-2.5 text-[11px]"><ShieldCheck className="w-4 h-4 text-emerald-500" /> AI System Pipeline</h3>
            <ul className="space-y-3 text-slate-600 font-medium text-[12px]">
              <li className="flex items-center gap-3"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Tối ưu trích xuất mã hàng Colgate Promotion</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Xử lý OCR phân tách dính số quy mô lớn</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Tự động quy đổi ĐVT lẻ sang ĐVT hệ thống</li>
            </ul>
          </div>
        </div>
        <button onClick={onClose} className="mt-8 w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-black transition-all text-[11px]">Đóng cửa sổ</button>
      </div>
    </div>
  );
};

export default function App() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ImportItem[]>([]);
  const [isBasicUnitOpen, setIsBasicUnitOpen] = useState(false);
  const [isEInvoiceOpen, setIsEInvoiceOpen] = useState(false);
  const [basicUnitMap, setBasicUnitMap] = useState<BasicUnitMap>({});
  const [originalFileName, setOriginalFileName] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<{ base64: string, mimeType: string } | null>(null);
  const [vatRate, setVatRate] = useState(0.08);

  useEffect(() => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: "code" });
    };
    request.onsuccess = (e: any) => {
      const db = e.target.result;
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const getAllReq = store.getAll();
      getAllReq.onsuccess = () => {
        const map: BasicUnitMap = {};
        getAllReq.result.forEach((item: any) => {
          map[String(item.code).trim()] = { itemName: item.name, basicUnit: item.unit, groupName: item.group, vat: item.vat };
        });
        setBasicUnitMap(map);
      };
    };
  }, []);

  const updateBasicUnitMap = (newEntries: BasicUnitMap, mode: 'replace' | 'update') => {
    const finalMap = mode === 'replace' ? newEntries : { ...basicUnitMap, ...newEntries };
    setBasicUnitMap(finalMap);
    const request = indexedDB.open(DB_NAME, 1);
    request.onsuccess = (e: any) => {
      const db = e.target.result;
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      if (mode === 'replace') store.clear();
      Object.entries(newEntries).forEach(([code, info]) => {
        store.put({ code: String(code).trim(), name: info.itemName, unit: info.basicUnit, group: info.groupName, vat: info.vat });
      });
    };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedGroup) return;
    setOriginalFileName(file.name);
    const mimeType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setPendingFile({ base64, mimeType });
    };
    reader.readAsDataURL(file);
  };

  const handleProcessData = async () => {
    if (!pendingFile || !selectedGroup) return;
    setIsProcessing(true);
    try {
      const rawData = await processImportData(pendingFile.base64, pendingFile.mimeType, selectedGroup);
      const processedData = rawData.map(item => {
        const itemCodeTrimmed = String(item.itemCode).trim();
        const mappedInfo = basicUnitMap[itemCodeTrimmed];
        let finalUnit = item.unit;
        let note = 'Trích xuất AI';
        let finalGroup = 'Hàng hóa';
        if (mappedInfo) {
          finalGroup = mappedInfo.groupName || 'Hàng hóa';
          if (item.unit.toLowerCase().includes('lẻ')) {
            finalUnit = mappedInfo.basicUnit || 'Chai'; 
            note = `Quy đổi: Lẻ -> ${finalUnit}`;
          } else if (item.unit.toLowerCase().includes('thùng')) {
            finalUnit = 'Thùng';
            note = 'ĐVT Thùng';
          }
        }
        let status: 'success' | 'warning' | 'error' = mappedInfo ? 'success' : 'error';
        if (!mappedInfo) note = 'Mã chưa khai báo';
        if (item.unitPrice === 0) { note = "Hàng quà tặng"; status = status === 'error' ? 'error' : 'warning'; }
        return { ...item, unit: finalUnit, mappingStatus: status, mappingNote: note, groupName: finalGroup };
      });
      setResults(processedData);
      setPendingFile(null);
    } catch (err: any) { 
      console.error(err); 
      alert("Lỗi khi xử lý dữ liệu AI.");
    } finally { setIsProcessing(false); }
  };

  const exportToMauBanHangMisa = () => {
    if (results.length === 0) return;
    const todayStr = new Date().toLocaleDateString('vi-VN');
    const misaRows = results.map(item => {
      const netAfterDiscount = Math.round(item.afterDiscountAmount / (1 + vatRate));
      const vatAmount = Math.round(netAfterDiscount * vatRate);
      const row = new Array(51).fill(''); 
      row[5] = item.orderId; row[6] = todayStr; row[7] = item.orderId; row[14] = item.customerName; row[18] = item.salesPerson; row[23] = item.salesPerson; row[27] = item.itemCode; row[29] = item.itemName; row[35] = item.unit; row[36] = item.quantity; row[37] = item.unitPrice; row[38] = item.amount; row[39] = item.discountRate; row[40] = item.discountAmount; row[46] = vatRate * 100; row[47] = 0; row[48] = vatAmount; row[49] = "33311"; row[50] = item.totalPayment;
      return row;
    });
    const headers = new Array(51).fill('');
    headers[5] = 'Ngày hạch toán'; headers[6] = 'Ngày chứng từ'; headers[7] = 'Số chứng từ'; headers[14] = 'Tên khách hàng'; headers[18] = 'Người nộp'; headers[23] = 'Nhân viên bán hàng'; headers[27] = 'Mã hàng'; headers[29] = 'Tên hàng'; headers[35] = 'ĐVT'; headers[36] = 'Số lượng'; headers[37] = 'Đơn giá'; headers[38] = 'Thành tiền'; headers[39] = 'Tỷ lệ chiết khấu (%)'; headers[40] = 'Tiền chiết khấu'; headers[46] = '% thuế GTGT'; headers[47] = '% thuế suất KHÁC'; headers[48] = 'Tiền thuế GTGT'; headers[49] = 'TK thuế GTGT'; headers[50] = 'Biển kiểm soát';
    const ws = XLSX.utils.aoa_to_sheet([[],[],[],[],[],[],[], headers, ...misaRows]);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Misa");
    XLSX.writeFile(wb, `${originalFileName ? originalFileName.replace(/\.[^/.]+$/, "") : "SALES"}_MISA.xlsx`);
  };

  const totalAmount = useMemo(() => results.reduce((acc, curr) => acc + curr.afterDiscountAmount, 0), [results]);

  if (!isAuthorized) return <LoginScreen onLogin={() => setIsAuthorized(true)} />;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 font-sans text-[11px] lg:text-[12px] overflow-hidden">
      <BasicUnitModal isOpen={isBasicUnitOpen} onClose={() => setIsBasicUnitOpen(false)} currentMap={basicUnitMap} onUpdateMap={updateBasicUnitMap} />
      <EInvoiceModal isOpen={isEInvoiceOpen} onClose={() => setIsEInvoiceOpen(false)} />
      
      {/* Sidebar optimized for Tablet & Laptop */}
      <aside className="hidden lg:flex lg:w-[240px] bg-[#0f172a] text-white p-5 flex-col border-r border-slate-800 shadow-2xl flex-shrink-0">
        <div className="flex items-center gap-4 mb-10"><div className="bg-blue-600 p-2 rounded-xl shadow-xl shadow-blue-600/20"><BarChart3 className="w-5 h-5" /></div><span className="font-black text-[13px] tracking-tighter uppercase">MISA AMIS</span></div>
        <nav className="space-y-4 flex-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-xl font-black uppercase tracking-widest transition-all"><LayoutDashboard className="w-4 h-4" />Dashboard</button>
          <div className="space-y-2 pt-6">
            <p className="px-4 text-[9px] font-black uppercase text-white/20 tracking-widest mb-3">Hệ Thống AI</p>
            <button onClick={() => setIsBasicUnitOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-600/10 text-indigo-400 rounded-xl transition-all hover:bg-indigo-600/20 font-black uppercase"><PackageSearch className="w-4 h-4" />SQL Master</button>
            <button onClick={() => setIsEInvoiceOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-600/10 text-emerald-400 rounded-xl transition-all hover:bg-emerald-600/20 font-black uppercase"><Cpu className="w-4 h-4" />Mapping Pro</button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative h-screen overflow-hidden">
        {/* Header Standardized */}
        <header className="bg-white border-b px-5 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-50 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-4 lg:gap-5 min-w-0">
            <h1 className="text-[13px] font-black text-slate-900 flex items-center gap-2.5 uppercase tracking-tighter truncate">
              <Zap className="w-5 h-5 text-blue-600" />ETL CORE V12.5
            </h1>
            {originalFileName && <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-slate-100 rounded-md border font-black text-slate-500 uppercase text-[9px] truncate max-w-[150px]">{originalFileName}</div>}
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            {results.length > 0 && (
              <>
                <button onClick={() => { setResults([]); setOriginalFileName(null); setPendingFile(null); }} className="px-3.5 py-1.5 border-2 rounded-lg font-black uppercase text-slate-500 hover:bg-slate-50 transition-all text-[10px]">Làm mới</button>
                <button onClick={exportToMauBanHangMisa} className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-black uppercase text-[10px] flex items-center gap-2 shadow-md hover:bg-emerald-700 transition-all active:scale-95"><FileUp className="w-3.5 h-3.5" /> MISA EXCEL</button>
                <button className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-black uppercase text-[10px] flex items-center gap-2 shadow-md hover:bg-blue-700 transition-all active:scale-95"><FileText className="w-3.5 h-3.5" /> AMIS IMPORT</button>
              </>
            )}
          </div>
        </header>

        {/* Scrollable Body Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 lg:space-y-8 scrollbar-thin">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 max-w-[1500px] mx-auto">
            <StatCard title="Số Đơn Hàng" value={String(new Set(results.map(r => r.orderId)).size)} icon={Package} color="bg-blue-600" />
            <StatCard title="Giá Trị Net" value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)} icon={FileSpreadsheet} color="bg-indigo-600" />
            <StatCard title="Số Dòng ETL" value={String(results.length)} icon={ShoppingBag} color="bg-emerald-600" />
          </div>

          <div className="max-w-[1500px] mx-auto">
            {!results.length ? (
              <div className="bg-white p-6 lg:p-10 rounded-[32px] shadow-sm border border-slate-200 animate-in fade-in duration-500">
                <h2 className="text-[11px] font-black mb-6 lg:mb-8 flex items-center gap-2.5 text-slate-800 uppercase tracking-widest"><Settings2 className="w-4 h-4 text-blue-600" />Chọn nhóm nghiệp vụ:</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                  <GroupCard type={GroupType.KIDO} isSelected={selectedGroup === GroupType.KIDO} onClick={() => setSelectedGroup(GroupType.KIDO)} description="Tách mã [xxxx], giữ VIPSHOP/ONTOP & KM." color="text-red-600 border-red-100" />
                  <GroupCard type={GroupType.UNICHARM} isSelected={selectedGroup === GroupType.UNICHARM} onClick={() => setSelectedGroup(GroupType.UNICHARM)} description="Phục hồi 100% quà tặng KM đơn giá 0." color="text-blue-600 border-blue-100" />
                  <GroupCard type={GroupType.COLGATE} isSelected={selectedGroup === GroupType.COLGATE} onClick={() => setSelectedGroup(GroupType.COLGATE)} description="Tối ưu quà tặng & mã CP Promotion." color="text-yellow-600 border-yellow-100" />
                  <GroupCard type={GroupType.KIOTVIET_NPP} isSelected={selectedGroup === GroupType.KIOTVIET_NPP} onClick={() => setSelectedGroup(GroupType.KIOTVIET_NPP)} description="Clean mã -TH, trích xuất trả thưởng." color="text-indigo-600 border-indigo-100" />
                </div>
                {selectedGroup && (
                  <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center border-3 border-dashed rounded-[32px] p-12 lg:p-20 bg-slate-50/50 hover:border-blue-400 transition-all cursor-pointer relative group animate-in slide-in-from-bottom-2">
                      <div className="bg-white p-6 lg:p-8 rounded-[24px] shadow-lg mb-5 group-hover:scale-105 transition-transform flex-shrink-0">
                        {isProcessing ? <Loader2 className="w-10 h-10 lg:w-12 lg:h-12 text-blue-600 animate-spin" /> : pendingFile ? <FileCheck className="w-10 h-10 lg:w-12 lg:h-12 text-emerald-500" /> : <UploadCloud className="w-10 h-10 lg:w-12 lg:h-12 text-blue-600" />}
                      </div>
                      <label className="cursor-pointer text-center flex flex-col items-center gap-3">
                        <input type="file" accept=".pdf,image/*" className="hidden" onChange={handleFileSelect} disabled={isProcessing} />
                        <span className="px-8 lg:px-12 py-3.5 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] lg:text-[11px] inline-block shadow-lg hover:bg-blue-700 transition-all">
                          {pendingFile ? "Thay đổi phiếu đã chọn" : "TẢI PHIẾU GIAO HÀNG / HÓA ĐƠN GỐC"}
                        </span>
                        {pendingFile && <p className="text-[10px] font-black text-emerald-600 uppercase mt-1 line-clamp-1 max-w-xs">{originalFileName}</p>}
                      </label>
                    </div>

                    {pendingFile && !isProcessing && (
                      <div className="flex justify-center animate-in zoom-in-50 duration-300">
                        <button 
                          onClick={handleProcessData}
                          className="px-12 py-4 bg-gradient-to-r from-indigo-600 to-blue-700 text-white rounded-2xl font-black uppercase text-[13px] tracking-widest shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all active:scale-95 flex items-center gap-3 border-2 border-white/10"
                        >
                          <Play className="w-5 h-5 fill-current" /> XỬ LÝ DỮ LIỆU PGH
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Results Table Container Standardized for Tablet & Laptop */
              <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500 flex flex-col max-h-[75vh]">
                <div className="p-4 lg:p-6 border-b bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4 flex-shrink-0">
                  <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-3"><ClipboardList className="w-4 h-4 text-blue-600" />Bảng Kết Quả AI Trích Xuất</h2>
                  <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border shadow-xs">
                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">VAT:</span>
                     <div className="flex gap-4">
                        <label className="flex items-center gap-1.5 cursor-pointer group">
                          <input type="radio" name="vat" checked={vatRate === 0.08} onChange={() => setVatRate(0.08)} className="w-3.5 h-3.5 text-blue-600 focus:ring-0" />
                          <span className={`text-[10px] font-black uppercase ${vatRate === 0.08 ? 'text-blue-600' : 'text-slate-400'}`}>8%</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer group">
                          <input type="radio" name="vat" checked={vatRate === 0.1} onChange={() => setVatRate(0.1)} className="w-3.5 h-3.5 text-blue-600 focus:ring-0" />
                          <span className={`text-[10px] font-black uppercase ${vatRate === 0.1 ? 'text-blue-600' : 'text-slate-400'}`}>10%</span>
                        </label>
                     </div>
                  </div>
                </div>
                
                {/* Horizontal & Vertical Scroll Control */}
                <div className="overflow-auto flex-1 scrollbar-thin bg-white">
                  <table className="w-full text-left min-w-[1400px] text-black border-separate border-spacing-0">
                    <thead className="sticky top-0 bg-slate-50 z-20 shadow-xs">
                      <tr className="text-[9px] font-black uppercase tracking-widest border-b">
                        <th className="px-4 py-3 border-b border-slate-200 text-slate-500 bg-slate-50 sticky left-0 z-30">SỐ PHIẾU</th>
                        <th className="px-3 py-3 w-10 text-center border-b border-slate-200 text-slate-500">STT</th>
                        <th className="px-4 py-3 border-b border-slate-200 text-slate-500">NHÂN VIÊN BH</th>
                        <th className="px-4 py-3 border-b border-slate-200 text-slate-500 sticky left-[120px] bg-slate-50 z-25">MÃ HÀNG</th>
                        <th className="px-5 py-3 border-b border-slate-200 text-slate-500">TÊN SẢN PHẨM</th>
                        <th className="px-4 py-3 border-b border-slate-200 text-slate-500">NHÓM HÀNG</th>
                        <th className="px-4 py-3 text-center border-b border-slate-200 text-slate-500">ĐVT</th>
                        <th className="px-4 py-3 text-right border-b border-slate-200 text-slate-500">SL</th>
                        <th className="px-4 py-3 text-right border-b border-slate-200 text-blue-600 bg-blue-50/20">GIÁ NET</th>
                        <th className="px-4 py-3 text-right border-b border-slate-200 text-amber-600 bg-amber-50/20">VAT</th>
                        <th className="px-4 py-3 text-right border-b border-slate-200 text-slate-500">ĐƠN GIÁ</th>
                        <th className="px-4 py-3 text-right border-b border-slate-200 text-indigo-700">THÀNH TIỀN</th>
                        <th className="px-4 py-3 text-center border-b border-slate-200 text-emerald-600">CK%</th>
                        <th className="px-4 py-3 text-right border-b border-slate-200 text-blue-900 bg-blue-50/10">THANH TOÁN</th>
                        <th className="px-5 py-3 text-right border-b border-slate-200 text-slate-500">GHI CHÚ AI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold text-black text-[11px] lg:text-[12px]">
                      {results.map((item, idx) => {
                        const netPricePerUnit = Math.round(item.unitPrice / (1 + vatRate));
                        const vatPerUnit = item.unitPrice - netPricePerUnit;
                        const netAmount = Math.round(item.amount / (1 + vatRate));
                        return (
                          <tr key={idx} className={`hover:bg-slate-50 transition-colors ${item.mappingStatus === 'error' ? 'bg-red-50/10' : item.unitPrice === 0 ? 'bg-amber-50/10' : ''}`}>
                            <td className="px-4 py-2.5 font-black text-slate-400 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-50 shadow-sm">{item.orderId}</td>
                            <td className="px-3 py-2.5 text-center opacity-30">{idx + 1}</td>
                            <td className="px-4 py-2.5 uppercase truncate max-w-[150px] flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5 text-blue-400" />{item.salesPerson || '---'}</td>
                            <td className="px-4 py-2.5 font-mono font-black sticky left-[120px] bg-white group-hover:bg-slate-50 z-10 border-r border-slate-50 shadow-sm">{item.itemCode}</td>
                            <td className="px-5 py-2.5 truncate max-w-[280px]">
                              {item.unitPrice === 0 && <Gift className="w-3.5 h-3.5 text-amber-500 inline mr-1.5" />}
                              {item.itemName}
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[9px] uppercase font-black border border-indigo-100/50">
                                {item.groupName}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-center uppercase">{item.unit}</td>
                            <td className="px-4 py-2.5 text-right font-black">{item.quantity}</td>
                            <td className="px-4 py-2.5 text-right text-blue-700 bg-blue-50/5">{new Intl.NumberFormat('vi-VN').format(netPricePerUnit)}</td>
                            <td className="px-4 py-2.5 text-right text-amber-700 bg-amber-50/5">{new Intl.NumberFormat('vi-VN').format(vatPerUnit)}</td>
                            <td className="px-4 py-2.5 text-right opacity-60">{item.unitPrice === 0 ? 'KM' : new Intl.NumberFormat('vi-VN').format(item.unitPrice)}</td>
                            <td className="px-4 py-2.5 text-right text-indigo-800">{new Intl.NumberFormat('vi-VN').format(netAmount)}</td>
                            <td className="px-4 py-2.5 text-center text-emerald-600 font-black">{item.discountRate}%</td>
                            <td className="px-4 py-2.5 text-right font-black text-blue-900 bg-blue-50/5">{new Intl.NumberFormat('vi-VN').format(item.afterDiscountAmount)}</td>
                            <td className="px-5 py-2.5 text-right">
                              <span className={`px-2.5 py-0.5 rounded-lg border text-[9px] font-black uppercase ${item.mappingStatus === 'error' ? 'bg-rose-100 border-rose-200 text-rose-700' : 'bg-emerald-100 border-emerald-200 text-emerald-700'}`}>
                                {item.mappingNote}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Fixed Footer for Table */}
                <div className="px-6 py-3 bg-slate-50 border-t flex justify-between items-center text-[10px] font-black uppercase text-slate-400 flex-shrink-0">
                  <div className="flex items-center gap-4">
                    <span>Tổng đơn: {new Set(results.map(r => r.orderId)).size}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span>Bản ghi: {results.length}</span>
                  </div>
                  <div className="flex items-center gap-2"><Activity className="w-3.5 h-3.5" /> ETL CORE READY</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
