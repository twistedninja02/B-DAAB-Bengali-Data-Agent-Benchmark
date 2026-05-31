import os
import re
import pandas as pd
from typing import Dict, Any, List, Tuple, Optional
from executor import SQLExecutor

def calculate_exact_match(pred_sql: str, gold_sql: str) -> bool:
    """
    Minimally normalizes SQL statements to support fair Exact Match comparison.
    Trims, lowercases, resolves multiple spaces, and normalizes semicolons.
    """
    if not pred_sql or not gold_sql:
        return False
    
    def normalize(sql: str) -> str:
        sql_clean = sql.strip().rstrip(';').lower()
        # Replace multiple spaces/newlines with single space
        sql_clean = re.sub(r'\s+', ' ', sql_clean)
        # Remove any surrounding spaces for punctuation like commas or operators
        sql_clean = re.sub(r'\s*([,=\(\)<>!])\s*', r'\1', sql_clean)
        return sql_clean.strip()

    return normalize(pred_sql) == normalize(gold_sql)

def calculate_execution_accuracy(pred_sql: str, gold_sql: str, executor: SQLExecutor) -> bool:
    """
    Executes and compares the predicted and golden SQL execution results.
    """
    if not pred_sql or not gold_sql:
        return False
    
    df_gold, gold_error = executor.execute_query(gold_sql)
    df_pred, pred_error = executor.execute_query(pred_sql)
    
    if gold_error or pred_error:
        return False
        
    return executor.compare_results(df_pred, df_gold)

def calculate_ocr_accuracy(pred_text: str, gold_text: str) -> float:
    """
    Calculates the Edit Distance-based similarity representing character accuracy 
    between extracted and gold standard bilingual text.
    """
    if not pred_text and not gold_text:
        return 1.0
    if not pred_text or not gold_text:
        return 0.0
        
    s1, s2 = pred_text.strip(), gold_text.strip()
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
        
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
                
    distance = dp[m][n]
    return max(0.0, 1.0 - (distance / max(1, m, n)))

def calculate_table_extraction_accuracy(pred_df: pd.DataFrame, gold_df: pd.DataFrame) -> float:
    """
    Measures the precision of grid table reconstructions based on structural mapping 
    and element-wise overlap alignment. Matches both header labels and cell data.
    """
    if pred_df is None or gold_df is None:
        return 0.0
    if pred_df.empty and gold_df.empty:
        return 1.0
    if pred_df.empty or gold_df.empty:
        return 0.0
        
    # Column matching score (Jaccard similarity on lowercase trimmed headers)
    p_cols = [str(c).lower().strip() for c in pred_df.columns]
    g_cols = [str(c).lower().strip() for c in gold_df.columns]
    
    col_intersection = set(p_cols).intersection(set(g_cols))
    col_union = set(p_cols).union(set(g_cols))
    col_score = len(col_intersection) / len(col_union) if col_union else 0.0
    
    # Shape similarity ratio (row count precision matching)
    row_score = min(pred_df.shape[0], gold_df.shape[0]) / max(1, pred_df.shape[0], gold_df.shape[0])
    
    # Value level intersection count
    p_vals = set(str(v).lower().strip() for v in pred_df.values.flatten() if pd.notna(v))
    g_vals = set(str(v).lower().strip() for v in gold_df.values.flatten() if pd.notna(v))
    
    val_intersection = p_vals.intersection(g_vals)
    val_union = p_vals.union(g_vals)
    val_score = len(val_intersection) / len(val_union) if val_union else 0.0
    
    # Weighted composite index
    accuracy = (col_score * 0.40) + (row_score * 0.20) + (val_score * 0.40)
    return round(float(accuracy), 4)

def calculate_dialect_robustness(pred_sqls: List[str], gold_sqls: List[str], executor: SQLExecutor) -> float:
    """
    Measures how consistently correct the agent remains when translating queries containing regional 
    dialects (e.g., Sylheti, Chittagonian, Noakhali variations).
    Returns ratio of correctly executed SQL.
    """
    if not pred_sqls:
        return 0.0
    correct_count = 0
    for pred, gold in zip(pred_sqls, gold_sqls):
        if calculate_execution_accuracy(pred, gold, executor):
            correct_count += 1
    return round(correct_count / len(pred_sqls), 4)

def calculate_banglish_robustness(pred_sqls: List[str], gold_sqls: List[str], executor: SQLExecutor) -> float:
    """
    Measures query understanding resilience when facing Banglish script inputs 
    (phonetic Bengali written with Latin/Roman alphanumeric keyboards).
    Returns execution success ratio.
    """
    if not pred_sqls:
        return 0.0
    correct_count = 0
    for pred, gold in zip(pred_sqls, gold_sqls):
        if calculate_execution_accuracy(pred, gold, executor):
            correct_count += 1
    return round(correct_count / len(pred_sqls), 4)

def calculate_schema_hallucination_rate(pred_sql: str) -> float:
    """
    Extracts lowercase tokens from the predicted SQL query and checks whether they 
    violate the strict DB schema table/column definitions.
    Returns the percentage of hallucinated identifiers.
    """
    if not pred_sql or pred_sql.strip().startswith("--"):
        return 0.0
        
    valid_identifiers = {
        # Tables
        "customers", "products", "sales",
        # Columns
        "customer_id", "name", "city", "tier", "join_date",
        "product_id", "product_name", "category", "price", "stock",
        "sale_id", "sale_date", "quantity", "total_amount",
        # Standard SQL functions/aliases
        "avg_price", "total_quantity", "total_revenue", "total_sold", "customer_count", "total_sales"
    }
    
    # Simple regex to extract words that act as column/table identifiers
    tokens = re.findall(r'\b[a-zA-Z_][a-zA-Z0-9_]*\b', pred_sql)
    sql_keywords = {
        "select", "from", "where", "join", "on", "group", "by", "order", "limit",
        "sum", "avg", "count", "min", "max", "and", "or", "as", "in", "left", "right",
        "coalesce", "null", "having", "desc", "asc", "date", "t", "s", "c", "p" # common single-letter table aliases
    }
    
    identifiers = [t.lower() for t in tokens if t.lower() not in sql_keywords]
    if not identifiers:
        return 0.0
        
    hallucinated = [i for i in identifiers if i not in valid_identifiers]
    return round((len(hallucinated) / len(identifiers)) * 100, 2)

def diagnose_execution_failures(pred_sql: str, gold_sql: str, executor: SQLExecutor) -> str:
    """
    Systematically classifies execution or semantic failures into a standardized failure taxonomy
    for academic debugging.
    """
    if not pred_sql or pred_sql.strip().startswith("--"):
        return "Graceful Refusal / Query Skipped"
        
    df_pred, pred_error = executor.execute_query(pred_sql)
    if pred_error:
        pred_error_lower = str(pred_error).lower()
        if "table list" in pred_error_lower or "column" in pred_error_lower or "binder exception" in pred_error_lower:
            return "Schema Identifier Hallucination"
        return "SQL Syntax Parser Error"
        
    df_gold, gold_error = executor.execute_query(gold_sql)
    if not gold_error:
        match = executor.compare_results(df_pred, df_gold)
        if match:
            return "Execution & Semantic Success"
        return "Semantic Logical Discrepancy (Wrong Filter or Join Logic)"
        
    return "Baseline Reference SQL Error"

def calculate_graceful_refusal_accuracy(pred_sqls: List[str], labels_unsolvable: List[bool]) -> float:
    """
    Measures the model's accuracy on deciding when to generate SQL vs when to refuse 
    unsolvable queries gracefully to prevent database errors.
    """
    if not pred_sqls:
        return 100.0
        
    correct_decisions = 0
    for pred, is_unsolvable in zip(pred_sqls, labels_unsolvable):
        is_refusal = (not pred or pred.strip().startswith("--") or "error" in pred.lower() or "cannot" in pred.lower())
        if is_unsolvable == is_refusal:
            correct_decisions += 1
            
    return round((correct_decisions / len(pred_sqls)) * 100, 2)

