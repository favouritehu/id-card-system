import React from 'react';
import type { CompanyConfig, Employee } from '../types';

interface IDCardPreviewProps {
    company: CompanyConfig;
    employee: Employee;
    scale?: number;
    side?: 'front' | 'back';
}

export const IDCardPreview: React.FC<IDCardPreviewProps> = ({ company, employee, scale = 1, side = 'front' }) => {

    // Vertical ID Card: 5.5cm x 8.5cm (at 96 DPI: ~208px x ~321px)
    const baseWidth = 208;
    const baseHeight = 321;

    const width = baseWidth * scale;
    const height = baseHeight * scale;

    if (scale === 1 && side === 'back') {
        // Simple preview for back side
        // Not used heavily in the main UI, but useful if needed.
    }

    if (side === 'back') {
        // Back side mirrors the front side content for proper double-sided printing
        return (
            <div
                className="id-card-shadow"
                style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    position: 'relative',
                    backgroundColor: '#fff',
                    borderRadius: 0,
                    overflow: 'hidden',
                    boxShadow: scale === 1 ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    fontFamily: "'Inter', sans-serif",
                    border: `${1 * scale}px solid #e2e8f0`
                }}
            >
                {/* Header with Company Name - Same as front */}
                <div style={{
                    width: '100%',
                    height: `${36 * scale}px`,
                    background: `linear-gradient(180deg, ${company.accentColor} 0%, ${company.accentColor}dd 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    <div style={{ fontWeight: 800, fontSize: `${13 * scale}px`, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
                        {company.name}
                    </div>
                </div>

                {/* Content Layer - Same as front */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: `${8 * scale}px ${12 * scale}px ${4 * scale}px` }}>

                    {/* Photo - Centered */}
                    <div style={{
                        width: `${90 * scale}px`,
                        height: `${90 * scale}px`,
                        borderRadius: `${8 * scale}px`,
                        border: `${2 * scale}px solid #e2e8f0`,
                        overflow: 'hidden',
                        backgroundColor: '#f8fafc',
                        marginBottom: `${5 * scale}px`,
                        flexShrink: 0
                    }}>
                        {employee.photoUrl ? (
                            <img src={employee.photoUrl} alt="E" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: `${28 * scale}px` }}>
                                👤
                            </div>
                        )}
                    </div>

                    {/* Employee Name */}
                    <h2 style={{ margin: `0 0 ${4 * scale}px`, fontSize: `${14 * scale}px`, fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>
                        {employee.name}
                    </h2>

                    {/* Details - Vertical List */}
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: `${2 * scale}px`, flex: 1 }}>

                        {/* ID */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: `${9 * scale}px`, color: '#64748b', fontWeight: 600 }}>ID NO:</span>
                            <span style={{ fontSize: `${10 * scale}px`, color: '#0f172a', fontWeight: 700 }}>{employee.employeeId}</span>
                        </div>

                        {/* Dept */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: `${9 * scale}px`, color: '#64748b', fontWeight: 600 }}>DEPT:</span>
                            <span style={{ fontSize: `${10 * scale}px`, color: '#0f172a', fontWeight: 600 }}>{employee.department}</span>
                        </div>

                        {/* Phone */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: `${9 * scale}px`, color: '#64748b', fontWeight: 600 }}>PHONE:</span>
                            <span style={{ fontSize: `${10 * scale}px`, color: '#0f172a' }}>{employee.phone || 'N/A'}</span>
                        </div>

                        {/* Emergency */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: `${9 * scale}px`, color: '#ef4444', fontWeight: 600 }}>EMERGENCY:</span>
                            <span style={{ fontSize: `${10 * scale}px`, color: '#ef4444', fontWeight: 700 }}>{employee.emergencyContact || 'N/A'}</span>
                        </div>

                        {/* Address */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: `${1 * scale}px` }}>
                            <span style={{ fontSize: `${9 * scale}px`, color: '#64748b', fontWeight: 600 }}>ADDRESS:</span>
                            <span style={{ fontSize: `${9 * scale}px`, color: '#0f172a', lineHeight: 1.3 }}>
                                {employee.address || 'N/A'}
                            </span>
                        </div>

                    </div>

                </div>

                {/* Zone Color Strip - Same as front */}
                {employee.zoneColor && (
                    <div style={{
                        height: `${22 * scale}px`,
                        backgroundColor: employee.zoneColor,
                        width: '100%',
                        flexShrink: 0
                    }}></div>
                )}
            </div>
        );
    }

    return (
        <div
            className="id-card-shadow"
            style={{
                width: `${width}px`,
                height: `${height}px`,
                position: 'relative',
                backgroundColor: '#fff',
                borderRadius: 0,
                overflow: 'hidden',
                boxShadow: scale === 1 ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: "'Inter', sans-serif",
                border: `${1 * scale}px solid #e2e8f0`
            }}
        >
            {/* Header with Company Name */}
            <div style={{
                width: '100%',
                height: `${36 * scale}px`,
                background: `linear-gradient(180deg, ${company.accentColor} 0%, ${company.accentColor}dd 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
            }}>
                <div style={{ fontWeight: 800, fontSize: `${13 * scale}px`, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
                    {company.name}
                </div>
            </div>

            {/* Content Layer - Vertical Layout */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: `${8 * scale}px ${12 * scale}px ${4 * scale}px` }}>

                {/* Photo - Centered */}
                <div style={{
                    width: `${90 * scale}px`,
                    height: `${90 * scale}px`,
                    borderRadius: `${8 * scale}px`,
                    border: `${2 * scale}px solid #e2e8f0`,
                    overflow: 'hidden',
                    backgroundColor: '#f8fafc',
                    marginBottom: `${5 * scale}px`,
                    flexShrink: 0
                }}>
                    {employee.photoUrl ? (
                        <img src={employee.photoUrl} alt="E" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: `${28 * scale}px` }}>
                            👤
                        </div>
                    )}
                </div>

                {/* Employee Name */}
                <h2 style={{ margin: `0 0 ${4 * scale}px`, fontSize: `${14 * scale}px`, fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>
                    {employee.name}
                </h2>

                {/* Details - Vertical List */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: `${2 * scale}px`, flex: 1 }}>

                    {/* ID */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: `${9 * scale}px`, color: '#64748b', fontWeight: 600 }}>ID NO:</span>
                        <span style={{ fontSize: `${10 * scale}px`, color: '#0f172a', fontWeight: 700 }}>{employee.employeeId}</span>
                    </div>

                    {/* Dept */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: `${9 * scale}px`, color: '#64748b', fontWeight: 600 }}>DEPT:</span>
                        <span style={{ fontSize: `${10 * scale}px`, color: '#0f172a', fontWeight: 600 }}>{employee.department}</span>
                    </div>

                    {/* Phone */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: `${9 * scale}px`, color: '#64748b', fontWeight: 600 }}>PHONE:</span>
                        <span style={{ fontSize: `${10 * scale}px`, color: '#0f172a' }}>{employee.phone || 'N/A'}</span>
                    </div>

                    {/* Emergency */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: `${9 * scale}px`, color: '#ef4444', fontWeight: 600 }}>EMERGENCY:</span>
                        <span style={{ fontSize: `${10 * scale}px`, color: '#ef4444', fontWeight: 700 }}>{employee.emergencyContact || 'N/A'}</span>
                    </div>

                    {/* Address */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: `${1 * scale}px` }}>
                        <span style={{ fontSize: `${9 * scale}px`, color: '#64748b', fontWeight: 600 }}>ADDRESS:</span>
                        <span style={{ fontSize: `${9 * scale}px`, color: '#0f172a', lineHeight: 1.3 }}>
                            {employee.address || 'N/A'}
                        </span>
                    </div>

                </div>



            </div>

            {/* Zone Color Strip */}
            {employee.zoneColor && (
                <div style={{
                    height: `${22 * scale}px`,
                    backgroundColor: employee.zoneColor,
                    width: '100%',
                    flexShrink: 0
                }}></div>
            )}
        </div>
    );
};
