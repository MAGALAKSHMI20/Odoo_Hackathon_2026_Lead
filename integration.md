# TransitOps Backend & Database Integration Guide

This guide explains how to spin up your PostgreSQL database, connect the Node.js Express server, and link your React frontend to dynamic database endpoints.

---

## Part 1: Setting up the PostgreSQL Database

### 1. Create the Database
Open your PostgreSQL terminal (psql) or pgAdmin tool and create a new database:
```sql
CREATE DATABASE transitops;
```

### 2. Run the Schema Script
Execute the contents of the database schema file to build tables, constraints, and mock seed data. In your terminal:
```bash
psql -U postgres -d transitops -f C:\Users\RADHA\.gemini\antigravity\scratch\transitops\backend\schema.sql
```
*(Replace `postgres` with your Postgres username if different).*

---

## Part 2: Configuring the Express Server

### 1. Setup Env Credentials
Inside `C:\Users\RADHA\.gemini\antigravity\scratch\transitops\backend`, create a file named `.env`. Add your database credentials:
```env
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=transitops
DB_PASSWORD=your_password_here
DB_PORT=5432
```
*Note: If no `.env` file is detected, the server will boot using an internal **in-memory mock database** so that it remains fully executable even without a database installed.*

### 2. Install and Start the Server
Open a terminal in the `backend` directory and run:
```bash
cd C:\Users\RADHA\.gemini\antigravity\scratch\transitops\backend
npm install
npm run dev
```
The server will start up on **`http://localhost:5000`**.

---

## Part 3: Connecting the React Frontend to the Server

Currently, the React frontend runs with local React state. To connect the frontend to the backend server, make these modifications in the frontend files:

### 1. Set the API Base URL
In a new file `src/utils/api.js`, define the backend endpoint:
```javascript
export const API_BASE = "http://localhost:5000/api";
```

### 2. Fetch Data on Load
In **[`src/App.jsx`](file:///C:/Users/RADHA/.gemini/antigravity/scratch/transitops/src/App.jsx)**, load initial data from the database using a `useEffect` hook instead of local variables:

```javascript
import { API_BASE } from "./utils/api";

// Replace initial hook states inside App() component:
const [vehicles, setVehicles] = useState([]);
const [drivers, setDrivers] = useState([]);
const [dispatches, setDispatches] = useState([]);
const [maintenance, setMaintenance] = useState([]);
const [expenses, setExpenses] = useState([]);

// Fetch data from backend on mount:
useEffect(() => {
  const loadData = async () => {
    try {
      const [vRes, dRes, dispRes, mntRes, expRes] = await Promise.all([
        fetch(`${API_BASE}/vehicles`).then(r => r.json()),
        fetch(`${API_BASE}/drivers`).then(r => r.json()),
        fetch(`${API_BASE}/dispatches`).then(r => r.json()),
        fetch(`${API_BASE}/maintenance`).then(r => r.json()),
        fetch(`${API_BASE}/expenses`).then(r => r.json()),
      ]);
      
      setVehicles(vRes);
      setDrivers(dRes);
      setDispatches(dispRes);
      setMaintenance(mntRes);
      setExpenses(expRes);
    } catch (err) {
      addToast("Failed to connect to backend database server.", "error");
    }
  };
  loadData();
}, []);
```

### 3. Replace Mutation Handlers
Update the dispatch, repair, and expense creators inside `src/App.jsx` to call backend routes:

#### Example: Dispatch Request
```javascript
const handleAddDispatch = async (newDisp) => {
  try {
    const response = await fetch(`${API_BASE}/dispatches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDisp)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      addToast(errorData.error, "error");
      return;
    }
    
    // Refresh states from database
    const refreshedDispatches = await fetch(`${API_BASE}/dispatches`).then(r => r.json());
    setDispatches(refreshedDispatches);
    addToast("Dispatch queued successfully", "success");
  } catch (err) {
    addToast("Network connection error", "error");
  }
};
```
