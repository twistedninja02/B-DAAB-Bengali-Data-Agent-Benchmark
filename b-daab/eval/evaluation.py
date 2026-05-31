import os
import json
import pandas as pd
from typing import Dict, Any, List, Tuple
from agent.sql_agent import BengaliSQLAgent
from executor import SQLExecutor
from db import get_schema_description

class BDAABEvaluator:
    def __init__(self, db_path: str = "b_daab.db", benchmark_tasks_path: str = "data/tasks.json"):
        self.db_path = db_path
        self.benchmark_tasks_path = benchmark_tasks_path
        self.executor = SQLExecutor(db_path=db_path)
        self.schema_description = get_schema_description()

    def load_tasks(self) -> List[Dict[str, Any]]:
        """
        Loads the benchmark evaluation challenges from tasks.json.
        """
        if not os.path.exists(self.benchmark_tasks_path):
            raise FileNotFoundError(f"Benchmark tasks document not found at {self.benchmark_tasks_path}")
            
        with open(self.benchmark_tasks_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def normalize_sql(self, sql: str) -> str:
        """
        Minimally normalizes SQL statements to support fair Exact Match comparison.
        Trims, lowercases, resolves multiple spaces, and normalizes semicolons.
        """
        if not sql:
            return ""
        # Remove semicolons, replace multiple spaces with single space, lowercase
        sql_clean = sql.strip().rstrip(';').lower()
        sql_clean = " ".join(sql_clean.split())
        return sql_clean

    def run_evaluation(self, agent: BengaliSQLAgent) -> Dict[str, Any]:
        """
        Runs the full B-DAAB benchmark evaluation.
        Compares agent predictions with golden standard queries using Exact Match and Execution Accuracy.
        """
        tasks = self.load_tasks()
        results = []
        
        exact_match_hits = 0
        execution_match_hits = 0
        total_tasks = len(tasks)
        
        for task in tasks:
            task_id = task["task_id"]
            bengali_query = task["bengali_query"]
            sql_gold = task["sql_gold"]
            difficulty = task["difficulty"]
            category = task["category"]
            
            # 1. Generate SQL via our LLM-powered Data Agent
            sql_pred = agent.generate_sql(bengali_query, self.schema_description)
            
            # 2. Compute Exact Match
            em_pred = self.normalize_sql(sql_pred)
            em_gold = self.normalize_sql(sql_gold)
            is_exact_match = (em_pred == em_gold)
            if is_exact_match:
                exact_match_hits += 1
                
            # 3. Execute Golden SQL
            df_gold, gold_error = self.executor.execute_query(sql_gold)
            
            # 4. Execute Predicted SQL
            df_pred, pred_error = self.executor.execute_query(sql_pred)
            
            # 5. Compute Execution Accuracy
            is_execution_match = False
            error_msg = None
            
            if pred_error:
                error_msg = f"Execution Error: {pred_error}"
            elif gold_error:
                error_msg = f"Baseline Gold SQL Error: {gold_error}"
            else:
                is_execution_match = self.executor.compare_results(df_pred, df_gold)
                
            if is_execution_match:
                execution_match_hits += 1
                
            results.append({
                "task_id": task_id,
                "bengali_query": bengali_query,
                "difficulty": difficulty,
                "category": category,
                "sql_gold": sql_gold,
                "sql_pred": sql_pred,
                "exact_match": is_exact_match,
                "execution_match": is_execution_match,
                "error_details": error_msg
            })
            
        exact_match_pct = (exact_match_hits / total_tasks) * 100 if total_tasks > 0 else 0.0
        execution_match_pct = (execution_match_hits / total_tasks) * 100 if total_tasks > 0 else 0.0
        
        return {
            "summary": {
                "total_tasks": total_tasks,
                "exact_match_accuracy": round(exact_match_pct, 2),
                "execution_accuracy": round(execution_match_pct, 2),
                "exact_match_count": exact_match_hits,
                "execution_match_count": execution_match_hits
            },
            "task_results": results
        }
