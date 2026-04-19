import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [exiting, setExiting] = useState(false);
  
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') navigate('/admin');
      else navigate('/selection');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg('Invalid Credentials');
      return;
    }

    const { success, role, message } = await login(username, password);
    
    if (success) {
      setLoading(true);
      setErrorMsg('');
      
      // Simulating loading experience and page exit animation
      setTimeout(() => {
        setExiting(true);
        setTimeout(() => {
          navigate(role === 'admin' ? '/admin' : '/selection');
        }, 600);
      }, 800);
    } else {
      setErrorMsg(message || 'Invalid Credentials');
      setTimeout(() => setErrorMsg(''), 2000);
    }
  };

  return (
    <div className={`increff-bg d-flex align-items-center justify-content-center vh-100 px-3 ${exiting ? 'animate-page-exit' : ''}`}>
      <div className="increff-card bg-white p-4 p-md-5 shadow-sm border-0 rounded-1 animate-fade-in" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="text-center mb-4">
          <img 
            src="https://cdn.prod.website-files.com/64dacf5e829926e42212e23f/67ea4b4e92d4fccc9bfe60c2_65d6d8b6f1213f493da7d67f_Original%2520Logo_Increff%2520(1).png"
            alt="Increff" 
            height="36" 
            className="mb-3" 
          />
          <div className="d-flex align-items-center justify-content-center gap-0 mt-1">
            <p className="inc-text-sm fw-bold text-muted uppercase m-0">Return Genie</p>
            <img src="/resources/genie.png" alt="Return Genie logo" id="Genie" style={{ marginLeft: '4px' }} />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label inc-text-xs fw-bold text-secondary uppercase">User ID</label>
            <input 
              type="text" 
              className="form-control inc-text-sm rounded-1 shadow-none focus-primary"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="form-label inc-text-xs fw-bold text-secondary uppercase">Password</label>
            <div className="input-group">
              <input 
                type={showPassword ? "text" : "password"}
                className="form-control inc-text-sm rounded-start-1 shadow-none focus-primary border-end-0"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span 
                className="input-group-text bg-white border-start-0 pop-cursor" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: 'pointer', borderRadius: '0 10px 10px 0' }}
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-secondary`}></i>
              </span>
            </div>
          </div>

          <button 
            type="submit" 
            className={`btn w-100 rounded-1 inc-text-xs fw-bold uppercase tracking-widest py-2 ${errorMsg ? 'btn-danger' : 'btn-primary'}`}
            disabled={loading}
          >
            {loading ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Authenticating...</> : 'Log In'}
          </button>

          <div className={`inc-text-xs text-danger mt-3 text-center fw-bold ${errorMsg ? '' : 'd-none'}`}>
            <i className="fa-solid fa-circle-exclamation me-1"></i> Access Denied: {errorMsg}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
