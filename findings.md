# Findings for Multi-Tenant Platform

Based on the analysis of the current codebase (`fastapi/auth`), here are the findings and recommendations to build a lightweight and simple multi-tenant platform.

## 1. Current State Analysis

The project has a solid foundation for multi-tenancy but lacks some critical "platform" features.

### ✅ What is already working:
*   **Data Model**: The database schema is fully multi-tenant compatible. Every major entity (`User`, `Role`, `Object`, `Audit`, `Permission`) has a `tenant_id` foreign key.
*   **Authentication**: Uses stateless JWTs, which is excellent for scalability.
*   **Authorization**: Role-Based Access Control (RBAC) is implemented with `Role`, `Permission`, and `RolePermission`.
*   **Tenant Entity**: A `Tenant` table exists with `slug` and `domain` fields, ready for subdomain or domain-based resolution.

### ⚠️ Gaps & Risks:
*   **Ambiguous Login**: The `AuthService.validate_user` function finds a user by `username` only. If two tenants have a user named "admin", the system will randomly log in the first one it finds.
*   **Missing Tenant Resolution**: There is no mechanism (middleware) to automatically detect which tenant the request is targeting (e.g., via subdomain `client.app.com` or header `X-Tenant-ID`).
*   **Manual Isolation**: Developers must manually add `.filter(tenant_id=...)` to every query. This is prone to human error and data leaks.

## 2. Recommendations for a "Lightweight & Simple" Platform

To turn this into a robust platform without over-engineering, focus on these three pillars:

### A. Fix Tenant Resolution (Crucial)
You need to know *which* tenant context a request belongs to before processing it.

*   **Recommendation**: Use **Subdomains** (e.g., `tenant1.platform.com`) or a **Header** (`X-Tenant-ID`).
    *   *Subdomains* are better for a "SaaS Platform" feel (branding, isolation).
    *   *Headers* are simpler if you just want a pure API.
*   **Action**: Create a simple Middleware that:
    1.  Extracts the tenant identifier (slug or ID) from the URL or Header.
    2.  Looks up the `Tenant` in the DB (caching this is good).
    3.  Stores the `tenant_id` in a Context Variable (e.g., `contextvars`).

### B. Secure the Login Process
Currently, login is global. You need to scope it.

*   **Option 1 (Simplest for Users)**: Enforce **Globally Unique Usernames** (e.g., Email addresses).
    *   *Pros*: Login API doesn't change. User just enters email/password.
    *   *Cons*: A user cannot have the same email in two different tenants (unless you modify the User model to support many-to-many, currently it is 1-to-1 with Tenant).
*   **Option 2 (True Multi-Tenant)**: Require **Tenant Context** during login.
    *   The Login Endpoint (`/auth/login`) should read the Tenant from the middleware (see point A).
    *   Query becomes: `select(User).filter(User.username == username, User.tenant_id == current_tenant_id)`.
    *   *Pros*: "admin" can exist in every tenant.

### C. Automate Isolation
Don't rely on remembering to filter by `tenant_id`.

*   **Action**: Update your Database Dependency (`get_async_db`).
    *   Instead of returning a raw Session, return a wrapper or configure the Session to automatically apply the `tenant_id` filter based on the Context Variable set by the middleware.
    *   *Alternatively (Simpler)*: Just ensure the `tenant_id` from the JWT is trusted and used for all subsequent actions.

### D. Tenant Management
You need a "Super Admin" layer to onboard new tenants.

*   **Action**: Create a `superuser` flag in the User model (or a specific Role) that allows access to a `/admin/tenants` API to Create/Update tenants.

## 3. Implementation Roadmap

1.  **Modify Login**: Update `validate_user` to accept a `tenant_id` (derived from the request host or header).
2.  **Middleware**: Add `TenantMiddleware` to resolve tenant from `Host` header (e.g., `slug.domain.com`).
3.  **Frontend**: Ensure the frontend sends the correct context (if using subdomains, this is automatic).

This approach maintains the "Simple" architecture (Shared Database, Shared Schema) while fixing the critical security and usability gaps.
