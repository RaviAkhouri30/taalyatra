# 01 · Inception — Real-phone speed reports

Step 1 of [ADR-0016](../../architecture/adr/0016-mobile-lcp.md). The owner approved it as a separate small change after 1.7.0
(0009 design, decision 4).

## Problem

Lighthouse scores the home page 85–89 on a simulated slow phone, against a target of 95, and says the main content takes 3.6–3.8
s, against a target of 2.5 s. With no throttling, the same page takes about 1.6 s. Nobody knows which is closer to what visitors
get. The bigger fixes cost a lot and bring real risk, and one of them conflicts with publishing from the editor, so the
decision should rest on real visits.

## Goal

The owner can see how fast the site really is on visitors' phones, and that answers one question: **is the speed work worth doing?**

## User stories and acceptance criteria

- As the owner, I want to see real phone speed in the admin area, so I can decide what to do next.
  - [ ] Given enough visits, when I open the report, then I see the typical slow-end load time per device and whether it meets
        the 2.5 s target.
  - [ ] Given too few visits, when I open the report, then it says so and doesn't suggest an answer.
- As a visitor, I want a site that doesn't slow down or follow me because of this.
  - [ ] Given any visit, when the page loads, then measuring doesn't delay it.
  - [ ] Given a report, when it's stored, then it can't identify me: no IP address, ID, cookie or browser string.
  - [ ] Given my browser asks not to be tracked, when I visit, then nothing is sent.
  - [ ] Given reporting fails, when I'm on the site, then I never notice.
- As the owner, I want my own checks kept out of the numbers.
  - [ ] Given the admin area or a preview, when it loads, then nothing is reported.

## Out of scope

Analytics of any other kind: which pages are popular, where visitors come from, or anything per person. The speed fixes themselves,
which get their own ADR once there's data.

## Risks

See the [design](02-design.md).

---

**Approval:** ☑ Approved as ADR-0016's step 1 by Ravi Akhouri on 2026-11-02. The details are decided with the design.
