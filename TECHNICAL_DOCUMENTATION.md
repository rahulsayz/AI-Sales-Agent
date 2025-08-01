# Onix AI Sales Agent - Technical Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Core Components](#core-components)
4. [State Management](#state-management)
5. [Authentication Flow](#authentication-flow)
6. [Chat Modes](#chat-modes)
7. [Document Processing](#document-processing)
8. [UI Components](#ui-components)
9. [Deployment](#deployment)
10. [Security Considerations](#security-considerations)

## 1. Architecture Overview

The Onix AI Sales Agent is built as a modern web application using Next.js 13+ with a focus on client-side interactivity and server-side rendering capabilities. The application follows a component-based architecture with clear separation of concerns.

### Key Architectural Decisions
- Client-side state management using Zustand
- Firebase for authentication and data persistence
- Modular component structure
- Type-safe development with TypeScript
- Responsive design with Tailwind CSS

## 2. Technology Stack

### Frontend Framework
- Next.js 13+
- React 18.3+
- TypeScript 5.2+

### UI Components
- Tailwind CSS for styling
- shadcn/ui for base components
- Lucide React for icons
- React Hook Form for form handling
- Zod for validation

### State Management & Data
- Zustand for global state
- Firebase Authentication
- Firebase Firestore for data persistence

### Development Tools
- ESLint for code quality
- Prettier for code formatting
- PostCSS for CSS processing

## 3. Core Components

### Authentication (`components/auth/`)
- `AuthGuard`: Protects routes requiring authentication
- `AuthScreen`: Handles login/signup flows
- Supports email/password and Google OAuth

### Chat Interface (`components/chat/`)
- `ChatWindow`: Main chat interface container
- `ChatInput`: Message input with mode-specific features
- `MessageItem`: Renders individual chat messages
- `ChatList`: Displays chat history

### Document Processing (`components/document/`)
- `DocumentContextViewer`: Displays document search results
- `DocumentManagement`: Handles document upload and organization

### Presentation Tools (`components/presentation/`)
- `PresentationDashboard`: Main presentation management interface
- `PresentationSetup`: Initial presentation configuration
- `PresentationConfig`: Advanced presentation settings
- `PresentationReview`: Content review interface

## 4. State Management

### Zustand Store Structure
```typescript
interface ChatState {
  chats: Chat[];
  activeChat: string | null;
  userPreferences: UserPreferences;
  isTyping: boolean;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

### Key Store Features
- Persistent storage for user preferences
- Real-time chat state management
- Authentication state handling
- Document selection state
- Presentation configuration state

## 5. Authentication Flow

1. User Authentication Options
   - Email/Password registration and login
   - Google OAuth integration
   - Session persistence

2. Protected Routes
   - AuthGuard component protection
   - Automatic redirect to login
   - Session management

## 6. Chat Modes

### Available Modes
1. **Basic Chat**
   - Standard conversational interface
   - General purpose interactions

2. **RAG Search**
   - Retrieval-augmented generation
   - Document context integration
   - Relevance scoring

3. **Summarization**
   - Text summarization capabilities
   - Custom summarization parameters
   - Format customization

4. **Search Mode**
   - Document search functionality
   - Context-aware results
   - Relevance highlighting

## 7. Document Processing

### Document Context Viewer
- Displays search results with context
- Relevance scoring visualization
- Navigation between document sections
- Context highlighting

### Document Management
- Upload interface
- Document categorization
- Search and filtering
- Access control

## 8. UI Components

### Base Components (`components/ui/`)
- Button
- Input
- Dialog
- Dropdown
- Toast notifications
- Loading indicators
- Form elements

### Layout Components
- Sidebar
- Main content area
- Navigation
- Modal windows

### Responsive Design
- Mobile-first approach
- Breakpoint system
- Flexible layouts
- Touch-friendly interfaces

## 9. Deployment

### Build Process
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables
Required environment variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_API_URL
```

## 10. Security Considerations

### Authentication Security
- Secure password handling
- OAuth2 implementation
- Session management
- CSRF protection

### Data Security
- Firebase security rules
- Input validation
- XSS prevention
- CORS configuration

### Best Practices
- Environment variable protection
- Secure data transmission
- Regular security updates
- Access control implementation

## API Integration

### Chat API
- Message handling
- Mode-specific processing
- Response formatting
- Error handling

### Document API
- Upload/download
- Search functionality
- Context retrieval
- Chunk processing

## Performance Optimization

### Code Splitting
- Dynamic imports
- Route-based splitting
- Component lazy loading

### Caching Strategy
- Static asset caching
- API response caching
- State persistence

### Resource Optimization
- Image optimization
- Bundle size management
- Lazy loading
- Performance monitoring

## Testing Strategy

### Unit Testing
- Component testing
- State management testing
- Utility function testing

### Integration Testing
- API integration tests
- Authentication flow tests
- User flow testing

### E2E Testing
- Critical path testing
- User journey validation
- Cross-browser testing

## Maintenance and Updates

### Version Control
- Git workflow
- Branch strategy
- Release process

### Documentation
- Code documentation
- API documentation
- Component documentation

### Monitoring
- Error tracking
- Performance monitoring
- Usage analytics

## Future Considerations

### Scalability
- Component architecture
- State management
- API integration
- Performance optimization

### Feature Roadmap
- Enhanced search capabilities
- Additional chat modes
- Advanced presentation features
- Integration capabilities

### Accessibility
- WCAG compliance
- Keyboard navigation
- Screen reader support
- Color contrast

## Support and Resources

### Documentation
- Component documentation
- API documentation
- Setup guides
- Troubleshooting guides

### Development Resources
- GitHub repository
- Issue tracking
- Development guidelines
- Contributing guide