
export type Department = 
  | "Daycare"
  | "Nursery"
  | "Kindergarten"
  | "Lower Basic School"
  | "Upper Basic School"
  | "Junior High School";

export type SchoolClass = string;

export type Module = 
  | "Time Table"
  | "Academic Calendar"
  | "Staff Management"
  | "Pupil Management"
  | "Assessment"
  | "Result Entry"
  | "Materials & Logistics"
  | "Learner Materials & Booklist"
  | "Disciplinary"
  | "Special Event Day"
  | "Lesson Plans"
  | "Exercise Assessment";

export interface GradeRange {
    min: number;
    max: number;
    grade: string;
    remark: string;
    color?: string;
}

export interface CoreGradingScale {
    type: '3-point' | '5-point' | '9-point';
    ranges: GradeRange[];
}

export interface IndicatorScale {
    type: '2-point' | '3-point' | '5-point' | '9-point';
    ranges: GradeRange[];
}

export interface ScoreDetails {
    sectionA: number;
    sectionB: number;
    total: number;
}

export interface AdmissionTestInfo {
    isScheduled?: boolean;
    testDate?: string;
    testTime?: string;
    venue?: string;
    invigilatorId?: string;
    invigilatorName?: string;
    status?: string;
    scores?: { handwriting: number; spelling: number; scriptScore: number; total: number; };
    serialNumber?: string;
    questionSet?: string;
    duration?: string;
    message?: string;
    proofOfBirth?: string;
    birthSetVerified?: boolean;
    decision?: string;
}

export interface ParentDetailedInfo {
    name: string;
    address: string;
    education: string;
    occupation: string;
    phone: string;
    religion: string;
    wivesCount?: string;
    dateOfDeath?: string;
    relationship?: string;
    dateGuardianBegan?: string;
}

export interface AdmissionInfo {
    generatedId?: string;
    receiptNumber: string;
    dateOfAdmission: string;
    othersName: string;
    homeTown: string;
    nationality: string;
    region: string;
    religion: string;
    presentClass: string;
    classApplyingFor: string;
    lastSchool: string;
    father?: ParentDetailedInfo;
    mother?: ParentDetailedInfo;
    guardianDetailed?: ParentDetailedInfo;
    declaration?: { parentName: string; wardName: string; signed: boolean; date: string; };
    livingWith?: string;
    testData?: AdmissionTestInfo;
    gender?: 'Male' | 'Female';
}

export interface StudentData {
    id: number;
    name: string;
    gender?: 'Male' | 'Female';
    dob?: string;
    age?: string;
    promotedTo?: string;
    conduct?: string;
    interest?: string;
    scores: Record<string, number>;
    scoreDetails?: Record<string, ScoreDetails>;
    subjectRemarks?: Record<string, string>;
    overallRemark?: string;
    finalRemark?: string;
    recommendation?: string;
    attendance?: string;
    skills?: Record<string, string>;
    observationScores?: Record<string, number[]>;
    contact?: string;
    guardian?: string;
    address?: string;
    specialNeeds?: string;
    admissionInfo?: AdmissionInfo;
    assessmentScores?: Record<string, Record<string, number>>;
    exerciseScores?: Record<string, Record<string, number>>; 
    sbaScores?: Record<string, Record<string, number>>;
    materialStatus?: Record<string, { issued: boolean, date: string, condition: string }>;
}

export interface DisciplinaryRecord {
    id: string;
    refNumber: string;
    incidentDate: string;
    incidentTime: string;
    location: string;
    pupilId: string | number;
    pupilName: string;
    pupilClass: string;
    pupilAge?: string;
    pupilGender?: string;
    category: string;
    description: string;
    severity: 'Minor' | 'Moderate' | 'Major';
    witnesses: string;
    reportedBy: string;
    immediateAction: string;
    actionResponsible: string;
    actionDateTime: string;
    referredTo: string;
    referralDate: string;
    followUpAction: string;
    parentNotified: boolean;
    parentNotificationDate: string;
    outcome: string;
    correctiveActionApplied: string;
    improvementPlan: string;
    status: 'Open' | 'Under Review' | 'Closed';
    closureDate?: string;
    remarks: string;
}

export interface BooklistItem {
    id: string;
    subject: string;
    title: string;
    author: string;
    publisher: string;
    edition: string;
    isbn?: string;
    isApproved: boolean;
    isMandatory: boolean;
    unitPrice: number;
}

export interface MaterialStockItem {
    id: string;
    name: string;
    category: 'Textbook' | 'Workbook' | 'Stationery' | 'Kit';
    openingStock: number;
    reorderLevel: number;
    unitPrice: number;
}

export interface PriceRecommendation {
    id: string;
    itemId: string;
    itemName: string;
    currentPrice: number;
    recommendedPrice: number;
    reason: string;
    effectiveDate: string;
    recommendedBy: string;
    status: 'Pending' | 'Approved' | 'Declined';
    approvedBy?: string;
}

export interface ComputedSubject {
    subject: string;
    score: number;
    grade: string;
    gradeValue: number;
    remark: string;
    facilitator: string;
    zScore: number;
}

export interface ProcessedStudent extends StudentData {
    subjects: ComputedSubject[];
    totalScore: number;
    bestSixAggregate: number;
    bestCoreSubjects: ComputedSubject[];
    bestElectiveSubjects: ComputedSubject[];
    weaknessAnalysis: string;
    category: string;
    rank: number;
}

export interface ClassStatistics {
    subjectMeans: Record<string, number>;
    subjectStdDevs: Record<string, number>;
}

export interface FacilitatorStats {
    facilitatorName: string;
    subject: string;
    studentCount: number;
    gradeCounts: Record<string, number>;
    totalGradeValue: number;
    performancePercentage: number;
    averageGradeValue: number;
    performanceGrade: string;
}

export interface StaffMember {
    id: string;
    name: string;
    role: string;
    status: 'Active' | 'Inactive' | 'Observer Active' | 'Observer Inactive';
    contact: string;
    qualification: string;
    subjects: string[];
    gender?: 'Male' | 'Female';
    dob?: string;
    email?: string;
    address?: string;
    certifications?: string;
    department?: string;
    assignedClass?: string;
    employmentType?: string;
    jobDescription?: string;
    duty?: string;
    skills?: string;
    isInvigilator?: boolean;
    isGuest?: boolean;
    observerRoles?: string[];
}

export interface StaffAttendanceRecord {
    id: string;
    date: string;
    staffId: string;
    staffName: string;
    status: string;
    timeIn?: string;
    timeOut?: string;
}

export interface StaffLeaveRecord {
    id: string;
    staffId: string;
    staffName: string;
    type: string;
    startDate: string;
    endDate: string;
    status: string;
}

export interface StaffMovementLog {
    id: string;
    staffId: string;
    staffName: string;
    type: 'In' | 'Out';
    time: string;
    date: string;
    destination?: string;
}

export interface StaffMeetingLog {
    id: string;
    date: string;
    type: string;
    topic: string;
    attendees: string;
}

export interface StaffWelfareLog {
    id: string;
    date: string;
    type: string;
    description: string;
    amount: number;
}

export interface StaffTrainingLog {
    id: string;
    date: string;
    title: string;
    provider: string;
    attendees?: string;
    outcome?: string;
}

/**
 * Fix: Added ExamScheduleItem interface which was missing in this types file
 * but required by components/GenericModule.tsx and components/StaffManagement.tsx
 */
export interface ExamScheduleItem {
    id: string;
    date: string;
    time: string;
    class: string;
    subject: string;
    venue: string;
    invigilatorId?: string;
    invigilatorName?: string;
    invigilatorRole?: 'Chief Invigilator' | 'Invigilator' | 'Officer';
    confirmed?: boolean;
    duration?: string;
    hasBreak?: boolean;
}

export interface FileRecord {
    id: string;
    name: string;
    path: string;
    uploadDate: string;
    size: string;
    type: string;
    content?: string;
}

export interface DailyAttendanceRecord {
    date: string;
    day: string;
    status: string;
    meta?: string;
}

export interface RegisterWeek {
    id: string;
    weekNumber: number;
    startDate: string;
    endDate: string;
    isClosed: boolean;
    submitted: boolean;
    registerCondition: string;
    entriesAccurate: boolean;
    entriesLate: boolean;
    records: Record<number, Record<string, DailyAttendanceRecord>>;
}

export interface AssessmentColumn {
    id: string;
    label: string;
    date: string;
    maxScore: number;
}

export interface ExerciseAssessmentRecord {
    id: string;
    subject: string;
    week: string;
    strand: string;
    subStrand: string;
    indicator: string;
    date: string;
    type: 'Classwork' | 'Home Assignment' | 'Project';
    pupilsDefaulters: string[];
    pupilsMarked: string[];
    pupilsMissing: string[];
    natureOfQuestions: number;
    bloomsTaxonomy: string[];
    devNumberLink: string;
    handwritingLegibility: number;
    handwritingLegibilityComment: string;
    handwritingClarity: number;
    handwritingClarityComment: string;
    spellWellCount: number;
    goodAppearance: boolean;
    facilitatorPreparedTestItems: boolean;
    confirmedWithPupil: string;
    isLateSubmission: boolean;
}

export interface MaterialRequest {
    id: string;
    staffId: string;
    staffName: string;
    itemName: string;
    category: 'Teaching Aid' | 'Stationery' | 'ICT' | 'Equipment' | 'Other';
    purpose: 'Teaching' | 'Assessment' | 'Support' | 'Other';
    quantityRequested: number;
    dateRequested: string;
    dateRequired: string;
    usageDuration: 'Temporary' | 'Permanent';
    priority: 'Low' | 'Medium' | 'High';
    remarks: string;
    status: 'Pending' | 'Approved' | 'Issued' | 'Returned' | 'Declined';
    approvedQuantity?: number;
    approvalDate?: string;
    approvedBy?: string;
    storeSource?: string;
    dateIssued?: string;
    suppliedBy?: string;
    conditionOnSupply?: 'New' | 'Good' | 'Fair' | 'Poor';
    expectedReturnDate?: string;
    quantityReturned?: number;
    dateReturned?: string;
    conditionOnReturn?: 'Good' | 'Damaged' | 'Lost';
    lossDescription?: string;
    receivedBy?: string;
    returnStatus?: 'Completed' | 'Partial' | 'Overdue';
}

export interface ClassroomInventory {
    id: string;
    block: string;
    roomNumber: string;
    schoolClass: string;
    inspectionDate: string;
    items: Record<string, { status: 'Available' | 'Missing' | 'Damaged', condition: 'Good' | 'Fair' | 'Poor' | 'N/A' }>;
    damagedMissingNotes: string;
    priority: 'Low' | 'Medium' | 'High' | 'Emergency';
    comments: string;
}

export interface SafetyInspection {
    id: string;
    inspectorName: string;
    date: string;
    checks: Record<string, { status: 'Safe' | 'Unsafe' | 'Maintenance Required' | 'N/A', risk: 'Low' | 'Medium' | 'High' }>;
    hazardsIdentified: string;
    actionsRequired: string;
    status: 'Pending' | 'In Progress' | 'Completed';
}

export interface SBACAT {
    id: 'CAT1' | 'CAT2' | 'CAT3';
    label: string;
    type: 'Individual' | 'Group';
    maxScore: number;
    weight: number; 
    date: string;
    questionType: 'Objective' | 'Subjective' | 'Short Essay' | 'Long Essay' | 'Practical';
}

export interface SBAConfig {
    cats: {
        CAT1: SBACAT;
        CAT2: SBACAT;
        CAT3: SBACAT;
    }
}

export interface DaycareSlotData {
    activity?: string;
    subject?: string;
    detail?: string;
    tlm?: string;
    remark?: string;
    startTime?: string;
    endTime?: string;
    timeOverride?: string;
}

export interface DaycareTimetable {
    schedule: Record<string, Record<string, DaycareSlotData>>;
    periodConfig: { id: string; label: string; time?: string; defaultTime: string; type: string }[];
}

export interface BasicSlotData {
    subject: string;
    type: 'Lesson' | 'Break' | 'Extra' | 'Fixed';
    facilitatorId?: string;
    fixedLabel?: string;
    startTime?: string;
    endTime?: string;
}

export interface TimetableConstraints {
    partTimeAvailability?: Record<string, string[]>;
    rowCount?: number; 
    fixedActivities?: {
        worship?: boolean;
        plc?: boolean;
        club?: boolean;
        extraCurricular?: boolean;
        singingHymns?: boolean;
    };
    extraTuitionActive?: boolean;
}

export interface ComplianceLog {
    id: string;
    date: string;
    period: number;
    facilitatorId: string;
    status: 'Present' | 'Late' | 'Absent' | 'Early Close';
    comment?: string;
}

export interface ObservationTask {
    id: string;
    date: string;
    period: string; 
    duration: string;
    venue: string;
    observerId: string;
    observerName: string;
    pupilGroupId?: string; 
    status: 'Pending' | 'Completed' | 'Cancelled' | 'Postponed';
    scores?: Record<number, Record<string, number>>; 
    indicators?: string[];
    scaleType?: '2-point' | '3-point' | '5-point' | '9-point';
    activity?: string;
    subject?: string;
}

export interface ClassTimetableData {
    daycare?: DaycareTimetable;
    grid?: Record<string, Record<string, BasicSlotData>>;
    periods?: { time: string; label: string; startTime?: string; endTime?: string }[];
    subjectDemands?: Record<string, number>;
    constraints?: TimetableConstraints;
    complianceLogs?: Record<string, ComplianceLog[]>; 
    observationSchedule?: ObservationTask[]; 
    /**
     * Fix: Updated any[] to ExamScheduleItem[] for consistency and to resolve errors in GenericModule
     */
    examSchedule?: ExamScheduleItem[];
}

export interface EarlyChildhoodConfig {
    useDailyAssessment: boolean;
    weightA: number;
    weightB: number;
}

export interface EarlyChildhoodGrading {
    core: CoreGradingScale;
    indicators: IndicatorScale;
}

export interface PromotionConfig {
    metric: 'Aggregate' | 'Average Score';
    cutoffValue: number;
    minAttendance: number;
    exceptionalCutoff: number;
}

export interface CalendarWeek {
    id: string;
    period: string;
    dateFrom?: string;
    dateTo?: string;
    activity: string;
    assessment: string;
    leadTeam: string;
    extraCurricular: string;
    logistics?: string;
}

export interface LessonPlanRecord {
    id: string;
    teacherName: string;
    teacherId: string;
    schoolClass: string;
    subject: string;
    topic: string;
    dates: string;
    duration: string;
    strands: string;
    subStrands: string;
    indicators: string;
    classSize: string;
    schemeOfWorkStatus: string;
    referencesCount: string;
    supervisorName: string;
    checklist: Record<string, boolean>;
    sectionScores: {
        B1: number; B2: number; B3: number; B4: number; B5: number; B6: number; B7: number; B8: number; B9: number;
        C1: number; C2: number; C3: number; C4: number; C5: number; C6: number; C7: number;
    };
    analysis: {
        strengths: string;
        improvements: string;
        behaviors: string;
        patterns: string;
        reflectiveEvidence: string;
        feedbackUse: string;
        adjustment: string;
    };
    overallEvaluation: string[];
    supervisorComments: string;
    dateSigned: string;
}

export interface GlobalSettings {
  schoolName: string;
  schoolAddress?: string;
  schoolLogo?: string;
  examTitle: string;
  schoolContact: string;
  schoolEmail: string;
  termInfo: string;
  academicYear: string;
  nextTermBegin: string;
  attendanceTotal: string;
  startDate: string;
  endDate: string;
  headTeacherName: string;
  reportDate: string;
  facilitatorMapping: Record<string, string>;
  
  mockSeries?: string;
  mockAnnouncement?: string;
  mockDeadline?: string;
  
  submittedSubjects?: string[];
  customSubjects?: string[];
  disabledSubjects?: string[];
  activeIndicators?: string[];
  customIndicators?: string[];
  
  staffList?: StaffMember[];
  staffAttendance?: StaffAttendanceRecord[];
  staffLeave?: StaffLeaveRecord[];
  staffMovement?: StaffMovementLog[];
  staffMeetings?: StaffMeetingLog[];
  staffWelfare?: StaffWelfareLog[];
  staffTraining?: StaffTrainingLog[];
  
  fileRegistry?: FileRecord[];
  disciplinaryRecords?: DisciplinaryRecord[];
  
  classTimetables?: Record<string, ClassTimetableData>;
  /**
   * Fix: Updated any[] to ExamScheduleItem[] to resolve import errors in StaffManagement
   */
  examTimeTable?: ExamScheduleItem[];
  
  earlyChildhoodConfig?: EarlyChildhoodConfig;
  earlyChildhoodGrading?: EarlyChildhoodGrading;
  promotionConfig?: PromotionConfig;
  
  gradingSystemRemarks?: Record<string, string>;
  gradingSystemInterpretations?: Record<string, string>;
  gradingKeyLocked?: boolean;
  
  assessmentColumns?: Record<string, AssessmentColumn[]>;
  exerciseAssessments?: Record<string, ExerciseAssessmentRecord[]>; 
  
  materialRequests?: MaterialRequest[];
  classroomInventories?: ClassroomInventory[];
  safetyInspections?: SafetyInspection[];

  classBooklists?: Record<string, BooklistItem[]>; 
  materialStock?: MaterialStockItem[];
  priceRecommendations?: PriceRecommendation[];
  
  sbaConfigs?: Record<string, Record<string, SBAConfig>>;
  
  attendanceRegisters?: Record<string, RegisterWeek[]>;
  lunchRegisters?: Record<string, RegisterWeek[]>;
  extraTuitionRegisters?: Record<string, RegisterWeek[]>;
  generalActivityRegisters?: Record<string, RegisterWeek[]>;
  
  exerciseLogs?: any[];
  lessonPlans?: LessonPlanRecord[];
  lessonAssessments?: any[];
  
  academicCalendar?: Record<string, CalendarWeek[]>;
  
  calendarLists?: {
      periods: string[];
      activities: string[];
      assessments: string[];
      leadTeam: string[];
      extraCurricular: string[];
  };
  
  admissionQuestionBank?: any;
}

export interface SystemConfig {
    activeRole: string;
    roles: string[];
    moduleVisibility: Record<string, boolean>;
    actionPermissions: Record<string, boolean>;
    bulkUploadTargetClass: string | null;
}
