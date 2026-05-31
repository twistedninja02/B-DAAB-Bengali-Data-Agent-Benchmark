import os
import duckdb
import pandas as pd

def get_db_connection(db_path: str = "b_daab.db") -> duckdb.DuckDBPyConnection:
    """
    Establishes a connection to the DuckDB database.
    Can be configured as an in-memory database or persistent file.
    """
    return duckdb.connect(db_path)

def initialize_database(conn: duckdb.DuckDBPyConnection) -> None:
    """
    Creates and populates tables for the Bengali Data Agent Benchmark (B-DAAB).
    Tables:
        - customers: গ্রাহকদের সাধারণ তথ্য
        - products: পণ্যের তালিকা ও মূল্য
        - sales: বিক্রয়ের লেনদেনসমূহ
    """
    # 1. Create customers table
    conn.execute("""
        CREATE OR REPLACE TABLE customers (
            customer_id INTEGER PRIMARY KEY,
            name VARCHAR,
            city VARCHAR,
            tier VARCHAR,
            join_date DATE
        )
    """)
    
    # Insert customers data
    customers_data = [
        (1, 'আবুল কালাম', 'Dhaka', 'Premium', '2023-01-15'),
        (2, 'সাদিয়া রহমান', 'Chittagong', 'Standard', '2023-03-22'),
        (3, 'তাসনিম আহমেদ', 'Sylhet', 'Premium', '2023-06-10'),
        (4, 'নূর ইসলাম', 'Dhaka', 'Standard', '2024-02-18'),
        (5, 'ফারিহা জাহান', 'Rajshahi', 'Basic', '2024-04-05'),
        (6, 'আরিফ হাসান', 'Khulna', 'Premium', '2022-11-30')
    ]
    for row in customers_data:
        conn.execute("INSERT INTO customers VALUES (?, ?, ?, ?, ?)", row)

    # 2. Create products table
    conn.execute("""
        CREATE OR REPLACE TABLE products (
            product_id INTEGER PRIMARY KEY,
            product_name VARCHAR,
            category VARCHAR,
            price DECIMAL(10, 2),
            stock INTEGER
        )
    """)
    
    # Insert products data
    products_data = [
        (101, 'ল্যাপটপ', 'Electronics', 75000.00, 15),
        (102, 'স্মার্টফোন', 'Electronics', 35000.00, 45),
        (103, 'কীবোর্ড', 'Accessories', 1200.00, 120),
        (104, 'মাউস', 'Accessories', 800.00, 8),
        (105, 'হেডফোন', 'Electronics', 2500.00, 30),
        (106, 'অফিস চেয়ার', 'Furniture', 8500.00, 12),
        (107, 'টেবিল ল্যাম্প', 'Home Decor', 1500.00, 3)
    ]
    for row in products_data:
        conn.execute("INSERT INTO products VALUES (?, ?, ?, ?, ?)", row)

    # 3. Create sales table
    conn.execute("""
        CREATE OR REPLACE TABLE sales (
            sale_id INTEGER PRIMARY KEY,
            customer_id INTEGER,
            product_id INTEGER,
            sale_date DATE,
            quantity INTEGER,
            total_amount DECIMAL(12, 2),
            FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
            FOREIGN KEY (product_id) REFERENCES products(product_id)
        )
    """)
    
    # Insert sales data
    sales_data = [
        (1, 1, 101, '2025-01-20', 1, 75000.00),
        (2, 2, 103, '2025-01-22', 2, 2400.00),
        (3, 3, 102, '2025-02-05', 1, 35000.00),
        (4, 1, 104, '2025-02-10', 2, 1600.00),
        (5, 4, 105, '2025-02-15', 3, 7500.00),
        (6, 5, 103, '2025-02-18', 1, 1200.00),
        (7, 6, 101, '2025-02-25', 1, 75000.00),
        (8, 2, 106, '2025-03-02', 1, 8500.00),
        (9, 3, 107, '2025-03-10', 2, 3000.00),
        (10, 4, 102, '2025-03-12', 1, 35000.00)
    ]
    for row in sales_data:
        conn.execute("INSERT INTO sales VALUES (?, ?, ?, ?, ?, ?)", row)

def get_schema_description() -> str:
    """
    Returns SQL Schema definitions as a detailed string.
    This description is used by the Bengali Text-to-SQL agent.
    """
    return """
TABLE schemas and explanations:

1. Table: customers (গ্রাহক টেবিল)
   - customer_id: INTEGER (Primary Key) - অনন্য গ্রাহক আইডি
   - name: VARCHAR - গ্রাহকের নাম (যেমন: 'আবুল কালাম', 'সাদিয়া রহমান')
   - city: VARCHAR - শহরের নাম (যেমন: 'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna')
   - tier: VARCHAR - গ্রাহক টায়ার (যেমন: 'Premium', 'Standard', 'Basic')
   - join_date: DATE - যোগদানের তারিখ (YYYY-MM-DD ফরম্যাট)

2. Table: products (পণ্য টেবিল)
   - product_id: INTEGER (Primary Key) - অনন্য পণ্য আইডি
   - product_name: VARCHAR - পণ্যের নাম (যেমন: 'ল্যাপটপ', 'স্মার্টফোন', 'কীবোর্ড', 'মাউস', 'হেডফোন', 'অফিস চেয়ার', 'টেবিল ল্যাম্প')
   - category: VARCHAR - পণ্যের প্রকার বা ক্যাটাগরি (যেমন: 'Electronics', 'Accessories', 'Furniture', 'Home Decor')
   - price: DECIMAL(10, 2) - পণ্যের মূল্য
   - stock: INTEGER - বর্তমানে স্টকে থাকা পণ্যের পরিমাণ

3. Table: sales (বিক্রয় টেবিল)
   - sale_id: INTEGER (Primary Key) - অনন্য বিক্রয় আইডি
   - customer_id: INTEGER (Foreign Key) - ক্রেতার আইডি (customers.customer_id)
   - product_id: INTEGER (Foreign Key) - বিক্রীত পণ্যের আইডি (products.product_id)
   - sale_date: DATE - বিক্রয়ের তারিখ (YYYY-MM-DD ফরম্যাট)
   - quantity: INTEGER - বিক্রয়ের পরিমাণ (কত পিস পণ্য বিক্রি হয়েছে)
   - total_amount: DECIMAL(12, 2) - মোট বিক্রয় মূল্য (সাধারণত products.price * sales.quantity)
"""

if __name__ == "__main__":
    # Test initialization
    conn = get_db_connection(":memory:")
    initialize_database(conn)
    print("Database Initialized successfully.")
    print("Available tables:")
    print(conn.execute("SHOW TABLES").fetchall())
    conn.close()
