# 📘 MyTrek Poli – System Specification

## 🎯 Overview

MyTrek Poli is a system for Politeknik students to register and select their academic track (e.g., SAD, Networking, Information Security) after admission into a general program. Placement is based on preferences, quota, and balancing rules.

## 🔹 Admin Flow

**Create a session**
- Define session details (name, status, unique link/QR).
- Add tracks with number of classes and quota per class.
- System generates a unique link/QR for student registration.
- Control session status: Draft → Open → Closed → Placement → Published.
- Manage placements and override assignments manually (with audit trail).

## 🔹 Student Registration Flow

- Students access registration via link/QR.
- Fill required details:
  - Name
  - Identification number (MyKad/Passport)
  - Matric number
  - Gender
  - Race (Bangsa)
  - Religion
- Select tracks based on priority preferences (e.g., 1st = InfoSec, 2nd = Networking, 3rd = SAD).
- Submission is first come, first serve (timestamp stored).
- After submit → student can only view info (no editing).

## 🔹 Placement Flow

- System assigns student to highest available preference until quota is filled.
- If quota full → move to 2nd or 3rd preference.
- If all preferences full → admin decides placement.
- Placement must consider:
  - Gender balance (avoid skew).
  - Race balance (avoid homogeneity).
- Admin can override assignments manually → every change logged.

## 🔹 Dashboard / Result Flow

**Admin dashboard:**
- Total students registered
- Submitted vs Not submitted
- Breakdown by track & class (quota vs filled)
- Bar charts stacked by:
  - Gender
  - Race
- Preference trends (1st choice, 2nd choice, etc.)

**Student view:**
- Can view own placement result after publishing.

## 🔹 Database Design (ERD Summary)

**Session**
- id, name, status, link_token, start_date, end_date

**Track (per session)**
- id, session_id, name, num_classes, quota_per_class

**Class**
- id, track_id, name, quota

**Student**
- id, session_id, matric_number, identification_number, name, gender, race, religion, submitted_at

**Student Preference**
- id, student_id, track_id, priority

**Placement**
- id, student_id, class_id, assigned_by, assigned_at, reason, is_active

**Placement Log**
- id, placement_id, student_id, old_class_id, new_class_id, changed_by, changed_at, reason

## 🔹 Placement Reasons (examples)

- "1st preference – auto assigned by system"
- "Quota full – assigned to 2nd preference"
- "Quota full – assigned to 3rd preference"
- "Manual override by AdminID xxx"