import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  Home as HomeIcon, 
  Gavel, 
  ScrollText, 
  ShoppingCart, 
  User, 
  Download,
  LayoutDashboard,
  Megaphone,
  Settings2,
  Users,
  BarChart3,
  Settings,
  ShieldAlert,
  Ticket,
  Bell,
  X,
  Trophy,
  Info,
  ChevronLeft
} from 'lucide-react';

export const Header = ({ title, showBack = false }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { notifications, markAllRead, lastAnnouncement, hoveringNews, appSettings } = useCart();
  const [showNotifs, setShowNotifs] = useState(false);
  
  const displayTitle = title || appSettings.brandName || "SECURE PORTAL";

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleOpenNotifs = () => {
    setShowNotifs(true);
  };

  return (
    <>
      <header className="bg-gradient-to-r from-[#ff0033] to-[#ff4d6a] text-white flex flex-col z-[1000] shadow-lg w-full shrink-0 border-b border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-4" style={{ height: '70px' }}>
          <div className="flex items-center gap-3">
            {showBack ? (
              <button 
                onClick={() => navigate(-1)} 
                className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner hover:bg-white/30 transition-all active:scale-95"
              >
                <ChevronLeft size={24} />
              </button>
            ) : (
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
                 <img src="https://img.icons8.com/color/48/000000/treasure-chest.png" alt="Logo" className="w-7 h-7" />
              </div>
            )}
            <h1 className="text-lg font-condensed font-black tracking-tighter uppercase italic leading-none">{displayTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <button 
                onClick={handleOpenNotifs}
                className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/5 relative"
              >
                <Bell size={22} strokeWidth={2.5} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#ff0033] animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
            <NavLink to="/profile" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/5 pointer-events-auto">
              <User size={22} strokeWidth={2.5} />
            </NavLink>
          </div>
        </div>

        {/* Global Result Ticker / Breaking News */}
        <AnimatePresence>
          {hoveringNews && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-black text-[9px] font-black uppercase text-yellow-400 py-2 border-t border-white/10 overflow-hidden whitespace-nowrap"
            >
              <div className="animate-marquee inline-block px-4">
                <span className="text-white px-2 py-0.5 bg-red-600 rounded mr-4">LATEST NEWS</span>
                {hoveringNews} • {hoveringNews} • {hoveringNews} • 
              </div>
            </motion.div>
          )}
          {lastAnnouncement && !hoveringNews && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-black text-[9px] font-black uppercase text-yellow-400 py-2 border-t border-white/10 overflow-hidden whitespace-nowrap"
            >
              <div className="animate-marquee inline-block px-4">
                <span className="text-white px-2 py-0.5 bg-red-600 rounded mr-4">BREAKING NEWS</span>
                {lastAnnouncement.message} • {lastAnnouncement.ticker} • CHECK RESULTS TAB FOR DETAILS • 
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Notification Drawer Overlay */}
      <AnimatePresence>
        {showNotifs && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifs(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-[400px] bg-white z-[2001] shadow-2xl flex flex-col"
            >
              <div className="bg-[#ff0033] p-6 text-white shrink-0">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Bell size={24} fill="white" />
                    <h2 className="text-xl font-black uppercase tracking-tighter italic">Notifications</h2>
                  </div>
                  <button onClick={() => setShowNotifs(false)} className="bg-black/20 p-2 rounded-xl hover:bg-black/40 transition-all">
                    <X size={20} />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{unreadCount} New Alerts</p>
                  <button onClick={markAllRead} className="text-[10px] font-black uppercase tracking-widest hover:underline">Mark all as read</button>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-20 space-y-4">
                    <Bell size={64} />
                    <p className="font-black uppercase tracking-widest text-xs">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`p-4 rounded-2xl border transition-all relative overflow-hidden group ${n.read ? 'bg-gray-50 border-gray-100' : 'bg-white border-red-100 shadow-md ring-1 ring-red-50'}`}>
                      <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${
                          n.type === 'win' ? 'bg-emerald-500 text-white shadow-emerald-500/20 shadow-lg' :
                          n.type === 'result' ? 'bg-amber-500 text-white shadow-amber-500/20 shadow-lg' :
                          'bg-red-50 text-red-500'
                        }`}>
                          {n.type === 'win' ? <Trophy size={18} /> : 
                           n.type === 'result' ? <Megaphone size={18} /> : 
                           <Info size={18} />}
                        </div>
                        <div className="flex-grow pr-4">
                          <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-tight mb-1">{n.title}</h4>
                          <p className="text-[10px] font-medium text-gray-500 leading-relaxed">{n.message}</p>
                          <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-2 block">{n.time}</span>
                        </div>
                      </div>
                      {!n.read && <div className="absolute top-4 right-4 w-2 h-2 bg-[#ff0033] rounded-full shadow-[0_0_5px_#ff0033]"></div>}
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-gray-100 shrink-0">
                 <button onClick={() => setShowNotifs(false)} className="w-full py-3 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Close Panel</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export const BottomNav = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const userLinks = [
    { to: '/home', icon: HomeIcon },
    { to: '/tickets', icon: Ticket },
    { to: '/results', icon: ScrollText },
    { to: '/cart', icon: ShoppingCart },
  ];

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard },
    { to: '/admin/announcements', icon: Megaphone },
    { to: '/admin/control', icon: ShieldAlert },
    { to: '/admin/users', icon: Users },
    { to: '/admin/reports', icon: BarChart3 },
    { to: '/admin/settings', icon: Settings },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <div className="w-full shadow-[0_-8px_30px_rgba(255,0,51,0.2)] rounded-t-[2.5rem] bg-[#ff0033] overflow-hidden pointer-events-auto shrink-0">
      <div className="bg-black/10 text-white/80 py-2 text-center font-black text-[8px] tracking-[0.2em] border-b border-white/5 uppercase">
        {isAdmin ? '🛡️ Admin Command Center' : `💎 ${appSettings.brandName} Network`}
      </div>
      
      <nav className="flex justify-around items-center py-5 px-4 bg-[#ff0033]">
        {links.map((link, idx) => (
          <NavLink 
            key={idx}
            to={link.to} 
            end={link.to === '/admin'}
            className={({ isActive }) => `transition-all duration-300 flex flex-col items-center gap-1 ${
              isActive 
                ? 'text-white scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]' 
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            {({ isActive }) => (
              <>
                <link.icon size={26} strokeWidth={2.5} />
                <div className={`w-1 h-1 rounded-full bg-white transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

const PageWrapper = ({ children, title, showNav = true, showHeader = true, showBack = false, footerAction = null }) => {
  const { appSettings, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/signup';

  if (loading) return null;

  if (appSettings.maintenanceMode && user?.role !== 'admin' && !isAuthPage) {
    return (
      <div className="flex flex-col h-screen w-full bg-white items-center justify-center p-10 text-center space-y-6">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center animate-pulse">
           <ShieldAlert size={48} className="text-red-600" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tighter italic">System Maintenance</h1>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
          {appSettings.brandName} is currently undergoing scheduled system synchronization. We will be back shortly.
        </p>
        {/* Allow admins to reach login even during maintenance */}
        <button 
          onClick={() => navigate('/login')}
          className="text-[10px] font-black uppercase text-gray-300 hover:text-red-600 transition-colors"
        >
          Admin Login Bypass
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#f9f9f9] relative max-w-[480px] mx-auto shadow-2xl overflow-hidden border-x border-gray-100">
      {showHeader && <Header title={title || appSettings.brandName} showBack={showBack} />}
      
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex-grow bg-[#f9f9f9] overflow-y-auto scrollbar-hide pb-10"
      >
        {children}
      </motion.main>
      
      {/* Footer Area: Actions above BottomNav */}
      <div className="shrink-0 w-full bg-transparent pointer-events-none z-50">
         {footerAction && (
           <div className="px-4 pb-4 pointer-events-auto">
             {footerAction}
           </div>
         )}
         {showNav && <BottomNav />}
      </div>
    </div>
  );
};

export default PageWrapper;
