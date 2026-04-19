import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { currentUser, logout, deactivateClient } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBackToAdmin = () => {
    deactivateClient();
    navigate('/admin');
  };

  const handleBackToHub = () => {
    navigate('/selection');
  };

  return (
    <>
      <nav className="navbar navbar-expand navbar-light bg-white border-bottom fixed-top py-2 px-4 shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.65)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255, 255, 255, 0.3)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)' }}>
        <div className="container-fluid">
          <div className="d-flex align-items-center gap-3">
            <img 
              src="https://cdn.prod.website-files.com/64dacf5e829926e42212e23f/67ea4b4e92d4fccc9bfe60c2_65d6d8b6f1213f493da7d67f_Original%2520Logo_Increff%2520(1).png"
              alt="Increff" 
              height="22" 
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/')}
            />
            <span className="text-secondary opacity-25">|</span>
            <div className="d-flex align-items-center gap-1">
              <span className="inc-text-xs fw-bold text-gray-500 uppercase tracking-wider m-0" style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Return Genie</span>
              <img src="/resources/genie.png" alt="Return Genie logo" id="Genie" style={{ width: '40px', height: 'auto', opacity: 0.9 }} />
            </div>
          </div>
          <div className="ms-auto d-flex align-items-center gap-3 border-start ps-3">
            <span className="inc-text-xs text-secondary font-monospace">IST +05:30</span>
            
            {/* If in Reconciliation, show Back to Hub regardless of role */}
            {location.pathname === '/reconciliation' && (
              <button 
                onClick={handleBackToHub} 
                className="btn btn-outline-primary btn-sm px-3 ms-2"
                title="Back to Selection Hub"
                style={{ borderRadius: '10px' }}
              >
                <i className="fa-solid fa-arrow-left me-1"></i> Selection Hub
              </button>
            )}

            {/* If the current user is admin, but they are in a client selection view, provide a button to go back to the admin portal */}
            {currentUser?.role === 'admin' && location.pathname === '/selection' && (
              <button 
                onClick={handleBackToAdmin} 
                className="btn btn-outline-primary btn-sm px-3 ms-2"
                title="Back to Admin"
                style={{ borderRadius: '10px' }}
              >
                <i className="fa-solid fa-arrow-left me-1"></i> Admin Portal
              </button>
            )}

            <button onClick={handleLogout} className="btn btn-link p-0 text-danger text-decoration-none ms-2" title="Logout">
              <i className="fa-solid fa-power-off fs-5"></i>
            </button>
          </div>
        </div>
      </nav>
      {/* Content padded for navbar */}
      <div className="container-fluid pt-5 mt-4">
        {children}
      </div>
    </>
  );
};

export default Layout;
