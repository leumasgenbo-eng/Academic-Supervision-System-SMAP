import React, { useState, useEffect } from 'react';
import { GlobalSettings, CalendarWeek } from '../types';
import { CALENDAR_LISTS } from '../constants';
import EditableField from './EditableField';

interface AcademicCalendarProps {
  settings: GlobalSettings;
  onSettingChange: (key: keyof GlobalSettings, value: any) => void;
  onSave: () => void;
}

type CalendarField = 'activity' | 'assessment' | 'leadTeam' | 'extraCurricular';

// Standalone component for list management within the selection modal
const ListManagerInternal: React.FC<{ 
    title: string; 
    items: string[]; 
    onAdd: (item: string) => void; 
    onRemove: (item: string) => void 
}> = ({ title, items, onAdd, onRemove }) => {
    const [newItem, setNewItem] = useState("");
    const handleAdd = () => {
        if (newItem.trim()) {
            onAdd(newItem.trim());
            setNewItem("");
        }
    };
    return (
        <div className="bg-white border-t p-4 animate-in slide-in-from-bottom duration-300">
            <h4 className="font-bold text-blue-900 mb-3 uppercase text-[10px] flex justify-between items-center">
                Manage {title} List
                <span className="bg-blue-100 px-2 py-0.5 rounded-full">{items.length}</span>
            </h4>
            <div className="max-h-[150px] overflow-y-auto mb-3 space-y-1 bg-gray-50 p-2 border rounded shadow-inner">
                {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[10px] p-1.5 hover:bg-red-50 rounded group border-b border-gray-100 last:border-0">
                        <span className="font-semibold text-gray-700">{item}</span>
                        <button onClick={() => onRemove(item)} className="text-red-500 font-bold hover:scale-125 transition-all px-2">&times;</button>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <input 
                    type="text"
                    value={newItem} 
                    onChange={e => setNewItem(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    className="flex-1 p-2 rounded text-xs border border-gray-300 outline-none focus:ring-1 focus:ring-blue-400 font-semibold" 
                    placeholder={`New ${title}...`} 
                />
                <button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-xs font-bold shadow-md">Add</button>
            </div>
        </div>
    );
};

const AcademicCalendar: React.FC<AcademicCalendarProps> = ({ settings, onSettingChange, onSave }) => {
  const [activeTerm, setActiveTerm] = useState<string>("Term 1");
  const [viewMode, setViewMode] = useState<'calendar' | 'list_manager'>('calendar');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingCell, setEditingCell] = useState<{ weekId: string, field: CalendarField } | null>(null);
  const [isEditingList, setIsEditingList] = useState(false);

  const currentLists = settings.calendarLists || {
      periods: CALENDAR_LISTS.periods,
      activities: CALENDAR_LISTS.activities,
      assessments: CALENDAR_LISTS.assessments,
      leadTeam: CALENDAR_LISTS.leadTeam,
      extraCurricular: CALENDAR_LISTS.extraCurricular
  };

  useEffect(() => {
      const currentCalendar = settings.academicCalendar || {};
      if (!currentCalendar[activeTerm] || currentCalendar[activeTerm].length === 0) {
          const initializedWeeks: CalendarWeek[] = currentLists.periods.map(period => ({
              id: period,
              period: period,
              activity: '',
              assessment: '',
              leadTeam: '',
              extraCurricular: '',
              logistics: '',
              dateFrom: '',
              dateTo: ''
          }));
          onSettingChange('academicCalendar', { ...currentCalendar, [activeTerm]: initializedWeeks });
      }
  }, [activeTerm, settings.academicCalendar]);

  const calendarData = settings.academicCalendar?.[activeTerm] || [];

  const updateWeek = (weekId: string, updates: Partial<CalendarWeek>) => {
      const updatedWeeks = calendarData.map(week => week.id === weekId ? { ...week, ...updates } : week);
      onSettingChange('academicCalendar', { ...settings.academicCalendar, [activeTerm]: updatedWeeks });
  };

  const addWeekRow = () => {
    const nextWeekNum = calendarData.length + 1;
    const newWeek: CalendarWeek = {
        id: `Week ${nextWeekNum}`,
        period: `Week ${nextWeekNum}`,
        activity: '',
        assessment: '',
        leadTeam: '',
        extraCurricular: ''
    };
    onSettingChange('academicCalendar', { ...settings.academicCalendar, [activeTerm]: [...calendarData, newWeek] });
  };

  const removeLastWeekRow = () => {
    if (calendarData.length <= 1) return;
    if (confirm("Remove the last week from the calendar?")) {
        onSettingChange('academicCalendar', { ...settings.academicCalendar, [activeTerm]: calendarData.slice(0, -1) });
    }
  };

  const handleListUpdate = (listKey: string, newList: string[]) => {
      onSettingChange('calendarLists', { ...currentLists, [listKey]: newList });
  };

  const addItemToList = (listKey: string, item: string) => {
      const list = currentLists[listKey as keyof typeof currentLists] || [];
      handleListUpdate(listKey, [...list, item.trim()]);
  };

  const removeItemFromList = (listKey: string, item: string) => {
      const list = currentLists[listKey as keyof typeof currentLists] || [];
      handleListUpdate(listKey, list.filter(i => i !== item));
  };

  const handleSharePDF = async () => {
      setIsGenerating(true);
      const element = document.getElementById('academic-calendar-print-area');
      if (element && (window as any).html2pdf) {
          const opt = {
              margin: 5,
              filename: `Academic_Calendar_${settings.schoolName.replace(/\s+/g, '_')}_${activeTerm}.pdf`,
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2, useCORS: true },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
          };
          await (window as any).html2pdf().set(opt).from(element).save();
      }
      setIsGenerating(false);
  };

  const renderSelectionModal = () => {
      if (!editingCell) return null;
      const week = calendarData.find(w => w.id === editingCell.weekId);
      if (!week) return null;

      let options: string[] = [];
      let title = "";
      let listKey = "";
      switch (editingCell.field) {
          case 'activity': options = currentLists.activities; title = "Activity"; listKey = "activities"; break;
          case 'assessment': options = currentLists.assessments; title = "Assessment"; listKey = "assessments"; break;
          case 'leadTeam': options = currentLists.leadTeam; title = "Lead Team"; listKey = "leadTeam"; break;
          case 'extraCurricular': options = currentLists.extraCurricular; title = "Extra-Curricular"; listKey = "extraCurricular"; break;
      }

      return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in duration-200">
                  <div className="p-4 border-b flex justify-between items-center bg-blue-900 text-white shadow-md">
                      <div>
                          <h3 className="font-black uppercase tracking-tight text-sm">{title} Selection</h3>
                          <p className="text-[10px] font-bold text-blue-200 uppercase">{week.period}</p>
                      </div>
                      <div className="flex items-center gap-4">
                          <button 
                            onClick={() => setIsEditingList(!isEditingList)} 
                            className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full border transition-all ${isEditingList ? 'bg-yellow-500 text-blue-900 border-yellow-600' : 'bg-blue-800 text-blue-100 border-blue-700 hover:bg-blue-700'}`}
                          >
                              {isEditingList ? 'Close Editor' : 'Edit Options'}
                          </button>
                          <button onClick={() => { setEditingCell(null); setIsEditingList(false); }} className="text-white hover:text-red-400 text-2xl font-black">&times;</button>
                      </div>
                  </div>
                  
                  <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 border-b">
                      {options.map((opt, idx) => (
                          <button
                              key={idx}
                              onClick={() => { updateWeek(week.id, { [editingCell.field]: opt }); setEditingCell(null); setIsEditingList(false); }}
                              className="text-left text-xs font-bold p-3 rounded-lg border border-white hover:border-blue-400 hover:bg-blue-50 transition-all bg-white shadow-sm text-gray-700 flex justify-between items-center group"
                          >
                              <span>{opt}</span>
                              <span className="opacity-0 group-hover:opacity-100 text-blue-500">✔</span>
                          </button>
                      ))}
                      {options.length === 0 && <div className="col-span-full text-center text-gray-400 py-10 italic text-xs font-bold">No items found. Click 'Edit Options' to add some.</div>}
                  </div>

                  {isEditingList ? (
                    <ListManagerInternal 
                        title={title} 
                        items={options} 
                        onAdd={(i) => addItemToList(listKey, i)} 
                        onRemove={(i) => removeItemFromList(listKey, i)} 
                    />
                  ) : (
                    <div className="p-4 bg-white">
                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">One-time Custom Overwrite:</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                className="flex-1 border-2 border-gray-100 focus:border-blue-500 rounded-lg p-2 text-sm font-bold transition-all outline-none"
                                placeholder="Type custom value..."
                                id="quick-cal-input"
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        const val = (e.currentTarget as HTMLInputElement).value;
                                        if(val) { updateWeek(week.id, { [editingCell.field]: val }); setEditingCell(null); }
                                    }
                                }}
                            />
                            <button 
                                onClick={() => {
                                    const val = (document.getElementById('quick-cal-input') as HTMLInputElement).value;
                                    if(val) { updateWeek(week.id, { [editingCell.field]: val }); setEditingCell(null); }
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-black text-xs uppercase shadow-lg"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                  )}
              </div>
          </div>
      );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
        {renderSelectionModal()}
        
        {/* Admin Navigation */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap justify-between items-center gap-4 no-print border border-gray-200">
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-blue-900 uppercase tracking-tighter leading-none">Academic Calendar</h1>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">United Baylor Academy &bull; Planner</div>
                </div>
                {/* Row Control UI */}
                <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-lg border ml-4">
                    <span className="text-[10px] font-black text-gray-500 uppercase px-2">Cycles:</span>
                    <button onClick={removeLastWeekRow} className="w-7 h-7 flex items-center justify-center bg-white border rounded text-red-600 font-black hover:bg-red-50 transition-colors shadow-sm">-</button>
                    <span className="w-8 text-center font-black text-blue-900 text-sm">{calendarData.length}</span>
                    <button onClick={addWeekRow} className="w-7 h-7 flex items-center justify-center bg-white border rounded text-green-600 font-black hover:bg-green-50 transition-colors shadow-sm">+</button>
                </div>
            </div>
            
            <div className="flex gap-3 items-center">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {['Term 1', 'Term 2', 'Term 3'].map(term => (
                        <button key={term} onClick={() => setActiveTerm(term)} className={`px-4 py-1.5 rounded-md text-xs font-black transition-all ${activeTerm === term ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-blue-900'}`}>{term}</button>
                    ))}
                </div>
                <button onClick={onSave} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-black text-xs uppercase tracking-widest shadow-md active:scale-95 transition-all">Save Changes</button>
                <button onClick={handleSharePDF} disabled={isGenerating} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-black text-xs uppercase tracking-widest shadow-md active:scale-95 transition-all">
                    {isGenerating ? 'Wait...' : 'Export PDF'}
                </button>
            </div>
        </div>

        <div id="academic-calendar-print-area" className="bg-white p-10 rounded-xl shadow-lg border border-gray-200 overflow-x-auto min-h-[1400px]">
            {/* INSTITUTION BRANDING HEADER */}
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
                <h2 className="text-2xl font-black text-red-700 uppercase mt-4 tracking-[0.3em] leading-none">Academic Calendar</h2>
                <div className="text-sm font-black text-blue-900 mt-2 uppercase">
                    {activeTerm} SESSION &bull; {settings.academicYear}
                </div>
            </div>

            <table className="w-full border-collapse shadow-sm rounded-xl overflow-hidden border border-gray-300">
                <thead className="bg-blue-900 text-white">
                    <tr className="uppercase text-[10px] tracking-widest font-black">
                        <th className="p-4 border-r border-blue-800 text-left w-32">Cycle / Week</th>
                        <th className="p-4 border-r border-blue-800 text-center w-48">Duration</th>
                        <th className="p-4 border-r border-blue-800 text-center">Academic Activity / Program</th>
                        <th className="p-4 border-r border-blue-800 text-center w-48">Assessment Focus</th>
                        <th className="p-4 border-r border-blue-800 text-center w-48">Extra-Curricular</th>
                        <th className="p-4 text-left w-40">Lead Facilitator</th>
                    </tr>
                </thead>
                <tbody>
                    {calendarData.map((week, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/30 border-b border-gray-100 transition-all duration-150 group">
                            <td className="p-4 border-r border-gray-100 font-black bg-gray-50/50 text-[11px] text-blue-900 uppercase">{week.period}</td>
                            <td className="p-2 border-r border-gray-100">
                                <div className="flex flex-col gap-1 items-center font-mono text-[9px] font-black text-gray-500">
                                    <div className="flex items-center gap-1 w-full justify-between px-2">
                                        <span className="text-gray-300">FR:</span>
                                        <input type="date" value={week.dateFrom || ''} onChange={e => updateWeek(week.id, { dateFrom: e.target.value })} className="border-none bg-transparent p-0 text-right cursor-pointer hover:text-blue-600 focus:ring-0 font-black" />
                                    </div>
                                    <div className="flex items-center gap-1 w-full justify-between px-2 border-t border-gray-50 pt-1">
                                        <span className="text-gray-300">TO:</span>
                                        <input type="date" value={week.dateTo || ''} onChange={e => updateWeek(week.id, { dateTo: e.target.value })} className="border-none bg-transparent p-0 text-right cursor-pointer hover:text-blue-600 focus:ring-0 font-black" />
                                    </div>
                                </div>
                            </td>
                            <td 
                                className={`p-4 border-r border-gray-100 cursor-pointer transition-colors relative group-hover:border-blue-200 text-center ${!week.activity ? 'italic text-gray-300' : 'font-black text-gray-800'}`} 
                                onClick={() => setEditingCell({ weekId: week.id, field: 'activity' })}
                            >
                                {week.activity || 'Click to select activity...'}
                                <span className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-[7px] bg-blue-100 text-blue-600 px-1 rounded font-black">EDIT</span>
                            </td>
                            <td className="p-4 border-r border-gray-100 cursor-pointer text-center" onClick={() => setEditingCell({ weekId: week.id, field: 'assessment' })}>
                                <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border uppercase inline-block ${!week.assessment || week.assessment.includes('No Assessment') ? 'text-gray-400 border-gray-100 bg-gray-50' : 'bg-red-50 text-red-700 border-red-200 shadow-sm'}`}>
                                    {week.assessment || 'Select Focus'}
                                </span>
                            </td>
                            <td className="p-4 border-r border-gray-100 cursor-pointer text-center" onClick={() => setEditingCell({ weekId: week.id, field: 'extraCurricular' })}>
                                <span className="text-[10px] font-bold text-gray-700 uppercase">
                                    {week.extraCurricular || <span className="text-gray-300 italic">Select...</span>}
                                </span>
                            </td>
                            <td className="p-4 cursor-pointer" onClick={() => setEditingCell({ weekId: week.id, field: 'leadTeam' })}>
                                <span className={`text-[10px] font-black font-mono uppercase truncate block px-3 py-1.5 rounded-lg border ${!week.leadTeam ? 'text-gray-300 border-gray-50 bg-gray-50/50' : 'text-blue-800 bg-blue-50 border-blue-100'}`}>
                                    {week.leadTeam || 'Not Set'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* QUICK ACTIONS FOOTER (No-Print) */}
            <div className="mt-6 flex justify-start gap-4 no-print">
                <button onClick={addWeekRow} className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-black text-xs uppercase border border-green-200 hover:bg-green-200 shadow-sm transition-all">+ Add New Cycle Row</button>
                <button onClick={removeLastWeekRow} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-black text-xs uppercase border border-red-200 hover:bg-red-200 shadow-sm transition-all">- Remove Last Cycle Row</button>
            </div>

            {/* FORMAL SIGNATURE FOOTER */}
            <div className="mt-20 flex justify-between items-end border-t-2 border-gray-200 pt-10">
                <div className="text-center w-1/3">
                    <div className="border-b-2 border-gray-900 mb-2 h-12"></div>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Academic Supervisor</p>
                </div>
                <div className="text-center w-1/3">
                    <div className="border-b-2 border-gray-900 mb-2 h-12 flex items-end justify-center pb-2">
                        <span className="text-xs font-black uppercase text-blue-900 border-b-2 border-blue-900 px-4 leading-none">{settings.headTeacherName}</span>
                    </div>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Head of Institution / Stamp</p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default AcademicCalendar;