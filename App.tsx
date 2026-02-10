
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BarChart3, 
  Table as TableIcon, 
  Download, 
  Settings2, 
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Package,
  FileSpreadsheet,
  X,
  PlusCircle,
  FileText,
  ShoppingBag,
  Percent,
  Search,
  Layers,
  UploadCloud,
  RefreshCw,
  Database,
  ShieldCheck,
  Zap,
  PackageSearch,
  TriangleAlert,
  Info,
  Edit3,
  Trash2,
  Eye,
  Check,
  Lock,
  Unlock,
  ArrowRight,
  Gift,
  FileDigit,
  ClipboardList,
  FileUp,
  FileCheck,
  Cpu,
  Settings,
  Link,
  GitBranch,
  Wand2,
  Share2,
  Terminal,
  Activity,
  History,
  CheckSquare,
  Globe,
  MonitorCheck,
  BellRing,
  UserCheck,
  ChevronRight,
  Save,
  Undo2,
  Target,
  FileJson,
  MousePointer2,
  Filter,
  Layers2,
  Sparkles,
  RotateCcw,
  CloudDownload,
  ArrowDownToLine,
  ListFilter,
  FileSearch,
  Play
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { GroupType, ImportItem, BasicUnitMap } from './types';
import { processImportData } from './geminiService';

// --- Constants ---
const DB_NAME = "MisaAmisMasterData";
const STORE_NAME = "MasterData_V7";
const SYSTEM_PASSWORD = "admin271235";
const GG_SHEET_MASTER_URL_KEY = "MISA_AMIS_GG_SHEET_MASTER_URL";
// Cập nhật link mặc định mới theo yêu cầu
const DEFAULT_MASTER_SHEET_URL = "https://docs.google.com/spreadsheets/d/1-2j4XORAarGnhir9WDCSqSbuXNJ2lkh_v81c1QlFN_Q/edit?gid=1956479221#gid=1956479221";

// --- Sub-components ---

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 transition-all hover:shadow-md">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-[14px] text-slate-500 font-bold uppercase tracking-tight">{title}</p>
      <p className="text-xl font-black text-black">{value}</p>
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
    className={`relative flex flex-col items-start p-5 rounded-xl border-2 transition-all text-left w-full h-full
      ${isSelected 
        ? `${color} border-current shadow-md scale-[1.02]` 
        : 'border-slate-200 bg-white hover:border-slate-300'}`}
  >
    <div className="flex items-center gap-2 mb-2">
      <span className={`w-2 h-2 rounded-full ${isSelected ? 'animate-pulse bg-current' : 'bg-slate-300'}`}></span>
      <h3 className="font-bold text-[14px]">[{type}]</h3>
    </div>
    <p className="text-[12px] text-slate-600 leading-relaxed font-medium">{description}</p>
    {isSelected && (
      <div className="absolute top-4 right-4 text-current">
        <CheckCircle2 className="w-5 h-5" />
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
      <div className="bg-white/10 backdrop-blur-3xl p-14 rounded-[64px] border-2 border-white/20 w-full max-w-lg shadow-2xl relative text-[12px]">
        <div className="flex flex-col items-center mb-14">
          <div className="p-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[40px] shadow-2xl shadow-blue-500/40 mb-10 group">
            <Lock className="w-14 h-14 text-white group-hover:scale-110 transition-transform" />
          </div>
          <h1 className="text-[16px] font-black text-white tracking-tighter uppercase text-center mb-4">Security Access</h1>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.5em]">MISA AMIS IMPORT PRO V11.5</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="relative group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mã bảo mật hệ thống..."
              className={`w-full px-8 py-6 bg-white/5 border-2 rounded-[24px] text-white font-black text-center text-xl outline-none transition-all
                ${error ? 'border-red-500 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'border-white/10 focus:border-blue-500 focus:bg-white/10'}`}
              autoFocus
            />
            {error && <p className="text-red-400 text-[10px] font-black uppercase text-center mt-4 animate-bounce">Xác thực thất bại!</p>}
          </div>
          <button type="submit" className="w-full py-6 bg-white text-[#0f172a] rounded-[24px] font-black uppercase tracking-[0.3em] text-[12px] flex items-center justify-center gap-4 hover:bg-blue-500 hover:text-white transition-all active:scale-95 group shadow-xl">Vào hệ thống <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" /></button>
        </form>
      </div>
    </div>
  );
};

// --- Nâng cấp SQL Master Data Engine Modal V11.5 ---
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

  // Xuất file Excel Master Data - ĐVT Quy đổi
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
      let gid = "0";
      
      const sheetIdMatch = targetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (sheetIdMatch) sheetId = sheetIdMatch[1];
      
      const gidMatch = targetUrl.match(/gid=([0-9]+)/);
      if (gidMatch) gid = gidMatch[1];

      if (!sheetId) throw new Error("Link Google Sheet không hợp lệ.");

      // SỬ DỤNG PHƯƠNG PHÁP TRÍCH XUẤT CSV TRỰC TIẾP ĐỂ VƯỢT GIỚI HẠN 77 DÒNG
      const fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

      const response = await fetch(fetchUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error("Không thể kết nối Google Sheet. Hãy chắc chắn link được chia sẻ 'Bất kỳ ai có liên kết đều có thể xem'.");
      
      const csvData = await response.text();
      
      const workbook = XLSX.read(csvData, { type: 'string', codepage: 65001 });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: "" });

      if (jsonData.length <= 1) throw new Error("Tệp không có dữ liệu hàng hóa.");

      const learnedData: BasicUnitMap = {};
      
      // Lặp qua tất cả các dòng, bỏ qua tiêu đề
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length < 2) continue;

        const code = String(row[0] || "").trim();
        const name = String(row[1] || "").trim();
        const unit = String(row[2] || "").trim();
        const vat = String(row[3] || "8%").trim();
        const group = String(row[4] || "Hàng hóa").trim();

        if (code && code !== "" && code !== "null" && code !== "Mã Hàng") {
          learnedData[code] = {
            itemName: name,
            basicUnit: unit,
            vat: vat,
            groupName: group
          };
        }
      }

      const totalFound = Object.keys(learnedData).length;
      if (totalFound === 0) throw new Error("Không tìm thấy mã hàng nào trong danh sách.");

      if (targetUrl !== DEFAULT_MASTER_SHEET_URL) {
        localStorage.setItem(GG_SHEET_MASTER_URL_KEY, targetUrl);
      }

      onUpdateMap(learnedData, isReload ? 'replace' : 'update');
      setLastSyncCount(totalFound);
      setIsEditUrl(false);

    } catch (err: any) {
      console.error("Sync Error:", err);
      setSyncError(`Đồng bộ thất bại: ${err.message}.`);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-6 bg-slate-900/96 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-[1550px] overflow-hidden border border-white/20 flex flex-col h-[92vh] text-[14px]">
        
        {/* Header UI Mới: Hiện đại và tinh tế */}
        <div className="px-12 py-8 border-b flex justify-between items-center bg-white/80 sticky top-0 z-20">
          <div className="flex items-center gap-8">
            <div className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[28px] shadow-2xl shadow-indigo-600/30">
              <Database className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-[26px] font-black text-slate-900 uppercase tracking-tighter leading-none">SQL MASTER DATA ENGINE V11.5</h2>
              <p className="text-[12px] text-indigo-600 font-black uppercase tracking-[0.4em] mt-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Infinite Sync Pipeline Activated
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleDownloadMaster} className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[12px] hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-900/10">
              <ArrowDownToLine className="w-5 h-5" /> Tải về ĐVT Quy đổi
            </button>
            <button onClick={onClose} className="p-4 hover:bg-slate-100 rounded-full text-slate-300 transition-all active:scale-90">
              <X className="w-10 h-10" />
            </button>
          </div>
        </div>

        {/* Nội dung chính Modal */}
        <div className="flex-1 p-12 flex flex-col gap-10 overflow-hidden bg-slate-50/40">
          
          {/* Section: Đồng bộ & Link */}
          <div className="bg-white p-10 rounded-[40px] border shadow-sm flex flex-col gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
              <div className="lg:col-span-8 w-full">
                <p className="text-[11px] font-black text-indigo-500 uppercase tracking-widest mb-4 px-1 flex items-center gap-3">
                  <Globe className="w-4 h-4" /> NGUỒN DỮ LIỆU GOOGLE SHEET (MASTER DATA)
                </p>
                <div className="relative group">
                  <Link className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-indigo-300" />
                  <input 
                    type="text" 
                    placeholder="Link Google Sheet Master..." 
                    className={`w-full pl-16 pr-10 py-6 bg-slate-50/50 border-2 rounded-[24px] text-[15px] font-bold outline-none transition-all ${!isEditUrl ? 'text-slate-400 border-transparent cursor-not-allowed' : 'focus:border-indigo-500 shadow-sm border-slate-200 bg-white'}`}
                    value={ggSheetUrl}
                    disabled={!isEditUrl || isSyncing}
                    onChange={(e) => setGgSheetUrl(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="lg:col-span-4 flex gap-4">
                {!isEditUrl ? (
                  <button onClick={() => setIsEditUrl(true)} className="flex-1 py-6 bg-white text-indigo-600 border-2 border-indigo-100 rounded-[24px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center justify-center gap-3">
                    <Edit3 className="w-5 h-5" /> Sửa Link
                  </button>
                ) : (
                  <button onClick={() => { setIsEditUrl(false); handleSyncGgSheet(false); }} className="flex-1 py-6 bg-emerald-600 text-white rounded-[24px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-3">
                    <Check className="w-5 h-5" /> Lưu Link
                  </button>
                )}
                <button 
                  onClick={() => handleSyncGgSheet(true)} 
                  disabled={isSyncing}
                  className="flex-1 py-6 bg-indigo-600 text-white rounded-[24px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/20 hover:bg-indigo-700 flex items-center justify-center gap-4 transition-all active:scale-95"
                >
                  {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />} Cập Nhật
                </button>
              </div>
            </div>

            {/* Thông báo kết quả */}
            {syncError && (
               <div className="bg-rose-50 border border-rose-100 p-6 rounded-[24px] flex items-center gap-5 animate-in slide-in-from-top-2">
                  <div className="p-3 bg-rose-100 rounded-xl text-rose-500"><TriangleAlert className="w-6 h-6" /></div>
                  <p className="text-[14px] font-bold text-rose-900">{syncError}</p>
               </div>
            )}

            {lastSyncCount !== null && !syncError && (
              <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[24px] flex items-center gap-5 animate-in slide-in-from-top-2">
                 <div className="p-3 bg-emerald-100 rounded-xl text-emerald-500"><CheckCircle2 className="w-6 h-6" /></div>
                 <p className="text-[14px] font-black text-emerald-900 uppercase tracking-tight">Thành công: Đã ghi nhận tổng cộng {lastSyncCount} mã hàng từ Google Sheet!</p>
              </div>
            )}
          </div>

          {/* Section: Danh sách & Tra cứu */}
          <div className="flex-1 bg-white border rounded-[48px] overflow-hidden flex flex-col shadow-sm border-slate-200/60">
            <div className="px-10 py-8 border-b bg-white flex flex-col md:flex-row items-center gap-8">
              <div className="relative flex-1 w-full group">
                <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-7 h-7 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder={`Tra cứu nhanh trong ${Object.keys(currentMap).length} sản phẩm đã đồng bộ...`}
                  className="w-full pl-18 pr-10 py-5 bg-slate-50/50 border-2 border-transparent rounded-[24px] text-[17px] font-bold outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-6 px-8 py-4 bg-slate-50 rounded-[20px] border">
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Tổng sản phẩm</p>
                  <p className="text-xl font-black text-slate-900">{Object.keys(currentMap).length}</p>
                </div>
                <div className="w-[1px] h-8 bg-slate-200"></div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Đang lọc</p>
                  <p className="text-xl font-black text-indigo-600">{filteredMapEntries.length}</p>
                </div>
              </div>
            </div>

            <div className="overflow-auto flex-1 scrollbar-thin">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                 <thead className="sticky top-0 bg-white z-10">
                    <tr className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] border-b">
                       <th className="px-12 py-7">Mã Sản Phẩm</th>
                       <th className="px-12 py-7">Tên Sản Phẩm Tham Chiếu</th>
                       <th className="px-12 py-7 text-center">ĐVT Hệ Thống</th>
                       <th className="px-12 py-7 text-center">Thuế VAT</th>
                       <th className="px-12 py-7 text-right">Nhóm Hàng</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 font-bold text-slate-700">
                    {filteredMapEntries.length > 0 ? filteredMapEntries.map(([code, info]) => (
                      <tr key={code} className="hover:bg-indigo-50/30 transition-all group border-b border-slate-50/80">
                         <td className="px-12 py-6 font-mono text-slate-400 group-hover:text-indigo-600 transition-colors text-[15px]">{code}</td>
                         <td className="px-12 py-6 text-[16px] text-slate-900 leading-tight">{info.itemName}</td>
                         <td className="px-12 py-6 text-center">
                            <span className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase border-2 ${info.basicUnit.toLowerCase() === 'thùng' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                              {info.basicUnit}
                            </span>
                         </td>
                         <td className="px-12 py-6 text-center text-[14px] text-slate-500 group-hover:text-slate-900 transition-colors">{info.vat || '8%'}</td>
                         <td className="px-12 py-6 text-right">
                            <span className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase border border-slate-200/60">
                              {info.groupName || 'Hàng hóa'}
                            </span>
                         </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="py-60 text-center opacity-20">
                          <div className="flex flex-col items-center gap-10">
                            <PackageSearch className="w-32 h-32 text-indigo-200" />
                            <p className="font-black uppercase tracking-[1em] text-slate-400">Dữ liệu rỗng</p>
                          </div>
                        </td>
                      </tr>
                    )}
                 </tbody>
              </table>
            </div>
            
            <div className="px-12 py-6 bg-slate-50/80 border-t flex justify-between items-center text-[12px] font-black uppercase tracking-[0.3em] text-slate-400">
               <div className="flex items-center gap-4">
                  <Activity className="w-5 h-5 text-indigo-400" /> System: Cloud-Enabled
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  Database Master V11.5 - Optimal Height View
               </div>
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
      <div className="bg-white rounded-[64px] shadow-2xl w-full max-w-[800px] overflow-hidden border flex flex-col p-14 text-[14px]">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-600/20"><Cpu className="w-8 h-8 text-white" /></div>
            <div>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Mapping Pro Engine</h2>
              <p className="text-[12px] text-emerald-600 font-black uppercase tracking-widest mt-1">Advanced ETL Logic V11.5</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-slate-100 rounded-full text-slate-300 transition-all"><X className="w-8 h-8" /></button>
        </div>
        <div className="space-y-6">
          <div className="p-8 bg-slate-50 rounded-[32px] border-2 border-slate-100">
            <h3 className="font-black text-slate-800 uppercase mb-4 flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-emerald-500" /> AI Logic Status</h3>
            <ul className="space-y-3 text-slate-600 font-medium">
              <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Tự động nhận diện định dạng KIDO/UNICHARM/COLGATE</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Xử lý dính chữ OCR quy mô lớn (>2000 dòng)</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Trích xuất 100% dòng hàng tặng (Đơn giá 0)</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Đồng bộ mã hàng từ SQL Master</li>
            </ul>
          </div>
          <div className="p-8 bg-blue-50 rounded-[32px] border-2 border-blue-100">
             <h3 className="font-black text-blue-800 uppercase mb-4 flex items-center gap-3"><Info className="w-5 h-5 text-blue-500" /> Hướng dẫn</h3>
             <p className="text-blue-700 leading-relaxed font-medium">Hệ thống Mapping Pro hoạt động ngầm định trong quá trình xử lý file. Mọi thay đổi logic được cập nhật tự động từ máy chủ ETL Core.</p>
          </div>
        </div>
        <button onClick={onClose} className="mt-10 w-full py-6 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest hover:bg-black transition-all">Đóng cửa sổ</button>
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
        let finalGroup = 'Chưa phân nhóm';
        
        if (mappedInfo) {
          finalGroup = mappedInfo.groupName || 'Chưa phân nhóm';
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

        return { 
          ...item, 
          unit: finalUnit, 
          mappingStatus: status, 
          mappingNote: note, 
          groupName: finalGroup
        };
      });
      setResults(processedData);
      setPendingFile(null); // Clear pending file after processing
    } catch (err: any) { 
      console.error(err); 
      alert("Lỗi khi xử lý dữ liệu AI. Vui lòng thử lại.");
    } finally { 
      setIsProcessing(false); 
    }
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
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 font-sans animate-in fade-in duration-700 text-[12px]">
      <BasicUnitModal isOpen={isBasicUnitOpen} onClose={() => setIsBasicUnitOpen(false)} currentMap={basicUnitMap} onUpdateMap={updateBasicUnitMap} />
      <EInvoiceModal isOpen={isEInvoiceOpen} onClose={() => setIsEInvoiceOpen(false)} />
      
      <aside className="w-full lg:w-[300px] bg-[#0f172a] text-white p-8 hidden lg:flex flex-col border-r border-slate-800 shadow-2xl">
        <div className="flex items-center gap-5 mb-14"><div className="bg-blue-600 p-3.5 rounded-[18px] shadow-xl shadow-blue-600/20"><BarChart3 className="w-7 h-7" /></div><span className="font-black text-[16px] tracking-tighter uppercase">MISA AMIS</span></div>
        <nav className="space-y-6 flex-1">
          <button className="w-full flex items-center gap-4 px-6 py-4 bg-blue-600/10 text-blue-400 rounded-[20px] font-black uppercase"><LayoutDashboard className="w-5 h-5" />Dashboard</button>
          <div className="space-y-4 pt-4">
            <p className="px-6 text-[10px] font-black uppercase text-white/20 tracking-widest">Hệ Thống AI</p>
            <button onClick={() => setIsBasicUnitOpen(true)} className="w-full flex items-center gap-5 px-6 py-4 bg-indigo-600/10 text-indigo-400 rounded-[20px] transition-all hover:bg-indigo-600/20 group"><PackageSearch className="w-5 h-5 group-hover:scale-110 transition-transform" /><div className="text-left font-black block text-[13px] uppercase">SQL Master</div></button>
            <button onClick={() => setIsEInvoiceOpen(true)} className="w-full flex items-center gap-5 px-6 py-4 bg-emerald-600/10 text-emerald-400 rounded-[20px] transition-all hover:bg-emerald-600/20 group"><Cpu className="w-5 h-5 group-hover:scale-110 transition-transform" /><div className="text-left font-black block text-[13px] uppercase">Mapping Pro</div></button>
          </div>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b px-8 py-5 sticky top-0 z-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6"><h1 className="text-[16px] font-black text-slate-900 flex items-center gap-3 uppercase"><Zap className="w-8 h-8 text-blue-600" />ETL CORE V11.5</h1>{originalFileName && <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-xl border font-black text-slate-500 uppercase">{originalFileName}</div>}</div>
          {results.length > 0 && (
            <div className="flex gap-3">
              <button onClick={() => { setResults([]); setOriginalFileName(null); setPendingFile(null); }} className="px-5 py-2.5 border-2 rounded-xl font-black uppercase text-slate-500 hover:bg-slate-50 transition-all">Làm mới</button>
              <button onClick={exportToMauBanHangMisa} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-black uppercase flex items-center gap-3 shadow-lg hover:bg-emerald-700 transition-all active:scale-95"><FileUp className="w-4 h-4" /> BÁN HÀNG MISA</button>
              <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-black uppercase flex items-center gap-3 shadow-lg hover:bg-blue-700 transition-all active:scale-95"><FileText className="w-4 h-4" /> AMIS IMPORT</button>
            </div>
          )}
        </header>

        <div className="p-8 max-w-[1900px] mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard title="Số Đơn Hàng" value={String(new Set(results.map(r => r.orderId)).size)} icon={Package} color="bg-blue-600" />
            <StatCard title="Giá Trị Net" value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)} icon={FileSpreadsheet} color="bg-indigo-600" />
            <StatCard title="Số Dòng ETL" value={String(results.length)} icon={ShoppingBag} color="bg-emerald-600" />
          </div>

          {!results.length ? (
            <div className="bg-white p-12 rounded-[48px] shadow-sm border animate-in fade-in zoom-in-95 duration-500">
              <h2 className="text-[14px] font-black mb-8 flex items-center gap-3 text-slate-800 uppercase tracking-widest"><Settings2 className="w-6 h-6 text-blue-600" />Chọn nhóm nghiệp vụ:</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <GroupCard type={GroupType.KIDO} isSelected={selectedGroup === GroupType.KIDO} onClick={() => setSelectedGroup(GroupType.KIDO)} description="KIDO: Tách mã [xxxx], giữ VIPSHOP/ONTOP & KM." color="text-red-600 border-red-100" />
                <GroupCard type={GroupType.UNICHARM} isSelected={selectedGroup === GroupType.UNICHARM} onClick={() => setSelectedGroup(GroupType.UNICHARM)} description="UNICHARM: Phục hồi 100% quà tặng KM đơn giá 0." color="text-blue-600 border-blue-100" />
                <GroupCard type={GroupType.COLGATE} isSelected={selectedGroup === GroupType.COLGATE} onClick={() => setSelectedGroup(GroupType.COLGATE)} description="COLGATE: V11.5 Sync, tối ưu quà tặng & mã CP." color="text-yellow-600 border-yellow-100" />
                <GroupCard type={GroupType.KIOTVIET_NPP} isSelected={selectedGroup === GroupType.KIOTVIET_NPP} onClick={() => setSelectedGroup(GroupType.KIOTVIET_NPP)} description="KIOTVIET: Clean mã -TH, trích xuất trả thưởng đơn giá 0." color="text-indigo-600 border-indigo-100" />
              </div>
              {selectedGroup && (
                <div className="space-y-8">
                  <div className="flex flex-col items-center justify-center border-4 border-dashed rounded-[48px] p-24 bg-slate-50/50 hover:border-blue-400 transition-all cursor-pointer relative group animate-in slide-in-from-bottom-4 overflow-hidden">
                    <div className="bg-white p-10 rounded-[32px] shadow-xl mb-6 group-hover:scale-105 transition-transform">
                      {isProcessing ? <Loader2 className="w-16 h-16 text-blue-600 animate-spin" /> : pendingFile ? <FileCheck className="w-16 h-16 text-emerald-500" /> : <UploadCloud className="w-16 h-16 text-blue-600" />}
                    </div>
                    <label className="cursor-pointer text-center relative z-10">
                      <input type="file" accept=".pdf,image/*" className="hidden" onChange={handleFileSelect} disabled={isProcessing} />
                      <span className="px-14 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase inline-block shadow-lg hover:bg-blue-700 transition-all active:scale-95 shadow-blue-600/20">
                        {pendingFile ? "Đã chọn phiếu (Click để thay đổi)" : "TẢI PHIẾU GIAO HÀNG / HÓA ĐƠN GỐC"}
                      </span>
                    </label>
                    {pendingFile && <p className="mt-4 text-[13px] font-black text-emerald-600 uppercase tracking-widest">{originalFileName}</p>}
                  </div>

                  {pendingFile && !isProcessing && (
                    <div className="flex justify-center animate-in zoom-in-50 duration-300">
                      <button 
                        onClick={handleProcessData}
                        className="px-20 py-6 bg-gradient-to-r from-indigo-600 to-blue-700 text-white rounded-[32px] font-black uppercase text-[16px] tracking-[0.2em] shadow-2xl shadow-indigo-600/40 hover:scale-105 transition-all active:scale-95 flex items-center gap-5 border-4 border-white/20"
                      >
                        <Play className="w-8 h-8 fill-current" /> XỬ LÝ DỮ LIỆU PGH
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-[32px] shadow-sm border overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-600">
              <div className="p-8 border-b bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-6">
                <h2 className="text-[14px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-4"><ClipboardList className="w-6 h-6 text-blue-600" />Bảng Kết Quả AI Trích Xuất (Output Black Color)</h2>
                <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-2xl border shadow-sm">
                   <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Thuế GTGT (VAT):</span>
                   <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="radio" name="vat" checked={vatRate === 0.08} onChange={() => setVatRate(0.08)} className="w-4 h-4 text-blue-600" />
                        <span className={`text-[11px] font-black uppercase transition-all ${vatRate === 0.08 ? 'text-blue-600 font-black' : 'text-slate-400'}`}>8% (Mặc định)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="radio" name="vat" checked={vatRate === 0.1} onChange={() => setVatRate(0.1)} className="w-4 h-4 text-blue-600" />
                        <span className={`text-[11px] font-black uppercase transition-all ${vatRate === 0.1 ? 'text-blue-600 font-black' : 'text-slate-400'}`}>10%</span>
                      </label>
                   </div>
                </div>
              </div>
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left min-w-[2400px] text-black border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b sticky top-0 z-10">
                      <th className="px-8 py-5 border-b border-slate-200">SỐ PHIẾU</th>
                      <th className="px-8 py-5 w-12 text-center border-b border-slate-200">STT</th>
                      <th className="px-8 py-5 border-b border-slate-200">NHÂN VIÊN BH</th>
                      <th className="px-8 py-5 border-b border-slate-200">MÃ HÀNG</th>
                      <th className="px-8 py-5 border-b border-slate-200">TÊN SẢN PHẨM (TRÍCH XUẤT)</th>
                      <th className="px-8 py-5 border-b border-slate-200">NHÓM SQL</th>
                      <th className="px-8 py-5 text-center border-b border-slate-200">ĐVT</th>
                      <th className="px-8 py-5 text-right border-b border-slate-200">SL</th>
                      <th className="px-8 py-5 text-right bg-blue-50/20 text-blue-600 font-black border-b border-slate-200">GIÁ - VAT</th>
                      <th className="px-8 py-5 text-right bg-amber-50/20 text-amber-600 font-black border-b border-slate-200">(vat)</th>
                      <th className="px-8 py-5 text-right border-b border-slate-200">ĐƠN GIÁ</th>
                      <th className="px-8 py-5 text-right text-indigo-800 border-b border-slate-200">THÀNH TIỀN (NET)</th>
                      <th className="px-8 py-5 text-center text-emerald-600 border-b border-slate-200">CK%</th>
                      <th className="px-8 py-5 text-right font-black text-blue-900 border-b border-slate-200">THANH TOÁN</th>
                      <th className="px-8 py-5 text-right border-b border-slate-200">TRẠNG THÁI AI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-bold text-black">
                    {results.map((item, idx) => {
                      const netPricePerUnit = Math.round(item.unitPrice / (1 + vatRate));
                      const vatPerUnit = item.unitPrice - netPricePerUnit;
                      const netAmount = Math.round(item.amount / (1 + vatRate));
                      return (
                        <tr key={idx} className={`hover:bg-slate-50 transition-colors ${item.mappingStatus === 'error' ? 'bg-red-50/10' : item.unitPrice === 0 ? 'bg-amber-50/10' : ''}`}>
                          <td className="px-8 py-5 font-black text-slate-400">{item.orderId}</td>
                          <td className="px-8 py-5 text-center opacity-30">{idx + 1}</td>
                          <td className="px-8 py-5 uppercase flex items-center gap-2"><UserCheck className="w-4 h-4 text-blue-500" />{item.salesPerson || '---'}</td>
                          <td className="px-8 py-5 font-mono font-black">{item.itemCode}</td>
                          <td className="px-8 py-5 flex items-center gap-3">
                            {item.unitPrice === 0 && <Gift className="w-4 h-4 text-amber-500" />}
                            {item.itemName}
                          </td>
                          <td className="px-8 py-5"><span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] uppercase font-black">{item.groupName}</span></td>
                          <td className="px-8 py-5 text-center uppercase">{item.unit}</td>
                          <td className="px-8 py-5 text-right font-black text-[13px]">{item.quantity}</td>
                          <td className="px-8 py-5 text-right text-blue-700 bg-blue-50/5 font-black">{new Intl.NumberFormat('vi-VN').format(netPricePerUnit)}</td>
                          <td className="px-8 py-5 text-right text-amber-700 bg-amber-50/5 font-black">{new Intl.NumberFormat('vi-VN').format(vatPerUnit)}</td>
                          <td className="px-8 py-5 text-right">{item.unitPrice === 0 ? 'HÀNG TẶNG' : new Intl.NumberFormat('vi-VN').format(item.unitPrice)}</td>
                          <td className="px-8 py-5 text-right text-indigo-800 font-black">{new Intl.NumberFormat('vi-VN').format(netAmount)}</td>
                          <td className="px-8 py-5 text-center">{item.discountRate}%</td>
                          <td className="px-8 py-5 text-right font-black text-[13px] text-blue-900 tracking-tighter">{new Intl.NumberFormat('vi-VN').format(item.afterDiscountAmount)}</td>
                          <td className="px-8 py-5 text-right"><span className={`px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase ${item.mappingStatus === 'error' ? 'bg-rose-100 border-rose-200 text-rose-700' : 'bg-emerald-100 border-emerald-200 text-emerald-700'}`}>{item.mappingNote}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
