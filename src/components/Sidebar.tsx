import React from 'react';
import { Layout, Users, FileText, Settings, Printer } from 'lucide-react';

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
    const navItems = [
        { id: 'admin', label: 'Company Settings', icon: Settings },
        { id: 'employees', label: 'Employee Management', icon: Users },
        { id: 'preview', label: 'Card Preview', icon: FileText },
        { id: 'print', label: 'Print Layout', icon: Printer },
    ];

    return (
        <div className="sidebar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem', color: 'var(--color-primary)' }}>
                <Layout size={32} />
                <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>ID Master</h1>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        >
                            <Icon size={20} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>v1.0.0 Alpha</p>
            </div>
        </div>
    );
};
