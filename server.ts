import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import alasql from "alasql";
import dotenv from "dotenv";
import { exec } from "child_process";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize @google/genai as requested in System Skills
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Seed B-DAAB Datasets inside alasql (In-Memory execution)
const customersData = [
  { customer_id: 1, name: 'আবুল কালাম', city: 'Dhaka', tier: 'Premium', join_date: '2023-01-15' },
  { customer_id: 2, name: 'সাদিয়া রহমান', city: 'Chittagong', tier: 'Standard', join_date: '2023-03-22' },
  { customer_id: 3, name: 'তাসনিম আহমেদ', city: 'Sylhet', tier: 'Premium', join_date: '2023-06-10' },
  { customer_id: 4, name: 'নূর ইসলাম', city: 'Dhaka', tier: 'Standard', join_date: '2024-02-18' },
  { customer_id: 5, name: 'ফারিহা জাহান', city: 'Rajshahi', tier: 'Basic', join_date: '2024-04-05' },
  { customer_id: 6, name: 'আরিফ হাসান', city: 'Khulna', tier: 'Premium', join_date: '2022-11-30' }
];

const productsData = [
  { product_id: 101, product_name: 'ল্যাপটপ', category: 'Electronics', price: 75000.00, stock: 15 },
  { product_id: 102, product_name: 'স্মার্টফোন', category: 'Electronics', price: 35000.00, stock: 45 },
  { product_id: 103, product_name: 'কীবোর্ড', category: 'Accessories', price: 1200.00, stock: 120 },
  { product_id: 104, product_name: 'মাউস', category: 'Accessories', price: 800.00, stock: 8 },
  { product_id: 105, product_name: 'হেডফোন', category: 'Electronics', price: 2500.00, stock: 30 },
  { product_id: 106, product_name: 'অফিস চেয়ার', category: 'Furniture', price: 8500.00, stock: 12 },
  { product_id: 107, product_name: 'টেবিল ল্যাম্প', category: 'Home Decor', price: 1500.00, stock: 3 }
];

const salesData = [
  { sale_id: 1, customer_id: 1, product_id: 101, sale_date: '2025-01-20', quantity: 1, total_amount: 75000.00 },
  { sale_id: 2, customer_id: 2, product_id: 103, sale_date: '2025-01-22', quantity: 2, total_amount: 2400.00 },
  { sale_id: 3, customer_id: 3, product_id: 102, sale_date: '2025-02-05', quantity: 1, total_amount: 35000.00 },
  { sale_id: 4, customer_id: 1, product_id: 104, sale_date: '2025-02-10', quantity: 2, total_amount: 1600.00 },
  { sale_id: 5, customer_id: 4, product_id: 105, sale_date: '2025-02-15', quantity: 3, total_amount: 7500.00 },
  { sale_id: 6, customer_id: 5, product_id: 103, sale_date: '2025-02-18', quantity: 1, total_amount: 1200.00 },
  { sale_id: 7, customer_id: 6, product_id: 101, sale_date: '2025-02-25', quantity: 1, total_amount: 75000.00 },
  { sale_id: 8, customer_id: 2, product_id: 106, sale_date: '2025-03-02', quantity: 1, total_amount: 8500.00 },
  { sale_id: 9, customer_id: 3, product_id: 107, sale_date: '2025-03-10', quantity: 2, total_amount: 3000.00 },
  { sale_id: 10, customer_id: 4, product_id: 102, sale_date: '2025-03-12', quantity: 1, total_amount: 35000.00 }
];

// Initialize database tables in alasql
alasql("CREATE TABLE customers (customer_id INT, name STRING, city STRING, tier STRING, join_date STRING)");
alasql("CREATE TABLE products (product_id INT, product_name STRING, category STRING, price NUMERIC, stock INT)");
alasql("CREATE TABLE sales (sale_id INT, customer_id INT, product_id INT, sale_date STRING, quantity INT, total_amount NUMERIC)");

alasql.tables.customers.data = customersData;
alasql.tables.products.data = productsData;
alasql.tables.sales.data = salesData;

const schemaDescriptionForLLM = `
TABLE schemas and explanations:

1. Table: customers
   - customer_id: INTEGER (Primary Key) - Unique customer identifier
   - name: VARCHAR - Customer's name (e.g., 'আবুল কালাম', 'সাদিয়া রহমান', 'তাসনিম আহমেদ', 'নূর ইসলাম', 'ফারিহা জাহান', 'আরিফ হাসান')
   - city: VARCHAR - Customer's city (e.g., 'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna')
   - tier: VARCHAR - Customer loyalty tier (e.g., 'Premium', 'Standard', 'Basic')
   - join_date: DATE - YYYY-MM-DD joining date

2. Table: products
   - product_id: INTEGER (Primary Key) - Unique product id
   - product_name: VARCHAR - Name of product in Bengali (e.g., 'ল্যাপটপ', 'স্মার্টফোন', 'কীবোর্ড', 'মাউস', 'হেডফোন', 'অফিস চেয়ার', 'টেবিল ল্যাম্প')
   - category: VARCHAR - Product category (e.g., 'Electronics', 'Accessories', 'Furniture', 'Home Decor')
   - price: DECIMAL - Cost per item
   - stock: INTEGER - Quantity in inventory

3. Table: sales
   - sale_id: INTEGER (Primary Key) - Unique sale transaction id
   - customer_id: INTEGER (Foreign Key) - Links to customers.customer_id
   - product_id: INTEGER (Foreign Key) - Links to products.product_id
   - sale_date: DATE - YYYY-MM-DD date of transaction
   - quantity: INTEGER - Quantity purchased
   - total_amount: DECIMAL - Total receipt cost
`;

// Helper: Clean markdown enclosures in generated SQL
function cleanSQLString(raw: string): string {
  const codeBlockRegex = /```(?:sql)?\s*([\s\S]*?)\s*```/i;
  const match = raw.match(codeBlockRegex);
  if (match) {
    return match[1].trim();
  }
  return raw.trim();
}

// 1. GET /api/schema - Snapshot datas
app.get("/api/schema", (req: Request, res: Response) => {
  res.json({
    schemaDescription: schemaDescriptionForLLM,
    customers: customersData,
    products: productsData,
    sales: salesData
  });
});

// Helper: Translates Bengali questions to formal English using Google Gemini Flash
async function translateBengaliToEnglish(query: string): Promise<string> {
  const systemInstruction = "You are a precise, context-aware Bengali-to-English translator specializing in database access commands. Translate the Bengali command exactly into natural, formal English. Keep table-related nouns intact. ONLY return the raw translated string. Do not append quotes or notes.";
  const prompt = `Translate this Bengali sentence to English: '${query}'`;
  try {
    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.1,
      }
    });
    return (result.text || "").trim().replace(/^['"]|['"]$/g, "");
  } catch (err) {
    console.warn("Translation failed, falling back to original:", err);
    return query;
  }
}

// 1.5. GET /api/versions - Returns available agent configurations
app.get("/api/versions", (req: Request, res: Response) => {
  res.json([
    {
      version_id: "v1.0-Vanilla",
      name: "Vanilla Bengali LLM Agent",
      description: "Standard zero-shot SQL generation directly on original Bengali phrases using native system prompts.",
      model_name: "gemini-3.5-flash",
      use_translator: false
    },
    {
      version_id: "v1.1-Translation-Proxy",
      name: "Translation-Proxy English Agent",
      description: "Translates the Bengali query to English first via our custom Translation module, then prompts Gemini to output clean SQL matching the schema definition.",
      model_name: "gemini-3.5-flash",
      use_translator: true
    },
    {
      version_id: "v2.0-FewShot-CoT",
      name: "Few-Shot Chain of Thought Agent",
      description: "Uses standard direct Bengali SQL generation but incorporates Few-Shot examples and Chain of Thought instructions.",
      model_name: "gemini-3.5-flash",
      use_translator: false
    }
  ]);
});

// 2. POST /api/translate-sql - Translates Bengali key search term to ANSI SQL with specific Agent version features
app.post("/api/translate-sql", async (req: Request, res: Response) => {
  try {
    const { query, version_id = "v1.0-Vanilla" } = req.body;
    if (!query || typeof query !== "string") {
      res.status(400).json({ error: "Missing or invalid query prompt" });
      return;
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      res.status(403).json({ error: "Missing GEMINI_API_KEY. Please provide this under Settings -> Secrets to enable natural SQL translation." });
      return;
    }

    let queryToProcess = query;
    let translationInfo = "";

    if (version_id === "v1.1-Translation-Proxy") {
      const englishTranslation = await translateBengaliToEnglish(query);
      queryToProcess = englishTranslation;
      translationInfo = `\nNote: Original Bengali query was translated to English: '${englishTranslation}'\n`;
    }

    let systemInstruction = "";
    if (version_id === "v1.1-Translation-Proxy") {
      systemInstruction = `You are an expert SQL translator for B-DAAB (Bengali Data Agent Benchmark).
Your task is to translate standard English commands (which were translated from raw Bengali) into clean executable DuckDB SQL queries.
Guidelines:
1. Only return the raw SQL query. Do not provide explanations, chatter, or secondary remarks.
2. Your output should match standard ANSI SQL dialect supported by DuckDB.
3. Rely strictly on the database schema description provided.
4. Match lowercase/uppercase identifiers exactly as they are defined in the schema (e.g. table names: 'customers', 'products', 'sales').
5. Handle translated criteria intelligently (e.g. if the user says 'Abul Kalam', search name = 'আবুল কালাম' since values in the database are stored in Bengali; if they say 'Dhaka', filter city = 'Dhaka').`;
    } else if (version_id === "v2.0-FewShot-CoT") {
      systemInstruction = `You are an expert SQL translation agent for the B-DAAB (Bengali Data Agent Benchmark).
Your task is to translate native Bengali queries into highly optimized DuckDB SQL queries.
Guidelines:
1. ONLY return the final raw SQL query inside code blocks or plain text. Do not provide conversational explanations.
2. Match all database tables exactly: 'customers', 'products', 'sales'.

Study these Few-Shot translation pairs:

Input: "ঢাকা শহরের সকল গ্রাহকদের নাম ও টায়ার দেখাও।"
SQL: SELECT name, tier FROM customers WHERE city = 'Dhaka';

Input: "সবচেয়ে দামি পণ্যের নাম, স্টক এবং দাম দেখান।"
SQL: SELECT product_name, stock, price FROM products ORDER BY price DESC LIMIT 1;

Input: "আবুল কালাম নামের গ্রাহক আজ পর্যন্ত কোন কোন পণ্যটি কিনেছেন?"
SQL: SELECT DISTINCT p.product_name FROM sales s JOIN customers c ON s.customer_id = c.customer_id JOIN products p ON s.product_id = p.product_id WHERE c.name = 'আবুল কালাম';

Apply these exact representations to generate valid, reproducible DuckDB SQL queries for the input question.`;
    } else {
      systemInstruction = `You are an expert SQL translation agent for the B-DAAB (Bengali Data Agent Benchmark).
Translate the user's Bengali command into a single, valid, clean, standard SQL query for the given database schema.
Strict Guidelines:
1. ONLY return the clean raw SQL. Never output surrounding explanation, bullet-points, conversational padding, or labels outside standard SQL comments.
2. Ensure you match case-sensitivities and table structures exactly: 'customers', 'products', 'sales'.
3. Support Bengali entity filters intelligently (e.g., if user says 'আবুল কালাম', query name = 'আবুল কালাম'; if they say 'ল্যাপটপ', products.product_name = 'ল্যাপটপ').
4. Return clean, standard ANSI SQL.`;
    }

    const prompt = `Database Schema:
${schemaDescriptionForLLM}
${translationInfo}
Input Question:
"${queryToProcess}"

Provide the SQL query:`;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.1,
      }
    });

    const generatedText = result.text || "";
    const cleanSql = cleanSQLString(generatedText);

    res.json({ sql: cleanSql, translation: version_id === "v1.1-Translation-Proxy" ? queryToProcess : null });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to call Gemini API" });
  }
});

// 3. POST /api/execute-sql - Runs a SQL raw statement inside alasql engine
app.post("/api/execute-sql", (req: Request, res: Response) => {
  const { sql } = req.body;
  if (!sql || typeof sql !== "string") {
    res.status(400).json({ error: "Missing or empty sql code text string." });
    return;
  }

  try {
    // Standardize query (alasql matches standard keywords, let's remove semicolons if alasql has an issue)
    const sqlToRun = sql.trim().replace(/;$/, "");
    const results = alasql(sqlToRun);
    res.json({ results });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "SQL execution syntactic error." });
  }
});

// Helper: Normalize SQL for string comparing
function normalizeSql(sql: string): string {
  if (!sql) return "";
  return sql.trim().replace(/;$/, "").replace(/\s+/g, " ").toLowerCase();
}

// Helper: Compare output rows (set equivalent, column robust, float round)
function compareResults(pred: any[], gold: any[]): boolean {
  if (!Array.isArray(pred) || !Array.isArray(gold)) return false;
  if (pred.length !== gold.length) return false;
  if (pred.length === 0 && gold.length === 0) return true;

  const normalizeObj = (obj: any) => {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      const lowerKey = key.toLowerCase();
      const val = obj[key];
      if (typeof val === "number") {
        cleaned[lowerKey] = parseFloat(val.toFixed(2));
      } else if (val === null || val === undefined) {
        cleaned[lowerKey] = null;
      } else {
        cleaned[lowerKey] = String(val).trim();
      }
    }
    return JSON.stringify(Object.keys(cleaned).sort().reduce((acc: any, k) => {
      acc[k] = cleaned[k];
      return acc;
    }, {}));
  };

  try {
    const predNormalized = pred.map(normalizeObj).sort();
    const goldNormalized = gold.map(normalizeObj).sort();

    for (let i = 0; i < predNormalized.length; i++) {
      if (predNormalized[i] !== goldNormalized[i]) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

// 4. POST /api/evaluate - Harness benchmark
app.post("/api/evaluate", async (req: Request, res: Response) => {
  try {
    const { version_id = "v1.0-Vanilla", provider, model_name } = req.body;
    const tasksPath = path.join(process.cwd(), "b-daab", "data", "tasks.json");
    if (!fs.existsSync(tasksPath)) {
      res.status(500).json({ error: "tasks.json not found in workspace directories." });
      return;
    }

    // Dynamic routing to the newly created Python Multi-Model Swapped Benchmark Runner
    if (provider) {
      const scriptPath = path.join(process.cwd(), "b-daab", "benchmark_runner.py");
      const dbPath = path.join(process.cwd(), "b_daab.db");
      
      let cmd = `python3 "${scriptPath}" --provider "${provider}" --db "${dbPath}" --tasks "${tasksPath}"`;
      if (model_name) {
        cmd += ` --model-name "${model_name}"`;
      }

      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error(`Benchmark Swapped Runner error: ${error.message}`);
          res.status(500).json({ error: error.message, stderr, stdout });
          return;
        }

        const match = stdout.match(/RAW_JSON_START\n([\s\S]*?)\nRAW_JSON_END/);
        if (match) {
          try {
            const data = JSON.parse(match[1]);
            res.json(data);
            return;
          } catch (e: any) {
            console.error("Failed to parse runner JSON output:", e);
          }
        }

        res.status(500).json({ error: "Could not retrieve parsed evaluation metrics from the backend benchmark runner process.", stdout, stderr });
      });
      return;
    }

    const rawTasks = fs.readFileSync(tasksPath, "utf-8");
    const tasks = JSON.parse(rawTasks);

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      res.status(403).json({ error: "Missing GEMINI_API_KEY! Please supply a key in Settings -> Secrets to execute harness." });
      return;
    }

    let systemInstruction = "";
    if (version_id === "v1.1-Translation-Proxy") {
      systemInstruction = `You are an expert SQL translator for B-DAAB (Bengali Data Agent Benchmark).
Your task is to translate standard English commands (which were translated from raw Bengali) into clean executable DuckDB SQL queries.
Guidelines:
1. Only return the raw SQL query. Do not provide explanations, chatter, or secondary remarks.
2. Your output should match standard ANSI SQL dialect supported by DuckDB.
3. Rely strictly on the database schema description provided.
4. Match lowercase/uppercase identifiers exactly as they are defined in the schema (e.g. table names: 'customers', 'products', 'sales').
5. Handle translated criteria intelligently (e.g. if the user says 'Abul Kalam', search name = 'আবুল কালাম' since values in the database are stored in Bengali; if they say 'Dhaka', filter city = 'Dhaka').`;
    } else if (version_id === "v2.0-FewShot-CoT") {
      systemInstruction = `You are an expert SQL translation agent for the B-DAAB (Bengali Data Agent Benchmark).
Your task is to translate native Bengali queries into highly optimized DuckDB SQL queries.
Guidelines:
1. ONLY return the final raw SQL query inside code blocks or plain text. Do not provide conversational explanations.
2. Match all database tables exactly: 'customers', 'products', 'sales'.

Study these Few-Shot translation pairs:

Input: "ঢাকা শহরের সকল গ্রাহকদের নাম ও টায়ার দেখাও।"
SQL: SELECT name, tier FROM customers WHERE city = 'Dhaka';

Input: "সবচেয়ে দামি পণ্যের নাম, স্টক এবং দাম দেখান।"
SQL: SELECT product_name, stock, price FROM products ORDER BY price DESC LIMIT 1;

Input: "আবুল কালাম নামের গ্রাহক আজ পর্যন্ত কোন কোন পণ্যটি কিনেছেন?"
SQL: SELECT DISTINCT p.product_name FROM sales s JOIN customers c ON s.customer_id = c.customer_id JOIN products p ON s.product_id = p.product_id WHERE c.name = 'আবুল কালাম';

Apply these exact representations to generate valid, reproducible DuckDB SQL queries for the input question.`;
    } else {
      systemInstruction = `You are an expert SQL translation agent for the B-DAAB (Bengali Data Agent Benchmark).
Translate the user's Bengali command into a single, valid, clean, standard SQL query for the given database schema.
Strict Guidelines:
1. ONLY return the clean raw SQL. Never output surrounding explanation, comments, conversational padding, or wrappers.
2. Match case-sensitivities and table structures exactly: 'customers', 'products', 'sales'.
3. Standard ANSI SQL dialect compatible with in-memory execution engines.`;
    }

    const results = [];
    let exactMatchesCount = 0;
    let executionMatchesCount = 0;

    for (const task of tasks) {
      let queryToProcess = task.bengali_query;
      let translationInfo = "";

      if (version_id === "v1.1-Translation-Proxy") {
        const englishTranslation = await translateBengaliToEnglish(task.bengali_query);
        queryToProcess = englishTranslation;
        translationInfo = `\nNote: Original Bengali query was translated to English: '${englishTranslation}'\n`;
      }

      const prompt = `Database Schema:
${schemaDescriptionForLLM}
${translationInfo}
Input Question:
"${queryToProcess}"

Provide the SQL query:`;

      let predSql = "";
      let isExactMatch = false;
      let isExecutionMatch = false;
      let errorDetails: string | null = null;
      let predResults: any[] = [];
      let goldResults: any[] = [];

      try {
        // Generate SQL
        const apiResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.1,
          }
        });

        predSql = cleanSQLString(apiResponse.text || "");

        // Compute exact match
        isExactMatch = normalizeSql(predSql) === normalizeSql(task.sql_gold);
        if (isExactMatch) exactMatchesCount++;

        // Execute Gold SQL
        try {
          goldResults = alasql(task.sql_gold.trim().replace(/;$/, ""));
        } catch (gErr: any) {
          console.error(`Gold SQL failure on task ${task.task_id}:`, gErr);
        }

        // Execute Pred SQL
        try {
          predResults = alasql(predSql.trim().replace(/;$/, ""));
          isExecutionMatch = compareResults(predResults, goldResults);
          if (isExecutionMatch) executionMatchesCount++;
        } catch (pErr: any) {
          errorDetails = pErr.message || "Syntactic execution error";
        }

      } catch (err: any) {
        errorDetails = err.message || "Gemini Generation Failed";
      }

      results.push({
        task_id: task.task_id,
        bengali_query: task.bengali_query,
        difficulty: task.difficulty,
        category: task.category,
        sql_gold: task.sql_gold,
        sql_pred: predSql,
        exact_match: isExactMatch,
        execution_match: isExecutionMatch,
        error_details: errorDetails
      });
    }

    const totalTasks = tasks.length;
    const summary = {
      total_tasks: totalTasks,
      exact_match_accuracy: Math.round((exactMatchesCount / totalTasks) * 10000) / 100,
      execution_accuracy: Math.round((executionMatchesCount / totalTasks) * 10000) / 100,
      exact_match_count: exactMatchesCount,
      execution_match_count: executionMatchesCount
    };

    // Save evaluating run back into our local persistent historical log JSON
    try {
      const historyPath = path.join(process.cwd(), "b-daab", "data", "eval_history.json");
      let historyData: any = {};
      if (fs.existsSync(historyPath)) {
        try {
          historyData = JSON.parse(fs.readFileSync(historyPath, "utf-8"));
        } catch {
          historyData = {};
        }
      }
      historyData[version_id] = {
        version_id,
        agent_name: version_id === "v1.1-Translation-Proxy" ? "Translation-Proxy English Agent" : version_id === "v2.0-FewShot-CoT" ? "Few-Shot Chain of Thought Agent" : "Vanilla Bengali LLM Agent",
        model_name: "gemini-3.5-flash",
        total_tasks: totalTasks,
        exact_match_accuracy: summary.exact_match_accuracy,
        execution_accuracy: summary.execution_accuracy,
        timestamp: "Latest Run"
      };
      fs.writeFileSync(historyPath, JSON.stringify(historyData, null, 2), "utf-8");
    } catch (e) {
      console.error("Could not write evaluation history from API:", e);
    }

    res.json({
      summary,
      task_results: results
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message || "Benchmark evaluation logic failed." });
  }
});

// 5. GET /api/code - Load generated python files for inline visualization/explorations
app.get("/api/code", (req: Request, res: Response) => {
  const rootDir = path.join(process.cwd(), "b-daab");
  const filesToRead = [
    { name: "requirements.txt", relPath: "requirements.txt", type: "text" },
    { name: "db.py", relPath: "db.py", type: "python" },
    { name: "executor.py", relPath: "executor.py", type: "python" },
    { name: "generator.py", relPath: "data/generator.py", type: "python" },
    { name: "tasks_synthetic.json", relPath: "data/tasks_synthetic.json", type: "json" },
    { name: "tasks.json", relPath: "data/tasks.json", type: "json" },
    { name: "sql_agent.py", relPath: "agent/sql_agent.py", type: "python" },
    { name: "ocr_benchmark.py", relPath: "vision/ocr_benchmark.py", type: "python" },
    { name: "dashboard.py", relPath: "dashboard.py", type: "python" },
    { name: "paper_tools.py", relPath: "paper_tools.py", type: "python" },
    { name: "evaluation.py", relPath: "eval/evaluation.py", type: "python" },
    { name: "failure_analysis.py", relPath: "eval/failure_analysis.py", type: "python" },
    { name: "leaderboard.py", relPath: "eval/leaderboard.py", type: "python" },
    { name: "main.py", relPath: "main.py", type: "python" },
    { name: "app.py", relPath: "app.py", type: "python" }
  ];

  const codebases = filesToRead.map(file => {
    const fullPath = path.join(rootDir, file.relPath);
    let code = "# File could not be retrieved.";
    try {
      if (fs.existsSync(fullPath)) {
        code = fs.readFileSync(fullPath, "utf-8");
      }
    } catch (e: any) {
      code = `# Error reading file: ${e.message}`;
    }
    return {
      name: file.name,
      relPath: file.relPath,
      type: file.type,
      code
    };
  });

  res.json({ codebases });
});

// 5.5. POST /api/generate-synthetic - Execute python task generator
app.post("/api/generate-synthetic", (req: Request, res: Response) => {
  const { count = 2000, seed = 100, merge = false } = req.body;
  const scriptPath = path.join(process.cwd(), "b-daab", "data", "generator.py");
  const outputPath = path.join(process.cwd(), "b-daab", "data", "tasks_synthetic.json");
  const mergePath = path.join(process.cwd(), "b-daab", "data", "tasks.json");

  // Format safe CLI arguments
  const safeCount = Math.min(Math.max(1, Number(count)), 10000);
  const safeSeed = Number(seed) || 100;
  
  let cmd = `python3 "${scriptPath}" --count ${safeCount} --seed ${safeSeed} --output "${outputPath}"`;
  if (merge) {
    cmd += ` --merge-into "${mergePath}"`;
  }

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Generator run error: ${error.message}`);
      res.status(500).json({ error: error.message, stderr, stdout });
      return;
    }

    try {
      if (fs.existsSync(outputPath)) {
        const raw = fs.readFileSync(outputPath, "utf-8");
        const tasks = JSON.parse(raw);

        // Compute statistics on difficulty and category splits
        const diffStats: Record<string, number> = {};
        const catStats: Record<string, number> = {};

        tasks.forEach((t: any) => {
          diffStats[t.difficulty] = (diffStats[t.difficulty] || 0) + 1;
          catStats[t.category] = (catStats[t.category] || 0) + 1;
        });

        res.json({
          success: true,
          total_generated: tasks.length,
          output_file: "b-daab/data/tasks_synthetic.json",
          difficulty_distribution: diffStats,
          category_distribution: catStats,
          stdout: stdout.trim(),
          sample: tasks.slice(0, 10)
        });
        return;
      }
    } catch (e: any) {
      console.error("Could not parse generated output stats:", e);
    }

    res.json({
      success: true,
      stdout: stdout.trim(),
      stderr: stderr.trim()
    });
  });
});

// 5.6. POST /api/failure-analysis - Execute python failure analysis
app.post("/api/failure-analysis", (req: Request, res: Response) => {
  const scriptPath = path.join(process.cwd(), "b-daab", "eval", "failure_analysis.py");
  const outputPath = path.join(process.cwd(), "b-daab", "data", "failure_analysis_report.json");
  
  const cmd = `python3 "${scriptPath}" --tasks "data/tasks.json" --output "${outputPath}"`;
  
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Failure Analyzer run error: ${error.message}`);
      res.status(500).json({ error: error.message, stderr, stdout });
      return;
    }
    
    try {
      if (fs.existsSync(outputPath)) {
        const raw = fs.readFileSync(outputPath, "utf-8");
        const report = JSON.parse(raw);
        res.json({
          success: true,
          report,
          stdout: stdout.trim(),
          stderr: stderr.trim()
        });
        return;
      }
    } catch (e: any) {
      console.error("Could not parse failure analysis report:", e);
    }
    
    res.json({
      success: true,
      stdout: stdout.trim(),
      stderr: stderr.trim()
    });
  });
});

// GET /api/failure-analysis - Retrieve pre-computed report
app.get("/api/failure-analysis", (req: Request, res: Response) => {
  const outputPath = path.join(process.cwd(), "b-daab", "data", "failure_analysis_report.json");
  try {
    if (fs.existsSync(outputPath)) {
      const raw = fs.readFileSync(outputPath, "utf-8");
      const report = JSON.parse(raw);
      res.json({ success: true, report });
      return;
    }
  } catch (e: any) {
    console.error("Could not read failure analysis report:", e);
  }
  res.json({ success: false, error: "No pre-computed report found. Please run the analyser first." });
});

// 5.7. GET /api/leaderboard/rank - Get ranked models list
app.get("/api/leaderboard/rank", (req: Request, res: Response) => {
  const scriptPath = path.join(process.cwd(), "b-daab", "eval", "leaderboard.py");
  const outputPath = path.join(process.cwd(), "b-daab", "data", "leaderboard_ranked.json");
  const cmd = `python3 "${scriptPath}" --action export-json --output "${outputPath}"`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Leaderboard rank script compilation error: ${error.message}`);
      res.status(500).json({ error: error.message, stderr, stdout });
      return;
    }
    try {
      if (fs.existsSync(outputPath)) {
        const raw = fs.readFileSync(outputPath, "utf-8");
        const report = JSON.parse(raw);
        res.json({ success: true, report, stdout });
        return;
      }
    } catch (e: any) {
      console.error("Could not parse leaderboard report:", e);
    }
    res.status(500).json({ error: "Leaderboard ranked output file could not be generated." });
  });
});

// 5.8. POST /api/leaderboard/save - Save benchmark run to history index
app.post("/api/leaderboard/save", (req: Request, res: Response) => {
  const { version_id, agent_name, model_name, ex, em, status } = req.body;
  if (!version_id || !agent_name || ex === undefined || em === undefined) {
    res.status(400).json({ error: "Missing required parameters for saving leaderboard rank submission." });
    return;
  }
  const scriptPath = path.join(process.cwd(), "b-daab", "eval", "leaderboard.py");
  const cmd = `python3 "${scriptPath}" --action save --version-id "${version_id}" --agent-name "${agent_name}" --model-name "${model_name || 'gemini-3.5-flash'}" --ex ${ex} --em ${em} --status "${status || 'Submitted'}"`;
  
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Leaderboard save script error: ${error.message}`);
      res.status(500).json({ error: error.message, stderr, stdout });
      return;
    }
    res.json({ success: true, stdout: stdout.trim() });
  });
});

// 5.9. POST /api/leaderboard/compare - Request a model comparison
app.post("/api/leaderboard/compare", (req: Request, res: Response) => {
  const { model_a, model_b } = req.body;
  if (!model_a || !model_b) {
    res.status(400).json({ error: "Missing model_a or model_b variables for head-to-head comparison." });
    return;
  }
  const scriptPath = path.join(process.cwd(), "b-daab", "eval", "leaderboard.py");
  const cmd = `python3 "${scriptPath}" --action compare --model-a "${model_a}" --model-b "${model_b}"`;
  
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Leaderboard compare execution error: ${error.message}`);
      res.status(500).json({ error: error.message, stderr, stdout });
      return;
    }
    res.json({ success: true, resultText: stdout.trim() });
  });
});

// 6.0. GET /api/leaderboard/export-csv - Download leaderboard CSV
app.get("/api/leaderboard/export-csv", (req: Request, res: Response) => {
  const scriptPath = path.join(process.cwd(), "b-daab", "eval", "leaderboard.py");
  const csvPath = path.join(process.cwd(), "b-daab", "data", "leaderboard_report.csv");
  const cmd = `python3 "${scriptPath}" --action export-csv --output "${csvPath}"`;
  
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Leaderboard export-csv runtime error: ${error.message}`);
      res.status(500).json({ error: error.message, stderr, stdout });
      return;
    }
    try {
      if (fs.existsSync(csvPath)) {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=leaderboard_report.csv");
        res.sendFile(csvPath);
        return;
      }
    } catch (e: any) {
      console.error("Could not send csv report:", e);
    }
    res.status(500).json({ error: "Could not export CSV file." });
  });
});

// 6.1. GET /api/leaderboard/export-json - Download leaderboard JSON
app.get("/api/leaderboard/export-json", (req: Request, res: Response) => {
  const scriptPath = path.join(process.cwd(), "b-daab", "eval", "leaderboard.py");
  const jsonPath = path.join(process.cwd(), "b-daab", "data", "leaderboard_report.json");
  const cmd = `python3 "${scriptPath}" --action export-json --output "${jsonPath}"`;
  
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Leaderboard export-json internal error: ${error.message}`);
      res.status(500).json({ error: error.message, stderr, stdout });
      return;
    }
    try {
      if (fs.existsSync(jsonPath)) {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", "attachment; filename=leaderboard_report.json");
        res.sendFile(jsonPath);
        return;
      }
    } catch (e: any) {
      console.error("Could not send json report:", e);
    }
    res.status(500).json({ error: "Could not export JSON report file." });
  });
});

// Helper to verify and install missing python dependencies dynamically
function ensurePythonDependencies(callback: (err: any) => void) {
  exec("python3 -c \"import numpy, cv2\"", (err) => {
    if (!err) {
      callback(null);
      return;
    }
    console.log("Missing python dependencies for OCR benchmarking (numpy/cv2). Logging warning...");
    exec("python3 -m pip install --no-cache-dir numpy opencv-python-headless", (installErr, stdout, stderr) => {
      if (installErr) {
        console.log("Dynamic installer notice: packages numpy/opencv-python-headless could not be installed (likely read-only sandbox). Elegant built-in fallbacks will be used.");
        callback(null); // Bypass error blocks and allow benchmark simulation to proceed safely
      } else {
        console.log("Successfully installed numpy and opencv-python-headless.");
        callback(null);
      }
    });
  });
}

// 6.2. POST /api/ocr-benchmark/run - Trigger Bengali OCR benchmark script
app.post("/api/ocr-benchmark/run", (req: Request, res: Response) => {
  const scriptPath = path.join(process.cwd(), "b-daab", "vision", "ocr_benchmark.py");
  const outputPath = path.join(process.cwd(), "b-daab", "data", "ocr_benchmark_results.json");

  ensurePythonDependencies((err) => {
    if (err) {
      res.status(500).json({ error: "Failed to resolve required python libraries (numpy, opencv-python-headless).", details: err.message });
      return;
    }

    const cmd = `python3 "${scriptPath}" --output "${outputPath}"`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`OCR Benchmark execution error: ${error.message}`);
        res.status(500).json({ error: error.message, stderr, stdout });
        return;
      }
      
      try {
        if (fs.existsSync(outputPath)) {
          const raw = fs.readFileSync(outputPath, "utf-8");
          const results = JSON.parse(raw);
          res.json({
            success: true,
            results,
            stdout: stdout.trim(),
            stderr: stderr.trim()
          });
          return;
        }
      } catch (e: any) {
        console.error("Could not parse OCR benchmark results:", e);
      }
      
      // Fallback parsing stdout if file write issues
      const match = stdout.match(/OCR_BENCHMARK_RAW_JSON_START\n([\s\S]*?)\nOCR_BENCHMARK_RAW_JSON_END/);
      if (match) {
        try {
          const data = JSON.parse(match[1]);
          res.json({ success: true, results: data, stdout: stdout.trim() });
          return;
        } catch (e: any) {
          console.error("Failed to parse OCR benchmark stdout JSON:", e);
        }
      }

      res.status(500).json({ error: "Could not retrieve parsed OCR benchmark metrics from subprocess.", stdout, stderr });
    });
  });
});

// 6.3. GET /api/ocr-benchmark - Read pre-computed OCR benchmark results
app.get("/api/ocr-benchmark", (req: Request, res: Response) => {
  const outputPath = path.join(process.cwd(), "b-daab", "data", "ocr_benchmark_results.json");
  try {
    if (fs.existsSync(outputPath)) {
      const raw = fs.readFileSync(outputPath, "utf-8");
      const results = JSON.parse(raw);
      res.json({ success: true, results });
      return;
    }
  } catch (e: any) {
    console.error("Could not read OCR benchmark results:", e);
  }
  res.json({ success: false, error: "No pre-computed report found. Please run the OCR benchmark." });
});

// 6.4. Serve static OCR image assets
app.use("/api/ocr-assets", express.static(path.join(process.cwd(), "b-daab", "data", "ocr_benchmark_assets")));

// 6.5. GET /api/publications/list - Lists all available research paper source files and assets
app.get("/api/publications/list", (req: Request, res: Response) => {
  const scriptPath = path.join(process.cwd(), "b-daab", "paper_tools.py");
  const pubDir = path.join(process.cwd(), "b-daab", "publications");
  
  // Run paper_tools.py to ensure files like latex_tables_templates.tex and figures are freshly generated
  exec(`python3 "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.warn("Paper tools script execution warning (non-fatal):", error.message);
    }
    
    try {
      if (!fs.existsSync(pubDir)) {
        res.status(404).json({ error: "Publications directory not found." });
        return;
      }
      
      const fileNames = fs.readdirSync(pubDir);
      const publications = fileNames.map(fName => {
        const filePath = path.join(pubDir, fName);
        const stats = fs.statSync(filePath);
        
        // Human readable file size
        const sizeInKb = Math.ceil(stats.size / 1024);
        const sizeStr = `${sizeInKb} KB`;
        
        let fileType = "Other";
        let label = fName;
        let description = "Research asset for the B-DAAB paper submission.";
        
        if (fName.endsWith(".tex")) {
          fileType = "LaTeX Source";
          if (fName === "paper_acl.tex") {
            label = "ACL Paper Submission";
            description = "Complete LaTeX source containing the full ACL 2023 format paper.";
          } else if (fName === "paper_neurips.tex") {
            label = "NeurIPS Paper Submission";
            description = "Complete LaTeX source containing the pre-print paper under NeurIPS 2024 specifications.";
          } else if (fName === "latex_tables_templates.tex") {
            label = "LaTeX Formatting Tables";
            description = "Newly generated and compiled tables including core leaderboard performances and deep ablation statistics.";
          }
        } else if (fName.endsWith(".bib")) {
          fileType = "BibTeX Bibliography";
          label = "References Bibliography Library";
          description = "Full BibTeX database references for all citations inside B-DAAB research publications.";
        } else if (fName.endsWith(".png")) {
          fileType = "Publication Image";
          if (fName === "b_daab_performance.png") {
            label = "Leaderboard Bar Chart";
            description = "High-quality comparative bar chart showing EM vs EX scores across elite backbones.";
          } else if (fName === "b_daab_failures_taxonomy.png") {
            label = "Error Taxonomy Chart";
            description = "Horizontal distribution block displaying the percentages of categorized semantic parsing parser flaws.";
          }
        }
        
        return {
          filename: fName,
          label,
          fileType,
          size: sizeStr,
          description
        };
      });
      
      res.json({ success: true, publications });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to list publications." });
    }
  });
});

// 6.6. GET /api/publications/download - Serves single academic file for secure browser download
app.get("/api/publications/download", (req: Request, res: Response) => {
  const { file } = req.query;
  if (!file || typeof file !== "string") {
    res.status(400).json({ error: "Filename parameter is required." });
    return;
  }
  
  // Prevent directory traversal vulnerabilities
  const safeFilename = path.basename(file);
  const filePath = path.join(process.cwd(), "b-daab", "publications", safeFilename);
  
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: `Requested file '${safeFilename}' not found.` });
    return;
  }
  
  if (safeFilename.endsWith(".png")) {
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", `inline; filename="${safeFilename}"`);
  } else {
    res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
    if (safeFilename.endsWith(".tex")) {
      res.setHeader("Content-Type", "application/x-tex");
    } else if (safeFilename.endsWith(".bib")) {
      res.setHeader("Content-Type", "application/x-bibtex");
    } else {
      res.setHeader("Content-Type", "application/octet-stream");
    }
  }
  
  res.sendFile(filePath);
});

// Vite Middleware for Development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`B-DAAB Fullstack Server running on http://localhost:${PORT}`);
    // Warm up python dependencies on background startup
    ensurePythonDependencies(() => {});
  });
}

startServer();
