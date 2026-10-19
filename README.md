# ALT — Turn Every Shift Into Progress

ALT is a hospitality onboarding and skill progression prototype designed to help frontline employees learn through real work.

Instead of relying only on training modules or completion checklists, ALT captures what employees actually do during a shift, turns those experiences into skill evidence, identifies development areas, and uses that information to guide what they should practise next.

## The Problem

Hospitality employees can complete onboarding and training without managers knowing whether they are actually ready to perform tasks independently.

At the same time, supervisors often have limited time to continuously observe, document and assess every new employee.

This creates a gap between:

**training completed**  
and  
**work readiness demonstrated**

## Our Idea

ALT turns everyday work into an ongoing learning loop:

**Reflect → Evidence → Progress → Next Mission**

At the end of a shift, employees quickly record what they did using voice, quick selections or text.

ALT then:

- identifies evidence of skills demonstrated during the shift
- highlights areas where support was still needed
- updates the employee's Skill Passport
- identifies skills that may be ready for supervisor verification
- generates a personalised focus for the next shift

The aim is to make workplace learning visible without creating another long training process.

## Prototype Flow

The interactive prototype follows Alex as they develop **POS Independent**, then connects a shift reflection to employee and supervisor views of the Skill Passport.

### 1. Finish the Shift

Alex records what happened during the shift using:

- voice input
- quick-select prompts
- written reflection

Example:

> "I completed three POS orders independently, including one with a modifier, but I still needed help with a nut allergy enquiry."

### 2. Turn Experience Into Evidence

ALT analyses the reflection and identifies observable workplace evidence, such as:

- independent POS orders completed
- modified orders handled
- situations where supervisor support was required

### 3. Update the Skill Passport

The evidence contributes to Alex's skill progression.

For example:

**POS Independent**  
`Practising → Ready for Verification`

ALT does not automatically verify an employee's competence. Important skills remain subject to supervisor confirmation.

### 4. Generate the Next Mission

ALT uses today's evidence to create a practical goal for the next shift.

For example:

**Next Shift Mission**

- Handle one dietary enquiry with supervisor support
- Complete one modified POS order independently
- Request POS skill verification

This creates a continuous cycle in which each shift informs the next.

### 5. Explore connected modules

The browser prototype also includes demo interactions for:

- a demo-only manager sign-in path and supervisor dashboard
- Skill Passport overview and evidence history across sample shifts
- role-based hospitality skill frameworks and next-shift practice tasks
- short learning resources with local completion states
- supervisor observations and a demo skill-verification action
- a sample team-readiness dashboard
- a system-connections screen for learning platforms, POS, and workforce directories

These modules use fictional records stored in the current browser. Supervisor, team, and integration screens are product demonstrations; no employee system, POS, LMS, or backend is connected.

## Why ALT Is Different

Traditional training systems often focus on whether an employee has:

- watched a training module
- completed onboarding
- passed a quiz

ALT focuses on a different question:

**What has this employee actually demonstrated at work?**

The workplace itself becomes part of the learning process.

## Core Design Principles

### Real-work based

Skill development is linked to experiences that happen during actual shifts.

### Low effort

Employees can reflect quickly through voice, simple selections or text.

### Evidence before verification

AI can identify and organise evidence, but it does not make the final decision about competence.

### Adaptive progression

What happens today influences what the employee is encouraged to practise tomorrow.

### Employee-led, supervisor-verified

Employees can demonstrate progress while supervisors retain responsibility for formal skill verification.

## Future Development

Production development still requires:

- supervisor verification workflows
- multi-shift evidence history
- personalised skill pathways
- role-specific hospitality skill frameworks
- team readiness dashboards
- manager observations as an additional evidence source
- adaptive onboarding plans
- integration with workplace training systems
- secure accounts, role permissions, audit history, and employer-specific skill standards

## Hackathon Prototype

This prototype was developed as part of the eChallenge Hackathon.

The focus of the build was to demonstrate one core concept:

> **Every shift leaves evidence. Every piece of evidence can move an employee forward.**

The prototype prioritises the user experience and product concept rather than a production-ready backend.

## Demo

Live prototype:

https://alt-coral.vercel.app/

---

**ALT — Align. Learn. Thrive.**
