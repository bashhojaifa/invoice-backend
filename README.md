# Node JS Project Setup

This guide will help you get started with running this Node js project locally.

## Installation

1. Clone the repository:

```bash
git clone git@github.com:bashhojaifa/invoice-backend.git
cd invoice-backend
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

## Environment Variables

Create a `.env` file in the root directory and add your environment variables:

```plaintext



PORT=3030

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USERNAME=root
MYSQL_PASSWORD=
MYSQL_DATABASE=

JWT_SECRET=

JWT_ACCESS_EXPIRATION=30d
JWT_REFRESH_EXPIRATION=15m



```

## Database Setup

After setting up the environment variables, create the database using MySQL. You can use the following example query:

```sql
CREATE DATABASE invoice_db;
```

Replace `invoice_db` with your desired database name, and make sure it matches the value set for `MYSQL_DATABASE` in your `.env` file.

Next, execute the MySQL schema to initialize the required tables for operation.

## Running the Project

### Development Mode

To run the project in development:

```bash
npm run dev
```

The application will be available at `http://localhost:3030`

To start the production server:

```bash
npm run start
# or
yarn start
```

## Initial Admin Setup

After the server is running, you need to create the initial admin user. Use the following API endpoint to register an admin:

```
POST http://localhost:3030/api/admin-register
```

Send the required admin details in the request body as JSON. Example:

```json
{
  "first_name": "",
  "last_name": "",
  "email": "",
  "password": "Min 6 Character"
}
```
