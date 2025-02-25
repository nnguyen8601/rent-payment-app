-- Create Properties table first (CILA locations)
CREATE TABLE Properties (
    PropertyId INT IDENTITY(1,1) PRIMARY KEY,
    PropertyName NVARCHAR(100) NOT NULL
);

-- Create Tenants table with foreign key to Properties
CREATE TABLE Tenants (
    TenantId INT IDENTITY(1,1) PRIMARY KEY,
    FirstName NVARCHAR(100),
    LastName NVARCHAR(100),
    Email NVARCHAR(255) UNIQUE,
    PropertyId INT,
    RegistrationDate DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (PropertyId) REFERENCES Properties(PropertyId)
);

-- Create PaymentHistory table
CREATE TABLE PaymentHistory (
    HistoryId INT IDENTITY(1,1) PRIMARY KEY,
    TenantId INT,
    Amount DECIMAL(10,2),
    PaymentDate DATETIME,
    PaymentMethod NVARCHAR(50),
    TransactionId NVARCHAR(255),
    Status NVARCHAR(50),
    RentPeriod DATE,
    FOREIGN KEY (TenantId) REFERENCES Tenants(TenantId)
);

-- Create RentPayments table for Stripe payments
CREATE TABLE RentPayments (
    PaymentId INT IDENTITY(1,1) PRIMARY KEY,
    TenantId INT,
    Amount DECIMAL(10,2),
    PaymentDate DATETIME DEFAULT GETDATE(),
    StripePaymentId NVARCHAR(255),
    Status NVARCHAR(50),
    FOREIGN KEY (TenantId) REFERENCES Tenants(TenantId)
); 