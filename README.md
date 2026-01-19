# CRM System – Technical Challenge

  

## Overview

  

The project demonstrates:

- Multi-service backend architecture

- Company-based data isolation

- Parent–child company visibility

- Event-driven integration using Kafka

- Single-command startup using Docker Compose

- Minimal frontend to validate end-to-end behavior

  

---

  

## Architecture Overview

The system consists of **four main components**:

  

1.  **Identity Service (Django + GraphQL)**

2.  **CRM Service (Django + GraphQL)**

3.  **Kafka (Event Streaming)**

4.  **Frontend (React + Vite)**

  

All components are orchestrated using **Docker Compose**.

  

### 1️⃣ Company Management (Identity Service)

  

**Requirement**

> System should support companies with parent–child hierarchy.

  

**Implementation**

-  `Company` model with self-referencing `parent`

- GraphQL API to query companies

- Recursive company scope resolution

  

**Result**

- Parent companies automatically inherit visibility of child companies

  

---

  

### 2️⃣ Lead Management (CRM Service)

  

**Requirement**

> Leads must belong to a company and be isolated by company access rules.

  

**Implementation**

-  `Lead` model includes `company_id`

- Leads are **always filtered by company scope**

- CRM never exposes unscoped data

  

---

  

### 3️⃣ Parent → Child Visibility

  

**Requirement**

> Parent company users should see leads of child companies.

  

**Implementation**

- CRM service queries Identity Service to resolve full company scope

- Example:

- Parent company `1`

- Children `2`, `3`

- Scope returned: `[1, 2, 3]`

- Leads filtered using `company_id IN scope`

  

This logic is **centralized in the backend**, not the frontend.

  

---

  

### 4️⃣ Event-Driven Architecture (Kafka)

  

**Requirement**

> Lead creation events should be published for downstream processing.

  

**Implementation**

- Kafka is included via Docker Compose

- On lead creation:

- CRM publishes `LEAD_CREATED` event

Kafka is not exposed to the frontend.
 

---
 

### 5️⃣ Gateway Layer

  

**Requirement**

> Frontend should not directly depend on internal services.

  

**Implementation**

- Apollo Gateway sits between frontend and backend services

- Gateway composes schemas from:

- Identity Service

- CRM Service

- Frontend communicates with **one endpoint only**

  

---

  

### 6️⃣ Frontend (Validation UI)

  

**Requirement**

> Minimal frontend to demonstrate functionality.

  

**Implementation**

- React + Vite frontend

- Features:

- Company selection dropdown

- Create lead form

- View leads visible to selected company

- No authentication (not required by spec)

  

Frontend is **not production UI**, only a validation layer.

  

---

  

## Seeded Data (Automatic)

  

To avoid manual setup, the system **auto-seeds data** on startup.

  

### Companies

| ID | Name | Parent |

|----|---------------|--------|

| 1 | Parent Corp | — |

| 2 | Child India | 1 |

| 3 | Child Europe | 1 |

  

This allows immediate verification of parent–child visibility.

  

---

  

## How to Run

  

### Prerequisites

- Docker

- Docker Compose

  

### Start everything

```bash

docker  compose  up

```

This command:

  

- Starts PostgreSQL databases

- Runs migrations

- Seeds companies and leads

- Starts Kafka + Zookeeper

- Starts backend services

- Starts frontend

  

### Stop everything

Ctrl + C

docker compose down

  

### Service endpoints

Frontend - http://localhost:3000

Gateway (single entry point) - http://localhost:4000/graphql

Identity Service (internal) - (http://localhost:8001/graphql)

CRM Service (internal) - http://localhost:8002/graphql

  

## Tests

### What is tested implicitly

-   **Business logic correctness** is verified via:
    
    -   GraphQL queries & mutations executed through:
        
        -   `identity-service` (company hierarchy & scope)
            
        -   `crm-service` (lead creation & scoped fetching)
            
        -   `gateway` (federated access)
            
-   Manual verification confirms:
    
    -   Parent company sees child leads
        
    -   Child company does not see parent/sibling leads
        
    -   Kafka events are produced on lead creation
        

----------

### What we would test next if it was for prod

#### 1️⃣ Identity Service

-   Unit tests for:
    
    -   `companyScope(companyId)`
        
        -   Parent → returns all descendants
            
        -   Child → returns self only
            
        -   Invalid company → returns empty list
            
-   DB-level test ensuring no circular parent relationships
    

#### 2️⃣ CRM Service

-   Unit tests for:
    
    -   `leads()` query:
        
        -   Correct filtering based on resolved company scope
            
        -   No data leakage across companies
            
-   Mutation test:
    
    -   `createLead` persists correct `company_id`
        
    -   Kafka event is emitted on lead creation
        

#### 3️⃣ Gateway

-   Integration tests:
    
    -   Headers/context propagation to downstream services
        
    -   Gateway schema composition with both services running
        

----------

### Why tests are not implemented now

-   The requirement states **exhaustive coverage is not required**
    
-   The focus is on:
    
    -   Correct architecture
        
    -   Correct access control
        
    -   Clear separation of concerns
        
   ## Design Decisions & Trade-offs

This project prioritizes **correct domain modeling, access control, and system boundaries** over exhaustive feature completeness, in line with the challenge requirements.

### 1. Microservice separation (Identity vs CRM)

**Decision:**  
Identity (companies, hierarchy, access scope) and CRM (leads) are implemented as separate services.

**Why:**

-   Company hierarchy and access rules are **core identity concerns**
    
-   Leads are a **domain entity** that should not own access logic
    
-   Prevents accidental data leakage and keeps responsibilities clear
    

**Trade-off:**

-   Requires inter-service communication (GraphQL call from CRM → Identity)
    
-   Slight runtime overhead, acceptable for correctness and clarity
    

----------

### 2. Company-based access control via backend enforcement

**Decision:**  
Lead visibility is enforced **server-side**, based on company hierarchy resolved by the identity service.

**Why:**

-   Prevents frontend or gateway from bypassing access rules
    
-   Matches real-world multi-tenant SaaS security requirements
    
-   Explicitly satisfies the document’s access-control expectations
    

**Trade-off:**

-   Slightly more complex query flow
    
-   Requires clear documentation of access behavior
    

----------

### 3. Parent–child company visibility logic

**Decision:**

-   Parent company can see leads from all descendant companies
    
-   Child companies can only see their own leads
    

**Why:**

-   Explicitly required by the document
    
-   Implemented centrally in the identity service (`companyScope` query)
    
-   Ensures consistency across all consumers (CRM, gateway, future services)
    

**Trade-off:**

-   Recursive hierarchy resolution logic
    
-   Requires careful modeling to avoid cycles (not implemented here, but noted)
    

----------

### 4. GraphQL-first API (services + gateway)

**Decision:**  
All services expose GraphQL APIs; the frontend talks only to the gateway.

**Why:**

-   Clean contract between frontend and backend
    
-   Enables schema composition and future extensibility
    
-   Reduces frontend coupling to service internals
    

**Trade-off:**

-   Gateway startup depends on downstream services being available
    
-   Mitigated via Docker Compose ordering and documentation
    

----------

### 5. Apollo Gateway for federation

**Decision:**  
Apollo Gateway is used to compose identity and CRM schemas.

**Why:**

-   Provides a single entry point for frontend
    
-   Clean separation of schemas without tight coupling
    
-   Aligns with modern GraphQL service architectures
    

**Trade-off:**

-   Adds operational complexity
    
-   Requires careful header/context propagation
    

----------

### 6. Kafka for event-driven communication

**Decision:**  
Lead creation emits a Kafka event (`lead.created`).

**Why:**

-   Demonstrates async/event-driven architecture
    
-   Decouples CRM write operations from downstream consumers
    
-   Matches real-world scalability patterns
    

**Trade-off:**

-   Kafka adds operational overhead
    
-   Only a minimal consumer is implemented (by design)
    

----------

### 7. Minimal frontend (Vite + React)

**Decision:**  
Frontend is intentionally simple and focused on:

-   Selecting company
    
-   Creating leads
    
-   Viewing leads based on access scope
    

**Why:**

-   The challenge focuses on backend architecture and correctness
    
-   UI is only a validation tool, not a product feature
    

**Trade-off:**

-   No authentication UI
    
-   No advanced UX or styling
    

----------

### 8. Testing approach

**Decision:**  
No exhaustive automated test suite is included.

**Why:**

-   The document explicitly states exhaustive coverage is not required
    
-   Core logic is deterministic and easily testable
    
-   Manual verification via GraphQL is sufficient for the challenge
    

**What would be tested next:**

-   Company hierarchy resolution
    
-   Access control edge cases
    
-   Kafka event emission
    
-   Gateway schema composition
    

----------

### 9. Docker-first, single-command setup

**Decision:**  
The entire system runs via `docker compose up`.

**Why:**

-   Zero local dependency requirements
    
-   Easy reviewer experience
    
-   Predictable runtime behavior
    

**Trade-off:**

-   Local disk usage (volumes)
    
-   Slightly slower iteration compared to native runs
    

----------

### Summary

This design favors:

-   **Correctness over shortcuts**
    
-   **Backend-enforced security**
    
-   **Clear service boundaries**
    
-   **Reviewer-friendly setup**
    


