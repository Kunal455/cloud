import { useEffect, useState } from "react";
import { Cloud, LockKeyhole, Mail, UserRound, LogOut, ShieldCheck, ArrowRight, Eye, EyeOff } from "lucide-react";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export default function App() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [notice, setNotice] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Deliberately do not persist the bearer token in localStorage.
    // Refreshing signs the user out in this learning version.
  }, []);

  function update(event) {
    setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setNotice({ type: "", text: "" });
    try {
      const response = await fetch(`${API_URL}/api/auth/${mode === "login" ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Request failed.");
      if (mode === "register") {
        setNotice({ type: "success", text: data.message || "Account created. Sign in now." });
        setMode("login");
        setForm((prev) => ({ ...prev, password: "" }));
      } else {
        setToken(data.token);
        setUser(data.user);
        setNotice({ type: "success", text: data.message || "Signed in successfully." });
      }
    } catch (error) {
      setNotice({ type: "error", text: error.message || "Could not reach the API." });
    } finally {
      setBusy(false);
    }
  }

  async function loadProfile() {
    setBusy(true);
    setNotice({ type: "", text: "" });
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Could not load profile.");
      setUser(data.user);
      setNotice({ type: "success", text: "Protected profile loaded from the backend." });
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    setToken("");
    setUser(null);
    setForm({ name: "", email: "", password: "" });
    setNotice({ type: "success", text: "You have signed out." });
  }

  if (token && user) {
    return (
      <main className="page">
        <section className="app-card profile-card">
          <div className="brand"><span className="brand-icon"><Cloud size={22} /></span><span>CloudLogin</span></div>
          <div className="profile-avatar"><UserRound size={34} /></div>
          <p className="eyebrow">AUTHENTICATED SESSION</p>
          <h1>Welcome, {user.name}</h1>
          <p className="subtitle">Your login API is connected and your token has been issued.</p>
          <div className="profile-detail"><span>Name</span><strong>{user.name}</strong></div>
          <div className="profile-detail"><span>Email</span><strong>{user.email}</strong></div>
          <div className="security-note"><ShieldCheck size={18} /><span>Profile access is verified by the backend using JWT.</span></div>
          {notice.text && <div className={`notice ${notice.type}`} role="status">{notice.text}</div>}
          <button className="primary-button" onClick={loadProfile} disabled={busy}>
            {busy ? "Loading…" : "Test protected profile"} <ArrowRight size={17} />
          </button>
          <button className="secondary-button" onClick={logout}><LogOut size={17} /> Sign out</button>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="app-card">
        <div className="brand"><span className="brand-icon"><Cloud size={22} /></span><span>CloudLogin</span></div>
        <div className="intro">
          <div className="welcome-icon"><LockKeyhole size={25} /></div>
          <p className="eyebrow">YOUR CLOUD JOURNEY STARTS HERE</p>
          <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="subtitle">{mode === "login" ? "Sign in to continue to your workspace." : "Register to try your first cloud-ready app."}</p>
        </div>

        <div className="tabs" role="tablist" aria-label="Authentication mode">
          <button className={mode === "login" ? "tab active" : "tab"} onClick={() => { setMode("login"); setNotice({ type: "", text: "" }); }}>Sign in</button>
          <button className={mode === "register" ? "tab active" : "tab"} onClick={() => { setMode("register"); setNotice({ type: "", text: "" }); }}>Create account</button>
        </div>

        <form onSubmit={submit}>
          {mode === "register" && (
            <label className="field">
              <span>Full name</span>
              <span className="input-wrap"><UserRound size={18} /><input name="name" value={form.name} onChange={update} placeholder="Your name" autoComplete="name" required maxLength={80} /></span>
            </label>
          )}
          <label className="field">
            <span>Email address</span>
            <span className="input-wrap"><Mail size={18} /><input name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" autoComplete="email" required maxLength={254} /></span>
          </label>
          <label className="field">
            <span>Password</span>
            <span className="input-wrap">
              <LockKeyhole size={18} />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={update}
                placeholder={mode === "login" ? "Enter your password" : "At least 8 characters (max 72)"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={8}
                maxLength={72}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </span>
          </label>
          {notice.text && <div className={`notice ${notice.type}`} role="status">{notice.text}</div>}
          <button className="primary-button" type="submit" disabled={busy}>
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"} <ArrowRight size={17} />
          </button>
        </form>

        <div className="footer-note"><ShieldCheck size={16} /><span>Passwords are hashed by the backend before storage.</span></div>
        <p className="demo-note">Learning project · React + Express + MongoDB</p>
      </section>
      <p className="page-caption">Built to learn AWS deployment, one service at a time.</p>
    </main>
  );
}
