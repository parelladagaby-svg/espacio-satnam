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
  UserCog
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

const INITIAL_SERVICES = [
  { id: 'Yoga', label: 'Yoga', pillar: 'cuerpo', defaultCap: 12 },
  { id: 'Spinning', label: 'Spinning', pillar: 'cuerpo', defaultCap: 10 },
  { id: 'Pilates', label: 'Pilates', pillar: 'cuerpo', defaultCap: 10 },
  { id: 'CircuitoSatNam', label: 'Circuito Sat-Nam', pillar: 'cuerpo', defaultCap: 10 },
  { id: 'Coaching', label: 'Coaching & PNL', pillar: 'mente', defaultCap: 1 },
  { id: 'Constelaciones', label: 'Constelaciones', pillar: 'mente', defaultCap: 12 },
  { id: 'Eventos', label: 'Meditaciones', pillar: 'mente', defaultCap: 20 },
  { id: 'Estetica', label: 'Estética & Cosmiatría', pillar: 'estetica', defaultCap: 1 }
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

// Formatear YYYY-MM-DD a DD-MM-YYYY
const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  return `${day}-${month}-${year}`;
};

const toISODate = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Logo oficial: Flor de Loto
function SatNamLogo({ className = 'w-11 h-11' }) {
  return (
    <div
      className={`${className} rounded-2xl bg-[#5C7362] p-1.5 flex items-center justify-center text-white shadow-xs shrink-0`}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <path
          d="M32 7C25.5 18.5 23 30 32 44.5C41 30 38.5 18.5 32 7Z"
          fill="white"
          fillOpacity="0.96"
        />
        <path
          d="M28.5 43.5C17 36.8 11.2 25.2 13.6 14C22.8 18.8 27.6 29.5 28.5 43.5Z"
          fill="white"
          fillOpacity="0.78"
        />
        <path
          d="M35.5 43.5C47 36.8 52.8 25.2 50.4 14C41.2 18.8 36.4 29.5 35.5 43.5Z"
          fill="white"
          fillOpacity="0.78"
        />
        <path
          d="M26.2 46C12.2 46 4.4 37.8 3.5 28.6C13.6 28.6 21.8 35.4 26.2 46Z"
          fill="white"
          fillOpacity="0.55"
        />
        <path
          d="M37.8 46C51.8 46 59.6 37.8 60.5 28.6C50.4 28.6 42.2 35.4 37.8 46Z"
          fill="white"
          fillOpacity="0.55"
        />
        <circle cx="32" cy="53.5" r="3.2" fill="white" fillOpacity="0.92" />
      </svg>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState('student');
  const [adminTab, setAdminTab] = useState('schedule'); // 'schedule' | 'dashboard' | 'students' | 'payments'
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  // PIN Modo Estudio
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Servicios disponibles
  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('satnam_services_v2');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  // attendanceStatus: null | 'attended' | 'no_show'
  const [bookings, setBookings] = useState([]);

  // Vista Alumno
  const [activeStudentId, setActiveStudentId] = useState('');
  const [selectedDate, setSelectedDate] = useState(toISODate(new Date()));
  const [pillarFilter, setPillarFilter] = useState('Todas');
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });

  // Vista Admin: Calendario semanal / mensual & Dashboard
  const [calendarView, setCalendarView] = useState('week'); // 'week' | 'month'
  const [calendarCursor, setCalendarCursor] = useState(new Date());
  const [dashboardClassFilter, setDashboardClassFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal + Servicio (solo agregar)
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newServiceForm, setNewServiceForm] = useState({
    label: '',
    pillar: 'cuerpo',
    defaultCap: 10
  });

  // Modal Programar / Editar Clase
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

  // Modal Crear / Editar Alumno
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [studentForm, setStudentForm] = useState({
    name: '',
    phone: '',
    plan: 'Mensual - 2 veces por semana',
    expiryDate: toISODate(new Date(Date.now() + 30 * 86400000)),
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

  // Cargar datos desde Supabase
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
          attended: Boolean(b.attended),
          attendanceStatus: b.attended ? 'attended' : null
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

  // Formato contador de clase según abono (ej: 1/4)
  const getStudentQuotaDisplay = (student) => {
    if (!student) return '';
    if (isUnlimitedPlan(student.plan)) return 'Pase Libre';
    const total = getDefaultCreditsForPlan(student.plan);
    const used = Math.max(0, total - student.credits);
    const currentNumber = used > 0 ? used : 1;
    return `${currentNumber}/${total}`;
  };

  // Editar perfil del alumno
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

  // Reservar o Cancelar turno (Alumno)
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
        showToast('Esta clase se encuentra pausada/cancelada.', 'error');
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
        {
          id: data.id,
          classId: data.class_id,
          studentId: data.student_id,
          attended: Boolean(data.attended),
          attendanceStatus: data.attended ? 'attended' : null
        }
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

  // Establecer asistencia explícita ('attended' | 'no_show')
  const handleSetAttendanceStatus = async (bookingId, status) => {
    const current = bookings.find((b) => b.id === bookingId);
    if (!current) return;

    const isAttendedBool = status === 'attended';
    const { error } = await supabase
      .from('bookings')
      .update({ attended: isAttendedBool })
      .eq('id', bookingId);

    if (!error) {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, attended: isAttendedBool, attendanceStatus: status }
            : b
        )
      );
      showToast(status === 'attended' ? 'Marcado como Asistió' : 'Marcado como No asistió');
    } else {
      showToast('No se pudo actualizar la asistencia', 'error');
    }
  };

  // Agregar nuevo servicio (+ Servicio)
  const handleAddService = (e) => {
    e.preventDefault();
    if (!newServiceForm.label.trim()) return;

    const newId = newServiceForm.label.trim().replace(/\s+/g, '');
    if (services.some((s) => s.id.toLowerCase() === newId.toLowerCase())) {
      showToast('Ya existe un servicio con ese nombre', 'error');
      return;
    }

    const updated = [
      ...services,
      {
        id: newId,
        label: newServiceForm.label.trim(),
        pillar: newServiceForm.pillar,
        defaultCap: Number(newServiceForm.defaultCap)
      }
    ];

    setServices(updated);
    localStorage.setItem('satnam_services_v2', JSON.stringify(updated));
    setShowAddServiceModal(false);
    setNewServiceForm({ label: '', pillar: 'cuerpo', defaultCap: 10 });
    showToast('Servicio agregado correctamente');
  };

  // Guardar o Programar Clases (1 a 4 semanas)
  const handleSaveClass = async (e) => {
    e.preventDefault();
    const matchingSrv = services.find((s) => s.id === classForm.category) || services[0];
    const finalTitle = classForm.isCustomTitle && classForm.title.trim()
      ? classForm.title.trim()
      : matchingSrv.label;

    if (editingClassId) {
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
      const baseDate = new Date(selectedDate + 'T00:00:00');
      const datesToCreate = [];

      for (let w = 0; w < weeks; w++) {
        for (const dayOfWeek of classForm.selectedDays) {
          const d = new Date(baseDate);
          const currentDay = d.getDay();
          const diff = (dayOfWeek + 7 - currentDay) % 7;
          d.setDate(d.getDate() + diff + w * 7);
          const iso = toISODate(d);
          if (!datesToCreate.includes(iso)) {
            datesToCreate.push(iso);
          }
        }
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
        console.error('Error insertando clases:', error);
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

  // Editar clase puntual
  const handleOpenEditClass = (cls) => {
    setEditingClassId(cls.id);
    const matchingSrv = services.find((s) => s.id === cls.category) || services[0];
    const isCustom = cls.title !== matchingSrv.label;
    setClassForm({
      category: cls.category,
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

  // Pausar / Reactivar clase puntual
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
      showToast(nextCancelledState ? 'Clase pausada' : 'Clase reactivada');
    } else {
      showToast('Verifica que la columna is_cancelled exista en Supabase', 'error');
    }
  };

  // Eliminar clase puntual
  const handleDeleteClass = async (classId) => {
    const { error } = await supabase.from('classes').delete().eq('id', classId);
    if (!error) {
      setClasses((prev) => prev.filter((c) => c.id !== classId));
      setBookings((prev) => prev.filter((b) => b.classId !== classId));
      showToast('Clase eliminada');
    }
  };

  // Abrir modal para crear alumno
  const handleOpenNewStudent = () => {
    setEditingStudentId(null);
    setStudentForm({
      name: '',
      phone: '',
      plan: 'Mensual - 2 veces por semana',
      expiryDate: toISODate(new Date(Date.now() + 30 * 86400000)),
      credits: 8
    });
    setShowStudentModal(true);
  };

  // Abrir modal para editar alumno existente
  const handleOpenEditStudent = (st) => {
    setEditingStudentId(st.id);
    setStudentForm({
      name: st.name,
      phone: st.phone,
      plan: st.plan,
      expiryDate: st.expiryDate,
      credits: st.credits
    });
    setShowStudentModal(true);
  };

  // Guardar (crear o editar) Alumno
  const handleSaveStudent = async (e) => {
    e.preventDefault();
    const finalCredits = isUnlimitedPlan(studentForm.plan) ? 99 : Number(studentForm.credits);

    if (editingStudentId) {
      const { error } = await supabase
        .from('students')
        .update({
          name: studentForm.name.trim(),
          phone: studentForm.phone.trim(),
          plan: studentForm.plan,
          expiry_date: studentForm.expiryDate,
          credits: finalCredits
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
                expiryDate: studentForm.expiryDate,
                credits: finalCredits
              }
            : s
        )
      );
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
            status: 'active',
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

      setStudents((prev) => [...prev, created]);
      if (!activeStudentId) setActiveStudentId(created.id);
      setShowStudentModal(false);
      showToast('Registrado con éxito');
    }
  };

  // Eliminar Alumno
  const handleDeleteStudent = async (studentId) => {
    await supabase.from('bookings').delete().eq('student_id', studentId);
    const { error } = await supabase.from('students').delete().eq('id', studentId);

    if (!error) {
      const remaining = students.filter((s) => s.id !== studentId);
      setStudents(remaining);
      setBookings((prev) => prev.filter((b) => b.studentId !== studentId));
      if (activeStudentId === studentId) {
        setActiveStudentId(remaining[0]?.id || '');
      }
      showToast('Alumno eliminado del registro');
    } else {
      showToast('No se pudo eliminar el alumno', 'error');
    }
  };

  // Renovar abono
  const handleRenewPlan = async (studentId) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const nextMonth = toISODate(new Date(Date.now() + 30 * 86400000));
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

  // Filtrado de clases en Vista Alumno (por fecha y pilar)
  const studentFilteredClasses = classes
    .filter((c) => c.date === selectedDate)
    .filter((c) =>
      pillarFilter === 'Todas' ? true : getPillarForCategory(c.category) === pillarFilter
    )
    .sort((a, b) => a.time.localeCompare(b.time));

  // Clases del día seleccionado en Modo Estudio
  const dayClassesAdmin = classes
    .filter((c) => c.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.plan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (student) => {
    const today = toISODate(new Date());
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

  // Construcción de días para el calendario semanal o mensual
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
    if (calendarView === 'week') {
      next.setDate(next.getDate() + direction * 7);
    } else {
      next.setMonth(next.getMonth() + direction);
    }
    setCalendarCursor(next);
  };

  // Métricas para Dashboard
  const todayISO = toISODate(new Date());
  const activeStudentsCount = students.filter((s) => s.expiryDate >= todayISO).length;
  const overdueOrSoonCount = students.filter((s) => {
    const diff = Math.ceil((new Date(s.expiryDate) - new Date(todayISO)) / 86400000);
    return diff <= 5;
  }).length;
  const totalBookingsCount = bookings.length;
  const totalAttendedCount = bookings.filter((b) => b.attendanceStatus === 'attended' || b.attended).length;
  const attendanceRate =
    totalBookingsCount > 0 ? Math.round((totalAttendedCount / totalBookingsCount) * 100) : 0;

  const dashboardFilteredClasses =
    dashboardClassFilter === 'ALL'
      ? dayClassesAdmin
      : dayClassesAdmin.filter((c) => c.id === dashboardClassFilter);

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#2D332F] font-sans pb-24 md:pb-14 flex flex-col">
      {/* Notificación flotante */}
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
          /* ================= VISTA ALUMNO SIMPLIFICADA ================= */
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

            {/* Tarjeta de Perfil del Alumno (ver y editar) */}
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
                        onChange={(e) => setActiveStudentId(e.target.value)}
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
                      {activeStudent && !isUnlimitedPlan(activeStudent.plan) && (
                        <span className="text-xs text-stone-600">
                          • Saldo: <strong>{activeStudent.credits}</strong> disponibles (
                          {getStudentQuotaDisplay(activeStudent)})
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

            {/* Filtros por Fecha y los 3 Pilares */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">Agenda y Reservas</h2>
                  <p className="text-sm text-stone-500">
                    Elige una categoría y fecha para reservar tu espacio
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-stone-200/80 shadow-2xs w-fit">
                  <Calendar className="w-4 h-4 text-[#5C7362]" />
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

              {/* 4 botones limpios agrupados por pilares */}
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

            {/* Tarjetas de Clases */}
            {studentFilteredClasses.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-stone-200/70">
                <p className="text-stone-500 text-sm">
                  No hay actividades disponibles para el{' '}
                  <strong>{formatDateDDMMYYYY(selectedDate)}</strong> en esta categoría.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentFilteredClasses.map((cls) => {
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
                          ? 'border-[#5C7362] ring-1 ring-[#5C7362]/25 shadow-sm'
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
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#5C7362] text-white shadow-xs">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Reservado
                              </span>
                            )
                          )}
                        </div>

                        <h3 className="font-semibold text-lg">{cls.title}</h3>

                        <div className="flex items-center gap-4 text-sm text-stone-600 mt-3">
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
                                  : 'bg-[#EDF3EE] text-[#4C6352]'
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
                                : 'bg-[#5C7362] hover:bg-[#4B5F50] text-white shadow-xs'
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
          /* ================= MODO ESTUDIO (ADMIN) ================= */
          <div className="space-y-6">
            {/* Navegación superior Modo Estudio */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="hidden md:flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-stone-200/80 w-fit shadow-2xs">
                <button
                  onClick={() => setAdminTab('schedule')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    adminTab === 'schedule'
                      ? 'bg-[#5C7362] text-white shadow-xs'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Calendar className="w-4 h-4" /> Calendario & Clases
                </button>
                <button
                  onClick={() => setAdminTab('dashboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    adminTab === 'dashboard'
                      ? 'bg-[#5C7362] text-white shadow-xs'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" /> Dashboard & Asistencia
                </button>
                <button
                  onClick={() => setAdminTab('students')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    adminTab === 'students'
                      ? 'bg-[#5C7362] text-white shadow-xs'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Users className="w-4 h-4" /> Alumnos
                </button>
                <button
                  onClick={() => setAdminTab('payments')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    adminTab === 'payments'
                      ? 'bg-[#5C7362] text-white shadow-xs'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> Pagos & WhatsApp
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

            {/* PESTAÑA 1: CALENDARIO SEMANAL / MENSUAL Y DETALLE DEL DÍA */}
            {adminTab === 'schedule' && (
              <div className="space-y-5">
                {/* Barra de Acciones Principales */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">Agenda Espacio Sat-Nam</h2>
                    <p className="text-sm text-stone-500">
                      Haz clic en cualquier día del calendario para ver sus clases e inscritos
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        setNewServiceForm({ label: '', pillar: 'cuerpo', defaultCap: 10 });
                        setShowAddServiceModal(true);
                      }}
                      className="flex items-center gap-1.5 bg-white hover:bg-stone-50 text-[#5C7362] border border-[#5C7362]/40 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                    >
                      <Plus className="w-4 h-4" /> Servicio
                    </button>

                    <button
                      onClick={() => {
                        setEditingClassId(null);
                        const firstSrv = services[0];
                        setClassForm({
                          category: firstSrv.id,
                          title: firstSrv.label,
                          isCustomTitle: false,
                          instructor: 'Patricia Aleman',
                          time: '10:00',
                          duration: 60,
                          capacity: firstSrv.defaultCap,
                          selectedDays: [1, 3, 5],
                          weeksCount: 4
                        });
                        setShowClassModal(true);
                      }}
                      className="flex items-center gap-1.5 bg-[#5C7362] hover:bg-[#4B5F50] text-white shadow-xs px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                    >
                      <Plus className="w-4 h-4" /> Programar Horarios
                    </button>
                  </div>
                </div>

                {/* Controles del Calendario (Semanal / Mensual) */}
                <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/70 shadow-2xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleNavigateCalendar(-1)}
                        className="p-1.5 rounded-xl border border-stone-200 hover:bg-stone-50"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="font-semibold text-sm sm:text-base min-w-[140px] text-center">
                        {MONTH_NAMES[calendarCursor.getMonth()]} {calendarCursor.getFullYear()}
                      </span>
                      <button
                        onClick={() => handleNavigateCalendar(1)}
                        className="p-1.5 rounded-xl border border-stone-200 hover:bg-stone-50"
                      >
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
                          calendarView === 'week'
                            ? 'bg-[#5C7362] text-white shadow-2xs'
                            : 'text-stone-600'
                        }`}
                      >
                        Semanal
                      </button>
                      <button
                        onClick={() => setCalendarView('month')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          calendarView === 'month'
                            ? 'bg-[#5C7362] text-white shadow-2xs'
                            : 'text-stone-600'
                        }`}
                      >
                        Mensual
                      </button>
                    </div>
                  </div>

                  {/* Vista Semanal */}
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
                            <span
                              className={`text-[11px] font-medium ${
                                isSelected ? 'text-white/80' : 'text-stone-500'
                              }`}
                            >
                              {dayNames[dayObj.getDay()]}
                            </span>
                            <span className="text-base sm:text-lg font-bold my-0.5">
                              {dayObj.getDate()}
                            </span>
                            {count > 0 ? (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                                  isSelected
                                    ? 'bg-white/20 text-white'
                                    : 'bg-[#EDF3EE] text-[#4C6352]'
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
                    /* Vista Mensual */
                    <div>
                      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-stone-400 mb-1.5">
                        <span>Lun</span>
                        <span>Mar</span>
                        <span>Mié</span>
                        <span>Jue</span>
                        <span>Vie</span>
                        <span>Sáb</span>
                        <span>Dom</span>
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
                              <span className="text-xs sm:text-sm font-semibold">
                                {dayObj.getDate()}
                              </span>
                              {count > 0 && (
                                <span
                                  className={`mt-0.5 text-[10px] px-1.5 rounded-full font-medium ${
                                    isSelected
                                      ? 'bg-white/25 text-white'
                                      : 'bg-[#EDF3EE] text-[#4C6352]'
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

                {/* Detalle del Día Seleccionado: Clases + Personas Registradas con Abono */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-base">
                      Detalle del día:{' '}
                      <span className="text-[#5C7362]">{formatDateDDMMYYYY(selectedDate)}</span>
                    </h3>
                    <span className="text-xs text-stone-500">
                      {dayClassesAdmin.length}{' '}
                      {dayClassesAdmin.length === 1 ? 'actividad' : 'actividades'}
                    </span>
                  </div>

                  {dayClassesAdmin.length === 0 ? (
                    <div className="bg-white rounded-3xl p-8 text-center border border-stone-200/70 text-stone-500 text-sm">
                      No hay clases programadas para el{' '}
                      <strong>{formatDateDDMMYYYY(selectedDate)}</strong>. Usa{' '}
                      <strong>+ Programar Horarios</strong> para cargar turnos.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dayClassesAdmin.map((cls) => {
                        const classBookings = bookings.filter((b) => b.classId === cls.id);

                        return (
                          <div
                            key={cls.id}
                            className={`bg-white rounded-3xl p-5 border shadow-2xs ${
                              cls.is_cancelled
                                ? 'border-rose-200 bg-rose-50/20'
                                : 'border-stone-200/70'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                              <div>
                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                  {getCategoryBadge(cls.category)}
                                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-lg bg-[#EDF3EE] text-[#4C6352]">
                                    {cls.time} hs ({cls.duration} min)
                                  </span>
                                  <span className="text-xs text-stone-500 font-medium">
                                    Cupo: {classBookings.length}/{cls.capacity}
                                  </span>
                                  {cls.is_cancelled && (
                                    <span className="text-xs font-semibold px-2 py-0.5 bg-rose-100 text-rose-700 rounded-lg">
                                      PAUSADA / CANCELADA
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-semibold text-base">
                                  {cls.title}{' '}
                                  <span className="text-sm font-normal text-stone-500">
                                    — {cls.instructor}
                                  </span>
                                </h4>
                              </div>

                              {/* Acciones dentro de cada box de clase: Editar, Pausar, Eliminar */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleOpenEditClass(cls)}
                                  title="Editar clase"
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
                                  {cls.is_cancelled ? 'Reactivar' : 'Pausar'}
                                </button>

                                <button
                                  onClick={() => handleDeleteClass(cls.id)}
                                  title="Eliminar clase"
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                                </button>
                              </div>
                            </div>

                            {/* Personas registradas con contador de abono (ej: Federico: 1/4) y Asistió / No asistió */}
                            <div className="mt-4">
                              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2.5">
                                Personas registradas ({classBookings.length})
                              </p>
                              {classBookings.length === 0 ? (
                                <p className="text-xs text-stone-400 italic">
                                  Aún no hay personas registradas en este horario.
                                </p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                  {classBookings.map((booking) => {
                                    const st = students.find((s) => s.id === booking.studentId);
                                    if (!st) return null;
                                    const isNoShow = booking.attendanceStatus === 'no_show';
                                    const isAttended =
                                      booking.attendanceStatus === 'attended' ||
                                      (!isNoShow && booking.attended);

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
                                            {st.name}:{' '}
                                            <span className="text-[#5C7362]">
                                              {getStudentQuotaDisplay(st)}
                                            </span>
                                          </p>
                                          <p className="text-[11px] text-stone-500">{st.plan}</p>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                          <button
                                            onClick={() =>
                                              handleSetAttendanceStatus(booking.id, 'attended')
                                            }
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
                                            onClick={() =>
                                              handleSetAttendanceStatus(booking.id, 'no_show')
                                            }
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
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PESTAÑA 2: DASHBOARD DE MÉTRICAS Y ACTUALIZACIÓN DE ASISTENCIA */}
            {adminTab === 'dashboard' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Dashboard & Control de Asistencia</h2>
                  <p className="text-sm text-stone-500">
                    Resumen general del estudio y actualización directa de asistencia
                  </p>
                </div>

                {/* Tarjetas KPI */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                  <div className="bg-white rounded-3xl p-4 border border-stone-200/70 shadow-2xs">
                    <p className="text-xs text-stone-500 font-medium">Alumnos Activos</p>
                    <p className="text-2xl font-bold text-[#5C7362] mt-1">
                      {activeStudentsCount}
                    </p>
                    <p className="text-[11px] text-stone-400 mt-1">
                      De {students.length} registrados
                    </p>
                  </div>

                  <div className="bg-white rounded-3xl p-4 border border-stone-200/70 shadow-2xs">
                    <p className="text-xs text-stone-500 font-medium">Abonos por Renovar</p>
                    <p className="text-2xl font-bold text-amber-700 mt-1">
                      {overdueOrSoonCount}
                    </p>
                    <p className="text-[11px] text-stone-400 mt-1">Vencidos o ≤ 5 días</p>
                  </div>

                  <div className="bg-white rounded-3xl p-4 border border-stone-200/70 shadow-2xs">
                    <p className="text-xs text-stone-500 font-medium">Reservas Totales</p>
                    <p className="text-2xl font-bold text-[#2D332F] mt-1">
                      {totalBookingsCount}
                    </p>
                    <p className="text-[11px] text-stone-400 mt-1">En agenda cargada</p>
                  </div>

                  <div className="bg-white rounded-3xl p-4 border border-stone-200/70 shadow-2xs">
                    <p className="text-xs text-stone-500 font-medium">Tasa de Asistencia</p>
                    <p className="text-2xl font-bold text-[#5C7362] mt-1">{attendanceRate}%</p>
                    <p className="text-[11px] text-stone-400 mt-1">
                      {totalAttendedCount} asistencias marcadas
                    </p>
                  </div>
                </div>

                {/* Actualizar Asistencia por Fecha y Clase */}
                <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                    <div>
                      <h3 className="font-semibold text-base">
                        Actualizar Asistencia ({formatDateDDMMYYYY(selectedDate)})
                      </h3>
                      <p className="text-xs text-stone-500">
                        Selecciona la fecha y la clase para marcar Asistió o No asistió
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          setDashboardClassFilter('ALL');
                        }}
                        className="text-sm font-medium bg-[#F7F5F0] px-3 py-1.5 rounded-xl border border-stone-200"
                      />

                      <select
                        value={dashboardClassFilter}
                        onChange={(e) => setDashboardClassFilter(e.target.value)}
                        className="text-sm font-medium bg-[#F7F5F0] px-3 py-1.5 rounded-xl border border-stone-200"
                      >
                        <option value="ALL">Todas las clases del día</option>
                        {dayClassesAdmin.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.time} hs — {c.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {dashboardFilteredClasses.length === 0 ? (
                    <p className="text-sm text-stone-500 py-4 text-center">
                      No hay clases programadas en esta fecha.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {dashboardFilteredClasses.map((cls) => {
                        const clsBookings = bookings.filter((b) => b.classId === cls.id);
                        return (
                          <div
                            key={cls.id}
                            className="p-4 rounded-2xl bg-[#F7F5F0]/70 border border-stone-200/70 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-xs font-semibold text-[#5C7362]">
                                  {cls.time} hs
                                </span>{' '}
                                <span className="font-semibold text-sm">• {cls.title}</span>
                              </div>
                              <span className="text-xs font-medium text-stone-600">
                                Presentes:{' '}
                                {
                                  clsBookings.filter(
                                    (b) => b.attendanceStatus === 'attended' || b.attended
                                  ).length
                                }
                                /{clsBookings.length}
                              </span>
                            </div>

                            {clsBookings.length === 0 ? (
                              <p className="text-xs text-stone-400 italic">
                                Sin alumnos inscritos en este turno.
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {clsBookings.map((b) => {
                                  const st = students.find((s) => s.id === b.studentId);
                                  if (!st) return null;
                                  const isNoShow = b.attendanceStatus === 'no_show';
                                  const isAttended =
                                    b.attendanceStatus === 'attended' || (!isNoShow && b.attended);

                                  return (
                                    <div
                                      key={b.id}
                                      className="bg-white p-3 rounded-xl border border-stone-200/80 flex flex-wrap items-center justify-between gap-2"
                                    >
                                      <div>
                                        <p className="text-sm font-semibold">
                                          {st.name}{' '}
                                          <span className="text-[#5C7362]">
                                            ({getStudentQuotaDisplay(st)})
                                          </span>
                                        </p>
                                        <p className="text-xs text-stone-500">{st.plan}</p>
                                      </div>

                                      <div className="flex items-center gap-1.5">
                                        <button
                                          onClick={() =>
                                            handleSetAttendanceStatus(b.id, 'attended')
                                          }
                                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                            isAttended
                                              ? 'bg-[#5C7362] text-white hover:bg-[#4B5F50]'
                                              : 'bg-[#EDF3EE] text-[#4C6352] hover:bg-[#dce8de]'
                                          }`}
                                        >
                                          <UserCheck className="w-3.5 h-3.5" />
                                          Asistió
                                        </button>

                                        <button
                                          onClick={() =>
                                            handleSetAttendanceStatus(b.id, 'no_show')
                                          }
                                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                            isNoShow
                                              ? 'bg-rose-600 text-white hover:bg-rose-700'
                                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
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
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PESTAÑA 3: ALUMNOS (con Editar y Borrar) */}
            {adminTab === 'students' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">Alumnos & Consultantes</h2>
                    <p className="text-sm text-stone-500">
                      Crea, edita, elimina o administra abonos de alumnos
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
                    placeholder="Buscar por nombre o modalidad..."
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
                          <th className="py-3.5 px-4 font-medium">Modalidad</th>
                          <th className="py-3.5 px-4 font-medium">Saldo / Abono</th>
                          <th className="py-3.5 px-4 font-medium">Vencimiento</th>
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
                            <td className="py-3.5 px-4">
                              {isUnlimitedPlan(st.plan) ? (
                                <span className="text-xs bg-[#EDF3EE] text-[#4C6352] px-2.5 py-0.5 rounded-lg font-medium">
                                  Pase Libre
                                </span>
                              ) : (
                                <span>
                                  {st.credits} disp. ({getStudentQuotaDisplay(st)})
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-stone-600">
                              {formatDateDDMMYYYY(st.expiryDate)}
                            </td>
                            <td className="py-3.5 px-4">{getStatusBadge(st)}</td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => handleOpenEditStudent(st)}
                                  title="Editar alumno"
                                  className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-lg border border-stone-200 transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteStudent(st.id)}
                                  title="Eliminar alumno"
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

            {/* PESTAÑA 4: PAGOS Y WHATSAPP */}
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
                          <p className="text-xs text-[#5C7362] font-medium mt-0.5">{st.plan}</p>
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
                          className="flex items-center justify-center gap-1 bg-[#EDF3EE] text-[#4C6352] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all"
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
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E5E0D8] py-2 px-4 text-center z-30">
        <p className="text-xs text-stone-600 tracking-wide">
          © {new Date().getFullYear()}{' '}
          <strong className="font-semibold text-stone-800">Espacio Sat-Nam</strong> •{' '}
          <span className="font-medium text-[#5C7362]">by Patricia Aleman</span>. Todos los
          derechos reservados.
        </p>
      </footer>

      {/* Navegación móvil inferior Modo Estudio */}
      {role === 'admin' && (
        <nav className="md:hidden fixed bottom-8 left-0 right-0 bg-white border-t border-stone-200 flex justify-around py-2 px-2 z-40">
          <button
            onClick={() => setAdminTab('schedule')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
              adminTab === 'schedule' ? 'text-[#5C7362]' : 'text-stone-400'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Agenda
          </button>
          <button
            onClick={() => setAdminTab('dashboard')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
              adminTab === 'dashboard' ? 'text-[#5C7362]' : 'text-stone-400'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => setAdminTab('students')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
              adminTab === 'students' ? 'text-[#5C7362]' : 'text-stone-400'
            }`}
          >
            <Users className="w-4 h-4" />
            Alumnos
          </button>
          <button
            onClick={() => setAdminTab('payments')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
              adminTab === 'payments' ? 'text-[#5C7362]' : 'text-stone-400'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Pagos
          </button>
        </nav>
      )}

      {/* Modal: PIN Modo Estudio */}
      {showPinModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 shadow-xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#EDF3EE] text-[#4C6352] flex items-center justify-center mx-auto mb-3">
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
                    : 'border-stone-200 focus:border-[#5C7362]'
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
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-[#5C7362] hover:bg-[#4B5F50] text-white"
                >
                  Ingresar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Perfil Alumno */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Editar Mi Perfil</h3>
              <button onClick={() => setShowEditProfileModal(false)}>
                <XCircle className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Nombre y Apellido
                </label>
                <input
                  required
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Teléfono WhatsApp
                </label>
                <input
                  required
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#5C7362] hover:bg-[#4B5F50] text-white font-medium py-2.5 rounded-xl mt-2"
              >
                Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: + Servicio (Solo agregar) */}
      {showAddServiceModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Agregar Servicio</h3>
              <button onClick={() => setShowAddServiceModal(false)}>
                <XCircle className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleAddService} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Nombre del Servicio
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ej. Yoga Nidra, Masajes..."
                  value={newServiceForm.label}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, label: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Categoría en Vista Alumno
                </label>
                <select
                  value={newServiceForm.pillar}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, pillar: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 bg-white"
                >
                  <option value="cuerpo">Cuerpo & Movimiento</option>
                  <option value="mente">Mente & Procesos</option>
                  <option value="estetica">Cuidado & Estética</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Cupo Predeterminado
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  max="60"
                  value={newServiceForm.defaultCap}
                  onChange={(e) =>
                    setNewServiceForm({ ...newServiceForm, defaultCap: e.target.value })
                  }
                  className="w-full border border-stone-200 rounded-xl px-3 py-2"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#5C7362] hover:bg-[#4B5F50] text-white font-medium py-2.5 rounded-xl mt-2"
              >
                Agregar Servicio
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Programar / Editar Horarios (hasta 4 semanas) */}
      {showClassModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">
                {editingClassId ? 'Editar Clase' : 'Programar Horarios'}
              </h3>
              <button onClick={() => setShowClassModal(false)}>
                <XCircle className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">
                  Servicio
                </label>
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
                        classForm.category === srv.id
                          ? 'bg-[#5C7362] text-white border-transparent'
                          : 'bg-[#F7F5F0] text-stone-600 border-stone-200'
                      }`}
                    >
                      {srv.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-stone-600">
                    Nombre de la Clase / Taller
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-stone-500">
                    <input
                      type="checkbox"
                      checked={classForm.isCustomTitle}
                      onChange={(e) => {
                        const custom = e.target.checked;
                        const srv = services.find((s) => s.id === classForm.category);
                        setClassForm({
                          ...classForm,
                          isCustomTitle: custom,
                          title: custom ? classForm.title : srv?.label || ''
                        });
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
                  value={
                    classForm.isCustomTitle
                      ? classForm.title
                      : services.find((s) => s.id === classForm.category)?.label || ''
                  }
                  onChange={(e) => setClassForm({ ...classForm, title: e.target.value })}
                  className={`w-full border border-stone-200 rounded-xl px-3 py-2 text-sm ${
                    !classForm.isCustomTitle ? 'bg-stone-50 text-stone-700 font-medium' : 'bg-white'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Facilitadora
                </label>
                <input
                  required
                  type="text"
                  value={classForm.instructor}
                  onChange={(e) => setClassForm({ ...classForm, instructor: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 bg-stone-50 font-medium"
                />
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
                              const updated = isSelected
                                ? classForm.selectedDays.filter((d) => d !== day.id)
                                : [...classForm.selectedDays, day.id];
                              setClassForm({ ...classForm, selectedDays: updated });
                            }}
                            className={`py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                              isSelected
                                ? 'bg-[#5C7362] text-white border-transparent'
                                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            {day.short}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Repetición semanal
                    </label>
                    <select
                      value={classForm.weeksCount}
                      onChange={(e) =>
                        setClassForm({ ...classForm, weeksCount: Number(e.target.value) })
                      }
                      className="w-full border border-stone-200 rounded-xl px-3 py-2 bg-white text-sm"
                    >
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
                  <input
                    required
                    type="time"
                    value={classForm.time}
                    onChange={(e) => setClassForm({ ...classForm, time: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-2.5 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Duración (min)
                  </label>
                  <input
                    required
                    type="number"
                    min="15"
                    max="480"
                    value={classForm.duration}
                    onChange={(e) => setClassForm({ ...classForm, duration: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-2.5 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Cupo</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="60"
                    value={classForm.capacity}
                    onChange={(e) => setClassForm({ ...classForm, capacity: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-2.5 py-2 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#5C7362] hover:bg-[#4B5F50] text-white font-medium py-2.5 rounded-xl mt-2"
              >
                {editingClassId ? 'Guardar Cambios' : 'Guardar Horarios'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Crear / Editar Alumno */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">
                {editingStudentId ? 'Editar Alumno / Consultante' : 'Nuevo Alumno / Consultante'}
              </h3>
              <button onClick={() => setShowStudentModal(false)}>
                <XCircle className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Nombre Completo
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ej. María Gómez"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
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
                  value={studentForm.phone}
                  onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Modalidad / Plan
                  </label>
                  <select
                    value={studentForm.plan}
                    onChange={(e) => {
                      const chosenPlan = e.target.value;
                      setStudentForm({
                        ...studentForm,
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
                    disabled={isUnlimitedPlan(studentForm.plan)}
                    value={isUnlimitedPlan(studentForm.plan) ? 99 : studentForm.credits}
                    onChange={(e) => setStudentForm({ ...studentForm, credits: e.target.value })}
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
                  value={studentForm.expiryDate}
                  onChange={(e) => setStudentForm({ ...studentForm, expiryDate: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#5C7362] hover:bg-[#4B5F50] text-white font-medium py-2.5 rounded-xl mt-2"
              >
                {editingStudentId ? 'Guardar Cambios' : 'Guardar Registro'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
