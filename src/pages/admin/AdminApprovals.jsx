import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, writeBatch, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { CheckCircle2, XCircle, Clock, ShieldAlert, BadgeCheck } from 'lucide-react';

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

      if (tx.type === 'topup') {
        const userRef = doc(db, 'users', tx.userId);
        batch.update(userRef, { balance: increment(tx.amount) });
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
            paidVia: 'UPI',
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
      await updateDoc(doc(db, 'pending_transactions', tx.id), {
        status: 'rejected',
        rejectedAt: serverTimestamp()
      });
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
                    </div>
                    <p className="text-lg font-black text-gray-900 leading-none mt-2">{tx.userName}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">ID: {tx.userId}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-2xl font-black text-[#ff0033] tracking-tighter italic">₹{tx.amount}</p>
                 </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-2xl flex items-center justify-between border-dashed border-2 border-gray-200">
                 <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Transaction ID provided</p>
                    <p className="text-sm font-black text-gray-800 tracking-tight italic select-all">{tx.transactionId}</p>
                 </div>
                 <Clock className="text-gray-400" size={20} />
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