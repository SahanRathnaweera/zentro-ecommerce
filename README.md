<div align="center">

# ZENTRO

**Premium clothing e-commerce platform for Men, Ladies & Kids**

Full-stack web application built with React, TypeScript, Spring Boot and MySQL

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4-6DB33F?logo=springboot&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)

</div>

---

## Overview

Zentro is a complete online clothing store with a **customer storefront** and a secure **admin panel**. It covers the whole shopping journey: browsing, variants (size and colour), cart, guest or registered checkout, online card payment (PayHere sandbox), order tracking and back-office management.

> Built step by step as a learning project, with a focus on clean architecture, security and real-world e-commerce rules (stock integrity, price snapshots, ownership checks).

## Screenshots

| Home | Product details |
|---|---|
| ![Home](docs/screenshots/home.png) | ![Product](docs/screenshots/product-details.png) |

| Checkout | Admin dashboard |
|---|---|
| ![Checkout](docs/screenshots/checkout.png) | ![Admin](docs/screenshots/admin-dashboard.png) |

## Features

### Customer
- Browse by category (Men's, Ladies, Kids), filter and view product details
- Product **variants**: size and colour with live stock status
- Shopping cart with quantity limits (persisted in the browser)
- **Guest checkout** or registered checkout
- **Cash on delivery** and **online card payment** (PayHere sandbox)
- Order history and **order tracking** (order number + email)
- Register / login with JWT authentication

### Admin
- Role-protected panel (`ROLE_ADMIN`)
- Dashboard: products, customers, orders, sales, low-stock and recent orders
- Product management (add, edit, delete, variants, images)
- Category management
- Order management with controlled status flow (PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED, or CANCELLED with stock restored)
- Customer list and inventory management

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router |
| Backend | Java, Spring Boot, Spring Data JPA (Hibernate), Spring Security, Maven |
| Database | MySQL |
| Auth | JWT, BCrypt password hashing, role-based authorization |
| Payments | PayHere (sandbox) with signed (MD5) hash verification |
| Tools | IntelliJ IDEA, VS Code, Postman, Git, GitHub |

## Architecture

```
Browser (React + TypeScript)
        │  REST / JSON
        ▼
Spring Boot API
  Controller → Service → Repository → MySQL
        │
  Security (JWT filter, roles) · Global exception handler · DTO validation
```

```
Zentro
├── frontend/   React app (customer site + admin panel)
├── backend/    Spring Boot REST API
└── README.md
```

Backend packages: `controller`, `service`, `repository`, `entity`, `dto`, `security`, `config`, `exception`.

## Engineering Highlights

- **Transactional checkout:** stock validation and reduction in one `@Transactional` flow, with **pessimistic locking** to prevent overselling
- **Server-side pricing:** the client sends only variant ids and quantities; prices are read from the database
- **Price snapshots** in order items, so later price changes never alter past orders
- **Security:** BCrypt hashing, JWT, role-based access, login rate limiting, security headers, ownership checks, DTOs that never expose password hashes
- **Centralized error handling** with a consistent JSON error format (400/401/403/404/409/500)
- **Payment safety:** order is marked PAID only from PayHere's verified server notification (hash and amount checked), never from the browser redirect
- Guest order tracking requires both order id and email

## API Overview

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` |
| Catalog | `GET /api/products`, `GET /api/products/{id}`, `GET /api/categories` |
| Orders | `POST /api/orders`, `GET /api/orders`, `GET /api/orders/track` |
| Payments | `GET /api/payments/payhere-form`, `POST /api/payments/notify` |
| Admin | `/api/admin/products`, `/categories`, `/orders`, `/customers`, `/inventory`, `/dashboard` |

## Getting Started

### Prerequisites
Java 17+, Node.js 20+, MySQL 8, Maven (wrapper included)

### 1. Database
```sql
CREATE DATABASE zentro_db CHARACTER SET utf8mb4;
```

### 2. Backend
Create `backend/src/main/resources/application-local.properties` (this file is git-ignored):

```properties
spring.datasource.username=YOUR_DB_USER
spring.datasource.password=YOUR_DB_PASSWORD
jwt.secret=A_LONG_RANDOM_SECRET_AT_LEAST_32_CHARACTERS
jwt.expiration-ms=86400000
payhere.merchant-id=YOUR_SANDBOX_MERCHANT_ID
payhere.merchant-secret=YOUR_SANDBOX_MERCHANT_SECRET
payhere.sandbox-url=https://sandbox.payhere.lk/pay/checkout
payhere.notify-url=http://localhost:8080/api/payments/notify
```

```bash
cd backend
./mvnw spring-boot:run
```
API runs on `http://localhost:8080`.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
App runs on `http://localhost:5173`.

### 4. Admin account
Register a user on the site, then promote it in MySQL:
```sql
UPDATE users SET role = 'ROLE_ADMIN' WHERE email = 'you@example.com';
```
Open `http://localhost:5173/admin`.


## Author

**Sahan Rathnaweera**
GitHub: [@SahanRathnaweera](https://github.com/SahanRathnaweera)