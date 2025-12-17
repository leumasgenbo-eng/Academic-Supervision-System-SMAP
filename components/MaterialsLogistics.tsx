
import React, { useState, useMemo } from 'react';
import { GlobalSettings, MaterialRequest, ClassroomInventory, SafetyInspection, SchoolClass, StaffMember } from '../types';
import EditableField from './EditableField';

interface MaterialsLogisticsProps {
    settings: GlobalSettings;
    onSettingChange: (key: keyof GlobalSettings, value: any) => void;
    onSave: () => void;
    schoolClass: SchoolClass;
    staffList: StaffMember[];
}

const MaterialsLogistics: React.FC<MaterialsLogisticsProps> = ({ 
    settings, 
    onSettingChange, 
    onSave, 
    schoolClass,
    staffList
}) => {
    const [activeSubTab, setActiveSubTab] = useState<'Facilitator Materials' | 'Classroom Inventory' | 'Safety Checklist' | 'Logistics Reports'>('Facilitator Materials');
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

    // --- TEACHING SUPPORT (FACILITATOR MATERIALS) STATE ---
    const [newRequest, setNewRequest] = useState<Partial<MaterialRequest>>({
        itemName: '',
        category: 'Teaching Aid',
        purpose: 'Teaching',
        quantityRequested: 1,
        dateRequested: new Date().toISOString().split('T')[0],
        dateRequired: new Date().toISOString().split('T')[0],
        usageDuration: 'Temporary',
        priority: 'Medium',
        remarks: '',
        staffId: staffList[0]?.id || '',
        status: 'Pending'
    });

    const materialRequests = settings.materialRequests || [];
    
    const handleAddRequest = () => {
        if (!newRequest.itemName || !newRequest.quantityRequested) {
            alert("Item Name and Quantity are required.");
            return;
        }
        const staff = staffList.find(s => s.id === newRequest.staffId);
        const request: MaterialRequest = {
            ...newRequest as MaterialRequest,
            id: Date.now().toString(),
            staffName: staff?.name || 'Unknown Staff',
        };
        onSettingChange('materialRequests', [request, ...materialRequests]);
        setNewRequest(prev => ({ ...prev, itemName: '', quantityRequested: 1, remarks: '' }));
        alert("Request Submitted Successfully.");
    };

    const updateRequestStatus = (id: string, updates: Partial<MaterialRequest>) => {
        onSettingChange('materialRequests', materialRequests.map(r => r.id === id ? { ...r, ...updates } : r));
    };

    const selectedRequest = materialRequests.find(r => r.id === selectedRequestId);

    // --- COMPLIANCE & TRACKING LOGIC ---
    const overdueCount = materialRequests.filter(r => 
        r.status === 'Issued' && 
        r.expectedReturnDate && 
        new Date(r.expectedReturnDate) < new Date()
    ).length;

    const unreturnedItems = materialRequests.filter(r => r.status === 'Issued').length;

    // --- CLASSROOM INVENTORY STATE ---
    const inventoryItems = [
        "Desks & Chairs (Pupils)", "Teacher's Table & Chair", "Chalkboard / Whiteboard", 
        "Markers / Chalk / Erasers", "Functional Lighting", "Ventilation / Windows", 
        "Doors & Locks", "Power Sockets & Switches", "ICT Equipment (Projector/Laptop)", 
        "Teaching Aids & Posters"
    ];

    const classroomInventories = settings.classroomInventories || [];
    const currentInventory = classroomInventories.find(i => i.schoolClass === schoolClass) || {
        id: Date.now().toString(),
        block: 'Main Block',
        roomNumber: 'Room 01',
        schoolClass: schoolClass,
        inspectionDate: new Date().toISOString().split('T')[0],
        items: inventoryItems.reduce((acc, item) => ({ ...acc, [item]: { status: 'Available', condition: 'Good' } }), {}),
        damagedMissingNotes: '',
        priority: 'Low',
        comments: ''
    } as ClassroomInventory;

    const updateInventory = (updates: Partial<ClassroomInventory>) => {
        const exists = classroomInventories.find(i => i.schoolClass === schoolClass);
        const updatedList = exists 
            ? classroomInventories.map(i => i.schoolClass === schoolClass ? { ...i, ...updates } : i)
            : [...classroomInventories, { ...currentInventory, ...updates }];
        onSettingChange('classroomInventories', updatedList);
    };

    // --- SAFETY CHECKLIST STATE ---
    const safetyChecks = [
        "School Fence & Gates", "Classroom Safety (Floors/Walls)", "Fire Safety Equipment", 
        "Emergency Exits & Signage", "Electrical Safety (Wiring)", "Water & Sanitation", 
        "Playground Equipment", "Lab / Workshop Safety", "Storage Room Security", "First Aid Kit Completeness"
    ];

    const safetyInspections = settings.safetyInspections || [];
    const currentSafety = safetyInspections[safetyInspections.length - 1] || {
        id: Date.now().toString(),
        inspectorName: 'Safety Officer',
        date: new Date().toISOString().split('T')[0],
        checks: safetyChecks.reduce((acc, item) => ({ ...acc, [item]: { status: 'Safe', risk: 'Low' } }), {}),
        hazardsIdentified: '',
        actionsRequired: '',
        status: 'Pending'
    } as SafetyInspection;

    const updateSafety = (updates: Partial<SafetyInspection>) => {
        onSettingChange('safetyInspections', safetyInspections.map(s => s.id === currentSafety.id ? { ...s, ...updates } : s));
    };

    return (
        <div className="bg-white p-6 rounded shadow-md h-full flex flex-col font-sans">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                    <h2 className="text-2xl font-black text-blue-900 uppercase">Materials & Logistics Control</h2>
                    <p className="text-xs text-gray-500">Infrastructure • Facilitator Support • School Safety</p>
                </div>
                <div className="flex gap-1 bg-gray-100 p-1 rounded">
                    {[
                        { id: 'Facilitator Materials', label: 'Facilitator Materials' },
                        { id: 'Classroom Inventory', label: 'Classroom Inventory' },
                        { id: 'Safety Checklist', label: 'Safety Checklist' },
                        { id: 'Logistics Reports', label: 'Analytics' }
                    ].map(t => (
                        <button 
                            key={t.id}
                            onClick={() => setActiveSubTab(t.id as any)}
                            className={`px-4 py-2 rounded text-[10px] uppercase font-black transition-all ${activeSubTab === t.id ? 'bg-white shadow text-blue-900' : 'text-gray-500 hover:text-blue-700'}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* SUB-TAB 1: FACILITATOR MATERIALS WORKFLOW */}
            {activeSubTab === 'Facilitator Materials' && (
                <div className="flex-1 overflow-hidden flex flex-col gap-6">
                    
                    {/* Entry Form (Section 1 & 2) */}
                    <div className="bg-blue-50 p-4 rounded border border-blue-100 shadow-inner grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        <div className="md:col-span-1">
                            <label className="text-[10px] font-black text-blue-800 uppercase block mb-1">Facilitator Name</label>
                            <select 
                                value={newRequest.staffId} 
                                onChange={e => setNewRequest({...newRequest, staffId: e.target.value})}
                                className="w-full border p-2 rounded text-sm bg-white font-bold"
                            >
                                {staffList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label className="text-[10px] font-black text-blue-800 uppercase block mb-1">Item & Category</label>
                            <div className="flex gap-1">
                                <input 
                                    value={newRequest.itemName} 
                                    onChange={e => setNewRequest({...newRequest, itemName: e.target.value})}
                                    className="flex-1 border p-2 rounded text-sm" 
                                    placeholder="e.g. Science Kit" 
                                />
                                <select 
                                    value={newRequest.category} 
                                    onChange={e => setNewRequest({...newRequest, category: e.target.value as any})}
                                    className="border p-2 rounded text-[10px] bg-white font-bold"
                                >
                                    <option>Teaching Aid</option><option>Stationery</option><option>ICT</option><option>Equipment</option>
                                </select>
                            </div>
                        </div>
                        <div className="md:col-span-1">
                            <label className="text-[10px] font-black text-blue-800 uppercase block mb-1">Purpose & Qty</label>
                            <div className="flex gap-1">
                                <select 
                                    value={newRequest.purpose} 
                                    onChange={e => setNewRequest({...newRequest, purpose: e.target.value as any})}
                                    className="flex-1 border p-2 rounded text-xs bg-white"
                                >
                                    <option>Teaching</option><option>Assessment</option><option>Support</option>
                                </select>
                                <input 
                                    type="number" 
                                    value={newRequest.quantityRequested} 
                                    onChange={e => setNewRequest({...newRequest, quantityRequested: parseInt(e.target.value)})}
                                    className="w-16 border p-2 rounded text-sm text-center font-bold" 
                                />
                            </div>
                        </div>
                        <div className="md:col-span-1">
                            <label className="text-[10px] font-black text-blue-800 uppercase block mb-1">Timing & Priority</label>
                            <div className="flex gap-1">
                                <select 
                                    value={newRequest.usageDuration} 
                                    onChange={e => setNewRequest({...newRequest, usageDuration: e.target.value as any})}
                                    className="flex-1 border p-2 rounded text-xs bg-white"
                                >
                                    <option>Temporary</option><option>Permanent</option>
                                </select>
                                <select 
                                    value={newRequest.priority} 
                                    onChange={e => setNewRequest({...newRequest, priority: e.target.value as any})}
                                    className={`w-20 border p-2 rounded text-[10px] font-black bg-white ${newRequest.priority === 'High' ? 'text-red-600' : ''}`}
                                >
                                    <option>Low</option><option>Medium</option><option>High</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-end">
                            <button onClick={handleAddRequest} className="w-full bg-blue-600 text-white font-black py-2.5 rounded shadow-lg hover:bg-blue-700 transition-all uppercase text-xs">
                                Submit Request
                            </button>
                        </div>
                    </div>

                    {/* Master Tracking Table (Section 3, 4, 5) */}
                    <div className="flex-1 overflow-auto border rounded bg-white shadow-sm relative">
                        <table className="w-full text-xs text-left border-collapse table-fixed min-w-[1200px]">
                            <thead className="bg-gray-800 text-white uppercase text-[9px] font-black sticky top-0 z-10 shadow">
                                <tr>
                                    <th className="p-3 border-r border-gray-700 w-24">Req Date</th>
                                    <th className="p-3 border-r border-gray-700 w-48">Facilitator Information</th>
                                    <th className="p-3 border-r border-gray-700 w-64">Material Details</th>
                                    <th className="p-3 border-r border-gray-700 w-32 text-center">Status</th>
                                    <th className="p-3 border-r border-gray-700 w-48">Supply / Issued Info</th>
                                    <th className="p-3 border-r border-gray-700 w-48">Return Info</th>
                                    <th className="p-3 text-center w-32">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materialRequests.length === 0 ? (
                                    <tr><td colSpan={7} className="p-20 text-center text-gray-400 italic">No facilitator requests currently logged. Use the panel above to begin.</td></tr>
                                ) : (
                                    materialRequests.map(req => {
                                        const isOverdue = req.status === 'Issued' && req.expectedReturnDate && new Date(req.expectedReturnDate) < new Date();
                                        return (
                                            <tr key={req.id} className={`border-b hover:bg-blue-50 transition-colors ${isOverdue ? 'bg-red-50' : ''} ${selectedRequestId === req.id ? 'bg-blue-100 ring-2 ring-blue-400 ring-inset' : ''}`}>
                                                <td className="p-3 border-r font-mono">{req.dateRequested}</td>
                                                <td className="p-3 border-r">
                                                    <div className="font-black text-blue-900 uppercase truncate" title={req.staffName}>{req.staffName}</div>
                                                    <div className="text-[9px] text-gray-500 uppercase">Class: {schoolClass}</div>
                                                </td>
                                                <td className="p-3 border-r">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-1 rounded text-[8px] font-black text-white ${req.category === 'Teaching Aid' ? 'bg-green-600' : req.category === 'Stationery' ? 'bg-gray-500' : 'bg-purple-600'}`}>{req.category}</span>
                                                        <span className="font-black uppercase text-gray-800 truncate" title={req.itemName}>{req.itemName}</span>
                                                    </div>
                                                    <div className="text-[10px] mt-1 text-gray-600">Qty: <span className="font-bold">{req.quantityRequested}</span> | <span className="italic">{req.purpose}</span> | {req.usageDuration}</div>
                                                </td>
                                                <td className="p-3 border-r text-center">
                                                    <div className={`px-2 py-1 rounded text-[10px] font-black text-white inline-block ${
                                                        req.status === 'Pending' ? 'bg-orange-400' : 
                                                        req.status === 'Approved' ? 'bg-blue-500' : 
                                                        req.status === 'Issued' ? 'bg-indigo-600' : 
                                                        req.status === 'Returned' ? 'bg-green-600' : 'bg-red-600'
                                                    }`}>
                                                        {req.status}
                                                    </div>
                                                    {isOverdue && <div className="text-[8px] text-red-600 font-black uppercase mt-1 animate-pulse">! OVERDUE !</div>}
                                                </td>
                                                <td className="p-3 border-r">
                                                    {req.dateIssued ? (
                                                        <div className="space-y-0.5 text-[10px]">
                                                            <div>Date: <span className="font-bold">{req.dateIssued}</span></div>
                                                            <div>Cond: <span className="font-bold uppercase text-blue-700">{req.conditionOnSupply}</span></div>
                                                            <div className="text-[9px] text-gray-400">By: {req.suppliedBy}</div>
                                                        </div>
                                                    ) : <span className="text-gray-300 italic">Not issued</span>}
                                                </td>
                                                <td className="p-3 border-r">
                                                    {req.dateReturned ? (
                                                        <div className="space-y-0.5 text-[10px]">
                                                            <div>Date: <span className="font-bold">{req.dateReturned}</span></div>
                                                            <div className={`font-bold uppercase ${req.conditionOnReturn === 'Damaged' ? 'text-red-600' : 'text-green-600'}`}>
                                                                {req.conditionOnReturn} ({req.quantityReturned})
                                                            </div>
                                                            <div className="text-[9px] text-gray-400">Recv: {req.receivedBy}</div>
                                                        </div>
                                                    ) : <span className="text-gray-300 italic">Pending return</span>}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <button 
                                                        onClick={() => setSelectedRequestId(req.id)}
                                                        className="bg-gray-800 text-white px-3 py-1.5 rounded font-black text-[9px] uppercase hover:bg-black shadow transition-all"
                                                    >
                                                        Process Flow
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* MODAL: STEP-BY-STEP PROCESS FLOW */}
                    {selectedRequest && (
                        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden animate-zoom-in">
                                <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
                                    <h3 className="font-black uppercase text-sm">Logistics Workflow: {selectedRequest.itemName}</h3>
                                    <button onClick={() => setSelectedRequestId(null)} className="text-white hover:text-red-300 text-2xl font-black">&times;</button>
                                </div>
                                
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
                                    
                                    {/* PHASE 1: APPROVAL */}
                                    <div className={`p-4 rounded border-2 ${selectedRequest.status === 'Pending' ? 'border-orange-400 bg-orange-50' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                                        <h4 className="font-black text-xs uppercase mb-4 text-orange-900 flex justify-between">
                                            <span>Step 1: Admin Approval</span>
                                            {selectedRequest.status !== 'Pending' && <span>✔</span>}
                                        </h4>
                                        <div className="space-y-3">
                                            <div><label className="text-[9px] font-bold block mb-1">Approved Qty</label><input type="number" defaultValue={selectedRequest.quantityRequested} id="appQty" className="w-full border p-1 rounded text-sm" /></div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => {
                                                        const qty = parseInt((document.getElementById('appQty') as HTMLInputElement).value);
                                                        updateRequestStatus(selectedRequest.id, { status: 'Approved', approvedQuantity: qty, approvalDate: new Date().toISOString().split('T')[0], approvedBy: 'Logistics Manager' });
                                                    }}
                                                    disabled={selectedRequest.status !== 'Pending'}
                                                    className="flex-1 bg-green-600 text-white font-bold py-2 rounded text-xs disabled:opacity-30"
                                                >Approve</button>
                                                <button 
                                                    onClick={() => updateRequestStatus(selectedRequest.id, { status: 'Declined' })}
                                                    disabled={selectedRequest.status !== 'Pending'}
                                                    className="bg-red-600 text-white font-bold px-4 py-2 rounded text-xs disabled:opacity-30"
                                                >Reject</button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* PHASE 2: ISSUE / SUPPLY */}
                                    <div className={`p-4 rounded border-2 ${selectedRequest.status === 'Approved' ? 'border-indigo-400 bg-indigo-50' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                                        <h4 className="font-black text-xs uppercase mb-4 text-indigo-900 flex justify-between">
                                            <span>Step 2: Supply & Issue</span>
                                            {['Issued', 'Returned'].includes(selectedRequest.status) && <span>✔</span>}
                                        </h4>
                                        <div className="space-y-2">
                                            <div><label className="text-[9px] font-bold block">Expected Return Date</label><input type="date" id="expRet" className="w-full border p-1 rounded text-xs" /></div>
                                            <div><label className="text-[9px] font-bold block">Condition</label><select id="issCond" className="w-full border p-1 rounded text-xs bg-white"><option>New</option><option>Good</option><option>Fair</option></select></div>
                                            <button 
                                                onClick={() => {
                                                    const ret = (document.getElementById('expRet') as HTMLInputElement).value;
                                                    const cond = (document.getElementById('issCond') as HTMLSelectElement).value;
                                                    updateRequestStatus(selectedRequest.id, { status: 'Issued', dateIssued: new Date().toISOString().split('T')[0], expectedReturnDate: ret, conditionOnSupply: cond as any, suppliedBy: 'Store Keeper' });
                                                }}
                                                disabled={selectedRequest.status !== 'Approved'}
                                                className="w-full bg-indigo-600 text-white font-bold py-2 rounded text-xs disabled:opacity-30"
                                            >Record Issuance</button>
                                        </div>
                                    </div>

                                    {/* PHASE 3: RETURN */}
                                    <div className={`p-4 rounded border-2 col-span-1 md:col-span-2 ${selectedRequest.status === 'Issued' ? 'border-green-400 bg-green-50' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                                        <h4 className="font-black text-xs uppercase mb-4 text-green-900 flex justify-between">
                                            <span>Step 3: Materials Return Checklist</span>
                                            {selectedRequest.status === 'Returned' && <span>✔</span>}
                                        </h4>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div><label className="text-[9px] font-bold block">Qty Returned</label><input type="number" id="retQty" defaultValue={selectedRequest.approvedQuantity} className="w-full border p-1 rounded text-xs" /></div>
                                            <div><label className="text-[9px] font-bold block">Condition</label><select id="retCond" className="w-full border p-1 rounded text-xs bg-white"><option>Good</option><option>Damaged</option><option>Lost</option></select></div>
                                            <div className="flex items-end">
                                                <button 
                                                    onClick={() => {
                                                        const qty = parseInt((document.getElementById('retQty') as HTMLInputElement).value);
                                                        const cond = (document.getElementById('retCond') as HTMLSelectElement).value;
                                                        updateRequestStatus(selectedRequest.id, { status: 'Returned', dateReturned: new Date().toISOString().split('T')[0], quantityReturned: qty, conditionOnReturn: cond as any, receivedBy: 'Admin Desk', returnStatus: qty < (selectedRequest.approvedQuantity || 0) ? 'Partial' : 'Completed' });
                                                        setSelectedRequestId(null);
                                                    }}
                                                    disabled={selectedRequest.status !== 'Issued'}
                                                    className="w-full bg-green-600 text-white font-bold py-2 rounded text-xs disabled:opacity-30 shadow-md"
                                                >Finalize Return</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* COMPLIANCE & ANALYTICS BAR */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-900 text-white rounded shadow-lg no-print">
                        <div className="text-center border-r border-gray-700">
                            <div className="text-2xl font-black text-blue-400">{materialRequests.length}</div>
                            <div className="text-[9px] uppercase font-bold text-gray-500 tracking-widest">Total Requests</div>
                        </div>
                        <div className="text-center border-r border-gray-700">
                            <div className="text-2xl font-black text-purple-400">{unreturnedItems}</div>
                            <div className="text-[9px] uppercase font-bold text-gray-500 tracking-widest">Currently Issued</div>
                        </div>
                        <div className="text-center border-r border-gray-700">
                            <div className="text-2xl font-black text-red-500">{overdueCount}</div>
                            <div className="text-[9px] uppercase font-bold text-gray-500 tracking-widest">Overdue Items</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-black text-green-400">
                                {materialRequests.length > 0 ? ((materialRequests.filter(r => r.status === 'Returned').length / materialRequests.length) * 100).toFixed(0) : 100}%
                            </div>
                            <div className="text-[9px] uppercase font-bold text-gray-500 tracking-widest">Compliance Rate</div>
                        </div>
                    </div>
                </div>
            )}

            {/* SUB-TAB 2: CLASSROOM INVENTORY */}
            {activeSubTab === 'Classroom Inventory' && (
                <div className="space-y-6 overflow-y-auto pr-2">
                    <div className="bg-gray-50 p-4 rounded border grid grid-cols-1 md:grid-cols-4 gap-6 shadow-inner">
                        <div><label className="text-xs font-black text-gray-500 uppercase">Infrastructure Block</label><input value={currentInventory.block} onChange={e => updateInventory({block: e.target.value})} className="w-full border p-2 rounded text-sm font-bold" /></div>
                        <div><label className="text-xs font-black text-gray-500 uppercase">Room Number</label><input value={currentInventory.roomNumber} onChange={e => updateInventory({roomNumber: e.target.value})} className="w-full border p-2 rounded text-sm font-bold" /></div>
                        <div><label className="text-xs font-black text-gray-500 uppercase">Verified Class</label><input value={currentInventory.schoolClass} disabled className="w-full border p-2 rounded text-sm bg-gray-100 font-bold" /></div>
                        <div><label className="text-xs font-black text-gray-500 uppercase">Audit Date</label><input type="date" value={currentInventory.inspectionDate} onChange={e => updateInventory({inspectionDate: e.target.value})} className="w-full border p-2 rounded text-sm font-bold" /></div>
                    </div>

                    <div className="border rounded overflow-hidden shadow-sm">
                        <table className="w-full text-xs text-left border-collapse">
                            <thead className="bg-blue-900 text-white uppercase font-black text-[10px]">
                                <tr>
                                    <th className="p-3 border-b border-blue-800">Classroom Logistics Item</th>
                                    <th className="p-3 border-b border-blue-800 text-center w-40">Status</th>
                                    <th className="p-3 border-b border-blue-800 text-center w-40">Condition</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventoryItems.map(item => (
                                    <tr key={item} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="p-3 font-black text-gray-700 uppercase text-[10px]">{item}</td>
                                        <td className="p-3 text-center">
                                            <select 
                                                value={currentInventory.items[item]?.status || 'Available'}
                                                onChange={e => {
                                                    const newItems = { ...currentInventory.items, [item]: { ...currentInventory.items[item], status: e.target.value as any } };
                                                    updateInventory({ items: newItems });
                                                }}
                                                className={`p-1.5 rounded text-[10px] font-black w-full border ${currentInventory.items[item]?.status === 'Available' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
                                            >
                                                <option>Available</option><option>Missing</option><option>Damaged</option>
                                            </select>
                                        </td>
                                        <td className="p-3 text-center">
                                            <select 
                                                value={currentInventory.items[item]?.condition || 'Good'}
                                                onChange={e => {
                                                    const newItems = { ...currentInventory.items, [item]: { ...currentInventory.items[item], condition: e.target.value as any } };
                                                    updateInventory({ items: newItems });
                                                }}
                                                className="border-gray-200 p-1.5 rounded text-[10px] font-bold w-full bg-white"
                                            >
                                                <option>Good</option><option>Fair</option><option>Poor</option><option>N/A</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-5 border-2 border-red-100 rounded-lg bg-red-50">
                            <label className="block text-[10px] font-black text-red-900 mb-2 uppercase tracking-widest">Damaged / Missing Inventory Details</label>
                            <textarea 
                                value={currentInventory.damagedMissingNotes} 
                                onChange={e => updateInventory({damagedMissingNotes: e.target.value})}
                                className="w-full h-24 border p-3 text-xs rounded shadow-inner"
                                placeholder="Specify IDs, types of damage, or serial numbers of missing tech items..."
                            ></textarea>
                            <div className="mt-4 flex items-center justify-between">
                                <label className="text-xs font-black text-red-900 uppercase">Maintenance Priority:</label>
                                <select 
                                    value={currentInventory.priority} 
                                    onChange={e => updateInventory({priority: e.target.value as any})}
                                    className={`p-2 px-4 rounded text-xs font-black border-2 ${
                                        currentInventory.priority === 'High' ? 'bg-orange-500 text-white border-orange-600' : 
                                        currentInventory.priority === 'Emergency' ? 'bg-red-600 text-white border-red-700 animate-pulse' : 'bg-white'
                                    }`}
                                >
                                    <option>Low</option><option>Medium</option><option>High</option><option>Emergency</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-5 border rounded-lg bg-gray-50 shadow-inner">
                            <label className="block text-[10px] font-black text-gray-700 mb-2 uppercase tracking-widest">Warden Recommendations</label>
                            <textarea 
                                value={currentInventory.comments} 
                                onChange={e => updateInventory({comments: e.target.value})}
                                className="w-full h-32 border p-3 text-xs rounded bg-white shadow-inner"
                                placeholder="Suggested procurement or technical repair actions..."
                            ></textarea>
                        </div>
                    </div>
                </div>
            )}

            {/* SUB-TAB 3: SAFETY CHECKLIST */}
            {activeSubTab === 'Safety Checklist' && (
                <div className="space-y-6 overflow-y-auto pr-2">
                    <div className="flex justify-between items-center bg-red-900 text-white p-5 rounded-lg border-b-4 border-red-700 shadow-xl">
                        <div>
                            <h4 className="font-black uppercase text-lg">School Safety Audit Protocol</h4>
                            <p className="text-[10px] text-red-200 font-bold tracking-widest">CRITICAL INFRASTRUCTURE & LIFE SAFETY CHECK</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <label className="block text-[9px] font-black uppercase text-red-300">Safety Inspector</label>
                                <EditableField value={currentSafety.inspectorName} onChange={v => updateSafety({inspectorName: v})} className="text-sm font-black border-b border-red-400" />
                            </div>
                            <div className="text-right">
                                <label className="block text-[9px] font-black uppercase text-red-300">Inspection Date</label>
                                <input type="date" value={currentSafety.date} onChange={e => updateSafety({date: e.target.value})} className="text-sm font-black bg-transparent border-none outline-none" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 border-2 border-gray-100 rounded-xl p-8 bg-white shadow-inner">
                        {safetyChecks.map(check => (
                            <div key={check} className="flex items-center justify-between border-b pb-3 group">
                                <span className="text-[10px] font-black text-gray-700 uppercase group-hover:text-blue-900 transition-colors">{check}</span>
                                <div className="flex gap-2">
                                    <select 
                                        value={currentSafety.checks[check]?.status || 'Safe'}
                                        onChange={e => {
                                            const newChecks = { ...currentSafety.checks, [check]: { ...currentSafety.checks[check], status: e.target.value as any } };
                                            updateSafety({ checks: newChecks });
                                        }}
                                        className={`text-[9px] font-black p-2 rounded border-2 transition-all ${
                                            currentSafety.checks[check]?.status === 'Safe' ? 'bg-green-50 border-green-200 text-green-700' : 
                                            currentSafety.checks[check]?.status === 'Unsafe' ? 'bg-red-50 border-red-200 text-red-700 animate-pulse' : 'bg-orange-50 border-orange-200 text-orange-700'
                                        }`}
                                    >
                                        <option>Safe</option><option>Unsafe</option><option>Maintenance Required</option><option>N/A</option>
                                    </select>
                                    <select 
                                        value={currentSafety.checks[check]?.risk || 'Low'}
                                        onChange={e => {
                                            const newChecks = { ...currentSafety.checks, [check]: { ...currentSafety.checks[check], risk: e.target.value as any } };
                                            updateSafety({ checks: newChecks });
                                        }}
                                        className={`text-[9px] font-black p-2 rounded border-2 transition-all ${
                                            currentSafety.checks[check]?.risk === 'High' ? 'bg-red-600 border-red-700 text-white' : 
                                            currentSafety.checks[check]?.risk === 'Medium' ? 'bg-orange-500 border-orange-600 text-white' : 'bg-gray-100 border-gray-200 text-gray-700'
                                        }`}
                                    >
                                        <option>Low</option><option>Medium</option><option>High</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-5 border-2 border-red-100 rounded-xl bg-white shadow-md">
                            <label className="block text-[10px] font-black text-red-600 mb-2 uppercase tracking-widest">Life Hazards Identified</label>
                            <textarea 
                                value={currentSafety.hazardsIdentified} 
                                onChange={e => updateSafety({hazardsIdentified: e.target.value})}
                                className="w-full h-32 border-2 p-3 text-xs rounded-lg bg-red-50 border-red-100 shadow-inner" 
                                placeholder="Detail specific safety risks (exposed wiring, structurally unsound walls, missing fire extinguishers)..."
                            ></textarea>
                        </div>
                        <div className="p-5 border-2 border-gray-100 rounded-xl bg-white shadow-md">
                            <label className="block text-[10px] font-black text-gray-700 mb-2 uppercase tracking-widest">Remedial Actions Mandated</label>
                            <textarea 
                                value={currentSafety.actionsRequired} 
                                onChange={e => updateSafety({actionsRequired: e.target.value})}
                                className="w-full h-32 border-2 p-3 text-xs rounded-lg bg-gray-50 border-gray-100 shadow-inner" 
                                placeholder="Specify timeline and requirements for safety remediation..."
                            ></textarea>
                        </div>
                        <div className="p-5 border-2 border-blue-100 rounded-xl bg-white shadow-md flex flex-col justify-between">
                            <div>
                                <label className="block text-[10px] font-black text-blue-900 mb-3 uppercase tracking-widest">Inspection Finalization</label>
                                <div className="space-y-3">
                                    {['Pending', 'In Progress', 'Completed'].map(st => (
                                        <label key={st} className={`flex items-center gap-3 text-xs font-black p-2 rounded-lg cursor-pointer transition-all border-2 ${currentSafety.status === st ? 'bg-blue-600 text-white border-blue-700 shadow-lg translate-x-1' : 'bg-gray-50 text-gray-500 border-transparent hover:border-gray-200'}`}>
                                            <input 
                                                type="radio" 
                                                name="safetyStatus" 
                                                checked={currentSafety.status === st} 
                                                onChange={() => updateSafety({status: st as any})} 
                                                className="w-4 h-4 accent-blue-900"
                                            />
                                            {st.toUpperCase()}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button onClick={onSave} className="w-full bg-red-600 text-white font-black py-4 rounded-xl shadow-xl hover:bg-red-700 transition-all uppercase text-[11px] tracking-widest mt-6">Publish Safety Audit</button>
                        </div>
                    </div>
                </div>
            )}

            {activeSubTab === 'Logistics Reports' && (
                <div className="flex-1 p-20 text-center text-gray-400 italic bg-gray-50 rounded border-2 border-dashed">
                    <div className="text-6xl mb-6 text-blue-100">📊</div>
                    <h3 className="text-xl font-black text-gray-700 mb-2 uppercase">Logistics Analytics Loading...</h3>
                    <p className="text-sm max-w-md mx-auto">Cumulative Facilitator Material usage, Infrastructure condition trends, and Safety Compliance heatmaps are being generated based on your entries.</p>
                </div>
            )}

            <div className="mt-8 border-t-2 border-gray-100 pt-6 flex justify-end gap-3 no-print">
                <button className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-black text-[10px] uppercase hover:bg-gray-200 border-2 border-gray-200 transition-all">Export Inventory CSV</button>
                <button onClick={onSave} className="bg-blue-600 text-white px-12 py-3 rounded-xl font-black text-[10px] uppercase shadow-2xl hover:bg-blue-700 transition-all transform active:scale-95 tracking-widest">Synchronize All Records</button>
            </div>
        </div>
    );
};

export default MaterialsLogistics;
