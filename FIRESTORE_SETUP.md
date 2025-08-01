# Firestore Setup Guide

## Creating the Firestore Database

Before you can use Firestore in your application, you need to create a Firestore database in your Firebase project. Follow these steps:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `ai-sales-agent-452915`
3. In the left sidebar, click on "Firestore Database"
4. Click "Create database"
5. Choose either "Start in production mode" or "Start in test mode" (you can change this later)
   - If you choose "Production mode", your security rules will be applied immediately
   - If you choose "Test mode", anyone can read/write to your database for 30 days
6. Select a location for your database (choose a location close to your users)
7. Click "Enable"

## Deploying Firestore Indexes

After creating the database, you can deploy the indexes:

1. Update your `firebase.json` file to include the indexes:
   ```json
   {
     "hosting": {
       "public": "out",
       "ignore": [
         "firebase.json",
         "**/.*",
         "**/node_modules/**"
       ]
     },
     "firestore": {
       "rules": "firebase/firestore.rules",
       "indexes": "firebase/firestore.indexes.json"
     }
   }
   ```

2. Deploy the indexes:
   ```bash
   firebase deploy --only firestore
   ```

## Verifying Your Setup

After completing the setup:

1. Check the Firebase Console to verify that your database is created
2. Verify that your security rules are applied
3. Check that your indexes are created
4. Test your application to ensure it can connect to Firestore

## Troubleshooting

If you encounter any issues:

1. Check the Firebase Console for error messages
2. Verify that the Firestore API is enabled in the Google Cloud Console
3. Ensure your Firebase configuration in `.env.local` is correct
4. Check that your security rules are properly formatted
5. Verify that your application has the correct permissions to access Firestore 