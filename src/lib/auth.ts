import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'admin' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // !! WARNING: Basic check for simplicity. Use hashed passwords in a real app !!
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminUsername || !adminPassword) {
          console.error('Admin credentials not set in environment variables!');
          return null;
        }

        if (
          credentials?.username === adminUsername &&
          credentials?.password === adminPassword
        ) {
          // Return a user object (can be simple)
          return { id: '1', name: 'Admin', email: 'admin@example.com' };
        } else {
          return null; // Authentication failed
        }
      },
    }),
  ],
  pages: {
    signIn: '/admin/login', // Redirect to custom login page
  },
  // Add secret for JWT signing
  secret: process.env.AUTH_SECRET,
  // Optional: Add session strategy (jwt is default and fine here)
  // session: { strategy: "jwt" },
}); 