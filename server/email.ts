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
  private from = process.env.EMAIL_FROM || "noreply@orbitstaffing.io";
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
              Questions? Contact support@orbitstaffing.io
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

  /**
   * Email template: Support ticket confirmation (auto-response)
   */
  getFranchiseApplicationReceivedEmail(email: string, companyName: string, tierName: string): EmailOptions {
    return {
      to: email,
      subject: "ORBIT Franchise Application Received 🚀",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 32px;">🪐 ORBIT Franchise</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Application Received</p>
          </div>
          
          <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #000; margin-top: 0;">Thank You, ${companyName}!</h2>
            
            <p style="color: #333; line-height: 1.6;">
              We've received your franchise application for the <strong>${tierName}</strong> tier. Our franchise team is reviewing your submission.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
              <h3 style="color: #7c3aed; margin-top: 0;">What Happens Next?</h3>
              <ul style="color: #333; line-height: 1.8;">
                <li>Our franchise team reviews your application (24-48 hours)</li>
                <li>We'll verify territory availability</li>
                <li>A franchise specialist will contact you to discuss details</li>
                <li>Upon approval, you'll receive payment instructions</li>
              </ul>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Questions? Contact our franchise team at franchise@orbitstaffing.io
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; margin: 0;">
              ORBIT Staffing Platform | Franchise Opportunities
            </p>
          </div>
        </div>
      `,
    };
  }

  getFranchiseApplicationApprovedEmail(email: string, companyName: string, tierName: string, checkoutUrl?: string): EmailOptions {
    return {
      to: email,
      subject: "Congratulations! Your ORBIT Franchise Application is Approved! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 32px;">🪐 ORBIT Franchise</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Application Approved!</p>
          </div>
          
          <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #000; margin-top: 0;">Welcome to the ORBIT Family, ${companyName}!</h2>
            
            <p style="color: #333; line-height: 1.6;">
              Great news! Your franchise application for the <strong>${tierName}</strong> tier has been approved. You're one step away from owning your ORBIT franchise.
            </p>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="color: #059669; margin-top: 0;">Next Steps:</h3>
              <ul style="color: #333; line-height: 1.8;">
                <li>Complete your franchise fee payment</li>
                <li>Sign your franchise agreement</li>
                <li>Receive your exclusive territory assignment</li>
                <li>Get access to your franchise dashboard</li>
              </ul>
            </div>
            
            ${checkoutUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${checkoutUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Complete Payment
              </a>
            </div>
            ` : ''}
            
            <p style="color: #666; font-size: 14px;">
              A franchise specialist will contact you within 24 hours to finalize details.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; margin: 0;">
              ORBIT Staffing Platform | Franchise Opportunities
            </p>
          </div>
        </div>
      `,
    };
  }

  getFranchiseApplicationRejectedEmail(email: string, companyName: string, reason?: string): EmailOptions {
    return {
      to: email,
      subject: "Update on Your ORBIT Franchise Application",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 32px;">🪐 ORBIT Franchise</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Application Update</p>
          </div>
          
          <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #000; margin-top: 0;">Dear ${companyName},</h2>
            
            <p style="color: #333; line-height: 1.6;">
              Thank you for your interest in the ORBIT Staffing franchise program. After careful review, we're unable to move forward with your application at this time.
            </p>
            
            ${reason ? `
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <p style="margin: 0; color: #7f1d1d;">
                <strong>Reason:</strong> ${reason}
              </p>
            </div>
            ` : ''}
            
            <p style="color: #333; line-height: 1.6;">
              We encourage you to consider our standard subscription options, which offer the same powerful features without the franchise commitment. If circumstances change, you're welcome to reapply in the future.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://orbitstaffing.io/pricing" style="display: inline-block; background: #0ea5e9; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                View Subscription Plans
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Questions? Contact our team at franchise@orbitstaffing.io
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; margin: 0;">
              ORBIT Staffing Platform | Franchise Opportunities
            </p>
          </div>
        </div>
      `,
    };
  }

  getSupportTicketConfirmationEmail(email: string, ticketId: string, subject: string): EmailOptions {
    return {
      to: email,
      subject: `Support Ticket Received - #${ticketId} ✅`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #000000 0%, #1f2937 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🪐 ORBIT Support</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">We Received Your Message</p>
          </div>
          
          <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #000; margin-top: 0;">Thank you for contacting ORBIT!</h2>
            
            <p style="color: #333; line-height: 1.6;">
              We've received your support request and our team is looking into it. Here's your ticket information:
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
              <p style="margin: 0 0 10px 0; color: #666;">
                <strong>Ticket ID:</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">#${ticketId}</code>
              </p>
              <p style="margin: 0; color: #666;">
                <strong>Subject:</strong> ${subject}
              </p>
            </div>
            
            <p style="color: #333; line-height: 1.6;">
              A member of our support team will respond to your inquiry shortly. We typically respond within 24 hours during business hours.
            </p>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
              <p style="margin: 0; color: #0c4a6e; font-size: 14px;">
                <strong>Need immediate help?</strong><br>
                Contact us directly at support@orbitstaffing.io
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; margin: 0;">
              ORBIT Staffing Platform | 24/7 Support Available
            </p>
          </div>
        </div>
      `,
    };
  }
}

// Singleton instance
export const emailService = new EmailService();
