import pandas as pd
import duckdb
from typing import Dict, Any, Tuple, Optional

class SQLExecutor:
    def __init__(self, db_path: str = "b_daab.db"):
        self.db_path = db_path

    def execute_query(self, query: str) -> Tuple[Optional[pd.DataFrame], Optional[str]]:
        """
        Executes a SQL query against the DuckDB database and returns the result as a DataFrame.
        Returns:
            Tuple[Optional[pd.DataFrame], Optional[str]]: (results_df, error_message)
        """
        conn = None
        try:
            # Connect to database file or memory
            conn = duckdb.connect(self.db_path)
            # Execute query and fetch as dataframe
            df = conn.execute(query).df()
            return df, None
        except Exception as e:
            return None, str(e)
        finally:
            if conn:
                conn.close()

    def compare_results(self, df_pred: pd.DataFrame, df_gold: pd.DataFrame) -> bool:
        """
        Compares predicted and golden SQL execution results for correctness.
        Order-agnostic and column-rename robust for standard SELECT results (compares values set).
        """
        if df_pred is None or df_gold is None:
            return False
            
        try:
            # Let's clean the dataframes for comparison:
            # Convert all column names to lowercase to ignore aliasing differences
            df_p = df_pred.copy()
            df_g = df_gold.copy()
            
            df_p.columns = [str(c).lower() for c in df_p.columns]
            df_g.columns = [str(c).lower() for c in df_g.columns]
            
            if len(df_p) != len(df_g):
                return False
                
            # If empty, they match
            if df_p.empty and df_g.empty:
                return True
                
            # Check shape
            if df_p.shape != df_g.shape:
                return False
                
            # Standardize contents as lists of dicts (unsorted set equivalence)
            p_records = df_p.to_dict(orient='records')
            g_records = df_g.to_dict(orient='records')
            
            # Helper to convert record keys/values to stable string representations for set match
            def serialize_record(record):
                # Round floats to avoid minor floating point mismatch
                cleaned = {}
                for k, v in record.items():
                    if isinstance(v, float):
                        cleaned[k] = round(v, 2)
                    elif pd.isnull(v):
                        cleaned[k] = None
                    else:
                        cleaned[k] = str(v).strip()
                return frozenset(cleaned.items())
                
            p_serialized = [serialize_record(r) for r in p_records]
            g_serialized = [serialize_record(r) for r in g_records]
            
            from collections import Counter
            return Counter(p_serialized) == Counter(g_serialized)
            
        except Exception:
            return False
