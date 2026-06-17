import React, { useEffect, useState } from "react";
import { C } from "../constants/colors";
import { Icon, Icons } from "../constants/icons";
import { useCreateInvoice, useUpdateInvoice } from "../lib/apiHooks";
import { format } from "date-fns";

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

const TimeInput24h = ({ value, onChange }) => {
    const parts = (value || "00:00:00").split(":");

    const update = (index, raw) => {
        const max = [23, 59, 59][index];
        const clamped = String(Math.min(max, Math.max(0, Number(raw)))).padStart(2, "0");
        const newParts = [...parts];
        newParts[index] = clamped;
        onChange(newParts.join(":"));
    };

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "2px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                padding: "6px 10px",
                width: "fit-content",
                background: "#fff",
            }}
        >
            {["HH", "MM", "SS"].map((placeholder, i) => (
                <React.Fragment key={placeholder}>
                    <input
                        type="number"
                        min={0}
                        max={[23, 59, 59][i]}
                        placeholder={placeholder}
                        value={parts[i] || "00"}
                        onChange={(e) => update(i, e.target.value)}
                        onBlur={(e) => update(i, e.target.value)}
                        style={{
                            width: "36px",
                            border: "none",
                            outline: "none",
                            textAlign: "center",
                            fontSize: "14px",
                            fontFamily: "inherit",
                            MozAppearance: "textfield",
                        }}
                    />
                    {i < 2 && (
                        <span style={{ color: "#555", userSelect: "none" }}>:</span>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default function PatientModal({ onClose, onSuccess, receipt, loadingCreate=false, loadingUpdate =false}) {
    const createInvoice = useCreateInvoice();
    const loading = createInvoice.isPending;
    const [error, setError] = useState("");
    const updateInvoice = useUpdateInvoice();

    // Patient Info
    const [clientName, setClientName] = useState("");
    const [clientId, setClientId] = useState("");
    const [clientGender, setClientGender] = useState("m");
    const [receiptID, setReceiptID] = useState("");

    // Issue Date/Time
    const [issueDate, setIssueDate] = useState("");

    useEffect(() => {
        if (!receipt) return;

        setClientName(receipt.clientName ?? "");
        setClientId(receipt.clientId ?? "");
        setClientGender(receipt.clientGender ?? "m");
        setReceiptID(receipt?.invoiceNumber ?? "");
        setIssueDate(
            receipt.issueDate
                ? format(new Date(receipt.issueDate), "yyyy-MM-dd'T'HH:mm:ss")
                : "",
        );
    }, [receipt]);

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setError("");

        if (!clientId.trim()) return setError("Patient ID is required.");
        if (!clientName.trim()) return setError("Client name is required.");
        if (!issueDate) return setError("Issue date is required.");

        const payload = {
            clientName: clientName.trim(),
            clientId: clientId.trim(),
            clientGender: clientGender.trim(),
            receiptID: receiptID.trim(),
            issueDate: new Date(issueDate).toISOString(),
            id: receipt?.id || ""
        };

        onSuccess(payload)
    };

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

                    </div>
                    <button
                        onClick={() => onClose()}
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
                <div
                    style={{
                        padding: "20px 24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 20,
                    }}
                >
                    {/* Patient Information */}
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
                            <Field label="Patient Name" required>
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

                            <Field label="Receipt ID">
                                <TextInput
                                    value={receiptID}
                                    onChange={(e) => setReceiptID(e.target.value)}
                                    placeholder="....."
                                />
                            </Field>

                            <Field label="Issue Date" required>
                                <TextInput
                                    type="date"
                                    value={issueDate.split("T")[0] || ""}
                                    onChange={(e) =>
                                        setIssueDate(
                                            `${e.target.value}T${issueDate.split("T")[1] || "00:00:00"}`,
                                        )
                                    }
                                />
                            </Field>

                            <Field label="Issue Time" required>
                                <TimeInput24h
                                    value={issueDate.split("T")[1] || "00:00:00"}
                                    onChange={(time) =>
                                        setIssueDate(`${issueDate.split("T")[0] || ""}T${time}`)
                                    }
                                />
                            </Field>
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
                        onClick={() => onClose()}
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
                        disabled={loadingCreate || loadingUpdate}
                        onClick={() => handleSubmit()}
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
                        {loadingCreate || loadingUpdate ? "Please Wait..." : "Continue"}
                    </button>
                </div>
            </div>
        </div>
    );
}