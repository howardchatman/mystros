"use server";

import { createClient } from "@/lib/supabase/server";
import { getResend, FROM_EMAIL } from "@/lib/email";
import {
  applicationStatusEmail,
  sapAlertEmail,
  disbursementReleasedEmail,
  documentRequestEmail,
  documentRejectionEmail,
  enrollmentConfirmationEmail,
  paymentConfirmationEmail,
  attendanceAlertEmail,
  milestoneAchievementEmail,
  graduationCongratulationsEmail,
} from "@/lib/email-templates";

async function getStudentProfile(studentId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("students")
    .select("email, first_name, user_id")
    .eq("id", studentId)
    .single();
  return data;
}

async function getUserProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_profiles")
    .select("email, first_name")
    .eq("user_id", userId)
    .single();
  return data;
}

export async function sendApplicationStatusEmail(
  userId: string,
  status: "accepted" | "denied"
) {
  try {
    const profile = await getUserProfile(userId);
    if (!profile?.email) return { success: false, error: "No email found" };

    const { subject, html } = applicationStatusEmail({
      firstName: profile.first_name,
      status,
    });

    await getResend().emails.send({ from: FROM_EMAIL, to: profile.email, subject, html });
    return { success: true };
  } catch (err) {
    console.error("[Email] Application status failed:", err);
    return { success: false, error: String(err) };
  }
}

export async function sendSapAlertEmail(studentId: string, sapStatus: string) {
  try {
    const student = await getStudentProfile(studentId);
    if (!student?.email) return { success: false, error: "No email found" };

    const { subject, html } = sapAlertEmail({
      firstName: student.first_name,
      status: sapStatus,
    });

    await getResend().emails.send({ from: FROM_EMAIL, to: student.email, subject, html });
    return { success: true };
  } catch (err) {
    console.error("[Email] SAP alert failed:", err);
    return { success: false, error: String(err) };
  }
}

export async function sendDisbursementEmail(
  studentId: string,
  amount: number,
  date: string
) {
  try {
    const student = await getStudentProfile(studentId);
    if (!student?.email) return { success: false, error: "No email found" };

    const { subject, html } = disbursementReleasedEmail({
      firstName: student.first_name,
      amount,
      date,
    });

    await getResend().emails.send({ from: FROM_EMAIL, to: student.email, subject, html });
    return { success: true };
  } catch (err) {
    console.error("[Email] Disbursement failed:", err);
    return { success: false, error: String(err) };
  }
}

export async function sendDocumentRequestEmail(
  studentId: string,
  documentTypes: string[]
) {
  try {
    const student = await getStudentProfile(studentId);
    if (!student?.email) return { success: false, error: "No email found" };

    const { subject, html } = documentRequestEmail({
      firstName: student.first_name,
      documents: documentTypes,
    });

    await getResend().emails.send({ from: FROM_EMAIL, to: student.email, subject, html });
    return { success: true };
  } catch (err) {
    console.error("[Email] Document request failed:", err);
    return { success: false, error: String(err) };
  }
}

export async function sendDocumentRejectionEmail(
  studentId: string,
  documentType: string,
  reason: string
) {
  try {
    const student = await getStudentProfile(studentId);
    if (!student?.email) return { success: false, error: "No email found" };

    const { subject, html } = documentRejectionEmail({
      firstName: student.first_name,
      documentType,
      reason,
    });

    await getResend().emails.send({ from: FROM_EMAIL, to: student.email, subject, html });
    return { success: true };
  } catch (err) {
    console.error("[Email] Document rejection failed:", err);
    return { success: false, error: String(err) };
  }
}

export async function sendEnrollmentConfirmationEmail(
  studentId: string,
  programName: string,
  campusName: string,
  startDate: string,
  studentNumber: string
) {
  try {
    const student = await getStudentProfile(studentId);
    if (!student?.email) return { success: false, error: "No email found" };

    const { subject, html } = enrollmentConfirmationEmail({
      firstName: student.first_name,
      studentNumber,
      programName,
      campusName,
      startDate,
    });

    await getResend().emails.send({ from: FROM_EMAIL, to: student.email, subject, html });
    return { success: true };
  } catch (err) {
    console.error("[Email] Enrollment confirmation failed:", err);
    return { success: false, error: String(err) };
  }
}

export async function sendPaymentConfirmationEmail(
  studentId: string,
  amount: number,
  paymentDate: string,
  paymentMethod: string,
  confirmationNumber: string,
  newBalance: number
) {
  try {
    const student = await getStudentProfile(studentId);
    if (!student?.email) return { success: false, error: "No email found" };

    const { subject, html } = paymentConfirmationEmail({
      firstName: student.first_name,
      amount,
      paymentDate,
      paymentMethod,
      confirmationNumber,
      newBalance,
    });

    await getResend().emails.send({ from: FROM_EMAIL, to: student.email, subject, html });
    return { success: true };
  } catch (err) {
    console.error("[Email] Payment confirmation failed:", err);
    return { success: false, error: String(err) };
  }
}

export async function sendAttendanceAlertEmail(
  studentId: string,
  absenceCount: number,
  dateRange: string
) {
  try {
    const student = await getStudentProfile(studentId);
    if (!student?.email) return { success: false, error: "No email found" };

    const { subject, html } = attendanceAlertEmail({
      firstName: student.first_name,
      absenceCount,
      dateRange,
    });

    await getResend().emails.send({ from: FROM_EMAIL, to: student.email, subject, html });
    return { success: true };
  } catch (err) {
    console.error("[Email] Attendance alert failed:", err);
    return { success: false, error: String(err) };
  }
}

export async function sendMilestoneAchievementEmail(
  studentId: string,
  milestone: string,
  totalHours: number,
  percentComplete: number
) {
  try {
    const student = await getStudentProfile(studentId);
    if (!student?.email) return { success: false, error: "No email found" };

    const { subject, html } = milestoneAchievementEmail({
      firstName: student.first_name,
      milestone,
      totalHours,
      percentComplete,
    });

    await getResend().emails.send({ from: FROM_EMAIL, to: student.email, subject, html });
    return { success: true };
  } catch (err) {
    console.error("[Email] Milestone achievement failed:", err);
    return { success: false, error: String(err) };
  }
}

export async function sendGraduationCongratulationsEmail(
  studentId: string,
  programName: string,
  graduationDate: string,
  totalHours: number
) {
  try {
    const student = await getStudentProfile(studentId);
    if (!student?.email) return { success: false, error: "No email found" };

    const { subject, html } = graduationCongratulationsEmail({
      firstName: student.first_name,
      programName,
      graduationDate,
      totalHours,
    });

    await getResend().emails.send({ from: FROM_EMAIL, to: student.email, subject, html });
    return { success: true };
  } catch (err) {
    console.error("[Email] Graduation congratulations failed:", err);
    return { success: false, error: String(err) };
  }
}
