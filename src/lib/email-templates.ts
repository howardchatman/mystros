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
