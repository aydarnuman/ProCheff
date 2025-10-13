import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { PriceList, ToastMessage, IngredientPrice, PriceStatus, PriceHistoryRecord, SourceInfo, AiSettings } from '../types';
import { PRICE_GROUPS, UNITS } from '../constants';
import Icon from './Icon';
import { GoogleGenerativeAI, SchemaType as Type } from "@google/generative-ai";
import { getBaseUnit, convertToBaseUnitValue } from '../utils';
import { getBrandInfo } from '../utils/brandUtils';


// --- HELPER FUNCTIONS & CONSTANTS ---
const MAX_HISTORY_LENGTH = 30;

const addHistory = (
    history: PriceHistoryRecord[] | undefined,
    record: PriceHistoryRecord
): PriceHistoryRecord[] => {
    const newHistory = [record, ...(history || [])];
    return newHistory.slice(0, MAX_HISTORY_LENGTH);
};

const isDateStale = (isoDateString?: string, days: number = 3): boolean => {
    if (!isoDateString) return false;
    const date = new Date(isoDateString);
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - days);
    return date < staleDate;
};


// --- HELPER COMPONENTS ---
const Tooltip: React.FC<{ text: string, children: React.ReactNode }> = ({ text, children }) => (
    <div className="tooltip-container">
        {children}
        <span className="tooltip-text" style={{ textAlign: 'left', whiteSpace: 'pre-wrap', width: '300px', marginLeft: '-150px' }}>{text}</span>
    </div>
);

const ConfidenceIndicator: React.FC<{ score: number }> = ({ score }) => {
    const percentage = score * 100;
    let colorClass = 'bg-red-500';
    if (percentage > 85) {
        colorClass = 'bg-emerald-500';
    } else if (percentage > 65) {
        colorClass = 'bg-yellow-500';
    }
    return (
        <div className="w-full bg-gray-700 rounded-full h-2">
            <div className={`${colorClass} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

const LogoPlaceholder: React.FC<{ name: string; className?: string; title?: string }> = ({ name, className = '', title }) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';

    const hashCode = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
           hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    };

    const intToHSL = (i: number) => {
        const hue = Math.abs(i) % 360;
        return `hsl(${hue}, 40%, 35%)`;
    };
    
    const color = intToHSL(hashCode(name));

    return (
        <div 
            className={`flex items-center justify-center font-bold text-white ${className}`}
            style={{ backgroundColor: color, borderRadius: '4px' }}
            title={title || name}
        >
            {initial}
        </div>
    );
};


const BrandLogo: React.FC<{ name: string; type?: 'store' | 'product' }> = ({ name, type = 'product' }) => {
    const [hasError, setHasError] = useState(false);
    const brandInfo = getBrandInfo(name);
    const sizeClass = type === 'store' ? 'h-5 w-5' : 'h-6 w-6';

    useEffect(() => {
        setHasError(false); // Reset error state when src changes
    }, [brandInfo.logo]);

    if (hasError || !brandInfo.logo || !brandInfo.logo.includes('/logos/')) {
        return <LogoPlaceholder name={brandInfo.name} className={sizeClass} title={brandInfo.name} />;
    }

    return (
        <img
            src={brandInfo.logo}
            alt={brandInfo.name}
            title={brandInfo.name}
            className={`brand-logo-single ${sizeClass} object-contain`}
            onError={() => setHasError(true)}
        />
    );
};


// --- PRICE HISTORY MODAL ---
interface PriceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredientName: string;
  history: PriceHistoryRecord[];
}
const PriceHistoryModal: React.FC<PriceHistoryModalProps> = ({ isOpen, onClose, ingredientName, history }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <h3 className="modal-title">{ingredientName} - Fiyat Geçmişi</h3>
          <button onClick={onClose} className="modal-close-btn"><Icon name="close" /></button>
        </div>
        <div className="modal-body">
          {history && history.length > 0 ? (
            <div className="table-wrapper max-h-[60vh]">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tarih</th>
                    <th>Fiyat</th>
                    <th>Tür</th>
                    <th>Kaynak/Not</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {history.map((record, index) => (
                    <tr key={index}>
                      <td>{new Date(record.date).toLocaleString('tr-TR')}</td>
                      <td className="font-mono">{record.price !== null ? `${record.price.toFixed(2)} ₺` : 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${record.type === 'ai' ? 'status-badge-auto' : 'status-badge-manual'}`}>
                          {record.type === 'ai' ? 'Otomatik' : 'Manuel'}
                        </span>
                      </td>
                      <td>{record.source || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">Bu malzeme için fiyat geçmişi bulunmuyor.</p>
          )}
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Kapat</button>
        </div>
      </div>
    </div>
  );
};


// --- AI PRICE REVIEW MODAL ---
type AiSuggestion = {
    name: string;
    currentPrice: number | null;
    suggestedPrice: number;
    sources: SourceInfo[];
    avgConfidence: number;
    notes?: string;
};
interface AiPriceReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (acceptedSuggestions: AiSuggestion[]) => void;
    suggestions: AiSuggestion[];
}
const AiPriceReviewModal: React.FC<AiPriceReviewModalProps> = ({ isOpen, onClose, onApply, suggestions }) => {
    const [selected, setSelected] = useState<Set<string>>(() => new Set(suggestions.map(s => s.name)));

    useEffect(() => {
        if (isOpen) {
            setSelected(new Set(suggestions.map(s => s.name)));
        }
    }, [isOpen, suggestions]);
    
    if (!isOpen) return null;

    const handleToggleSelection = (name: string) => {
        setSelected(prev => {
            const newSet = new Set(prev);
            if (newSet.has(name)) newSet.delete(name);
            else newSet.add(name);
            return newSet;
        });
    };

    const handleToggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        if (selected.size === suggestions.length) setSelected(new Set());
        else setSelected(new Set(suggestions.map(s => s.name)));
    };
    
    const handleApply = () => {
        const accepted = suggestions.filter(s => selected.has(s.name));
        onApply(accepted);
        onClose();
    };

    const isAllSelected = selected.size === suggestions.length && suggestions.length > 0;
    
    const getConfidenceClass = (score: number) => {
        if (score > 0.85) return 'confidence-high';
        if (score > 0.65) return 'confidence-medium';
        return 'confidence-low';
    };

    const getModalIngredientTooltipText = (suggestion: AiSuggestion): string => {
        const { sources, avgConfidence } = suggestion;
        const sourceCount = sources.length;
        const confidenceText = (avgConfidence * 100).toFixed(0);
        return `Bu fiyat ${sourceCount} kaynaktan doğrulandı.\nSon güncelleme: Bugün\nGenel güven: %${confidenceText}`;
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '1000px' }}>
                <div className="modal-header">
                    <h3 className="modal-title">Yapay Zeka Fiyat Analizi</h3>
                    <button onClick={onClose} className="modal-close-btn"><Icon name="close" /></button>
                </div>
                <div className="modal-body">
                    <p className="text-sm text-gray-400 mb-4">
                        Yapay zeka tarafından bulunan güncel fiyat önerileri aşağıdadır. Uygulamak istediğiniz güncellemeleri seçin ve onaylayın.
                    </p>
                    <div className="table-wrapper max-h-[60vh]">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th className="w-8">
                                        <input 
                                            type="checkbox" 
                                            checked={isAllSelected} 
                                            onChange={handleToggleAll} 
                                            className="form-checkbox" 
                                        />
                                    </th>
                                    <th>Malzeme Adı</th>
                                    <th>Mevcut/Öneri</th>
                                    <th>Değişim</th>
                                    <th>Kaynak / Marka Detayları</th>
                                    <th className="w-32">Genel Güven</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {suggestions.map(s => {
                                    const diff = s.currentPrice !== null ? s.suggestedPrice - s.currentPrice : s.suggestedPrice;
                                    const diffPercent = s.currentPrice ? (diff / s.currentPrice) * 100 : Infinity;
                                    const diffColor = diff > 0 ? 'text-red-400' : diff < 0 ? 'text-emerald-400' : 'text-gray-400';
                                    const hasFewSources = s.sources.length < 3;
                                    const sortedSources = [...s.sources].sort((a, b) => a.price - b.price);
                                    
                                    return (
                                        <tr 
                                            key={s.name}
                                            onClick={() => handleToggleSelection(s.name)}
                                            className="cursor-pointer"
                                        >
                                            <td>
                                                <input 
                                                    type="checkbox" 
                                                    checked={selected.has(s.name)} 
                                                    onChange={(e) => { e.stopPropagation(); handleToggleSelection(s.name);}}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="form-checkbox" 
                                                />
                                            </td>
                                            <td className="font-semibold text-white">
                                                <Tooltip text={getModalIngredientTooltipText(s)}>
                                                    <span className="underline decoration-dotted cursor-help">{s.name}</span>
                                                </Tooltip>
                                                {s.notes && (
                                                   <Tooltip text={`Not: ${s.notes}`}>
                                                     <Icon name="info" className="w-4 h-4 ml-2 text-gray-400 inline-block"/>
                                                   </Tooltip>
                                                )}
                                            </td>
                                            <td className="font-mono">
                                                <span className="line-through text-gray-500">{s.currentPrice?.toFixed(2) ?? 'N/A'} ₺</span>
                                                <br/>
                                                <span className="font-bold text-white">{s.suggestedPrice.toFixed(2)} ₺</span>
                                            </td>
                                            <td className={`font-mono font-bold ${diffColor}`}>
                                                {diff.toFixed(2)} ₺ <br/> ({isFinite(diffPercent) ? `${diff > 0 ? '+' : ''}${diffPercent.toFixed(1)}%` : 'Yeni'})
                                            </td>
                                            <td>
                                                <div className="source-list-vertical">
                                                    {sortedSources.map((src, index) => (
                                                        <div key={index} className={`source-row ${index === 0 ? 'is-recommended' : ''}`}>
                                                             {index === 0 && <span className="recommended-badge">✨ Güncel</span>}
                                                             <Tooltip text={`${getBrandInfo(src.name).name} / ${getBrandInfo(src.brand || "").name}`}>
                                                                <div className="source-details-group source-brand">
                                                                    <BrandLogo name={src.name} type="store" />
                                                                    <BrandLogo name={src.brand || ""} type="product" />
                                                                    <span className="font-medium text-white truncate">{getBrandInfo(src.brand || "").name}</span>
                                                                </div>
                                                             </Tooltip>
                                                            <div className="source-details-group source-price">
                                                                <span className="font-mono font-bold">{src.price.toFixed(2)} ₺</span>
                                                            </div>
                                                            <div className="source-details-group source-date">
                                                                <Icon name="plan" className="w-4 h-4 text-gray-400" />
                                                                <span>Bugün</span>
                                                            </div>
                                                            <div className="source-details-group source-confidence">
                                                                <span className={`font-medium ${getConfidenceClass(src.confidence)}`}>
                                                                    {(src.confidence * 100).toFixed(0)}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                {hasFewSources && s.sources.length > 0 && (
                                                    <div className="flex items-center gap-1 text-xs text-yellow-400 mt-2">
                                                        <Icon name="warning" className="w-3 h-3"/> Eksik Kaynak
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                {s.avgConfidence && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-grow">
                                                            <ConfidenceIndicator score={s.avgConfidence} />
                                                        </div>
                                                        <span className="text-xs text-gray-400 font-mono w-10 text-right">
                                                            {(s.avgConfidence * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="modal-footer">
                    <div className="text-sm text-gray-400 mr-auto">{selected.size} / {suggestions.length} öneri seçildi.</div>
                    <button onClick={onClose} className="btn btn-secondary">İptal</button>
                    <button onClick={handleApply} className="btn btn-primary" disabled={selected.size === 0}>
                        Seçilenleri Uygula
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- PRICE EDIT/ADD MODAL COMPONENT ---
interface PriceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: { name: string; data: IngredientPrice }, originalName?: string) => void;
    itemToEdit: { name: string; data: IngredientPrice } | null;
    priceList: PriceList;
    addToast: (message: string, type: ToastMessage['type']) => void;
}

const PriceModal: React.FC<PriceModalProps> = ({ isOpen, onClose, onSave, itemToEdit, priceList, addToast }) => {
    const isEditing = !!itemToEdit;

    const getInitialState = useCallback(() => {
        if (isEditing) {
             const data = itemToEdit.data;
             const packageSize = data.packageSize || 1;
             const unitPrice = data.status === 'manual' ? data.manualOverridePrice : data.price;
             const packagePrice = unitPrice !== null && unitPrice !== undefined ? unitPrice * packageSize : null;

            return {
                name: itemToEdit.name,
                packageSize: data.packageSize?.toString() ?? '',
                packageUnit: data.packageUnit ?? data.unit,
                packagePrice: packagePrice?.toString() ?? '',
                group: data.group,
            };
        }
        // New item state
        return { 
            name: '',
            packageSize: '',
            packageUnit: 'kg',
            packagePrice: '', 
            group: 'Temel Gıda' 
        };
    }, [isEditing, itemToEdit]);
    
    const [formState, setFormState] = useState(getInitialState());

    useEffect(() => {
        if (isOpen) {
            setFormState(getInitialState());
        }
    }, [isOpen, getInitialState]);


    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        const { name, packageSize, packageUnit, packagePrice, group } = formState;
        
        const trimmedName = name.trim();
        const sizeNum = parseFloat(packageSize);
        const priceNum = parseFloat(packagePrice);

        if (!trimmedName || isNaN(sizeNum) || sizeNum <= 0 || isNaN(priceNum) || priceNum < 0) {
            addToast('Lütfen malzeme adı ve geçerli paket bilgilerini (miktar, fiyat) eksiksiz girin.', 'warning');
            return;
        }

        const originalName = isEditing ? itemToEdit.name : undefined;
        if (originalName !== trimmedName && priceList[trimmedName]) {
            addToast('Bu isimde bir malzeme zaten mevcut.', 'error');
            return;
        }
        
        const qtyInBaseUnit = convertToBaseUnitValue(sizeNum, packageUnit);
        const baseUnit = getBaseUnit(packageUnit);

        if (!baseUnit || qtyInBaseUnit <= 0) {
            addToast('Geçersiz miktar veya birim. "g" veya "ml" için miktar 0\'dan büyük olmalıdır.', 'error');
            return;
        }
        
        const baseUnitPrice = priceNum / qtyInBaseUnit;
        
        const now = new Date().toISOString();
        const sourceText = isEditing ? 'Kullanıcı (Düzenleme)' : 'Kullanıcı (Yeni Kayıt)';

        const newHistoryRecord: PriceHistoryRecord = {
            date: now,
            price: baseUnitPrice,
            type: 'manual',
            source: sourceText,
        };
        
        let finalData: IngredientPrice;
        if (isEditing) {
            const existingData = itemToEdit.data;
            finalData = {
                ...existingData,
                price: existingData.price, // Preserve original AI/default price
                manualOverridePrice: baseUnitPrice,
                unit: baseUnit,
                group: group,
                packageSize: sizeNum,
                packageUnit: packageUnit,
                status: 'manual',
                isLocked: existingData.isLocked,
                lastUpdated: now,
                priceHistory: addHistory(existingData.priceHistory, newHistoryRecord),
            };
        } else {
            finalData = {
                price: null,
                manualOverridePrice: baseUnitPrice,
                unit: baseUnit,
                group: group,
                packageSize: sizeNum,
                packageUnit: packageUnit,
                status: 'manual',
                isLocked: false,
                lastUpdated: now,
                priceHistory: addHistory(undefined, newHistoryRecord),
            };
        }
        
        onSave({ name: trimmedName, data: finalData }, originalName);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3 className="modal-title">{isEditing ? 'Malzemeyi Düzenle' : 'Yeni Malzeme Ekle'}</h3>
                    <button onClick={onClose} className="modal-close-btn"><Icon name="close" /></button>
                </div>
                <div className="modal-body">
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">Malzeme Adı</label>
                            <input
                                type="text"
                                name="name"
                                value={formState.name}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Örn: Biber Salçası"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">Paket Miktarı</label>
                                <input type="number" name="packageSize" value={formState.packageSize} onChange={handleChange} className="form-input" placeholder="Örn: 5" min="0" />
                            </div>
                            <div>
                                 <label className="form-label">Paket Birimi</label>
                                 <select name="packageUnit" value={formState.packageUnit} onChange={handleChange} className="form-select">
                                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                 </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">Paket Fiyatı (₺)</label>
                                <input type="number" name="packagePrice" value={formState.packagePrice} onChange={handleChange} className="form-input" placeholder="Bu paket için toplam fiyat" min="0" />
                            </div>
                            <div>
                                <label className="form-label">Grup</label>
                                <select name="group" value={formState.group} onChange={handleChange} className="form-select">
                                    {PRICE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="p-3 bg-gray-900 rounded-md text-sm text-gray-400">
                            <Icon name="info" className="inline w-4 h-4 mr-2" />
                            Yapay zeka ile doğru fiyat analizi için paket bilgileri zorunludur. Sistem, girilen paket fiyatından birim fiyatını (örn: TL/kg) otomatik olarak hesaplayacaktır.
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="btn btn-secondary">İptal</button>
                    <button onClick={handleSave} className="btn btn-primary">Kaydet</button>
                </div>
            </div>
        </div>
    );
};

// --- STATUS BADGE ---
const StatusBadge: React.FC<{ status: PriceStatus; isLocked: boolean }> = ({ status, isLocked }) => {
    if (isLocked) {
        return <div className="status-badge status-badge-locked"><Icon name="lock-closed" className="w-3 h-3"/> Kilitli</div>;
    }
    if (status === 'manual') {
        return <div className="status-badge status-badge-manual">Manuel</div>;
    }
    return null; // Auto is the default, no badge needed
};


// --- MAIN COMPONENT ---
interface PricesTabProps {
    priceList: PriceList;
    setPriceList: (list: PriceList | ((prevState: PriceList) => PriceList)) => void;
    resetPrices: () => void;
    addToast: (message: string, type: ToastMessage['type']) => void;
    handleExportData: () => void;
    handleImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
    deletedDefaults: string[];
    setDeletedDefaults: (value: string[] | ((prevState: string[]) => string[])) => void;
    aiSettings: AiSettings;
}

const PricesTab: React.FC<PricesTabProps> = ({
  priceList,
  setPriceList,
  resetPrices,
  addToast,
  handleExportData,
  handleImportData,
  aiSettings
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<{ name: string; data: IngredientPrice } | null>(null);
  
  const [isAiUpdating, setIsAiUpdating] = useState(false);
  const [singleItemLoading, setSingleItemLoading] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[] | null>(null);
  const [historyModalState, setHistoryModalState] = useState<{ isOpen: boolean; name: string; history: PriceHistoryRecord[] }>({ isOpen: false, name: '', history: [] });

  const filteredPriceList = useMemo(() => {
    return Object.entries(priceList)
      .filter(([name, data]) => {
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = !activeFilter || data.group === activeFilter;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => a[0].localeCompare(b[0]));
  }, [priceList, searchTerm, activeFilter]);

  const handleOpenModal = (item: { name: string; data: IngredientPrice } | null) => {
      setItemToEdit(item);
      setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
      setIsModalOpen(false);
      setItemToEdit(null);
  };
  
  const handleSavePrice = (item: { name: string; data: IngredientPrice }, originalName?: string) => {
    setPriceList(prev => {
        const newList = { ...prev };
        if (originalName && originalName !== item.name) {
            delete newList[originalName];
        }
        newList[item.name] = item.data;
        return newList;
    });
    const message = originalName ? `'${item.name}' başarıyla güncellendi.` : `'${item.name}' başarıyla eklendi.`;
    addToast(message, 'success');
    handleCloseModal();
  };

  const handleToggleLock = (name: string) => {
    setPriceList(prev => {
        const current = prev[name];
        if (!current) return prev;
        const newState = !current.isLocked;
        addToast(`'${name}' ${newState ? 'kilitlendi' : 'kilidi açıldı'}.`, 'info');
        return { ...prev, [name]: { ...current, isLocked: newState } };
    });
  };

  const handleRevert = (name: string) => {
      setPriceList(prev => {
        const current = prev[name];
        if (!current || current.status !== 'manual') return prev;
        
        const now = new Date().toISOString();
        const newHistoryRecord: PriceHistoryRecord = {
            date: now,
            price: current.price, // Reverting to the underlying AI/default price
            type: 'manual',
            source: 'Geri Alma',
        };
        
        addToast(`'${name}' için manuel fiyat geri alındı.`, 'success');
        return { 
            ...prev, 
            [name]: { 
                ...current, 
                status: 'auto', 
                manualOverridePrice: null,
                lastUpdated: now,
                priceHistory: addHistory(current.priceHistory, newHistoryRecord),
            } 
        };
    });
  };
  
  const getEffectivePrice = (data: IngredientPrice) => {
      return data.status === 'manual' && data.manualOverridePrice != null
          ? data.manualOverridePrice
          : data.price;
  };
  
  const aiPriceSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            notes: { type: Type.STRING },
            sources: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING }, // Store name
                        brand: { type: Type.STRING }, // Product brand
                        price: { type: Type.NUMBER },
                        confidence: { type: Type.NUMBER }
                    },
                    required: ["name", "brand", "price", "confidence"]
                }
            }
        },
        required: ["name", "sources"]
    }
  };

  const processAiResponse = (
      responseText: string,
      itemsToUpdate: {name: string, data: IngredientPrice}[]
  ): AiSuggestion[] => {
      const result = JSON.parse(responseText.trim());
      if (!Array.isArray(result)) {
          throw new Error("Yapay zeka beklenmedik bir formatta yanıt verdi.");
      }

      return result
          .map((item: { name: string, sources: SourceInfo[], notes?: string }): AiSuggestion | null => {
              const originalItem = itemsToUpdate.find(i => {
                  const requestedPrompt = `${i.name} ${i.data.packageSize} ${i.data.packageUnit}`;
                  return requestedPrompt.trim().toLowerCase() === item.name.trim().toLowerCase();
              });

              if (originalItem && item.sources && item.sources.length > 0) {
                  const avgPackagePrice = item.sources.reduce((acc, s) => acc + s.price, 0) / item.sources.length;
                  const avgConfidence = item.sources.reduce((acc, s) => acc + s.confidence, 0) / item.sources.length;
                  
                  const qtyInBaseUnit = convertToBaseUnitValue(originalItem.data.packageSize!, originalItem.data.packageUnit!);
                  if (qtyInBaseUnit <= 0) return null;

                  const unitPrice = avgPackagePrice / qtyInBaseUnit;
                  return {
                      name: originalItem.name,
                      currentPrice: getEffectivePrice(originalItem.data),
                      suggestedPrice: unitPrice,
                      sources: item.sources,
                      avgConfidence: avgConfidence,
                      notes: item.notes,
                  };
              }
              return null;
          })
          .filter((s): s is AiSuggestion => s !== null);
  };
  
 const handleAiPriceUpdate = async () => {
      setIsAiUpdating(true);
      addToast('Yapay zeka fiyatları analiz ediyor... Bu işlem biraz zaman alabilir.', 'info');
      
      const itemsToUpdate = Object.entries(priceList)
        .filter(([, data]) => !data.isLocked && data.packageSize && data.packageUnit)
        .map(([name, data]) => ({ name, data }));

      if (itemsToUpdate.length === 0) {
          addToast('Fiyatı güncellenecek, kilitsiz ve paket bilgisi tanımlı ürün bulunamadı.', 'warning');
          setIsAiUpdating(false);
          return;
      }
      
      const itemPrompts = itemsToUpdate.map(item => `"${item.name} ${item.data.packageSize} ${item.data.packageUnit}"`);
      const prompt = `Aşağıdaki gıda malzemelerinin Türkiye'deki güncel perakende satış fiyatlarını (belirtilen paket miktarları için TOPLAM fiyat) araştır. Her malzeme için en az 3, en fazla 5 güvenilir online market veya zincir market (örn: Migros, A101, CarrefourSA, Trendyol, Metro) kaynağı bul. Sonuçları bir JSON dizisi olarak döndür. Her dizi öğesi, 'name' (birebir sağlanan malzeme adı), 'sources' (kaynakları içeren bir dizi) ve varsa 'notes' alanlarına sahip bir nesne olmalıdır. Her kaynak nesnesi 'name' (market adı), 'brand' (ürünün markası), 'price' (o kaynaktaki PAKET fiyatı) ve 'confidence' (0-1 arası güven skoru) içermelidir. Bir malzeme için 3'ten az kaynak bulursan, bulabildiklerinle döndür. Hiç bulamazsan, o malzemeyi yanıta dahil ETME. Sadece JSON şemasına uygun diziyi döndür.\n\nİstenen Malzemeler:\n${itemPrompts.join('\n')}`;

      try {
          const ai = new GoogleGenerativeAI(process.env.API_KEY || '');
          const model = ai.getGenerativeModel({ 
            model: 'gemini-2.0-flash-exp',
            generationConfig: { 
              responseMimeType: "application/json", 
              responseSchema: aiPriceSchema as any 
            }
          });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          
          const suggestions = processAiResponse(response.text(), itemsToUpdate);

          if (suggestions.length > 0) {
              setAiSuggestions(suggestions);
          } else {
              addToast('Yapay zeka herhangi bir fiyat güncellemesi bulamadı.', 'info');
          }

      } catch (error) {
          console.error("AI Price Update Error:", error);
          const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
          addToast(`Yapay zeka hatası: ${errorMessage}`, 'error');
      } finally {
          setIsAiUpdating(false);
      }
  };
  
    const handleSingleAiUpdate = async (name: string, data: IngredientPrice) => {
      if (!data.packageSize || !data.packageUnit) {
          addToast("Bu ürünün yapay zeka araması için paket bilgileri eksik.", "error");
          return;
      }
      setSingleItemLoading(name);
      addToast(`'${name}' için yapay zeka fiyat analizi başlatıldı...`, 'info');

      const prompt = `"${name} ${data.packageSize} ${data.packageUnit}" adlı gıda ürününün Türkiye'deki güncel perakende satış fiyatını (TOPLAM PAKET FİYATI) araştır. En az 3, en fazla 5 güvenilir online market veya zincir market kaynağı bul. Sonucu bir JSON dizisi olarak döndür. Bu dizi SADECE BİR nesne içermelidir. Bu nesne 'name', 'sources' (kaynakları içeren bir dizi) ve varsa 'notes' alanlarına sahip olmalıdır. Her kaynak nesnesi 'name' (market adı), 'brand' (ürünün markası), 'price' ve 'confidence' içermelidir. Hiç kaynak bulamazsan, boş bir dizi döndür. Sadece JSON şemasına uygun diziyi döndür.`;
      
      try {
          const ai = new GoogleGenerativeAI(process.env.API_KEY || '');
          const model = ai.getGenerativeModel({ 
            model: 'gemini-2.0-flash-exp',
            generationConfig: { 
              responseMimeType: "application/json", 
              responseSchema: aiPriceSchema as any 
            }
          });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          
          const suggestions = processAiResponse(response.text(), [{name, data}]);

          if (suggestions.length > 0) {
              setAiSuggestions(suggestions);
          } else {
              addToast(`'${name}' için güncel fiyat bulunamadı.`, 'warning');
          }
      } catch (error) {
          console.error("Single AI Price Update Error:", error);
          const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
          addToast(`'${name}' için fiyat alınırken hata oluştu: ${errorMessage}`, 'error');
      } finally {
          setSingleItemLoading(null);
      }
  };

  const handleApplyAiSuggestions = (acceptedSuggestions: AiSuggestion[]) => {
      const now = new Date().toISOString();
      setPriceList(prev => {
          const newList = { ...prev };
          acceptedSuggestions.forEach(s => {
              if (newList[s.name]) {
                  const sourceText = s.sources.map(src => `${src.name} / ${src.brand}`).join(', ');
                  const newHistoryRecord: PriceHistoryRecord = {
                    date: now,
                    price: s.suggestedPrice,
                    type: 'ai',
                    source: sourceText,
                  };
                  newList[s.name] = {
                      ...newList[s.name],
                      price: s.suggestedPrice,
                      status: 'auto',
                      manualOverridePrice: null,
                      lastUpdated: now,
                      sources: s.sources,
                      notes: s.notes,
                      priceHistory: addHistory(newList[s.name].priceHistory, newHistoryRecord),
                  };
              }
          });
          return newList;
      });
      addToast(`${acceptedSuggestions.length} malzemenin fiyatı yapay zeka ile güncellendi.`, 'success');
      setAiSuggestions(null);
  };
  
  const getTooltipText = (data: IngredientPrice): string => {
    let parts = [];
    if (data.sources && data.sources.length > 0) {
        const sourceText = data.sources
          .map(s => `  - ${getBrandInfo(s.name).name} / ${getBrandInfo(s.brand).name}: ${s.price.toFixed(2)} ₺ (paket)`)
          .join('\n');
        parts.push(`Bulunan Kaynaklar (${data.sources.length} adet):\n${sourceText}`);

        if (data.sources.length < 3) {
             parts.push(`\nUyarı: Yeterli kaynak bulunamadı, fiyat doğruluğu düşük olabilir.`);
        }
    }
    if (data.notes) parts.push(`\nYapay Zeka Notları:\n  ${data.notes}`);
    
    parts.push(`\nSon Güncelleme: ${data.lastUpdated ? new Date(data.lastUpdated).toLocaleString('tr-TR') : 'Bilinmiyor'}`);
    
    return parts.join('\n').trim();
};

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <>
      <div>
        <div className="card !p-0">
            <div className="prices-toolbar">
                <div className="relative w-full md:w-auto flex-grow max-w-sm">
                    <input
                        type="text"
                        placeholder="Malzeme adı ara..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="form-input pl-10"
                    />
                    <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={handleAiPriceUpdate} className="btn btn-secondary" disabled={isAiUpdating || !!singleItemLoading}>
                        {isAiUpdating ? <Icon name="spinner" className="animate-spin icon" /> : <Icon name="gemini" className="icon text-purple-400" />}
                        {isAiUpdating ? 'Analiz Ediliyor...' : 'Tümünü Analiz Et'}
                    </button>
                    <button onClick={() => handleOpenModal(null)} className="btn btn-primary">
                        <Icon name="add" className="icon" /> Yeni Malzeme
                    </button>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th className="w-2/5">Malzeme Adı</th>
                            <th>Birim Fiyatı</th>
                            <th>Durum</th>
                            <th className="w-48 text-center">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="table-body">
                        {filteredPriceList.map(([name, data]) => {
                            const effectivePrice = getEffectivePrice(data);
                            const isSearchable = !!(data.packageSize && data.packageUnit);
                            const uniqueBrands = data.sources ? [...new Set(data.sources.map(s => s.brand).filter((b): b is string => !!b))] : [];
                            const isStale = isDateStale(data.lastUpdated, aiSettings.freshnessThreshold);

                            return (
                                <tr key={name} className={`table-row ${isStale ? 'table-row-stale' : ''}`}>
                                    <td className="font-semibold text-white text-base">
                                        <div className="flex items-center gap-2">
                                          <div>
                                              {name}
                                              {data.packageSize && data.packageUnit && (
                                                <div className="text-xs text-gray-400 font-normal">
                                                    {data.packageSize} {data.packageUnit} paket
                                                </div>
                                              )}
                                               {uniqueBrands.length > 0 && (
                                                    <div className="mt-1.5 flex items-center gap-2">
                                                        <div className="brand-logo-group">
                                                        {uniqueBrands.slice(0, 5).map((brand, index) => (
                                                            <div key={index} className="brand-logo-item-wrapper" style={{ zIndex: uniqueBrands.length - index }}>
                                                                <BrandLogo name={brand} type="product" />
                                                            </div>
                                                        ))}
                                                        </div>
                                                         {data.sources && data.sources.length < 3 && <Icon name="warning" className="w-4 h-4 text-yellow-500 flex-shrink-0" title="Eksik Kaynak"/>}
                                                    </div>
                                                )}
                                          </div>
                                          {(data.sources || data.notes || data.lastUpdated) && (
                                            <Tooltip text={getTooltipText(data)}>
                                                <Icon name="info" className="w-4 h-4 text-gray-400 hover:text-white"/>
                                            </Tooltip>
                                          )}
                                        </div>
                                    </td>
                                    <td className="font-mono font-bold text-base">
                                         {effectivePrice !== null ? (
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={isStale ? 'price-stale' : 'text-emerald-400'}>
                                                        {effectivePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺ / {data.unit}
                                                    </span>
                                                    {isStale && (
                                                        <Tooltip text={`Fiyat ${aiSettings.freshnessThreshold} günden eski. Güncellemek için Analiz Et'i kullanın.`}>
                                                            <Icon name="warning" className="w-4 h-4 text-yellow-400"/>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                                {data.lastUpdated && (
                                                    <div className={`text-xs font-normal text-gray-500 mt-1 flex items-center gap-1 ${isStale ? 'text-yellow-400' : ''}`}>
                                                        <Icon name="clock" className="w-3 h-3"/>
                                                        <span>{new Date(data.lastUpdated).toLocaleDateString('tr-TR')}</span>
                                                    </div>
                                                )}
                                            </div>
                                         ) : (
                                            <span className='text-gray-500'>Belirtilmemiş</span>
                                         )}
                                    </td>
                                    <td>
                                        <StatusBadge status={data.status} isLocked={data.isLocked} />
                                    </td>
                                    <td>
                                        <div className="actions justify-center">
                                            <button 
                                                onClick={() => handleSingleAiUpdate(name, data)}
                                                className="btn btn-secondary btn-icon-only"
                                                title={isSearchable ? `${name} için Fiyat Araştır` : "Yapay zeka araması için lütfen bu malzemenin paket miktarını ve birimini düzenleyin."}
                                                disabled={!isSearchable || data.isLocked || isAiUpdating || !!singleItemLoading}
                                            >
                                                {singleItemLoading === name ? <Icon name="spinner" className="w-4 h-4 animate-spin" /> : <Icon name="gemini" className="w-4 h-4 text-purple-400" />}
                                            </button>
                                            <button onClick={() => handleOpenModal({ name, data })} className="btn btn-secondary btn-icon-only" title="Düzenle" disabled={data.isLocked}><Icon name="edit" className="w-4 h-4" /></button>
                                            {data.status === 'manual' && <button onClick={() => handleRevert(name)} className="btn btn-secondary btn-icon-only" title="Otomatik Fiyata Geri Al" disabled={data.isLocked}><Icon name="revert" className="w-4 h-4" /></button>}
                                            <button onClick={() => handleToggleLock(name)} className="btn btn-secondary btn-icon-only" title={data.isLocked ? 'Kilidi Aç' : 'Kilitle'}><Icon name={data.isLocked ? 'lock-open' : 'lock-closed'} className="w-4 h-4" /></button>
                                            <button onClick={() => setHistoryModalState({ isOpen: true, name, history: data.priceHistory || [] })} className="btn btn-secondary btn-icon-only" title="Fiyat Geçmişi"><Icon name="clock" className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {filteredPriceList.length === 0 && (
               <div className="text-center py-20">
                  <Icon name="search" className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white">Malzeme Bulunamadı</h3>
                  <p className="text-gray-400 mt-2 max-w-md mx-auto">Aradığınız kriterlere uygun bir malzeme bulunamadı.</p>
               </div>
            )}
        </div>
         <div className="mt-6 p-4 bg-gray-900/50 rounded-lg flex flex-wrap items-center justify-center gap-4">
              <span className="text-sm text-gray-400 font-medium">Toplu İşlemler:</span>
               <button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary text-sm">
                  <Icon name="import" className="icon" /> Veri İçe Aktar (.json)
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImportData} className="hidden" accept=".json"/>
              <button onClick={handleExportData} className="btn btn-secondary text-sm">
                  <Icon name="export" className="icon" /> Tüm Veriyi Dışa Aktar
              </button>
              <button onClick={resetPrices} className="btn btn-danger text-sm">
                  <Icon name="reset" className="icon" /> Fiyatları Sıfrla
              </button>
         </div>
      </div>

      <PriceModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSavePrice}
        itemToEdit={itemToEdit}
        priceList={priceList}
        addToast={addToast}
      />
      
      <AiPriceReviewModal
        isOpen={!!aiSuggestions}
        onClose={() => setAiSuggestions(null)}
        onApply={handleApplyAiSuggestions}
        suggestions={aiSuggestions || []}
      />

      <PriceHistoryModal
        isOpen={historyModalState.isOpen}
        onClose={() => setHistoryModalState({ isOpen: false, name: '', history: [] })}
        ingredientName={historyModalState.name}
        history={historyModalState.history}
      />
    </>
  );
};

export default PricesTab;