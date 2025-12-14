# 🌐 Medibook Frontend

**Medibook Frontend** is a modern, responsive web application built with **Angular** and **TypeScript**, designed to work seamlessly with the **Medibook API** backend. It provides an intuitive user interface for patients, doctors, nurses, and administrators to manage healthcare operations efficiently.

---

## 📑 Table of Contents

* Overview
* Technology Stack
* Features
* System Requirements
* Project Setup
* Development Server
* Code Scaffolding
* Build
* Testing
* Backend Integration
* Project Structure
* License

---

## 📌 Overview

The Medibook Frontend serves as the client-side application for the Medibook healthcare system. It communicates with the backend via RESTful APIs and provides role-based user experiences with secure authentication and real-time data updates.

---

## 🧰 Technology Stack

| Layer            | Technology            |
| ---------------- | --------------------- |
| Framework        | Angular 21            |
| Language         | TypeScript            |
| Styling          | CSS / SCSS            |
| State Management | Angular Services      |
| HTTP Client      | Angular HttpClient    |
| Authentication   | JWT (via Backend API) |
| Tooling          | Angular CLI           |

---

## ✨ Features

* User authentication (JWT-based)
* Role-based dashboards (Admin / Doctor / Nurse / Patient)
* Appointment booking & management
* Doctor & nurse listings
* Feedback & reviews system
* Notifications center
* Responsive UI for desktop & mobile
* Secure API communication

---

## ⚙️ System Requirements

* Node.js **v18+** (recommended)
* npm **v9+** or yarn
* Angular CLI **v21.0.0**
* Modern web browser (Chrome, Edge, Firefox)

---

## 🚀 Project Setup

### 1️⃣ Clone the Repository

```bash
git clone <frontend-repository-url>
cd MedibookFrontEnd
```

### 2️⃣ Install Dependencies

```bash
npm install
```

---

## 🖥️ Development Server

Start the local development server:

```bash
ng serve
```

Open your browser and navigate to:

```
http://localhost:4200/
```

The application will automatically reload when you modify any source file.

---

## 🧩 Code Scaffolding

Angular CLI provides powerful scaffolding tools.

Generate a new component:

```bash
ng generate component component-name
```

Other schematics include:

* components
* directives
* pipes
* services
* guards

To view all options:

```bash
ng generate --help
```

---

## 🏗️ Build

To build the project for production:

```bash
ng build
```

Build artifacts will be stored in the `dist/` directory. The production build is optimized for performance and speed.

---

## 🧪 Testing

### Unit Tests

Run unit tests using **Karma**:

```bash
ng test
```

### End-to-End Tests

```bash
ng e2e
```

Angular CLI does not include an e2e framework by default. You may integrate tools such as **Cypress** or **Playwright**.

---

## 🔗 Backend Integration

The frontend communicates with the **Medibook API** backend via HTTP requests.

Typical configuration is located in:

* `environment.ts`
* `environment.production.ts`

Example:

```ts
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7281/api'
};
```

---

## 📁 Project Structure (Simplified)

```
src/
 ├── app/
 │   ├── components/
 │   ├── services/
 │   ├── guards/
 │   ├── models/
 │   └── pages/
 ├── assets/
 ├── environments/
 └── styles/
```

---

## 📄 License

This frontend application is licensed and maintained by:

**© Abdelrahman Khalaf**

All rights reserved.

Unauthorized copying, modification, distribution, or use of this software is strictly prohibited without prior written permission from the author.
