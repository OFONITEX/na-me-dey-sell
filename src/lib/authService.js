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

// Super Admin authorized accounts - automatically granted full root privileges
export const SUPER_ADMIN_EMAILS = [
  "brinoekanem@gmail.com",
  "iamrhobbinraynerhq01@gmail.com"
];

export const ADMIN_PASSCODE = "NMDS-ADMIN-2026";

// Built-in seed users including designated superadmins and top organizers
export const SEED_USERS = [
  {
    id: "usr_superadmin_brino",
    fullName: "Brino Ekanem",
    email: "brinoekanem@gmail.com",
    phone: "+2348030000001",
    role: "admin",
    isSuperAdmin: true,
    verified: true,
    authProvider: "direct",
    createdAt: "2026-01-01T00:00:00.000Z",
    initials: "BE"
  },
  {
    id: "usr_superadmin_rhobbin",
    fullName: "Rhobbin Rayner",
    email: "iamrhobbinraynerhq01@gmail.com",
    phone: "+2348030000002",
    role: "admin",
    isSuperAdmin: true,
    verified: true,
    authProvider: "direct",
    createdAt: "2026-01-01T00:00:00.000Z",
    initials: "RR"
  },
  {
    id: "usr_organizer_davido",
    fullName: "David Adeleke (Davido)",
    email: "davido@dmw.ng",
    phone: "+2348021112233",
    role: "organizer",
    isSuperAdmin: false,
    verified: true,
    authProvider: "direct",
    createdAt: "2026-02-10T10:00:00.000Z",
    initials: "DA"
  },
  {
    id: "usr_organizer_flytime",
    fullName: "Flytime Promotions HQ",
    email: "info@flytimefest.com",
    phone: "+2348034445566",
    role: "organizer",
    isSuperAdmin: false,
    verified: true,
    authProvider: "direct",
    createdAt: "2026-02-15T12:00:00.000Z",
    initials: "FP"
  }
];

// Get all registered users from storage, ensuring superadmins exist and are elevated
export function getAllRegisteredUsers() {
  if (typeof window === "undefined") return SEED_USERS;
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    let users = raw ? JSON.parse(raw) : [];

    if (!users || !Array.isArray(users) || users.length === 0) {
      users = [...SEED_USERS];
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
      return users;
    }

    // Ensure Super Admins are always present and properly elevated
    let updated = false;
    SUPER_ADMIN_EMAILS.forEach(adminEmail => {
      const idx = users.findIndex(u => u.email && u.email.toLowerCase() === adminEmail.toLowerCase());
      if (idx === -1) {
        const seed = SEED_USERS.find(s => s.email.toLowerCase() === adminEmail.toLowerCase());
        if (seed) {
          users.unshift({ ...seed });
          updated = true;
        }
      } else {
        if (users[idx].role !== "admin" || !users[idx].isSuperAdmin) {
          users[idx].role = "admin";
          users[idx].isSuperAdmin = true;
          updated = true;
        }
      }
    });

    if (updated) {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    }
    return users;
  } catch (err) {
    console.error("Error reading users db:", err);
    return SEED_USERS;
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
    (u.email && u.email.toLowerCase() === cleanId) || 
    (u.phone && (u.phone === normalizedPhone || u.phone.replace(/\D/g, "") === cleanId.replace(/\D/g, "")))
  ) || null;
}

export function isSuperAdminEmail(email) {
  if (!email) return false;
  const clean = String(email).trim().toLowerCase();
  return SUPER_ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === clean);
}

export function isSuperAdmin(user) {
  if (!user) return false;
  return isSuperAdminEmail(user.email) || user.role === "admin" || user.role === "superadmin" || Boolean(user.isSuperAdmin);
}

export function isOrganizer(user) {
  if (!user) return false;
  return user.role === "organizer" || isSuperAdmin(user) || Boolean(user.isOrganizer);
}

// Get currently logged in user
export function getAuthUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (user && isSuperAdminEmail(user.email) && user.role !== "admin") {
      user.role = "admin";
      user.isSuperAdmin = true;
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }
    return user;
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
  const isAdmin = isSuperAdminEmail(cleanEmail);

  if (user) {
    // Update existing user with latest name and phone
    user.fullName = cleanName;
    user.phone = cleanPhone;
    user.initials = getInitials(cleanName);
    user.lastLoginAt = new Date().toISOString();
    if (isAdmin) user.role = "admin";
  } else {
    // Check if phone belongs to another user
    const existingPhone = users.find(u => u.phone === cleanPhone && u.email !== cleanEmail);
    if (existingPhone) {
      // Allow merge or update
      user = existingPhone;
      user.email = cleanEmail;
      user.fullName = cleanName;
      user.initials = getInitials(cleanName);
      if (isAdmin) user.role = "admin";
    } else {
      // Create new user profile
      user = {
        id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        fullName: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        role: isAdmin ? "admin" : "attendee",
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
    role: isAdmin ? "admin" : (user.role || "attendee"),
    isSuperAdmin: isAdmin,
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
  const isAdmin = isSuperAdminEmail(cleanEmail);

  if (user) {
    user.authProvider = "google";
    user.googleId = googleId || user.googleId;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    user.lastLoginAt = new Date().toISOString();
    if (isAdmin) user.role = "admin";
  } else {
    user = {
      id: `usr_g_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      fullName: cleanName,
      email: cleanEmail,
      phone: "+234",
      role: isAdmin ? "admin" : "attendee",
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
    role: isAdmin ? "admin" : (user.role || "attendee"),
    isSuperAdmin: isAdmin,
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

// Verify Admin Passcode for emergency or direct root access
export function verifyAdminPasscode(pin) {
  if (!pin) return false;
  return String(pin).trim() === ADMIN_PASSCODE;
}

// Update a user's role in the registered users DB
export function updateUserRole(userId, newRole) {
  if (typeof window === "undefined") return null;
  const users = getAllRegisteredUsers();
  const target = users.find(u => u.id === userId || u.email.toLowerCase() === String(userId).toLowerCase());
  if (target) {
    target.role = newRole;
    saveUsersDb(users);
    
    // Update active session if target is current user
    const current = getAuthUser();
    if (current && (current.id === target.id || current.email === target.email)) {
      current.role = newRole;
      current.isSuperAdmin = newRole === "admin" || isSuperAdminEmail(current.email);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(current));
      notifyAuthChange(current);
    }
    return target;
  }
  return null;
}

// Promote user to organizer
export function promoteToOrganizer(userIdOrEmail) {
  return updateUserRole(userIdOrEmail, "organizer");
}
