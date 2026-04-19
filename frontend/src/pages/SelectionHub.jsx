import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SelectionHub = () => {
  const { activeClient } = useAuth();
  const navigate = useNavigate();

  if (!activeClient) return null;

  const handleSelection = (serviceAction) => {
    if (serviceAction === 'reconciliation') {
      navigate('/reconciliation');
    }
  };

  const primaryColor = activeClient.themeColor;

  return (
    <>
      <nav aria-label="breadcrumb" className="mb-4 pt-3">
        <ol className="breadcrumb inc-text-xs uppercase fw-bold tracking-tighter">
          {/* <li className="breadcrumb-item text-secondary">Increff Systems Portal</li> */}
          <li className="breadcrumb-item active" aria-current="page" style={{ color: primaryColor }}>Service Hub</li>
        </ol>
      </nav>

      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          <div className="increff-card bg-white p-4 p-md-5 shadow-sm border-0 rounded-1 animate-fade-in" style={{ borderLeft: `5px solid ${primaryColor}` }}>
            <div className="text-center mb-5">
              <h2 className="inc-text-lg fw-bold text-gray-800 m-0 uppercase tracking-tight">Welcome, {activeClient.clientName}</h2>
              <p className="inc-text-sm text-secondary mt-2">Please select a processing operation to continue into your workspace.</p>
            </div>

            <div className="row g-4 justify-content-center">
              {/* Box 1: Omni */}
              {/* <div className="col-md-6 col-lg-4">
                <div
                  className="increff-card p-5 text-center h-100 d-flex flex-column align-items-center justify-content-center cursor-pointer hover-glow"
                  style={{ border: '2px solid transparent', transition: 'all 0.3s ease', cursor: 'pointer', borderRadius: '16px' }}
                  onClick={() => window.open(`https://${activeClient.username}.omni.increff.com/ui/gateway/`, '_blank')}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = primaryColor; e.currentTarget.style.boxShadow = `0 10px 40px ${primaryColor}20`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.08)'; }}
                >
                  <i className="fa-solid fa-globe fs-1 mb-3" style={{ color: primaryColor }}></i>
                  <h4 className="inc-text-sm fw-bold text-gray-800 uppercase tracking-tight">{activeClient.clientName} - Omni</h4>
                  <p className="inc-text-xs text-secondary mt-2 mb-0">Access your primary Omni gateway portal.</p>
                </div>
              </div> */}
              

              {/* Box 2: Return Reconciliation */}
              <div className="col-md-6 col-lg-4">
                <div
                  className="increff-card p-5 text-center h-100 d-flex flex-column align-items-center justify-content-center cursor-pointer hover-glow"
                  style={{ border: '2px solid transparent', transition: 'all 0.3s ease', cursor: 'pointer', borderRadius: '16px' }}
                  onClick={() => handleSelection('reconciliation')}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = primaryColor; e.currentTarget.style.boxShadow = `0 10px 40px ${primaryColor}20`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.08)'; }}
                >
                  <i className="fa-solid fa-layer-group fs-1 mb-3" style={{ color: primaryColor }}></i>
                  <h4 className="inc-text-sm fw-bold text-gray-800 uppercase tracking-tight">Return Reconciliation</h4>
                  <p className="inc-text-xs text-secondary mt-2 mb-0">Synchronize and reconcile live marketplace expectations.</p>
                </div>
              </div>

              {/* Box 3: Auto-Claim SPF */}
              <div className="col-md-6 col-lg-4">
                <div
                  className="increff-card p-5 text-center h-100 d-flex flex-column align-items-center justify-content-center cursor-pointer hover-glow"
                  style={{ border: '2px solid transparent', transition: 'all 0.3s ease', cursor: 'pointer', borderRadius: '16px' }}
                  onClick={() => alert("Auto-Claim SPF module is currently coming soon.")}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = primaryColor; e.currentTarget.style.boxShadow = `0 10px 40px ${primaryColor}20`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.08)'; }}
                >
                  <i className="fa-solid fa-file-invoice-dollar fs-1 mb-3 text-secondary"></i>
                  <h4 className="inc-text-sm fw-bold text-gray-800 uppercase tracking-tight">Auto-Claim SPF</h4>
                  <p className="inc-text-xs text-secondary mt-2 mb-0">Dispute mapping engine and reimbursement processor.</p>
                  <span className="badge bg-secondary opacity-50 mt-3 rounded-1">Coming Soon</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div >
    </>
  );
};

export default SelectionHub;
