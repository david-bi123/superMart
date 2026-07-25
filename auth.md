# RetailFlow - Demo Login Credentials

## Super Admin (Platform Owner)

| Email | Password | Role |
|-------|----------|------|
| admin@retailflow.com | Admin@123456 | super_admin |

---

## FreshMart (Demo Business 1)

### Business Owner

| Email | Password | Role |
|-------|----------|------|
| owner@freshmart.com | Demo@123456 | business_owner |

### Managers

| Email | Password | Role |
|-------|----------|------|
| manager1@freshmart.com | Demo@123456 | manager |
| manager2@freshmart.com | Demo@123456 | manager |

### Cashiers

| Email | Password | Role |
|-------|----------|------|
| cashier1@freshmart.com | Demo@123456 | cashier |
| cashier2@freshmart.com | Demo@123456 | cashier |

### Inventory Officers

| Email | Password | Role |
|-------|----------|------|
| inventory1@freshmart.com | Demo@123456 | inventory_officer |
| inventory2@freshmart.com | Demo@123456 | inventory_officer |

### Accountant

| Email | Password | Role |
|-------|----------|------|
| accountant@freshmart.com | Demo@123456 | accountant |

### Staff

| Email | Password | Role |
|-------|----------|------|
| staff1@freshmart.com | Demo@123456 | cashier |
| staff2@freshmart.com | Demo@123456 | cashier |

---

## CityGrocer (Demo Business 2)

### Business Owner

| Email | Password | Role |
|-------|----------|------|
| owner@citygrocer.com | Demo@123456 | business_owner |

### Managers

| Email | Password | Role |
|-------|----------|------|
| manager1@citygrocer.com | Demo@123456 | manager |
| manager2@citygrocer.com | Demo@123456 | manager |

### Cashiers

| Email | Password | Role |
|-------|----------|------|
| cashier1@citygrocer.com | Demo@123456 | cashier |
| cashier2@citygrocer.com | Demo@123456 | cashier |

### Inventory Officers

| Email | Password | Role |
|-------|----------|------|
| inventory1@citygrocer.com | Demo@123456 | inventory_officer |
| inventory2@citygrocer.com | Demo@123456 | inventory_officer |

### Accountant

| Email | Password | Role |
|-------|----------|------|
| accountant@citygrocer.com | Demo@123456 | accountant |

### Staff

| Email | Password | Role |
|-------|----------|------|
| staff1@citygrocer.com | Demo@123456 | cashier |
| staff2@citygrocer.com | Demo@123456 | cashier |

---

## Role Permissions

| Role | Access |
|------|--------|
| **super_admin** | Full platform access: manage all tenants, subscriptions, analytics, revenue, system logs, support tickets |
| **business_owner** | Full company control: manage staff, inventory, suppliers, customers, reports, settings |
| **manager** | Manage inventory, approve stock adjustments, view reports, POS access |
| **cashier** | POS only: view products, create sales, print receipts, process returns (no reports) |
| **inventory_officer** | Receive stock, transfer stock, count inventory, record damaged products |
| **accountant** | View sales, expenses, profit, taxes, reports |

## Environment Variables Required

```bash
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/retailflow
AUTH_SECRET=<your-secret>
AUTH_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASS=<app-password>
EMAIL_FROM=noreply@retailflow.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=RetailFlow
```

## Quick Start

```bash
# Install dependencies
npm install

# Seed database
npm run seed

# Start development server
npm run dev

# Production build
npm run build
npm start
```
