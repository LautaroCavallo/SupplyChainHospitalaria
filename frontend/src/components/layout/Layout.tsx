import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-[#f5f7f5] dark:bg-[#0f172a]">
      <Sidebar />
      <div className="ml-52 flex flex-1 flex-col">
        <main className="relative flex-1 overflow-y-auto p-8">
          <Header />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
