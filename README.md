# AI Sales Agent

A modern web-based UI for sales-focused AI assistance with user authentication and chat history persistence.

## Features

- **User Authentication**: Secure login and registration system with email/password and Google OAuth
- **Chat History**: Persistent chat history for each user
- **Multiple AI Modes**:
  - Basic Chat: General conversation with the AI
  - RAG Search: Retrieval-augmented generation using your knowledge base
  - Summarization: Get concise summaries of long texts
  - Search Mode: Search through your documents
- **Document Management**: Upload and manage documents for RAG search
- **Customizable UI**: Adjust theme, font size, and other preferences
- **Export Options**: Export conversations in various formats

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Firebase project

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a Firebase project and enable Authentication (Email/Password and Google providers)
4. Create a Firestore database in your Firebase project
5. Copy `.env.local.example` to `.env.local` and update with your Firebase credentials:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   NEXT_PUBLIC_API_URL=http://localhost:8001
   ```
6. Run the development server:
   ```
   npm run dev
   ```

## Database Schema

The application uses the following Firestore collections:

- **users**: Stores user information
- **chats**: Stores chat sessions for each user
- **messages**: Stores individual messages within chats
- **user_preferences**: Stores user interface preferences

## Authentication Flow

1. User signs up or logs in using email/password or Google OAuth
2. On successful authentication, user data is stored in the users collection
3. User's chat history is loaded from the database
4. All subsequent actions (creating chats, sending messages) are associated with the user's ID

## Deployment

This application can be deployed to any platform that supports Next.js applications, such as Vercel, Netlify, or a custom server.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
