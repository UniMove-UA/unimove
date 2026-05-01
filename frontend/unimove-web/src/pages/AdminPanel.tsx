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
interface Travel { id: number; origin: string; destination: string; departure_time: string; driver?: { name: string; username: string }; status: string; }
interface Review { id: number; rating: number; comment: string; reviewer?: { name: string }; reviewed?: { name: string }; created_at: string; }
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
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts]   = useState<Toast[]>([]);
  const [userFilter, setUserFilter] = useState('all');
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
      fetch(`${API}/travels`, { headers: authHeaders() })
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
  }, [section]);

  // ─── Actions ─────────────────────────────────────────────────────────────────
  const deleteUser = (u: User) => openModal({
    title: 'Eliminar usuario',
    desc: '¿Seguro que deseas eliminar a este usuario? Esta acción es irreversible.',
    target: `${u.name} (@${u.username})`, confirmLabel: 'Eliminar', type: 'danger',
    onConfirm: async () => {
      const r = await fetch(`${API}/admin/users/${u.id}`, { method: 'DELETE', headers: authHeaders() });
      if (r.ok) { setUsers(p => p.filter(x => x.id !== u.id)); toast(`Usuario @${u.username} eliminado`); }
      else toast('Error al eliminar el usuario', 'error');
      closeModal();
    },
  });

  const deleteTravel = (t: Travel) => openModal({
    title: 'Eliminar publicación', desc: '¿Eliminar esta publicación de trayecto?',
    target: `${t.origin} → ${t.destination}`, confirmLabel: 'Eliminar', type: 'danger',
    onConfirm: async () => {
      const r = await fetch(`${API}/travels/${t.id}`, { method: 'DELETE', headers: authHeaders() });
      if (r.ok) { setTravels(p => p.filter(x => x.id !== t.id)); toast('Publicación eliminada'); }
      else toast('Error al eliminar la publicación', 'error');
      closeModal();
    },
  });

  const deleteReview = (rv: Review) => openModal({
    title: 'Eliminar valoración', desc: '¿Eliminar esta valoración?',
    target: `"${rv.comment?.slice(0, 50) ?? ''}"`, confirmLabel: 'Eliminar', type: 'danger',
    onConfirm: async () => {
      const r = await fetch(`${API}/reviews/${rv.id}`, { method: 'DELETE', headers: authHeaders() });
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

  // Chart bars (mock)
  const chartHeights = [40, 65, 55, 80, 70, 90, 75, 60, 85, 95, 72, 88];

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
                  <span className="admin-nav-icon"><Icon size={17} /></span>
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
                  { Icon: IconUsers, val: '—', label: 'Usuarios totales',   col: 'green' },
                  { Icon: IconCar,   val: '—', label: 'Viajes publicados',  col: 'teal'  },
                  { Icon: IconStar,  val: '—', label: 'Valoraciones',       col: 'dark'  },
                  { Icon: IconScooter, val: '—', label: 'Vehículos activos', col: 'sand' },
                ].map(({ Icon, val, label, col }, i) => (
                  <div key={i} className="admin-stat-card">
                    <div className={`admin-stat-icon ${col}`}><Icon size={22} /></div>
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
                  <div className="admin-table-card" style={{ padding: '18px' }}>
                    <div className="admin-chart-placeholder">
                      {chartHeights.map((h, i) => (
                        <div key={i} className="admin-chart-bar" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#7ba696', margin: '10px 0 0' }}>
                      Viajes registrados — últimos 12 meses (datos de muestra)
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
              <div className="admin-filter-bar">
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
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr><th>#</th><th>Origen</th><th>Destino</th><th>Salida</th><th>Conductor</th><th>Estado</th><th>Acciones</th></tr>
                  </thead>
                  <tbody>
                    {loading && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#7ba696' }}>Cargando trayectos…</td></tr>}
                    {!loading && travels.length === 0 && (
                      <tr><td colSpan={7}>
                        <div className="admin-empty-state">
                          <div className="admin-empty-icon"><IconCar size={32} /></div>
                          <p>No hay trayectos publicados.</p>
                        </div>
                      </td></tr>
                    )}
                    {!loading && travels.map(t => (
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
                        <td>
                          <button className="admin-action-btn danger" onClick={() => deleteTravel(t)}>
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
                        <td style={{ fontSize: '0.82rem', color: '#103B31' }}>{rv.reviewer?.name ?? '—'}</td>
                        <td style={{ fontSize: '0.82rem', color: '#103B31' }}>{rv.reviewed?.name ?? '—'}</td>
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

          {/* ── COMING SOON ────────────────────────────── */}
          {(section === 'vehicles' || section === 'payments' || section === 'schedules') && (() => {
            const cfg = {
              vehicles:  { Icon: IconScooter, title: 'Gestión de Vehículos del Campus',   desc: 'Podrás activar/desactivar vehículos de alquiler (patinetes, bicicletas) y visualizar su estado en tiempo real. Pendiente de implementación en el backend.' },
              payments:  { Icon: IconCard,    title: 'Gestión de Pagos y Reembolsos',     desc: 'Podrás ver el historial de pagos, gestionar reembolsos y cancelar transacciones. Requiere integración con el sistema de pagos.' },
              schedules: { Icon: IconClock,   title: 'Gestión de Horarios de Transporte', desc: 'Podrás modificar los horarios de bus, tranvía y cercanías mostrados en la aplicación. Requiere conexión con las APIs de transporte externas.' },
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
