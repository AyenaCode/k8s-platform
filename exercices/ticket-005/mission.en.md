# TICKET-005 : Backend unreachable

## Incident Report

**From** : CTO
**Urgency** : HIGH
**Time** : 14:03

> "We deployed the e-commerce stack. All pods seem to be running.
> But the frontend cannot reach the backend — the API does not respond
> when called by its Service name. Customers are seeing
> errors. Fix this without recreating everything."

## Context

Both Deployments are in place, the images are correct.
The pods are Running. And yet the `backend-api` Service does not respond.

Why can a Service exist but not route traffic?

## Your mission

1. Deploy the stack
2. Reproduce the problem — confirm that the Service does not respond
3. Identify the root cause using the right tools (`kubectl` only)
4. Fix it **without deleting/recreating** any resource (`edit` or `patch`)
5. Validate that the Service responds after the fix

## Exam constraint

Target time: **5 minutes** — you must find and fix it before then.
No resource deletion. Patch or edit only.
