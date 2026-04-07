import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';

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

  const handleLogout = (): void => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="app-container flex items-center justify-between py-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Workspace</p>
            <p className="text-[0.95rem] font-bold leading-tight text-slate-900">AI Issue Tracker</p>
          </div>

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
