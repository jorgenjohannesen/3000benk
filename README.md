# Event Manager

A simple web application for managing event participants, start times, and results. Built with Next.js, Tailwind CSS, and Vercel Blob for data storage.

## Features

- Public leaderboard showing results
- Public start list showing participants
- Admin interface for managing participants
- Record start and finish times
- Sort and filter data
- Simple authentication for admin access

## Technology Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Data Storage**: Vercel Blob
- **Authentication**: NextAuth.js (Credentials Provider)
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd event-manager
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file with the following variables:
   ```
   # NextAuth configuration
   NEXTAUTH_SECRET="your-nextauth-secret-here"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Admin credentials
   ADMIN_USERNAME="admin"
   ADMIN_PASSWORD="password"
   
   # Vercel Blob Storage
   BLOB_READ_WRITE_TOKEN="your-vercel-blob-token-here"
   ```

4. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Deployment

The application is designed to be deployed on Vercel:

1. Push your repository to GitHub
2. Connect your repository to Vercel
3. Configure your environment variables in Vercel's dashboard
4. Deploy

## Usage

1. Access the admin area at `/admin` (use the credentials from `.env.local`)
2. Add participants with their details
3. Set start times for each participant
4. Record finish times as participants complete the event
5. View the leaderboard and start list on the public-facing pages

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
