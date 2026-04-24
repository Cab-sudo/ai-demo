export const welcomeEmail = (name?: string) => `
<div style="font-family:system-ui;max-width:560px;margin:auto;padding:24px">
  <h1>Welcome to RiskRadar${name ? `, ${name}` : ""} 👋</h1>
  <p>You're all set to run your first AI-powered cybersecurity risk assessment.</p>
  <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/assessments/new"
        style="display:inline-block;background:#2563eb;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none">
     Start your first assessment</a></p>
</div>`;
