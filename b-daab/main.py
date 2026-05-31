import os
import json
import argparse
import pandas as pd
from datetime import datetime
from db import get_db_connection, initialize_database, get_schema_description
from agent.sql_agent import BengaliSQLAgent
from eval.evaluation import BDAABEvaluator

def run_cli_benchmark():
    parser = argparse.ArgumentParser(description="Bengali Data Agent Benchmark (B-DAAB) CLI")
    parser.add_argument("--db", type=str, default="b_daab.db", help="Path to DuckDB database file")
    parser.add_argument("--tasks", type=str, default="data/tasks.json", help="Path to evaluation tasks.json")
    parser.add_argument("--query", type=str, default=None, help="Direct Bengali query to run (skips benchmark)")
    parser.add_argument("--agent-version", type=str, default="v1.0-Vanilla", 
                        choices=["v1.0-Vanilla", "v1.1-Translation-Proxy", "v2.0-FewShot-CoT"], 
                        help="Select B-DAAB Agent version config to benchmark or execute against.")
    args = parser.parse_args()

    # 1. Initialize DuckDB target database
    print(f"Initializing DuckDB target database: {args.db}...")
    conn = get_db_connection(args.db)
    initialize_database(conn)
    conn.close()
    print("Database seeding completed.")

    # 2. Setup LLM Agent (Gemini) with selected version
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("\n[!] WARNING: GEMINI_API_KEY is not defined in your environment variables.")
        print("Please set your GEMINI_API_KEY to run live SQL generation.\n")
        
    agent = BengaliSQLAgent(api_key=api_key, version_id=args.agent_version)
    print(f"\nInitialized Agent: {agent.name} [{agent.version_id}]")
    print(f"Model Core: {agent.model_name} | Use Translation proxy: {agent.use_translator}")
    print(f"Pipeline Description: {agent.description}\n")

    # 3. Direct Bengali Query Execution Mode (If query text is provided)
    if args.query:
        print(f"Evaluating Custom Bengali Query: '{args.query}'")
        schema = get_schema_description()
        generated_sql = agent.generate_sql(args.query, schema)
        print(f"Generated SQL Code:\n{generated_sql}\n")
        
        # Execute query
        from executor import SQLExecutor
        executor = SQLExecutor(db_path=args.db)
        df, err = executor.execute_query(generated_sql)
        if err:
            print(f"Execution Error: {err}")
        else:
            print("Execution Results:")
            if df is not None and not df.empty:
                print(df.to_string(index=False))
            else:
                print("(Query returned 0 rows / Empty Result)")
        return

    # 4. Standard Benchmark Execution Mode
    print("="*60)
    print(f"           B-DAAB Benchmark Evaluation Series")
    print("="*60)
    print(f"Agent Pipeline: {agent.name} ({agent.version_id})")
    print(f"Tasks Location: {args.tasks}")
    
    try:
        evaluator = BDAABEvaluator(db_path=args.db, benchmark_tasks_path=args.tasks)
        eval_output = evaluator.run_evaluation(agent)
        
        # Display Summary
        summary = eval_output["summary"]
        print("\n" + "-"*35 + " EVAL SUMMARY " + "-"*35)
        print(f"Total Evaluated Tasks:           {summary['total_tasks']}")
        print(f"Exact Match (EM) Accuracy:       {summary['exact_match_accuracy']}% ({summary['exact_match_count']}/{summary['total_tasks']})")
        print(f"Execution Accuracy (EX) Match:   {summary['execution_accuracy']}% ({summary['execution_match_count']}/{summary['total_tasks']})")
        print("-" * 84)

        # Tabulate detailed results
        task_results = eval_output["task_results"]
        df_results = pd.DataFrame(task_results)
        
        print("\nDetailed Benchmark Leaderboard Records:")
        headers_cols = ["task_id", "difficulty", "category", "exact_match", "execution_match"]
        print(df_results[headers_cols].to_string(index=False))
        
        # 5. Store current run evaluation metrics in a historical logs ledger
        tasks_dir = os.path.dirname(os.path.abspath(args.tasks))
        history_path = os.path.join(tasks_dir, "eval_history.json")
        history_data = {}
        
        if os.path.exists(history_path):
            try:
                with open(history_path, "r", encoding="utf-8") as hf:
                    history_data = json.load(hf)
            except Exception:
                history_data = {}
                
        history_data[args.agent_version] = {
            "version_id": args.agent_version,
            "agent_name": agent.name,
            "model_name": agent.model_name,
            "total_tasks": summary['total_tasks'],
            "exact_match_accuracy": summary['exact_match_accuracy'],
            "execution_accuracy": summary['execution_accuracy'],
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        try:
            with open(history_path, "w", encoding="utf-8") as hf:
                json.dump(history_data, hf, indent=2, ensure_ascii=False)
            print(f"\n[+] Saved evaluation metrics to run history database catalog at: {history_path}")
        except Exception as he:
            print(f"\n[!] Warning: Could not save run to evaluation history file: {he}")
            
        print("\nAll tasks computed successfully. B-DAAB completion successful.")
        
    except Exception as e:
        print(f"\n[Error Running Benchmark evaluation]: {e}")

if __name__ == "__main__":
    run_cli_benchmark()
