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

    let pageIndex = 0;
    let countOnPage = 0;

    // Track positions and employee IDs on current page for back-side generation
    let currentPageData: { col: number, row: number, empId: string }[] = [];

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

            currentPageData.push({ col, row, empId: emp.id });
            countOnPage++;

            // Check if page full OR last item
            if (countOnPage >= colCount * rowCount || i === employees.length - 1) {

                // If back side printing enabled, add Back Side Page IMMEDIATELY after this front page
                if (printConfig.printBackSide) {
                    doc.addPage(); // Page 2 (Backs)

                    // Render backs for the items on the previous page
                    // MIRRORING LOGIC:
                    // If proper double-sided printing (flip on long edge):
                    // Col 0 on Front -> Col (MaxCol - 1 - 0) on Back.
                    // Rows match (Top row front is Top row back).

                    for (const pos of currentPageData) {
                        // Capture the specific employee's back card
                        const backElementId = `card-print-back-${pos.empId}`;
                        const backElement = document.getElementById(backElementId);

                        if (backElement) {
                            try {
                                const backCanvas = await html2canvas(backElement, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false });
                                const backImgData = backCanvas.toDataURL('image/jpeg', 1.0);

                                if (backImgData !== 'data:,') {
                                    // Mirror Column for proper alignment when printing double-sided
                                    const mirrorCol = colCount - 1 - pos.col;
                                    const backX = marginX + (mirrorCol * fullWidth);
                                    const backY = marginY + (pos.row * fullHeight);

                                    doc.addImage(backImgData, 'JPEG', backX + bleed, backY + bleed, cardWidth, cardHeight);
                                    drawCutMarks(backX, backY);
                                }
                            } catch (e) {
                                console.error("Error capturing back card", e);
                            }
                        }
                    }
                }

                // If not last item, add new Front page for next batch
                if (i < employees.length - 1) {
                    doc.addPage();
                    countOnPage = 0;
                    currentPageData = [];
                    pageIndex++;
                }
            }
        } catch (e) {
            console.error("Error capturing card", e);
        }
    }

    return doc;
};

