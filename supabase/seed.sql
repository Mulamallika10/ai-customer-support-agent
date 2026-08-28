-- =========================================================
-- AI CUSTOMER SUPPORT AGENT
-- MOCK CRM DATA
-- =========================================================


-- =========================================================
-- CUSTOMERS
-- =========================================================

insert into customers
    (customer_code, name, email, phone, status)
values

('CUST001', 'Rahul Sharma', 'rahul.sharma@example.com', '+91-9000000001', 'active'),

('CUST002', 'Priya Reddy', 'priya.reddy@example.com', '+91-9000000002', 'active'),

('CUST003', 'Arjun Kumar', 'arjun.kumar@example.com', '+91-9000000003', 'active'),

('CUST004', 'Sneha Patel', 'sneha.patel@example.com', '+91-9000000004', 'active'),

('CUST005', 'Vikram Singh', 'vikram.singh@example.com', '+91-9000000005', 'active'),

('CUST006', 'Ananya Rao', 'ananya.rao@example.com', '+91-9000000006', 'active'),

('CUST007', 'Karthik Reddy', 'karthik.reddy@example.com', '+91-9000000007', 'active'),

('CUST008', 'Neha Gupta', 'neha.gupta@example.com', '+91-9000000008', 'active'),

('CUST009', 'Rohit Verma', 'rohit.verma@example.com', '+91-9000000009', 'active'),

('CUST010', 'Divya Nair', 'divya.nair@example.com', '+91-9000000010', 'active'),

('CUST011', 'Aditya Mehta', 'aditya.mehta@example.com', '+91-9000000011', 'active'),

('CUST012', 'Pooja Iyer', 'pooja.iyer@example.com', '+91-9000000012', 'active'),

('CUST013', 'Suresh Kumar', 'suresh.kumar@example.com', '+91-9000000013', 'active'),

('CUST014', 'Meera Shah', 'meera.shah@example.com', '+91-9000000014', 'active'),

('CUST015', 'Nikhil Joshi', 'nikhil.joshi@example.com', '+91-9000000015', 'active');


-- =========================================================
-- ORDERS
-- =========================================================


-- CUST001
-- Normal eligible refund
insert into orders
    (order_number, customer_id, product_name, amount,
     order_date, delivery_date, status,
     is_final_sale, is_digital)

select
    'ORD1001',
    id,
    'Wireless Headphones',
    4999.00,
    '2026-08-15',
    '2026-08-20',
    'delivered',
    false,
    false
from customers
where customer_code = 'CUST001';


-- CUST002
-- Refund window exceeded
insert into orders
    (order_number, customer_id, product_name, amount,
     order_date, delivery_date, status,
     is_final_sale, is_digital)

select
    'ORD1002',
    id,
    'Smart Watch',
    7999.00,
    '2026-07-01',
    '2026-07-05',
    'delivered',
    false,
    false
from customers
where customer_code = 'CUST002';


-- CUST003
-- Final sale product
insert into orders
    (order_number, customer_id, product_name, amount,
     order_date, delivery_date, status,
     is_final_sale, is_digital)

select
    'ORD1003',
    id,
    'Clearance Laptop',
    45999.00,
    '2026-08-15',
    '2026-08-19',
    'delivered',
    true,
    false
from customers
where customer_code = 'CUST003';


-- CUST004
-- Digital product
insert into orders
    (order_number, customer_id, product_name, amount,
     order_date, delivery_date, status,
     is_final_sale, is_digital)

select
    'ORD1004',
    id,
    'Software License',
    2999.00,
    '2026-08-18',
    '2026-08-18',
    'delivered',
    false,
    true
from customers
where customer_code = 'CUST004';


-- CUST005
-- Damaged product, eligible
insert into orders
    (order_number, customer_id, product_name, amount,
     order_date, delivery_date, status,
     is_final_sale, is_digital)

select
    'ORD1005',
    id,
    'Bluetooth Speaker',
    3499.00,
    '2026-08-20',
    '2026-08-22',
    'delivered',
    false,
    false
from customers
where customer_code = 'CUST005';


-- CUST006
-- Already refunded
insert into orders
    (order_number, customer_id, product_name, amount,
     order_date, delivery_date, status,
     is_final_sale, is_digital)

select
    'ORD1006',
    id,
    'Gaming Mouse',
    1999.00,
    '2026-08-10',
    '2026-08-14',
    'delivered',
    false,
    false
from customers
where customer_code = 'CUST006';


-- Existing refund for CUST006
insert into refunds
    (order_id, customer_id, reason, amount, status, denial_reason, processed_at)

select
    o.id,
    c.id,
    'Product returned previously',
    1999.00,
    'processed',
    null,
    now()
from orders o
join customers c
    on c.id = o.customer_id
where o.order_number = 'ORD1006';


-- CUST007
-- Cancelled order
insert into orders
    (order_number, customer_id, product_name, amount,
     order_date, delivery_date, status,
     is_final_sale, is_digital)

select
    'ORD1007',
    id,
    'Mechanical Keyboard',
    5999.00,
    '2026-08-21',
    null,
    'cancelled',
    false,
    false
from customers
where customer_code = 'CUST007';


-- CUST008
-- Change of mind within 14 days
insert into orders
    (order_number, customer_id, product_name, amount,
     order_date, delivery_date, status,
     is_final_sale, is_digital)

select
    'ORD1008',
    id,
    'Backpack',
    2499.00,
    '2026-08-15',
    '2026-08-18',
    'delivered',
    false,
    false
from customers
where customer_code = 'CUST008';


-- CUST009
-- Change of mind after 14 days
insert into orders
    (order_number, customer_id, product_name, amount,
     order_date, delivery_date, status,
     is_final_sale, is_digital)

select
    'ORD1009',
    id,
    'Running Shoes',
    3999.00,
    '2026-07-25',
    '2026-07-28',
    'delivered',
    false,
    false
from customers
where customer_code = 'CUST009';


-- CUST010
-- Normal eligible refund
insert into orders
    (order_number, customer_id, product_name, amount,
     order_date, delivery_date, status,
     is_final_sale, is_digital)

select
    'ORD1010',
    id,
    'USB-C Monitor',
    18999.00,
    '2026-08-12',
    '2026-08-17',
    'delivered',
    false,
    false
from customers
where customer_code = 'CUST010';


-- CUST011
-- Recently delivered
insert into orders
    (order_number, customer_id, product_name, amount,
     order_date, delivery_date, status,
     is_final_sale, is_digital)

select
    'ORD1011',
    id,
    'Wireless Earbuds',
    2999.00,
    '2026-08-21',
    '2026-08-24',
    'delivered',
    false,
    false
from customers
where customer_code = 'CUST011';


-- CUST012
-- Final sale
insert into orders
    (order_number, customer_id, product_name, amount,
     order_date, delivery_date, status,
     is_final_sale, is_digital)

select
    'ORD1012',
    id,
    'Refurbished Tablet',
    12999.00,
    '2026-08-12',
    '2026-08-16',
    'delivered',
    true,
    false
from customers
where customer_code = 'CUST012';


-- CUST013
-- Digital product
insert into orders
    (order_number, customer_id, product_name, amount,
     order_date, delivery_date, status,
     is_final_sale, is_digital)

select
    'ORD1013',
    id,
    'Online Course License',
    4999.00,
    '2026-08-20',
    '2026-08-20',
    'delivered',
    false,
    true
from customers
where customer_code = 'CUST013';


-- CUST014
-- Defective product, eligible
insert into orders
    (order_number, customer_id, product_name, amount,
     order_date, delivery_date, status,
     is_final_sale, is_digital)

select
    'ORD1014',
    id,
    'Smartphone',
    29999.00,
    '2026-08-18',
    '2026-08-21',
    'delivered',
    false,
    false
from customers
where customer_code = 'CUST014';


-- CUST015
-- Refund window exceeded
insert into orders
    (order_number, customer_id, product_name, amount,
     order_date, delivery_date, status,
     is_final_sale, is_digital)

select
    'ORD1015',
    id,
    'Laptop Stand',
    2999.00,
    '2026-07-01',
    '2026-07-04',
    'delivered',
    false,
    false
from customers
where customer_code = 'CUST015';