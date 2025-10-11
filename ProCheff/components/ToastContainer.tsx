import React, { useEffect } from 'react';
import { ToastMessage } from '../types';
import Icon from './Icon';

const Toast: React.FC<{ message: ToastMessage; onDismiss: (id: number) => void }> = ({ message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(message.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  const baseClasses = "flex items-center w-full max-w-xs p-4 space-x-3 text-white rounded-lg shadow-lg relative";
  const typeClasses = {
    success: 'bg-emerald-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };
  
  const icons = {
      success: <Icon name="check" />,
      error: <Icon name="warning" />,
      warning: <Icon name="warning" />,
      info: <Icon name="info" />,
  };

  return (
    <div 
        className={`${baseClasses} ${typeClasses[message.type]}`} 
        role="alert"
        style={{ animation: 'slideInLeft 0.5s ease-out forwards' }}
    >
       <div className="flex-shrink-0">{icons[message.type]}</div>
       <div className="flex-1 text-sm font-medium">{message.message}</div>
       <button onClick={() => onDismiss(message.id)} className="p-1 rounded-full inline-flex hover:bg-white/20 transition-colors">
         <span className="sr-only">Dismiss</span>
         <Icon name="close" className="w-4 h-4" />
       </button>
    </div>
  );
};

const ToastContainer: React.FC<{ toasts: ToastMessage[]; dismissToast: (id: number) => void }> = ({ toasts, dismissToast }) => (
  <>
  <style>{`
    @keyframes slideInLeft {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
  `}</style>
  <div className="fixed top-5 right-5 z-[100] w-full max-w-xs space-y-3">
    {toasts.map((toast) => (
      <Toast key={toast.id} message={toast} onDismiss={dismissToast} />
    ))}
  </div>
  </>
);

export default ToastContainer;