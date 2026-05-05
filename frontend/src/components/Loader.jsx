import React from 'react';

const Loader = ({ size = 64, label }) => {
  return (
    <div className="rg-loader-stack" role="status" aria-live="polite">
      <div className="rg-loader-orbit" style={{ width: size * 1.7, height: size * 1.7 }}>
        <span className="rg-loader-orbit-dot rg-orbit-dot-1"></span>
        <span className="rg-loader-orbit-dot rg-orbit-dot-2"></span>
        <span className="rg-loader-orbit-dot rg-orbit-dot-3"></span>
      </div>
      <div className="rg-loader" style={{ width: size, height: size }}></div>
      {label && <p className="rg-loader-label">{label}</p>}
      <span className="visually-hidden">Loading...</span>
    </div>
  );
};

export default Loader;
