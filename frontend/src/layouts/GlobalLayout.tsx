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
    <main className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="app-container flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Workspace</p>
            <h1 className="text-xl font-extrabold text-slate-900 md:text-2xl">AI Issue Tracker</h1>
            <p className="text-sm text-slate-600">Welcome back, {user?.name ?? 'there'}</p>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
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
            <button type="button" onClick={handleLogout} className="btn-secondary">
              Logout
            </button>
          </nav>
        </div>
      </header>

      <section className="app-container py-6 md:py-8">
        <Outlet />
      </section>
    </main>
  );
};

export { GlobalLayout };
