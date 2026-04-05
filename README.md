# RoomFix - Hostel Complaint Management System

**RoomFix** is a high-performance, minimalist, and student-centric hostel maintenance request system designed to streamline the communication between students and hostel administration. 

Built with **AngularJS**, **Node.js**, and **MongoDB**, RoomFix offers a seamless and professional interface for reporting issues and managing hostel facilities.

---

## 🏗️ Project Architecture

RoomFix follows a classic **Single Page Application (SPA)** architecture for a fast and reactive user experience.

1.  **Frontend (AngularJS 1.x)**: 
    - The client-side logic is handled by a single AngularJS module (`roomfixApp`).
    - **Routing**: `ngRoute` manages navigation without page reloads.
    - **Controllers**: Dedicated controllers for Login, Registration, Student Dashboard, Admin Panel, and Complaint Submission.
    - **Service Layer**: A centralized `DataService` handles all `$http` requests to the backend.
2.  **Backend (Node.js & Express)**:
    - A RESTful API provides endpoints for data manipulation and authentication.
    - Uses **Express 5.x** for routing and middle-ware.
    - Serves static files and templates from the project root and `views/`.
3.  **Database (MongoDB Atlas)**:
    - A cloud-hosted MongoDB Atlas instance provides scalable storage.
    - **Direct Driver Usage**: The application uses the official `mongodb` driver for high-performance data access.

---

## 📂 Project Structure & File Index

```text
roomfix/
├── css/
│   └── style.css            # Custom premium styling (Outfit font, modern cards, badges)
├── img/
│   └── logo.png             # Branding assets
├── js/
│   └── app.js               # Core AngularJS logic (Module, Config, Service, Controllers)
├── views/                   # HTML Templates for dynamic loading
│   ├── admin-dashboard.html # Admin portal for managing complaints & announcements
│   ├── complaint-form.html  # Student interface for filing new maintenance requests
│   ├── faq.html             # Support & Help documentation
│   ├── login.html           # Professional login interface
│   ├── profile.html         # User account summary
│   ├── register.html        # Smart registration with auto-email generation
│   └── student-dashboard.html # Student overview & real-time notice alerts
├── index.html               # Main SPA shell (Includes dependencies & sidebar)
├── package.json             # Manifest & dependencies
└── server.js                # Core API Server & MongoDB connection logic
```

---

## 🗄️ Database Schema & Object Models

### 👤 User Object
- `name`: Full name of the student or admin.
- `email`: Official NMIMS email address.
- `password`: Hashed or plain-text password (based on sapid for students).
- `sapid`: 11-digit SAP ID.
- `role`: 'student' or 'admin'.
- `room`: Assigned hostel room number.
- `registeredAt`: Timestamp of account creation.

### 🛠️ Complaint Object
- `studentName`: Reporter's name.
- `email`: Reporter's contact email.
- `room`: Origin room of the complaint.
- `category`: Classification (Electrical, Plumbing, WiFi, etc.).
- `description`: Detailed issue explanation.
- `urgency`: Priority level (Low, Medium, High).
- `status`: Current state (Pending, In Progress, Resolved).
- `submittedAt`: Formatted submission date.
- `imageData`: Base64 encoded string of the uploaded photo.
- `imageName`: Original filename of the upload.

### 📢 Notice Object
- `title`: Announcement content.
- `date`: Publication date.

---

## 🌐 API Documentation

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/checkEmail` | `GET` | Verifies if an email is already registered. |
| `/api/register` | `POST` | Creates a new student user profile. |
| `/api/login` | `POST` | Authenticates users and returns profile data. |
| `/api/complaints` | `GET` | Fetches complaints (filtered by user if student). |
| `/api/complaints` | `POST` | Submits a new maintenance request. |
| `/api/complaints/:id` | `PUT` | Updates the status of a specific complaint (Admin). |
| `/api/students` | `GET` | Lists all registered students (Admin). |
| `/api/notices` | `GET` | Returns all active announcements. |
| `/api/notices` | `POST` | Publishes a new announcement (Admin). |
| `/api/notices/:id` | `DELETE` | Removes an announcement (Admin). |

---

## ⚙️ Installation & Deployment

### 1. Prerequisites
- **Node.js** (v16.x or higher recommended)
- **MongoDB Atlas** Account (for cloud storage)

### 2. Local Setup
1.  **Clone Source**:
    ```bash
    git clone [your-repository-url]
    cd roomfix
    ```
2.  **Install Packages**:
    ```bash
    npm install
    ```
3.  **Configure Database**:
    - Update the `uri` variable in `server.js` with your MongoDB Atlas connection string.
    - *Optional*: Move the URI to a `.env` file for production safety.
4.  **Run Application**:
    ```bash
    npm start
    ```
5.  **Access URL**: Navigate to `http://localhost:3000`.

---

## 🛡️ Security Best Practices
- **Data Privacy**: Student email addresses and SAP IDs are kept confidential.
- **Role-Based Access**: Front-end routes and back-end APIs are separated by role logic.
- **Image Handling**: Maximum file size limit (10MB) applied to prevent server overload.

---
*Developed for Academic Implementation - 2026. Created by Antigravity AI Assistant.*
