import { motion } from 'framer-motion';
import { User, Mail, AtSign, Wallet, Shield, MapPin, Calendar, Zap, QrCode } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { QRCodeSVG } from 'qrcode.react';

export default function ProfilePage() {
    const { user } = useAuth();

    if (!user) return null;

    const upiUri = `upi://pay?pa=${user.upiId}&pn=${encodeURIComponent(user.name)}&cu=INR`;

    const profileItems = [
        { icon: User, label: 'Full Name', value: user.name },
        { icon: Mail, label: 'Email Address', value: user.email },
        { icon: AtSign, label: 'UPI ID', value: user.upiId, highlight: true },
        { icon: Wallet, label: 'Wallet Balance', value: `₹${user.walletBalance.toLocaleString()}` },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-6"
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card overflow-hidden">
                    {/* Profile Header */}
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                        <div className="absolute -bottom-12 left-8">
                            <div className="w-24 h-24 rounded-2xl bg-card border-4 border-background flex items-center justify-center text-3xl font-bold text-primary shadow-xl">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 pb-8 px-8">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
                                <p className="text-muted-foreground">{user.upiId}</p>
                            </div>
                            <button className="px-4 py-2 rounded-xl bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
                                Edit Profile
                            </button>
                        </div>

                        <div className="grid gap-4">
                            {profileItems.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-border/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{item.label}</p>
                                            <p className={`text-base font-medium ${item.highlight ? 'text-primary' : 'text-foreground'}`}>
                                                {item.value}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* QR Code Card */}
                <div className="glass-card p-8 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="p-4 bg-white rounded-3xl shadow-inner">
                        <QRCodeSVG
                            value={upiUri}
                            size={200}
                            level="H"
                            includeMargin={true}
                            imageSettings={{
                                src: "/favicon.ico", // Or any logo
                                x: undefined,
                                y: undefined,
                                height: 40,
                                width: 40,
                                excavate: true,
                            }}
                        />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-1 flex items-center justify-center gap-2">
                            <QrCode className="h-5 w-5 text-primary" />
                            Your QR Code
                        </h3>
                        <p className="text-sm text-muted-foreground">Scan this to receive money</p>
                    </div>
                    <div className="w-full pt-4 border-t border-border/50">
                        <p className="text-xs font-mono bg-secondary/50 p-2 rounded-lg break-all">
                            {user.upiId}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                            <Shield className="h-4 w-4" />
                        </div>
                        <h3 className="font-semibold">Security</h3>
                    </div>
                    <div className="space-y-2">
                        <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-secondary text-sm transition-colors">
                            Change Password
                        </button>
                        <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-secondary text-sm transition-colors">
                            Two-Factor Authentication
                        </button>
                    </div>
                </div>

                <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                            <Zap className="h-4 w-4" />
                        </div>
                        <h3 className="font-semibold">Preferences</h3>
                    </div>
                    <div className="space-y-2">
                        <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-secondary text-sm transition-colors">
                            Notification Settings
                        </button>
                        <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-secondary text-sm transition-colors">
                            Privacy Mode
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
