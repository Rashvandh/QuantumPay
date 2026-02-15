import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Plus, Clock, User, ArrowUpRight, ArrowDownLeft, TrendingUp, Wallet, Camera } from 'lucide-react';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { SkeletonBalance, SkeletonRow } from '@/components/Skeletons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiFetch, API_ENDPOINTS } from '@/lib/api';
import QRScanner from '@/components/QRScanner';

// Placeholder chart data - will come from API
const placeholderChartData = [
  { name: 'Mon', amount: 0 },
  { name: 'Tue', amount: 0 },
  { name: 'Wed', amount: 0 },
  { name: 'Thu', amount: 0 },
  { name: 'Fri', amount: 0 },
  { name: 'Sat', amount: 0 },
  { name: 'Sun', amount: 0 },
];

interface Transaction {
  id: string;
  receiver: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  date: string;
  type: 'debit' | 'credit';
}

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardPage() {
  const navigate = useNavigate();
  // no direct auth import here; we'll rely on profile returned by API
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState(placeholderChartData);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleScan = (data: string) => {
    setIsScannerOpen(false);
    // Parse UPI link: upi://pay?pa=upiid@bank&pn=UserName
    try {
      if (data.startsWith('upi://pay')) {
        const url = new URL(data);
        const pa = url.searchParams.get('pa');
        const pn = url.searchParams.get('pn');
        if (pa) {
          navigate(`/send?upi=${pa}${pn ? `&name=${encodeURIComponent(pn)}` : ''}`);
          return;
        }
      }

      // If it's just a raw UPI ID
      if (data.includes('@')) {
        navigate(`/send?upi=${data}`);
      } else {
        alert("Invalid QR Code. Please scan a valid QuantumPay UPI QR.");
      }
    } catch (e) {
      console.error("Failed to parse QR data", e);
    }
  };

  // Simulate API fetch - replace with actual API calls
  const fetchDashboardData = useCallback(async () => {
    setIsLoadingBalance(true);
    setIsLoadingTransactions(true);

    try {
      // Fetch profile to get current wallet balance and user id
      const profile: any = await apiFetch(API_ENDPOINTS.user.profile);
      setBalance(profile.walletBalance ?? null);

      // Fetch recent transactions
      const txRes: any[] = await apiFetch(API_ENDPOINTS.wallet.history);

      const currentUserId = profile._id;

      const mapped: Transaction[] = txRes.map((tx: any) => {
        const isSender = tx.sender && (tx.sender._id === currentUserId || tx.sender === currentUserId);
        let ttype: Transaction['type'] = 'debit';
        if (tx.type === 'ADD' || tx.type === 'RECEIVE') ttype = 'credit';
        if (tx.type === 'SEND') ttype = isSender ? 'debit' : 'credit';

        const receiverName = tx.receiver && (tx.receiver.name || tx.receiver.upiId) || 'Unknown';

        return {
          id: tx.txId || tx._id,
          receiver: receiverName,
          amount: tx.amount,
          status: tx.status === 'SUCCESS' ? 'success' : 'failed',
          date: new Date(tx.createdAt || tx.updatedAt).toLocaleDateString(),
          type: ttype,
        };
      });

      setTransactions(mapped);

      // Build simple weekly chart aggregation from transactions
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const sums: Record<string, number> = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
      txRes.forEach((tx: any) => {
        const dt = new Date(tx.createdAt || Date.now());
        const day = days[dt.getDay()];
        sums[day] = (sums[day] || 0) + (tx.amount || 0);
      });
      setChartData(days.map(d => ({ name: d, amount: sums[d] || 0 })));
    } catch (err) {
      // API errors handled by apiFetch (redirect if 401). Keep UI resilient.
    } finally {
      setIsLoadingBalance(false);
      setIsLoadingTransactions(false);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const quickActions = [
    { icon: Camera, label: 'Scan & Pay', onClick: () => setIsScannerOpen(true), color: 'from-orange-500 to-orange-600' },
    { icon: Send, label: 'Send Money', onClick: () => navigate('/send'), color: 'from-blue-500 to-blue-600' },
    { icon: Plus, label: 'Add Money', onClick: () => navigate('/add-money'), color: 'from-emerald-500 to-emerald-600' },
    { icon: User, label: 'Profile', onClick: () => navigate('/profile'), color: 'from-amber-500 to-amber-600' },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="page-enter space-y-6">
      <QRScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScan}
      />
      {/* Balance Card */}
      <motion.div variants={fadeUp} className="glass-card p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--gradient-glow)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-medium">Total Balance</span>
          </div>
          {isLoadingBalance ? (
            <SkeletonBalance />
          ) : (
            <div className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
              <AnimatedCounter value={balance ?? 0} />
            </div>
          )}
          <div className="flex items-center gap-1 mt-3 text-success text-sm font-medium">
            <TrendingUp className="h-4 w-4" />
            <span>+12.5% this month</span>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className="glass-card-hover p-4 flex flex-col items-center gap-3 group"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
              <action.icon className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium text-foreground">{action.label}</span>
          </button>
        ))}
      </motion.div>

      {/* Chart & Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Chart */}
        <motion.div variants={fadeUp} className="glass-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Weekly Spending</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(210 100% 56%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(210 100% 56%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(215 20% 55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(222 41% 10%)',
                    border: '1px solid hsl(222 30% 18%)',
                    borderRadius: '12px',
                    color: 'hsl(210 40% 96%)',
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Spent']}
                />
                <Area type="monotone" dataKey="amount" stroke="hsl(210 100% 56%)" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div variants={fadeUp} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Recent Transactions</h3>
            <button onClick={() => navigate('/transactions')} className="text-xs text-primary hover:underline font-medium">View All</button>
          </div>
          <div className="space-y-1">
            {isLoadingTransactions ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No transactions yet</div>
            ) : (
              transactions.slice(0, 4).map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors duration-200">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-success/10' : 'bg-primary/10'}`}>
                    {tx.type === 'credit' ? <ArrowDownLeft className="h-4 w-4 text-success" /> : <ArrowUpRight className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{tx.receiver}</p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${tx.type === 'credit' ? 'text-success' : 'text-foreground'}`}>
                      {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                    </p>
                    <span className={tx.status === 'success' ? 'badge-success' : tx.status === 'failed' ? 'badge-failed' : 'badge-pending'}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
