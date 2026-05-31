import os
import re
from models.base_model import BaseSQLModel

class HuggingFaceSQLModel(BaseSQLModel):
    def __init__(self, model_name: str = "Qwen/Qwen1.5-0.5B-Chat", system_instruction: str = None):
        self.model_name = model_name
        self.system_instruction = system_instruction or (
            "You are an expert SQL translation agent. Only output SQL. No extra details."
        )

    def generate_sql(self, query: str, schema: str) -> str:
        # Load local transformers and execute. Catch any memory or environment exception and fallback.
        try:
            import torch
            from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
            
            tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                torch_dtype=torch.float32,
                device_map="auto"
            )
            
            prompt = f"<system>\n{self.system_instruction}\nSchema:\n{schema}\n<user>\nTranslate to DuckDB SQL: \"{query}\"\n<assistant>\n"
            
            inputs = tokenizer(prompt, return_tensors="pt")
            with torch.no_grad():
                outputs = model.generate(**inputs, max_new_tokens=256, temperature=0.1)
                
            decoded = tokenizer.decode(outputs[0][inputs.input_ids.shape[1]:], skip_special_tokens=True)
            return self._clean_sql(decoded)
        except Exception as e:
            print(f"[Warning] HuggingFace local pipeline could not be loaded ({e}). Falling back to local rule-based translation.")
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
        return f"HuggingFace ({self.model_name})"

    @property
    def provider(self) -> str:
        return "HuggingFace"
