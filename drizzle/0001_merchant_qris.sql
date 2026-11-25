ALTER TABLE `shop_orders` ADD `payment_reference` text;--> statement-breakpoint
CREATE UNIQUE INDEX `shop_orders_payment_reference_idx` ON `shop_orders` (`payment_reference`);