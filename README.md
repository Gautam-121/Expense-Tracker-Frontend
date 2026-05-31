# SplitEase — Frontend

React frontend for a Splitwise-inspired expense sharing application.

## Tech Stack

- **Framework** — React 18
- **Build Tool** — Vite
- **Styling** — Tailwind CSS v4
- **Routing** — React Router v6
- **Data Fetching** — TanStack Query (React Query)
- **HTTP Client** — Axios

## Project Structure

```
src/
├── pages/
│   ├── Landing.jsx       # Create or join a group
│   ├── Dashboard.jsx     # Group overview with stats
│   ├── Expenses.jsx      # Add and view expenses
│   ├── Participants.jsx  # Manage group members
│   ├── Balances.jsx      # Who owes whom
│   └── Settlements.jsx   # Optimized payment plan
└── services/
    └── api.js            # All Axios API calls
```

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Create a new group or join by code |
| `/groups/:code` | Dashboard | Stats, recent expenses, quick actions |
| `/groups/:code/expenses` | Expenses | Add (equal/unequal split) and delete expenses |
| `/groups/:code/participants` | Participants | Add members, rename with inline edit |
| `/groups/:code/balances` | Balances | Net balance per person (owes/gets back) |
| `/groups/:code/settlements` | Settlements | Minimum transactions to settle all debts |

## Local Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs on `http://localhost:5173` and connects to the backend at `http://localhost:4001/api/v1`.

## Backend Connection

All API calls are centralized in `src/services/api.js`. To point to a different backend, update the `baseURL`:

```js
const api = axios.create({
  baseURL: 'http://localhost:4001/api/v1',
})
```

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```
