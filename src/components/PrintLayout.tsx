import React, { useState, useMemo } from 'react';
import { Download, Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CompanyConfig, Employee } from '../types';
import { IDCardPreview } from './IDCardPreview';
import { generatePDF } from '../utils/pdfGenerator';
import type { PrintConfig } from '../types';

const ITEMS_PER_PAGE = 12; // Number of cards to show per page

interface PrintLayoutProps {
    company: CompanyConfig;
    employees: Employee[];
}

export const PrintLayout: React.FC<PrintLayoutProps> = ({ company, employees }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [printConfig, setPrintConfig] = useState<PrintConfig>({
        scale: 1,
        showBleed: true,
        showCutMarks: true,
        pageFormat: 'a4',
        orientation: 'portrait'
    });

    // Pagination calculations
    const totalPages = Math.ceil(employees.length / ITEMS_PER_PAGE);
    const paginatedEmployees = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return employees.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [employees, currentPage]);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Selection & Quantity State
    const [selections, setSelections] = useState<Record<string, number>>(() => {
        // Init with 1 for all
        const initial: Record<string, number> = {};
        employees.forEach(e => initial[e.id] = 1);
        return initial;
    });

    const toggleSelection = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        setSelections(prev => ({
            ...prev,
            [id]: e.target.checked ? 1 : 0
        }));
    };

    const updateQuantity = (id: string, delta: number) => {
        setSelections(prev => {
            const current = prev[id] || 0;
            const newVal = Math.max(0, current + delta);
            return { ...prev, [id]: newVal };
        });
    };

    const handleDownload = async () => {
        setIsGenerating(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for render & images to load

            // Create exploded list of employees based on counts
            const employeesToPrint: Employee[] = [];
            // We need to keep a mapping of WHICH original employee ID maps to the rendered ID, 
            // BUT actually pdfGenerator uses the DOM ID.
            // Problem: pdfGenerator looks for `card-print-{id}`.
            // If we have multiple copies, we can reuse the SAME DOM element source image!
            // So we just need to pass an array of employees to generatePDF.
            // If Employee A is in the array 5 times, pdfGenerator will loop 5 times, 
            // look for `card-print-A`, capture it, and place it.
            // Optimisation: Capture once, place multiple times? 
            // Current pdfGenerator loop captures every time. That's fine for now, or we can optimize later.
            // Actually, we should pass the list.

            employees.forEach(emp => {
                const count = selections[emp.id] || 0;
                for (let i = 0; i < count; i++) {
                    employeesToPrint.push(emp);
                }
            });

            if (employeesToPrint.length === 0) {
                alert("Please select at least one card to print.");
                setIsGenerating(false);
                return;
            }

            const doc = await generatePDF(company, employeesToPrint, printConfig);
            if (doc && doc.getNumberOfPages() > 0) {
                doc.save('id-cards.pdf');
            } else {
                alert("Could not generate PDF pages. Please try again.");
            }
        } catch (error) {
            console.error("PDF Generation failed", error);
            alert("Failed to generate PDF");
        } finally {
            setIsGenerating(false);
        }
    };

    // Calculate total
    const totalCards = Object.values(selections).reduce((sum, val) => sum + val, 0);

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="header-title" style={{ marginBottom: 0 }}>Print Layout</h2>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                        <input
                            type="checkbox"
                            checked={printConfig.showCutMarks}
                            onChange={e => setPrintConfig({ ...printConfig, showCutMarks: e.target.checked })}
                        />
                        Show Cut Marks
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                        <input
                            type="checkbox"
                            checked={printConfig.printBackSide}
                            onChange={e => setPrintConfig({ ...printConfig, printBackSide: e.target.checked })}
                        />
                        Print Back Side
                    </label>

                    <button
                        className="btn btn-primary"
                        onClick={handleDownload}
                        disabled={isGenerating || totalCards === 0}
                    >
                        {isGenerating ? <Loader className="animate-spin" /> : <Download />}
                        {isGenerating ? 'Generating...' : `Download PDF (${totalCards})`}
                    </button>
                </div>
            </div>

            {printConfig.printBackSide && (
                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fcd34d', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', color: '#92400e' }}>
                    <strong>🖨️  Single-Sided Printer Tip:</strong> Print the <b>Odd Pages</b> (Fronts) first. Then flip the printed pages, put them back in the tray, and print the <b>Even Pages</b> (Backs). The designs are automatically mirrored to align perfectly.
                </div>
            )}

            {employees.length === 0 ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <p>No employees to print. Add employees first.</p>
                </div>
            ) : (
                <>
                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Select Cards to Print</h3>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button style={{ color: 'var(--color-primary)', fontSize: '0.9rem' }} onClick={() => {
                                    const newSel: Record<string, number> = {};
                                    employees.forEach(e => newSel[e.id] = 1);
                                    setSelections(newSel);
                                }}>Select All</button>
                                <button style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }} onClick={() => setSelections({})}>Deselect All</button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {paginatedEmployees.map(emp => {
                                const count = selections[emp.id] || 0;
                                const isSelected = count > 0;
                                return (
                                    <div key={emp.id} style={{
                                        border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: '1rem',
                                        backgroundColor: isSelected ? 'var(--color-bg-subtle)' : '#fff',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '1rem'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={(e) => toggleSelection(e, emp.id)}
                                                    style={{ width: '1.2rem', height: '1.2rem' }}
                                                />
                                                Select
                                            </label>

                                            {isSelected && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fff', padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                                                    <button
                                                        onClick={() => updateQuantity(emp.id, -1)}
                                                        style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', backgroundColor: '#f1f5f9' }}
                                                    >-</button>
                                                    <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 'bold' }}>{count}</span>
                                                    <button
                                                        onClick={() => updateQuantity(emp.id, 1)}
                                                        style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', backgroundColor: '#f1f5f9' }}
                                                    >+</button>
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ transform: 'scale(0.55)', transformOrigin: 'top left', height: '180px', width: '120px', overflow: 'visible' }}>
                                            <IDCardPreview company={company} employee={emp} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginTop: '1.5rem',
                                paddingTop: '1rem',
                                borderTop: '1px solid var(--color-border)'
                            }}>
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        padding: '0.5rem 1rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                        backgroundColor: currentPage === 1 ? '#f1f5f9' : '#fff',
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                        opacity: currentPage === 1 ? 0.5 : 1,
                                        color: 'var(--color-text)',
                                        fontWeight: 500
                                    }}
                                >
                                    <ChevronLeft size={16} />
                                    Previous
                                </button>

                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => goToPage(page)}
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: 'var(--radius-md)',
                                                border: currentPage === page ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                                backgroundColor: currentPage === page ? 'var(--color-primary)' : '#fff',
                                                color: currentPage === page ? '#fff' : 'var(--color-text)',
                                                cursor: 'pointer',
                                                fontWeight: currentPage === page ? 600 : 400
                                            }}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        padding: '0.5rem 1rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                        backgroundColor: currentPage === totalPages ? '#f1f5f9' : '#fff',
                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                        opacity: currentPage === totalPages ? 0.5 : 1,
                                        color: 'var(--color-text)',
                                        fontWeight: 500
                                    }}
                                >
                                    Next
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}

                        {/* Page Info */}
                        {totalPages > 1 && (
                            <div style={{
                                textAlign: 'center',
                                marginTop: '0.75rem',
                                fontSize: '0.875rem',
                                color: 'var(--color-text-secondary)'
                            }}>
                                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, employees.length)} of {employees.length} employees
                            </div>
                        )}
                    </div>

                    {/* 
                      Hidden Render Container 
                      We only need to render EACH UNIQUE EMPLOYEE once. 
                      The PDF generator will look them up by ID. 
                      So we simply render 'employees' here, NOT the exploded list.
                    */}
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '2000px',
                            zIndex: -1000,
                            opacity: 0, // Make it invisible to user
                            pointerEvents: 'none'
                        }}
                    >
                        {employees.map(emp => (
                            <div key={emp.id} id={`card-print-${emp.id}`} style={{ display: 'inline-block', margin: '0' }}>
                                {/* Render at exact print scale (1x) and we will scale up in html2canvas if needed, or render 2x here */}
                                <IDCardPreview company={company} employee={emp} scale={2} />
                            </div>
                        ))}
                    </div>
                    {/* Hidden Back Cards for Each Employee */}
                    <div
                        style={{
                            position: 'fixed', top: 0, left: 0, width: '2000px', zIndex: -1001, opacity: 0, pointerEvents: 'none'
                        }}
                    >
                        {employees.map(emp => (
                            <div key={`back-${emp.id}`} id={`card-print-back-${emp.id}`} style={{ display: 'inline-block', margin: '0' }}>
                                <IDCardPreview company={company} employee={emp} scale={2} side="back" />
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
