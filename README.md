# Authentication Application

A simple authentication app with a React frontend and Node.js backend using MongoDB.

---

## 🚀 Getting Started

Follow these steps to run the project locally:

1. **Fork & Clone the Repository**
   - Click the `Fork` button on GitHub and clone the repo to your system.

2. **Install Dependencies**
   - Open a terminal and run the following commands in both the `Backend` and `Frontend` folders:
     ```bash
     npm install
     ```

3. **Configure MongoDB**
   - Open MongoDB Compass (or your preferred MongoDB client).
   - Create a new connection and copy the connection string.
   - Paste the connection string into `Backend/index.js` at line 8.

4. **Start the Application**
   - In one terminal, start the frontend:
     ```bash
     cd Frontend
     npm run dev
     ```
   - In another terminal, start the backend:
     ```bash
     cd Backend
     npm start
     ```

5. **Open the App**
   - Visit the local link provided by Vite (usually `http://localhost:5173`).
   - Test your application!

---

## 📁 Project Structure

```
Backend/
  index.js
  package.json
  models/
    SingUp.js
Frontend/
  src/
    components/
      Home.jsx
      Login.jsx
      Signup.jsx
    App.jsx
    main.jsx
  public/
  package.json
  vite.config.js
```

---

## 🛠️ Features
- User Signup & Login
- Password validation (strength & no spaces)
- Indian mobile number validation
- MongoDB integration

---

## 📚 Notes
- Make sure MongoDB is running locally or update the connection string for a remote database.
- For any issues, please open an issue or pull request.

---

**Happy Coding!**