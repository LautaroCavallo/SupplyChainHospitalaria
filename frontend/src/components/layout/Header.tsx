import { Bell, Settings } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-end border-b border-gray-100 bg-white px-8 shadow-sm">
      <div className="flex items-center gap-3">
        <button className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
          <Bell className="h-5 w-5" />
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
          <Settings className="h-5 w-5" />
        </button>
        <div className="ml-2 flex items-center gap-3 rounded-full border border-gray-100 bg-gray-50 py-1.5 pl-1.5 pr-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-700 text-xs font-semibold text-white">
            AV
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-tight text-gray-900">
              Dr. Alejandro V.
            </span>
            <span className="text-[11px] leading-tight text-gray-500">
              Farmacéutico Jefe
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
