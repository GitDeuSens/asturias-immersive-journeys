-- Fix admin permissions
INSERT INTO directus_permissions (role, collection, action, permissions, fields) 
VALUES ('fb653f59-649f-47cf-a88b-504d249abd14', '*', '*', '{"_all": true}', NULL);
