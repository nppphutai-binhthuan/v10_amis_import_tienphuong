
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
  Gift
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { GroupType, ImportItem, BasicUnitMap } from './types';
import { processImportData } from './geminiService';

// --- Constants ---
const SPECIAL_KEYWORDS = ["Vipshop", "ONTOP", "Trả Thưởng", "Tích Lũy", "Trưng Bày"];
const DB_NAME = "MisaAmisMasterData";
const STORE_NAME = "MasterData_V7";
const SYSTEM_PASSWORD = "admin271235";

// --- Sub-components ---

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 transition-all hover:shadow-md">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <p className="text-xl font-bold text-slate-900">{value}</p>
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
      <span className={`w-3 h-3 rounded-full ${isSelected ? 'animate-pulse bg-current' : 'bg-slate-300'}`}></span>
      <h3 className="font-bold text-lg">[{type}]</h3>
    </div>
    <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    {isSelected && (
      <div className="absolute top-4 right-4 text-current">
        <CheckCircle2 className="w-6 h-6" />
      </div>
    )}
  </button>
);

// --- Login Component ---
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950 p-4">
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-2xl p-10 rounded-[40px] border border-white/20 w-full max-w-md shadow-2xl relative">
        <div className="flex flex-col items-center mb-10">
          <div className="p-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-2xl shadow-blue-500/40 mb-6">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase text-center">Security Access</h1>
          <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.3em] mt-2">MISA AMIS IMPORT PRO V10.2</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mã bảo mật..."
              className={`w-full px-6 py-5 bg-white/5 border-2 rounded-2xl text-white font-black text-center text-lg outline-none transition-all
                ${error ? 'border-red-500 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'border-white/10 focus:border-blue-500 focus:bg-white/10'}`}
              autoFocus
            />
            {error && <p className="text-red-400 text-[10px] font-black uppercase text-center mt-3 animate-bounce">Sai mật khẩu truy cập!</p>}
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-500 hover:text-white transition-all active:scale-95 group shadow-xl shadow-white/5"
          >
            Xác thực hệ thống <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-white/20 text-[9px] font-black uppercase tracking-widest">Authorized Personnel Only</p>
        </div>
      </div>
    </div>
  );
};

// --- Basic Unit Management Modal ---
const BasicUnitModal = ({ 
  isOpen, 
  onClose, 
  onUpdateMap, 
  onUpdateSingle,
  currentMap 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onUpdateMap: (map: BasicUnitMap, mode: 'replace' | 'update') => void,
  onUpdateSingle: (code: string, info: { itemName: string, basicUnit: string, groupName: string }) => void,
  currentMap: BasicUnitMap 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [tempData, setTempData] = useState<BasicUnitMap | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<{code: string, unit: string} | null>(null);
  const [viewingItem, setViewingItem] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const findVal = (row: any, keys: string[]) => {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== "") return String(row[k]).trim();
    }
    const rowKeys = Object.keys(row);
    for (const searchKey of keys) {
      const match = rowKeys.find(rk => rk.trim().toLowerCase() === searchKey.toLowerCase());
      if (match && row[match] !== undefined && row[match] !== null && String(row[match]).trim() !== "") {
        return String(row[match]).trim();
      }
    }
    return "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(worksheet) as any[];
        const newMap: BasicUnitMap = {};
        
        json.forEach(row => {
          const code = findVal(row, ['Mã Hàng', 'Mã Sản phẩm', 'Ma Hang', 'Mã hàng', 'Product Code', 'Mã HH']);
          const unit = findVal(row, ['ĐVT cơ bản', 'ĐVT', 'Don vi tinh', 'Đơn vị tính', 'Unit']);
          const name = findVal(row, ['Tên Hàng', 'Ten Hang', 'Tên sản phẩm', 'Tên hàng', 'Product Name', 'Tên HH']);
          const group = findVal(row, ['Nhóm Hàng', 'Nhom Hang', 'Nhóm sản phẩm', 'Nhóm hàng', 'Category', 'Nhóm']);
          
          if (code && unit) {
            newMap[code] = { 
              itemName: name || 'Chưa cập nhật tên SQL', 
              basicUnit: unit, 
              groupName: group || 'Chưa phân nhóm' 
            };
          }
        });
        
        if (Object.keys(newMap).length === 0) {
          alert("Lỗi: Không tìm thấy dữ liệu hợp lệ.");
          setFileName(null);
        } else {
          setTempData(newMap);
        }
      } catch (err) {
        alert("Lỗi khi đọc file.");
      } finally { setIsProcessing(false); }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    const item = currentMap[editingItem.code];
    if (item) {
      onUpdateSingle(editingItem.code, { ...item, basicUnit: editingItem.unit, groupName: item.groupName || 'Chưa phân nhóm' });
      setEditingItem(null);
    }
  };

  const exportCurrentMaster = () => {
    const data = Object.entries(currentMap).map(([code, info]) => ({
      'Mã Hàng': code,
      'Tên Hàng': info.itemName,
      'ĐVT cơ bản': info.basicUnit,
      'Nhóm Hàng': info.groupName || 'Chưa phân nhóm'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MasterData_SQL");
    XLSX.writeFile(wb, "SQL_Database_Backup.xlsx");
  };

  const filteredMapEntries = useMemo(() => {
    return Object.entries(currentMap).filter(([code, info]) => 
      code.toLowerCase().includes(searchQuery.toLowerCase()) || 
      info.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (info.groupName && info.groupName.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 100); 
  }, [currentMap, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl overflow-hidden border border-slate-200 flex flex-col h-[90vh]">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200"><PackageSearch className="w-6 h-6 text-white" /></div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">SQL Master Data Engine</h2>
              <p className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.2em]">Cấu hình Nhóm & ĐVT chuẩn</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={exportCurrentMaster} className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 border border-indigo-200 rounded-xl text-xs font-black shadow-sm hover:bg-indigo-50 transition-all active:scale-95">
              <Download className="w-4 h-4" /> SAO LƯU SQL
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-all"><X className="w-6 h-6 text-slate-400" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col p-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
             <div className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-3 flex items-center gap-6 shadow-inner">
                <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Số Record SQL</p><p className="text-xl font-black text-slate-800">{Object.keys(currentMap).length.toLocaleString()}</p></div>
                <div className="w-px h-8 bg-slate-200"></div>
                <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Trạng thái</p><div className="flex items-center gap-1 text-emerald-600 font-black text-xs uppercase"><ShieldCheck className="w-3 h-3" /> SQL Encrypted</div></div>
             </div>
             <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Tra cứu nhanh mã hàng, tên hoặc nhóm sản phẩm..." 
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-6">
            <div className="lg:w-3/4 border border-slate-100 rounded-3xl overflow-hidden flex flex-col bg-white shadow-sm">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-500 grid grid-cols-12 gap-4 tracking-widest">
                <span className="col-span-2">Mã Hàng</span>
                <span className="col-span-4">Tên Sản Phẩm (SQL)</span>
                <span className="col-span-3">Nhóm Hàng</span>
                <span className="col-span-1 text-right">ĐVT</span>
                <span className="col-span-2 text-right">Thao tác</span>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                {filteredMapEntries.length > 0 ? (
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-slate-50 text-xs">
                      {filteredMapEntries.map(([code, info]) => (
                        <tr key={code} className="hover:bg-slate-50/50 transition-colors group grid grid-cols-12 gap-4 items-center">
                          <td className="px-6 py-4 font-black text-slate-400 col-span-2 uppercase">{code}</td>
                          <td className="px-6 py-4 text-slate-800 font-bold truncate col-span-4">{info.itemName}</td>
                          <td className="px-6 py-4 col-span-3">
                            <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-black text-[9px] uppercase tracking-tighter truncate max-w-full inline-block border border-indigo-100/50">
                              {info.groupName}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right col-span-1">
                             {editingItem?.code === code ? (
                               <input 
                                 className="w-full px-2 py-1 bg-white border-2 border-indigo-500 rounded-lg text-right outline-none font-black text-indigo-600"
                                 value={editingItem.unit}
                                 autoFocus
                                 onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                                 onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                               />
                             ) : (
                               <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-black uppercase text-[10px] shadow-sm">{info.basicUnit}</span>
                             )}
                          </td>
                          <td className="px-6 py-4 text-right col-span-2 flex justify-end gap-2">
                             {editingItem?.code === code ? (
                               <button onClick={handleSaveEdit} className="p-2 bg-emerald-500 text-white rounded-lg shadow-lg hover:bg-emerald-600"><Check className="w-3.5 h-3.5" /></button>
                             ) : (
                               <>
                                 <button onClick={() => setViewingItem(code)} className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200" title="Xem chi tiết"><Eye className="w-3.5 h-3.5" /></button>
                                 <button onClick={() => setEditingItem({code, unit: info.basicUnit})} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" title="Sửa ĐVT"><Edit3 className="w-3.5 h-3.5" /></button>
                               </>
                             )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full opacity-20 p-20 grayscale">
                    <Database className="w-24 h-24 mb-4" />
                    <p className="font-black uppercase tracking-widest text-sm text-center">SQL Engine rỗng</p>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:w-1/4 flex flex-col gap-4">
               {viewingItem && currentMap[viewingItem] && (
                 <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl space-y-4 border border-white/10 animate-in zoom-in duration-300">
                    <div className="flex justify-between items-start">
                      <h4 className="font-black uppercase text-[10px] tracking-widest text-indigo-400">CHI TIẾT MÃ SQL</h4>
                      <button onClick={() => setViewingItem(null)} className="p-1 hover:bg-white/10 rounded-lg"><X className="w-4 h-4 text-white/40" /></button>
                    </div>
                    <div className="space-y-4 pt-2 divide-y divide-white/5">
                       <div className="pb-3"><p className="text-[9px] font-black opacity-40 uppercase mb-1">Mã Sản Phẩm</p><p className="font-mono text-lg font-black text-indigo-300 uppercase">{viewingItem}</p></div>
                       <div className="py-3"><p className="text-[9px] font-black opacity-40 uppercase mb-1">Tên Chuẩn SQL</p><p className="font-bold text-sm leading-snug">{currentMap[viewingItem].itemName}</p></div>
                       <div className="py-3"><p className="text-[9px] font-black opacity-40 uppercase mb-1">Nhóm Ngành</p><p className="font-bold text-sm text-indigo-100">{currentMap[viewingItem].groupName}</p></div>
                       <div className="pt-3 flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                          <div><p className="text-[9px] font-black opacity-40 uppercase">ĐVT Cơ Bản</p><p className="font-black text-emerald-400 text-xl uppercase tracking-widest">{currentMap[viewingItem].basicUnit}</p></div>
                          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                       </div>
                    </div>
                 </div>
               )}

               {!tempData ? (
                <div className="flex-1 flex flex-col gap-4">
                  <label className="flex-1 relative flex flex-col items-center justify-center gap-4 w-full border-4 border-dashed rounded-3xl cursor-pointer hover:bg-indigo-50 border-slate-200 bg-white shadow-sm transition-all group overflow-hidden">
                    <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleFileChange} />
                    <div className="p-6 bg-indigo-50 rounded-2xl group-hover:scale-110 transition-transform"><UploadCloud className="w-10 h-10 text-indigo-600" /></div>
                    <div className="text-center px-4">
                      <span className="font-black text-slate-700 block text-sm">CẬP NHẬT DATABASE SQL</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1 block">Tên / Nhóm / Mã / ĐVT</span>
                    </div>
                  </label>
                  <button onClick={() => { if(confirm("XÁC NHẬN: Bạn muốn xóa toàn bộ và làm mới Database SQL?")) onUpdateMap({}, 'replace'); }} className="w-full py-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all group">
                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" /> THAY THẾ TOÀN BỘ SQL
                  </button>
                </div>
              ) : (
                <div className="bg-indigo-600 rounded-3xl p-6 text-white h-full flex flex-col justify-between shadow-xl animate-in zoom-in duration-300">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Hàng Chờ Cập Nhật</p>
                      <button onClick={() => setTempData(null)} className="p-1 hover:bg-white/10 rounded-lg"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-6 mb-6 text-center">
                       <p className="text-4xl font-black mb-1">{Object.keys(tempData).length.toLocaleString()}</p>
                       <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Sản phẩm phát hiện</p>
                    </div>
                    <p className="text-[10px] leading-relaxed opacity-80 font-medium text-center">Đồng bộ Tên/Nhóm/ĐVT vào SQL Master Data.</p>
                  </div>
                  <div className="space-y-3 pt-6">
                    <button onClick={() => { onUpdateMap(tempData, 'update'); setTempData(null); }} className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 shadow-lg hover:-translate-y-1 transition-all">
                      <CheckCircle2 className="w-4 h-4" /> XÁC NHẬN CẬP NHẬT
                    </button>
                    <button onClick={() => setTempData(null)} className="w-full py-3 text-white/50 hover:text-white font-black text-[10px] uppercase">HỦY BỎ</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ImportItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isBasicUnitOpen, setIsBasicUnitOpen] = useState(false);
  const [basicUnitMap, setBasicUnitMap] = useState<BasicUnitMap>({});

  const VAT_RATE = 0.08;

  useEffect(() => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "code" });
      }
    };
    request.onsuccess = (e: any) => {
      const db = e.target.result;
      loadMapFromDB(db);
    };
  }, []);

  const loadMapFromDB = (db: IDBDatabase) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const getAllReq = store.getAll();
    getAllReq.onsuccess = () => {
      const map: BasicUnitMap = {};
      getAllReq.result.forEach((item: any) => {
        map[item.code] = { itemName: item.name, basicUnit: item.unit, groupName: item.group };
      });
      setBasicUnitMap(map);
    };
  };

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
        store.put({ code, name: info.itemName, unit: info.basicUnit, group: info.groupName });
      });
    };
  };

  const updateSingleRecord = (code: string, info: { itemName: string, basicUnit: string, groupName: string }) => {
    setBasicUnitMap(prev => ({ ...prev, [code]: info }));
    const request = indexedDB.open(DB_NAME, 1);
    request.onsuccess = (e: any) => {
      const db = e.target.result;
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put({ code, name: info.itemName, unit: info.basicUnit, group: info.groupName });
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedGroup) return;
    setError(null);
    setIsProcessing(true);
    const mimeType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1];
        // Sử dụng Gemini 3 Flash V10.2 (Ghi nhận hàng 0 giá & giữ tên nguyên văn)
        const rawData = await processImportData(base64, mimeType, selectedGroup);
        
        const processedData = rawData.map(item => {
          const itemCodeTrimmed = item.itemCode.trim();
          const mappedInfo = basicUnitMap[itemCodeTrimmed];
          let finalUnit = item.unit;
          let status: 'success' | 'warning' | 'error' = 'success';
          let note = '';
          let groupName = 'Chưa phân nhóm';

          // LUÔN GIỮ TÊN HÀNG NGUYÊN VĂN TỪ PHIẾU (Yêu cầu quan trọng)
          const slipItemName = item.itemName;

          if (item.unit.toLowerCase().includes('lẻ') && mappedInfo?.basicUnit) {
            finalUnit = mappedInfo.basicUnit;
          }

          if (!mappedInfo) {
            status = 'error';
            note = 'Mã lạ (Không có trong SQL Master)';
          } else {
            groupName = mappedInfo.groupName || 'Chưa phân nhóm';
            note = item.unitPrice === 0 ? 'Hàng tặng/KM (Khớp SQL)' : 'Khớp SQL Master Data';
          }

          if (item.unitPrice === 0) {
            if (status !== 'error') status = 'warning';
          }

          const lowerName = slipItemName.toLowerCase();
          const specialMatch = SPECIAL_KEYWORDS.find(k => lowerName.includes(k.toLowerCase()));
          if (specialMatch) {
            status = 'warning';
            note = `Tham chiếu đặc biệt: ${specialMatch}`;
          }

          return { 
            ...item, 
            itemName: slipItemName, // Ép buộc sử dụng tên trích xuất từ phiếu
            unit: finalUnit, 
            mappingStatus: status, 
            mappingNote: note, 
            groupName 
          };
        });
        setResults(processedData);
      } catch (err: any) { 
        setError(err.message || 'Lỗi xử lý file.'); 
      } finally { 
        setIsProcessing(false); 
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const exportToMisaTemplate = () => {
    if (results.length === 0) return;
    const misaHeaders = [
      'Ngày đơn hàng (*)', 'Số đơn hàng (*)', 'Trạng thái', 'Ngày giao hàng', 'Tính giá thành',
      'Mã khách hàng', 'Tên khách hàng', 'Địa chỉ', 'Mã số thuế', 'Diễn giải',
      'Là đơn đặt hàng phát sinh trước khi sử dụng phần mềm', 'Mã hàng (*)', 'Tên hàng',
      'Là dòng ghi chú', 'Hàng khuyến mại', 'Mã kho', 'ĐVT', 'Số lượng', 'Đơn giá', 'Thành tiền',
      'Tỷ lệ CK (%)', 'Tiền chiết khấu', 'thuế GTGT', '% thuế suất KHAC', 'Tiền thuế GTGT', 'Biển kiểm soát'
    ];
    const misaRows = results.map(item => {
      const upVat = Math.round(item.unitPrice / (1 + VAT_RATE));
      const amVat = Math.round(item.amount / (1 + VAT_RATE));
      const dsVat = Math.round(item.discountAmount / (1 + VAT_RATE));
      const adVat = Math.round(item.afterDiscountAmount / (1 + VAT_RATE));
      const vatAmount = Math.round(adVat * VAT_RATE);
      return [
        '', item.orderId, 'Chưa thực hiện', '', 'Có', '', item.customerName, '', '', '', '', item.itemCode, item.itemName,
        '', item.unitPrice === 0 ? 'Có' : '', '', item.unit, item.quantity, upVat, amVat, item.discountRate, dsVat, 8, '', vatAmount, item.totalPayment
      ];
    });
    const fullData = [];
    fullData[0] = ["MISA AMIS ETL ENGINE V10.2 - LUÔN GIỮ TÊN HÀNG GỐC & TRÍCH XUẤT ĐẦY ĐỦ HÀNG TẶNG"]; 
    fullData[7] = misaHeaders; 
    misaRows.forEach(row => fullData.push(row)); 
    const ws = XLSX.utils.aoa_to_sheet(fullData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MISA DDH");
    XLSX.writeFile(wb, `MISA_EXPORT_V10.2_${new Date().getTime()}.xlsx`);
  };

  const totalAmount = useMemo(() => results.reduce((acc, curr) => acc + curr.afterDiscountAmount, 0), [results]);

  if (!isAuthorized) {
    return <LoginScreen onLogin={() => setIsAuthorized(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 font-sans animate-in fade-in duration-700">
      <BasicUnitModal isOpen={isBasicUnitOpen} onClose={() => setIsBasicUnitOpen(false)} onUpdateMap={updateBasicUnitMap} onUpdateSingle={updateSingleRecord} currentMap={basicUnitMap} />
      
      <aside className="w-full lg:w-64 bg-slate-900 text-white p-6 hidden lg:flex flex-col border-r border-slate-800">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-900/40"><BarChart3 className="w-6 h-6 text-white" /></div>
          <span className="font-black text-xl tracking-tight uppercase">MISA AMIS</span>
        </div>
        <nav className="space-y-2 flex-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-600/20 font-bold hover:bg-blue-600/20 transition-all"><LayoutDashboard className="w-5 h-5" />Dashboard</button>
          <button onClick={() => setIsBasicUnitOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 rounded-2xl group transition-all">
            <PackageSearch className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <div className="text-left"><span className="font-bold block text-sm uppercase">SQL Master Data</span><span className="text-[10px] opacity-70 uppercase font-black">Ánh xạ Nhóm & ĐVT</span></div>
          </button>
        </nav>
        <div className="pt-6 border-t border-slate-800 flex flex-col items-center gap-2">
           <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Auth: admin271235</div>
           <div className="opacity-30 text-[9px] font-black uppercase text-center tracking-widest italic tracking-widest">Version 10.2 PRO-FLASH</div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 sticky top-0 z-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div><h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase"><Zap className="w-6 h-6 text-blue-600" />Hệ Thống ETL V10.2</h1></div>
          {results.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setResults([])} className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all">Làm mới</button>
              <button onClick={exportToMisaTemplate} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-black text-sm flex items-center gap-2 shadow-xl shadow-blue-900/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"><FileText className="w-4 h-4" /> XUẤT MISA TEMPLATE</button>
            </div>
          )}
        </header>

        <div className="p-6 max-w-[1750px] mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Số Đơn Hàng" value={String(new Set(results.map(r => r.orderId)).size)} icon={Package} color="bg-blue-600" />
            <StatCard title="Doanh Số Net (Phiếu)" value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)} icon={FileSpreadsheet} color="bg-indigo-600" />
            <StatCard title="Số Dòng Phân Tích" value={String(results.length)} icon={ShoppingBag} color="bg-emerald-600" />
          </div>

          {!results.length && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-800 uppercase tracking-tighter"><Settings2 className="w-5 h-5 text-blue-600" />Chọn nhóm phân tích:</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <GroupCard type={GroupType.KIDO} isSelected={selectedGroup === GroupType.KIDO} onClick={() => setSelectedGroup(GroupType.KIDO)} description="KIDO: Lấy mã [xxxx], giữ tên nguyên văn, hỗ trợ hàng KM giá 0." color="text-red-600 border-red-200" />
                <GroupCard type={GroupType.UNICHARM} isSelected={selectedGroup === GroupType.UNICHARM} onClick={() => setSelectedGroup(GroupType.UNICHARM)} description="UNICHARM: Tách số dính OCR, trích xuất đầy đủ danh mục hàng tặng." color="text-blue-600 border-blue-200" />
                <GroupCard type={GroupType.COLGATE} isSelected={selectedGroup === GroupType.COLGATE} onClick={() => setSelectedGroup(GroupType.COLGATE)} description="COLGATE: Xử lý mã quà tặng CP, giữ tên tham chiếu chính xác." color="text-yellow-600 border-yellow-200" />
                <GroupCard type={GroupType.KIOTVIET_NPP} isSelected={selectedGroup === GroupType.KIOTVIET_NPP} onClick={() => setSelectedGroup(GroupType.KIOTVIET_NPP)} description="KIOTVIET: Clean mã hậu tố _TH, trích xuất 100% dòng hàng." color="text-indigo-600 border-indigo-200" />
              </div>
              {selectedGroup && (
                <div className="flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-3xl p-16 bg-slate-50/50 hover:border-blue-200 transition-all group relative overflow-hidden">
                  <div className="bg-white p-6 rounded-3xl shadow-lg mb-6 group-hover:scale-110 transition-transform relative z-10">{isProcessing ? <Loader2 className="w-16 h-16 text-blue-600 animate-spin" /> : <UploadCloud className="w-16 h-16 text-blue-600" />}</div>
                  <label className="mt-8 cursor-pointer relative z-10 text-center">
                    <input type="file" accept=".pdf,image/*" className="hidden" onChange={handleFileUpload} disabled={isProcessing} />
                    <span className="px-12 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all shadow-xl inline-block text-lg tracking-widest uppercase">{isProcessing ? 'ĐANG TRÍCH XUẤT 100% DỮ LIỆU...' : 'TẢI PHIẾU GIAO HÀNG & THANH TOÁN'}</span>
                    <p className="mt-4 text-[10px] text-slate-400 font-black uppercase tracking-widest">Hệ thống sẽ lấy tất cả dòng hàng kể cả đơn giá 0</p>
                  </label>
                </div>
              )}
            </div>
          )}

          {results.length > 0 && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-3 uppercase tracking-tighter">
                  <div className="p-2 bg-blue-600 rounded-lg"><TableIcon className="w-5 h-5 text-white" /></div>
                  DỮ LIỆU TRÍCH XUẤT & THAM CHIẾU NGUYÊN VĂN
                </h2>
                <div className="flex items-center gap-2">
                   <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-black border border-emerald-200 flex items-center gap-1.5 uppercase tracking-tighter"><CheckCircle2 className="w-3 h-3" /> FULL DATA SYNC</div>
                   <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[9px] font-black border border-indigo-200 uppercase tracking-tighter">{selectedGroup} LOGIC V10.2</div>
                </div>
              </div>
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
                <table className="w-full text-left border-collapse min-w-[1800px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-200">
                      <th className="px-6 py-4 w-10 text-center">STT</th>
                      <th className="px-6 py-4">Mã Hàng</th>
                      <th className="px-6 py-4">Tên Hàng Hóa (Tham Chiếu Phiếu Gốc)</th>
                      <th className="px-6 py-4">Nhóm Ngành (SQL)</th>
                      <th className="px-6 py-4 text-center">ĐVT</th>
                      <th className="px-6 py-4 text-right">Số Lượng</th>
                      <th className="px-6 py-4 text-right">Đơn Giá</th>
                      <th className="px-6 py-4 text-right text-indigo-600 bg-indigo-50/20">Giá -vat</th>
                      <th className="px-6 py-4 text-right bg-indigo-50/30">Tiền -vat</th>
                      <th className="px-6 py-4 text-center">CK%</th>
                      <th className="px-6 py-4 text-right font-black text-blue-800 bg-blue-50/10">Thanh toán</th>
                      <th className="px-6 py-4 text-right font-black bg-slate-100">Ghi chú Mapping</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium">
                    {results.map((item, idx) => {
                      const upVat = Math.round(item.unitPrice / (1 + VAT_RATE));
                      const amVat = Math.round(item.amount / (1 + VAT_RATE));
                      const isFree = item.unitPrice === 0;
                      return (
                        <tr key={idx} className={`hover:bg-blue-50/30 transition-colors group ${item.mappingStatus === 'error' ? 'bg-red-50/10' : isFree ? 'bg-amber-50/20' : ''}`}>
                          <td className="px-6 py-4 text-center font-black text-slate-300">{idx + 1}</td>
                          <td className="px-6 py-4 font-mono text-xs font-black text-slate-500 uppercase">{item.itemCode}</td>
                          <td className="px-6 py-4 text-slate-700 font-bold truncate max-w-[450px] flex items-center gap-2">
                             {isFree && <Gift className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                             {item.itemName}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[9px] font-black uppercase">
                              {item.groupName}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-black uppercase">{item.unit}</span>
                          </td>
                          <td className="px-6 py-4 text-right font-black text-slate-900">{item.quantity}</td>
                          <td className={`px-6 py-4 text-right font-black ${isFree ? 'text-amber-600' : 'text-slate-400'}`}>
                            {isFree ? '0 (Hàng tặng)' : new Intl.NumberFormat('vi-VN').format(item.unitPrice)}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-indigo-600 bg-indigo-50/5">{new Intl.NumberFormat('vi-VN').format(upVat)}</td>
                          <td className="px-6 py-4 text-right font-bold text-indigo-800 bg-indigo-50/10">{new Intl.NumberFormat('vi-VN').format(amVat)}</td>
                          <td className="px-6 py-4 text-center text-emerald-600 font-black">{item.discountRate}%</td>
                          <td className="px-6 py-4 text-right font-black text-blue-800 bg-blue-50/5">{new Intl.NumberFormat('vi-VN').format(item.afterDiscountAmount)}</td>
                          <td className="px-6 py-4 text-right text-[10px] font-bold">
                            <span className={`${item.mappingStatus === 'error' ? 'text-red-600' : isFree ? 'text-amber-600' : 'text-emerald-600'}`}>
                              {item.mappingNote}
                            </span>
                          </td>
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
