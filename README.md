# 3000 Benk

A competition management system for the 3000 Benk event.

## Features

- **Participant Management**: Add, edit, and delete participants
- **Leaderboard**: View current standings with sorting and filtering
- **Starting Times**: See when each participant starts based on their bench press
- **Real-time Updates**: Changes are reflected immediately across all views

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```env
   BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

- `BLOB_READ_WRITE_TOKEN`: Your Vercel Blob storage token for data persistence

## Development

- Built with Next.js 14
- Uses Vercel Blob for data storage
- Styled with Tailwind CSS and shadcn/ui components

## License

MIT
