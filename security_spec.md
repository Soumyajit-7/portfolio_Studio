# Security Specification & Hardened Firestore Rules TDD

## 1. Data Invariants
1. **Identity Integrity**: Every `Inquiry` and `Appointment` document must have `ownerUid == request.auth.uid` on creation, and `ownerUid` is immutable after creation.
2. **PII Isolation**: `Inquiry` (`senderEmail`, `message`) and `Appointment` (`clientEmail`, `notes`) contain PII and can only be read (`get` or `list`) by the document owner (`resource.data.ownerUid == request.auth.uid`) or a verified admin (`isAdmin()`).
3. **Verified Authentication**: All client mutations require `request.auth != null && request.auth.token.email_verified == true`.
4. **Strict Key & Size Enforcement**: Every create enforces exact required/allowed keys (`hasAll` + `hasOnly`) and bounded `.size()` checks matching `firebase-blueprint.json`.
5. **Temporal Integrity**: `createdAt` and `updatedAt` must equal `request.time` on creation; `createdAt` is immutable on update and `updatedAt == request.time`.
6. **Terminal State Locking & Admin-Only Scheduling**: Once an `Appointment` reaches `completed` or `cancelled`, non-admins cannot mutate it. Non-admins cannot alter `status` or `adminNotes` on `Inquiry`, and on `Appointment` only admins can accept (`confirmed`), counter-propose (`counter_proposed`), set `meetLink` / `calendarEventId`, or set `counterDate` / `counterTimeSlot` / `counterPlace` / `counterNote`.
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
