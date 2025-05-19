Absolutely! Here is the **entire** README file content **in one single markdown block**, perfectly formatted so you can **copy and paste once** directly into your GitHub README.md without needing to edit or reformat anything:

````markdown
# MERN Bug Tracker

A full-stack bug tracking application built with the **MERN stack** (MongoDB, Express.js, React, Node.js). This app allows teams to track, manage, and resolve bugs efficiently with user authentication, role-based access, bug assignments, real-time updates, and responsive design.

---

## Features

- User authentication (Login/Register)
- Create, Read, Update, and Delete bugs
- Assign bugs to team members
- Track bug status and priority
- User roles: Admin and User
- Real-time updates
- Responsive design for all devices

---

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

---

## Getting Started

### Clone the repository

```bash
git clone https://github.com/Morphiu/mern-bug-tracker.git
cd mern-bug-tracker
````

---

### Backend Setup

1. Navigate to the backend folder:

```bash
cd backend
```

2. Install backend dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend folder with the following variables:

```
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

Replace `your_mongodb_connection_string` and `your_jwt_secret_key` with your actual MongoDB URI and secret key.

---

### Frontend Setup

1. Navigate to the frontend folder:

```bash
cd ../frontend
```

2. Install frontend dependencies:

```bash
npm install
```

3. Create a `.env` file in the frontend folder with:

```
VITE_BASE_API_URL=http://localhost:5001
```

---

### Running the Application

Start the backend server:

```bash
cd backend
npm run dev
```

Start the frontend development server (in a new terminal):

```bash
cd frontend
npm run dev
```

---

### Access the Application

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend API: [http://localhost:5001](http://localhost:5001)

---

## Testing

### Backend Testing

Run unit tests:

```bash
cd backend
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

---

### Frontend Testing

Run unit tests:

```bash
cd frontend
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

---

## Debugging

### Backend Debugging

* Use console logging to track authentication, database operations, errors, and requests.
* Run backend with Node.js debugger:

```bash
npm run debug
```

* Use MongoDB Compass to inspect and debug database entries.

---

### Frontend Debugging

* Use React DevTools to inspect components.
* Use browser developer tools (Network tab for API calls, Console for errors, Application tab for storage).
* Use Redux DevTools if Redux is implemented.

---

## Common Issues & Solutions

* **Authentication Issues:** Check your `JWT_SECRET` and token storage in localStorage.
* **Database Connection:** Verify your MongoDB URI, service status, and network connection.
* **API Issues:** Confirm CORS configuration and API endpoint correctness.
* **Environment Variables:** Ensure `.env` files are correctly set up and loaded.

---

## Project Structure

```
mern-bug-tracker/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── config/
│   ├── tests/
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── services/
    │   └── utils/
    ├── tests/
    └── package.json
```

---
**Preview**
![PHOTO-2025-05-19-16-24-44](https://github.com/user-attachments/assets/9c3e704f-e1d7-4e0d-87e8-4145d3707bea)


---

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve this project.

---


Demo : https://mern-bug-tracker.vercel.app/
```


