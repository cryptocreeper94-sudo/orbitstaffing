export const WELCOME_LETTER_TEMPLATES = {
  employee: (name: string, position: string) => `Welcome to the ORBIT Team!

We're excited to have you join us as a ${position}. You're now part of a dynamic workforce platform that's revolutionizing the staffing industry.

What to expect:
• Access to flexible shift opportunities that match your schedule
• Real-time earnings tracking and instant payroll
• GPS-verified check-ins at job sites
• Mobile app with biometric login for security
• Professional support team ready to help

Getting started:
1. Download the ORBIT mobile app (iOS/Android)
2. Complete your profile with your availability
3. Review available shifts in your area
4. Accept shifts and track your earnings

We believe in transparency, fair compensation, and treating our workers like partners. Your success is our success.

If you have any questions, please reach out to your manager or contact support@orbitstaffing.net.

Looking forward to working with you!`,

  owner: (companyName: string) => `Welcome to ORBIT Staffing OS

Congratulations on joining the future of workforce management! ORBIT is designed to simplify every aspect of your staffing operations—from recruitment to payroll.

Your platform includes:
• Centralized worker and client management
• Automated scheduling and assignments
• Real-time payroll processing
• Instant invoicing and revenue tracking
• Mobile workforce management
• Comprehensive compliance & reporting

Next steps:
1. Create your first worker profile
2. Post a job to attract talent
3. Make your first assignment
4. Experience the efficiency of ORBIT

You'll have access to our support team and comprehensive documentation to help you succeed. Our goal is to reduce your operational overhead and help you scale your business.

The ORBIT team is here to support your growth.`,

  admin: (adminName: string) => `Welcome to ORBIT Admin Dashboard

You now have administrative access to manage your organization's staffing operations. This is a powerful platform with comprehensive tools for workforce management.

Your responsibilities:
• Manage user accounts and permissions
• Oversee worker assignments and scheduling
• Process payroll and invoicing
• Monitor compliance and reporting
• Send welcome communications to team members
• Access system health and analytics

Key features:
• Real-time dashboard for all operations
• Bulk operations for efficiency
• Customizable alerts and notifications
• Complete audit trails
• Role-based access control

As an admin, you're essential to your organization's success. The ORBIT platform gives you the tools to manage at scale while maintaining complete data security and compliance.

For technical support or questions, contact the ORBIT team at support@orbitstaffing.net.`,

  sandboxDemo: (userName: string) => `Welcome to ORBIT Sandbox

Thank you for exploring ORBIT Staffing OS! This sandbox environment lets you test all features risk-free.

You can:
• Create test workers and clients
• Post jobs and make assignments
• Process demo payroll
• Generate sample invoices
• Explore all workflows

This is your playground to get comfortable with the platform. All data in sandbox is for testing only.

Ready to go live? Contact our team to discuss your production deployment.

Enjoy exploring ORBIT!`
};
