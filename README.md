# Faculty Ledger

Faculty Ledger is a complete submission for the full-stack intern task. It includes:

- a `CodeIgniter 4` backend
- a `React + Vite` frontend
- `MySQL` schema and dump files
- bearer-token authentication
- separate `auth_user` and `teachers` tables with a `1:1` relationship
- a single protected POST API that creates linked records in both tables
- separate React pages for auth, dashboard, `auth_user` data, and `teachers` data

## Requirement Coverage

- `Create a Codeigniter application`: implemented in [backend](/Users/armaanbudhiraja/Documents/Playground/interview-task/backend)
- `Register, Login APIs`: `POST /api/register`, `POST /api/login`
- `Token based authentication`: bearer token required for all protected APIs
- `Use PgSql or MySql`: implemented with `MySQL`
- `Create auth_user and teachers with 1:1 relationship`: handled by migrations and schema export
- `Single POST API to push data into both tables`: `POST /api/teacher-records`
- `ReactJS Application`: implemented in [frontend](/Users/armaanbudhiraja/Documents/Playground/interview-task/frontend)
- `Datatables in separate pages`: `Auth Users` and `Teachers` pages in the frontend
- `Database export files`: included in [database/mysql/schema.sql](/Users/armaanbudhiraja/Documents/Playground/interview-task/database/mysql/schema.sql) and [database/mysql/faculty_ledger_dump.sql](/Users/armaanbudhiraja/Documents/Playground/interview-task/database/mysql/faculty_ledger_dump.sql)

## Project Structure

- [backend](/Users/armaanbudhiraja/Documents/Playground/interview-task/backend): CodeIgniter API, migrations, models, filters, controllers
- [frontend](/Users/armaanbudhiraja/Documents/Playground/interview-task/frontend): React interface and data-table pages
- [database/mysql](/Users/armaanbudhiraja/Documents/Playground/interview-task/database/mysql): SQL schema plus a verified dump with sample data

## API Endpoints

### Public

- `POST /api/register`
- `POST /api/login`

### Protected

Pass `Authorization: Bearer <token>`

- `GET /api/me`
- `POST /api/logout`
- `GET /api/auth-users`
- `GET /api/teachers`
- `POST /api/teacher-records`

## Database Files

- [schema.sql](/Users/armaanbudhiraja/Documents/Playground/interview-task/database/mysql/schema.sql): schema-only setup
- [faculty_ledger_dump.sql](/Users/armaanbudhiraja/Documents/Playground/interview-task/database/mysql/faculty_ledger_dump.sql): full export with verified sample records

### Demo Accounts Included In Dump

- `qa03282120@example.com` / `Password123`
- `teacher03282120@example.com` / `Password123`

## Run The Project

### 1. Restore or create the database

Option A: import the verified dump

```bash
mysql -h127.0.0.1 -P3306 -uroot < database/mysql/faculty_ledger_dump.sql
```

If you still prefer selecting the database explicitly, this also works:

```bash
mysql -h127.0.0.1 -P3306 -uroot faculty_ledger < database/mysql/faculty_ledger_dump.sql
```

Option B: create from schema and migrations

```bash
mysql -h127.0.0.1 -P3306 -uroot < database/mysql/schema.sql
cd backend
cp .env.example .env
php spark migrate
```

## 2. Start the backend

```bash
cd /Users/armaanbudhiraja/Documents/Playground/interview-task/backend
php spark serve --host 127.0.0.1 --port 8080
```

Backend URL:

- `http://127.0.0.1:8080`

## 3. Start the frontend

```bash
cd /Users/armaanbudhiraja/Documents/Playground/interview-task/frontend
cp .env.example .env
npm install
npm run dev
```

Frontend URL:

- `http://127.0.0.1:5173`

## Key Backend Files

- [Routes.php](/Users/armaanbudhiraja/Documents/Playground/interview-task/backend/app/Config/Routes.php)
- [AuthController.php](/Users/armaanbudhiraja/Documents/Playground/interview-task/backend/app/Controllers/Api/AuthController.php)
- [TeachersController.php](/Users/armaanbudhiraja/Documents/Playground/interview-task/backend/app/Controllers/Api/TeachersController.php)
- [TokenAuthFilter.php](/Users/armaanbudhiraja/Documents/Playground/interview-task/backend/app/Filters/TokenAuthFilter.php)
- [CreateAuthUserTable.php](/Users/armaanbudhiraja/Documents/Playground/interview-task/backend/app/Database/Migrations/2026-03-28-000001_CreateAuthUserTable.php)
- [CreateTeachersTable.php](/Users/armaanbudhiraja/Documents/Playground/interview-task/backend/app/Database/Migrations/2026-03-28-000002_CreateTeachersTable.php)

## Key Frontend Files

- [App.jsx](/Users/armaanbudhiraja/Documents/Playground/interview-task/frontend/src/App.jsx)
- [api.js](/Users/armaanbudhiraja/Documents/Playground/interview-task/frontend/src/api.js)
- [styles.css](/Users/armaanbudhiraja/Documents/Playground/interview-task/frontend/src/styles.css)

## Verified Locally

- CodeIgniter routes loaded successfully
- MySQL database created and migrations applied successfully
- `POST /api/register` returned a bearer token
- `POST /api/login` returned a bearer token
- `GET /api/me` rejected invalid tokens and accepted valid ones
- `POST /api/teacher-records` created linked `auth_user` + `teachers` records
- `GET /api/auth-users` and `GET /api/teachers` returned the expected data
- React frontend completed a production build successfully
