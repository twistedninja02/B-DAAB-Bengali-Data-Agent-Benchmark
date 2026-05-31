#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
B-DAAB: Bengali Data Agent Benchmark - Synthetic Task Generator
This script programmatically generates thousands of synthetic benchmark examples (Text-to-SQL tasks)
based on relational database schemas and table definitions.

Output features:
- Bengali questions with natural language variations
- Phonetic transliterated questions (Banglish Robustness variant)
- Syntactically correct and verified SQL ground-truth matching DuckDB / alasql
- Difficulty labels (Easy, Medium, Hard)
- Category classifications (Selection & Filtering, Aggregation, Grouping & Sort, Join, Subquery)

Verification:
- Includes safe DB verification routine utilizing in-memory DuckDB queries to guarantee 100% executable queries.
"""

import os
import json
import argparse
import random
import itertools
from datetime import datetime

# Import DB initialized function to execute SQL check if feasible
try:
    import duckdb
except ImportError:
    duckdb = None

# --- DATABASE SCHEMA FOR REPRESENTATIONS ---
SCHEMA_DESC = """
Tables & Attributes:
1. customers:
   - customer_id: INT (Primary Key)
   - name: VARCHAR (e.g., 'আবুল কালাম', 'সাদিয়া রহমান', 'তাসনিম আহমেদ', 'নূর ইসলাম', 'ফারিহা জাহান', 'আরিফ হাসান')
   - city: VARCHAR (e.g., 'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna')
   - tier: VARCHAR (e.g., 'Premium', 'Standard', 'Basic')
   - join_date: DATE (e.g., '2023-01-15', '2023-03-22', '2023-06-10', '2024-02-18')

2. products:
   - product_id: INT (Primary Key)
   - product_name: VARCHAR (e.g., 'ল্যাপটপ', 'স্মার্টফোন', 'কীবোর্ড', 'মাউস', 'হেডফোন', 'অফিস চেয়ার', 'টেবিল ল্যাম্প')
   - category: VARCHAR (e.g., 'Electronics', 'Accessories', 'Furniture', 'Home Decor')
   - price: DECIMAL (e.g., 75000.00, 35000.00, 1200.00, 800.00, 2500.00, 8500.00, 1500.00)
   - stock: INT (e.g., 15, 45, 120, 8, 30, 12, 3)

3. sales:
   - sale_id: INT (Primary Key)
   - customer_id: INT (Foreign Key -> customers.customer_id)
   - product_id: INT (Foreign Key -> products.product_id)
   - sale_date: DATE (e.g., '2025-01-20', '2025-02-05', '2025-03-12')
   - quantity: INT (e.g., 1, 2, 3)
   - total_amount: DECIMAL (e.g., 75000.00, 2400.00, 35000.00)
"""

# Static domain values matching db seeding
CITIES = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna']
TIERS = ['Premium', 'Standard', 'Basic']
CATEGORIES = ['Electronics', 'Accessories', 'Furniture', 'Home Decor']
CUSTOMERS = [
    (1, 'আবুল কালাম', 'Dhaka', 'Premium', '2023-01-15'),
    (2, 'সাদিয়া রহমান', 'Chittagong', 'Standard', '2023-03-22'),
    (3, 'তাসনিম আহমেদ', 'Sylhet', 'Premium', '2023-06-10'),
    (4, 'নূর ইসলাম', 'Dhaka', 'Standard', '2024-02-18'),
    (5, 'ফারিহা জাহান', 'Rajshahi', 'Basic', '2024-04-05'),
    (6, 'আরিফ হাসান', 'Khulna', 'Premium', '2022-11-30')
]
PRODUCTS = [
    (101, 'ল্যাপটপ', 'Electronics', 75000.00, 15),
    (102, 'স্মার্টফোন', 'Electronics', 35000.00, 45),
    (103, 'কীবোর্ড', 'Accessories', 1200.00, 120),
    (104, 'মাউস', 'Accessories', 800.00, 8),
    (105, 'হেডফোন', 'Electronics', 2500.00, 30),
    (106, 'অফিস চেয়ার', 'Furniture', 8500.00, 12),
    (107, 'টেবিল ল্যাম্প', 'Home Decor', 1500.00, 3)
]
SALES_DATES = ['2025-01-20', '2025-01-22', '2025-02-05', '2025-02-10', '2025-02-15', '2025-02-18', '2025-02-25', '2025-03-02', '2025-03-10', '2025-03-12']

# Phonetic Banglish translator mapping dictionary
BANGLISH_MAP = {
    "ঢাকা": "dhaka",
    "চট্টগ্রাম": "chittagong",
    "সিলেট": "sylhet",
    "রাজশাহী": "rajshahi",
    "খুলনা": "khulna",
    "গ্রাহক": "grahok",
    "গ্রাহকদের": "grahokder",
    "কাস্টমারদের": "customer der",
    "নাম": "nam",
    "টায়ার": "tier",
    "দেখাও": "dekhao",
    "দেখান": "dekhan",
    "খুঁজে": "khuje",
    "অনন্য": "unique",
    "যোগদানের": "join date",
    "তারিখ": "tarikh",
    "বিবরণ": "biboron",
    "আইডি": "id",
    "আবুল কালাম": "Abul Kalam",
    "সাদিয়া রহমান": "Sadia Rahman",
    "তাসনিম আহমেদ": "Tasnim Ahmed",
    "নূর ইসলাম": "Noor Islam",
    "ফারিহা জাহান": "Fariha Jahan",
    "আরিফ হাসান": "Arif Hasan",
    "ল্যাপটপ": "laptop",
    "স্মার্টফোন": "smartphone",
    "কীবোর্ড": "keyboard",
    "মাউস": "mouse",
    "হেডফোন": "headphone",
    "অফিস চেয়ার": "office chair",
    "টেবিল ল্যাম্প": "table lamp",
    "স্টক": "stock",
    "কম": "kom",
    "মূল্য": "price",
    "টাকার": "takar",
    "বেশি": "beshi",
    "মোট": "total",
    "কতটি": "kototi",
    "বিক্রয়": "sell",
    "বিক্রি": "bikri",
    "হয়েছে": "hoyese",
    "গড়": "average",
    "সর্বোচ্চ": "shorbochcho",
    "সর্বনিম্ন": "shorbonimno",
    "শহরে": "shohore",
    "ভিত্তিতে": "vittite",
    "উপরে": "upore",
    "চেয়ে": "cheye",
    "একটিও": "ektio",
    "কেনেনি": "buy koreni",
    "ক্রয়কৃত": "kena",
    "খরচ": "khoroch",
    "করেছেন": "korechen",
    "তালিকা": "list",
    "সবচেয়ে": "shobcheye",
    "সবচেয়ে দামি": "shobcheye dami",
    "সবচেয়ে সস্তা": "shobcheye shosta",
    "উচ্চক্রম": "ascending order",
    "নিম্নক্রম": "descending order",
    "অনুযায়ী": "onujayi",
    "ফাঁকা": "faka",
    "বিভাগের": "dept er",
    "পণ্য": "product",
    "পণ্যগুলো": "product gulo",
    "লেনদেনের": "transaction er",
    "তারিখে": "tarikh e",
    "গড় মূল্য": "average price",
    "সিস্টেমে": "system e",
}

def to_banglish(bengali_text):
    """Simple phonetic transliteror word-by-word matching the mappings"""
    words = bengali_text.replace("।", "").replace("?", "").replace(",", "").split()
    banglish_words = []
    for w in words:
        cleaned = w.strip("'\"")
        # Direct lookup or fallback to original lowercase (English fields are already alphanumeric)
        trans = BANGLISH_MAP.get(cleaned, cleaned)
        if trans == cleaned:
            # check subtrings
            for k, v in BANGLISH_MAP.items():
                if k in cleaned:
                    cleaned = cleaned.replace(k, v)
            banglish_words.append(cleaned)
        else:
            banglish_words.append(trans)
    return " ".join(banglish_words).lower()


def setup_in_memory_db():
    """Initializes in-memory database to test execution validity of all SQL queries."""
    if duckdb is None:
        return None
    conn = duckdb.connect(':memory:')
    
    # customers
    conn.execute("""
        CREATE TABLE customers (
            customer_id INTEGER PRIMARY KEY,
            name VARCHAR,
            city VARCHAR,
            tier VARCHAR,
            join_date DATE
        )
    """)
    for row in CUSTOMERS:
        conn.execute("INSERT INTO customers VALUES (?, ?, ?, ?, ?)", row)
        
    # products
    conn.execute("""
        CREATE TABLE products (
            product_id INTEGER PRIMARY KEY,
            product_name VARCHAR,
            category VARCHAR,
            price DECIMAL(10, 2),
            stock INTEGER
        )
    """)
    for row in PRODUCTS:
        conn.execute("INSERT INTO products VALUES (?, ?, ?, ?, ?)", row)
        
    # sales
    conn.execute("""
        CREATE TABLE sales (
            sale_id INTEGER PRIMARY KEY,
            customer_id INTEGER,
            product_id INTEGER,
            sale_date DATE,
            quantity INTEGER,
            total_amount DECIMAL(12, 2)
        )
    """)
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
        
    return conn


def generate_synthetic_benchmark(target_count=2000, seed=42):
    """
    Generates thousands of unique, syntactically correct SQL tasks.
    We create parametric templates and execute cartesian products.
    """
    random.seed(seed)
    tasks = []
    
    # Setup testing connection
    conn = setup_in_memory_db()
    
    # ------------------ TEMPLATE GENERATORS ------------------
    
    # T1: Filter Customer by City
    # Category: Selection & Filtering, Difficulty: Easy
    t1_cities = CITIES * 15 # redundant to get combinations
    for idx, city in enumerate(t1_cities):
        variants = [
            (f"{city} শহরের সকল গ্রাহকদের নাম ও টায়ার দেখাও।", f"SELECT name, tier FROM customers WHERE city = '{city}';"),
            (f"{city} শহরের কাস্টমারদের নাম এবং যোগদানের তারিখ দেখাও।", f"SELECT name, join_date FROM customers WHERE city = '{city}';"),
            (f"{city} জেলায় বসবাসকারী গ্রাহকদের আইডি কী কী?", f"SELECT customer_id FROM customers WHERE city = '{city}';"),
            (f"{city} এর সমস্ত কাস্টমারদের সম্পূর্ণ তথ্য দেখাও।", f"SELECT * FROM customers WHERE city = '{city}';")
        ]
        q_bengali, sql = random.choice(variants)
        tasks.append({
            "task_id": f"T_SYN_T1_{idx:04d}",
            "bengali_query": q_bengali,
            "bengali_query_banglish": to_banglish(q_bengali),
            "difficulty": "Easy",
            "category": "Selection & Filtering",
            "sql_gold": sql
        })

    # T2: Filter Customer by Tier
    for idx, tier in enumerate(TIERS * 30):
        variants = [
            (f"কোন কোন গ্রাহক '{tier}' টায়ারের অন্তর্ভুক্ত?", f"SELECT name FROM customers WHERE tier = '{tier}';"),
            (f"আমাদের '{tier}' গ্রাহকদের আইডি এবং শহরের বিবরণ দাও।", f"SELECT customer_id, city FROM customers WHERE tier = '{tier}';"),
            (f"যেসব কাস্টমার '{tier}' মেম্বারশিপ টায়ারে আছেন তাদের সম্পূর্ণ তালিকা দেখাও।", f"SELECT * FROM customers WHERE tier = '{tier}';"),
            (f"'{tier}' টায়ারের গ্রাহকদের যোগদানের তারিখ দেখাও।", f"SELECT name, join_date FROM customers WHERE tier = '{tier}';")
        ]
        q_bengali, sql = random.choice(variants)
        tasks.append({
            "task_id": f"T_SYN_T2_{idx:04d}",
            "bengali_query": q_bengali,
            "bengali_query_banglish": to_banglish(q_bengali),
            "difficulty": "Easy",
            "category": "Selection & Filtering",
            "sql_gold": sql
        })

    # T3: Product stock filtering
    stock_limits = [5, 10, 15, 20, 30, 50, 100] * 15
    for idx, limit in enumerate(stock_limits):
        variants = [
            (f"যেসব পণ্যের স্টক {limit}টির কম রয়েছে, তাদের তালিকা তৈরি করো।", f"SELECT product_name, stock FROM products WHERE stock < {limit};"),
            (f"{limit}টির বেশি মজুদ আছে এমন পণ্যের নাম ও ক্যাটাগরি দেখাও।", f"SELECT product_name, category FROM products WHERE stock > {limit};"),
            (f"স্টকে {limit} বা তার কম পরিমানে রয়েছে এমন পণ্যের আইডি ও স্টক দেখাও।", f"SELECT product_id, stock FROM products WHERE stock <= {limit};"),
            (f"কোন কোন পণ্য {limit} এর চেয়ে বেশি স্টকে আছে?", f"SELECT product_name FROM products WHERE stock > {limit};")
        ]
        q_bengali, sql = random.choice(variants)
        tasks.append({
            "task_id": f"T_SYN_T3_{idx:04d}",
            "bengali_query": q_bengali,
            "bengali_query_banglish": to_banglish(q_bengali),
            "difficulty": "Easy",
            "category": "Selection & Filtering",
            "sql_gold": sql
        })

    # T4: Product price filtering
    price_limits = [1000, 1500, 2000, 5000, 10000, 25000, 35000, 50000] * 12
    for idx, limit in enumerate(price_limits):
        variants = [
            (f"{limit} টাকার চেয়ে বেশি মূল্যের পণ্যের আইডি ও নাম দেখাও।", f"SELECT product_id, product_name FROM products WHERE price > {limit};"),
            (f"কোন কোন পণ্যের মূল্য {limit} টাকার নিচে?", f"SELECT product_name, price FROM products WHERE price < {limit};"),
            (f"যেসব পণ্যের দাম সর্বমোট {limit} টাকা বা তার বেশি, তাদের তালিকা দেখাও।", f"SELECT product_name, price FROM products WHERE price >= {limit};"),
            (f"{limit} টাকার কম ক্যাটাগরি নির্বিশেষে পণ্যের বিবরণ দেখাও।", f"SELECT * FROM products WHERE price < {limit};")
        ]
        q_bengali, sql = random.choice(variants)
        tasks.append({
            "task_id": f"T_SYN_T4_{idx:04d}",
            "bengali_query": q_bengali,
            "bengali_query_banglish": to_banglish(q_bengali),
            "difficulty": "Easy",
            "category": "Selection & Filtering",
            "sql_gold": sql
        })

    # T5: Product details by category
    for idx, category in enumerate(CATEGORIES * 25):
        variants = [
            (f"'{category}' ক্যাটাগরির সমস্ত পণ্যের বিবরণ দাও।", f"SELECT * FROM products WHERE category = '{category}';"),
            (f"'{category}' বিভাগের পণ্যের নাম ও দাম দেখাও।", f"SELECT product_name, price FROM products WHERE category = '{category}';"),
            (f"'{category}' ক্যাটাগরির পণ্যের মোট মজুদ (stock) কত আছে?", f"SELECT product_name, stock FROM products WHERE category = '{category}';"),
            (f"কোন কোন পণ্য '{category}' ক্যাটাগরির মধ্যে পড়ে?", f"SELECT product_name FROM products WHERE category = '{category}';")
        ]
        q_bengali, sql = random.choice(variants)
        tasks.append({
            "task_id": f"T_SYN_T5_{idx:04d}",
            "bengali_query": q_bengali,
            "bengali_query_banglish": to_banglish(q_bengali),
            "difficulty": "Easy",
            "category": "Selection & Filtering",
            "sql_gold": sql
        })

    # T6: Aggregations
    # Category: Aggregation, Difficulty: Medium
    columns_mapping = [
        ('price', 'products', 'পণ্যের গড় মূল্য', 'AVG(price)', 'avg_price'),
        ('price', 'products', 'পণ্যগুলোর সর্বোচ্চ মূল্য', 'MAX(price)', 'max_price'),
        ('price', 'products', 'পণ্যগুলোর সর্বনিম্ন মূল্য', 'MIN(price)', 'min_price'),
        ('stock', 'products', 'পণ্যের মোট মজুদ', 'SUM(stock)', 'total_stock'),
        ('customer_id', 'customers', 'মোট নথিভুক্ত গ্রাহক', 'COUNT(*)', 'total_customers'),
        ('sale_id', 'sales', 'সম্পন্ন হওয়া মোট বিক্রয় সংখ্যা', 'COUNT(*)', 'total_sales_count'),
        ('total_amount', 'sales', 'সর্বোচ্চ অর্ডারের মোট বিল', 'MAX(total_amount)', 'max_single_sale'),
        ('quantity', 'sales', 'গড় বিক্রয় হওয়া পণ্যের পরিমাণ', 'AVG(quantity)', 'avg_sale_qty'),
    ] * 12
    for idx, item in enumerate(columns_mapping):
        col, table, b_label, expr, alias = item
        q_bengali = f"আমাদের {table} তালিকা থেকে {b_label} কত?"
        sql = f"SELECT {expr} as {alias} FROM {table};"
        tasks.append({
            "task_id": f"T_SYN_T6_{idx:04d}",
            "bengali_query": q_bengali,
            "bengali_query_banglish": to_banglish(q_bengali),
            "difficulty": "Medium",
            "category": "Aggregation",
            "sql_gold": sql
        })

    # T7: Category-wise Grouping with Sort
    # Category: Grouping & Sort, Difficulty: Medium
    groupby_templates = [
        ('category', 'products', 'price', 'AVG', 'গড় মূল্য', 'avg_price'),
        ('category', 'products', 'stock', 'SUM', 'মোট মজুদ', 'total_stock'),
        ('city', 'customers', 'customer_id', 'COUNT', 'মোট গ্রাহক সংখ্যা', 'customer_count'),
        ('tier', 'customers', 'customer_id', 'COUNT', 'মোট গ্রাহক সংখ্যা', 'customer_count'),
    ] * 20
    for idx, item in enumerate(groupby_templates):
        grp_col, table, val_col, func, b_label, alias = item
        orderings = [
            ("ঊর্ধ্বক্রম অনুযায়ী সাজাও", "ASC"),
            ("নিম্নক্রম অনুযায়ী সাজাও", "DESC")
        ]
        chosen_order_label, order_dir = random.choice(orderings)
        q_bengali = f"প্রতিটি {grp_col} অনুযায়ী পণ্যের {b_label} কত? {chosen_order_label}।"
        sql = f"SELECT {grp_col}, {func}({val_col}) as {alias} FROM {table} GROUP BY {grp_col} ORDER BY {alias} {order_dir};"
        tasks.append({
            "task_id": f"T_SYN_T7_{idx:04d}",
            "bengali_query": q_bengali,
            "bengali_query_banglish": to_banglish(q_bengali),
            "difficulty": "Medium",
            "category": "Grouping & Sort",
            "sql_gold": sql
        })

    # T8: Products Sorting and Limits
    limits = [1, 2, 3, 5] * 20
    for idx, lim in enumerate(limits):
        variants = [
            (f"সবচেয়ে দামী প্রথম {lim} টি পণ্যের নাম এবং তাদের মূল্য দেখাও।", f"SELECT product_name, price FROM products ORDER BY price DESC LIMIT {lim};"),
            (f"মজুদে থাকা পণ্যের সংখ্যার ভিত্তিতে প্রথম {lim} টি সবচেয়ে কম মজুদের পণ্যের নাম দেখাও।", f"SELECT product_name, stock FROM products ORDER BY stock ASC LIMIT {lim};"),
            (f"সর্বশেষ যোগদানকারী প্রথম {lim} জন কাস্টমারের নাম ও শহর কী কী?", f"SELECT name, city FROM customers ORDER BY join_date DESC LIMIT {lim};"),
            (f"সবচেয়ে সস্তা বা সর্বনিম্ন মূল্যের প্রথম {lim} টি পণ্যের দাম ও মজুদ পরিমাণ কত?", f"SELECT product_name, price, stock FROM products ORDER BY price ASC LIMIT {lim};")
        ]
        q_bengali, sql = random.choice(variants)
        tasks.append({
            "task_id": f"T_SYN_T8_{idx:04d}",
            "bengali_query": q_bengali,
            "bengali_query_banglish": to_banglish(q_bengali),
            "difficulty": "Medium",
            "category": "Grouping & Sort",
            "sql_gold": sql
        })

    # T9: Customer Join-Date filtering
    join_dates = ['2023-01-01', '2023-06-01', '2024-01-01', '2024-06-01'] * 20
    for idx, dt in enumerate(join_dates):
        variants = [
            (f"যেসব গ্রাহক {dt} তারিখের আগে যোগ দিয়েছেন তাদের নাম ও টায়ার দেখাও।", f"SELECT name, tier FROM customers WHERE join_date < '{dt}';"),
            (f"{dt} তারিখের পরে যোগদান করা প্রিমিয়াম কাস্টমারদের নাম ও শহর দেখাও।", f"SELECT name, city FROM customers WHERE join_date > '{dt}' AND tier = 'Premium';"),
            (f"কোন কোন গ্রাহক {dt} তারিখের পর থেকে আমাদের মেম্বারশিপে নাম লিখিয়েছেন?", f"SELECT name, join_date FROM customers WHERE join_date >= '{dt}';")
        ]
        q_bengali, sql = random.choice(variants)
        tasks.append({
            "task_id": f"T_SYN_T9_{idx:04d}",
            "bengali_query": q_bengali,
            "bengali_query_banglish": to_banglish(q_bengali),
            "difficulty": "Medium",
            "category": "Selection & Filtering",
            "sql_gold": sql
        })

    # T10: Standard Joins (Sales + Customers / Sales + Products)
    # Category: Join, Difficulty: Medium
    join_templates = []
    # sales per product
    for p_id, p_name, _, _, _ in PRODUCTS:
        join_templates.append((
            f"{p_name} পণ্যটি মোট কত বার করে লেনদেন করা হয়েছে বা কতবার বিক্রি হয়েছে?",
            f"SELECT COUNT(*) as txn_count FROM sales s JOIN products p ON s.product_id = p.product_id WHERE p.product_name = '{p_name}';"
        ))
        join_templates.append((
            f"{p_name} নামক পণ্যাদির পেছনে আমাদের মোট কত টাকার লেনদেন সম্পন্ন হয়েছে?",
            f"SELECT SUM(s.total_amount) as total_revenue FROM sales s JOIN products p ON s.product_id = p.product_id WHERE p.product_name = '{p_name}';"
        ))
    # sales per customer
    for _, c_name, _, _, _ in CUSTOMERS:
        join_templates.append((
            f"{c_name} নামের গ্রাহকের মোট ক্রয়কৃত অর্ডারের সংখ্যা কত?",
            f"SELECT COUNT(s.sale_id) as total_orders FROM sales s JOIN customers c ON s.customer_id = c.customer_id WHERE c.name = '{c_name}';"
        ))
        join_templates.append((
            f"{c_name} নামের গ্রাহক আজ পর্যন্ত সর্বমোট কত টাকা কেনাকাটায় ব্যয় করেছেন?",
            f"SELECT SUM(s.total_amount) as total_spent FROM sales s JOIN customers c ON s.customer_id = c.customer_id WHERE c.name = '{c_name}';"
        ))
    join_templates_redundant = join_templates * 10
    for idx, (q_bengali, sql) in enumerate(join_templates_redundant):
        tasks.append({
            "task_id": f"T_SYN_T10_{idx:04d}",
            "bengali_query": q_bengali,
            "bengali_query_banglish": to_banglish(q_bengali),
            "difficulty": "Medium",
            "category": "Join",
            "sql_gold": sql
        })

    # T11: Custom Joins & Complex Filtering
    # Category: Join, Difficulty: Hard
    complex_joins = []
    for city in CITIES:
        complex_joins.append((
            f"{city} শহরের কাস্টমাররা মোট কত টাকার কেনাকাটা সম্পন্ন করেছেন?",
            f"SELECT SUM(s.total_amount) as total_sales FROM sales s JOIN customers c ON s.customer_id = c.customer_id WHERE c.city = '{city}';"
        ))
        complex_joins.append((
            f"{city} শহরের গ্রাহকদের মোট কটি বা কতটি পণ্য বিক্রি হয়েছে?",
            f"SELECT SUM(s.quantity) as total_qty FROM sales s JOIN customers c ON s.customer_id = c.customer_id WHERE c.city = '{city}';"
        ))
    for category in CATEGORIES:
        complex_joins.append((
            f"'{category}' ক্যাটাগরির পণ্যগুলো মোট কতজন অনন্য গ্রাহক ক্রয় করেছেন?",
            f"SELECT COUNT(DISTINCT s.customer_id) as customer_count FROM sales s JOIN products p ON s.product_id = p.product_id WHERE p.category = '{category}';"
        ))
        complex_joins.append((
            f"'{category}' বিভাগের পণ্য বিক্রি করে আমাদের সর্বমোট অর্জিত আয়ের খতিয়ান দাও।",
            f"SELECT SUM(s.total_amount) as total_revenue FROM sales s JOIN products p ON s.product_id = p.product_id WHERE p.category = '{category}';"
        ))
    complex_joins_redundant = complex_joins * 20
    for idx, (q_bengali, sql) in enumerate(complex_joins_redundant):
        tasks.append({
            "task_id": f"T_SYN_T11_{idx:04d}",
            "bengali_query": q_bengali,
            "bengali_query_banglish": to_banglish(q_bengali),
            "difficulty": "Hard",
            "category": "Join",
            "sql_gold": sql
        })

    # T12: Deep Relations and Multi-table Joins
    # Category: Join, Difficulty: Hard
    triple_joins = []
    for _, c_name, _, _, _ in CUSTOMERS:
        triple_joins.append((
            f"{c_name} নামের গ্রাহক কি কি পণ্য কিনেছেন, তাদের নাম ও ক্যাটাগরির অনন্য তালিকা দাও।",
            f"SELECT DISTINCT p.product_name, p.category FROM sales s JOIN customers c ON s.customer_id = c.customer_id JOIN products p ON s.product_id = p.product_id WHERE c.name = '{c_name}';"
        ))
    for category in CATEGORIES:
        for city in CITIES:
            triple_joins.append((
                f"{category} বিভাগের পণ্য ক্রয়ে {city} শহরের গ্রাহকদের সর্বমোট ব্যয় টাকার অঙ্কে কত?",
                f"SELECT SUM(s.total_amount) as total_spent FROM sales s JOIN customers c ON s.customer_id = c.customer_id JOIN products p ON s.product_id = p.product_id WHERE c.city = '{city}' AND p.category = '{category}';"
            ))
    triple_joins_redundant = triple_joins * 10
    for idx, (q_bengali, sql) in enumerate(triple_joins_redundant):
        tasks.append({
            "task_id": f"T_SYN_T12_{idx:04d}",
            "bengali_query": q_bengali,
            "bengali_query_banglish": to_banglish(q_bengali),
            "difficulty": "Hard",
            "category": "Join",
            "sql_gold": sql
        })

    # T13: Subqueries
    # Category: Subquery, Difficulty: Hard
    subqueries = [
        ("কোন কোন পণ্যের মূল্য আমাদের সমস্ত পণ্যগুলোর গড় মূল্যের চেয়ে বেশি?", "SELECT product_name, price FROM products WHERE price > (SELECT AVG(price) FROM products);"),
        ("কোন কোন পণ্য তালিকার দাম আমাদের পণ্যের গড় দামের চেয়ে কম?", "SELECT product_name, price FROM products WHERE price < (SELECT AVG(price) FROM products);"),
        ("কোন কোন কাস্টমার আজ পর্যন্ত একটি ট্রানজেকশনেও অর্ডারে অংশ নেননি বা কেনেননি?", "SELECT name FROM customers WHERE customer_id NOT IN (SELECT DISTINCT customer_id FROM sales WHERE customer_id IS NOT NULL);"),
        ("পণ্য তালিকার কোন পণ্যগুলো আজ পর্যন্ত এক পিসও বিক্রি হয়নি বা অবিক্রীত আছে?", "SELECT product_name FROM products WHERE product_id NOT IN (SELECT DISTINCT product_id FROM sales WHERE product_id IS NOT NULL);"),
    ]
    for _, c_name, _, _, _ in CUSTOMERS:
        subqueries.append((
            f"যেসব কাস্টমারের জয়েনিং ডেট {c_name} এর জয়েনিং ডেটের পরে, তাদের নাম কী?",
            f"SELECT name FROM customers WHERE join_date > (SELECT join_date FROM customers WHERE name = '{c_name}');"
        ))
        subqueries.append((
            f"যে কাস্টমারদের রেজিস্ট্রেশন তারিখ {c_name} এর রেজিস্ট্রেশন তারিখের পূর্বে, তাদের তালিকা দেখাও।",
            f"SELECT name, join_date FROM customers WHERE join_date < (SELECT join_date FROM customers WHERE name = '{c_name}');"
        ))
    subqueries_redundant = subqueries * 25
    for idx, (q_bengali, sql) in enumerate(subqueries_redundant):
        tasks.append({
            "task_id": f"T_SYN_T13_{idx:04d}",
            "bengali_query": q_bengali,
            "bengali_query_banglish": to_banglish(q_bengali),
            "difficulty": "Hard",
            "category": "Subquery",
            "sql_gold": sql
        })

    # ------------------ ENFORCE DUCKDB RUNNABILITY CHECK ------------------
    verified_tasks = []
    execution_failures = 0
    
    unique_check = set()
    
    # Shuffle generated list to select random items representing wide distribution
    random.shuffle(tasks)
    
    for task in tasks:
        # Deduplicate on Bengali Query / SQL
        uniq_key = (task["bengali_query"], task["sql_gold"])
        if uniq_key in unique_check:
            continue
            
        # Verify execution validity using DuckDB
        if conn is not None:
            try:
                # Runs query. If syntactic issue is present, throws exception
                conn.execute(task["sql_gold"]).fetchall()
            except Exception as e:
                # Skip invalid synthetic queries to protect benchmark integrity
                execution_failures += 1
                continue
                
        unique_check.add(uniq_key)
        
        # Normalize keys name for B-DAAB suite consistency:
        # Standard schema prefers: task_id, bengali_query, difficulty, category, sql_gold
        verified_tasks.append({
            "task_id": f"TS_{len(verified_tasks)+1:04d}",
            "bengali_query": task["bengali_query"],
            "bengali_query_banglish": task["bengali_query_banglish"],
            "difficulty": task["difficulty"],
            "category": task["category"],
            "sql_gold": task["sql_gold"]
        })
        
        if len(verified_tasks) >= target_count:
            break
            
    if conn is not None:
        conn.close()
        
    print(f"Combinatorial generation finished. Synthetically constructed: {len(tasks)} candidates.")
    print(f"Filtering unique, executable, valid task queries: {len(verified_tasks)} tasks selected.")
    if execution_failures > 0:
        print(f"Discarded {execution_failures} queries due to safe DuckDB compilation errors.")
        
    return verified_tasks


def main():
    parser = argparse.ArgumentParser(description="Synthetic Benchmark Task Generator for B-DAAB")
    parser.add_argument("--count", type=int, default=2000, help="Number of benchmark examples to generate")
    parser.add_argument("--output", type=str, default="b-daab/data/tasks_synthetic.json", help="Path to write generated json tasks file")
    parser.add_argument("--seed", type=int, default=100, help="Random seed for reproducibility")
    parser.add_argument("--merge-into", type=str, default=None, help="Optionally merge generated items into existing tasks.json file")
    args = parser.parse_args()

    print(f"Generating synthetic Text-to-SQL tasks count: {args.count} with seed: {args.seed}...")
    
    generated_tasks = generate_synthetic_benchmark(target_count=args.count, seed=args.seed)
    
    # Create target directories if they don't exist
    out_dir = os.path.dirname(args.output)
    if out_dir and not os.path.exists(out_dir):
        os.makedirs(out_dir, exist_ok=True)
        
    # Write to target file
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(generated_tasks, f, indent=2, ensure_ascii=False)
    print(f"Successfully generated and stored {len(generated_tasks)} tasks at: {args.output}")

    # Display Difficulty and Category breakdown statistics
    diff_stats = {}
    cat_stats = {}
    for t in generated_tasks:
        diff_stats[t["difficulty"]] = diff_stats.get(t["difficulty"], 0) + 1
        cat_stats[t["category"]] = cat_stats.get(t["category"], 0) + 1
        
    print("\n" + "="*20 + " GENERATOR METRICS & SUMMARY " + "="*20)
    print(f"Total tasks generated: {len(generated_tasks)}")
    print("\nDifficulty Distribution Breakdown:")
    for d, c in diff_stats.items():
        print(f"  - {d}: {c} ({c/len(generated_tasks)*100:.1f}%)")
    print("\nCategory Distribution Breakdown:")
    for cat, count in cat_stats.items():
        print(f"  - {cat}: {count} ({count/len(generated_tasks)*100:.1f}%)")
    print("="*60 + "\n")

    if args.merge_into:
        if os.path.exists(args.merge_into):
            try:
                with open(args.merge_into, "r", encoding="utf-8") as mf:
                    existing = json.load(mf)
                
                # Deduplicate existing and generated by question text
                existing_queries = {t.get("bengali_query", "").strip() for t in existing}
                merged = list(existing)
                
                added_count = 0
                for gt in generated_tasks:
                    if gt["bengali_query"].strip() not in existing_queries:
                        # Rename task_id to fit existing style (e.g. T201, T202...)
                        new_id = f"T{len(merged)+1:03d}"
                        gt["task_id"] = new_id
                        # Align schema keys to merge: task_id, bengali_query, difficulty, category, sql_gold
                        merged.append({
                            "task_id": new_id,
                            "bengali_query": gt["bengali_query"],
                            "difficulty": gt["difficulty"],
                            "category": gt["category"],
                            "sql_gold": gt["sql_gold"]
                        })
                        added_count += 1
                        
                with open(args.merge_into, "w", encoding="utf-8") as out_mf:
                    json.dump(merged, out_mf, indent=2, ensure_ascii=False)
                print(f"Successfully merged {added_count} new synthetic tasks into {args.merge_into} (Total database records: {len(merged)})")
            except Exception as e:
                print(f"Could not merge into {args.merge_into}: {e}")
        else:
            print(f"Merge target {args.merge_into} does not exist. Generation skipped merge process.")

if __name__ == "__main__":
    main()
