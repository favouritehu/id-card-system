import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { CompanyConfig, Employee, PrintConfig } from '../types';

export const generatePDF = async (
    _company: CompanyConfig,
    employees: Employee[],
    printConfig: PrintConfig = {
        scale: 1,
        showBleed: true,
        showCutMarks: true,
        pageFormat: 'a4',
        orientation: 'portrait'
    }
) => {
    const doc = new jsPDF({
        orientation: printConfig.orientation,
        unit: 'mm',
        format: printConfig.pageFormat
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Card dimensions in mm (5.5cm x 8.5cm vertical card)
    const cardWidth = 55;
    const cardHeight = 85;
    const bleed = printConfig.showBleed ? 2 : 0; // 2mm bleed for tighter layout
    const minMargin = 5; // Minimum 5mm margin from page edges

    const fullWidth = cardWidth + (bleed * 2);
    const fullHeight = cardHeight + (bleed * 2);

    // Calculate available space after minimum margins
    const availableWidth = pageWidth - (minMargin * 2);
    const availableHeight = pageHeight - (minMargin * 2);

    // Calculate grid - maximize cards per page
    const colCount = Math.floor(availableWidth / fullWidth);
    const rowCount = Math.floor(availableHeight / fullHeight);

    const totalWidth = colCount * fullWidth;
    const totalHeight = rowCount * fullHeight;

    // Center the cards on the page
    const marginX = (pageWidth - totalWidth) / 2;
    const marginY = (pageHeight - totalHeight) / 2;

    // We need to render each card to an image.
    // Strategy: 
    // 1. Create a temporary container in the DOM hidden from view but rendered.
    // 2. Render IDCardPreview into it for each employee (or one generic template if we swap text - but React makes it easier to just render).
    // 3. Use html2canvas.

    // NOTE: In a real app, we'd iterate. For this prototype, we'll assume the caller passes the DOM elements or we select them from the Preview list?
    // Easier: The caller (PrintLayout) renders the cards in a hidden div, and passes refs or we query them.
    // Let's assume we query by ID convention: `card-print-{employeeId}`.

    // Capture Back Card Template if needed
    let backCardImgData: string | null = null;
    if (printConfig.printBackSide) {
        const backEl = document.getElementById('card-print-back-template');
        if (backEl) {
            try {
                const canvas = await html2canvas(backEl, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false });
                backCardImgData = canvas.toDataURL('image/jpeg', 1.0);
            } catch (e) {
                console.error("Failed to capture back template", e);
            }
        }
    }

    let pageIndex = 0;
    let countOnPage = 0;

    // Track positions on current page for back-side generation
    let currentPagePositions: { col: number, row: number }[] = [];

    const drawCutMarks = (x: number, y: number) => {
        if (!printConfig.showCutMarks) return;
        doc.setLineWidth(0.1);
        doc.setDrawColor(0, 0, 0);
        const markLen = 5;
        const cutX1 = x + bleed;
        const cutX2 = x + bleed + cardWidth;
        const cutY1 = y + bleed;
        const cutY2 = y + bleed + cardHeight;

        // Verticals
        doc.line(cutX1, y - 2, cutX1, y - 2 - markLen);
        doc.line(cutX2, y - 2, cutX2, y - 2 - markLen);
        doc.line(cutX1, y + fullHeight + 2, cutX1, y + fullHeight + 2 + markLen);
        doc.line(cutX2, y + fullHeight + 2, cutX2, y + fullHeight + 2 + markLen);
        // Horizontals
        doc.line(x - 2, cutY1, x - 2 - markLen, cutY1);
        doc.line(x - 2, cutY2, x - 2 - markLen, cutY2);
        doc.line(x + fullWidth + 2, cutY1, x + fullWidth + 2 + markLen, cutY1);
        doc.line(x + fullWidth + 2, cutY2, x + fullWidth + 2 + markLen, cutY2);
    };

    for (let i = 0; i < employees.length; i++) {
        const emp = employees[i];
        const elementId = `card-print-${emp.id}`;
        const element = document.getElementById(elementId);

        if (!element) continue;

        try {
            const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false });
            const imgData = canvas.toDataURL('image/jpeg', 1.0);

            if (imgData === 'data:,') continue;

            const col = countOnPage % colCount;
            const row = Math.floor(countOnPage / colCount);

            const x = marginX + (col * fullWidth);
            const y = marginY + (row * fullHeight);

            doc.addImage(imgData, 'JPEG', x + bleed, y + bleed, cardWidth, cardHeight);
            drawCutMarks(x, y);

            currentPagePositions.push({ col, row });
            countOnPage++;

            // Check if page full OR last item
            if (countOnPage >= colCount * rowCount || i === employees.length - 1) {

                // If back side printing enabled, add Back Side Page IMMEDIATELY after this front page
                if (printConfig.printBackSide && backCardImgData) {
                    doc.addPage(); // Page 2 (Backs)

                    // Render backs for the items on the previous page
                    // MIRRORING LOGIC:
                    // If proper double-sided printing (flip on long edge):
                    // Col 0 on Front -> Col (MaxCol - 1 - 0) on Back.
                    // Rows match (Top row front is Top row back).

                    currentPagePositions.forEach(pos => {
                        // Mirror Column
                        const mirrorCol = colCount - 1 - pos.col;
                        const backX = marginX + (mirrorCol * fullWidth);
                        const backY = marginY + (pos.row * fullHeight);

                        doc.addImage(backCardImgData!, 'JPEG', backX + bleed, backY + bleed, cardWidth, cardHeight);
                        drawCutMarks(backX, backY);
                    });
                }

                // If not last item, add new Front page for next batch
                if (i < employees.length - 1) {
                    doc.addPage();
                    countOnPage = 0;
                    currentPagePositions = [];
                    pageIndex++;
                }
            }
        } catch (e) {
            console.error("Error capturing card", e);
        }
    }

    return doc;
};
