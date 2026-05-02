# MedVault Security Specification

## Data Invariants
1. A Medical Record must belong to a Patient.
2. A Medical Record can only be uploaded by the patient themselves.
3. A Doctor can only view a Patient's records if they have an active 'granted' AccessRequest.
4. Users can only modify their own profiles.
5. Roles (Patient/Doctor) are immutable once set via onboarding (or require admin).

## Detailed Access Matrix

| Collection | Create | Read (Get/List) | Update | Delete |
|------------|--------|-----------------|--------|--------|
| /users/{id} | Owner (Auth check) | Owner or Granted Doctor | Owner (Strict keys) | None |
| /users/{pId}/records/{rId} | Owner | Owner or Granted Doctor | Owner | Owner |
| /accessRequests/{reqId} | Doctor | Patient or Doctor involved | Patient (to grant/revoke) or Doctor (to self-cancel) | None |
| /users/{id}/notifications/* | System | Owner | Owner (mark as read) | Owner |

## The "Dirty Dozen" (Test Payloads to Block)
1. Doctor attempts to write a record to a patient's collection directly.
2. Patient attempts to change their role to 'admin' using client-side update.
3. Unauthenticated user attempts to read any profile.
4. Doctor attempts to read patient records without a granted access request.
5. Patient attempts to grant access to a doctor for a different patient's ID.
6. User attempts to inject a 1MB string into the 'bloodGroup' field.
7. Doctor attempts to update their own 'isVerified' flag.
8. Patient attempts to delete another patient's record by spoofing ID.
9. User attempts to create a record without a 'fileUrl'.
10. User attempts to update 'createdAt' timestamp to a past date.
11. Attacker attempts to list ALL users without being authenticated.
12. Doctor attempts to revoke someone else's access.
