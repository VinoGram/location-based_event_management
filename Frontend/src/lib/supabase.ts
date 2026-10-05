// Supabase has been removed. This stub prevents import errors.
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null, user: null }, error: null }),
    signOut: async () => ({ error: null }),
    signInWithOAuth: async () => ({ data: null, error: null }),
  }
};
