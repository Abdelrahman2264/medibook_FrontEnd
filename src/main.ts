import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => {
    console.error('Error bootstrapping application:', err);
    // Display error to user
    document.body.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; font-family: Arial, sans-serif;">
        <h1 style="color: red;">Application Error</h1>
        <p>Failed to start the application. Please check the console for details.</p>
        <p style="color: #666; font-size: 12px;">${err.message || 'Unknown error'}</p>
      </div>
    `;
  });
