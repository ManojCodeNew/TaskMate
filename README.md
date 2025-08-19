# TaskMate - Personal Productivity Application

**TaskMate** is a modern, responsive task management application built with React, featuring user authentication, task scheduling, progress tracking, and a beautiful UI with a consistent slate and teal color scheme.

## 🚀 Features

- **User Authentication** - Secure sign-in/sign-up with Clerk
- **Task Management** - Create, schedule, and track daily tasks
- **Auto-Scheduling** - Automatically assign times to tasks
- **Progress Tracking** - Visual progress indicators and statistics
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Modern UI** - Clean interface with consistent color theming

## 🛠️ Tech Stack

- **Frontend**: React 19.1.0
- **Build Tool**: Vite 7.0.4
- **Styling**: Tailwind CSS 4.1.11
- **Routing**: React Router DOM 7.7.1
- **Authentication**: Clerk React 5.42.1
- **Icons**: Lucide React 0.536.0 & React Icons 5.5.0
- **Linting**: ESLint 9.30.1

## 📁 Project Structure

```
client/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   ├── react.svg
│   │   └── TaskMateLogo.png
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── Menu.jsx              # Sidebar navigation
│   │   ├── NavBar.jsx            # Top navigation bar
│   │   └── ProtectedRoute.jsx    # Authentication wrapper
│   ├── Pages/
│   │   ├── AddTask/
│   │   │   └── AddTask.jsx       # Task creation form
│   │   ├── Auth/
│   │   │   ├── SignInPage.jsx    # User sign-in
│   │   │   └── SignUpPage.jsx    # User registration
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.jsx     # Main dashboard layout
│   │   │   ├── TaskCard.jsx      # Task list and management
│   │   │   └── TodayProgress.jsx # Progress tracking widget
│   │   ├── AIChat/               # AI Assistant (planned)
│   │   ├── DrawingTool/          # Drawing feature (planned)
│   │   ├── Timer/                # Timer feature (planned)
│   │   └── VoiceNote/            # Voice notes (planned)
│   ├── App.jsx                   # Main app component
│   ├── main.jsx                  # Application entry point
│   ├── App.css                   # Global styles
│   └── index.css                 # Base CSS with Tailwind
├── index.html                    # HTML template
├── package.json                  # Dependencies and scripts
├── vite.config.js               # Vite configuration
└── eslint.config.js             # ESLint configuration
```

## 🔄 Application Flow

### 1. **Application Entry Point** (`src/main.jsx`)
```
main.jsx → Renders App with providers:
├── StrictMode
├── ClerkProvider (Authentication)
└── BrowserRouter (Routing)
```

### 2. **Main App Component** (`src/App.jsx`)
```
App.jsx → Root component with:
├── Background gradient and decorative elements
├── NavBar (sticky header)
├── Menu (sidebar navigation)
└── Routes container with authentication-aware routing
```

### 3. **Authentication Flow**
```
Route Access → ProtectedRoute → Check Auth Status:
├── If authenticated → Render protected component
└── If not authenticated → Redirect to /sign-in

Sign-in/Sign-up → Clerk Authentication → Redirect to /dashboard
```

### 4. **Routing Structure**
```
/ → Auto-redirect based on auth status:
├── Authenticated → /dashboard
└── Not authenticated → /sign-in

Protected Routes:
├── /dashboard → Dashboard component
└── /add-task → AddTask component

Public Routes:
├── /sign-in → SignInPage
└── /sign-up → SignUpPage

Fallback: * → Redirect to appropriate page based on auth
```

### 5. **Component Hierarchy**

#### **NavBar Component** (`src/components/NavBar.jsx`)
- Sticky navigation header
- Logo and branding
- Date display (desktop only)
- Authentication status (Sign In button / User profile)
- Scroll-responsive styling

#### **Menu Component** (`src/components/Menu.jsx`)
- Responsive sidebar navigation
- Mobile: Collapsible with hamburger menu
- Desktop: Always visible
- Navigation links to all features
- Smooth animations and transitions

#### **Dashboard Page** (`src/Pages/Dashboard/Dashboard.jsx`)
```
Dashboard → Layout container:
├── Header with title and "Add Task" button
├── TodayProgress → Progress tracking widget
└── TaskCard → Task list and management
```

#### **TodayProgress Component** (`src/Pages/Dashboard/TodayProgress.jsx`)
- Animated progress bar
- Task completion statistics
- Visual progress indicators
- Responsive design with grid layout

#### **TaskCard Component** (`src/Pages/Dashboard/TaskCard.jsx`)
- Task list display
- Auto-scheduling functionality
- Task completion toggling
- Priority and category management
- Time scheduling controls

#### **AddTask Component** (`src/Pages/AddTask/AddTask.jsx`)
- Comprehensive task creation form
- Form validation
- Priority selection
- Duration estimation
- Recurrence settings
- Tag management
- Due date scheduling

### 6. **Data Flow**

#### **Task Management Flow**
```
AddTask → Form Submission → Task Creation:
├── Form validation
├── Data processing
├── Task object creation
└── Redirect to dashboard (planned: API integration)

TaskCard → Task Operations:
├── Display tasks
├── Toggle completion status
├── Auto-schedule tasks
├── Priority management
└── Category organization
```

#### **Authentication Flow**
```
User Access → Route Guard → Authentication Check:
├── Public routes → Direct access
├── Protected routes → Check authentication:
│   ├── Authenticated → Allow access
│   └── Not authenticated → Redirect to sign-in
└── Clerk handles authentication state management
```

## 🎨 Design System

### **Color Palette**
- **Primary**: Teal (600, 700) - Main actions and highlights
- **Secondary**: Slate (50-800) - Text, backgrounds, and neutral elements
- **Backgrounds**: Slate-50 for light areas, white for cards
- **Text**: Slate-800 for headings, slate-600 for body text
- **Focus**: Teal-500 for interactive element focus states

### **Responsive Design**
- **Mobile-first approach** with Tailwind CSS breakpoints
- **Breakpoints**: sm (640px), md (768px), lg (1024px)
- **Adaptive layouts**: Stacked on mobile, horizontal on desktop
- **Touch-friendly**: Larger touch targets on mobile devices

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Clerk account for authentication

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd client
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file in the root directory:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```

4. **Start development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
```

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🔧 Configuration

### **Vite Configuration** (`vite.config.js`)
- React plugin for JSX support
- Tailwind CSS integration
- Hot module replacement (HMR)

### **ESLint Configuration** (`eslint.config.js`)
- React-specific linting rules
- Hook dependency checking
- Code quality enforcement

## 🎯 Key Features Implementation

### **1. Authentication (Clerk Integration)**
- Seamless sign-in/sign-up flow
- Protected route implementation
- User session management
- Automatic redirects based on auth status

### **2. Responsive Navigation**
- Sticky header with scroll effects
- Collapsible sidebar on mobile
- Smooth animations and transitions
- Context-aware navigation states

### **3. Task Management**
- Rich task creation form with validation
- Auto-scheduling algorithm
- Progress tracking with animations
- Priority and category systems

### **4. UI/UX Excellence**
- Consistent color theming
- Smooth animations and transitions
- Mobile-optimized touch targets
- Accessibility considerations

## 🔮 Future Enhancements

The application structure supports planned features:
- **AI Chat Assistant** - AI-powered task recommendations
- **Drawing Tool** - Visual task planning
- **Timer** - Pomodoro and time tracking
- **Voice Notes** - Audio task notes
- **Backend Integration** - Data persistence and synchronization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

---

**TaskMate** - Your daily productivity partner 🚀