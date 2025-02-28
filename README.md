# Rent Payment Portal

A modern web application for managing rent payments, built with React and styled-components.

## Features

- 🔐 Secure user authentication
- 💰 Easy rent payment processing
- 📱 Responsive design for all devices
- 🎨 Modern and intuitive UI
- 📊 Payment history tracking
- 👤 User profile management
- 🔔 Payment reminders and notifications

## Tech Stack

- React 18
- React Router v6
- Styled Components
- Axios
- Context API for state management

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/rent-payment-app.git
cd rent-payment-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file in the root directory:
```bash
REACT_APP_API_URL=your_api_url_here
```

4. Start the development server:
```bash
npm start
```

The application will be available at http://localhost:3000

## Environment Variables

The following environment variables are required:

- `REACT_APP_API_URL`: The URL of your backend API

## Project Structure

```
src/
├── components/          # React components
│   ├── dashboard/      # Dashboard related components
│   ├── layout/         # Layout components
│   ├── payments/       # Payment related components
│   └── shared/         # Shared/reusable components
├── context/            # React Context providers
├── services/           # API services
├── styles/             # Global styles and theme
│   ├── components/     # Styled components
│   └── theme/          # Theme configuration
└── utils/             # Utility functions
```

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from create-react-app

## API Integration

The application expects the following API endpoints:

### Authentication
- POST `/api/auth/login`: User login
- POST `/api/auth/register`: User registration
- POST `/api/auth/logout`: User logout

### Payments
- GET `/api/payments/summary`: Get payment summary
- GET `/api/payments/history`: Get payment history
- POST `/api/payments/process`: Process a payment
- GET `/api/payments/methods`: Get saved payment methods
- POST `/api/payments/methods`: Save a payment method
- DELETE `/api/payments/methods/:id`: Delete a payment method

### User
- GET `/api/users/profile`: Get user profile
- PUT `/api/users/profile`: Update user profile
- PUT `/api/users/password`: Update password
- POST `/api/users/reset-password`: Request password reset
- PUT `/api/users/notifications`: Update notification preferences

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Security

This application implements several security measures:

- JWT-based authentication
- Protected routes
- Input validation
- Secure password handling
- HTTPS-only API communication
- XSS protection
- CSRF protection

## Browser Support

The application supports all modern browsers:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React team for the amazing framework
- Styled Components team for the styling solution
- The open-source community for various tools and libraries
