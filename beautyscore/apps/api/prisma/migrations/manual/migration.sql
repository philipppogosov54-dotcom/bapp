-- Manual migration: Add surveys, notifications, search_history, product_reports, feedback

-- Create SurveyType enum
DO $$ BEGIN
    CREATE TYPE "SurveyType" AS ENUM ('BASIC', 'DERMATOLOGY', 'TRICHOLOGY', 'CLINICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create ReportStatus enum
DO $$ BEGIN
    CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWING', 'RESOLVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create FeedbackStatus enum
DO $$ BEGIN
    CREATE TYPE "FeedbackStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS "systemPrompt" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "systemPromptVersion" INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "termsAcceptedAt" TIMESTAMP(3);
ALTER TABLE users ADD COLUMN IF NOT EXISTS "marketingAcceptedAt" TIMESTAMP(3);

-- Create surveys table
CREATE TABLE IF NOT EXISTS surveys (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type "SurveyType" NOT NULL,
    version TEXT DEFAULT '1.0',
    answers JSONB NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", type)
);
CREATE INDEX IF NOT EXISTS surveys_userId_idx ON surveys("userId");

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    data JSONB,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS notifications_userId_read_idx ON notifications("userId", read);
CREATE INDEX IF NOT EXISTS notifications_createdAt_idx ON notifications("createdAt");

-- Create search_history table
CREATE TABLE IF NOT EXISTS search_history (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    type TEXT NOT NULL,
    "productId" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS search_history_userId_idx ON search_history("userId");
CREATE INDEX IF NOT EXISTS search_history_createdAt_idx ON search_history("createdAt");

-- Create product_reports table
CREATE TABLE IF NOT EXISTS product_reports (
    id TEXT PRIMARY KEY,
    "productId" TEXT NOT NULL REFERENCES products(id),
    "userId" TEXT,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    status "ReportStatus" DEFAULT 'PENDING',
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS product_reports_productId_idx ON product_reports("productId");
CREATE INDEX IF NOT EXISTS product_reports_status_idx ON product_reports(status);

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    "userId" TEXT,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    screenshot TEXT,
    "ticketId" TEXT UNIQUE,
    status "FeedbackStatus" DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS feedback_status_idx ON feedback(status);
CREATE INDEX IF NOT EXISTS feedback_createdAt_idx ON feedback("createdAt");
