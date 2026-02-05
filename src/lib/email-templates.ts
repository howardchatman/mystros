function layout(body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:100%;">
<!-- Header -->
<tr><td style="background:#0f172a;padding:24px 32px;">
<table width="100%"><tr>
<td><span style="color:#f59e0b;font-size:24px;font-weight:bold;">M</span><span style="color:#ffffff;font-size:20px;font-weight:bold;margin-left:8px;">Mystros Barber Academy</span></td>
</tr></table>
</td></tr>
<!-- Body -->
<tr><td style="padding:32px;">
${body}
</td></tr>
<!-- Footer -->
<tr><td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;">
<p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
Mystros Barber Academy &middot; <a href="https://mystrosbarber.com" style="color:#f59e0b;">mystrosbarber.com</a><br/>
This is an automated message. Please do not reply directly to this email.
</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export function applicationStatusEmail(params: {
  firstName: string;
  status: "accepted" | "denied";
}): { subject: string; html: string } {
  const { firstName, status } = params;

  if (status === "accepted") {
    return {
      subject: "Congratulations — Your Application Has Been Accepted!",
      html: layout(`
        <h2 style="margin:0 0 16px;color:#0f172a;">Welcome, ${firstName}!</h2>
        <p style="color:#334155;line-height:1.6;">
          We're excited to let you know that your application to Mystros Barber Academy has been <strong style="color:#16a34a;">accepted</strong>.
        </p>
        <p style="color:#334155;line-height:1.6;">
          Our admissions team will be in touch with next steps, including enrollment paperwork and orientation details.
        </p>
        <p style="color:#334155;line-height:1.6;">
          In the meantime, you can log in to your student portal to track your progress.
        </p>
        <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr><td style="background:#f59e0b;border-radius:6px;padding:12px 24px;">
        <a href="https://mystrosbarber.com/login" style="color:#ffffff;text-decoration:none;font-weight:bold;">Log In to Portal</a>
        </td></tr>
        </table>
      `),
    };
  }

  return {
    subject: "Application Update — Mystros Barber Academy",
    html: layout(`
      <h2 style="margin:0 0 16px;color:#0f172a;">Hi ${firstName},</h2>
      <p style="color:#334155;line-height:1.6;">
        Thank you for your interest in Mystros Barber Academy. After reviewing your application, we are unable to offer admission at this time.
      </p>
      <p style="color:#334155;line-height:1.6;">
        If you have questions about this decision or would like to discuss your options, please contact our admissions office.
      </p>
      <p style="color:#334155;line-height:1.6;">
        <a href="mailto:INFOMYSTROSBARBERACADEMY@GMAIL.COM" style="color:#f59e0b;">INFOMYSTROSBARBERACADEMY@GMAIL.COM</a>
      </p>
    `),
  };
}

export function sapAlertEmail(params: {
  firstName: string;
  status: string;
}): { subject: string; html: string } {
  const { firstName, status } = params;
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const isUrgent = status === "suspension" || status === "probation";

  return {
    subject: `Academic Progress Alert${isUrgent ? " — Action Required" : ""} — Mystros Barber Academy`,
    html: layout(`
      <h2 style="margin:0 0 16px;color:#0f172a;">SAP Status Update</h2>
      <p style="color:#334155;line-height:1.6;">
        Hi ${firstName}, your Satisfactory Academic Progress (SAP) status has been updated to:
      </p>
      <p style="margin:16px 0;padding:12px 16px;background:${isUrgent ? "#fef2f2" : "#fffbeb"};border-left:4px solid ${isUrgent ? "#ef4444" : "#f59e0b"};border-radius:4px;">
        <strong style="color:${isUrgent ? "#dc2626" : "#d97706"};font-size:16px;">${label}</strong>
      </p>
      ${isUrgent ? `<p style="color:#334155;line-height:1.6;">Please contact your campus advisor as soon as possible to discuss an academic plan.</p>` : ""}
      <p style="color:#334155;line-height:1.6;">
        View your full SAP details in the <a href="https://mystrosbarber.com/hours" style="color:#f59e0b;">student portal</a>.
      </p>
    `),
  };
}

export function disbursementReleasedEmail(params: {
  firstName: string;
  amount: number;
  date: string;
}): { subject: string; html: string } {
  const { firstName, amount, date } = params;
  const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  return {
    subject: "Financial Aid Disbursement Released — Mystros Barber Academy",
    html: layout(`
      <h2 style="margin:0 0 16px;color:#0f172a;">Disbursement Released</h2>
      <p style="color:#334155;line-height:1.6;">Hi ${firstName},</p>
      <p style="color:#334155;line-height:1.6;">
        A financial aid disbursement has been released to your student account:
      </p>
      <table cellpadding="8" cellspacing="0" style="margin:16px 0;border:1px solid #e2e8f0;border-radius:6px;width:100%;">
        <tr style="background:#f8fafc;">
          <td style="font-weight:bold;color:#0f172a;">Amount</td>
          <td style="text-align:right;color:#16a34a;font-weight:bold;">${fmt}</td>
        </tr>
        <tr>
          <td style="font-weight:bold;color:#0f172a;">Date</td>
          <td style="text-align:right;color:#334155;">${date}</td>
        </tr>
      </table>
      <p style="color:#334155;line-height:1.6;">
        View your account details in the <a href="https://mystrosbarber.com/my-financial-aid" style="color:#f59e0b;">student portal</a>.
      </p>
    `),
  };
}

export function documentRequestEmail(params: {
  firstName: string;
  documents: string[];
}): { subject: string; html: string } {
  const { firstName, documents } = params;

  return {
    subject: "Document Upload Required — Mystros Barber Academy",
    html: layout(`
      <h2 style="margin:0 0 16px;color:#0f172a;">Documents Needed</h2>
      <p style="color:#334155;line-height:1.6;">Hi ${firstName},</p>
      <p style="color:#334155;line-height:1.6;">
        The following documents are needed to complete your file:
      </p>
      <ul style="color:#334155;line-height:1.8;">
        ${documents.map((d) => `<li>${d}</li>`).join("")}
      </ul>
      <p style="color:#334155;line-height:1.6;">
        Please upload them through your <a href="https://mystrosbarber.com/documents" style="color:#f59e0b;">student portal</a> at your earliest convenience.
      </p>
    `),
  };
}

export function documentRejectionEmail(params: {
  firstName: string;
  documentType: string;
  reason: string;
}): { subject: string; html: string } {
  const { firstName, documentType, reason } = params;

  return {
    subject: "Document Requires Resubmission — Mystros Barber Academy",
    html: layout(`
      <h2 style="margin:0 0 16px;color:#0f172a;">Document Resubmission Required</h2>
      <p style="color:#334155;line-height:1.6;">Hi ${firstName},</p>
      <p style="color:#334155;line-height:1.6;">
        Your uploaded document <strong>${documentType}</strong> was not approved for the following reason:
      </p>
      <p style="margin:16px 0;padding:12px 16px;background:#fef2f2;border-left:4px solid #ef4444;border-radius:4px;color:#334155;">
        ${reason}
      </p>
      <p style="color:#334155;line-height:1.6;">
        Please resubmit through your <a href="https://mystrosbarber.com/documents" style="color:#f59e0b;">student portal</a>.
      </p>
    `),
  };
}

// ─── Phase 8 Templates ──────────────────────────────────

export function enrollmentConfirmationEmail(params: {
  firstName: string;
  studentNumber: string;
  programName: string;
  campusName: string;
  startDate: string;
}): { subject: string; html: string } {
  const { firstName, studentNumber, programName, campusName, startDate } = params;

  return {
    subject: "Welcome to Mystros Barber Academy — You're Enrolled!",
    html: layout(`
      <h2 style="margin:0 0 16px;color:#0f172a;">Welcome, ${firstName}!</h2>
      <p style="color:#334155;line-height:1.6;">
        Congratulations — you are officially enrolled at Mystros Barber Academy! Here are your enrollment details:
      </p>
      <table cellpadding="8" cellspacing="0" style="margin:16px 0;border:1px solid #e2e8f0;border-radius:6px;width:100%;">
        <tr style="background:#f8fafc;"><td style="font-weight:bold;color:#0f172a;">Student Number</td><td style="text-align:right;color:#334155;font-family:monospace;">${studentNumber}</td></tr>
        <tr><td style="font-weight:bold;color:#0f172a;">Program</td><td style="text-align:right;color:#334155;">${programName}</td></tr>
        <tr style="background:#f8fafc;"><td style="font-weight:bold;color:#0f172a;">Campus</td><td style="text-align:right;color:#334155;">${campusName}</td></tr>
        <tr><td style="font-weight:bold;color:#0f172a;">Start Date</td><td style="text-align:right;color:#334155;">${startDate}</td></tr>
      </table>
      <p style="color:#334155;line-height:1.6;">
        Log in to your student portal to view your schedule, upload required documents, and track your progress.
      </p>
      <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr><td style="background:#f59e0b;border-radius:6px;padding:12px 24px;">
      <a href="https://mystrosbarber.com/login" style="color:#ffffff;text-decoration:none;font-weight:bold;">Log In to Portal</a>
      </td></tr>
      </table>
    `),
  };
}

export function paymentConfirmationEmail(params: {
  firstName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  confirmationNumber: string;
  newBalance: number;
}): { subject: string; html: string } {
  const { firstName, amount, paymentDate, paymentMethod, confirmationNumber, newBalance } = params;
  const fmtAmount = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  const fmtBalance = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(newBalance);

  return {
    subject: "Payment Received — Mystros Barber Academy",
    html: layout(`
      <h2 style="margin:0 0 16px;color:#0f172a;">Payment Confirmation</h2>
      <p style="color:#334155;line-height:1.6;">Hi ${firstName}, your payment has been received. Thank you!</p>
      <table cellpadding="8" cellspacing="0" style="margin:16px 0;border:1px solid #e2e8f0;border-radius:6px;width:100%;">
        <tr style="background:#f8fafc;"><td style="font-weight:bold;color:#0f172a;">Amount Paid</td><td style="text-align:right;color:#16a34a;font-weight:bold;">${fmtAmount}</td></tr>
        <tr><td style="font-weight:bold;color:#0f172a;">Date</td><td style="text-align:right;color:#334155;">${paymentDate}</td></tr>
        <tr style="background:#f8fafc;"><td style="font-weight:bold;color:#0f172a;">Method</td><td style="text-align:right;color:#334155;">${paymentMethod}</td></tr>
        <tr><td style="font-weight:bold;color:#0f172a;">Confirmation #</td><td style="text-align:right;color:#334155;font-family:monospace;">${confirmationNumber}</td></tr>
        <tr style="background:#f8fafc;"><td style="font-weight:bold;color:#0f172a;">Remaining Balance</td><td style="text-align:right;color:#334155;font-weight:bold;">${fmtBalance}</td></tr>
      </table>
      <p style="color:#334155;line-height:1.6;">
        View your account details in the <a href="https://mystrosbarber.com/my-financial-aid" style="color:#f59e0b;">student portal</a>.
      </p>
    `),
  };
}

export function attendanceAlertEmail(params: {
  firstName: string;
  absenceCount: number;
  dateRange: string;
}): { subject: string; html: string } {
  const { firstName, absenceCount, dateRange } = params;

  return {
    subject: "Attendance Alert — Mystros Barber Academy",
    html: layout(`
      <h2 style="margin:0 0 16px;color:#0f172a;">Attendance Alert</h2>
      <p style="color:#334155;line-height:1.6;">Hi ${firstName},</p>
      <p style="margin:16px 0;padding:12px 16px;background:#fffbeb;border-left:4px solid #f59e0b;border-radius:4px;color:#334155;">
        You have <strong>${absenceCount} absence${absenceCount > 1 ? "s" : ""}</strong> in the past ${dateRange}.
      </p>
      <p style="color:#334155;line-height:1.6;">
        Regular attendance is essential for completing your program on time and maintaining satisfactory academic progress (SAP).
      </p>
      <p style="color:#334155;line-height:1.6;">
        If you are experiencing difficulties, please speak with your instructor or campus advisor. We're here to help.
      </p>
      <p style="color:#334155;line-height:1.6;">
        View your attendance in the <a href="https://mystrosbarber.com/hours" style="color:#f59e0b;">student portal</a>.
      </p>
    `),
  };
}

export function milestoneAchievementEmail(params: {
  firstName: string;
  milestone: string;
  totalHours: number;
  percentComplete: number;
}): { subject: string; html: string } {
  const { firstName, milestone, totalHours, percentComplete } = params;

  return {
    subject: `Milestone Reached: ${milestone} — Mystros Barber Academy`,
    html: layout(`
      <h2 style="margin:0 0 16px;color:#0f172a;">Congratulations, ${firstName}!</h2>
      <p style="margin:16px 0;padding:16px;background:#f0fdf4;border-left:4px solid #16a34a;border-radius:4px;text-align:center;">
        <span style="font-size:32px;">&#127942;</span><br/>
        <strong style="color:#16a34a;font-size:18px;">${milestone} Milestone Reached!</strong>
      </p>
      <p style="color:#334155;line-height:1.6;">
        You've completed <strong>${totalHours.toLocaleString()} hours</strong> — that's <strong>${percentComplete}%</strong> of your program. Keep up the great work!
      </p>
      <p style="color:#334155;line-height:1.6;">
        Track your full progress in the <a href="https://mystrosbarber.com/hours" style="color:#f59e0b;">student portal</a>.
      </p>
    `),
  };
}

export function graduationCongratulationsEmail(params: {
  firstName: string;
  programName: string;
  graduationDate: string;
  totalHours: number;
}): { subject: string; html: string } {
  const { firstName, programName, graduationDate, totalHours } = params;

  return {
    subject: "Congratulations, Graduate! — Mystros Barber Academy",
    html: layout(`
      <h2 style="margin:0 0 16px;color:#0f172a;">Congratulations, ${firstName}!</h2>
      <p style="margin:16px 0;padding:16px;background:#f0fdf4;border-left:4px solid #16a34a;border-radius:4px;text-align:center;">
        <span style="font-size:32px;">&#127891;</span><br/>
        <strong style="color:#16a34a;font-size:18px;">You Did It!</strong>
      </p>
      <p style="color:#334155;line-height:1.6;">
        You have successfully completed the <strong>${programName}</strong> program at Mystros Barber Academy with <strong>${totalHours.toLocaleString()} hours</strong>.
      </p>
      <table cellpadding="8" cellspacing="0" style="margin:16px 0;border:1px solid #e2e8f0;border-radius:6px;width:100%;">
        <tr style="background:#f8fafc;"><td style="font-weight:bold;color:#0f172a;">Program</td><td style="text-align:right;color:#334155;">${programName}</td></tr>
        <tr><td style="font-weight:bold;color:#0f172a;">Completion Date</td><td style="text-align:right;color:#334155;">${graduationDate}</td></tr>
        <tr style="background:#f8fafc;"><td style="font-weight:bold;color:#0f172a;">Total Hours</td><td style="text-align:right;color:#334155;">${totalHours.toLocaleString()}</td></tr>
      </table>
      <p style="color:#334155;line-height:1.6;">
        Your next steps include applying for your state barber license. Contact your campus for guidance on the licensing exam and any required documentation.
      </p>
      <p style="color:#334155;line-height:1.6;">
        We're proud of you and wish you the best in your barbering career!
      </p>
    `),
  };
}

// ─── Phase 9 Email Sequence Templates ──────────────────────────────────

export function newLeadWelcomeEmail(params: {
  firstName: string;
}): { subject: string; html: string } {
  const { firstName } = params;

  return {
    subject: "Thanks for your interest in Mystros Barber Academy!",
    html: layout(`
      <h2 style="margin:0 0 16px;color:#0f172a;">Hi ${firstName}!</h2>
      <p style="color:#334155;line-height:1.6;">
        Thank you for your interest in Mystros Barber Academy. We're excited that you're considering a career in barbering!
      </p>
      <p style="color:#334155;line-height:1.6;">
        At Mystros, we offer hands-on training from experienced barbers who are passionate about helping you succeed. Our programs include:
      </p>
      <ul style="color:#334155;line-height:1.8;">
        <li><strong>Class A Barber Program</strong> (1,500 hours) — Full barbering license</li>
        <li><strong>Barber Crossover Program</strong> (300 hours) — For licensed cosmetologists</li>
        <li><strong>Instructor Program</strong> (750 hours) — Teach the next generation</li>
      </ul>
      <p style="color:#334155;line-height:1.6;">
        Ready to take the next step? Start your application today!
      </p>
      <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr><td style="background:#f59e0b;border-radius:6px;padding:12px 24px;">
      <a href="https://mystrosbarber.com/apply" style="color:#ffffff;text-decoration:none;font-weight:bold;">Apply Now</a>
      </td></tr>
      </table>
      <p style="color:#334155;line-height:1.6;">
        Questions? Reply to this email or call us at <a href="tel:+17139992904" style="color:#f59e0b;">(713) 999-2904</a>.
      </p>
    `),
  };
}

export function newLeadFollowUpEmail(params: {
  firstName: string;
}): { subject: string; html: string } {
  const { firstName } = params;

  return {
    subject: "Still thinking about barber school?",
    html: layout(`
      <h2 style="margin:0 0 16px;color:#0f172a;">Hi ${firstName},</h2>
      <p style="color:#334155;line-height:1.6;">
        We noticed you haven't started your application yet — no worries, we're here when you're ready!
      </p>
      <p style="color:#334155;line-height:1.6;">
        Here's why students choose Mystros:
      </p>
      <ul style="color:#334155;line-height:1.8;">
        <li><strong>Hands-on Training</strong> — Work with real clients from day one</li>
        <li><strong>Financial Aid Available</strong> — Federal Pell Grants and loans accepted</li>
        <li><strong>Flexible Schedules</strong> — Day and evening classes to fit your life</li>
        <li><strong>Career Support</strong> — Job placement assistance after graduation</li>
      </ul>
      <p style="margin:16px 0;padding:16px;background:#f8fafc;border-radius:8px;color:#334155;font-style:italic;">
        "Mystros gave me the skills and confidence to open my own shop. The instructors really care about your success." — Marcus T., Class of 2024
      </p>
      <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr><td style="background:#f59e0b;border-radius:6px;padding:12px 24px;">
      <a href="https://mystrosbarber.com/apply" style="color:#ffffff;text-decoration:none;font-weight:bold;">Start Your Application</a>
      </td></tr>
      </table>
    `),
  };
}

export function newLeadFinalEmail(params: {
  firstName: string;
}): { subject: string; html: string } {
  const { firstName } = params;

  return {
    subject: "Questions? We're here to help",
    html: layout(`
      <h2 style="margin:0 0 16px;color:#0f172a;">Hi ${firstName},</h2>
      <p style="color:#334155;line-height:1.6;">
        We wanted to reach out one more time to see if you have any questions about Mystros Barber Academy or the enrollment process.
      </p>
      <p style="color:#334155;line-height:1.6;">
        We'd love to show you around! <strong>Schedule a campus tour</strong> to meet our instructors, see our facilities, and learn what makes Mystros special.
      </p>
      <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td style="background:#f59e0b;border-radius:6px;padding:12px 24px;margin-right:12px;">
        <a href="https://mystrosbarber.com/contact" style="color:#ffffff;text-decoration:none;font-weight:bold;">Schedule a Tour</a>
        </td>
      </tr>
      </table>
      <p style="color:#334155;line-height:1.6;">
        Or reach out directly:
      </p>
      <ul style="color:#334155;line-height:1.8;list-style:none;padding:0;">
        <li>&#128222; <a href="tel:+17139992904" style="color:#f59e0b;">(713) 999-2904</a></li>
        <li>&#128231; <a href="mailto:admissions@mystrosbarber.com" style="color:#f59e0b;">admissions@mystrosbarber.com</a></li>
      </ul>
      <p style="color:#334155;line-height:1.6;">
        We hope to hear from you soon!
      </p>
    `),
  };
}

export function applicationReminderEmail(params: {
  firstName: string;
  applicationLink: string;
}): { subject: string; html: string } {
  const { firstName, applicationLink } = params;

  return {
    subject: "Your application is waiting!",
    html: layout(`
      <h2 style="margin:0 0 16px;color:#0f172a;">Hi ${firstName},</h2>
      <p style="color:#334155;line-height:1.6;">
        We noticed you started an application but haven't finished yet. Your progress has been saved — pick up right where you left off!
      </p>
      <p style="color:#334155;line-height:1.6;">
        Completing your application is the first step toward a rewarding career in barbering. Classes fill up quickly, so don't wait!
      </p>
      <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr><td style="background:#f59e0b;border-radius:6px;padding:12px 24px;">
      <a href="${applicationLink}" style="color:#ffffff;text-decoration:none;font-weight:bold;">Continue Application</a>
      </td></tr>
      </table>
      <p style="color:#334155;line-height:1.6;">
        Need help? Our admissions team is ready to assist. Call <a href="tel:+17139992904" style="color:#f59e0b;">(713) 999-2904</a> or reply to this email.
      </p>
    `),
  };
}

export function applicationFinalReminderEmail(params: {
  firstName: string;
  applicationLink: string;
}): { subject: string; html: string } {
  const { firstName, applicationLink } = params;

  return {
    subject: "Last chance to complete your application",
    html: layout(`
      <h2 style="margin:0 0 16px;color:#0f172a;">Hi ${firstName},</h2>
      <p style="color:#334155;line-height:1.6;">
        This is a friendly reminder that your application to Mystros Barber Academy is still incomplete.
      </p>
      <p style="margin:16px 0;padding:12px 16px;background:#fffbeb;border-left:4px solid #f59e0b;border-radius:4px;color:#334155;">
        <strong>Don't miss out!</strong> Our next class is filling up and we'd hate for you to miss your spot.
      </p>
      <p style="color:#334155;line-height:1.6;">
        Take a few minutes to finish your application today.
      </p>
      <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr><td style="background:#f59e0b;border-radius:6px;padding:12px 24px;">
      <a href="${applicationLink}" style="color:#ffffff;text-decoration:none;font-weight:bold;">Complete Application</a>
      </td></tr>
      </table>
      <p style="color:#334155;line-height:1.6;">
        If you've decided not to pursue barbering at this time, no worries — we wish you the best! If your plans change, your application will be here.
      </p>
    `),
  };
}

export function acceptedEnrollmentReminderEmail(params: {
  firstName: string;
  enrollmentDeadline?: string;
}): { subject: string; html: string } {
  const { firstName, enrollmentDeadline } = params;
  const deadlineText = enrollmentDeadline
    ? `Please complete enrollment by <strong>${enrollmentDeadline}</strong> to secure your spot.`
    : "Please complete your enrollment as soon as possible to secure your spot.";

  return {
    subject: "Next steps to finalize your enrollment",
    html: layout(`
      <h2 style="margin:0 0 16px;color:#0f172a;">Congratulations again, ${firstName}!</h2>
      <p style="color:#334155;line-height:1.6;">
        Your application to Mystros Barber Academy has been accepted — now let's get you enrolled!
      </p>
      <p style="color:#334155;line-height:1.6;">
        ${deadlineText}
      </p>
      <p style="color:#334155;line-height:1.6;">
        <strong>To finalize enrollment, you'll need to:</strong>
      </p>
      <ol style="color:#334155;line-height:1.8;">
        <li>Complete the enrollment agreement</li>
        <li>Submit required documents (ID, proof of education)</li>
        <li>Complete FAFSA if applying for financial aid (School Code: 042609)</li>
        <li>Meet with financial aid to review your award</li>
      </ol>
      <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr><td style="background:#f59e0b;border-radius:6px;padding:12px 24px;">
      <a href="https://mystrosbarber.com/login" style="color:#ffffff;text-decoration:none;font-weight:bold;">Log In to Complete Enrollment</a>
      </td></tr>
      </table>
      <p style="color:#334155;line-height:1.6;">
        Questions? Call our admissions team at <a href="tel:+17139992904" style="color:#f59e0b;">(713) 999-2904</a>.
      </p>
    `),
  };
}
