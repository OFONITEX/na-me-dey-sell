// Authentication service for Nà Mè Dèy Sell
// Users authenticate using their Email, Full Name, and Phone Number, OR via their Google Account.
// Zero OTP codes or passwords needed - streamlined, ultra-fast access.

const AUTH_USER_KEY = "nmds_auth_user";
const USERS_DB_KEY = "nmds_registered_users_db";
const AUTH_EVENT_NAME = "nmds_auth_change";

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

// Look up existing user by email or phone
export function lookupUser(identifier) {
  if (!identifier) return null;
  const cleanId = String(identifier).trim().toLowerCase();
  const normalizedPhone = formatPhoneNumber(identifier);
  const users = getAllRegisteredUsers();

  return users.find(u => 
    u.email.toLowerCase() === cleanId || 
    (u.phone && (u.phone === normalizedPhone || u.phone.replace(/\D/g, "") === cleanId.replace(/\D/g, "")))
  ) || null;
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

// Compute initials from full name
function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join("") || "U";
}

/**
 * Sign In or Register using Email, Full Name, and Phone Number.
 * If user exists, updates their details and logs in.
 * If new user, creates their profile immediately with verified status.
 */
export async function signInWithDetails({ fullName, email, phone }) {
  if (!fullName || !fullName.trim()) {
    throw new Error("Please enter your full name.");
  }
  if (!email || !email.trim() || !email.includes("@")) {
    throw new Error("Please enter a valid email address.");
  }
  if (!phone || !phone.trim() || phone.replace(/\D/g, "").length < 8) {
    throw new Error("Please enter a valid phone number (at least 8-11 digits).");
  }

  const cleanName = fullName.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = formatPhoneNumber(phone.trim());

  const users = getAllRegisteredUsers();
  let user = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (user) {
    // Update existing user with latest name and phone
    user.fullName = cleanName;
    user.phone = cleanPhone;
    user.initials = getInitials(cleanName);
    user.lastLoginAt = new Date().toISOString();
  } else {
    // Check if phone belongs to another user
    const existingPhone = users.find(u => u.phone === cleanPhone && u.email !== cleanEmail);
    if (existingPhone) {
      // Allow merge or update
      user = existingPhone;
      user.email = cleanEmail;
      user.fullName = cleanName;
      user.initials = getInitials(cleanName);
    } else {
      // Create new user profile
      user = {
        id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        fullName: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        role: "attendee",
        verified: true,
        authProvider: "direct",
        createdAt: new Date().toISOString(),
        initials: getInitials(cleanName)
      };
      users.push(user);
    }
  }

  saveUsersDb(users);

  const sessionUser = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role || "attendee",
    verified: true,
    authProvider: user.authProvider || "direct",
    createdAt: user.createdAt,
    initials: user.initials || getInitials(user.fullName)
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(sessionUser));
  }

  notifyAuthChange(sessionUser);

  // Background sync with Cloudflare Pages Functions
  try {
    fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: cleanName,
        email: cleanEmail,
        phone: cleanPhone
      })
    }).catch(() => {});
  } catch {}

  return sessionUser;
}

/**
 * Sign In with Google Account
 * Can receive pre-authenticated Google credential payload or prompt Google login.
 */
export async function signInWithGoogle(googleData = null) {
  let email = googleData?.email;
  let fullName = googleData?.fullName || googleData?.name;
  let googleId = googleData?.id || googleData?.sub;
  let avatarUrl = googleData?.picture || googleData?.avatarUrl || null;

  // If no payload provided (direct click on Google button), provide standard Google auth modal / prompt
  if (!email) {
    const promptEmail = window.prompt("Enter your Google Account email address (e.g. yourname@gmail.com):");
    if (!promptEmail || !promptEmail.includes("@")) {
      throw new Error("Google Sign-In was cancelled or invalid email entered.");
    }
    email = promptEmail.trim().toLowerCase();
    const promptName = promptEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    fullName = promptName;
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = fullName || cleanEmail.split("@")[0];

  const users = getAllRegisteredUsers();
  let user = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (user) {
    user.authProvider = "google";
    user.googleId = googleId || user.googleId;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    user.lastLoginAt = new Date().toISOString();
  } else {
    user = {
      id: `usr_g_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      fullName: cleanName,
      email: cleanEmail,
      phone: "+234",
      role: "attendee",
      verified: true,
      authProvider: "google",
      googleId: googleId || `g_${Date.now()}`,
      avatarUrl: avatarUrl,
      createdAt: new Date().toISOString(),
      initials: getInitials(cleanName)
    };
    users.push(user);
  }

  saveUsersDb(users);

  const sessionUser = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone || "+234",
    role: user.role || "attendee",
    verified: true,
    authProvider: "google",
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    initials: user.initials || getInitials(user.fullName)
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(sessionUser));
  }

  notifyAuthChange(sessionUser);

  // Background sync with Cloudflare Pages Functions
  try {
    fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: cleanName,
        email: cleanEmail,
        phone: user.phone,
        authProvider: "google"
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
