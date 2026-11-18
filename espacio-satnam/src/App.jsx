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
  Ban
} from 'lucide-react';

// Conexión a tu base de datos en Supabase
const supabaseUrl = 'https://miwktvtdygetyzqvccal.supabase.co';
const supabaseKey = 'sb_publishable_45-FeV94kQsHYfau3pJPjg_DOo7R6yx';
const supabase = createClient(supabaseUrl, supabaseKey);

// PIN de acceso al Modo Estudio
const ADMIN_PIN = '1008';

const CATEGORIES = [
  { id: 'Yoga', label: 'Yoga Terapia & Restaurativo', defaultCap: 12 },
  { id: 'Spinning', label: 'Spinning', defaultCap: 10 },
  { id: 'Pilates', label: 'Pilates & Circuito', defaultCap: 10 },
  { id: 'Coaching', label: 'Coaching & PNL', defaultCap: 1 },
  { id: 'Constelaciones', label: 'Constelaciones', defaultCap: 12 },
  { id: 'Estetica', label: 'Estética & Cosmiatría', defaultCap: 1 },
  { id: 'Eventos', label: 'Meditaciones', defaultCap: 20 }
];

const PLAN_OPTIONS = [
  'Sesión Individual (Coaching / PNL / Constelaciones / Estética)',
  'Taller de Constelaciones / Evento Especial',
  'Clase Individual',
  'Mensual - 1 vez por semana',
  'Mensual - 2 veces por semana',
  'Mensual - 3 veces por semana',
  'Pase Libre Clases'
];

// Utilidad para formatear fechas de YYYY-MM-DD a DD-MM-YYYY
const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  return `${day}-${month}-${year}`;
};

// 3 opciones de paleta
const THEMES = {
  sage: {
    name: 'Salvia & Lino',
    swatch: '#5C7362',
    bg: 'bg-[#F7F5F0]',
    textMain: 'text-[#2D332F]',
    headerBorder: 'border-[#E5E0D8]',
    brandAccent: 'text-[#5C7362]',
    subtitleText: 'text-[#737D76]',
    logoBg: 'bg-[#5C7362]',
    cardAccentBar: 'bg-[#5C7362]',
    primaryBtn: 'bg-[#5C7362] hover:bg-[#4B5F50] text-white shadow-xs',
    activePill: 'bg-[#5C7362] text-white shadow-xs',
    softBadge: 'bg-[#EDF3EE] text-[#4C6352]',
    iconAccent: 'text-[#5C7362]',
    bookedRing: 'border-[#5C7362] ring-1 ring-[#5C7362]/25',
    toastBg: 'bg-[#2D332F] text-white',
    focusBorder: 'focus:border-[#5C7362]',
    ringSwatch: 'ring-[#5C7362]'
  },
  terracotta: {
    name: 'Arena & Terracota',
    swatch: '#A85D44',
    bg: 'bg-[#F8F6F2]',
    textMain: 'text-[#2C2A29]',
    headerBorder: 'border-[#EAE4DC]',
    brandAccent: 'text-[#A85D44]',
    subtitleText: 'text-[#847B73]',
    logoBg: 'bg-[#A85D44]',
    cardAccentBar: 'bg-[#A85D44]',
    primaryBtn: 'bg-[#A85D44] hover:bg-[#914E38] text-white shadow-xs',
    activePill: 'bg-[#A85D44] text-white shadow-xs',
    softBadge: 'bg-[#F3EAE5] text-[#8E4B35]',
    iconAccent: 'text-[#A85D44]',
    bookedRing: 'border-[#A85D44] ring-1 ring-[#A85D44]/25',
    toastBg: 'bg-[#2C2A29] text-white',
    focusBorder: 'focus:border-[#A85D44]',
    ringSwatch: 'ring-[#A85D44]'
  },
  indigo: {
    name: 'Piedra & Índigo',
    swatch: '#475B74',
    bg: 'bg-[#F6F7F9]',
    textMain: 'text-[#252B33]',
    headerBorder: 'border-[#E2E6EC]',
    brandAccent: 'text-[#475B74]',
    subtitleText: 'text-[#6E7885]',
    logoBg: 'bg-[#475B74]',
    cardAccentBar: 'bg-[#475B74]',
    primaryBtn: 'bg-[#475B74] hover:bg-[#38495E] text-white shadow-xs',
    activePill: 'bg-[#475B74] text-white shadow-xs',
    softBadge: 'bg-[#E9EEF4] text-[#3B4D63]',
    iconAccent: 'text-[#475B74]',
    bookedRing: 'border-[#475B74] ring-1 ring-[#475B74]/25',
    toastBg: 'bg-[#252B33] text-white',
    focusBorder: 'focus:border-[#475B74]',
    ringSwatch: 'ring-[#475B74]'
  }
};

// Logo oficial: Flor de Loto
function SatNamLogo({ bgClass, className = 'w-14 h-14' }) {
  return (
    <div
      className={`${className} rounded-2xl ${bgClass} p-1.5 flex items-center justify-center text-white shadow-xs shrink-0 transition-colors duration-300`}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <path
          d="M32 6C25 18 22.5 30 32 45C41.5 30 39 18 32 6Z"
          fill="white"
          fillOpacity="0.96"
        />
        <path
          d="M28.5 44C16.5 37 10.5 25 13 13.5C22.5 18.5 27.5 29.5 28.5 44Z"
          fill="white"
          fillOpacity="0.78"
        />
        <path
          d="M35.5 44C47.5 37 53.5 25 51 13.5C41.5 18.5 36.5 29.5 35.5 44Z"
          fill="white"
          fillOpacity="0.78"
        />
        <path
          d="M26 46.5C11.5 46.5 3.5 38 2.5 28.5C13 28.5 21.5 35.5 26 46.5Z"
          fill="white"
          fillOpacity="0.55"
        />
        <path
          d="M38 46.5C52.5 46.5 60.5 38 61.5 28.5C51 28.5 42.5 35.5 38 46.5Z"
          fill="white"
          fillOpacity="0.55"
        />
        <circle cx="32" cy="54" r="3.4" fill="white" fillOpacity="0.92" />
      </svg>
    </div>
  );
}

export default function App() {
  const [themeKey, setThemeKey] = useState(
    () => localStorage.getItem('satnam_theme') || 'sage'
  );

  const t = THEMES[themeKey] || THEMES.sage;

  const handleSelectTheme = (key) => {
    setThemeKey(key);
    localStorage.setItem('satnam_theme', key);
  };

  const [role, setRole] = useState('student');
  const [adminTab, setAdminTab] = useState('schedule');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados de seguridad PIN
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [activeStudentId, setActiveStudentId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados de modales (instructor por defecto: Patricia Aleman)
  const [showNewClassModal, setShowNewClassModal] = useState(false);
  const [newClass, setNewClass] = useState({
    title: '',
    category: 'Yoga',
    instructor: 'Patricia Aleman',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    duration: 60,
    capacity: 12,
    isRecurring: false
  });

  const [showNewStudentModal, setShowNewStudentModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    phone: '',
    plan: 'Mensual - 2 veces por semana',
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    credits: 8
  });

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSelectAdminMode = () => {
    if (isAdminUnlocked) {
      setRole('admin');
    } else {
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

  // Cargar datos iniciales desde Supabase
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

      setBookings(
        bookingsRes.data.map((b) => ({
          id: b.id,
          classId: b.class_id,
          studentId: b.student_id,
          attended: b.attended
        }))
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

  const isUnlimitedPlan = (plan) =>
    plan === 'Pase Libre Clases' ||
    plan === 'Pase Libre Actividades' ||
    plan === 'Pase Libre Yoga & Spinning';

  const getDefaultCreditsForPlan = (plan) => {
    if (isUnlimitedPlan(plan)) return 99;
    if (plan === 'Mensual - 3 veces por semana') return 12;
    if (plan === 'Mensual - 2 veces por semana') return 8;
    if (plan === 'Mensual - 1 vez por semana') return 4;
    if (
      plan === 'Sesión Individual (Coaching / PNL / Constelaciones / Estética)' ||
      plan === 'Taller de Constelaciones / Evento Especial' ||
      plan === 'Clase Individual' ||
      plan === 'Evento / Retiro Especial'
    )
      return 1;
    return 4;
  };

  // Reservar o Cancelar turno
  const handleToggleBooking = async (classId) => {
    if (!activeStudent) {
      showToast('Primero solicita tu alta en el espacio', 'error');
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

      if (!isUnlimitedPlan(activeStudent.plan)) {
        const updatedCredits = activeStudent.credits + 1;
        await supabase.from('students').update({ credits: updatedCredits }).eq('id', activeStudent.id);
        setStudents((prev) =>
          prev.map((s) => (s.id === activeStudent.id ? { ...s, credits: updatedCredits } : s))
        );
      }
      showToast('Reserva cancelada correctamente');
    } else {
      const classObj = classes.find((c) => c.id === classId);
      if (classObj.is_cancelled) {
        showToast('Esta clase se encuentra cancelada.', 'error');
        return;
      }

      const classBookingsCount = bookings.filter((b) => b.classId === classId).length;

      if (classBookingsCount >= classObj.capacity) {
        showToast('Este turno ya alcanzó su cupo máximo.', 'error');
        return;
      }

      if (!isUnlimitedPlan(activeStudent.plan) && activeStudent.credits <= 0) {
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
        { id: data.id, classId: data.class_id, studentId: data.student_id, attended: data.attended }
      ]);

      if (!isUnlimitedPlan(activeStudent.plan)) {
        const updatedCredits = Math.max(0, activeStudent.credits - 1);
        await supabase.from('students').update({ credits: updatedCredits }).eq('id', activeStudent.id);
        setStudents((prev) =>
          prev.map((s) => (s.id === activeStudent.id ? { ...s, credits: updatedCredits } : s))
        );
      }
      showToast(`¡Lugar reservado en ${classObj.title}!`);
    }
  };

  // Marcar asistencia
  const handleToggleAttendance = async (bookingId) => {
    const current = bookings.find((b) => b.id === bookingId);
    if (!current) return;
    const nextVal = !current.attended;

    const { error } = await supabase
      .from('bookings')
      .update({ attended: nextVal })
      .eq('id', bookingId);

    if (!error) {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, attended: nextVal } : b))
      );
    }
  };

  // Crear nuevo turno / actividad con soporte de recurrencia fija (1 año automático)
  const handleAddClass = async (e) => {
    e.preventDefault();

    let datesToCreate = [newClass.date];

    // Si se marca como clase fija recurrente, generamos semanalmente durante 52 semanas (1 año)
    if (newClass.isRecurring) {
      const baseDate = new Date(newClass.date + 'T00:00:00');
      for (let i = 1; i <= 52; i++) {
        const nextDate = new Date(baseDate);
        nextDate.setDate(baseDate.getDate() + i * 7);
        datesToCreate.push(nextDate.toISOString().split('T')[0]);
      }
    }

    const payload = datesToCreate.map((d) => ({
      title: newClass.title,
      category: newClass.category,
      instructor: newClass.instructor || 'Patricia Aleman',
      date: d,
      time: newClass.time,
      duration: Number(newClass.duration),
      capacity: Number(newClass.capacity),
      is_cancelled: false,
      room: ''
    }));

    const { data, error } = await supabase.from('classes').insert(payload).select();

    if (error) {
      showToast('Error al guardar el turno', 'error');
      return;
    }

    setClasses((prev) => [...prev, ...data]);
    setShowNewClassModal(false);
    setNewClass({
      title: '',
      category: 'Yoga',
      instructor: 'Patricia Aleman',
      date: selectedDate,
      time: '10:00',
      duration: 60,
      capacity: 12,
      isRecurring: false
    });
    showToast(newClass.isRecurring ? '¡Clases fijas programadas para todo el año con éxito!' : 'Actividad agregada a la agenda');
  };

  // Cancelar o Reactivar clase manualmente desde el portal de admin
  const handleToggleCancelClass = async (classId) => {
    const targetClass = classes.find((c) => c.id === classId);
    if (!targetClass) return;

    const nextCancelledState = !targetClass.is_cancelled;

    const { error } = await supabase
      .from('classes')
      .update({ is_cancelled: nextCancelledState })
      .eq('id', classId);

    if (!error) {
      setClasses((prev) =>
        prev.map((c) => (c.id === classId ? { ...c, is_cancelled: nextCancelledState } : c))
      );
      showToast(nextCancelledState ? 'Clase marcada como cancelada' : 'Clase reactivada correctamente');
    } else {
      showToast('No se pudo actualizar el estado de la clase', 'error');
    }
  };

  // Eliminar turno
  const handleDeleteClass = async (classId) => {
    const { error } = await supabase.from('classes').delete().eq('id', classId);
    if (!error) {
      setClasses((prev) => prev.filter((c) => c.id !== classId));
      setBookings((prev) => prev.filter((b) => b.classId !== classId));
      showToast('Turno eliminado de la agenda');
    }
  };

  // Crear nuevo alumno / consultante
  const handleAddStudent = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('students')
      .insert([
        {
          name: newStudent.name,
          phone: newStudent.phone,
          plan: newStudent.plan,
          status: 'active',
          expiry_date: newStudent.expiryDate,
          credits: Number(newStudent.credits)
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

    setStudents((prev) => [...prev, created]);
    if (!activeStudentId) setActiveStudentId(created.id);
    setShowNewStudentModal(false);
    setNewStudent({
      name: '',
      phone: '',
      plan: 'Mensual - 2 veces por semana',
      expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      credits: 8
    });
    showToast('Registrado con éxito');
  };

  // Renovar abono
  const handleRenewPlan = async (studentId) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    const renewedCredits = getDefaultCreditsForPlan(student.plan);

    const { error } = await supabase
      .from('students')
      .update({
        status: 'active',
        expiry_date: nextMonth,
        credits: renewedCredits
      })
      .eq('id', studentId);

    if (!error) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? { ...s, status: 'active', expiryDate: nextMonth, credits: renewedCredits }
            : s
        )
      );
      showToast('Abono renovado por 30 días');
    }
  };

  // Generar enlace de WhatsApp para recordatorio
  const getWhatsAppReminderUrl = (student) => {
    const cleanPhone = student.phone.replace(/\D/g, '');
    const message = `¡Hola ${student.name}! Te saludamos desde *Espacio Sat-Nam* 🪷. Te recordamos que tu plan (*${student.plan}*) vence el día *${formatDateDDMMYYYY(student.expiryDate)}*. Avísanos por aquí si deseas renovarlo para mantener tu lugar. ¡Sat Nam! ✨`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const filteredClasses = classes
    .filter((c) => c.date === selectedDate)
    .filter((c) => (categoryFilter === 'Todas' ? true : c.category === categoryFilter))
    .sort((a, b) => a.time.localeCompare(b.time));

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.plan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (student) => {
    const today = new Date().toISOString().split('T')[0];
    if (student.expiryDate < today || student.status === 'overdue') {
      return (
        <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-rose-100/80 text-rose-800">
          Vencido
        </span>
      );
    }
    const diffDays = Math.ceil(
      (new Date(student.expiryDate) - new Date(today)) / (1000 * 60 * 60 * 24)
    );
    if (diffDays <= 5) {
      return (
        <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-amber-100/80 text-amber-800">
          Vence pronto ({diffDays}d)
        </span>
      );
    }
    return (
      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${t.softBadge}`}>
        Al día
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const badgeClass = `inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${t.softBadge}`;
    switch (category) {
      case 'Spinning':
        return (
          <span className={badgeClass}>
            <Bike className="w-3 h-3" /> SPINNING
          </span>
        );
      case 'Pilates':
      case 'Circuito':
        return (
          <span className={badgeClass}>
            <Flame className="w-3 h-3" /> PILATES & CIRCUITO
          </span>
        );
      case 'Coaching':
        return (
          <span className={badgeClass}>
            <Compass className="w-3 h-3" /> COACHING & PNL
          </span>
        );
      case 'Constelaciones':
        return (
          <span className={badgeClass}>
            <Orbit className="w-3 h-3" /> CONSTELACIONES
          </span>
        );
      case 'Estetica':
      case 'Bienestar':
        return (
          <span className={badgeClass}>
            <Flower2 className="w-3 h-3" /> ESTÉTICA & COSMIATRÍA
          </span>
        );
      case 'Eventos':
        return (
          <span className={badgeClass}>
            <Sparkles className="w-3 h-3" /> MEDITACIONES
          </span>
        );
      default:
        return (
          <span className={badgeClass}>
            <Heart className="w-3 h-3" /> YOGA TERAPIA & RESTAURATIVO
          </span>
        );
    }
  };

  return (
    <div
      className={`min-h-screen ${t.bg} ${t.textMain} font-sans pb-28 md:pb-16 transition-colors duration-300 flex flex-col`}
    >
      {/* Notificación flotante */}
      {notification && (
        <div
          className={`fixed bottom-24 md:bottom-14 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium transition-all ${
            notification.type === 'error' ? 'bg-rose-700 text-white' : t.toastBg
          }`}
        >
          <Check className="w-4 h-4" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Encabezado */}
      <header
        className={`bg-white/90 backdrop-blur-md border-b ${t.headerBorder} sticky top-0 z-30`}
      >
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-3.5">
            <SatNamLogo bgClass={t.logoBg} />
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="font-semibold text-xl tracking-tight leading-none">
                  Espacio <span className={t.brandAccent}>Sat-Nam</span>
                </h1>
                <span className="text-xs italic text-stone-500">
                  by Patricia Aleman
                </span>
              </div>
              <p className={`text-xs ${t.subtitleText} mt-1`}>
                Bienestar Integral • Movimiento, Coaching, Constelaciones & Estética
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Selector de las 3 paletas */}
            <div
              className="flex items-center gap-1.5 bg-black/[0.03] px-2.5 py-1.5 rounded-xl border border-black/[0.06]"
              title="Elegir paleta de colores"
            >
              {Object.entries(THEMES).map(([key, themeObj]) => (
                <button
                  key={key}
                  onClick={() => handleSelectTheme(key)}
                  title={themeObj.name}
                  style={{ backgroundColor: themeObj.swatch }}
                  className={`w-4 h-4 rounded-full transition-transform ${
                    themeKey === key
                      ? `ring-2 ring-offset-1 ${themeObj.ringSwatch} scale-110`
                      : 'opacity-50 hover:opacity-100'
                  }`}
                />
              ))}
            </div>

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
                  role === 'student' ? t.activePill : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Vista Alumno
              </button>
              <button
                onClick={handleSelectAdminMode}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                  role === 'admin' ? t.activePill : 'text-stone-600 hover:text-stone-900'
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
          <div className="space-y-6">
            {/* Presentación */}
            <div className="bg-white/80 rounded-3xl px-5 py-4 border border-stone-200/70">
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Un lugar creado para mejorar tu calidad de vida desde el{' '}
                <strong className="font-medium text-stone-800">bienestar integral</strong>: Yoga
                Terapia y Restaurativo, Spinning, Pilates y Circuito, Coaching y PNL para
                acompañar tus procesos de cambio, Constelaciones, y Estética y Cosmiatría.
              </p>
            </div>

            {/* Selector de Alumno / Consultante Activo */}
            {students.length > 0 ? (
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/70 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${t.cardAccentBar}`} />
                <div className="flex items-center gap-3.5 pl-2">
                  <div
                    className={`w-11 h-11 rounded-2xl ${t.softBadge} font-semibold flex items-center justify-center text-base`}
                  >
                    {activeStudent?.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-400 uppercase tracking-wider font-medium">
                        Hola,
                      </span>
                      <select
                        value={activeStudentId}
                        onChange={(e) => setActiveStudentId(e.target.value)}
                        className={`text-sm font-semibold ${t.bg} border border-stone-200 rounded-xl px-2.5 py-1 focus:outline-none ${t.focusBorder}`}
                      >
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className={`text-xs font-medium ${t.softBadge} px-2.5 py-0.5 rounded-lg`}>
                        {activeStudent?.plan}
                      </span>
                      {activeStudent && getStatusBadge(activeStudent)}
                      {activeStudent && !isUnlimitedPlan(activeStudent.plan) && (
                        <span className="text-xs text-stone-600">
                          • <strong>{activeStudent.credits}</strong> disponibles
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-stone-500 sm:text-right border-t sm:border-t-0 pt-2.5 sm:pt-0 border-stone-100 pl-2 sm:pl-0">
                  Vencimiento:
                  <span className="block font-semibold text-sm">
                    {formatDateDDMMYYYY(activeStudent?.expiryDate)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-stone-200 rounded-2xl p-4 text-sm text-stone-600">
                Aún no hay alumnos registrados en la agenda. Consulta en recepción para darte de alta.
              </div>
            )}

            {/* Filtros de fecha y actividades */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">Agenda y Turnos</h2>
                  <p className="text-sm text-stone-500">
                    Reserva tu clase, taller, sesión individual o tratamiento
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-stone-200/80 shadow-2xs w-fit">
                  <Calendar className={`w-4 h-4 ${t.iconAccent}`} />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="text-sm font-medium bg-transparent focus:outline-none"
                  />
                  <span className="text-xs text-stone-400 font-medium pl-1 border-l border-stone-200">
                    ({formatDateDDMMYYYY(selectedDate)})
                  </span>
                </div>
              </div>

              {/* Barra horizontal de categorías */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  onClick={() => setCategoryFilter('Todas')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                    categoryFilter === 'Todas'
                      ? `${t.activePill} border-transparent`
                      : 'bg-white text-stone-600 border-stone-200/80 hover:border-stone-300'
                  }`}
                >
                  Todas
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                      categoryFilter === cat.id
                        ? `${t.activePill} border-transparent`
                        : 'bg-white text-stone-600 border-stone-200/80 hover:border-stone-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tarjetas de Clases y Sesiones */}
            {filteredClasses.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-stone-200/70">
                <p className="text-stone-500 text-sm">
                  No hay actividades o turnos programados para la fecha{' '}
                  <strong>{formatDateDDMMYYYY(selectedDate)}</strong>.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredClasses.map((cls) => {
                  const classBookings = bookings.filter((b) => b.classId === cls.id);
                  const isBooked = activeStudent
                    ? classBookings.some((b) => b.studentId === activeStudent.id)
                    : false;
                  const spotsLeft = cls.capacity - classBookings.length;

                  return (
                    <div
                      key={cls.id}
                      className={`bg-white rounded-3xl p-5 border transition-all flex flex-col justify-between ${
                        cls.is_cancelled
                          ? 'border-stone-200 bg-stone-50/70 opacity-80'
                          : isBooked
                          ? `${t.bookedRing} shadow-sm`
                          : 'border-stone-200/70 shadow-2xs hover:border-stone-300'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2.5">
                          <div>{getCategoryBadge(cls.category)}</div>
                          {cls.is_cancelled ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                              <Ban className="w-3.5 h-3.5" /> Clase cancelada
                            </span>
                          ) : (
                            isBooked && (
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${t.activePill}`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Reservado
                              </span>
                            )
                          )}
                        </div>

                        <h3 className="font-semibold text-lg">{cls.title}</h3>

                        <div className="flex items-center gap-4 text-sm text-stone-600 mt-3">
                          <span className="flex items-center gap-1.5">
                            <Clock className={`w-4 h-4 ${t.iconAccent}`} />
                            {cls.time} hs ({cls.duration} min)
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className={`w-4 h-4 ${t.iconAccent}`} />
                            {cls.instructor}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                        <div>
                          {cls.is_cancelled ? (
                            <span className="text-xs text-stone-500 font-medium">
                              No disponible por hoy
                            </span>
                          ) : (
                            <span
                              className={`text-xs font-medium px-2.5 py-1 rounded-xl ${
                                spotsLeft === 0
                                  ? 'bg-rose-100/80 text-rose-700'
                                  : spotsLeft <= 2
                                  ? 'bg-amber-100/80 text-amber-800'
                                  : t.softBadge
                              }`}
                            >
                              {spotsLeft === 0
                                ? 'Turno completo'
                                : spotsLeft === 1
                                ? '1 lugar libre'
                                : `${spotsLeft} lugares libres`}
                            </span>
                          )}
                        </div>

                        {!cls.is_cancelled && (
                          <button
                            onClick={() => handleToggleBooking(cls.id)}
                            disabled={!isBooked && spotsLeft === 0}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                              isBooked
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/80'
                                : spotsLeft === 0
                                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                                : t.primaryBtn
                            }`}
                          >
                            {isBooked ? 'Cancelar Reserva' : 'Reservar'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ================= VISTA MODO ESTUDIO (ADMIN) ================= */
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="hidden md:flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-stone-200/80 w-fit shadow-2xs">
                <button
                  onClick={() => setAdminTab('schedule')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    adminTab === 'schedule' ? t.activePill : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Calendar className="w-4 h-4" /> Agenda y Asistencia
                </button>
                <button
                  onClick={() => setAdminTab('students')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    adminTab === 'students' ? t.activePill : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Users className="w-4 h-4" /> Alumnos y Consultantes
                </button>
                <button
                  onClick={() => setAdminTab('payments')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    adminTab === 'payments' ? t.activePill : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> Pagos y WhatsApp
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
                <Lock className={`w-3.5 h-3.5 ${t.iconAccent}`} /> Bloquear Modo Estudio
              </button>
            </div>

            {adminTab === 'schedule' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">Agenda Espacio Sat-Nam</h2>
                    <p className="text-sm text-stone-500">
                      Gestiona clases anuales, cancela clases puntuales y revisa asistencia
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="text-sm font-medium bg-white px-3 py-2 rounded-xl border border-stone-200/80"
                    />
                    <button
                      onClick={() => {
                        setNewClass((prev) => ({ ...prev, date: selectedDate }));
                        setShowNewClassModal(true);
                      }}
                      className={`flex items-center gap-1.5 ${t.primaryBtn} px-4 py-2 rounded-xl text-sm font-medium transition-all`}
                    >
                      <Plus className="w-4 h-4" /> Programar Actividad Anual
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {classes
                    .filter((c) => c.date === selectedDate)
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((cls) => {
                      const classBookings = bookings.filter((b) => b.classId === cls.id);

                      return (
                        <div
                          key={cls.id}
                          className={`bg-white rounded-3xl p-5 border shadow-2xs ${
                            cls.is_cancelled ? 'border-rose-200 bg-rose-50/20' : 'border-stone-200/70'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                {getCategoryBadge(cls.category)}
                                <span
                                  className={`text-xs font-medium px-2.5 py-0.5 rounded-lg ${t.softBadge}`}
                                >
                                  {cls.time} hs ({cls.duration} min) — {formatDateDDMMYYYY(cls.date)}
                                </span>
                                {cls.is_cancelled && (
                                  <span className="text-xs font-semibold px-2 py-0.5 bg-rose-100 text-rose-700 rounded-lg">
                                    [CANCELADA MANUALMENTE]
                                  </span>
                                )}
                              </div>
                              <h3 className="font-semibold text-base">
                                {cls.title}{' '}
                                <span className="text-sm font-normal text-stone-500">
                                  — {cls.instructor}
                                </span>
                              </h3>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {/* Botón para suspender/cancelar clase manualmente */}
                              <button
                                onClick={() => handleToggleCancelClass(cls.id)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                  cls.is_cancelled
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                }`}
                              >
                                <Ban className="w-3.5 h-3.5" />
                                {cls.is_cancelled ? 'Reactivar Clase' : 'Suspender Clase'}
                              </button>

                              <button
                                onClick={() => handleDeleteClass(cls.id)}
                                title="Eliminar turno"
                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-4">
                            {classBookings.length === 0 ? (
                              <p className="text-xs text-stone-400 italic">
                                Aún no hay reservas en este horario.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                {classBookings.map((booking) => {
                                  const st = students.find((s) => s.id === booking.studentId);
                                  if (!st) return null;

                                  return (
                                    <div
                                      key={booking.id}
                                      onClick={() => handleToggleAttendance(booking.id)}
                                      className={`cursor-pointer p-3 rounded-2xl border flex items-center justify-between transition-all ${
                                        booking.attended
                                          ? `${t.softBadge} border-current/20`
                                          : `${t.bg} border-stone-200/80 hover:border-stone-300`
                                      }`}
                                    >
                                      <div>
                                        <p className="text-sm font-medium">{st.name}</p>
                                        <p className="text-[11px] text-stone-500">{st.plan}</p>
                                      </div>

                                      <span
                                        className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-xl ${
                                          booking.attended
                                            ? t.activePill
                                            : 'bg-white text-stone-600 border border-stone-200'
                                        }`}
                                      >
                                        <UserCheck className="w-3.5 h-3.5" />
                                        {booking.attended ? 'Asistió' : 'Marcar'}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                  {classes.filter((c) => c.date === selectedDate).length === 0 && (
                    <div className="bg-white rounded-3xl p-8 text-center border border-stone-200/70 text-stone-500 text-sm">
                      No hay actividades cargadas para la fecha{' '}
                      <strong>{formatDateDDMMYYYY(selectedDate)}</strong>. Haz clic en{' '}
                      <strong>+ Programar Actividad Anual</strong>.
                    </div>
                  )}
                </div>
              </div>
            )}

            {adminTab === 'students' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">Alumnos & Consultantes</h2>
                    <p className="text-sm text-stone-500">
                      Administra abonos de clases, sesiones individuales y participantes de talleres
                    </p>
                  </div>

                  <button
                    onClick={() => setShowNewStudentModal(true)}
                    className={`flex items-center gap-1.5 ${t.primaryBtn} px-4 py-2 rounded-xl text-sm font-medium w-fit`}
                  >
                    <Plus className="w-4 h-4" /> Nuevo Registro
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o modalidad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full bg-white pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/80 text-sm focus:outline-none ${t.focusBorder}`}
                  />
                </div>

                <div className="bg-white rounded-3xl border border-stone-200/70 overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr
                          className={`${t.bg} border-b border-stone-200/80 text-xs uppercase tracking-wider text-stone-500`}
                        >
                          <th className="py-3.5 px-4 font-medium">Nombre</th>
                          <th className="py-3.5 px-4 font-medium">Modalidad</th>
                          <th className="py-3.5 px-4 font-medium">Saldo</th>
                          <th className="py-3.5 px-4 font-medium">Vencimiento</th>
                          <th className="py-3.5 px-4 font-medium">Estado</th>
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
                              <span className={`font-medium ${t.brandAccent}`}>{st.plan}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              {isUnlimitedPlan(st.plan) ? (
                                <span
                                  className={`text-xs ${t.softBadge} px-2.5 py-0.5 rounded-lg font-medium`}
                                >
                                  Ilimitado
                                </span>
                              ) : (
                                <span>{st.credits} disponibles</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-stone-600">
                              {formatDateDDMMYYYY(st.expiryDate)}
                            </td>
                            <td className="py-3.5 px-4">{getStatusBadge(st)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {adminTab === 'payments' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Recordatorios de Pago y Renovación</h2>
                  <p className="text-sm text-stone-500">
                    Envía avisos personalizados por WhatsApp o renueva planes
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {students.map((st) => (
                    <div
                      key={st.id}
                      className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-2xs flex flex-col justify-between gap-4"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="font-semibold text-base">{st.name}</h3>
                          <p className={`text-xs ${t.brandAccent} font-medium mt-0.5`}>
                            {st.plan}
                          </p>
                          <p className="text-xs text-stone-500 mt-0.5">
                            Vence el: <strong>{formatDateDDMMYYYY(st.expiryDate)}</strong>
                          </p>
                        </div>
                        {getStatusBadge(st)}
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
                        <a
                          href={getWhatsAppReminderUrl(st)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white py-2.5 px-3 rounded-xl text-xs font-semibold shadow-2xs transition-all"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Recordatorio WhatsApp
                        </a>

                        <button
                          onClick={() => handleRenewPlan(st.id)}
                          className={`flex items-center justify-center gap-1 ${t.softBadge} py-2.5 px-3 rounded-xl text-xs font-semibold transition-all`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Renovar Plan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Pie de página fijo con Copyright */}
      <footer
        className={`fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t ${t.headerBorder} py-2 px-4 text-center z-30`}
      >
        <p className="text-xs text-stone-600 tracking-wide">
          © {new Date().getFullYear()}{' '}
          <strong className="font-semibold text-stone-800">Espacio Sat-Nam</strong> •{' '}
          <span className={`font-medium ${t.brandAccent}`}>by Patricia Aleman</span>. Todos los
          derechos reservados.
        </p>
      </footer>

      {/* Navegación móvil inferior */}
      {role === 'admin' && (
        <nav className="md:hidden fixed bottom-8 left-0 right-0 bg-white border-t border-stone-200 flex justify-around py-2 px-2 z-40">
          <button
            onClick={() => setAdminTab('schedule')}
            className={`flex flex-col items-center gap-1 text-xs font-medium ${
              adminTab === 'schedule' ? t.brandAccent : 'text-stone-400'
            }`}
          >
            <Calendar className="w-5 h-5" />
            Agenda
          </button>
          <button
            onClick={() => setAdminTab('students')}
            className={`flex flex-col items-center gap-1 text-xs font-medium ${
              adminTab === 'students' ? t.brandAccent : 'text-stone-400'
            }`}
          >
            <Users className="w-5 h-5" />
            Personas
          </button>
          <button
            onClick={() => setAdminTab('payments')}
            className={`flex flex-col items-center gap-1 text-xs font-medium ${
              adminTab === 'payments' ? t.brandAccent : 'text-stone-400'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            Pagos
          </button>
        </nav>
      )}

      {/* Modal: Verificación PIN Modo Estudio */}
      {showPinModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 shadow-xl text-center">
            <div
              className={`w-12 h-12 rounded-2xl ${t.softBadge} flex items-center justify-center mx-auto mb-3`}
            >
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg">Acceso Modo Estudio</h3>
            <p className="text-xs text-stone-500 mt-1 mb-4">
              Ingresa el PIN de 4 dígitos para administrar la agenda y los turnos
            </p>

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
                  pinError
                    ? 'border-rose-500 bg-rose-50 text-rose-700'
                    : `border-stone-200 ${t.focusBorder}`
                }`}
              />
              {pinError && (
                <p className="text-xs text-rose-600 font-medium">
                  PIN incorrecto. Intenta nuevamente.
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium bg-stone-100 text-stone-600 hover:bg-stone-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold ${t.primaryBtn}`}
                >
                  Ingresar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Programación Anual de Clases Fijas */}
      {showNewClassModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Programar Actividad / Clase Fija</h3>
              <button onClick={() => setShowNewClassModal(false)}>
                <XCircle className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleAddClass} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">
                  Área / Servicio
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() =>
                        setNewClass({
                          ...newClass,
                          category: cat.id,
                          capacity: cat.defaultCap
                        })
                      }
                      className={`py-2 px-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                        newClass.category === cat.id
                          ? `${t.activePill} border-transparent`
                          : `${t.bg} text-stone-600 border-stone-200`
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Nombre de la Clase / Taller
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ej. Yoga Restaurativo, Spinning..."
                  value={newClass.title}
                  onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Facilitadora
                </label>
                <input
                  required
                  type="text"
                  value={newClass.instructor}
                  onChange={(e) => setNewClass({ ...newClass, instructor: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 bg-stone-50 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-stone-600 mb-1">Fecha Inicial</label>
                  <input
                    required
                    type="date"
                    value={newClass.date}
                    onChange={(e) => setNewClass({ ...newClass, date: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-2 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Hora</label>
                  <input
                    required
                    type="time"
                    value={newClass.time}
                    onChange={(e) => setNewClass({ ...newClass, time: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-2 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Duración (min)</label>
                  <input
                    required
                    type="number"
                    min="15"
                    max="480"
                    value={newClass.duration}
                    onChange={(e) => setNewClass({ ...newClass, duration: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-2 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Cupo</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="60"
                    value={newClass.capacity}
                    onChange={(e) => setNewClass({ ...newClass, capacity: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-2 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Casilla para generar clases fijas para todo el año */}
              <div className="pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <input
                    type="checkbox"
                    checked={newClass.isRecurring}
                    onChange={(e) => setNewClass({ ...newClass, isRecurring: e.target.checked })}
                    className="rounded accent-stone-700 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-semibold text-stone-800 block">
                      Programar automáticamente durante 1 año (52 semanas)
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Ideal para dejar fijas las clases de Yoga y Spinning sin mantenimiento.
                    </span>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                className={`w-full ${t.primaryBtn} font-medium py-2.5 rounded-xl mt-2`}
              >
                Guardar en Agenda
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nuevo Alumno / Consultante */}
      {showNewStudentModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Nuevo Alumno / Consultante</h3>
              <button onClick={() => setShowNewStudentModal(false)}>
                <XCircle className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Nombre Completo
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ej. María Gómez"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Teléfono WhatsApp (con código de país)
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ej. +5491123456789"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Modalidad / Plan
                  </label>
                  <select
                    value={newStudent.plan}
                    onChange={(e) => {
                      const chosenPlan = e.target.value;
                      setNewStudent({
                        ...newStudent,
                        plan: chosenPlan,
                        credits: getDefaultCreditsForPlan(chosenPlan)
                      });
                    }}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2 bg-white"
                  >
                    {PLAN_OPTIONS.map((planName) => (
                      <option key={planName} value={planName}>
                        {planName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Sesiones / Clases
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    disabled={isUnlimitedPlan(newStudent.plan)}
                    value={isUnlimitedPlan(newStudent.plan) ? 99 : newStudent.credits}
                    onChange={(e) => setNewStudent({ ...newStudent, credits: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2 disabled:bg-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Fecha de Vencimiento
                </label>
                <input
                  required
                  type="date"
                  value={newStudent.expiryDate}
                  onChange={(e) => setNewStudent({ ...newStudent, expiryDate: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2"
                />
              </div>

              <button
                type="submit"
                className={`w-full ${t.primaryBtn} font-medium py-2.5 rounded-xl mt-2`}
              >
                Guardar Registro
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
