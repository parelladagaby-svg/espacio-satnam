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
  Flower2
} from 'lucide-react';

// Conexión a tu base de datos en Supabase
const supabaseUrl = 'https://miwktvtdygetyzqvccal.supabase.co';
const supabaseKey = 'sb_publishable_45-FeV94kQsHYfau3pJPjg_DOo7R6yx';
const supabase = createClient(supabaseUrl, supabaseKey);

// PIN de acceso al Modo Estudio
const ADMIN_PIN = '1008';

const CATEGORIES = [
  { id: 'Yoga', label: 'Yoga', defaultRoom: 'Sala Mandala', defaultCap: 12 },
  { id: 'Spinning', label: 'Spinning', defaultRoom: 'Sala Cycle', defaultCap: 10 },
  { id: 'Pilates', label: 'Pilates', defaultRoom: 'Sala Pilates', defaultCap: 8 },
  { id: 'Circuito', label: 'Circuito Spin & Pilates', defaultRoom: 'Sala Integral', defaultCap: 10 },
  { id: 'Bienestar', label: 'Masajes & Faciales', defaultRoom: 'Gabinete Armonía', defaultCap: 1 },
  { id: 'Eventos', label: 'Meditaciones & Retiros', defaultRoom: 'Salón Principal', defaultCap: 20 }
];

const PLAN_OPTIONS = [
  'Clase / Sesión Individual',
  'Mensual - 1 vez por semana',
  'Mensual - 2 veces por semana',
  'Mensual - 3 veces por semana',
  'Pase Libre Actividades',
  'Evento / Retiro Especial'
];

// 3 opciones de paleta (máximo 2-3 colores por opción: fondo + principal + texto)
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

// Isotipo Flor de Loto minimalista para Espacio SAT-NAM
function SatNamLogo({ bgClass, className = 'w-10 h-10' }) {
  return (
    <div
      className={`${className} rounded-2xl ${bgClass} p-2 flex items-center justify-center text-white shadow-xs shrink-0 transition-colors duration-300`}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <path
          d="M32 11C26.5 20.5 24.5 30 32 42C39.5 30 37.5 20.5 32 11Z"
          fill="white"
          fillOpacity="0.95"
        />
        <path
          d="M29 41C19.5 35.5 14.5 26 16.5 17C24 21 28 29.5 29 41Z"
          fill="white"
          fillOpacity="0.75"
        />
        <path
          d="M35 41C44.5 35.5 49.5 26 47.5 17C40 21 36 29.5 35 41Z"
          fill="white"
          fillOpacity="0.75"
        />
        <path
          d="M27 43C15.5 43 8.5 36.5 7.5 29C16 29 23 34.5 27 43Z"
          fill="white"
          fillOpacity="0.52"
        />
        <path
          d="M37 43C48.5 43 55.5 36.5 56.5 29C48 29 41 34.5 37 43Z"
          fill="white"
          fillOpacity="0.52"
        />
        <circle cx="32" cy="49.5" r="2.8" fill="white" fillOpacity="0.9" />
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

  // Estados de modales
  const [showNewClassModal, setShowNewClassModal] = useState(false);
  const [newClass, setNewClass] = useState({
    title: '',
    category: 'Yoga',
    instructor: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    duration: 60,
    capacity: 12,
    room: 'Sala Mandala'
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
    plan === 'Pase Libre Actividades' || plan === 'Pase Libre Yoga & Spinning';

  const getDefaultCreditsForPlan = (plan) => {
    if (isUnlimitedPlan(plan)) return 99;
    if (plan === 'Mensual - 3 veces por semana') return 12;
    if (plan === 'Mensual - 2 veces por semana') return 8;
    if (plan === 'Mensual - 1 vez por semana') return 4;
    if (
      plan === 'Clase / Sesión Individual' ||
      plan === 'Clase Individual' ||
      plan === 'Evento / Retiro Especial'
    )
      return 1;
    return 4;
  };

  // Reservar o Cancelar turno
  const handleToggleBooking = async (classId) => {
    if (!activeStudent) {
      showToast('Primero solicita tu alta en el estudio', 'error');
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

  // Marcar asistencia en sala
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

  // Crear nuevo turno / actividad
  const handleAddClass = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('classes')
      .insert([
        {
          title: newClass.title,
          category: newClass.category,
          instructor: newClass.instructor,
          date: newClass.date,
          time: newClass.time,
          duration: Number(newClass.duration),
          capacity: Number(newClass.capacity),
          room: newClass.room
        }
      ])
      .select()
      .single();

    if (error) {
      showToast('Error al guardar el turno', 'error');
      return;
    }

    setClasses((prev) => [...prev, data]);
    setShowNewClassModal(false);
    setNewClass({
      title: '',
      category: 'Yoga',
