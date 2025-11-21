import React from 'react';
import './AuthLoading.css';

const AuthLoading = ({ isFinishing }) => {
  return (
    <div className={`auth-loading-overlay ${isFinishing ? 'finishing' : ''}`}>
      <div className="scene-container">
        {/* Wind Lines */}
        <div className="wind-line w1"></div>
        <div className="wind-line w2"></div>
        <div className="wind-line w3"></div>
        
        {/* The Runner */}
        <div className="runner-container">
          <span className="runner-emoji">{isFinishing ? '🙌' : '🏃‍♂️'}</span>
        </div>

        {/* The Road */}
        <div className="road">
          <div className="road-markings"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthLoading;
