import React, { useState } from 'react';
import AsyncCreatableSelect from 'react-select/async-creatable';
import { AlertCircle } from 'lucide-react';
import './BillPostingForm.css';
import { apiClient } from '../lib/api';
import { useDepartments, useUnits } from '../lib/apiHooks';
import { fmtAmount } from '../lib/utils';

const PAGE_SIZE = 10;

export default function BillPostingForm({
  draft = { unit: null, billName: null, amount: '' }, setDraft,
  bills = [], setBills,
  discountCode = "",
  setDiscountCode,
  handleSubmit

}) {
  const [departmentId, setDepartmentId] = useState("");
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [page, setPage] = useState(1);


  const getDepartment = useDepartments()
  const getUnit = useUnits()
  // Replace with real API calls
  const loadDepartments = async (input) => {
    let data = await getDepartment(input, 1, 100)
    data = data?.departments?.map((department) => ({
      ...department,
      label: department?.name || "",
      value: department?.name || ""
    }))

    return data
  };

  const loadBillNames = async (input) => {
    if (!departmentId) return [];
    const data = await getUnit(input, 1, 100, departmentId);
    return data?.fees?.map((fee) => ({
      ...fee,
      label: fee.billname,
      value: fee.billname,
    }));
  };

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



  return (
    <div className="bpf-container">
      {/* ── Input row ── */}
      <div className="bpf-input-row">
        <div className="bpf-field">
          <label className="bpf-label">Unit</label>
        

          <AsyncCreatableSelect
            placeholder="Select or create clinic/department"
            loadOptions={loadDepartments}
            defaultOptions
            value={draft.unit}
            onChange={(opt) => {

              console.log("this is the a department: ",  opt)
              setDraft((d) => ({ ...d, unit: opt, billName: "", amount: 0 }))
              setDepartmentId(opt.id);
            }}
            onCreateOption={async (inputValue) => {
              // call your API here to actually create the department
              // const newDepartment = await createDepartment(inputValue);

              const newOption = {
                label: inputValue,
                value: inputValue,
              };

              setDraft((d) => ({ ...d, unit: newOption, billName: "", amount: 0 }));
              setDepartmentId(inputValue);
            }}
            components={{ IndicatorSeparator: () => null }}
          />
        </div>

        <div className="bpf-field">
          <label className="bpf-label">Name of bill</label>
          <AsyncCreatableSelect
            placeholder="Select or create bill"
            loadOptions={loadBillNames}
            key={departmentId || "no-department"}
            value={draft.billName}
            defaultOptions
            isDisabled={!departmentId}
            components={{ IndicatorSeparator: () => null }}
            onChange={(opt) =>{
              console.log("this is the option: here: " ,)
              setDraft((d) => ({ ...d, billName: opt, amount: opt.billcost }))}
          }
            onCreateOption={async (inputValue) => {
              // const newFee = await createBill({ billName: inputValue, departmentId });

              const newOption = {
                // ...newFee,
                label: inputValue,
                value: inputValue,
              };

              setDraft((d) => ({ ...d, billName: newOption, amount: 0 }));
            }}
          />
        </div>


        <div className="bpf-field bpf-field--amount">
          <label className="bpf-label">Amount</label>
          <input
            type="text"
            inputMode="decimal"
            className="bpf-amount-input"
            value={
              isAmountFocused
                ? draft.amount
                : draft.amount
                  ? fmtAmount(Number(draft.amount), "NGN")
                  : ""
            }
            onFocus={() => setIsAmountFocused(true)}
            onBlur={() => setIsAmountFocused(false)}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9.]/g, "");
              setDraft((d) => ({ ...d, amount: raw }));
            }}
            placeholder="0"
          />
        </div>
      </div>

      <button
        type="button"
        className="bpf-add-btn"
        onClick={handleAdd}
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
                  No data available in table                </td>
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
        onClick={handleSubmit}
      >
        Post
      </button>
    </div>
  );
}