import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  CreditCard, 
  MessageCircle, 
  Plus, 
  CheckCircle, 
  Clock, 
  User, 
  Sparkles, 
  Trash2, 
  Send, 
  Check, 
  AlertCircle,
  RefreshCw,
  Search
} from 'lucide-react';

// Datos iniciales de alumnos de ejemplo
const INITIAL_STUDENTS = [
  {
    id: '1',
    name: 'Lucía Fernández',
    phone: '5491155551234',
    plan: 'Pase Libre Yoga & Spinning',
    creditsLeft: 99,
    dueDate: '2026-11-15',
    status: 'active'
  },
  {
    id: '2',
    name: 'Mateo Rossi',
    phone: '5491155555678',
    plan: 'Abono Mensual 2x semana',
    creditsLeft: 4,
    dueDate: '2026-11-05',
    status: 'pending'
  },
  {
    id: '3',
    name: 'Sofia Martinez',
    phone: '5491155559012',
    plan: 'Abono Mensual 1x semana',
    creditsLeft: 1,
    dueDate: '2026-11-20',
    status: 'active'
  },
  {
    id: '4',
    name: 'Camila Torres',
    phone: '5491155553456',
    plan: 'Abono Mensual 3x semana',
    creditsLeft: 2,
    dueDate: '2026-11-02',
    status: 'pending'
  }
];

// Datos iniciales de clases de ejemplo
const INITIAL_CLASSES = [
  {
    id: 'c1',
    title: 'Yoga Vinyasa & Alineación',
    category: 'Yoga',
    instructor: 'Elena Gomez',
    date: '2026-11-08',
    time: '09:00',
    duration: '60 min',
    capacity: 12,
    attendees: ['1', '2'],
    checkedIn: ['1'],
    level: 'Todos los niveles',
    room: 'Sala Mandala (Yoga)'
  },
  {
    id: 'c2',
    title: 'Spinning Power Ride',
    category: 'Spinning',
    instructor: 'Lucas Benítez',
    date: '2026-11-08',
    time: '18:00',
    duration: '45 min',
    capacity: 10,
    attendees: ['1', '3'],
    checkedIn: [],
    level: 'Intenso / Cardio',
    room: 'Sala Spin Cycle'
  },
  {
    id: 'c3',
    title: 'Hatha Yoga Suave & Meditación',
    category: 'Yoga',
    instructor: 'Elena Gomez',
    date: '2026-11-08',
    time: '19:15',
    duration: '60 min',
    capacity: 12,
    attendees: ['4'],
    checkedIn: [],
    level: 'Restaurativo',
    room: 'Sala Mandala (Yoga)'
  },
  {
    id: 'c4',
    title: 'Spinning Endurance Morning',
    category: 'Spinning',
    instructor: 'Lucas Benítez',
    date: '2026-11-09',
    time: '08:30',
    duration: '50 min',
    capacity: 10,
    attendees: ['2'],
    checkedIn: [],
    level: 'Intermedio',
    room: 'Sala Spin Cycle'
  }
];

// Opciones de abono de Espacio SAT-NAM
const PLAN_OPTIONS = [
  { name: 'Clase Individual', defaultCredits: 1, price: '$6.000' },
  { name: 'Abono Mensual 1x semana', defaultCredits: 4, price: '$18.000' },
  { name: 'Abono Mensual 2x semana', defaultCredits: 8, price: '$26.000' },
  { name: 'Abono Mensual 3x semana', defaultCredits: 12, price: '$32.000' },
  { name: 'Pase Libre Yoga & Spinning', defaultCredits: 99, price: '$38.000' }
];

export default function App() {
  // Estados de navegación y rol
  const [activeTab, setActiveTab] = useState('bookings'); // bookings | admin | students | payments
  const [userRole, setUserRole] = useState('student'); // student | admin
  const [selectedCategory, setSelectedCategory] = useState('Todas'); // Todas | Yoga | Spinning
  const [toastMessage, setToastMessage] = useState(null);

  // Estados persistentes en LocalStorage
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('satnam_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [classes, setClasses] = useState(() => {
    const saved = localStorage.getItem('satnam_classes');
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [selectedStudentId, setSelectedStudentId] = useState(() => {
    return students[0]?.id || '';
  });

  // Estados de Modales y Filtros
  const [isNewClassModalOpen, setIsNewClassModalOpen] = useState(false);
  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('2026-11-08');

  // Estados de Formularios
  const [newClassForm, setNewClassForm] = useState({
    title: '',
    category: 'Yoga',
    instructor: '',
    date: '2026-11-08',
    time: '09:00',
    duration: '60 min',
    capacity: 12,
    level: 'Todos los niveles',
    room: 'Sala Mandala (Yoga)'
  });

  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    phone: '',
    plan: 'Abono Mensual 2x semana',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Sincronización con almacenamiento local
  useEffect(() => {
    localStorage.setItem('satnam_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('satnam_classes', JSON.stringify(classes));
  }, [classes]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Perfil del alumno activo
  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];

  // Reservar o cancelar turno
  const handleRegisterBooking = (classId) => {
    if (!currentStudent) return;

    const cls = classes.find(c => c.id === classId);
    if (!cls) return;

    if (cls.attendees.includes(currentStudent.id)) {
      // Cancelar reserva
      setClasses(prev => prev.map(c => {
        if (c.id === classId) {
          return {
            ...c,
            attendees: c.attendees.filter(id => id !== currentStudent.id),
            checkedIn: c.checkedIn.filter(id => id !== currentStudent.id)
          };
        }
        return c;
      }));
      showToast('Reserva cancelada correctamente.');
    } else {
      // Agregar reserva si hay cupos
      if (cls.attendees.length >= cls.capacity) {
        showToast('Esta clase no tiene más cupos disponibles.');
        return;
      }
      setClasses(prev => prev.map(c => {
        if (c.id === classId) {
          return { ...c, attendees: [...c.attendees, currentStudent.id] };
        }
        return c;
      }));
      showToast('¡Lugar reservado en ' + cls.title + '!');
    }
  };

  // Marcar asistencia (Presente)
  const toggleCheckIn = (classId, studentId) => {
    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        const isChecked = c.checkedIn.includes(studentId);
        const newCheckedIn = isChecked 
          ? c.checkedIn.filter(id => id !== studentId)
          : [...c.checkedIn, studentId];
        return { ...c, checkedIn: newCheckedIn };
      }
      return c;
    }));
  };

  // Crear nueva clase
  const handleAddClass = (e) => {
    e.preventDefault();
    const newClass = {
      ...newClassForm,
      id: 'c_' + Date.now(),
      attendees: [],
      checkedIn: []
    };
    setClasses(prev => [...prev, newClass]);
    setIsNewClassModalOpen(false);
    setNewClassForm({
      title: '',
      category: 'Yoga',
      instructor: '',
      date: '2026-11-08',
      time: '09:00',
      duration: '60 min',
      capacity: 12,
      level: 'Todos los niveles',
      room: 'Sala Mandala (Yoga)'
    });
    showToast('Nueva clase programada.');
  };

  // Registrar nuevo alumno
  const handleAddStudent = (e) => {
    e.preventDefault();
    const planInfo = PLAN_OPTIONS.find(p => p.name === newStudentForm.plan);
    const newStudent = {
      ...newStudentForm,
      id: 's_' + Date.now(),
      creditsLeft: planInfo ? planInfo.defaultCredits : 8,
      status: 'active'
    };
    setStudents(prev => [...prev, newStudent]);
    setIsNewStudentModalOpen(false);
    setNewStudentForm({
      name: '',
      phone: '',
      plan: 'Abono Mensual 2x semana',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    showToast('Alumno registrado exitosamente.');
  };

  // Renovar abono por 30 días
  const handleRenewPayment = (studentId) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const planInfo = PLAN_OPTIONS.find(p => p.name === s.plan);
        const nextMonth = new Date();
        nextMonth.setDate(nextMonth.getDate() + 30);
        return {
          ...s,
          status: 'active',
          dueDate: nextMonth.toISOString().split('T')[0],
          creditsLeft: planInfo ? planInfo.defaultCredits : 8
        };
      }
      return s;
    }));
    showToast('Abono renovado por 30 días.');
  };

  // Enviar recordatorio por WhatsApp
  const sendWhatsAppReminder = (student) => {
    const text = `Hola ${student.name}! 🙏 Te contactamos desde Espacio SAT-NAM para recordarte que tu plan (${student.plan}) vence el día ${student.dueDate}. ¿Quisieras renovarlo para asegurar tus turnos de Yoga / Spinning del mes? ¡Muchas gracias! ✨`;
    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/${student.phone}?text=${encoded}`;
    window.open(url, '_blank');
  };

  // Eliminar clase
  const handleDeleteClass = (classId) => {
    setClasses(prev => prev.filter(c => c.id !== classId));
    showToast('Clase eliminada de la agenda.');
  };

  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#2C3E35] font-sans pb-24">
      {/* Notificación flotante (Toast) */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#2C3E35] text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Encabezado Principal */}
      <header className="bg-[#EAE4D9] border-b border-[#DCD5C7] sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#6B7F6C] text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-semibold text-[#2C3E35] tracking-tight">Espacio SAT-NAM</h1>
              <p className="text-xs text-[#556956] font-medium">Yoga & Spinning Studio</p>
            </div>
          </div>

          {/* Selector de Modo: Alumno / Estudio */}
          <div className="flex bg-[#DFD8CB] p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => { setUserRole('student'); setActiveTab('bookings'); }}
              className={`px-3 py-1.5 rounded-lg transition-all ${userRole === 'student' ? 'bg-[#6B7F6C] text-white shadow-sm' : 'text-[#555]'}`}
            >
              Vista Alumno
            </button>
            <button
              onClick={() => { setUserRole('admin'); setActiveTab('admin'); }}
              className={`px-3 py-1.5 rounded-lg transition-all ${userRole === 'admin' ? 'bg-[#6B7F6C] text-white shadow-sm' : 'text-[#555]'}`}
            >
              Modo Estudio
            </button>
          </div>
        </div>
      </header>

      {/* Contenedor Principal */}
      <main className="max-w-4xl mx-auto px-4 pt-4">

        {/* BARRA PERFIL DE ALUMNO */}
        {userRole === 'student' && (
          <div className="mb-6 bg-white rounded-2xl p-4 shadow-sm border border-[#E5E0D5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-[#EBF0EC] text-[#6B7F6C] flex items-center justify-center font-bold text-lg border border-[#C5D3C8]">
                {currentStudent?.name.charAt(0) || 'A'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-[#888] uppercase tracking-wider font-semibold">Alumno Activo:</span>
                  <select 
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="bg-[#F4F1EA] text-sm font-semibold text-[#2C3E35] rounded-lg px-2 py-1 border border-[#D5CFBE] focus:outline-none"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs bg-[#F0EBE1] text-[#444] font-medium px-2 py-0.5 rounded-md border border-[#DDD6C7]">
                    {currentStudent?.plan}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-md flex items-center font-medium ${
                    currentStudent?.status === 'active' 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {currentStudent?.status === 'active' ? 'Al día' : 'Pago Pendiente'}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-[#F0EBE1]">
              <p className="text-xs text-[#777]">Vencimiento de Abono:</p>
              <p className={`text-sm font-semibold ${new Date(currentStudent?.dueDate) < new Date() ? 'text-rose-600' : 'text-[#2C3E35]'}`}>
                {currentStudent?.dueDate}
              </p>
            </div>
          </div>
        )}

        {/* PESTAÑA 1: RESERVAS DE TURNOS */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-sm border border-[#E5E0D5]">
              <div>
                <h2 className="text-lg font-serif font-semibold text-[#2C3E35]">Reserva de Turnos</h2>
                <p className="text-xs text-[#666]">Elige tus clases de Yoga y Spinning en Espacio SAT-NAM</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex bg-[#F4F1EA] p-1 rounded-xl border border-[#DDD6C7] text-xs">
                  {['Todas', 'Yoga', 'Spinning'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-lg font-medium transition ${
                        selectedCategory === cat 
                          ? 'bg-[#6B7F6C] text-white shadow-sm' 
                          : 'text-[#666] hover:text-[#333]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-1.5 bg-[#F5F2EC] border border-[#DDD6C7] rounded-xl px-2.5 py-1 text-xs">
                  <Calendar className="w-4 h-4 text-[#6B7F6C]" />
                  <input 
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="bg-transparent font-medium text-[#333] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {classes
                .filter(c => (!filterDate || c.date === filterDate) && (selectedCategory === 'Todas' || c.category === selectedCategory))
                .length === 0 ? (
                <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-[#DCD5C7]">
                  <Calendar className="w-10 h-10 text-[#BBB] mx-auto mb-2" />
                  <p className="text-[#666] font-medium">No hay clases programadas para esta disciplina o fecha.</p>
                  <p className="text-xs text-[#999] mt-1">Prueba seleccionando otro día o categoría arriba.</p>
                </div>
              ) : (
                classes
                  .filter(c => (!filterDate || c.date === filterDate) && (selectedCategory === 'Todas' || c.category === selectedCategory))
                  .map(cls => {
                    const isBooked = cls.attendees.includes(currentStudent?.id);
                    const spotsLeft = cls.capacity - cls.attendees.length;

                    return (
                      <div 
                        key={cls.id}
                        className={`bg-white rounded-2xl p-5 border transition-all duration-200 shadow-sm relative overflow-hidden flex flex-col justify-between ${
                          isBooked ? 'border-[#6B7F6C] ring-2 ring-[#6B7F6C]/20' : 'border-[#E5E0D5]'
                        }`}
                      >
                        {isBooked && (
                          <div className="absolute top-0 right-0 bg-[#6B7F6C] text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-bl-xl flex items-center gap-1">
                            <Check className="w-3 h-3" /> Reservado
                          </div>
                        )}

                        <div>
                          <div className="flex items-center space-x-2 pr-16">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md text-white ${
                              cls.category === 'Spinning' ? 'bg-[#C86D51]' : 'bg-[#6B7F6C]'
                            }`}>
                              {cls.category}
                            </span>
                            <span className="text-xs text-[#888]">{cls.room}</span>
                          </div>

                          <h3 className="font-serif font-semibold text-lg text-[#2C3E35] mt-2">{cls.title}</h3>

                          <div className="flex items-center space-x-4 mt-3 text-xs text-[#555]">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5 text-[#6B7F6C]" />
                              <span>{cls.time} ({cls.duration})</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <User className="w-3.5 h-3.5 text-[#6B7F6C]" />
                              <span>{cls.instructor}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-[#F0EBE1] flex items-center justify-between">
                          <div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                              spotsLeft <= 2 
                                ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {spotsLeft > 0 ? `${spotsLeft} cupos libres` : 'Sin cupos disponibles'}
                            </span>
                          </div>

                          <button
                            onClick={() => handleRegisterBooking(cls.id)}
                            disabled={spotsLeft === 0 && !isBooked}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center space-x-1 shadow-sm ${
                              isBooked 
                                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100' 
                                : spotsLeft === 0 
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'bg-[#6B7F6C] text-white hover:bg-[#586A59]'
                            }`}
                          >
                            {isBooked ? 'Cancelar Reserva' : 'Reservar Lugar'}
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA 2: AGENDA & ASISTENCIA (ESTUDIO) */}
        {activeTab === 'admin' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-sm border border-[#E5E0D5]">
              <div>
                <h2 className="text-lg font-serif font-semibold text-[#2C3E35]">Agenda & Asistencia SAT-NAM</h2>
                <p className="text-xs text-[#666]">Administra las sesiones de Yoga y Spinning</p>
              </div>

              <button
                onClick={() => setIsNewClassModalOpen(true)}
                className="bg-[#6B7F6C] hover:bg-[#586A59] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Programar Nueva Clase</span>
              </button>
            </div>

            <div className="space-y-4">
              {classes.map(cls => (
                <div key={cls.id} className="bg-white rounded-2xl p-5 border border-[#E5E0D5] shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#F0EBE1]">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white ${
                          cls.category === 'Spinning' ? 'bg-[#C86D51]' : 'bg-[#6B7F6C]'
                        }`}>
                          {cls.category}
                        </span>
                        <span className="text-xs font-bold text-[#6B7F6C] bg-[#EBF0EC] px-2 py-0.5 rounded border border-[#D0DDD2]">
                          {cls.date} - {cls.time}
                        </span>
                        <span className="text-xs text-[#888]">{cls.room}</span>
                      </div>
                      <h3 className="font-serif font-semibold text-lg text-[#2C3E35] mt-1">{cls.title}</h3>
                      <p className="text-xs text-[#666]">Profesor/a: <span className="font-medium text-[#333]">{cls.instructor}</span></p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <span className="text-xs font-semibold text-[#2C3E35] block">
                          {cls.attendees.length} / {cls.capacity} Inscriptos
                        </span>
                        <span className="text-[11px] text-[#777]">
                          {cls.checkedIn.length} Presentes
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteClass(cls.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        title="Eliminar clase"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Lista de Alumnos Anotados */}
                  <div className="mt-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#888] mb-3">Alumnos anotados:</h4>
                    {cls.attendees.length === 0 ? (
                      <p className="text-xs text-[#AAA] italic">No hay reservas registradas aún.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {cls.attendees.map(studentId => {
                          const student = students.find(s => s.id === studentId);
                          const isCheckedIn = cls.checkedIn.includes(studentId);

                          return (
                            <div 
                              key={studentId}
                              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                                isCheckedIn 
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                                  : 'bg-[#F9F8F5] border-[#E8E3D8] text-[#444]'
                              }`}
                            >
                              <div>
                                <p className="font-semibold">{student?.name || 'Alumno'}</p>
                                <p className="text-[10px] text-[#777]">{student?.plan}</p>
                              </div>

                              <button
                                onClick={() => toggleCheckIn(cls.id, studentId)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition flex items-center space-x-1 ${
                                  isCheckedIn
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white border border-[#DDD] text-[#555] hover:bg-gray-50'
                                }`}
                              >
                                {isCheckedIn ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Presente</span>
                                  </>
                                ) : (
                                  <span>Dar Presente</span>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA 3: ALUMNOS Y PLANES */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-sm border border-[#E5E0D5]">
              <div>
                <h2 className="text-lg font-serif font-semibold text-[#2C3E35]">Alumnos de Espacio SAT-NAM</h2>
                <p className="text-xs text-[#666]">Planes activos, inscripciones y vencimientos</p>
              </div>

              <button
                onClick={() => setIsNewStudentModalOpen(true)}
                className="bg-[#6B7F6C] hover:bg-[#586A59] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Alumno</span>
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#999]" />
              <input 
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5E0D5] rounded-xl text-sm text-[#333] focus:outline-none shadow-sm"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {students
                .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(student => {
                  const isExpired = new Date(student.dueDate) < new Date();
                  return (
                    <div key={student.id} className="bg-white rounded-2xl p-5 border border-[#E5E0D5] shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="font-serif font-semibold text-base text-[#2C3E35]">{student.name}</h3>
                          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                            isExpired || student.status === 'pending'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {isExpired ? 'Abono Vencido' : 'Plan Activo'}
                          </span>
                        </div>

                        <div className="mt-3 space-y-1.5 text-xs text-[#555]">
                          <div className="flex items-center justify-between">
                            <span className="text-[#888]">WhatsApp:</span>
                            <span className="font-mono font-medium">{student.phone}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#888]">Abono Vigente:</span>
                            <span className="font-medium bg-[#F5F2EC] px-2 py-0.5 rounded border border-[#E5E0D5]">
                              {student.plan}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#888]">Vencimiento:</span>
                            <span className={`font-semibold ${isExpired ? 'text-rose-600' : 'text-[#2C3E35]'}`}>
                              {student.dueDate}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#F0EBE1] flex items-center justify-between">
                        <button
                          onClick={() => sendWhatsAppReminder(student)}
                          className="text-xs text-[#25D366] hover:bg-emerald-50 font-semibold px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center space-x-1 transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>

                        <button
                          onClick={() => handleRenewPayment(student.id)}
                          className="text-xs bg-[#6B7F6C] hover:bg-[#586A59] text-white font-semibold px-3 py-1.5 rounded-xl shadow-sm transition flex items-center space-x-1"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Renovar Abono</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* PESTAÑA 4: PAGOS Y RECORDATORIOS */}
        {activeTab === 'payments' && (
          <div className="space-y-5">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#E5E0D5]">
              <h2 className="text-lg font-serif font-semibold text-[#2C3E35]">Control de Abonos y Recordatorios</h2>
              <p className="text-xs text-[#666]">Genera recordatorios de cuota vía WhatsApp</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E0D5] shadow-sm overflow-hidden">
              <div className="px-5 py-4 bg-[#FAF7F2] border-b border-[#E5E0D5] flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6B7F6C] flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Pendientes de Pago</span>
                </span>
                <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full">
                  {students.filter(s => new Date(s.dueDate) < new Date() || s.status === 'pending').length} alumnos
                </span>
              </div>

              <div className="divide-y divide-[#F0EBE1]">
                {students
                  .filter(s => new Date(s.dueDate) < new Date() || s.status === 'pending')
                  .map(student => (
                    <div key={student.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-serif font-semibold text-[#2C3E35]">{student.name}</h4>
                          <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">
                            Vencido el {student.dueDate}
                          </span>
                        </div>
                        <p className="text-xs text-[#666] mt-0.5">
                          Plan registrado: <span className="font-semibold text-[#333]">{student.plan}</span>
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => sendWhatsAppReminder(student)}
                          className="bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm flex items-center space-x-1.5 transition"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Enviar Recordatorio</span>
                        </button>

                        <button
                          onClick={() => handleRenewPayment(student.id)}
                          className="bg-[#6B7F6C] hover:bg-[#586A59] text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm flex items-center space-x-1.5 transition"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Marcar Pagado</span>
                        </button>
                      </div>
                    </div>
                  ))}

                {students.filter(s => new Date(s.dueDate) < new Date() || s.status === 'pending').length === 0 && (
                  <div className="p-8 text-center text-[#777]">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">¡Todo en orden! Todos los abonos de Espacio SAT-NAM están al día.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5E0D5] shadow-sm">
              <h3 className="font-serif font-semibold text-base text-[#2C3E35] mb-3">Tarifas y Abonos (Espacio SAT-NAM)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {PLAN_OPTIONS.map((p, idx) => (
                  <div key={idx} className="bg-[#F8F6F0] p-3 rounded-xl border border-[#E8E3D7]">
                    <p className="text-xs font-semibold text-[#666]">{p.name}</p>
                    <p className="text-base font-serif font-bold text-[#6B7F6C] mt-1">{p.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Barra de Navegación Inferior */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E0D5] py-2 px-4 z-40 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === 'bookings' ? 'text-[#6B7F6C]' : 'text-[#999]'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] font-medium">Reservas</span>
          </button>

          {userRole === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex flex-col items-center space-y-1 ${
                activeTab === 'admin' ? 'text-[#6B7F6C]' : 'text-[#999]'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span className="text-[10px] font-medium">Agenda</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('students')}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === 'students' ? 'text-[#6B7F6C]' : 'text-[#999]'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-medium">Alumnos</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === 'payments' ? 'text-[#6B7F6C]' : 'text-[#999]'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-[10px] font-medium">Pagos</span>
          </button>
        </div>
      </nav>

      {/* MODAL: Nueva Clase */}
      {isNewClassModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl border border-[#E5E0D5]">
            <h3 className="font-serif font-semibold text-lg text-[#2C3E35] mb-4">Programar Nueva Clase</h3>

            <form onSubmit={handleAddClass} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#666] mb-1 font-medium">Disciplina</label>
                <select 
                  value={newClassForm.category}
                  onChange={(e) => setNewClassForm({...newClassForm, category: e.target.value})}
                  className="w-full p-2.5 bg-[#F8F6F0] border border-[#DDD6C7] rounded-xl text-sm text-[#333]"
                >
                  <option value="Yoga">Yoga</option>
                  <option value="Spinning">Spinning</option>
                </select>
              </div>

              <div>
                <label className="block text-[#666] mb-1 font-medium">Nombre de la Sesión</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej: Yoga Vinyasa o Spinning Power"
                  value={newClassForm.title}
                  onChange={(e) => setNewClassForm({...newClassForm, title: e.target.value})}
                  className="w-full p-2.5 bg-[#F8F6F0] border border-[#DDD6C7] rounded-xl text-sm text-[#333]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#666] mb-1 font-medium">Instructor/a</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Elena / Lucas"
                    value={newClassForm.instructor}
                    onChange={(e) => setNewClassForm({...newClassForm, instructor: e.target.value})}
                    className="w-full p-2.5 bg-[#F8F6F0] border border-[#DDD6C7] rounded-xl text-sm text-[#333]"
                  />
                </div>

                <div>
                  <label className="block text-[#666] mb-1 font-medium">Cupo Máximo</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={newClassForm.capacity}
                    onChange={(e) => setNewClassForm({...newClassForm, capacity: parseInt(e.target.value) || 1})}
                    className="w-full p-2.5 bg-[#F8F6F0] border border-[#DDD6C7] rounded-xl text-sm text-[#333]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#666] mb-1 font-medium">Fecha</label>
                  <input 
                    type="date" 
                    required
                    value={newClassForm.date}
                    onChange={(e) => setNewClassForm({...newClassForm, date: e.target.value})}
                    className="w-full p-2.5 bg-[#F8F6F0] border border-[#DDD6C7] rounded-xl text-sm text-[#333]"
                  />
                </div>

                <div>
                  <label className="block text-[#666] mb-1 font-medium">Horario</label>
                  <input 
                    type="time" 
                    required
                    value={newClassForm.time}
                    onChange={(e) => setNewClassForm({...newClassForm, time: e.target.value})}
                    className="w-full p-2.5 bg-[#F8F6F0] border border-[#DDD6C7] rounded-xl text-sm text-[#333]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#666] mb-1 font-medium">Espacio / Sala</label>
                <select 
                  value={newClassForm.room}
                  onChange={(e) => setNewClassForm({...newClassForm, room: e.target.value})}
                  className="w-full p-2.5 bg-[#F8F6F0] border border-[#DDD6C7] rounded-xl text-sm text-[#333]"
                >
                  <option value="Sala Mandala (Yoga)">Sala Mandala (Yoga)</option>
                  <option value="Sala Spin Cycle">Sala Spin Cycle</option>
                  <option value="Espacio Exterior">Espacio Exterior</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-[#F0EBE1]">
                <button
                  type="button"
                  onClick={() => setIsNewClassModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DDD] text-[#555] font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#6B7F6C] text-white font-semibold shadow-sm hover:bg-[#586A59]"
                >
                  Guardar Clase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Nuevo Alumno */}
      {isNewStudentModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl border border-[#E5E0D5]">
            <h3 className="font-serif font-semibold text-lg text-[#2C3E35] mb-4">Registrar Alumno en SAT-NAM</h3>

            <form onSubmit={handleAddStudent} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#666] mb-1 font-medium">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej: Sofía Martínez"
                  value={newStudentForm.name}
                  onChange={(e) => setNewStudentForm({...newStudentForm, name: e.target.value})}
                  className="w-full p-2.5 bg-[#F8F6F0] border border-[#DDD6C7] rounded-xl text-sm text-[#333]"
                />
              </div>

              <div>
                <label className="block text-[#666] mb-1 font-medium">WhatsApp</label>
                <input 
                  type="text" 
                  required
                  placeholder="5491155556666"
                  value={newStudentForm.phone}
                  onChange={(e) => setNewStudentForm({...newStudentForm, phone: e.target.value})}
                  className="w-full p-2.5 bg-[#F8F6F0] border border-[#DDD6C7] rounded-xl text-sm text-[#333]"
                />
              </div>

              <div>
                <label className="block text-[#666] mb-1 font-medium">Abono / Plan Elegido</label>
                <select 
                  value={newStudentForm.plan}
                  onChange={(e) => setNewStudentForm({...newStudentForm, plan: e.target.value})}
                  className="w-full p-2.5 bg-[#F8F6F0] border border-[#DDD6C7] rounded-xl text-sm text-[#333]"
                >
                  {PLAN_OPTIONS.map(p => (
                    <option key={p.name} value={p.name}>{p.name} ({p.price})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#666] mb-1 font-medium">Fecha de Vencimiento</label>
                <input 
                  type="date" 
                  required
                  value={newStudentForm.dueDate}
                  onChange={(e) => setNewStudentForm({...newStudentForm, dueDate: e.target.value})}
                  className="w-full p-2.5 bg-[#F8F6F0] border border-[#DDD6C7] rounded-xl text-sm text-[#333]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-[#F0EBE1]">
                <button
                  type="button"
                  onClick={() => setIsNewStudentModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DDD] text-[#555] font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#6B7F6C] text-white font-semibold shadow-sm hover:bg-[#586A59]"
                >
                  Guardar Alumno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}