import { useEffect, useRef } from 'react';
import { App } from '@capacitor/app';
import { useNavigate, useLocation } from 'react-router-dom';

const BackButtonHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationRef = useRef(location);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
    let backButtonListener;

    const setupListener = async () => {
      backButtonListener = await App.addListener('backButton', (event) => {
        const currentPath = locationRef.current.pathname;
        // Exit app if on home or login screen
        if (currentPath === '/' || currentPath === '/login') {
          App.exitApp();
        } else {
          // Go back otherwise
          navigate(-1);
        }
      });
    };

    setupListener();

    return () => {
      if (backButtonListener) {
        backButtonListener.remove();
      }
    };
  }, [navigate]);

  return null;
};

export default BackButtonHandler;
