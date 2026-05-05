import React from 'react';
import { useLoading } from '../context/LoadingContext';
import Loader from './Loader';

const PageLoader = () => {
  const { visible, label } = useLoading();

  if (!visible) return null;

  return (
    <div className="rg-loader-overlay" aria-hidden={!visible}>
      <div className="rg-loader-overlay-inner">
        <div className="rg-loader-brand">
          <img src="/resources/genie.png" alt="" className="rg-loader-genie" />
          <span className="rg-loader-brand-text">Return Genie</span>
        </div>
        <Loader size={64} label={label || 'Preparing your workspace...'} />
      </div>
    </div>
  );
};

export default PageLoader;
