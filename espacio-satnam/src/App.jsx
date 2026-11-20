import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Calendar,
  Users,
  CreditCard,
  Plus,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Clock,
  UserCheck,
  UserX,
  Search,
  Trash2,
  ShieldCheck,
  Bike,
  Heart,
  Check,
  RefreshCw,
  Lock,
  Sparkles,
  Flame,
  Flower2,
  Compass,
  Orbit,
  Ban,
  Edit3,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  UserCog,
  CalendarRange,
  ClipboardCheck,
  Palmtree,
  Clock3,
  ListPlus,
  History,
  Layers,
  CopyPlus,
  Info,
  BookmarkCheck,
  ArrowRight,
  FlaskConical
} from 'lucide-react';

const supabase = createClient(
  'https://miwktvtdygetyzqvccal.supabase.co',
  'sb_publishable_45-FeV94kQsHYfau3pJPjg_DOo7R6yx'
);

const ADMIN_PIN = '1008';
const DAY_MS = 86_400_000;
const NO_PLAN_LABEL = 'Sin Plan (Solo Sesiones / Masajes)';

const SERVICE_PILLARS = [
  { id: 'cuerpo', label: 'Cuerpo & Movimiento' },
  { id: 'mente', label: 'Mente & Procesos' },
  { id: 'estetica', label: 'Cuidado & Estética' }
];

const INITIAL_SERVICES = [
  { id: 'Yoga', label: 'Yoga', pillar: 'cuerpo', isClass: true, defaultCap: 12 },
  { id: 'Spinning', label: 'Spinning', pillar: 'cuerpo', isClass: true, defaultCap: 10 },
  { id: 'Pilates', label: 'Pilates', pillar: 'cuerpo', isClass: true, defaultCap: 10 },
  { id: 'CircuitoSatNam', label: 'Circuito Sat-Nam', pillar: 'cuerpo', isClass: true, defaultCap: 10 },
  { id: 'Coaching', label: 'Coaching & PNL', pillar: 'mente', isClass: false, defaultCap: 1 },
  { id: 'Constelaciones', label: 'Constelaciones', pillar: 'mente', isClass: false, defaultCap: 12 },
  { id: 'Eventos', label: 'Meditaciones', pillar: 'mente', isClass: false, defaultCap: 20 },
  { id: 'Estetica', label: 'Estética & Cosmiatría', pillar: 'estetica', isClass: false, defaultCap: 1 }
];

const INITIAL_PLANS = [
  { id: 'sin_plan', name: NO_PLAN_LABEL, credits: 0, price: 0, isUnlimited: false, isNone: true, comingSoon: false },
  { id: 'sesion_ind', name: 'Sesión Individual (Coaching / PNL / Constelaciones / Estética)', credits: 1, price: 35000, isUnlimited: false, comingSoon: false },
  { id: 'taller_const', name: 'Taller de Constelaciones / Evento Especial', credits: 1, price: 40000, isUnlimited: false, comingSoon: false },
  { id: 'clase_ind', name: 'Clase Individual', credits: 1, price: 18000, isUnlimited: false, comingSoon: false },
  { id: 'm1', name: 'Mensual - 1 vez por semana', credits: 4, price: 48000, isUnlimited: false, comingSoon: false },
  { id: 'm2', name: 'Mensual - 2 veces por semana', credits: 8, price: 78000, isUnlimited: false, comingSoon: false },
  { id: 'm3', name: 'Mensual - 3 veces por semana', credits: 12, price: 105000, isUnlimited: false, comingSoon: false },
  { id: 'pase_libre', name: 'Pase Libre Clases', credits: 99, price: 130000, isUnlimited: true, comingSoon: false }
];

const WEEKDAYS_MON_FRI = [
  { dayId: 1, label: 'LUNES', short: 'Lun' },
  { dayId: 2, label: 'MARTES', short: 'Mar' },
  { dayId: 3, label: 'MIÉRCOLES', short: 'Mié' },
  { dayId: 4, label: 'JUEVES', short: 'Jue' },
  { dayId: 5, label: 'VIERNES', short: 'Vie' }
];

const DAYS_OF_WEEK_ALL = [
  { id: 1, short: 'Lun' },
  { id: 2, short: 'Mar' },
  { id: 3, short: 'Mié' },
  { id: 4, short: 'Jue' },
  { id: 5, short: 'Vie' },
  { id: 6, short: 'Sáb' },
  { id: 0, short: 'Dom' }
];

const EMPTY_SERVICE_FORM = { label: '', pillar: 'cuerpo', isClass: true, defaultCap: 10 };
const EMPTY_PLAN_FORM = { name: '', credits: 4, price: 50000, isUnlimited: false, comingSoon: false };

const readLocalJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeLocalJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

const onlyDigits = (str = '') => String(str).replace(/\D/g, '');

const mapStudentRow = (s) => ({
  id: s.id,
  name: s.name,
  phone: s.phone || '',
  plan: s.plan,
  status: s.status,
  expiryDate: s.expiry_date,
  credits: s.credits
});

const toISODate = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const addDaysToISO = (isoDate, days) => {
  const base = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(base.getTime())) return isoDate;
  base.setDate(base.getDate() + Number(days || 0));
  return toISODate(base);
};

const diffDaysISO = (targetISO, baseISO) => {
  const a = new Date(`${targetISO}T00:00:00`).getTime();
  const b = new Date(`${baseISO}T00:00:00`).getTime();
  return Math.ceil((a - b) / DAY_MS);
};

const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = String(dateStr).split('T')[0].split('-');
  return year && month && day ? `${day}-${month}-${year}` : dateStr;
};

const formatPriceARS = (value) => `$ ${Number(value || 0).toLocaleString('es-AR')}`;

const formatTimestamp = (isoStr) => {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return isoStr;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const getMondayOfWeek = (cursor) => {
  const d = new Date(cursor);
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  d.setHours(0, 0, 0, 0);
  return d;
};

function SatNamLogo({ className = 'w-11 h-11' }) {
  return (
    <div className={`${className} rounded-2xl bg-[#5C7362] p-1.5 flex items-center justify-center text-white shadow-xs shrink-0`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M32 7C25.5 18.5 23 30 32 44.5C41 30 38.5 18.5 32 7Z" fill="white" fillOpacity="0.96" />
        <path d="M28.5 43.5C17 36.8 11.2 25.2 13.6 14C22.8 18.8 27.6 29.5 28.5 43.5Z" fill="white" fillOpacity="0.78" />
        <path d="M35.5 43.5C47 36.8 52.8 25.2 50.4 14C41.2 18.8 36.4 29.5 35.5 43.5Z" fill="white" fillOpacity="0.78" />
        <path d="M26.2 46C12.2 46 4.4 37.8 3.5 28.6C13.6 28.6 21.8 35.4 26.2 46Z" fill="white" fillOpacity="0.55" />
        <path d="M37.8 46C51.8 46 59.6 37.8 60.5 28.6C50.4 28.6 42.2 35.4 37.8 46Z" fill="white" fillOpacity="0.55" />
        <circle cx="32" cy="53.5" r="3.2" fill="white" fillOpacity="0.92" />
      </svg>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState('student');
  const [studentSection, setStudentSection] = useState('info');

  const [testingProfilesMode, setTestingProfilesMode] = useState(() => readLocalJSON('satnam_testing_profiles_v1', false));

  const [adminTab, setAdminTab] = useState('schedule');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [services, setServices] = useState(() => readLocalJSON('satnam_services_v3', INITIAL_SERVICES));
  const [plans, setPlans] = useState(() => readLocalJSON('satnam_plans_v2', INITIAL_PLANS));
  const [vacationPeriods, setVacationPeriods] = useState(() => readLocalJSON('satnam_vacations_v1', []));
  const [planMetaMap, setPlanMetaMap] = useState(() => readLocalJSON('satnam_plan_meta_v2', {}));
  const [cancelledTimestamps, setCancelledTimestamps] = useState(() => readLocalJSON('satnam_cancelled_ts_v1', {}));
  const [attendanceMap, setAttendanceMap] = useState(() => readLocalJSON('satnam_attendance_v1', {}));
  const [waitlistMap, setWaitlistMap] = useState(() => readLocalJSON('satnam_waitlist_v1', {}));
  const [comingSoonClassesMap, setComingSoonClassesMap] = useState(() => readLocalJSON('satnam_coming_soon_classes_v1', {}));
  const [esteticaHistoryList, setEsteticaHistoryList] = useState(() => readLocalJSON('satnam_estetica_history_v1', []));
  const [esteticaWeeksMap, setEsteticaWeeksMap] = useState(() => readLocalJSON('satnam_estetica_weeks_v1', {}));

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [pendingAttendanceEdit, setPendingAttendanceEdit] = useState(null);
  const [pendingDeleteConfirm, setPendingDeleteConfirm] = useState(null);

  const todayISO = useMemo(() => toISODate(new Date()), []);
  const [activeStudentId, setActiveStudentId] = useState(() => readLocalJSON('satnam_current_user_id_v1', ''));
  const [selectedDate, setSelectedDate] = useState(() => toISODate(new Date()));
  const [pillarFilter, setPillarFilter] = useState('cuerpo');
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });

  const [weekCursor, setWeekCursor] = useState(() => getMondayOfWeek(new Date()));
  const [selectedStudentClassIds, setSelectedStudentClassIds] = useState([]);
  const [bookingSequence, setBookingSequence] = useState(false);

  const [selectedSequenceIds, setSelectedSequenceIds] = useState([]);
  const [bulkTimeInput, setBulkTimeInput] = useState('');
  const [repeatingWeek, setRepeatingWeek] = useState(false);

  const [attendanceServiceFilter, setAttendanceServiceFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [openClassesPanel, setOpenClassesPanel] = useState(false);
  const [openBookingsPanel, setOpenBookingsPanel] = useState(false);
  const [expandedDashboardClassId, setExpandedDashboardClassId] = useState(null);
  const [dashboardScope, setDashboardScope] = useState('day');
  const [dashboardMonth, setDashboardMonth] = useState(() => toISODate(new Date()).slice(0, 7));

  const [showEsteticaHistoryModal, setShowEsteticaHistoryModal] = useState(false);
  const [esteticaHistoryForm, setEsteticaHistoryForm] = useState({
    studentId: '',
    date: addDaysToISO(toISODate(new Date()), -21),
    treatment: 'Limpieza Facial Profunda',
    notes: ''
  });

  const [openPaymentsPanel, setOpenPaymentsPanel] = useState('renew');
  const [showPlanManagerModal, setShowPlanManagerModal] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [planForm, setPlanForm] = useState(EMPTY_PLAN_FORM);

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceForm, setServiceForm] = useState(EMPTY_SERVICE_FORM);

  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClassId, setEditingClassId] = useState(null);
  const [classForm, setClassForm] = useState({
    category: 'Yoga',
    title: 'Yoga',
    isCustomTitle: false,
    instructor: 'Patricia Aleman',
    time: '08:00',
    duration: 60,
    selectedDays: [1, 3, 5],
    weeksCount: 4,
    comingSoon: false
  });

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [studentForm, setStudentForm] = useState({
    name: '',
    phone: '',
    plan: 'Mensual - 2 veces por semana',
    startDate: todayISO,
    expiryDate: addDaysToISO(todayISO, 30),
    credits: 8,
    absenceReason: 'none'
  });

  const [showRenewDatesModal, setShowRenewDatesModal] = useState(false);
  const [renewDatesStudentId, setRenewDatesStudentId] = useState(null);
  const [renewDatesForm, setRenewDatesForm] = useState({
    startDate: todayISO,
    expiryDate: addDaysToISO(todayISO, 30),
    resetCredits: true
  });

  const [showVacationModal, setShowVacationModal] = useState(false);
  const [vacationForm, setVacationForm] = useState({
    startDate: todayISO,
    endDate: addDaysToISO(todayISO, 7)
  });

  const toastTimerRef = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setNotification(null), 3500);
  }, []);

  useEffect(() => () => toastTimerRef.current && clearTimeout(toastTimerRef.current), []);

  const persistState = useCallback((setter, key, value) => {
    setter(value);
    writeLocalJSON(key, value);
  }, []);

  const setCurrentSessionStudent = (studentId) => {
    setActiveStudentId(studentId);
    writeLocalJSON('satnam_current_user_id_v1', studentId || '');
  };

  const getServiceDefaultCapacity = useCallback(
    (categoryId) => Number(services.find((s) => s.id === categoryId)?.defaultCap) || 10,
    [services]
  );

  const isClassComingSoon = useCallback((cls) => Boolean(cls && comingSoonClassesMap[cls.id]), [comingSoonClassesMap]);

  const getVacationForDate = useCallback(
    (isoDate) => (isoDate ? vacationPeriods.find((vp) => isoDate >= vp.startDate && isoDate <= vp.endDate) || null : null),
    [vacationPeriods]
  );

  const getPlanConfig = useCallback(
    (planName) =>
      plans.find((p) => p.name === planName) || {
        name: planName,
        credits: 4,
        price: 0,
        isUnlimited: false,
        isNone: false,
        comingSoon: false
      },
    [plans]
  );

  const hasActiveSubscriptionPlan = useCallback(
    (student) => Boolean(student && !getPlanConfig(student.plan).isNone && student.plan !== NO_PLAN_LABEL),
    [getPlanConfig]
  );

  const isUnlimitedPlan = useCallback((planName) => Boolean(getPlanConfig(planName).isUnlimited), [getPlanConfig]);

  const getDefaultCreditsForPlan = useCallback(
    (planName) => {
      const cfg = getPlanConfig(planName);
      if (cfg.isNone) return 0;
      if (cfg.isUnlimited) return 99;
      return Number(cfg.credits) || 1;
    },
    [getPlanConfig]
  );

  const isPlanPaused = useCallback(
    (student) => {
      if (!student) return false;
      const meta = planMetaMap[student.id];
      return (
        student.status === 'paused' ||
        Boolean(meta?.isPaused) ||
        meta?.absenceReason === 'vacation_pause' ||
        meta?.absenceReason === 'not_renewed'
      );
    },
    [planMetaMap]
  );

  const isPlanExpired = useCallback(
    (student) =>
      Boolean(student && hasActiveSubscriptionPlan(student) && student.expiryDate && (student.expiryDate < todayISO || student.status === 'overdue')),
    [hasActiveSubscriptionPlan, todayISO]
  );

  const isPlanExpiringSoon = useCallback(
    (student) => {
      if (!student || !hasActiveSubscriptionPlan(student) || isPlanPaused(student) || !student.expiryDate) return false;
      return diffDaysISO(student.expiryDate, todayISO) <= 5;
    },
    [hasActiveSubscriptionPlan, isPlanPaused, todayISO]
  );

  const canStudentOperate = useCallback((student) => Boolean(student && !isPlanPaused(student) && !isPlanExpired(student)), [isPlanPaused, isPlanExpired]);

  const isDateBlockedForStudent = useCallback(
    (student, isoDate) => {
      if (!student || !isoDate) return false;
      if (!canStudentOperate(student) && isoDate > todayISO) return true;
      if (canStudentOperate(student) && hasActiveSubscriptionPlan(student) && student.expiryDate && isoDate > student.expiryDate) {
        return true;
      }
      return false;
    },
    [canStudentOperate, hasActiveSubscriptionPlan, todayISO]
  );

  const getStudentStartDate = useCallback(
    (student) => (student ? planMetaMap[student.id]?.startDate || addDaysToISO(student.expiryDate, -30) : ''),
    [planMetaMap]
  );

  const getStudentQuotaDisplay = useCallback(
    (student) => {
      if (!student) return '';
      if (!hasActiveSubscriptionPlan(student)) return 'Sin plan';
      if (isUnlimitedPlan(student.plan)) return 'Pase Libre';
      const total = getDefaultCreditsForPlan(student.plan);
      const used = Math.max(0, total - Number(student.credits || 0));
      return `${used}/${total}`;
    },
    [hasActiveSubscriptionPlan, isUnlimitedPlan, getDefaultCreditsForPlan]
  );

  const getAbsenceLabel = useCallback(
    (student) => {
      const reason = planMetaMap[student?.id]?.absenceReason;
      if (reason === 'vacation_pause') return 'Suspensión por vacaciones';
      if (reason === 'not_renewed') return 'No renovó';
      return null;
    },
    [planMetaMap]
  );

  const getPillarForCategory = useCallback(
    (categoryId) => {
      const srv = services.find((s) => s.id === categoryId);
      if (srv) return srv.pillar;
      if (categoryId === 'Estetica' || categoryId === 'Bienestar') return 'estetica';
      if (['Coaching', 'Constelaciones', 'Eventos'].includes(categoryId)) return 'mente';
      return 'cuerpo';
    },
    [services]
  );

  const adjustStudentCredits = async (student, delta) => {
    if (!student || !hasActiveSubscriptionPlan(student) || isUnlimitedPlan(student.plan)) return;
    const nextCredits = Math.max(0, Number(student.credits || 0) + delta);
    await supabase.from('students').update({ credits: nextCredits }).eq('id', student.id);
    setStudents((prev) => prev.map((s) => (s.id === student.id ? { ...s, credits: nextCredits } : s)));
  };

  const applyStudentPlanDates = async (studentId, { startDate, expiryDate, resetCredits = true }) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return false;

    const updatedCredits = resetCredits ? getDefaultCreditsForPlan(student.plan) : student.credits;
    const nextStatus = expiryDate >= todayISO ? 'active' : 'overdue';

    const { error } = await supabase
      .from('students')
      .update({ status: nextStatus, expiry_date: expiryDate, credits: updatedCredits })
      .eq('id', studentId);

    if (error) return false;

    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, status: nextStatus, expiryDate, credits: updatedCredits } : s)));
    persistState(setPlanMetaMap, 'satnam_plan_meta_v2', {
      ...planMetaMap,
      [studentId]: { ...(planMetaMap[studentId] || {}), startDate, isPaused: false, absenceReason: 'none' }
    });
    return true;
  };

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsRes, classesRes, bookingsRes] = await Promise.all([
        supabase.from('students').select('*').order('name', { ascending: true }),
        supabase.from('classes').select('*').order('time', { ascending: true }),
        supabase.from('bookings').select('*')
      ]);

      if (studentsRes.error) throw studentsRes.error;
      if (classesRes.error) throw classesRes.error;
      if (bookingsRes.error) throw bookingsRes.error;

      setStudents(studentsRes.data.map(mapStudentRow));
      setClasses(classesRes.data);

      const savedAtt = readLocalJSON('satnam_attendance_v1', {});
      setBookings(
        bookingsRes.data.map((b) => {
          const resolvedStatus = savedAtt[b.id] || b.attendance_status || (b.attended ? 'attended' : null);
          return {
            id: b.id,
            classId: b.class_id,
            studentId: b.student_id,
            attended: resolvedStatus === 'attended',
            attendanceStatus: resolvedStatus
          };
        })
      );
    } catch (error) {
      console.error('Error cargando datos:', error);
      showToast('Error al sincronizar con la nube', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const activeStudent = useMemo(() => {
    if (activeStudentId) {
      const found = students.find((s) => s.id === activeStudentId);
      if (found) return found;
    }
    return students[0] || null;
  }, [students, activeStudentId]);

  const studentAllowed = canStudentOperate(activeStudent);
  const studentHasPlan = hasActiveSubscriptionPlan(activeStudent);

  const setClassComingSoonFlag = (ids, value) => {
    const nextMap = { ...comingSoonClassesMap };
    ids.forEach((id) => (value ? (nextMap[id] = true) : delete nextMap[id]));
    persistState(setComingSoonClassesMap, 'satnam_coming_soon_classes_v1', nextMap);
  };

  const handleSelectAdminMode = () => {
    if (isAdminUnlocked) setRole('admin');
    else {
      setPinInput('');
      setPinError(false);
      setShowPinModal(true);
    }
  };

  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setIsAdminUnlocked(true);
      setShowPinModal(false);
      setRole('admin');
      setPinInput('');
      setPinError(false);
      showToast('Acceso concedido al Modo Estudio');
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleSaveEsteticaHistory = (e) => {
    e.preventDefault();
    if (!esteticaHistoryForm.studentId || !esteticaHistoryForm.date || !esteticaHistoryForm.treatment.trim()) return;

    const entry = {
      id: `est_${Date.now()}`,
      studentId: esteticaHistoryForm.studentId,
      date: esteticaHistoryForm.date,
      title: esteticaHistoryForm.treatment.trim(),
      notes: esteticaHistoryForm.notes.trim()
    };

    persistState(setEsteticaHistoryList, 'satnam_estetica_history_v1', [entry, ...esteticaHistoryList]);
    setShowEsteticaHistoryModal(false);
    showToast('Sesión agregada al historial de estética');
  };

  const handleChangeEsteticaInterval = (studentId, weeks) => {
    persistState(setEsteticaWeeksMap, 'satnam_estetica_weeks_v1', {
      ...esteticaWeeksMap,
      [studentId]: Number(weeks)
    });
    showToast(`Recordatorio configurado cada ${weeks} semanas`);
  };

  const handleSaveVacationPeriod = async (e) => {
    e.preventDefault();
    if (!vacationForm.startDate || !vacationForm.endDate) return;
    if (vacationForm.endDate < vacationForm.startDate) {
      return showToast('La fecha de fin no puede ser anterior a la de inicio', 'error');
    }

    const newPeriod = {
      id: `vac_${Date.now()}`,
      startDate: vacationForm.startDate,
      endDate: vacationForm.endDate
    };
    persistState(setVacationPeriods, 'satnam_vacations_v1', [...vacationPeriods, newPeriod]);

    const affectedIds = classes
      .filter((c) => c.date >= vacationForm.startDate && c.date <= vacationForm.endDate)
      .map((c) => c.id);

    if (affectedIds.length > 0) {
      const nowISO = new Date().toISOString();
      await supabase.from('classes').update({ is_cancelled: true }).in('id', affectedIds);
      setClasses((prev) => prev.map((c) => (affectedIds.includes(c.id) ? { ...c, is_cancelled: true } : c)));

      const nextTs = { ...cancelledTimestamps };
      affectedIds.forEach((id) => (nextTs[id] = nowISO));
      persistState(setCancelledTimestamps, 'satnam_cancelled_ts_v1', nextTs);
    }

    setShowVacationModal(false);
    showToast('Licencia registrada y clases del rango canceladas');
  };

  const handleRemoveVacationPeriod = async (periodId) => {
    const target = vacationPeriods.find((vp) => vp.id === periodId);
    const remainingPeriods = vacationPeriods.filter((vp) => vp.id !== periodId);
    persistState(setVacationPeriods, 'satnam_vacations_v1', remainingPeriods);

    if (target) {
      const stillInVacation = (iso) => remainingPeriods.some((vp) => iso >= vp.startDate && iso <= vp.endDate);
      const idsToReactivate = classes
        .filter((c) => c.date >= target.startDate && c.date <= target.endDate && !stillInVacation(c.date))
        .map((c) => c.id);

      if (idsToReactivate.length > 0) {
        await supabase.from('classes').update({ is_cancelled: false }).in('id', idsToReactivate);
        setClasses((prev) => prev.map((c) => (idsToReactivate.includes(c.id) ? { ...c, is_cancelled: false } : c)));

        const nextTs = { ...cancelledTimestamps };
        idsToReactivate.forEach((id) => delete nextTs[id]);
        persistState(setCancelledTimestamps, 'satnam_cancelled_ts_v1', nextTs);
      }
    }

    showToast('Período eliminado y clases reactivadas');
  };

  const handleOpenEditProfile = () => {
    if (!activeStudent) return;
    setProfileForm({ name: activeStudent.name, phone: activeStudent.phone });
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!activeStudent || !profileForm.name.trim()) return;

    const cleanName = profileForm.name.trim();
    const cleanPhone = profileForm.phone.trim();
    const { error } = await supabase.from('students').update({ name: cleanName, phone: cleanPhone }).eq('id', activeStudent.id);
    if (error) return showToast('No se pudo actualizar tu perfil', 'error');

    setStudents((prev) => prev.map((s) => (s.id === activeStudent.id ? { ...s, name: cleanName, phone: cleanPhone } : s)));
    setShowEditProfileModal(false);
    showToast('Perfil actualizado correctamente');
  };

  const handleToggleWaitlist = (classId) => {
    if (!activeStudent) return showToast('No hay un perfil activo disponible', 'error');
    if (!canStudentOperate(activeStudent)) {
      return showToast('Tu plan está vencido. No puedes reservar ni cancelar turnos. Comunicate con el espacio para reactivar tu plan.', 'error');
    }

    const currentList = waitlistMap[classId] || [];
    const exists = currentList.includes(activeStudent.id);
    const nextList = exists ? currentList.filter((id) => id !== activeStudent.id) : [...currentList, activeStudent.id];

    persistState(setWaitlistMap, 'satnam_waitlist_v1', { ...waitlistMap, [classId]: nextList });
    showToast(exists ? 'Saliste de la lista de espera' : 'Te sumaste a la lista de espera');
  };

  const handleCancelExistingBooking = async (classId) => {
    if (!activeStudent) return;
    if (!canStudentOperate(activeStudent)) {
      return showToast('Tu plan está vencido. No puedes reservar ni cancelar turnos. Comunicate con el espacio para reactivar tu plan.', 'error');
    }

    const existingBooking = bookings.find((b) => b.classId === classId && b.studentId === activeStudent.id);
    if (!existingBooking) return;

    const { error } = await supabase.from('bookings').delete().eq('id', existingBooking.id);
    if (error) return showToast('No se pudo cancelar la reserva', 'error');

    setBookings((prev) => prev.filter((b) => b.id !== existingBooking.id));
    const nextAtt = { ...attendanceMap };
    delete nextAtt[existingBooking.id];
    persistState(setAttendanceMap, 'satnam_attendance_v1', nextAtt);

    await adjustStudentCredits(activeStudent, +1);
    showToast('Reserva cancelada correctamente');
  };

  const reserveSingleClass = async (classObj, currentStudent, currentCredits) => {
    if (!currentStudent || !classObj) return { ok: false, reason: 'Sin perfil activo' };
    if (!canStudentOperate(currentStudent)) {
      return { ok: false, reason: 'Tu plan está vencido. No puedes reservar ni cancelar turnos. Comunicate con el espacio para reactivar tu plan.' };
    }
    if (isClassComingSoon(classObj)) return { ok: false, reason: 'Esta actividad figura como Próximamente y aún no admite reservas.' };

    const srvObj = services.find((s) => s.id === classObj.category);
    if ((srvObj ? Boolean(srvObj.isClass) : true) && !hasActiveSubscriptionPlan(currentStudent)) {
      return { ok: false, reason: 'Para reservar clases regulares necesitás un plan activo.' };
    }
    if (getVacationForDate(classObj.date)) return { ok: false, reason: 'Cerrado por vacaciones en esta fecha.' };
    if (isDateBlockedForStudent(currentStudent, classObj.date)) {
      return { ok: false, reason: 'Tu plan está vencido. No puedes reservar ni cancelar turnos. Comunicate con el espacio para reactivar tu plan.' };
    }
    if (classObj.is_cancelled) return { ok: false, reason: 'Esta clase se encuentra cancelada.' };

    const alreadyBooked = bookings.some((b) => b.classId === classObj.id && b.studentId === currentStudent.id);
    if (alreadyBooked) return { ok: false, reason: `Ya tenés reservada ${classObj.title}` };

    const classBookingsCount = bookings.filter((b) => b.classId === classObj.id).length;
    if (classBookingsCount >= classObj.capacity) return { ok: false, reason: `${classObj.title} está completa` };

    const usesCredits = hasActiveSubscriptionPlan(currentStudent) && !isUnlimitedPlan(currentStudent.plan);
    if (usesCredits && currentCredits <= 0) {
      return { ok: false, reason: 'Sin sesiones disponibles en tu abono.' };
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert([{ class_id: classObj.id, student_id: currentStudent.id, attended: false }])
      .select()
      .single();

    if (error) return { ok: false, reason: 'No se pudo realizar la reserva' };

    setBookings((prev) => [
      ...prev,
      { id: data.id, classId: data.class_id, studentId: data.student_id, attended: false, attendanceStatus: null }
    ]);

    let nextCredits = currentCredits;
    if (usesCredits) {
      nextCredits = Math.max(0, currentCredits - 1);
      await supabase.from('students').update({ credits: nextCredits }).eq('id', currentStudent.id);
      setStudents((prev) => prev.map((s) => (s.id === currentStudent.id ? { ...s, credits: nextCredits } : s)));
    }

    return { ok: true, nextCredits };
  };

  const handleToggleBooking = async (classId) => {
    if (!activeStudent) return showToast('No hay un perfil activo disponible', 'error');
    const existing = bookings.find((b) => b.classId === classId && b.studentId === activeStudent.id);
    if (existing) return handleCancelExistingBooking(classId);

    const classObj = classes.find((c) => c.id === classId);
    const res = await reserveSingleClass(classObj, activeStudent, Number(activeStudent.credits || 0));
    if (!res.ok) return showToast(res.reason, 'error');
    showToast(`¡Lugar reservado en ${classObj.title}!`);
  };

  const handleBookSequential = async () => {
    if (!activeStudent || selectedStudentClassIds.length === 0 || bookingSequence) return;
    setBookingSequence(true);

    try {
      const ordered = classes
        .filter((c) => selectedStudentClassIds.includes(c.id))
        .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

      let runningCredits = Number(activeStudent.credits || 0);
      let bookedCount = 0;
      let firstError = null;

      for (const cls of ordered) {
        const res = await reserveSingleClass(cls, activeStudent, runningCredits);
        if (res.ok) {
          bookedCount += 1;
          runningCredits = res.nextCredits;
        } else if (!firstError) {
          firstError = res.reason;
        }
      }

      setSelectedStudentClassIds([]);
      if (bookedCount > 0) {
        showToast(bookedCount === 1 ? '1 clase reservada en secuencia' : `${bookedCount} clases reservadas en secuencia`);
      } else if (firstError) {
        showToast(firstError, 'error');
      }
    } finally {
      setBookingSequence(false);
    }
  };

  const applyAttendanceStatus = async (bookingId, status) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const prevStatus = booking.attendanceStatus || (booking.attended ? 'attended' : null);
    const isAttendedBool = status === 'attended';

    const { error: statusErr } = await supabase
      .from('bookings')
      .update({ attended: isAttendedBool, attendance_status: status })
      .eq('id', bookingId);

    if (statusErr) {
      await supabase.from('bookings').update({ attended: isAttendedBool }).eq('id', bookingId);
    }

    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, attended: isAttendedBool, attendanceStatus: status } : b)));
    persistState(setAttendanceMap, 'satnam_attendance_v1', { ...attendanceMap, [bookingId]: status });

    const st = students.find((s) => s.id === booking.studentId);
    if (prevStatus !== 'no_show' && status === 'no_show') await adjustStudentCredits(st, -1);
    else if (prevStatus === 'no_show' && status !== 'no_show') await adjustStudentCredits(st, +1);

    showToast(status === 'attended' ? 'Asistencia guardada como Asistió' : 'Marcado como No asistió (clase descontada del abono)');
  };

  const handleRequestAttendanceChange = (booking, nextStatus, studentName) => {
    const currentStatus = booking.attendanceStatus || (booking.attended ? 'attended' : null);
    if (currentStatus === nextStatus) return;
    if (currentStatus) setPendingAttendanceEdit({ bookingId: booking.id, nextStatus, studentName });
    else applyAttendanceStatus(booking.id, nextStatus);
  };

  const handleSaveService = (e) => {
    e.preventDefault();
    const cleanLabel = serviceForm.label.trim();
    if (!cleanLabel) return;
    const baseCap = Math.max(1, Number(serviceForm.defaultCap) || 10);

    if (editingServiceId) {
      persistState(
        setServices,
        'satnam_services_v3',
        services.map((s) =>
          s.id === editingServiceId
            ? { ...s, label: cleanLabel, pillar: serviceForm.pillar, isClass: Boolean(serviceForm.isClass), defaultCap: baseCap }
            : s
        )
      );
      setEditingServiceId(null);
      setServiceForm(EMPTY_SERVICE_FORM);
      showToast('Servicio y cupo base guardados');
      return;
    }

    const baseId = cleanLabel.replace(/[^a-zA-Z0-9]/g, '') || `Srv${Date.now()}`;
    const uniqueId = services.some((s) => s.id.toLowerCase() === baseId.toLowerCase()) ? `${baseId}_${Date.now()}` : baseId;
    persistState(setServices, 'satnam_services_v3', [
      ...services,
      { id: uniqueId, label: cleanLabel, pillar: serviceForm.pillar, isClass: Boolean(serviceForm.isClass), defaultCap: baseCap }
    ]);
    setServiceForm(EMPTY_SERVICE_FORM);
    showToast('Servicio agregado con cupo guardado');
  };

  const handleRequestDeleteService = (srv) => {
    if (services.length <= 1) return showToast('Debe quedar al menos un servicio en el estudio.', 'error');
    setPendingDeleteConfirm({ type: 'service', id: srv.id, title: `el servicio "${srv.label}"` });
  };

  const handleOpenNewClassModal = (preset = {}) => {
    const firstSrv = services[0];
    const cat = preset.category || firstSrv?.id || 'Yoga';
    const srvObj = services.find((s) => s.id === cat) || firstSrv;
    setEditingClassId(null);
    setClassForm({
      category: cat,
      title: srvObj?.label || 'Yoga',
      isCustomTitle: false,
      instructor: 'Patricia Aleman',
      time: preset.time || '08:00',
      duration: 60,
      selectedDays: preset.dayId !== undefined ? [preset.dayId] : [1, 3, 5],
      weeksCount: 4,
      comingSoon: false
    });
    setShowClassModal(true);
  };

  const handleOpenEditClass = (cls) => {
    const matchingSrv = services.find((s) => s.id === cls.category) || services[0];
    setEditingClassId(cls.id);
    setClassForm({
      category: matchingSrv.id,
      title: cls.title,
      isCustomTitle: cls.title !== matchingSrv.label,
      instructor: cls.instructor || 'Patricia Aleman',
      time: cls.time,
      duration: cls.duration,
      selectedDays: [1],
      weeksCount: 1,
      comingSoon: isClassComingSoon(cls)
    });
    setShowClassModal(true);
  };

  const handleSaveClass = async (e) => {
    e.preventDefault();
    const matchingSrv = services.find((s) => s.id === classForm.category) || services[0];
    const finalTitle = classForm.isCustomTitle && classForm.title.trim() ? classForm.title.trim() : matchingSrv.label;
    const savedCap = getServiceDefaultCapacity(classForm.category);

    if (editingClassId) {
      const targetDate = classes.find((c) => c.id === editingClassId)?.date || selectedDate;
      const conflict = classes.find((c) => c.id !== editingClassId && c.date === targetDate && c.time === classForm.time);
      if (conflict) {
        return showToast(`Ya existe una clase (${conflict.title}) el ${formatDateDDMMYYYY(targetDate)} a las ${classForm.time} hs.`, 'error');
      }

      const { data, error } = await supabase
        .from('classes')
        .update({
          title: finalTitle,
          category: classForm.category,
          instructor: classForm.instructor || 'Patricia Aleman',
          time: classForm.time,
          duration: Number(classForm.duration),
          capacity: savedCap
        })
        .eq('id', editingClassId)
        .select()
        .single();

      if (error) return showToast('Error al actualizar la clase', 'error');

      setClasses((prev) => prev.map((c) => (c.id === editingClassId ? data : c)));
      setClassComingSoonFlag([editingClassId], Boolean(classForm.comingSoon));
      setShowClassModal(false);
      setEditingClassId(null);
      showToast('Clase actualizada con éxito');
      return;
    }

    if (classForm.selectedDays.length === 0) return showToast('Selecciona al menos un día de la semana', 'error');

    const weeks = Math.min(4, Math.max(1, Number(classForm.weeksCount) || 1));
    const baseDate = new Date(`${selectedDate}T00:00:00`);
    const datesSet = new Set();

    for (let w = 0; w < weeks; w++) {
      for (const dayOfWeek of classForm.selectedDays) {
        const d = new Date(baseDate);
        const diff = (dayOfWeek + 7 - d.getDay()) % 7;
        d.setDate(d.getDate() + diff + w * 7);
        datesSet.add(toISODate(d));
      }
    }

    const datesToCreate = [...datesSet];
    const conflictingDates = datesToCreate.filter((d) => classes.some((c) => c.date === d && c.time === classForm.time));
    if (conflictingDates.length > 0) {
      const preview = conflictingDates.slice(0, 3).map(formatDateDDMMYYYY).join(', ');
      return showToast(`Ya hay una clase a las ${classForm.time} hs en: ${preview}. Cambia el día o el horario.`, 'error');
    }

    const payload = datesToCreate.map((d) => ({
      title: finalTitle,
      category: classForm.category,
      instructor: classForm.instructor || 'Patricia Aleman',
      date: d,
      time: classForm.time,
      duration: Number(classForm.duration),
      capacity: savedCap,
      room: ''
    }));

    const { data, error } = await supabase.from('classes').insert(payload).select();
    if (error) return showToast('No se pudieron guardar los horarios', 'error');

    if (classForm.comingSoon && Array.isArray(data)) {
      setClassComingSoonFlag(data.map((item) => item.id), true);
    }

    setClasses((prev) => [...prev, ...data]);
    setShowClassModal(false);
    showToast(`Horarios programados (cupo ${savedCap} del servicio)`);
  };

  const weekDaysMonFri = useMemo(() => {
    const monday = getMondayOfWeek(weekCursor);
    return WEEKDAYS_MON_FRI.map((wd, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      return { ...wd, dateObj: d, iso: toISODate(d) };
    });
  }, [weekCursor]);

  const weekClassesMonFri = useMemo(() => {
    const allowedDates = new Set(weekDaysMonFri.map((d) => d.iso));
    return classes
      .filter((c) => allowedDates.has(c.date))
      .sort((a, b) => a.time.localeCompare(b.time) || a.date.localeCompare(b.date));
  }, [classes, weekDaysMonFri]);

  const studentWeekClasses = useMemo(() => {
    return weekClassesMonFri.filter((c) => {
      if (!studentHasPlan) {
        const srvObj = services.find((s) => s.id === c.category);
        if (srvObj?.isClass) return false;
      }
      return getPillarForCategory(c.category) === pillarFilter;
    });
  }, [weekClassesMonFri, studentHasPlan, services, pillarFilter, getPillarForCategory]);

  const matrixTimes = useMemo(() => {
    const source = role === 'student' ? studentWeekClasses : weekClassesMonFri;
    return [...new Set(source.map((c) => c.time))].sort();
  }, [role, studentWeekClasses, weekClassesMonFri]);

  const activeStudentBookingsList = useMemo(() => {
    if (!activeStudent) return [];
    const classById = new Map(classes.map((c) => [c.id, c]));
    return bookings
      .filter((b) => b.studentId === activeStudent.id && classById.has(b.classId))
      .map((b) => ({ booking: b, cls: classById.get(b.classId) }))
      .sort((a, b) => a.cls.date.localeCompare(b.cls.date) || a.cls.time.localeCompare(b.cls.time));
  }, [activeStudent, bookings, classes]);

  const handleRepeatNextWeek = async () => {
    if (repeatingWeek) return;
    if (weekClassesMonFri.length === 0) return showToast('No hay clases en esta semana para repetir.', 'error');

    setRepeatingWeek(true);
    try {
      const existingSlots = new Set(classes.map((c) => `${c.date}__${c.time}`));
      const itemsToInsert = [];

      for (const cls of weekClassesMonFri) {
        const nextDate = addDaysToISO(cls.date, 7);
        const slotKey = `${nextDate}__${cls.time}`;
        if (existingSlots.has(slotKey)) continue;
        existingSlots.add(slotKey);

        itemsToInsert.push({
          row: {
            title: cls.title,
            category: cls.category,
            instructor: cls.instructor || 'Patricia Aleman',
            date: nextDate,
            time: cls.time,
            duration: Number(cls.duration) || 60,
            capacity: Number(cls.capacity) || getServiceDefaultCapacity(cls.category),
            room: ''
          },
          wasComingSoon: isClassComingSoon(cls)
        });
      }

      if (itemsToInsert.length === 0) return showToast('La semana siguiente ya tiene todos esos horarios cargados.', 'error');

      const { data, error } = await supabase
        .from('classes')
        .insert(itemsToInsert.map((x) => x.row))
        .select();

      if (error) return showToast('No se pudo repetir la secuencia en la semana siguiente', 'error');

      const nextComingSoonIds = [];
      (data || []).forEach((created, idx) => {
        if (itemsToInsert[idx]?.wasComingSoon) nextComingSoonIds.push(created.id);
      });
      if (nextComingSoonIds.length > 0) setClassComingSoonFlag(nextComingSoonIds, true);

      setClasses((prev) => [...prev, ...(data || [])]);
      const nextWeek = new Date(weekCursor);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setWeekCursor(nextWeek);
      setSelectedSequenceIds([]);
      showToast(`Se repitieron ${data?.length || itemsToInsert.length} clases a la semana siguiente`);
    } finally {
      setRepeatingWeek(false);
    }
  };

  const handleToggleCancelClass = async (classId) => {
    const targetClass = classes.find((c) => c.id === classId);
    if (!targetClass) return;

    const nextCancelledState = !targetClass.is_cancelled;
    const nowISO = new Date().toISOString();
    const { error } = await supabase.from('classes').update({ is_cancelled: nextCancelledState }).eq('id', classId);
    if (error) return showToast('Verifica que la columna is_cancelled exista en Supabase', 'error');

    setClasses((prev) => prev.map((c) => (c.id === classId ? { ...c, is_cancelled: nextCancelledState } : c)));

    const nextTs = { ...cancelledTimestamps };
    if (nextCancelledState) nextTs[classId] = nowISO;
    else delete nextTs[classId];
    persistState(setCancelledTimestamps, 'satnam_cancelled_ts_v1', nextTs);

    showToast(nextCancelledState ? `Clase cancelada (${formatTimestamp(nowISO)})` : 'Clase reactivada');
  };

  const handleBulkToggleCancel = async (cancelState) => {
    if (selectedSequenceIds.length === 0) return;
    const nowISO = new Date().toISOString();
    const { error } = await supabase.from('classes').update({ is_cancelled: cancelState }).in('id', selectedSequenceIds);
    if (error) return showToast('Error al actualizar selección', 'error');

    setClasses((prev) => prev.map((c) => (selectedSequenceIds.includes(c.id) ? { ...c, is_cancelled: cancelState } : c)));
    const nextTs = { ...cancelledTimestamps };
    selectedSequenceIds.forEach((id) => (cancelState ? (nextTs[id] = nowISO) : delete nextTs[id]));
    persistState(setCancelledTimestamps, 'satnam_cancelled_ts_v1', nextTs);

    setSelectedSequenceIds([]);
    showToast(cancelState ? 'Clases seleccionadas canceladas' : 'Clases seleccionadas reactivadas');
  };

  const handleBulkUpdateTime = async () => {
    if (!bulkTimeInput || selectedSequenceIds.length === 0) return;
    const { error } = await supabase.from('classes').update({ time: bulkTimeInput }).in('id', selectedSequenceIds);
    if (error) return showToast('No se pudo actualizar la hora en lote', 'error');

    setClasses((prev) => prev.map((c) => (selectedSequenceIds.includes(c.id) ? { ...c, time: bulkTimeInput } : c)));
    setSelectedSequenceIds([]);
    setBulkTimeInput('');
    showToast(`Horario actualizado a ${bulkTimeInput} hs en la selección`);
  };

  const handleBulkDeleteClasses = async () => {
    if (selectedSequenceIds.length === 0) return;
    const { error } = await supabase.from('classes').delete().in('id', selectedSequenceIds);
    if (error) return showToast('No se pudieron eliminar las clases seleccionadas', 'error');

    const idsSet = new Set(selectedSequenceIds);
    setClasses((prev) => prev.filter((c) => !idsSet.has(c.id)));
    setBookings((prev) => prev.filter((b) => !idsSet.has(b.classId)));
    setSelectedSequenceIds([]);
    showToast('Secuencia seleccionada eliminada');
  };

  const handleOpenNewStudent = () => {
    const defaultPlan = plans.find((p) => !p.isNone && !p.comingSoon)?.name || plans[0]?.name || '';
    setEditingStudentId(null);
    setStudentForm({
      name: '',
      phone: '',
      plan: defaultPlan,
      startDate: todayISO,
      expiryDate: addDaysToISO(todayISO, 30),
      credits: getDefaultCreditsForPlan(defaultPlan),
      absenceReason: 'none'
    });
    setShowStudentModal(true);
  };

  const handleOpenEditStudent = (st) => {
    setEditingStudentId(st.id);
    setStudentForm({
      name: st.name,
      phone: st.phone,
      plan: st.plan,
      startDate: getStudentStartDate(st),
      expiryDate: st.expiryDate,
      credits: st.credits,
      absenceReason: planMetaMap[st.id]?.absenceReason || (isPlanPaused(st) ? 'vacation_pause' : 'none')
    });
    setShowStudentModal(true);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    const cleanName = studentForm.name.trim();
    const cleanPhone = studentForm.phone.trim();
    const reason = studentForm.absenceReason || 'none';
    const pausedByReason = reason === 'vacation_pause' || reason === 'not_renewed';
    const nextStatus = pausedByReason ? 'paused' : 'active';

    if (editingStudentId) {
      const nextCredits = isUnlimitedPlan(studentForm.plan) ? 99 : Number(studentForm.credits);
      const { error } = await supabase
        .from('students')
        .update({ name: cleanName, phone: cleanPhone, plan: studentForm.plan, status: nextStatus, credits: nextCredits })
        .eq('id', editingStudentId);

      if (error) return showToast('Error al actualizar el alumno', 'error');

      setStudents((prev) =>
        prev.map((s) =>
          s.id === editingStudentId ? { ...s, name: cleanName, phone: cleanPhone, plan: studentForm.plan, status: nextStatus, credits: nextCredits } : s
        )
      );
      persistState(setPlanMetaMap, 'satnam_plan_meta_v2', {
        ...planMetaMap,
        [editingStudentId]: { ...(planMetaMap[editingStudentId] || {}), isPaused: pausedByReason, absenceReason: reason }
      });
      setShowStudentModal(false);
      setEditingStudentId(null);
      showToast('Datos del alumno actualizados');
      return;
    }

    const { data, error } = await supabase
      .from('students')
      .insert([{ name: cleanName, phone: cleanPhone, plan: studentForm.plan, status: nextStatus, expiry_date: studentForm.expiryDate, credits: getDefaultCreditsForPlan(studentForm.plan) }])
      .select()
      .single();

    if (error) return showToast('Error al registrar', 'error');

    const created = mapStudentRow(data);
    persistState(setPlanMetaMap, 'satnam_plan_meta_v2', {
      ...planMetaMap,
      [created.id]: { startDate: studentForm.startDate, isPaused: pausedByReason, absenceReason: reason
