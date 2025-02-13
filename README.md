# Rent Payment Web App

A React-based web application that enables secure rent payments using Stripe integration and Azure services. The application includes payment processing, transaction tracking, and a user-friendly interface.

## Tech Stack

- **Frontend**: React.js with Stripe Elements
- **Backend**: Azure Functions (Node.js)
- **Database**: Azure SQL Database
- **Payment Processing**: Stripe API
- **Hosting**: Azure Static Web Apps

## Project Structure

```
rent-payment-app/
├── api/                      # Azure Functions backend
│   ├── ProcessPayment/       # Payment processing function
│   │   ├── function.json    # Function configuration
│   │   └── index.js         # Payment logic
│   ├── UpdatePaymentStatus/ # Status update function
│   │   ├── function.json    
│   │   └── index.js        
│   ├── local.settings.json  # Local development settings
│   └── package.json         # API dependencies
├── src/                     # React frontend
│   ├── components/          # React components
│   │   ├── PaymentForm.js   # Payment form component
│   │   └── PaymentComplete.js # Payment confirmation component
│   ├── styles/              # CSS styles
│   │   ├── App.css         
│   │   ├── PaymentForm.css 
│   │   └── PaymentComplete.css
│   ├── App.js              # Main React component
│   └── index.js            # React entry point
├── public/                  # Static files
├── package.json            # Frontend dependencies
└── staticwebapp.config.json # Azure Static Web App config
```

## Prerequisites

1. Node.js (v14 or higher)
2. Azure CLI
3. Azure Functions Core Tools
4. Azure SQL Database instance
5. Stripe account with API keys
6. Git

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd rent-payment-app
   ```

2. **Install Dependencies**
   ```bash
   # Install frontend dependencies
   npm install

   # Install backend dependencies
   cd api
   npm install
   cd ..
   ```

3. **Environment Configuration**

   Create a `.env` file in the root directory:
   ```
   REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

   Create `local.settings.json` in the api directory:
   ```json
   {
     "IsEncrypted": false,
     "Values": {
       "FUNCTIONS_WORKER_RUNTIME": "node",
       "AzureWebJobsStorage": "",
       "STRIPE_SECRET_KEY": "your_stripe_secret_key",
       "SQL_SERVER": "your-server.database.windows.net",
       "SQL_DATABASE": "your-database",
       "SQL_USER": "your-username",
       "SQL_PASSWORD": "your-password"
     }
   }
   ```

4. **Database Setup**

   Run the following SQL script to create the required table:
   ```sql
   CREATE TABLE RentPayments (
       Id INT IDENTITY(1,1) PRIMARY KEY,
       TransactionId NVARCHAR(100) NOT NULL,
       RenterName NVARCHAR(255) NOT NULL,
       RentLocation NVARCHAR(500) NOT NULL,
       Amount DECIMAL(10,2) NOT NULL,
       PaymentDate DATETIME NOT NULL,
       Status NVARCHAR(50) NOT NULL,
       StripePaymentId NVARCHAR(100) NOT NULL,
       ZipCode NVARCHAR(10) NOT NULL,
       CreatedAt DATETIME DEFAULT GETDATE(),
       UpdatedAt DATETIME DEFAULT GETDATE()
   );
   ```

5. **Running Locally**
   ```bash
   # Start the frontend
   npm start

   # In a separate terminal, start the API
   cd api
   func start
   ```

   The application will be available at `http://localhost:3000`

## Deployment

The application is configured for deployment to Azure Static Web Apps using GitHub Actions. The workflow file is included in `.github/workflows/`.

To deploy:
1. Create an Azure Static Web App resource
2. Configure the following secrets in your GitHub repository:
   - AZURE_STATIC_WEB_APPS_API_TOKEN
   - REACT_APP_STRIPE_PUBLISHABLE_KEY
   - Other environment variables as needed

## Features

- Secure payment processing with Stripe
- Real-time payment status updates
- Transaction history in Azure SQL Database
- Responsive design
- Error handling and validation
- Payment confirmation page
