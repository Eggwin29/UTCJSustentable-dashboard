const PASSWORD_RECOVERY_KEY =
  "utcj-sustentable:password-recovery";

function getSessionStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export const passwordRecoveryState = {
  isActive() {
    return (
      getSessionStorage()?.getItem(
        PASSWORD_RECOVERY_KEY
      ) === "active"
    );
  },

  activate() {
    getSessionStorage()?.setItem(
      PASSWORD_RECOVERY_KEY,
      "active"
    );
  },

  clear() {
    getSessionStorage()?.removeItem(
      PASSWORD_RECOVERY_KEY
    );
  },
};