/**
 * AI Food Analysis Page - Scan food images and barcodes for nutrition data
 */

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import './AIAnalysis.css';

const AIAnalysis = () => {
  const { user } = useAuth();
  const [analysisMode, setAnalysisMode] = useState('image'); // 'image' or 'barcode'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [barcode, setBarcode] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageAnalysis = async () => {
    if (!imagePreview) {
      alert('Please upload an image first');
      return;
    }

    try {
      setLoading(true);
      const data = await apiService.analyzeFoodImage(imagePreview);
      setResult(data);
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert('Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeAnalysis = async (e) => {
    e.preventDefault();
    if (!barcode) {
      alert('Please enter a barcode');
      return;
    }

    try {
      setLoading(true);
      const data = await apiService.getNutritionByBarcode(barcode);
      setResult(data);
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
      alert('Failed to fetch nutrition data. Please check the barcode and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const captureFromCamera = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => handleImageUpload(e);
    input.click();
  };

  return (
    <div className="ai-analysis-page">
      <div className="page-header">
        <div>
          <h1>🤖 AI Food Analysis</h1>
          <p>Get instant nutrition insights from food images or barcodes</p>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="mode-selector">
        <button
          className={`mode-btn ${analysisMode === 'image' ? 'active' : ''}`}
          onClick={() => {
            setAnalysisMode('image');
            setResult(null);
          }}
        >
          📸 Image Analysis
        </button>
        <button
          className={`mode-btn ${analysisMode === 'barcode' ? 'active' : ''}`}
          onClick={() => {
            setAnalysisMode('barcode');
            setResult(null);
            setImagePreview(null);
          }}
        >
          🔲 Barcode Scanner
        </button>
      </div>

      <div className="analysis-container">
        {/* Image Analysis Mode */}
        {analysisMode === 'image' && (
          <div className="card upload-section">
            <h3>Upload Food Image</h3>
            
            {!imagePreview ? (
              <div
                className="drop-zone"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <div className="drop-zone-content">
                  <span className="upload-icon">📷</span>
                  <p>Drag and drop an image here</p>
                  <p className="or-text">or</p>
                  <div className="upload-buttons">
                    <label className="btn btn-primary">
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <button className="btn btn-secondary" onClick={captureFromCamera}>
                      📸 Take Photo
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="image-preview-section">
                <img src={imagePreview} alt="Food preview" className="image-preview" />
                <div className="preview-actions">
                  <button
                    className="btn btn-primary"
                    onClick={handleImageAnalysis}
                    disabled={loading}
                  >
                    {loading ? 'Analyzing...' : '🔍 Analyze Image'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setImagePreview(null);
                      setResult(null);
                    }}
                  >
                    ✕ Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Barcode Scanner Mode */}
        {analysisMode === 'barcode' && (
          <div className="card barcode-section">
            <h3>Enter Barcode Number</h3>
            <form onSubmit={handleBarcodeAnalysis}>
              <div className="barcode-input-group">
                <input
                  type="text"
                  className="input barcode-input"
                  placeholder="Enter barcode (e.g., 737628064502)"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Searching...' : '🔍 Search'}
                </button>
              </div>
            </form>
            <p className="barcode-hint">
              💡 Tip: You can find the barcode on the back of food packages
            </p>
          </div>
        )}

        {/* Results Section */}
        {loading && (
          <div className="card results-section">
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Analyzing nutrition data...</p>
            </div>
          </div>
        )}

        {!loading && result && (
          <div className="card results-section fade-in">
            <h3>Nutrition Analysis</h3>
            <div className="nutrition-grid">
              <div className="nutrition-card">
                <span className="nutrition-icon">🔥</span>
                <p className="nutrition-label">Calories</p>
                <p className="nutrition-value">{result.calories || 'N/A'}</p>
              </div>
              <div className="nutrition-card">
                <span className="nutrition-icon">🍖</span>
                <p className="nutrition-label">Protein</p>
                <p className="nutrition-value">{result.protein || 'N/A'}g</p>
              </div>
              <div className="nutrition-card">
                <span className="nutrition-icon">🍞</span>
                <p className="nutrition-label">Carbs</p>
                <p className="nutrition-value">{result.carbs || 'N/A'}g</p>
              </div>
              <div className="nutrition-card">
                <span className="nutrition-icon">🥑</span>
                <p className="nutrition-label">Fat</p>
                <p className="nutrition-value">{result.fat || 'N/A'}g</p>
              </div>
            </div>
            
            {result.description && (
              <div className="nutrition-description">
                <h4>Analysis</h4>
                <p>{result.description}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysis;
