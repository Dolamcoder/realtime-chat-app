import React, { useState, useRef } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import UserAvatar from "./UserAvatar";
import { SidebarInset, SidebarTrigger } from "../ui/sidebar";
import {
  Camera,
  Save,
  Lock,
  Mail,
  Phone,
  FileText,
  ChevronLeft,
  User,
  Eye,
  EyeOff,
  Shield,
  Info
} from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";

const AccountInfo = () => {
  const { user, updateProfile, updateAvatar, changePassword, loading } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile fields state
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [phone, setPhone] = useState(user?.phone || "");

  // Password fields state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Optimistic avatar preview
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Kích thước ảnh đại diện không vượt quá 2MB");
      return;
    }

    // Set preview
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    try {
      await updateAvatar(file);
    } catch (err) {
      // Revert preview on failure
      setAvatarPreview(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("Tên hiển thị không được để trống");
      return;
    }

    try {
      await updateProfile(displayName, bio, phone);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ tất cả các trường mật khẩu");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      await changePassword(oldPassword, newPassword);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SidebarInset className="flex flex-col h-full flex-1 overflow-hidden rounded-sm shadow-md bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 px-6 py-4 border-b border-border/40 flex items-center justify-between bg-background/95 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-foreground shrink-0 md:hidden" />
          <Link
            to="/"
            className="p-2 hover:bg-muted rounded-full text-foreground/80 hover:text-foreground transition-colors duration-200"
            title="Quay lại đoạn chat"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="mx-1 h-6 w-[1px] bg-border md:hidden" />
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Tài khoản của bạn
            </h2>
            <p className="text-xs text-muted-foreground/80 mt-0.5">
              Quản lý thông tin hồ sơ và bảo mật tài khoản
            </p>
          </div>
        </div>
      </header>

      {/* Body scroll */}
      <div className="flex-1 overflow-y-auto p-6 beautiful-scrollbar">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Avatar upload Card */}
          <div className="bg-muted/20 border border-border/40 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <UserAvatar
                type="profile"
                name={user?.displayName || ""}
                avatarUrl={avatarPreview || user?.avatarUrl}
                className="w-24 h-24 ring-4 ring-primary/10 group-hover:ring-primary/20 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="flex-1 text-center sm:text-left space-y-1">
              <h3 className="text-lg font-bold text-foreground">Ảnh đại diện</h3>
              <p className="text-sm text-muted-foreground/80">
                Hỗ trợ định dạng JPG, PNG. Kích thước tối đa 2MB.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-all duration-200"
              >
                Chọn ảnh mới
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          {/* Profile details Form */}
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="bg-card border border-border/40 rounded-2xl p-6 space-y-6 shadow-sm">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border/30 pb-3">
                <Info className="w-4 h-4 text-primary" />
                Thông tin cá nhân
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username (Disabled) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground/90 uppercase tracking-wider">
                    Tên đăng nhập
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted/40 border border-border/30 text-muted-foreground/80 select-none">
                    <User className="w-4 h-4 shrink-0 text-muted-foreground/65" />
                    <span className="text-sm">{user?.username}</span>
                  </div>
                </div>

                {/* Email (Disabled) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground/90 uppercase tracking-wider">
                    Email
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted/40 border border-border/30 text-muted-foreground/80 select-none">
                    <Mail className="w-4 h-4 shrink-0 text-muted-foreground/65" />
                    <span className="text-sm truncate">{user?.email}</span>
                  </div>
                </div>

                {/* Display Name */}
                <div className="space-y-1.5">
                  <label htmlFor="displayName" className="text-xs font-bold text-muted-foreground/90 uppercase tracking-wider">
                    Tên hiển thị
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Nhập tên hiển thị..."
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label htmlFor="phone" className="text-xs font-bold text-muted-foreground/90 uppercase tracking-wider">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                    <input
                      id="phone"
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Nhập số điện thoại..."
                      className="w-full text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-border/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label htmlFor="bio" className="text-xs font-bold text-muted-foreground/90 uppercase tracking-wider">
                  Mô tả bản thân
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground/60" />
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Viết vài dòng giới thiệu bản thân..."
                    rows={3}
                    className="w-full text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-border/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/95 transition-all duration-200 shadow-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          </form>

          {/* Change Password Card */}
          <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/30 pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                Mật khẩu & Bảo mật
              </h3>
              <button
                type="button"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                {showPasswordSection ? "Đóng lại" : "Đổi mật khẩu"}
              </button>
            </div>

            {showPasswordSection && (
              <form onSubmit={handleChangePasswordSubmit} className="mt-6 space-y-4 max-w-md animate-in fade-in slide-in-from-top-3 duration-200">
                {/* Old Password */}
                <div className="space-y-1.5">
                  <label htmlFor="oldPass" className="text-xs font-semibold text-muted-foreground">Mật khẩu hiện tại</label>
                  <div className="relative">
                    <input
                      id="oldPass"
                      type={showOldPass ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPass(!showOldPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
                    >
                      {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label htmlFor="newPass" className="text-xs font-semibold text-muted-foreground">Mật khẩu mới</label>
                  <div className="relative">
                    <input
                      id="newPass"
                      type={showNewPass ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label htmlFor="confirmPass" className="text-xs font-semibold text-muted-foreground">Xác nhận mật khẩu mới</label>
                  <div className="relative">
                    <input
                      id="confirmPass"
                      type={showConfirmPass ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/95 transition-all shadow-sm disabled:opacity-50"
                >
                  {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </SidebarInset>
  );
};

export default AccountInfo;
