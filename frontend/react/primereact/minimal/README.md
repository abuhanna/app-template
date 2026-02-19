# AppTemplate Frontend (React + PrimeReact)

A React 18 + PrimeReact frontend template with TypeScript, Zustand state management, and React Router.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **PrimeReact** - Component library
- **PrimeFlex** - CSS utility library
- **Zustand** - State management
- **React Router v6** - Routing
- **Axios** - HTTP client
- **SignalR / Socket.io** - Real-time notifications

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/       # Reusable components
├── layouts/          # Page layouts (Default, Blank)
├── pages/            # Page components
├── router/           # React Router configuration
├── services/         # API services
├── stores/           # Zustand stores
├── types/            # TypeScript types
└── main.tsx          # App entry point
```

## Environment Variables

Create a `.env` file from `.env.example`:

```bash
VITE_API_BASE_URL=http://localhost:5100/api
VITE_BACKEND_TYPE=dotnet  # dotnet | nest | spring
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint and fix code
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests

## Default Login

- Username: `admin`
- Password: `Admin@123`
