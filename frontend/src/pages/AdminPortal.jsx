import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const randomColor = () => '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');

const PODS = ['POD 1', 'POD 2', 'POD 3', 'POD 4'];

const AdminPortal = () => {
  const { selectClient, clients, fetchClients, toggleClientStatus, addClient, deleteClient } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClient, setNewClient] = useState({ clientName: '', username: '', password: '', themeColor: randomColor(), pod: 'POD 2', dbId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [clientToDelete, setClientToDelete] = useState(null);
  const [collapsedPods, setCollapsedPods] = useState({});

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewClient({ ...newClient, password });
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    const { success, message } = await addClient(newClient);
    setIsSubmitting(false);
    if (success) {
      setShowAddForm(false);
      setNewClient({ clientName: '', username: '', password: '', themeColor: randomColor(), pod: 'POD 2', dbId: '' });
    } else {
      setErrorMsg(message);
    }
  };

  const handleSelectClient = (client) => {
    selectClient(client);
    navigate('/selection');
  };

  const confirmDelete = (clientId, clientName) => {
    setClientToDelete({ id: clientId, name: clientName });
  };

  const executeDelete = async () => {
    if (!clientToDelete) return;
    const { success, message } = await deleteClient(clientToDelete.id);
    if (!success) {
      alert(message || 'Failed to delete client');
    }
    setClientToDelete(null);
  };

  const togglePod = (pod) => {
    setCollapsedPods(prev => ({ ...prev, [pod]: !prev[pod] }));
  };

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filteredClients = clients.filter(client =>
    client.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group filtered clients by POD
  const groupedByPod = PODS.reduce((acc, pod) => {
    acc[pod] = filteredClients.filter(c => (c.pod || 'POD 2') === pod);
    return acc;
  }, {});

  return (
    <>
      <div className="mb-4 pt-3 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
        <div>
          <h3 className="inc-text-lg fw-bold text-gray-800 m-0 d-flex align-items-center gap-2">
            <i className="fa-solid fa-users text-primary"></i>
            Client Environments
          </h3>
          <p className="inc-text-xs text-secondary mt-1 mb-0 uppercase tracking-widest">Admin Control Portal</p>
        </div>

        <div className="d-flex w-100 flex-column flex-md-row gap-3 justify-content-md-end align-items-md-center" style={{ maxWidth: '500px' }}>
          <div className="position-relative flex-grow-1">
            <i className="fa-solid fa-search position-absolute text-secondary" style={{ left: '15px', top: '50%', transform: 'translateY(-50%)', zIndex: 4 }}></i>
            <input
              type="text"
              className="form-control inc-text-sm shadow-none focus-primary rounded-pill w-100 py-2"
              style={{ paddingLeft: '38px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
              placeholder="Search by client name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary rounded-pill py-2 px-4 shadow-sm border-0 fw-bold"
            style={{ minWidth: '140px' }}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <i className={`fa-solid ${showAddForm ? 'fa-times' : 'fa-plus'} me-2`}></i>
            {showAddForm ? 'Cancel' : 'New Client'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="increff-card bg-white p-4 shadow-sm border-0 rounded-1 mb-4 animate-fade-in border-top border-primary border-4" style={{ borderTopWidth: '4px !important' }}>
          <h5 className="inc-text-md fw-bold mb-3 d-flex align-items-center gap-2">
            <i className="fa-solid fa-plus-circle text-primary"></i> Add New Client
          </h5>
          {errorMsg && <div className="alert alert-danger py-2 inc-text-sm">{errorMsg}</div>}
          <form onSubmit={handleAddClient} className="row g-3">
            <div className="col-md-3">
              <label className="form-label inc-text-xs fw-bold text-secondary uppercase">Client Name</label>
              <input type="text" className="form-control inc-text-sm shadow-none focus-primary" required
                value={newClient.clientName} onChange={e => setNewClient({ ...newClient, clientName: e.target.value })} placeholder="e.g. Adidas" />
            </div>
            <div className="col-md-2">
              <label className="form-label inc-text-xs fw-bold text-secondary uppercase">DB ID</label>
              <input type="text" className="form-control inc-text-sm shadow-none focus-primary" required
                value={newClient.dbId} onChange={e => setNewClient({ ...newClient, dbId: e.target.value })} placeholder="e.g. 847" />
            </div>
            <div className="col-md-2">
              <label className="form-label inc-text-xs fw-bold text-secondary uppercase">Username</label>
              <input type="text" className="form-control inc-text-sm shadow-none focus-primary" required
                value={newClient.username} onChange={e => setNewClient({ ...newClient, username: e.target.value })} placeholder="adidas_admin" />
            </div>
            <div className="col-md-3">
              <label className="form-label inc-text-xs fw-bold text-secondary uppercase">Password</label>
              <div className="input-group">
                <input type="text" className="form-control inc-text-sm shadow-none focus-primary" required
                  value={newClient.password} onChange={e => setNewClient({ ...newClient, password: e.target.value })} placeholder="Enter or generate" />
                <button type="button" className="btn btn-outline-secondary" onClick={generatePassword} title="Generate Password">
                  <i className="fa-solid fa-dice"></i>
                </button>
              </div>
            </div>
            <div className="col-md-2">
              <label className="form-label inc-text-xs fw-bold text-secondary uppercase">Pod</label>
              <select
                className="form-select inc-text-sm shadow-none focus-primary"
                value={newClient.pod}
                onChange={e => setNewClient({ ...newClient, pod: e.target.value })}
                required
              >
                {PODS.map(pod => (
                  <option key={pod} value={pod}>{pod}</option>
                ))}
              </select>
            </div>
            <div className="col-12 mt-4 pt-2 border-top text-end">
              <button type="submit" className="btn btn-primary px-4 py-2 fw-bold tracking-widest uppercase inc-text-xs rounded-1" disabled={isSubmitting}>
                {isSubmitting ? <><i className="fa-solid fa-circle-notch fa-spin me-2"></i> Creating...</> : 'Add'}
              </button>
            </div>
          </form>
        </div>
      )}

      {clientToDelete && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center animate-fade-in" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050 }}>
          <div className="bg-white p-4 rounded-2 shadow-lg" style={{ maxWidth: '400px', width: '90%' }}>
            <h5 className="fw-bold text-gray-800 d-flex align-items-center gap-2 mb-3">
              <i className="fa-solid fa-triangle-exclamation text-danger"></i> Confirm Deletion
            </h5>
            <p className="text-secondary inc-text-sm mb-4">
              Are you absolutely sure you want to permanently delete the <strong>{clientToDelete.name}</strong> environment? This action cannot be undone and will permanently remove all associated configurations.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-light border fw-bold inc-text-xs uppercase tracking-widest" onClick={() => setClientToDelete(null)}>Cancel</button>
              <button className="btn btn-danger fw-bold inc-text-xs uppercase tracking-widest" onClick={executeDelete}>Delete Permanently</button>
            </div>
          </div>
        </div>
      )}

      {PODS.map(pod => {
        const podClients = groupedByPod[pod];
        if (podClients.length === 0) return null;
        const isCollapsed = collapsedPods[pod];

        return (
          <div key={pod} className="mb-4 animate-fade-in">
            <div
              className="d-flex align-items-center gap-3 mb-3 py-2 px-3 rounded-2"
              style={{ backgroundColor: 'rgba(79, 70, 229, 0.06)', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => togglePod(pod)}
            >
              <i className={`fa-solid fa-chevron-${isCollapsed ? 'right' : 'down'} text-primary`} style={{ fontSize: '0.7rem', transition: 'transform 0.2s ease' }}></i>
              <h5 className="m-0 inc-text-sm fw-bold text-gray-800 uppercase tracking-widest">{pod}</h5>
              <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill" style={{ fontSize: '0.65rem' }}>
                {podClients.length} client{podClients.length !== 1 ? 's' : ''}
              </span>
            </div>

            {!isCollapsed && (
              <div className="row g-4">
                {podClients.map((client) => {
                  const isDeactivated = !client.isActive;

                  return (
                    <div key={client._id} className="col-12 col-md-6 col-lg-3">
                      <div
                        className={`increff-card bg-white p-3 shadow-sm border-0 rounded-1 h-100 d-flex flex-column ${isDeactivated ? 'opacity-75' : ''}`}
                        style={{
                          borderLeftColor: `${isDeactivated ? '#94a3b8' : client.themeColor} !important`,
                          borderLeft: `5px solid ${isDeactivated ? '#94a3b8' : client.themeColor}`,
                          position: 'relative'
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h5 className="inc-text-sm fw-bold text-gray-800 m-0">{client.clientName}</h5>
                            <div className="inc-text-xs text-secondary mt-1" style={{ fontSize: '0.65rem' }}>
                              {client.dbId ? `DB: ${client.dbId}` : 'No DB ID'}
                            </div>
                            {isDeactivated ? (
                              <span className="badge bg-danger-subtle text-danger border border-danger border-opacity-25 rounded-1 mt-1" style={{ fontSize: '0.6rem' }}>Deactivated</span>
                            ) : (
                              <span className="badge bg-success-subtle text-success border border-success border-opacity-25 rounded-1 mt-1" style={{ fontSize: '0.6rem' }}>Active</span>
                            )}
                          </div>

                          <div className="d-flex align-items-center gap-2">
                            <button
                              className="btn btn-link p-0 text-secondary"
                              onClick={() => toggleClientStatus(client._id)}
                              title={isDeactivated ? "Reactivate Client" : "Deactivate Client"}
                            >
                              <i className={`fa-solid ${isDeactivated ? 'fa-toggle-off' : 'fa-toggle-on text-success'} fs-5`}></i>
                            </button>
                            <button
                              className="btn btn-link p-0 text-danger ms-1"
                              onClick={() => confirmDelete(client._id, client.clientName)}
                              title="Delete Client"
                            >
                              <i className="fa-solid fa-trash-alt fs-6"></i>
                            </button>
                            {/* <div
                              style={{ width: '15px', height: '15px', borderRadius: '50%', backgroundColor: client.themeColor, marginLeft: '6px' }}
                              title={`Theme Color: ${client.themeColor}`}
                            ></div> */}
                          </div>
                        </div>

                        <p className="inc-text-xs text-secondary flex-grow-1">
                          {isDeactivated
                            ? `This environment is currently disconnected.`
                            : `System Ready. Click to securely enter the ${client.clientName} Return Genie workspace.`}
                        </p>

                        <button
                          className={`btn w-100 rounded-1 inc-text-xs fw-bold uppercase tracking-widest py-2 ${isDeactivated ? 'btn-secondary disabled' : ''}`}
                          style={!isDeactivated ? {
                            backgroundColor: client.themeColor,
                            color: '#fff',
                            boxShadow: `0 4px 10px -1px ${client.themeColor}60`
                          } : {}}
                          onClick={() => !isDeactivated && handleSelectClient(client)}
                        >
                          {isDeactivated ? 'Portal Locked' : 'Enter Portal'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

export default AdminPortal;
