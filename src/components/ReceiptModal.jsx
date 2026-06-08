import { format } from "date-fns";
import { C } from "../constants/colors";
import { Icon, Icons } from "../constants/icons";
import {  fmtAmount, getFullName } from "../lib/utils";
import printJS from "print-js";

const items = [
  { desc: "CONSULTATION FEE - A&E", qty: 1, amount: "₦2,000.00" },
  { desc: "BED FEE - A&E", qty: 1, amount: "₦10,000.00" },
  { desc: "PCV - A&E", qty: 1, amount: "₦1,000.00" },
  { desc: "URINALYSIS - A&E", qty: 1, amount: "₦2,000.00" },
  {
    desc: "C-SPINE COLLAR (SOFT/PHIL/COMP) - A&E",
    qty: 1,
    amount: "₦5,500.00",
  },
  { desc: "RANDOM BLOOD SUGAR-ACCUCHECK", qty: 1, amount: "₦1,500.00" },
  { desc: "EHR FEE (PORTAL CHARGE)", qty: 1, amount: "₦300.00" },
];

const PRINT_STYLES = `
  @page {
  }
  @media print {
    body * {
      visibility: hidden;
    }
    #receipt-printable,
    #receipt-printable * {
      visibility: visible;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: #272B40 !important;
      color-adjust: #272B40 !important;
    }
      #date{
      width:"200 !important";
      }
    #receipt-printable {
      position: absolute;
      top: 0;
      left: 0;
      width: 100% !important;
      max-width: 100% !important;
      height: fit-content !important;
    }
    #receipt-close-btn {
      display: none !important;
    }
    #receipt-print-btn {
      display: none !important;
    }
  }
`;

export default function ReceiptModal({ onClose, receipt = {} }) {

const handlePrint = () => {
  // Remove previous injected styles/container if any
  document.getElementById("receipt-print-styles")?.remove();
  document.getElementById("receipt-print-copy")?.remove();

  // Build the receipt HTML
  const receiptHTML = getReceiptHTML();
  printJS({
    type:"raw-html",
    printable:receiptHTML,
      style: `
      * {
      
      @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap");
 font-family: "Plus Jakarta Sans", sans-serif;
   box-sizing: border-box;
  margin: 0;
  padding: 0;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
    
      body {
        margin: 0px;

      }
    `,
  })



};


  const getReceiptHTML = () => `
<div
  id=""
  
  style="border: 1px solid ${C.border}; border-radius: 5px;"
>
  <!-- Logo -->
  <div style="text-align: center; margin-bottom: 6px;">
    <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 8px; margin-top: 7px;">
      <img width="120" src="/medixlogo_black.png" />
    </div>
    <p style="font-size: 12px; font-weight: 700; color: ${C.text};">
      Rivers State University Teaching Hospital
    </p>
    <div style="height: 1px; background: ${C.border}; margin: 0 8px;"></div>
  </div>

  <!-- Original Receipt / Transaction Code -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; margin-bottom: 16px; font-size: 12px; margin: 2px 6px;">
    <div>
      <span style="font-weight: 700; color: ${C.text};">Original Receipt</span>
    </div>
    <div style="font-weight: 700; color: ${C.dark};">
      Transaction Code -
    </div>
  </div>
  <div style="height: 1px; background: ${C.border}; margin-bottom: 6px;"></div>

  <!-- Info grid -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; margin-bottom: 16px; font-size: 12px; margin: 2px 6px;">
    <div>
      <div style="color: ${C.text}; font-weight: 600; margin-bottom: 3px;">Receipt Number</div>
      <div style="font-weight: 500; color: ${C.text};">
        ${receipt.invoiceNumber}
      </div>
    </div>
    <div>
      <div style="color: ${C.text}; font-weight: 600; margin-bottom: 3px;">Date</div>
      <div style="font-weight: 500; color: ${C.text}; word-break: break-word;">
        ${format(receipt?.issueDate, "dd-MM-yyyy HH:mm:ss")}
      </div>
    </div>
    <div>
      <div style="color: ${C.text}; font-weight: 600; margin-bottom: 3px;">Patient Name</div>
      <div style="font-weight: 500; color: ${C.text}; text-transform: uppercase;">
        ${receipt.clientName}
      </div>
    </div>
    <div>
      <div style="color: ${C.text}; font-weight: 600; margin-bottom: 3px;">Patient ID</div>
      <div style="font-weight: 500; color: ${C.text};">
        ${receipt.clientId}
      </div>
    </div>
  </div>

  <!-- Items table -->
  <div style="margin-bottom: 6px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 12px;  table-layout: fixed;">
      <thead>
        <tr style="border-top: 1px solid ${C.border}; border-bottom: 1px solid ${C.border};">
          <th style="padding:3px 6px; text-align: left; font-weight: 700; color: ${C.text};">Description</th>
          <th style="padding:3px 6px; text-align: center; font-weight: 700; color: ${C.text}; white-space: nowrap;">QTY</th>
          <th style="padding:3px 6px; text-align: right; font-weight: 700; color: ${C.text}; white-space: nowrap;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${receipt.lineItems.map((item) => `
          <tr>
            <td style="padding: 3px 6px; color: ${C.text}; line-height: 1.4; word-break: break-word; text-transform: uppercase; font-weight: 500;">
              ${item?.description}
            </td>
            <td style="padding: 3px 6px; text-align: center; color: ${C.text}; white-space: nowrap; font-weight: 500;">
              ${item?.quantity}
            </td>
            <td style="padding: 3px 6px; text-align: right; font-weight: 500; color: ${C.text}; white-space: nowrap;">
              ${fmtAmount(item?.total, receipt.currency)}
            </td>
          </tr>
        `).join("")}

        <tr>
          <td colspan="3">
            <div style="height: 1px; background: ${C.border};"></div>
          </td>
        </tr>
        <tr>
          <td style="padding: 7px 6px; font-weight: 700; font-size: 14px; color: ${C.text};">Total</td>
          <td></td>
          <td style="padding: 7px 6px; margin-right:"4px"; font-weight: 700; font-size: 14px; color: ${C.text}; text-align: right; white-space: nowrap;">
            ${fmtAmount(receipt.grandTotal, receipt.currency)}
          </td>
        </tr>
        <tr>
          <td colspan="3">
            <div style="height: 1px; background: ${C.border};"></div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Payment details -->
  <div style="font-size: 13px;">
    <div style="display: flex; flex-direction: column; justify-content: center;">
      <div style="font-weight: 700; color: ${C.text}; text-align: center;">Payment Details</div>
      <div style="height: 1px; background: ${C.border}; margin-top: 7px;"></div>
    </div>
    <div style="display: flex; justify-content: space-between; padding-top: 4px; padding-right: 6px; padding-left: 6px;">
      <span style="color: ${C.text};">Waived Amount</span>
      <span style="font-weight: 500; color: ${C.text};">${fmtAmount(receipt.discount, receipt.currency)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; padding-top: 4px; padding-right: 6px; padding-left: 6px;">
      <span style="color: ${C.text};">Amount Paid</span>
      <span style="font-weight: 500; color: ${C.text};">${fmtAmount(receipt?.grandTotal, receipt.currency)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; padding-top: 4px; padding-right: 6px; padding-left: 6px;">
      <span style="color: ${C.text};">Payment Type</span>
      <span style="font-weight: 500; color: ${C.text};"></span>
    </div>
    <div style="display: flex; justify-content: space-between; padding-top: 4px; padding-right: 6px; padding-left: 6px;">
      <span style="color: ${C.text};">Cashier</span>
      <span style="font-weight: 500; color: ${C.text};">${getFullName(receipt.createdBy)}</span>
    </div>
  </div>

  <div style="height: 1px; background: ${C.border};"></div>
  <div style="height: 1px; background: ${C.border}; margin-top: 15px;"></div>
</div>
`;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 20,
      }}
    >
      <div
        style={{
          background: C.white,
          borderRadius: 7,
          width: "100%",
          maxWidth: 298,
          maxHeight: "95vh",
          overflowY: "auto",
          boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
          padding: "10px 10px",
        }}
      >
        {/* Close */}
        <div
          id="receipt-close-btn"
          style={{
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          <button
            onClick={onClose}
            style={{ background: "transparent", padding: 6, display: "flex" }}
          >
            <Icon d={Icons.x} size={24} color={C.text} />
          </button>
        </div>

        {/* All printable content wrapped in this div */}
        <div
          id="receipt-printable"
          style={{
            border: `1px solid ${C.border}`,
            borderRadius: 5,
          }}
        >
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
                marginTop: 5,
              }}
            >
              <img width="120" src="/medixlogo_black.png" />
            </div>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                
                                color: C.text,

              }}
            >
              Rivers State University Teaching Hospital
            </p>

            <div style={{ height: 1, background: C.border, margin: "0 8px" }} />
          </div>

          {/* Reprinted / Transaction Code */}
       

           <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px 16px",
              marginBottom: 16,
              fontSize: 12,
              margin: "2px 6px",
            }}
          >

            <div>
                          <span style={{ fontWeight: 700, color: C.text }}>Original Receipt</span>

            </div>

            <div style={{ fontWeight: 700, color: C.primaryTableColor }}>
                Transaction Code -
              </div>
          </div>
          <div style={{ height: 1, background: C.border, marginBottom: 12 }} />

          {/* Info grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px 16px",
              marginBottom: 16,
              fontSize: 12,
              margin: "2px 6px",
            }}
          >
            <div>
              <div
                style={{
                  color: C.primaryTableColor,
                  fontWeight: 700,
                  marginBottom: 3,
                }}
              >
                Receipt Number
              </div>
              <div
                style={{
                  fontWeight: 600,
                  
                  fontFamily: "'JetBrains Mono', monospace",
                  color: C.text,
                }}
              >
                {receipt.invoiceNumber}
              </div>
            </div>
            <div>
              <div
                style={{
                  color: C.primaryTableColor,
                  fontWeight: 700,
                  marginBottom: 3,
                }}
              >
                Date
              </div>
              <div
                style={{
                  fontWeight: 600,
                  color: C.text,
                  wordBreak: "break-word",
                }}
              >
                {format(receipt?.issueDate, "dd-MM-yyyy HH:mm:ss")}
              </div>
            </div>
            <div>
              <div
                style={{
                  color: C.primaryTableColor,
                  fontWeight: 700,
                  marginBottom: 3,
                }}
              >
                Patient Name
              </div>
              <div style={{ fontWeight: 600, color: C.text ,                   textTransform:"uppercase"
}}>
                {receipt.clientName}
              </div>
            </div>
            <div>
              <div
                style={{
                  color: C.primaryTableColor,
                  fontWeight: 700,
                  marginBottom: 3,
                }}
              >
                Patient ID
              </div>
              <div style={{ fontWeight: 600, color: C.text }}>
                {receipt.clientId}
              </div>
            </div>
          </div>

          {/* Items table */}
          <div style={{ overflowX: "auto", marginBottom: 6 }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
                minWidth: 260,
              }}
            >
              <thead>
                <tr style={{ border: `1px solid ${C.border}` }}>
                  <th
                    style={{
                      padding: "6px 10px",
                      textAlign: "left",
                      fontWeight: 700,
                      color: C.primaryTableColor,
                    }}
                  >
                    Description
                  </th>
                  <th
                    style={{
                      padding: "6px 10px",
                      textAlign: "center",
                      fontWeight: 700,
                      color: C.primaryTableColor,
                      whiteSpace: "nowrap",
                    }}
                  >
                    QTY
                  </th>
                  <th
                    style={{
                      padding: "6px 10px",
                      textAlign: "right",
                      fontWeight: 700,
                      color: C.primaryTableColor,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {receipt.lineItems.map((item, i) => (
                  <tr key={i}>
                    <td
                      style={{
                        padding: "3px 10px",
                        color: C.primaryTableColor,
                        lineHeight: 1.4,
                        wordBreak: "break-word",
                        textTransform:"uppercase",
                        fontWeight:600
                      }}
                    >
                      {item?.description}
                    </td>
                    <td
                      style={{
                        padding: "3px 10px",
                        textAlign: "center",
                        color: C.primaryTableColor,
                        whiteSpace: "nowrap",
                                                fontWeight:600

                        
                      }}
                    >
                      {item?.quantity}
                    </td>
                    <td
                      style={{
                        padding: "3px 10px",
                        textAlign: "right",
                        fontWeight: 600,
                        color: C.primaryTableColor,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fmtAmount(item?.total, receipt.currency)}
                    </td>
                  </tr>
                ))}

                <tr>
                  <td colSpan={3}>
                    <div style={{ height: 1, background: C.border }} />
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      padding: "8px 10px",
                      fontWeight: 700,
                      fontSize: 14,
                      color: C.primaryTableColor,
                    }}
                  >
                    Total
                  </td>
                  <td></td>
                  <td
                    style={{
                      padding: "8px 10px",
                      fontWeight: 700,
                      fontSize: 14,
                      color: C.primaryTableColor,
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {fmtAmount(receipt.grandTotal, receipt.currency)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3}>
                    <div style={{ height: 1, background: C.border }} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment details */}
          <div style={{ fontSize: 13 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                style={{ fontWeight: 700, color: C.text, textAlign: "center" }}
              >
                Payment Details
              </div>
              <div
                style={{ height: 1, background: C.border, marginTop: "6px" }}
              />
            </div>
            {[
              ["Waived Amount", fmtAmount(receipt.discount, receipt.currency)],
              ["Amount Paid", fmtAmount(receipt?.grandTotal
, receipt.currency)],
              ["Payment Type", ""],
              ["Cashier", getFullName(receipt.createdBy)],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 0,
                  paddingTop: 4,
                  paddingRight: 6,
                  paddingLeft: 6,
                }}
              >
                <span style={{ color: C.primaryTableColor }}>{k}</span>
                <span style={{ fontWeight: 600, color: C.primaryTableColor }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: C.border }} />

          {/* Print button */}
          <div
            id="receipt-print-btn"
            style={{
              display: "flex",
              justifyContent: "center",
              margin: "16px 0",
            }}
          >
            <button
              onClick={handlePrint}
              style={{
                padding: "8px 16px",
                background: C.primary,
                color: C.white,
                borderRadius: 5,
                fontWeight: 400,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                cursor: "pointer",
                border: "none",
              }}
            >
              Print
            </button>
          </div>

          <div style={{ height: 1, background: C.border }} />        </div>
      </div>
    </div>
  );
}
