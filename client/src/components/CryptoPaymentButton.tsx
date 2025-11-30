import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bitcoin, ExternalLink, CheckCircle2, XCircle, Clock } from "lucide-react";

interface CryptoPaymentButtonProps {
  invoiceId: string;
  invoiceNumber?: string;
  amount: string;
  onPaymentComplete?: () => void;
  className?: string;
}

interface CryptoStatus {
  enabled: boolean;
  provider: string;
  supportedCurrencies: string[];
}

interface PaymentResult {
  chargeCode: string;
  hostedUrl: string;
  expiresAt: string;
  addresses: Record<string, string>;
}

export function CryptoPaymentButton({ 
  invoiceId, 
  invoiceNumber, 
  amount, 
  onPaymentComplete,
  className 
}: CryptoPaymentButtonProps) {
  const [cryptoEnabled, setCryptoEnabled] = useState(false);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [payment, setPayment] = useState<PaymentResult | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/crypto/status")
      .then(res => res.json())
      .then((data: CryptoStatus) => {
        setCryptoEnabled(data.enabled);
        setCurrencies(data.supportedCurrencies || []);
      })
      .catch(() => setCryptoEnabled(false));
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (payment && paymentStatus === "pending") {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/invoices/${invoiceId}/crypto-status`);
          const data = await res.json();
          if (data.status === "completed") {
            setPaymentStatus("completed");
            toast({
              title: "Payment Received!",
              description: `Your crypto payment has been confirmed. Thank you!`,
            });
            onPaymentComplete?.();
            clearInterval(interval);
          } else if (data.status === "expired" || data.status === "failed") {
            setPaymentStatus(data.status);
            clearInterval(interval);
          }
        } catch (e) {
          console.error("Status check failed:", e);
        }
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [payment, paymentStatus, invoiceId, onPaymentComplete, toast]);

  const handlePayWithCrypto = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pay-crypto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnUrl: window.location.href,
          cancelUrl: window.location.href,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create payment");
      }

      const data: PaymentResult = await res.json();
      setPayment(data);
      setPaymentStatus("pending");
      setShowDialog(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: error.message || "Could not initiate crypto payment",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!cryptoEnabled) {
    return null;
  }

  return (
    <>
      <Button
        onClick={handlePayWithCrypto}
        disabled={loading}
        variant="outline"
        className={`gap-2 border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 ${className}`}
        data-testid="button-pay-crypto"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Bitcoin className="h-4 w-4" />
        )}
        Pay with Crypto
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Bitcoin className="h-5 w-5 text-orange-400" />
              Crypto Payment
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Invoice {invoiceNumber || invoiceId} - ${amount} USD
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {paymentStatus === "completed" ? (
              <div className="text-center py-6">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Payment Confirmed!</h3>
                <p className="text-gray-400">Your payment has been received and confirmed on the blockchain.</p>
              </div>
            ) : paymentStatus === "expired" || paymentStatus === "failed" ? (
              <div className="text-center py-6">
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Payment {paymentStatus === "expired" ? "Expired" : "Failed"}</h3>
                <p className="text-gray-400">Please try again with a new payment.</p>
                <Button 
                  onClick={() => { setPayment(null); setPaymentStatus(null); handlePayWithCrypto(); }}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <span className="text-yellow-400 text-sm">Waiting for payment confirmation...</span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Supported currencies:</p>
                  <div className="flex flex-wrap gap-2">
                    {currencies.map(currency => (
                      <Badge key={currency} variant="secondary" className="bg-gray-800">
                        {currency}
                      </Badge>
                    ))}
                  </div>
                </div>

                {payment?.hostedUrl && (
                  <Button
                    onClick={() => window.open(payment.hostedUrl, "_blank")}
                    className="w-full gap-2 bg-orange-500 hover:bg-orange-600"
                    data-testid="button-open-coinbase"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Complete Payment on Coinbase
                  </Button>
                )}

                <p className="text-xs text-gray-500 text-center">
                  You'll be redirected to Coinbase Commerce to complete your payment securely. 
                  This page will update automatically when payment is confirmed.
                </p>

                <div className="border-t border-gray-700 pt-4">
                  <p className="text-xs text-gray-500">
                    <strong className="text-gray-400">Important:</strong> Cryptocurrency payments are 
                    converted to USD at the time of payment. The amount you pay in crypto will be based 
                    on current market rates.
                  </p>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
