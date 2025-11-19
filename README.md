# Car Marketplace – Setup & Testing Guide

This document explains how to install, configure, and test the full iWantCar car marketplace system, including:

- **Backend API** (Node.js + Express + MySQL)
- **Frontend** (React + Vite)
- **MySQL database** (tables + sample data)

The instructions assume you are running on **Windows** with **MySQL** (e.g., WAMP or MySQL Workbench), but they can be adapted to other environments.

---

## 1. Project Structure

The project is organized into two main folders:

```text
Car-marketplace-v2/
  backend/    # Node.js + Express REST API
  frontend/   # React + Vite single-page application
```

The **frontend** displays the UI,  
the **backend** handles all logic,  
and **MySQL** stores the application data.

---

## 2. Prerequisites

Before starting, make sure you have installed:

- Node.js (v20+ recommended)
- npm (comes with Node)
- MySQL Server (WAMP, XAMPP, or standalone)
- MySQL Workbench 

---

## 3. Database Setup (MySQL)

### Step 1 — Start MySQL
Start your MySQL server (e.g., through WAMP).

### Step 2 — Create the database
Open MySQL Workbench and run:

```sql
CREATE DATABASE IF NOT EXISTS car_marketplace;
USE car_marketplace;
```
### Step 3 — Create the tables

Run your SQL schema file that includes the `CREATE TABLE` statements for:

- users
- listings
- ratings
- messages
- listing_images

If your schema is split into multiple files, run each one manually in MySQL Workbench.

### Step 4 — Insert sample data

Run your data insert script containing your `INSERT INTO` statements.

Verify the data loaded correctly:

```sql
SELECT * FROM users;
SELECT * FROM listings;
SELECT * FROM ratings;
SELECT * FROM messages;
SELECT * FROM listing_images;
```
## 4. Backend Setup (Node.js + Express)

### Step 1 — Install backend dependencies
```text
cd backend
npm install
```
### Step 2 — Create a .env file
```text
PORT=4000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=car_marketplace
DB_PORT=3306
```
### Step 3 — Start the backend
```text
npm start
node server.js
```
### Step 4 — Test the backend

http://localhost:4000/api/health

## 5. Frontend Setup (React + Vite)

### Step 1 — Install frontend dependencies

Open a new terminal window and run:
```text
cd frontend
npm install
```
This installs all required React and Vite packages.

### Step 2 — Create a `.env` file for the frontend

Inside the `frontend` folder, create:

```text
frontend/.env
```
Add the following:

```text
VITE_API_URL=http://localhost:4000
```
This tells the frontend which backend URL to use.

### Step 3 — Start the frontend

Run:
```text
npm run dev
```
You should see:

Local: http://localhost:5173/

Open that URL in your browser to view the app.

---

## 6. How the System Works Together

The system follows a simple three-layer architecture:

1. **Frontend (React + Vite)**
   - Displays pages and UI components.
   - Sends HTTP requests to the backend.

2. **Backend (Express API)**
   - Handles routes and logic.
   - Communicates with MySQL.

3. **Database (MySQL)**
   - Stores all data such as users, listings, messages, ratings, and images.

---

### Example: Browsing Listings

1. React makes a request:

GET /api/listings

2. Backend queries MySQL.
3. Backend returns JSON.
4. React displays the listings.

---

### Example: Viewing a Listing

1. React sends:

GET /api/listings/:id

2. Backend returns listing details.
3. React renders the full listing page.

---

### Example: Sending a Message

1. React sends:

POST /api/messages

With JSON, for example:

{
"listing_id": 1,
"receiver_id": 3,
"message_text": "Is this car still available?"
}

2. Backend inserts the message into MySQL.
3. React updates the conversation.

---

## 7. Testing Checklist

Use this checklist to confirm the system is working end-to-end.

### ✓ Database Tests
- Database `car_marketplace` exists
- All tables exist (users, listings, ratings, messages, listing_images)
- Sample data loads without errors
- Queries such as `SELECT * FROM users;` return rows

### ✓ Backend Tests
- Backend starts using `npm start` without errors
- Visiting `http://localhost:4000/api/health` returns:
{
"status": "ok",
"service": "iWantCar API"
}

- API routes respond with JSON data

### ✓ Frontend Tests
- Frontend starts using `npm run dev`
- Homepage loads at `http://localhost:5173`
- Listings appear on screen
- Clicking a listing opens its details page
- Messages and ratings display properly (if implemented)

When all checks pass, the full system is functioning correctly.

---

## 8. Common Issues & Fixes

### ❗ Issue: CORS error in the browser
**Fix:** Ensure CORS is enabled in the backend and that the frontend `.env` uses:

VITE_API_URL=http://localhost:4000

### ❗ Issue: Backend cannot connect to MySQL
**Fix:** Check `.env` for:
- Correct DB username/password
- Correct database name
- MySQL running on port 3306

### ❗ Issue: Frontend shows a blank screen
**Fix:**  
Check the browser’s DevTools Console for:
- API URL errors  
- Missing imports  
- Syntax errors in components  

### ❗ Issue: Node version warnings
Some dependencies prefer Node v20+.  
Upgrade Node if anything breaks.

---

## 9. Running Both Servers Simultaneously

You must run the backend and frontend **in two separate terminals**.

### Terminal 1 — Start Backend
```text
cd backend
npm start
```
Backend will run at:
http://localhost:4000

### Terminal 2 — Start Frontend
```text
cd frontend
npm run dev
```
Frontend will run at:
http://localhost:5173

Both must stay running for the full system to work.

---

## 10. Summary

To run the full **iWantCar Marketplace System**:

1. Start MySQL
2. Create the `car_marketplace` database
3. Run table creation scripts
4. Insert sample data
5. Start the backend using `npm start`
6. Start the frontend using `npm run dev`
7. Visit:
   - API Health Check → `http://localhost:4000/api/health`
   - Frontend App → `http://localhost:5173`

You now have a fully working car marketplace application running locally.

---
