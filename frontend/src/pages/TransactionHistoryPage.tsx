import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Clock, AlertCircle } from 'lucide-react';
import { SkeletonRow } from '@/components/Skeletons';
import { apiFetch, API_ENDPOINTS } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Transaction {
  id: string;
  receiver: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  date: string;
}

type FilterType = 'all' | 'success' | 'failed';

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const auth = useAuth();

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const txRes: any[] = await apiFetch(API_ENDPOINTS.wallet.history);

        const currentUserId = auth.user?.id;

        const mapped = txRes.map((tx: any) => {
          const isSender = tx.sender && (tx.sender._id === currentUserId || tx.sender === currentUserId);
          let tstatus: Transaction['status'] = tx.status === 'SUCCESS' ? 'success' : 'failed';
          let tdate = new Date(tx.createdAt || tx.updatedAt || Date.now()).toLocaleDateString();
          let receiverName = tx.receiver && (tx.receiver.name || tx.receiver.upiId) || 'Unknown';
          let ttype: Transaction['type'] = 'debit';
          if (tx.type === 'ADD' || tx.type === 'RECEIVE') ttype = 'credit';
          if (tx.type === 'SEND') ttype = isSender ? 'debit' : 'credit';

          return {
            id: tx.txId || tx._id,
            receiver: receiverName,
            amount: tx.amount,
            status: tstatus,
            date: tdate,
          };
        });

        setTransactions(mapped);
      } catch {
        setError('Failed to load transactions. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    const auth = { user: undefined } as any;
    // try to get user from context; dynamic import to avoid top-level change
    try { /* noop */ } catch {}
    // use current auth if available
    // fetch regardless; apiFetch will redirect to login on 401
    fetchTransactions();
  }, []);

  const filtered = useMemo(() => {
    let result = transactions;
    if (filter !== 'all') result = result.filter(t => t.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t => t.receiver.toLowerCase().includes(q) || t.id.toLowerCase().includes(q));
    }
    return result;
  }, [transactions, filter, search]);

  const filters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Success', value: 'success' },
    { label: 'Failed', value: 'failed' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-enter space-y-4">
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Transaction History</h2>
            <p className="text-xs text-muted-foreground">View all your past transactions</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex gap-2">
            {filters.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  filter === f.value
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 input-glow border border-border text-sm"
              placeholder="Search by name or ID..."
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12 space-y-3">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <p className="text-sm text-destructive font-medium">{error}</p>
            <button onClick={() => window.location.reload()} className="text-xs text-primary hover:underline">Retry</button>
          </div>
        )}

        {/* Table */}
        {!error && (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Transaction ID</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Receiver</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={5}><SkeletonRow /></td></tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-muted-foreground">
                      <Clock className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <p>No transactions found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((tx, i) => (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tx.id}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{tx.receiver}</td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">₹{tx.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={tx.status === 'success' ? 'badge-success' : tx.status === 'failed' ? 'badge-failed' : 'badge-pending'}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground text-xs">{tx.date}</td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
