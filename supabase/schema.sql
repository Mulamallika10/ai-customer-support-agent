-- =========================================================
-- AI CUSTOMER SUPPORT AGENT
-- DATABASE SCHEMA
-- =========================================================


-- =========================================================
-- 1. EXTENSIONS
-- =========================================================

create extension if not exists "pgcrypto";


-- =========================================================
-- 2. CUSTOMERS
-- =========================================================

create table if not exists customers (
    id uuid primary key default gen_random_uuid(),

    customer_code text unique not null,

    name text not null,

    email text unique not null,

    phone text,

    status text not null default 'active'
        check (status in ('active', 'inactive')),

    created_at timestamptz not null default now()
);


-- =========================================================
-- 3. ORDERS
-- =========================================================

create table if not exists orders (
    id uuid primary key default gen_random_uuid(),

    order_number text unique not null,

    customer_id uuid not null
        references customers(id)
        on delete cascade,

    product_name text not null,

    amount numeric(12,2) not null
        check (amount >= 0),

    order_date date not null,

    delivery_date date,

    status text not null
        check (
            status in (
                'pending',
                'processing',
                'shipped',
                'delivered',
                'cancelled'
            )
        ),

    is_final_sale boolean not null default false,

    is_digital boolean not null default false,

    created_at timestamptz not null default now()
);


-- =========================================================
-- 4. REFUNDS
-- =========================================================

create table if not exists refunds (
    id uuid primary key default gen_random_uuid(),

    order_id uuid not null
        references orders(id)
        on delete cascade,

    customer_id uuid not null
        references customers(id)
        on delete cascade,

    reason text not null,

    amount numeric(12,2) not null
        check (amount >= 0),

    status text not null default 'pending'
        check (
            status in (
                'pending',
                'approved',
                'denied',
                'processed'
            )
        ),

    denial_reason text,

    created_at timestamptz not null default now(),

    processed_at timestamptz
);


-- =========================================================
-- 5. CONVERSATIONS
-- =========================================================

create table if not exists conversations (
    id uuid primary key default gen_random_uuid(),

    customer_id uuid
        references customers(id)
        on delete set null,

    title text,

    status text not null default 'active'
        check (
            status in (
                'active',
                'closed'
            )
        ),

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);


-- =========================================================
-- 6. MESSAGES
-- =========================================================

create table if not exists messages (
    id uuid primary key default gen_random_uuid(),

    conversation_id uuid not null
        references conversations(id)
        on delete cascade,

    role text not null
        check (
            role in (
                'user',
                'assistant',
                'system'
            )
        ),

    content text not null,

    created_at timestamptz not null default now()
);


-- =========================================================
-- 7. AGENT LOGS
-- =========================================================

create table if not exists agent_logs (
    id uuid primary key default gen_random_uuid(),

    conversation_id uuid
        references conversations(id)
        on delete cascade,

    step text not null,

    tool_name text,

    input jsonb,

    output jsonb,

    status text not null
        check (
            status in (
                'started',
                'success',
                'error',
                'retry'
            )
        ),

    error_message text,

    created_at timestamptz not null default now()
);


-- =========================================================
-- 8. INDEXES
-- =========================================================

create index if not exists idx_orders_customer_id
    on orders(customer_id);

create index if not exists idx_orders_order_number
    on orders(order_number);

create index if not exists idx_refunds_order_id
    on refunds(order_id);

create index if not exists idx_refunds_customer_id
    on refunds(customer_id);

create index if not exists idx_conversations_customer_id
    on conversations(customer_id);

create index if not exists idx_messages_conversation_id
    on messages(conversation_id);

create index if not exists idx_agent_logs_conversation_id
    on agent_logs(conversation_id);

create index if not exists idx_agent_logs_created_at
    on agent_logs(created_at);


-- -- =========================================================
-- -- 9. ROW LEVEL SECURITY
-- -- =========================================================

-- alter table customers enable row level security;
-- alter table orders enable row level security;
-- alter table refunds enable row level security;
-- alter table conversations enable row level security;
-- alter table messages enable row level security;
-- alter table agent_logs enable row level security;