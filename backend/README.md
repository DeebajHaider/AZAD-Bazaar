# AZAD-Bazaar Backend (auth)

This backend provides a simple OTP-based authentication flow (no passwords) and uses MongoDB for storage.

Key points
- Default database: test
- OTPs are currently logged to the server console (placeholder for real SMS provider).
- JWT tokens are issued for 90 days after successful verification.

Environment
- Create a `.env` file in `backend/` with at least:
  - `MONGO_URI` — your MongoDB connection string (e.g. `mongodb://localhost:27017` or `mongodb+srv://user:pass@host/dbname`). 
  - `JWT_SECRET` — a strong secret used to sign JWTs.
  - (optional) `PORT` — defaults to `5000`.

Quick start (PowerShell)
```powershell
cd backend
npm install
# create backend\.env with MONGO_URI and JWT_SECRET
node server.js
```

Endpoints
- POST /auth/request-otp
  - Body: { phone: string, isNewUser?: boolean }
  - If `isNewUser=true` the endpoint will check that no Customer exists and will issue an OTP for signup.
  - If omitted or false, it will require an existing Customer with that phone (login flow).

- POST /auth/verify-otp
  - Body: { phone: string, code: string }
  - Verifies OTP, creates/links a `User` document and returns a JWT: { success: true, token, user }

- GET /auth/me
  - Protected. Requires header `Authorization: Bearer <token>`; returns basic user info.

Testing notes
- The current `backend/utils/sendOtp.js` simply console.logs the OTP for testing.
- For login flow (`isNewUser` omitted), ensure a `customers` document exists with the phone number (you can seed one via `mongosh`).

Production notes / suggestions
- Replace `sendOtp` with a real SMS provider (Twilio, Vonage, etc.).
- Add rate limiting on `/auth/request-otp` to prevent abuse.
- Hash OTPs in the DB instead of storing plaintext.
- Create collection validators and indexes in MongoDB (the code will create collections automatically when inserting documents; for production prefer explicit collection creation and indexes).

Files added/changed for auth
- `routes/auth.js` — auth endpoints
- `models/User.js`, `models/Customer.js`, `models/Otp.js` — Mongoose models
- `middleware/authMiddleware.js` — JWT verification middleware
- `utils/otp.js`, `utils/sendOtp.js` — OTP generation and send placeholder
- `initDB.js` — updated to default DB name `AzadBazaar` if none provided in URI

If you want, I can add a small `scripts/seedCustomer.js` to insert a test Customer, or implement SMS provider wiring. Let me know which you'd prefer next.
