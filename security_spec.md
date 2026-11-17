# Security Specification & Hardened Firestore Rules TDD

## 1. Data Invariants
1. **Identity Integrity**: Public visitor submissions on `Inquiry` and `Appointment` enforce `ownerUid == 'public_guest'` when unauthenticated (or `request.auth.uid` if signed in), while all reads (`get`/`list`), updates, and deletes require `isAdmin()`.
2. **PII Isolation**: `Inquiry` (`senderEmail`, `message`) and `Appointment` (`clientEmail`, `notes`) contain PII and can ONLY be read (`get` or `list`) by a verified admin (`isAdmin()`). Public visitors have write-only create access.
3. **Verified Admin Authentication**: All read, update, delete, Calendar, and Gmail actions require `request.auth != null && request.auth.token.email_verified == true && isAdmin()`.
4. **Strict Key & Size Enforcement**: Every create enforces exact required/allowed keys (`hasAll` + `hasOnly`), valid email regex, and bounded `.size()` checks matching `firebase-blueprint.json`.
5. **Temporal Integrity**: `createdAt` and `updatedAt` must equal `request.time` on creation; `createdAt` is immutable on update and `updatedAt == request.time`.
6. **Terminal State Locking & Admin-Only Scheduling**: Non-admins cannot update or delete any `Inquiry` or `Appointment` (`allow update, delete: if isAdmin()`). On creation, `status` is strictly locked to `'new'` / `'pending'`, `sentViaGmail == false`, and `meetLink` / `calendarEventId` / `counter*` must be empty.
7. **Admin Bootstrapping**: Admin access requires `email_verified == true` and either membership in `/admins/{uid}` or matching the verified portfolio owner email (`soumyajit.scms@gmail.com` or `soumyajit.biswas.14444@gmail.com`).

## 2. The Dirty Dozen Adversarial Payloads
1. **Unauthenticated Inquiry Create**: `auth: null` -> `PERMISSION_DENIED`
2. **Spoofed `ownerUid` on Inquiry Create**: `ownerUid: "victim_uid"` while `auth.uid == "attacker"` -> `PERMISSION_DENIED`
3. **Self-Elevated Status on Inquiry/Appointment Create**: `status: "replied"` or `meetLink: "https://meet.google.com/fake"` on create -> `PERMISSION_DENIED`
4. **Shadow Key Injection on Inquiry Create**: adding `isAdmin: true` -> `PERMISSION_DENIED`
5. **Client-Spoofed Timestamp on Inquiry Create**: `createdAt: "2020-01-01T00:00:00Z"` instead of `serverTimestamp()` -> `PERMISSION_DENIED`
6. **Cross-Tenant Inquiry Read (`get`)**: non-admin reading another user's inquiry -> `PERMISSION_DENIED`
7. **Unfiltered Inquiry `list` Scrape**: non-admin calling `list` without `where('ownerUid', '==', uid)` -> `PERMISSION_DENIED`
8. **Unverified Admin Email Spoof**: token with `email: "soumyajit.scms@gmail.com"` and `email_verified: false` -> `PERMISSION_DENIED`
9. **Resource Poisoning via Oversized ID or Message**: `inquiryId` > 128 chars or `message` > 2000 chars -> `PERMISSION_DENIED`
10. **Non-Admin Modifying `adminNotes` or `status` on Inquiry Update**: owner attempting to set `status: "reviewed"` -> `PERMISSION_DENIED`
11. **Mutating Terminal Cancelled Appointment or Spoofing Counter/Meet Fields**: owner attempting to re-open a `cancelled` appointment or set `status: "confirmed"` / `meetLink` -> `PERMISSION_DENIED`
12. **Non-Admin Publishing Public Social Update**: regular user creating a document in `/social_updates` -> `PERMISSION_DENIED`
