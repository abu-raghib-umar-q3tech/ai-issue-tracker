import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import App from './App';
import { store } from './app/store';
import { AppErrorBoundary } from './components/ui/AppErrorBoundary';
import { GlobalApiLoader } from './components/ui/GlobalApiLoader';
import { ScrollToTop } from './components/ui/ScrollToTop';
import { AuthProvider } from './features/auth/AuthProvider';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <AppErrorBoundary>
      <Provider store={store}>
        <AuthProvider>
          <BrowserRouter>
            <ScrollToTop />
            <GlobalApiLoader />
            <ToastContainer
              position="top-right"
              autoClose={2500}
              hideProgressBar
              closeButton={false}
              newestOnTop
              pauseOnHover
              draggable={false}
              theme="light"
            />
            <App />
          </BrowserRouter>
        </AuthProvider>
      </Provider>
    </AppErrorBoundary>
  </StrictMode>
);
