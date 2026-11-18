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
  Sparkles,
  UserCheck,
  Search,
  Trash2,
  ShieldCheck,
  Bike,
  Heart,
  Check,
  RefreshCw
} from 'lucide-react';

// Conexión a tu base de datos en Supabase
const supabaseUrl = 'https://miwktvtdygetyzqvccal.supabase.co';
const supabaseKey = 'sb_publishable_45-FeV94kQsHYfau3pJPjg_DOo7R6yx';
const supabase = createClient(supabaseUrl, supabaseKey);

const PLAN_OPTIONS = [
  'Clase Individual',
  'Mensual - 1 vez por semana',
  'Mensual - 2 veces por semana',
  'Mensual - 3 veces por semana',
  'Pase Libre Yoga & Spinning'
];

export default function App() {
  const [role, setRole] = useState('student');
  const [adminTab, setAdminTab] = useState('schedule');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

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
    room: 'Sala Mandala (Yoga)'
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

  const getDefaultCreditsForPlan = (plan) => {
    if (plan === 'Pase Libre Yoga & Spinning') return 99;
    if (plan === 'Mensual - 3 veces por semana') return 12;
    if (plan === 'Mensual - 2 veces por semana') return 8;
    if (plan === 'Mensual - 1 vez por semana') return 4;
    if (plan === 'Clase Individual') return 1;
    return 4;
  };

  // Reservar o Cancelar clase
  const handleToggleBooking = async (classId) => {
    if (!activeStudent) {
      showToast('Primero agrega un alumno desde el Modo Estudio', 'error');
      return;
    }

    const existingBooking = bookings.find(
      (b) => b.classId === classId && b.studentId === activeStudent.id
    );

    if (existingBooking) {
      // Cancelar reserva
      const { error } = await supabase.from('bookings').delete().eq('id', existingBooking.id);
      if (error) {
        showToast('No se pudo cancelar la reserva', 'error');
        return;
      }

      setBookings((prev) => prev.filter((b) => b.id !== existingBooking.id));

      if (activeStudent.plan !== 'Pase Libre Yoga & Spinning') {
        const updatedCredits = activeStudent.credits + 1;
        await supabase.from('students').update({ credits: updatedCredits }).eq('id', activeStudent.id);
        setStudents((prev) =>
          prev.map((s) => (s.id === activeStudent.id ? { ...s, credits: updatedCredits } : s))
        );
      }
      showToast('Reserva cancelada correctamente');
    } else {
      // Validar cupos y créditos
      const classObj = classes.find((c) => c.id === classId);
      const classBookingsCount = bookings.filter((b) => b.classId === classId).length;

      if (classBookingsCount >= classObj.capacity) {
        showToast('Esta clase ya alcanzó su cupo máximo.', 'error');
        return;
      }

      if (activeStudent.plan !== 'Pase Libre Yoga & Spinning' && activeStudent.credits <= 0) {
        showToast('Sin clases disponibles en tu abono. Renueva tu plan en el estudio.', 'error');
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

      if (activeStudent.plan !== 'Pase Libre Yoga & Spinning') {
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

  // Crear nueva clase
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
      showToast('Error al guardar la clase', 'error');
      return;
    }

    setClasses((prev) => [...prev, data]);
    setShowNewClassModal(false);
    setNewClass({
      title: '',
      category: 'Yoga',
      instructor: '',
      date: selectedDate,
      time: '10:00',
      duration: 60,
      capacity: 12,
      room: 'Sala Mandala (Yoga)'
    });
    showToast('Clase agregada a la agenda');
  };

  // Eliminar clase
  const handleDeleteClass = async (classId) => {
    const { error } = await supabase.from('classes').delete().eq('id', classId);
    if (!error) {
      setClasses((prev) => prev.filter((c) => c.id !== classId));
      setBookings((prev) => prev.filter((b) => b.classId !== classId));
      showToast('Turno eliminado de la agenda');
    }
  };

  // Crear nuevo alumno
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
      showToast('Error al registrar alumno', 'error');
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
    showToast('Alumno registrado con éxito');
  };

  // Renovar abono de alumno
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

  // Generar enlace de WhatsApp para recordatorio de pago
  const getWhatsAppReminderUrl = (student) => {
    const cleanPhone = student.phone.replace(/\D/g, '');
    const message = `¡Hola ${student.name}! Te saludamos desde *Espacio SAT-NAM* 🧘‍♀️🚴‍♂️. Te recordamos que tu abono (*${student.plan}*) vence el día *${student.expiryDate}*. Avísanos por aquí si deseas renovarlo para mantener tu lugar en las clases. ¡Namasté! ✨`;
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
        <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-rose-100 text-rose-800">
          Vencido
        </span>
      );
    }
    const diffDays = Math.ceil(
      (new Date(student.expiryDate) - new Date(today)) / (1000 * 60 * 60 * 24)
    );
    if (diffDays <= 5) {
      return (
        <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
          Vence pronto ({diffDays}d)
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">
        Al día
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    if (category === 'Spinning') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
          <Bike className="w-3 h-3" /> SPINNING
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
        <Heart className="w-3 h-3" /> YOGA
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#2D332F] font-sans pb-20 md:pb-8">
      {/* Notificación flotante */}
      {notification && (
        <div
          className={`fixed bottom-20 md:bottom-6 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium transition-all ${
            notification.type === 'error'
              ? 'bg-rose-600 text-white'
              : 'bg-[#2D332F] text-white'
          }`}
        >
          <Check className="w-4 h-4" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Encabezado */}
      <header className="bg-white/90 backdrop-blur-md border-b border-[#E5E0D8] sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#5C7362] flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold text-lg tracking-tight text-[#252B27] leading-none">
                Espacio SAT-NAM
              </h1>
              <p className="text-xs text-[#737D76] mt-0.5">Yoga & Spinning Studio</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAllData}
              title="Actualizar datos"
              className="p-2 rounded-xl text-[#737D76] hover:bg-[#EFECE6] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <div className="flex items-center bg-[#EFECE6] p-1 rounded-xl border border-[#E2DDD4]">
              <button
                onClick={() => setRole('student')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  role === 'student'
                    ? 'bg-[#5C7362] text-white shadow-sm'
                    : 'text-[#616B64] hover:text-[#2D332F]'
                }`}
              >
                Vista Alumno
              </button>
              <button
                onClick={() => setRole('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                  role === 'admin'
                    ? 'bg-[#5C7362] text-white shadow-sm'
                    : 'text-[#616B64] hover:text-[#2D332F]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Modo Estudio
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6">
        {loading && students.length === 0 && classes.length === 0 ? (
          <div className="text-center py-16 text-[#737D76]">
            Conectando con la agenda de Espacio SAT-NAM...
          </div>
        ) : role === 'student' ? (
          <div className="space-y-6">
            {/* Selector de Alumno Activo */}
            {students.length > 0 ? (
              <div className="bg-white rounded-2xl p-4 border border-[#E6E1D8] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#E8EFEA] text-[#4C6352] font-semibold flex items-center justify-center text-base">
                    {activeStudent?.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#7B857E] uppercase tracking-wider font-medium">
                        Alumno Activo:
                      </span>
                      <select
                        value={activeStudentId}
                        onChange={(e) => setActiveStudentId(e.target.value)}
                        className="text-sm font-semibold bg-[#F7F5F0] border border-[#DCD6CC] rounded-lg px-2 py-1 focus:outline-none focus:border-[#5C7362]"
                      >
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-[#5C7362] font-medium bg-[#EDF3EE] px-2 py-0.5 rounded-md">
                        {activeStudent?.plan}
                      </span>
                      {activeStudent && getStatusBadge(activeStudent)}
                      {activeStudent &&
                        activeStudent.plan !== 'Pase Libre Yoga & Spinning' && (
                          <span className="text-xs text-[#616B64]">
                            • <strong>{activeStudent.credits}</strong> clases disponibles
                          </span>
                        )}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-[#737D76] sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-[#EFECE6]">
                  Vencimiento de Abono:
                  <span className="block font-semibold text-[#2D332F] text-sm">
                    {activeStudent?.expiryDate}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900">
                Aún no hay alumnos registrados. Cambia a <strong>Modo Estudio</strong> arriba a la derecha para agregar tus primeros alumnos y crear los horarios de clases.
              </div>
            )}

            {/* Filtros de fecha y disciplina */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-[#252B27]">Reserva de Turnos</h2>
                <p className="text-sm text-[#737D76]">
                  Elige tus clases de Yoga y Spinning en Espacio SAT-NAM
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex bg-white p-1 rounded-xl border border-[#DCD6CC]">
                  {['Todas', 'Yoga', 'Spinning'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        categoryFilter === cat
                          ? 'bg-[#5C7362] text-white'
                          : 'text-[#616B64] hover:text-[#2D332F]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#DCD6CC] shadow-sm">
                  <Calendar className="w-4 h-4 text-[#5C7362]" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="text-sm font-medium bg-transparent focus:outline-none text-[#2D332F]"
                  />
                </div>
              </div>
            </div>

            {/* Tarjetas de Clases */}
            {filteredClasses.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-[#E6E1D8]">
                <p className="text-[#737D76] mb-3">
                  No hay clases programadas para esta fecha o filtro.
                </p>
                <button
                  onClick={() => {
                    setCategoryFilter('Todas');
                    setRole('admin');
                  }}
                  className="text-sm font-medium text-[#5C7362] underline"
                >
                  Ir a Modo Estudio para agregar clases
                </button>
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
                      className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                        isBooked
                          ? 'border-[#5C7362] ring-1 ring-[#5C7362]/20 shadow-md'
                          : 'border-[#E6E1D8] shadow-sm hover:border-[#C5BEB2]'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            {getCategoryBadge(cls.category)}
                            <span className="text-xs text-[#737D76]">{cls.room}</span>
                          </div>
                          {isBooked && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#5C7362] text-white">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Reservado
                            </span>
                          )}
                        </div>

                        <h3 className="font-semibold text-lg text-[#252B27]">{cls.title}</h3>

                        <div className="flex items-center gap-4 text-sm text-[#616B64] mt-3">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-[#5C7362]" />
                            {cls.time} ({cls.duration} min)
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-[#5C7362]" />
                            Prof. {cls.instructor}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-[#F0EDE6] flex items-center justify-between">
                        <div>
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                              spotsLeft === 0
                                ? 'bg-rose-100 text-rose-700'
                                : spotsLeft <= 3
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-[#F2F5F3] text-[#4C6352]'
                            }`}
                          >
                            {spotsLeft === 0 ? 'Cupo completo' : `${spotsLeft} lugares libres`}
                          </span>
                        </div>

                        <button
                          onClick={() => handleToggleBooking(cls.id)}
                          disabled={!isBooked && spotsLeft === 0}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            isBooked
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                              : spotsLeft === 0
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-[#5C7362] text-white hover:bg-[#4B5F50] shadow-sm'
                          }`}
                        >
                          {isBooked ? 'Cancelar Reserva' : 'Reservar Lugar'}
                        </button>
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
            <div className="hidden md:flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-[#E6E1D8] w-fit shadow-sm">
              <button
                onClick={() => setAdminTab('schedule')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  adminTab === 'schedule'
                    ? 'bg-[#5C7362] text-white shadow-sm'
                    : 'text-[#616B64] hover:bg-[#F7F5F0]'
                }`}
              >
                <Calendar className="w-4 h-4" /> Agenda y Asistencia
              </button>
              <button
                onClick={() => setAdminTab('students')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  adminTab === 'students'
                    ? 'bg-[#5C7362] text-white shadow-sm'
                    : 'text-[#616B64] hover:bg-[#F7F5F0]'
                }`}
              >
                <Users className="w-4 h-4" /> Alumnos y Abonos
              </button>
              <button
                onClick={() => setAdminTab('payments')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  adminTab === 'payments'
                    ? 'bg-[#5C7362] text-white shadow-sm'
                    : 'text-[#616B64] hover:bg-[#F7F5F0]'
                }`}
              >
                <CreditCard className="w-4 h-4" /> Pagos y WhatsApp
              </button>
            </div>

            {adminTab === 'schedule' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-[#252B27]">Agenda Espacio SAT-NAM</h2>
                    <p className="text-sm text-[#737D76]">
                      Controla los inscriptos por turno y marca la asistencia en sala
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="text-sm font-medium bg-white px-3 py-2 rounded-xl border border-[#DCD6CC]"
                    />
                    <button
                      onClick={() => {
                        setNewClass((prev) => ({ ...prev, date: selectedDate }));
                        setShowNewClassModal(true);
                      }}
                      className="flex items-center gap-1.5 bg-[#5C7362] hover:bg-[#4B5F50] text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-all"
                    >
                      <Plus className="w-4 h-4" /> Nueva Clase
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
                          className="bg-white rounded-2xl p-5 border border-[#E6E1D8] shadow-sm"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#F0EDE6]">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                {getCategoryBadge(cls.category)}
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#EDF3EE] text-[#4C6352]">
                                  {cls.time} hs
                                </span>
                                <span className="text-xs text-[#737D76]">• {cls.room}</span>
                              </div>
                              <h3 className="font-semibold text-base text-[#252B27]">
                                {cls.title}{' '}
                                <span className="text-sm font-normal text-[#737D76]">
                                  — Prof. {cls.instructor}
                                </span>
                              </h3>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-[#4C6352]">
                                Inscriptos: {classBookings.length} / {cls.capacity}
                              </span>
                              <button
                                onClick={() => handleDeleteClass(cls.id)}
                                title="Eliminar clase"
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-4">
                            {classBookings.length === 0 ? (
                              <p className="text-xs text-[#8C968F] italic">
                                Aún no hay alumnos anotados en este turno.
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
                                      className={`cursor-pointer p-3 rounded-xl border flex items-center justify-between transition-all ${
                                        booking.attended
                                          ? 'bg-[#EDF3EE] border-[#5C7362]/40'
                                          : 'bg-[#FAF9F6] border-[#E6E1D8] hover:border-[#C5BEB2]'
                                      }`}
                                    >
                                      <div>
                                        <p className="text-sm font-medium text-[#252B27]">
                                          {st.name}
                                        </p>
                                        <p className="text-[11px] text-[#737D76]">{st.plan}</p>
                                      </div>

                                      <span
                                        className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
                                          booking.attended
                                            ? 'bg-[#5C7362] text-white'
                                            : 'bg-white text-[#737D76] border border-[#DCD6CC]'
                                        }`}
                                      >
                                        <UserCheck className="w-3.5 h-3.5" />
                                        {booking.attended ? 'Presente' : 'Marcar'}
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
                    <div className="bg-white rounded-2xl p-8 text-center border border-[#E6E1D8] text-[#737D76]">
                      No hay clases cargadas para esta fecha. Haz clic en{' '}
                      <strong>+ Nueva Clase</strong> para crear tu primer turno.
                    </div>
                  )}
                </div>
              </div>
            )}

            {adminTab === 'students' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-[#252B27]">Alumnos & Planes</h2>
                    <p className="text-sm text-[#737D76]">
                      Administra los abonos de Yoga, Spinning y Pase Libre
                    </p>
                  </div>

                  <button
                    onClick={() => setShowNewStudentModal(true)}
                    className="flex items-center gap-1.5 bg-[#5C7362] hover:bg-[#4B5F50] text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm w-fit"
                  >
                    <Plus className="w-4 h-4" /> Nuevo Alumno
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-[#8C968F] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Buscar alumno por nombre o tipo de abono..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white pl-10 pr-4 py-2.5 rounded-xl border border-[#DCD6CC] text-sm focus:outline-none focus:border-[#5C7362]"
                  />
                </div>

                <div className="bg-white rounded-2xl border border-[#E6E1D8] overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#FAF9F6] border-b border-[#E6E1D8] text-xs uppercase tracking-wider text-[#737D76]">
                          <th className="py-3.5 px-4 font-medium">Alumno</th>
                          <th className="py-3.5 px-4 font-medium">Modalidad de Abono</th>
                          <th className="py-3.5 px-4 font-medium">Saldo</th>
                          <th className="py-3.5 px-4 font-medium">Vencimiento</th>
                          <th className="py-3.5 px-4 font-medium">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0EDE6] text-sm">
                        {filteredStudents.map((st) => (
                          <tr key={st.id} className="hover:bg-[#FAF9F6]">
                            <td className="py-3.5 px-4">
                              <p className="font-medium text-[#252B27]">{st.name}</p>
                              <p className="text-xs text-[#737D76]">{st.phone}</p>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-medium text-[#4C6352]">{st.plan}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              {st.plan === 'Pase Libre Yoga & Spinning' ? (
                                <span className="text-xs bg-[#EDF3EE] text-[#4C6352] px-2 py-0.5 rounded-md font-medium">
                                  Ilimitado
                                </span>
                              ) : (
                                <span>{st.credits} clases</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-[#616B64]">{st.expiryDate}</td>
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
                  <h2 className="text-xl font-semibold text-[#252B27]">
                    Recordatorios de Pago y Renovación
                  </h2>
                  <p className="text-sm text-[#737D76]">
                    Envía avisos automáticos por WhatsApp o registra el pago mensual
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {students.map((st) => (
                    <div
                      key={st.id}
                      className="bg-white rounded-2xl p-5 border border-[#E6E1D8] shadow-sm flex flex-col justify-between gap-4"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="font-semibold text-base text-[#252B27]">{st.name}</h3>
                          <p className="text-xs text-[#5C7362] font-medium mt-0.5">{st.plan}</p>
                          <p className="text-xs text-[#737D76] mt-0.5">
                            Vence el: <strong>{st.expiryDate}</strong>
                          </p>
                        </div>
                        {getStatusBadge(st)}
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-[#F0EDE6]">
                        <a
                          href={getWhatsAppReminderUrl(st)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white py-2 px-3 rounded-xl text-xs font-semibold shadow-sm transition-all"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Recordatorio WhatsApp
                        </a>

                        <button
                          onClick={() => handleRenewPlan(st.id)}
                          className="flex items-center justify-center gap-1 bg-[#F2F5F3] hover:bg-[#E2EBE4] text-[#4C6352] py-2 px-3 rounded-xl text-xs font-semibold transition-all"
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

      {/* Navegación móvil inferior */}
      {role === 'admin' && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E0D8] flex justify-around py-2.5 px-2 z-40">
          <button
            onClick={() => setAdminTab('schedule')}
            className={`flex flex-col items-center gap-1 text-xs font-medium ${
              adminTab === 'schedule' ? 'text-[#5C7362]' : 'text-[#8C968F]'
            }`}
          >
            <Calendar className="w-5 h-5" />
            Agenda
          </button>
          <button
            onClick={() => setAdminTab('students')}
            className={`flex flex-col items-center gap-1 text-xs font-medium ${
              adminTab === 'students' ? 'text-[#5C7362]' : 'text-[#8C968F]'
            }`}
          >
            <Users className="w-5 h-5" />
            Alumnos
          </button>
          <button
            onClick={() => setAdminTab('payments')}
            className={`flex flex-col items-center gap-1 text-xs font-medium ${
              adminTab === 'payments' ? 'text-[#5C7362]' : 'text-[#8C968F]'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            Pagos
          </button>
        </nav>
      )}

      {/* Modal: Nueva Clase */}
      {showNewClassModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Agregar Turno a la Agenda</h3>
              <button onClick={() => setShowNewClassModal(false)}>
                <XCircle className="w-5 h-5 text-[#8C968F]" />
              </button>
            </div>

            <form onSubmit={handleAddClass} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-medium text-[#616B64] mb-1">Disciplina</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Yoga', 'Spinning'].map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() =>
                        setNewClass({
                          ...newClass,
                          category: cat,
                          room: cat === 'Yoga' ? 'Sala Mandala (Yoga)' : 'Sala Spin Cycle',
                          capacity: cat === 'Yoga' ? 12 : 10
                        })
                      }
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                        newClass.category === cat
                          ? 'bg-[#5C7362] text-white border-[#5C7362]'
                          : 'bg-[#FAF9F6] text-[#616B64] border-[#DCD6CC]'
                      }`}
                    >
                      {cat === 'Yoga' ? (
                        <Heart className="w-3.5 h-3.5" />
                      ) : (
                        <Bike className="w-3.5 h-3.5" />
                      )}
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#616B64] mb-1">
                  Nombre de la Clase
                </label>
                <input
                  required
                  type="text"
                  placeholder={
                    newClass.category === 'Yoga'
                      ? 'Ej. Kundalini Yoga, Vinyasa Flow...'
                      : 'Ej. Spinning Interval, Endurance Ride...'
                  }
                  value={newClass.title}
                  onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
                  className="w-full border border-[#DCD6CC] rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#616B64] mb-1">
                    Profesor/a
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Nombre"
                    value={newClass.instructor}
                    onChange={(e) => setNewClass({ ...newClass, instructor: e.target.value })}
                    className="w-full border border-[#DCD6CC] rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#616B64] mb-1">Sala</label>
                  <input
                    type="text"
                    value={newClass.room}
                    onChange={(e) => setNewClass({ ...newClass, room: e.target.value })}
                    className="w-full border border-[#DCD6CC] rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#616B64] mb-1">Fecha</label>
                  <input
                    required
                    type="date"
                    value={newClass.date}
                    onChange={(e) => setNewClass({ ...newClass, date: e.target.value })}
                    className="w-full border border-[#DCD6CC] rounded-xl px-2.5 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#616B64] mb-1">Hora</label>
                  <input
                    required
                    type="time"
                    value={newClass.time}
                    onChange={(e) => setNewClass({ ...newClass, time: e.target.value })}
                    className="w-full border border-[#DCD6CC] rounded-xl px-2.5 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#616B64] mb-1">
                    Cupo Máx.
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="40"
                    value={newClass.capacity}
                    onChange={(e) => setNewClass({ ...newClass, capacity: e.target.value })}
                    className="w-full border border-[#DCD6CC] rounded-xl px-2.5 py-2"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#5C7362] hover:bg-[#4B5F50] text-white font-medium py-2.5 rounded-xl mt-2"
              >
                Guardar Clase
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nuevo Alumno */}
      {showNewStudentModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Registrar Nuevo Alumno</h3>
              <button onClick={() => setShowNewStudentModal(false)}>
                <XCircle className="w-5 h-5 text-[#8C968F]" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-medium text-[#616B64] mb-1">
                  Nombre Completo
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ej. María Gómez"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full border border-[#DCD6CC] rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#616B64] mb-1">
                  Teléfono WhatsApp (con código de país)
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ej. +5491123456789"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                  className="w-full border border-[#DCD6CC] rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#616B64] mb-1">
                    Modalidad de Abono
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
                    className="w-full border border-[#DCD6CC] rounded-xl px-3 py-2 bg-white"
                  >
                    {PLAN_OPTIONS.map((planName) => (
                      <option key={planName} value={planName}>
                        {planName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#616B64] mb-1">
                    Clases Disponibles
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    disabled={newStudent.plan === 'Pase Libre Yoga & Spinning'}
                    value={
                      newStudent.plan === 'Pase Libre Yoga & Spinning' ? 99 : newStudent.credits
                    }
                    onChange={(e) => setNewStudent({ ...newStudent, credits: e.target.value })}
                    className="w-full border border-[#DCD6CC] rounded-xl px-3 py-2 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#616B64] mb-1">
                  Fecha de Vencimiento del Abono
                </label>
                <input
                  required
                  type="date"
                  value={newStudent.expiryDate}
                  onChange={(e) => setNewStudent({ ...newStudent, expiryDate: e.target.value })}
                  className="w-full border border-[#DCD6CC] rounded-xl px-3 py-2"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#5C7362] hover:bg-[#4B5F50] text-white font-medium py-2.5 rounded-xl mt-2"
              >
                Registrar Alumno
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
