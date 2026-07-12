# Odoo_Hackathon_2026_Lead

# 🚚 TransitOps – Smart Transport Operations Platform

## 📌 Overview

**TransitOps** is a centralized transport management platform developed as part of the **Odoo Hackathon**. It digitizes the complete transport lifecycle by managing vehicles, drivers, trips, maintenance, fuel logs, expenses, and operational analytics in a single integrated system.

The platform replaces traditional spreadsheet-based transport management with an automated, role-based solution that improves fleet utilization, reduces scheduling conflicts, ensures compliance, and provides real-time operational insights.

---

## 🎯 Objective

Build an end-to-end transport operations platform that enables organizations to efficiently manage:

* Vehicle Registry
* Driver Management
* Trip Dispatching
* Maintenance Operations
* Fuel & Expense Tracking
* Reports & Analytics

while enforcing business rules and automating operational workflows.

---

## 👥 Target Users

### 🚛 Fleet Manager

* Manage fleet assets
* Monitor vehicle lifecycle
* Schedule maintenance
* Track fleet utilization

### 👨‍✈️ Dispatcher

* Create and assign trips
* Allocate vehicles and drivers
* Monitor active deliveries

### 🛡️ Safety Officer

* Verify driver compliance
* Track license validity
* Monitor driver safety scores

### 💰 Financial Analyst

* Analyze fuel expenses
* Monitor maintenance costs
* Evaluate operational profitability
* Generate analytical reports

---

# ✨ Features

## 🔐 Authentication

* Secure Email & Password Login
* Role-Based Access Control (RBAC)
* Authorized access for all modules

## 📊 Dashboard

* Active Vehicles
* Available Vehicles
* Vehicles in Maintenance
* Active Trips
* Pending Trips
* Drivers On Duty
* Fleet Utilization

Includes filters based on:

* Vehicle Type
* Status
* Region

---

## 🚗 Vehicle Registry

Manage transport fleet with:

* Registration Number
* Vehicle Name
* Model
* Vehicle Type
* Maximum Load Capacity
* Odometer Reading
* Acquisition Cost
* Current Status

Vehicle Status:

* Available
* On Trip
* In Shop
* Retired

---

## 👨‍✈️ Driver Management

Maintain driver information:

* Driver Name
* License Number
* License Category
* License Expiry
* Contact Details
* Safety Score
* Availability Status

Driver Status:

* Available
* On Trip
* Off Duty
* Suspended

---

## 🛣️ Trip Management

Create and manage transport trips using:

* Source
* Destination
* Vehicle Selection
* Driver Selection
* Cargo Weight
* Planned Distance

Trip Lifecycle:

```
Draft
   ↓
Dispatched
   ↓
Completed

or

Cancelled
```

---

## 🔧 Maintenance Management

* Create maintenance logs
* Track servicing history
* Automatically move vehicles to **In Shop**
* Restore vehicle availability after maintenance completion

---

## ⛽ Fuel & Expense Management

Record:

* Fuel Logs
* Fuel Cost
* Maintenance Cost
* Toll Charges
* Other Operational Expenses

Automatically calculates operational cost for every vehicle.

---

## 📈 Reports & Analytics

Generate insights including:

* Fuel Efficiency
* Fleet Utilization
* Operational Cost
* Vehicle ROI
* Expense Analysis
* Performance Metrics

Supports:

* CSV Export

---

# ⚙️ Business Rules

The system automatically validates critical transport operations.

* ✅ Vehicle Registration Number must be unique.
* ✅ Vehicles under maintenance cannot be dispatched.
* ✅ Retired vehicles cannot be assigned.
* ✅ Drivers with expired licenses cannot be assigned.
* ✅ Suspended drivers cannot be dispatched.
* ✅ A vehicle already on a trip cannot be reused.
* ✅ A driver already on a trip cannot be reassigned.
* ✅ Cargo weight cannot exceed vehicle capacity.
* ✅ Dispatch automatically updates Driver and Vehicle status.
* ✅ Completing or cancelling trips restores availability.
* ✅ Maintenance automatically changes vehicle status.

---

# 📂 Project Modules

```
TransitOps
│
├── Authentication
├── Dashboard
├── Vehicle Registry
├── Driver Management
├── Trip Management
├── Maintenance
├── Fuel Logs
├── Expense Tracking
├── Reports & Analytics
└── User Management
```

---

# 🛠️ Technology Stack

**Framework**

* Odoo

**Backend**

* 

**Frontend**

* XML
* HTML
* CSS
* React.js
* JavaScript

**Database**

* SQL

**Version Control**

* Git
* GitHub

---

# 📁 Expected Database Entities

* Users
* Roles
* Vehicles
* Drivers
* Trips
* Maintenance Logs
* Fuel Logs
* Expenses

---

# 🚀 Future Enhancements

* Email reminders for expiring licenses
* Vehicle document management
* Dark Mode
* Advanced analytics dashboard
* Interactive charts
* Search and advanced filters
* Mobile-responsive interface
* Predictive maintenance using AI

---

# 📷 Screenshots



# 👨‍💻 Team

Lakshana V
Magalakshmi B
Monicka Shree P
Kiruthiga C M

---

# 📄 License

This project is developed for educational and hackathon purposes.


