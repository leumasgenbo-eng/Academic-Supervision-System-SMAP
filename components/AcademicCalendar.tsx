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

const AcademicCalendar: React.FC<AcademicCalendarProps> = ({ settings, onSettingChange, onSave }) => {
  const [activeTerm, setActiveTerm] = useState<string>("Term 1");
  const [viewMode, setViewMode] = useState<'calendar' | 'list_manager'>('calendar');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Modal State
  const [editingCell, setEditingCell] = useState<{ weekId: string, field: CalendarField } | null>(null);

  // Dynamic Lists (fallback to constants if not in settings yet)
  const currentLists = settings.calendarLists || {
      periods: CALENDAR_LISTS.periods,
      activities: CALENDAR_LISTS.activities,
      assessments: CALENDAR_LISTS.assessments,
      leadTeam: CALENDAR_LISTS.leadTeam,
      extraCurricular: CALENDAR_LISTS.extraCurricular
  };

  // Ensure calendar data structure exists for active term
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
      const updatedWeeks = calendarData.map(week => 
          week.id === weekId ? { ...week, ...updates } : week
      );
      onSettingChange('academicCalendar', { ...settings.academicCalendar, [activeTerm]: updatedWeeks });
  };

  const handleListUpdate = (listKey: keyof typeof currentLists, newList: string[]) => {
      onSettingChange('calendarLists', { ...currentLists, [listKey]: newList });
  };

  const addItemToList = (listKey: keyof typeof currentLists, item: string) => {
      if (item.trim()) {
          handleListUpdate(listKey, [...currentLists[listKey], item.trim()]);
      }
  };

  const removeItemFromList = (listKey: keyof typeof currentLists, item: string) => {
      handleListUpdate(listKey, currentLists[listKey].filter(i => i !== item));
  };

  const handleSharePDF = async () => {
      setIsGenerating(true);
      const element = document.getElementById('academic-calendar-print-area');
      if (element && (window as any).html2pdf) {
          const opt = {
              margin: 5,
              filename: `${settings.schoolName}_Academic_Calendar_${activeTerm}.pdf`,
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2, useCORS: true },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
          };
          await (window as any).html2pdf().set(opt).from(element).save();
      } else {
          alert("PDF generator not ready.");
      }
      setIsGenerating(false);
  };

  // --- RENDER MODAL ---
  const renderSelectionModal = () => {
      if (!editingCell) return null;
      
      const week = calendarData.find(w => w.id === editingCell.weekId);
      if (!week) return null;

      let options: string[] = [];
      let title = "";

      switch (editingCell.field) {
          case 'activity':
              options = currentLists.activities;
              title = "Select Main Activity";
              break;
          case 'assessment':
              options = currentLists.assessments;
              title = "Select Assessment";
              break;
          case 'leadTeam':
              options = currentLists.leadTeam;
              title = "Select Lead Teacher";
              break;
          case 'extraCurricular':
              options = currentLists.extraCurricular;
              title = "Select Extra-Curricular";
              break;
      }

      return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                  <div className="p-4 border-b flex justify-between items-center bg-blue-900 text-white rounded-t-lg">
                      <h3 className="font-bold text-lg">{title} - {week.period}</h3>
                      <button onClick={() => setEditingCell(null)} className="text-white hover:text-red-200 text-xl font-bold">&times;</button>
                  </div>
                  
                  <div className="p-4 overflow-y-auto flex-1 grid grid-cols-2 md:grid-cols-3 gap-3">
                      {options.map((opt, idx) => (
                          <button
                              key={idx}
                              onClick={() => {
                                  updateWeek(week.id, { [editingCell.field]: opt });
                                  setEditingCell(null);
                              }}
                              className="text-left text-xs p-3 rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors bg-white shadow-sm"
                          >
                              {opt}
                          </button>
                      ))}
                  </div>

                  <div className="p-4 border-t bg-gray-50">
                      <label className="text-xs font-bold text-gray-500 block mb-1">Custom Entry:</label>
                      <div className="flex gap-2">
                          <input 
                              type="text" 
                              className="flex-1 border rounded p-2 text-sm"
                              placeholder="Type custom value..."
                              id="custom-calendar-input"
                          />
                          <button 
                              onClick={() => {
                                  const val = (document.getElementById('custom-calendar-input') as HTMLInputElement).value;
                                  if(val) {
                                      updateWeek(week.id, { [editingCell.field]: val });
                                      setEditingCell(null);
                                  }
                              }}
                              className="bg-green-600 text-white px-4 py-2 rounded font-bold text-sm"
                          >
                              Apply
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  if (viewMode === 'list_manager') {
      const ListEditor = ({ title, listKey }: { title: string, listKey: keyof typeof currentLists }) => {
          const [newItem, setNewItem] = useState("");
          return (
              <div className="bg-gray-50 p-4 rounded border">
                  <h4 className="font-bold text-blue-900 mb-3 border-b pb-1">{title}</h4>
                  <div className="h-64 overflow-y-auto mb-3 space-y-1 bg-white p-2 border rounded">
                      {currentLists[listKey].map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs p-1 hover:bg-gray-100 rounded group">
                              <span>{item}</span>
                              <button onClick={() => removeItemFromList(listKey, item)} className="text-red-500 font-bold opacity-0 group-hover:opacity-100">&times;</button>
                          </div>
                      ))}
                  </div>
                  <div className="flex gap-2">
                      <input value={newItem} onChange={e => setNewItem(e.target.value)} className="flex-1 border p-1 rounded text-xs" placeholder="New item..." />
                      <button onClick={() => { addItemToList(listKey, newItem); setNewItem(""); }} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold">Add</button>
                  </div>
              </div>
          );
      };
      return (
          <div className="p-6 bg-white rounded shadow">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Manage Dropdown Lists</h3>
                  <button onClick={() => setViewMode('calendar')} className="bg-gray-600 text-white px-4 py-2 rounded font-bold text-sm">&larr; Back to Calendar</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ListEditor title="Main Activities" listKey="activities" />
                  <ListEditor title="Assessments" listKey="assessments" />
                  <ListEditor title="Lead Team" listKey="leadTeam" />
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
        {renderSelectionModal()}
        <div className="bg-white p-4 rounded shadow mb-6 flex flex-wrap justify-between items-center gap-4 no-print">
            <div><h1 className="text-2xl font-bold text-blue-900 uppercase">Academic Calendar Management</h1></div>
            <div className="flex gap-4 items-center">
                <div className="flex bg-gray-100 p-1 rounded">{['Term 1', 'Term 2', 'Term 3'].map(term => (<button key={term} onClick={() => setActiveTerm(term)} className={`px-4 py-1.5 rounded text-sm font-bold transition-all ${activeTerm === term ? 'bg-white text-blue-900 shadow' : 'text-gray-500 hover:text-blue-900'}`}>{term}</button>))}</div>
                <button onClick={() => setViewMode('list_manager')} className="bg-purple-100 text-purple-900 px-4 py-2 rounded font-bold text-sm border border-purple-300">Lists</button>
                <button onClick={onSave} className="bg-blue-600 text-white px-6 py-2 rounded font-bold text-sm">Save</button>
                <button onClick={handleSharePDF} disabled={isGenerating} className="bg-green-600 text-white px-6 py-2 rounded font-bold text-sm">{isGenerating ? 'Exporting...' : 'Print PDF'}</button>
            </div>
        </div>

        <div id="academic-calendar-print-area" className="bg-white p-8 rounded shadow overflow-x-auto">
            {/* Report Header */}
            <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
                <h1 className="text-2xl font-black uppercase text-blue-900">
                    <EditableField value={settings.schoolName} onChange={(v) => onSettingChange('schoolName', v)} className="text-center w-full bg-transparent" />
                </h1>
                <div className="flex justify-center gap-4 text-xs font-bold text-gray-600 mb-1">
                    <EditableField value={settings.schoolAddress || ''} onChange={(v) => onSettingChange('schoolAddress', v)} className="text-center w-full" placeholder="Address" />
                </div>
                <div className="flex justify-center gap-4 text-[10px] font-semibold text-gray-800 mb-2">
                    <div className="flex gap-1"><span>Tel:</span><EditableField value={settings.schoolContact} onChange={(v) => onSettingChange('schoolContact', v)} /></div>
                    <span>|</span>
                    <div className="flex gap-1"><span>Email:</span><EditableField value={settings.schoolEmail} onChange={(v) => onSettingChange('schoolEmail', v)} /></div>
                </div>
                <h2 className="text-lg font-bold text-red-700 uppercase">ACADEMIC CALENDAR - {activeTerm}</h2>
                <p className="text-xs font-bold text-gray-500 uppercase">{settings.academicYear}</p>
            </div>

            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="bg-blue-900 text-white uppercase text-xs">
                        <th className="p-3 border border-blue-800 text-left w-32">Week</th>
                        <th className="p-3 border border-blue-800 text-center w-48">Duration</th>
                        <th className="p-3 border border-blue-800 text-left">Activity</th>
                        <th className="p-3 border border-blue-800 text-left w-48">Assessment</th>
                        <th className="p-3 border border-blue-800 text-left w-40">Lead Team</th>
                    </tr>
                </thead>
                <tbody>
                    {calendarData.map((week) => (
                        <tr key={week.id} className="hover:bg-gray-50 border-b border-gray-200">
                            <td className="p-2 border border-gray-200 font-bold bg-gray-50 text-xs">{week.period}</td>
                            <td className="p-1 border border-gray-200">
                                <div className="flex gap-1 justify-center items-center">
                                    <input type="date" value={week.dateFrom || ''} onChange={e => updateWeek(week.id, { dateFrom: e.target.value })} className="text-[10px] border-none bg-transparent font-mono" />
                                    <span>-</span>
                                    <input type="date" value={week.dateTo || ''} onChange={e => updateWeek(week.id, { dateTo: e.target.value })} className="text-[10px] border-none bg-transparent font-mono" />
                                </div>
                            </td>
                            <td className="p-2 border border-gray-200 cursor-pointer" onClick={() => setEditingCell({ weekId: week.id, field: 'activity' })}>{week.activity || <span className="text-gray-300 italic text-xs">Select...</span>}</td>
                            <td className="p-2 border border-gray-200 cursor-pointer" onClick={() => setEditingCell({ weekId: week.id, field: 'assessment' })}><span className={`text-[10px] font-bold px-1 rounded ${week.assessment.includes('No Assessment') ? 'text-gray-400' : 'bg-red-50 text-red-700'}`}>{week.assessment || 'Select...'}</span></td>
                            <td className="p-2 border border-gray-200 cursor-pointer" onClick={() => setEditingCell({ weekId: week.id, field: 'leadTeam' })}><span className="text-[10px] font-mono text-blue-900">{week.leadTeam || '-'}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default AcademicCalendar;