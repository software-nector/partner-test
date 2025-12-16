-- Database migration to add AI analysis fields to rewards table
-- Run this in MySQL Workbench or command line

ALTER TABLE rewards 
ADD COLUMN ai_verified BOOLEAN DEFAULT FALSE AFTER rejection_reason,
ADD COLUMN detected_rating INT NULL AFTER ai_verified,
ADD COLUMN detected_comment TEXT NULL AFTER detected_rating,
ADD COLUMN ai_confidence FLOAT NULL AFTER detected_comment,
ADD COLUMN ai_analysis_status VARCHAR(50) DEFAULT 'pending' AFTER ai_confidence;
