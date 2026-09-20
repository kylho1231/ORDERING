import Swal, { SweetAlertIcon } from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// Base customized SweetAlert2 instance
export const AppSwal = Swal.mixin({
  confirmButtonColor: '#d97706', // Lovely Eatery amber
  cancelButtonColor: '#78716c', // Stone
  customClass: {
    popup: 'rounded-3xl font-sans',
    confirmButton: 'rounded-xl px-4 py-2 font-bold text-sm shadow-xs',
    cancelButton: 'rounded-xl px-4 py-2 font-bold text-sm',
  },
});

// Toast notification mixin (top-end or bottom-end on mobile)
export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  iconColor: '#d97706',
  customClass: {
    popup: 'rounded-2xl font-sans shadow-xl border border-stone-200 text-xs',
  },
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

export const notify = {
  // Quick notification toast
  toast: (title: string, icon: SweetAlertIcon = 'success') => {
    return Toast.fire({
      icon,
      title,
    });
  },

  // Success alert modal or toast
  success: (title: string, text?: string) => {
    return AppSwal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonColor: '#d97706',
    });
  },

  // Error alert
  error: (title: string, text?: string) => {
    return AppSwal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonColor: '#dc2626',
    });
  },

  // Info / Notice alert
  info: (title: string, text?: string) => {
    return AppSwal.fire({
      icon: 'info',
      title,
      text,
      confirmButtonColor: '#d97706',
    });
  },

  // Warning alert
  warning: (title: string, text?: string) => {
    return AppSwal.fire({
      icon: 'warning',
      title,
      text,
      confirmButtonColor: '#d97706',
    });
  },

  // Confirmation dialog with Promise resolving to boolean
  confirm: async ({
    title,
    text,
    confirmButtonText = 'Yes, confirm',
    cancelButtonText = 'Cancel',
    isDanger = false,
  }: {
    title: string;
    text?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    isDanger?: boolean;
  }): Promise<boolean> => {
    const result = await AppSwal.fire({
      title,
      text,
      icon: isDanger ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonColor: isDanger ? '#dc2626' : '#d97706',
      cancelButtonColor: '#78716c',
      confirmButtonText,
      cancelButtonText,
      reverseButtons: true,
    });
    return result.isConfirmed;
  },

  // Rich Kitchen Notification when a new order arrives
  newOrder: (order: { order_number: string; customer_name: string; total: number }) => {
    return Toast.fire({
      icon: 'success',
      title: `🔔 New Order #${order.order_number}`,
      html: `<span class="font-bold">${order.customer_name}</span> &bull; ₱${order.total.toFixed(2)}`,
      timer: 6000,
      position: 'top-end',
    });
  },
};

export default Swal;
