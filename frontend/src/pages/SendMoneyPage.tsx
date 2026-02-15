import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, CheckCircle, XCircle, User, AtSign, IndianRupee } from 'lucide-react';
import { ToastNotification } from '@/components/ToastNotification';
import { apiFetch, API_ENDPOINTS } from '@/lib/api';

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function SendMoneyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [receiverName, setReceiverName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');

  // Load from URL if present (for QR scanning)
  useEffect(() => {
    const upi = searchParams.get('upi');
    const name = searchParams.get('name');
    if (upi) setUpiId(upi);
    if (name) setReceiverName(name);
  }, [searchParams]);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!receiverName.trim()) e.receiverName = 'Receiver name is required';
    if (!upiId.trim()) e.upiId = 'UPI ID is required';
    else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z]+$/.test(upiId)) e.upiId = 'Invalid UPI ID format (e.g. name@bank)';
    if (!amount || parseFloat(amount) <= 0) e.amount = 'Enter a valid amount';
    else if (parseFloat(amount) > 100000) e.amount = 'Maximum transfer limit is ₹1,00,000';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBackendError(null);
    if (!validate()) return;

    setFormState('loading');

    try {
      await apiFetch(API_ENDPOINTS.wallet.sendMoney, {
        method: 'POST',
        body: JSON.stringify({ receiverUpiId: upiId, amount: parseFloat(amount) }),
      });

      setFormState('success');
      setToast({ message: `₹${parseFloat(amount).toLocaleString()} sent to ${receiverName}!`, type: 'success' });

      // Navigate to dashboard to refresh balance
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      setFormState('error');
      const msg = err instanceof Error ? err.message : 'Transaction failed. Please try again.';
      setBackendError(msg);
      setToast({ message: msg, type: 'error' });
      setTimeout(() => setFormState('idle'), 3000);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-enter max-w-lg mx-auto">
      {toast && (
        <ToastNotification message={toast.message} type={toast.type} isVisible={!!toast} onClose={() => setToast(null)} />
      )}

      <div className="glass-card p-6 md:p-8 relative overflow-hidden">
        {/* Loading overlay */}
        <AnimatePresence>
          {formState === 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl"
              style={{ background: 'hsl(222 47% 6% / 0.8)', backdropFilter: 'blur(4px)' }}
            >
              <div className="text-center space-y-3">
                <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">Processing payment...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success/Error overlay */}
        <AnimatePresence>
          {(formState === 'success' || formState === 'error') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl"
              style={{ background: 'hsl(222 47% 6% / 0.9)', backdropFilter: 'blur(4px)' }}
            >
              <div className="text-center space-y-3">
                {formState === 'success' ? (
                  <>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}>
                      <CheckCircle className="h-16 w-16 text-success mx-auto" />
                    </motion.div>
                    <p className="text-lg font-semibold text-foreground">Payment Successful!</p>
                  </>
                ) : (
                  <>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}>
                      <XCircle className="h-16 w-16 text-destructive mx-auto" />
                    </motion.div>
                    <p className="text-lg font-semibold text-foreground">Payment Failed</p>
                    <p className="text-sm text-muted-foreground">{backendError}</p>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Send className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Send Money</h2>
            <p className="text-xs text-muted-foreground">Transfer funds instantly via UPI</p>
          </div>
        </div>

        {/* Backend error area */}
        {backendError && formState === 'idle' && (
          <div className="mb-4 p-3 rounded-xl text-sm border" style={{ background: 'hsl(var(--destructive) / 0.1)', borderColor: 'hsl(var(--destructive) / 0.3)', color: 'hsl(var(--destructive))' }}>
            {backendError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Receiver Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={receiverName}
                onChange={(e) => { setReceiverName(e.target.value); setErrors(p => ({ ...p, receiverName: '' })); }}
                className={`w-full pl-10 pr-4 py-3 input-glow border ${errors.receiverName ? 'border-destructive' : 'border-border'}`}
                placeholder="John Doe"
                disabled={formState !== 'idle'}
              />
            </div>
            {errors.receiverName && <p className="text-xs text-destructive">{errors.receiverName}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">UPI ID</label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={upiId}
                onChange={(e) => { setUpiId(e.target.value); setErrors(p => ({ ...p, upiId: '' })); }}
                className={`w-full pl-10 pr-4 py-3 input-glow border ${errors.upiId ? 'border-destructive' : 'border-border'}`}
                placeholder="name@bank"
                disabled={formState !== 'idle'}
              />
            </div>
            {errors.upiId && <p className="text-xs text-destructive">{errors.upiId}</p>}
          </div>

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
                min="1"
                step="0.01"
                disabled={formState !== 'idle'}
              />
            </div>
            {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
          </div>

          <button
            type="submit"
            disabled={formState !== 'idle'}
            className="w-full gradient-btn flex items-center justify-center gap-2 py-3.5"
          >
            {formState === 'loading' ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
            ) : (
              <><Send className="h-4 w-4" /> Send Money</>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
