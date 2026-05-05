import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Admin.css';
import {
  IconDashboard, IconUsers, IconCar, IconStar, IconScooter, IconCard, IconClock,
  IconBell, IconPower, IconSearch, IconChevronLeft, IconChevronRight,
  IconTrash, IconArrowRight, IconCheck, IconX, IconInfo, IconWarn, IconChart,
} from '../components/admin/AdminIcons';

// ─── Types ────────────────────────────────────────────────────────────────────
interface User   { id: number; name: string; username: string; email: string; role: string; created_at: string; }
interface Travel { id: number; origin: string; destination: string; departure_time: string; driver?: { name: string; username: string }; status: string; price?: number; available_seats?: number; }
interface Review { id: number; rating: number; comment: string; author?: { name: string }; recipient?: { name: string }; created_at: string; }
interface Schedule { trip_id: string; stop_id: string; stop_name: string; route_name: string; arrival_time: string; departure_time: string; }
interface Stats  { users: number; travels: number; reviews: number; active_travels: number; cancelled_travels: number; completed_travels: number; users_by_role: Record<string,number>; travels_by_month?: Record<number, number>; }
interface Toast  { id: number; msg: string; type: 'success' | 'error' | 'info'; }
interface ModalState { open: boolean; title: string; desc: string; target: string; confirmLabel: string; type: 'danger' | 'warning'; onConfirm: () => void; }

type SectionKey = 'dashboard' | 'users' | 'travels' | 'reviews' | 'vehicles' | 'payments' | 'schedules';

const API = 'http://localhost:8000/api';
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: `Bearer ${localStorage.getItem('auth_token') ?? ''}`,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initials(name?: string) {
  if (!name) return '??';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function Badge({ label, color }: { label: string; color: string }) {
  return <span className={`admin-badge ${color}`}>{label}</span>;
}

function roleBadge(role: string) {
  const map: Record<string, [string, string]> = {
    admin: ['Admin', 'red'], staff: ['Personal', 'blue'],
    student: ['Estudiante', 'green'], external: ['Externo', 'grey'],
  };
  const [label, color] = map[role] ?? [role, 'grey'];
  return <Badge label={label} color={color} />;
}

// ─── Nav config ───────────────────────────────────────────────────────────────
const NAV_ITEMS: { key: SectionKey; Icon: React.FC<{ size?: number }>; label: string; group: string }[] = [
  { key: 'dashboard', Icon: IconDashboard, label: 'Dashboard',    group: 'General' },
  { key: 'users',     Icon: IconUsers,     label: 'Usuarios',     group: 'Gestión' },
  { key: 'travels',   Icon: IconCar,       label: 'Trayectos',    group: 'Gestión' },
  { key: 'reviews',   Icon: IconStar,      label: 'Valoraciones', group: 'Gestión' },
  { key: 'vehicles',  Icon: IconScooter,   label: 'Vehículos',    group: 'Servicios' },
  { key: 'payments',  Icon: IconCard,      label: 'Pagos',        group: 'Servicios' },
  { key: 'schedules', Icon: IconClock,     label: 'Horarios',     group: 'Servicios' },
];
const GROUPS = [...new Set(NAV_ITEMS.map(i => i.group))];
const SECTION_TITLES: Record<SectionKey, string> = {
  dashboard: 'Dashboard', users: 'Gestión de Usuarios', travels: 'Trayectos',
  reviews: 'Valoraciones', vehicles: 'Vehículos del Campus',
  payments: 'Pagos y Reembolsos', schedules: 'Horarios de Transporte',
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const navigate = useNavigate();

  // Auth guard
  useEffect(() => {
    if (!localStorage.getItem('auth_token')) navigate('/login');
  }, [navigate]);

  const [collapsed, setCollapsed] = useState(false);
  const [section, setSection] = useState<SectionKey>('dashboard');
  const [users, setUsers]     = useState<User[]>([]);
  const [travels, setTravels] = useState<Travel[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [stats, setStats]     = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts]   = useState<Toast[]>([]);
  const [userFilter, setUserFilter] = useState('all');
  const [travelFilter, setTravelFilter] = useState('all');
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', username: '', email: '', password: '', role: 'student' });
  const [adminInfo, setAdminInfo]   = useState<User | null>(null);
  const [modal, setModal] = useState<ModalState>({
    open: false, title: '', desc: '', target: '',
    confirmLabel: 'Confirmar', type: 'danger', onConfirm: () => {},
  });

  const toast = useCallback((msg: string, type: Toast['type'] = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const openModal = (cfg: Omit<ModalState, 'open'>) => setModal({ ...cfg, open: true });
  const closeModal = () => setModal(m => ({ ...m, open: false }));

  // Fetch admin profile
  useEffect(() => {
    fetch(`${API}/profile/me`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.name) setAdminInfo(d); })
      .catch(() => {});
  }, []);

  // Fetch dashboard stats
  useEffect(() => {
    fetch(`${API}/admin/stats`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStats(d); })
      .catch(() => {});
  }, []);

  // Fetch section data
  useEffect(() => {
    if (section === 'users') {
      setLoading(true);
      fetch(`${API}/admin/users`, { headers: authHeaders() })
        .then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : d.data ?? []))
        .catch(() => toast('Error cargando usuarios', 'error'))
        .finally(() => setLoading(false));
    }
    if (section === 'travels') {
      setLoading(true);
      fetch(`${API}/admin/travels`, { headers: authHeaders() })
        .then(r => r.json()).then(d => setTravels(Array.isArray(d) ? d : d.data ?? []))
        .catch(() => toast('Error cargando trayectos', 'error'))
        .finally(() => setLoading(false));
    }
    if (section === 'reviews') {
      setLoading(true);
      fetch(`${API}/admin/reviews`, { headers: authHeaders() })
        .then(r => r.json()).then(d => setReviews(Array.isArray(d) ? d : d.data ?? []))
        .catch(() => toast('Error cargando valoraciones', 'error'))
        .finally(() => setLoading(false));
    }
    if (section === 'schedules') {
      setLoading(true);
      fetch(`${API}/admin/schedules`, { headers: authHeaders() })
        .then(r => r.json()).then(d => setSchedules(Array.isArray(d) ? d : d.data ?? []))
        .catch(() => toast('Error cargando horarios', 'error'))
        .finally(() => setLoading(false));
    }
  }, [section]);

  // ─── Actions ─────────────────────────────────────────────────────────────────
  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch(`${API}/admin/users`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(newUser) });
    if (r.ok) {
        const data = await r.json();
        setUsers(p => [data.user, ...p]);
        toast('Usuario creado');
        setShowNewUserModal(false);
        setNewUser({ name: '', username: '', email: '', password: '', role: 'student' });
        setStats(s => s ? { ...s, users: s.users + 1 } : s);
    } else {
        const d = await r.json();
        toast(d.message ?? 'Error al crear usuario', 'error');
    }
  };

  const deleteUser = (u: User) => openModal({
    title: 'Eliminar usuario',
    desc: '¿Seguro que deseas eliminar a este usuario? Esta acción es irreversible.',
    target: `${u.name} (@${u.username})`, confirmLabel: 'Eliminar', type: 'danger',
    onConfirm: async () => {
      const r = await fetch(`${API}/admin/users/${u.id}`, { method: 'DELETE', headers: authHeaders() });
      if (r.ok) { setUsers(p => p.filter(x => x.id !== u.id)); toast(`Usuario @${u.username} eliminado`); setStats(s => s ? { ...s, users: s.users - 1 } : s); }
      else { const d = await r.json(); toast(d.message ?? 'Error al eliminar el usuario', 'error'); }
      closeModal();
    },
  });

  const changeRole = async (u: User, newRole: string) => {
    const r = await fetch(`${API}/admin/users/${u.id}/role`, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify({ role: newRole }),
    });
    if (r.ok) { setUsers(p => p.map(x => x.id === u.id ? { ...x, role: newRole } : x)); toast(`Rol de @${u.username} cambiado a ${newRole}`); }
    else { const d = await r.json(); toast(d.message ?? 'Error al cambiar el rol', 'error'); }
  };

  const deleteTravel = (t: Travel) => openModal({
    title: 'Eliminar trayecto', desc: '¿Eliminar permanentemente este trayecto?',
    target: `${t.origin} → ${t.destination}`, confirmLabel: 'Eliminar', type: 'danger',
    onConfirm: async () => {
      const r = await fetch(`${API}/admin/travels/${t.id}`, { method: 'DELETE', headers: authHeaders() });
      if (r.ok) { setTravels(p => p.filter(x => x.id !== t.id)); toast('Trayecto eliminado'); }
      else toast('Error al eliminar el trayecto', 'error');
      closeModal();
    },
  });

  const cancelTravel = (t: Travel) => openModal({
    title: 'Cancelar trayecto', desc: '¿Cancelar este trayecto? El conductor será notificado.',
    target: `${t.origin} → ${t.destination}`, confirmLabel: 'Cancelar trayecto', type: 'warning',
    onConfirm: async () => {
      const r = await fetch(`${API}/admin/travels/${t.id}/cancel`, { method: 'PUT', headers: authHeaders() });
      if (r.ok) { setTravels(p => p.map(x => x.id === t.id ? { ...x, status: 'cancelled' } : x)); toast('Trayecto cancelado'); }
      else toast('Error al cancelar el trayecto', 'error');
      closeModal();
    },
  });

  const deleteReview = (rv: Review) => openModal({
    title: 'Eliminar valoración', desc: '¿Eliminar esta valoración?',
    target: `"${rv.comment?.slice(0, 50) ?? ''}"`, confirmLabel: 'Eliminar', type: 'danger',
    onConfirm: async () => {
      const r = await fetch(`${API}/admin/reviews/${rv.id}`, { method: 'DELETE', headers: authHeaders() });
      if (r.ok) { setReviews(p => p.filter(x => x.id !== rv.id)); toast('Valoración eliminada'); }
      else toast('Error al eliminar la valoración', 'error');
      closeModal();
    },
  });

  const handleLogout = async () => {
    await fetch(`${API}/logout`, { method: 'POST', headers: authHeaders() }).catch(() => {});
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  const filteredUsers = userFilter === 'all' ? users : users.filter(u => u.role === userFilter);
  const filteredTravels = travelFilter === 'all' ? travels : travels.filter(t => t.status === travelFilter);

  // Real Chart Data processing
  const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const chartHeights = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return stats?.travels_by_month?.[month] || 0;
  });
  const maxCount = Math.max(...chartHeights, 1);
  // Max height will be 85% so there is room for the text above
  const chartBars = chartHeights.map(count => (count / maxCount) * 85);

  const updateScheduleTime = async (trip_id: string, stop_id: string, field: 'arrival_time'|'departure_time', val: string) => {
    const sch = schedules.find(s => s.trip_id === trip_id && s.stop_id === stop_id);
    if (!sch) return;
    const body = { trip_id, stop_id, arrival_time: sch.arrival_time, departure_time: sch.departure_time, [field]: val };
    
    // Optimistic update
    setSchedules(prev => prev.map(s => (s.trip_id === trip_id && s.stop_id === stop_id) ? { ...s, [field]: val } : s));

    const r = await fetch(`${API}/admin/schedules`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) });
    if (!r.ok) {
      toast('Error al actualizar horario', 'error');
      // Revert in real app, but skipping for simplicity
    } else {
      toast('Horario actualizado');
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="admin-layout">

      {/* ── SIDEBAR ──────────────────────────────────── */}
      <aside className={`admin-sidebar${collapsed ? ' collapsed' : ''}`}>
        <div className="admin-sidebar-logo">
          <div className="admin-sidebar-logo-icon">UM</div>
          <div className="admin-sidebar-logo-text">
            <span>UniMove</span>
            <span>Panel Admin</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {GROUPS.map(group => (
            <div key={group}>
              <div className="admin-sidebar-section-label">{group}</div>
              {NAV_ITEMS.filter(i => i.group === group).map(({ key, Icon, label }) => (
                <button
                  key={key}
                  className={`admin-nav-item${section === key ? ' active' : ''}`}
                  onClick={() => setSection(key)}
                  title={collapsed ? label : ''}
                >
                  <span className="admin-nav-icon"><Icon size={20} /></span>
                  <span className="admin-nav-label">{label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-avatar">
            {adminInfo ? initials(adminInfo.name) : 'AD'}
          </div>
          <div className="admin-sidebar-user-info">
            <div className="admin-sidebar-user-name">{adminInfo?.name ?? 'Administrador'}</div>
            <div className="admin-sidebar-user-role">Admin · UniMove</div>
          </div>
          <button
            className="admin-sidebar-collapse-btn"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expandir' : 'Colapsar'}
          >
            {collapsed ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
          </button>
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────── */}
      <div className="admin-main">

        {/* Topbar */}
        <div className="admin-topbar">
          <div className="admin-topbar-title">{SECTION_TITLES[section]}</div>
          <div className="admin-topbar-search">
            <span className="admin-topbar-search-icon"><IconSearch size={15} /></span>
            <input placeholder="Buscar…" />
          </div>
          <div className="admin-topbar-actions">
            <button className="admin-topbar-btn" title="Notificaciones"><IconBell size={18} /></button>
            <button className="admin-topbar-btn admin-logout-btn" onClick={handleLogout}>
              <IconPower size={15} /> Salir
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="admin-content">

          {/* ── DASHBOARD ──────────────────────────────── */}
          {section === 'dashboard' && (
            <>
              <div className="admin-stats-grid">
                {[
                  { Icon: IconUsers,   val: stats ? String(stats.users)          : '…', label: 'Usuarios totales',    col: 'green' },
                  { Icon: IconCar,     val: stats ? String(stats.travels)        : '…', label: 'Trayectos totales',   col: 'teal'  },
                  { Icon: IconStar,    val: stats ? String(stats.reviews)        : '…', label: 'Valoraciones',        col: 'dark'  },
                  { Icon: IconScooter, val: stats ? String(stats.active_travels) : '…', label: 'Trayectos activos',   col: 'sand'  },
                ].map(({ Icon, val, label, col }, i) => (
                  <div key={i} className="admin-stat-card">
                    <div className={`admin-stat-icon ${col}`}><Icon size={32} /></div>
                    <div className="admin-stat-body">
                      <div className="admin-stat-value">{val}</div>
                      <div className="admin-stat-label">{label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="admin-grid-2">
                <div>
                  <div className="admin-section-header">
                    <span className="admin-section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <IconChart size={15} />
                      Actividad mensual
                    </span>
                  </div>
                  <div className="admin-table-card" style={{ padding: '22px 18px 16px', display: 'flex', flexDirection: 'column' }}>
                    <div className="admin-chart-placeholder" style={{ height: '180px', padding: 0, background: 'none' }}>
                      {chartBars.map((h, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', textAlign: 'center', color: '#31A47B', fontWeight: 'bold', marginBottom: '6px', opacity: chartHeights[i] > 0 ? 1 : 0, transition: 'opacity 0.2s' }}>
                            {chartHeights[i]}
                          </span>
                          <div className="admin-chart-bar" style={{ height: `${h}%`, width: '100%', flex: 'none', borderRadius: '4px 4px 0 0', minHeight: chartHeights[i] > 0 ? '4px' : '0' }} title={`${MONTHS[i]}: ${chartHeights[i]} viajes`} />
                        </div>
                      ))}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', marginTop: '4px', borderTop: '1px solid #e8f5ef' }}>
                      {MONTHS.map((m, i) => (
                        <div key={m} style={{ flex: 1, textAlign: 'center', fontSize: '0.7rem', color: '#7ba696', fontWeight: 600 }}>{m}</div>
                      ))}
                    </div>
                    
                    <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#a7d7c5', margin: '14px 0 0' }}>
                      Actividad mensual de trayectos registrados en el año actual
                    </p>
                  </div>
                </div>

                <div>
                  <div className="admin-section-header">
                    <span className="admin-section-title">Accesos rápidos</span>
                  </div>
                  <div className="admin-table-card" style={{ padding: '12px' }}>
                    {[
                      { Icon: IconUsers,   label: 'Ver todos los usuarios',  key: 'users'     as SectionKey },
                      { Icon: IconCar,     label: 'Gestionar trayectos',     key: 'travels'   as SectionKey },
                      { Icon: IconStar,    label: 'Moderar valoraciones',    key: 'reviews'   as SectionKey },
                      { Icon: IconClock,   label: 'Gestionar horarios',      key: 'schedules' as SectionKey },
                    ].map(({ Icon, label, key }) => (
                      <button
                        key={key}
                        className="admin-nav-item"
                        style={{ color: '#103B31', borderRadius: 10, marginBottom: 4 }}
                        onClick={() => setSection(key)}
                      >
                        <span className="admin-nav-icon"><Icon size={16} /></span>
                        <span>{label}</span>
                        <span style={{ marginLeft: 'auto', color: '#a7d7c5' }}><IconArrowRight size={14} /></span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── USERS ──────────────────────────────────── */}
          {section === 'users' && (
            <div className="admin-table-card">
              <div className="admin-filter-bar" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="admin-filter-label">Filtrar:</span>
                  {[
                    { val: 'all', lbl: 'Todos' }, { val: 'admin', lbl: 'Admins' },
                    { val: 'staff', lbl: 'Personal' }, { val: 'student', lbl: 'Estudiantes' },
                    { val: 'external', lbl: 'Externos' },
                  ].map(({ val, lbl }) => (
                    <button key={val} className={`admin-filter-chip${userFilter === val ? ' active' : ''}`}
                      onClick={() => setUserFilter(val)}>{lbl}</button>
                  ))}
                </div>
                <button className="admin-action-btn primary" style={{ background: '#31A47B', color: '#fff', padding: '6px 14px' }} onClick={() => setShowNewUserModal(true)}>
                    + Crear Usuario
                </button>
              </div>
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr><th>Usuario</th><th>Email</th><th>Rol</th><th>Registro</th><th>Acciones</th></tr>
                  </thead>
                  <tbody>
                    {loading && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: '#7ba696' }}>Cargando usuarios…</td></tr>}
                    {!loading && filteredUsers.length === 0 && (
                      <tr><td colSpan={5}>
                        <div className="admin-empty-state">
                          <div className="admin-empty-icon"><IconUsers size={32} /></div>
                          <p>No hay usuarios en esta categoría.</p>
                        </div>
                      </td></tr>
                    )}
                    {!loading && filteredUsers.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div className="admin-user-cell">
                            <div className="admin-user-avatar">{initials(u.name)}</div>
                            <div>
                              <div className="admin-user-name">{u.name}</div>
                              <div className="admin-user-email">@{u.username}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: '#7ba696', fontSize: '0.82rem' }}>{u.email}</td>
                        <td>{roleBadge(u.role)}</td>
                        <td style={{ color: '#7ba696', fontSize: '0.8rem' }}>{new Date(u.created_at).toLocaleDateString('es-ES')}</td>
                        <td>
                          <select
                            value={u.role}
                            onChange={e => changeRole(u, e.target.value)}
                            style={{ fontSize: '0.75rem', border: '1.5px solid #d5ece3', borderRadius: 7, padding: '3px 6px', background: '#fff', color: '#103B31', cursor: 'pointer', marginRight: 6 }}
                          >
                            {['admin','staff','student','external'].map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                          <button className="admin-action-btn danger" onClick={() => deleteUser(u)}>
                            <IconTrash size={14} /> Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TRAVELS ────────────────────────────────── */}
          {section === 'travels' && (
            <div className="admin-table-card">
              <div className="admin-filter-bar">
                <span className="admin-filter-label">Estado:</span>
                {['all','active','completed','cancelled'].map(s => (
                  <button key={s} className={`admin-filter-chip${travelFilter === s ? ' active' : ''}`}
                    onClick={() => setTravelFilter(s)}>
                    {s === 'all' ? 'Todos' : s === 'active' ? 'Activos' : s === 'completed' ? 'Completados' : 'Cancelados'}
                  </button>
                ))}
              </div>
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr><th>#</th><th>Origen</th><th>Destino</th><th>Salida</th><th>Conductor</th><th>Estado</th><th>Acciones</th></tr>
                  </thead>
                  <tbody>
                    {loading && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#7ba696' }}>Cargando trayectos…</td></tr>}
                    {!loading && filteredTravels.length === 0 && (
                      <tr><td colSpan={7}>
                        <div className="admin-empty-state">
                          <div className="admin-empty-icon"><IconCar size={32} /></div>
                          <p>No hay trayectos en esta categoría.</p>
                        </div>
                      </td></tr>
                    )}
                    {!loading && filteredTravels.map(t => (
                      <tr key={t.id}>
                        <td style={{ color: '#a7d7c5', fontWeight: 700 }}>#{t.id}</td>
                        <td>{t.origin}</td>
                        <td>{t.destination}</td>
                        <td style={{ color: '#7ba696', fontSize: '0.82rem' }}>
                          {t.departure_time ? new Date(t.departure_time).toLocaleString('es-ES') : '—'}
                        </td>
                        <td>
                          {t.driver
                            ? <div className="admin-user-cell">
                                <div className="admin-user-avatar" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>{initials(t.driver.name)}</div>
                                <span style={{ fontSize: '0.82rem', color: '#103B31' }}>@{t.driver.username}</span>
                              </div>
                            : <span style={{ color: '#a7d7c5' }}>—</span>
                          }
                        </td>
                        <td>
                          <Badge
                            label={t.status ?? 'activo'}
                            color={t.status === 'completed' ? 'blue' : t.status === 'cancelled' ? 'red' : 'green'}
                          />
                        </td>
                        <td style={{ display: 'flex', gap: 4 }}>
                          {t.status === 'active' && (
                            <button className="admin-action-btn warning" onClick={() => cancelTravel(t)} title="Cancelar trayecto">
                              <IconX size={14} /> Cancelar
                            </button>
                          )}
                          <button className="admin-action-btn danger" onClick={() => deleteTravel(t)} title="Eliminar permanentemente">
                            <IconTrash size={14} /> Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── REVIEWS ────────────────────────────────── */}
          {section === 'reviews' && (
            <div className="admin-table-card">
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr><th>De</th><th>Para</th><th>Nota</th><th>Comentario</th><th>Fecha</th><th>Acciones</th></tr>
                  </thead>
                  <tbody>
                    {loading && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#7ba696' }}>Cargando valoraciones…</td></tr>}
                    {!loading && reviews.length === 0 && (
                      <tr><td colSpan={6}>
                        <div className="admin-empty-state">
                          <div className="admin-empty-icon"><IconStar size={32} /></div>
                          <p>No hay valoraciones registradas.</p>
                        </div>
                      </td></tr>
                    )}
                    {!loading && reviews.map(rv => (
                      <tr key={rv.id}>
                        <td style={{ fontSize: '0.82rem', color: '#103B31' }}>{rv.author?.name ?? '—'}</td>
                        <td style={{ fontSize: '0.82rem', color: '#103B31' }}>{rv.recipient?.name ?? '—'}</td>
                        <td>
                          <span style={{ fontWeight: 800, color: rv.rating >= 4 ? '#31A47B' : rv.rating >= 2 ? '#d97706' : '#ef4444' }}>
                            {'★'.repeat(rv.rating)}{'☆'.repeat(5 - rv.rating)}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: '#1d3531', maxWidth: 220 }}>
                          {rv.comment?.slice(0, 60)}{(rv.comment?.length ?? 0) > 60 ? '…' : ''}
                        </td>
                        <td style={{ color: '#7ba696', fontSize: '0.78rem' }}>{new Date(rv.created_at).toLocaleDateString('es-ES')}</td>
                        <td>
                          <button className="admin-action-btn danger" onClick={() => deleteReview(rv)}>
                            <IconTrash size={14} /> Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── SCHEDULES ────────────────────────────────── */}
          {section === 'schedules' && (
            <div className="admin-table-card">
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr><th>Ruta</th><th>Parada</th><th>Llegada</th><th>Salida</th></tr>
                  </thead>
                  <tbody>
                    {loading && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: '#7ba696' }}>Cargando horarios…</td></tr>}
                    {!loading && schedules.length === 0 && (
                      <tr><td colSpan={4}>
                        <div className="admin-empty-state">
                          <div className="admin-empty-icon"><IconClock size={32} /></div>
                          <p>No hay horarios registrados.</p>
                        </div>
                      </td></tr>
                    )}
                    {!loading && schedules.map(sc => (
                      <tr key={sc.trip_id + '-' + sc.stop_id}>
                        <td style={{ fontWeight: 'bold' }}>{sc.route_name}</td>
                        <td>{sc.stop_name}</td>
                        <td>
                          <input type="time" step="1" value={sc.arrival_time || ''} 
                            onChange={(e) => updateScheduleTime(sc.trip_id, sc.stop_id, 'arrival_time', e.target.value)} 
                            style={{ border: '1px solid #d5ece3', borderRadius: 4, padding: '2px 4px' }}/>
                        </td>
                        <td>
                          <input type="time" step="1" value={sc.departure_time || ''} 
                            onChange={(e) => updateScheduleTime(sc.trip_id, sc.stop_id, 'departure_time', e.target.value)} 
                            style={{ border: '1px solid #d5ece3', borderRadius: 4, padding: '2px 4px' }}/>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── COMING SOON ────────────────────────────── */}
          {(section === 'vehicles' || section === 'payments') && (() => {
            const cfg = {
              vehicles:  { Icon: IconScooter, title: 'Gestión de Vehículos del Campus',   desc: 'Podrás activar/desactivar vehículos de alquiler (patinetes, bicicletas) y visualizar su estado en tiempo real. Pendiente de implementación en el backend.' },
              payments:  { Icon: IconCard,    title: 'Gestión de Pagos y Reembolsos',     desc: 'Podrás ver el historial de pagos, gestionar reembolsos y cancelar transacciones. Requiere integración con el sistema de pagos.' },
            }[section];
            return (
              <div className="admin-coming-soon">
                <div className="cs-icon"><cfg.Icon size={36} /></div>
                <h3>{cfg.title}</h3>
                <p>{cfg.desc}</p>
              </div>
            );
          })()}

        </div>{/* /admin-content */}
      </div>{/* /admin-main */}

      {/* ── MODAL ────────────────────────────────────── */}
      {modal.open && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className={`admin-modal-icon ${modal.type}`}>
              {modal.type === 'danger' ? <IconTrash size={24} /> : <IconWarn size={24} />}
            </div>
            <div className="admin-modal-title">{modal.title}</div>
            <div className="admin-modal-desc">
              {modal.desc}<br />
              <span className="admin-modal-target">{modal.target}</span>
            </div>
            <div className="admin-modal-actions">
              <button className="admin-modal-cancel" onClick={closeModal}>Cancelar</button>
              <button className={`admin-modal-confirm ${modal.type}`} onClick={modal.onConfirm}>
                {modal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW USER MODAL ───────────────────────────── */}
      {showNewUserModal && (
        <div className="admin-modal-overlay" onClick={() => setShowNewUserModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-title" style={{ marginBottom: 20 }}>Crear Nuevo Usuario</div>
            <form onSubmit={createUser} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input required placeholder="Nombre completo" value={newUser.name} onChange={e => setNewUser(p => ({...p, name: e.target.value}))} style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc' }} />
                <input required placeholder="Nombre de usuario" value={newUser.username} onChange={e => setNewUser(p => ({...p, username: e.target.value}))} style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc' }} />
                <input required type="email" placeholder="Correo electrónico" value={newUser.email} onChange={e => setNewUser(p => ({...p, email: e.target.value}))} style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc' }} />
                <input required type="password" placeholder="Contraseña (mín 6)" minLength={6} value={newUser.password} onChange={e => setNewUser(p => ({...p, password: e.target.value}))} style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc' }} />
                <select value={newUser.role} onChange={e => setNewUser(p => ({...p, role: e.target.value}))} style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc' }}>
                    <option value="student">Estudiante</option>
                    <option value="staff">Personal</option>
                    <option value="admin">Admin</option>
                    <option value="external">Externo</option>
                </select>
                <div className="admin-modal-actions" style={{ marginTop: 10 }}>
                    <button type="button" className="admin-modal-cancel" onClick={() => setShowNewUserModal(false)}>Cancelar</button>
                    <button type="submit" className="admin-modal-confirm warning" style={{ background: '#31A47B' }}>Crear Usuario</button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TOASTS ───────────────────────────────────── */}
      <div className="admin-toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`admin-toast ${t.type}`}>
            {t.type === 'success' ? <IconCheck size={16} /> : t.type === 'error' ? <IconX size={16} /> : <IconInfo size={16} />}
            {t.msg}
          </div>
        ))}
      </div>

    </div>
  );
}
