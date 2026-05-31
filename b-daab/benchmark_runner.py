#!/usr/bin/env python3
import sys
import os
import argparse
import json
from datetime import datetime

# Adjust Python search paths to import local modules securely
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models import get_model
from eval.evaluation import BDAABEvaluator

class AgentAdapter:
    """
    Adapter class adjusting the custom BaseModel structures to mirror the Expected signatures
    of BDAABEvaluator / BDAABRunner execution routines in the evaluation system.
    """
    def __init__(self, model, version_id: str):
        self.model = model
        self.version_id = version_id
        self.name = model.name
        self.model_name = getattr(model, "model_name", "custom-model")
        self.description = f"Flexible swap verification using {model.provider} as backend core."
        self.use_translator = False

    def generate_sql(self, bengali_query: str, schema_description: str) -> str:
        return self.model.generate_sql(bengali_query, schema_description)

def main():
    parser = argparse.ArgumentParser(description="B-DAAB Multi-Model Benchmark Swapped Evaluation Runner")
    parser.add_argument("--provider", type=str, required=True, choices=["gemini", "gpt", "claude", "huggingface"], help="Model provider backend to evaluate")
    parser.add_argument("--model-name", type=str, default=None, help="Backbone model identity slug")
    parser.add_argument("--db", type=str, default="b_daab.db", help="Path to DuckDB database target")
    parser.add_argument("--tasks", type=str, default="data/tasks.json", help="Path to evaluation tasks.json list")
    args = parser.parse_args()

    print(f"| B-DAAB Architecture Swap Runner: {args.provider.upper()} | Model: {args.model_name or 'Default'} |")
    
    # 1. Resolve model provider instance
    try:
        model = get_model(args.provider, args.model_name)
    except Exception as e:
        print(f"[-] Architecture configuration error: {e}")
        sys.exit(1)

    # 2. Align interfaces through AgentAdapter
    version_id = f"swap-{args.provider}-{args.model_name or 'default'}"
    agent_adapter = AgentAdapter(model, version_id)

    # 3. Locate relative/absolute benchmark dataset locations safely
    tasks_file = args.tasks
    if not os.path.exists(tasks_file):
        alt_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "tasks.json")
        if os.path.exists(alt_path):
            tasks_file = alt_path
        else:
            tasks_file = "data/tasks.json"

    # 4. Bootstrap the B-DAAB Evaluator
    print(f"[+] Initializing B-DAAB Evaluator with database: '{args.db}' and tasks: '{tasks_file}'")
    try:
        evaluator = BDAABEvaluator(db_path=args.db, benchmark_tasks_path=tasks_file)
        eval_output = evaluator.run_evaluation(agent_adapter)
        
        summary = eval_output["summary"]
        print("\n" + "="*80)
        print(f" B-DAAB BENCHMARK EVALUATION SCORECARD FOR: {model.name}")
        print("="*80)
        print(f"Total Model Evaluated Cases:   {summary['total_tasks']}")
        print(f"Exact Match (EM) Accuracy:     {summary['exact_match_accuracy']}%")
        print(f"Execution Accuracy (EX) Match: {summary['execution_accuracy']}%")
        print("="*80)

        # 5. Lock-in evaluations into local history json ledger for UI binding
        history_dir = os.path.dirname(os.path.abspath(tasks_file))
        history_path = os.path.join(history_dir, "eval_history.json")
        history_data = {}

        if os.path.exists(history_path):
            try:
                with open(history_path, "r", encoding="utf-8") as hf:
                    history_data = json.load(hf)
            except Exception:
                history_data = {}

        history_data[version_id] = {
            "version_id": version_id,
            "agent_name": f"{args.provider.upper()} Swap - {args.model_name or 'Default'}",
            "model_name": args.model_name or "default",
            "total_tasks": summary['total_tasks'],
            "exact_match_accuracy": summary['exact_match_accuracy'],
            "execution_accuracy": summary['execution_accuracy'],
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

        with open(history_path, "w", encoding="utf-8") as hf:
            json.dump(history_data, hf, indent=2, ensure_ascii=False)

        print(f"[+] Model scorecard persisted successfully into {history_path}")

        # Stream raw JSON results payload for automated tooling integrations
        print("\nRAW_JSON_START")
        print(json.dumps(eval_output, ensure_ascii=False))
        print("RAW_JSON_END")

    except Exception as e:
        print(f"[-] An error was encountered during the benchmark evaluation cycle: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
