import { useState, useEffect } from 'react';
import { Bell, Moon, Sun } from 'lucide-react';
import NotificationsModal from '../common/NotificationsModal';

function useDarkMode() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  return [dark, () => setDark((d) => !d)] as const;
}

export default function Header() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [isDark, toggleDark] = useDarkMode();

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 items-center justify-end border-b border-gray-100 bg-white px-8 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNotifOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            title="Notificaciones"
          >
            <Bell className="h-5 w-5" />
          </button>
          <button
            onClick={toggleDark}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <NotificationsModal isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}
