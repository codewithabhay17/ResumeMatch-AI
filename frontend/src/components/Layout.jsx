import { useState } from "react";
import { useNavigate, useLocation, Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { path: "/resumes", label: "Resumes", icon: "description" },
  { path: "/jobs", label: "Jobs", icon: "work" },
  { path: "/saved-jobs", label: "Saved Jobs", icon: "bookmark" },
  { path: "/profile", label: "Profile", icon: "person_outline" },
  { path: "/settings", label: "Settings", icon: "tune" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = user?.name || "User";
  const displayEmail = user?.email || "";
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="bg-background font-body-md text-on-surface selection:bg-primary/20 selection:text-primary antialiased min-h-screen flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest/95 backdrop-blur-2xl z-50 hidden md:flex flex-col justify-between border-r border-surface-container shadow-sm">
        <div className="flex flex-col">
          <div onClick={() => navigate("/")} className="h-16 px-space-md flex items-center gap-space-sm border-b border-surface-container cursor-pointer hover:bg-surface-container-low transition-colors">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-lg">auto_awesome</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm tracking-tight text-primary font-bold leading-none">ResuMatch</span>
              <span className="font-code-telemetry text-code-telemetry text-tertiary uppercase tracking-wider font-semibold">v4.2 Lumina</span>
            </div>
          </div>
          
          <div className="px-space-md pt-space-md pb-space-xs">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Navigation Matrix</span>
          </div>
          
          <nav className="flex flex-col gap-1 px-space-xs">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path + "/"));
              
              if (isActive) {
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="flex items-center w-full text-left gap-space-sm px-space-sm py-2 rounded-lg transition-all group bg-primary text-on-primary font-headline-sm font-semibold shadow-sm"
                  >
                    <span className="material-symbols-outlined text-on-primary text-xl">{item.icon}</span>
                    <span className="font-body-md text-body-md">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-code-telemetry text-[10px] font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              }
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex items-center w-full text-left gap-space-sm px-space-sm py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all group"
                >
                  <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-xl">{item.icon}</span>
                  <span className="font-body-md text-body-md font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-code-telemetry text-[10px] font-bold group-hover:bg-secondary group-hover:text-white transition-colors">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="p-space-sm border-t border-surface-container bg-surface-container-lowest/70 flex flex-col gap-space-sm">
          <div className="p-space-sm rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-outline uppercase font-semibold">Core Sync</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                <div className="bg-primary h-full w-4/5 rounded-full"></div>
              </div>
              <div className="flex justify-between font-code-telemetry text-code-telemetry text-on-surface-variant">
                <span>Match Compute</span>
                <span className="text-primary font-bold">94.8%</span>
              </div>
            </div>
          </div>
          <button onClick={() => navigate("/")} className="flex items-center gap-space-xs px-space-sm py-2 rounded-lg text-purple-600 hover:bg-purple-50 transition-all font-body-md font-medium w-full text-left">
            <span className="material-symbols-outlined text-lg">rate_review</span>
            <span>Write a Review</span>
          </button>
          <button onClick={handleLogout} className="flex items-center gap-space-xs px-space-sm py-2 rounded-lg text-on-error-container hover:bg-error-container/50 transition-all font-body-md font-medium w-full text-left">
            <span className="material-symbols-outlined text-lg">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="md:pl-64 flex flex-col min-h-screen w-full">
        <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl z-40 border-b border-surface-container flex">
          <div className="h-16 w-full px-space-lg flex items-center justify-between gap-space-md">
            
            <div className="flex items-center gap-space-md flex-1 max-w-xl">
              <div className="relative w-full hidden md:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">search</span>
                <input type="text" placeholder="Search jobs, skills, or resume tags..." className="w-full bg-surface-container-low text-on-surface placeholder-outline font-body-sm text-body-sm pl-10 pr-space-md py-space-xs rounded-lg border border-outline-variant/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm" />
              </div>
              
              <div className="hidden xl:flex items-center gap-space-sm shrink-0">
                <div className="flex items-center gap-1.5 px-space-xs py-1 rounded-full bg-emerald-50 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span className="font-code-telemetry text-[11px] text-emerald-800 font-bold uppercase">AI ENGINE: ONLINE</span>
                </div>
                <div className="flex items-center gap-1 px-space-xs py-1 rounded-full bg-surface-container-low border border-surface-container">
                  <span className="material-symbols-outlined text-outline text-xs">bolt</span>
                  <span className="font-code-telemetry text-[11px] text-outline uppercase font-medium">LATENCY: 18ms</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-space-sm shrink-0">
              <button onClick={() => navigate("/resume-upload")} className="hidden md:flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-body-sm font-semibold transition-colors shadow-sm">
                <span className="material-symbols-outlined text-base">neurology</span>
                Analyze Resume
              </button>
              <button className="relative p-space-xs rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-low transition-all">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-surface-container-lowest"></span>
              </button>
              
              <div className="flex items-center gap-space-xs pl-space-xs cursor-pointer" onClick={() => navigate("/profile")}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-sm ring-2 ring-primary/20 shadow-sm">
                  {initial}
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="font-headline-sm text-body-sm font-bold text-on-surface leading-tight truncate max-w-[120px]">{displayName}</span>
                  <span className="font-code-telemetry text-[11px] text-primary font-semibold leading-none truncate max-w-[120px]">{displayEmail}</span>
                </div>
              </div>
            </div>
            
          </div>
        </header>

        {/* Content Outlet */}
        <main className="relative pt-16 w-full flex-1 bg-surface">
          <div className="p-space-lg md:p-space-xl max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
        
        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-surface-container flex md:hidden z-50 px-2 py-1 pb-safe">
          {navItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path + "/"));
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 ${isActive ? 'text-primary' : 'text-outline hover:text-on-surface'}`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                <span className={`font-body-md text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
