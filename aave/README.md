# Aave Sample

This example shows how to integrate Openfort with Aave to create a DeFi application with lending and borrowing functionalities.

## Project Structure

```
samples/aave/
├── frontend/          # React application with Vite
├── backend/           # Express.js server
└── README.md         # This file
```

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Openfort account with configured API keys

## Configuration and Installation

### 1. Install Dependencies

Install dependencies for both frontend and backend:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment Variables

#### Backend (.env)

Copy the `.env.example` file to `.env` and fill in the necessary variables:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your values:

```env
# Openfort Shield Configuration
NEXT_PUBLIC_SHIELD_API_KEY=your_shield_api_key
NEXTAUTH_SHIELD_SECRET_KEY=your_shield_secret_key
NEXTAUTH_SHIELD_ENCRYPTION_SHARE=your_encryption_share

# Server Configuration
PORT=3001
CORS_ORIGIN=http://localhost:5173

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001
```

#### Frontend (.env)

Copy the `.env.example` file to `.env` and fill in the necessary variables:

```bash
cd ../frontend
cp .env.example .env
```

Edit the `.env` file with your values:

```env
# Openfort Configuration
VITE_OPENFORT_PUBLISHABLE_KEY=your_publishable_key
VITE_OPENFORT_SHIELD_PUBLIC_KEY=your_shield_public_key
VITE_BACKEND_URL=http://localhost:3001
VITE_OPENFORT_POLICY_ID=your_policy_id
```

## Running the Application

### 1. Start the Backend

```bash
cd backend
npm run dev
```

The backend server will run at `http://localhost:3001`

### 2. Start the Frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend application will run at `http://localhost:5173`

## Features

- **Wallet Connection**: Integration with Openfort Shield for authentication
- **Aave Interaction**: Lending and borrowing operations
- **Token Management**: Visualization of balances and transactions
- **User Interface**: Modern interface with React and Tailwind CSS

## Development

### Available Scripts

#### Backend
- `npm start`: Starts the server in production mode
- `npm run dev`: Starts the server with nodemon (development mode)

#### Frontend
- `npm run dev`: Starts the development server
- `npm run build`: Builds the application for production
- `npm run lint`: Runs the linter
- `npm run preview`: Previews the production build

## Troubleshooting

1. **CORS Error**: Make sure that `CORS_ORIGIN` in the backend matches the frontend URL
2. **Environment variables**: Verify that all environment variables are configured correctly
3. **Occupied ports**: If ports 3001 or 5173 are occupied, change them in the configuration files

## Additional Resources

- [Openfort Documentation](https://docs.openfort.xyz)
- [Aave Documentation](https://docs.aave.com)
- [React + Vite](https://vitejs.dev/guide/)