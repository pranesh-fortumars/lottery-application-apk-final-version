import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, writeBatch, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { CheckCircle2, XCircle, Clock, ShieldAlert, BadgeCheck, Phone } from 'lucide-react';

const AdminApprovals = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'pending_transactions'),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort by timestamp desc locally because query index without orderby might be easier
      txs.sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0));
      setTransactions(txs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (tx) => {
    if (!window.confirm(`Approve this ${tx.type} for ₹${tx.amount}?`)) return;

    try {
      const batch = writeBatch(db);
      const txRef = doc(db, 'pending_transactions', tx.id);
      
      batch.update(txRef, { status: 'approved', approvedAt: serverTimestamp() });

      // Create Notification for User
      const notifRef = doc(collection(db, 'notifications'));
      batch.set(notifRef, {
        userId: tx.userId,
        title: 'Payment Approved',
        message: `Your ${tx.type} of ₹${tx.amount} has been verified and confirmed.`,
        type: 'success',
        read: false,
        timestamp: serverTimestamp()
      });

      if (tx.type === 'topup') {
        const userRef = doc(db, 'users', tx.userId);
        batch.update(userRef, { 
          depositedBalance: increment(tx.amount),
          balance: increment(tx.amount) 
        });
      } else if (tx.type === 'purchase' && tx.cartItems) {
        const now = new Date();
        const purchaseDate = now.toISOString().split('T')[0];
        const purchaseTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        // Add tickets
        tx.cartItems.forEach(item => {
          const ticketRef = doc(collection(db, 'tickets'));
          batch.set(ticketRef, {
            ...item,
            userId: tx.userId,
            userName: tx.userName,
            purchaseId: tx.purchaseId,
            purchaseDate: purchaseDate,
            purchaseTime: purchaseTime,
            status: 'Active',
            paidVia: tx.paymentType || 'UPI',
            prize: '-',
            timestamp: serverTimestamp()
          });
        });
      }

      await batch.commit();
      alert(`Transaction approved!`);
    } catch (error) {
      console.error("Approval error:", error);
      alert("Failed to approve transaction.");
    }
  };

  const handleReject = async (tx) => {
    if (!window.confirm("Reject this transaction?")) return;

    try {
      const batch = writeBatch(db);
      const txRef = doc(db, 'pending_transactions', tx.id);
      
      batch.update(txRef, {
        status: 'rejected',
        rejectedAt: serverTimestamp()
      });

      // For Referral Bonus, we MUST refund the balance on rejection
      if (tx.type === 'purchase' && tx.paymentType === 'Referral Bonus') {
        const userRef = doc(db, 'users', tx.userId);
        batch.update(userRef, { 
          bonusBalance: increment(tx.amount),
          balance: increment(tx.amount)
        });
      }

      // Create Notification for User
      const notifRef = doc(collection(db, 'notifications'));
      batch.set(notifRef, {
        userId: tx.userId,
        title: 'Payment Rejected',
        message: `Your ${tx.type} of ₹${tx.amount} was rejected. ${tx.paymentType === 'Referral Bonus' ? 'Your bonus balance has been refunded.' : 'Please contact support if you believe this is an error.'}`,
        type: 'error',
        read: false,
        timestamp: serverTimestamp()
      });

      await batch.commit();
      alert("Transaction rejected.");
    } catch (error) {
      console.error("Rejection error:", error);
      alert("Failed to reject transaction.");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-[10px]">Loading...</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3 mb-6">
         <ShieldAlert className="text-[#ff0033]" size={24} />
         <h2 className="text-xl font-black uppercase tracking-tighter italic text-gray-800">Pending Transactions</h2>
      </div>

      {transactions.length === 0 ? (
         <div className="bg-gray-50 rounded-[2rem] p-10 text-center border border-gray-100 shadow-inner">
            <BadgeCheck className="mx-auto text-emerald-400 mb-4 opacity-50" size={48} />
            <p className="text-[12px] font-black uppercase tracking-widest text-gray-400 italic">No Pending Transactions</p>
         </div>
      ) : (
        <div className="space-y-4">
          {transactions.map(tx => (
            <div key={tx.id} className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                 <div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Type: </span>
                       <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${tx.type === 'topup' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{tx.type}</span>
                       {tx.paymentType && (
                         <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${tx.paymentType === 'Referral Bonus' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{tx.paymentType === 'Referral Bonus' ? 'Ref' : tx.paymentType}</span>
                       )}
                    </div>
                    <p className="text-lg font-black text-gray-900 leading-none mt-2">{tx.userName}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <Phone size={10} className="text-gray-400" />
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{tx.userMobile || 'No Mobile'}</p>
                    </div>
                    <p className="text-[8px] text-gray-300 font-bold uppercase tracking-widest mt-0.5">ID: {tx.userId.slice(0, 8)}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-2xl font-black text-[#ff0033] tracking-tighter italic">₹{tx.amount}</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-gray-50 p-3 rounded-2xl flex flex-col border-dashed border-2 border-gray-200">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Transaction ID / UTR</p>
                    <p className="text-sm font-black text-gray-800 tracking-tight italic select-all">{tx.transactionId}</p>
                 </div>
                 <div className="bg-red-50/50 p-3 rounded-2xl flex flex-col border-dashed border-2 border-red-100">
                    <p className="text-[8px] font-black text-red-400 uppercase tracking-[0.2em]">Sender UPI ID</p>
                    <p className="text-sm font-black text-red-600 tracking-tight italic select-all">{tx.userUpiId || 'Not Provided'}</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                <button 
                  onClick={() => handleApprove(tx)}
                  className="bg-emerald-500 text-white p-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md flex justify-center items-center gap-2 active:scale-95 transition-transform"
                >
                  <CheckCircle2 size={16} /> Approve
                </button>
                <button 
                  onClick={() => handleReject(tx)}
                  className="bg-gray-100 text-gray-500 p-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex justify-center items-center gap-2 hover:bg-red-50 hover:text-red-500 transition-colors active:scale-95"
                >
                  <XCircle size={16} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminApprovals;