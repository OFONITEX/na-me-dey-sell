// Authentication service for Nà Mè Dèy Sell
// Handles account registration with Full Name, Email, Phone Number, and Password.
// Syncs to localStorage for instant local/offline resilience and calls Cloudflare Pages Functions.

const AUTH_USER_KEY = "nmds_auth_user";
const USERS_DB_KEY = "nmds_registered_users_db";
const AUTH_EVENT_NAME = "nmds_auth_change";

// Helper to hash password using Web Crypto API
async function hashPassword(password) {
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(password + "_nmds_salt_2026");
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    } catch {
      // Fallback
    }
  }
  // Safe basic hash fallback
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return "h_" + Math.abs(hash).toString(16);
}

// Clean and normalize Nigerian/international phone numbers
export function formatPhoneNumber(phone) {
  if (!phone) return "";
  let cleaned = String(phone).replace(/[^\d+]/g, "").trim();
  // Standardize leading 0 to +234 if 11 digits
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    cleaned = "+234" + cleaned.slice(1);
  }
  return cleaned;
}

// Get all registered users from storage
export function getAllRegisteredUsers() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Error reading users db:", err);
    return [];
  }
}

// Save users list
function saveUsersDb(users) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  } catch (err) {
    console.error("Error saving users db:", err);
  }
}

// Get currently logged in user
export function getAuthUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Check if currently authenticated
export function isAuthenticated() {
  return Boolean(getAuthUser());
}

// Dispatch auth change event across the application
function notifyAuthChange(user) {
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: user }));
    } catch {}
  }
}

// Subscribe to auth state updates
export function subscribeAuth(callback) {
  if (typeof window === "undefined") return () => {};

  const handleCustomEvent = (e) => {
    callback(e.detail || null);
  };

  const handleStorageEvent = (e) => {
    if (e.key === AUTH_USER_KEY) {
      try {
        callback(e.newValue ? JSON.parse(e.newValue) : null);
      } catch {
        callback(null);
      }
    }
  };

  window.addEventListener(AUTH_EVENT_NAME, handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener(AUTH_EVENT_NAME, handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
}

// Register a new user
export async function registerUser({ fullName, email, phone, password }) {
  if (!fullName || !fullName.trim()) {
    throw new Error("Please enter your full name.");
  }
  if (!email || !email.trim() || !email.includes("@")) {
    throw new Error("Please enter a valid email address.");
  }
  if (!phone || !phone.trim() || phone.replace(/\D/g, "").length < 8) {
    throw new Error("Please enter a valid phone number (at least 8-11 digits).");
  }
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = formatPhoneNumber(phone.trim());
  const cleanName = fullName.trim();

  const users = getAllRegisteredUsers();

  // Check for duplicate email
  const existingEmail = users.find(u => u.email === cleanEmail);
  if (existingEmail) {
    throw new Error("An account with this email address already exists. Please sign in instead.");
  }

  // Check for duplicate phone
  const existingPhone = users.find(u => u.phone === cleanPhone);
  if (existingPhone) {
    throw new Error("An account with this phone number already exists. Please sign in instead.");
  }

  const passwordHash = await hashPassword(password);

  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    fullName: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    passwordHash,
    role: "attendee",
    verified: true,
    createdAt: new Date().toISOString(),
    initials: cleanName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0].toUpperCase())
      .join("") || "U"
  };

  // Save to DB
  users.push(newUser);
  saveUsersDb(users);

  // Strip password hash for session state
  const sessionUser = {
    id: newUser.id,
    fullName: newUser.fullName,
    email: newUser.email,
    phone: newUser.phone,
    role: newUser.role,
    verified: newUser.verified,
    createdAt: newUser.createdAt,
    initials: newUser.initials
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(sessionUser));
  }

  notifyAuthChange(sessionUser);

  // Background sync with Cloudflare Pages Functions API
  try {
    fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password
      })
    }).catch(() => {});
  } catch {}

  return sessionUser;
}

// Sign in with Email or Phone
export async function loginUser({ identifier, password }) {
  if (!identifier || !identifier.trim()) {
    throw new Error("Please enter your email address or phone number.");
  }
  if (!password) {
    throw new Error("Please enter your password.");
  }

  const cleanIdentifier = identifier.trim().toLowerCase();
  const normalizedPhone = formatPhoneNumber(identifier.trim());
  const users = getAllRegisteredUsers();

  const user = users.find(u => 
    u.email === cleanIdentifier || 
    u.phone === normalizedPhone || 
    u.phone.replace(/[^\d]/g, "") === cleanIdentifier.replace(/[^\d]/g, "")
  );

  if (!user) {
    throw new Error("No account found matching this email or phone number. Please create an account.");
  }

  const passwordHash = await hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    throw new Error("Incorrect password. Please try again.");
  }

  const sessionUser = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role || "attendee",
    verified: user.verified !== false,
    createdAt: user.createdAt,
    initials: user.initials || (user.fullName ? user.fullName[0].toUpperCase() : "U")
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(sessionUser));
  }

  notifyAuthChange(sessionUser);

  // Background sync with Cloudflare Pages Functions API
  try {
    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: cleanIdentifier,
        password
      })
    }).catch(() => {});
  } catch {}

  return sessionUser;
}

// Log out user
export function logoutUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_USER_KEY);
  }
  notifyAuthChange(null);

  try {
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  } catch {}
}
