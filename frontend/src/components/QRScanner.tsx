import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Info } from 'lucide-react';

interface QRScannerProps {
    onScan: (data: string) => void;
    onClose: () => void;
    isOpen: boolean;
}

export default function QRScanner({ onScan, onClose, isOpen }: QRScannerProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Small delay to ensure the container is rendered
            const timeout = setTimeout(() => {
                const scanner = new Html5QrcodeScanner(
                    'qr-reader',
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                    },
          /* verbose= */ false
                );

                scanner.render(
                    (decodedText) => {
                        scanner.clear().then(() => {
                            onScan(decodedText);
                        }).catch(e => console.error("Failed to clear scanner", e));
                    },
                    (errorMessage) => {
                        // Soft ignore scanner errors
                    }
                );

                scannerRef.current = scanner;
            }, 300);

            return () => {
                clearTimeout(timeout);
                if (scannerRef.current) {
                    scannerRef.current.clear().catch(e => console.error("Cleanup scan error", e));
                }
            };
        }
    }, [isOpen, onScan]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-background/80 backdrop-blur-md"
                />

                {/* Scanner Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-lg glass-card p-6 md:p-8 space-y-6 overflow-hidden"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Camera className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Scan QR Code</h2>
                                <p className="text-xs text-muted-foreground">Point your camera at a QuantumPay QR</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-secondary transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="relative">
                        <div id="qr-reader" className="overflow-hidden rounded-2xl border-2 border-primary/20 bg-black/20" />

                        <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3 items-start">
                            <Info className="h-5 w-5 text-primary shrink-0" />
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Ensure the QR code is within the frame and has good lighting.
                                We'll automatically extract the UPI details and take you to the payment page.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs text-center">
                            {error}
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
