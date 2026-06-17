import { useState, useEffect, useMemo } from "react";
import { C } from "../constants/colors";
import { Icon, Icons } from "../constants/icons";
import { useAuth } from "../hooks/useAuth";
import {
  useInvoices,
  useUpdateInvoiceStatus,
  useDeleteInvoice,
  useCreateInvoice,
  useUpdateInvoice,
} from "../lib/apiHooks";
import InvoiceModal from "../components/InvoiceModal";
import ReceiptModal from "../components/ReceiptModal";
import { apiClient } from "../lib/api";
import { fmtAmount, formatRelativeDate, getInitials } from "../lib/utils";
import ConfirmDialog from "../components/Confirmable";
import BillPostingForm from "../components/BillPost";
import PatientModal from "../components/PatientModal";

const LIMIT = 10;
const MOCK_PATIENT = {
  initials: "PE",
  name: "Patrick Isaiah Effiong",
  id: "131474",
  gender: "Male",
  balance: "NGN 150,400",
};

const MOCK_RECEIPTS = [
  {
    sn: 1,
    type: "Payment Receipt",
    id: "260602021142133",
    amount: "22,300",
    date: "Last Tue, 2:11 PM",
  },
  {
    sn: 2,
    type: "Payment Receipt",
    id: "260602022146217",
    amount: "2,500",
    date: "Last Tue, 2:21 PM",
  },
  {
    sn: 3,
    type: "Payment Receipt",
    id: "260602022246017",
    amount: "11,000",
    date: "Last Tue, 2:22 PM",
  },
  {
    sn: 4,
    type: "Payment Receipt",
    id: "260602050481520",
    amount: "25,100",
    date: "Last Tue, 5:04 PM",
  },
  {
    sn: 5,
    type: "Payment Receipt",
    id: "260603011932270",
    amount: "1,400",
    date: "Yesterday, 1:19 PM",
  },
  {
    sn: 6,
    type: "Payment Receipt",
    id: "260603051070367",
    amount: "3,500",
    date: "Yesterday, 5:10 PM",
  },
];

const styles = {
  wrap: { padding: "1.5rem", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  searchRow: { display: "flex", gap: 10, marginBottom: "1.5rem" },
  input: {
    flex: 1,
    height: 44,
    padding: "0 16px",
    border: `1.5px solid ${C.border}`,
    borderRadius: 10,
    fontSize: 14,
    color: C.text,
    background: C.white,
    outline: "none",
    fontFamily: "inherit",
  },
  searchBtn: {
    height: 44,
    padding: "0 24px",
    background: C.primary,
    color: C.white,
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
  },
  patientCard: {
    background: C.cardBlue,
    borderRadius: 6,
    padding: "2rem 1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "1.25rem",
    margin: "1.5rem",

  },
  avatar: {
    width: 100,
    height: 52,
    borderRadius: 12,
    background: C.primary,
    color: C.white,
    fontSize: 20,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    letterSpacing: 1,
  },
  patientInfo: {
    flex: 1,
    display: "flex",
    gap: "2.5rem",
    flexWrap: "wrap",
    alignItems: "center",
  },
  infoGroup: { display: "flex", flexDirection: "column", gap: 2 },
  infoLabel: {
    fontSize: 11,
    color: C.muted,
    letterSpacing: "0.06em",
    fontWeight: 600,
  },
  infoValue: { fontSize: 18, fontWeight: 700, color: C.text },
  balanceValue: { fontSize: 16, fontWeight: 800, color: C.muted },
  tableWrap: {
    background: C.white,
    borderRadius: 14,
    border: `1px solid ${C.border}`,
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13.5 },
  thead: { background: C.primaryTableColor },
  th: {
    color: "#e2e8f0",
    fontWeight: 600,
    textAlign: "left",
    padding: "13px 16px",
    fontSize: 12.5,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  td: {
    padding: "13px 16px",
    color: C.text,
    verticalAlign: "middle",
    borderBottom: `1px solid ${C.bg}`,
  },
  receiptTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    background: "#f0fdf4",
    color: "#166534",
    borderRadius: 6,
    fontSize: 11.5,
    fontWeight: 600,
    padding: "3px 9px",
    border: "1px solid #bbf7d0",
  },
  viewBtn: {
    background: C.primaryTableColor,
    color: "#e2e8f0",
    borderRadius: 8,
    fontSize: 12.5,
    fontWeight: 600,
    padding: "7px 16px",
    cursor: "pointer",
    border: "none",
  },
};

const statusColors = {
  DRAFT: { bg: "#fef9c3", color: "#854d0e", border: "#fde047" },
  SAVED: { bg: C.cardBlue, color: C.primary, border: "#c7d2fe" },
  SENT: { bg: C.cardGreen, color: C.success, border: "#bbf7d0" },
};

function Skeleton({ width = "100%", height = 14, radius = 6 }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background:
          "linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s infinite",
      }}
    />
  );
}

function StatusBadge({ status }) {
  const sc = statusColors[status] ?? statusColors.DRAFT;
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: 99,
        background: sc.bg,
        color: sc.color,
        border: `1px solid ${sc.border}`,
      }}
    >
      {status}
    </span>
  );
}

function StatusSelect({ invoiceId, currentStatus }) {
  const mutation = useUpdateInvoiceStatus();
  return (
    <select
      value={currentStatus}
      onChange={(e) =>
        mutation.mutate({ id: invoiceId, status: e.target.value })
      }
      disabled={mutation.isPending}
      style={{
        padding: "4px 8px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600,
        border: `1px solid ${C.border}`,
        background: C.bg,
        color: C.text,
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {["DRAFT", "SAVED", "SENT"].map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
const tabs = [
  { key: "post", label: "Post" },
  { key: "list", label: "List" },
];
export default function CentralPaymentPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole("ADMIN");

  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [singleInvoice, setSingleInvoice] = useState({});
  const [hideSearch, setHideSearch] = useState(true)
  // ── Patient search state ──────────────────────────────────────
  const [patientIdInput, setPatientIdInput] = useState("");
  const [patientLoading, setPatientLoading] = useState(false);
  const [receipt, setReceipt] = useState({})
  const [activeTab, setActiveTab] = useState("post");

  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const loadingCreate = createInvoice.isPending;
  const loadingUpdate = updateInvoice.isPending
  // Draft (the input row at the top)
  const [draft, setDraft] = useState({ unit: null, billName: null, amount: '' });
  // Added bill lines shown in the table
  const [bills, setBills] = useState([]);
  // Pagination
  // Discount code
  const [discountCode, setDiscountCode] = useState('');

  const [addPatient, setAddPatient] = useState(false)
  const handlePatientSearch = async () => {
    setSearch(patientIdInput.trim());

  };
  // ─────────────────────────────────────────────────────────────
  const [confirm, setConfirm] = useState({ open: false, id: null, number: null });

  const { data, isLoading, error } = useInvoices({
    page,
    limit: LIMIT,
    search,
    status: statusFilter,
  });
  const deleteMutation = useDeleteInvoice();

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setSearch(searchInput);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const invoices = data?.invoices ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const start = (page - 1) * LIMIT + 1;
  const end = Math.min(page * LIMIT, total);

  const patient = useMemo(() => {
    if (data && data?.invoices?.length && search) {
      const patientData = data?.invoices[0];

      const total =
        data?.invoices?.reduce(
          (acc, curr) => acc + Number(curr?.grandTotal ?? 0),
          0,
        ) ?? 0;

      return {
        ...patientData,
        name,
        initials: getInitials(patientData?.clientName),
        name: patientData?.clientName,
        id: patientData?.clientId,
        gender: patientData?.clientGender,
        balance: fmtAmount(total, patientData.currency),
      };
    }

    return null;
  }, [data]);

  useEffect(() => {

    if (patient) {
      setReceipt({
        ...patient,
        issueDate: "",
        id: ""

      })

      setHideSearch(false)

    }
  }, [patient])

  const handleDelete = (id, invoiceNumber) => {
    if (
      !window.confirm(`Delete invoice ${invoiceNumber}? This cannot be undone.`)
    )
      return;
    deleteMutation.mutate(id);
  };

  const handleDownloadPdf = (id, invoiceNumber) => {
    const token = localStorage.getItem("accessToken");
    fetch(`/api/invoices/${id}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${invoiceNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  function handleSubmit(e) {
    e.preventDefault();
    if (bills.length === 0) return;

    setAddPatient(true)

    // Call your API here
  }

  const handleFinalSubmit = async (payload) => {

    // get the bill and format properly

    const load = {
      ...payload,
      currency: "NGN",
      lineItems: bills.map((item) => ({
        description: item?.billName?.label,
        quantity: 1,
        unitPrice: Number(item?.amount || 0),
        unit: item?.unit?.label
      })),

    };


    if (receipt?.id) {
      updateInvoice.mutate(
        { ...load, id: receipt.id },
        {
          onSuccess: (result) => {
            if (result.ok && result.data?.success) {
              setSingleInvoice(result.data.data)
              setPatientIdInput(result?.data?.data?.clientId)
              handlePatientSearch()

              setShowInvoiceDetails(true)

              setAddPatient(false);
              setBills([])
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
        },
      );
    } else {
      createInvoice.mutate(load, {
        onSuccess: (result) => {
          if (result.ok && result.data?.success) {
            setSingleInvoice(result.data.data)
            setPatientIdInput(result?.data?.data?.clientId)
            handlePatientSearch()
            setShowInvoiceDetails(true)

            setAddPatient(false)
            setBills([])
          } else {
            const msg =
              result.data?.error?.details?.[0]?.message ||
              result.data?.error?.message ||
              "Failed to create receipt.";
            setError(msg);
          }
        },
        onError: () => {
          setError("Network error. Please try again.");
        },
      });
    }

  }


  return (
    <>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>

      {showInvoice && (
        <InvoiceModal
          onClose={() => setShowInvoice(false)}
          onSuccess={() => setShowInvoice(false)}
          receipt={singleInvoice}
        />
      )}
      {showInvoiceDetails && (
        <ReceiptModal
          onClose={() => setShowInvoiceDetails(false)}
          receipt={singleInvoice}
        />
      )}

      <div className="central-payment" >
        <div style={{ display: "flex", marginBottom: 24, justifyContent: "space-between", alignItems: "center" }}>
          <div >
            <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Central Payment</h1>
            <p style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>Make all central payment</p>
          </div>

          <p className="sidebar-desktop"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: C.muted,
            }}
          >
            Rivers State University Teaching Hospital
          </p>

        </div>
        {
          !hideSearch &&
          <div onClick={() => {
            setSearch("")
            setPatientIdInput("")
            setReceipt({})
            setHideSearch(true)
          }} style={{ display: "flex", cursor: "pointer", alignItems: "center", gap: "5px" }}>
            <Icon d={Icons.arrowLeft} /> Back
          </div>
        }


        {
          hideSearch &&
          <div
            style={{
              background: C.white,
              padding: "20px 20px",
              marginBottom: "30px",
              borderRadius: "6px",
            }}
          >
            <h3 style={{ marginTop: 10, marginBottom: 10 }}>
              Search Using Patient ID
            </h3>
            {/* ── Patient Search ───────────────────────────────────────── */}
            <div style={{ marginBottom: 0 }}>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <div style={{ position: "relative", flex: 1 }}>
                  {/* <span
                  style={{
                    position: "absolute",
                    left: 11,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  <Icon d={Icons.search} size={15} color={C.muted} />
                </span> */}
                  <input
                    value={patientIdInput}
                    onChange={(e) => setPatientIdInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePatientSearch()}
                    placeholder="Patient Code"
                    style={{
                      width: "100%",
                      height: 40,
                      padding: "16px ",
                      border: `1.5px solid ${C.border}`,
                      borderRadius: 6,
                      fontSize: 14,
                      color: C.text,
                      background: C.white,
                      outline: "none",
                      fontFamily: "inherit",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = C.primary)}
                    onBlur={(e) => (e.target.style.borderColor = C.border)}
                  />
                </div>
                <button
                  onClick={handlePatientSearch}
                  disabled={isLoading}
                  style={{
                    height: 34,
                    padding: "0 40px",
                    background: isLoading ? C.muted : C.primary,
                    color: C.white,
                    borderRadius: 0,
                    fontSize: 14,
                    fontWeight: 400,
                    border: "none",
                    fontFamily: "inherit",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading)
                      e.currentTarget.style.background = C.primaryHover;
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading)
                      e.currentTarget.style.background = C.primary;
                  }}
                >
                  {isLoading ? "Searching…" : "Search Patient"}
                </button>
              </div>
            </div>
            {/* ─────────────────────────────────────────────────────────── */}
          </div>
        }




        {/* Toolbar */}
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {patient && !hideSearch && (
            <div style={{ ...styles.patientCard }}>
              <div style={styles.avatar}>{patient.initials}</div>
              <div
                style={{ ...styles.patientInfo, justifyContent: "space-between" }}
              >
                <div style={{ ...styles.infoGroup, minWidth: 180 }}>
                  <span style={styles.infoLabel}>Full Name</span>
                  <span style={styles.infoValue}>{patient.name}</span>
                </div>
                <div style={styles.infoGroup}>
                  <span style={styles.infoLabel}>Patient ID</span>
                  <span style={styles.infoValue}>{patient.id}</span>
                </div>
                <div style={styles.infoGroup}>
                  <span style={styles.infoLabel}>Gender</span>
                  <span style={styles.infoValue}>{patient.gender}</span>
                </div>
                <div style={styles.infoGroup}>
                  <span style={styles.infoLabel}>Balance</span>
                  <span style={styles.balanceValue}>{patient.balance}</span>
                </div>
              </div>
            </div>
          )}
          <div
            style={{
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1 }} />

            <div
              style={{
                display: "flex",
                gap: 4,
                padding: 4,
              }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: "7px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    borderBottom: activeTab === tab.key ? `1px solid ${C.primary}` : "none",
                    cursor: "pointer",
                    color: activeTab === tab.key ? C.primary : C.muted,
                    background: "transparent",

                    transition: "all 0.15s",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {
            activeTab === "list" ?
              <div>
                {error && (
                  <div
                    style={{
                      margin: 20,
                      background: "#fff1f2",
                      border: `1px solid ${C.red}`,
                      borderRadius: 8,
                      padding: "10px 14px",
                      fontSize: 13,
                      color: C.red,
                      fontWeight: 500,
                    }}
                  >
                    {error.message ?? "Failed to load invoices."}
                  </div>
                )}

                <div style={{ overflowX: "auto" }} className="">
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 13,
                    }}
                  >


                    <thead>
                      <tr style={{ background: C.lightBlue }}>
                        {[
                          "S/N",
                          "Receipt Type",
                          "Receipt ID",
                          "Amount",
                          "Date",
                          "Actions",
                        ].map((h, i) => (
                          <th
                            key={h}
                            // style={{
                            //   padding: "12px 16px",
                            //   textAlign: i === 5 ? "right" : "left",
                            //   fontWeight: 700,
                            //   whiteSpace: "nowrap",
                            //   fontSize: 12,
                            //   letterSpacing: "0.4px",
                            //   textTransform:"uppercase"
                            // }}

                            style={{
                              padding: "8px 16px", fontWeight: 600, color: C.white, whiteSpace: "nowrap", textTransform: "uppercase",
                              textAlign: i === 5 ? "right" : "left",

                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
                            {[1, 2, 3, 4, 5, 6].map((c) => (
                              <td key={c} style={{ padding: "13px 16px" }}>
                                <Skeleton width={c === 1 ? 80 : c === 2 ? 120 : 80} />
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : invoices.length === 0 ? (
                        <tr>
                          <td colSpan={7}>
                            <div
                              style={{ textAlign: "center", padding: "48px 24px" }}
                            >
                              <div
                                style={{
                                  fontSize: 15,
                                  fontWeight: 700,
                                  color: C.text,
                                  marginBottom: 6,
                                }}
                              >
                                {search || statusFilter
                                  ? "No invoices match your filter"
                                  : "No invoices yet"}
                              </div>
                              <div style={{ fontSize: 13, color: C.muted }}>
                                {canManage
                                  ? 'Click "New Invoice" to create one.'
                                  : "No invoices to display."}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        invoices.map((inv, i) => {
                          const issueDate = formatRelativeDate(inv.issueDate);

                          return (
                            <tr key={inv.id}>
                              <td
                                style={{ padding: "13px 16px", whiteSpace: "nowrap" }}
                              >
                                {i + 1}
                              </td>
                              <td
                                style={{ padding: "13px 16px", whiteSpace: "nowrap" }}
                              >
                                PAYMENT RECEIPT
                              </td>
                              <td
                                style={{ padding: "13px 16px", whiteSpace: "nowrap" }}
                              >
                                {inv.invoiceNumber}
                              </td>
                              <td
                                style={{ padding: "13px 16px", whiteSpace: "nowrap" }}
                              >
                                {fmtAmount(inv.grandTotal, "")}
                              </td>
                              <td
                                style={{ padding: "13px 16px", whiteSpace: "nowrap" }}
                              >
                                {issueDate}
                              </td>
                              <td
                                style={{ padding: "13px 16px", textAlign: "right" }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 6,
                                    justifyContent: "end",
                                  }}
                                >
                                  <button
                                    onClick={() => {
                                      setSingleInvoice(inv);

                                      setShowInvoiceDetails(true);
                                    }}
                                    title="View Receipt"
                                    style={{
                                      padding: "5px 10px",
                                      background: C.dark,
                                      color: C.white,
                                      borderRadius: 6,
                                      fontSize: 11,
                                      fontWeight: 600,
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    View Receipt
                                  </button>
                                  {canManage && (
                                    <button
                                      onClick={() => {

                                        let lineItems = inv?.lineItems ?? []
                                        lineItems = lineItems.map((item) => ({
                                          unit: { label: item?.unit } || "...", billName: { label: item?.description }, amount: item?.total
                                        }))
                                        setPatientIdInput(inv.clientId)
                                        handlePatientSearch()


                                        setBills(lineItems)
                                        setActiveTab("post")
                                        setReceipt(inv);
                                      }}
                                      title="Edit invoice"
                                      style={{
                                        padding: "5px 10px",
                                        background: "#fff1f2",
                                        color: C.accent,
                                        borderRadius: 6,
                                        fontSize: 11,
                                        fontWeight: 600,
                                        border: `1px solid #fecaca`,
                                      }}
                                    >
                                      <Icon d={Icons.edit} />
                                    </button>
                                  )}
                                  {canManage && (
                                    <button
                                      onClick={() => setConfirm({ open: true, id: inv.id, number: inv.invoiceNumber })}
                                      // onClick={() =>
                                      //   handleDelete(inv.id, inv.invoiceNumber)
                                      // }
                                      title="Delete invoice"
                                      disabled={deleteMutation.isPending}
                                      style={{
                                        padding: "5px 10px",
                                        background: "#fff1f2",
                                        color: C.red,
                                        borderRadius: 6,
                                        fontSize: 11,
                                        fontWeight: 600,
                                        border: `1px solid #fecaca`,
                                      }}
                                    >
                                      <Icon d={Icons.delete} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>


                  </table>
                </div>

                {!isLoading && totalPages > 1 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 20px",
                      borderTop: `1px solid ${C.border}`,
                      flexWrap: "wrap",
                      gap: 10,
                    }}
                  >
                    <span style={{ fontSize: 12, color: C.muted }}>
                      Page {page} of {totalPages}
                    </span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        style={{
                          padding: "7px 14px",
                          borderRadius: 7,
                          fontSize: 13,
                          fontWeight: 600,
                          background: page === 1 ? C.bg : C.white,
                          color: page === 1 ? C.muted : C.text,
                          border: `1.5px solid ${C.border}`,
                          cursor: page === 1 ? "not-allowed" : "pointer",
                          opacity: page === 1 ? 0.5 : 1,
                        }}
                      >
                        <Icon d={Icons.chevronLeft} />
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                        return (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 7,
                              fontSize: 13,
                              fontWeight: 600,
                              background: p === page ? C.primary : C.white,
                              color: p === page ? C.white : C.text,
                              border: `1.5px solid ${p === page ? C.primary : C.border}`,
                            }}
                          >
                            {p}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        style={{
                          padding: "7px 14px",
                          borderRadius: 7,
                          fontSize: 13,
                          fontWeight: 600,
                          background: page === totalPages ? C.bg : C.white,
                          color: page === totalPages ? C.muted : C.text,
                          border: `1.5px solid ${C.border}`,
                          cursor: page === totalPages ? "not-allowed" : "pointer",
                          opacity: page === totalPages ? 0.5 : 1,
                        }}
                      >
                        <Icon d={Icons.chevronRight} />

                      </button>
                    </div>
                  </div>
                )}

              </div> :

              <BillPostingForm draft={draft} bills={bills} setBills={setBills} setDraft={setDraft} setDiscountCode={setDiscountCode} discountCode={discountCode} handleSubmit={handleSubmit} />
          }




        </div>
      </div>

      <ConfirmDialog
        isOpen={confirm.open}
        title="Delete Invoice"
        message={`Are you sure you want to delete invoice ${confirm.number}? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onCancel={() => setConfirm({ open: false, id: null, number: null })}
        onConfirm={() => {
          deleteMutation.mutate(confirm.id);
          setConfirm({ open: false, id: null, number: null });
        }}
      />

      {
        addPatient && <PatientModal receipt={receipt} onClose={() => setAddPatient(false)} onSuccess={handleFinalSubmit}
          loadingCreate={loadingCreate}
          loadingUpdate={loadingUpdate}
        />
      }
    </>
  );
}
