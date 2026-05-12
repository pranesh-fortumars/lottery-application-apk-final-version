import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { Wallet, ShieldCheck, ArrowUpRight, CheckCircle2, XCircle, AlertTriangle, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const WithdrawPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, success, error

  const winnings = user?.winningBalance || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const withdrawAmt = parseFloat(amount);

    if (isNaN(withdrawAmt) || withdrawAmt <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    if (withdrawAmt > winnings) {
      alert("Insufficient Winning Balance! You can only withdraw your lottery winnings.");
      return;
    }

    if (!upiId.trim()) {
      alert("Please enter your UPI ID for the payout.");
      return;
    }

    setIsProcessing(true);
    try {
      await addDoc(collection(db, 'withdrawals'), {
        userId: user.uid,
        userName: user.name || 'Unknown',
        userMobile: user.mobile || 'No Mobile',
        amount: withdrawAmt,
        upiId: upiId.trim(),
        status: 'pending',
        timestamp: serverTimestamp()
      });

      setStatus('success');
      setTimeout(() => navigate('/profile'), 3000);
    } catch (error) {
      console.error("Withdrawal error:", error);
      alert("Request failed. Please try again later.");
      setIsProcessing(false);
    }
  };

  if (status === 'success') {
    return (
      <PageWrapper title="REQUEST SENT">
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
          <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-emerald-100 shadow-xl shadow-emerald-500/10">
            <CheckCircle2 size={48} className="text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900 leading-none">Request Received</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-4 max-w-[240px] leading-relaxed">
            Your withdrawal of <span className="text-[#ff0033]">₹{amount}</span> has been sent for authority approval.
          </p>
          <button 
            onClick={() => navigate('/profile')}
            className="mt-12 w-full max-w-xs h-16 bg-gray-950 text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-2xl"
          >
            Back to Wallet
          </button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="WITHDRAW FUNDS" showBack={true}>
      <div className="bg-white min-h-screen p-6 flex flex-col items-center">
        {/* Balance Card */}
        <div className="w-full max-w-sm bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden mb-10 group">
           <div className="absolute top-0 right-0 p-6 opacity-10 bg-white rounded-bl-[2.5rem] group-hover:scale-110 transition-transform">
              <Zap size={48} />
           </div>
           <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-2">Withdrawable Winnings</p>
           <h3 className="text-4xl font-black italic tracking-tighter">₹ {winnings.toLocaleString()}</h3>
           
           <div className="mt-8 flex gap-4 pt-6 border-t border-white/10">
              <div className="flex-1 opacity-60">
                 <p className="text-[8px] font-black uppercase tracking-widest leading-none mb-1">Status</p>
                 <p className="text-[10px] font-bold italic uppercase tracking-tighter shadow-sm border border-white/10 rounded px-2 py-0.5 inline-block text-white bg-emerald-700/50">Unlocked for Payout</p>
              </div>
           </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
           <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Withdrawal Amount</label>
                <div className="relative mt-2">
                   <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-xl italic">₹</div>
                   <input 
                     required
                     type="number" 
                     value={amount}
                     onChange={(e) => setAmount(e.target.value)}
                     className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-6 font-black text-gray-900 text-lg outline-none focus:bg-white focus:border-emerald-500/30 transition-all shadow-inner"
                     placeholder="0.00"
                   />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Your Payout UPI ID</label>
                <input 
                  required
                  type="text" 
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full h-16 mt-2 bg-gray-50 border border-gray-100 rounded-2xl px-6 font-bold text-gray-800 text-sm outline-none focus:bg-white focus:border-emerald-500/30 transition-all shadow-inner"
                  placeholder="e.g. user@okaxis"
                />
              </div>
           </div>

           {/* Warnings */}
           <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 flex items-start gap-4">
              <AlertTriangle className="text-amber-500 shrink-0" size={20} />
              <div>
                 <p className="text-[9px] text-amber-800 font-black uppercase tracking-widest mb-1">Standard Restriction</p>
                 <p className="text-[10px] text-amber-900/60 font-bold leading-relaxed italic">
                    Deposited funds are reserved for ticket purchases only. You can only request payouts for winnings earned from lottery results.
                 </p>
              </div>
           </div>

           <button 
             type="submit"
             disabled={isProcessing || winnings <= 0}
             className="w-full h-16 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
           >
             {isProcessing ? 'PROCESSING...' : 'Authorize Withdrawal'} <ArrowUpRight size={18} />
           </button>
        </form>

        <div className="mt-12 text-center opacity-30">
           <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em] italic leading-tight">Secured Financial Authority Protocol v2.1</p>
        </div>
      </div>
    </PageWrapper>
  );
};

export default WithdrawPage;
