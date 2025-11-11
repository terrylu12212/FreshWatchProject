// Lightweight JWT helpers: decode payload and check expiry

export function getToken() {
  return localStorage.getItem('token') || null;
}

export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function isTokenExpired(token) {
  if (!token) return true;
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= nowSeconds;
}

export function isAuthed() {
  const t = getToken();
  return !!t && !isTokenExpired(t);
}

export function ensureAuthOrRedirect() {
  const t = getToken();
  if (!t || isTokenExpired(t)) {
    localStorage.removeItem('token');
    // Using hard redirect keeps it simple from anywhere in app
    window.location.href = '/login';
    return false;
  }
  return true;
}
