# Rent Payment Web App

[![Azure Static Web Apps CI/CD](https://github.com/YOUR_USERNAME/rent-payment-app/actions/workflows/azure-static-web-apps.yml/badge.svg)](https://github.com/YOUR_USERNAME/rent-payment-app/actions/workflows/azure-static-web-apps.yml)

This is a simple React web application that allows residents to pay their rent online. The application includes a form for entering payment details and a header for easy navigation.

## Project Structure

```
rent-payment-app/
├── api/                      # Azure Functions backend
│   ├── ProcessPayment/       # Payment processing function
│   │   ├── function.json    # Function configuration
│   │   └── index.js         # Payment logic
│   ├── local.settings.json  # Local development settings
│   └── package.json         # API dependencies
├── src/                     # React frontend
│   ├── components/          # React components
│   │   └── PaymentForm.js   # Payment form component
│   ├── styles/             # CSS styles
│   │   ├── App.css         # App styles
│   │   └── PaymentForm.css # Form styles
│   ├── App.js              # Main React component
│   └── index.js            # React entry point
├── public/                  # Static files
├── package.json            # Frontend dependencies
└── staticwebapp.config.json # Azure Static Web App config

```

## Getting Started

To get started with the project, follow these steps:

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd rent-payment-app
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Run the application**:
   ```
   npm start
   ```

4. **Open your browser** and navigate to `http://localhost:3000` to view the application.

## Features

- User-friendly interface for residents to enter their payment details.
- Responsive design that works on various devices.
- Simple and clean layout.

## Contributing

If you would like to contribute to this project, please fork the repository and submit a pull request with your changes.

## License

This project is open-source and available under the [MIT License](LICENSE).