CREATE TABLE `shop_config` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `shop_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`lookup` text NOT NULL,
	`created` integer NOT NULL,
	`method` text NOT NULL,
	`state` text NOT NULL,
	`payment` text NOT NULL,
	`mode` text NOT NULL,
	`total` integer NOT NULL,
	`details` text NOT NULL,
	`qr` text
);
--> statement-breakpoint
CREATE INDEX `shop_orders_created_idx` ON `shop_orders` (`created`);