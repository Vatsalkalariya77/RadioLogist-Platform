import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import UserAvatar from "../common/UserAvatar";

interface NavbarProps {
  userRole: string;
  userName: string;
  userEmail: string;
  setSidebarOpen: (open: boolean) => void;
  onLogoutClick: () => void;
}

const Navbar = ({
  userRole,
  userName,
  userEmail,
  
  setSidebarOpen,
  onLogoutClick,
 
}: NavbarProps) => {
  console.log("TRACE 8: Navbar props name:", userName);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    // Initialize correctly
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (dropdownOpen && event.key === "Escape") {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    setDropdownOpen(false);
    onLogoutClick();
  };

  const getPageTitle = () => {
    if (window.location.pathname.includes("admin")) {
      return "Admin Workspace";
    }
    return "Clinician Learning Dashboard";
  };

  return (
    <header className={`fixed top-0 right-0 left-0 lg:left-72 z-30 flex h-16 items-center justify-between border-b bg-white/85 px-4 backdrop-blur-md transition-all duration-300 sm:px-6 lg:px-8 ${
      isScrolled
        ? "border-slate-200/80 shadow-md shadow-slate-100/40"
        : "border-slate-200 shadow-sm"
    }`}>
      {/* --- Left Side: Mobile Menu Button & Dynamic Title --- */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
          aria-label="Open sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 lg:inline-flex"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button> */}

        <div>
          <h1 className="text-base font-bold text-slate-800 tracking-tight lg:text-lg">
            {getPageTitle()}
          </h1>
          <p className="hidden text-[11px] font-semibold text-slate-400 lg:block mt-0.5">
            Welcome back to the medical training center.
          </p>
        </div>
      </div>

      {/* --- Right Side: Actions (Search, Alerts, User Profile) --- */}
      <div className="flex items-center gap-3">
        {/* Mock Search Bar */}
        <div className="relative hidden max-w-xs sm:block">
          <input
            type="text"
            placeholder="Search radiology cases..."
            className="w-56 rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-xs font-medium outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>

        {/* Notifications Icon & Panel */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setDropdownOpen(false);
            }}
            className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-teal-500 ring-2 ring-white animate-pulse" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <span className="text-xs font-bold text-slate-800">System Notifications</span>
                <span className="text-[10px] font-bold text-teal-600 hover:underline cursor-pointer">Mark all read</span>
              </div>
              <div className="space-y-3">
                <div className="flex gap-3 rounded-lg p-2 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-700">New Learning Case Added</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Brain MRI case #1024 is ready to study.</p>
                  </div>
                </div>
                <div className="flex gap-3 rounded-lg p-2 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-700">Account Approved</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Your diagnostic license has been verified.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-200" />

        {/* User Profile Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/40 p-1.5 pr-3 hover:bg-slate-50 transition-all cursor-pointer"
          >
            <UserAvatar name={userName} />
            <div className="hidden text-left sm:block">
              <p className="text-xs font-bold text-slate-800 leading-none">{userName}</p>
              <p className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-1">
                {userRole}
              </p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-slate-50 mb-1.5">
                <p className="text-xs font-bold text-slate-700">{userName}</p>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{userEmail}</p>
              </div>
              <Link
                to="/change-password"
                onClick={() => setDropdownOpen(false)}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Change Password
              </Link>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  alert("Feature under active construction!");
                }}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Support Center
              </button>
              <div className="my-1.5 border-t border-slate-50" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
