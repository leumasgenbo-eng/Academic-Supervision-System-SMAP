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
    const [activeSubTab, setActiveSubTab] = useState<'Materials List' | 'Booklist Summary' | 'Stock Inventory'>('Materials List');
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const classBooklist = settings.classBooklists?.[schoolClass] || [];
    const materialStock = settings.materialStock || [];

    const handleSharePDF = async () => {
        setIsGeneratingPDF(true);
        const element = document.getElementById('materials-print-area');
        if (!element) return;

        // @ts-ignore
        if (typeof window.html2pdf === 'undefined') {
            alert("PDF library not loaded.");
            setIsGeneratingPDF(false);
            return;
        }

        const opt = {
            margin: 10,
            filename: `Learner_Materials_${schoolClass}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };

        try {
            // @ts-ignore
            await window.html2pdf().set(opt).from(element).save();
        } catch (e) {
            console.error(e);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const updateBooklist = (newList: BooklistItem[]) => {
        onSettingChange('classBooklists', { ...settings.classBooklists, [schoolClass]: newList });
    };

    const handleIssueMaterial = (studentId: number, materialId: string, status: boolean) => {
        setStudents(prev => prev.map(s => {
            if (s.id !== studentId) return s;
            const currentStatus = s.materialStatus || {};
            return { ...s, materialStatus: { ...currentStatus, [materialId]: { issued: status, date: status ? new Date().toISOString().split('T')[0] : '', condition: 'Good' } } };
        }));
    };

    return (
        <div className="bg-white p-6 rounded shadow-md h-full flex flex-col font-sans">
            <div className="flex justify-between items-center mb-6 border-b pb-4 no-print">
                <div><h2 className="text-2xl font-black text-blue-900 uppercase">Class Materials & Booklist</h2></div>
                <div className="flex gap-2">
                    <button onClick={handleSharePDF} disabled={isGeneratingPDF} className="bg-green-600 text-white px-4 py-2 rounded font-bold text-xs shadow">{isGeneratingPDF ? 'Working...' : 'Share PDF Report'}</button>
                    <div className="flex gap-1 bg-gray-100 p-1 rounded">
                        {['Materials List', 'Booklist Summary', 'Stock Inventory'].map(t => (
                            <button key={t} onClick={() => setActiveSubTab(t as any)} className={`px-4 py-2 rounded text-xs font-bold transition-all ${activeSubTab === t ? 'bg-white shadow text-blue-900' : 'text-gray-500 hover:text-blue-700'}`}>{t}</button>
                        ))}
                    </div>
                </div>
            </div>

            <div id="materials-print-area" className="flex-1 overflow-y-auto">
                {/* Report Header */}
                <div className="text-center mb-8 border-b-2 border-gray-800 pb-4 hidden print:block">
                    <h1 className="text-2xl font-black uppercase text-blue-900">
                        <EditableField value={settings.schoolName} onChange={(v) => onSettingChange('schoolName', v)} className="text-center w-full" />
                    </h1>
                    <div className="flex justify-center gap-4 text-xs font-bold text-gray-600 mb-1">
                        <EditableField value={settings.schoolAddress || ''} onChange={(v) => onSettingChange('schoolAddress', v)} className="text-center w-full" />
                    </div>
                    <h2 className="text-lg font-bold text-red-700 uppercase">LEARNER MATERIALS COMPLIANCE - {schoolClass}</h2>
                    <p className="text-xs font-bold text-gray-500 uppercase">{settings.termInfo} | {settings.academicYear}</p>
                </div>

                {activeSubTab === 'Materials List' && (
                    <div className="overflow-x-auto border rounded bg-white">
                        <table className="w-full text-xs text-left border-collapse">
                            <thead className="bg-blue-900 text-white uppercase text-[9px]">
                                <tr><th className="p-2 border">Pupil Name</th>{classBooklist.map(b => <th key={b.id} className="p-2 border text-center">{b.title}</th>)}</tr>
                            </thead>
                            <tbody>
                                {students.map(s => (
                                    <tr key={s.id} className="border-b">
                                        <td className="p-2 border font-bold uppercase">{s.name}</td>
                                        {classBooklist.map(b => (
                                            <td key={b.id} className="p-2 border text-center">
                                                <input type="checkbox" className="no-print-appearance" checked={s.materialStatus?.[b.id]?.issued || false} onChange={e => handleIssueMaterial(s.id, b.id, e.target.checked)} />
                                                <span className="hidden print:inline font-bold">{s.materialStatus?.[b.id]?.issued ? '✔' : '✘'}</span>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeSubTab === 'Booklist Summary' && (
                    <div className="space-y-4">
                        <table className="w-full text-xs text-left border-collapse border">
                            <thead className="bg-gray-800 text-white uppercase text-[9px]">
                                <tr><th className="p-3 border">Subject</th><th className="p-3 border">Textbook Title</th><th className="p-3 border">Author/Publisher</th><th className="p-3 border text-center">Price (GHS)</th></tr>
                            </thead>
                            <tbody>
                                {classBooklist.map(book => (
                                    <tr key={book.id} className="border-b">
                                        <td className="p-3 border font-bold uppercase">{book.subject}</td>
                                        <td className="p-3 border font-bold text-blue-800">{book.title}</td>
                                        <td className="p-3 border">{book.author} / {book.publisher}</td>
                                        <td className="p-3 border text-center font-mono">{book.unitPrice.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            <div className="mt-4 flex justify-end no-print">
                <button onClick={onSave} className="bg-blue-600 text-white px-8 py-2 rounded font-bold text-sm shadow">Save Progress</button>
            </div>
        </div>
    );
};

export default LearnerMaterialsBooklist;