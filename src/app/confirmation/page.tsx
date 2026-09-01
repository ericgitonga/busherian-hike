import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Payment Recorded — Ngong Hills Hike & After Party",
};

export default function ConfirmationPage() {
  return (
    <div className="flex flex-1 flex-col items-center bg-white px-4 py-12">
      <main className="w-full max-w-lg">
        <Breadcrumb
          data-testid="confirmation-breadcrumb"
          items={[{ label: "Register", href: "/" }, { label: "Confirmation" }]}
        />
        <div
          data-testid="confirmation-content"
          className="rounded-md border border-green-200 bg-green-50 px-4 py-6 text-center text-green-900"
        >
          <p className="font-semibold">You&apos;re all set!</p>
          <p data-testid="mpesa-payment-recorded" className="mt-1 text-sm font-medium">
            Payment details recorded — thank you! We&apos;ll send your confirmation and QR code
            to your M-Pesa number shortly.
          </p>
        </div>
      </main>
    </div>
  );
}
