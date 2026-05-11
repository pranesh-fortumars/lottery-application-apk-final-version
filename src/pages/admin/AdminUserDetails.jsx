import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Wallet, 
  History, 
  ShieldAlert, 
  Mail, 
  Phone,
  Edit,
  Activity,
  Ticket,
  ChevronRight,
  ShieldCheck,
  Zap,
  Star
} from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

const AdminUserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activity, setActivity] = useState([]);
  const [stats, setStats] = useState({ tickets: 0, won: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch base user data
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = { id: userDoc.id, ...userDoc.data() };
          setUser(userData);

          // Fetch user tickets for stats and activity - Removed orderBy to avoid index errors
          const ticketsQuery = query(collection(db, 'tickets'), where('userId', '==', userId));
          const ticketsSnap = await getDocs(ticketsQuery);
          const ticketsList = ticketsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => {
              const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
              const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
              return timeB - timeA;
            });

          const totalWonValue = ticketsList.reduce((sum, t) => {
            if (t.status === 'Won') {
              const prize = parseFloat(t.prize?.replace(/[^0-9.]/g, '') || 0);
              return sum + prize;
            }
            return sum;
          }, 0);

          setStats({
            tickets: ticketsList.length,
            won: totalWonValue
          });

          // Create activity feed from tickets
          const activityFeed = ticketsList.slice(0, 10).map(t => ({
             id: t.id,
             type: t.status === 'Won' ? 'Win' : 'Purchase',
             amount: t.status === 'Won' ? `+₹${t.prize}` : `-₹${t.price * t.qty}`,
             date: t.timestamp?.toDate().toLocaleString() || 'Recent',
             desc: t.status === 'Won' ? `Won ${t.type} Draw` : `Bought ${t.qty} units (${t.type})`
          }));

          setActivity(activityFeed);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user details:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f9fa]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f42464]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-10 text-center">
        <p className="font-black uppercase tracking-widest text-gray-400">User Profile Not Found</p>
        <button onClick={() => navigate('/admin/users')} className="mt-4 text-[#f42464] font-black uppercase text-[10px] tracking-widest">Return to Directory</button>
      </div>
    );
  }

  return (
    <div className="space-y-10 p-4 pb-32 min-h-screen bg-[#f8f9fa]">
      {/* Navigation & Header */}
      <div className="border-[1.5px] border-[#ff004d] rounded-[2.5rem] p-8 bg-white shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff004d]/5 rounded-full blur-3xl"></div>
         <button 
           onClick={() => navigate('/admin/users')}
           className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-[#f42464] mb-6 transition-colors"
         >
           <ArrowLeft size={16} /> Back to Directory
         </button>
         
         <div className="flex gap-4 items-center">
            <div className="w-20 h-20 rounded-[2rem] bg-gray-50 flex items-center justify-center text-[#f42464] font-black text-3xl border border-white shadow-lg transform group-hover:-rotate-6 transition-transform relative">
               {user.name?.charAt(0) || 'U'}
               <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                  <ShieldCheck size={14} className="text-white" />
               </div>
            </div>
            <div className="flex-grow">
               <h2 className="text-2xl font-black text-gray-900 font-condensed uppercase tracking-tighter italic leading-none">{user.name || 'Anonymous'}</h2>
               <p className="text-[#ff004d] font-black text-[10px] uppercase tracking-widest leading-none mt-1">Player Rank: Diamond Elite</p>
               <div className="mt-3 flex gap-2">
                 <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1">
                    <Zap size={10} fill="currentColor" /> {user.status || 'Active'}
                 </span>
                 <span className="bg-gray-50 text-gray-400 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-gray-100">
                    ID: #{user.id.slice(0, 8)}
                 </span>
               </div>
            </div>
         </div>
      </div>

      {/* Wallet Dashboard */}
      <div className="bg-gray-950 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-6 opacity-10 bg-[#ff004d] rounded-bl-[2.5rem] group-hover:scale-110 transition-transform">
            <Wallet size={48} />
         </div>
         
         <p className="text-[10px] font-black uppercase tracking-widest text-[#ff004d] mb-4">Secured Vault Balance</p>
         <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black italic tracking-tighter">₹ {(user.balance || 0).toLocaleString()}</span>
            <span className="text-emerald-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-1 mb-2">
               +0.0% <Star size={10} fill="currentColor" />
            </span>
         </div>
         
         <div className="grid grid-cols-2 gap-6 mt-10 pt-10 border-t border-white/5">
            <div className="space-y-1">
               <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Tickets Purchased</p>
               <p className="text-xl font-black flex items-center gap-2">{stats.tickets} <Ticket size={18} className="text-[#ff004d]" /></p>
            </div>
            <div className="space-y-1">
               <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Total Winnings</p>
               <p className="text-xl font-black text-emerald-400 italic">₹ {stats.won.toLocaleString()}</p>
            </div>
         </div>
      </div>

      {/* Credentials & Details */}
      <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100 space-y-8">
         <div className="flex items-center gap-3 border-b border-gray-50 pb-6">
            <ShieldCheck className="text-[#f42464]" size={22} />
            <h3 className="text-xl font-black font-condensed uppercase tracking-tighter text-gray-800 italic leading-none">Identity Check</h3>
         </div>
         
         <div className="grid grid-cols-1 gap-6">
            <div className="flex items-center gap-5 p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
               <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400"><Mail size={22} /></div>
               <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Electronic Mail</p>
                  <p className="text-sm font-black text-gray-800">{user.email || 'N/A'}</p>
               </div>
            </div>
            <div className="flex items-center gap-5 p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
               <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400"><Phone size={22} /></div>
               <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Mobile Interface</p>
                  <p className="text-sm font-black text-gray-800">{user.mobile || 'No Mobile'}</p>
               </div>
            </div>
         </div>

         <div className="space-y-6 pt-4 border-t border-gray-50">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-4">Vault Activity history</h3>
            <div className="space-y-4">
               {activity.length > 0 ? activity.map((act) => (
                  <div key={act.id} className="flex items-center justify-between p-5 bg-white border border-gray-50 rounded-[1.5rem] shadow-sm active:scale-[0.98] transition-all">
                     <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 border-white shadow-sm transition-transform ${
                           act.type === 'Purchase' ? 'bg-[#fce4ec] text-[#f42464]' :
                           act.type === 'Win' ? 'bg-emerald-50 text-emerald-600' :
                           'bg-blue-50 text-blue-600'
                        }`}>
                           {act.type === 'Purchase' ? <Ticket size={20} /> :
                            act.type === 'Win' ? <Activity size={20} /> :
                            <Wallet size={20} />}
                        </div>
                        <div>
                           <h4 className="text-[11px] font-black text-gray-800 uppercase tracking-tight">{act.desc}</h4>
                           <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{act.date}</p>
                        </div>
                     </div>
                     <span className={`text-sm font-black italic tracking-tighter ${act.amount.startsWith('-') ? 'text-red-500' : 'text-emerald-500'}`}>
                        {act.amount}
                     </span>
                  </div>
               )) : (
                 <p className="text-center py-10 text-[9px] font-black uppercase text-gray-300 italic">No Activity Logged</p>
               )}
            </div>
         </div>
      </div>

      {/* Global Actions */}
      <div className="flex gap-4">
         <button className="flex-1 bg-white border-2 border-[#ff004d]/20 text-[#ff004d] py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest active:bg-[#fce4ec] shadow-xl shadow-red-500/5 transition-all">
            Restrict Entity
         </button>
         <button className="flex-1 bg-gray-900 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 shadow-xl shadow-black/10 transition-all flex items-center justify-center gap-2">
            Edit Profile <Edit size={16} className="text-[#f42464]" />
         </button>
      </div>
      
      <div className="pt-10 text-center opacity-30">
         <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic">Full Trace Audit Record #{user.id.slice(0, 6)}</p>
      </div>
    </div>
  );
};

export default AdminUserDetails;

