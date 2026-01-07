import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import type { CompanyConfig, Employee } from '../types';

interface IDCardPreviewProps {
    company: CompanyConfig;
    employee: Employee;
    scale?: number;
    side?: 'front' | 'back';
}

export const IDCardPreview: React.FC<IDCardPreviewProps> = ({ company, employee, scale = 1, side = 'front' }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

    useEffect(() => {
        // Generate QR Code containing Employee ID and Name
        const data = JSON.stringify({ id: employee.employeeId, name: employee.name });
        QRCode.toDataURL(data, { margin: 0, width: 100, color: { dark: '#000000', light: '#ffffff00' } }, (err, url) => {
            if (!err) setQrCodeUrl(url);
        });
    }, [employee.employeeId, employee.name]);

    // CR80 Dimensions in mm: 85.60 x 53.98
    const baseWidth = 350;
    const baseHeight = 350 / 1.5857;

    const width = baseWidth * scale;
    const height = baseHeight * scale;

    if (scale === 1 && side === 'back') {
        // Simple preview for back side
        // Not used heavily in the main UI, but useful if needed.
    }

    if (side === 'back') {
        return (
            <div
                className="id-card-shadow"
                style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    position: 'relative',
                    backgroundColor: '#fff',
                    borderRadius: `${10 * scale}px`,
                    overflow: 'hidden',
                    boxShadow: scale === 1 ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Inter', sans-serif",
                    border: `${1 * scale}px solid #e2e8f0`
                }}
            >
                {/* Decorative Top/Bottom Strips if desired, or just centered logo */}
                {/* Let's keep it clean with just the logo as requested "LOGO ON BACK SIDE IN CENTER" */}

                {company.logoUrl && (
                    <div style={{ width: '60%', height: '60%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={company.logoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                )}
                {!company.logoUrl && (
                    <div style={{ textAlign: 'center', opacity: 0.5 }}>
                        <div style={{ fontSize: `${24 * scale}px`, fontWeight: 'bold', color: company.accentColor }}>{company.name}</div>
                        <div style={{ fontSize: `${12 * scale}px` }}>COMPANY LOGO</div>
                    </div>
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
                borderRadius: `${10 * scale}px`,
                overflow: 'hidden',
                boxShadow: scale === 1 ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: "'Inter', sans-serif",
                border: `${1 * scale}px solid #e2e8f0`
            }}
        >
            {/* Decorative Background */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '40px', // Reduced height header
                background: `linear-gradient(90deg, ${company.accentColor} 0%, ${company.accentColor}dd 100%)`,
                zIndex: 0,
                display: 'flex',
                alignItems: 'center',
                paddingLeft: `${16 * scale}px`
            }}>
                {/* Company Name in Header */}
                <div style={{ fontWeight: 800, fontSize: `${12 * scale}px`, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {company.name}
                </div>
            </div>

            {/* Content Layer */}
            <div style={{ position: 'relative', zIndex: 1, padding: `${6 * scale}px ${16 * scale}px ${10 * scale}px`, marginTop: `${30 * scale}px`, flex: 1, display: 'flex' }}>

                {/* Left Column: Photo & Scan Code */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: `${90 * scale}px`, marginRight: `${12 * scale}px` }}>

                    {/* Photo */}
                    <div style={{
                        width: `${85 * scale}px`,
                        height: `${85 * scale}px`,
                        borderRadius: `${8 * scale}px`,
                        border: `${2 * scale}px solid #e2e8f0`,
                        overflow: 'hidden',
                        backgroundColor: '#f8fafc',
                        marginBottom: `${8 * scale}px`
                    }}>
                        {employee.photoUrl ? (
                            <img src={employee.photoUrl} alt="E" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: `${30 * scale}px` }}>
                                👤
                            </div>
                        )}
                    </div>

                    {/* QR Code */}
                    {qrCodeUrl && (
                        <div style={{ textAlign: 'center' }}>
                            <img src={qrCodeUrl} alt="QR" style={{ width: `${50 * scale}px`, height: `${50 * scale}px` }} />
                            <div style={{ fontSize: `${5 * scale}px`, color: '#64748b', marginTop: `${2 * scale}px` }}>SCAN FOR ATTENDANCE</div>
                        </div>
                    )}

                </div>

                {/* Right Column: Details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

                    <h2 style={{ margin: `0 0 ${8 * scale}px`, fontSize: `${16 * scale}px`, fontWeight: 800, color: '#0f172a' }}>
                        {employee.name}
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: `${4 * scale}px`, rowGap: `${6 * scale}px` }}>

                        {/* ID */}
                        <div style={{ fontSize: `${8 * scale}px`, color: '#64748b', fontWeight: 600 }}>ID NO:</div>
                        <div style={{ fontSize: `${9 * scale}px`, color: '#0f172a', fontWeight: 700 }}>{employee.employeeId}</div>

                        {/* Dept */}
                        <div style={{ fontSize: `${8 * scale}px`, color: '#64748b', fontWeight: 600 }}>DEPT:</div>
                        <div style={{ fontSize: `${9 * scale}px`, color: '#0f172a', fontWeight: 600 }}>{employee.department}</div>

                        {/* Phone */}
                        <div style={{ fontSize: `${8 * scale}px`, color: '#64748b', fontWeight: 600 }}>PHONE:</div>
                        <div style={{ fontSize: `${9 * scale}px`, color: '#0f172a' }}>{employee.phone || 'N/A'}</div>

                        {/* Emergency */}
                        <div style={{ fontSize: `${8 * scale}px`, color: '#ef4444', fontWeight: 600 }}>EMERGENCY:</div>
                        <div style={{ fontSize: `${9 * scale}px`, color: '#ef4444', fontWeight: 700 }}>{employee.emergencyContact || 'N/A'}</div>

                        {/* Address */}
                        <div style={{ fontSize: `${8 * scale}px`, color: '#64748b', fontWeight: 600 }}>ADDRESS:</div>
                        <div style={{ fontSize: `${8 * scale}px`, color: '#0f172a', lineHeight: 1.2 }}>
                            {employee.address || 'N/A'}
                        </div>

                    </div>
                </div>

            </div>

            {/* Zone Color Strip */}
            {employee.zoneColor && (
                <div style={{
                    height: `${12 * scale}px`,
                    backgroundColor: employee.zoneColor,
                    width: '100%',
                    marginTop: 'auto'
                }}></div>
            )}
        </div>
    );
};
