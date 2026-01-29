import { NextResponse } from "next/server";
import { prisma } from "@/app/db/prisma";
import PDFDocument from "pdfkit";
import path from "path";
import { formatDisplayDate } from "@/app/utils/utils";
import { Prisma } from "@prisma/client";

const APP_URL = process.env.APP_URL ?? "";

type ExportRequest =
  | {
      mode: "SINGLE";
      submissionId: string;
    }
  | {
      mode: "FILTERED";
      searchText?: string;
      roleIds?: string[];
      companyIds?: string[];
      roundIds?: string[];
      dateRange?: [string, string];
    };

type SubmissionVersionWithRelations = Prisma.SubmissionVersionGetPayload<{
  include: {
    questions: true;
    submission: {
      include: {
        interview: {
          include: {
            company: true;
            role: true;
            round: true;
            resource: true;
          };
        };
      };
    };
  };
}>;

export async function POST(req: Request) {
  let body: ExportRequest;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  /* ------------------------------
     1️⃣ Validation
  ------------------------------- */

  if (body.mode === "SINGLE" && !body.submissionId) {
    return NextResponse.json(
      { message: "submissionId is required for SINGLE mode" },
      { status: 400 },
    );
  }

  if (body.mode === "FILTERED" && "submissionId" in body) {
    return NextResponse.json(
      { message: "submissionId not allowed in FILTERED mode" },
      { status: 400 },
    );
  }

  /* ------------------------------
     2️⃣ Fetch APPROVED latest versions
  ------------------------------- */

  let versions: SubmissionVersionWithRelations[];

  if (body.mode === "SINGLE") {
    versions = await prisma.submissionVersion.findMany({
      where: {
        submissionId: body.submissionId,
        status: "APPROVED",
      },
      orderBy: { versionNumber: "desc" },
      take: 1,
      include: {
        questions: true,
        submission: {
          include: {
            interview: {
              include: {
                company: true,
                role: true,
                round: true,
                resource: true,
              },
            },
          },
        },
      },
    });
  } else {
    versions = await prisma.submissionVersion.findMany({
      where: {
        status: "APPROVED",

        submission: {
          interview: {
            ...(body.companyIds?.length && {
              companyId: { in: body.companyIds },
            }),
            ...(body.roleIds?.length && {
              roleId: { in: body.roleIds },
            }),
            ...(body.roundIds?.length && {
              roundId: { in: body.roundIds },
            }),
            ...(body.dateRange && {
              interviewDate: {
                gte: new Date(body.dateRange[0]),
                lte: new Date(body.dateRange[1]),
              },
            }),
          },
        },

        ...(body.searchText && {
          questions: {
            some: {
              text: {
                contains: body.searchText,
                mode: "insensitive",
              },
            },
          },
        }),
      },

      orderBy: [{ submissionId: "asc" }, { versionNumber: "desc" }],
      distinct: ["submissionId"],

      include: {
        questions: true,
        submission: {
          include: {
            interview: {
              include: {
                company: true,
                role: true,
                round: true,
                resource: true,
              },
            },
          },
        },
      },
    });
  }

  if (!versions.length) {
    return NextResponse.json(
      { message: "No approved submissions found" },
      { status: 404 },
    );
  }

  /* ------------------------------
     3️⃣ PDF setup (fonts + stream)
  ------------------------------- */

  const regularFontPath = path.join(
    process.cwd(),
    "public/fonts/Roboto-Regular.ttf",
  );

  const boldFontPath = path.join(process.cwd(), "public/fonts/Roboto-Bold.ttf");

  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    font: regularFontPath, // critical to avoid Helvetica crash
  });

  doc.registerFont("Regular", regularFontPath);
  doc.registerFont("Bold", boldFontPath);

  const stream = new ReadableStream({
    start(controller) {
      doc.on("data", (chunk: Uint8Array) => controller.enqueue(chunk));
      doc.on("end", () => controller.close());
    },
  });

  /* ------------------------------
     4️⃣ Header
  ------------------------------- */

  const headerY = doc.y;

  // Logo
  doc.image(path.join(process.cwd(), "public/logo.png"), 40, headerY, {
    width: 16,
  });

  // Make logo clickable
  if (APP_URL) {
    doc.link(40, headerY, 16, 16, APP_URL);
  }

  // Title text (clickable)
  doc
    .font("Bold")
    .fontSize(14)
    .fillColor("#000000")
    .text("Interview Ready", 60, headerY, {
      link: APP_URL || undefined,
      underline: false,
    });

  doc
    .font("Regular")
    .fontSize(9)
    .text(formatDisplayDate(new Date()), 40, headerY + 6, {
      align: "right",
    });

  // Divider
  doc
    .moveTo(40, headerY + 28)
    .lineTo(555, headerY + 28)
    .lineWidth(0.7)
    .strokeColor("#E5E7EB")
    .stroke();

  doc.moveDown(1);

  /* ------------------------------
     5️⃣ Body (grouped & styled)
  ------------------------------- */

  let currentGroup = "";
  let counter = 1;

  for (const version of versions) {
    const interview = version.submission.interview;

    const groupKey = [
      interview.company.name,
      interview.round.name,
      interview.role.name,
      interview.resource.name,
    ].join("|");

    if (groupKey !== currentGroup) {
      doc.moveDown(1.5);

      // Company · Role · Round (left) + Interview Date (right)
      const rowY = doc.y;

      doc
        .font("Bold")
        .fontSize(11)
        .text(
          `${interview.company.name} · ${interview.role.name} · ${interview.round.name}`,
          40,
          rowY,
          { width: 350 },
        );

      doc
        .font("Regular")
        .fontSize(9)
        .text(
          interview.interviewDate
            ? formatDisplayDate(interview.interviewDate)
            : "",
          400,
          rowY,
          {
            width: 155,
            align: "right",
          },
        );
      doc.moveDown(0.4);
      // Resource name + email
      doc
        .font("Regular")
        .fontSize(8.5)
        .fillColor("#6B7280")
        .text(
          `${interview.resource.name} · ${interview.resource.email ?? ""}`,
          40,
        )
        .fillColor("#000000");

      doc.moveDown(0.8);

      counter = 1;
      currentGroup = groupKey;
    }

    // Questions
    for (const q of version.questions) {
      doc
        .font("Regular")
        .fontSize(10)
        .text(`${counter}.`, 40, doc.y, { continued: true });

      doc.text(q.text, 45, doc.y, {
        width: 495,
        lineGap: 3,
      });

      counter++;
      doc.moveDown(0.2);
    }

    // Subtle separator between groups
    doc
      .moveTo(40, doc.y + 6)
      .lineTo(555, doc.y + 6)
      .lineWidth(0.3)
      .strokeColor("#F3F4F6")
      .stroke();
  }

  doc.end();

  /* ------------------------------
     6️⃣ Response
  ------------------------------- */

  const filename = `IR questions ${new Date()
    .toLocaleDateString("en-GB")
    .replace(/\//g, "-")}.pdf`;

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
