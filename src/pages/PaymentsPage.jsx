import { C } from "../constants/colors";

export default function PaymentsPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 8 }}>Payments</h1>
      <p style={{ color: C.muted }}>Select a payment option from the sidebar.</p>
    </div>
  );
}
