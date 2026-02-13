
import React, { useState } from 'react';

interface CheckoutModalProps {
  plan: { name: string; price: string };
  onClose: () => void;
  onSuccess: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ plan, onClose, onSuccess }) => {
  const [processing, setProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      onSuccess();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fadeIn">
        <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-black text-slate-900">Secure Checkout</h3>
            <p className="text-xs text-slate-500 font-medium">Plan: {plan.name}</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-indigo-600">${plan.price}</span>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Due Today</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cardholder Name</label>
            <input required type="text" placeholder="Awais Rao" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 outline-none" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Card Number</label>
            <div className="relative">
              <input required type="text" placeholder="0000 0000 0000 0000" className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 outline-none" />
              <i className="fas fa-credit-card absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiry</label>
              <input required type="text" placeholder="MM/YY" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CVC</label>
              <input required type="text" placeholder="123" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 outline-none" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={processing}
            className={`w-full py-4 rounded-xl text-white font-black uppercase tracking-widest shadow-lg transition-all ${
              processing ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
            }`}
          >
            {processing ? (
              <div className="flex items-center justify-center gap-2">
                <i className="fas fa-circle-notch animate-spin"></i>
                <span>Verifying...</span>
              </div>
            ) : (
              `Pay $${plan.price}`
            )}
          </button>
          
          <p className="text-[9px] text-center text-slate-400 leading-relaxed">
            By clicking "Pay", you authorize Awais Blog Architect to charge your card. 
            All payments are non-refundable and processed via Stripe.
          </p>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;
