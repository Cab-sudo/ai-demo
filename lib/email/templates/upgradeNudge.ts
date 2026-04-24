export const upgradeNudgeEmail = (url: string) => `
<div style="font-family:system-ui;max-width:560px;margin:auto;padding:24px">
  <h1>You've hit your free plan limit</h1>
  <p>Upgrade to Pro for 10 assessments/month, AI recommendations, and PDF exports — $29/mo.</p>
  <p><a href="${url}" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none">See plans</a></p>
</div>`;
