import nodemailer from "nodemailer";

const getTransporter = () => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

export const sendVerificationEmail = async (toEmail, otp) => {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || `"AloHub Support" <no-reply@alohub.com>`;
  const subject = `[AloHub] Mã xác thực đăng ký tài khoản: ${otp}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #6366f1; margin: 0;">AloHub</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Xác thực địa chỉ Email của bạn</p>
      </div>
      <div style="padding: 20px; background-color: #f8fafc; border-radius: 8px; text-align: center;">
        <p style="font-size: 15px; color: #334155; margin-bottom: 12px;">Mã OTP xác thực tài khoản của bạn là:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #4f46e5; margin: 16px 0;">${otp}</div>
        <p style="font-size: 13px; color: #94a3b8; margin: 0;">Mã OTP có hiệu lực trong 15 phút. Vui lòng không chia sẻ mã này cho ai khác.</p>
      </div>
    </div>
  `;

  if (!transporter) {
    console.log(`[Email Service - Dev Mode] Send Verification OTP: ${otp} to ${toEmail}`);
    return true;
  }

  return await transporter.sendMail({ from, to: toEmail, subject, html });
};

export const sendForgotPasswordEmail = async (toEmail, otp) => {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || `"AloHub Support" <no-reply@alohub.com>`;
  const subject = `[AloHub] Mã OTP đặt lại mật khẩu: ${otp}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #6366f1; margin: 0;">AloHub</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Yêu cầu đặt lại mật khẩu</p>
      </div>
      <div style="padding: 20px; background-color: #f8fafc; border-radius: 8px; text-align: center;">
        <p style="font-size: 15px; color: #334155; margin-bottom: 12px;">Bạn đã yêu cầu khôi phục mật khẩu. Mã OTP của bạn là:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #ea580c; margin: 16px 0;">${otp}</div>
        <p style="font-size: 13px; color: #94a3b8; margin: 0;">Mã OTP này có giá trị trong 15 phút. Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email.</p>
      </div>
    </div>
  `;

  if (!transporter) {
    console.log(`[Email Service - Dev Mode] Send Forgot Password OTP: ${otp} to ${toEmail}`);
    return true;
  }

  return await transporter.sendMail({ from, to: toEmail, subject, html });
};

export const sendChangePasswordOtpEmail = async (toEmail, otp, displayName) => {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || `"AloHub Support" <no-reply@alohub.com>`;
  const subject = `[AloHub] Mã OTP thay đổi mật khẩu tài khoản: ${otp}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #6366f1; margin: 0;">AloHub</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Mã xác thực đổi mật khẩu</p>
      </div>
      <div style="padding: 20px; background-color: #f8fafc; border-radius: 8px; text-align: center;">
        <p style="font-size: 15px; color: #334155; margin-bottom: 12px;">Xin chào <strong>${displayName || "Bạn"}</strong>, mã OTP để đổi mật khẩu tài khoản của bạn là:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0284c7; margin: 16px 0;">${otp}</div>
        <p style="font-size: 13px; color: #94a3b8; margin: 0;">Mã OTP có hiệu lực trong 15 phút. Nếu bạn không gửi yêu cầu đổi mật khẩu, vui lòng liên hệ hỗ trợ hoặc đổi lại mật khẩu ngay.</p>
      </div>
    </div>
  `;

  if (!transporter) {
    console.log(`[Email Service - Dev Mode] Send Change Password OTP: ${otp} to ${toEmail}`);
    return true;
  }

  return await transporter.sendMail({ from, to: toEmail, subject, html });
};

export const sendPasswordChangedEmail = async (toEmail, displayName) => {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || `"AloHub Support" <no-reply@alohub.com>`;
  const subject = `[AloHub] Cảnh báo bảo mật: Mật khẩu tài khoản đã được thay đổi`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #6366f1; margin: 0;">AloHub</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Thông báo cập nhật mật khẩu</p>
      </div>
      <div style="padding: 20px; background-color: #f8fafc; border-radius: 8px;">
        <p style="font-size: 15px; color: #334155;">Xin chào <strong>${displayName || "Bạn"}</strong>,</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">Mật khẩu tài khoản AloHub liên kết với email <strong>${toEmail}</strong> của bạn đã được thay đổi thành công vào lúc <strong>${new Date().toLocaleString("vi-VN")}</strong>.</p>
        <div style="margin-top: 16px; padding: 12px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
          <p style="font-size: 13px; color: #991b1b; margin: 0;">Nếu bạn KHÔNG thực hiện thao tác này, tài khoản của bạn có thể đã bị truy cập trái phép. Vui lòng đặt lại mật khẩu ngay lập tức.</p>
        </div>
      </div>
    </div>
  `;

  if (!transporter) {
    console.log(`[Email Service - Dev Mode] Send Password Changed Notification to ${toEmail}`);
    return true;
  }

  return await transporter.sendMail({ from, to: toEmail, subject, html });
};
