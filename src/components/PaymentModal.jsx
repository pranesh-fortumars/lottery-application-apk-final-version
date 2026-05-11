import React from 'react';
import { usePayment } from '../context/PaymentContext';
import { X, Copy, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PaymentModal = ({ isOpen, onClose, amount, onConfirm }) => {
  const { activePayment } = usePayment();
  const [copied, setCopied] = React.useState(false);
  const [showInput, setShowInput] = React.useState(false);
  const [transactionId, setTransactionId] = React.useState('');
  const [userUpiId, setUserUpiId] = React.useState('');

  const handleCopy = () => {
    if (activePayment?.upiId) {
      navigator.clipboard.writeText(activePayment.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen || !activePayment) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-sm bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="bg-[#ff0033] p-6 text-white relative">
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-2">
              <QrCode size={24} />
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Payment Required</h3>
            </div>
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em]">Amount to Pay: ₹{amount}</p>
          </div>

          <div className="p-8 space-y-6">
            {/* QR Code */}
            <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
               <div className="relative p-2 bg-white rounded-2xl shadow-lg mb-4">
                  <img src={activePayment.qrUrl} alt="UPI QR Code" className="w-48 h-48" />
                  <div className="absolute inset-0 border-4 border-gray-50/50 rounded-2xl pointer-events-none"></div>
               </div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Scan QR with any UPI App</p>
            </div>

            {/* UPI ID */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Transfer to UPI ID</label>
              <div className="flex gap-2">
                <div className="flex-grow bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 flex items-center justify-between group">
                  <span className="font-black text-gray-800 text-sm truncate">{activePayment.upiId}</span>
                  <button 
                    onClick={handleCopy}
                    className="p-2 hover:bg-white rounded-xl transition-colors text-[#ff0033]"
                  >
                    {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
              <p className="text-[9px] text-[#ff0033] font-black uppercase italic">{activePayment.bankName}</p>
            </div>

            {/* Summary */}
            <div className="bg-emerald-50 p-4 rounded-2xl flex items-start gap-3 border border-emerald-100">
               <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
               <p className="text-[10px] text-emerald-800 font-bold leading-relaxed">
                  After payment, click "I HAVE PAID" below to confirm. Our admin will verify your transaction manually.
               </p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 gap-3">
              {!showInput ? (
                <>
                  <a 
                    href={`upi://pay?pa=${activePayment.upiId}&pn=Admin&am=${amount}&cu=INR`}
                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                  >
                    Open UPI App
                  </a>
                  <button 
                    onClick={() => setShowInput(true)}
                    className="w-full bg-[#ff0033] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/20 active:scale-95 transition-all"
                  >
                    I Have Paid
                  </button>
                  <button 
                    onClick={() => { setShowInput(false); onClose(); }}
                    className="w-full bg-gray-100 text-gray-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Your UPI ID (From which you paid)</label>
                      <input 
                        type="text" 
                        value={userUpiId}
                        onChange={(e) => setUserUpiId(e.target.value)}
                        placeholder="e.g. user@okaxis"
                        className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#ff0033] focus:ring-1 focus:ring-[#ff0033]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Enter Transaction ID / UTR</label>
                      <input 
                        type="text" 
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="e.g. 123456789012"
                        className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#ff0033] focus:ring-1 focus:ring-[#ff0033]"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (!userUpiId.trim()) return alert("Please enter your UPI ID");
                      if (!transactionId.trim()) return alert("Please enter Transaction ID");
                      onConfirm(transactionId, userUpiId);
                      setShowInput(false);
                      setTransactionId('');
                      setUserUpiId('');
                    }}
                    className="w-full bg-[#ff0033] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/20 active:scale-95 transition-all"
                  >
                    Submit Transaction
                  </button>
                  <button 
                    onClick={() => setShowInput(false)}
                    className="w-full bg-gray-100 text-gray-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
                  >
                    Back
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaymentModal;
