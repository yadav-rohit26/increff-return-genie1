import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { BaseSyncService } from '../services/BaseSyncService';

const Dashboard = () => {
    const { activeClient } = useAuth();
    const [file, setFile] = useState(null);
    const [marketplace, setMarketplace] = useState('');
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});
    
    // UI State: 'upload' | 'processing' | 'success' | 'error'
    const [uiState, setUiState] = useState('upload');
    const [errorText, setErrorText] = useState('');
    const [terminalLogs, setTerminalLogs] = useState([]);
    
    const fileInputRef = useRef(null);
    const syncService = new BaseSyncService();

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setErrors({ ...errors, file: false });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!marketplace) newErrors.marketplace = true;
        if (!file) newErrors.file = true;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            newErrors.email = "Please enter your email ID";
        } else if (!emailRegex.test(email)) {
            newErrors.email = "Please enter a valid email address";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const updateTerminal = (msg) => {
        setTerminalLogs((prev) => [...prev, msg]);
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setUiState('processing');
        
        const payload = {
            marketplace,
            email,
            file: file
        };

        syncService.triggerSync(
            payload,
            updateTerminal,
            () => setUiState('success'),
            (errorMsg) => {
                setErrorText(errorMsg);
                setUiState('error');
            }
        );
    };

    const resetForm = () => {
        setFile(null);
        setMarketplace('');
        setEmail('');
        setErrors({});
        setErrorText('');
        setTerminalLogs([]);
        setUiState('upload');
    };

    if (!activeClient) return null;

    const PrimaryColor = activeClient.themeColor;

    return (
        <>
            <nav aria-label="breadcrumb" className="mb-4 pt-3">
                <ol className="breadcrumb inc-text-xs uppercase fw-bold tracking-tighter">
                    <li className="breadcrumb-item text-secondary">{activeClient.clientName}</li>
                    <li className="breadcrumb-item active text-primary" aria-current="page" style={{ color: `${PrimaryColor} !important` }}>Reconciliation</li>
                </ol>
            </nav>

            <div className="row justify-content-center">
                <div className="col-12 col-lg-8 col-xl-6">
                    <div 
                        className="increff-card shadow-sm border-0 rounded-1 animate-fade-in"
                        style={{ borderLeft: `5px solid ${PrimaryColor}` }}
                    >
                        <div className="card-header bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-2">
                                <i className="fa-solid fa-layer-group" style={{ color: PrimaryColor }}></i>
                                <h2 className="inc-text-sm fw-bold text-gray-800 m-0 uppercase tracking-tight">Sync Marketplace Expectations</h2>
                            </div>
                            <span className="badge bg-success-subtle text-success border border-success border-opacity-25 rounded-1">System Ready</span>
                        </div>

                        <div className="card-body p-4 p-md-5">
                            {/* UPLOAD STATE */}
                            {uiState === 'upload' && (
                                <div className="row g-4 animate-fade-in">
                                    <div className="col-md-6">
                                        <label className="form-label inc-text-xs fw-bold text-secondary uppercase">Please Select Marketplace</label>
                                        <select 
                                            className="form-select border-gray-300 rounded-1 inc-text-sm shadow-none focus-primary"
                                            value={marketplace}
                                            onChange={(e) => { setMarketplace(e.target.value); setErrors({...errors, marketplace: false}) }}
                                        >
                                            <option value="" disabled>Select Source...</option>
                                            <option value="AMAZON_SC">AMAZON_SC</option>
                                            <option value="FLIPKART">FLIPKART</option>
                                            <option value="MYNTRAV4">MYNTRAV4</option>
                                            <option value="TATACLIQ">TATACLIQ</option>
                                            <option value="NYKAA">NYKAA</option>
                                        </select>
                                        {errors.marketplace && <div className="inc-text-xs text-danger mt-1"><i className="fa-solid fa-circle-exclamation"></i> Please select a marketplace</div>}
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label inc-text-xs fw-bold text-secondary uppercase">Enter Email ID</label>
                                        <input 
                                            type="text" 
                                            className="form-control border-gray-300 rounded-1 inc-text-sm shadow-none focus-primary"
                                            placeholder="e.g. abc@gmail.com"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); setErrors({...errors, email: false}) }}
                                        />
                                        {errors.email && <div className="inc-text-xs text-danger mt-1"><i className="fa-solid fa-circle-exclamation"></i> {errors.email}</div>}
                                    </div>
                                    <div className="col-12">
                                        <div 
                                            className={`increff-dropzone p-5 text-center border-2 border-dashed rounded-1 transition-all cursor-pointer ${file ? 'drop-zone-active' : ''}`}
                                            onClick={() => fileInputRef.current.click()}
                                        >
                                            <input 
                                                type="file" 
                                                ref={fileInputRef} 
                                                className="d-none" 
                                                accept=".csv,.xlsx,.xls"
                                                onChange={handleFileChange}
                                            />
                                            <i className="fa-solid fa-file-arrow-up fs-2 mb-3" style={{ color: PrimaryColor }}></i>
                                            <p className="inc-text-sm fw-bold text-gray-700 mb-1">
                                                {file ? `Selected: ${file.name}` : 'Drag Marketplace Report or Click to Browse'}
                                            </p>
                                            <p className="inc-text-xs text-gray-400">Supported formats: .xlsx, .xls, .csv <br/>(Max Rows Limit : 3000)</p>
                                        </div>
                                        {errors.file && <div className="inc-text-xs text-danger mt-1 text-center"><i className="fa-solid fa-circle-exclamation"></i> Please upload a marketplace report</div>}
                                    </div>
                                    <div className="col-12 text-end">
                                        <button 
                                            className="btn rounded-1 inc-text-xs fw-bold uppercase tracking-widest px-4 py-2 mt-2"
                                            style={{ backgroundColor: PrimaryColor, color: '#fff' }}
                                            onClick={handleSubmit}
                                        >
                                            Initialize Sync
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* PROCESSING STATE */}
                            {uiState === 'processing' && (
                                <div className="text-center py-5 animate-fade-in">
                                    <div className="terminal-box text-start p-3 mb-4 font-monospace shadow-inner">
                                        <div className="inc-text-xs text-info d-flex flex-column gap-1">
                                            {terminalLogs.map((log, idx) => (
                                                <p key={idx} className="mb-0 text-secondary opacity-75">{log}</p>
                                            ))}
                                            <p className="mb-0 text-info animate-pulse">_</p>
                                        </div>
                                    </div>
                                    <div className="spinner-border spinner-border-sm mb-3" style={{ color: PrimaryColor }}></div>
                                    <p className="inc-text-xs fw-bold text-gray-600 uppercase tracking-widest">Processing Data...</p>
                                </div>
                            )}

                            {/* SUCCESS STATE */}
                            {uiState === 'success' && (
                                <div className="text-center py-5 animate-slide-up">
                                    <div className="success-icon-box mx-auto mb-4" style={{ background: `linear-gradient(135deg, ${PrimaryColor}, #059669)` }}>
                                        <i className="fa-solid fa-check text-white fs-4"></i>
                                    </div>
                                    <h4 className="inc-text-lg fw-bold text-gray-800 mb-2">Sync Process Completed</h4>
                                    <p className="inc-text-sm text-gray-500 mb-4 px-md-5">The output will be delivered to your email. Thank You.</p>
                                    <button 
                                        className="btn rounded-1 inc-text-xs fw-bold uppercase px-4 py-2"
                                        style={{ backgroundColor: PrimaryColor, color: '#fff' }}
                                        onClick={resetForm}
                                    >
                                        Start New Sync
                                    </button>
                                </div>
                            )}

                            {/* ERROR STATE */}
                            {uiState === 'error' && (
                                <div className="text-center py-5 animate-fade-in">
                                    <div className="mx-auto mb-4" style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="fa-solid fa-triangle-exclamation text-danger fs-4"></i>
                                    </div>
                                    <h4 className="inc-text-lg fw-bold text-gray-800 mb-2">Sync Failed</h4>
                                    <p className="inc-text-sm text-danger mb-4 px-md-5">{errorText}</p>
                                    <button 
                                        className="btn btn-outline-danger rounded-1 inc-text-xs fw-bold uppercase px-4 py-2"
                                        onClick={resetForm}
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
