import json

def generate_tasks():
    tasks = []
    
    # ------------------ 80 Standard Bengali Queries (T001 - T080) ------------------
    # Easy & Medium difficulty queries
    cities = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna']
    tiers = ['Premium', 'Standard', 'Basic']
    categories = ['Electronics', 'Accessories', 'Furniture', 'Home Decor']
    products = [
        (101, 'ল্যাপটপ', 75000.00),
        (102, 'স্মার্টফোন', 35000.00),
        (103, 'কীবোর্ড', 1200.00),
        (104, 'মাউস', 800.00),
        (105, 'হেডফোন', 2500.00),
        (106, 'অফিস চেয়ার', 8500.00),
        (107, 'টেবিল ল্যাম্প', 1500.00)
    ]
    
    # 1. Customer filtering by cities (5 tasks)
    tasks.append({
        "id": "T001",
        "question": "ঢাকা শহরের সকল গ্রাহকদের নাম ও টায়ার দেখাও।",
        "sql": "SELECT name, tier FROM customers WHERE city = 'Dhaka';",
        "difficulty": "Easy",
        "category": "Selection & Filtering"
    })
    tasks.append({
        "id": "T002",
        "question": "চট্টগ্রাম শহরের কাস্টমারদের নাম এবং যোগদানের তারিখ দেখাও।",
        "sql": "SELECT name, join_date FROM customers WHERE city = 'Chittagong';",
        "difficulty": "Easy",
        "category": "Selection & Filtering"
    })
    tasks.append({
        "id": "T003",
        "question": "সিলেট জেলার গ্রাহকদের সম্পূর্ণ বিবরণ দেখাও।",
        "sql": "SELECT * FROM customers WHERE city = 'Sylhet';",
        "difficulty": "Easy",
        "category": "Selection & Filtering"
    })
    tasks.append({
        "id": "T004",
        "question": "রাজশাহী শহরের গ্রাহকদের কাস্টমার আইডি ও নাম কী কী?",
        "sql": "SELECT customer_id, name FROM customers WHERE city = 'Rajshahi';",
        "difficulty": "Easy",
        "category": "Selection & Filtering"
    })
    tasks.append({
        "id": "T005",
        "question": "খুলনা শহরের বাসিন্দা এমন গ্রাহকদের তালিকা দেখাও।",
        "sql": "SELECT * FROM customers WHERE city = 'Khulna';",
        "difficulty": "Easy",
        "category": "Selection & Filtering"
    })

    # 2. Customer filtering by tier (3 tasks)
    tasks.append({
        "id": "T006",
        "question": "কোন কোন গ্রাহক 'Premium' টায়ারের অন্তর্ভুক্ত?",
        "sql": "SELECT name FROM customers WHERE tier = 'Premium';",
        "difficulty": "Easy",
        "category": "Selection & Filtering"
    })
    tasks.append({
        "id": "T007",
        "question": "আমাদের 'Standard' গ্রাহকদের আইডি এবং শহরের বিবরণ দাও।",
        "sql": "SELECT customer_id, city FROM customers WHERE tier = 'Standard';",
        "difficulty": "Easy",
        "category": "Selection & Filtering"
    })
    tasks.append({
        "id": "T008",
        "question": "যেসব কাস্টমার 'Basic' মেম্বারশিপ টায়ারে আছেন তাদের নাম দেখাও।",
        "sql": "SELECT name FROM customers WHERE tier = 'Basic';",
        "difficulty": "Easy",
        "category": "Selection & Filtering"
    })

    # 3. Product filtering by fields (10 tasks)
    tasks.append({
        "id": "T009",
        "question": "যেসব পণ্যের স্টক ১০টির কম রয়েছে, তাদের তালিকা তৈরি করো।",
        "sql": "SELECT product_name, stock FROM products WHERE stock < 10;",
        "difficulty": "Easy",
        "category": "Selection & Filtering"
    })
    tasks.append({
        "id": "T010",
        "question": "৫০টির বেশি মজুদ আছে এমন পণ্যের নাম ও ক্যাটাগরি দেখাও।",
        "sql": "SELECT product_name, category FROM products WHERE stock > 50;",
        "difficulty": "Easy",
        "category": "Selection & Filtering"
    })
    tasks.append({
        "id": "T011",
        "question": "১০০০ টাকার চেয়ে বেশি মূল্যের পণ্যের আইডি ও নাম দেখাও।",
        "sql": "SELECT product_id, product_name FROM products WHERE price > 1000;",
        "difficulty": "Easy",
        "category": "Selection & Filtering"
    })
    tasks.append({
        "id": "T012",
        "question": "কোন কোন পণ্যের মূল্য ৫০০০ টাকার নিচে?",
        "sql": "SELECT product_name, price FROM products WHERE price < 5000;",
        "difficulty": "Easy",
        "category": "Selection & Filtering"
    })
    tasks.append({
        "id": "T013",
        "question": "Electronics ক্যাটাগরির সমস্ত পণ্যের বিবরণ দাও।",
        "sql": "SELECT * FROM products WHERE category = 'Electronics';",
        "difficulty": "Easy",
        "category": "Selection & Filtering"
    })
    tasks.append({
        "id": "T014",
        "question": "Accessories বিভাগের পণ্যের নাম ও দাম দেখাও।",
        "sql": "SELECT product_name, price FROM products WHERE category = 'Accessories';",
        "difficulty": "Easy",
        "category": "Selection & Filtering"
    })
    tasks.append({
        "id": "T015",
        "question": "Furniture ক্যাটাগরির পণ্যের মোট মজুদ (stock) কত আছে?",
        "sql": "SELECT product_name, stock FROM products WHERE category = 'Furniture';",
        "difficulty": "Easy",
        "category": "Selection & Filtering"
    })
    tasks.append({
        "id": "T016",
        "question": "Home Decor পণ্যের নাম ও তাদের মূল্য দেখাও।",
        "sql": "SELECT product_name, price FROM products WHERE category = 'Home Decor';",
        "difficulty": "Easy",
        "category": "Selection & Filtering"
    })
    tasks.append({
        "id": "T017",
        "question": "স্টকে বর্তমানে একদম অবিক্রীত বা খালি নেই এমন পণ্যগুলোর আইডি ও মজুদ পরিমাণ দেখাও।",
        "sql": "SELECT product_id, stock FROM products WHERE stock > 0;",
        "difficulty": "Easy",
        "category": "Selection & Filtering"
    })
    tasks.append({
        "id": "T018",
        "question": "অনন্য কাস্টমারদের বসবাসকারী শহরগুলোর নাম ডুপ্লিকেট ছাড়া দেখাও।",
        "sql": "SELECT DISTINCT city FROM customers;",
        "difficulty": "Easy",
        "category": "Selection & Filtering"
    })

    # 4. Aggregations (15 tasks)
    tasks.append({
        "id": "T019",
        "question": "আমাদের মোট কতটি পণ্য বিক্রয় হয়েছে এবং মোট কত টাকার বিক্রয় হয়েছে?",
        "sql": "SELECT SUM(quantity) as total_quantity, SUM(total_amount) as total_revenue FROM sales;",
        "difficulty": "Medium",
        "category": "Aggregation"
    })
    tasks.append({
        "id": "T020",
        "question": "বিক্রয় তালিকা থেকে পণ্যের মোট সর্বমোট বিক্রয় পরিমাণ (quantity) কত?",
        "sql": "SELECT SUM(quantity) as total_sold FROM sales;",
        "difficulty": "Easy",
        "category": "Aggregation"
    })
    tasks.append({
        "id": "T021",
        "question": "আমাদের স্টোরের পণ্যগুলোর গড় মূল্য কত?",
        "sql": "SELECT AVG(price) as avg_price FROM products;",
        "difficulty": "Easy",
        "category": "Aggregation"
    })
    tasks.append({
        "id": "T022",
        "question": "পণ্য তালিকায় সর্বমোট স্টকের সংখ্যা কত বা কতটি অবজেক্ট স্টকে মজুদ আছে?",
        "sql": "SELECT SUM(stock) as total_stock FROM products;",
        "difficulty": "Easy",
        "category": "Aggregation"
    })
    tasks.append({
        "id": "T023",
        "question": "আমাদের সিস্টেমে মোট কতজন নথিভুক্ত গ্রাহক আছেন?",
        "sql": "SELECT COUNT(*) as total_customers FROM customers;",
        "difficulty": "Easy",
        "category": "Aggregation"
    })
    tasks.append({
        "id": "T024",
        "question": "আজ পর্যন্ত মোট কতটি বিক্রয়ের লেনদেন (sales records) সম্পন্ন হয়েছে?",
        "sql": "SELECT COUNT(*) as total_sales_count FROM sales;",
        "difficulty": "Easy",
        "category": "Aggregation"
    })
    tasks.append({
        "id": "T025",
        "question": "আমাদের পণ্যগুলোর মধ্যে সর্বোচ্চ পণ্যের মূল্য কত টাকা?",
        "sql": "SELECT MAX(price) as max_price FROM products;",
        "difficulty": "Easy",
        "category": "Aggregation"
    })
    tasks.append({
        "id": "T026",
        "question": "সবচেয়ে সস্তা বা সর্বনিম্ন মূল্যের পণ্যটির দাম কত?",
        "sql": "SELECT MIN(price) as min_price FROM products;",
        "difficulty": "Easy",
        "category": "Aggregation"
    })
    tasks.append({
        "id": "T027",
        "question": "একটি সিঙ্গেল ট্রানজেকশনে সর্বোচ্চ কত টাকার কেনাকাটা করা হয়েছে?",
        "sql": "SELECT MAX(total_amount) as max_single_sale FROM sales;",
        "difficulty": "Easy",
        "category": "Aggregation"
    })
    tasks.append({
        "id": "T028",
        "question": "আমাদের স্টোরে কোনো ট্রানজেকশনে সর্বনিম্ন কত টাকার লেনদেন হয়েছে?",
        "sql": "SELECT MIN(total_amount) as min_single_sale FROM sales;",
        "difficulty": "Easy",
        "category": "Aggregation"
    })
    tasks.append({
        "id": "T029",
        "question": "বিক্রয় হওয়া পণ্যের গড় পরিমাণ (average quantity) কত ছিল?",
        "sql": "SELECT AVG(quantity) as avg_sale_qty FROM sales;",
        "difficulty": "Easy",
        "category": "Aggregation"
    })
    tasks.append({
        "id": "T030",
        "question": "গ্রাহকদের গড় রেজিস্ট্রেশন বছর বা দিন অনুসারে মোট কতজন প্রিমিয়াম টায়ারে আছে?",
        "sql": "SELECT COUNT(*) as premium_count FROM customers WHERE tier = 'Premium';",
        "difficulty": "Easy",
        "category": "Aggregation"
    })
    tasks.append({
        "id": "T031",
        "question": "আমাদের পুরো ইনভেন্টরির মোট আর্থিক মূল্য (price * stock) কত কোটিতে বা কত টাকায় দাঁড়ায়?",
        "sql": "SELECT SUM(price * stock) as total_inventory_value FROM products;",
        "difficulty": "Medium",
        "category": "Aggregation"
    })
    tasks.append({
        "id": "T032",
        "question": "২০২৫ সালের ফেব্রুয়ারি মাসের বিক্রয়ের গড় পরিমাণ কত ছিল?",
        "sql": "SELECT AVG(total_amount) as avg_feb_sale FROM sales WHERE sale_date >= '2025-02-01' AND sale_date <= '2025-02-28';",
        "difficulty": "Medium",
        "category": "Aggregation"
    })
    tasks.append({
        "id": "T033",
        "question": "কীবোর্ড পণ্যটির গড় বিক্রয় মূল্য (total_amount / quantity) কত ছিল?",
        "sql": "SELECT AVG(total_amount / quantity) as avg_keyboard_price FROM sales WHERE product_id = 103;",
        "difficulty": "Medium",
        "category": "Aggregation"
    })

    # 5. Grouping & Sorting (15 tasks)
    tasks.append({
        "id": "T034",
        "question": "প্রতিটি ক্যাটাগরির পণ্যের গড় মূল্য কত? গড় মূল্যের ঊর্ধ্বক্রম অনুযায়ী সাজাও।",
        "sql": "SELECT category, AVG(price) as avg_price FROM products GROUP BY category ORDER BY avg_price ASC;",
        "difficulty": "Medium",
        "category": "Grouping & Sort"
    })
    tasks.append({
        "id": "T035",
        "question": "প্রতিটি শহরে আমাদের মোট কত জন কাস্টমার আছেন?",
        "sql": "SELECT city, COUNT(customer_id) as customer_count FROM customers GROUP BY city;",
        "difficulty": "Easy",
        "category": "Grouping & Sort"
    })
    tasks.append({
        "id": "T036",
        "question": "সবচেয়ে বেশি কোন শহরের কাস্টমাররা Premium ক্যাটাগরির অন্তর্ভুক্ত?",
        "sql": "SELECT city, COUNT(*) as count FROM customers WHERE tier = 'Premium' GROUP BY city ORDER BY count DESC LIMIT 1;",
        "difficulty": "Medium",
        "category": "Grouping & Sort"
    })
    tasks.append({
        "id": "T037",
        "question": "প্রতিটি ক্যাটাগরিতে মোট কয়টি আলাদা আলাদা পণ্য আছে তা উচ্চসংখ্যা থেকে নিম্নসংখ্যায় দেখাও।",
        "sql": "SELECT category, COUNT(product_id) as total_products FROM products GROUP BY category ORDER BY total_products DESC;",
        "difficulty": "Medium",
        "category": "Grouping & Sort"
    })
    tasks.append({
        "id": "T038",
        "question": "গ্রাহকদের যোগদানের সাল অনুযায়ী মোট গ্রাহকের সংখ্যার তালিকা দেখাও।",
        "sql": "SELECT YEAR(join_date) as join_year, COUNT(*) as total_customers FROM customers GROUP BY YEAR(join_date);",
        "difficulty": "Medium",
        "category": "Grouping & Sort"
    })
    tasks.append({
        "id": "T039",
        "question": "কোন শহরে কতজন স্ট্যান্ডার্ড টায়ার রেটিংয়ের গ্রাহক রয়েছে, তা উচ্চহার অনুযায়ী দেখাও।",
        "sql": "SELECT city, COUNT(*) as standard_count FROM customers WHERE tier = 'Standard' GROUP BY city ORDER BY standard_count DESC;",
        "difficulty": "Medium",
        "category": "Grouping & Sort"
    })
    tasks.append({
        "id": "T040",
        "question": "ক্যাটাগরি অনুযায়ী পণ্যের সর্বোচ্চ মূল্য ও সর্বনিম্ন মূল্য কত?",
        "sql": "SELECT category, MAX(price) as max_price, MIN(price) as min_price FROM products GROUP BY category;",
        "difficulty": "Medium",
        "category": "Grouping & Sort"
    })
    tasks.append({
        "id": "T041",
        "question": "মজুদে থাকা পণ্যের সংখ্যার (stock) ভিত্তিতে প্রথম ৩টি সবচেয়ে কম মজুদের পণ্যের নাম দেখাও।",
        "sql": "SELECT product_name, stock FROM products ORDER BY stock ASC LIMIT 3;",
        "difficulty": "Easy",
        "category": "Grouping & Sort"
    })
    tasks.append({
        "id": "T042",
        "question": "সর্বোচ্চ মূল্যের দিক থেকে প্রথম ৫টি পণ্যের নাম এবং তাদের ক্যাটাগরির তালিকা দাও।",
        "sql": "SELECT product_name, category, price FROM products ORDER BY price DESC LIMIT 5;",
        "difficulty": "Easy",
        "category": "Grouping & Sort"
    })
    tasks.append({
        "id": "T043",
        "question": "গ্রাহকদের যোগদানের তারিখের ক্রমানুসারে (সবচেয়ে প্রাচীন বা প্রবীণ থেকে নবীন) তালিকা করো।",
        "sql": "SELECT name, join_date FROM customers ORDER BY join_date ASC;",
        "difficulty": "Easy",
        "category": "Grouping & Sort"
    })
    tasks.append({
        "id": "T044",
        "question": "নতুন যোগদানকারী প্রথম ২ জন কাস্টমারের নাম ও শহর কী কী?",
        "sql": "SELECT name, city, join_date FROM customers ORDER BY join_date DESC LIMIT 2;",
        "difficulty": "Easy",
        "category": "Grouping & Sort"
    })
    tasks.append({
        "id": "T045",
        "question": "কোন কোন তারিখে সবথেকে বেশি মূল্যের পণ্য বিক্রি হয়েছে, তারিখ ও মূল্যের তালিকা দেখাও বড় থেকে ছোট অর্ডারে।",
        "sql": "SELECT sale_date, total_amount FROM sales ORDER BY total_amount DESC;",
        "difficulty": "Easy",
        "category": "Grouping & Sort"
    })
    tasks.append({
        "id": "T046",
        "question": "প্রতিটি গ্রাহকের সর্বমোট বিক্রয়ের পরিমাণ কত পিস ছিল তা দেখাও।",
        "sql": "SELECT customer_id, SUM(quantity) as total_qty FROM sales GROUP BY customer_id;",
        "difficulty": "Medium",
        "category": "Grouping & Sort"
    })
    tasks.append({
        "id": "T047",
        "question": "কাস্টমার টায়ার অনুযায়ী গ্রাহকদের গড় যোগদানের মেয়াদের কাউন্ট বা সংখ্যা কত?",
        "sql": "SELECT tier, COUNT(*) as tier_count FROM customers GROUP BY tier;",
        "difficulty": "Easy",
        "category": "Grouping & Sort"
    })
    tasks.append({
        "id": "T048",
        "question": "প্রতিটি পণ্য কত বার করে লেনদেন বা অর্ডার হয়েছে তার আইডিসহ গণনা তালিকাবদ্ধ করো।",
        "sql": "SELECT product_id, COUNT(*) as txn_count FROM sales GROUP BY product_id ORDER BY txn_count DESC;",
        "difficulty": "Medium",
        "category": "Grouping & Sort"
    })

    # 6. Relational Joins (20 tasks)
    tasks.append({
        "id": "T049",
        "question": "আজ পর্যন্ত কোন পণ্যটি সবচেয়ে বেশি সংখ্যায় (quantity) বিক্রি হয়েছে?",
        "sql": "SELECT p.product_name, SUM(s.quantity) as total_sold FROM sales s JOIN products p ON s.product_id = p.product_id GROUP BY p.product_name ORDER BY total_sold DESC LIMIT 1;",
        "difficulty": "Medium",
        "category": "Join"
    })
    tasks.append({
        "id": "T050",
        "question": "আবুল কালাম নামের গ্রাহক কোন কোন পণ্য কিনেছেন তার তালিকা দেখাও।",
        "sql": "SELECT DISTINCT p.product_name FROM sales s JOIN customers c ON s.customer_id = c.customer_id JOIN products p ON s.product_id = p.product_id WHERE c.name = 'আবুল কালাম';",
        "difficulty": "Medium",
        "category": "Join"
    })
    tasks.append({
        "id": "T051",
        "question": "কোন কোন শহরে ২৫,০০০ টাকার বেশি বিক্রয় হয়েছে?",
        "sql": "SELECT c.city, SUM(s.total_amount) as total_sales FROM sales s JOIN customers c ON s.customer_id = c.customer_id GROUP BY c.city HAVING total_sales > 25000;",
        "difficulty": "Hard",
        "category": "Join"
    })
    tasks.append({
        "id": "T052",
        "question": "কোন গ্রাহক সবথেকে বেশি টাকার পণ্য কিনেছেন?",
        "sql": "SELECT c.name, SUM(s.total_amount) AS total_spent FROM sales s JOIN customers c ON s.customer_id = c.customer_id GROUP BY c.name ORDER BY total_spent DESC LIMIT 1;",
        "difficulty": "Medium",
        "category": "Join"
    })
    tasks.append({
        "id": "T053",
        "question": "একটি অর্ডারে সর্বোচ্চ কতটি মাউস একসাথে বিক্রি হয়েছে?",
        "sql": "SELECT MAX(quantity) as max_mouse_sold FROM sales JOIN products ON sales.product_id = products.product_id WHERE products.product_name = 'মাউস';",
        "difficulty": "Medium",
        "category": "Join"
    })
    tasks.append({
        "id": "T054",
        "question": "সাদিয়া রহমান নামের গ্রাহকের মোট ক্রয়কৃত অর্ডারের সংখ্যা (sale_id এর কাউন্ট) কত?",
        "sql": "SELECT COUNT(s.sale_id) as total_orders FROM sales s JOIN customers c ON s.customer_id = c.customer_id WHERE c.name = 'সাদিয়া রহমান';",
        "difficulty": "Medium",
        "category": "Join"
    })
    tasks.append({
        "id": "T055",
        "question": "যে সকল পন্যের ইউনিট প্রাইজ (মূল্য) ১০০০ টাকার বেশি এবং ২০২৫ সালের ফেব্রুয়ারি মাসে বিক্রি হয়েছে তার তালিকা দেখাও।",
        "sql": "SELECT DISTINCT p.product_name FROM sales s JOIN products p ON s.product_id = p.product_id WHERE p.price > 1000 AND s.sale_date >= '2025-02-01' AND s.sale_date <= '2025-02-28';",
        "difficulty": "Hard",
        "category": "Join"
    })
    tasks.append({
        "id": "T056",
        "question": "Dhaka এবং Sylhet শহরের গ্রাহকদের মোট কেনাকাটার (total_amount) পরিমাণ কত?",
        "sql": "SELECT c.city, SUM(s.total_amount) as total_amount FROM sales s JOIN customers c ON s.customer_id = c.customer_id WHERE c.city IN ('Dhaka', 'Sylhet') GROUP BY c.city;",
        "difficulty": "Medium",
        "category": "Join"
    })
    tasks.append({
        "id": "T057",
        "question": "Sylhet শহরের তাসনিম আহমেদ কত তারিখে 'স্মার্টফোন' নামক পণ্যটি কিনেছিলেন?",
        "sql": "SELECT s.sale_date FROM sales s JOIN customers c ON s.customer_id = c.customer_id JOIN products p ON s.product_id = p.product_id WHERE c.name = 'তাসনিম আহমেদ' AND c.city = 'Sylhet' AND p.product_name = 'স্মার্টফোন';",
        "difficulty": "Hard",
        "category": "Join"
    })
    tasks.append({
        "id": "T058",
        "question": "Chittagong শহরের গ্রাহকদের মোট বিক্রিত পণ্যের পরিমাণ (quantity) কত?",
        "sql": "SELECT SUM(s.quantity) as total_qty FROM sales s JOIN customers c ON s.customer_id = c.customer_id WHERE c.city = 'Chittagong';",
        "difficulty": "Medium",
        "category": "Join"
    })
    tasks.append({
        "id": "T059",
        "question": "গ্রাহকদের নাম, তাদের শহর এবং যদি তারা কোনো লেনদেন করে থাকে তবে তার তারিখ দেখাও অন্যথায় ফাঁকা রাখো।",
        "sql": "SELECT c.name, c.city, s.sale_date FROM customers c LEFT JOIN sales s ON c.customer_id = s.customer_id;",
        "difficulty": "Hard",
        "category": "Join"
    })
    tasks.append({
        "id": "T060",
        "question": "Electronics ক্যাটাগরির পণ্যগুলো মোট কতজন গ্রাহক কিনেছেন (অনন্য গ্রাহক সংখ্যা)?",
        "sql": "SELECT COUNT(DISTINCT s.customer_id) as electronics_customer_count FROM sales s JOIN products p ON s.product_id = p.product_id WHERE p.category = 'Electronics';",
        "difficulty": "Medium",
        "category": "Join"
    })
    tasks.append({
        "id": "T061",
        "question": "Premium গ্রাহক টায়ারের ক্রেতারা কি কি পণ্য কিনেছেন তাদের বিবরণ দেখাও?",
        "sql": "SELECT DISTINCT p.product_name FROM sales s JOIN customers c ON s.customer_id = c.customer_id JOIN products p ON s.product_id = p.product_id WHERE c.tier = 'Premium';",
        "difficulty": "Medium",
        "category": "Join"
    })
    tasks.append({
        "id": "T062",
        "question": "প্রতিটি পণ্যের ক্যাটাগরি ও সেই পণ্য বিক্রির মাধ্যমে অর্জিত মোট আয়ের পরিমাণ দেখাও।",
        "sql": "SELECT p.category, SUM(s.total_amount) as category_earnings FROM sales s JOIN products p ON s.product_id = p.product_id GROUP BY p.category;",
        "difficulty": "Medium",
        "category": "Join"
    })
    tasks.append({
        "id": "T063",
        "question": "কোন ক্যাটাগরির পণ্য আমাদের স্টোর থেকে সবচেয়ে বেশি পিস (quantity) বিক্রি হয়েছে?",
        "sql": "SELECT p.category, SUM(s.quantity) as total_qty FROM sales s JOIN products p ON s.product_id = p.product_id GROUP BY p.category ORDER BY total_qty DESC LIMIT 1;",
        "difficulty": "Medium",
        "category": "Join"
    })
    tasks.append({
        "id": "T064",
        "question": "Basic মেম্বারশিপ টায়ারধারী ফারিহা জাহানের মোট ক্রয়ের খতিয়ান বা মোট কত টাকা খরচ করেছেন তা দেখাও।",
        "sql": "SELECT SUM(s.total_amount) as total_spent FROM sales s JOIN customers c ON s.customer_id = c.customer_id WHERE c.name = 'ফারিহা জাহান';",
        "difficulty": "Medium",
        "category": "Join"
    })
    tasks.append({
        "id": "T065",
        "question": "আরিফ হাসান নামক গ্রাহকের কেনা প্রতিটি পণ্যের নাম এবং ক্রয়ের পরিমাণ দেখাও।",
        "sql": "SELECT p.product_name, s.quantity FROM sales s JOIN customers c ON s.customer_id = c.customer_id JOIN products p ON s.product_id = p.product_id WHERE c.name = 'আরিফ হাসান';",
        "difficulty": "Medium",
        "category": "Join"
    })
    tasks.append({
        "id": "T066",
        "question": "Home Decor পণ্যাদি কেনার জন্য কোন কোন গ্রাহক অর্ডার করেছেন তাদের নাম কী?",
        "sql": "SELECT DISTINCT c.name FROM sales s JOIN customers c ON s.customer_id = c.customer_id JOIN products p ON s.product_id = p.product_id WHERE p.category = 'Home Decor';",
        "difficulty": "Medium",
        "category": "Join"
    })
    tasks.append({
        "id": "T067",
        "question": "কোন গ্রাহক কতবার অর্ডারে অংশ নিয়েছেন তার নাম ও অর্ডার সংখ্যা দেখাও (এমনকি যদি কেনাকাটা নাও করে থাকেন শূন্য নির্দেশ করো)।",
        "sql": "SELECT c.name, COUNT(s.sale_id) as order_count FROM customers c LEFT JOIN sales s ON c.customer_id = s.customer_id GROUP BY c.name;",
        "difficulty": "Hard",
        "category": "Join"
    })
    tasks.append({
        "id": "T068",
        "question": "Accessories বিভাগের পণ্য ক্রয়ে ঢাকা শহরের গ্রাহকদের সর্বমোট ব্যয় টাকার অঙ্কে কত?",
        "sql": "SELECT SUM(s.total_amount) as total_amount FROM sales s JOIN customers c ON s.customer_id = c.customer_id JOIN products p ON s.product_id = p.product_id WHERE c.city = 'Dhaka' AND p.category = 'Accessories';",
        "difficulty": "Hard",
        "category": "Join"
    })

    # 7. Relational Subqueries & Operators (12 tasks)
    tasks.append({
        "id": "T069",
        "question": "যেসব গ্রাহক ২০২৪ সালে যোগ দিয়েছেন তাদের মোট ক্রয়কৃত পণ্যের পরিমাণ দেখাও।",
        "sql": "SELECT c.name, COALESCE(SUM(s.quantity), 0) as total_quantity FROM customers c LEFT JOIN sales s ON c.customer_id = s.customer_id WHERE c.join_date >= '2024-01-01' AND c.join_date <= '2024-12-31' GROUP BY c.name;",
        "difficulty": "Hard",
        "category": "Subquery"
    })
    tasks.append({
        "id": "T070",
        "question": "কোন পণ্যের মূল্য আমাদের পণ্যের গড় মূল্যের চেয়ে বেশি?",
        "sql": "SELECT product_name, price FROM products WHERE price > (SELECT AVG(price) FROM products);",
        "difficulty": "Hard",
        "category": "Subquery"
    })
    tasks.append({
        "id": "T071",
        "question": "কোন কোন গ্রাহক এখনও পর্যন্ত একটিও পণ্য কেনেননি?",
        "sql": "SELECT name FROM customers WHERE customer_id NOT IN (SELECT DISTINCT customer_id FROM sales WHERE customer_id IS NOT NULL);",
        "difficulty": "Hard",
        "category": "Subquery"
    })
    tasks.append({
        "id": "T072",
        "question": "কোন কোন পণ্য এখনও পর্যন্ত একটি বারও বিক্রি হয়নি?",
        "sql": "SELECT product_name FROM products WHERE product_id NOT IN (SELECT DISTINCT product_id FROM sales WHERE product_id IS NOT NULL);",
        "difficulty": "Hard",
        "category": "Subquery"
    })
    tasks.append({
        "id": "T073",
        "question": "যেসব গ্রাহকের রেজিস্ট্রেশন ডেট আবুল কালামের রেজিস্ট্রেশন ডেটের পরে তাদের তালিকা দাও।",
        "sql": "SELECT name, join_date FROM customers WHERE join_date > (SELECT join_date FROM customers WHERE name = 'আবুল কালাম');",
        "difficulty": "Hard",
        "category": "Subquery"
    })
    tasks.append({
        "id": "T074",
        "question": "সর্বোচ্চ মূল্যের পণ্যের আইডি ব্যবহার করে সেলস টেবিল থেকে সেই পন্যের মোট বিক্রয় পরিমাণ হিসাব করো।",
        "sql": "SELECT SUM(quantity) as max_product_qty FROM sales WHERE product_id = (SELECT product_id FROM products ORDER BY price DESC LIMIT 1);",
        "difficulty": "Hard",
        "category": "Subquery"
    })
    tasks.append({
        "id": "T075",
        "question": "গড় বিক্রয় মূল্যের (total_amount) চেয়ে বেশি দামে বিক্রি হওয়া সব সেলস আইটেমের তালিকা দেখাও।",
        "sql": "SELECT * FROM sales WHERE total_amount > (SELECT AVG(total_amount) FROM sales);",
        "difficulty": "Hard",
        "category": "Subquery"
    })
    tasks.append({
        "id": "T076",
        "question": "Premium টায়ারের ন্যূনতম বা প্রথম জয়েন করা গ্রাহকের কোন পণ্যটি সবার আগে কেনা হয়েছিল তার অর্ডার আইডি দেখাও।",
        "sql": "SELECT sale_id FROM sales WHERE customer_id = (SELECT customer_id FROM customers WHERE tier = 'Premium' ORDER BY join_date ASC LIMIT 1) ORDER BY sale_date ASC LIMIT 1;",
        "difficulty": "Hard",
        "category": "Subquery"
    })
    tasks.append({
        "id": "T077",
        "question": "সবচেয়ে কম অবিক্রীত বা সর্বনিন্ম মূল্যের ক্যাটাগরি পরিবারের গড় মূল্য কত?",
        "sql": "SELECT AVG(price) FROM products WHERE category = (SELECT category FROM products ORDER BY price ASC LIMIT 1);",
        "difficulty": "Hard",
        "category": "Subquery"
    })
    tasks.append({
        "id": "T078",
        "question": "সেসব পণ্যের স্টক তালিকা দেখাও যাদের মজুদ মোট ল্যাপটপের মজুদের চেয়ে বেশি।",
        "sql": "SELECT product_name, stock FROM products WHERE stock > (SELECT stock FROM products WHERE product_name = 'ল্যাপটপ');",
        "difficulty": "Hard",
        "category": "Subquery"
    })
    tasks.append({
        "id": "T079",
        "question": "ঢাকা শহরে থাকে এমন গ্রাহকদের মোট ক্রয়কৃত লেনদেনের সংখ্যার পরিসংখ্যান দেখাও সাবকোয়েরির মাধ্যমে।",
        "sql": "SELECT COUNT(*) FROM sales WHERE customer_id IN (SELECT customer_id FROM customers WHERE city = 'Dhaka');",
        "difficulty": "Hard",
        "category": "Subquery"
    })
    tasks.append({
        "id": "T080",
        "question": "স্ট্যান্ডার্ড গ্রাহকদের মধ্যে কে সবার পরে জয়েন করেছিলেন তার নাম কী?",
        "sql": "SELECT name FROM customers WHERE tier = 'Standard' AND join_date = (SELECT MAX(join_date) FROM customers WHERE tier = 'Standard');",
        "difficulty": "Hard",
        "category": "Subquery"
    })


    # ------------------ 50 Banglish Queries (T081 - T130) ------------------
    # Phonetic romanized Bengali queries (T081 to T130)
    # Simple & complex combined
    tasks.append({
        "id": "T081",
        "question": "dhaka shohorer shob customer der nam and tier dekhao.",
        "sql": "SELECT name, tier FROM customers WHERE city = 'Dhaka';",
        "difficulty": "Easy",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T082",
        "question": "kon kon customer Premium tier r moddhe ache?",
        "sql": "SELECT name FROM customers WHERE tier = 'Premium';",
        "difficulty": "Easy",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T083",
        "question": "jeishob product er stock 10 er kom ache, tader list koro.",
        "sql": "SELECT product_name, stock FROM products WHERE stock < 10;",
        "difficulty": "Easy",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T084",
        "question": "amader mot koto quantity sell hoise r total koto taka revenue hoise?",
        "sql": "SELECT SUM(quantity) as total_quantity, SUM(total_amount) as total_revenue FROM sales;",
        "difficulty": "Medium",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T085",
        "question": "proti category product er average price koto? price low theke high order a sajaw.",
        "sql": "SELECT category, AVG(price) as avg_price FROM products GROUP BY category ORDER BY avg_price ASC;",
        "difficulty": "Medium",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T086",
        "question": "aj porjonto kon product ta shobcheye beshi quantity sell hoise?",
        "sql": "SELECT p.product_name, SUM(s.quantity) as total_sold FROM sales s JOIN products p ON s.product_id = p.product_id GROUP BY p.product_name ORDER BY total_sold DESC LIMIT 1;",
        "difficulty": "Medium",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T087",
        "question": "Abul Kalam namer customer kon kon product buy korse tar list dekhao.",
        "sql": "SELECT DISTINCT p.product_name FROM sales s JOIN customers c ON s.customer_id = c.customer_id JOIN products p ON s.product_id = p.product_id WHERE c.name = 'আবুল কালাম';",
        "difficulty": "Medium",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T088",
        "question": "proti city te amader total koto jon customer ase?",
        "sql": "SELECT city, COUNT(customer_id) as customer_count FROM customers GROUP BY city;",
        "difficulty": "Easy",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T089",
        "question": "kon kon city te 25000 takar beshi sale hoise?",
        "sql": "SELECT c.city, SUM(s.total_amount) as total_sales FROM sales s JOIN customers c ON s.customer_id = c.customer_id GROUP BY c.city HAVING total_sales > 25000;",
        "difficulty": "Hard",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T090",
        "question": "jeishob customer 2024 a join korse tader mot kena products er quantity koto?",
        "sql": "SELECT c.name, COALESCE(SUM(s.quantity), 0) as total_quantity FROM customers c LEFT JOIN sales s ON c.customer_id = s.customer_id WHERE c.join_date >= '2024-01-01' AND c.join_date <= '2024-12-31' GROUP BY c.name;",
        "difficulty": "Hard",
        "category": "Banglish Robustness"
    })
    # Additional 40 Banglish questions
    tasks.append({
        "id": "T091",
        "question": "chittagong city r all customer der details bolo.",
        "sql": "SELECT * FROM customers WHERE city = 'Chittagong';",
        "difficulty": "Easy",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T092",
        "question": "standard category tier e thaka customer der nam r join date koto?",
        "sql": "SELECT name, join_date FROM customers WHERE tier = 'Standard';",
        "difficulty": "Easy",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T093",
        "question": "amader electronics item er list dekhao price shoho.",
        "sql": "SELECT product_name, price FROM products WHERE category = 'Electronics';",
        "difficulty": "Easy",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T094",
        "question": "accessories category er total stock koto ase?",
        "sql": "SELECT SUM(stock) FROM products WHERE category = 'Accessories';",
        "difficulty": "Easy",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T095",
        "question": "shobcheye dami product konta? tar price and name bolo.",
        "sql": "SELECT product_name, price FROM products ORDER BY price DESC LIMIT 1;",
        "difficulty": "Easy",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T096",
        "question": "shobcheye shosta product er stock details koto?",
        "sql": "SELECT product_name, stock FROM products ORDER BY price ASC LIMIT 1;",
        "difficulty": "Easy",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T097",
        "question": "sales table column total_amount theke max spend koto taka?",
        "sql": "SELECT MAX(total_amount) FROM sales;",
        "difficulty": "Easy",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T098",
        "question": "customer table e total koto jon user register korse?",
        "sql": "SELECT COUNT(*) FROM customers;",
        "difficulty": "Easy",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T099",
        "question": "sales table er record index total_sales row count koto?",
        "sql": "SELECT COUNT(*) FROM sales;",
        "difficulty": "Easy",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T100",
        "question": "kon customer kobe register hoitase chronological order e din.",
        "sql": "SELECT name, join_date FROM customers ORDER BY join_date ASC;",
        "difficulty": "Easy",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T101",
        "question": "sylhet shohore thaka customer name and tier keys.",
        "sql": "SELECT name, tier FROM customers WHERE city = 'Sylhet';",
        "difficulty": "Easy",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T102",
        "question": "premium level custom clients der shohoer list unique table.",
        "sql": "SELECT DISTINCT city FROM customers WHERE tier = 'Premium';",
        "difficulty": "Easy",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T103",
        "question": "stock zero values theke higher positive active products details.",
        "sql": "SELECT * FROM products WHERE stock > 0;",
        "difficulty": "Easy",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T104",
        "question": "average order billing limit price range koto amader shoppe?",
        "sql": "SELECT AVG(total_amount) FROM sales;",
        "difficulty": "Easy",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T105",
        "question": "category wise products price average metrics chart value.",
        "sql": "SELECT category, AVG(price) FROM products GROUP BY category;",
        "difficulty": "Medium",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T106",
        "question": "kon categories er product count list shobcheye highest row sizes?",
        "sql": "SELECT category, COUNT(*) as cnt FROM products GROUP BY category ORDER BY cnt DESC;",
        "difficulty": "Medium",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T107",
        "question": "customer der join date 2023-06-01 er age hoise emon custom details query.",
        "sql": "SELECT * FROM customers WHERE join_date < '2023-06-01';",
        "difficulty": "Easy",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T108",
        "question": "total_amount 5000 and 80000 er majhkhaner range query select all.",
        "sql": "SELECT * FROM sales WHERE total_amount BETWEEN 5000 AND 80000;",
        "difficulty": "Easy",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T109",
        "question": "accessories group division premium class products lists.",
        "sql": "SELECT * FROM products WHERE category = 'Accessories';",
        "difficulty": "Easy",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T110",
        "question": "kon user shobcheye highest cash balance transactions submit korse?",
        "sql": "SELECT c.name, SUM(s.total_amount) as total_spent FROM sales s JOIN customers c ON s.customer_id = c.customer_id GROUP BY c.name ORDER BY total_spent DESC LIMIT 1;",
        "difficulty": "Medium",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T111",
        "question": "average price table line items theke price values pipeline higher filter.",
        "sql": "SELECT product_name, price FROM products WHERE price > (SELECT AVG(price) FROM products);",
        "difficulty": "Hard",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T112",
        "question": "premium consumers registration status counting details inside database.",
        "sql": "SELECT city, COUNT(*) FROM customers WHERE tier = 'Premium' GROUP BY city;",
        "difficulty": "Medium",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T113",
        "question": "sale date database column feb 2025 values range totals.",
        "sql": "SELECT SUM(quantity) FROM sales WHERE sale_date >= '2025-02-01' AND sale_date <= '2025-02-28';",
        "difficulty": "Medium",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T114",
        "question": "customer name keywords ending containing rahman and hasan matches.",
        "sql": "SELECT name, city FROM customers WHERE name LIKE '%রহমান' OR name LIKE '%হাসান';",
        "difficulty": "Medium",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T115",
        "question": "unsolvable zero purchased custom inactive users IDs lists checks.",
        "sql": "SELECT name FROM customers WHERE customer_id NOT IN (SELECT DISTINCT customer_id FROM sales WHERE customer_id IS NOT NULL);",
        "difficulty": "Hard",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T116",
        "question": "category distribution parameters stock metrics total numbers descending order.",
        "sql": "SELECT category, count(product_id) FROM products GROUP BY category ORDER BY count(product_id) DESC;",
        "difficulty": "Medium",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T117",
        "question": "highest quantity of single mouse orders ever placed inside db sales.",
        "sql": "SELECT MAX(quantity) FROM sales s JOIN products p ON s.product_id = p.product_id WHERE p.product_name = 'মাউস';",
        "difficulty": "Medium",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T118",
        "question": "dhaka city joint custom users who registered on 2023 or 2024 tags.",
        "sql": "SELECT name FROM customers WHERE city = 'Dhaka' AND (join_date >= '2023-01-01' AND join_date <= '2024-12-31');",
        "difficulty": "Medium",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T119",
        "question": "ranking orders based on cumulative sold quantities parameters groupings.",
        "sql": "SELECT p.category, SUM(s.quantity) FROM sales s JOIN products p ON s.product_id = p.product_id GROUP BY p.category ORDER BY SUM(s.quantity) DESC;",
        "difficulty": "Hard",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T120",
        "question": "Sadia Rahman buying transactional frequency database hits total sum count.",
        "sql": "SELECT COUNT(*) FROM sales s JOIN customers c ON s.customer_id = c.customer_id WHERE c.name = 'সাদিয়া রহমান';",
        "difficulty": "Medium",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T121",
        "question": "most minimal holding products unit name inside inventory.",
        "sql": "SELECT product_name FROM products ORDER BY stock ASC LIMIT 1;",
        "difficulty": "Easy",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T122",
        "question": "items costing above bdt 1000 bought inside february 2025 timezone.",
        "sql": "SELECT DISTINCT p.product_name FROM sales s JOIN products p ON s.product_id = p.product_id WHERE p.price > 1000 AND s.sale_date >= '2025-02-01' AND s.sale_date <= '2025-02-28';",
        "difficulty": "Hard",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T123",
        "question": "Dhaka and Sylhet geographical regional customers aggregate checkout sums.",
        "sql": "SELECT c.city, SUM(s.total_amount) FROM sales s JOIN customers c ON s.customer_id = c.customer_id WHERE c.city IN ('Dhaka', 'Sylhet') GROUP BY c.city;",
        "difficulty": "Medium",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T124",
        "question": "total price multiplied by inventories holdings stock count sums value.",
        "sql": "SELECT SUM(price * stock) FROM products;",
        "difficulty": "Medium",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T125",
        "question": "total successful sales log records registered on year 2025 limits.",
        "sql": "SELECT COUNT(*) FROM sales WHERE sale_date >= '2025-01-01' AND sale_date <= '2025-12-31';",
        "difficulty": "Easy",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T126",
        "question": "who are premium customer profile members having user id greater 5?",
        "sql": "SELECT name FROM customers WHERE customer_id > 5 AND tier = 'Premium';",
        "difficulty": "Easy",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T127",
        "question": "laptop unit aggregate orders mean pricing index ratios values.",
        "sql": "SELECT AVG(total_amount / quantity) FROM sales WHERE product_id = 101;",
        "difficulty": "Medium",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T128",
        "question": "registration calendar years distribution with core customers headcount metrics.",
        "sql": "SELECT YEAR(join_date) as yr, COUNT(*) FROM customers GROUP BY YEAR(join_date);",
        "difficulty": "Hard",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T129",
        "question": "most expensive product model currently running high in stock items info.",
        "sql": "SELECT product_name, price FROM products WHERE stock > 0 ORDER BY price DESC LIMIT 1;",
        "difficulty": "Easy",
        "category": "Banglish Robustness"
    })
    tasks.append({
        "id": "T130",
        "question": "Sylhet customer Tasnim Ahmed buying records on smartphone product dates logs.",
        "sql": "SELECT s.sale_date FROM sales s JOIN customers c ON s.customer_id = c.customer_id JOIN products p ON s.product_id = p.product_id WHERE c.name = 'তাসনিম আহমেদ' AND c.city = 'Sylhet' AND p.product_name = 'স্মার্টফোন';",
        "difficulty": "Hard",
        "category": "Banglish Robustness"
    })


    # ------------------ 30 Dialect-Inspired Queries (T131 - T160) ------------------
    # Regional speech variations / dialects (Sylheti, Chittagonian, Dhakaiya, etc.)
    tasks.append({
        "id": "T131",
        "question": "ঢাকা শহরের হকল কাস্টমারের নাম আর টায়ার দেখাও তো ভাই।",
        "sql": "SELECT name, tier FROM customers WHERE city = 'Dhaka';",
        "difficulty": "Easy",
        "category": "Dialect Robustness"
    })
    tasks.append({
        "id": "T132",
        "question": "কোন কোন কাস্টমার 'Premium' টায়ারের ভিত্রে পড়ে?",
        "sql": "SELECT name FROM customers WHERE tier = 'Premium';",
        "difficulty": "Easy",
        "category": "Dialect Robustness"
    })
    tasks.append({
        "id": "T133",
        "question": "যেগাইন মালের স্টক ১০টার তনে কম আছে ওগাইনের একটা লিস্ট করাইন।",
        "sql": "SELECT product_name, stock FROM products WHERE stock < 10;",
        "difficulty": "Easy",
        "category": "Dialect Robustness"
    })
    tasks.append({
        "id": "T134",
        "question": "আমাগো মোট কতখান মাল বেচা হইছে আর মোট কত টেকা আইলো?",
        "sql": "SELECT SUM(quantity) as total_quantity, SUM(total_amount) as total_revenue FROM sales;",
        "difficulty": "Medium",
        "category": "Dialect Robustness"
    })
    tasks.append({
        "id": "T135",
        "question": "প্রত্যেক রকম মালের এভারেজ দাম কত রে বাপু? দামের সিরিয়াল ধইরা সাজাও দেখি।",
        "sql": "SELECT category, AVG(price) as avg_price FROM products GROUP BY category ORDER BY avg_price ASC;",
        "difficulty": "Medium",
        "category": "Dialect Robustness"
    })
    tasks.append({
        "id": "T136",
        "question": "আজকা তক কোন জিনিসটা সবচেয়ে বেশি বেচা গেছে?",
        "sql": "SELECT p.product_name, SUM(s.quantity) as total_sold FROM sales s JOIN products p ON s.product_id = p.product_id GROUP BY p.product_name ORDER BY total_sold DESC LIMIT 1;",
        "difficulty": "Medium",
        "category": "Dialect Robustness"
    })
    tasks.append({
        "id": "T137",
        "question": "আবুল কালাম ভাইয়া কোন পোলার মারফত কিসব মালপাতি কিনছে দেহাও তো?",
        "sql": "SELECT DISTINCT p.product_name FROM sales s JOIN customers c ON s.customer_id = c.customer_id JOIN products p ON s.product_id = p.product_id WHERE c.name = 'আবুল কালাম';",
        "difficulty": "Medium",
        "category": "Dialect Robustness"
    })
    tasks.append({
        "id": "T138",
        "question": "আমরা যে যে শহরে বাটি বা বেচি, হেই হেই শহরে আমাগো কয়ডা কাস্টমার আচে?",
        "sql": "SELECT city, COUNT(customer_id) as customer_count FROM customers GROUP BY city;",
        "difficulty": "Easy",
        "category": "Dialect Robustness"
    })
    tasks.append({
        "id": "T139",
        "question": "কোন জিরো শহরে ২৫,০০০ টেহার বেশি বিকিরি হইছে?",
        "sql": "SELECT c.city, SUM(s.total_amount) as total_sales FROM sales s JOIN customers c ON s.customer_id = c.customer_id GROUP BY c.city HAVING total_sales > 25000;",
        "difficulty": "Hard",
        "category": "Dialect Robustness"
    })
    tasks.append({
        "id": "T140",
        "question": "২০২৪ সালে যেগুলা কাস্টমার আইছে ওগো মোট কেনা মালের হিসাব দাওদেহি।",
        "sql": "SELECT c.name, COALESCE(SUM(s.quantity), 0) as total_quantity FROM customers c LEFT JOIN sales s ON c.customer_id = s.customer_id WHERE c.join_date >= '2024-01-01' AND c.join_date <= '2024-12-31' GROUP BY c.name;",
        "difficulty": "Hard",
        "category": "Dialect Robustness"
    })
    # Additional 20 Dialect records
    tasks.append({
        "id": "T141",
        "question": "চিটাগাং শহরর বেগ্গুন খদ্দেরর তালিকা ও নাম বেগ্গুন দেখাও জি।",
        "sql": "SELECT * FROM customers WHERE city = 'Chittagong';",
        "difficulty": "Easy",
        "category": "Dialect Robustness"
    })
    tasks.append({
        "id": "T142",
        "question": "আমাগোর প্রিমিয়াম কাস্টমার কারা কারা হ্যার নামডি একটু বাহির করেন তানি।",
        "sql": "SELECT name FROM customers WHERE tier = 'Premium';",
        "difficulty": "Easy",
        "category": "Dialect Robustness"
    })
    tasks.append({
        "id": "T143",
        "question": "ইলেকট্রনিক্সের বেগ্গুন মালের নাম আর দরদাম কত টিয়া দেখাও জি।",
        "sql": "SELECT product_name, price FROM products WHERE category = 'Electronics';",
        "difficulty": "Easy",
        "category": "Dialect Robustness"
    })
    tasks.append({
        "id": "T144",
        "question": "মজুদ মালামালের হকলটির দাম গড়পড়তায় কত টেকা করে দাঁড়ায় রে ভাই?",
        "sql": "SELECT AVG(price) FROM products;",
        "difficulty": "Easy",
        "category": "Dialect Robustness"
    })
    tasks.append({
        "id": "T145",
        "question": "আমাগোর এইহানে কাস্টমার হগলের সর্বমোট কয়জন রেজিস্ট্রি করচেন?",
        "sql": "SELECT COUNT(*) FROM customers;",
        "difficulty": "Easy",
        "category": "Dialect Robustness"
    })
    tasks.append({
        "id": "T146",
        "question": "মেইলা টেকা দিয়া সাবেকের সবচাইতে বেশি দামে মাল কিন্যা নিছে কোনজন?",
        "sql": "SELECT c.name, SUM(s.total_amount) as total_spent FROM sales s JOIN customers c ON s.customer_id = c.customer_id GROUP BY c.name ORDER BY total_spent DESC LIMIT 1;",
        "difficulty": "Medium",
        "category": "Dialect Robustness"
    })
    tasks.append({
        "id": "T147",
        "question": "সব মালমত্তর গড়পড়তা দামের চাইতে ওঁচা দামের মালগুলান কোনখান?",
        "sql": "SELECT product_name, price FROM products WHERE price > (SELECT AVG(price) FROM products);",
        "difficulty": "Hard",
        "category": "Dialect Robustness"
    })
    tasks.append({
        "id": "T148",
        "question": "সিলেটি কাস্টমার তাসনিম আহমেদ কোন কোন্ মাল কিনছে দেখাও জি।",
        "sql": "SELECT DISTINCT p.product_name FROM sales s JOIN customers c ON s.customer_id = c.customer_id JOIN products p ON s.product_id = p.product_id WHERE c.name = 'তাসনিম আহমেদ';",
        "difficulty": "Medium",
        "category": "Dialect Robustness"
    })
    tasks.append({
        "id": "T149",
        "question": "কোনটা মাল এক্কেরে অবিক্রীত বা স্টকে পইড়া রইছে দেখাও দেহি।",
        "sql": "SELECT product_name FROM products WHERE product_id NOT IN (SELECT DISTINCT product_id FROM sales WHERE product_id IS NOT NULL);",
        "difficulty": "Hard",
        "category": "Dialect Robustness"
    })
    tasks.append({
        "id": "T150",
        "question": "নিজেগো শহরের ভিত্তি ধইরা প্রিমিয়াম খদ্দের হগলেরে গণনা কর দেহি ভাই।",
        "sql": "SELECT city, COUNT(*) FROM customers WHERE tier = 'Premium' GROUP BY city;",
        "difficulty": "Medium",
        "category": "Dialect Robustness"
    })
    tasks.append({
        "id": "T151",
        "question": "২০২৫ সালের ফাল্গুন বা ফেব্রুয়ারিতে সর্বমোট বিকিকিনি কেমন অইছে?",
        "sql": "SELECT SUM(total_amount) FROM sales WHERE sale_date >= '2025-02-01' AND sale_date <= '2025-02-28';",
        "difficulty": "Medium",
        "category": "Dialect Robustness"
    })
    tasks.append({
        "id": "T152",
        "question": "কাস্টমার হগোল কে কোন সালে আইসা জোড়া লাগলো হেই খবরডা দাও।",
        "sql": "SELECT YEAR(join_date) as yr, COUNT(*) FROM customers GROUP BY YEAR(join_date);",
        "difficulty": "Hard",
        "category": "Dialect Robustness"
    })
    tasks.append({
        "id": "T153",
        "question": "আইডি ৫ এর চাইতে বড় এবং Premium মেম্বার কার গো দেখাও তানি।",
        "sql": "SELECT name FROM customers WHERE customer_id > 5 AND tier = 'Premium';",
        "difficulty": "Easy",
        "category": "Dialect Robustness"
    })
    tasks.append({
        "id": "T154",
        "question": "ল্যাপটপখান গড়ে কত টেহা বেশি দামে চালানি গেচে হেডা হিসাব লও।",
        "sql": "SELECT AVG(total_amount / quantity) FROM sales WHERE product_id = 101;",
        "difficulty": "Medium",
        "category": "Dialect Robustness"
    })
    tasks.append({
        "id": "T155",
        "question": "আমাগো স্টানডার্ট খদ্দের হগলের কাস্টম আইডি আর সিটির বিবরণ গুছাও।",
        "sql": "SELECT customer_id, city FROM customers WHERE tier = 'Standard';",
        "difficulty": "Easy",
        "category": "Dialect Robustness"
    })
    tasks.append({
        "id": "T156",
        "question": "বেসিক মেম্বারশিপ টায়েরের খদ্দেরগুলার পুরো ডায়েরিটা তোল দেখি দাদু।",
        "sql": "SELECT * FROM customers WHERE tier = 'Basic';",
        "difficulty": "Easy",
        "category": "Dialect Robustness"
    })
    tasks.append({
        "id": "T157",
        "question": "যেগুলা পণ্য ৫০০০ টেহার তলানির মুল্যের হেইগুলা বাইর কর তানি।",
        "sql": "SELECT product_name, price FROM products WHERE price < 5000;",
        "difficulty": "Easy",
        "category": "Dialect Robustness"
    })
    tasks.append({
        "id": "T158",
        "question": "ইনভেন্টরির মোট পুঁজি মালসহ গুদামজাত ভ্যালু কত খাড়া অইছে কও দেহি?",
        "sql": "SELECT SUM(price * stock) as val FROM products;",
        "difficulty": "Medium",
        "category": "Dialect Robustness"
    })
    tasks.append({
        "id": "T159",
        "question": "সাদিয়া বুজির সর্বমোট কেনা মালামাল কয়বার অর্ডার দিচে হেডা কও দেখি।",
        "sql": "SELECT COUNT(*) FROM sales s JOIN customers c ON s.customer_id = c.customer_id WHERE c.name = 'সাদিয়া রহমান';",
        "difficulty": "Medium",
        "category": "Dialect Robustness"
    })
    tasks.append({
        "id": "T160",
        "question": "আরিফ বাই কোন কোন মালের ক্যাটাগরি থাইক্যা জিনিস তুলচে দেহাও তো ভাই।",
        "sql": "SELECT DISTINCT p.category FROM sales s JOIN customers c ON s.customer_id = c.customer_id JOIN products p ON s.product_id = p.product_id WHERE c.name = 'আরিফ হাসান';",
        "difficulty": "Medium",
        "category": "Dialect Robustness"
    })


    # ------------------ 40 Difficult Reasoning Queries (T161 - T200) ------------------
    # Analytical reasoning, nested scopes, complex filters, window-like logic (duckdb SQL dialect compatible)
    tasks.append({
        "id": "T161",
        "question": "গড় বিক্রয় মূল্যের চেয়ে বেশি দামে লেনদেন হওয়া কাস্টমারদের নাম ও মোট খরচের তালিকা দেখাও।",
        "sql": "SELECT c.name, SUM(s.total_amount) as total_spent FROM sales s JOIN customers c ON s.customer_id = c.customer_id GROUP BY c.name HAVING SUM(s.total_amount) > (SELECT AVG(total_amount) FROM sales);",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T162",
        "question": "যেসব পণ্য গড়ে প্রতিটি অর্ডারে ২ সংখ্যা (quantity) এর বেশি পরিমাণে বিক্রি হয়েছে তাদের ক্যাটাগরি ও নাম দেখাও।",
        "sql": "SELECT p.product_name, p.category FROM products p JOIN sales s ON p.product_id = s.product_id GROUP BY p.product_name, p.category HAVING AVG(s.quantity) > 2;",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T163",
        "question": "২০২৪ এবং ২০২৫ সালের মোট বিক্রিত রাজস্বের তুলনামূলক বার্ষিক শতাংশ বা মোট মান আলাদাভাবে দেখাও।",
        "sql": "SELECT YEAR(sale_date) as yr, SUM(total_amount) as annual_revenue FROM sales GROUP BY YEAR(sale_date);",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T164",
        "question": "প্রতিটি গ্রাহকের প্রথম ক্রয়ের তারিখ (first buy date) এবং শেষ ক্রয়ের তারিখ দেখাও নাম সহ।",
        "sql": "SELECT c.name, MIN(s.sale_date) as first_purchase, MAX(s.sale_date) as last_purchase FROM sales s JOIN customers c ON s.customer_id = c.customer_id GROUP BY c.name;",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T165",
        "question": "যেসব কাস্টমার Premium এবং Standard টায়ারে আছেন এবং সর্বনিম্ন ১টি Accessories এবং ১টি Electronics পণ্য কিনেছেন তাদের তালিকা দেখাও।",
        "sql": "SELECT c.name FROM customers c WHERE c.tier IN ('Premium', 'Standard') AND c.customer_id IN (SELECT s.customer_id FROM sales s JOIN products p ON s.product_id = p.product_id WHERE p.category = 'Accessories') AND c.customer_id IN (SELECT s.customer_id FROM sales s JOIN products p ON s.product_id = p.product_id WHERE p.category = 'Electronics');",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T166",
        "question": "যেসব পণ্য মোট স্টকে যত টাকা মূল্যের সম্পদ ধারণ করে (price * stock) তা আমাদের সমগ্র ইনভেন্টরির গড় ভ্যালুর চেয়ে বেশি, সেগুলোর বিবরণ দাও।",
        "sql": "SELECT product_name, (price * stock) as holding_value FROM products WHERE (price * stock) > (SELECT AVG(price * stock) FROM products);",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T167",
        "question": "কোন গ্রাহক আইডি একের অধিক ভিন্ন ক্যাটাগরির পণ্য কেনাকাটা করেছেন তাদের আইডি ও কতটি অনন্য ক্যাটাগরি কিনেছেন তা দেখাও।",
        "sql": "SELECT s.customer_id, COUNT(DISTINCT p.category) as distinct_cats_bought FROM sales s JOIN products p ON s.product_id = p.product_id GROUP BY s.customer_id HAVING distinct_cats_bought > 1;",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T168",
        "question": "ঢাকা শহরে থাকে এমন ও সবচেয়ে আধুনিক বা সবার শেষে যোগ দেওয়া কাস্টমারের জয়েনিং ডেট ও নাম দেখাও।",
        "sql": "SELECT name, join_date FROM customers WHERE city = 'Dhaka' ORDER BY join_date DESC LIMIT 1;",
        "difficulty": "Medium",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T169",
        "question": "যেসকল পণ্যের দাম এবং মজুদের গুণফল ১,০০,০০০ টাকার ওপরে, তাদের ক্যাটাগরি অনুযায়ী শ্রেণিবদ্ধ বিবরণ এবং গড় মজুদ দেখাও।",
        "sql": "SELECT category, AVG(stock) as avg_stock, COUNT(*) as item_count FROM products WHERE price * stock > 100000 GROUP BY category;",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T170",
        "question": "আমাদের ডাটাবেজের সকল কাস্টমারের মোট ক্রয়ের পরিমাণকে (SUM of quantity) শহর অনুযায়ী বিভাজন করে উর্ধ্বক্রমে সাজাও।",
        "sql": "SELECT c.city, SUM(s.quantity) as city_qty FROM sales s JOIN customers c ON s.customer_id = c.customer_id GROUP BY c.city ORDER BY city_qty ASC;",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T171",
        "question": "আমাদের স্টোরের সর্বাধিক বিক্রিত (total_amount এর ভিত্তিতে) ৩টি পণ্যের আইডি, নাম এবং ক্যাটাগরি দেখাও।",
        "sql": "SELECT p.product_id, p.product_name, p.category, SUM(s.total_amount) as revenue FROM sales s JOIN products p ON s.product_id = p.product_id GROUP BY p.product_id, p.product_name, p.category ORDER BY revenue DESC LIMIT 3;",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T172",
        "question": "যেসব সামগ্রী ২০২৫ সালে কমপক্ষে ২ বার বিক্রি হয়েছে সেগুলোর নাম এবং বিক্রয় সংখ্যা দেখাও।",
        "sql": "SELECT p.product_name, COUNT(s.sale_id) as txn_count FROM sales s JOIN products p ON s.product_id = p.product_id WHERE s.sale_date >= '2025-01-01' AND s.sale_date <= '2025-12-31' GROUP BY p.product_name HAVING txn_count >= 2;",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T173",
        "question": "ব্যয় করা মোট মূল্যের ভিত্তিতে ২য় সর্বোচ্চ কাস্টমারের নাম এবং তিনি কত টাকা ব্যয় করেছেন তা হিসাব করো।",
        "sql": "SELECT c.name, SUM(s.total_amount) as spent FROM sales s JOIN customers c ON s.customer_id = c.customer_id GROUP BY c.name ORDER BY spent DESC LIMIT 1 OFFSET 1;",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T174",
        "question": "কোন গ্রাহক প্রতি ক্রয়ে গড়ে ৫০০০ টাকার বেশি মূল্যমান পরিশোধ করেছেন, গড় পরিশোধিত খরচসহ নাম তালিকাভুক্ত করো।",
        "sql": "SELECT c.name, AVG(s.total_amount) as average_ticket FROM sales s JOIN customers c ON s.customer_id = c.customer_id GROUP BY c.name HAVING average_ticket > 5000;",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T175",
        "question": "যেসকল পণ্যের দাম এবং স্টকের আর্থিক ভ্যালু কোনো বিক্রয় অর্ডারের মোট অ্যামাউন্টের সর্বোচ্চ মানের চেয়েও বেশি, তাদের স্টক ভ্যালু ও নাম দাও।",
        "sql": "SELECT product_name, price * stock FROM products WHERE price * stock > (SELECT MAX(total_amount) FROM sales);",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T176",
        "question": "আমাদের স্টোরের প্রতি গ্রাহকের অর্ডারের মোট অ্যামাউন্টের ব্যবধান (সর্বোচ্চ ক্রয় বিয়োগ সর্বনিম্ন ক্রয়) নাম সহ প্রদর্শন করো।",
        "sql": "SELECT c.name, (MAX(s.total_amount) - MIN(s.total_amount)) as ticket_spread FROM sales s JOIN customers c ON s.customer_id = c.customer_id GROUP BY c.name;",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T177",
        "question": "কোন কোন কাস্টমারের যোগদানের সাল ২০২৩ ছিল না এবং তাদের মোট খরচ ১০০০০ টাকার ওপরে ছিল?",
        "sql": "SELECT c.name, SUM(s.total_amount) as total_spent FROM sales s JOIN customers c ON s.customer_id = c.customer_id WHERE YEAR(c.join_date) != 2023 GROUP BY c.name HAVING total_spent > 10000;",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T178",
        "question": "যেসব সামগ্রীর মজুদ গড় ক্যাটাগরি মজুদের চেয়েও কম এবং তাদের মূল্য কমপক্ষে ১০০০ টাকা, সেগুলোর বিবরণ দাও।",
        "sql": "SELECT p1.product_name, p1.stock, p1.price FROM products p1 WHERE p1.stock < (SELECT AVG(p2.stock) FROM products p2 WHERE p2.category = p1.category) AND p1.price >= 1000;",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T179",
        "question": "যেসব গ্রাহক স্টোরের সর্বমোট গড় বিক্রয় পরিমাণের চেয়ে বেশি পিস জিনিস কিনেছেন তাদের নাম ও মোট ক্রয়সংখ্যা দেখাও।",
        "sql": "SELECT c.name, SUM(s.quantity) as total_qty FROM sales s JOIN customers c ON s.customer_id = c.customer_id GROUP BY c.name HAVING total_qty > (SELECT AVG(quantity) FROM sales);",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T180",
        "question": "২০২৫ সালের জানুয়ারি থেকে ফেব্রুয়ারি মাসের মধ্যে সম্পন্ন হওয়া বিক্রয় লেনদেনসমূহের ক্যাটাগরি বিশ্লেষণ এবং অর্জিত গড় রেভিনিউ দেখাও।",
        "sql": "SELECT p.category, AVG(s.total_amount) FROM sales s JOIN products p ON s.product_id = p.product_id WHERE s.sale_date >= '2025-01-01' AND s.sale_date <= '2025-02-28' GROUP BY p.category;",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T181",
        "question": "গ্রাহকের টায়ার ভিত্তিক বার্ষিক মোট বিক্রয়ের ক্যাপিটাল বা আয়ের পরিমাণ বিন্যাস আকারে দেখাও।",
        "sql": "SELECT c.tier, YEAR(s.sale_date) as yr, SUM(s.total_amount) FROM sales s JOIN customers c ON s.customer_id = c.customer_id GROUP BY c.tier, yr;",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T182",
        "question": "Premium গ্রাহকেরা গড়ে কতবার বা কতটি পণ্য কিনেছেন সেই সংখ্যা স্ট্যান্ডার্ড গ্রাহকদের গড় সংখ্যার চেয়ে বেশি কিনা তার বিশ্লেষণ হিসাব দেখাও।",
        "sql": "SELECT c.tier, AVG(s.quantity) FROM sales s JOIN customers c ON s.customer_id = c.customer_id GROUP BY c.tier;",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T183",
        "question": "স্টকের মালামাল সংখ্যার ভিত্তিতে সর্বনিম্ন স্টক থাকা প্রথম ৩টি পণ্যের আইডিসহ মোট বিক্রিত পরিমাণ সামঞ্জস্য করো।",
        "sql": "SELECT p.product_id, p.product_name, p.stock, COALESCE(SUM(s.quantity), 0) FROM products p LEFT JOIN sales s ON p.product_id = s.product_id GROUP BY p.product_id, p.product_name, p.stock ORDER BY p.stock ASC LIMIT 3;",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T184",
        "question": "যেসব ব্র্যান্ড বা পণ্য ২০২৫ সালের জানুয়ারি মাসে কোনো অর্ডার পায়নি তাদের বিবরণ দাও।",
        "sql": "SELECT product_name FROM products WHERE product_id NOT IN (SELECT DISTINCT product_id FROM sales WHERE sale_date >= '2025-01-01' AND sale_date <= '2025-01-31');",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T185",
        "question": "আমাদের মোট গ্রাহকদের মধ্যে কত শতাংশ গ্রাহক অন্তত ১ বার কেনাকাটা করেছেন তার একটি আনুপাতিক শতাংশ হিসাব দেখাও।",
        "sql": "SELECT (COUNT(DISTINCT customer_id) * 100.0 / (SELECT COUNT(*) FROM customers)) FROM sales;",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T186",
        "question": "সর্বাধিক বিক্রয় রাজস্বের (Revenue) পণ্যশ্রেণি এবং সর্বনিম্ন রাজস্ব প্রদান করা পণ্যশ্রেণির নামের জোড় দেখাও।",
        "sql": "SELECT p.category, SUM(s.total_amount) as rev FROM sales s JOIN products p ON s.product_id = p.product_id GROUP BY p.category ORDER BY rev DESC;",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T187",
        "question": "একই গ্রাহক কর্তৃক ক্রয়ের দিনসমূহের মধ্যকার নূন্যতম ব্যবধান বা কতদিন পর পর তিনি কেনাকাটা করেন তার রেকর্ড ট্র্যাকিং।",
        "sql": "SELECT customer_id, COUNT(sale_id) as orders_count FROM sales GROUP BY customer_id HAVING count(sale_id) > 1;",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T188",
        "question": "ঢাকা শহরে বসবাসরত এমন গ্রাহকেরা যারা ‘Standard’ বা ‘Premium’ মেম্বারশিপে আছেন তাদের গড় কেনাকাটার বিল দেখাও।",
        "sql": "SELECT AVG(s.total_amount) FROM sales s JOIN customers c ON s.customer_id = c.customer_id WHERE c.city = 'Dhaka' AND c.tier IN ('Standard', 'Premium');",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T189",
        "question": "সর্বোচ্চ ৩টি অর্ডারে অন্তর্ভুক্ত পণ্যের একক মূল্যের পরিবর্তনশীলতা এবং কাস্টমার নাম বিশ্লেষণ করো।",
        "sql": "SELECT c.name, p.product_name, s.total_amount FROM sales s JOIN customers c ON s.customer_id = c.customer_id JOIN products p ON s.product_id = p.product_id ORDER BY s.total_amount DESC LIMIT 3;",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T190",
        "question": "অনন্য কাস্টমারদের মধ্যে প্রতিটি শহরের কাস্টমারদের গড় অবিরত বা মোট লেনদেনের মূল্যমানের অবশিষ্টাংশ দেখাও।",
        "sql": "SELECT c.city, AVG(s.total_amount) FROM sales s JOIN customers c ON s.customer_id = c.customer_id GROUP BY c.city;",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T191",
        "question": "যে কোয়েরিতে ল্যাপটপ বা স্মার্টফোন ক্রয়ে প্রতিটি টায়ারের গ্রাহকদের আলাদা খরচ টাকার পরিমাণে বিন্যাস করা হয়েছে তা দেখাও।",
        "sql": "SELECT c.tier, SUM(s.total_amount) FROM sales s JOIN customers c ON s.customer_id = c.customer_id JOIN products p ON s.product_id = p.product_id WHERE p.product_name IN ('ল্যাপটপ', 'স্মার্টফোন') GROUP BY c.tier;",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T192",
        "question": "২০২৫ সালের প্রথম সিক্যুয়েন্স বা ১ম ত্রৈমাসিকে ক্যাটাগরি ও মোট বিক্রয় সামগ্রীর বিবরণ দাও।",
        "sql": "SELECT p.category, SUM(s.quantity) FROM sales s JOIN products p ON s.product_id = p.product_id WHERE s.sale_date >= '2025-01-01' AND s.sale_date <= '2025-03-31' GROUP BY p.category;",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T193",
        "question": "কোন গ্রাহকেরা গত ৫ মাসের মধ্যে বা পুরো ২০২৫ সালে মোট ৩ বারের বেশি লেনদেন কার্যক্রম করেছেন তা গণনা করো।",
        "sql": "SELECT c.name, COUNT(s.sale_id) FROM sales s JOIN customers c ON s.customer_id = c.customer_id WHERE s.sale_date >= '2025-01-01' GROUP BY c.name HAVING COUNT(s.sale_id) >= 3;",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T194",
        "question": "স্ট্যান্ডার্ড ক্যাটাগরির গ্রাহক সাদিয়ার ক্রয়ের গড় পণ্যের দাম এবং স্টকের গড় পণ্যের পরিমাণের তুলনা মেট্রিক্স।",
        "sql": "SELECT c.name, AVG(p.price) as avg_price, AVG(p.stock) as avg_stock FROM sales s JOIN customers c ON s.customer_id = c.customer_id JOIN products p ON s.product_id = p.product_id WHERE c.name = 'সাদিয়া রহমান' GROUP BY c.name;",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T195",
        "question": "স্টোরে থাকা মাউস ও কীবোর্ড এই দুই পণ্য ক্রয়ের সংখ্যা যথাক্রমে ল্যাপটপের ক্রয়ের তুলনায় বেশি কিনা তার খতিয়ান।",
        "sql": "SELECT p.product_name, SUM(s.quantity) FROM sales s JOIN products p ON s.product_id = p.product_id WHERE p.product_name IN ('মাউস', 'কীবোর্ড', 'ল্যাপটপ') GROUP BY p.product_name;",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T196",
        "question": "কোন ক্যাটাগরির সামগ্রিক মজুদ সমগ্র ডাটাবেজের সর্বোচ্চ দামি পণ্যের দামের চেয়ে বেশি টাকা মূল্য ধারণ করে?",
        "sql": "SELECT category, SUM(price * stock) as total_val FROM products GROUP BY category HAVING total_val > (SELECT MAX(price) FROM products);",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T197",
        "question": "গ্রাহকেরা জয়েন করার প্রথম ৫ মাসের মধ্যে যে লেনদেন সম্পন্ন করেছেন তাদের নাম ও কেনা আইডি দেখাও।",
        "sql": "SELECT c.name, s.sale_id FROM sales s JOIN customers c ON s.customer_id = c.customer_id WHERE s.sale_date <= (c.join_date + INTERVAL 150 DAYS);",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T198",
        "question": "ঢাকা এবং সিলেট বাদে অন্যান্য শহরে বসবাসরত মেম্বারদের মোট কেনাকাটা কত?",
        "sql": "SELECT SUM(s.total_amount) FROM sales s JOIN customers c ON s.customer_id = c.customer_id WHERE c.city NOT IN ('Dhaka', 'Sylhet');",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T199",
        "question": "যেসব গ্রাহকের রেজিস্ট্রেশনের মাস ছিল জুন তাদের ক্রয়ের সংখ্যা এবং মোট রেভিনিউর বিবরণ দাও।",
        "sql": "SELECT c.name, COUNT(s.sale_id) as cnt, SUM(s.total_amount) FROM sales s JOIN customers c ON s.customer_id = c.customer_id WHERE MONTH(c.join_date) = 6 GROUP BY c.name;",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })
    tasks.append({
        "id": "T200",
        "question": "সর্বমোট আয়ের দিক দিয়ে শীর্ষ ২ কাস্টমার ছাড়া বাকি কাস্টমারদের নাম ও তাদের সর্বমোট ব্যয়ের পরিমাণ দেখাও।",
        "sql": "SELECT c.name, SUM(s.total_amount) as total_spent FROM sales s JOIN customers c ON s.customer_id = c.customer_id GROUP BY c.name ORDER BY total_spent DESC OFFSET 2;",
        "difficulty": "Hard",
        "category": "Complex Reasoning"
    })

    # Assert exactly 200 items are created
    assert len(tasks) == 200, f"Error: count is {len(tasks)}"
    
    # Write cleanly to Tasks file
    with open("b-daab/data/tasks_200.json", "w", encoding="utf-8") as f:
        json.dump(tasks, f, ensure_ascii=False, indent=2)
        
    print("Success: Generated exactly 200 unique tasks in b-daab/data/tasks_200.json")

if __name__ == "__main__":
    generate_tasks()
