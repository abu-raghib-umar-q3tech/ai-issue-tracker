import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { ApiErrorAlert } from '../components/ui/ApiErrorAlert';
import { useLoginMutation } from '../features/auth/authApi';
import { useAuth } from '../features/auth/AuthProvider';
import type { LoginRequest } from '../features/auth/types';

interface LoginLocationState {
  from?: {
    pathname?: string;
  };
  message?: string;
}

const initialForm: LoginRequest = {
  email: '',
  password: ''
};

const LoginPage = () => {
  const [form, setForm] = useState<LoginRequest>(initialForm);
  const [login, { isLoading, isError, error }] = useLoginMutation();
  const { isAuthenticated, setSession } = useAuth();
  const location = useLocation();

  const locationState = location.state as LoginLocationState | null;
  const from = locationState?.from?.pathname ?? '/issues';
  const successMessage = locationState?.message;

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await login({
        email: form.email.trim(),
        password: form.password
      }).unwrap();

      setSession(response);
    } catch (_requestError: unknown) {
      // API error is already exposed via RTK Query state.
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card space-y-6">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Welcome Back</p>
          <h1 className="app-heading">Sign in</h1>
          <p className="app-subheading">Access your issue tracker workspace.</p>
        </header>

        {successMessage ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-700">
            {successMessage}
          </p>
        ) : null}

        <form className="app-form" onSubmit={handleSubmit}>
          <fieldset disabled={isLoading} className="space-y-5 border-0 p-0 m-0 min-w-0">
            <div className="app-form-group">
              <label className="app-label" htmlFor="email">
                Email
              </label>
              <input
                required
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="app-input"
                placeholder="you@example.com"
              />
            </div>

            <div className="app-form-group">
              <label className="app-label" htmlFor="password">
                Password
              </label>
              <input
                required
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="app-input"
                placeholder="Your password"
              />
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? 'Signing in...' : 'Login'}
            </button>
          </fieldset>

          {isError ? <ApiErrorAlert error={error} fallbackMessage="Login failed." /> : null}
        </form>

        <p className="text-sm text-slate-600">
          New here?{' '}
          <Link to="/signup" className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-700">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
};

export { LoginPage };
