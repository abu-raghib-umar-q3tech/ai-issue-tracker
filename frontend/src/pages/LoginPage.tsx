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
  const [showPassword, setShowPassword] = useState(false);
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
              <div className="relative">
                <input
                  required
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  className="app-input pr-11"
                  placeholder="Your password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? 'Signing in…' : 'Sign In'}
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
