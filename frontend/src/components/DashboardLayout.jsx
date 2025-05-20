import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="d-flex">
        <Sidebar />
        <main className="flex-grow-1" style={{ marginLeft: '280px', padding: '20px' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 