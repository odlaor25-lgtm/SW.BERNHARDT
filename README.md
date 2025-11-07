This is the final `README.md` file summarizing the project's current state, the successful migration to Node.js, and instructions for setup and troubleshooting on your Ubuntu server.

-----

# README: SW.BERNHARDT Management System

This repository contains the source code for the **SW.BERNHARDT Management System**, which was successfully migrated from Google Apps Script (GAS) to a dedicated Node.js/Express.js API running on an Ubuntu server.

The migration strategy was implemented to resolve long-standing issues related to **Google Apps Script Authorization Locks**, **CORS policy**, and **API usage limitations**.

## 🌟 Project Components

| Component | Technology | Role / Location |
| :--- | :--- | :--- |
| **Frontend UI** | HTML / Tailwind CSS | Served by Nginx (Port 80) from `/home/bernny/swb-node-api/index.html` |
| **Backend API** | **Node.js / Express.js** | Runs on **Port 3000** (using `server.js`) |
| **Database** | **Google Sheets** | Accessed via **Google Sheets API** (Service Account Authentication) |
| **Data Access** | **Service Account Key** | `gen-lang-client-....json` |

-----

## 🚀 Deployment & Installation (Ubuntu Server)

### A. Prerequisites

1.  **Node.js:** Must be installed (v20.x or higher is recommended).
2.  **Web Server:** Nginx or Apache must be installed and configured.
3.  **Service Account Key:** The JSON key file (`gen-lang-client-....json`) must be present in the project directory.

### B. Project Setup

1.  **Clone Project:** Get the source files and place them in the working directory (e.g., `/home/bernny/swb-node-api/`).
2.  **Install Dependencies:** Navigate to the project folder and install Node.js packages:
    ```bash
    npm install express google-auth-library @googleapis/sheets
    # OR simply:
    npm install
    ```

### C. Running the Services

The system requires both the API and the Web Server to be active simultaneously.

| Service | Port | Command (in project directory) |
| :--- | :--- | :--- |
| **API Backend** | 3000 | `node server.js` |
| **Frontend Server** | 80 (Nginx) | `sudo service nginx restart` |

-----

## 🔑 Key Configuration & Login

### 1\. API Connection (Server-Side)

  * **API URL (Frontend Config):** The `index.html` file must use the IP and Port of your Node.js server to send requests:
    ```javascript
    const API_URL = "http://192.168.1.146:3000/api";
    ```
  * **Google Sheet ID:** The `SHEET_ID` in `server.js` must match the new Google Sheet used for the database (`1QaR4IKWUIS_p6l-vikgyZ_G51fELo7tqzlLI07aZXdA`).

### 2\. Default Login Credentials

  * **Admin Username:** `ADMIN`
  * **Admin Password:** `0000`

-----

## ⚠️ Troubleshooting (Node.js Server)

If the server fails to start or the Login hangs, check the Node.js Terminal output:

| Issue in Terminal | Possible Cause | Fix |
| :--- | :--- | :--- |
| **`Error: Cannot find module 'googleapis'`** | Dependency missing or outdated installation. | Run `npm install googleapis` then `npm install` again. |
| **`Invalid Credentials`** | The Service Account Key file is missing, misnamed, or the Service Account email was not shared with the Google Sheet. | Verify the JSON key file name in `server.js` and ensure the Service Account has **Editor** access to the Sheet. |
| **`Nginx Failed`** | Port 80 is in use (e.g., by Apache2). | Run `sudo service apache2 stop` before running `sudo service nginx restart`. |