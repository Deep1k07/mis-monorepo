/* eslint-disable @typescript-eslint/no-require-imports */
// One-off script: generates a high-level project documentation PDF.
// Run with: npx ts-node scripts/generate-docs-pdf.ts
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', Arial, sans-serif;
  color: #1a1a2e;
  line-height: 1.55;
  font-size: 11px;
  padding: 40px 50px;
}

.cover {
  page-break-after: always;
  text-align: center;
  padding-top: 200px;
}
.cover h1 { font-size: 38px; margin-bottom: 12px; color: #0d2e5c; letter-spacing: -0.5px; }
.cover h2 { font-size: 16px; font-weight: 500; color: #555; margin-bottom: 50px; }
.cover .meta { font-size: 11px; color: #888; margin-top: 80px; }
.cover .badge {
  display: inline-block;
  background: #0d2e5c;
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 10px;
  margin: 4px;
  font-weight: 500;
}

.toc { page-break-after: always; }
.toc h2 {
  font-size: 22px;
  color: #0d2e5c;
  margin-bottom: 20px;
  border-bottom: 2px solid #0d2e5c;
  padding-bottom: 8px;
}
.toc ol { padding-left: 20px; }
.toc li {
  padding: 5px 0;
  font-size: 12px;
  border-bottom: 1px dotted #ccc;
}

.module {
  page-break-inside: avoid;
  margin-bottom: 28px;
  border-left: 3px solid #0d2e5c;
  padding-left: 14px;
}

h2.module-title {
  font-size: 18px;
  color: #0d2e5c;
  margin-bottom: 6px;
  font-weight: 700;
}
.module-num {
  display: inline-block;
  background: #0d2e5c;
  color: white;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 11px;
  margin-right: 8px;
}

.purpose {
  font-style: italic;
  color: #555;
  margin-bottom: 10px;
  font-size: 11px;
}

h3.section {
  font-size: 11px;
  color: #0d2e5c;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-top: 10px;
  margin-bottom: 5px;
  font-weight: 600;
}

ul { padding-left: 16px; margin-bottom: 6px; }
li { margin-bottom: 2px; font-size: 10.5px; }

code, .mono {
  font-family: 'JetBrains Mono', Consolas, monospace;
  background: #f3f4f8;
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 9.5px;
  color: #0d2e5c;
}

.method {
  font-weight: 700;
  color: #0d2e5c;
}
.method.get { color: #16a34a; }
.method.post { color: #2563eb; }
.method.patch { color: #d97706; }
.method.delete { color: #dc2626; }

.notable {
  background: #fff8e1;
  border-left: 3px solid #f59e0b;
  padding: 6px 10px;
  margin-top: 8px;
  font-size: 10px;
  border-radius: 2px;
}

table.tech {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
  font-size: 10px;
}
table.tech th, table.tech td {
  text-align: left;
  padding: 4px 6px;
  border: 1px solid #ddd;
}
table.tech th { background: #f3f4f8; font-weight: 600; }

.summary-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
  font-size: 9px;
}
.summary-table th, .summary-table td {
  text-align: left;
  padding: 5px 6px;
  border: 1px solid #ccc;
}
.summary-table th { background: #0d2e5c; color: white; font-weight: 600; }
.summary-table tr:nth-child(even) { background: #f9fafb; }

.section-header {
  page-break-before: always;
  font-size: 26px;
  color: #0d2e5c;
  border-bottom: 3px solid #0d2e5c;
  padding-bottom: 10px;
  margin-bottom: 24px;
}

.footer {
  page-break-before: always;
  text-align: center;
  padding-top: 100px;
  color: #555;
}
.footer h2 { color: #0d2e5c; margin-bottom: 16px; }
</style>
</head>
<body>

<!-- ========== COVER ========== -->
<div class="cover">
  <h1>MIS Backend</h1>
  <h2>System Architecture & Module Reference</h2>
  <div>
    <span class="badge">NestJS 11</span>
    <span class="badge">MongoDB</span>
    <span class="badge">TypeScript</span>
    <span class="badge">Puppeteer</span>
    <span class="badge">Resend</span>
    <span class="badge">JWT</span>
  </div>
  <div class="meta">
    <p>High-level documentation</p>
    <p>Generated April 2026</p>
  </div>
</div>

<!-- ========== TABLE OF CONTENTS ========== -->
<div class="toc">
  <h2>Table of Contents</h2>
  <ol>
    <li>Auth — Authentication & JWT</li>
    <li>User — User management</li>
    <li>Role — RBAC roles</li>
    <li>Permission — RBAC permissions</li>
    <li>Entity — Client organizations</li>
    <li>CertificationBody — CABs and Standards</li>
    <li>Application — Certification applications</li>
    <li>BA — Business Associates</li>
    <li>Country — Reference data</li>
    <li>Email — Notification service</li>
    <li>Certificate — PDF generation (Puppeteer)</li>
    <li>Common — Shared interfaces</li>
    <li>Module Summary Matrix</li>
  </ol>
</div>

<!-- ========== MODULES ========== -->

<h1 class="section-header">Backend Modules</h1>

<!-- 1. AUTH -->
<div class="module">
  <h2 class="module-title"><span class="module-num">01</span>Auth</h2>
  <p class="purpose">Authentication, JWT issuance, OTP-based 2FA, password management.</p>

  <h3 class="section">Key Endpoints</h3>
  <ul>
    <li><span class="method post">POST</span> <code>/auth/login</code> — Login with email/password; returns OTP prompt in production</li>
    <li><span class="method post">POST</span> <code>/auth/verify-otp</code> — Verify OTP and issue JWT cookie</li>
    <li><span class="method post">POST</span> <code>/auth/resend-otp</code> — Resend OTP to user's email</li>
    <li><span class="method post">POST</span> <code>/auth/logout</code> — Clear authentication cookie</li>
    <li><span class="method get">GET</span> <code>/auth/me</code> — Get current authenticated user</li>
    <li><span class="method patch">PATCH</span> <code>/auth/profile</code> — Update firstName, lastName, phone</li>
    <li><span class="method post">POST</span> <code>/auth/change-password</code> — Change password</li>
  </ul>

  <h3 class="section">Key Schema (UserAccount)</h3>
  <ul>
    <li><code>userId</code> — string, 7-char unique ID</li>
    <li><code>email</code> — unique, lowercase</li>
    <li><code>password</code> — bcrypt hash, <code>select: false</code></li>
    <li><code>role</code> — ObjectId ref to UserRole</li>
    <li><code>status</code> — active | inactive | pending | rejected | suspended</li>
    <li><code>twoFA</code> — { enabled, tempSecret, secret }</li>
  </ul>

  <div class="notable">
    OTP skipped in non-production. JWT expires in 1 day. EventEmitter triggers email on login.
  </div>
</div>

<!-- 2. USER -->
<div class="module">
  <h2 class="module-title"><span class="module-num">02</span>User</h2>
  <p class="purpose">CRUD operations for system users, role assignment, permission enforcement.</p>

  <h3 class="section">Key Endpoints</h3>
  <ul>
    <li><span class="method post">POST</span> <code>/user</code> — Create user (manage:users / user:create)</li>
    <li><span class="method get">GET</span> <code>/user/get-all</code> — Paginated list with search</li>
    <li><span class="method get">GET</span> <code>/user/:id</code> — Get with role + reportingManager populated</li>
    <li><span class="method patch">PATCH</span> <code>/user/:id</code> — Update fields (firstName, lastName, role, status, password, etc.)</li>
  </ul>

  <div class="notable">
    Unique <code>userId</code> auto-generated as 7-char alphanumeric. Passwords hashed with bcryptjs. Permissions enforced per operation.
  </div>
</div>

<!-- 3. ROLE -->
<div class="module">
  <h2 class="module-title"><span class="module-num">03</span>Role</h2>
  <p class="purpose">RBAC role definitions, permission assignment, role hierarchy.</p>

  <h3 class="section">Key Endpoints</h3>
  <ul>
    <li><span class="method get">GET</span> <code>/role</code> — All roles unpaginated</li>
    <li><span class="method get">GET</span> <code>/role/get-all</code> — Paginated</li>
    <li><span class="method post">POST</span> <code>/role</code> — Create new role</li>
    <li><span class="method patch">PATCH</span> <code>/role/:id</code> — Update role</li>
  </ul>

  <h3 class="section">Key Schema (UserRole)</h3>
  <ul>
    <li><code>role</code> — string, unique (e.g., "BA Manager", "Scope Manager")</li>
    <li><code>permissions</code> — ObjectId[] (Permission refs)</li>
    <li><code>reportingRole</code> — ObjectId (UserRole self-ref for hierarchy)</li>
    <li><code>cabCode</code> — string[] CAB restrictions</li>
    <li><code>region</code> — India | Overseas</li>
    <li><code>type</code> — default | custom</li>
  </ul>
</div>

<!-- 4. PERMISSION -->
<div class="module">
  <h2 class="module-title"><span class="module-num">04</span>Permission</h2>
  <p class="purpose">RBAC permission management, category-based organization.</p>

  <h3 class="section">Key Endpoints</h3>
  <ul>
    <li><span class="method get">GET</span> <code>/permission</code> — All permissions</li>
    <li><span class="method get">GET</span> <code>/permission/get-all</code> — Paginated</li>
    <li><span class="method post">POST</span> <code>/permission</code> — Create</li>
    <li><span class="method patch">PATCH</span> <code>/permission/:id</code> — Update</li>
  </ul>

  <h3 class="section">Key Schema (Permission)</h3>
  <ul>
    <li><code>name</code> — string, unique, lowercase (e.g., "user:create", "certificate:view")</li>
    <li><code>category</code> — string (e.g., "User Management")</li>
    <li><code>type</code> — default | custom</li>
    <li><code>status</code> — active | inactive</li>
  </ul>
</div>

<!-- 5. ENTITY -->
<div class="module">
  <h2 class="module-title"><span class="module-num">05</span>Entity</h2>
  <p class="purpose">Organizations / companies seeking ISO certification — the primary client entity.</p>

  <h3 class="section">Key Endpoints</h3>
  <ul>
    <li><span class="method post">POST</span> <code>/entity/create</code> — Create entity (BA or direct client)</li>
    <li><span class="method get">GET</span> <code>/entity/get-all</code> — Paginated list with BA filter</li>
    <li><span class="method get">GET</span> <code>/entity/:id</code> — Get with related applications populated</li>
    <li><span class="method patch">PATCH</span> <code>/entity/:id</code> — Update by entity_id</li>
  </ul>

  <h3 class="section">Key Schema (Entity)</h3>
  <ul>
    <li><code>entity_id</code> — auto-generated unique alphanumeric</li>
    <li><code>entity_name</code> — required, unique, max 100 chars</li>
    <li><code>main_site_address[]</code> — { street, city, state, country, postal_code }</li>
    <li><code>additional_site_address[]</code> — extended address with separate_legal_entity sub-doc</li>
    <li><code>primary_contact_person</code> — { name, designation, email, mobile_number }</li>
    <li><code>status</code> — draft | submitted | verified | approved | rejected</li>
    <li><code>certificateStatus / scopeStatus / qualityStatus / docStatus</code> — multi-stage tracking</li>
    <li><code>isDirectClient</code> — boolean (BA-driven vs. self-served)</li>
  </ul>

  <div class="notable">
    Email verification states (by-pass / pending / verified). Emits <code>entity:created</code> event for email notifications. Auto-generates unique <code>name_slug</code>.
  </div>
</div>

<!-- 6. CERTIFICATIONBODY -->
<div class="module">
  <h2 class="module-title"><span class="module-num">06</span>CertificationBody (CAB)</h2>
  <p class="purpose">Manages Certification Bodies (CABs) and certification standards with jurisdiction support.</p>

  <h3 class="section">Key Endpoints</h3>
  <ul>
    <li><span class="method post">POST</span> <code>/certificationbody</code> — Create CAB</li>
    <li><span class="method get">GET</span> <code>/certificationbody</code> — Paginated list</li>
    <li><span class="method get">GET</span> <code>/certificationbody/:id</code> — Get with standards & jurisdictions populated</li>
    <li><span class="method patch">PATCH</span> <code>/certificationbody/:id</code> — Update; syncs standards array</li>
    <li><span class="method post">POST</span> <code>/certificationbody/standard</code> — Create standard</li>
    <li><span class="method get">GET</span> <code>/certificationbody/standard/all</code> — Paginated standards</li>
    <li><span class="method patch">PATCH</span> <code>/certificationbody/standard/:id</code> — Update standard</li>
  </ul>

  <h3 class="section">Key Schema</h3>
  <table class="tech">
    <tr><th>CertificationBody</th><th>CertificationStandard</th></tr>
    <tr>
      <td><code>cabCode</code> — 3-char unique uppercase (TCU, TSI, GAU, GAI)</td>
      <td><code>mssCode</code> — 3-char unique alphanumeric</td>
    </tr>
    <tr>
      <td><code>cbCode / cbName</code> — Certification body</td>
      <td><code>standardCode</code> — e.g. ISO 9001</td>
    </tr>
    <tr>
      <td><code>abCode / abName</code> — Accreditation body</td>
      <td><code>version</code> — e.g. 2015, 2025</td>
    </tr>
    <tr>
      <td><code>cabJurisdictions[]</code> — Country refs</td>
      <td><code>predecessor / successor</code> — version chain refs</td>
    </tr>
    <tr>
      <td><code>standards[]</code> — Standard refs</td>
      <td><code>certificationBodies[]</code> — back-refs</td>
    </tr>
  </table>

  <div class="notable">
    Standards support version chains. CAB jurisdiction is checked against entity's country on application creation. Standards are bidirectionally synced with CABs.
  </div>
</div>

<!-- 7. APPLICATION -->
<div class="module">
  <h2 class="module-title"><span class="module-num">07</span>Application</h2>
  <p class="purpose">ISO certification applications. Multi-stage approval (scope, quality, certificate, BA, finance) and draft / final certificate lifecycle.</p>

  <h3 class="section">Key Endpoints</h3>
  <ul>
    <li><span class="method post">POST</span> <code>/application</code> — Create (validates CAB jurisdiction vs entity address)</li>
    <li><span class="method get">GET</span> <code>/application</code> — Paginated list with cabCode filter</li>
    <li><span class="method get">GET</span> <code>/application/draft</code> — Draft apps for scope review (scopeStatus filter)</li>
    <li><span class="method get">GET</span> <code>/application/:id</code> — Single application</li>
    <li><span class="method patch">PATCH</span> <code>/application/:id</code> — Update scope, audit days, IAF code, scopeStatus</li>
  </ul>

  <h3 class="section">Key Schema (Application)</h3>
  <ul>
    <li><code>cab_code</code>, <code>standards[]</code>, <code>entity</code> ref, <code>scope</code></li>
    <li><code>primary / secondary_certificate_language</code></li>
    <li><code>certificateStatus</code> — proceed | completed | hold | suspended | active | expired | etc.</li>
    <li><code>scopeStatus</code> — pending | rejected | transfer | completed</li>
    <li><code>qualityStatus</code> — pending | rejected | proceed | completed</li>
    <li><code>baStatus / baManagerStatus / clientStatus</code> — applied | final</li>
    <li><code>audit1, audit2, iaf_code, auditor_leader_name</code> — scope review fields</li>
    <li><code>draftCertificate[] / finalCertificate[]</code> — versioned, multi-language URLs</li>
    <li><code>certificate_number, initial_issue, valid_until</code> — issuance metadata</li>
  </ul>

  <div class="notable">
    Multi-stage parallel approval flow (scope → quality → BA → finance → certificate). Emits <code>application.draft.approved</code> event when scopeStatus becomes "completed", which triggers the Certificate module.
  </div>
</div>

<!-- 8. BA -->
<div class="module">
  <h2 class="module-title"><span class="module-num">08</span>BA (Business Associate)</h2>
  <p class="purpose">Business associates who work with CABs on entity audits and certifications.</p>

  <h3 class="section">Key Endpoints</h3>
  <ul>
    <li><span class="method post">POST</span> <code>/ba</code> — Create BA (creates User + CabBA together)</li>
    <li><span class="method patch">PATCH</span> <code>/ba/:id</code> — Update BA (User + CabBA fields synced)</li>
    <li><span class="method get">GET</span> <code>/ba/get-all</code> — Unpaginated, with search</li>
    <li><span class="method get">GET</span> <code>/ba/get-all-paginated</code> — Paginated with search</li>
    <li><span class="method get">GET</span> <code>/ba/get-all-cabBa</code> — All CAB-BA associations</li>
    <li><span class="method get">GET</span> <code>/ba/:id</code> — Get with cab details populated</li>
  </ul>

  <h3 class="section">Key Schema</h3>
  <table class="tech">
    <tr><th>User (BA role)</th><th>CabBA</th></tr>
    <tr><td><code>username, userId, email, phone</code></td><td><code>contact_name, registration_number</code></td></tr>
    <tr><td><code>cab</code> — CabBA ref</td><td><code>registration_authority</code></td></tr>
    <tr><td><code>cabCode[]</code> — TCU, TSI, GAU…</td><td><code>address</code> — { street, city, state, country, postal_code }</td></tr>
    <tr><td><code>status</code> — active | inactive | pending | suspended</td><td><code>currency, gst, certificateLanguage</code></td></tr>
    <tr><td><code>mouStatus</code> — approved | pending | uploaded | rejected</td><td><code>cab[]</code> — CB sub-docs with standards & rate cards</td></tr>
  </table>
</div>

<!-- 9. COUNTRY -->
<div class="module">
  <h2 class="module-title"><span class="module-num">09</span>Country</h2>
  <p class="purpose">Reference data for country / jurisdiction lookups.</p>

  <h3 class="section">Key Endpoints</h3>
  <ul>
    <li><span class="method get">GET</span> <code>/country</code> — All countries</li>
    <li><span class="method get">GET</span> <code>/country/languages</code> — Supported certificate languages (13 incl. EN, HI, ES, FR, AR, ZH, PT, DE, IT, JA, KO, RU, TR)</li>
  </ul>

  <h3 class="section">Key Schema (Country)</h3>
  <ul>
    <li><code>name</code> — unique</li>
    <li><code>code</code> — 3-char uppercase, unique</li>
    <li><code>status</code> — active | inactive</li>
  </ul>

  <div class="notable">
    Used by CAB jurisdiction validation and entity address lookups.
  </div>
</div>

<!-- 10. EMAIL -->
<div class="module">
  <h2 class="module-title"><span class="module-num">10</span>Email</h2>
  <p class="purpose">Notification service backed by Resend; OTP delivery and entity verification emails.</p>

  <h3 class="section">Event Listeners</h3>
  <ul>
    <li><code>user:login</code> — Generates 6-digit OTP (10-min TTL), stores in Redis cache, sends email</li>
    <li><code>entity:created</code> — Sends entity verification email with verification link</li>
  </ul>

  <h3 class="section">Key Functions</h3>
  <ul>
    <li><code>handleUserLogin()</code> — OTP email on login</li>
    <li><code>sendMailForEntity()</code> — Entity creation confirmation</li>
    <li><code>verifyOtp()</code> — Validate OTP from cache</li>
  </ul>

  <div class="notable">
    Email templates differ by CAB (Guardian, TNV variants) and environment (dev / prod).
  </div>
</div>

<!-- 11. CERTIFICATE -->
<div class="module">
  <h2 class="module-title"><span class="module-num">11</span>Certificate (new)</h2>
  <p class="purpose">Generates draft certificate PDFs from HTML using Puppeteer; triggered automatically when an application's draft is approved.</p>

  <h3 class="section">Architecture</h3>
  <ul>
    <li>HTML template <code>templates/draft.html</code> rendered with application + entity data</li>
    <li>Puppeteer (headless Chromium) converts HTML → PDF at A4 (794×1123px)</li>
    <li>Background image picked by <code>cab_code</code>: TCU.png / TSI.png / GAU.png / GAI.png from <code>templates/darft/</code></li>
    <li>Output saved to <code>generated-certificates/</code>; URL stored in application's <code>draftCertificate[]</code> array</li>
    <li>Versioning supported (v1, v2…) and per-language variants</li>
  </ul>

  <h3 class="section">Trigger Flow</h3>
  <ul>
    <li>Scope manager approves draft via <code>PATCH /application/:id</code> with <code>scopeStatus: "completed"</code></li>
    <li>Application service emits <code>application.draft.approved</code></li>
    <li><code>CertificateEventListener</code> calls <code>generateDraftCertificate(applicationId)</code></li>
    <li>Service builds HTML, runs Puppeteer, persists PDF, updates DB</li>
  </ul>

  <h3 class="section">Dynamic Behavior</h3>
  <ul>
    <li>Entity name and scope font sizes auto-scale based on text length</li>
    <li>Standard names dynamically inserted in certify line ("...the Quality Management System of...")</li>
    <li>Draft certificates show <code>XXXXXXXXXX</code> placeholders for cert no, dates, etc.; only IAF code & revision no use real values when present</li>
    <li>Watermark "Draft copy must be returned within 15 days" overlaid diagonally</li>
  </ul>

  <div class="notable">
    Built with: <code>puppeteer ^24.x</code>, NestJS event emitter, MongoDB push update on application document.
  </div>
</div>

<!-- 12. COMMON -->
<div class="module">
  <h2 class="module-title"><span class="module-num">12</span>Common</h2>
  <p class="purpose">Shared interfaces, DTOs, guards, and utilities across modules.</p>

  <h3 class="section">Key Files</h3>
  <ul>
    <li><code>auth-request.interface.ts</code> — Express Request extension with authenticated user payload (userId, role, permissions[])</li>
    <li><code>paginated-query.dto.ts</code> — Common DTO: page, limit, search, scopeStatus, cabCode</li>
    <li><code>paginated-response.dto.ts</code> — Standard paginated response shape</li>
    <li>JWT Auth Guard — Validates JWT from cookies; populates <code>req.user</code></li>
  </ul>
</div>

<!-- ========== SUMMARY MATRIX ========== -->
<h1 class="section-header">Module Summary Matrix</h1>

<table class="summary-table">
  <tr>
    <th>Module</th>
    <th>Primary Schema</th>
    <th>Key Status Fields</th>
    <th>Notable</th>
  </tr>
  <tr><td>Auth</td><td>UserAccount</td><td>active / inactive / suspended</td><td>JWT cookie, OTP 2FA</td></tr>
  <tr><td>User</td><td>UserAccount</td><td>active / pending / rejected</td><td>bcrypt, RBAC enforced</td></tr>
  <tr><td>Role</td><td>UserRole</td><td>active / inactive</td><td>Self-referencing hierarchy</td></tr>
  <tr><td>Permission</td><td>Permission</td><td>active / inactive</td><td>Granular, categorized</td></tr>
  <tr><td>Entity</td><td>Entity</td><td>draft → approved + cert/scope/quality status</td><td>Email verification, slug</td></tr>
  <tr><td>CertificationBody</td><td>CAB + Standard</td><td>active / inactive / expired</td><td>Jurisdictions, version chains</td></tr>
  <tr><td>Application</td><td>Application</td><td>multi-stage (scope, quality, BA, finance)</td><td>Triggers cert generation</td></tr>
  <tr><td>BA</td><td>User + CabBA</td><td>active, mouStatus</td><td>Bi-directional sync</td></tr>
  <tr><td>Country</td><td>Country</td><td>active / inactive</td><td>Reference data</td></tr>
  <tr><td>Email</td><td>—</td><td>—</td><td>Resend, event-driven</td></tr>
  <tr><td>Certificate</td><td>—</td><td>—</td><td>Puppeteer, event-driven, NEW</td></tr>
  <tr><td>Common</td><td>—</td><td>—</td><td>Auth, pagination, guards</td></tr>
</table>

<!-- ========== FOOTER ========== -->
<div class="footer">
  <h2>End of Documentation</h2>
  <p>This is a high-level overview. For exact field definitions, see the module schema files.</p>
  <p style="margin-top:24px; font-size:10px; color:#888;">Generated from MIS Backend repository using Puppeteer.</p>
</div>

</body>
</html>`;

async function main() {
  const outputDir = path.resolve(process.cwd(), 'docs');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const outputPath = path.join(outputDir, 'mis-backend-modules.pdf');
    await page.pdf({
      path: outputPath as `${string}.pdf`,
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    // eslint-disable-next-line no-console
    console.log(`✅ Documentation PDF generated: ${outputPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
