/*
  # Create Contact Messages Table

  ## Overview
  This migration creates the contact_messages table for storing customer
  inquiries and contact form submissions from the Lulu Kitchen website.

  ## Tables Created

  ### contact_messages
  Stores all contact form submissions with customer inquiries:

  **Fields:**
  - `id` (uuid, primary key) - Unique message identifier
  - `name` (text) - Customer's full name
  - `phone` (text) - Customer's phone number for callback
  - `email` (text) - Customer's email address (optional)
  - `preferred_date` (text) - Preferred date for callback/meeting (optional)
  - `preferred_time` (text) - Preferred time for callback/meeting (optional)
  - `message` (text) - The customer's message/inquiry
  - `status` (text) - Message status (new/read/replied/archived)
  - `created_at` (timestamptz) - When message was submitted
  - `updated_at` (timestamptz) - Last update timestamp

  ## Indexes
  - `idx_contact_messages_status` - Fast filtering by message status
  - `idx_contact_messages_created_at` - Fast date-based queries for recent messages

  ## Security (Row Level Security)
  - RLS is enabled for secure access control
  - Anonymous users can INSERT messages (for guest contact)
  - Service role has full access for admin operations
  - No public read access (messages are private)

  ## Important Notes
  - Email is optional but phone is required for follow-up
  - All messages start with 'new' status
  - Preferred date/time are optional scheduling hints
  - Messages are private and only accessible to administrators
*/

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contact information
  name text NOT NULL,
  phone text NOT NULL,
  email text DEFAULT '',

  -- Scheduling preferences (optional)
  preferred_date text DEFAULT '',
  preferred_time text DEFAULT '',

  -- Message content
  message text NOT NULL,

  -- Status tracking
  status text NOT NULL DEFAULT 'new',

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contact_messages_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain updated_at
DROP TRIGGER IF EXISTS contact_messages_updated_at ON contact_messages;
CREATE TRIGGER contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_messages_updated_at();

-- Enable Row Level Security
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous and authenticated users to insert messages
CREATE POLICY "Enable insert for anon and authenticated users"
  ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Only service role can read/update/delete
CREATE POLICY "Service role has full access"
  ON contact_messages
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions
GRANT INSERT ON contact_messages TO anon;
GRANT INSERT ON contact_messages TO authenticated;
GRANT ALL ON contact_messages TO service_role;
