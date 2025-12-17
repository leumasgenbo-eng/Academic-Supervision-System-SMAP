
import React, { useState, useMemo } from 'react';
import { GlobalSettings, StudentData, BooklistItem, MaterialStockItem, PriceRecommendation, SchoolClass } from '../types';
import EditableField from './EditableField';

interface LearnerMaterialsBooklistProps {
    settings: GlobalSettings;
    onSettingChange: (key: keyof GlobalSettings, value: any) => void;
    students: StudentData[];
    setStudents: React.Dispatch<React.SetStateAction<StudentData[]>>;
    onSave: () => void;
    schoolClass: SchoolClass;
}

const LearnerMaterialsBooklist: React.FC<LearnerMaterialsBooklistProps> = ({
    settings,
    onSettingChange,
    students,
    setStudents,
    onSave,
    schoolClass
}) => {
    const [activeSubTab, setActiveSubTab] = useState<'Materials List' | 'Booklist Summary' | 'Stock Inventory' | 'Price Management' | 'Reports'>('Materials List');
    const [selectedLearnerId, setSelectedLearnerId] = useState<number | null>(null);

    // --- DATA ACCESSORS ---
    const classBooklist = settings.classBooklists?.[schoolClass] || [];
    const materialStock = settings.materialStock || [];
    const priceRecommendations = settings.priceRecommendations || [];

    // --- HELPERS ---
    const updateBooklist = (newList: BooklistItem[]) => {
        onSettingChange('classBooklists', { ...settings.classBooklists, [schoolClass]: newList });
    };

    const handleIssueMaterial = (studentId: number, materialId: string, status: boolean) => {
        setStudents(prev => prev.map(s => {
            if (s.id !== studentId) return s;
            const currentStatus = s.materialStatus || {};
            return {
                ...s,
                materialStatus: {
                    ...currentStatus,
                    [materialId]: {
                        issued: status,
                        date: status ? new Date().toISOString().split('T')[0] : '',
                        condition: 'Good'
                    }
                }
            };
        }));
    };

    const handleAddBook = () => {
        const newBook: BooklistItem = {
            id: Date.now().toString(),
            subject: 'New Subject',
            title: 'New Book',
            author: '',
            publisher: '',
            edition: '',
            isApproved: true,
            isMandatory: true,
            unitPrice: 0
        };
        updateBooklist([...classBooklist, newBook]);
    };

    const handleAddStock = () => {
        const newItem: MaterialStockItem = {
            id: Date.now().toString(),
            name: 'New Item',
            category: 'Stationery',
            openingStock: 0,
            reorderLevel: 5,
            unitPrice: 0
        };
        onSettingChange('materialStock', [...materialStock, newItem]);
    };

    // --- RENDERERS ---

    const renderLearnerMaterials = () => (
        <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar: Learner List */}
            <div className="w-full md:w-1/3 bg-gray-50 border rounded p-4 h-[600px] overflow-y-auto">
                <h4 className="font-bold text-gray-700 uppercase text-xs mb-4 border-b pb-2">Learner Class List</h4>
                <div className="space-y-1">
                    {students.map(s => (
                        <button 
                            key={s.id}
                            onClick={() => setSelectedLearnerId(s.id)}
                            className={`w-full text-left p-2 rounded text-sm transition-colors ${selectedLearnerId === s.id ? 'bg-blue-600 text-white font-bold' : 'hover:bg-blue-50 text-gray-700'}`}
                        >
                            <div className="flex justify-between items-center">
                                <span className="uppercase truncate">{s.name}</span>
                                <span className="text-[10px] opacity-70">#{s.admissionInfo?.generatedId || s.id}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main: Material Checklist */}
            <div className="flex-1 bg-white border rounded p-4">
                {selectedLearnerId ? (
                    <>
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="font-black text-blue-900 uppercase">Materials Tracking - {students.find(s => s.id === selectedLearnerId)?.name}</h3>
                            <button onClick={onSave} className="bg-green-600 text-white px-4 py-1 rounded text-xs font-bold shadow">Save Progress</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left border-collapse">
                                <thead className="bg-gray-100 text-gray-700 uppercase">
                                    <tr>
                                        <th className="p-2 border">Learning Area</th>
                                        <th className="p-2 border">Material / Book Title</th>
                                        <th className="p-2 border text-center">Status</th>
                                        <th className="p-2 border">Issue Date</th>
                                        <th className="p-2 border">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {classBooklist.map(book => {
                                        const learner = students.find(s => s.id === selectedLearnerId);
                                        const status = learner?.materialStatus?.[book.id];
                                        return (
                                            <tr key={book.id} className="border-b hover:bg-gray-50">
                                                <td className="p-2 border font-semibold">{book.subject}</td>
                                                <td className="p-2 border">
                                                    <div className="font-bold">{book.title}</div>
                                                    <div className={`text-[9px] font-black ${book.isMandatory ? 'text-red-500' : 'text-blue-500'}`}>
                                                        {book.isMandatory ? 'MANDATORY' : 'OPTIONAL'}
                                                    </div>
                                                </td>
                                                <td className="p-2 border text-center">
                                                    <button 
                                                        onClick={() => handleIssueMaterial(selectedLearnerId, book.id, !status?.issued)}
                                                        className={`px-3 py-1 rounded text-[9px] font-black uppercase transition-colors ${status?.issued ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                                                    >
                                                        {status?.issued ? 'Issued' : 'Mark Issued'}
                                                    </button>
                                                </td>
                                                <td className="p-2 border font-mono">{status?.date || '-'}</td>
                                                <td className="p-2 border">
                                                    <input type="text" className="w-full bg-transparent border-none p-0 text-[10px]" placeholder="Add note..." />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {classBooklist.length === 0 && (
                                        <tr><td colSpan={5} className="p-8 text-center text-gray-400 italic">No materials configured for this class. Go to "Booklist Summary" to add items.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 italic">
                        Select a learner from the list to track materials.
                    </div>
                )}
            </div>
        </div>
    );

    const renderBooklistSummary = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-blue-900 uppercase">Class Booklist Summary</h3>
                <button onClick={handleAddBook} className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-xs shadow hover:bg-blue-700">+ Add Book</button>
            </div>
            <div className="overflow-x-auto border rounded bg-white">
                <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-blue-900 text-white uppercase text-[10px]">
                        <tr>
                            <th className="p-3 border-r border-blue-800">Subject</th>
                            <th className="p-3 border-r border-blue-800">Approved Textbook</th>
                            <th className="p-3 border-r border-blue-800">Author & Publisher</th>
                            <th className="p-3 border-r border-blue-800 text-center">Edition</th>
                            <th className="p-3 border-r border-blue-800 text-center w-24">Type</th>
                            <th className="p-3 text-center">Unit Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {classBooklist.map((book, idx) => (
                            <tr key={book.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 border-r">
                                    <EditableField value={book.subject} onChange={v => {
                                        const newList = [...classBooklist];
                                        newList[idx] = { ...newList[idx], subject: v };
                                        updateBooklist(newList);
                                    }} className="w-full font-bold uppercase" />
                                </td>
                                <td className="p-3 border-r">
                                    <EditableField value={book.title} onChange={v => {
                                        const newList = [...classBooklist];
                                        newList[idx] = { ...newList[idx], title: v };
                                        updateBooklist(newList);
                                    }} className="w-full font-bold text-blue-800" />
                                </td>
                                <td className="p-3 border-r">
                                    <div className="flex flex-col gap-1">
                                        <EditableField value={book.author} onChange={v => {
                                            const newList = [...classBooklist];
                                            newList[idx] = { ...newList[idx], author: v };
                                            updateBooklist(newList);
                                        }} className="w-full" placeholder="Author" />
                                        <EditableField value={book.publisher} onChange={v => {
                                            const newList = [...classBooklist];
                                            newList[idx] = { ...newList[idx], publisher: v };
                                            updateBooklist(newList);
                                        }} className="w-full text-[10px] text-gray-500" placeholder="Publisher" />
                                    </div>
                                </td>
                                <td className="p-3 border-r text-center">
                                    <EditableField value={book.edition} onChange={v => {
                                        const newList = [...classBooklist];
                                        newList[idx] = { ...newList[idx], edition: v };
                                        updateBooklist(newList);
                                    }} className="w-full text-center" placeholder="e.g. 2nd Ed." />
                                </td>
                                <td className="p-3 border-r text-center">
                                    <select 
                                        value={book.isMandatory ? 'Mandatory' : 'Optional'} 
                                        onChange={e => {
                                            const newList = [...classBooklist];
                                            newList[idx] = { ...newList[idx], isMandatory: e.target.value === 'Mandatory' };
                                            updateBooklist(newList);
                                        }}
                                        className="text-[10px] border rounded"
                                    >
                                        <option>Mandatory</option>
                                        <option>Optional</option>
                                    </select>
                                </td>
                                <td className="p-3 text-center">
                                    <div className="flex items-center justify-center gap-1 font-mono font-bold">
                                        <span>GHS</span>
                                        <input 
                                            type="number" 
                                            value={book.unitPrice} 
                                            onChange={e => {
                                                const newList = [...classBooklist];
                                                newList[idx] = { ...newList[idx], unitPrice: parseFloat(e.target.value) || 0 };
                                                updateBooklist(newList);
                                            }}
                                            className="w-16 border rounded p-1 text-center"
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderStockInventory = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800 uppercase">Master Stock & Inventory</h3>
                <button onClick={handleAddStock} className="bg-gray-800 text-white px-4 py-2 rounded font-bold text-xs shadow hover:bg-black">+ Register Item</button>
            </div>
            <div className="overflow-x-auto border rounded bg-white">
                <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-gray-800 text-white uppercase text-[10px]">
                        <tr>
                            <th className="p-3 border-r">Item Name</th>
                            <th className="p-3 border-r">Category</th>
                            <th className="p-3 border-r text-center">Opening</th>
                            <th className="p-3 border-r text-center">Issued</th>
                            <th className="p-3 border-r text-center">Returned</th>
                            <th className="p-3 border-r text-center">Balance</th>
                            <th className="p-3 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {materialStock.map((item, idx) => {
                            // Count issued across all students
                            const issuedCount = students.filter(s => s.materialStatus?.[item.id]?.issued).length;
                            const balance = item.openingStock - issuedCount;
                            const isLow = balance <= item.reorderLevel;
                            return (
                                <tr key={item.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 border-r">
                                        <EditableField value={item.name} onChange={v => {
                                            const newList = [...materialStock];
                                            newList[idx] = { ...newList[idx], name: v };
                                            onSettingChange('materialStock', newList);
                                        }} className="w-full font-bold" />
                                    </td>
                                    <td className="p-3 border-r">
                                        <select 
                                            value={item.category} 
                                            onChange={e => {
                                                const newList = [...materialStock];
                                                newList[idx] = { ...newList[idx], category: e.target.value as any };
                                                onSettingChange('materialStock', newList);
                                            }}
                                            className="w-full border-none bg-transparent"
                                        >
                                            <option>Textbook</option><option>Workbook</option><option>Stationery</option><option>Kit</option>
                                        </select>
                                    </td>
                                    <td className="p-3 border-r text-center">
                                        <input 
                                            type="number" 
                                            value={item.openingStock} 
                                            onChange={e => {
                                                const newList = [...materialStock];
                                                newList[idx] = { ...newList[idx], openingStock: parseInt(e.target.value) || 0 };
                                                onSettingChange('materialStock', newList);
                                            }}
                                            className="w-16 border rounded p-1 text-center font-mono"
                                        />
                                    </td>
                                    <td className="p-3 border-r text-center font-bold text-blue-600">{issuedCount}</td>
                                    <td className="p-3 border-r text-center font-bold text-green-600">0</td>
                                    <td className="p-3 border-r text-center font-black text-gray-900">{balance}</td>
                                    <td className="p-3 text-center">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${isLow ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {isLow ? 'LOW STOCK' : 'SUFFICIENT'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="bg-white p-6 rounded shadow-md h-full flex flex-col font-sans">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                    <h2 className="text-2xl font-black text-blue-900 uppercase">Class Materials & Booklist Tracking</h2>
                    <p className="text-xs text-gray-500">Resource Compliance • Stock Control • Price Management</p>
                </div>
                <div className="flex gap-1 bg-gray-100 p-1 rounded">
                    {['Materials List', 'Booklist Summary', 'Stock Inventory', 'Price Management', 'Reports'].map(t => (
                        <button 
                            key={t}
                            onClick={() => setActiveSubTab(t as any)}
                            className={`px-4 py-2 rounded text-xs font-bold transition-all ${activeSubTab === t ? 'bg-white shadow text-blue-900' : 'text-gray-500 hover:text-blue-700'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* CLASS INFORMATION HEADER (Read-only reference) */}
            <div className="bg-blue-50 p-4 rounded border border-blue-100 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold uppercase text-blue-800">
                <div>Academic Year: {settings.academicYear}</div>
                <div>Term: {settings.termInfo}</div>
                <div>Class: {schoolClass}</div>
                <div>Total Enrolment: {students.length}</div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
                {activeSubTab === 'Materials List' && renderLearnerMaterials()}
                {activeSubTab === 'Booklist Summary' && renderBooklistSummary()}
                {activeSubTab === 'Stock Inventory' && renderStockInventory()}
                {activeSubTab === 'Price Management' && (
                    <div className="p-8 text-center text-gray-400 italic border-2 border-dashed rounded">
                        <div className="text-4xl mb-4">💰</div>
                        Price Recommendation and Approval workflow module under maintenance.
                    </div>
                )}
                {activeSubTab === 'Reports' && (
                    <div className="p-8 text-center text-gray-400 italic border-2 border-dashed rounded">
                        <div className="text-4xl mb-4">📊</div>
                        Automated Materials Status & Compliance Reports generator loading...
                    </div>
                )}
            </div>

            <div className="mt-6 border-t pt-4 flex justify-end gap-2 no-print">
                <button className="bg-gray-100 text-gray-600 px-6 py-2 rounded font-bold text-sm hover:bg-gray-200">Export CSV</button>
                <button onClick={onSave} className="bg-blue-600 text-white px-8 py-2 rounded font-bold text-sm shadow hover:bg-blue-700 transition-transform active:scale-95">Save All Progress</button>
            </div>
        </div>
    );
};

export default LearnerMaterialsBooklist;
