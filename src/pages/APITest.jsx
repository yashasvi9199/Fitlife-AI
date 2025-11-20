/**
 * API Test Page - Verify all API calls work without CORS errors
 */

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import apiService from '../services/api';
import './APITest.css';

const APITest = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState(false);

  const runTest = async (name, testFn) => {
    try {
      setTestResults(prev => ({ ...prev, [name]: 'testing...' }));
      await testFn();
      setTestResults(prev => ({ ...prev, [name]: '✅ PASS' }));
      return true;
    } catch (error) {
      setTestResults(prev => ({ ...prev, [name]: `❌ FAIL: ${error.message}` }));
      return false;
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setTestResults({});
    let passCount = 0;
    let totalCount = 0;

    const tests = [
      {
        name: 'GET Health Records',
        fn: () => apiService.getHealthRecords(user.user_id, 'weight')
      },
      {
        name: 'GET Health Stats',
        fn: () => apiService.getHealthStats(user.user_id, '7days')
      },
      {
        name: 'GET Fitness Routines',
        fn: () => apiService.getFitnessRoutines(user.user_id)
      },
      {
        name: 'GET Goals',
        fn: () => apiService.getGoals(user.user_id)
      },
      {
        name: 'GET Calendar Events',
        fn: () => apiService.getCalendarEvents(user.user_id, new Date().toISOString().split('T')[0])
      },
      {
        name: 'GET User Profile',
        fn: () => apiService.getUserProfile(user.user_id)
      },
      {
        name: 'POST Health Record',
        fn: () => apiService.createHealthRecord(user.user_id, 'weight', 70.5, new Date().toISOString().split('T')[0])
      },
      {
        name: 'POST Fitness Routine',
        fn: () => apiService.createFitnessRoutine(user.user_id, 'Test Workout', [
          { name: 'Push-ups', sets: 3, reps: 15 }
        ])
      },
      {
        name: 'POST Goal',
        fn: () => apiService.setGoal(user.user_id, 'weight_loss', 5)
      },
      {
        name: 'POST Calendar Event',
        fn: () => apiService.createCalendarEvent(user.user_id, 'Test Event', 'workout', new Date().toISOString().split('T')[0])
      },
    ];

    for (const test of tests) {
      totalCount++;
      const passed = await runTest(test.name, test.fn);
      if (passed) passCount++;
      await new Promise(resolve => setTimeout(resolve, 500)); // Delay between tests
    }

    setTesting(false);
    
    if (passCount === totalCount) {
      showSuccess(`All ${totalCount} tests passed! 🎉`);
    } else {
      showError(`${passCount}/${totalCount} tests passed`);
    }
  };

  return (
    <div className="api-test-page">
      <div className="page-header">
        <div>
          <h1>🧪 API Test Suite</h1>
          <p>Verify all API calls work without CORS errors</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={runAllTests}
          disabled={testing}
        >
          {testing ? '⏳ Running Tests...' : '▶️ Run All Tests'}
        </button>
      </div>

      <div className="card">
        <h3>Test Results</h3>
        <p className="test-info">
          This will test all API endpoints to ensure there are no CORS/OPTIONS errors.
          Open DevTools (F12) → Network tab to see the requests.
        </p>

        {Object.keys(testResults).length === 0 && !testing && (
          <div className="empty-state">
            <p>Click "Run All Tests" to begin</p>
          </div>
        )}

        {Object.keys(testResults).length > 0 && (
          <div className="test-results">
            {Object.entries(testResults).map(([name, result]) => (
              <div key={name} className="test-result-item">
                <span className="test-name">{name}</span>
                <span className={`test-status ${result.startsWith('✅') ? 'pass' : result.startsWith('❌') ? 'fail' : 'testing'}`}>
                  {result}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3>Expected Network Requests</h3>
        <div className="network-info">
          <div className="info-section">
            <h4>✅ Good (No CORS Issues):</h4>
            <ul>
              <li><code>GET /api/health?action=records</code> → 200 OK</li>
              <li><code>GET /api/fitness?action=list</code> → 200 OK</li>
              <li><code>GET /api/goals?action=list</code> → 200 OK</li>
              <li><code>POST /api/health?action=create</code> → 200 OK</li>
            </ul>
          </div>
          
          <div className="info-section">
            <h4>❌ Bad (CORS Errors - Should NOT see):</h4>
            <ul>
              <li><code>OPTIONS /api/health</code> → 400/405 Error</li>
              <li><code>OPTIONS /api/fitness</code> → 400/405 Error</li>
              <li>Request blocked by CORS policy</li>
            </ul>
          </div>

          <div className="info-section warning">
            <h4>⚠️ Note:</h4>
            <p>Some POST requests may trigger OPTIONS preflight. This is normal if the backend supports it. The actual POST request should still go through.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APITest;
