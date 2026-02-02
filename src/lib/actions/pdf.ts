"use server";

import { createClient } from "@/lib/supabase/server";
import { getSapHistory } from "@/lib/actions/sap";

// jspdf is loaded dynamically to avoid SSR bundling issues
async function getJsPDF() {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  return { jsPDF, autoTable };
}

function formatDate(d: string | null) {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function addHeader(doc: any, title: string) {
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 30, "F");

  doc.setTextColor(245, 158, 11); // amber-500
  doc.setFontSize(22);
  doc.text("M", 14, 18);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text("Mystros Barber Academy", 24, 18);

  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(title, 14, 26);

  doc.setTextColor(0, 0, 0);
  return 40; // y position after header
}

function addFooter(doc: any) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Generated ${new Date().toLocaleDateString("en-US")} | Page ${i} of ${pageCount}`,
      105,
      290,
      { align: "center" }
    );
  }
}

// ─── Transcript PDF ──────────────────────────────────────────

export async function generateTranscript(studentId: string) {
  const supabase = await createClient();

  const [{ data: student }, sapHistory] = await Promise.all([
    supabase
      .from("students")
      .select(`
        *,
        program:programs(name, total_hours, theory_hours, practical_hours, code),
        campus:campuses(name, address)
      `)
      .eq("id", studentId)
      .single(),
    getSapHistory(studentId),
  ]);

  if (!student) return { error: "Student not found" };

  const program = Array.isArray(student.program) ? student.program[0] : student.program;
  const campus = Array.isArray(student.campus) ? student.campus[0] : student.campus;

  // Get competencies
  const { data: definitions } = await supabase
    .from("competency_definitions")
    .select("id, name, category, is_required")
    .eq("program_id", student.program_id)
    .eq("is_active", true)
    .order("category")
    .order("sort_order");

  const { data: studentComps } = await supabase
    .from("student_competencies")
    .select("competency_definition_id, completed_at")
    .eq("student_id", studentId);

  const compMap = new Map((studentComps || []).map((c) => [c.competency_definition_id, c.completed_at]));

  const { jsPDF, autoTable } = await getJsPDF();
  const doc = new jsPDF();

  let y = addHeader(doc, "Official Transcript");

  // Student info
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`${student.first_name} ${student.last_name}`, 14, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const info = [
    `Student #: ${student.student_number || "N/A"}`,
    `Program: ${program?.name || "N/A"} (${program?.code || ""})`,
    `Campus: ${campus?.name || "N/A"}`,
    `Enrollment: ${formatDate(student.enrollment_date)} | Start: ${formatDate(student.start_date)}`,
    `Status: ${(student.status || "").replace(/_/g, " ").toUpperCase()}`,
  ];
  if (student.actual_graduation_date) {
    info.push(`Graduated: ${formatDate(student.actual_graduation_date)}`);
  }
  info.forEach((line) => {
    doc.text(line, 14, y);
    y += 5;
  });
  y += 4;

  // Hours Summary
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Hours Summary", 14, y);
  y += 2;

  autoTable(doc, {
    startY: y,
    head: [["Category", "Required", "Completed", "Remaining", "% Complete"]],
    body: [
      [
        "Theory",
        String(program?.theory_hours || 0),
        String(student.theory_hours_completed || 0),
        String(Math.max(0, (program?.theory_hours || 0) - (student.theory_hours_completed || 0))),
        `${Math.round(((student.theory_hours_completed || 0) / (program?.theory_hours || 1)) * 100)}%`,
      ],
      [
        "Practical",
        String(program?.practical_hours || 0),
        String(student.practical_hours_completed || 0),
        String(Math.max(0, (program?.practical_hours || 0) - (student.practical_hours_completed || 0))),
        `${Math.round(((student.practical_hours_completed || 0) / (program?.practical_hours || 1)) * 100)}%`,
      ],
      [
        "Total",
        String(program?.total_hours || 0),
        String(student.total_hours_completed || 0),
        String(Math.max(0, (program?.total_hours || 0) - (student.total_hours_completed || 0))),
        `${Math.round(((student.total_hours_completed || 0) / (program?.total_hours || 1)) * 100)}%`,
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [15, 23, 42] },
    styles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Competencies
  if (definitions && definitions.length > 0) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Competencies", 14, y);
    y += 2;

    const compRows = definitions.map((d) => [
      d.category,
      d.name,
      d.is_required ? "Yes" : "No",
      compMap.has(d.id) ? "Completed" : "Pending",
      compMap.has(d.id) ? formatDate(compMap.get(d.id)!) : "—",
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Category", "Competency", "Required", "Status", "Completed"]],
      body: compRows,
      theme: "grid",
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 7 },
      margin: { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // SAP History
  if (sapHistory.length > 0) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("SAP Evaluation History", 14, y);
    y += 2;

    const sapRows = sapHistory.map((s: any) => [
      formatDate(s.evaluation_date),
      (s.status || "").replace(/_/g, " "),
      `${s.attendance_rate || 0}%`,
      `${s.completion_rate || 0}%`,
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Date", "Status", "Attendance Rate", "Completion Rate"]],
      body: sapRows,
      theme: "grid",
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });
  }

  addFooter(doc);

  const base64 = doc.output("datauristring").split(",")[1];
  return { data: base64, fileName: `transcript_${student.student_number || studentId}.pdf` };
}

// ─── Certificate PDF ─────────────────────────────────────────

export async function generateCertificate(studentId: string) {
  const supabase = await createClient();

  const { data: student } = await supabase
    .from("students")
    .select(`
      *,
      program:programs(name, total_hours),
      campus:campuses(name)
    `)
    .eq("id", studentId)
    .single();

  if (!student) return { error: "Student not found" };
  if (student.status !== "graduated") return { error: "Certificate only available for graduated students" };

  const program = Array.isArray(student.program) ? student.program[0] : student.program;
  const campus = Array.isArray(student.campus) ? student.campus[0] : student.campus;

  const { jsPDF } = await getJsPDF();
  const doc = new jsPDF({ orientation: "landscape" });

  // Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 297, 210, "F");

  // Border
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(2);
  doc.rect(10, 10, 277, 190);
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.5);
  doc.rect(14, 14, 269, 182);

  // Header
  doc.setTextColor(245, 158, 11);
  doc.setFontSize(28);
  doc.text("M", 148.5, 40, { align: "center" });

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.text("Mystros Barber Academy", 148.5, 50, { align: "center" });

  // Certificate title
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Certificate of Completion", 148.5, 68, { align: "center" });

  // Decorative line
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(1);
  doc.line(80, 73, 217, 73);

  // Body
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  doc.text("This is to certify that", 148.5, 88, { align: "center" });

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text(`${student.first_name} ${student.last_name}`, 148.5, 102, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  doc.text("has successfully completed the requirements for", 148.5, 116, { align: "center" });

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(program?.name || "Program", 148.5, 128, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `${program?.total_hours || 0} Clock Hours | ${campus?.name || "Campus"}`,
    148.5,
    138,
    { align: "center" }
  );

  doc.text(
    `Awarded on ${formatDate(student.actual_graduation_date)}`,
    148.5,
    148,
    { align: "center" }
  );

  // Signature line
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.3);
  doc.line(95, 175, 200, 175);
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("School Director", 148.5, 182, { align: "center" });

  const base64 = doc.output("datauristring").split(",")[1];
  return { data: base64, fileName: `certificate_${student.student_number || studentId}.pdf` };
}

// ─── Financial Statement PDF ─────────────────────────────────

export async function generateFinancialStatement(studentId: string) {
  const supabase = await createClient();

  const [
    { data: student },
    { data: accountArr },
    { data: charges },
    { data: payments },
    { data: aidRecords },
    { data: disbursements },
  ] = await Promise.all([
    supabase
      .from("students")
      .select("*, program:programs(name), campus:campuses(name)")
      .eq("id", studentId)
      .single(),
    supabase.from("student_accounts").select("*").eq("student_id", studentId),
    supabase
      .from("charges")
      .select("charge_date, charge_type, description, amount, is_voided")
      .eq("student_id", studentId)
      .order("charge_date", { ascending: true }),
    supabase
      .from("payments")
      .select("payment_date, amount, payment_method, status, is_refund")
      .eq("student_id", studentId)
      .order("payment_date", { ascending: true }),
    supabase
      .from("financial_aid_records")
      .select("academic_year, status, awards:financial_aid_awards(award_name, award_type, offered_amount, accepted_amount, status)")
      .eq("student_id", studentId)
      .order("academic_year", { ascending: false }),
    supabase
      .from("disbursements")
      .select("disbursement_number, scheduled_date, scheduled_amount, actual_date, actual_amount, status")
      .eq("student_id", studentId)
      .order("scheduled_date", { ascending: true }),
  ]);

  if (!student) return { error: "Student not found" };

  const account = accountArr && accountArr.length > 0 ? accountArr[0] : null;
  const program = Array.isArray(student.program) ? student.program[0] : student.program;
  const campus = Array.isArray(student.campus) ? student.campus[0] : student.campus;

  const { jsPDF, autoTable } = await getJsPDF();
  const doc = new jsPDF();

  let y = addHeader(doc, "Financial Statement");

  // Student info
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`${student.first_name} ${student.last_name}`, 14, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Student #: ${student.student_number || "N/A"} | Program: ${program?.name || "N/A"} | Campus: ${campus?.name || "N/A"}`, 14, y);
  y += 8;

  // Account Summary
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Account Summary", 14, y);
  y += 2;

  const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  autoTable(doc, {
    startY: y,
    head: [["Total Charges", "Total Payments", "Total Aid Posted", "Current Balance"]],
    body: [[
      fmt(account?.total_charges || 0),
      fmt(account?.total_payments || 0),
      fmt(account?.total_aid_posted || 0),
      fmt(account?.current_balance || 0),
    ]],
    theme: "grid",
    headStyles: { fillColor: [15, 23, 42] },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Charges
  if (charges && charges.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Charges", 14, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [["Date", "Type", "Description", "Amount", "Voided"]],
      body: charges.map((c: any) => [
        formatDate(c.charge_date),
        (c.charge_type || "").replace(/_/g, " "),
        c.description || "",
        fmt(c.amount || 0),
        c.is_voided ? "Yes" : "",
      ]),
      theme: "grid",
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Payments
  if (payments && payments.length > 0) {
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Payments", 14, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [["Date", "Amount", "Method", "Status", "Refund"]],
      body: payments.map((p: any) => [
        formatDate(p.payment_date),
        fmt(p.amount || 0),
        (p.payment_method || "").replace(/_/g, " "),
        p.status || "",
        p.is_refund ? "Yes" : "",
      ]),
      theme: "grid",
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Financial Aid
  const normalizedAid = (aidRecords || []).map((r: any) => ({
    ...r,
    awards: Array.isArray(r.awards) ? r.awards : [],
  }));

  if (normalizedAid.length > 0) {
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Financial Aid", 14, y);
    y += 2;

    const aidRows: string[][] = [];
    normalizedAid.forEach((r: any) => {
      r.awards.forEach((a: any) => {
        aidRows.push([
          r.academic_year,
          a.award_name,
          (a.award_type || "").replace(/_/g, " "),
          fmt(a.offered_amount || 0),
          fmt(a.accepted_amount || 0),
          a.status || "",
        ]);
      });
    });

    if (aidRows.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [["Year", "Award", "Type", "Offered", "Accepted", "Status"]],
        body: aidRows,
        theme: "grid",
        headStyles: { fillColor: [15, 23, 42] },
        styles: { fontSize: 7 },
        margin: { left: 14, right: 14 },
      });

      y = (doc as any).lastAutoTable.finalY + 8;
    }
  }

  // Disbursements
  if (disbursements && disbursements.length > 0) {
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Disbursements", 14, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [["#", "Scheduled Date", "Scheduled Amount", "Actual Date", "Actual Amount", "Status"]],
      body: disbursements.map((d: any) => [
        d.disbursement_number || "",
        formatDate(d.scheduled_date),
        fmt(d.scheduled_amount || 0),
        formatDate(d.actual_date),
        d.actual_amount ? fmt(d.actual_amount) : "—",
        d.status || "",
      ]),
      theme: "grid",
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 7 },
      margin: { left: 14, right: 14 },
    });
  }

  addFooter(doc);

  const base64 = doc.output("datauristring").split(",")[1];
  return { data: base64, fileName: `financial_statement_${student.student_number || studentId}.pdf` };
}
