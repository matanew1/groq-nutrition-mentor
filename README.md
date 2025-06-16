# GROQ Nutrition Mentor

A modern nutrition tracking and AI-powered meal planning application built with React, TypeScript, and powered by GROQ AI.

![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🍎 About

GROQ Nutrition Mentor is a comprehensive nutrition tracking and meal planning application that leverages artificial intelligence to provide personalized nutrition advice. The app supports both English and Hebrew languages, offering a fully responsive interface with both light and dark modes.

## ✨ Features

- **AI Nutrition Assistance**: Get personalized nutrition advice powered by GROQ API
- **Meal Planning**: Create and manage daily meal plans
- **Nutrition Data**: Access detailed nutrition information for thousands of foods via Nutritionix API
- **Multilingual Support**: Full support for English and Hebrew, including RTL layout
- **User Authentication**: Secure login with email, Google, or GitHub via Supabase
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Data Persistence**: All your nutrition data and meal plans are securely stored

## 🛠️ Technologies

- **Frontend**: React, TypeScript, Vite
- **UI Components**: shadcn UI and Tailwind CSS
- **State Management**: React Context API and React Query
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **APIs**: GROQ API (AI), Nutritionix API (food data)

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or bun package manager

### Installation

1. Clone the repository:
   ```sh
   git clone <your-repo-url>
   cd groq-nutrition-mentor
   ```

2. Install dependencies:
   ```sh
   npm install
   # or
   bun install
   ```

3. Start the development server:
   ```sh
   npm run dev
   # or
   bun dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## 🧩 Project Structure

```
src/
├── components/       # UI components
├── contexts/         # React context for global state
├── hooks/            # Custom React hooks
├── integrations/     # Third-party integrations
├── lib/              # Utility libraries
├── pages/            # Application pages
└── utils/            # Utility functions
```

## 🔑 Environment Variables

The application requires the following environment variables:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase anon/public key
- `GROQ_API_KEY`: Your GROQ API key
- `NUTRITIONIX_APP_ID`: Your Nutritionix App ID
- `NUTRITIONIX_API_KEY`: Your Nutritionix API Key

## 📱 Features In Detail

### Chat Interface

- Natural language nutrition advice
- Food nutrition lookup
- Diet recommendations
- AI-powered responses to nutrition questions

### Meal Planner

- Daily meal planning with calendar view
- Categorized meals (breakfast, lunch, dinner, snacks)
- Automatic calorie calculation
- Nutrition data for planned meals

### User Settings

- Language preference (English/Hebrew)
- Theme preference (Light/Dark)
- Notification settings
- User profile management

## 🛡️ Authentication

The app provides multiple authentication methods:
- Email/Password
- Google OAuth
- GitHub OAuth

User authentication is managed through Supabase authentication services.

## 🔄 Data Flow

1. User inputs food or nutrition questions
2. App processes input through GROQ API for AI responses or Nutritionix API for nutrition data
3. Results are displayed to user and stored in Supabase database
4. User can save meals to meal plans and track nutrition over time

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [GROQ API](https://groq.com/) for AI functionality
- [Nutritionix API](https://www.nutritionix.com/business/api) for nutrition data
- [Supabase](https://supabase.io/) for authentication and database
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling
