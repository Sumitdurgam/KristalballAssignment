# Military Asset Management System

A comprehensive system to manage the movement, assignment, and expenditure of critical military assets across multiple bases with role-based access control and audit logging.

## Project Structure

```
KristalballAssignment/
├── backend/
│   ├── models/              # MongoDB schemas
│   ├── controllers/         # API business logic
│   ├── routes/             # API endpoints
│   ├── middleware/         # Authentication, RBAC, Logging
│   ├── db.js              # Database connection
│   ├── server.js          # Express server setup
│   ├── package.json       # Backend dependencies
│   └── .env.example       # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── pages/         # React page components
│   │   ├── components/    # Reusable components
│   │   ├── services/      # API calls
│   │   ├── context/       # React context for auth
│   │   ├── App.jsx        # Main app component
│   │   └── index.js       # Entry point
│   └── package.json       # Frontend dependencies
└── README.md              # This file
```

## Backend Architecture

### Technology Stack
- **Runtime:** Node.js
- **Framework:** Express.js (v4.18.2)
- **Database:** MongoDB (mongoose v7.0.0)
- **Authentication:** JWT (jsonwebtoken v9.0.0)
- **Password Hashing:** bcryptjs
- **Logging:** Morgan
- **Environment:** dotenv

### Database Models

#### User Model
- Stores user credentials and role information
- Roles: Admin, BaseCommander, LogisticsOfficer
- Each user linked to a base (except Admin)
- Password hashing using bcryptjs

#### Base Model
- Represents military bases
- Fields: name, location, commanderId, isActive

#### Asset Model
- Core inventory item
- Types: Vehicle, Weapon, Ammunition, Equipment, Other
- Tracks opening balance and current balance
- Unit measurement (units, kg, liters, rounds)

#### Purchase Model
- Records asset purchases
- Fields: asset, base, quantity, cost, vendor, purchaseOrder, date
- Linked to recording user for accountability

#### Transfer Model
- Manages asset transfers between bases
- Status: Pending, InTransit, Delivered, Cancelled
- Tracks initiating and approving users
- Updates balances on approval

#### Assignment Model
- Assigns assets to personnel
- Tracks assignment date and person
- Records assigning authority

#### Expenditure Model
- Records asset consumption/usage
- Reasons: Combat, Training, Maintenance, Loss, Damage, Other
- Deducts from asset balance immediately

#### AuditLog Model
- Complete transaction history
- Fields: userId, action, module, resourceId, timestamp, IP address
- Used for compliance and tracking

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Create new user (Admin only)
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### Purchases
- `POST /api/purchases` - Create purchase
- `GET /api/purchases` - List purchases (with filters)
- `GET /api/purchases/:id` - Get purchase details
- `PUT /api/purchases/:id` - Update purchase
- `DELETE /api/purchases/:id` - Delete purchase

#### Transfers
- `POST /api/transfers` - Initiate transfer
- `GET /api/transfers` - List transfers (with filters)
- `GET /api/transfers/:id` - Get transfer details
- `PATCH /api/transfers/:id/approve` - Approve transfer
- `PUT /api/transfers/:id` - Update transfer
- `DELETE /api/transfers/:id` - Delete transfer

#### Assignments
- `POST /api/assignments` - Create assignment
- `GET /api/assignments` - List assignments (with filters)
- `GET /api/assignments/:id` - Get assignment details
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment

#### Expenditures
- `POST /api/expenditures` - Record expenditure
- `GET /api/expenditures` - List expenditures (with filters)
- `GET /api/expenditures/:id` - Get expenditure details
- `PUT /api/expenditures/:id` - Update expenditure
- `DELETE /api/expenditures/:id` - Delete expenditure

#### Dashboard
- `GET /api/dashboard/metrics` - Get key metrics
- `GET /api/dashboard/net-movement-details` - Get detailed net movement breakdown
- `GET /api/dashboard/bases` - List all bases
- `GET /api/dashboard/asset-types` - Get asset types

### Role-Based Access Control (RBAC)

#### Admin
- Full access to all features
- Can manage all bases and users
- Can approve all transfers
- View all audit logs

#### Base Commander
- Access to their assigned base only
- Can manage purchases, transfers, assignments for their base
- Can approve transfers for their base

#### Logistics Officer
- Limited access
- Can create/view purchases and transfers for their base
- Cannot approve transfers or manage assignments

### Middleware

1. **Authentication** (`middleware/auth.js`)
   - JWT token verification
   - Token generation on login
   - User attachment to request

2. **RBAC** (`middleware/rbac.js`)
   - Role-based authorization
   - Base-level access control

3. **Logging** (`middleware/logger.js`)
   - Audit trail for all transactions
   - Records user, action, timestamp, IP address

## Frontend Architecture

### Technology Stack
- **Library:** React 19.0.0
- **Routing:** React Router v7.12.0
- **HTTP Client:** Axios
- **UI Framework:** Material-UI (MUI)
- **Charts:** Recharts
- **Date Handling:** date-fns

### Key Features

#### Authentication
- Login page with email/password
- JWT token stored in localStorage
- Automatic logout on token expiration
- Protected routes

#### Dashboard
- Real-time metrics display:
  - Opening Balance
  - Closing Balance
  - Net Movement (Purchases + Transfer In - Transfer Out)
  - Assigned Assets
  - Expended Assets
  - Purchases
  - Transfer In/Out

- Advanced Filters:
  - By Base
  - By Asset Type
  - By Date Range

- **Bonus Feature:** Click on Net Movement card to view detailed breakdown

#### Purchases Page
- Record new purchases with vendor and cost tracking
- View purchase history
- Filter by date, base, and asset type
- Edit/delete functionality
- Automatic PO number generation

#### Transfers Page
- Initiate transfers between bases
- Track transfer status (Pending, InTransit, Delivered, Cancelled)
- Approve transfers (Base Commanders only)
- Complete audit trail
- Edit pending transfers
- Delete capability

#### Assignments & Expenditures
- Tabbed interface for managing both features
- Assign assets to personnel
- Record expenditures with reason tracking
- Track expenditure history
- Edit/delete functionality
- Base filtering

#### Responsive Design
- Mobile-friendly layout
- Adaptive navigation (drawer on mobile)
- Touch-optimized buttons and controls
- Grid-based responsive layout

## Setup Instructions

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with:
   - `MONGO_URI`: MongoDB connection string
   - `JWT_SECRET`: Secret key for JWT (change in production!)
   - `PORT`: Server port (default: 5000)

3. **Start MongoDB**
   - Ensure MongoDB is running on `localhost:27017`
   - Or update `MONGO_URI` in `.env`

4. **Run Server**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```
   - Application opens at `http://localhost:3000`

## Default Test Credentials

```
Email: admin@military.com
Password: password123
Role: Admin
```

*Note: Create additional users through the registration endpoint as needed*

## Database Design Rationale

### Why MongoDB?
1. **Flexible Schema** - Easy to extend asset types and properties
2. **Scalability** - Horizontal scaling for large datasets
3. **Document Model** - Natural fit for audit logging
4. **Indexes** - Excellent performance for date-range queries
5. **Relationships** - Mongoose provides foreign key-like references

### Key Design Decisions

1. **Denormalized Audit Logs**
   - Separate collection for complete transaction history
   - Enables efficient historical queries
   - Supports compliance requirements

2. **Balance Tracking**
   - Current balance updated on each transaction
   - Audit log preserves all changes
   - Enables accurate reconciliation

3. **Status Workflow**
   - Transfers have workflow status (Pending → Delivered)
   - Prevents unauthorized balance updates
   - Enables approval workflow

4. **User Tracking**
   - Every transaction records user ID
   - Enables accountability
   - Supports RBAC enforcement

## Security Features

1. **Password Security**
   - bcryptjs hashing with 10 salt rounds
   - Never stored in plain text

2. **JWT Authentication**
   - 24-hour token expiration
   - Secure payload encoding
   - Automatic logout on expiration

3. **RBAC Enforcement**
   - Middleware checks at every route
   - Base-level access control
   - Role-based feature availability

4. **Audit Logging**
   - All create, update, delete operations logged
   - Includes timestamp, user, IP address
   - Immutable audit trail

5. **Error Handling**
   - Validation on both frontend and backend
   - Proper HTTP status codes
   - No sensitive data in error messages

6. **CORS Protection**
   - Configured for specific origin in production
   - Prevents unauthorized cross-origin access

## Deployment Considerations

### Backend
1. Set strong `JWT_SECRET` in production
2. Configure `MONGO_URI` for production MongoDB
3. Use environment-specific `.env` files
4. Enable HTTPS/TLS
5. Configure proper CORS origins
6. Use reverse proxy (nginx) for API
7. Enable rate limiting for auth endpoints

### Frontend
1. Build for production: `npm run build`
2. Configure API endpoint for production
3. Enable gzip compression
4. Implement CDN for static assets
5. Configure proper cache headers

## Testing

### API Testing with Curl
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@military.com","password":"password123"}'

# Get Dashboard Metrics
curl -X GET http://localhost:5000/api/dashboard/metrics \
  -H "Authorization: Bearer <token>"
```

## Future Enhancements

1. **Analytics Dashboard**
   - Trend analysis for asset usage
   - Predictive analytics for reorders
   - Cost analysis reports

2. **Advanced Features**
   - Batch transfers
   - Scheduled maintenance alerts
   - Asset lifecycle tracking

3. **Integration**
   - Integration with procurement systems
   - Real-time inventory sync
   - ERP system integration

4. **Mobile App**
   - Native mobile application
   - Offline sync capability
   - QR code scanning for assets

## Support & Maintenance

- Monitor server logs for errors
- Regularly backup MongoDB
- Review audit logs monthly
- Update dependencies quarterly
- Perform security audits annually

## License

This project is developed for military asset management. Restricted to authorized personnel only.

---

**Version:** 1.0.0  
**Last Updated:** January 2026
