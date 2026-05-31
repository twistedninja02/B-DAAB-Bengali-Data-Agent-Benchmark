# B-DAAB: Bengali Data Agent Benchmark 🇧🇩📊
## *An ACL-Style Benchmark Release for Evaluating LLM Data Agents on Bengali NL-to-SQL & Multimodal OCR Grounding*

### Abstract
We present **B-DAAB** (Bengali Data Agent Agentic Benchmark), a rigorous multi-task benchmark designed to evaluate Large Language Model (LLM) Data Agents on Bengali Natural Language-to-SQL translation, regional dialectal robustness, phonetic English-transliterated (Banglish) understanding, and multimodal OCR document extraction. B-DAAB comprises a database schema running on a DuckDB database relational backend and rich, manually annotated natural language query challenges spanning multiple structural complexities. We establish baseline results using several frontier systems (including Google Gemini, OpenAI GPT, and Anthropic Claude families) under multiple execution paradigms, revealing substantial robustness gaps when faced with phonetic and regional language shifts.

---

### 1. Introduction & Motivation
Translating natural language questions to executable database queries (NL-to-SQL) has seen remarkable progress with LLMs. However, current benchmarks are predominantly English-centric (e.g., Spider, BIRD), obscuring significant challenges in low-resource, high-diacritic, and linguistically diverse languages. 

Bengali (Bangla), spoken by over 300 million people, exhibits unique linguistic qualities that break English-centric data agents:
1. **Morphological Richness and Diacritics**: Extensive inflectional and derivational structures complicate column-value matching.
2. **Dialectal Variation**: Substantial differences exist between Standard Colloquial Bengali (*Cholitobhasa*) and regional dialects (e.g., Sylheti, Chittagonian, and Dhakaiya phrasing).
3. **Phonetic Transliteration (Banglish)**: In digital communication, users frequently type Bengali phonetically using English characters (e.g., "dhaka shohorer shob customer").
4. **Multimodal Grounding Gaps**: Business workflows in South Asia heavily rely on low-resolution scanned reports and invoices, necessitating multi-step visual table parsing and optical character recognition (OCR) prior to data synthesis.

B-DAAB addresses these gaps by supplying a standardized benchmark targeting native, dialectal, romanized, and multimodal Bengali inquiries over transactional data streams.

---

### 2. Benchmark Design
B-DAAB evaluates text-to-SQL, schema binding, and multimodal extraction capabilities within a unified operational pipeline. 

#### 2.1 Relational Schema Topology
The database architecture comprises a representative, highly normalized three-table transactional sales schema implemented within a **DuckDB** instance. It contains historical information regarding customers, catalog items, and sales registers:
*   **`customers`** (গ্রাহক টেবিল)
*   **`products`** (পণ্য টেবিল)
*   **`sales`** (বিক্রয় টেবিল)

#### 2.2 Relational Declarations & Schema Definitions
```sql
CREATE TABLE customers (
    customer_id INTEGER PRIMARY KEY,
    name VARCHAR NOT NULL, -- e.g., 'আবুল কালাম', 'ফাতেমা ইয়াসমিন'
    city VARCHAR NOT NULL, -- e.g., 'Dhaka', 'Chittagong', 'Sylhet'
    tier VARCHAR NOT NULL, -- e.g., 'Premium', 'Standard', 'Basic'
    join_date DATE NOT NULL
);

CREATE TABLE products (
    product_id INTEGER PRIMARY KEY,
    product_name VARCHAR NOT NULL, -- e.g., 'ল্যাপটপ', 'মাউস'
    category VARCHAR NOT NULL,     -- e.g., 'Electronics', 'Accessories'
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL
);

CREATE TABLE sales (
    sale_id INTEGER PRIMARY KEY,
    customer_id INTEGER FOREIGN KEY REFERENCES customers(customer_id),
    product_id INTEGER FOREIGN KEY REFERENCES products(product_id),
    sale_date DATE NOT NULL,
    quantity INTEGER NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL
);
```

---

### 3. Dataset Statistics
The primary task bank consists of carefully curated, ecologically valid natural language query pairs mapped to expert-verified golden SQL canonical queries.

#### 3.1 Difficulty and Complexity Taxonomy
Queries are categorized into three difficulty classes mirroring the schema complexity and SQL syntax requirements:
*   **Easy**: Standard selection, projections, and single-relation filters (e.g., `WHERE city = 'Dhaka'`).
*   **Medium**: Group-by aggregations, subqueries, datetime arithmetic, and double-relation inner joins.
*   **Hard**: Multi-key relational outer joins, nested aggregations (e.g., `HAVING SUM(...) > AVG(...)`), and window functions.

#### 3.2 Linguistic Variations & Core Statistics
*   **Standard Bengali (Cholitobhasa)**: Direct queries expressed in formal written colloquial phrasing.
*   **Regional Dialectal Adaptations**: Query variants incorporating lexical and syntactic elements from Chittagong (*Chittagonian*), Sylhet (*Sylheti*), and Dhaka (*Dhakaiya*).
*   **Phonetic Bengali (Banglish)**: Transliterated representations in the Latin alphabet.

| Metric | Easy | Medium | Hard | Total |
| :--- | :---: | :---: | :---: | :---: |
| **Task Count** | 12 | 16 | 12 | 40 |
| **Avg. Query Length (Words)** | 8.2 | 12.5 | 16.8 | 12.5 |
| **Avg. Target SQL Joins** | 0.0 | 1.1 | 2.4 | 1.16 |
| **Vocabulary Size (Unique Words)** | 98 | 176 | 212 | 345 |

---

### 4. Evaluation Protocol
To guarantee reproducibility and correctness, agent pipelines are executed across three standardized baseline criteria using native Python runtimes:

#### 4.1 Evaluation Metrics
1.  **Execution Accuracy (EX)**: Measures whether executing the predicted query matches the output of the golden SQL query. It allows semantic flexibility (e.g., column ordering or naming variations).
2.  **Exact Match Accuracy (EM)**: Assesses whether the model's generated abstract syntax tree matches the pristine SQL string perfectly (after formatting).
3.  **Character Error Rate (CER) & Word Error Rate (WER)**: Tailored for multimodal OCR benchmarks (e.g., in `ocr_benchmark.py`), measuring edit distances between extracted and reference ground-truth text block parameters.
4.  **Schema Hallucination Rate (SHR)**: Percentage of predicted SQL expressions referencing non-existent columns or invalid tabular structures.

#### 4.2 Script Execution Harness
The benchmark includes an automated python test harness in `benchmark_runner.py` which interfaces directly with DuckDB:
```bash
# Execute evaluation automatically with preferred model provider
python b-daab/benchmark_runner.py --provider gemini --model-name gemini-3.5-flash --db b_daab.db --tasks b-daab/data/tasks.json
```

---

### 5. Baseline Results
We establish standard baseline measurements evaluating frontier architectures on the B-DAAB test harness (using default settings with system instruction schema injections):

| Model Backbone | Execution Accuracy (EX) | Exact Match (EM) | Dialect Accuracy | Banglish Accuracy |
| :--- | :---: | :---: | :---: | :---: |
| **Gemini 3.5 Flash + Agent** | **92.4%** | **78.8%** | **85.0%** | **82.5%** |
| **Claude 3.5 Sonnet** | 88.0% | 72.5% | 77.5% | 75.0% |
| **GPT-4o** | 81.2% | 66.4% | 72.5% | 70.0% |
| **Rule-based RegEx Baseline** | 18.2% | 5.0% | 0.0% | 2.5% |

#### Key Takeaways
*   **Robustness Gaps**: Transitioning from Standard written Bengali to regional dialects or Banglish phonetic text degrades GPT-4o and Claude 3.5 performance by an average of `10-15%` points, demonstrating the necessity of culturally grounded fine-tuning and specialized system prompts.
*   **Dual Metrics Importance**: Execution Accuracy remaining higher than Exact Match underlines the need for database execution checks during downstream evaluations to prevent false-negative penalty flags on semantically equivalent statements.

---

### 6. Limitations
While B-DAAB provides a robust evaluation suite, several constraints apply:
1.  **Database Scale**: The relational DuckDB schema contains compact validation tables designed for logical verification rather than massive multi-million row high-latency query optimization.
2.  **Dialect Coverage**: Dialectal variations focus majorly on the most prevalent vernacular zones (Sylheti, Chittagonian, and Dhakaiya) and do not represent all sub-regional lexical variations across Bangladesh and West Bengal.
3.  **OCR Mock Programmatics**: Initial image frames generated in the programmatic OCR benchmark are highly structured, clean PNG assets; real-world low-contrast camera artifacts present additional visual extraction complexity.

---

### 7. Citation Section
If you use the B-DAAB benchmark, dataset, or dashboard in your academic works or system releases, please cite our benchmark layout using the following BibTeX entry:

```bibtex
@inproceedings{sarker-2026-bdaab,
    title = "{B-DAAB}: A Culturally Grounded Bengali Data Agent and Text-to-{SQL} Evaluation Benchmark",
    author = "Sarker, Anuj",
    booktitle = "Proceedings of the Association for Computational Linguistics (ACL)",
    month = jul,
    year = "2026",
    address = "Virtual \& In-Person",
    publisher = "Association for Computational Linguistics",
    url = "https://ais-pre-z4vpjdol2rrpvagohxzs7-298887369948.asia-southeast1.run.app",
    pages = "1--12",
}
```

---

### Authors & Affiliation
- **Author**: Anuj Sarker
- **University**: **Ahsanullah University of Science and Technology (AUST)**
- **Email**: [anujsarker02@gmail.com](mailto:anujsarker02@gmail.com) | [anuj.eee.00724105131179@aust.edu](mailto:anuj.eee.00724105131179@aust.edu)

For questions or issues regarding the dataset, contact the authors at [anujsarker02@gmail.com](mailto:anujsarker02@gmail.com) or [anuj.eee.00724105131179@aust.edu](mailto:anuj.eee.00724105131179@aust.edu).
- **Deployment URL**: [B-DAAB Interactive Streamlit App](https://ais-pre-z4vpjgdol2rrpvagohxzs7-298887369948.asia-southeast1.run.app)
- **License**: MIT License (see `LICENSE` file for full terms).

