# Multi-Agent AI Control Panel Upgrade

## Overview
Transforming the current CRM into a professional AI Operations Center with full control capabilities.

## Proposed Changes
- [NEW] CommandConsole.tsx component
- [MODIFY] Dashboard.tsx (Add Action buttons, filtering)
- [MODIFY] App.tsx (Firebase Google Login)
- [MODIFY] lib/firebase.ts (Auth logic)
- [MODIFY] ClientSettings.tsx (API Key Secure Input)

## Security
- Strict Firestore filtering by uid and usiness_id.
- API keys masked in UI.

## Open Questions
1. Shared vs Private agents?
2. Collection name for commands?