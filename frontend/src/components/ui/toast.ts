import { toast, type ToastOptions } from 'react-toastify';

const baseToastOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 2500,
  hideProgressBar: true,
  closeButton: false,
  pauseOnFocusLoss: false,
  pauseOnHover: true,
  draggable: false,
  theme: 'light'
};

const showSuccessToast = (message: string): void => {
  toast.success(message, baseToastOptions);
};

const showErrorToast = (message: string): void => {
  toast.error(message, {
    ...baseToastOptions,
    autoClose: 3200
  });
};

const showInfoToast = (message: string): void => {
  toast.info(message, {
    ...baseToastOptions,
    autoClose: 4000
  });
};

export { showErrorToast, showInfoToast, showSuccessToast };
