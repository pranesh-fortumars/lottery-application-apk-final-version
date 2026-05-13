import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Bell, ShoppingCart, Wallet, CreditCard, ArrowUpRight, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminRealTimeNotifier = () => {
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const [lastViewedCount, setLastViewedCount] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    let txs = [];
    let wds = [];

    const updateCombined = () => {
      const combined = [...txs, ...wds].sort((a, b) => {
        const timeA = a.timestamp?.toMillis() || 0;
        const timeB = b.timestamp?.toMillis() || 0;
        return timeB - timeA;
      });
      setNotifications(combined);
      setNewCount(combined.length);
    };

    const unsubTx = onSnapshot(
      query(collection(db, 'pending_transactions'), where('status', '==', 'pending')),
      (snapshot) => {
        txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), source: 'transaction' }));
        updateCombined();
      }
    );

    const unsubWd = onSnapshot(
      query(collection(db, 'withdrawals'), where('status', '==', 'pending')),
      (snapshot) => {
        wds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), source: 'withdrawal' }));
        updateCombined();
      }
    );

    return () => {
      unsubTx();
      unsubWd();
    };
  }, []);

  const getLabel = (item) => {
    if (item.source === 'withdrawal') return 'Withdrawal Request';
    if (item.type === 'topup') return 'Wallet Top-Up';
    if (item.paymentType === 'Referral Bonus') return 'Referral Bonus Purchase';
    return 'Ticket Purchase';
  };

  const getIcon = (item) => {
    if (item.source === 'withdrawal') return <ArrowUpRight className="text-orange-500" size={16} />;
    if (item.type === 'topup') return <Wallet className="text-blue-500" size={16} />;
    if (item.paymentType === 'Referral Bonus') return <AlertCircle className="text-emerald-500" size={16} />;
    return <ShoppingCart className="text-red-500" size={16} />;
  };

  const hasNew = newCount > lastViewedCount;

  return (
    <div className="fixed bottom-6 right-6 z-[999]">
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-80 bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden"
          >
            <div className="bg-[#ff0033] p-4 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white">
                <Bell size={18} />
                <span className="font-black uppercase tracking-widest text-[10px]">Real-Time Alerts</span>
              </div>
              <button 
                onClick={() => { setShowPanel(false); setLastViewedCount(newCount); }}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-gray-400 italic text-[10px] uppercase font-bold tracking-widest">
                  No pending requests
                </div>
              ) : (
                notifications.map((item) => (
                  <div key={item.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex gap-3 group hover:bg-red-50 transition-colors">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                      {getIcon(item)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{getLabel(item)}</p>
                      <p className="text-[11px] font-black text-gray-900 truncate uppercase">{item.userName || 'Anonymous User'}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] font-black text-[#ff0033] italic">₹{item.amount}</span>
                        <span className="text-[8px] font-bold text-gray-300 uppercase tracking-tighter">
                          {item.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <p className="text-[8px] font-black text-gray-400 text-center uppercase tracking-widest">
                   {notifications.length} Pending Actions Required
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => {
          setShowPanel(!showPanel);
          if (!showPanel) setLastViewedCount(newCount);
        }}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 relative ${
          hasNew ? 'bg-[#ff0033] scale-110' : 'bg-gray-900'
        } hover:scale-105 active:scale-95`}
      >
        <Bell className="text-white" size={24} />
        {newCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-white text-[#ff0033] border-2 border-[#ff0033] rounded-full flex items-center justify-center text-[10px] font-black animate-bounce">
            {newCount}
          </span>
        )}
        
        {hasNew && (
           <span className="absolute inset-0 rounded-full bg-[#ff0033] animate-ping opacity-20"></span>
        )}
      </button>
    </div>
  );
};

export default AdminRealTimeNotifier;
