
import React, { useState, useMemo } from 'react';
import { GlobalSettings, DisciplinaryRecord, StudentData, SchoolClass } from '../types';
import { DISCIPLINARY_CATEGORIES, DISCIPLINARY_LOCATIONS, DISCIPLINARY_REFERRALS, CORRECTIVE_MEASURES } from '../constants';
import EditableField from './EditableField';

interface DisciplinaryPortalProps {
    settings: GlobalSettings;
    onSettingChange: (key: keyof GlobalSettings, value: any) => void;
    students: StudentData[];
    onSave: () => void;
    schoolClass: SchoolClass;
}

const DisciplinaryPortal: React.FC<DisciplinaryPortalProps> = ({ 
    settings, 
    onSettingChange, 
    students, 
    onSave, 
    schoolClass 
}) => {
    const [view, setView] = useState<'List' | 'Log Form'>('List');
    const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    // --- FORM STATE ---
    const initialForm: Partial<DisciplinaryRecord> = {
        refNumber: `LOG-${Date.now().toString().slice(-6)}`,
        incidentDate: new Date().toISOString().split('T')[0],
        incidentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        location: 'Classroom',
        severity: 'Minor',
        category: 'Lateness',
        status: 'Open',
        parentNotified: false,
        parentNotificationDate: '',
        referralDate: '',
        witnesses: '',
        reportedBy: '',
        immediateAction: '',
        referredTo: '',
        outcome: '',
        correctiveActionApplied: '',
        improvementPlan: '',
        remarks: ''
    };

    const [form, setForm] = useState<Partial<DisciplinaryRecord>>(initialForm);

    const disciplinaryRecords = settings.disciplinaryRecords || [];

    const handleAddRecord = () => {
        if (!form.pupilId || !form.description) {
            alert("Pupil Identification and Incident Description are required.");
            return;
        }

        const pupil = students.find(s => s.id.toString() === form.pupilId?.toString());
        const record: DisciplinaryRecord = {
            ...form as DisciplinaryRecord,
            id: Date.now().toString(),
            pupilName: pupil?.name || 'Unknown',
            pupilClass: schoolClass,
            pupilAge: pupil?.age || '',
            pupilGender: pupil?.gender || pupil?.admissionInfo?.gender || '',
            actionDateTime: new Date().toLocaleString()
        };

        onSettingChange('disciplinaryRecords', [record, ...disciplinaryRecords]);
        alert("Disciplinary record logbook entry saved.");
        setForm(initialForm);
        setView('List');
    };

    const updateRecordStatus = (id: string, newStatus: DisciplinaryRecord['status']) => {
        const updated = disciplinaryRecords.map(r => 
            r.id === id ? { ...r, status: newStatus, closureDate: newStatus === 'Closed' ? new Date().toLocaleDateString() : '' } : r
        );
        onSettingChange('disciplinaryRecords', updated);
    };

    const filteredRecords = useMemo(() => {
        return disciplinaryRecords.filter(r => 
            r.pupilName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            r.refNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [disciplinaryRecords, searchTerm]);

    const repeatOffensesCount = (pupilId: string | number) => {
        return disciplinaryRecords.filter(r => r.pupilId.toString() === pupilId.toString()).length;
    };

    const handlePrintLog = async (id: string) => {
        setIsGenerating(true);
        const element = document.getElementById(`print-log-${id}`);
        if (element && (window as any).html2pdf) {
            const opt = {
                margin: 10,
                filename: `Indiscipline_Log_${id}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            await (window as any).html2pdf().set(opt).from(element).save();
        }
        setIsGenerating(false);
    };

    const renderLogForm = () => (
        <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-blue-900 max-w-4xl mx-auto font-sans">
            <div className="text-center mb-8 border-b-4 border-double border-blue-900 pb-4">
                <h1 className="text-3xl font-black uppercase text-blue-900 leading-tight">UNITED BAYLOR ACADEMY</h1>
                <h2 className="text-xl font-bold text-red-700 mt-2 uppercase tracking-widest">Pupil Indiscipline Log Book Entry</h2>
                <div className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-tighter">Tracking • Control • Referral • Resolution</div>
            </div>

            <div className="space-y-8">
                {/* SECTION 1: INCIDENT DETAILS */}
                <div className="p-4 border border-gray-300 rounded-lg bg-gray-50 shadow-sm relative">
                    <div className="absolute -top-3 left-4 bg-white px-2 text-xs font-black text-blue-800 border-x border-t border-gray-300 rounded-t">SECTION 1: INCIDENT DETAILS</div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                        <div><label className="text-[10px] font-black uppercase text-gray-400">Ref Number</label><input value={form.refNumber} disabled className="w-full border p-2 rounded text-xs font-mono bg-white" /></div>
                        <div><label className="text-[10px] font-black uppercase text-gray-400">Date of Incident</label><input type="date" value={form.incidentDate} onChange={e => setForm({...form, incidentDate: e.target.value})} className="w-full border p-2 rounded text-xs" /></div>
                        <div><label className="text-[10px] font-black uppercase text-gray-400">Time of Incident</label><input type="time" value={form.incidentTime} onChange={e => setForm({...form, incidentTime: e.target.value})} className="w-full border p-2 rounded text-xs" /></div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400">Location</label>
                            <select value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full border p-2 rounded text-xs">
                                {DISCIPLINARY_LOCATIONS.map(l => <option key={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: PUPIL INFORMATION */}
                <div className="p-4 border border-gray-300 rounded-lg bg-blue-50 shadow-sm relative">
                    <div className="absolute -top-3 left-4 bg-white px-2 text-xs font-black text-blue-800 border-x border-t border-gray-300 rounded-t">SECTION 2: PUPIL INFORMATION</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400">Select Pupil</label>
                            <select 
                                value={form.pupilId} 
                                onChange={e => {
                                    const p = students.find(s => s.id.toString() === e.target.value);
                                    setForm({...form, pupilId: e.target.value, pupilName: p?.name || '', pupilGender: p?.admissionInfo?.gender || '', pupilAge: p?.age || ''});
                                }} 
                                className="w-full border p-2 rounded text-xs font-bold"
                            >
                                <option value="">-- Choose From Class List --</option>
                                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.admissionInfo?.generatedId || 'No ID'})</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div><label className="text-[10px] font-black uppercase text-gray-400">Class</label><input value={schoolClass} disabled className="w-full border p-2 rounded text-xs bg-white" /></div>
                            <div><label className="text-[10px] font-black uppercase text-gray-400">Gender</label><input value={form.pupilGender || ''} disabled className="w-full border p-2 rounded text-xs bg-white" /></div>
                            <div><label className="text-[10px] font-black uppercase text-gray-400">Age</label><input value={form.pupilAge || ''} disabled className="w-full border p-2 rounded text-xs bg-white" /></div>
                        </div>
                    </div>
                </div>

                {/* SECTION 3: INDISCIPLINE DETAILS */}
                <div className="p-4 border border-gray-300 rounded-lg bg-white shadow-sm relative">
                    <div className="absolute -top-3 left-4 bg-white px-2 text-xs font-black text-blue-800 border-x border-t border-gray-300 rounded-t">SECTION 3: INDISCIPLINE DETAILS</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 mb-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400">Category</label>
                            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border p-2 rounded text-xs">
                                {DISCIPLINARY_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400">Severity Level</label>
                            <div className="flex gap-1 mt-1">
                                {['Minor', 'Moderate', 'Major'].map(lvl => (
                                    <button 
                                        key={lvl}
                                        onClick={() => setForm({...form, severity: lvl as any})}
                                        className={`flex-1 py-1 px-2 rounded text-[10px] font-black uppercase border transition-all ${form.severity === lvl ? 'bg-red-600 text-white border-red-700 shadow-md' : 'bg-white text-gray-400 border-gray-200'}`}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div><label className="text-[10px] font-black uppercase text-gray-400">Reported By (Staff)</label><input value={form.reportedBy} onChange={e => setForm({...form, reportedBy: e.target.value})} className="w-full border p-2 rounded text-xs" placeholder="Staff Name" /></div>
                    </div>
                    <div className="mb-4">
                        <label className="text-[10px] font-black uppercase text-gray-400">Incident Description</label>
                        <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border p-2 rounded text-xs h-24" placeholder="Detail what happened precisely..."></textarea>
                    </div>
                    <div><label className="text-[10px] font-black uppercase text-gray-400">Witnesses (Staff or Pupils)</label><input value={form.witnesses} onChange={e => setForm({...form, witnesses: e.target.value})} className="w-full border p-2 rounded text-xs" placeholder="Names of those who observed..." /></div>
                </div>

                {/* SECTION 4 & 5: ACTION & REFERRAL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border border-gray-300 rounded-lg bg-green-50 shadow-sm relative">
                        <div className="absolute -top-3 left-4 bg-white px-2 text-xs font-black text-blue-800 border-x border-t border-gray-300 rounded-t">SECTION 4: IMMEDIATE ACTION</div>
                        <div className="mt-2 space-y-3">
                            <div><label className="text-[10px] font-black uppercase text-gray-400">Action Taken</label><input value={form.immediateAction} onChange={e => setForm({...form, immediateAction: e.target.value})} className="w-full border p-2 rounded text-xs" placeholder="To stop behavior..." /></div>
                            <div><label className="text-[10px] font-black uppercase text-gray-400">Staff Responsible</label><input value={form.actionResponsible} onChange={e => setForm({...form, actionResponsible: e.target.value})} className="w-full border p-2 rounded text-xs" /></div>
                        </div>
                    </div>
                    <div className="p-4 border border-gray-300 rounded-lg bg-orange-50 shadow-sm relative">
                        <div className="absolute -top-3 left-4 bg-white px-2 text-xs font-black text-blue-800 border-x border-t border-gray-300 rounded-t">SECTION 5: REFERRAL & FOLLOW-UP</div>
                        <div className="mt-2 space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="text-[10px] font-black uppercase text-gray-400">Referred To</label>
                                    <select value={form.referredTo} onChange={e => setForm({...form, referredTo: e.target.value})} className="w-full border p-2 rounded text-xs bg-white">
                                        <option value="">None / Self</option>
                                        {DISCIPLINARY_REFERRALS.map(r => <option key={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div><label className="text-[10px] font-black uppercase text-gray-400">Referral Date</label><input type="date" value={form.referralDate} onChange={e => setForm({...form, referralDate: e.target.value})} className="w-full border p-2 rounded text-xs" /></div>
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-700 cursor-pointer">
                                    <input type="checkbox" checked={form.parentNotified} onChange={e => setForm({...form, parentNotified: e.target.checked})} className="w-4 h-4" />
                                    Parent Notified?
                                </label>
                                {form.parentNotified && <input type="date" value={form.parentNotificationDate} onChange={e => setForm({...form, parentNotificationDate: e.target.value})} className="flex-1 border p-1 rounded text-xs" />}
                            </div>
                        </div>
                    </div>
                </div>

                {/* FINAL ACTIONS */}
                <div className="flex justify-between items-center border-t-2 border-blue-900 pt-6">
                    <button onClick={() => setView('List')} className="px-6 py-2 rounded font-black text-sm uppercase text-gray-500 hover:bg-gray-100 transition-all">Cancel</button>
                    <button onClick={handleAddRecord} className="bg-blue-900 text-white px-12 py-3 rounded-xl font-black text-sm uppercase shadow-xl hover:bg-blue-800 active:scale-95 transition-all">Record Incident Log Entry</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100">
            {view === 'List' ? (
                <div className="p-4 md:p-8 max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-blue-900 uppercase tracking-tighter">Indiscipline Logbook</h2>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Pupil Discipline Control & Referral System</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Search Pupil Name or Ref..." 
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border-2 border-blue-100 rounded-full text-sm font-bold focus:border-blue-500 outline-none w-64 shadow-inner"
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">🔍</span>
                            </div>
                            <button 
                                onClick={() => setView('Log Form')}
                                className="bg-red-600 text-white px-6 py-2 rounded-full font-black text-xs uppercase shadow-lg hover:bg-red-700 transition-all"
                            >
                                + Record Incident
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <div className="text-[10px] font-black text-gray-400 uppercase">Total Incidents</div>
                            <div className="text-3xl font-black text-blue-900">{disciplinaryRecords.length}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <div className="text-[10px] font-black text-gray-400 uppercase text-red-500">Major Severity</div>
                            <div className="text-3xl font-black text-red-600">{disciplinaryRecords.filter(r => r.severity === 'Major').length}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <div className="text-[10px] font-black text-gray-400 uppercase text-orange-500">Unresolved (Open)</div>
                            <div className="text-3xl font-black text-orange-600">{disciplinaryRecords.filter(r => r.status === 'Open').length}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <div className="text-[10px] font-black text-gray-400 uppercase text-green-500">Cases Resolved</div>
                            <div className="text-3xl font-black text-green-600">{disciplinaryRecords.filter(r => r.status === 'Closed').length}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {filteredRecords.length === 0 ? (
                            <div className="bg-white p-20 rounded-2xl shadow-inner border-2 border-dashed border-gray-200 text-center">
                                <div className="text-6xl mb-4">📘</div>
                                <h3 className="text-xl font-bold text-gray-400">Logbook is empty for this search.</h3>
                                <p className="text-sm text-gray-300">New incidents recorded in {schoolClass} will appear here.</p>
                            </div>
                        ) : (
                            filteredRecords.map(record => (
                                <div key={record.id} className={`bg-white rounded-2xl shadow-sm border-l-8 overflow-hidden transition-all hover:shadow-md ${record.severity === 'Major' ? 'border-red-600' : record.severity === 'Moderate' ? 'border-orange-500' : 'border-blue-400'}`}>
                                    <div className="p-6 flex flex-col md:flex-row justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-[10px] font-mono font-black text-gray-400 bg-gray-50 px-2 py-1 rounded border">{record.refNumber}</span>
                                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded text-white ${record.severity === 'Major' ? 'bg-red-600' : record.severity === 'Moderate' ? 'bg-orange-500' : 'bg-blue-400'}`}>{record.severity} Severity</span>
                                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded border ${record.status === 'Closed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200 animate-pulse'}`}>{record.status}</span>
                                            </div>
                                            <h3 className="text-xl font-black text-gray-800 uppercase leading-none">{record.pupilName}</h3>
                                            <div className="flex gap-4 text-xs font-bold text-gray-500 mt-2">
                                                <span>Category: <span className="text-blue-900">{record.category}</span></span>
                                                <span>•</span>
                                                <span>Incident Date: <span className="text-gray-700">{record.incidentDate}</span></span>
                                                <span>•</span>
                                                <span>Repeat: <span className="text-red-600">{repeatOffensesCount(record.pupilId)}x</span></span>
                                            </div>
                                            <p className="mt-4 text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg border border-gray-100">"{record.description}"</p>
                                        </div>
                                        <div className="w-full md:w-64 border-l border-gray-100 pl-6 flex flex-col justify-between">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center text-[10px] uppercase font-black text-gray-400">
                                                    <span>Parent Notified:</span>
                                                    <span className={record.parentNotified ? 'text-green-600' : 'text-red-500'}>{record.parentNotified ? 'YES' : 'NO'}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] uppercase font-black text-gray-400">
                                                    <span>Location:</span>
                                                    <span className="text-gray-700">{record.location}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] uppercase font-black text-gray-400">
                                                    <span>Referred To:</span>
                                                    <span className="text-orange-600">{record.referredTo || 'N/A'}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-6">
                                                <button 
                                                    onClick={() => updateRecordStatus(record.id, record.status === 'Closed' ? 'Open' : 'Closed')}
                                                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${record.status === 'Closed' ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-green-600 text-white hover:bg-green-700'}`}
                                                >
                                                    {record.status === 'Closed' ? 'Re-open' : 'Close Case'}
                                                </button>
                                                <button onClick={() => handlePrintLog(record.id)} className="p-2 rounded-lg bg-blue-100 text-blue-900 hover:bg-blue-200" title="Export Log Entry">🖨️</button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* HIDDEN PRINT AREA */}
                                    <div id={`print-log-${record.id}`} className="hidden print:block bg-white p-10 font-sans">
                                        <div className="text-center mb-10 border-b-8 border-double border-blue-900 pb-6">
                                            <h1 className="text-4xl font-black uppercase text-blue-900 tracking-tighter mb-1 drop-shadow-sm">
                                                <EditableField value={settings.schoolName} onChange={(v) => onSettingChange('schoolName', v)} className="text-center w-full bg-transparent" />
                                            </h1>
                                            <div className="mb-2">
                                                <EditableField value={settings.schoolAddress || ''} onChange={(v) => onSettingChange('schoolAddress', v)} className="text-center w-full text-[10px] font-black text-gray-500 uppercase tracking-widest" placeholder="Institution Address" />
                                            </div>
                                            <div className="flex justify-center gap-6 text-[10px] font-bold text-gray-700 bg-gray-50 inline-flex px-6 py-2 rounded-full border border-gray-100 shadow-inner">
                                                <div className="flex gap-2"><span>TEL:</span><EditableField value={settings.schoolContact} onChange={(v) => onSettingChange('schoolContact', v)} /></div>
                                                <span className="text-gray-300">|</span>
                                                <div className="flex gap-2"><span>EMAIL:</span><EditableField value={settings.schoolEmail} onChange={(v) => onSettingChange('schoolEmail', v)} /></div>
                                            </div>
                                            <h2 className="text-2xl font-black text-red-700 uppercase mt-4 tracking-[0.3em] leading-none">Indiscipline Incident Log</h2>
                                            <div className="text-xs font-bold text-gray-400 mt-2 uppercase">Reference: {record.refNumber}</div>
                                        </div>

                                        <div className="space-y-8 text-sm">
                                            <div className="grid grid-cols-2 gap-8 border-b-2 pb-4">
                                                <div>
                                                    <h3 className="font-black text-blue-900 uppercase border-b mb-2 text-xs">Section 1: Incident Details</h3>
                                                    <p><strong>Date:</strong> {record.incidentDate}</p>
                                                    <p><strong>Time:</strong> {record.incidentTime}</p>
                                                    <p><strong>Location:</strong> {record.location}</p>
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-blue-900 uppercase border-b mb-2 text-xs">Section 2: Pupil Info</h3>
                                                    <p><strong>Name:</strong> {record.pupilName}</p>
                                                    <p><strong>Class:</strong> {record.pupilClass}</p>
                                                    <p><strong>Age/Gender:</strong> {record.pupilAge} / {record.pupilGender}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="font-black text-blue-900 uppercase border-b mb-2 text-xs">Section 3: Indiscipline Details</h3>
                                                <p><strong>Category:</strong> {record.category} ({record.severity})</p>
                                                <div className="bg-gray-50 p-4 border rounded mt-2 italic font-serif">"{record.description}"</div>
                                                <p className="mt-2"><strong>Witnesses:</strong> {record.witnesses || 'No witnesses recorded'}</p>
                                                <p><strong>Reported By:</strong> {record.reportedBy}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-8 border-t-2 pt-4">
                                                <div>
                                                    <h3 className="font-black text-blue-900 uppercase border-b mb-2 text-xs">Section 4: Immediate Action</h3>
                                                    <p><strong>Action Taken:</strong> {record.immediateAction}</p>
                                                    <p><strong>Responsible:</strong> {record.actionResponsible}</p>
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-blue-900 uppercase border-b mb-2 text-xs">Section 5: Referral & Parent</h3>
                                                    <p><strong>Referred To:</strong> {record.referredTo || 'Not referred'}</p>
                                                    <p><strong>Follow-up Action:</strong> {record.followUpAction || 'Awaiting follow-up'}</p>
                                                    <p><strong>Parent Notified:</strong> {record.parentNotified ? `Yes (${record.parentNotificationDate})` : 'No'}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="font-black text-blue-900 uppercase border-b mb-2 text-xs">Section 6: Outcome & Closure</h3>
                                                <p><strong>Resolution Status:</strong> {record.status}</p>
                                                <p><strong>Closure Date:</strong> {record.closureDate || 'Pending'}</p>
                                                <p><strong>Corrective Action:</strong> {record.correctiveActionApplied || 'None recorded'}</p>
                                                <p><strong>Remarks:</strong> {record.remarks}</p>
                                            </div>
                                        </div>

                                        <div className="mt-20 flex justify-between items-end border-t-2 border-gray-200 pt-10">
                                            <div className="text-center w-1/3">
                                                <div className="border-b border-black mb-1 h-10"></div>
                                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Reporting Staff</p>
                                            </div>
                                            <div className="text-center w-1/3">
                                                <div className="border-b border-black mb-1 h-10 flex items-end justify-center pb-1">
                                                    <span className="font-bold text-xs">{settings.headTeacherName}</span>
                                                </div>
                                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Head of Institution / Stamp</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : renderLogForm()}
        </div>
    );
};

export default DisciplinaryPortal;
