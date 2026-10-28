import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { applyDocumentPreferences, getInitialLang, getInitialTheme } from './lib/preferences.ts';

// Apply saved language / theme before the first paint: no flash of the wrong theme
applyDocumentPreferences(getInitialLang(), getInitialTheme());

createRoot(document.getElementById('root')!).render(<App />);
