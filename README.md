# ApexFin — Financial Analytics Dashboard

A modern, full-stack financial analytics application designed for corporate financial analysts to track, analyze, and report company transactions with dynamic visualizations, advanced multi-field filtering, and a configurable CSV export system.

---

## Key Features

### 1. Authentication & Security
- **JWT-Based Authentication**: Secure stateless token issuance and verification using `jsonwebtoken` and `bcryptjs`.
- **Session Persistence**: Automatic session restoration via `localStorage` and `/api/auth/me` verification.
- **Convenient Demo Auto-Fill**: One-click demo credentials autofill for instant evaluation (`analyst@loopr.ai` / `password123`).
- **Protected Endpoints**: All transaction and analytics APIs are secured behind JWT middleware (`authenticateJWT`).

### 2. Financial Dashboard & Visualizations
- **Executive KPI Cards**:
  - **Total Revenue**: Aggregated cash inflows with category transaction metrics.
  - **Total Expenses**: Operational costs with expense ratios.
  - **Net Cash Flow**: Real-time margin calculation and profit percentage.
  - **Total Transaction Volume**: Dynamic settlement progress bar showing Paid vs. Pending transaction ratio.
- **Dynamic Interactive Charts (Recharts)**:
  - **Revenue vs. Expenses Trend**: Monthly comparative trajectory with smooth linear gradients, custom dark tooltips, and an Area vs. Bar chart view toggle.
  - **Category Breakdown**: Interactive Donut Chart showing proportion and volume of Revenue vs. Expenses.
  - **Analyst Activity Breakdown**: Bar chart comparing transaction volumes and values across `user_001` through `user_004`.

### 3. Data Interaction & Table Operations
- **Real-Time Debounced Search**: Fast search across Transaction ID, Analyst/User, Category, Status, and Amount.
- **Multi-Field Filtering**:
  - **Category**: Filter by Revenue, Expense, or All.
  - **Status**: Filter by Paid, Pending, or All.
  - **Analyst (User ID)**: Filter by specific analysts (`user_001`–`user_004`).
  - **Date Range**: Custom date range with quick quarter presets (**Q1**, **Q2**, **Q3**, **Q4**, **All Time**).
  - **Amount Range**: Min and Max dollar value thresholds.
- **Interactive Active Filter Chips**:
  - Removable chips for every active filter with one-click individual removal (`✕`) and a global **"Reset All"** action.
- **Paginated Data Table**:
  - Column-based sorting with visual direction indicators (▲ / ▼).
  - High-resolution analyst avatars and profile links.
  - Color-coded badges for categories (Emerald for Revenue, Coral for Expense) and statuses (Green Check for Paid, Amber Clock for Pending).
  - Configurable page size (10, 25, 50, 100 rows per page) and page jump navigation.

### 4. Configurable CSV Export System (Creative UI)
- **Data Scope Selection**: Toggle between exporting **Filtered Records Only** or the **Complete Database (All 300 Records)**.
- **Column Selection Checklist**: Granularly toggle any of the 7 fields (`id`, `date`, `amount`, `category`, `status`, `user_id`, `user_profile`) with "Select All" and "Clear" helpers.
- **Custom Header Aliases**: Inline editable fields allowing analysts to customize CSV column headers (e.g. rename `user_id` to `Analyst ID`, `amount` to `Amount (USD)`).
- **Formatting Preferences**:
  - **Date Format**: Choose between ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ`) and Locale Date (`MM/DD/YYYY`).
  - **Currency Format**: Format as raw decimals (`1500.00`) or formatted currency (`$1,500.00`).
- **Live CSV Preview Table**: Dynamic preview displaying the first 3 rows of the generated CSV before downloading.
- **Direct Browser Auto-Download**: Automatic client-side file download streaming from the backend.

### 5. Error Handling via Alert Chips
- Interactive floating notification tray with animated entry and status-specific styling:
  - **Error Chips**: High-priority alert with action button (e.g. `[Retry]`).
  - **Warning Chips**: Context alerts when zero transactions match filter criteria with `[Reset Filters]` action.
  - **Success Chips**: Confirmation toasts upon successful login, CSV export generation, or data refresh.
  - **Info Chips**: Filter presets and session notices.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Recharts, Lucide React, Vanilla CSS Design System |
| **Backend** | Node.js, Express, TypeScript, Mongoose, MongoDB, json2csv, JWT, bcryptjs |
| **Database** | MongoDB (with optimized compound indexes on date, amount, category, status) |
| **Data Processing** | 300 transaction records with aggregation pipelines |

---

## Project Structure

```text
├── dataset/
│   └── sample-data.json         # 300 raw transaction records
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.ts         # Login & /me endpoints
│   │   │   └── transactionController.ts  # Filter, pagination, stats aggregation, CSV export
│   │   ├── middleware/
│   │   │   └── auth.ts                   # JWT authentication middleware
│   │   ├── models/
│   │   │   ├── Transaction.ts            # Mongoose schema with compound indexes
│   │   │   └── User.ts                   # User schema with bcrypt password hashing
│   │   ├── routes/
│   │   │   ├── authRoutes.ts             # Auth routing
│   │   │   └── transactionRoutes.ts      # Transaction API routing
│   │   ├── scripts/
│   │   │   └── seed.ts                   # Database seeder from dataset/sample-data.json
│   │   └── server.ts                     # Express app setup and MongoDB connection
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts                 # Typed fetch client with auth & blob download
│   │   ├── components/
│   │   │   ├── AlertChipsTray.tsx        # Dismissible alert chips notification system
│   │   │   ├── ChartsSection.tsx         # Recharts Area, Donut, and Bar charts
│   │   │   ├── CsvExportModal.tsx        # Configurable CSV export modal with live preview
│   │   │   ├── FilterBar.tsx             # Multi-field filters & search with preset chips
│   │   │   ├── Header.tsx                # Dashboard navigation bar & user status
│   │   │   ├── LoginPage.tsx             # Dark glassmorphism login with demo autofill
│   │   │   ├── MetricsCards.tsx          # KPI summary cards
│   │   │   └── TransactionTable.tsx      # Paginated table with column sorting
│   │   ├── context/
│   │   │   ├── AlertContext.tsx          # Global alert chips queue
│   │   │   └── AuthContext.tsx           # JWT token & user state manager
│   │   ├── types/
│   │   │   └── index.ts                  # Shared TypeScript interfaces
│   │   ├── App.tsx                       # Root dashboard application assembly
│   │   └── index.css                     # Custom design tokens and responsive styles
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
└── README.md
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v22+ recommended)
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017`

### 1. Database Seeding & Backend Setup
```bash
# Navigate to the backend directory
cd backend

# Install dependencies (if not already installed)
npm install

# Build TypeScript
npm run build

# Seed database with the 300 transactions from dataset/sample-data.json
npm run seed

# Start backend server (runs on port 5000)
npm run dev
# or: npm start
```

Default credentials seeded:
- **Email**: `analyst@loopr.ai`
- **Password**: `password123`

### 2. Frontend Setup
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start Vite development server (runs on port 5173)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## API Documentation

All secured endpoints require the header:
```http
Authorization: Bearer <jwt_token>
```

### 1. Authentication Endpoints

#### `POST /api/auth/login`
Authenticates a user and returns a JWT token.
- **Request Body**:
  ```json
  {
    "email": "analyst@loopr.ai",
    "password": "password123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "67... ",
      "name": "Shruti Narkhede",
      "email": "analyst@loopr.ai",
      "role": "Lead Financial Analyst",
      "avatar": "https://..."
    }
  }
  ```

#### `GET /api/auth/me`
Fetches the currently authenticated user's profile.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": { "id": "...", "email": "...", "name": "...", "role": "..." }
  }
  ```

---

### 2. Transaction & Analytics Endpoints

#### `GET /api/transactions`
Retrieves a paginated, sorted, and filtered list of transactions.
- **Query Parameters**:
  | Parameter | Type | Description |
  |---|---|---|
  | `page` | number | Current page (default: 1) |
  | `limit` | number | Items per page (default: 10) |
  | `sortBy` | string | Field to sort by (`date`, `amount`, `id`, `category`, `status`, `user_id`) |
  | `sortOrder` | string | `asc` or `desc` (default: `desc`) |
  | `category` | string | `Revenue` or `Expense` |
  | `status` | string | `Paid` or `Pending` |
  | `user_id` | string | Analyst ID (`user_001` - `user_004`) |
  | `startDate` | ISO Date | Filter records on or after date |
  | `endDate` | ISO Date | Filter records on or before date |
  | `minAmount` | number | Minimum transaction amount |
  | `maxAmount` | number | Maximum transaction amount |
  | `search` | string | Full-text search across ID, analyst, category, status, amount |

- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "date": "2024-01-15T08:34:12.000Z",
        "amount": 1500,
        "category": "Revenue",
        "status": "Paid",
        "user_id": "user_001",
        "user_profile": "https://thispersondoesnotexist.com/"
      }
    ],
    "pagination": {
      "total": 300,
      "page": 1,
      "limit": 10,
      "totalPages": 30
    }
  }
  ```

#### `GET /api/transactions/stats`
Computes aggregated metrics and chart time-series matching the active query filters.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "summary": {
      "totalCount": 300,
      "totalRevenue": 305450.5,
      "totalExpense": 218950.5,
      "netBalance": 86500,
      "paidCount": 182,
      "pendingCount": 118,
      "paidAmount": 320150,
      "pendingAmount": 204251
    },
    "monthlyTrends": [
      { "month": "Jan 2024", "revenue": 24200, "expense": 18450, "net": 5750, "count": 28 }
    ],
    "categoryBreakdown": [
      { "_id": "Revenue", "totalAmount": 305450.5, "count": 154 },
      { "_id": "Expense", "totalAmount": 218950.5, "count": 146 }
    ],
    "userBreakdown": [
      { "_id": "user_001", "revenue": 142000, "expense": 34000, "totalAmount": 176000, "count": 76 }
    ]
  }
  ```

#### `POST /api/transactions/export-csv`
Generates and downloads a customized CSV file with user-selected columns and formatting.
- **Request Body**:
  ```json
  {
    "columns": ["id", "date", "amount", "category", "status", "user_id"],
    "columnAliases": {
      "id": "Transaction ID",
      "date": "Timestamp",
      "amount": "Amount (USD)",
      "category": "Category",
      "status": "Payment Status",
      "user_id": "Analyst ID"
    },
    "dateFormat": "locale",
    "formatCurrency": true,
    "filters": {
      "category": "Revenue",
      "status": "Paid"
    },
    "scope": "filtered"
  }
  ```
- **Response**: `text/csv` attachment stream triggering instant browser download.

---

## CSV Export Specification

Sample exported CSV output:
```csv
"Transaction ID","Timestamp","Amount (USD)","Category","Payment Status","Analyst ID"
1,"1/15/2024","$1,500.00","Revenue","Paid","user_001"
3,"3/3/2024","$300.75","Revenue","Pending","user_003"
5,"5/20/2024","$800.00","Revenue","Pending","user_001"
```
