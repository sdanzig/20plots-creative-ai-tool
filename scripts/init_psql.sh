#!/bin/bash

# Start the PostgreSQL command line
psql postgres << EOF

-- Drop the database if it already exists
DROP DATABASE IF EXISTS twentyplotsdb;

-- Drop the user if it already exists
DROP USER IF EXISTS twentyplotsadmin;

-- Create the user
CREATE USER twentyplotsadmin WITH PASSWORD '<choose a password>';

-- Create the database
CREATE DATABASE twentyplotsdb;

-- Connect to the new database
\c twentyplotsdb

-- Create the users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Create the registration_keys table
CREATE TABLE registration_keys (
    id SERIAL PRIMARY KEY,
    key VARCHAR(10) UNIQUE NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE
);

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON DATABASE twentyplotsdb TO twentyplotsadmin;

-- Grant all privileges on the users table to the user
GRANT ALL PRIVILEGES ON TABLE users TO twentyplotsadmin;

-- Grant all privileges on the registration_keys table to the user
GRANT ALL PRIVILEGES ON TABLE registration_keys TO twentyplotsadmin;

-- Grant usage on the sequences to the user
GRANT USAGE ON SEQUENCE users_id_seq TO twentyplotsadmin;
GRANT USAGE ON SEQUENCE registration_keys_id_seq TO twentyplotsadmin;

EOF
