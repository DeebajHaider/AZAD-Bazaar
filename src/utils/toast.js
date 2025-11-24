import { Toast } from '@capacitor/toast';
import toast from 'react-hot-toast';

export async function showToast(message) {
  // Detect Capacitor mobile
  if (window.Capacitor?.isNativePlatform?.()) {
    await Toast.show({ text: message });
  } else {
    toast(message); // web fallback
  }
}
