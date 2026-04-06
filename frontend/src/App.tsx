import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './features/auth/AuthProvider';
import { GlobalLayout } from './layouts/GlobalLayout';
import { CreateIssuePage } from './pages/CreateIssuePage';
import { DashboardPage } from './pages/DashboardPage';
import { IssuesListPage } from './pages/IssuesListPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

const RequireAuth = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

const RequireAdmin = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/issues" replace />;
  }

  return <Outlet />;
};

const RootRedirect = () => {
  const { isAuthenticated } = useAuth();

  return <Navigate to={isAuthenticated ? '/issues' : '/login'} replace />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<GlobalLayout />}>
          <Route path="/issues" element={<IssuesListPage />} />
          <Route path="/create-issue" element={<CreateIssuePage />} />

          <Route element={<RequireAdmin />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
};

export default App;
