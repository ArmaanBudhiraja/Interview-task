import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { api, getStoredToken, persistToken } from "./api";

const protectedRoutes = new Set([
  "/dashboard",
  "/auth-users",
  "/teachers",
  "/create-record",
]);

const authUserColumns = [
  { key: "id", label: "ID" },
  { key: "email", label: "Email" },
  { key: "first_name", label: "First name" },
  { key: "last_name", label: "Last name" },
  { key: "phone_number", label: "Phone" },
  {
    key: "created_at",
    label: "Created",
    render: (row) => formatDateTime(row.created_at),
  },
];

const teacherColumns = [
  { key: "id", label: "Teacher ID" },
  { key: "employee_code", label: "Employee code" },
  { key: "first_name", label: "First name" },
  { key: "last_name", label: "Last name" },
  { key: "email", label: "Email" },
  { key: "university_name", label: "University" },
  { key: "department", label: "Department" },
  {
    key: "gender",
    label: "Gender",
    render: (row) => humanizeGender(row.gender),
  },
  { key: "year_joined", label: "Year joined" },
  { key: "qualification", label: "Qualification" },
];

function normalizeRoute(hash) {
  const route = hash.replace(/^#/, "") || "/auth";

  return route.startsWith("/") ? route : `/${route}`;
}

function formatDateTime(value) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function humanizeGender(value) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getCoverage(authUsers, teachers) {
  if (!authUsers.length) {
    return 0;
  }

  return Math.round((teachers.length / authUsers.length) * 100);
}

function App() {
  const [route, setRoute] = useState(() => normalizeRoute(window.location.hash));
  const [token, setToken] = useState(() => getStoredToken());
  const [sessionUser, setSessionUser] = useState(null);
  const [authUsers, setAuthUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [booting, setBooting] = useState(Boolean(getStoredToken()));
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const onHashChange = () => {
      startTransition(() => {
        setRoute(normalizeRoute(window.location.hash));
      });
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (!token) {
      setBooting(false);
      setSessionUser(null);
      setAuthUsers([]);
      setTeachers([]);

      if (protectedRoutes.has(route)) {
        navigate("/auth");
      }

      return;
    }

    bootstrapSession(token);
  }, []);

  useEffect(() => {
    if (!token && protectedRoutes.has(route)) {
      navigate("/auth");
    }

    if (token && sessionUser && route === "/auth") {
      navigate("/dashboard");
    }
  }, [route, token, sessionUser]);

  async function bootstrapSession(activeToken) {
    setBooting(true);

    try {
      const [meResponse, authUsersResponse, teachersResponse] = await Promise.all([
        api.me(activeToken),
        api.authUsers(activeToken),
        api.teachers(activeToken),
      ]);

      setSessionUser(meResponse.user);
      setAuthUsers(authUsersResponse.data);
      setTeachers(teachersResponse.data);
    } catch (error) {
      clearSession();
      setNotice({
        tone: "error",
        text: "Your saved token is no longer valid. Please sign in again.",
      });
    } finally {
      setBooting(false);
    }
  }

  async function refreshCollections(activeToken = token) {
    const [authUsersResponse, teachersResponse] = await Promise.all([
      api.authUsers(activeToken),
      api.teachers(activeToken),
    ]);

    setAuthUsers(authUsersResponse.data);
    setTeachers(teachersResponse.data);
  }

  function navigate(nextRoute) {
    const normalized = nextRoute.startsWith("/") ? nextRoute : `/${nextRoute}`;
    window.location.hash = normalized;
    setRoute(normalized);
  }

  function clearSession() {
    persistToken("");
    setToken("");
    setSessionUser(null);
    setAuthUsers([]);
    setTeachers([]);
    startTransition(() => {
      navigate("/auth");
    });
  }

  async function handleAuthentication(mode, payload) {
    const response = mode === "login"
      ? await api.login(payload)
      : await api.register(payload);

    persistToken(response.token);
    setToken(response.token);
    await bootstrapSession(response.token);

    setNotice({
      tone: "success",
      text:
        mode === "login"
          ? "Signed in successfully. Protected routes are now unlocked."
          : "Registration complete. Your bearer token is active.",
    });

    startTransition(() => {
      navigate("/dashboard");
    });
  }

  async function handleCreateTeacherRecord(payload) {
    await api.createTeacherRecord(payload, token);
    await refreshCollections(token);

    setNotice({
      tone: "success",
      text: "Linked auth user and teacher records were created in one request.",
    });

    startTransition(() => {
      navigate("/teachers");
    });
  }

  async function handleLogout() {
    try {
      if (token) {
        await api.logout(token);
      }
    } catch {
      // Best effort logout keeps the UI usable even if the token is already invalid.
    } finally {
      clearSession();
      setNotice({
        tone: "success",
        text: "Your session token has been cleared.",
      });
    }
  }

  const coverage = getCoverage(authUsers, teachers);

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      {notice ? (
        <div className={`notice notice-${notice.tone}`}>
          <span>{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)}>
            Dismiss
          </button>
        </div>
      ) : null}

      {booting ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Refreshing your protected session...</p>
        </div>
      ) : null}

      {!token ? (
        <AuthView onAuthenticate={handleAuthentication} />
      ) : (
        <main className="workspace">
          <aside className="sidebar">
            <p className="eyebrow">Interview task build</p>
            <h1>Faculty Ledger</h1>
            <p className="sidebar-copy">
              A React + CodeIgniter portal for bearer-token auth, linked user and
              teacher records, and separate table views for both database tables.
            </p>

            <nav className="sidebar-nav">
              <NavLink route={route} href="/dashboard" label="Dashboard" />
              <NavLink route={route} href="/auth-users" label="Auth Users" />
              <NavLink route={route} href="/teachers" label="Teachers" />
              <NavLink route={route} href="/create-record" label="Create Record" />
            </nav>

            <div className="token-card">
              <span className="pill">Bearer token</span>
              <code>{token.slice(0, 18)}...</code>
              <p>This token is sent with every protected API request.</p>
            </div>

            <button className="ghost-button" type="button" onClick={handleLogout}>
              Log out
            </button>
          </aside>

          <section className="content-panel">
            {route === "/dashboard" ? (
              <DashboardView
                coverage={coverage}
                authUsers={authUsers}
                teachers={teachers}
                sessionUser={sessionUser}
                token={token}
              />
            ) : null}

            {route === "/auth-users" ? (
              <DataTableView
                title="Auth Users"
                description="All rows from the auth_user table, excluding sensitive token and password fields."
                rows={authUsers}
                columns={authUserColumns}
                emptyMessage="Register a user or create a teacher account to populate this table."
              />
            ) : null}

            {route === "/teachers" ? (
              <DataTableView
                title="Teachers"
                description="Teacher rows joined with related auth_user information for a friendlier admin view."
                rows={teachers}
                columns={teacherColumns}
                emptyMessage="Create a linked teacher record to populate this table."
              />
            ) : null}

            {route === "/create-record" ? (
              <CreateRecordView onSubmit={handleCreateTeacherRecord} />
            ) : null}
          </section>
        </main>
      )}
    </div>
  );
}

function NavLink({ href, label, route }) {
  return (
    <a className={route === href ? "nav-link active" : "nav-link"} href={`#${href}`}>
      {label}
    </a>
  );
}

function AuthView({ onAuthenticate }) {
  const [mode, setMode] = useState("login");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState(null);
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone_number: "",
  });

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    setFieldErrors(null);

    try {
      await onAuthenticate(mode, form);
    } catch (error) {
      setErrorMessage(error.message);
      setFieldErrors(error.details);
    } finally {
      setSubmitting(false);
    }
  }

  function updateField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  return (
    <main className="auth-layout">
      <section className="hero-panel">
        <p className="eyebrow">Full-stack developer intern task</p>
        <h1>
          CodeIgniter API,
          <br />
          React interface,
          <br />
          linked teacher records.
        </h1>
        <p className="hero-copy">
          This build covers registration, login, bearer-token protected routes,
          a single POST request that writes into both required tables, and
          separate data-table screens for `auth_user` and `teachers`.
        </p>

        <div className="feature-grid">
          <FeatureCard
            title="Register + Login APIs"
            text="Public endpoints create users and return a token-backed authenticated session."
          />
          <FeatureCard
            title="Protected Data Flows"
            text="Every management screen depends on a bearer token and protected API responses."
          />
          <FeatureCard
            title="1:1 Teacher Link"
            text="The create-record screen inserts matching auth_user and teachers rows in one request."
          />
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-toggle">
          <button
            type="button"
            className={mode === "login" ? "toggle-button active" : "toggle-button"}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "register" ? "toggle-button active" : "toggle-button"}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form className="stack-form" onSubmit={handleSubmit}>
          <Field
            label="Email"
            value={form.email}
            onChange={(value) => updateField("email", value)}
            placeholder="you@example.com"
            type="email"
          />

          {mode === "register" ? (
            <div className="split-fields">
              <Field
                label="First name"
                value={form.first_name}
                onChange={(value) => updateField("first_name", value)}
                placeholder="Aarav"
              />
              <Field
                label="Last name"
                value={form.last_name}
                onChange={(value) => updateField("last_name", value)}
                placeholder="Sharma"
              />
            </div>
          ) : null}

          {mode === "register" ? (
            <Field
              label="Phone number"
              value={form.phone_number}
              onChange={(value) => updateField("phone_number", value)}
              placeholder="+91 98765 43210"
            />
          ) : null}

          <Field
            label="Password"
            value={form.password}
            onChange={(value) => updateField("password", value)}
            placeholder="Minimum 8 characters"
            type="password"
          />

          {errorMessage ? (
            <ErrorSummary message={errorMessage} details={fieldErrors} />
          ) : null}

          <button className="primary-button" disabled={submitting} type="submit">
            {submitting
              ? "Working..."
              : mode === "login"
                ? "Unlock protected pages"
                : "Create account and token"}
          </button>
        </form>
      </section>
    </main>
  );
}

function DashboardView({ authUsers, coverage, sessionUser, teachers, token }) {
  const endpointRows = [
    {
      label: "GET /api/me",
      detail: "Validates the bearer token and returns the signed-in user.",
    },
    {
      label: "GET /api/auth-users",
      detail: "Returns the auth_user table for the separate data-table page.",
    },
    {
      label: "GET /api/teachers",
      detail: "Returns teacher records joined to their linked auth_user profile.",
    },
    {
      label: "POST /api/teacher-records",
      detail: "Creates matching auth_user and teachers records in one request.",
    },
  ];

  return (
    <div className="page-layout">
      <header className="page-header">
        <div>
          <p className="eyebrow">Protected overview</p>
          <h2>Dashboard</h2>
        </div>
        <p className="page-copy">
          The session below was loaded from the protected `/api/me` endpoint
          using the stored bearer token.
        </p>
      </header>

      <section className="stats-grid">
        <StatCard label="Auth users" value={authUsers.length} accent="amber" />
        <StatCard label="Teachers" value={teachers.length} accent="teal" />
        <StatCard label="Relationship coverage" value={`${coverage}%`} accent="rose" />
      </section>

      <section className="detail-grid">
        <article className="panel-card">
          <span className="pill">Authenticated user</span>
          <h3>
            {sessionUser?.first_name} {sessionUser?.last_name}
          </h3>
          <p>{sessionUser?.email}</p>
          <p>{sessionUser?.phone_number}</p>
        </article>

        <article className="panel-card">
          <span className="pill">Token preview</span>
          <code>{token}</code>
          <p>
            Stored locally and sent as an `Authorization: Bearer ...` header to
            every protected route.
          </p>
        </article>
      </section>

      <article className="panel-card endpoint-panel">
        <span className="pill">Protected API surface</span>
        <div className="endpoint-list">
          {endpointRows.map((row) => (
            <div className="endpoint-row" key={row.label}>
              <strong>{row.label}</strong>
              <p>{row.detail}</p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

function DataTableView({ columns, description, emptyMessage, rows, title }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const filteredRows = rows.filter((row) =>
    JSON.stringify(row).toLowerCase().includes(deferredQuery.trim().toLowerCase()),
  );

  return (
    <div className="page-layout">
      <header className="page-header">
        <div>
          <p className="eyebrow">Separate data-table page</p>
          <h2>{title}</h2>
        </div>
        <p className="page-copy">{description}</p>
      </header>

      <div className="table-toolbar">
        <input
          className="search-input"
          placeholder="Search across the table..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <span className="pill">{filteredRows.length} visible rows</span>
      </div>

      <div className="table-shell">
        {filteredRows.length ? (
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={`${title}-${row.id}`}>
                  {columns.map((column) => (
                    <td key={column.key}>
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">{emptyMessage}</div>
        )}
      </div>
    </div>
  );
}

function CreateRecordView({ onSubmit }) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState(null);
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    university_name: "",
    gender: "male",
    year_joined: "2024",
    department: "",
    employee_code: "",
    qualification: "",
  });

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    setFieldErrors(null);

    try {
      await onSubmit(form);
      setForm({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        phone_number: "",
        university_name: "",
        gender: "male",
        year_joined: "2024",
        department: "",
        employee_code: "",
        qualification: "",
      });
    } catch (error) {
      setErrorMessage(error.message);
      setFieldErrors(error.details);
    } finally {
      setSubmitting(false);
    }
  }

  function updateField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  return (
    <div className="page-layout">
      <header className="page-header">
        <div>
          <p className="eyebrow">Linked record creation</p>
          <h2>Create Teacher Record</h2>
        </div>
        <p className="page-copy">
          This single protected POST request writes into both `auth_user` and
          `teachers` while preserving the required one-to-one relationship.
        </p>
      </header>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="split-fields">
          <Field
            label="First name"
            value={form.first_name}
            onChange={(value) => updateField("first_name", value)}
            placeholder="Mira"
          />
          <Field
            label="Last name"
            value={form.last_name}
            onChange={(value) => updateField("last_name", value)}
            placeholder="Kapoor"
          />
        </div>

        <div className="split-fields">
          <Field
            label="Email"
            value={form.email}
            onChange={(value) => updateField("email", value)}
            placeholder="mira@facultyledger.dev"
            type="email"
          />
          <Field
            label="Phone number"
            value={form.phone_number}
            onChange={(value) => updateField("phone_number", value)}
            placeholder="+91 90000 12345"
          />
        </div>

        <div className="split-fields">
          <Field
            label="Password"
            value={form.password}
            onChange={(value) => updateField("password", value)}
            placeholder="Temporary password"
            type="password"
          />
          <Field
            label="Employee code"
            value={form.employee_code}
            onChange={(value) => updateField("employee_code", value)}
            placeholder="FAC-2048"
          />
        </div>

        <div className="split-fields">
          <Field
            label="University name"
            value={form.university_name}
            onChange={(value) => updateField("university_name", value)}
            placeholder="Vellore Institute of Technology"
          />
          <Field
            label="Department"
            value={form.department}
            onChange={(value) => updateField("department", value)}
            placeholder="Computer Science"
          />
        </div>

        <div className="split-fields">
          <SelectField
            label="Gender"
            value={form.gender}
            onChange={(value) => updateField("gender", value)}
            options={[
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
              { label: "Non-binary", value: "non-binary" },
              { label: "Prefer not to say", value: "prefer-not-to-say" },
            ]}
          />
          <Field
            label="Year joined"
            value={form.year_joined}
            onChange={(value) => updateField("year_joined", value)}
            placeholder="2024"
            type="number"
          />
        </div>

        <Field
          label="Qualification"
          value={form.qualification}
          onChange={(value) => updateField("qualification", value)}
          placeholder="M.Tech in Data Science"
        />

        {errorMessage ? (
          <ErrorSummary message={errorMessage} details={fieldErrors} />
        ) : null}

        <button className="primary-button" disabled={submitting} type="submit">
          {submitting ? "Creating linked records..." : "Create linked teacher account"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, onChange, placeholder, type = "text", value }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SelectField({ label, onChange, options, value }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function FeatureCard({ text, title }) {
  return (
    <article className="feature-card">
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function StatCard({ accent, label, value }) {
  return (
    <article className={`stat-card stat-${accent}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function ErrorSummary({ details, message }) {
  return (
    <div className="error-summary">
      <strong>{message}</strong>
      {details ? (
        <ul>
          {Object.entries(details).map(([field, detail]) => (
            <li key={field}>
              {field}: {detail}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default App;
