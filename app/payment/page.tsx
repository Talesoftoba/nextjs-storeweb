// app/payment/page.tsx
export const dynamic = "force-dynamic";

import PaymentClient from "./PaymentClient";

export default function PaymentPage() {
  return <PaymentClient />;
}
