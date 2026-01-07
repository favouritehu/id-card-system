import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { AdminPanel } from './components/AdminPanel';
import { EmployeeManager } from './components/EmployeeManager';
import { IDCardPreview } from './components/IDCardPreview';
import { PrintLayout } from './components/PrintLayout';
import type { CompanyConfig, Employee } from './types';

// Placeholder components
const Preview = ({ company, employees }: { company: CompanyConfig; employees: Employee[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (employees.length === 0) {
    return <div className="container"><p className="card">Please add employees first.</p></div>;
  }

  const employee = employees[currentIndex];

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
      <h2 className="header-title">ID Card Preview</h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          className="btn btn-secondary"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(prev => prev - 1)}
        >
          Previous
        </button>
        <span>{currentIndex + 1} of {employees.length}</span>
        <button
          className="btn btn-secondary"
          disabled={currentIndex === employees.length - 1}
          onClick={() => setCurrentIndex(prev => prev + 1)}
        >
          Next
        </button>
      </div>

      <IDCardPreview company={company} employee={employee} />

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Details</h3>
        <p><strong>ID:</strong> {employee.employeeId}</p>
        <p><strong>Department:</strong> {employee.department}</p>
      </div>
    </div>
  );
};



function App() {
  const [activeTab, setActiveTab] = useState('admin');
  const [loading, setLoading] = useState(true);

  // Initial State
  const [companyConfig, setCompanyConfig] = useState<CompanyConfig>({
    name: '',
    address: '',
    contact: '',
    email: '',
    website: '',
    logoUrl: null,
    accentColor: '#4f46e5'
  });

  const [employees, setEmployees] = useState<Employee[]>([]);

  // Fetch data on mount
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        if (data.company) setCompanyConfig(data.company);
        if (data.employees) setEmployees(data.employees);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch data", err);
        setLoading(false);
      });
  }, []);

  const saveData = async (newCompany: CompanyConfig, newEmployees: Employee[]) => {
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: newCompany, employees: newEmployees })
      });
    } catch (err) {
      console.error("Failed to save data", err);
      alert("Failed to save data to server.");
    }
  };

  const handleCompanyUpdate = (newConfig: CompanyConfig) => {
    setCompanyConfig(newConfig);
    saveData(newConfig, employees);
  };

  const handleEmployeesUpdate = (newEmployees: Employee[]) => {
    setEmployees(newEmployees);
    saveData(companyConfig, newEmployees);
  };

  const renderContent = () => {
    if (loading) return <div className="container"><p>Loading...</p></div>;

    switch (activeTab) {
      case 'admin':
        return <AdminPanel config={companyConfig} onUpdate={handleCompanyUpdate} />;
      case 'employees':
        return <EmployeeManager employees={employees} setEmployees={handleEmployeesUpdate} />;
      case 'preview':
        return <Preview company={companyConfig} employees={employees} />;
      case 'print':
        return <PrintLayout company={companyConfig} employees={employees} />;
      default:
        return <AdminPanel config={companyConfig} onUpdate={handleCompanyUpdate} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
