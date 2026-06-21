import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => (
  <div>
    <Navbar />
    <div className="d-flex">
      <Sidebar />
      <main className="dashboard-main flex-grow-1">
        {children}
      </main>
    </div>
  </div>
);

export default DashboardLayout;
