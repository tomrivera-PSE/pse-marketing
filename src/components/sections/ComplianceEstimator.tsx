'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  calculateExposure,
  formatCurrency,
  type EstimatorInputs,
  type EstimatorOutputs,
} from '@/lib/estimator';
import type { IndustryKey } from '@/data/estimatorConstants';

const INDUSTRIES: { value: IndustryKey; label: string }[] = [
  { value: 'healthcare',     label: 'Healthcare' },
  { value: 'transportation', label: 'Transportation & Logistics' },
  { value: 'retail',         label: 'Retail & Hospitality' },
  { value: 'manufacturing',  label: 'Manufacturing' },
  { value: 'staffing',       label: 'Staffing & Workforce' },
  { value: 'financial',      label: 'Financial Services' },
  { value: 'real_estate',    label: 'Real Estate & Property' },
  { value: 'other',          label: 'Other' },
];

const DEFAULT_INPUTS: EstimatorInputs = {
  employees: 250,
  states: 3,
  industry: 'other',
  payrollRunsPerYear: 26,
};

type Step = 'inputs' | 'results' | 'captured';

export function ComplianceEstimator() {
  const [step, setStep] = useState<Step>('inputs');
  const [inputs, setInputs] = useState<EstimatorInputs>(DEFAULT_INPUTS);
  const [results, setResults] = useState<EstimatorOutputs | null>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCalculate = () => {
    const output = calculateExposure(inputs);
    setResults(output);
    setStep('results');
    setTimeout(() => {
      document.getElementById('estimator-results')?.scrollIntoView({
        behavior: 'smooth', block: 'start'
      });
    }, 100);
  };

  const handleEmailSubmit = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid work email');
      return;
    }
    setEmailError('');
    setSubmitting(true);
    try {
      await fetch('/api/lead-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'compliance-estimator',
          estimatorInputs: inputs,
          estimatorTotal: results?.totalAnnualExposure,
        }),
      });
    } catch {
      // Fail silently — lead capture failure should not block UX
    }
    setSubmitting(false);
    setStep('captured');
  };

  return (
    <div className="est-wrapper">

      {/* Input panel */}
      <div className="est-inputs">
        <p className="est-inputs__label">Your organization</p>

        <div className="est-field">
          <label className="est-field__label">
            Employees
            <span className="est-field__value">{inputs.employees.toLocaleString()}</span>
          </label>
          <input
            type="range"
            min={10} max={5000} step={10}
            value={inputs.employees}
            onChange={e => setInputs(p => ({ ...p, employees: +e.target.value }))}
            className="est-slider"
          />
          <div className="est-slider__ticks">
            <span>10</span><span>1,000</span><span>5,000</span>
          </div>
        </div>

        <div className="est-field">
          <label className="est-field__label">
            States
            <span className="est-field__value">{inputs.states}</span>
          </label>
          <input
            type="range"
            min={1} max={20} step={1}
            value={inputs.states}
            onChange={e => setInputs(p => ({ ...p, states: +e.target.value }))}
            className="est-slider"
          />
          <div className="est-slider__ticks">
            <span>1</span><span>10</span><span>20+</span>
          </div>
        </div>

        <div className="est-field">
          <label className="est-field__label">Industry</label>
          <select
            value={inputs.industry}
            onChange={e => setInputs(p => ({
              ...p, industry: e.target.value as IndustryKey
            }))}
            className="est-select"
          >
            {INDUSTRIES.map(i => (
              <option key={i.value} value={i.value}>{i.label}</option>
            ))}
          </select>
        </div>

        <button className="est-calculate-btn" onClick={handleCalculate}>
          Calculate my exposure
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            width="14" height="14">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>

        <p className="est-inputs__note">
          No email required to see your results.
        </p>
      </div>

      {/* Results panel */}
      {step !== 'inputs' && results && (
        <div className="est-results" id="estimator-results">

          <div className="est-results__header">
            <p className="est-results__eyebrow">Estimated annual exposure</p>
            <div className="est-results__total">
              {formatCurrency(results.totalAnnualExposure)}
            </div>
            <p className="est-results__total-label">
              for a {results.inputs.employees.toLocaleString()}-employee
              {' '}{INDUSTRIES.find(i => i.value === results.inputs.industry)?.label ?? ''}{' '}
              employer across {results.inputs.states} state{results.inputs.states !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="est-breakdown">
            <div className="est-breakdown__row">
              <div className="est-breakdown__label">
                <span className="est-breakdown__name">Deposit penalty exposure</span>
                <span className="est-breakdown__source">IRC §6656</span>
              </div>
              <span className="est-breakdown__value">
                {formatCurrency(results.depositPenaltyExposure)}
              </span>
            </div>
            <div className="est-breakdown__row">
              <div className="est-breakdown__label">
                <span className="est-breakdown__name">Wage &amp; hour back-pay exposure</span>
                <span className="est-breakdown__source">DOL WHD FY2023</span>
              </div>
              <span className="est-breakdown__value">
                {formatCurrency(results.wageHourExposure)}
              </span>
            </div>
            <div className="est-breakdown__row">
              <div className="est-breakdown__label">
                <span className="est-breakdown__name">Compliance staff time cost</span>
                <span className="est-breakdown__source">EY 2024</span>
              </div>
              <span className="est-breakdown__value">
                {formatCurrency(results.complianceTimeCost)}
              </span>
            </div>
            <div className="est-breakdown__row est-breakdown__row--last">
              <div className="est-breakdown__label">
                <span className="est-breakdown__name">Error correction cost</span>
                <span className="est-breakdown__source">EY / IRS</span>
              </div>
              <span className="est-breakdown__value">
                {formatCurrency(results.errorCorrectionCost)}
              </span>
            </div>
          </div>

          {/* Lead gate — email for PDF */}
          {step === 'results' && (
            <div className="est-gate">
              <p className="est-gate__headline">
                Get the full breakdown with source citations
              </p>
              <p className="est-gate__sub">
                We&apos;ll email a PDF report with the complete calculation,
                all data sources, and how PSE addresses each exposure area.
              </p>
              <div className="est-gate__form">
                <input
                  type="email"
                  placeholder="Work email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()}
                  className={`est-gate__input${emailError ? ' est-gate__input--error' : ''}`}
                />
                <button
                  className="est-gate__btn"
                  onClick={handleEmailSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Sending...' : 'Email me the report'}
                </button>
              </div>
              {emailError && (
                <p className="est-gate__error">{emailError}</p>
              )}
              <p className="est-gate__skip">
                <Link href="/#demo" className="est-gate__demo-link">
                  Skip the report — request a demo instead
                </Link>
              </p>
            </div>
          )}

          {step === 'captured' && (
            <div className="est-captured">
              <div className="est-captured__icon">&#10003;</div>
              <p className="est-captured__headline">Report on its way</p>
              <p className="est-captured__sub">
                Check your inbox. The full breakdown includes source
                citations for every figure in this estimate.
              </p>
              <Link href="/#demo" className="est-cta-btn">
                Request a demo to discuss your exposure
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  width="13" height="13">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            </div>
          )}

          <div className="est-disclaimer">
            Estimates use industry benchmark data — not PSE client outcomes.
            Actual exposure varies by payroll structure, error history,
            and jurisdiction. Sources: {results.sources.join(' · ')}
          </div>

          <button
            className="est-recalculate"
            onClick={() => { setStep('inputs'); setResults(null); setEmail(''); }}
          >
            Recalculate
          </button>

        </div>
      )}
    </div>
  );
}
