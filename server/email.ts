/**
 * Email service for notifications
 * Production-ready with fallback for local development
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

class EmailService {
  private from = process.env.EMAIL_FROM || "noreply@orbitstaffing.net";
  private smtpHost = process.env.SMTP_HOST;
  private smtpPort = process.env.SMTP_PORT;
  private smtpUser = process.env.SMTP_USER;
  private smtpPass = process.env.SMTP_PASS;

  /**
   * Send email (production or mock)
   */
  async send(options: EmailOptions): Promise<{ success: boolean; messageId?: string }> {
    // In production with SMTP credentials, use nodemailer
    if (this.smtpHost && this.smtpUser && this.smtpPass) {
      try {
        // Dynamic import to avoid requiring nodemailer if not configured
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.default.createTransport({
          host: this.smtpHost,
          port: parseInt(this.smtpPort || "587"),
          secure: this.smtpPort === "465",
          auth: {
            user: this.smtpUser,
            pass: this.smtpPass,
          },
        });

        const result = await transporter.sendMail({
          from: options.from || this.from,
          to: options.to,
          subject: options.subject,
          html: options.html,
        });

        console.log(`✓ Email sent to ${options.to} (${result.messageId})`);
        return { success: true, messageId: result.messageId };
      } catch (error) {
        console.error("Email send error:", error);
        // Fallback to console logging
        return this.logEmail(options);
      }
    }

    // Development mode: Log to console
    return this.logEmail(options);
  }

  /**
   * Log email to console (development mode)
   */
  private logEmail(options: EmailOptions): { success: boolean } {
    console.log("\n📧 EMAIL (Dev Mode)");
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body:\n${options.html}\n`);
    return { success: true };
  }

  /**
   * Email template: iOS app is now available
   */
  getIOSLaunchEmail(email: string): EmailOptions {
    return {
      to: email,
      subject: "ORBIT Staffing iOS App is Now Available! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #000000 0%, #1f2937 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 32px;">🪐 ORBIT Staffing</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Now on iPhone & iPad</p>
          </div>
          
          <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #000; margin-top: 0;">Your iOS App is Ready!</h2>
            
            <p style="color: #333; line-height: 1.6;">
              We're excited to announce that ORBIT Staffing is now available on the Apple App Store!
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
              <h3 style="color: #0ea5e9; margin-top: 0;">What's New on iOS:</h3>
              <ul style="color: #333; line-height: 1.8;">
                <li>✓ Face ID & Touch ID login</li>
                <li>✓ GPS check-in with geofence verification</li>
                <li>✓ Real-time shift notifications</li>
                <li>✓ Seamless sync with your Android account</li>
                <li>✓ iOS-optimized interface</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://apps.apple.com/app/orbit-staffing/id123456789" style="display: inline-block; background: #0ea5e9; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Download on App Store
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              <strong>Already have Android?</strong><br>
              Just use your same email and password to log in on iOS. All your assignments sync automatically!
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; margin: 0;">
              Questions? Contact support@orbitstaffing.net
            </p>
          </div>
        </div>
      `,
    };
  }

  /**
   * Email template: Feature request update
   */
  getFeatureUpdateEmail(email: string, featureName: string, status: string): EmailOptions {
    return {
      to: email,
      subject: `Feature Update: ${featureName} - ${status} 📢`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #000;">Feature Update</h2>
          <p style="color: #333; line-height: 1.6;">
            We have an update on the feature you requested:
          </p>
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
            <p style="margin: 0; color: #0c4a6e;">
              <strong>${featureName}</strong><br>
              Status: <strong style="font-size: 16px; color: #0ea5e9;">${status}</strong>
            </p>
          </div>
          <p style="color: #666; margin-top: 20px;">
            We'll keep you updated as this feature progresses. Thank you for your patience!
          </p>
        </div>
      `,
    };
  }
}

// Singleton instance
export const emailService = new EmailService();
