// Frontend-only demo auth using localStorage.
// DO NOT use in production.

const LS_USERS = "cm_users";
const LS_SESSION = "cm_session";

function loadUsers() {
  try { return JSON.parse(localStorage.getItem(LS_USERS)) ?? []; }
  catch { return []; }
}
function saveUsers(users) {
  localStorage.setItem(LS_USERS, JSON.stringify(users));
}
function saveSession(user) {
  localStorage.setItem(LS_SESSION, JSON.stringify(user));
}
function readSession() {
  try { return JSON.parse(localStorage.getItem(LS_SESSION)); }
  catch { return null; }
}
function clearSession() {
  localStorage.removeItem(LS_SESSION);
}

export function signup({ name, email, password }) {
  const users = loadUsers();
  const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) throw new Error("Email already registered.");
  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: email.trim(),
    // naive hash substitute for demo only:
    password: btoa(password),
    createdAt: Date.now()
  };
  users.push(user);
  saveUsers(users);
  // auto-login on sign up
  const { password: _, ...safe } = user;
  saveSession(safe);
  return safe;
}

export function login({ email, password }) {
  const users = loadUsers();
  const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!found) throw new Error("Account not found.");
  if (found.password !== btoa(password)) throw new Error("Invalid password.");
  const { password: _, ...safe } = found;
  saveSession(safe);
  return safe;
}

export function logout() {
  clearSession();
}

export function getCurrentUser() {
  return readSession();
}
