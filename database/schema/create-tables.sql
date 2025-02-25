-- Create Properties table first (CILA locations)
CREATE TABLE Properties (
    PropertyId INT IDENTITY(1,1) PRIMARY KEY,
    PropertyName NVARCHAR(100) NOT NULL
);

-- Create Tenants table with foreign key to Properties
CREATE TABLE Tenants (
    TenantId INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    PropertyId INT,
    FOREIGN KEY (PropertyId) REFERENCES Properties(PropertyId)
);

-- Create PaymentHistory table
CREATE TABLE PaymentHistory (
    PaymentId INT IDENTITY(1,1) PRIMARY KEY,
    TenantId INT,
    Amount DECIMAL(10, 2) NULL,
    PaymentDate DATE NOT NULL,
    PaymentMethod NVARCHAR(50) NULL,
    TransactionId NVARCHAR(100) NULL,
    Status NVARCHAR(50) NULL,
    RentPeriod DATE NULL,
    FOREIGN KEY (TenantId) REFERENCES Tenants(TenantId)
);

-- Create RentPayments table for Stripe payments
CREATE TABLE RentPayments (
    PaymentId INT IDENTITY(1,1) PRIMARY KEY,
    TenantId INT,
    Amount DECIMAL(10, 2) NOT NULL,
    PaymentDate DATETIME NOT NULL,
    StripePaymentId NVARCHAR(100) NULL,
    Status NVARCHAR(50) NOT NULL,
    FOREIGN KEY (TenantId) REFERENCES Tenants(TenantId)
); 