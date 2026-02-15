import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Loader2, CreditCard, IndianRupee } from 'lucide-react';
import { ToastNotification } from '@/components/ToastNotification';
import { apiFetch, API_ENDPOINTS } from '@/lib/api';

export default function AddMoneyPage() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!amount || parseFloat(amount) <= 0) e.amount = 'Enter a valid amount';
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) e.cardNumber = 'Enter valid card number';
    if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) e.expiry = 'Format: MM/YY';
    if (!cvv || cvv.length < 3) e.cvv = 'Enter valid CVV';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const formatCardNumber = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 16);
    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await apiFetch(API_ENDPOINTS.wallet.addMoney, {
        method: 'POST',
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });
      setToast({ message: `₹${parseFloat(amount).toLocaleString()} added to wallet!`, type: 'success' });
      setAmount('');
      setCardNumber('');
      setExpiry('');
      setCvv('');

      // Navigate to dashboard to refresh and display updated balance
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Failed to add money', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const quickAmounts = [500, 1000, 2000, 5000];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-enter max-w-lg mx-auto">
      {toast && <ToastNotification message={toast.message} type={toast.type} isVisible={!!toast} onClose={() => setToast(null)} />}

      <div className="glass-card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
            <Plus className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Add Money</h2>
            <p className="text-xs text-muted-foreground">Top up your wallet balance</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Amount</label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="number"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setErrors(p => ({ ...p, amount: '' })); }}
                className={`w-full pl-10 pr-4 py-3 input-glow border ${errors.amount ? 'border-destructive' : 'border-border'}`}
                placeholder="0.00"
                disabled={isLoading}
              />
            </div>
            {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
            <div className="flex gap-2 flex-wrap">
              {quickAmounts.map(qa => (
                <button key={qa} type="button" onClick={() => setAmount(String(qa))}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                  ₹{qa.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Card Number */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Card Number</label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={cardNumber}
                onChange={(e) => { setCardNumber(formatCardNumber(e.target.value)); setErrors(p => ({ ...p, cardNumber: '' })); }}
                className={`w-full pl-10 pr-4 py-3 input-glow border font-mono ${errors.cardNumber ? 'border-destructive' : 'border-border'}`}
                placeholder="0000 0000 0000 0000"
                disabled={isLoading}
              />
            </div>
            {errors.cardNumber && <p className="text-xs text-destructive">{errors.cardNumber}</p>}
          </div>

          {/* Expiry + CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Expiry</label>
              <input
                value={expiry}
                onChange={(e) => { setExpiry(formatExpiry(e.target.value)); setErrors(p => ({ ...p, expiry: '' })); }}
                className={`w-full px-4 py-3 input-glow border font-mono ${errors.expiry ? 'border-destructive' : 'border-border'}`}
                placeholder="MM/YY"
                disabled={isLoading}
              />
              {errors.expiry && <p className="text-xs text-destructive">{errors.expiry}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">CVV</label>
              <input
                type="password"
                maxLength={4}
                value={cvv}
                onChange={(e) => { setCvv(e.target.value.replace(/\D/g, '')); setErrors(p => ({ ...p, cvv: '' })); }}
                className={`w-full px-4 py-3 input-glow border font-mono ${errors.cvv ? 'border-destructive' : 'border-border'}`}
                placeholder="•••"
                disabled={isLoading}
              />
              {errors.cvv && <p className="text-xs text-destructive">{errors.cvv}</p>}
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full gradient-btn flex items-center justify-center gap-2 py-3.5">
            {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : <><Plus className="h-4 w-4" /> Add Money</>}
          </button>

          <p className="text-xs text-center text-muted-foreground">Your card details are encrypted and secure</p>
        </form>
      </div>
    </motion.div>
  );
}
