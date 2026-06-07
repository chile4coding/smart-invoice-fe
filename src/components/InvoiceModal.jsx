import { useEffect, useState } from "react";
import { C } from "../constants/colors";
import { Icon, Icons } from "../constants/icons";
import { useCreateInvoice, useUpdateInvoice } from "../lib/apiHooks";
import { format } from "date-fns";

const CURRENCIES = ["NGN", "USD", "GBP", "EUR"];

const defaultLineItem = () => ({ description: "", quantity: 1, unitPrice: "" });

const inputStyle = (focused) => ({
  width: "100%",
  padding: "10px 12px",
  border: `1.5px solid ${focused ? C.primary : C.border}`,
  borderRadius: 8,
  fontSize: 13,
  color: C.text,
  background: C.white,
  transition: "border 0.2s",
  outline: "none",
});

const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: C.primaryTableColor,
  display: "block",
  marginBottom: 5,
};

const sectionTitle = {
  fontSize: 13,
  fontWeight: 700,
  color: C.primaryTableColor,
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: `1px solid ${C.border}`,
};

function Field({ label, required, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label style={labelStyle}>
        {label} {required && <span style={{ color: C.red }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text" }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={inputStyle(focused)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function SelectInput({ value, onChange, options }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value}
      onChange={onChange}
      style={{ ...inputStyle(focused), appearance: "none", cursor: "pointer" }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {options.map((o) => (
        <option key={o.value ?? o} value={o.value ?? o}>
          {o.label ?? o}
        </option>
      ))}
    </select>
  );
}

// Convert naira display value → kobo (minor units)
const toMinorUnits = (val) => Math.round(parseFloat(val || 0) * 100);
// Convert kobo → naira display
const fromMinorUnits = (val) => (val / 100).toFixed(2);

export default function InvoiceModal({ onClose, onSuccess,  receipt }) {
  const createInvoice = useCreateInvoice();
  const loading = createInvoice.isPending;
  const [error, setError] = useState("");
  const updateInvoice = useUpdateInvoice()

  // Client Info
  const [clientName, setClientName] = useState("");
 
  const [clientId, setClientId] = useState("");
  const [clientGender, setClientGender] = useState("m");

  // Invoice Details
  const [issueDate, setIssueDate] = useState("");
  const [currency, setCurrency] = useState("NGN");

  // Line Items
  const [lineItems, setLineItems] = useState([defaultLineItem()]);

  // ── Calculations ──────────────────────────────────────────────────────────
  const subtotal = lineItems.reduce(
    (sum, item) =>
      sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0),
    0
  );
  const taxAmount = subtotal 
  
  const grandTotal = subtotal 

  const fmt = (n) =>
    n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ── Line Item Handlers ────────────────────────────────────────────────────
  const updateLineItem = (index, field, value) => {
    setLineItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addLineItem = () => setLineItems((prev) => [...prev, defaultLineItem()]);
useEffect(() => {
  if (!receipt) return;

  setClientName(receipt.clientName ?? "");

  setClientId(receipt.clientId ?? "");
  setClientGender(receipt.clientGender ?? "m");

  setIssueDate(receipt.issueDate ? format(new Date(receipt.issueDate), "yyyy-MM-dd'T'HH:mm") : "");
  setCurrency(receipt.currency ?? "NGN");



  setLineItems(receipt.lineItems?.length ? receipt.lineItems.map((item) => ({
    description: item.description ?? "",
    quantity: Number(item.quantity) ?? 1,
    unitPrice: Number(item.unitPrice) ?? 0,
  })) : [defaultLineItem()]);
}, [receipt]);

  const removeLineItem = (index) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError("");

    // Basic validation
    if (!clientId.trim()) return setError("Patient ID is required.");
    if (!clientName.trim()) return setError("Client name is required.");
    if (!issueDate) return setError("Issue date is required.");
    if (lineItems.some((i) => !i.description.trim() || !i.unitPrice))
      return setError("All line items must have a description and unit price.");

    const payload = {
      clientName: clientName.trim(),
      issueDate: new Date(issueDate).toISOString(),
      currency,
      lineItems: lineItems.map((item) => ({
        description: item.description.trim(),
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unitPrice),
      })),
      clientId: clientId.trim(),
      clientGender: clientGender.trim()
    };

    if(receipt?.id){
      updateInvoice.mutate({...payload, id: receipt.id}, {
  
        onSuccess: (result) => {
          if (result.ok && result.data?.success) {
            onSuccess?.(result.data.data);
            onClose();
          } else {
            const msg =
              result.data?.error?.details?.[0]?.message ||
              result.data?.error?.message ||
              "Failed to update invoice.";
            setError(msg);
          }
        },
        onError: () => {
          setError("Network error. Please try again.");
        },
      });

    }else{
      createInvoice.mutate(payload, {
  
        onSuccess: (result) => {
          if (result.ok && result.data?.success) {
            onSuccess?.(result.data.data);
            onClose();
          } else {
            const msg =
              result.data?.error?.details?.[0]?.message ||
              result.data?.error?.message ||
              "Failed to create invoice.";
            setError(msg);
          }
        },
        onError: () => {
          setError("Network error. Please try again.");
        },
      });

    }
  };

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "16px",
      }}
    >
      <div
        style={{
          background: C.bg,
          borderRadius: 12,
          width: "100%",
          maxWidth: 680,
          maxHeight: "95vh",
          overflowY: "auto",
          boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            background: C.white,
            borderBottom: `1px solid ${C.border}`,
            borderRadius: "12px 12px 0 0",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>
              Create Invoice
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
              Fill in the details below to generate a new invoice
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: C.bg,
              borderRadius: 8,
              padding: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon d={Icons.x} size={18} color={C.muted} />
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Client Information */}
          <div
            style={{
              background: C.white,
              borderRadius: 10,
              padding: "18px 20px",
              border: `1px solid ${C.border}`,
            }}
          >
            <div style={sectionTitle}>Patient Information</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 14,
              }}
            >
              <Field label="Client Name" required>
                <TextInput
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                />
              </Field>
             
             
             
              <Field label="Patient ID">
                <TextInput
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="123"
                />
              </Field>

               <Field label="Gender">
                <SelectInput
                  value={clientGender}
                  onChange={(e) => setClientGender(e.target.value)}
                  options={["m", "f"]}
                />
              </Field>
            </div>
          </div>

          {/* Invoice Details */}
          <div
            style={{
              background: C.white,
              borderRadius: 10,
              padding: "18px 20px",
              border: `1px solid ${C.border}`,
            }}
          >
            <div style={sectionTitle}>Invoice Details</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: 14,
              }}
            >
              <Field label="Issue Date" required>
                <TextInput
                      type="datetime-local"

                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </Field>
              
              <Field label="Currency">
                <SelectInput
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  options={CURRENCIES}
                />
              </Field>
             
             
            
            </div>
           
          </div>

          {/* Line Items */}
          <div
            style={{
              background: C.white,
              borderRadius: 10,
              padding: "18px 20px",
              border: `1px solid ${C.border}`,
            }}
          >
            <div style={sectionTitle}>Line Items</div>

            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px 120px 100px 36px",
                gap: 8,
                marginBottom: 8,
                padding: "0 4px",
              }}
            >
              {["Description", "Qty", `Unit Price (${currency})`, "Total", ""].map((h) => (
                <div
                  key={h}
                  style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.4px" }}
                >
                  {h}
                </div>
              ))}
            </div>

            {/* Line item rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {lineItems.map((item, index) => {
                const rowTotal =
                  (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
                return (
                  <div
                    key={index}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 80px 120px 100px 36px",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <TextInput
                      value={item.description}
                      onChange={(e) => updateLineItem(index, "description", e.target.value)}
                      placeholder="Item description"
                    />
                    <TextInput
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, "quantity", e.target.value)}
                      placeholder="1"
                    />
                    <TextInput
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(index, "unitPrice", e.target.value)}
                      placeholder="0.00"
                    />
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: C.text,
                        padding: "10px 12px",
                        background: C.bg,
                        borderRadius: 8,
                        border: `1.5px solid ${C.border}`,
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fmt(rowTotal)}
                    </div>
                    <button
                      onClick={() => removeLineItem(index)}
                      disabled={lineItems.length === 1}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        background: lineItems.length === 1 ? C.bg : "#fff1f2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        opacity: lineItems.length === 1 ? 0.4 : 1,
                        cursor: lineItems.length === 1 ? "not-allowed" : "pointer",
                      }}
                    >
                      <Icon d={Icons.x} size={14} color={C.red} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Add item button */}
            <button
              onClick={addLineItem}
              style={{
                marginTop: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: C.primary,
                background: C.cardBlue,
                border: `1.5px dashed ${C.primary}`,
                borderRadius: 8,
                padding: "8px 16px",
                width: "100%",
                justifyContent: "center",
              }}
            >
              <Icon d={Icons.newReg} size={15} color={C.primary} /> Add Line Item
            </button>

            {/* Totals */}
            <div
              style={{
                marginTop: 16,
                borderTop: `1px solid ${C.border}`,
                paddingTop: 14,
                display: "flex",
                flexDirection: "column",
                gap: 6,
                alignItems: "flex-end",
              }}
            >
              {[
                ["Subtotal", subtotal],
                [`Discount`, -0],
              ].map(([label, val]) => (
                <div
                  key={label}
                  style={{ display: "flex", gap: 40, fontSize: 13, color: C.muted }}
                >
                  <span style={{ fontWeight: 500 }}>{label}</span>
                  <span style={{ fontWeight: 600, color: C.text, minWidth: 100, textAlign: "right" }}>
                    {currency} {fmt(Math.abs(val))}
                    {label.startsWith("Discount") && val !== 0 ? " (-)" : ""}
                  </span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  gap: 40,
                  fontSize: 15,
                  fontWeight: 800,
                  color: C.text,
                  borderTop: `1.5px solid ${C.border}`,
                  paddingTop: 8,
                  marginTop: 4,
                }}
              >
                <span>Grand Total</span>
                <span style={{ color: C.primary, minWidth: 100, textAlign: "right" }}>
                  {currency} {fmt(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                background: "#fff1f2",
                border: `1px solid ${C.red}`,
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 13,
                color: C.red,
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            padding: "16px 24px",
            background: C.white,
            borderTop: `1px solid ${C.border}`,
            borderRadius: "0 0 12px 12px",
            position: "sticky",
            bottom: 0,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 22px",
              background: C.bg,
              color: C.muted,
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 13,
              border: `1.5px solid ${C.border}`,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: "10px 28px",
              background: loading ? C.muted : C.primary,
              color: C.white,
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 13,
              opacity: loading ? 0.7 : 1,
              transition: "background 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {loading ? "Creating..." : "Create Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}