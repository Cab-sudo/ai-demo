import { Resend } from "resend";
import { welcomeEmail } from "./templates/welcome";
import { reportReadyEmail } from "./templates/reportReady";
import { upgradeNudgeEmail } from "./templates/upgradeNudge";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = "RiskRadar <notifications@riskradar.app>";

export async function sendWelcome(to: string, name?: string) {
  return resend.emails.send({ from: FROM, to, subject: "Welcome to RiskRadar", html: welcomeEmail(name) });
}
export async function sendReportReady(to: string, assessmentId: string) {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/reports/${assessmentId}`;
  return resend.emails.send({ from: FROM, to, subject: "Your risk report is ready", html: reportReadyEmail(url) });
}
export async function sendUpgradeNudge(to: string) {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`;
  return resend.emails.send({ from: FROM, to, subject: "Unlock more with RiskRadar Pro", html: upgradeNudgeEmail(url) });
}
