const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'university_sms_ssms.sql');
let sql = fs.readFileSync(filePath, 'utf8');

console.log('Original SQL length:', sql.length);

// 1. Remove the outer TRY...CATCH and TRANSACTION wrapper
// We use more flexible regex to handle potential whitespace/newlines
sql = sql.replace(/^\s*BEGIN TRY\s+BEGIN TRAN;\s*/i, '');
sql = sql.replace(/\s*COMMIT TRAN;\s*END TRY\s+BEGIN CATCH[\s\S]*?END CATCH\s*/gi, '\n');

// 2. Add GO after each CREATE TABLE block (detecting the end by ');' followed by optional newline)
sql = sql.replace(/(CREATE TABLE \[dbo\]\.\[\w+\] \([\s\S]+?\);)/g, '$1\nGO');

// 3. Add GO after each ALTER TABLE block
sql = sql.replace(/(ALTER TABLE \[dbo\]\.\[\w+\] ADD CONSTRAINT [\s\S]+?;)/g, '$1\nGO');

// 4. Clean up any double GOs or extra whitespace
sql = sql.replace(/GO\nGO/g, 'GO');
sql = sql.trim();

// 5. Ensure the file starts with instructions
const header = `-- University SMS Database Export for SSMS
-- Normalized for compatibility
--
-- INSTRUCTIONS: 
-- 1. Create your database: CREATE DATABASE [university_sms];
-- 2. Select the database: USE [university_sms];
-- 3. Run this script.

SET NOCOUNT ON;
GO

`;

fs.writeFileSync(filePath, header + sql, 'utf8');
console.log('SQL normalized for SSMS compatibility. New length:', (header + sql).length);
