import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Mail, CheckCircle2, RefreshCw } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

interface VerifyEmailModalProps {
  open: boolean;
  onClose: () => void;
  email: string;
  onSuccess?: () => void;
}

export const VerifyEmailModal = ({
  open,
  onClose,
  email,
  onSuccess,
}: VerifyEmailModalProps) => {
  const { verifyEmail, resendVerification } = useAuthStore();
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval: any;
    if (open) {
      setTimer(60);
      setCanResend(false);
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [open]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) return;
    try {
      setIsSubmitting(true);
      await verifyEmail(email, otp.trim());
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      await resendVerification(email);
      setTimer(60);
      setCanResend(false);
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {}
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] rounded-2xl border border-border/40 bg-background p-6">
        <DialogHeader className="text-center flex flex-col items-center">
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
            <Mail className="size-6" />
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            Xác thực Email
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Mã OTP xác thực 6 chữ số đã được gửi đến: <br />
            <strong className="text-foreground">{email}</strong>
          </p>
        </DialogHeader>

        <form onSubmit={handleVerify} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="text-center text-2xl font-bold tracking-[8px] h-12 bg-muted/50 border-border/40 focus:border-primary"
              autoFocus
            />
          </div>

          <Button
            type="submit"
            className="w-full font-bold h-11"
            disabled={isSubmitting || otp.length !== 6}
          >
            {isSubmitting ? (
              "Đang xác thực..."
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 className="size-4" />
                Xác thực tài khoản
              </span>
            )}
          </Button>

          <div className="text-center text-xs text-muted-foreground pt-2">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="text-primary font-bold hover:underline inline-flex items-center gap-1"
              >
                <RefreshCw className="size-3" />
                Gửi lại mã OTP
              </button>
            ) : (
              <span>Gửi lại mã sau <strong>{timer}s</strong></span>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
