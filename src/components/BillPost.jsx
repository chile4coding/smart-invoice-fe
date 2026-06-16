import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';
import { AlertCircle } from 'lucide-react';
import './BillPostingForm.css';

const PAGE_SIZE = 10;

export default function BillPostingForm() {
  // Replace with real API calls
  const loadDepartments = async (input) => {
    const all = [
      { value: 1, label: 'ACCIDENT AND EMERGENCY' },
      { value: 2, label: 'Cardiology' },
      { value: 3, label: 'Radiology' },
      { value: 4, label: 'Pharmacy' },
      { value: 5, label: 'Laboratory' },
    ];
    return all.filter((o) => o.label.toLowerCase().includes(input.toLowerCase()));
  };

  const loadBillNames = async (input) => {
    const all = [
      { value: 1, label: 'CONSULTATION FEE - A&E' },
      { value: 2, label: 'Lab Test' },
      { value: 3, label: 'X-Ray' },
      { value: 4, label: 'Drug Dispensing' },
    ];
    return all.filter((o) => o.label.toLowerCase().includes(input.toLowerCase()));
  };

  // Draft (the input row at the top)
  const [draft, setDraft] = useState({ unit: null, billName: null, amount: '' });
  // Added bill lines shown in the table
  const [bills, setBills] = useState([]);
  // Pagination
  const [page, setPage] = useState(1);
  // Discount code
  const [discountCode, setDiscountCode] = useState('');

  const total = bills.reduce((sum, b) => sum + Number(b.amount || 0), 0);

  const totalPages = Math.max(1, Math.ceil(bills.length / PAGE_SIZE));
  const pagedBills = bills.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleAdd() {
    if (!draft.unit || !draft.billName || !draft.amount) return;
    setBills((prev) => [...prev, { ...draft }]);
    setDraft({ unit: null, billName: null, amount: '' });
    // Stay on last page after adding
    setPage(Math.ceil((bills.length + 1) / PAGE_SIZE));
  }

  function handleRemove(globalIndex) {
    setBills((prev) => prev.filter((_, i) => i !== globalIndex));
    // Clamp page if we removed the last item on this page
    setPage((p) => Math.min(p, Math.max(1, Math.ceil((bills.length - 1) / PAGE_SIZE))));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (bills.length === 0) return;
    console.log({ bills, discountCode });
    // Call your API here
  }

  return (
    <div className="bpf-container">
      {/* ── Input row ── */}
      <div className="bpf-input-row">
        <div className="bpf-field">
          <label className="bpf-label">Unit</label>
          <AsyncSelect
            placeholder="Select clinic/department"
            loadOptions={loadDepartments}
            value={draft.unit}
            onChange={(opt) => setDraft((d) => ({ ...d, unit: opt }))}
            components={{ IndicatorSeparator: () => null }}
            
          />
        </div>

        <div className="bpf-field">
          <label className="bpf-label">Name of bill</label>
          <AsyncSelect
            placeholder="Select bill"
            loadOptions={loadBillNames}
            value={draft.billName}
            components={{ IndicatorSeparator: () => null }}
            onChange={(opt) => setDraft((d) => ({ ...d, billName: opt }))}
          />
        </div>

        <div className="bpf-field bpf-field--amount">
          <label className="bpf-label">Amount</label>
          <input
            type="number"
            className="bpf-amount-input"
            value={draft.amount}
            onChange={(e) => setDraft((d) => ({ ...d, amount: e.target.value }))}
            placeholder="0"
          />
        </div>
      </div>

      <button
        type="button"
        className="bpf-add-btn"
        onClick={handleAdd}
        disabled={!draft.unit || !draft.billName || !draft.amount}
      >
        Add
      </button>

      {/* ── Table ── */}
      <div className="bpf-table-wrapper">
        <table className="bpf-table">
          <thead>
            <tr>
              <th className="bpf-th bpf-th--sn">
                S/N <span className="bpf-sort-arrow">↑</span>
              </th>
              <th className="bpf-th">Department</th>
              <th className="bpf-th">Name of Bill</th>
              <th className="bpf-th">Amount</th>
              <th className="bpf-th bpf-th--action">Action</th>
            </tr>
          </thead>
          <tbody>
            {pagedBills.length === 0 ? (
              <tr>
                <td colSpan={5} className="bpf-empty">
                  No bills added yet.
                </td>
              </tr>
            ) : (
              pagedBills.map((bill, i) => {
                const globalIndex = (page - 1) * PAGE_SIZE + i;
                return (
                  <tr key={globalIndex} className="bpf-tr">
                    <td className="bpf-td">{globalIndex + 1}</td>
                    <td className="bpf-td">{bill.unit?.label}</td>
                    <td className="bpf-td">{bill.billName?.label}</td>
                    <td className="bpf-td">{Number(bill.amount).toLocaleString()}</td>
                    <td className="bpf-td bpf-td--action">
                      <button
                        type="button"
                        className="bpf-remove-btn"
                        onClick={() => handleRemove(globalIndex)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bpf-pagination">
            <button
              className="bpf-page-btn bpf-page-btn--nav"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className={`bpf-page-btn${n === page ? ' bpf-page-btn--active' : ''}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              className="bpf-page-btn bpf-page-btn--nav"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              ›
            </button>
          </div>
        )}
      </div>

      {/* ── Total (bottom-right) ── */}
      <div className="bpf-total-row">
        <div className="bpf-total-box">
          <div className="bpf-total-label">Total</div>
          <div className="bpf-total-value">₦{total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* ── Discount code ── */}
      <div className="bpf-discount-box">
        <div className="bpf-discount-icon">
          <AlertCircle size={18} />
        </div>
        <div className="bpf-discount-content">
          <h4 className="bpf-discount-title">Do you have a discount code?</h4>
          <p className="bpf-discount-desc">Enter your discount code below if yes.</p>
          <input
            type="text"
            className="bpf-discount-input"
            placeholder="Discount Code"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
          />
        </div>
      </div>

      {/* ── Post ── */}
      <button
        type="button"
        className="bpf-post-btn"
        disabled={bills.length === 0}
        onClick={handleSubmit}
      >
        Post
      </button>
    </div>
  );
}