-- 30 questions across 5 categories
insert into public.questions (category, question_text, weight, order_index) values
-- NETWORK
('network','Do you use a properly configured firewall at all network perimeters?',2.0,1),
('network','Is network traffic segmented between guest, production, and admin networks?',1.5,2),
('network','Do you use a VPN or Zero Trust Network Access for remote access?',2.0,3),
('network','Are wireless networks protected with WPA2/WPA3 Enterprise?',1.5,4),
('network','Do you monitor network traffic for intrusions (IDS/IPS)?',1.5,5),
('network','Are unused network ports disabled on switches and servers?',1.0,6),

-- ACCESS
('access','Is multi-factor authentication (MFA) enforced for all employees?',2.5,7),
('access','Do you enforce a strong password policy (12+ chars, complexity, rotation)?',1.5,8),
('access','Is the principle of least privilege enforced for all accounts?',2.0,9),
('access','Do you perform quarterly user access reviews?',1.5,10),
('access','Are privileged admin accounts separated from daily-use accounts?',2.0,11),
('access','Do you have an offboarding process that revokes access within 24h?',2.0,12),

-- DATA
('data','Is sensitive data encrypted at rest (AES-256 or equivalent)?',2.5,13),
('data','Is data encrypted in transit (TLS 1.2+) for all external communications?',2.0,14),
('data','Do you classify data (public, internal, confidential, restricted)?',1.5,15),
('data','Do you have automated backups tested monthly?',2.0,16),
('data','Do you have data loss prevention (DLP) controls?',1.5,17),
('data','Is customer PII stored only when strictly necessary?',2.0,18),

-- COMPLIANCE
('compliance','Do you have a documented information security policy?',1.5,19),
('compliance','Are you compliant with relevant frameworks (SOC2, ISO27001, HIPAA, GDPR)?',2.0,20),
('compliance','Do you conduct annual third-party security audits?',1.5,21),
('compliance','Do you maintain a vendor risk management program?',1.5,22),
('compliance','Do employees complete annual security awareness training?',1.5,23),
('compliance','Do you have signed DPAs with all data processors?',1.0,24),

-- INCIDENT
('incident','Do you have a documented incident response plan?',2.5,25),
('incident','Are security incidents logged centrally (SIEM)?',2.0,26),
('incident','Do you run tabletop incident response exercises at least annually?',1.5,27),
('incident','Do you have a disaster recovery plan with RTO/RPO defined?',2.0,28),
('incident','Can you detect a breach within 24 hours?',2.5,29),
('incident','Do you have cyber insurance coverage?',1.0,30);
