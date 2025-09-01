import { toast } from 'sonner';


interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  config?: {
    description?: string;
    duration?: number;
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    closeButton?: boolean;
    dismissible?: boolean;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
}

const defaultToastConfig = {
  duration: 5000,
  position: 'bottom-center' as const,
  closeButton: false,
  dismissible: true,
};

const notify = ({ type, message, config = {} }: ToastProps) => {
  const finalConfig = { ...defaultToastConfig, ...config };
  
  const toastOptions = {
    duration: finalConfig.duration,
    dismissible: finalConfig.dismissible,
    closeButton: finalConfig.closeButton,
    description: finalConfig.description,
    action: finalConfig.action,
  };

  console.log('Toast options:', toastOptions);
  console.log('Toast type:', type);
  switch (type) {
    case 'success':
      toast.success(message);
      break;
    case 'error':
      toast.error(message, toastOptions);
      break;
    case 'warning':
      toast.warning(message, toastOptions);
      break;
    case 'info':
      toast.info(message, toastOptions);
      break;
    default:
      break;
  }
};

export default notify;