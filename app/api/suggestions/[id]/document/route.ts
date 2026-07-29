import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import ExcelJS from "exceljs";
import connectToDatabase from "@/lib/mongodb";
import Suggestion from "@/models/Suggestion";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const suggestion = await Suggestion.findById(id)
      .populate("author", "name npk shift")
      .populate("department", "name section");

    if (!suggestion) {
      return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
    }

    if (suggestion.status !== "Approved") {
      return NextResponse.json(
        { error: "Dokumen hanya bisa di-generate untuk suggestion yang sudah Approved." },
        { status: 400 }
      );
    }

    // Read template
    const templatePath = path.join(process.cwd(), "public", "templates", "FR.MI-001-26 Form Suggestion System.xlsx");
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json({ error: "Template file not found" }, { status: 500 });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    const sheet = workbook.getWorksheet("Form");

    if (!sheet) {
      return NextResponse.json({ error: "Sheet 'Form' not found in template" }, { status: 500 });
    }

    // Helper to set cell value
    const setCell = (addr: string, value: string | number) => {
      const cell = sheet.getCell(addr);
      cell.value = value;
    };

    // === FILL DATA ===
    const author = suggestion.author as any;
    const dept = suggestion.department as any;
    const assessment = suggestion.assessment;

    // -- Data Pembuat SS --
    setCell("D11", author?.name || "-");
    setCell("D12", author?.npk || "-");
    setCell("K11", dept?.name || "-");
    setCell("K12", dept?.section || "-");

    // -- Kriteria SS (category) - mark with ✓ --
    const category = suggestion.category;
    if (category === "Safety / 5S / Lingkungan") {
      setCell("E7", "✓ SAFETY");
    } else if (category === "Quality / Product Improvement") {
      setCell("G7", "✓ QUALITY");
    } else if (category === "Cost Down / Efisiensi Biaya Operasional") {
      setCell("I7", "✓ COST");
    }

    // -- Periode SS (month of creation) --
    const createdDate = new Date(suggestion.createdAt);
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const monthCells = ["E8", "F8", "G8", "H8", "I8", "J8", "K8", "L8", "M8", "N8", "P8", "Q8"];
    const monthIndex = createdDate.getMonth();
    // Mark the correct month with ✓
    setCell(monthCells[monthIndex], `✓ ${monthNames[monthIndex]}`);

    // -- Data Improvement --
    setCell("D15", suggestion.title || "-");
    
    // Tanggal Pembuatan
    const formatDate = (d: Date) => {
      return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    };
    setCell("D16", formatDate(createdDate));

    // Tanggal Implementasi (approvedAt or updatedAt)
    const approvedDate = new Date(suggestion.updatedAt);
    setCell("K16", formatDate(approvedDate));

    // -- Kondisi Saat Ini (Problem) --
    // Strip HTML tags for clean text
    const stripHtml = (html: string) => {
      return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
    };
    setCell("C19", stripHtml(suggestion.problem || ""));
    const c19 = sheet.getCell("C19");
    c19.alignment = { wrapText: true, vertical: "top", horizontal: "left" };

    // -- Proses Perbaikan (Solution) --
    setCell("J19", stripHtml(suggestion.solution || ""));
    const j19 = sheet.getCell("J19");
    j19.alignment = { wrapText: true, vertical: "top", horizontal: "left" };

    // -- Hasil Perbaikan (summary from cost effective) --
    if (suggestion.costEffective?.explanation) {
      setCell("C37", stripHtml(suggestion.costEffective.explanation));
    }
    if (suggestion.costEffective?.nominal > 0) {
      setCell("C38", `Penghematan: Rp ${suggestion.costEffective.nominal.toLocaleString("id-ID")}`);
    }

    // === KOLOM PENILAIAN #1 ===
    if (assessment) {
      // Row 35 area for Kolom Penilaian #1 scoring (Nilai is in column O)
      setCell("O35", assessment.original || 0);       // Original point
      setCell("O36", assessment.hoshinKanri || 0);     // Hoshin Kanri point
      setCell("O37", assessment.yokoten || 0);         // Yokoten point

      // Subtotal Kolom 1
      const subtotalKolom1 = (assessment.original || 0) + (assessment.hoshinKanri || 0) + (assessment.yokoten || 0);
      setCell("O38", subtotalKolom1);

      // === KOLOM PENILAIAN #2 (SQCDMPE+P) ===
      const sqcdmpe = assessment.sqcdmpe || {};
      
      // Box areas for SQCDMPE+P - mapped to right side of each box (columns K, M, O, Q)
      setCell("K41", sqcdmpe.safety || 0);
      setCell("M41", sqcdmpe.quality || 0);
      setCell("O41", sqcdmpe.cost || 0);
      setCell("Q41", sqcdmpe.environment || 0);
      
      setCell("K43", sqcdmpe.delivery || 0);
      setCell("M43", sqcdmpe.morale || 0);
      setCell("O43", sqcdmpe.productivity || 0);
      setCell("Q43", sqcdmpe.peopleDevelopment || 0);

      // Subtotal SQCDMPE+P
      const subtotalSQCDMPE = Object.values(sqcdmpe).reduce((a: number, b: number) => a + b, 0);
      setCell("K45", subtotalSQCDMPE); // Akumulasi SQCDMPE

      // Total Point
      const totalPoint = subtotalKolom1 + subtotalSQCDMPE;
      setCell("Q48", totalPoint);
    }

    // -- Nama Pembuat (footer signature area) --
    setCell("M53", author?.name || "-");

    // -- Nomer SS (unique ID) --
    const ssId = suggestion._id.toString().substring(suggestion._id.toString().length - 8).toUpperCase();
    const ssMonth = String(createdDate.getMonth() + 1).padStart(2, "0");
    const ssYear = createdDate.getFullYear();
    const deptCode = (dept?.name || "DEPT").substring(0, 3).toUpperCase();
    setCell("E6", `SS-${ssId}/${ssMonth}/${ssYear}/${deptCode}`);

    // === IMAGES ===
    // 1. Logo
    const logoPath = path.join(process.cwd(), "public", "assets", "logo.png");
    if (fs.existsSync(logoPath)) {
      const logoId = workbook.addImage({
        filename: logoPath,
        extension: "png",
      });
      // Place logo at top left (A1 to C4 area)
      sheet.addImage(logoId, "B2:D5");
    }

    // 2. Images from Kondisi Saat Ini (problem)
    const extractBase64Image = (html: string) => {
      const match = html.match(/src="data:image\/(png|jpeg|jpg|gif);base64,([^"]+)"/);
      if (match) {
        return { ext: match[1], base64: match[2] };
      }
      return null;
    };

    const problemImg = extractBase64Image(suggestion.problem || "");
    if (problemImg) {
      try {
        const imgId = workbook.addImage({
          base64: `data:image/${problemImg.ext};base64,${problemImg.base64}`,
          extension: problemImg.ext as any,
        });
        sheet.addImage(imgId, "C21:I32");
      } catch (e) {
        console.error("Failed to add problem image", e);
      }
    }

    // 3. Images from Proses Perbaikan (solution)
    const solutionImg = extractBase64Image(suggestion.solution || "");
    if (solutionImg) {
      try {
        const imgId = workbook.addImage({
          base64: `data:image/${solutionImg.ext};base64,${solutionImg.base64}`,
          extension: solutionImg.ext as any,
        });
        sheet.addImage(imgId, "J21:Q32");
      } catch (e) {
        console.error("Failed to add solution image", e);
      }
    }

    // Write workbook to buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Generate filename
    const safeTitle = (suggestion.title || "suggestion")
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "_")
      .substring(0, 40);
    const fileName = `FR.MI-001-26_${safeTitle}_${ssId}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error("Document generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate document: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}

