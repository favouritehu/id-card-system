import React from 'react';
import { useForm } from 'react-hook-form';
import { Upload } from 'lucide-react';
import type { CompanyConfig } from '../types';
import { compressLogo } from '../utils/imageCompression';

interface AdminPanelProps {
    config: CompanyConfig;
    onUpdate: (config: CompanyConfig) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ config, onUpdate }) => {
    const { register, handleSubmit, setValue, watch } = useForm<CompanyConfig>({
        defaultValues: config
    });

    // Watch for changes to auto-save or preview
    // const watchedValues = watch();

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const compressedImage = await compressLogo(file);
                setValue('logoUrl', compressedImage);
            } catch (err) {
                console.error('Failed to compress logo:', err);
                alert('Failed to process image. Please try a smaller file.');
            }
        }
    };

    const onSubmit = (data: CompanyConfig) => {
        onUpdate(data);
        // Visual feedback could be added here
        alert('Settings saved!');
    };

    return (
        <div className="container">
            <h2 className="header-title">Company Settings</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="card" style={{ maxWidth: '800px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="label">Company Name</label>
                        <input {...register('name')} className="input" placeholder="e.g. Acme Corp" />
                    </div>

                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="label">Address</label>
                        <input {...register('address')} className="input" placeholder="123 Business Rd, Tech City" />
                    </div>

                    <div className="form-group">
                        <label className="label">Start/Contact Phone</label>
                        <input {...register('contact')} className="input" placeholder="+1 (555) 000-0000" />
                    </div>

                    <div className="form-group">
                        <label className="label">Email</label>
                        <input {...register('email')} className="input" placeholder="admin@acme.com" />
                    </div>

                    <div className="form-group">
                        <label className="label">Website</label>
                        <input {...register('website')} className="input" placeholder="www.acme.com" />
                    </div>

                    <div className="form-group">
                        <label className="label">Accent Color</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input type="color" {...register('accentColor')} style={{ height: '45px', width: '100px', cursor: 'pointer' }} />
                            <span style={{ color: 'var(--color-text-secondary)' }}>Used for card highlights</span>
                        </div>
                    </div>

                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="label">Company Logo</label>
                        <div style={{
                            border: '2px dashed var(--color-border)',
                            padding: '2rem',
                            borderRadius: 'var(--radius-md)',
                            textAlign: 'center',
                            cursor: 'pointer',
                            position: 'relative'
                        }}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                            />
                            {watch('logoUrl') ? (
                                <img src={watch('logoUrl')!} alt="Logo Preview" style={{ maxHeight: '100px', objectFit: 'contain' }} />
                            ) : (
                                <div style={{ color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                    <Upload />
                                    <span>Click or drag logo here</span>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary">Save Settings</button>
                </div>
            </form>
        </div>
    );
};
