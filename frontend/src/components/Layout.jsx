import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { currentUser, activeClient, logout, deactivateClient } = useAuth();
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

  // Swipe navigation: right = back to previous logical page, left = forward.
  // Mapping mirrors the in-navbar Back buttons so gestures and clicks stay in sync.
  const goBack = () => {
    if (location.pathname === '/reconciliation') {
      navigate('/selection');
    } else if (location.pathname === '/selection' && currentUser?.role === 'admin') {
      deactivateClient();
      navigate('/admin');
    }
  };

  const goForward = () => {
    if (location.pathname === '/admin' && activeClient) {
      navigate('/selection');
    } else if (location.pathname === '/selection') {
      navigate('/reconciliation');
    }
  };

  const touchStart = useRef(null);

  useEffect(() => {
    const SWIPE_THRESHOLD = 75;        // min horizontal travel (px)
    const VERTICAL_TOLERANCE = 60;     // max vertical drift (px)
    const EDGE_IGNORE = 24;            // ignore swipes that start at extreme edge (browser back gesture)

    const onTouchStart = (e) => {
      if (e.touches.length !== 1) {
        touchStart.current = null;
        return;
      }
      const t = e.touches[0];
      // Ignore taps that originate on interactive controls so swipes don't
      // hijack scroll/clicks on forms, dropzones, dropdowns, etc.
      const target = e.target;
      if (target.closest('input, textarea, select, button, a, label, [contenteditable="true"], .increff-dropzone, .modal, .terminal-box')) {
        touchStart.current = null;
        return;
      }
      if (t.clientX < EDGE_IGNORE || t.clientX > window.innerWidth - EDGE_IGNORE) {
        touchStart.current = null;
        return;
      }
      touchStart.current = { x: t.clientX, y: t.clientY, time: Date.now() };
    };

    const onTouchEnd = (e) => {
      const start = touchStart.current;
      touchStart.current = null;
      if (!start) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      if (Math.abs(dy) > VERTICAL_TOLERANCE) return;
      if (Math.abs(dx) < SWIPE_THRESHOLD) return;
      if (dx > 0) {
        goBack();   // swipe right → previous page
      } else {
        goForward(); // swipe left → next page
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [location.pathname, currentUser?.role, activeClient]);

  return (
    <>
      <nav className="navbar navbar-expand navbar-light bg-white border-bottom fixed-top py-2 px-4 shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.65)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255, 255, 255, 0.3)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)', minHeight: '64px' }}>
        <div className="container-fluid align-items-center">
          <div className="d-flex align-items-center gap-3">
            <img
              src="https://cdn.prod.website-files.com/64dacf5e829926e42212e23f/67ea4b4e92d4fccc9bfe60c2_65d6d8b6f1213f493da7d67f_Original%2520Logo_Increff%2520(1).png"
              alt="Increff"
              height="28"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/')}
            />
            <span className="text-secondary opacity-25">|</span>
            <div className="d-flex align-items-center gap-2">
              <span className="fw-bold text-gray-500 uppercase tracking-wider m-0" style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Return Genie</span>
              <img src="/resources/genie.png" alt="Return Genie logo" id="Genie" style={{ width: '44px', height: 'auto', opacity: 0.9 }} />
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
      {/* Content padded so it always clears the fixed navbar */}
      <div className="container-fluid" style={{ paddingTop: '88px', paddingBottom: '24px' }}>
        {children}
      </div>
    </>
  );
};

export default Layout;
