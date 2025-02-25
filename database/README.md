# Database Schema Documentation

This folder contains the SQL scripts needed to create and seed the database for the Rent Payment application.

## Setup Instructions

1. First, create a new database in Azure SQL Database
2. Execute the scripts in the following order:

   a. `schema/create-tables.sql` - Creates all necessary tables
   b. `seed/seed-properties.sql` - Adds initial property data

## Database Structure

- **Properties**: Stores all CILA locations
- **Tenants**: Links users to their properties
- **PaymentHistory**: Records all successful payments
- **RentPayments**: Tracks Stripe payment intents

## Environment Setup

Make sure these environment variables are set in your Azure Static Web App configuration: 