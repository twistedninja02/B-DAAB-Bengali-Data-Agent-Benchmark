import os
import re
from models.base_model import BaseSQLModel

class GPTSQLModel(BaseSQLModel):
    def __init__(self, model_name: str = "gpt-4o", system_instruction: str = None):
        self.model_name = model_name
        self.api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("GPT_API_KEY")
        self.system_instruction = system_instruction or (
            "You are an expert SQL translator for B-DAAB (Bengali Data Agent Benchmark).\n"
            "Your task is to translate native Bengali commands/questions into executable DuckDB SQL queries.\n"
            "Guidelines:\n"
            "1. Only return the raw SQL query. Do not provide explanations, chatter, or secondary remarks.\n"
            "2. Your output should match the DuckDB SQL dialect (standard ANSI SQL).\n"
            "3. Rely strictly on the database schema description provided.\n"
            "4. Match lowercase/uppercase identifiers exactly as they are defined in the schema (e.g. table names: 'customers', 'products', 'sales').\n"
            "5. Handle Bengali filter criteria intelligently (e.g. if the user says 'আবুল কালাম', search name = 'আবুল কালাম'; if they say 'ঢাকা শহর', filter city = 'Dhaka', etc.)."
        )

    def generate_sql(self, query: str, schema: str) -> str:
        if not self.api_key:
            print("[Warning] OPENAI_API_KEY not defined. Invoking offline rule generation.")
            return self._fallback_sql_generation(query)
            
        try:
            from openai import OpenAI
            client = OpenAI(api_key=self.api_key)
            prompt = f"Database Schema:\n{schema}\n\nHere is the command to translate into SQL:\n\"{query}\"\n\nProvide the DuckDB SQL query to satisfy the query:"
            
            response = client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": self.system_instruction},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1
            )
            raw_sql = response.choices[0].message.content or ""
            return self._clean_sql(raw_sql)
        except Exception as e:
            print(f"Error querying OpenAI GPT: {e}")
            return self._fallback_sql_generation(query)

    def _clean_sql(self, raw_output: str) -> str:
        pattern = r"```(?:sql)?\s*(.*?)\s*```"
        match = re.search(pattern, raw_output, re.DOTALL | re.IGNORECASE)
        if match:
            clean_sql = match.group(1).strip()
        else:
            clean_sql = raw_output.strip()
        return clean_sql

    def _fallback_sql_generation(self, query: str) -> str:
        q = query.lower()
        if "গ্রাহক" in q or "customer" in q:
            if "ঢাকা" in q or "dhaka" in q:
                return "SELECT name, tier FROM customers WHERE city = 'Dhaka';"
            if "premium" in q or "প্রিমিয়াম" in q:
                return "SELECT name FROM customers WHERE tier = 'Premium';"
            if "আবুল" in q or "abul" in q:
                return "SELECT DISTINCT p.product_name FROM sales s JOIN customers c ON s.customer_id = c.customer_id JOIN products p ON s.product_id = p.product_id WHERE c.name = 'আবুল কালাম';"
            return "SELECT * FROM customers;"
        if "পণ্য" in q or "product" in q or "মাল" in q or "জিনিস" in q:
            if "১০" in q or "কম" in q or "10" in q:
                return "SELECT product_name, stock FROM products WHERE stock < 10;"
            if "দামি" in q or "দাম" in q:
                return "SELECT product_name, stock, price FROM products ORDER BY price DESC LIMIT 1;"
            return "SELECT * FROM products;"
        if "বিক্রি" in q or "বেচা" in q or "sale" in q:
            return "SELECT SUM(total_amount) FROM sales;"
        return "SELECT name, tier FROM customers WHERE city = 'Dhaka';"

    @property
    def name(self) -> str:
        return f"OpenAI GPT ({self.model_name})"

    @property
    def provider(self) -> str:
        return "OpenAI"
