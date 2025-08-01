// This file is kept for compatibility but doesn't actually use Supabase
export const supabase = {
  auth: {
    signInWithPassword: async () => {
      throw new Error('Supabase is not configured. Using Firebase authentication instead.');
    },
    signUp: async () => {
      throw new Error('Supabase is not configured. Using Firebase authentication instead.');
    },
    signOut: async () => {
      return { error: null };
    },
    getSession: async () => {
      return { data: { session: null } };
    },
    onAuthStateChange: () => {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
        order: () => ({
          then: async () => ({ data: [], error: null })
        })
      }),
      order: () => ({
        then: async () => ({ data: [], error: null })
      })
    }),
    insert: () => ({
      then: async () => ({ error: null })
    }),
    update: () => ({
      eq: () => ({
        then: async () => ({ error: null })
      })
    }),
    delete: () => ({
      eq: () => ({
        then: async () => ({ error: null })
      })
    }),
    upsert: () => ({
      then: async () => ({ error: null })
    })
  })
};