# Additional Findings for Multi-Tenant Platform

Building upon the initial analysis, here are deeper technical findings regarding Middleware, Database Configuration, and Frontend integration.

## 4. Deep Dive: Middleware & Context

### Current Status
*   There is no tenant-aware middleware in `fastapi/middleware`.
*   `fastapi/config/databases.py` creates a standard `AsyncSession` without any row-level security or filtering mechanisms.

### Finding: Missing Context Propagation
Even if we resolve the tenant ID, we need a standard way to pass it to the Service layer and the Database layer without polluting every function signature with `tenant_id: int`.

### Recommendation: `contextvars` + Session Proxy
1.  **Context Variable**: Create a global `contextvars.ContextVar` to hold the `current_tenant_id`.
2.  **Middleware**: The `TenantMiddleware` should set this variable at the start of the request and reset it at the end.
3.  **DB Dependency Upgrade**: Modify `get_async_db` to inspect this context variable.
    *   *Advanced*: Use SQLAlchemy's `before_compile` event or a custom `Session` subclass to automatically append `WHERE tenant_id = :id` to every query.
    *   *Simple*: Just expose `current_tenant_id` so services can use it easily: `service.get_current_tenant()`.

## 5. Deep Dive: Redis & Caching

### Current Status
*   Redis is used for Token storage (allow/deny list).
*   Keys are simple: `key=access_token, value="false"`.
*   `settings.py` defines a global `REDIS_HOST`.

### Finding: Cache Collision Risk
If you cache other data (like "system configurations" or "cached user profiles") using simple keys like `user:123`, you will have collisions between Tenant A's User 123 and Tenant B's User 123.

### Recommendation: Namespacing
*   **Key Prefixing**: Always prefix Redis keys with the tenant ID. E.g., `tenant:5:user:123`.
*   **Token Storage**: Tokens are globally unique (cryptographically), so they don't strictly need namespacing, but it helps with "Invalidate All Tokens for Tenant X" features.

## 6. Deep Dive: Frontend Architecture

### Current Status
*   `frontend/src/services/api.ts` uses a static `baseURL` (localhost:9024).
*   It sends `Authorization: Bearer ...`.
*   It does **not** send any `X-Tenant-ID` header.

### Finding: Client-Side Tenant Resolution
The frontend needs to know which tenant it is serving to display the correct branding and send the correct context to the API (if using Header-based resolution).

### Recommendation: Dynamic Config
1.  **Subdomain Logic**: In `main.tsx` or a strictly run `utils/tenant.ts`, parse `window.location.hostname`.
    *   If `app.platform.com`, tenant is NULL (or super-admin).
    *   If `tenant1.platform.com`, tenant is `tenant1`.
2.  **API Interceptor**: Update `api.interceptors.request` in `frontend/src/services/api.ts`:
    ```typescript
    const tenantSlug = getTenantFromSubdomain(); // Implement this
    if (tenantSlug) {
      config.headers['X-Tenant-ID'] = tenantSlug;
    }
    ```
    *   *Note*: Even if using subdomains, sending the header explicitly makes debugging and API testing (via Postman) much easier.

## 7. Deep Dive: Database Connections

### Current Status
*   `fastapi/config/databases.py` uses a connection pool (`pool_size=20`).

### Finding: Pool Exhaustion Risk
In a multi-tenant system, if you have 100 tenants and you try to create separate connection pools for each (Schema-per-Tenant model), you will crash the DB.
*   **Good News**: You are using "Discriminator Column" (Shared Schema), so you share the connection pool. This is the correct "Lightweight" approach.

### Warning: No Schema Switching
Do **not** try to use Postgres Schemas (`SET search_path`) unless you really need to. It adds complexity with migrations (Alembic) and connection pooling. Stick to `tenant_id` columns as you currently have.

## 8. Operational: Onboarding & Migrations

### Finding: No "New Tenant" Workflow
Currently, creating a tenant involves manually inserting a row into the `tenant` table.

### Recommendation: Provisioning Script/API
Create a service `TenantService.provision(name, slug, admin_email)` that:
1.  Creates the `Tenant` row.
2.  Creates the `Role` "Admin" for that tenant.
3.  Creates the `User` "admin" linked to that Role and Tenant.
4.  (Optional) Seeds default permissions/objects.

## Summary of New Technical Tasks

| Component | Task | Priority |
| :--- | :--- | :--- |
| **Backend** | Implement `contextvars` for `tenant_id`. | High |
| **Backend** | Create `TenantMiddleware` (Subdomain -> ID). | High |
| **Frontend** | Add `X-Tenant-ID` header injection in Axios. | Medium |
| **Redis** | Implement `tenant:{id}:` prefix helper for caching. | Low |
| **Ops** | Create `provision_tenant` script/endpoint. | High |
