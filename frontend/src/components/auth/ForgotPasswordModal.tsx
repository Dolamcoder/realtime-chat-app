import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { KeyRound, Mail, ArrowRight, ShieldCheck, CheckCircle } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal = ({
  open,
  onClose,
}: ForgotPasswordModalProps) => {
  const { forgotPassword, resetPassword } = useAuthStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResetState = () => {
    setStep(1);
    setEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setIsSubmitting(false);
  };

  const handleClose = () => {
    handleResetState();
    onClose();
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Vui lòng nhập địa chỉ email hợp lệ");
      return;
    }

    try {
      setIsSubmitting(true);
      await forgotPassword(email.trim());
      setStep(2);
    } catch (err) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      toast.error("Vui lòng nhập mã OTP 6 chữ số");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      toast.error("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không trùng khớp");
      return;
    }

    try {
      setIsSubmitting(true);
      await resetPassword(email.trim(), otp.trim(), newPassword);
      handleClose();
    } catch (err) {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[420px] rounded-2xl border border-border/40 bg-background p-6">
        <DialogHeader className="text-center flex flex-col items-center">
          <div className="size-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-2">
            <KeyRound className="size-6" />
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            {step === 1 ? "Quên mật khẩu?" : "Đặt lại mật khẩu mới"}
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {step === 1
              ? "Nhập địa chỉ email liên kết để nhận mã OTP khôi phục"
              : `Mã OTP đã được gửi tới ${email}`}
          </p>
        </DialogHeader>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground">Địa chỉ Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-muted/50 border-border/40"
                  autoFocus
                />
              </div>
            </div>

            <Button type="submit" className="w-full font-bold h-11" disabled={isSubmitting}>
              {isSubmitting ? (
                "Đang gửi mã OTP..."
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Tiếp tục
                  <ArrowRight className="size-4" />
                </span>
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Mã OTP (6 chữ số)</Label>
              <Input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="text-center text-xl font-bold tracking-[6px] h-10 bg-muted/50 border-border/40"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Mật khẩu mới</Label>
              <Input
                type="password"
                placeholder="Ít nhất 8 ký tự"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-muted/50 border-border/40"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Xác nhận mật khẩu mới</Label>
              <Input
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-muted/50 border-border/40"
              />
            </div>

            <Button type="submit" className="w-full font-bold h-11" disabled={isSubmitting}>
              {isSubmitting ? (
                "Đang xử lý..."
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="size-4" />
                  Đổi mật khẩu & Đăng nhập
                </span>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
