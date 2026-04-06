import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ApiErrorAlert } from '../components/ui/ApiErrorAlert';
import { useRegisterMutation } from '../features/auth/authApi';
import { useAuth } from '../features/auth/AuthProvider';
import type { RegisterRequest } from '../features/auth/types';

interface SignupFormState extends RegisterRequest {
  confirmPassword: string;
}

const initialForm: SignupFormState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
};

const SignupPage = () => {
  const [form, setForm] = useState<SignupFormState>(initialForm);
  const [clientError, setClientError] = useState<string | null>(null);
  const [register, { isLoading, isError, error }] = useRegisterMutation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/issues" replace />;
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
    setClientError(null);

    if (form.password !== form.confirmPassword) {
      setClientError('Passwords do not match.');
      return;
    }

    if (form.password.length < 6) {
      setClientError('Password must be at least 6 characters.');
      return;
    }

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password
      }).unwrap();

      navigate('/login', {
        replace: true,
        state: { message: 'Account created. Please sign in.' }
      });
    } catch (_requestError: unknown) {
      // API error is already exposed via RTK Query state.
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card space-y-6">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Get Started</p>
          <h1 className="app-heading">Create account</h1>
          <p className="app-subheading">Register to access issue management tools.</p>
        </header>

        <form className="app-form" onSubmit={handleSubmit}>
          <fieldset disabled={isLoading} className="space-y-5 border-0 p-0 m-0 min-w-0">
            <div className="app-form-group">
              <label className="app-label" htmlFor="name">
                Name
              </label>
              <input
                required
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="app-input"
                placeholder="Your full name"
              />
            </div>

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
                placeholder="Minimum 6 characters"
              />
            </div>

            <div className="app-form-group">
              <label className="app-label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                required
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="app-input"
                placeholder="Re-enter password"
              />
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </fieldset>

          {clientError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">{clientError}</p>
          ) : null}
          {isError ? <ApiErrorAlert error={error} fallbackMessage="Signup failed." /> : null}
        </form>

        <p className="text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-700">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
};

export { SignupPage };
