import Toast from 'react-native-toast-message';

interface ShowToastOptions {
  title: string;
  message?: string;
  duration?: number;
}

export const showToast = {
  success: ({ title, message, duration = 3000 }: ShowToastOptions) => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: duration,
      autoHide: true,
      topOffset: 60,
    });
  },

  error: ({ title, message, duration = 4000 }: ShowToastOptions) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: duration,
      autoHide: true,
      topOffset: 60,
    });
  },

  info: ({ title, message, duration = 3000 }: ShowToastOptions) => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: duration,
      autoHide: true,
      topOffset: 60,
    });
  },

  warning: ({ title, message, duration = 3500 }: ShowToastOptions) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: duration,
      autoHide: true,
      topOffset: 60,
    });
  },
};
