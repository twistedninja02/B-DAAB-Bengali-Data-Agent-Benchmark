import os
import re
import json
from typing import Optional, List, Dict, Any
from google import genai
from google.genai import types
from agent.translator import BengaliToEnglishTranslator

class BengaliSQLAgent:
    """
    Cognitive Agent capable of translating native Bengali natural language queries
    into Syntactically and Semantically valid DuckDB SQL queries based on a given schema.
    Supports modular versioning configurations.
    """
    def __init__(self, api_key: Optional[str] = None, version_id: str = "v1.0-Vanilla"):
        # Load API Key from argument or environment
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        self.client = None
        if self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"Error initializing Gemini client: {e}")
        
        self.version_id = version_id
        self.name = "Vanilla Bengali LLM Agent"
        self.description = "Standard zero-shot SQL generation directly on original Bengali phrases using native system prompts."
        self.model_name = "gemini-3.5-flash"
        self.use_translator = False
        self.system_instruction = ""

        # Initialize the translator module
        self.translator = BengaliToEnglishTranslator(api_key=self.api_key)

        # Load configuration for the selected version
        self.load_version(version_id)

    def load_version(self, version_id: str):
        """
        Loads version attributes dynamically from the versions directory.
        Falls back gracefully on static definitions in case of file errors.
        """
        base_dir = os.path.dirname(os.path.abspath(__file__))
        versions_dir = os.path.join(base_dir, "versions")
        config_loaded = False

        if os.path.exists(versions_dir):
            for file in os.listdir(versions_dir):
                if file.endswith(".json"):
                    file_path = os.path.join(versions_dir, file)
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            data = json.load(f)
                            if data.get("version_id") == version_id:
                                self.version_id = version_id
                                self.name = data.get("name", version_id)
                                self.description = data.get("description", "")
                                self.model_name = data.get("model_name", "gemini-3.5-flash")
                                self.use_translator = data.get("use_translator", False)
                                self.system_instruction = data.get("system_instruction", "")
                                config_loaded = True
                                break
                    except Exception as e:
                        print(f"Error loading agent version config from {file_path}: {e}")

        if not config_loaded:
            # Seamless hardcoded default implementations for offline resilience
            if version_id == "v1.1-Translation-Proxy":
                self.version_id = "v1.1-Translation-Proxy"
                self.name = "Translation-Proxy English Agent"
                self.description = "Translates the Bengali query to English first via our custom Translation module, then prompts Gemini to output clean SQL matching the schema definition."
                self.model_name = "gemini-3.5-flash"
                self.use_translator = True
                self.system_instruction = (
                    "You are an expert SQL translator for B-DAAB (Bengali Data Agent Benchmark).\n"
                    "Your task is to translate standard English commands (which were translated from raw Bengali) into clean executable DuckDB SQL queries.\n"
                    "Guidelines:\n"
                    "1. Only return the raw SQL query. Do not provide explanations, chatter, or secondary remarks.\n"
                    "2. Your output should match standard ANSI SQL dialect supported by DuckDB.\n"
                    "3. Rely strictly on the database schema description provided.\n"
                    "4. Match lowercase/uppercase identifiers exactly as they are defined in the schema (e.g. table names: 'customers', 'products', 'sales').\n"
                    "5. Handle translated criteria intelligently (e.g. if the user says 'Abul Kalam', search name = 'আবুল কালাম' since values in the database are stored in Bengali; if they say 'Dhaka', filter city = 'Dhaka')."
                )
            elif version_id == "v2.0-FewShot-CoT":
                self.version_id = "v2.0-FewShot-CoT"
                self.name = "Few-Shot Chain of Thought Agent"
                self.description = "Uses standard direct Bengali SQL generation but incorporates Few-Shot examples and Chain of Thought instructions."
                self.model_name = "gemini-3.5-flash"
                self.use_translator = False
                self.system_instruction = (
                    "You are an expert SQL translation agent for the B-DAAB (Bengali Data Agent Benchmark).\n"
                    "Your task is to translate native Bengali queries into highly optimized DuckDB SQL queries.\n"
                    "Guidelines:\n"
                    "1. ONLY return the final raw SQL query inside code blocks or plain text. Do not provide conversational explanations.\n"
                    "2. Match all database tables exactly: 'customers', 'products', 'sales'.\n\n"
                    "Study these Few-Shot translation pairs:\n\n"
                    "Input: \"ঢাকা শহরের সকল গ্রাহকদের নাম ও টায়ার দেখাও।\"\n"
                    "SQL: SELECT name, tier FROM customers WHERE city = 'Dhaka';\n\n"
                    "Input: \"সবচেয়ে দামি পণ্যের নাম, স্টক এবং দাম দেখান।\"\n"
                    "SQL: SELECT product_name, stock, price FROM products ORDER BY price DESC LIMIT 1;\n\n"
                    "Input: \"আবুল কালাম নামের গ্রাহক আজ পর্যন্ত কোন কোন পণ্যটি কিনেছেন?\"\n"
                    "SQL: SELECT DISTINCT p.product_name FROM sales s JOIN customers c ON s.customer_id = c.customer_id JOIN products p ON s.product_id = p.product_id WHERE c.name = 'আবুল কালাম';\n\n"
                    "Apply these exact representations to generate valid, reproducible DuckDB SQL queries for the input question."
                )
            else:
                self.version_id = "v1.0-Vanilla"
                self.name = "Vanilla Bengali LLM Agent"
                self.description = "Standard zero-shot SQL generation directly on original Bengali phrases using native system prompts."
                self.model_name = "gemini-3.5-flash"
                self.use_translator = False
                self.system_instruction = (
                    "You are an expert SQL translator for B-DAAB (Bengali Data Agent Benchmark).\n"
                    "Your task is to translate native Bengali commands/questions into executable DuckDB SQL queries.\n"
                    "Guidelines:\n"
                    "1. Only return the raw SQL query. Do not provide explanations, chatter, or secondary remarks.\n"
                    "2. Your output should match the DuckDB SQL dialect (standard ANSI SQL).\n"
                    "3. Rely strictly on the database schema description provided.\n"
                    "4. Match lowercase/uppercase identifiers exactly as they are defined in the schema (e.g. table names: 'customers', 'products', 'sales').\n"
                    "5. Handle Bengali filter criteria intelligently (e.g. if the user says 'আবুল কালাম', search name = 'আবুল কালাম'; if they say 'ঢাকা শহর', filter city = 'Dhaka', etc.)."
                )

    @staticmethod
    def get_available_versions() -> List[Dict[str, Any]]:
        """
        Scans versions folder to build the available agent versions list dynamically.
        """
        base_dir = os.path.dirname(os.path.abspath(__file__))
        versions_dir = os.path.join(base_dir, "versions")
        versions = []

        if os.path.exists(versions_dir):
            for file in os.listdir(versions_dir):
                if file.endswith(".json"):
                    file_path = os.path.join(versions_dir, file)
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            data = json.load(f)
                            versions.append({
                                "version_id": data.get("version_id"),
                                "name": data.get("name"),
                                "description": data.get("description", ""),
                                "model_name": data.get("model_name", "gemini-3.5-flash"),
                                "use_translator": data.get("use_translator", False)
                            })
                    except Exception as e:
                        print(f"Error reading {file_path}: {e}")

        if not versions:
            # Reliable fallback metadata list
            versions = [
                {
                    "version_id": "v1.0-Vanilla",
                    "name": "Vanilla Bengali LLM Agent",
                    "description": "Standard zero-shot SQL generation directly on original Bengali phrases using native system prompts.",
                    "model_name": "gemini-3.5-flash",
                    "use_translator": False
                },
                {
                    "version_id": "v1.1-Translation-Proxy",
                    "name": "Translation-Proxy English Agent",
                    "description": "Translates the Bengali query to English first via our custom Translation module, then prompts Gemini to output clean SQL matching the schema definition.",
                    "model_name": "gemini-3.5-flash",
                    "use_translator": True
                },
                {
                    "version_id": "v2.0-FewShot-CoT",
                    "name": "Few-Shot Chain of Thought Agent",
                    "description": "Uses standard direct Bengali SQL generation but incorporates Few-Shot examples and Chain of Thought instructions.",
                    "model_name": "gemini-3.5-flash",
                    "use_translator": False
                }
            ]
        return versions

    def clean_sql_output(self, raw_output: str) -> str:
        """
        Strips markdown code blocks, whitespaces, and returns only the clean SQL string.
        """
        pattern = r"```(?:sql)?\s*(.*?)\s*```"
        match = re.search(pattern, raw_output, re.DOTALL | re.IGNORECASE)
        if match:
            clean_sql = match.group(1).strip()
        else:
            clean_sql = raw_output.strip()
        return clean_sql

    def generate_sql(self, bengali_query: str, schema_description: str) -> str:
        """
        Uses Gemini to translate a query into clean, executable SQL.
        Translates from Bengali to English beforehand if 'use_translator' is enabled for the active version.
        """
        query_to_process = bengali_query
        translation_info = ""

        # Check if version calls for translation proxying
        if self.use_translator:
            try:
                english_translation = self.translator.translate(bengali_query)
                if english_translation and english_translation != bengali_query:
                    query_to_process = english_translation
                    translation_info = f"\nNote: Original Bengali query was translated to English: '{english_translation}'\n"
            except Exception as e:
                print(f"Linguistic translator error in agent execution: {e}")

        system_instruction = self.system_instruction or (
            "You are an expert SQL translation agent for the B-DAAB (Bengali Data Agent Benchmark).\n"
            "Translate the query command into a single, valid, clean, standard SQL query."
        )

        prompt = f"""
Database Schema:
{schema_description}
{translation_info}
Here is the command to translate into SQL:
"{query_to_process}"

Provide the DuckDB SQL query to satisfy the query:
"""

        try:
            if not self.client:
                # Direct lookup if not initialized earlier
                self.api_key = self.api_key or os.environ.get("GEMINI_API_KEY")
                if self.api_key:
                    self.client = genai.Client(api_key=self.api_key)
                else:
                    return f"-- Error in agent: GEMINI_API_KEY is not defined. Version: {self.version_id}"

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.1,
                )
            )
            raw_sql = response.text or ""
            return self.clean_sql_output(raw_sql)
        except Exception as e:
            print(f"Error calling Gemini Client for Version {self.version_id}: {e}")
            return f"-- Error in agent SQL generation [{self.version_id}]: {str(e)}"
