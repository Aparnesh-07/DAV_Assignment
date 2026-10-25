import React, { useState, useEffect } from 'react';
import { fetchQualityReport } from '../services/api';
import {
  CheckCircle2,
  Database,
  Layers,
  BarChart3,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function Methodology() {
  const [qaReport, setQaReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQualityReport()
      .then(data => {
        setQaReport(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Methodology</h1>
          <p className="page-desc">
            Technical documentation covering data sources, preprocessing pipelines, data quality checks, and system architecture.
          </p>
        </div>
      </div>

      {/* Visual Data Health Scorecard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 20 }}>
        <div className="card" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16A34A', marginBottom: 4 }}>
            <ShieldCheck size={18} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Completeness</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>100%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>3,652 consecutive days per city</div>
        </div>

        <div className="card" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16A34A', marginBottom: 4 }}>
            <CheckCircle2 size={18} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Duplicates</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>0 Rows</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Zero duplicate (city, date) entries</div>
        </div>

        <div className="card" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16A34A', marginBottom: 4 }}>
            <CheckCircle2 size={18} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Null Cells</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>0 Remaining</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>1 missing et0 cell imputed with June mean</div>
        </div>

        <div className="card" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16A34A', marginBottom: 4 }}>
            <CheckCircle2 size={18} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Physical Sanity</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>100% Passed</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Min temp &le; Mean &le; Max across all rows</div>
        </div>
      </div>

      {/* Role of 3 Core Technologies */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Technology Stack</div>
        <div className="card-subtitle">
          How Python, KNIME, and Tableau are utilized across the platform
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 8, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#0F766E', marginBottom: 4, fontSize: '0.92rem' }}>
              <Layers size={16} />
              Python &amp; FastAPI
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Handles data preprocessing, temporal feature extraction, summary statistics, interactive Plotly visualization payloads, and the machine learning model.
            </p>
          </div>

          <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 8, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#0F766E', marginBottom: 4, fontSize: '0.92rem' }}>
              <Database size={16} />
              KNIME Analytics Platform
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Executes visual data workflows for quality auditing, multi-year climatological aggregations, 99th-percentile anomaly detection, and PCA clustering.
            </p>
          </div>

          <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 8, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#0F766E', marginBottom: 4, fontSize: '0.92rem' }}>
              <BarChart3 size={16} />
              Tableau Public
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Hosts dedicated interactive dashboards embedded directly in the application for geospatial weather mapping and urban disaster vulnerability analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Verified Data Quality Report Table */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">
          <CheckCircle2 size={16} color="var(--primary)" />
          Dataset Quality &amp; Completeness Verification Table
        </div>
        <div className="card-subtitle">
          Computed across all 182,600 daily rows in the 10-year dataset
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Verification Check</th>
                <th>Result</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {qaReport.map((row, idx) => (
                <tr key={idx}>
                  <td><strong>{row.metric}</strong></td>
                  <td><code>{row.value}</code></td>
                  <td>
                    <span className="badge badge-green">
                      {row.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{row.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preprocessing Decisions */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Data Preprocessing &amp; Normalization</div>
        <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          <p>
            <strong>Temporal Classification:</strong> Dates are parsed into calendar year, month, and standard India Meteorological Department (IMD) seasons: Winter (Dec–Feb), Summer (Mar–May), Monsoon (Jun–Sep), and Post-Monsoon (Oct–Nov).
          </p>
          <p>
            <strong>Unit Standardization:</strong> Raw daylight and sunshine durations reported in seconds were converted to hours (<code style={{ background: '#F1F5F9', padding: '1px 5px', borderRadius: 3 }}>seconds / 3600.0</code>) for intuitive interpretation.
          </p>
          <p>
            <strong>Missing Value Treatment:</strong> Exactly 1 missing value exists in the raw data (Guwahati on 2016-06-05, evapotranspiration), which was imputed with Guwahati's historical June mean (4.44 mm).
          </p>
          <p>
            <strong>Outliers:</strong> Extreme weather values (such as 47.3°C peak heat and 494.9 mm monsoon rain) were verified as authentic meteorological events and retained.
          </p>
        </div>
      </div>

      {/* Limitations */}
      <div className="card" style={{ background: '#F8FAFC', borderColor: '#E2E8F0' }}>
        <div className="card-title" style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
          <AlertCircle size={15} color="var(--primary)" /> Academic &amp; Analytical Notes
        </div>
        <ul style={{ paddingLeft: 18, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
          <li style={{ marginBottom: 4 }}>
            <strong>Correlation vs Causation:</strong> Statistical correlations indicate observed co-movement, not direct hydrodynamic causation.
          </li>
          <li style={{ marginBottom: 4 }}>
            <strong>Decadal Record:</strong> A 10-year span (2010–2019) captures inter-annual climatological variability, whereas long-term climate normals typically require 30-year standards.
          </li>
          <li>
            <strong>Estimation Scope:</strong> Predictive estimates in this application are for analytical demonstration and should not replace official meteorological agency forecasts for critical operations.
          </li>
        </ul>
      </div>
    </div>
  );
}
