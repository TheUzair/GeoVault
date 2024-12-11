# GeoVault Application

A modern web application for managing delivery locations with secure user authentication, address management, and interactive map features.

## Enhanced Features

### Frontend
- **React with Vite**: High-performance and fast builds.
- **React Router DOM**: Smooth navigation between pages.
- **Leaflet with Google Maps API**: Rich and interactive map experiences.
- **Tailwind CSS**: Utility-first, customizable styling framework.
- **Framer Motion**: Enhanced animations and transitions.

### Backend
- **Node.js with Express**: Efficient and scalable server-side application.
- **MongoDB with Mongoose**: Flexible schema-based database management.
- **JWT Authentication**: Secure user sessions with JSON Web Tokens.
- **Bcrypt**: Password hashing for secure user credentials.
- **CORS Enabled**: Seamless frontend-backend communication.

---

## Key Features
- **User Authentication**: Secure registration and login system.
- **Interactive Map Integration**: View and set delivery locations on a map.
- **Address Management System**: Add, edit, delete, and mark favorite addresses.
- **Responsive Design**: Works seamlessly across devices.
- **Secure API Communication**: Data protection with JWT and HTTPS support.

---
## Additional Features
- **Favorite Locations**: Mark frequently used addresses as favorite
- **Address Validation**: Ensure the accuracy of the provided location (coming soon)
- **Map Preview**: To see a quick preview of the location

## Prerequisites

- **Node.js**: Latest LTS version.
- **MongoDB**: Locally or via MongoDB Atlas.
- **npm or yarn**: Package manager.
- **Google Maps API Key**: For map integration.

---

## Installation

### 1. Clone the Repository:
```bash
git clone https://github.com/TheUzair/GeoVault.git
```

### 2. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 3. Environment Setup

#### Backend (`.env`):
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

#### Frontend (`.env`):
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_API_URL=http://localhost:5000
```

### 4. Run the Application

#### Backend:
```bash
cd backend
npm start
```

#### Frontend:
```bash
cd frontend
npm run dev
```

- Frontend: **http://localhost:5173**
- Backend: **http://localhost:5000**

---

## API Endpoints

| Method | Endpoint               | Description            |
|--------|------------------------|------------------------|
| POST   | `/api/auth/register`   | User registration      |
| POST   | `/api/auth/login`      | User login             |
| GET    | `/api/addresses`       | Get user addresses     |
| POST   | `/api/addresses`       | Add new address        |
| PUT    | `/api/addresses/:id`   | Update address         |
| DELETE | `/api/addresses/:id`   | Delete address         |

---

## Project Structure
```
delivery-location-app/
├── frontend/
│   ├── src/
│   │   ├── pages/          # Pages for the application
│   │   ├── components/     # Reusable components
│   │   └── App.jsx         # Main application entry
│   └── package.json        # Frontend dependencies
└── backend/
    ├── routes/             # API routes
    ├── config/             # Configuration files
    ├── server.js           # Entry point for the server
    └── package.json        # Backend dependencies
```

---

## Contribution Guide

We welcome contributions! Follow these steps:

1. Fork the repository.
2. Create your feature branch: `git checkout -b feature-name`.
3. Commit your changes: `git commit -m "Description of changes"`.
4. Push to the branch: `git push origin feature-name`.
5. Open a Pull Request on the main repository.

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

Enjoy coding! 🚀