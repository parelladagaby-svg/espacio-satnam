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
  LogIn
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
  // 'info' es la pestaña de bienvenida a la izquierda (homepage); 'agenda' es la agenda del alumno
  const [studentSection, setStudentSection] = useState('info');
  const [hasEnteredAgenda, setHasEnteredAgenda] = useState(false);

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
  const [activeStudentId, setActiveStudentId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => toISODate(new Date()));
  // Solo servicios/pilares reales (sin opción "Todas")
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
  const activeStudentIdRef = useRef(activeStudentId);
  activeStudentIdRef.current = activeStudentId;

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

      const loadedStudents = studentsRes.data.map((s) => ({
        id: s.id,
        name: s.name,
        phone: s.phone || '',
        plan: s.plan,
        status: s.status,
        expiryDate: s.expiry_date,
        credits: s.credits
      }));

      setStudents(loadedStudents);
      if (loadedStudents.length > 0 && !activeStudentIdRef.current) {
        setActiveStudentId(loadedStudents[0].id);
      }

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

  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];
  const studentAllowed = canStudentOperate(activeStudent);
  const studentHasPlan = hasActiveSubscriptionPlan(activeStudent);

  const handleEnterAgendaFromHome = () => {
    if (!activeStudent) {
      return showToast('Seleccioná o registrá un alumno primero', 'error');
    }
    setHasEnteredAgenda(true);
    setStudentSection('agenda');
    showToast(`Bienvenida/o, ${activeStudent.name}`);
  };

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
    if (!activeStudent) return showToast('Selecciona un perfil primero', 'error');
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
    if (!activeStudent) return showToast('Primero solicita tu alta en el espacio', 'error');
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

  // Grilla semanal del alumno filtrada únicamente por servicio/pilar activo (sin "Todas")
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

    const created = {
      id: data.id,
      name: data.name,
      phone: data.phone || '',
      plan: data.plan,
      status: data.status,
      expiryDate: data.expiry_date,
      credits: data.credits
    };

    persistState(setPlanMetaMap, 'satnam_plan_meta_v2', {
      ...planMetaMap,
      [created.id]: { startDate: studentForm.startDate, isPaused: pausedByReason, absenceReason: reason }
    });
    setStudents((prev) => [...prev, created]);
    if (!activeStudentId) setActiveStudentId(created.id);
    setShowStudentModal(false);
    showToast('Registrado con éxito');
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteConfirm) return;
    const { type, id } = pendingDeleteConfirm;
    setPendingDeleteConfirm(null);

    if (type === 'class') {
      const { error } = await supabase.from('classes').delete().eq('id', id);
      if (error) return showToast('No se pudo eliminar la clase', 'error');

      setClasses((prev) => prev.filter((c) => c.id !== id));
      setBookings((prev) => prev.filter((b) => b.classId !== id));
      const nextTs = { ...cancelledTimestamps };
      delete nextTs[id];
      persistState(setCancelledTimestamps, 'satnam_cancelled_ts_v1', nextTs);
      setClassComingSoonFlag([id], false);
      showToast('Clase eliminada');
    } else if (type === 'student') {
      await supabase.from('bookings').delete().eq('student_id', id);
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) return showToast('No se pudo eliminar el alumno', 'error');

      const remaining = students.filter((s) => s.id !== id);
      setStudents(remaining);
      setBookings((prev) => prev.filter((b) => b.studentId !== id));
      const nextMeta = { ...planMetaMap };
      delete nextMeta[id];
      persistState(setPlanMetaMap, 'satnam_plan_meta_v2', nextMeta);
      if (activeStudentId === id) setActiveStudentId(remaining[0]?.id || '');
      showToast('Alumno eliminado del registro');
    } else if (type === 'service') {
      persistState(setServices, 'satnam_services_v3', services.filter((s) => s.id !== id));
      if (editingServiceId === id) {
        setEditingServiceId(null);
        setServiceForm(EMPTY_SERVICE_FORM);
      }
      if (attendanceServiceFilter === id) setAttendanceServiceFilter('ALL');
      showToast('Servicio eliminado');
    } else if (type === 'estetica_history') {
      persistState(setEsteticaHistoryList, 'satnam_estetica_history_v1', esteticaHistoryList.filter((item) => item.id !== id));
      showToast('Registro histórico eliminado');
    }
  };

  const handleTogglePausePlan = async (student) => {
    const nextPaused = !isPlanPaused(student);
    const nextStatus = nextPaused ? 'paused' : 'active';
    const { error } = await supabase.from('students').update({ status: nextStatus }).eq('id', student.id);
    if (error) return showToast('No se pudo actualizar el estado del plan', 'error');

    setStudents((prev) => prev.map((s) => (s.id === student.id ? { ...s, status: nextStatus } : s)));
    persistState(setPlanMetaMap, 'satnam_plan_meta_v2', {
      ...planMetaMap,
      [student.id]: {
        ...(planMetaMap[student.id] || { startDate: getStudentStartDate(student) }),
        isPaused: nextPaused,
        absenceReason: nextPaused ? 'vacation_pause' : 'none'
      }
    });
    showToast(nextPaused ? `Plan de ${student.name} pausado` : `Plan de ${student.name} reactivado`);
  };

  const handleOpenRenewOrDates = (student) => {
    setRenewDatesStudentId(student.id);
    setRenewDatesForm({
      startDate: getStudentStartDate(student) || todayISO,
      expiryDate: student.expiryDate || addDaysToISO(todayISO, 30),
      resetCredits: true
    });
    setShowRenewDatesModal(true);
  };

  const handleSaveRenewAndDates = async (e) => {
    e.preventDefault();
    if (!renewDatesStudentId) return;
    const ok = await applyStudentPlanDates(renewDatesStudentId, renewDatesForm);
    if (!ok) return showToast('No se pudieron guardar los cambios del plan', 'error');

    setShowRenewDatesModal(false);
    setRenewDatesStudentId(null);
    showToast('Plan renovado y fechas actualizadas');
  };

  const handleSavePlanDefinition = (e) => {
    e.preventDefault();
    const cleanName = planForm.name.trim();
    if (!cleanName) return;

    const cleanPrice = planForm.comingSoon ? 0 : Math.max(0, Number(planForm.price) || 0);
    const nextEntry = {
      name: cleanName,
      price: cleanPrice,
      comingSoon: Boolean(planForm.comingSoon),
      isUnlimited: Boolean(planForm.isUnlimited),
      credits: planForm.isUnlimited ? 99 : Number(planForm.credits) || 1
    };

    if (editingPlanId) {
      const prevPlan = plans.find((p) => p.id === editingPlanId);
      persistState(setPlans, 'satnam_plans_v2', plans.map((p) => (p.id === editingPlanId ? { ...p, ...nextEntry } : p)));
      if (prevPlan && prevPlan.name !== cleanName) {
        setStudents((prev) => prev.map((s) => (s.plan === prevPlan.name ? { ...s, plan: cleanName } : s)));
      }
      setEditingPlanId(null);
      setPlanForm(EMPTY_PLAN_FORM);
      showToast('Plan actualizado');
      return;
    }

    persistState(setPlans, 'satnam_plans_v2', [...plans, { id: `plan_${Date.now()}`, ...nextEntry, isNone: false }]);
    setPlanForm(EMPTY_PLAN_FORM);
    showToast('Nuevo plan creado y publicado');
  };

  const getWhatsAppReminderUrl = (student) => {
    const cleanPhone = student.phone.replace(/\D/g, '');
    const msg = `¡Hola ${student.name}! Te saludamos desde *Espacio Sat-Nam* 🪷. Te recordamos que tu plan (*${student.plan}*) vence el día *${formatDateDDMMYYYY(student.expiryDate)}*. Avísanos por aquí si deseas renovarlo para mantener tu lugar. ¡Sat Nam! ✨`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  const getStatusBadge = (student) => {
    const reasonLabel = getAbsenceLabel(student);
    if (reasonLabel) return <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800">{reasonLabel}</span>;
    if (!hasActiveSubscriptionPlan(student)) return <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#EDF3EE] text-[#4C6352]">Sin Plan (Sesiones)</span>;
    if (isPlanPaused(student)) return <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-stone-200 text-stone-700">Pausado / Cancelado</span>;
    if (isPlanExpired(student)) return <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-rose-100/80 text-rose-800">Vencido</span>;

    const diff = diffDaysISO(student.expiryDate, todayISO);
    if (diff <= 5) return <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-amber-100/80 text-amber-800">Vence pronto ({diff}d)</span>;
    return <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#EDF3EE] text-[#4C6352]">Al día</span>;
  };

  const getCategoryBadge = (category) => {
    const srvObj = services.find((s) => s.id === category);
    const label = (srvObj ? srvObj.label : category).toUpperCase();
    const cls = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EDF3EE] text-[#4C6352]';

    const icons = {
      Spinning: Bike,
      Pilates: Flame,
      Circuito: Flame,
      CircuitoSatNam: Flame,
      Coaching: Compass,
      Constelaciones: Orbit,
      Estetica: Flower2,
      Bienestar: Flower2,
      Eventos: Sparkles
    };
    const IconComp = icons[category] || Heart;
    return (
      <span className={cls}>
        <IconComp className="w-3 h-3" /> {label}
      </span>
    );
  };

  const dayClassesAdmin = useMemo(
    () => classes.filter((c) => c.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time)),
    [classes, selectedDate]
  );

  const attendanceDayClasses = useMemo(
    () => dayClassesAdmin.filter((c) => attendanceServiceFilter === 'ALL' || c.category === attendanceServiceFilter),
    [dayClassesAdmin, attendanceServiceFilter]
  );

  const filteredStudents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => s.name.toLowerCase().includes(q) || s.plan.toLowerCase().includes(q));
  }, [students, searchTerm]);

  const activePaymentStudents = useMemo(
    () => students.filter((s) => hasActiveSubscriptionPlan(s) && !isPlanPaused(s) && !isPlanExpired(s)),
    [students, hasActiveSubscriptionPlan, isPlanPaused, isPlanExpired]
  );

  const renewPaymentStudents = useMemo(
    () => students.filter((s) => hasActiveSubscriptionPlan(s) && !isPlanPaused(s) && (isPlanExpired(s) || isPlanExpiringSoon(s))),
    [students, hasActiveSubscriptionPlan, isPlanPaused, isPlanExpired, isPlanExpiringSoon]
  );

  const availableDayClasses = useMemo(() => dayClassesAdmin.filter((c) => !c.is_cancelled), [dayClassesAdmin]);
  const dayClassIds = useMemo(() => new Set(dayClassesAdmin.map((c) => c.id)), [dayClassesAdmin]);
  const dayBookings = useMemo(() => bookings.filter((b) => dayClassIds.has(b.classId)), [bookings, dayClassIds]);

  const monthStatsBySlot = useMemo(() => {
    const map = classes
      .filter((c) => String(c.date || '').startsWith(dashboardMonth))
      .reduce((acc, cls) => {
        const key = `${cls.title}__${cls.time}`;
        if (!acc[key]) acc[key] = { key, title: cls.title, time: cls.time, totalBookings: 0, attended: 0, noShow: 0 };
        const clsBookings = bookings.filter((b) => b.classId === cls.id);
        acc[key].totalBookings += clsBookings.length;
        acc[key].attended += clsBookings.filter((b) => b.attendanceStatus === 'attended' || (b.attendanceStatus !== 'no_show' && b.attended)).length;
        acc[key].noShow += clsBookings.filter((b) => b.attendanceStatus === 'no_show').length;
        return acc;
      }, {});
    return Object.values(map).sort((a, b) => a.time.localeCompare(b.time) || a.title.localeCompare(b.title));
  }, [classes, bookings, dashboardMonth]);

  const esteticaClientSummaries = useMemo(() => {
    const estClasses = classes
      .filter((c) => c.category === 'Estetica' || getPillarForCategory(c.category) === 'estetica')
      .sort((a, b) => b.date.localeCompare(a.date));
    const estClassById = new Map(estClasses.map((c) => [c.id, c]));

    return students
      .map((st) => {
        const bookedItems = bookings
          .filter((b) => b.studentId === st.id && estClassById.has(b.classId))
          .map((b) => {
            const c = estClassById.get(b.classId);
            return { id: `bk_${b.id}`, date: c.date, title: c.title, notes: '', isManual: false };
          });

        const manualRecords = esteticaHistoryList
          .filter((rec) => rec.studentId === st.id)
          .map((rec) => ({ ...rec, isManual: true }));

        const combined = [...bookedItems, ...manualRecords].sort((a, b) => b.date.localeCompare(a.date));
        const lastEntry = combined[0];
        const reminderWeeks = Number(esteticaWeeksMap[st.id]) || 3;
        const suggestedDate = lastEntry ? addDaysToISO(lastEntry.date, reminderWeeks * 7) : addDaysToISO(todayISO, reminderWeeks * 7);

        return {
          student: st,
          lastDate: lastEntry?.date || null,
          lastTitle: lastEntry?.title || 'Sin sesión previa',
          lastNotes: lastEntry?.notes || '',
          reminderWeeks,
          suggestedDate,
          totalSessions: combined.length,
          manualRecords
        };
      })
      .filter((item) => item.totalSessions > 0 || !hasActiveSubscriptionPlan(item.student));
  }, [students, classes, bookings, esteticaHistoryList, esteticaWeeksMap, getPillarForCategory, hasActiveSubscriptionPlan, todayISO]);

  const publishedPlansForStudents = useMemo(() => plans.filter((p) => !p.isNone), [plans]);

  const renderAttendanceBoard = (dayList) => (
    <div className="space-y-4">
      <h3 className="font-semibold text-base">
        Planilla del día: <span className="text-[#5C7362]">{formatDateDDMMYYYY(selectedDate)}</span>
      </h3>

      {dayList.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-stone-200/70 text-stone-500 text-sm">
          No hay clases para tomar asistencia en esta fecha o filtro.
        </div>
      ) : (
        dayList.map((cls) => {
          const classBookings = bookings.filter((b) => b.classId === cls.id);
          const pendingCount = classBookings.filter((b) => !b.attendanceStatus && !b.attended).length;

          return (
            <div key={cls.id} className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {getCategoryBadge(cls.category)}
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-lg bg-[#EDF3EE] text-[#4C6352]">{cls.time} hs</span>
                    {isClassComingSoon(cls) && <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-lg">PRÓXIMAMENTE</span>}
                    {cls.is_cancelled && <span className="text-xs font-semibold px-2 py-0.5 bg-rose-100 text-rose-700 rounded-lg">CANCELADA</span>}
                  </div>
                  <h4 className="font-semibold text-base">{cls.title}</h4>
                </div>
                <span className="text-xs text-stone-500">
                  Inscritos: <strong>{classBookings.length}</strong> • Pendientes: <strong>{pendingCount}</strong>
                </span>
              </div>

              {classBookings.length === 0 ? (
                <p className="text-xs text-stone-400 italic">No hay alumnos registrados en esta clase.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {classBookings.map((booking) => {
                    const st = students.find((s) => s.id === booking.studentId);
                    if (!st) return null;
                    const isNoShow = booking.attendanceStatus === 'no_show';
                    const isAttended = booking.attendanceStatus === 'attended' || (!isNoShow && booking.attended);

                    return (
                      <div
                        key={booking.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-2 transition-all ${
                          isAttended
                            ? 'bg-[#EDF3EE] text-[#4C6352] border-[#5C7362]/30'
                            : isNoShow
                            ? 'bg-rose-50/70 text-rose-900 border-rose-200'
                            : 'bg-[#F7F5F0] border-stone-200/80'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold">
                            {st.name}: <span className="text-[#5C7362]">{getStudentQuotaDisplay(st)}</span>
                          </p>
                          <p className="text-[11px] text-stone-500">{st.plan}</p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleRequestAttendanceChange(booking, 'attended', st.name)}
                            className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-xl transition-all ${
                              isAttended ? 'bg-[#5C7362] text-white' : 'bg-white text-stone-600 border border-stone-200 hover:bg-[#EDF3EE]'
                            }`}
                          >
                            <UserCheck className="w-3.5 h-3.5" /> Asistió
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRequestAttendanceChange(booking, 'no_show', st.name)}
                            className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-xl transition-all ${
                              isNoShow ? 'bg-rose-600 text-white' : 'bg-white text-stone-600 border border-stone-200 hover:bg-rose-50'
                            }`}
                          >
                            <UserX className="w-3.5 h-3.5" /> No asistió
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );

  const adminNavItems = [
    { id: 'schedule', label: 'Calendario & Clases', shortLabel: 'Agenda', Icon: Calendar },
    { id: 'attendance', label: 'Asistencia', shortLabel: 'Asistencia', Icon: ClipboardCheck },
    { id: 'dashboard', label: 'Dashboard', shortLabel: 'Dashboard', Icon: BarChart3 },
    { id: 'estetica', label: 'Estética', shortLabel: 'Estética', Icon: Flower2 },
    { id: 'students', label: 'Alumnos', shortLabel: 'Alumnos', Icon: Users },
    { id: 'payments', label: 'Pagos & Comunicaciones', shortLabel: 'Pagos', Icon: CreditCard }
  ];

  const paymentStudentsList = openPaymentsPanel === 'active' ? activePaymentStudents : renewPaymentStudents;
  const allWeekIds = weekClassesMonFri.map((c) => c.id);
  const allWeekSelected = allWeekIds.length > 0 && allWeekIds.every((id) => selectedSequenceIds.includes(id));

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#2D332F] font-sans pb-24 md:pb-14 flex flex-col">
      {notification && (
        <div
          className={`fixed bottom-20 md:bottom-12 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium ${
            notification.type === 'error' ? 'bg-rose-700 text-white' : 'bg-[#2D332F] text-white'
          }`}
        >
          <Check className="w-4 h-4" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Encabezado */}
      <header className="bg-white/90 backdrop-blur-md border-b border-[#E5E0D8] sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <SatNamLogo />
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="font-semibold text-lg tracking-tight leading-none">
                  Espacio <span className="text-[#5C7362]">Sat-Nam</span>
                </h1>
                <span className="text-[11px] italic text-stone-500">by Patricia Aleman</span>
              </div>
              <p className="text-xs text-[#737D76] mt-0.5">
                Bienestar Integral • Movimiento, Coaching, Constelaciones & Estética
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchAllData}
              title="Actualizar datos"
              className="p-2 rounded-xl text-stone-500 hover:bg-black/[0.04] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <div className="flex items-center bg-black/[0.04] p-1 rounded-xl border border-black/[0.05]">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  role === 'student' ? 'bg-[#5C7362] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Vista Alumno
              </button>
              <button
                type="button"
                onClick={handleSelectAdminMode}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                  role === 'admin' ? 'bg-[#5C7362] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {isAdminUnlocked ? <ShieldCheck className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                Modo Estudio
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6 flex-1 w-full">
        {loading && students.length === 0 && classes.length === 0 ? (
          <div className="text-center py-16 text-stone-500">Conectando con la agenda de Espacio Sat-Nam...</div>
        ) : role === 'student' ? (
          /* ================= VISTA ALUMNO ================= */
          <div className="space-y-6">
            {/* Pestañas a la izquierda: Información (homepage) primero, luego Agenda */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-stone-200/80 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setStudentSection('info')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    studentSection === 'info' ? 'bg-[#5C7362] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Info className="w-4 h-4" /> Información
                </button>
                <button
                  type="button"
                  onClick={() => setStudentSection('agenda')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    studentSection === 'agenda' ? 'bg-[#5C7362] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Calendar className="w-4 h-4" /> Agenda & Reservas
                </button>
              </div>

              {hasEnteredAgenda && activeStudent && studentSection === 'agenda' && (
                <div className="flex flex-wrap items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-stone-200/80 text-xs">
                  <span className="text-stone-400">Perfil:</span>
                  <select
                    value={activeStudentId}
                    onChange={(e) => {
                      const nextId = e.target.value;
                      setActiveStudentId(nextId);
                      setSelectedStudentClassIds([]);
                      const chosen = students.find((x) => x.id === nextId);
                      if (chosen && isDateBlockedForStudent(chosen, selectedDate)) setSelectedDate(todayISO);
                    }}
                    className="font-semibold bg-[#F7F5F0] border border-stone-200 rounded-lg px-2 py-0.5 focus:outline-none focus:border-[#5C7362]"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <span className="text-[#4C6352] font-medium">
                    {studentHasPlan && !isUnlimitedPlan(activeStudent.plan)
                      ? `Saldo: ${activeStudent.credits} (${getStudentQuotaDisplay(activeStudent)})`
                      : activeStudent.plan}
                  </span>
                </div>
              )}
            </div>

            {studentSection === 'info' ? (
              /* ================= HOMEPAGE DE BIENVENIDA + INGRESO A LA AGENDA ================= */
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/70 shadow-2xs space-y-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#5C7362]" />
                  <div className="pl-2 space-y-2">
                    <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-[#5C7362] bg-[#EDF3EE] px-2.5 py-0.5 rounded-lg">
                      Bienvenidos al espacio
                    </span>
                    <h2 className="text-2xl font-semibold tracking-tight text-[#2D332F]">
                      Te damos la bienvenida a <span className="text-[#5C7362]">Espacio Sat-Nam</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">
                      Un lugar creado para mejorar tu calidad de vida desde el{' '}
                      <strong className="font-medium text-stone-800">bienestar integral</strong>: Yoga Terapia y
                      Restaurativo, Spinning, Pilates y Circuito, Coaching y PNL para acompañar tus procesos de cambio,
                      Constelaciones, y Estética y Cosmiatría.
                    </p>
                  </div>

                  {/* Acceso / Login a la agenda */}
                  <div className="bg-[#F7F5F0] rounded-2xl p-4 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#5C7362]">Acceso a tu agenda</p>
                      <p className="text-xs text-stone-600">
                        Elegí tu perfil para consultar tus reservas, cancelar turnos o reservar en la grilla semanal.
                      </p>
                    </div>

                    {students.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <select
                          value={activeStudentId}
                          onChange={(e) => {
                            const nextId = e.target.value;
                            setActiveStudentId(nextId);
                            setSelectedStudentClassIds([]);
                          }}
                          className="text-xs sm:text-sm font-semibold bg-white border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#5C7362]"
                        >
                          {students.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={handleEnterAgendaFromHome}
                          className="inline-flex items-center gap-1.5 bg-[#5C7362] hover:bg-[#4B5F50] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl shadow-xs transition-all"
                        >
                          <LogIn className="w-4 h-4" /> Entrar a la agenda
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-stone-500">Aún no hay alumnos registrados.</span>
                    )}
                  </div>
                </div>

                {/* Clases y Servicios */}
                <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold">Clases y Servicios</h3>
                    <span className="text-xs text-stone-500">{services.length} disponibles</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {services.map((srv) => (
                      <div key={srv.id} className="p-3.5 rounded-2xl bg-[#F7F5F0] border border-stone-200/80 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          {getCategoryBadge(srv.id)}
                          <span className="text-[11px] font-medium text-stone-500">
                            {srv.isClass ? 'Clase grupal' : 'Sesión / Tratamiento'}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-[#2D332F]">{srv.label}</p>
                        <p className="text-xs text-stone-500">Cupo hasta {srv.defaultCap} {srv.defaultCap === 1 ? 'persona' : 'personas'}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Planes y Precios */}
                <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold">Planes y Precios</h3>
                    <span className="text-xs text-stone-500">{publishedPlansForStudents.length} opciones</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {publishedPlansForStudents.map((p) => (
                      <div
                        key={p.id}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between gap-2 ${
                          p.comingSoon ? 'bg-amber-50/40 border-amber-200/80 opacity-90' : 'bg-[#F7F5F0] border-stone-200/80'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-semibold text-[#2D332F]">{p.name}</p>
                          <p className="text-[11px] text-stone-500">
                            {p.isUnlimited ? 'Pase Libre' : `${p.credits} ${p.credits === 1 ? 'sesión' : 'clases'}`}
                          </p>
                        </div>
                        {p.comingSoon ? (
                          <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-xl shrink-0">Próximamente</span>
                        ) : (
                          <span className="text-xs font-bold text-[#5C7362] bg-[#EDF3EE] px-2.5 py-1 rounded-xl shrink-0">{formatPriceARS(p.price)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* ================= AGENDA Y RESERVAS DEL ALUMNO ================= */
              <div className="space-y-6">
                {students.length > 0 && (
                  <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/70 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#5C7362]" />
                    <div className="flex items-center gap-3.5 pl-2">
                      <div className="w-11 h-11 rounded-2xl bg-[#EDF3EE] text-[#4C6352] font-semibold flex items-center justify-center text-base">
                        {activeStudent?.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-stone-400 uppercase tracking-wider font-medium">Hola,</span>
                          <select
                            value={activeStudentId}
                            onChange={(e) => {
                              const nextId = e.target.value;
                              setActiveStudentId(nextId);
                              setSelectedStudentClassIds([]);
                              const chosen = students.find((x) => x.id === nextId);
                              if (chosen && isDateBlockedForStudent(chosen, selectedDate)) setSelectedDate(todayISO);
                            }}
                            className="text-sm font-semibold bg-[#F7F5F0] border border-stone-200 rounded-xl px-2.5 py-1 focus:outline-none focus:border-[#5C7362]"
                          >
                            {students.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={handleOpenEditProfile}
                            className="inline-flex items-center gap-1 text-xs font-medium text-[#5C7362] bg-[#EDF3EE] hover:bg-[#dce8de] px-2.5 py-1 rounded-xl transition-colors"
                          >
                            <UserCog className="w-3.5 h-3.5" /> Editar perfil
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-xs font-medium bg-[#EDF3EE] text-[#4C6352] px-2.5 py-0.5 rounded-lg">
                            {activeStudent?.plan}
                          </span>
                          {activeStudent && getStatusBadge(activeStudent)}
                          {activeStudent && studentAllowed && studentHasPlan && !isUnlimitedPlan(activeStudent.plan) && (
                            <span className="text-xs text-stone-600">
                              • Saldo: <strong>{activeStudent.credits}</strong> disponibles ({getStudentQuotaDisplay(activeStudent)})
                            </span>
                          )}
                        </div>

                        {activeStudent && !studentAllowed && (
                          <p className="text-xs text-rose-700 font-medium mt-1.5">
                            Tu plan está vencido. No puedes reservar ni cancelar turnos. Comunicate con el espacio para reactivar tu plan.
                          </p>
                        )}
                      </div>
                    </div>

                    {activeStudent && studentHasPlan && (
                      <div className="text-xs text-stone-500 sm:text-right border-t sm:border-t-0 pt-2.5 sm:pt-0 border-stone-100 pl-2 sm:pl-0">
                        Vencimiento:
                        <span className="block font-semibold text-sm">{formatDateDDMMYYYY(activeStudent?.expiryDate)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 1. "Tus reservas" en formato listado */}
                <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/70 shadow-2xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <BookmarkCheck className="w-5 h-5 text-[#5C7362]" />
                      <div>
                        <h2 className="text-lg font-semibold">Tus reservas</h2>
                        <p className="text-xs text-stone-500">Listado de turnos reservados • Podés cancelar cualquiera cuando lo necesites</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold bg-[#EDF3EE] text-[#4C6352] px-3 py-1 rounded-full">
                      {activeStudentBookingsList.length} {activeStudentBookingsList.length === 1 ? 'reserva' : 'reservas'}
                    </span>
                  </div>

                  {activeStudentBookingsList.length === 0 ? (
                    <div className="bg-[#F7F5F0]/70 rounded-2xl p-6 text-center border border-stone-200/70 text-xs sm:text-sm text-stone-500">
                      Todavía no tenés reservas activas. Elegí un servicio y un horario en la <strong>Grilla semanal</strong> de abajo para reservar.
                    </div>
                  ) : (
                    <div className="divide-y divide-stone-100 border border-stone-200/70 rounded-2xl overflow-hidden">
                      {activeStudentBookingsList.map(({ booking, cls }) => (
                        <div
                          key={booking.id}
                          className="p-3.5 sm:px-4 bg-white hover:bg-[#F7F5F0]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                        >
                          <div className="space-y-0.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-[#5C7362] bg-[#EDF3EE] px-2.5 py-0.5 rounded-lg">
                                {formatDateDDMMYYYY(cls.date)} • {cls.time} hs
                              </span>
                              <span className="font-semibold text-sm text-[#2D332F]">{cls.title}</span>
                              {cls.is_cancelled && (
                                <span className="text-[11px] font-semibold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-lg">
                                  Cancelada por el estudio
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-500">
                              {cls.duration} min • Facilitadora: {cls.instructor}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCancelExistingBooking(cls.id)}
                            disabled={!studentAllowed}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/80 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Cancelar reserva
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. "Grilla semanal" invitando a reservar (solo servicios, sin "Todas") */}
                <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/70 shadow-2xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">Grilla semanal</h2>
                      <p className="text-xs sm:text-sm text-stone-500">
                        Elegí un servicio y tocá un horario para reservar, o activá <strong>Reserva secuencial</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const prev = new Date(weekCursor);
                          prev.setDate(prev.getDate() - 7);
                          setWeekCursor(prev);
                        }}
                        className="p-1.5 rounded-xl border border-stone-200 hover:bg-stone-50"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs sm:text-sm font-semibold">
                        {formatDateDDMMYYYY(weekDaysMonFri[0].iso)} al {formatDateDDMMYYYY(weekDaysMonFri[4].iso)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = new Date(weekCursor);
                          next.setDate(next.getDate() + 7);
                          setWeekCursor(next);
                        }}
                        className="p-1.5 rounded-xl border border-stone-200 hover:bg-stone-50"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {SERVICE_PILLARS.map((pil) => (
                        <button
                          type="button"
                          key={pil.id}
                          onClick={() => {
                            setPillarFilter(pil.id);
                            setSelectedStudentClassIds([]);
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                            pillarFilter === pil.id
                              ? 'bg-[#5C7362] text-white border-transparent shadow-xs'
                              : 'bg-[#F7F5F0] text-stone-600 border-stone-200/80 hover:border-stone-300'
                          }`}
                        >
                          {pil.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setBookingSequence((prev) => !prev);
                          setSelectedStudentClassIds([]);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          bookingSequence
                            ? 'bg-[#EDF3EE] text-[#4C6352] border-[#5C7362]/40'
                            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <ListPlus className="w-3.5 h-3.5" />
                        {bookingSequence ? 'Secuencia activa' : 'Reserva secuencial'}
                      </button>

                      {bookingSequence && selectedStudentClassIds.length > 0 && (
                        <button
                          type="button"
                          onClick={handleBookSequential}
                          disabled={!studentAllowed}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#5C7362] hover:bg-[#4B5F50] text-white shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Reservar {selectedStudentClassIds.length} en secuencia
                        </button>
                      )}
                    </div>
                  </div>

                  {matrixTimes.length === 0 ? (
                    <div className="py-8 text-center text-sm text-stone-500 bg-[#F7F5F0]/60 rounded-2xl border border-stone-200/70">
                      No hay horarios cargados en este servicio para esta semana.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-separate border-spacing-2 text-center">
                        <thead>
                          <tr>
                            <th className="bg-[#D5DFD8] text-[#2D332F] text-xs font-bold py-2.5 px-3 rounded-full w-24">HORA</th>
                            {weekDaysMonFri.map((wd) => (
                              <th key={wd.dayId} className="bg-[#D5DFD8] text-[#2D332F] text-xs font-bold py-2.5 px-2 rounded-full">
                                <div>{wd.label}</div>
                                <div className="text-[10px] font-medium text-[#4C6352]">{wd.dateObj.getDate()}/{wd.dateObj.getMonth() + 1}</div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {matrixTimes.map((timeSlot) => (
                            <tr key={timeSlot}>
                              <td className="bg-[#D5DFD8] text-[#2D332F] text-xs font-bold py-3 px-2 rounded-full align-middle">
                                {timeSlot}
                              </td>
                              {weekDaysMonFri.map((wd) => {
                                const cellClasses = studentWeekClasses.filter((c) => c.date === wd.iso && c.time === timeSlot);
                                const isVac = Boolean(getVacationForDate(wd.iso));

                                if (isVac) {
                                  return (
                                    <td key={wd.iso} className="bg-amber-100/70 text-amber-900 text-[11px] font-semibold rounded-full py-2.5 px-2">
                                      Vacaciones
                                    </td>
                                  );
                                }

                                if (cellClasses.length === 0) {
                                  return (
                                    <td key={wd.iso} className="p-0">
                                      <div className="w-full h-11 rounded-full bg-[#DCE4DF]/40 flex items-center justify-center text-stone-300 text-xs">
                                        —
                                      </div>
                                    </td>
                                  );
                                }

                                return (
                                  <td key={wd.iso} className="p-0">
                                    <div className="flex flex-col gap-1">
                                      {cellClasses.map((cls) => {
                                        const classBookings = bookings.filter((b) => b.classId === cls.id);
                                        const isBooked = activeStudent ? classBookings.some((b) => b.studentId === activeStudent.id) : false;
                                        const isFull = classBookings.length >= cls.capacity;
                                        const comingSoon = isClassComingSoon(cls);
                                        const dateBlocked = isDateBlockedForStudent(activeStudent, cls.date);
                                        const inSequence = selectedStudentClassIds.includes(cls.id);
                                        const canBookThis = !cls.is_cancelled && !comingSoon && !isFull && !isBooked && studentAllowed && !dateBlocked;

                                        return (
                                          <button
                                            type="button"
                                            key={cls.id}
                                            onClick={() => {
                                              if (cls.is_cancelled) return showToast('Esta clase se encuentra cancelada.', 'error');
                                              if (comingSoon) return showToast('Próximamente: inscripción aún no habilitada.', 'error');
                                              if (isFull && !isBooked) return handleToggleWaitlist(cls.id);

                                              if (bookingSequence && !isBooked) {
                                                if (!canBookThis) return showToast('No disponible para reservar en este horario.', 'error');
                                                setSelectedStudentClassIds((prev) =>
                                                  prev.includes(cls.id) ? prev.filter((x) => x !== cls.id) : [...prev, cls.id]
                                                );
                                                return;
                                              }

                                              handleToggleBooking(cls.id);
                                            }}
                                            className={`w-full py-2.5 px-2 rounded-full text-xs font-semibold transition-all truncate flex items-center justify-center gap-1 ${
                                              cls.is_cancelled
                                                ? 'bg-rose-100/80 text-rose-700 line-through'
                                                : isBooked
                                                ? 'bg-[#5C7362] text-white shadow-xs'
                                                : inSequence
                                                ? 'bg-[#2D332F] text-white ring-2 ring-[#5C7362]'
                                                : comingSoon
                                                ? 'bg-amber-100 text-amber-900'
                                                : isFull
                                                ? 'bg-amber-50 text-amber-900 border border-amber-200'
                                                : 'bg-[#DCE4DF] hover:bg-[#CAD6CE] text-[#2D332F]'
                                            }`}
                                            title={
                                              isBooked
                                                ? `${cls.title} (Reservado — tocá para cancelar)`
                                                : isFull
                                                ? `${cls.title} (Completa — tocá para lista de espera)`
                                                : `${cls.title} (${cls.time} hs) — Tocá para reservar`
                                            }
                                          >
                                            {isBooked && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                                            <span className="truncate">
                                              {cls.title}
                                              {!isBooked && isFull && !cls.is_cancelled && !comingSoon ? ' • Espera' : ''}
                                            </span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ================= MODO ESTUDIO ================= */
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="hidden md:flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-stone-200/80 w-fit shadow-2xs">
                {adminNavItems.map(({ id, label, Icon }) => (
                  <button
                    type="button"
                    key={id}
                    onClick={() => setAdminTab(id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      adminTab === id ? 'bg-[#5C7362] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsAdminUnlocked(false);
                  setRole('student');
                  showToast('Sesión de estudio bloqueada');
                }}
                className="text-xs font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-stone-200/80"
              >
                <Lock className="w-3.5 h-3.5 text-[#5C7362]" /> Bloquear Modo Estudio
              </button>
            </div>

            {adminTab === 'schedule' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">Grilla Semanal & Secuencia</h2>
                    <p className="text-sm text-stone-500">Tocá una celda para agregar o gestionar; editá la secuencia completa en la tabla</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenNewClassModal({ dayId: 1, time: '08:00' })}
                      className="flex items-center gap-1.5 bg-[#5C7362] hover:bg-[#4B5F50] text-white shadow-xs px-4 py-2 rounded-xl text-xs font-semibold"
                    >
                      <Plus className="w-4 h-4" /> Nuevo Horario
                    </button>

                    <button
                      type="button"
                      onClick={handleRepeatNextWeek}
                      disabled={repeatingWeek || weekClassesMonFri.length === 0}
                      className="flex items-center gap-1.5 bg-[#EDF3EE] hover:bg-[#dce8de] text-[#4C6352] border border-[#5C7362]/30 px-3.5 py-2 rounded-xl text-xs font-semibold disabled:opacity-45"
                    >
                      <CopyPlus className="w-4 h-4" />
                      {repeatingWeek ? 'Repitiendo...' : 'Repetir semana siguiente'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingServiceId(null);
                        setServiceForm(EMPTY_SERVICE_FORM);
                        setShowServiceModal(true);
                      }}
                      className="flex items-center gap-1.5 bg-white hover:bg-stone-50 text-[#5C7362] border border-[#5C7362]/40 px-3.5 py-2 rounded-xl text-xs font-semibold"
                    >
                      <Layers className="w-4 h-4" /> Servicios & Cupos
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setVacationForm({ startDate: selectedDate, endDate: addDaysToISO(selectedDate, 7) });
                        setShowVacationModal(true);
                      }}
                      className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-3.5 py-2 rounded-xl text-xs font-semibold"
                    >
                      <Palmtree className="w-4 h-4" /> Licencia
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/70 shadow-2xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const prev = new Date(weekCursor);
                          prev.setDate(prev.getDate() - 7);
                          setWeekCursor(prev);
                        }}
                        className="p-1.5 rounded-xl border border-stone-200 hover:bg-stone-50"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="font-semibold text-sm sm:text-base">
                        Semana del {formatDateDDMMYYYY(weekDaysMonFri[0].iso)} al {formatDateDDMMYYYY(weekDaysMonFri[4].iso)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = new Date(weekCursor);
                          next.setDate(next.getDate() + 7);
                          setWeekCursor(next);
                        }}
                        className="p-1.5 rounded-xl border border-stone-200 hover:bg-stone-50"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setWeekCursor(getMondayOfWeek(new Date()));
                          setSelectedDate(todayISO);
                        }}
                        className="text-xs font-medium text-[#5C7362] bg-[#EDF3EE] px-2.5 py-1 rounded-lg"
                      >
                        Hoy
                      </button>
                    </div>
                  </div>

                  {matrixTimes.length === 0 ? (
                    <div className="py-8 text-center text-sm text-stone-500 bg-[#F7F5F0]/60 rounded-2xl border border-stone-200/70">
                      No hay horarios cargados en esta semana. Usá <strong>Nuevo Horario</strong> para empezar.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-separate border-spacing-2 text-center">
                        <thead>
                          <tr>
                            <th className="bg-[#D5DFD8] text-[#2D332F] text-xs font-bold py-2.5 px-3 rounded-full w-24">HORA</th>
                            {weekDaysMonFri.map((wd) => (
                              <th key={wd.dayId} className="bg-[#D5DFD8] text-[#2D332F] text-xs font-bold py-2.5 px-2 rounded-full">
                                <div>{wd.label}</div>
                                <div className="text-[10px] font-medium text-[#4C6352]">{wd.dateObj.getDate()}/{wd.dateObj.getMonth() + 1}</div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {matrixTimes.map((timeSlot) => (
                            <tr key={timeSlot}>
                              <td className="bg-[#D5DFD8] text-[#2D332F] text-xs font-bold py-3 px-2 rounded-full align-middle">
                                {timeSlot}
                              </td>
                              {weekDaysMonFri.map((wd) => {
                                const cellClasses = weekClassesMonFri.filter((c) => c.date === wd.iso && c.time === timeSlot);
                                const isVac = Boolean(getVacationForDate(wd.iso));

                                if (isVac) {
                                  return (
                                    <td key={wd.iso} className="bg-amber-100/70 text-amber-900 text-[11px] font-semibold rounded-full py-2.5 px-2">
                                      Vacaciones
                                    </td>
                                  );
                                }

                                if (cellClasses.length === 0) {
                                  return (
                                    <td key={wd.iso} className="p-0">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedDate(wd.iso);
                                          handleOpenNewClassModal({ dayId: wd.dayId, time: timeSlot });
                                        }}
                                        title={`Agregar clase el ${wd.short} a las ${timeSlot}`}
                                        className="w-full h-11 rounded-full bg-[#DCE4DF]/65 hover:bg-[#DCE4DF] text-stone-400 hover:text-[#5C7362] text-xs transition-colors flex items-center justify-center"
                                      >
                                        +
                                      </button>
                                    </td>
                                  );
                                }

                                return (
                                  <td key={wd.iso} className="p-0">
                                    <div className="flex flex-col gap-1">
                                      {cellClasses.map((cls) => (
                                        <button
                                          type="button"
                                          key={cls.id}
                                          onClick={() => {
                                            setSelectedDate(cls.date);
                                            handleOpenEditClass(cls);
                                          }}
                                          className={`w-full py-2.5 px-2 rounded-full text-xs font-semibold transition-all truncate ${
                                            cls.is_cancelled
                                              ? 'bg-rose-100 text-rose-700 line-through'
                                              : isClassComingSoon(cls)
                                              ? 'bg-amber-100 text-amber-900'
                                              : 'bg-[#DCE4DF] hover:bg-[#CAD6CE] text-[#2D332F]'
                                          }`}
                                          title={`${cls.title} (${cls.time} hs) — Tocá para editar`}
                                        >
                                          {cls.title}
                                        </button>
                                      ))}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Tabla de secuencia semanal con edición en lote */}
                <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/70 shadow-2xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-base">Secuencia Semanal ({weekClassesMonFri.length} registros)</h3>
                      <p className="text-xs text-stone-500">Seleccioná filas para cambiar hora, cancelar/abrir o eliminar sin ir uno por uno</p>
                    </div>

                    {selectedSequenceIds.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 bg-[#F7F5F0] px-3 py-2 rounded-2xl border border-stone-200">
                        <span className="text-xs font-semibold text-[#5C7362]">{selectedSequenceIds.length} seleccionados</span>
                        <input
                          type="time"
                          value={bulkTimeInput}
                          onChange={(e) => setBulkTimeInput(e.target.value)}
                          className="border border-stone-200 rounded-lg px-2 py-1 text-xs bg-white"
                        />
                        <button
                          type="button"
                          onClick={handleBulkUpdateTime}
                          disabled={!bulkTimeInput}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#5C7362] text-white disabled:opacity-40"
                        >
                          Cambiar hora
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBulkToggleCancel(true)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800"
                        >
                          Cancelar lote
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBulkToggleCancel(false)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800"
                        >
                          Reactivar
                        </button>
                        <button
                          type="button"
                          onClick={handleBulkDeleteClasses}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-100 text-rose-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>

                  {weekClassesMonFri.length === 0 ? (
                    <p className="text-xs text-stone-400 italic py-3">Sin registros en la semana actual.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-[#F7F5F0] text-xs uppercase tracking-wider text-stone-500">
                            <th className="py-2.5 px-3 w-10">
                              <input
                                type="checkbox"
                                checked={allWeekSelected}
                                onChange={(e) => setSelectedSequenceIds(e.target.checked ? allWeekIds : [])}
                                className="rounded accent-[#5C7362]"
                              />
                            </th>
                            <th className="py-2.5 px-3 font-medium">Fecha</th>
                            <th className="py-2.5 px-3 font-medium">Hora</th>
                            <th className="py-2.5 px-3 font-medium">Actividad</th>
                            <th className="py-2.5 px-3 font-medium">Cupo</th>
                            <th className="py-2.5 px-3 font-medium">Estado</th>
                            <th className="py-2.5 px-3 font-medium text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 text-xs">
                          {weekClassesMonFri.map((cls) => {
                            const checked = selectedSequenceIds.includes(cls.id);
                            const bookedCount = bookings.filter((b) => b.classId === cls.id).length;
                            const cancelledAt = cls.cancelled_at || cancelledTimestamps[cls.id];

                            return (
                              <tr key={cls.id} className={checked ? 'bg-[#EDF3EE]/60' : 'hover:bg-stone-50/60'}>
                                <td className="py-2.5 px-3">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() =>
                                      setSelectedSequenceIds((prev) =>
                                        prev.includes(cls.id) ? prev.filter((x) => x !== cls.id) : [...prev, cls.id]
                                      )
                                    }
                                    className="rounded accent-[#5C7362]"
                                  />
                                </td>
                                <td className="py-2.5 px-3 font-medium">{formatDateDDMMYYYY(cls.date)}</td>
                                <td className="py-2.5 px-3 font-semibold">{cls.time} hs</td>
                                <td className="py-2.5 px-3 font-semibold text-[#2D332F]">{cls.title}</td>
                                <td className="py-2.5 px-3 text-stone-600">{bookedCount}/{cls.capacity}</td>
                                <td className="py-2.5 px-3">
                                  {cls.is_cancelled ? (
                                    <span className="text-rose-700 font-semibold">
                                      Cancelada {cancelledAt ? `(${formatTimestamp(cancelledAt)})` : ''}
                                    </span>
                                  ) : isClassComingSoon(cls) ? (
                                    <span className="text-amber-800 font-semibold">Próximamente</span>
                                  ) : (
                                    <span className="text-[#4C6352] font-semibold">Activa</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  <div className="inline-flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditClass(cls)}
                                      className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100"
                                      title="Editar"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleCancelClass(cls.id)}
                                      className="p-1.5 rounded-lg border border-stone-200 hover:bg-amber-50 text-amber-800"
                                      title={cls.is_cancelled ? 'Abrir clase' : 'Cancelar clase'}
                                    >
                                      <Ban className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPendingDeleteConfirm({
                                          type: 'class',
                                          id: cls.id,
                                          title: `la clase "${cls.title}" (${cls.time} hs del ${formatDateDDMMYYYY(cls.date)})`
                                        })
                                      }
                                      className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600"
                                      title="Eliminar"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {adminTab === 'attendance' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">Asistencia</h2>
                    <p className="text-sm text-stone-500">Marca Asistió o No asistió (marcar No asistió descuenta 1 sesión del abono)</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="text-sm font-medium bg-white px-3 py-2 rounded-xl border border-stone-200/80"
                    />
                    <select
                      value={attendanceServiceFilter}
                      onChange={(e) => setAttendanceServiceFilter(e.target.value)}
                      className="text-sm font-medium bg-white px-3 py-2 rounded-xl border border-stone-200/80"
                    >
                      <option value="ALL">Todos los servicios</option>
                      {services.map((srv) => (
                        <option key={srv.id} value={srv.id}>{srv.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {renderAttendanceBoard(attendanceDayClasses)}
              </div>
            )}

            {adminTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">Dashboard</h2>
                    <p className="text-sm text-stone-500">Toca Clases del Día o Reservas del Día para ver el detalle</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center bg-white p-1 rounded-xl border border-stone-200/80">
                      {[
                        { id: 'day', label: 'Vista Diaria' },
                        { id: 'month', label: 'Visión Mensual' }
                      ].map((opt) => (
                        <button
                          type="button"
                          key={opt.id}
                          onClick={() => setDashboardScope(opt.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                            dashboardScope === opt.id ? 'bg-[#5C7362] text-white' : 'text-stone-600'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    <input
                      type={dashboardScope === 'day' ? 'date' : 'month'}
                      value={dashboardScope === 'day' ? selectedDate : dashboardMonth}
                      onChange={(e) => (dashboardScope === 'day' ? setSelectedDate(e.target.value) : setDashboardMonth(e.target.value))}
                      className="text-sm font-medium bg-white px-3 py-1.5 rounded-xl border border-stone-200/80"
                    />
                  </div>
                </div>

                {dashboardScope === 'day' ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setOpenClassesPanel((prev) => !prev)}
                        className={`text-left bg-white rounded-3xl p-5 border transition-all shadow-2xs ${
                          openClassesPanel ? 'border-[#5C7362] ring-1 ring-[#5C7362]/25' : 'border-stone-200/70 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                            Clases del Día ({formatDateDDMMYYYY(selectedDate)})
                          </span>
                          {openClassesPanel ? <ChevronUp className="w-4 h-4 text-[#5C7362]" /> : <ChevronDown className="w-4 h-4 text-[#5C7362]" />}
                        </div>
                        <p className="text-2xl font-bold text-[#2D332F] mt-1">{availableDayClasses.length} disponibles</p>
                        <p className="text-xs text-[#5C7362] font-medium mt-1">Toca para ver clases, cupos y asistencias</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOpenBookingsPanel((prev) => !prev)}
                        className={`text-left bg-white rounded-3xl p-5 border transition-all shadow-2xs ${
                          openBookingsPanel ? 'border-[#5C7362] ring-1 ring-[#5C7362]/25' : 'border-stone-200/70 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                            Reservas del Día ({formatDateDDMMYYYY(selectedDate)})
                          </span>
                          {openBookingsPanel ? <ChevronUp className="w-4 h-4 text-[#5C7362]" /> : <ChevronDown className="w-4 h-4 text-[#5C7362]" />}
                        </div>
                        <p className="text-2xl font-bold text-[#5C7362] mt-1">{dayBookings.length} reservas</p>
                        <p className="text-xs text-[#5C7362] font-medium mt-1">Toca para ver el listado de reservas del día</p>
                      </button>
                    </div>

                    {openClassesPanel && (
                      <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-2xs space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                          <h3 className="font-semibold text-base">Clases Disponibles del Día ({formatDateDDMMYYYY(selectedDate)})</h3>
                          <span className="text-xs text-stone-500">Toca una clase para ver asistieron y no asistieron</span>
                        </div>

                        {availableDayClasses.length === 0 ? (
                          <p className="text-sm text-stone-500 py-3">No hay clases disponibles en esta fecha.</p>
                        ) : (
                          <div className="space-y-3">
                            {availableDayClasses.map((cls) => {
                              const clsBookings = bookings.filter((b) => b.classId === cls.id);
                              const freeSpots = Math.max(0, cls.capacity - clsBookings.length);
                              const isExpanded = expandedDashboardClassId === cls.id;

                              const attendedList = clsBookings
                                .filter((b) => b.attendanceStatus === 'attended' || (b.attendanceStatus !== 'no_show' && b.attended))
                                .map((b) => students.find((s) => s.id === b.studentId))
                                .filter(Boolean);

                              const noShowList = clsBookings
                                .filter((b) => b.attendanceStatus === 'no_show')
                                .map((b) => students.find((s) => s.id === b.studentId))
                                .filter(Boolean);

                              return (
                                <div key={cls.id} className="rounded-2xl border border-stone-200/80 bg-[#F7F5F0]/50 overflow-hidden">
                                  <button
                                    type="button"
                                    onClick={() => setExpandedDashboardClassId(isExpanded ? null : cls.id)}
                                    className="w-full p-4 text-left flex flex-wrap items-center justify-between gap-2 hover:bg-stone-100/60 transition-colors"
                                  >
                                    <div>
                                      <p className="font-semibold text-sm text-[#2D332F]">{cls.time} hs • {cls.title}</p>
                                      <p className="text-xs text-stone-500 mt-0.5">
                                        Total inscritos: <strong>{clsBookings.length}</strong> / Cupo disponible: <strong>{freeSpots}</strong>
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium text-[#5C7362] bg-[#EDF3EE] px-2.5 py-1 rounded-xl">
                                        {isExpanded ? 'Ocultar asistencia' : 'Ver asistencia'}
                                      </span>
                                      {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
                                    </div>
                                  </button>

                                  {isExpanded && (
                                    <div className="px-4 pb-4 pt-2 border-t border-stone-200/70 bg-white grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div className="p-3 rounded-xl bg-[#EDF3EE]/60 border border-[#5C7362]/20">
                                        <p className="text-xs font-semibold text-[#4C6352] uppercase tracking-wider mb-2">
                                          Asistieron ({attendedList.length})
                                        </p>
                                        {attendedList.length === 0 ? (
                                          <p className="text-xs text-stone-400 italic">Sin registros de asistencia.</p>
                                        ) : (
                                          <ul className="space-y-1 text-xs">
                                            {attendedList.map((st) => (
                                              <li key={st.id} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-stone-200/60">
                                                <span className="font-medium">{st.name}</span>
                                                <span className="font-semibold text-[#5C7362]">{getStudentQuotaDisplay(st)}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                      </div>

                                      <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-200/60">
                                        <p className="text-xs font-semibold text-rose-800 uppercase tracking-wider mb-2">
                                          No Asistieron ({noShowList.length})
                                        </p>
                                        {noShowList.length === 0 ? (
                                          <p className="text-xs text-stone-400 italic">Sin registros de inasistencia.</p>
                                        ) : (
                                          <ul className="space-y-1 text-xs">
                                            {noShowList.map((st) => (
                                              <li key={st.id} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-rose-200/60">
                                                <span className="font-medium">{st.name}</span>
                                                <span className="font-semibold text-rose-700">{getStudentQuotaDisplay(st)}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {openBookingsPanel && (
                      <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                          <h3 className="font-semibold text-base">Listado de Reservas del Día ({formatDateDDMMYYYY(selectedDate)})</h3>
                          <span className="text-xs text-stone-500">{dayBookings.length} total</span>
                        </div>

                        {dayBookings.length === 0 ? (
                          <p className="text-sm text-stone-500 py-3">No hay reservas registradas en esta fecha.</p>
                        ) : (
                          <div className="space-y-2">
                            {dayBookings.map((b) => {
                              const st = students.find((s) => s.id === b.studentId);
                              const cls = classes.find((c) => c.id === b.classId);
                              if (!st || !cls) return null;

                              return (
                                <div key={b.id} className="p-3 rounded-2xl bg-[#F7F5F0]/70 border border-stone-200/70 flex flex-wrap items-center justify-between gap-2 text-sm">
                                  <div>
                                    <span className="font-semibold">{st.name}</span>{' '}
                                    <span className="text-xs font-semibold text-[#5C7362]">({getStudentQuotaDisplay(st)})</span>
                                    <p className="text-xs text-stone-500">{cls.time} hs • {cls.title}</p>
                                  </div>
                                  <span className="text-xs font-medium px-2.5 py-1 rounded-xl bg-white border border-stone-200 text-stone-600">
                                    {b.attendanceStatus === 'no_show' ? 'No asistió' : b.attendanceStatus === 'attended' || b.attended ? 'Asistió' : 'Pendiente'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-2xs space-y-4">
                    <div>
                      <h3 className="font-semibold text-base">Estadísticas Mensuales de Asistencias por Clase y Horario</h3>
                      <p className="text-xs text-stone-500">Período: <strong>{dashboardMonth}</strong></p>
                    </div>

                    {monthStatsBySlot.length === 0 ? (
                      <p className="text-sm text-stone-500 py-4 text-center">No hay estadísticas para el mes seleccionado.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="bg-[#F7F5F0] text-xs uppercase tracking-wider text-stone-500">
                              <th className="py-3 px-3.5 font-medium">Clase</th>
                              <th className="py-3 px-3.5 font-medium">Horario</th>
                              <th className="py-3 px-3.5 font-medium">Reservas</th>
                              <th className="py-3 px-3.5 font-medium">Asistencias</th>
                              <th className="py-3 px-3.5 font-medium">No asistieron</th>
                              <th className="py-3 px-3.5 font-medium">% Asistencia</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                            {monthStatsBySlot.map((row) => {
                              const pct = row.totalBookings > 0 ? Math.round((row.attended / row.totalBookings) * 100) : 0;
                              return (
                                <tr key={row.key} className="hover:bg-stone-50/60">
                                  <td className="py-3 px-3.5 font-semibold">{row.title}</td>
                                  <td className="py-3 px-3.5 text-xs text-stone-600">{row.time} hs</td>
                                  <td className="py-3 px-3.5 text-xs font-medium">{row.totalBookings}</td>
                                  <td className="py-3 px-3.5 text-xs font-semibold text-[#5C7362]">{row.attended}</td>
                                  <td className="py-3 px-3.5 text-xs font-semibold text-rose-700">{row.noShow}</td>
                                  <td className="py-3 px-3.5 text-xs font-bold">{pct}%</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {adminTab === 'estetica' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">Dashboard de Estética & Cosmiatría</h2>
                    <p className="text-sm text-stone-500">Configurá recordatorios y sugerencias de turno cada 3, 4 o 6 semanas</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEsteticaHistoryForm({
                        studentId: students[0]?.id || '',
                        date: addDaysToISO(todayISO, -21),
                        treatment: 'Limpieza Facial Profunda',
                        notes: ''
                      });
                      setShowEsteticaHistoryModal(true);
                    }}
                    className="flex items-center gap-1.5 bg-[#5C7362] hover:bg-[#4B5F50] text-white shadow-xs px-4 py-2 rounded-xl text-xs font-semibold w-fit"
                  >
                    <History className="w-4 h-4" /> Cargar Sesión / Historial
                  </button>
                </div>

                {esteticaClientSummaries.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 text-center border border-stone-200/70 text-sm text-stone-500">
                    Aún no hay sesiones o personas registradas para seguimiento de estética. Usá <strong>Cargar Sesión / Historial</strong> para registrar atenciones previas.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {esteticaClientSummaries.map(({ student, lastDate, lastTitle, lastNotes, reminderWeeks, suggestedDate, manualRecords }) => (
                      <div key={student.id} className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-2xs space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-base">{student.name}</h3>
                            <p className="text-xs text-[#5C7362] font-medium">{student.plan}</p>
                          </div>
                          {getStatusBadge(student)}
                        </div>

                        <div className="bg-[#F7F5F0] rounded-2xl p-3 text-xs space-y-2 text-stone-700">
                          <p className="flex items-center gap-1.5">
                            <Clock3 className="w-3.5 h-3.5 text-[#5C7362]" />
                            Última sesión: <strong>{lastDate ? `${formatDateDDMMYYYY(lastDate)} (${lastTitle})` : 'Sin registro'}</strong>
                          </p>
                          {lastNotes && <p className="text-[11px] text-stone-500 pl-5">Nota: {lastNotes}</p>}

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#5C7362]" />
                              Sugerencia: <strong>{formatDateDDMMYYYY(suggestedDate)}</strong>
                            </span>

                            <div className="flex items-center gap-1">
                              {[3, 4, 6].map((wk) => (
                                <button
                                  type="button"
                                  key={wk}
                                  onClick={() => handleChangeEsteticaInterval(student.id, wk)}
                                  className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold border transition-all ${
                                    reminderWeeks === wk
                                      ? 'bg-[#5C7362] text-white border-[#5C7362]'
                                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                                  }`}
                                >
                                  {wk} sem
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {manualRecords.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-[11px] font-semibold text-stone-400 uppercase">Historial cargado</p>
                            {manualRecords.slice(0, 3).map((rec) => (
                              <div key={rec.id} className="flex items-center justify-between text-[11px] bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200/70">
                                <span>{formatDateDDMMYYYY(rec.date)} • <strong>{rec.title}</strong></span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPendingDeleteConfirm({
                                      type: 'estetica_history',
                                      id: rec.id,
                                      title: `el registro de "${rec.title}" (${formatDateDDMMYYYY(rec.date)})`
                                    })
                                  }
                                  className="text-rose-600 hover:bg-rose-50 p-1 rounded"
                                  title="Borrar registro histórico"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="pt-1">
                          {student.phone ? (
                            <a
                              href={`https://wa.me/${student.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                `¡Hola ${student.name}! Desde Espacio Sat-Nam te recordamos tu última sesión (${lastTitle}) y te sugerimos tu próximo turno (cada ${reminderWeeks} semanas) alrededor del ${formatDateDDMMYYYY(suggestedDate)}. 🪷`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white py-2 px-3 rounded-xl text-xs font-semibold transition-all"
                            >
                              <MessageCircle className="w-3.5 h-3.5" /> Enviar sugerencia por WhatsApp ({reminderWeeks} sem)
                            </a>
                          ) : (
                            <p className="text-xs text-stone-400 italic text-center py-1">Sin teléfono WhatsApp registrado</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {adminTab === 'students' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">Alumnos & Personas</h2>
                    <p className="text-sm text-stone-500">
                      Total registrados: <strong>{students.length}</strong> (incluye alumnos con plan y personas de sesiones/masajes)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenNewStudent}
                    className="flex items-center gap-1.5 bg-[#5C7362] hover:bg-[#4B5F50] text-white shadow-xs px-4 py-2 rounded-xl text-sm font-medium w-fit"
                  >
                    <Plus className="w-4 h-4" /> Nuevo Registro
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o plan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/80 text-sm focus:outline-none focus:border-[#5C7362]"
                  />
                </div>

                <div className="bg-white rounded-3xl border border-stone-200/70 overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F7F5F0] border-b border-stone-200/80 text-xs uppercase tracking-wider text-stone-500">
                          <th className="py-3.5 px-4 font-medium">Nombre</th>
                          <th className="py-3.5 px-4 font-medium">Plan / Acceso</th>
                          <th className="py-3.5 px-4 font-medium">Saldo / Abono</th>
                          <th className="py-3.5 px-4 font-medium">Vigencia</th>
                          <th className="py-3.5 px-4 font-medium">Estado</th>
                          <th className="py-3.5 px-4 font-medium text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 text-sm">
                        {filteredStudents.map((st) => (
                          <tr key={st.id} className="hover:bg-stone-50/50">
                            <td className="py-3.5 px-4">
                              <p className="font-medium">{st.name}</p>
                              <p className="text-xs text-stone-500">{st.phone}</p>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-medium text-[#5C7362]">{st.plan}</span>
                            </td>
                            <td className="py-3.5 px-4 text-xs">
                              {!hasActiveSubscriptionPlan(st) ? (
                                <span className="text-stone-500">Solo sesiones</span>
                              ) : isUnlimitedPlan(st.plan) ? (
                                <span className="bg-[#EDF3EE] text-[#4C6352] px-2.5 py-0.5 rounded-lg font-medium">Pase Libre</span>
                              ) : (
                                <span>{st.credits} disp. ({getStudentQuotaDisplay(st)})</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-xs text-stone-600">
                              {hasActiveSubscriptionPlan(st) ? (
                                <>
                                  <div>Inicio: {formatDateDDMMYYYY(getStudentStartDate(st))}</div>
                                  <div>Vence: {formatDateDDMMYYYY(st.expiryDate)}</div>
                                </>
                              ) : (
                                <span>—</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">{getStatusBadge(st)}</td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditStudent(st)}
                                  title="Editar registro"
                                  className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-lg border border-stone-200 transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPendingDeleteConfirm({ type: 'student', id: st.id, title: `el registro de "${st.name}"` })}
                                  title="Eliminar registro"
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {adminTab === 'payments' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">Pagos & Comunicaciones</h2>
                    <p className="text-sm text-stone-500">Gestioná planes y precios, recordatorios por WhatsApp, renovaciones, fechas y pausas</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPlanId(null);
                      setPlanForm(EMPTY_PLAN_FORM);
                      setShowPlanManagerModal(true);
                    }}
                    className="flex items-center gap-1.5 bg-white hover:bg-stone-50 text-[#5C7362] border border-[#5C7362]/40 px-3.5 py-2 rounded-xl text-xs font-semibold w-fit"
                  >
                    <Plus className="w-4 h-4" /> Crear / Editar Planes
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setOpenPaymentsPanel((prev) => (prev === 'active' ? null : 'active'))}
                    className={`text-left bg-white rounded-3xl p-5 border transition-all shadow-2xs ${
                      openPaymentsPanel === 'active' ? 'border-[#5C7362] ring-1 ring-[#5C7362]/25' : 'border-stone-200/70 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Activos</span>
                      {openPaymentsPanel === 'active' ? <ChevronUp className="w-4 h-4 text-[#5C7362]" /> : <ChevronDown className="w-4 h-4 text-[#5C7362]" />}
                    </div>
                    <p className="text-2xl font-bold text-[#5C7362] mt-1">{activePaymentStudents.length}</p>
                    <p className="text-xs text-[#5C7362] font-medium mt-1">Tocá para ver alumnos activos</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOpenPaymentsPanel((prev) => (prev === 'renew' ? null : 'renew'))}
                    className={`text-left bg-white rounded-3xl p-5 border transition-all shadow-2xs ${
                      openPaymentsPanel === 'renew' ? 'border-[#5C7362] ring-1 ring-[#5C7362]/25' : 'border-stone-200/70 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Por Renovar</span>
                      {openPaymentsPanel === 'renew' ? <ChevronUp className="w-4 h-4 text-[#5C7362]" /> : <ChevronDown className="w-4 h-4 text-[#5C7362]" />}
                    </div>
                    <p className="text-2xl font-bold text-amber-700 mt-1">{renewPaymentStudents.length}</p>
                    <p className="text-xs text-stone-500 mt-1">Tocá para ver vencidos o por vencer (≤ 5d)</p>
                  </button>
                </div>

                {openPaymentsPanel && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-base">
                      {openPaymentsPanel === 'active'
                        ? `Listado de Alumnos Activos (${activePaymentStudents.length})`
                        : `Listado Por Renovar (${renewPaymentStudents.length})`}
                    </h3>

                    {paymentStudentsList.length === 0 ? (
                      <div className="bg-white rounded-3xl p-8 text-center border border-stone-200/70 text-stone-500 text-sm">
                        No hay alumnos en este grupo actualmente.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {paymentStudentsList.map((st) => {
                          const paused = isPlanPaused(st);
                          return (
                            <div key={st.id} className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-2xs flex flex-col justify-between gap-4">
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <h4 className="font-semibold text-base">{st.name}</h4>
                                  <p className="text-xs text-[#5C7362] font-medium mt-0.5">{st.plan}</p>
                                  <p className="text-xs text-stone-500 mt-1">
                                    Inicio: <strong>{formatDateDDMMYYYY(getStudentStartDate(st))}</strong> • Vence:{' '}
                                    <strong>{formatDateDDMMYYYY(st.expiryDate)}</strong>
                                  </p>
                                </div>
                                {getStatusBadge(st)}
                              </div>

                              <div className="space-y-2 pt-3 border-t border-stone-100">
                                <div className="flex items-center gap-2">
                                  <a
                                    href={getWhatsAppReminderUrl(st)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white py-2 px-3 rounded-xl text-xs font-semibold shadow-2xs transition-all"
                                  >
                                    <MessageCircle className="w-4 h-4" /> Recordatorio WhatsApp
                                  </a>

                                  <button
                                    type="button"
                                    onClick={() => handleOpenRenewOrDates(st)}
                                    className="flex items-center justify-center gap-1 bg-[#EDF3EE] hover:bg-[#dce8de] text-[#4C6352] py-2 px-3 rounded-xl text-xs font-semibold transition-all"
                                  >
                                    <CalendarRange className="w-3.5 h-3.5" /> Renovar / Fechas
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleTogglePausePlan(st)}
                                  className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                                    paused ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                  }`}
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  {paused ? 'Reactivar Plan' : 'Pausar / Cancelar Plan'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E5E0D8] py-2 px-4 text-center z-30">
        <p className="text-xs text-stone-600 tracking-wide">
          © {new Date().getFullYear()} <strong className="font-semibold text-stone-800">Espacio Sat-Nam</strong> •{' '}
          <span className="font-medium text-[#5C7362]">by Patricia Aleman</span>. Todos los derechos reservados.
        </p>
      </footer>

      {role === 'admin' && (
        <nav className="md:hidden fixed bottom-8 left-0 right-0 bg-white border-t border-stone-200 flex justify-around py-2 px-1 z-40">
          {adminNavItems.map(({ id, shortLabel, Icon }) => (
            <button
              type="button"
              key={id}
              onClick={() => setAdminTab(id)}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-medium ${
                adminTab === id ? 'text-[#5C7362]' : 'text-stone-400'
              }`}
            >
              <Icon className="w-4 h-4" /> {shortLabel}
            </button>
          ))}
        </nav>
      )}

      {/* ================= MODALES ================= */}
      {pendingDeleteConfirm && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl text-center">
            <h3 className="font-semibold text-lg text-rose-700">Confirmar eliminación</h3>
            <p className="text-sm text-stone-600 mt-2 mb-5">
              ¿Estás seguro de que querés borrar definitivamente <strong>{pendingDeleteConfirm.title}</strong>?
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setPendingDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl text-xs font-medium bg-stone-100 text-stone-700 hover:bg-stone-200">
                Cancelar
              </button>
              <button type="button" onClick={handleConfirmDelete} className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white">
                Sí, borrar
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingAttendanceEdit && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl text-center">
            <h3 className="font-semibold text-lg">Confirmar edición de asistencia</h3>
            <p className="text-sm text-stone-600 mt-2 mb-5">
              ¿Está seguro que desea editar la asistencia de <strong>{pendingAttendanceEdit.studentName}</strong> a{' '}
              <strong>{pendingAttendanceEdit.nextStatus === 'attended' ? 'Asistió' : 'No asistió'}</strong>?
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setPendingAttendanceEdit(null)} className="flex-1 py-2.5 rounded-xl text-xs font-medium bg-stone-100 text-stone-700 hover:bg-stone-200">
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = pendingAttendanceEdit;
                  setPendingAttendanceEdit(null);
                  applyAttendanceStatus(target.bookingId, target.nextStatus);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-[#5C7362] hover:bg-[#4B5F50] text-white"
              >
                Sí, confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {showPinModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 shadow-xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#EDF3EE] text-[#4C6352] flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg">Acceso Modo Estudio</h3>
            <p className="text-xs text-stone-500 mt-1 mb-4">Ingresa el PIN de 4 dígitos para administrar la agenda y los turnos</p>

            <form onSubmit={handleVerifyPin} className="space-y-3">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                autoFocus
                placeholder="••••"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value.replace(/\D/g, ''));
                  setPinError(false);
                }}
                className={`w-full text-center tracking-[0.6em] text-2xl font-bold border rounded-2xl py-2.5 focus:outline-none ${
                  pinError ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-stone-200 focus:border-[#5C7362]'
                }`}
              />
              {pinError && <p className="text-xs text-rose-600 font-medium">PIN incorrecto. Intenta nuevamente.</p>}

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowPinModal(false)} className="flex-1 py-2.5 rounded-xl text-xs font-medium bg-stone-100 text-stone-600 hover:bg-stone-200">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-[#5C7362] hover:bg-[#4B5F50] text-white">
                  Ingresar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditProfileModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Editar Mi Perfil</h3>
              <button type="button" onClick={() => setShowEditProfileModal(false)}>
                <XCircle className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Nombre y Apellido</label>
                <input required type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full border border-stone-200 rounded-xl px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Teléfono WhatsApp</label>
                <input required type="text" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full border border-stone-200 rounded-xl px-3 py-2" />
              </div>
              <button type="submit" className="w-full bg-[#5C7362] hover:bg-[#4B5F50] text-white font-medium py-2.5 rounded-xl mt-2">
                Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      )}

      {showEsteticaHistoryModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-[#5C7362]" /> Cargar Sesión de Estética
              </h3>
              <button type="button" onClick={() => setShowEsteticaHistoryModal(false)}>
                <XCircle className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleSaveEsteticaHistory} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Alumno / Persona</label>
                <select required value={esteticaHistoryForm.studentId} onChange={(e) => setEsteticaHistoryForm({ ...esteticaHistoryForm, studentId: e.target.value })} className="w-full border border-stone-200 rounded-xl px-3 py-2 bg-white">
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Fecha de la Sesión ({formatDateDDMMYYYY(esteticaHistoryForm.date)})
                  </label>
                  <input required type="date" value={esteticaHistoryForm.date} onChange={(e) => setEsteticaHistoryForm({ ...esteticaHistoryForm, date: e.target.value })} className="w-full border border-stone-200 rounded-xl px-3 py-2" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Tratamiento Realizado</label>
                  <input required type="text" placeholder="Ej. Limpieza Facial, Masaje..." value={esteticaHistoryForm.treatment} onChange={(e) => setEsteticaHistoryForm({ ...esteticaHistoryForm, treatment: e.target.value })} className="w-full border border-stone-200 rounded-xl px-3 py-2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Observaciones (opcional)</label>
                <input type="text" placeholder="Ej. Piel sensible, recomendar hidratación..." value={esteticaHistoryForm.notes} onChange={(e) => setEsteticaHistoryForm({ ...esteticaHistoryForm, notes: e.target.value })} className="w-full border border-stone-200 rounded-xl px-3 py-2" />
              </div>

              <button type="submit" className="w-full bg-[#5C7362] hover:bg-[#4B5F50] text-white font-medium py-2.5 rounded-xl mt-2">
                Guardar en Historial
              </button>
            </form>
          </div>
        </div>
      )}

      {showVacationModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Palmtree className="w-5 h-5 text-[#5C7362]" /> Licencia / Vacaciones
              </h3>
              <button type="button" onClick={() => setShowVacationModal(false)}>
                <XCircle className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleSaveVacationPeriod} className="space-y-3.5 text-sm border-b border-stone-100 pb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Desde ({formatDateDDMMYYYY(vacationForm.startDate)})</label>
                  <input required type="date" value={vacationForm.startDate} onChange={(e) => setVacationForm({ ...vacationForm, startDate: e.target.value })} className="w-full border border-stone-200 rounded-xl px-2.5 py-2 text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Hasta ({formatDateDDMMYYYY(vacationForm.endDate)})</label>
                  <input required type="date" value={vacationForm.endDate} onChange={(e) => setVacationForm({ ...vacationForm, endDate: e.target.value })} className="w-full border border-stone-200 rounded-xl px-2.5 py-2 text-xs" />
                </div>
              </div>

              <button type="submit" className="w-full bg-[#5C7362] hover:bg-[#4B5F50] text-white font-medium py-2.5 rounded-xl">
                Bloquear Días y Cancelar Clases
              </button>
            </form>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Períodos Configurados ({vacationPeriods.length})</p>
              {vacationPeriods.length === 0 ? (
                <p className="text-xs text-stone-400 italic">No hay licencias o vacaciones cargadas.</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {vacationPeriods.map((vp) => (
                    <div key={vp.id} className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between text-xs">
                      <span>Del <strong>{formatDateDDMMYYYY(vp.startDate)}</strong> al <strong>{formatDateDDMMYYYY(vp.endDate)}</strong></span>
                      <button type="button" onClick={() => handleRemoveVacationPeriod(vp.id)} className="text-rose-600 hover:bg-rose-100 p-1 rounded-lg" title="Quitar período y reactivar clases">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showServiceModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">{editingServiceId ? 'Editar Servicio y Cupo' : 'Servicios & Cupos Base'}</h3>
              <button
                type="button"
                onClick={() => {
                  setShowServiceModal(false);
                  setEditingServiceId(null);
                  setServiceForm(EMPTY_SERVICE_FORM);
                }}
              >
                <XCircle className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-3 text-sm border-b border-stone-100 pb-4">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Nombre del Servicio</label>
                <input required type="text" placeholder="Ej. Yoga, Spinning, Estética..." value={serviceForm.label} onChange={(e) => setServiceForm({ ...serviceForm, label: e.target.value })} className="w-full border border-stone-200 rounded-xl px-3 py-2" />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Categoría</label>
                  <select value={serviceForm.pillar} onChange={(e) => setServiceForm({ ...serviceForm, pillar: e.target.value })} className="w-full border border-stone-200 rounded-xl px-2.5 py-2 bg-white text-xs">
                    {SERVICE_PILLARS.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Cupo Guardado</label>
                  <input required type="number" min="1" max="60" value={serviceForm.defaultCap} onChange={(e) => setServiceForm({ ...serviceForm, defaultCap: e.target.value })} className="w-full border border-stone-200 rounded-xl px-2.5 py-2 text-xs" />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700">
                <input type="checkbox" checked={serviceForm.isClass} onChange={(e) => setServiceForm({ ...serviceForm, isClass: e.target.checked })} className="rounded accent-[#5C7362] w-4 h-4" />
                Es clase grupal regular (requiere plan para alumnos; sin plan acceden a sesiones/tratamientos)
              </label>

              <div className="flex gap-2 pt-1">
                {editingServiceId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingServiceId(null);
                      setServiceForm(EMPTY_SERVICE_FORM);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-medium bg-stone-100 text-stone-600"
                  >
                    Cancelar
                  </button>
                )}
                <button type="submit" className="flex-1 bg-[#5C7362] hover:bg-[#4B5F50] text-white font-medium py-2 rounded-xl text-xs">
                  {editingServiceId ? 'Guardar Cupo y Servicio' : 'Guardar Servicio'}
                </button>
              </div>
            </form>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Servicios Existentes ({services.length})</p>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {services.map((srv) => (
                  <div key={srv.id} className="p-2.5 rounded-xl bg-[#F7F5F0] border border-stone-200/80 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-[#2D332F]">{srv.label}</p>
                      <p className="text-[11px] text-stone-500">
                        {srv.isClass ? 'Clase regular' : 'Sesión / Tratamiento'} • Cupo guardado: <strong>{srv.defaultCap}</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingServiceId(srv.id);
                          setServiceForm({ label: srv.label, pillar: srv.pillar, isClass: Boolean(srv.isClass), defaultCap: srv.defaultCap });
                        }}
                        className="p-1.5 text-stone-700 bg-white hover:bg-stone-100 rounded-lg border border-stone-200"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => handleRequestDeleteService(srv)} className="p-1.5 text-rose-600 bg-white hover:bg-rose-50 rounded-lg border border-rose-200">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showClassModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">{editingClassId ? 'Editar Horario' : 'Nuevo Horario'}</h3>
              <button type="button" onClick={() => setShowClassModal(false)}>
                <XCircle className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-3.5 text-sm">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-stone-600">Servicio</label>
                  <span className="text-[11px] text-[#5C7362] font-semibold">
                    Cupo del servicio: {getServiceDefaultCapacity(classForm.category)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {services.map((srv) => (
                    <button
                      type="button"
                      key={srv.id}
                      onClick={() =>
                        setClassForm((prev) => ({
                          ...prev,
                          category: srv.id,
                          title: prev.isCustomTitle ? prev.title : srv.label
                        }))
                      }
                      className={`py-2 px-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                        classForm.category === srv.id ? 'bg-[#5C7362] text-white border-transparent' : 'bg-[#F7F5F0] text-stone-600 border-stone-200'
                      }`}
                    >
                      {srv.label} ({srv.defaultCap})
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-stone-600">Nombre en grilla</label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-stone-500">
                    <input
                      type="checkbox"
                      checked={classForm.isCustomTitle}
                      onChange={(e) => {
                        const custom = e.target.checked;
                        const srv = services.find((s) => s.id === classForm.category);
                        setClassForm({ ...classForm, isCustomTitle: custom, title: custom ? classForm.title : srv?.label || '' });
                      }}
                      className="rounded accent-[#5C7362] w-3.5 h-3.5"
                    />
                    Personalizar
                  </label>
                </div>

                <input
                  required
                  type="text"
                  disabled={!classForm.isCustomTitle}
                  value={classForm.isCustomTitle ? classForm.title : services.find((s) => s.id === classForm.category)?.label || ''}
                  onChange={(e) => setClassForm({ ...classForm, title: e.target.value })}
                  className={`w-full border border-stone-200 rounded-xl px-3 py-2 text-sm ${
                    !classForm.isCustomTitle ? 'bg-stone-50 text-stone-700 font-medium' : 'bg-white'
                  }`}
                />
              </div>

              {!editingClassId && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1.5">
                      Días (desde {formatDateDDMMYYYY(selectedDate)}):
                    </label>
                    <div className="grid grid-cols-7 gap-1">
                      {DAYS_OF_WEEK_ALL.map((day) => {
                        const isSelected = classForm.selectedDays.includes(day.id);
                        return (
                          <button
                            type="button"
                            key={day.id}
                            onClick={() => {
                              const updated = isSelected ? classForm.selectedDays.filter((d) => d !== day.id) : [...classForm.selectedDays, day.id];
                              setClassForm({ ...classForm, selectedDays: updated });
                            }}
                            className={`py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                              isSelected ? 'bg-[#5C7362] text-white border-transparent' : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            {day.short}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Repetición semanal</label>
                    <select value={classForm.weeksCount} onChange={(e) => setClassForm({ ...classForm, weeksCount: Number(e.target.value) })} className="w-full border border-stone-200 rounded-xl px-3 py-2 bg-white text-sm">
                      <option value={1}>Solo esta semana (1 semana)</option>
                      <option value={2}>Durante 2 semanas</option>
                      <option value={4}>Durante 4 semanas (1 mes)</option>
                    </select>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Hora</label>
                  <input required type="time" value={classForm.time} onChange={(e) => setClassForm({ ...classForm, time: e.target.value })} className="w-full border border-stone-200 rounded-xl px-2.5 py-2 text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Duración (min)</label>
                  <input required type="number" min="15" max="480" value={classForm.duration} onChange={(e) => setClassForm({ ...classForm, duration: e.target.value })} className="w-full border border-stone-200 rounded-xl px-2.5 py-2 text-xs" />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 text-xs text-amber-900">
                <input type="checkbox" checked={classForm.comingSoon} onChange={(e) => setClassForm({ ...classForm, comingSoon: e.target.checked })} className="rounded accent-[#5C7362] w-4 h-4" />
                Marcar como “Próximamente”
              </label>

              <button type="submit" className="w-full bg-[#5C7362] hover:bg-[#4B5F50] text-white font-medium py-2.5 rounded-xl mt-2">
                {editingClassId ? 'Guardar Cambios' : 'Guardar Horario'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showStudentModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">{editingStudentId ? 'Editar Registro' : 'Nuevo Registro'}</h3>
              <button type="button" onClick={() => setShowStudentModal(false)}>
                <XCircle className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Nombre Completo</label>
                <input required type="text" placeholder="Ej. María Gómez" value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} className="w-full border border-stone-200 rounded-xl px-3 py-2" />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Teléfono WhatsApp</label>
                <input required type="text" placeholder="Ej. +5491123456789" value={studentForm.phone} onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })} className="w-full border border-stone-200 rounded-xl px-3 py-2" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Plan / Modalidad</label>
                  <select
                    value={studentForm.plan}
                    onChange={(e) => {
                      const chosenPlan = e.target.value;
                      setStudentForm({ ...studentForm, plan: chosenPlan, credits: getDefaultCreditsForPlan(chosenPlan) });
                    }}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2 bg-white"
                  >
                    {plans.filter((p) => !p.comingSoon).map((p) => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Sesiones / Clases</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    disabled={isUnlimitedPlan(studentForm.plan) || getPlanConfig(studentForm.plan).isNone}
                    value={getPlanConfig(studentForm.plan).isNone ? 0 : isUnlimitedPlan(studentForm.plan) ? 99 : studentForm.credits}
                    onChange={(e) => setStudentForm({ ...studentForm, credits: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2 disabled:bg-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Seguimiento de clases</label>
                <select value={studentForm.absenceReason} onChange={(e) => setStudentForm({ ...studentForm, absenceReason: e.target.value })} className="w-full border border-stone-200 rounded-xl px-3 py-2 bg-white text-xs">
                  <option value="none">Normal / Activo</option>
                  <option value="vacation_pause">Suspensión por vacaciones</option>
                  <option value="not_renewed">No renovó</option>
                </select>
              </div>

              {!editingStudentId && hasActiveSubscriptionPlan({ plan: studentForm.plan }) && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Fecha de Inicio</label>
                    <input
                      required
                      type="date"
                      value={studentForm.startDate}
                      onChange={(e) => {
                        const nextStart = e.target.value;
                        setStudentForm({ ...studentForm, startDate: nextStart, expiryDate: addDaysToISO(nextStart, 30) });
                      }}
                      className="w-full border border-stone-200 rounded-xl px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Fecha de Vencimiento</label>
                    <input required type="date" value={studentForm.expiryDate} onChange={(e) => setStudentForm({ ...studentForm, expiryDate: e.target.value })} className="w-full border border-stone-200 rounded-xl px-3 py-2" />
                  </div>
                </div>
              )}

              <button type="submit" className="w-full bg-[#5C7362] hover:bg-[#4B5F50] text-white font-medium py-2.5 rounded-xl mt-2">
                {editingStudentId ? 'Guardar Cambios' : 'Guardar Registro'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showRenewDatesModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Renovar / Modificar Fechas</h3>
              <button type="button" onClick={() => setShowRenewDatesModal(false)}>
                <XCircle className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleSaveRenewAndDates} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Fecha de Inicio del Plan</label>
                <input
                  required
                  type="date"
                  value={renewDatesForm.startDate}
                  onChange={(e) => {
                    const nextStart = e.target.value;
                    setRenewDatesForm({ ...renewDatesForm, startDate: nextStart, expiryDate: addDaysToISO(nextStart, 30) });
                  }}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Fecha de Vencimiento</label>
                <input required type="date" value={renewDatesForm.expiryDate} onChange={(e) => setRenewDatesForm({ ...renewDatesForm, expiryDate: e.target.value })} className="w-full border border-stone-200 rounded-xl px-3 py-2" />
              </div>

              <label className="flex items-center gap-2 cursor-pointer bg-[#F7F5F0] p-2.5 rounded-xl border border-stone-200 text-xs">
                <input type="checkbox" checked={renewDatesForm.resetCredits} onChange={(e) => setRenewDatesForm({ ...renewDatesForm, resetCredits: e.target.checked })} className="rounded accent-[#5C7362] w-4 h-4" />
                Restablecer sesiones del plan al renovar
              </label>

              <button type="submit" className="w-full bg-[#5C7362] hover:bg-[#4B5F50] text-white font-medium py-2.5 rounded-xl mt-2">
                Guardar Renovación / Fechas
              </button>
            </form>
          </div>
        </div>
      )}

      {showPlanManagerModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">{editingPlanId ? 'Editar Plan' : 'Crear y Editar Planes'}</h3>
              <button
                type="button"
                onClick={() => {
                  setShowPlanManagerModal(false);
                  setEditingPlanId(null);
                  setPlanForm(EMPTY_PLAN_FORM);
                }}
              >
                <XCircle className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleSavePlanDefinition} className="space-y-3 text-sm border-b border-stone-100 pb-4">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Nombre del Plan</label>
                <input required type="text" placeholder="Ej. Mensual - 4 veces por semana" value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} className="w-full border border-stone-200 rounded-xl px-3 py-2" />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Precio ($$)</label>
                  <input required={!planForm.comingSoon} type="number" min="0" step="100" disabled={planForm.comingSoon} value={planForm.comingSoon ? 0 : planForm.price} onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })} className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs disabled:bg-stone-100" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Cantidad de clases</label>
                  <input type="number" min="1" max="99" disabled={planForm.isUnlimited} value={planForm.isUnlimited ? 99 : planForm.credits} onChange={(e) => setPlanForm({ ...planForm, credits: e.target.value })} className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs disabled:bg-stone-100" />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700">
                  <input type="checkbox" checked={planForm.isUnlimited} onChange={(e) => setPlanForm({ ...planForm, isUnlimited: e.target.checked })} className="rounded accent-[#5C7362] w-4 h-4" />
                  Pase Libre
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-amber-800 font-medium">
                  <input type="checkbox" checked={planForm.comingSoon} onChange={(e) => setPlanForm({ ...planForm, comingSoon: e.target.checked })} className="rounded accent-[#5C7362] w-4 h-4" />
                  Próximamente (sin precio confirmado aún)
                </label>
              </div>

              <div className="flex gap-2">
                {editingPlanId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPlanId(null);
                      setPlanForm(EMPTY_PLAN_FORM);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-medium bg-stone-100 text-stone-600"
                  >
                    Cancelar
                  </button>
                )}
                <button type="submit" className="flex-1 bg-[#5C7362] hover:bg-[#4B5F50] text-white font-medium py-2 rounded-xl text-xs">
                  {editingPlanId ? 'Guardar Plan' : 'Crear y Publicar Plan'}
                </button>
              </div>
            </form>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Todos los planes ({publishedPlansForStudents.length})</p>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {publishedPlansForStudents.map((p) => (
                  <div key={p.id} className="p-2.5 rounded-xl bg-[#F7F5F0] border border-stone-200/80 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <p className="font-semibold text-[#2D332F]">{p.name}</p>
                      <p className="text-[11px] text-stone-500">
                        {p.isUnlimited ? 'Pase Libre' : `${p.credits} clases`} •{' '}
                        {p.comingSoon ? <strong className="text-amber-700">Próximamente</strong> : <strong className="text-[#5C7362]">{formatPriceARS(p.price)}</strong>}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPlanId(p.id);
                        setPlanForm({ name: p.name, credits: p.credits, price: p.price || 0, isUnlimited: Boolean(p.isUnlimited), comingSoon: Boolean(p.comingSoon) });
                      }}
                      className="p-1.5 text-stone-700 bg-white hover:bg-stone-100 rounded-lg border border-stone-200"
                      title="Editar plan"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
