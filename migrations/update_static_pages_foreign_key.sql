-- Drop the existing foreign key constraint
ALTER TABLE `static_pages` DROP FOREIGN KEY `static_pages_ibfk_1`;

-- Add new foreign key constraint referencing Users table
ALTER TABLE `static_pages` ADD CONSTRAINT `static_pages_updated_by_fkey` 
FOREIGN KEY (`updated_by`) REFERENCES `Users` (`id`) 
ON DELETE SET NULL ON UPDATE CASCADE;
