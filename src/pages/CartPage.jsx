import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { ShoppingCart, Trash2, CreditCard, ChevronLeft, QrCode } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { usePayment } from '../context/PaymentContext';
import PaymentModal from '../components/PaymentModal';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, clearCart, cartTotal, confirmPurchase } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const { activePayment } = usePayment();

  const handlePay = () => {
    if (cart.length === 0) return;
    setShowPayment(true);
  };

  const handlePaymentConfirm = async (transactionId, userUpiId) => {
    setShowPayment(false);
    setIsProcessing(true);
    
    try {
      await confirmPurchase(true, transactionId, userUpiId); 
      navigate('/home'); 
    } catch (error) {
      console.error("Purchase error:", error);
      alert("Failed to record payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-GB');

  // --- Fixed Footer Actions for Cart ---
  const cartFooter = (
    <div className="w-full flex gap-3">
      <button 
        onClick={handlePay}
        disabled={isProcessing || cart.length === 0}
        className="flex-1 bg-[#ff0033] text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-sm shadow-[0_15px_30px_-5px_rgba(255,0,85,0.4)] active:scale-95 transition-all disabled:opacity-50 border-b-4 border-black/10"
      >
        <ShoppingCart size={20} fill="white" /> {isProcessing ? 'Waiting...' : 'Confirm Pay'}
      </button>
      
      <button 
        onClick={clearCart}
        className="px-6 bg-gray-900 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-sm shadow-xl active:scale-95 transition-all border-b-4 border-black/10"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );

  return (
    <PageWrapper title="SHOPPING CART" footerAction={cartFooter}>
      <div className="bg-white flex flex-col items-center">
        {/* Header Bar */}
        <div className="w-full max-w-sm bg-[#ff0033] text-white py-3 mt-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg mb-8 shadow-[#ff0033]/20">
           <ShoppingCart size={24} fill="white" />
           <span className="text-xl font-black uppercase tracking-tight font-serif">Your Cart</span>
        </div>

        {/* Cart Table */}
        <div className="w-full max-w-sm mb-8 overflow-hidden px-1">
          <table className="w-full border-collapse border border-red-600 text-left text-sm font-serif">
            <tbody>
              {/* Row 1: Name and Date */}
              <tr className="border border-red-600">
                <td colSpan={3} className="p-2 border-r border-red-600 font-bold">Name: {user?.name || 'Guest'}</td>
                <td colSpan={2} className="p-2 text-right font-bold italic">Date: {currentDate}</td>
              </tr>
              
              {/* Row 2: Headers */}
              <tr className="border border-red-600 bg-gray-50/50">
                <td className="p-2 border-r border-red-600 font-bold">Lot Details</td>
                <td className="p-2 border-r border-red-600 font-bold text-center">Number</td>
                <td className="p-2 border-r border-red-600 font-bold text-center">Unit</td>
                <td className="p-2 border-r border-red-600 font-bold text-center">₹</td>
                <td className="p-2 font-bold text-right">Amount ₹</td>
              </tr>

              {/* Data Rows */}
              {cart.map((item) => (
                <tr key={item.id} className="border border-red-600">
                  <td className="p-2 border-r border-red-600">
                    <div className="flex flex-col">
                      <span className="font-bold text-[10px] leading-tight uppercase">{item.title}</span>
                      {item.board && <span className="text-[8px] text-red-500 font-black">Board: {item.board}</span>}
                    </div>
                  </td>
                  <td className="p-2 border-r border-red-600 text-center font-black">{item.num}</td>
                  <td className="p-2 border-r border-red-600 text-center">{item.qty}</td>
                  <td className="p-2 border-r border-red-600 text-center">{item.price}</td>
                  <td className="p-2 text-right font-black">{(item.price * item.qty).toFixed(2)}</td>
                </tr>
              ))}

              {cart.length === 0 && (
                <tr className="border border-red-600">
                  <td colSpan={5} className="p-10 text-center text-gray-300 italic">No tickets in cart</td>
                </tr>
              )}

              {/* Total Amount Row */}
              <tr className="border border-red-600 bg-gray-50 font-black">
                <td colSpan={4} className="p-2 border-r border-red-600 text-center uppercase tracking-widest text-[10px]">Grand Total:</td>
                <td className="p-2 text-right text-lg">{cartTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          
          <div className="border-x border-b border-red-600 p-2 bg-white mb-4">
             <p className="text-[10px] font-bold text-gray-800 leading-tight italic">
               ** Some items are removed automatically if draw time expires.
             </p>
          </div>

          {/* Active Payment Method Info */}
          {activePayment && (
            <div className="bg-gradient-to-r from-red-50 to-white border-2 border-red-600/20 rounded-2xl p-4 flex items-center justify-between mb-6 shadow-sm">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#ff0033] rounded-xl flex items-center justify-center shadow-lg">
                     <QrCode size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Active UPI for Purchase</p>
                    <p className="text-xs font-black text-gray-800 italic uppercase">{activePayment.upiId}</p>
                  </div>
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-[8px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">Verified</span>
               </div>
            </div>
          )}
        </div>

        <button 
          onClick={() => navigate('/home')} 
          className="mt-6 mb-10 flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-red-500 transition-colors"
        >
          <ChevronLeft size={14} /> Add more tickets
        </button>
      </div>

      <PaymentModal 
        isOpen={showPayment} 
        onClose={() => setShowPayment(false)} 
        amount={cartTotal.toFixed(2)}
        onConfirm={handlePaymentConfirm}
      />
    </PageWrapper>
  );
};

export default CartPage;
