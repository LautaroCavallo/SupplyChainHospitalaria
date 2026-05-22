import { useState } from 'react';
import { Bell, Moon } from 'lucide-react';
import NotificationsModal from '../common/NotificationsModal';

export default function Header() {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 items-center justify-end border-b border-gray-100 bg-white px-8 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNotifOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100"
            title="Notificaciones"
          >
            <Bell className="h-5 w-5" />
          </button>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100"
            title="Modo oscuro"
          >
            <Moon className="h-5 w-5" />
          </button>
        </div>
      </header>

      <NotificationsModal isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}
