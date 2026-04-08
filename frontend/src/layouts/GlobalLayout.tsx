import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import { useSocketEvents } from '../hooks/useSocketEvents';
import { NotificationDropdown } from '../components/ui/NotificationDropdown';

const navClassName = ({ isActive }: { isActive: boolean }): string =>
  [
    'inline-flex items-center rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200',
    isActive
      ? 'bg-slate-900 text-white shadow-sm'
      : 'text-slate-700 hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-900'
  ].join(' ');

const GlobalLayout = () => {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();

  useSocketEvents();

  const handleLogout = (): void => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="app-container flex items-center justify-between py-3">
          <Link to="/issues" className="group flex items-center gap-2.5 rounded-xl p-1 transition-opacity hover:opacity-80">
            {/* AI spark icon */}
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M12 2a.75.75 0 0 1 .7.48l1.95 4.9 4.9 1.95a.75.75 0 0 1 0 1.4l-4.9 1.95-1.95 4.9a.75.75 0 0 1-1.4 0l-1.95-4.9-4.9-1.95a.75.75 0 0 1 0-1.4l4.9-1.95L11.3 2.48A.75.75 0 0 1 12 2ZM5.5 15a.5.5 0 0 1 .47.33l.9 2.27 2.27.9a.5.5 0 0 1 0 .94l-2.27.9-.9 2.27a.5.5 0 0 1-.94 0l-.9-2.27-2.27-.9a.5.5 0 0 1 0-.94l2.27-.9.9-2.27A.5.5 0 0 1 5.5 15Z" />
              </svg>
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Workspace</p>
              <p className="text-[0.95rem] font-bold leading-tight text-slate-900">AI Issue Tracker</p>
            </div>
          </Link>

          <nav className="flex items-center gap-1.5">
            <NavLink to="/create-issue" className={navClassName}>
              Create Issue
            </NavLink>
            <NavLink to="/issues" className={navClassName}>
              Issues List
            </NavLink>
            {isAdmin ? (
              <NavLink to="/dashboard" className={navClassName}>
                Dashboard
              </NavLink>
            ) : null}
            <NotificationDropdown />
            <button type="button" onClick={handleLogout} className="btn-ghost text-slate-500 hover:text-slate-700">
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="app-container py-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
};

export { GlobalLayout };
