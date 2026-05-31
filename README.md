# B-DAAB Workspace: Bengali Data Agent Benchmark 🇧🇩📈

This workspace contains the complete implementation of the **B-DAAB (Bengali Data Agent Benchmark)** suite along with an interactive Streamlit application and evaluation history tracking.

## 📁 Repository Map

*   `b-daab/`:
    *   `app.py`: Streamlit dashboard and user interface containing SQL generation sandboxes, benchmark runners, evaluation comparisons, interactive schema explorations, and leaderboard boards.
    *   `main.py`: Local CLI application to run evaluations without launching a web server.
    *   `db.py`: Database creator populating schema parameters using DuckDB.
    *   `executor.py`: SQL Executor containing security boundaries and state verification.
    *   `agent/`: Agent architectures including Vanilla, Translation proxy, and FewShot CoT configurations.
    *   `eval/`: Automated metrics evaluator for Text-to-SQL exact matching, dialect/phonetic robustness, schema hallucinations, and OCR/table-extraction accuracies.
    *   `vision/`: Preprocessors and parsing functions.
    *   `data/`: Configuration parameters containing the scaled **40 multi-difficulty tasks** and local evaluation historians (`eval_history.json`).

## 🚀 Commands

### 💻 Streamlit UI
To launch the interactive dashboard, ensure you are in the workspace root and run:
```bash
streamlit run b-daab/app.py
```

### 🐍 Python Test CLI
To execute the baseline evaluations directly via terminal:
```bash
python b-daab/main.py
```

### ⚛️ Frontend Dev Environment
This app runs under a unified port routing system. The main background controller boots automatically.

---
*Developed as part of the ACL/NeurIPS-ready evaluation of Bengali Data Retrieval Systems.*

## 📄 License & Contact Information

- **Author**: Anuj Sarker
- **University**: **Ahsanullah University of Science and Technology (AUST)**
- **Email**: [anujsarker02@gmail.com](mailto:anujsarker02@gmail.com) | [anuj.eee.00724105131179@aust.edu](mailto:anuj.eee.00724105131179@aust.edu)
- **Published App URL**: [B-DAAB Interactive Streamlit App](https://ais-pre-z4vpjgdol2rrpvagohxzs7-298887369948.asia-southeast1.run.app)
- **License**: Licensed under the [MIT License](LICENSE) (see root `LICENSE` file for details).

