"use client";
import { Button } from "@/components/ui/button";
export function BillingPortalButton() {
  async function openPortal() {
    const r = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await r.json();
    if (url) window.location.href = url;
  }
  return <Button variant="outline" onClick={openPortal}>Manage Billing</Button>;
}
