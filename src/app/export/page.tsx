"use client";

import { useState, type FormEvent } from "react";
import Breadcrumb from "@/components/Breadcrumb";

export default function ExportPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload(event: FormEvent) {
    event.preventDefault();
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch("/api/export/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        setError(
          res.status === 429
            ? "Too many attempts — wait a few minutes and try again."
            : "Wrong PIN.",
        );
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `registrations-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center bg-white px-4 py-12">
      <main className="w-full max-w-sm">
        <Breadcrumb
          data-testid="export-breadcrumb"
          items={[{ label: "Register", href: "/" }, { label: "Export" }]}
        />
        <h1 className="text-2xl font-semibold text-zinc-900">Export registrations</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Downloads the full dataset, including next-of-kin numbers — for Luchiri and named
          committee members only.
        </p>
        <form onSubmit={handleDownload} className="mt-6 flex flex-col gap-3">
          <input
            data-testid="export-pin-input"
            type="password"
            inputMode="numeric"
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none"
          />
          {error && (
            <p data-testid="export-pin-error" className="text-xs text-red-600">
              {error}
            </p>
          )}
          <button
            data-testid="export-download"
            type="submit"
            disabled={downloading}
            className="rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background disabled:opacity-50"
          >
            {downloading ? "Downloading…" : "Download CSV"}
          </button>
        </form>
      </main>
    </div>
  );
}
