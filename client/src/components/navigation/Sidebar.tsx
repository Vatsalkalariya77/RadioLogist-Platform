import type { MouseEvent, ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { getInitials } from "../../utils/name";

interface SidebarLink {
  name: string;
  path: string;
  icon: ReactNode;
  isMock?: boolean;
}

interface SidebarProps {
  userRole: "student" | "admin" | string;
  userName: string;
  isOpen: boolean;
  isCollapsed?: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ userRole, userName, isOpen, setIsOpen }: SidebarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    api.post("/auth/logout").catch((err) => {
      console.error("Logout API call failed:", err);
    });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const studentLinks: SidebarLink[] = [
    {
      name: "Dashboard",
      path: "/student/dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ),
    },
    {
      name: "Learning Cases",
      path: "/student/cases",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
        </svg>
      ),
    },
    {
      name: "Learning Progress",
      path: "/student/progress",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
      ),
    },
  ];

  const adminLinks: SidebarLink[] = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ),
    },
    {
      name: "Create Case",
      path: "/admin/create-case",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      name: "Manage Cases",
      path: "/admin/manage-cases",
      icon: (
        <svg xmlns="http://www.w3.org/2055/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
        </svg>
      ),
    },
  ];

  const superadminLinks: SidebarLink[] = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ),
    },
    {
      name: "Create Case",
      path: "/admin/create-case",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      name: "Manage Cases",
      path: "/admin/manage-cases",
      icon: (
        <svg xmlns="http://www.w3.org/2055/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
        </svg>
      ),
    },
  ];

  const getLinksForRole = () => {
    if (userRole === "superadmin") {
      return superadminLinks;
    }
    if (userRole === "admin") {
      return adminLinks;
    }
    return studentLinks;
  };

  const links = getLinksForRole();

  const handleMockClick = (e: MouseEvent, name: string) => {
    e.preventDefault();
    alert(`${name} section is currently under active development. Keep exploring the Dashboard!`);
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col bg-slate-900 text-slate-100 transition-transform duration-350 ease-out border-r border-slate-800 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* --- Header / Brand Logo --- */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 text-white shadow-lg shadow-teal-500/25 animate-pulse">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 4V20" />
                <path d="M4 12H20" />
                <circle cx="16" cy="8" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-100 to-teal-400 bg-clip-text text-transparent">
                RadioLogist
              </span>
              <p className="text-[10px] font-bold text-teal-400/80 tracking-widest uppercase">
                Platform
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* --- Navigation Links --- */}
        <nav className="flex-1 space-y-2 px-4 py-8 overflow-y-auto scrollbar-hide">
          <div className="px-3 mb-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            Navigation Menu
          </div>
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={(e) => link.isMock && handleMockClick(e, link.name)}
              className={({ isActive }) =>
                `flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-semibold tracking-medium transition-all duration-200 group relative overflow-hidden cursor-pointer ${
                  isActive && !link.isMock
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/10"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`transition-colors duration-200 ${
                      isActive && !link.isMock ? "text-white" : "text-slate-500 group-hover:text-teal-400"
                    }`}
                  >
                    {link.icon}
                  </span>
                  <span>{link.name}</span>
                  {link.isMock && (
                    <span className="ml-auto text-[9px] font-extrabold tracking-wider bg-slate-800 text-slate-500 border border-slate-700/60 rounded px-1.5 py-0.5 group-hover:bg-teal-950 group-hover:text-teal-400 group-hover:border-teal-900/60 transition-colors uppercase">
                      Mock
                    </span>
                  )}
                  {isActive && !link.isMock && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-teal-400 rounded-l-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* --- User Role Info & Logout --- */}
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3.5 rounded-2xl bg-slate-800/40 border border-slate-800/40 p-3.5 mb-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 font-extrabold text-sm border border-teal-500/20">
              {getInitials(userName)}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-xs font-bold text-slate-100">{userName}</h4>
              <p className="text-[10px] font-bold text-teal-500 tracking-wider uppercase mt-0.5">
                {userRole} Mode
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-800 bg-transparent py-3.5 text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/20 transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            LOG OUT SYSTEM
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
