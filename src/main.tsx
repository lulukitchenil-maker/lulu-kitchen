import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './hooks/useAuth';

let deferredPrompt: any = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.style.display = 'block';
    installButton.addEventListener('click', () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('PWA installation accepted');
          }
          deferredPrompt = null;
        });
      }
    });
  }
});

window.addEventListener('appinstalled', () => {
  console.log('PWA installed successfully');
  deferredPrompt = null;
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        console.log('Service Worker registered:', registration.scope);

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New version available! Reloading...');
                window.location.reload();
              }
            });
          }
        });

        setInterval(() => {
          registration.update();
        }, 60000);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
