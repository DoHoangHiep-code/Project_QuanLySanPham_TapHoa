# Grocery Store Frontend

Frontend application for Grocery Store Sales Management System built with Vue 3, Vite, Pinia, and TailwindCSS.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (optional):
```env
VITE_API_URL=http://localhost:5000/api
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── api/           # API service functions
├── components/    # Reusable components
├── layouts/       # Layout components
├── router/        # Vue Router configuration
├── stores/        # Pinia stores
├── views/         # Page components
└── utils/         # Utility functions
```

## Default Login

After running backend seed:
- **Admin**: username=`admin`, password=`admin123`
- **Staff**: username=`staff`, password=`staff123`

## Deployment

The frontend is configured to deploy on Render.com. Build output will be in the `dist/` folder.

Make sure to set `VITE_API_URL` environment variable to your backend API URL in production.

