import React, { useState, useEffect } from 'react';
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
  Bell,
  Clock3,
  ListPlus
} from 'lucide-react';

// Conexión a Supabase
const supabaseUrl = 'https://miwktvtdygetyzqvccal.supabase.co';
const supabaseKey = 'sb_publishable_45-FeV94kQsHYfau3pJPjg_DOo7R6yx';
const supabase = createClient(supabaseUrl, supabaseKey);

// PIN de acceso al Modo Estudio
const ADMIN_PIN = '1008';

// 3 Pilares para agrupar servicios en la Vista de Alumno
const PILLARS = [
  { id: 'Todas', label: 'Todas' },
  { id: 'cuerpo', label: 'Cuerpo & Movimiento' },
  { id: 'mente', label: 'Mente & Procesos' },
  { id: 'estetica', label: 'Cuidado & Estética' }
];

const SELECTABLE_PILLARS = [
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
  { id: 'sin_plan', name: 'Sin Plan (Solo Sesiones / Masajes)', credits: 0, price: 0, isUnlimited: false, isNone: true },
  { id: 'sesion_ind', name: 'Sesión Individual (Coaching / PNL / Constelaciones / Estética)', credits: 1, price: 35000, isUnlimited: false },
  { id: 'taller_const', name: 'Taller de Constelaciones / Evento Especial', credits: 1, price: 40000, isUnlimited: false },
  { id: 'clase_ind', name: 'Clase Individual', credits: 1, price: 18000, isUnlimited: false },
  { id: 'm1', name: 'Mensual - 1 vez por semana', credits: 4, price: 48000, isUnlimited: false },
  { id: 'm2', name: 'Mensual - 2 veces por semana', credits: 8, price: 78000, isUnlimited: false },
  { id: 'm3', name: 'Mensual - 3 veces por semana', credits: 12, price: 105000, isUnlimited: false },
  { id: 'pase_libre', name: 'Pase Libre Clases', credits: 99, price: 130000, isUnlimited: true }
];

const DAYS_OF_WEEK = [
  { id: 1, short: 'Lun', label: 'Lunes' },
  { id: 2, short: 'Mar', label: 'Martes' },
  { id: 3, short: 'Mié', label: 'Miércoles' },
  { id: 4, short: 'Jue', label: 'Jueves' },
  { id: 5, short: 'Vie', label: 'Viernes' },
  { id: 6, short: 'Sáb', label: 'Sábado' },
  { id: 0, short: 'Dom', label: 'Domingo' }
];

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return '';
  const clean = String(dateStr).split('T')[0];
  const [year, month, day] = clean.split('-');
  if (!year || !month || !day) return dateStr;
  return `${day}-${month}-${year}`;
};

const formatPriceARS = (value) => {
  const num = Number(value || 0);
  return `$ ${num.toLocaleString('es-AR')}`;
};

const formatTimestamp = (isoStr) => {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return isoStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${day}-${month}-${year} ${hh}:${mm}`;
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

function SatNamLogo({ className = 'w-11 h-11' }) {
  return (
    <div
      className={`${className} rounded-2xl bg-[#5C7362] p-1.5 flex items-center justify-center text-white shadow-xs shrink-0`}
    >
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
  const [adminTab, setAdminTab] = useState('schedule');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('satnam_services_v3');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [plans, setPlans] = useState(() => {
    const saved = localStorage.getItem('satnam_plans_v2');
    return saved ? JSON.parse(saved) : INITIAL_PLANS;
  });

  const [vacationPeriods, setVacationPeriods] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('satnam_vacations_v1') || '[]');
    } catch {
      return [];
    }
  });

  const [planMetaMap, setPlanMetaMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('satnam_plan_meta_v2') || '{}');
    } catch {
      return {};
    }
  });

  const [cancelledTimestamps, setCancelledTimestamps] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('satnam_cancelled_ts_v1') || '{}');
    } catch {
      return {};
    }
  });

  const [attendanceMap, setAttendanceMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('satnam_attendance_v1') || '{}');
    } catch {
      return {};
    }
  });

  const [waitlistMap, setWaitlistMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('satnam_waitlist_v1') || '{}');
    } catch {
      return {};
    }
  });

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [pendingAttendanceEdit, setPendingAttendanceEdit] = useState(null);
  const [pendingDeleteConfirm, setPendingDeleteConfirm] = useState(null);

  const [showVacationModal, setShowVacationModal] = useState(false);
  const [vacationForm, setVacationForm] = useState({
    startDate: toISODate(new Date()),
    endDate: addDaysToISO(toISODate(new Date()), 7)
  });

  // Vista Alumno + Calendario interactivo de fechas
  const [activeStudentId, setActiveStudentId] = useState('');
  const [selectedDate, setSelectedDate] = useState(toISODate(new Date()));
  const [studentCalendarMonth, setStudentCalendarMonth] = useState(() => new Date());
  const [pillarFilter, setPillarFilter] = useState('Todas');
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });

  // Vista Admin
  const [calendarView, setCalendarView] = useState('week');
  const [calendarCursor, setCalendarCursor] = useState(new Date());
  const [attendanceServiceFilter, setAttendanceServiceFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Dashboard
  const [openClassesPanel, setOpenClassesPanel] = useState(false);
  const [openBookingsPanel, setOpenBookingsPanel] = useState(false);
  const [expandedDashboardClassId, setExpandedDashboardClassId] = useState(null);
  const [dashboardScope, setDashboardScope] = useState('day');
  const [dashboardMonth, setDashboardMonth] = useState(() => toISODate(new Date()).slice(0, 7));

  // Pagos & Comunicaciones + Planes con precio $$
  const [openPaymentsPanel, setOpenPaymentsPanel] = useState('renew');
  const [showPlanManagerModal, setShowPlanManagerModal] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    credits: 4,
    price: 50000,
    isUnlimited: false
  });

  // Modales Servicios y Clases
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    label: '',
    pillar: 'cuerpo',
    isClass: true,
    defaultCap: 10
  });

  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClassId, setEditingClassId] = useState(null);
  const [classForm, setClassForm] = useState({
    category: 'Yoga',
    title: 'Yoga',
    isCustomTitle: false,
    instructor: 'Patricia Aleman',
    time: '10:00',
    duration: 60,
    capacity: 12,
    selectedDays: [1, 3, 5],
    weeksCount: 4
  });

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [studentForm, setStudentForm] = useState({
    name: '',
    phone: '',
    plan: 'Mensual - 2 veces por semana',
    startDate: toISODate(new Date()),
    expiryDate: toISODate(new Date(Date.now() + 30 * 86400000)),
    credits: 8,
    absenceReason: 'none'
  });

  const [showRenewDatesModal, setShowRenewDatesModal] = useState(false);
  const [renewDatesStudentId, setRenewDatesStudentId] = useState(null);
  const [renewDatesForm, setRenewDatesForm] = useState({
    startDate: toISODate(new Date()),
    expiryDate: toISODate(new Date(Date.now() + 30 * 86400000)),
    resetCredits: true
  });

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const saveServices = (next) => {
    setServices(next);
    localStorage.setItem('satnam_services_v3', JSON.stringify(next));
  };

  const savePlans = (next) => {
    setPlans(next);
    localStorage.setItem('satnam_plans_v2', JSON.stringify(next));
  };

  const saveVacationPeriods = (next) => {
    setVacationPeriods(next);
    localStorage.setItem('satnam_vacations_v1', JSON.stringify(next));
  };

  const savePlanMeta = (next) => {
    setPlanMetaMap(next);
    localStorage.setItem('satnam_plan_meta_v2', JSON.stringify(next));
  };

  const saveCancelledTimestamps = (next) => {
    setCancelledTimestamps(next);
    localStorage.setItem('satnam_cancelled_ts_v1', JSON.stringify(next));
  };

  const saveAttendanceMap = (next) => {
    setAttendanceMap(next);
    localStorage.setItem('satnam_attendance_v1', JSON.stringify(next));
  };

  const saveWaitlistMap = (next) => {
    setWaitlistMap(next);
    localStorage.setItem('satnam_waitlist_v1', JSON.stringify(next));
  };

  const todayISO = toISODate(new Date());

  const getVacationForDate = (isoDate) => {
    if (!isoDate) return null;
    return vacationPeriods.find((vp) => isoDate >= vp.startDate && isoDate <= vp.endDate) || null;
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

  const fetchAllData = async () => {
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
      if (loadedStudents.length > 0 && !activeStudentId) {
        setActiveStudentId(loadedStudents[0].id);
      }

      setClasses(classesRes.data);

      const savedAtt = (() => {
        try {
          return JSON.parse(localStorage.getItem('satnam_attendance_v1') || '{}');
        } catch {
          return {};
        }
      })();

      setBookings(
        bookingsRes.data.map((b) => {
          const fromDbStatus = b.attendance_status || (b.attended ? 'attended' : null);
          const resolvedStatus = savedAtt[b.id] || fromDbStatus;
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
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];

  const getPlanConfig = (planName) =>
    plans.find((p) => p.name === planName) || {
      name: planName,
      credits: 4,
      price: 0,
      isUnlimited: false,
      isNone: false
    };

  const hasActiveSubscriptionPlan = (student) => {
    if (!student) return false;
    const cfg = getPlanConfig(student.plan);
    return !cfg.isNone && student.plan !== 'Sin Plan (Solo Sesiones / Masajes)';
  };

  const isUnlimitedPlan = (planName) => Boolean(getPlanConfig(planName).isUnlimited);

  const getDefaultCreditsForPlan = (planName) => {
    const cfg = getPlanConfig(planName);
    if (cfg.isNone) return 0;
    if (cfg.isUnlimited) return 99;
    return Number(cfg.credits) || 1;
  };

  const isPlanPaused = (student) => {
    if (!student) return false;
    const reason = planMetaMap[student.id]?.absenceReason;
    return (
      student.status === 'paused' ||
      Boolean(planMetaMap[student.id]?.isPaused) ||
      reason === 'vacation_pause' ||
      reason === 'not_renewed'
    );
  };

  const isPlanExpired = (student) => {
    if (!student || !hasActiveSubscriptionPlan(student) || !student.expiryDate) return false;
    return student.expiryDate < todayISO || student.status === 'overdue';
  };

  const isPlanExpiringSoon = (student) => {
    if (!student || !hasActiveSubscriptionPlan(student) || isPlanPaused(student) || !student.expiryDate)
      return false;
    const diff = Math.ceil((new Date(student.expiryDate) - new Date(todayISO)) / 86400000);
    return diff <= 5;
  };

  const canStudentOperate = (student) => {
    if (!student) return false;
    return !isPlanPaused(student) && !isPlanExpired(student);
  };

  const getStudentStartDate = (student) => {
    if (!student) return '';
    return planMetaMap[student.id]?.startDate || addDaysToISO(student.expiryDate, -30);
  };

  const getStudentQuotaDisplay = (student) => {
    if (!student) return '';
    if (!hasActiveSubscriptionPlan(student)) return 'Sin plan';
    if (isUnlimitedPlan(student.plan)) return 'Pase Libre';
    const total = getDefaultCreditsForPlan(student.plan);
    const used = Math.max(0, total - student.credits);
    const currentNumber = used > 0 ? used : 1;
    return `${currentNumber}/${total}`;
  };

  const handleSaveVacationPeriod = async (e) => {
    e.preventDefault();
    if (!vacationForm.startDate || !vacationForm.endDate) return;
    if (vacationForm.endDate < vacationForm.startDate) {
      showToast('La fecha de fin no puede ser anterior a la de inicio', 'error');
      return;
    }

    const newPeriod = {
      id: `vac_${Date.now()}`,
      startDate: vacationForm.startDate,
      endDate: vacationForm.endDate
    };

    saveVacationPeriods([...vacationPeriods, newPeriod]);

    const affectedClasses = classes.filter(
      (c) => c.date >= vacationForm.startDate && c.date <= vacationForm.endDate
    );

    if (affectedClasses.length > 0) {
      const nowISO = new Date().toISOString();
      const idsToCancel = affectedClasses.map((c) => c.id);

      await supabase.from('classes').update({ is_cancelled: true }).in('id', idsToCancel);

      setClasses((prev) =>
        prev.map((c) => (idsToCancel.includes(c.id) ? { ...c, is_cancelled: true } : c))
      );

      const nextTs = { ...cancelledTimestamps };
      idsToCancel.forEach((id) => {
        nextTs[id] = nowISO;
      });
      saveCancelledTimestamps(nextTs);
    }

    setShowVacationModal(false);
    showToast('Licencia registrada y clases del rango canceladas');
  };

  const handleRemoveVacationPeriod = async (periodId) => {
    const target = vacationPeriods.find((vp) => vp.id === periodId);
    const remainingPeriods = vacationPeriods.filter((vp) => vp.id !== periodId);
    saveVacationPeriods(remainingPeriods);

    if (target) {
      const stillInOtherVacation = (iso) =>
        remainingPeriods.some((vp) => iso >= vp.startDate && iso <= vp.endDate);

      const classesToReactivate = classes.filter(
        (c) => c.date >= target.startDate && c.date <= target.endDate && !stillInOtherVacation(c.date)
      );

      if (classesToReactivate.length > 0) {
        const idsToReactivate = classesToReactivate.map((c) => c.id);
        await supabase.from('classes').update({ is_cancelled: false }).in('id', idsToReactivate);

        setClasses((prev) =>
          prev.map((c) => (idsToReactivate.includes(c.id) ? { ...c, is_cancelled: false } : c))
        );

        const nextTs = { ...cancelledTimestamps };
        idsToReactivate.forEach((id) => {
          delete nextTs[id];
        });
        saveCancelledTimestamps(nextTs);
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

    const { error } = await supabase
      .from('students')
      .update({ name: profileForm.name.trim(), phone: profileForm.phone.trim() })
      .eq('id', activeStudent.id);

    if (error) {
      showToast('No se pudo actualizar tu perfil', 'error');
      return;
    }

    setStudents((prev) =>
      prev.map((s) =>
        s.id === activeStudent.id
          ? { ...s, name: profileForm.name.trim(), phone: profileForm.phone.trim() }
          : s
      )
    );
    setShowEditProfileModal(false);
    showToast('Perfil actualizado correctamente');
  };

  const handleToggleWaitlist = (classId) => {
    if (!activeStudent) {
      showToast('Selecciona un perfil primero', 'error');
      return;
    }
    if (!canStudentOperate(activeStudent)) {
      showToast(
        'Tu plan está vencido. No puedes reservar ni cancelar turnos. Comunicate con el espacio para reactivar tu plan.',
        'error'
      );
      return;
    }

    const currentList = waitlistMap[classId] || [];
    const exists = currentList.includes(activeStudent.id);
    const nextList = exists
      ? currentList.filter((id) => id !== activeStudent.id)
      : [...currentList, activeStudent.id];

    saveWaitlistMap({ ...waitlistMap, [classId]: nextList });
    showToast(exists ? 'Saliste de la lista de espera' : 'Te sumaste a la lista de espera');
  };

  const handleToggleBooking = async (classId) => {
    if (!activeStudent) {
      showToast('Primero solicita tu alta en el espacio', 'error');
      return;
    }

    if (!canStudentOperate(activeStudent)) {
      showToast(
        'Tu plan está vencido. No puedes reservar ni cancelar turnos. Comunicate con el espacio para reactivar tu plan.',
        'error'
      );
      return;
    }

    const classObj = classes.find((c) => c.id === classId);
    if (!classObj) return;

    const srvObj = services.find((s) => s.id === classObj.category);
    const isRegularClass = srvObj ? Boolean(srvObj.isClass) : true;

    if (isRegularClass && !hasActiveSubscriptionPlan(activeStudent)) {
      showToast('Para reservar clases regulares necesitás un plan activo.', 'error');
      return;
    }

    if (getVacationForDate(classObj.date)) {
      showToast('Cerrado por vacaciones en esta fecha.', 'error');
      return;
    }

    const existingBooking = bookings.find(
      (b) => b.classId === classId && b.studentId === activeStudent.id
    );

    if (existingBooking) {
      const { error } = await supabase.from('bookings').delete().eq('id', existingBooking.id);
      if (error) {
        showToast('No se pudo cancelar la reserva', 'error');
        return;
      }

      setBookings((prev) => prev.filter((b) => b.id !== existingBooking.id));
      const nextAtt = { ...attendanceMap };
      delete nextAtt[existingBooking.id];
      saveAttendanceMap(nextAtt);

      if (hasActiveSubscriptionPlan(activeStudent) && !isUnlimitedPlan(activeStudent.plan)) {
        const updatedCredits = activeStudent.credits + 1;
        await supabase.from('students').update({ credits: updatedCredits }).eq('id', activeStudent.id);
        setStudents((prev) =>
          prev.map((s) => (s.id === activeStudent.id ? { ...s, credits: updatedCredits } : s))
        );
      }
      showToast('Reserva cancelada correctamente');
    } else {
      if (hasActiveSubscriptionPlan(activeStudent) && classObj.date > activeStudent.expiryDate) {
        showToast(
          'Tu plan está vencido. No puedes reservar ni cancelar turnos. Comunicate con el espacio para reactivar tu plan.',
          'error'
        );
        return;
      }

      if (classObj.is_cancelled) {
        showToast('Esta clase se encuentra cancelada.', 'error');
        return;
      }

      const classBookingsCount = bookings.filter((b) => b.classId === classId).length;
      if (classBookingsCount >= classObj.capacity) {
        showToast('Clase completa. Puedes sumarte a la lista de espera.', 'error');
        return;
      }

      if (
        hasActiveSubscriptionPlan(activeStudent) &&
        !isUnlimitedPlan(activeStudent.plan) &&
        activeStudent.credits <= 0
      ) {
        showToast('Sin sesiones disponibles en tu abono. Consulta en recepción.', 'error');
        return;
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert([{ class_id: classId, student_id: activeStudent.id, attended: false }])
        .select()
        .single();

      if (error) {
        showToast('No se pudo realizar la reserva', 'error');
        return;
      }

      setBookings((prev) => [
        ...prev,
        {
          id: data.id,
          classId: data.class_id,
          studentId: data.student_id,
          attended: false,
          attendanceStatus: null
        }
      ]);

      if (hasActiveSubscriptionPlan(activeStudent) && !isUnlimitedPlan(activeStudent.plan)) {
        const updatedCredits = Math.max(0, activeStudent.credits - 1);
        await supabase.from('students').update({ credits: updatedCredits }).eq('id', activeStudent.id);
        setStudents((prev) =>
          prev.map((s) => (s.id === activeStudent.id ? { ...s, credits: updatedCredits } : s))
        );
      }
      showToast(`¡Lugar reservado en ${classObj.title}!`);
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

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, attended: isAttendedBool, attendanceStatus: status } : b
      )
    );

    saveAttendanceMap({ ...attendanceMap, [bookingId]: status });

    const st = students.find((s) => s.id === booking.studentId);
    if (st && hasActiveSubscriptionPlan(st) && !isUnlimitedPlan(st.plan)) {
      let delta = 0;
      if (prevStatus !== 'no_show' && status === 'no_show') {
        delta = -1;
      } else if (prevStatus === 'no_show' && status !== 'no_show') {
        delta = 1;
      }

      if (delta !== 0) {
        const nextCredits = Math.max(0, st.credits + delta);
        await supabase.from('students').update({ credits: nextCredits }).eq('id', st.id);
        setStudents((prev) =>
          prev.map((item) => (item.id === st.id ? { ...item, credits: nextCredits } : item))
        );
      }
    }

    showToast(
      status === 'attended'
        ? 'Asistencia guardada como Asistió'
        : 'Marcado como No asistió (clase descontada del abono)'
    );
  };

  const handleRequestAttendanceChange = (booking, nextStatus, studentName) => {
    const currentStatus = booking.attendanceStatus || (booking.attended ? 'attended' : null);
    if (currentStatus === nextStatus) return;

    if (currentStatus && currentStatus !== nextStatus) {
      setPendingAttendanceEdit({ bookingId: booking.id, nextStatus, studentName });
    } else {
      applyAttendanceStatus(booking.id, nextStatus);
    }
  };

  const handleSaveService = (e) => {
    e.preventDefault();
    const cleanLabel = serviceForm.label.trim();
    if (!cleanLabel) return;

    if (editingServiceId) {
      const updated = services.map((s) =>
        s.id === editingServiceId
          ? {
              ...s,
              label: cleanLabel,
              pillar: serviceForm.pillar,
              isClass: Boolean(serviceForm.isClass),
              defaultCap: Number(serviceForm.defaultCap) || 10
            }
          : s
      );
      saveServices(updated);
      setEditingServiceId(null);
      setServiceForm({ label: '', pillar: 'cuerpo', isClass: true, defaultCap: 10 });
      showToast('Servicio editado correctamente');
    } else {
      const baseId = cleanLabel.replace(/[^a-zA-Z0-9]/g, '') || `Srv${Date.now()}`;
      const uniqueId = services.some((s) => s.id.toLowerCase() === baseId.toLowerCase())
        ? `${baseId}_${Date.now()}`
        : baseId;

      saveServices([
        ...services,
        {
          id: uniqueId,
          label: cleanLabel,
          pillar: serviceForm.pillar,
          isClass: Boolean(serviceForm.isClass),
          defaultCap: Number(serviceForm.defaultCap) || 10
        }
      ]);
      setServiceForm({ label: '', pillar: 'cuerpo', isClass: true, defaultCap: 10 });
      showToast('Servicio agregado correctamente');
    }
  };

  const handleStartEditService = (srv) => {
    setEditingServiceId(srv.id);
    setServiceForm({
      label: srv.label,
      pillar: srv.pillar,
      isClass: Boolean(srv.isClass),
      defaultCap: srv.defaultCap
    });
  };

  const handleRequestDeleteService = (srv) => {
    if (services.length <= 1) {
      showToast('Debe quedar al menos un servicio en el estudio.', 'error');
      return;
    }
    setPendingDeleteConfirm({
      type: 'service',
      id: srv.id,
      title: `el servicio "${srv.label}"`
    });
  };

  const handleOpenNewClassModal = () => {
    const firstSrv = services[0];
    setEditingClassId(null);
    setClassForm({
      category: firstSrv?.id || 'Yoga',
      title: firstSrv?.label || 'Yoga',
      isCustomTitle: false,
      instructor: 'Patricia Aleman',
      time: '10:00',
      duration: 60,
      capacity: firstSrv?.defaultCap || 12,
      selectedDays: [1, 3, 5],
      weeksCount: 4
    });
    setShowClassModal(true);
  };

  const handleSaveClass = async (e) => {
    e.preventDefault();
    const matchingSrv = services.find((s) => s.id === classForm.category) || services[0];
    const finalTitle =
      classForm.isCustomTitle && classForm.title.trim()
        ? classForm.title.trim()
        : matchingSrv.label;

    if (editingClassId) {
      const currentCls = classes.find((c) => c.id === editingClassId);
      const targetDate = currentCls?.date || selectedDate;
      const conflict = classes.find(
        (c) => c.id !== editingClassId && c.date === targetDate && c.time === classForm.time
      );

      if (conflict) {
        showToast(
          `Ya existe una clase (${conflict.title}) el ${formatDateDDMMYYYY(targetDate)} a las ${classForm.time} hs.`,
          'error'
        );
        return;
      }

      const { data, error } = await supabase
        .from('classes')
        .update({
          title: finalTitle,
          category: classForm.category,
          instructor: classForm.instructor || 'Patricia Aleman',
          time: classForm.time,
          duration: Number(classForm.duration),
          capacity: Number(classForm.capacity)
        })
        .eq('id', editingClassId)
        .select()
        .single();

      if (error) {
        showToast('Error al actualizar la clase', 'error');
        return;
      }

      setClasses((prev) => prev.map((c) => (c.id === editingClassId ? data : c)));
      setShowClassModal(false);
      setEditingClassId(null);
      showToast('Clase actualizada con éxito');
    } else {
      if (classForm.selectedDays.length === 0) {
        showToast('Selecciona al menos un día de la semana', 'error');
        return;
      }

      const weeks = Math.min(4, Math.max(1, Number(classForm.weeksCount) || 1));
      const baseDate = new Date(`${selectedDate}T00:00:00`);
      const datesToCreate = [];

      for (let w = 0; w < weeks; w++) {
        for (const dayOfWeek of classForm.selectedDays) {
          const d = new Date(baseDate);
          const currentDay = d.getDay();
          const diff = (dayOfWeek + 7 - currentDay) % 7;
          d.setDate(d.getDate() + diff + w * 7);
          const iso = toISODate(d);
          if (!datesToCreate.includes(iso)) datesToCreate.push(iso);
        }
      }

      const conflictingDates = datesToCreate.filter((d) =>
        classes.some((c) => c.date === d && c.time === classForm.time)
      );

      if (conflictingDates.length > 0) {
        const previewDates = conflictingDates.slice(0, 3).map(formatDateDDMMYYYY).join(', ');
        showToast(
          `Ya hay una clase a las ${classForm.time} hs en: ${previewDates}. Cambia el día o el horario.`,
          'error'
        );
        return;
      }

      const payload = datesToCreate.map((d) => ({
        title: finalTitle,
        category: classForm.category,
        instructor: classForm.instructor || 'Patricia Aleman',
        date: d,
        time: classForm.time,
        duration: Number(classForm.duration),
        capacity: Number(classForm.capacity),
        room: ''
      }));

      const { data, error } = await supabase.from('classes').insert(payload).select();
      if (error) {
        showToast('No se pudieron guardar los horarios', 'error');
        return;
      }

      setClasses((prev) => [...prev, ...data]);
      setShowClassModal(false);
      showToast(
        weeks === 1
          ? 'Horarios programados para la semana'
          : `Horarios programados por ${weeks} semanas`
      );
    }
  };

  const handleOpenEditClass = (cls) => {
    setEditingClassId(cls.id);
    const matchingSrv = services.find((s) => s.id === cls.category) || services[0];
    const isCustom = cls.title !== matchingSrv.label;
    setClassForm({
      category: matchingSrv.id,
      title: cls.title,
      isCustomTitle: isCustom,
      instructor: cls.instructor || 'Patricia Aleman',
      time: cls.time,
      duration: cls.duration,
      capacity: cls.capacity,
      selectedDays: [1],
      weeksCount: 1
    });
    setShowClassModal(true);
  };

  const handleToggleCancelClass = async (classId) => {
    const targetClass = classes.find((c) => c.id === classId);
    if (!targetClass) return;

    const nextCancelledState = !targetClass.is_cancelled;
    const nowISO = new Date().toISOString();

    const { error } = await supabase
      .from('classes')
      .update({ is_cancelled: nextCancelledState })
      .eq('id', classId);

    if (!error) {
      setClasses((prev) =>
        prev.map((c) => (c.id === classId ? { ...c, is_cancelled: nextCancelledState } : c))
      );

      const updatedTs = { ...cancelledTimestamps };
      if (nextCancelledState) updatedTs[classId] = nowISO;
      else delete updatedTs[classId];
      saveCancelledTimestamps(updatedTs);

      showToast(
        nextCancelledState ? `Clase cancelada (${formatTimestamp(nowISO)})` : 'Clase reactivada'
      );
    } else {
      showToast('Verifica que la columna is_cancelled exista en Supabase', 'error');
    }
  };

  const handleRequestDeleteClass = (cls) => {
    setPendingDeleteConfirm({
      type: 'class',
      id: cls.id,
      title: `la clase "${cls.title}" (${cls.time} hs del ${formatDateDDMMYYYY(cls.date)})`
    });
  };

  const handleOpenNewStudent = () => {
    const start = toISODate(new Date());
    const defaultPlan = plans.find((p) => !p.isNone)?.name || plans[0]?.name || '';
    setEditingStudentId(null);
    setStudentForm({
      name: '',
      phone: '',
      plan: defaultPlan,
      startDate: start,
      expiryDate: addDaysToISO(start, 30),
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
    const finalCredits = getDefaultCreditsForPlan(studentForm.plan);
    const reason = studentForm.absenceReason || 'none';
    const pausedByReason = reason === 'vacation_pause' || reason === 'not_renewed';

    if (editingStudentId) {
      const nextStatus = pausedByReason ? 'paused' : 'active';
      const { error } = await supabase
        .from('students')
        .update({
          name: studentForm.name.trim(),
          phone: studentForm.phone.trim(),
          plan: studentForm.plan,
          status: nextStatus,
          credits: isUnlimitedPlan(studentForm.plan) ? 99 : Number(studentForm.credits)
        })
        .eq('id', editingStudentId);

      if (error) {
        showToast('Error al actualizar el alumno', 'error');
        return;
      }

      setStudents((prev) =>
        prev.map((s) =>
          s.id === editingStudentId
            ? {
                ...s,
                name: studentForm.name.trim(),
                phone: studentForm.phone.trim(),
                plan: studentForm.plan,
                status: nextStatus,
                credits: isUnlimitedPlan(studentForm.plan) ? 99 : Number(studentForm.credits)
              }
            : s
        )
      );

      savePlanMeta({
        ...planMetaMap,
        [editingStudentId]: {
          ...(planMetaMap[editingStudentId] || {}),
          isPaused: pausedByReason,
          absenceReason: reason
        }
      });

      setShowStudentModal(false);
      setEditingStudentId(null);
      showToast('Datos del alumno actualizados');
    } else {
      const { data, error } = await supabase
        .from('students')
        .insert([
          {
            name: studentForm.name.trim(),
            phone: studentForm.phone.trim(),
            plan: studentForm.plan,
            status: pausedByReason ? 'paused' : 'active',
            expiry_date: studentForm.expiryDate,
            credits: finalCredits
          }
        ])
        .select()
        .single();

      if (error) {
        showToast('Error al registrar', 'error');
        return;
      }

      const created = {
        id: data.id,
        name: data.name,
        phone: data.phone || '',
        plan: data.plan,
        status: data.status,
        expiryDate: data.expiry_date,
        credits: data.credits
      };

      savePlanMeta({
        ...planMetaMap,
        [created.id]: {
          startDate: studentForm.startDate,
          isPaused: pausedByReason,
          absenceReason: reason
        }
      });

      setStudents((prev) => [...prev, created]);
      if (!activeStudentId) setActiveStudentId(created.id);
      setShowStudentModal(false);
      showToast('Registrado con éxito');
    }
  };

  const handleRequestDeleteStudent = (st) => {
    setPendingDeleteConfirm({
      type: 'student',
      id: st.id,
      title: `el registro de "${st.name}"`
    });
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteConfirm) return;
    const { type, id } = pendingDeleteConfirm;
    setPendingDeleteConfirm(null);

    if (type === 'class') {
      const { error } = await supabase.from('classes').delete().eq('id', id);
      if (!error) {
        setClasses((prev) => prev.filter((c) => c.id !== id));
        setBookings((prev) => prev.filter((b) => b.classId !== id));
        const updatedTs = { ...cancelledTimestamps };
        delete updatedTs[id];
        saveCancelledTimestamps(updatedTs);
        showToast('Clase eliminada');
      } else {
        showToast('No se pudo eliminar la clase', 'error');
      }
    } else if (type === 'student') {
      await supabase.from('bookings').delete().eq('student_id', id);
      const { error } = await supabase.from('students').delete().eq('id', id);

      if (!error) {
        const remaining = students.filter((s) => s.id !== id);
        setStudents(remaining);
        setBookings((prev) => prev.filter((b) => b.studentId !== id));
        const updatedMeta = { ...planMetaMap };
        delete updatedMeta[id];
        savePlanMeta(updatedMeta);
        if (activeStudentId === id) setActiveStudentId(remaining[0]?.id || '');
        showToast('Alumno eliminado del registro');
      } else {
        showToast('No se pudo eliminar el alumno', 'error');
      }
    } else if (type === 'service') {
      const updated = services.filter((s) => s.id !== id);
      saveServices(updated);
      if (editingServiceId === id) {
        setEditingServiceId(null);
        setServiceForm({ label: '', pillar: 'cuerpo', isClass: true, defaultCap: 10 });
      }
      if (attendanceServiceFilter === id) setAttendanceServiceFilter('ALL');
      showToast('Servicio eliminado');
    }
  };

  const handleTogglePausePlan = async (student) => {
    const currentlyPaused = isPlanPaused(student);
    const nextPaused = !currentlyPaused;
    const nextStatus = nextPaused ? 'paused' : 'active';
    const nextReason = nextPaused ? 'vacation_pause' : 'none';

    const { error } = await supabase.from('students').update({ status: nextStatus }).eq('id', student.id);

    if (!error) {
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, status: nextStatus } : s))
      );
      savePlanMeta({
        ...planMetaMap,
        [student.id]: {
          ...(planMetaMap[student.id] || { startDate: getStudentStartDate(student) }),
          isPaused: nextPaused,
          absenceReason: nextReason
        }
      });
      showToast(nextPaused ? `Plan de ${student.name} pausado` : `Plan de ${student.name} reactivado`);
    } else {
      showToast('No se pudo actualizar el estado del plan', 'error');
    }
  };

  const handleOpenRenewOrDates = (student) => {
    const startNow = toISODate(new Date());
    setRenewDatesStudentId(student.id);
    setRenewDatesForm({
      startDate: getStudentStartDate(student) || startNow,
      expiryDate: student.expiryDate || addDaysToISO(startNow, 30),
      resetCredits: true
    });
    setShowRenewDatesModal(true);
  };

  const handleSaveRenewAndDates = async (e) => {
    e.preventDefault();
    if (!renewDatesStudentId) return;
    const student = students.find((s) => s.id === renewDatesStudentId);
    if (!student) return;

    const updatedCredits = renewDatesForm.resetCredits
      ? getDefaultCreditsForPlan(student.plan)
      : student.credits;

    const nextStatus = renewDatesForm.expiryDate >= todayISO ? 'active' : 'overdue';

    const { error } = await supabase
      .from('students')
      .update({
        status: nextStatus,
        expiry_date: renewDatesForm.expiryDate,
        credits: updatedCredits
      })
      .eq('id', renewDatesStudentId);

    if (error) {
      showToast('No se pudieron guardar los cambios del plan', 'error');
      return;
    }

    setStudents((prev) =>
      prev.map((s) =>
        s.id === renewDatesStudentId
          ? {
              ...s,
              status: nextStatus,
              expiryDate: renewDatesForm.expiryDate,
              credits: updatedCredits
            }
          : s
      )
    );

    savePlanMeta({
      ...planMetaMap,
      [renewDatesStudentId]: {
        ...(planMetaMap[renewDatesStudentId] || {}),
        startDate: renewDatesForm.startDate,
        isPaused: false,
        absenceReason: 'none'
      }
    });

    setShowRenewDatesModal(false);
    setRenewDatesStudentId(null);
    showToast('Plan renovado y fechas actualizadas');
  };

  const handleSavePlanDefinition = (e) => {
    e.preventDefault();
    const cleanName = planForm.name.trim();
    if (!cleanName) return;

    const cleanPrice = Math.max(0, Number(planForm.price) || 0);

    if (editingPlanId) {
      const prevPlan = plans.find((p) => p.id === editingPlanId);
      const updatedPlans = plans.map((p) =>
        p.id === editingPlanId
          ? {
              ...p,
              name: cleanName,
              price: cleanPrice,
              isUnlimited: Boolean(planForm.isUnlimited),
              credits: planForm.isUnlimited ? 99 : Number(planForm.credits) || 1
            }
          : p
      );
      savePlans(updatedPlans);

      if (prevPlan && prevPlan.name !== cleanName) {
        setStudents((prev) =>
          prev.map((s) => (s.plan === prevPlan.name ? { ...s, plan: cleanName } : s))
        );
      }

      setEditingPlanId(null);
      setPlanForm({ name: '', credits: 4, price: 50000, isUnlimited: false });
      showToast('Plan actualizado');
    } else {
      const newPlan = {
        id: `plan_${Date.now()}`,
        name: cleanName,
        price: cleanPrice,
        isUnlimited: Boolean(planForm.isUnlimited),
        credits: planForm.isUnlimited ? 99 : Number(planForm.credits) || 1,
        isNone: false
      };
      savePlans([...plans, newPlan]);
      setPlanForm({ name: '', credits: 4, price: 50000, isUnlimited: false });
      showToast('Nuevo plan creado y publicado');
    }
  };

  const getWhatsAppReminderUrl = (student) => {
    const cleanPhone = student.phone.replace(/\D/g, '');
    const message = `¡Hola ${student.name}! Te saludamos desde *Espacio Sat-Nam* 🪷. Te recordamos que tu plan (*${student.plan}*) vence el día *${formatDateDDMMYYYY(student.expiryDate)}*. Avísanos por aquí si deseas renovarlo para mantener tu lugar. ¡Sat Nam! ✨`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const getPillarForCategory = (categoryId) => {
    const srv = services.find((s) => s.id === categoryId);
    if (srv) return srv.pillar;
    if (categoryId === 'Estetica' || categoryId === 'Bienestar') return 'estetica';
    if (categoryId === 'Coaching' || categoryId === 'Constelaciones' || categoryId === 'Eventos')
      return 'mente';
    return 'cuerpo';
  };

  const studentAllowed = canStudentOperate(activeStudent);
  const studentHasPlan = hasActiveSubscriptionPlan(activeStudent);

  const studentFilteredClasses = (() => {
    const raw = classes
      .filter((c) => c.date === selectedDate)
      .filter((c) => {
        if (!studentHasPlan) {
          const srvObj = services.find((s) => s.id === c.category);
          if (srvObj && srvObj.isClass) return false;
        }
        return true;
      })
      .filter((c) =>
        pillarFilter === 'Todas' ? true : getPillarForCategory(c.category) === pillarFilter
      )
      .sort((a, b) => a.time.localeCompare(b.time));

    const seen = new Set();
    return raw.filter((cls) => {
      const key = `${cls.date}__${cls.time}__${cls.title.toLowerCase().trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  })();

  const dayClassesAdmin = classes
    .filter((c) => c.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const attendanceDayClasses = dayClassesAdmin.filter((c) =>
    attendanceServiceFilter === 'ALL' ? true : c.category === attendanceServiceFilter
  );

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.plan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAbsenceLabel = (student) => {
    const reason = planMetaMap[student.id]?.absenceReason;
    if (reason === 'vacation_pause') return 'Suspensión por vacaciones';
    if (reason === 'not_renewed') return 'No renovó';
    return null;
  };

  const getStatusBadge = (student) => {
    const reasonLabel = getAbsenceLabel(student);
    if (reasonLabel) {
      return (
        <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
          {reasonLabel}
        </span>
      );
    }
    if (!hasActiveSubscriptionPlan(student)) {
      return (
        <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#EDF3EE] text-[#4C6352]">
          Sin Plan (Sesiones)
        </span>
      );
    }
    if (isPlanPaused(student)) {
      return (
        <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-stone-200 text-stone-700">
          Pausado / Cancelado
        </span>
      );
    }
    if (isPlanExpired(student)) {
      return (
        <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-rose-100/80 text-rose-800">
          Vencido
        </span>
      );
    }
    const diffDays = Math.ceil(
      (new Date(student.expiryDate) - new Date(todayISO)) / (1000 * 60 * 60 * 24)
    );
    if (diffDays <= 5) {
      return (
        <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-amber-100/80 text-amber-800">
          Vence pronto ({diffDays}d)
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#EDF3EE] text-[#4C6352]">
        Al día
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const srvObj = services.find((s) => s.id === category);
    const label = srvObj ? srvObj.label.toUpperCase() : category.toUpperCase();
    const badgeClass =
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EDF3EE] text-[#4C6352]';

    switch (category) {
      case 'Spinning':
        return <span className={badgeClass}><Bike className="w-3 h-3" /> {label}</span>;
      case 'Pilates':
      case 'Circuito':
      case 'CircuitoSatNam':
        return <span className={badgeClass}><Flame className="w-3 h-3" /> {label}</span>;
      case 'Coaching':
        return <span className={badgeClass}><Compass className="w-3 h-3" /> {label}</span>;
      case 'Constelaciones':
        return <span className={badgeClass}><Orbit className="w-3 h-3" /> {label}</span>;
      case 'Estetica':
      case 'Bienestar':
        return <span className={badgeClass}><Flower2 className="w-3 h-3" /> {label}</span>;
      case 'Eventos':
        return <span className={badgeClass}><Sparkles className="w-3 h-3" /> {label}</span>;
      default:
        return <span className={badgeClass}><Heart className="w-3 h-3" /> {label}</span>;
    }
  };

  const getWeekDays = (cursor) => {
    const start = new Date(cursor);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const getMonthGridDays = (cursor) => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  };

  const handleNavigateCalendar = (direction) => {
    const next = new Date(calendarCursor);
    if (calendarView === 'week') next.setDate(next.getDate() + direction * 7);
    else next.setMonth(next.getMonth() + direction);
    setCalendarCursor(next);
  };

  const activePaymentStudents = students.filter(
    (s) => hasActiveSubscriptionPlan(s) && !isPlanPaused(s) && !isPlanExpired(s)
  );
  const renewPaymentStudents = students.filter(
    (s) => hasActiveSubscriptionPlan(s) && !isPlanPaused(s) && (isPlanExpired(s) || isPlanExpiringSoon(s))
  );

  const availableDayClasses = dayClassesAdmin.filter((c) => !c.is_cancelled);
  const dayClassIds = new Set(dayClassesAdmin.map((c) => c.id));
  const dayBookings = bookings.filter((b) => dayClassIds.has(b.classId));

  const monthClasses = classes.filter((c) => String(c.date || '').startsWith(dashboardMonth));
  const monthStatsBySlot = Object.values(
    monthClasses.reduce((acc, cls) => {
      const key = `${cls.title}__${cls.time}`;
      if (!acc[key]) {
        acc[key] = {
          key,
          title: cls.title,
          time: cls.time,
          totalBookings: 0,
          attended: 0,
          noShow: 0
        };
      }
      const clsBookings = bookings.filter((b) => b.classId === cls.id);
      acc[key].totalBookings += clsBookings.length;
      acc[key].attended += clsBookings.filter(
        (b) => b.attendanceStatus === 'attended' || (b.attendanceStatus !== 'no_show' && b.attended)
      ).length;
      acc[key].noShow += clsBookings.filter((b) => b.attendanceStatus === 'no_show').length;
      return acc;
    }, {})
  ).sort((a, b) => a.time.localeCompare(b.time) || a.title.localeCompare(b.title));

  const esteticaClasses = classes
    .filter((c) => c.category === 'Estetica' || getPillarForCategory(c.category) === 'estetica')
    .sort((a, b) => b.date.localeCompare(a.date));

  const esteticaBookings = bookings.filter((b) =>
    esteticaClasses.some((c) => c.id === b.classId)
  );

  const esteticaClientSummaries = students
    .map((st) => {
      const stEstBookings = esteticaBookings
        .filter((b) => b.studentId === st.id)
        .map((b) => {
          const c = esteticaClasses.find((item) => item.id === b.classId);
          return { ...b, classObj: c };
        })
        .filter((item) => item.classObj)
        .sort((a, b) => b.classObj.date.localeCompare(a.classObj.date));

      const lastEntry = stEstBookings[0];
      const suggestedDate = lastEntry
        ? addDaysToISO(lastEntry.classObj.date, 21)
        : addDaysToISO(todayISO, 7);

      return {
        student: st,
        lastDate: lastEntry?.classObj?.date || null,
        lastTitle: lastEntry?.classObj?.title || 'Sin sesión previa',
        suggestedDate,
        totalSessions: stEstBookings.length
      };
    })
    .filter((item) => item.totalSessions > 0 || !hasActiveSubscriptionPlan(item.student));

  const publishedPlansForStudents = plans.filter((p) => !p.isNone);

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
              onClick={fetchAllData}
              title="Actualizar datos"
              className="p-2 rounded-xl text-stone-500 hover:bg-black/[0.04] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <div className="flex items-center bg-black/[0.04] p-1 rounded-xl border border-black/[0.05]">
              <button
                onClick={() => setRole('student')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  role === 'student'
                    ? 'bg-[#5C7362] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Vista Alumno
              </button>
              <button
                onClick={handleSelectAdminMode}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                  role === 'admin'
                    ? 'bg-[#5C7362] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {isAdminUnlocked ? (
                  <ShieldCheck className="w-3.5 h-3.5" />
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
                Modo Estudio
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6 flex-1 w-full">
        {loading && students.length === 0 && classes.length === 0 ? (
          <div className="text-center py-16 text-stone-500">
            Conectando con la agenda de Espacio Sat-Nam...
          </div>
        ) : role === 'student' ? (
          /* ================= VISTA ALUMNO ================= */
          <div className="space-y-6">
            <div className="bg-white/80 rounded-3xl px-5 py-4 border border-stone-200/70">
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Un lugar creado para mejorar tu calidad de vida desde el{' '}
                <strong className="font-medium text-stone-800">bienestar integral</strong>: Yoga
                Terapia y Restaurativo, Spinning, Pilates y Circuito, Coaching y PNL para
                acompañar tus procesos de cambio, Constelaciones, y Estética y Cosmiatría.
              </p>
            </div>

            {students.length > 0 ? (
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/70 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#5C7362]" />
                <div className="flex items-center gap-3.5 pl-2">
                  <div className="w-11 h-11 rounded-2xl bg-[#EDF3EE] text-[#4C6352] font-semibold flex items-center justify-center text-base">
                    {activeStudent?.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-stone-400 uppercase tracking-wider font-medium">
                        Hola,
                      </span>
                      <select
                        value={activeStudentId}
                        onChange={(e) => {
                          const nextId = e.target.value;
                          setActiveStudentId(nextId);
                          const chosen = students.find((x) => x.id === nextId);
                          if (chosen && !canStudentOperate(chosen) && selectedDate > todayISO) {
                            setSelectedDate(todayISO);
                          }
                        }}
                        className="text-sm font-semibold bg-[#F7F5F0] border border-stone-200 rounded-xl px-2.5 py-1 focus:outline-none focus:border-[#5C7362]"
                      >
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <button
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

                      {activeStudent &&
                        studentAllowed &&
                        studentHasPlan &&
                        !isUnlimitedPlan(activeStudent.plan) && (
                          <span className="text-xs text-stone-600">
                            • Saldo: <strong>{activeStudent.credits}</strong> disponibles (
                            {getStudentQuotaDisplay(activeStudent)})
                          </span>
                        )}
                    </div>

                    {activeStudent && !studentAllowed && (
                      <p className="text-xs text-rose-700 font-medium mt-1.5">
                        Tu plan está vencido. No puedes reservar ni cancelar turnos. Comunicate con el
                        espacio para reactivar tu plan.
                      </p>
                    )}

                    {activeStudent && studentAllowed && !studentHasPlan && (
                      <p className="text-xs text-stone-500 mt-1.5">
                        Tenés acceso a sesiones y tratamientos individuales (sin abono de clases).
                      </p>
                    )}
                  </div>
                </div>

                {activeStudent && studentHasPlan && (
                  <div className="text-xs text-stone-500 sm:text-right border-t sm:border-t-0 pt-2.5 sm:pt-0 border-stone-100 pl-2 sm:pl-0">
                    Vencimiento:
                    <span className="block font-semibold text-sm">
                      {formatDateDDMMYYYY(activeStudent?.expiryDate)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-stone-200 rounded-2xl p-4 text-sm text-stone-600">
                Aún no hay alumnos registrados en la agenda. Consulta en recepción para darte de alta.
              </div>
            )}

            {/* Planes y Precios publicados en la página de inicio del alumno */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/70 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Planes y Precios</h2>
                <span className="text-xs text-stone-500">Espacio Sat-Nam</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {publishedPlansForStudents.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl bg-[#F7F5F0] border border-stone-200/80 flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[#2D332F]">{p.name}</p>
                      <p className="text-[11px] text-stone-500">
                        {p.isUnlimited ? 'Pase Libre' : `${p.credits} ${p.credits === 1 ? 'sesión' : 'clases'}`}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#5C7362] bg-[#EDF3EE] px-2.5 py-1 rounded-xl shrink-0">
                      {formatPriceARS(p.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calendario interactivo para seleccionar fecha y ver clases */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">Agenda y Reservas</h2>
                  <p className="text-sm text-stone-500">
                    Entrá a una fecha en el calendario para ver sus clases y reservar
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-stone-200/80 shadow-2xs w-fit">
                  <Calendar className="w-4 h-4 text-[#5C7362]" />
                  <span className="text-xs font-semibold text-[#2D332F]">
                    Fecha seleccionada: {formatDateDDMMYYYY(selectedDate)}
                  </span>
                </div>
              </div>

              {/* Calendario mensual interactivo */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/70 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      const prev = new Date(studentCalendarMonth);
                      prev.setMonth(prev.getMonth() - 1);
                      setStudentCalendarMonth(prev);
                    }}
                    className="p-1.5 rounded-xl border border-stone-200 hover:bg-stone-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-semibold text-sm sm:text-base">
                    {MONTH_NAMES[studentCalendarMonth.getMonth()]} {studentCalendarMonth.getFullYear()}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = new Date(studentCalendarMonth);
                      next.setMonth(next.getMonth() + 1);
                      setStudentCalendarMonth(next);
                    }}
                    className="p-1.5 rounded-xl border border-stone-200 hover:bg-stone-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-stone-400">
                  <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
                </div>

                <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                  {getMonthGridDays(studentCalendarMonth).map((dayObj, idx) => {
                    if (!dayObj) return <div key={`st-empty-${idx}`} className="p-2" />;
                    const iso = toISODate(dayObj);
                    const isSelected = iso === selectedDate;
                    const isVac = Boolean(getVacationForDate(iso));
                    const isBlockedFuture =
                      (!studentAllowed && iso > todayISO) ||
                      (studentAllowed && studentHasPlan && activeStudent?.expiryDate && iso > activeStudent.expiryDate);
                    const dayClassesCount = classes.filter((c) => c.date === iso).length;

                    return (
                      <button
                        type="button"
                        key={iso}
                        onClick={() => {
                          if (isBlockedFuture) {
                            showToast(
                              'Tu plan está vencido. No puedes reservar ni cancelar turnos. Comunicate con el espacio para reactivar tu plan.',
                              'error'
                            );
                            return;
                          }
                          setSelectedDate(iso);
                        }}
                        className={`p-1.5 sm:p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center min-h-[54px] ${
                          isSelected
                            ? 'bg-[#5C7362] text-white border-[#5C7362]'
                            : isBlockedFuture
                            ? 'bg-stone-100/70 text-stone-400 border-stone-200/50'
                            : isVac
                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                            : 'bg-[#F7F5F0]/60 border-stone-200/80 hover:border-stone-300'
                        }`}
                      >
                        <span className="text-xs sm:text-sm font-semibold">{dayObj.getDate()}</span>
                        {isVac ? (
                          <span className="mt-0.5 text-[9px] px-1 rounded-full font-semibold bg-amber-100 text-amber-800">
                            Vac.
                          </span>
                        ) : (
                          dayClassesCount > 0 && (
                            <span
                              className={`mt-0.5 text-[10px] px-1.5 rounded-full font-medium ${
                                isSelected ? 'bg-white/25 text-white' : 'bg-[#EDF3EE] text-[#4C6352]'
                              }`}
                            >
                              {dayClassesCount}
                            </span>
                          )
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filtro por categorías */}
              <div className="flex flex-wrap items-center gap-2">
                {PILLARS.map((pil) => (
                  <button
                    key={pil.id}
                    onClick={() => setPillarFilter(pil.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-all border ${
                      pillarFilter === pil.id
                        ? 'bg-[#5C7362] text-white border-transparent shadow-xs'
                        : 'bg-white text-stone-600 border-stone-200/80 hover:border-stone-300'
                    }`}
                  >
                    {pil.label}
                  </button>
                ))}
              </div>
            </div>

            {getVacationForDate(selectedDate) ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-amber-200/90 shadow-2xs space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  <Palmtree className="w-4 h-4" /> Cerrado por vacaciones
                </span>
                <p className="text-sm text-stone-600">
                  El estudio se encuentra <strong>cerrado por vacaciones</strong> del{' '}
                  <strong>{formatDateDDMMYYYY(getVacationForDate(selectedDate).startDate)}</strong> al{' '}
                  <strong>{formatDateDDMMYYYY(getVacationForDate(selectedDate).endDate)}</strong>.
                </p>
              </div>
            ) : studentFilteredClasses.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-stone-200/70">
                <p className="text-stone-500 text-sm">
                  No hay actividades disponibles para el <strong>{formatDateDDMMYYYY(selectedDate)}</strong> en esta categoría.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentFilteredClasses.map((cls) => {
                  const classBookings = bookings.filter((b) => b.classId === cls.id);
                  const isBooked = activeStudent
                    ? classBookings.some((b) => b.studentId === activeStudent.id)
                    : false;
                  const isFull = classBookings.length >= cls.capacity;
                  const onWaitlist = activeStudent
                    ? (waitlistMap[cls.id] || []).includes(activeStudent.id)
                    : false;
                  const dateBeyondExpiry =
                    studentHasPlan && activeStudent?.expiryDate && cls.date > activeStudent.expiryDate;

                  const srvObj = services.find((s) => s.id === cls.category);
                  const categoryLabel = (srvObj ? srvObj.label : cls.category || '')
                    .trim()
                    .toLowerCase();
                  const classTitle = (cls.title || '').trim().toLowerCase();
                  const hideDuplicateBadge =
                    categoryLabel && classTitle && categoryLabel === classTitle;

                  return (
                    <div
                      key={cls.id}
                      className={`bg-white rounded-3xl p-5 border transition-all flex flex-col justify-between ${
                        cls.is_cancelled
                          ? 'border-stone-200 bg-stone-50/70 opacity-80'
                          : isBooked
                          ? 'border-[#5C7362] ring-1 ring-[#5C7362]/25 shadow-sm'
                          : 'border-stone-200/70 shadow-2xs hover:border-stone-300'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2.5">
                          <div>{!hideDuplicateBadge ? getCategoryBadge(cls.category) : null}</div>
                          {cls.is_cancelled ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                              <Ban className="w-3.5 h-3.5" /> Clase cancelada
                            </span>
                          ) : (
                            isBooked && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#5C7362] text-white shadow-xs">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Reservado
                              </span>
                            )
                          )}
                        </div>

                        <h3 className="font-semibold text-lg">{cls.title}</h3>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-stone-600 mt-3">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-[#5C7362]" />
                            {cls.time} hs ({cls.duration} min)
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-[#5C7362]" />
                            {cls.instructor}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                        <div>
                          {cls.is_cancelled ? (
                            <span className="text-xs text-stone-500 font-medium">
                              No disponible por hoy
                            </span>
                          ) : (
                            <span
                              className={`text-xs font-medium px-2.5 py-1 rounded-xl ${
                                isFull ? 'bg-rose-100/80 text-rose-700' : 'bg-[#EDF3EE] text-[#4C6352]'
                              }`}
                            >
                              {isFull ? 'Clase completa' : 'Cupos disponibles'}
                            </span>
                          )}
                        </div>

                        {!cls.is_cancelled && (
                          <div className="flex items-center gap-2">
                            {isFull && !isBooked ? (
                              <button
                                onClick={() => handleToggleWaitlist(cls.id)}
                                disabled={!studentAllowed || dateBeyondExpiry}
                                className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                                  !studentAllowed || dateBeyondExpiry
                                    ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                                    : onWaitlist
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : 'bg-[#5C7362] hover:bg-[#4B5F50] text-white'
                                }`}
                              >
                                <ListPlus className="w-3.5 h-3.5" />
                                {onWaitlist ? 'En lista de espera' : 'Lista de espera'}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleBooking(cls.id)}
                                disabled={!studentAllowed || (!isBooked && dateBeyondExpiry)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                  !studentAllowed || (!isBooked && dateBeyondExpiry)
                                    ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                                    : isBooked
                                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/80'
                                    : 'bg-[#5C7362] hover:bg-[#4B5F50] text-white shadow-xs'
                                }`}
                              >
                                {isBooked ? 'Cancelar Reserva' : 'Reservar'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ================= MODO ESTUDIO (ADMIN) ================= */
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="hidden md:flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-stone-200/80 w-fit shadow-2xs">
                <button
                  onClick={() => setAdminTab('schedule')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    adminTab === 'schedule' ? 'bg-[#5C7362] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Calendar className="w-4 h-4" /> Calendario & Clases
                </button>
                <button
                  onClick={() => setAdminTab('attendance')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    adminTab === 'attendance' ? 'bg-[#5C7362] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <ClipboardCheck className="w-4 h-4" /> Asistencia
                </button>
                <button
                  onClick={() => setAdminTab('dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    adminTab === 'dashboard' ? 'bg-[#5C7362] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" /> Dashboard
                </button>
                <button
                  onClick={() => setAdminTab('estetica')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    adminTab === 'estetica' ? 'bg-[#5C7362] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Flower2 className="w-4 h-4" /> Estética
                </button>
                <button
                  onClick={() => setAdminTab('students')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    adminTab === 'students' ? 'bg-[#5C7362] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Users className="w-4 h-4" /> Alumnos
                </button>
                <button
                  onClick={() => setAdminTab('payments')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    adminTab === 'payments' ? 'bg-[#5C7362] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> Pagos & Comunicaciones
                </button>
              </div>

              <button
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
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">Calendario & Clases</h2>
                    <p className="text-sm text-stone-500">
                      Gestioná servicios, programá horarios, cargá licencias o cancelá clases
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingServiceId(null);
                        setServiceForm({ label: '', pillar: 'cuerpo', isClass: true, defaultCap: 10 });
                        setShowServiceModal(true);
                      }}
                      className="flex items-center gap-1.5 bg-white hover:bg-stone-50 text-[#5C7362] border border-[#5C7362]/40 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                    >
                      <Plus className="w-4 h-4" /> Servicios
                    </button>

                    <button
                      onClick={handleOpenNewClassModal}
                      className="flex items-center gap-1.5 bg-[#5C7362] hover:bg-[#4B5F50] text-white shadow-xs px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                    >
                      <Plus className="w-4 h-4" /> Programar Horarios
                    </button>

                    <button
                      onClick={() => {
                        setVacationForm({
                          startDate: selectedDate,
                          endDate: addDaysToISO(selectedDate, 7)
                        });
                        setShowVacationModal(true);
                      }}
                      className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                    >
                      <Palmtree className="w-4 h-4" /> Licencia / Vacaciones
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/70 shadow-2xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleNavigateCalendar(-1)} className="p-1.5 rounded-xl border border-stone-200 hover:bg-stone-50">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="font-semibold text-sm sm:text-base min-w-[140px] text-center">
                        {MONTH_NAMES[calendarCursor.getMonth()]} {calendarCursor.getFullYear()}
                      </span>
                      <button onClick={() => handleNavigateCalendar(1)} className="p-1.5 rounded-xl border border-stone-200 hover:bg-stone-50">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const now = new Date();
                          setCalendarCursor(now);
                          setSelectedDate(toISODate(now));
                        }}
                        className="text-xs font-medium text-[#5C7362] bg-[#EDF3EE] px-2.5 py-1 rounded-lg ml-1"
                      >
                        Hoy
                      </button>
                    </div>

                    <div className="flex items-center bg-[#F7F5F0] p-1 rounded-xl border border-stone-200/70">
                      <button
                        onClick={() => setCalendarView('week')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          calendarView === 'week' ? 'bg-[#5C7362] text-white shadow-2xs' : 'text-stone-600'
                        }`}
                      >
                        Semanal
                      </button>
                      <button
                        onClick={() => setCalendarView('month')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          calendarView === 'month' ? 'bg-[#5C7362] text-white shadow-2xs' : 'text-stone-600'
                        }`}
                      >
                        Mensual
                      </button>
                    </div>
                  </div>

                  {calendarView === 'week' ? (
                    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                      {getWeekDays(calendarCursor).map((dayObj) => {
                        const iso = toISODate(dayObj);
                        const isSelected = iso === selectedDate;
                        const isToday = iso === todayISO;
                        const isVac = Boolean(getVacationForDate(iso));
                        const count = classes.filter((c) => c.date === iso).length;
                        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

                        return (
                          <button
                            key={iso}
                            onClick={() => setSelectedDate(iso)}
                            className={`p-2 sm:p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between min-h-[76px] ${
                              isSelected
                                ? 'bg-[#5C7362] text-white border-[#5C7362] shadow-xs'
                                : isVac
                                ? 'bg-amber-50/90 border-amber-200 text-amber-900'
                                : isToday
                                ? 'bg-[#EDF3EE] border-[#5C7362]/40 text-[#2D332F]'
                                : 'bg-[#F7F5F0]/60 border-stone-200/80 hover:border-stone-300'
                            }`}
                          >
                            <span className={`text-[11px] font-medium ${isSelected ? 'text-white/80' : 'text-stone-500'}`}>
                              {dayNames[dayObj.getDay()]}
                            </span>
                            <span className="text-base sm:text-lg font-bold my-0.5">{dayObj.getDate()}</span>
                            {isVac ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800">
                                Vacaciones
                              </span>
                            ) : count > 0 ? (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                                  isSelected ? 'bg-white/20 text-white' : 'bg-[#EDF3EE] text-[#4C6352]'
                                }`}
                              >
                                {count} {count === 1 ? 'clase' : 'clases'}
                              </span>
                            ) : (
                              <span className="text-[10px] opacity-40">—</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div>
                      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-stone-400 mb-1.5">
                        <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                        {getMonthGridDays(calendarCursor).map((dayObj, idx) => {
                          if (!dayObj) return <div key={`empty-${idx}`} className="p-2" />;
                          const iso = toISODate(dayObj);
                          const isSelected = iso === selectedDate;
                          const isToday = iso === todayISO;
                          const isVac = Boolean(getVacationForDate(iso));
                          const count = classes.filter((c) => c.date === iso).length;

                          return (
                            <button
                              key={iso}
                              onClick={() => setSelectedDate(iso)}
                              className={`p-1.5 sm:p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center min-h-[54px] ${
                                isSelected
                                  ? 'bg-[#5C7362] text-white border-[#5C7362]'
                                  : isVac
                                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                                  : isToday
                                  ? 'bg-[#EDF3EE] border-[#5C7362]/40'
                                  : 'bg-[#F7F5F0]/50 border-stone-200/70 hover:border-stone-300'
                              }`}
                            >
                              <span className="text-xs sm:text-sm font-semibold">{dayObj.getDate()}</span>
                              {isVac ? (
                                <span className="mt-0.5 text-[9px] px-1 rounded-full font-semibold bg-amber-100 text-amber-800">
                                  Lic.
                                </span>
                              ) : (
                                count > 0 && (
                                  <span
                                    className={`mt-0.5 text-[10px] px-1.5 rounded-full font-medium ${
                                      isSelected ? 'bg-white/25 text-white' : 'bg-[#EDF3EE] text-[#4C6352]'
                                    }`}
                                  >
                                    {count}
                                  </span>
                                )
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-base">
                      Clases del día: <span className="text-[#5C7362]">{formatDateDDMMYYYY(selectedDate)}</span>
                    </h3>
                    <span className="text-xs text-stone-500">
                      {dayClassesAdmin.length} {dayClassesAdmin.length === 1 ? 'clase' : 'clases'}
                    </span>
                  </div>

                  {getVacationForDate(selectedDate) && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-xs text-amber-900">
                      <strong>Licencia / Vacaciones activa:</strong> del{' '}
                      <strong>{formatDateDDMMYYYY(getVacationForDate(selectedDate).startDate)}</strong> al{' '}
                      <strong>{formatDateDDMMYYYY(getVacationForDate(selectedDate).endDate)}</strong>. En Vista
                      Alumno figura como <em>Cerrado por vacaciones</em>.
                    </div>
                  )}

                  {dayClassesAdmin.length === 0 ? (
                    <div className="bg-white rounded-3xl p-8 text-center border border-stone-200/70 text-stone-500 text-sm">
                      No hay clases programadas para el <strong>{formatDateDDMMYYYY(selectedDate)}</strong>.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dayClassesAdmin.map((cls) => {
                        const classBookings = bookings.filter((b) => b.classId === cls.id);
                        const cancelledAt = cls.cancelled_at || cancelledTimestamps[cls.id];
                        const waitingCount = (waitlistMap[cls.id] || []).length;

                        return (
                          <div
                            key={cls.id}
                            className={`bg-white rounded-3xl p-5 border shadow-2xs ${
                              cls.is_cancelled ? 'border-rose-200 bg-rose-50/20' : 'border-stone-200/70'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div>
                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                  {getCategoryBadge(cls.category)}
                                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-lg bg-[#EDF3EE] text-[#4C6352]">
                                    {cls.time} hs ({cls.duration} min)
                                  </span>
                                  <span className="text-xs text-stone-500 font-medium">
                                    Inscritos: {classBookings.length}/{cls.capacity}
                                  </span>
                                  {waitingCount > 0 && (
                                    <span className="text-xs font-medium px-2 py-0.5 bg-amber-100 text-amber-800 rounded-lg">
                                      Espera: {waitingCount}
                                    </span>
                                  )}
                                  {cls.is_cancelled && (
                                    <span className="text-xs font-semibold px-2 py-0.5 bg-rose-100 text-rose-700 rounded-lg">
                                      CANCELADA
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-semibold text-base">
                                  {cls.title}{' '}
                                  <span className="text-sm font-normal text-stone-500">— {cls.instructor}</span>
                                </h4>
                                {cls.is_cancelled && cancelledAt && (
                                  <p className="text-[11px] text-rose-700 mt-1">
                                    Cancelada el: <strong>{formatTimestamp(cancelledAt)}</strong>
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleOpenEditClass(cls)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-xl border border-stone-200 transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5" /> Editar
                                </button>

                                <button
                                  onClick={() => handleToggleCancelClass(cls.id)}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                    cls.is_cancelled
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                  }`}
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  {cls.is_cancelled ? 'Abrir Clase' : 'Cancelar'}
                                </button>

                                <button
                                  onClick={() => handleRequestDeleteClass(cls)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
                    <p className="text-sm text-stone-500">
                      Marca Asistió o No asistió (marcar No asistió descuenta 1 sesión del abono)
                    </p>
                  </div>

                  <select
                    value={attendanceServiceFilter}
                    onChange={(e) => setAttendanceServiceFilter(e.target.value)}
                    className="text-sm font-medium bg-white px-3 py-2 rounded-xl border border-stone-200/80 w-fit"
                  >
                    <option value="ALL">Todos los servicios</option>
                    {services.map((srv) => (
                      <option key={srv.id} value={srv.id}>{srv.label}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/70 shadow-2xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleNavigateCalendar(-1)} className="p-1.5 rounded-xl border border-stone-200 hover:bg-stone-50">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="font-semibold text-sm sm:text-base min-w-[140px] text-center">
                        {MONTH_NAMES[calendarCursor.getMonth()]} {calendarCursor.getFullYear()}
                      </span>
                      <button onClick={() => handleNavigateCalendar(1)} className="p-1.5 rounded-xl border border-stone-200 hover:bg-stone-50">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const now = new Date();
                          setCalendarCursor(now);
                          setSelectedDate(toISODate(now));
                        }}
                        className="text-xs font-medium text-[#5C7362] bg-[#EDF3EE] px-2.5 py-1 rounded-lg ml-1"
                      >
                        Hoy
                      </button>
                    </div>

                    <div className="flex items-center bg-[#F7F5F0] p-1 rounded-xl border border-stone-200/70">
                      <button
                        onClick={() => setCalendarView('week')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          calendarView === 'week' ? 'bg-[#5C7362] text-white shadow-2xs' : 'text-stone-600'
                        }`}
                      >
                        Semanal
                      </button>
                      <button
                        onClick={() => setCalendarView('month')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          calendarView === 'month' ? 'bg-[#5C7362] text-white shadow-2xs' : 'text-stone-600'
                        }`}
                      >
                        Mensual
                      </button>
                    </div>
                  </div>

                  {calendarView === 'week' ? (
                    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                      {getWeekDays(calendarCursor).map((dayObj) => {
                        const iso = toISODate(dayObj);
                        const isSelected = iso === selectedDate;
                        const isToday = iso === todayISO;
                        const count = classes.filter((c) => c.date === iso).length;
                        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

                        return (
                          <button
                            key={iso}
                            onClick={() => setSelectedDate(iso)}
                            className={`p-2 sm:p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between min-h-[76px] ${
                              isSelected
                                ? 'bg-[#5C7362] text-white border-[#5C7362] shadow-xs'
                                : isToday
                                ? 'bg-[#EDF3EE] border-[#5C7362]/40 text-[#2D332F]'
                                : 'bg-[#F7F5F0]/60 border-stone-200/80 hover:border-stone-300'
                            }`}
                          >
                            <span className={`text-[11px] font-medium ${isSelected ? 'text-white/80' : 'text-stone-500'}`}>
                              {dayNames[dayObj.getDay()]}
                            </span>
                            <span className="text-base sm:text-lg font-bold my-0.5">{dayObj.getDate()}</span>
                            {count > 0 ? (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                                  isSelected ? 'bg-white/20 text-white' : 'bg-[#EDF3EE] text-[#4C6352]'
                                }`}
                              >
                                {count} {count === 1 ? 'clase' : 'clases'}
                              </span>
                            ) : (
                              <span className="text-[10px] opacity-40">—</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div>
                      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-stone-400 mb-1.5">
                        <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                        {getMonthGridDays(calendarCursor).map((dayObj, idx) => {
                          if (!dayObj) return <div key={`empty-${idx}`} className="p-2" />;
                          const iso = toISODate(dayObj);
                          const isSelected = iso === selectedDate;
                          const isToday = iso === todayISO;
                          const count = classes.filter((c) => c.date === iso).length;

                          return (
                            <button
                              key={iso}
                              onClick={() => setSelectedDate(iso)}
                              className={`p-1.5 sm:p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center min-h-[54px] ${
                                isSelected
                                  ? 'bg-[#5C7362] text-white border-[#5C7362]'
                                  : isToday
                                  ? 'bg-[#EDF3EE] border-[#5C7362]/40'
                                  : 'bg-[#F7F5F0]/50 border-stone-200/70 hover:border-stone-300'
                              }`}
                            >
                              <span className="text-xs sm:text-sm font-semibold">{dayObj.getDate()}</span>
                              {count > 0 && (
                                <span
                                  className={`mt-0.5 text-[10px] px-1.5 rounded-full font-medium ${
                                    isSelected ? 'bg-white/25 text-white' : 'bg-[#EDF3EE] text-[#4C6352]'
                                  }`}
                                >
                                  {count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">
                    Planilla del día: <span className="text-[#5C7362]">{formatDateDDMMYYYY(selectedDate)}</span>
                  </h3>

                  {attendanceDayClasses.length === 0 ? (
                    <div className="bg-white rounded-3xl p-8 text-center border border-stone-200/70 text-stone-500 text-sm">
                      No hay clases para tomar asistencia en esta fecha o filtro.
                    </div>
                  ) : (
                    attendanceDayClasses.map((cls) => {
                      const classBookings = bookings.filter((b) => b.classId === cls.id);
                      const pendingCount = classBookings.filter((b) => !b.attendanceStatus && !b.attended).length;

                      return (
                        <div key={cls.id} className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-2xs space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100">
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                {getCategoryBadge(cls.category)}
                                <span className="text-xs font-medium px-2.5 py-0.5 rounded-lg bg-[#EDF3EE] text-[#4C6352]">
                                  {cls.time} hs
                                </span>
                                {cls.is_cancelled && (
                                  <span className="text-xs font-semibold px-2 py-0.5 bg-rose-100 text-rose-700 rounded-lg">
                                    CANCELADA
                                  </span>
                                )}
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
                                        onClick={() => handleRequestAttendanceChange(booking, 'attended', st.name)}
                                        className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-xl transition-all ${
                                          isAttended
                                            ? 'bg-[#5C7362] text-white'
                                            : 'bg-white text-stone-600 border border-stone-200 hover:bg-[#EDF3EE]'
                                        }`}
                                      >
                                        <UserCheck className="w-3.5 h-3.5" />
                                        Asistió
                                      </button>

                                      <button
                                        onClick={() => handleRequestAttendanceChange(booking, 'no_show', st.name)}
                                        className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-xl transition-all ${
                                          isNoShow
                                            ? 'bg-rose-600 text-white'
                                            : 'bg-white text-stone-600 border border-stone-200 hover:bg-rose-50'
                                        }`}
                                      >
                                        <UserX className="w-3.5 h-3.5" />
                                        No asistió
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
              </div>
            )}

            {adminTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">Dashboard</h2>
                    <p className="text-sm text-stone-500">
                      Toca Clases del Día o Reservas del Día para ver el detalle
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center bg-white p-1 rounded-xl border border-stone-200/80">
                      <button
                        onClick={() => setDashboardScope('day')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          dashboardScope === 'day' ? 'bg-[#5C7362] text-white' : 'text-stone-600'
                        }`}
                      >
                        Vista Diaria
                      </button>
                      <button
                        onClick={() => setDashboardScope('month')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          dashboardScope === 'month' ? 'bg-[#5C7362] text-white' : 'text-stone-600'
                        }`}
                      >
                        Visión Mensual
                      </button>
                    </div>

                    {dashboardScope === 'day' ? (
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="text-sm font-medium bg-white px-3 py-1.5 rounded-xl border border-stone-200/80"
                      />
                    ) : (
                      <input
                        type="month"
                        value={dashboardMonth}
                        onChange={(e) => setDashboardMonth(e.target.value)}
                        className="text-sm font-medium bg-white px-3 py-1.5 rounded-xl border border-stone-200/80"
                      />
                    )}
                  </div>
                </div>

                {dashboardScope === 'day' ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setOpenClassesPanel((prev) => !prev)}
                        className={`text-left bg-white rounded-3xl p-5 border transition-all shadow-2xs ${
                          openClassesPanel
                            ? 'border-[#5C7362] ring-1 ring-[#5C7362]/25'
                            : 'border-stone-200/70 hover:border-stone-300'
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
                          openBookingsPanel
                            ? 'border-[#5C7362] ring-1 ring-[#5C7362]/25'
                            : 'border-stone-200/70 hover:border-stone-300'
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
                          <h3 className="font-semibold text-base">
                            Clases Disponibles del Día ({formatDateDDMMYYYY(selectedDate)})
                          </h3>
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
                                      <p className="font-semibold text-sm text-[#2D332F]">
                                        {cls.time} hs • {cls.title}
                                      </p>
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
                          <h3 className="font-semibold text-base">
                            Listado de Reservas del Día ({formatDateDDMMYYYY(selectedDate)})
                          </h3>
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
                <div>
                  <h2 className="text-xl font-semibold">Dashboard de Estética & Cosmiatría</h2>
                  <p className="text-sm text-stone-500">
                    Seguimiento de última sesión, sugerencia de próximo turno y notificación push
                  </p>
                </div>

                {esteticaClientSummaries.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 text-center border border-stone-200/70 text-sm text-stone-500">
                    Aún no hay sesiones o personas registradas para seguimiento de estética.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {esteticaClientSummaries.map(({ student, lastDate, lastTitle, suggestedDate }) => (
                      <div key={student.id} className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-2xs space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-base">{student.name}</h3>
                            <p className="text-xs text-[#5C7362] font-medium">{student.plan}</p>
                          </div>
                          {getStatusBadge(student)}
                        </div>

                        <div className="bg-[#F7F5F0] rounded-2xl p-3 text-xs space-y-1.5 text-stone-700">
                          <p className="flex items-center gap-1.5">
                            <Clock3 className="w-3.5 h-3.5 text-[#5C7362]" />
                            Última sesión:{' '}
                            <strong>{lastDate ? `${formatDateDDMMYYYY(lastDate)} (${lastTitle})` : 'Sin registro'}</strong>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#5C7362]" />
                            Sugerencia de turno: <strong>{formatDateDDMMYYYY(suggestedDate)}</strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              showToast(
                                `Notificación push enviada a ${student.name}: Sugerencia de turno para el ${formatDateDDMMYYYY(suggestedDate)}`
                              )
                            }
                            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#5C7362] hover:bg-[#4B5F50] text-white py-2 px-3 rounded-xl text-xs font-semibold transition-all"
                          >
                            <Bell className="w-3.5 h-3.5" />
                            Notificación push
                          </button>

                          {student.phone && (
                            <a
                              href={`https://wa.me/${student.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                `¡Hola ${student.name}! Desde Espacio Sat-Nam te recordamos tu última sesión (${lastTitle}) y te sugerimos agendar tu próximo turno alrededor del ${formatDateDDMMYYYY(suggestedDate)}. 🪷`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white py-2 px-3 rounded-xl text-xs font-semibold transition-all"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              WhatsApp
                            </a>
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
                                <span className="bg-[#EDF3EE] text-[#4C6352] px-2.5 py-0.5 rounded-lg font-medium">
                                  Pase Libre
                                </span>
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
                                  onClick={() => handleOpenEditStudent(st)}
                                  title="Editar registro"
                                  className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-lg border border-stone-200 transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleRequestDeleteStudent(st)}
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
                    <p className="text-sm text-stone-500">
                      Gestioná planes y precios, recordatorios por WhatsApp, renovaciones, fechas y pausas
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPlanId(null);
                      setPlanForm({ name: '', credits: 4, price: 50000, isUnlimited: false });
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
                      openPaymentsPanel === 'active'
                        ? 'border-[#5C7362] ring-1 ring-[#5C7362]/25'
                        : 'border-stone-200/70 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                        Activos
                      </span>
                      {openPaymentsPanel === 'active' ? <ChevronUp className="w-4 h-4 text-[#5C7362]" /> : <ChevronDown className="w-4 h-4 text-[#5C7362]" />}
                    </div>
                    <p className="text-2xl font-bold text-[#5C7362] mt-1">{activePaymentStudents.length}</p>
                    <p className="text-xs text-[#5C7362] font-medium mt-1">Tocá para ver alumnos activos</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOpenPaymentsPanel((prev) => (prev === 'renew' ? null : 'renew'))}
                    className={`text-left bg-white rounded-3xl p-5 border transition-all shadow-2xs ${
                      openPaymentsPanel === 'renew'
                        ? 'border-[#5C7362] ring-1 ring-[#5C7362]/25'
                        : 'border-stone-200/70 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                        Por Renovar
                      </span>
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

                    {(openPaymentsPanel === 'active' ? activePaymentStudents : renewPaymentStudents).length === 0 ? (
                      <div className="bg-white rounded-3xl p-8 text-center border border-stone-200/70 text-stone-500 text-sm">
                        No hay alumnos en este grupo actualmente.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(openPaymentsPanel === 'active' ? activePaymentStudents : renewPaymentStudents).map((st) => {
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
                                    <MessageCircle className="w-4 h-4" />
                                    Recordatorio WhatsApp
                                  </a>

                                  <button
                                    type="button"
                                    onClick={() => handleOpenRenewOrDates(st)}
                                    className="flex items-center justify-center gap-1 bg-[#EDF3EE] hover:bg-[#dce8de] text-[#4C6352] py-2 px-3 rounded-xl text-xs font-semibold transition-all"
                                  >
                                    <CalendarRange className="w-3.5 h-3.5" />
                                    Renovar / Fechas
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleTogglePausePlan(st)}
                                  className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                                    paused
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
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
          © {new Date().getFullYear()}{' '}
          <strong className="font-semibold text-stone-800">Espacio Sat-Nam</strong> •{' '}
          <span className="font-medium text-[#5C7362]">by Patricia Aleman</span>. Todos los derechos reservados.
        </p>
      </footer>

      {role === 'admin' && (
        <nav className="md:hidden fixed bottom-8 left-0 right-0 bg-white border-t border-stone-200 flex justify-around py-2 px-1 z-40">
          <button onClick={() => setAdminTab('schedule')} className={`flex flex-col items-center gap-0.5 text-[10px] font-medium ${adminTab === 'schedule' ? 'text-[#5C7362]' : 'text-stone-400'}`}>
            <Calendar className="w-4 h-4" /> Agenda
          </button>
          <button onClick={() => setAdminTab('attendance')} className={`flex flex-col items-center gap-0.5 text-[10px] font-medium ${adminTab === 'attendance' ? 'text-[#5C7362]' : 'text-stone-400'}`}>
            <ClipboardCheck className="w-4 h-4" /> Asistencia
          </button>
          <button onClick={() => setAdminTab('dashboard')} className={`flex flex-col items-center gap-0.5 text-[10px] font-medium ${adminTab === 'dashboard' ? 'text-[#5C7362]' : 'text-stone-400'}`}>
            <BarChart3 className="w-4 h-4" /> Dashboard
          </button>
          <button onClick={() => setAdminTab('estetica')} className={`flex flex-col items-center gap-0.5 text-[10px] font-medium ${adminTab === 'estetica' ? 'text-[#5C7362]' : 'text-stone-400'}`}>
            <Flower2 className="w-4 h-4" /> Estética
          </button>
          <button onClick={() => setAdminTab('students')} className={`flex flex-col items-center gap-0.5 text-[10px] font-medium ${adminTab === 'students' ? 'text-[#5C7362]' : 'text-stone-400'}`}>
            <Users className="w-4 h-4" /> Alumnos
          </button>
          <button onClick={() => setAdminTab('payments')} className={`flex flex-col items-center gap-0.5 text-[10px] font-medium ${adminTab === 'payments' ? 'text-[#5C7362]' : 'text-stone-400'}`}>
            <CreditCard className="w-4 h-4" /> Pagos
          </button>
        </nav>
      )}

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
              <button onClick={() => setShowEditProfileModal(false)}><XCircle className="w-5 h-5 text-stone-400" /></button>
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

      {showVacationModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Palmtree className="w-5 h-5 text-[#5C7362]" /> Licencia / Vacaciones
              </h3>
              <button onClick={() => setShowVacationModal(false)}><XCircle className="w-5 h-5 text-stone-400" /></button>
            </div>

            <form onSubmit={handleSaveVacationPeriod} className="space-y-3.5 text-sm border-b border-stone-100 pb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Desde ({formatDateDDMMYYYY(vacationForm.startDate)})
                  </label>
                  <input required type="date" value={vacationForm.startDate} onChange={(e) => setVacationForm({ ...vacationForm, startDate: e.target.value })} className="w-full border border-stone-200 rounded-xl px-2.5 py-2 text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Hasta ({formatDateDDMMYYYY(vacationForm.endDate)})
                  </label>
                  <input required type="date" value={vacationForm.endDate} onChange={(e) => setVacationForm({ ...vacationForm, endDate: e.target.value })} className="w-full border border-stone-200 rounded-xl px-2.5 py-2 text-xs" />
                </div>
              </div>

              <button type="submit" className="w-full bg-[#5C7362] hover:bg-[#4B5F50] text-white font-medium py-2.5 rounded-xl">
                Bloquear Días y Cancelar Clases
              </button>
            </form>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Períodos Configurados ({vacationPeriods.length})
              </p>
              {vacationPeriods.length === 0 ? (
                <p className="text-xs text-stone-400 italic">No hay licencias o vacaciones cargadas.</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {vacationPeriods.map((vp) => (
                    <div key={vp.id} className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between text-xs">
                      <span>
                        Del <strong>{formatDateDDMMYYYY(vp.startDate)}</strong> al <strong>{formatDateDDMMYYYY(vp.endDate)}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVacationPeriod(vp.id)}
                        className="text-rose-600 hover:bg-rose-100 p-1 rounded-lg"
                        title="Quitar período y reactivar clases"
                      >
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
              <h3 className="font-semibold text-lg">{editingServiceId ? 'Editar Servicio' : 'Administrar Servicios'}</h3>
              <button onClick={() => { setShowServiceModal(false); setEditingServiceId(null); }}>
                <XCircle className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-3 text-sm border-b border-stone-100 pb-4">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Nombre del Servicio</label>
                <input required type="text" placeholder="Ej. Masajes, Yoga Nidra..." value={serviceForm.label} onChange={(e) => setServiceForm({ ...serviceForm, label: e.target.value })} className="w-full border border-stone-200 rounded-xl px-3 py-2" />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Categoría</label>
                  <select value={serviceForm.pillar} onChange={(e) => setServiceForm({ ...serviceForm, pillar: e.target.value })} className="w-full border border-stone-200 rounded-xl px-2.5 py-2 bg-white text-xs">
                    {SELECTABLE_PILLARS.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Cupo Base</label>
                  <input required type="number" min="1" max="60" value={serviceForm.defaultCap} onChange={(e) => setServiceForm({ ...serviceForm, defaultCap: e.target.value })} className="w-full border border-stone-200 rounded-xl px-2.5 py-2 text-xs" />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700">
                <input
                  type="checkbox"
                  checked={serviceForm.isClass}
                  onChange={(e) => setServiceForm({ ...serviceForm, isClass: e.target.checked })}
                  className="rounded accent-[#5C7362] w-4 h-4"
                />
                Es clase grupal regular (requiere plan para alumnos; sin plan acceden a sesiones/tratamientos)
              </label>

              <div className="flex gap-2 pt-1">
                {editingServiceId && (
                  <button type="button" onClick={() => { setEditingServiceId(null); setServiceForm({ label: '', pillar: 'cuerpo', isClass: true, defaultCap: 10 }); }} className="px-3 py-2 rounded-xl text-xs font-medium bg-stone-100 text-stone-600">
                    Cancelar
                  </button>
                )}
                <button type="submit" className="flex-1 bg-[#5C7362] hover:bg-[#4B5F50] text-white font-medium py-2 rounded-xl text-xs">
                  {editingServiceId ? 'Guardar Cambios' : 'Agregar Servicio'}
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
                        {srv.isClass ? 'Clase regular' : 'Sesión / Tratamiento'} • Cupo: {srv.defaultCap}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => handleStartEditService(srv)} className="p-1.5 text-stone-700 bg-white hover:bg-stone-100 rounded-lg border border-stone-200">
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
              <h3 className="font-semibold text-lg">{editingClassId ? 'Editar Clase' : 'Programar Horarios'}</h3>
              <button onClick={() => setShowClassModal(false)}><XCircle className="w-5 h-5 text-stone-400" /></button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">Servicio</label>
                <div className="grid grid-cols-2 gap-2">
                  {services.map((srv) => (
                    <button
                      type="button"
                      key={srv.id}
                      onClick={() =>
                        setClassForm((prev) => ({
                          ...prev,
                          category: srv.id,
                          capacity: srv.defaultCap,
                          title: prev.isCustomTitle ? prev.title : srv.label
                        }))
                      }
                      className={`py-2 px-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                        classForm.category === srv.id ? 'bg-[#5C7362] text-white border-transparent' : 'bg-[#F7F5F0] text-stone-600 border-stone-200'
                      }`}
                    >
                      {srv.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-stone-600">Nombre de la Clase / Taller</label>
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
                    Personalizar nombre
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

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Facilitadora</label>
                <input required type="text" value={classForm.instructor} onChange={(e) => setClassForm({ ...classForm, instructor: e.target.value })} className="w-full border border-stone-200 rounded-xl px-3 py-2 bg-stone-50 font-medium" />
              </div>

              {!editingClassId && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1.5">
                      Días de la semana (desde {formatDateDDMMYYYY(selectedDate)}):
                    </label>
                    <div className="grid grid-cols-7 gap-1">
                      {DAYS_OF_WEEK.map((day) => {
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

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Hora</label>
                  <input required type="time" value={classForm.time} onChange={(e) => setClassForm({ ...classForm, time: e.target.value })} className="w-full border border-stone-200 rounded-xl px-2.5 py-2 text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Duración (min)</label>
                  <input required type="number" min="15" max="480" value={classForm.duration} onChange={(e) => setClassForm({ ...classForm, duration: e.target.value })} className="w-full border border-stone-200 rounded-xl px-2.5 py-2 text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Cupo</label>
                  <input required type="number" min="1" max="60" value={classForm.capacity} onChange={(e) => setClassForm({ ...classForm, capacity: e.target.value })} className="w-full border border-stone-200 rounded-xl px-2.5 py-2 text-xs" />
                </div>
              </div>

              <button type="submit" className="w-full bg-[#5C7362] hover:bg-[#4B5F50] text-white font-medium py-2.5 rounded-xl mt-2">
                {editingClassId ? 'Guardar Cambios' : 'Guardar Horarios'}
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
              <button onClick={() => setShowStudentModal(false)}><XCircle className="w-5 h-5 text-stone-400" /></button>
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
                    {plans.map((p) => (
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
                <select
                  value={studentForm.absenceReason}
                  onChange={(e) => setStudentForm({ ...studentForm, absenceReason: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 bg-white text-xs"
                >
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
              <button onClick={() => setShowRenewDatesModal(false)}><XCircle className="w-5 h-5 text-stone-400" /></button>
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
                <input
                  type="checkbox"
                  checked={renewDatesForm.resetCredits}
                  onChange={(e) => setRenewDatesForm({ ...renewDatesForm, resetCredits: e.target.checked })}
                  className="rounded accent-[#5C7362] w-4 h-4"
                />
                Restablecer sesiones del plan al renovar
              </label>

              <button type="submit" className="w-full bg-[#5C7362] hover:bg-[#4B5F50] text-white font-medium py-2.5 rounded-xl mt-2">
                Guardar Renovación / Fechas
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Crear / Editar Planes (con campo $$ y listado completo con precios) */}
      {showPlanManagerModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">{editingPlanId ? 'Editar Plan' : 'Crear y Editar Planes'}</h3>
              <button onClick={() => { setShowPlanManagerModal(false); setEditingPlanId(null); }}>
                <XCircle className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleSavePlanDefinition} className="space-y-3 text-sm border-b border-stone-100 pb-4">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Nombre del Plan</label>
                <input
                  required
                  type="text"
                  placeholder="Ej. Mensual - 4 veces por semana"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Precio ($$)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="100"
                    placeholder="Ej. 50000"
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Cantidad de clases</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    disabled={planForm.isUnlimited}
                    value={planForm.isUnlimited ? 99 : planForm.credits}
                    onChange={(e) => setPlanForm({ ...planForm, credits: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs disabled:bg-stone-100"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700">
                <input
                  type="checkbox"
                  checked={planForm.isUnlimited}
                  onChange={(e) => setPlanForm({ ...planForm, isUnlimited: e.target.checked })}
                  className="rounded accent-[#5C7362] w-4 h-4"
                />
                Pase Libre
              </label>

              <div className="flex gap-2">
                {editingPlanId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPlanId(null);
                      setPlanForm({ name: '', credits: 4, price: 50000, isUnlimited: false });
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

            {/* Todos los planes listados con sus precios */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Todos los planes ({publishedPlansForStudents.length})
              </p>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {publishedPlansForStudents.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-[#F7F5F0] border border-stone-200/80 flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-[#2D332F]">{p.name}</p>
                      <p className="text-[11px] text-stone-500">
                        {p.isUnlimited ? 'Pase Libre' : `${p.credits} clases`} •{' '}
                        <strong className="text-[#5C7362]">{formatPriceARS(p.price)}</strong>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPlanId(p.id);
                        setPlanForm({
                          name: p.name,
                          credits: p.credits,
                          price: p.price || 0,
                          isUnlimited: Boolean(p.isUnlimited)
                        });
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
