import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Edit2, Upload, X, Users } from 'lucide-react';
import type { Employee } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface EmployeeManagerProps {
    employees: Employee[];
    setEmployees: (employees: Employee[]) => void;
}

export const EmployeeManager: React.FC<EmployeeManagerProps> = ({ employees, setEmployees }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form handling
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Employee>();

    const onSubmit = (data: Employee) => {
        if (editingId) {
            // Update existing
            setEmployees(employees.map(emp => emp.id === editingId ? { ...data, id: editingId } : emp));
        } else {
            // Add new
            const newEmployee = {
                ...data,
                id: uuidv4(),
                employeeId: data.employeeId || generateEmployeeId(data.department)
            };
            setEmployees([...employees, newEmployee]);
        }
        closeForm();
    };

    const generateEmployeeId = (dept: string) => {
        const prefix = dept.substring(0, 3).toUpperCase() || 'EMP';
        const random = Math.floor(1000 + Math.random() * 9000);
        return `${prefix}-${random}`;
    };

    const handleEdit = (emp: Employee) => {
        setEditingId(emp.id);
        reset(emp);
        setIsFormOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this employee?')) {
            setEmployees(employees.filter(emp => emp.id !== id));
        }
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingId(null);
        reset({ name: '', department: '', employeeId: '', photoUrl: null });
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setValue('photoUrl', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="header-title" style={{ marginBottom: 0 }}>Employee Management</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {employees.length > 0 && (
                        <button
                            className="btn"
                            style={{ color: 'var(--color-danger)', border: '1px solid var(--color-border)' }}
                            onClick={() => {
                                if (confirm('Are you sure you want to DELETE ALL employees? This cannot be undone.')) {
                                    setEmployees([]);
                                }
                            }}
                        >
                            <Trash2 size={20} style={{ marginRight: '0.5rem' }} />
                            Delete All
                        </button>
                    )}
                    <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
                        <Plus size={20} />
                        Add Employee
                    </button>
                </div>
            </div>

            {isFormOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{editingId ? 'Edit Employee' : 'New Employee'}</h3>
                            <button onClick={closeForm}><X /></button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="label">Full Name *</label>
                                    <input {...register('name', { required: true })} className="input" placeholder="John Doe" />
                                    {errors.name && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}>Required</span>}
                                </div>

                                <div className="form-group">
                                    <label className="label">Department *</label>
                                    <input {...register('department', { required: true })} className="input" placeholder="Engineering" />
                                    {errors.department && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}>Required</span>}
                                </div>

                                <div className="form-group">
                                    <label className="label">Employee ID (Auto if empty)</label>
                                    <input {...register('employeeId')} className="input" placeholder="Leave blank to auto-generate" />
                                </div>

                                <div className="form-group">
                                    <label className="label">Phone No</label>
                                    <input {...register('phone')} className="input" placeholder="+1 234 567 8900" />
                                </div>

                                <div className="form-group">
                                    <label className="label">Emergency Contact No</label>
                                    <input {...register('emergencyContact')} className="input" placeholder="Emergency Phone" />
                                </div>

                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="label">Address</label>
                                    <input {...register('address')} className="input" placeholder="Full Home Address" />
                                </div>

                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="label">Zone Color *</label>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        {['#ef4444', '#22c55e', '#eab308'].map(color => (
                                            <label key={color} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <input
                                                    type="radio"
                                                    value={color}
                                                    {...register('zoneColor', { required: true })}
                                                    style={{ width: '1.2rem', height: '1.2rem', accentColor: color }}
                                                />
                                                <div style={{ width: '2rem', height: '1rem', backgroundColor: color, borderRadius: '4px' }}></div>
                                                <span style={{ fontSize: '0.875rem', textTransform: 'capitalize' }}>
                                                    {color === '#ef4444' ? 'Red' : color === '#22c55e' ? 'Green' : 'Yellow'}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.zoneColor && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.5rem', display: 'block' }}>Please select a zone color</span>}
                                </div>

                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="label">Employee Photo</label>
                                    <div style={{
                                        border: '2px dashed var(--color-border)',
                                        padding: '1rem',
                                        borderRadius: 'var(--radius-md)',
                                        textAlign: 'center',
                                        position: 'relative'
                                    }}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoUpload}
                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                        />
                                        {watch('photoUrl') ? (
                                            <img src={watch('photoUrl')!} alt="Preview" style={{ height: '100px', borderRadius: '50%' }} />
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)' }}>
                                                <Upload size={24} />
                                                <span>Upload Photo</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>

                            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    {editingId && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (confirm('Delete this employee?')) {
                                                    setEmployees(employees.filter(e => e.id !== editingId));
                                                    closeForm();
                                                }
                                            }}
                                            className="btn"
                                            style={{ color: 'var(--color-danger)', border: '1px solid var(--color-danger)', marginRight: 'auto' }}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="button" onClick={closeForm} className="btn btn-secondary">Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save Employee</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {employees.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Users size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
                    <h3 style={{ marginBottom: '0.5rem' }}>No Employees Yet</h3>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Add your first employee to get started.</p>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: 'var(--color-bg-input)' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Employee</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>ID</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Department</th>
                                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map(emp => (
                                <tr key={emp.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {emp.photoUrl ? (
                                                <img src={emp.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <span style={{ fontWeight: 'bold' }}>{emp.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <span style={{ fontWeight: 500 }}>{emp.name}</span>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>{emp.employeeId}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 600 }}>
                                            {emp.department}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button onClick={() => handleEdit(emp)} style={{ padding: '0.5rem', color: 'var(--color-text-secondary)', marginRight: '0.5rem' }}>
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(emp.id)} style={{ padding: '0.5rem', color: 'var(--color-danger)' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
