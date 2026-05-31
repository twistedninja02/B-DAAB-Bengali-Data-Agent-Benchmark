import React, { useState, useEffect } from "react";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  Play, 
  PlayCircle,
  Database, 
  Settings, 
  Code, 
  Trophy, 
  Compass, 
  Sparkles, 
  TrendingUp, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2, 
  ChevronRight,
  RefreshCw,
  Copy,
  Check,
  Search,
  BookOpen,
  Upload,
  Trash2,
  Plus,
  X,
  ArrowLeftRight
} from "lucide-react";

// Structure types for alignment
interface TaskResult {
  task_id: string;
  bengali_query: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  sql_gold: string;
  sql_pred: string;
  exact_match: boolean;
  execution_match: boolean;
  error_details: string | null;
}

interface EvalSummary {
  total_tasks: number;
  exact_match_accuracy: number;
  execution_accuracy: number;
  exact_match_count: number;
  execution_match_count: number;
}

interface CodebaseFile {
  name: string;
  relPath: string;
  type: string;
  code: string;
}

export interface MultimodalDoc {
  id: string;
  name: string;
  size: string;
  type: string;
  preview: string;
  status: "idle" | "processing" | "success" | "failed";
  error?: string;
  ocrText?: string;
  suggestedSql?: string;
  results?: any[];
  explanation?: string;
  tableData?: {
    columns: string[];
    rows: string[][];
  };
}

// Utility to generate a high quality visual placeholder using color parameters
const makeSvgPreview = (title: string, color: string, txtColor: string = "#818cf8") => {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="${encodeURIComponent(color)}" rx="16"/><circle cx="200" cy="110" r="40" fill="%231e1e24" stroke="${encodeURIComponent(txtColor)}" stroke-width="2" stroke-dasharray="4 4"/><text x="50%" y="115" dominant-baseline="middle" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="28" fill="${encodeURIComponent(txtColor)}">📷</text><text x="50%" y="195" dominant-baseline="middle" text-anchor="middle" font-family="'Inter', sans-serif" font-size="15" fill="%23e2e8f0" font-weight="bold">${encodeURIComponent(title)}</text><text x="50%" y="225" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="%2364748b" font-weight="bold">B-DAAB MULTIMODAL BENCHMARK PROCESSOR</text></svg>`;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<"playground" | "harness" | "multimodal" | "code" | "leaderboard" | "schema" | "generator" | "analysis" | "ocr-benchmark">("playground");
  
  // Bengali OCR Benchmark states
  const [ocrResults, setOcrResults] = useState<any | null>(null);
  const [isEvaluatingOcr, setIsEvaluatingOcr] = useState<boolean>(false);
  const [selectedOcrCase, setSelectedOcrCase] = useState<any | null>(null);

  // Custom benchmark generator states
  const [generateCount, setGenerateCount] = useState<number>(2000);
  const [generateSeed, setGenerateSeed] = useState<number>(100);
  const [shouldMerge, setShouldMerge] = useState<boolean>(false);
  const [isGeneratingSynthetic, setIsGeneratingSynthetic] = useState<boolean>(false);
  const [generatorStats, setGeneratorStats] = useState<any | null>(null);

  // Automatic Failure Analysis states
  const [failureAnalysisReport, setFailureAnalysisReport] = useState<any | null>(null);
  const [isAnalyzingFailures, setIsAnalyzingFailures] = useState<boolean>(false);

  // Dynamic Leaderboard & Model comparison states
  const [dynamicLeaderboard, setDynamicLeaderboard] = useState<any[]>([]);
  const [isFetchingLeaderboard, setIsFetchingLeaderboard] = useState<boolean>(false);
  const [compareModelA, setCompareModelA] = useState<string>("");
  const [compareModelB, setCompareModelB] = useState<string>("");
  const [comparisonText, setComparisonText] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState<boolean>(false);

  // Model Save form states
  const [saveVersionId, setSaveVersionId] = useState<string>("");
  const [saveAgentName, setSaveAgentName] = useState<string>("");
  const [saveModelName, setSaveModelName] = useState<string>("gemini-3.5-flash");
  const [saveEx, setSaveEx] = useState<number>(85.0);
  const [saveEm, setSaveEm] = useState<number>(65.0);
  const [saveStatus, setSaveStatus] = useState<string>("Submitted");
  const [isSavingModel, setIsSavingModel] = useState<boolean>(false);
  const [showSaveForm, setShowSaveForm] = useState<boolean>(false);

  // Multimodal Visual Benchmark Suite states
  const [multimodalDocs, setMultimodalDocs] = useState<MultimodalDoc[]>([
    {
      id: "doc-1",
      name: "medical_report_bengali.png",
      size: "142 KB",
      type: "Hospital Report",
      preview: makeSvgPreview("medical_report_bengali.png", "#141418", "#f43f5e"),
      status: "idle"
    },
    {
      id: "doc-2",
      name: "retail_sales_screenshot.jpg",
      size: "215 KB",
      type: "Table Sheet",
      preview: makeSvgPreview("retail_sales_screenshot.jpg", "#141418", "#6366f1"),
      status: "idle"
    },
    {
      id: "doc-3",
      name: "scanned_customer_form.png",
      size: "188 KB",
      type: "Scanned Form",
      preview: makeSvgPreview("scanned_customer_form.png", "#141418", "#10b981"),
      status: "idle"
    }
  ]);

  const [multimodalQuery, setMultimodalQuery] = useState<string>("সকল তথ্য খুঁজে আনো এবং বিশ্লেষণ করো।");
  const [isProcessingMultimodal, setIsProcessingMultimodal] = useState<boolean>(false);
  const [selectedDoc, setSelectedDoc] = useState<MultimodalDoc | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);
  
  // Database datasets snapshot from server
  const [schemaDesc, setSchemaDesc] = useState<string>("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [activeSnapshotTable, setActiveSnapshotTable] = useState<"customers" | "products" | "sales">("customers");

  // Codebases files payload
  const [codefiles, setCodefiles] = useState<CodebaseFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<CodebaseFile | null>(null);
  const [copiedFile, setCopiedFile] = useState<boolean>(false);

  // Agent Versions list
  const [agentVersions, setAgentVersions] = useState<any[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>("v1.0-Vanilla");
  const [selectedProvider, setSelectedProvider] = useState<string>(""); // empty for default
  const [customModelName, setCustomModelName] = useState<string>("");
  const [intermediateTranslation, setIntermediateTranslation] = useState<string>("");

  // Playground state
  const [userQuery, setUserQuery] = useState<string>("ঢাকা শহরের সকল গ্রাহকদের নাম ও টায়ার দেখাও।");
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [playgroundSql, setPlaygroundSql] = useState<string>("");
  const [playgroundResults, setPlaygroundResults] = useState<any[]>([]);
  const [playgroundSqlError, setPlaygroundSqlError] = useState<string | null>(null);

  // Harness state
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evalSummary, setEvalSummary] = useState<EvalSummary | null>(null);
  const [evalTasks, setEvalTasks] = useState<TaskResult[]>([]);
  const [selectedInspectTask, setSelectedInspectTask] = useState<TaskResult | null>(null);

  // General statuses
  const [systemAlert, setSystemAlert] = useState<{ type: "success" | "error" | "warning"; message: string } | null>(null);

  // Load baseline data on component mount
  useEffect(() => {
    fetchSchemaAndData();
    fetchPythonCodefiles();
    fetchAgentVersions();
    handleFetchCachedFailureAnalysis();
    fetchLeaderboardRankings();
    fetchOcrBenchmark(false);
  }, []);

  const fetchOcrBenchmark = async (forceRun: boolean = false) => {
    setIsEvaluatingOcr(true);
    try {
      const endpoint = forceRun ? "/api/ocr-benchmark/run" : "/api/ocr-benchmark";
      const method = forceRun ? "POST" : "GET";
      const res = await fetch(endpoint, { method });
      const data = await res.json();
      if (data.success && data.results) {
        setOcrResults(data.results);
        if (data.results.detailed_results && data.results.detailed_results.length > 0) {
          setSelectedOcrCase(data.results.detailed_results[0]);
        }
        if (forceRun) {
          triggerAlert("success", "Bengali OCR Benchmark successfully evaluated.");
        }
      } else {
        if (!forceRun) {
          await fetchOcrBenchmark(true);
        } else {
          triggerAlert("error", data.error || "Failed to parse OCR benchmark metrics.");
        }
      }
    } catch (err: any) {
      console.error(err);
      if (forceRun) {
        triggerAlert("error", err.message || "Failed to execute Bengali OCR evaluation engine.");
      }
    } finally {
      setIsEvaluatingOcr(false);
    }
  };

  const fetchLeaderboardRankings = async () => {
    setIsFetchingLeaderboard(true);
    try {
      const res = await fetch("/api/leaderboard/rank");
      const data = await res.json();
      if (res.ok && data.success) {
        setDynamicLeaderboard(data.report || []);
        // Set default comparison options if empty
        if (data.report && data.report.length >= 2) {
          setCompareModelA(compareModelA || data.report[0].version_id);
          setCompareModelB(compareModelB || data.report[1].version_id);
        }
      } else {
        throw new Error(data.error || "Could not retrieve leaderboard rankings.");
      }
    } catch (err: any) {
      console.error(err);
      triggerAlert("error", err.message || "Failed to load dynamic model rankings.");
    } finally {
      setIsFetchingLeaderboard(false);
    }
  };

  const handleSaveModelLeaderboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveVersionId.trim() || !saveAgentName.trim()) {
      triggerAlert("error", "Please provide a valid Version ID and Agent Name.");
      return;
    }
    setIsSavingModel(true);
    try {
      const res = await fetch("/api/leaderboard/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version_id: saveVersionId,
          agent_name: saveAgentName,
          model_name: saveModelName,
          ex: saveEx,
          em: saveEm,
          status: saveStatus
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Save operation failed.");
      }
      triggerAlert("success", "Successfully added model submission to Leaderboard!");
      setShowSaveForm(false);
      // Reset form fields
      setSaveVersionId("");
      setSaveAgentName("");
      // Refresh rankings list
      fetchLeaderboardRankings();
      fetchPythonCodefiles(); // update code files
    } catch (err: any) {
      console.error(err);
      triggerAlert("error", err.message || "Failed to save model submission.");
    } finally {
      setIsSavingModel(false);
    }
  };

  const handleCompareModels = async () => {
    if (!compareModelA || !compareModelB) {
      triggerAlert("error", "Please select two models to run head-to-head evaluation.");
      return;
    }
    setIsComparing(true);
    setComparisonText(null);
    try {
      const res = await fetch("/api/leaderboard/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model_a: compareModelA, model_b: compareModelB })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Comparison routine failed.");
      }
      setComparisonText(data.resultText);
    } catch (err: any) {
      console.error(err);
      triggerAlert("error", err.message || "Could not execute models comparison.");
    } finally {
      setIsComparing(false);
    }
  };

  const handleRunFailureAnalysis = async () => {
    setIsAnalyzingFailures(true);
    setFailureAnalysisReport(null);
    try {
      const res = await fetch("/api/failure-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failure analysis execution failed.");
      }
      setFailureAnalysisReport(data.report);
      triggerAlert("success", "Automatic failure analysis completed successfully!");
      fetchPythonCodefiles(); // update tree code viewer code snaps
    } catch (err: any) {
      console.error(err);
      triggerAlert("error", err.message || "Failed to execute failure analysis script.");
    } finally {
      setIsAnalyzingFailures(false);
    }
  };

  const handleFetchCachedFailureAnalysis = async () => {
    try {
      const res = await fetch("/api/failure-analysis");
      const data = await res.json();
      if (res.ok && data.success) {
        setFailureAnalysisReport(data.report);
      }
    } catch (err) {
      console.error("Cached report load failed:", err);
    }
  };

  const fetchAgentVersions = async () => {
    try {
      const res = await fetch("/api/versions");
      const data = await res.json();
      setAgentVersions(data || []);
    } catch (e: any) {
      console.error(e);
    }
  };

  const fetchSchemaAndData = async () => {
    try {
      const res = await fetch("/api/schema");
      const data = await res.json();
      setSchemaDesc(data.schemaDescription);
      setCustomers(data.customers || []);
      setProducts(data.products || []);
      setSales(data.sales || []);
    } catch (e: any) {
      console.error(e);
      triggerAlert("error", "Failed to connect to the backend server. Make sure port 3000 is open.");
    }
  };

  const fetchPythonCodefiles = async () => {
    try {
      const res = await fetch("/api/code");
      const data = await res.json();
      setCodefiles(data.codebases || []);
      if (data.codebases && data.codebases.length > 0) {
        setSelectedFile(data.codebases[1]); // Default to db.py
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  const triggerAlert = (type: "success" | "error" | "warning", msg: string) => {
    setSystemAlert({ type, message: msg });
    setTimeout(() => setSystemAlert(null), 6000);
  };

  // Run Translation & SQL Execution
  const handleTranslateAndExecute = async () => {
    if (!userQuery.trim()) {
      triggerAlert("warning", "Please provide a Bengali search query first.");
      return;
    }

    setIsTranslating(true);
    setPlaygroundSqlError(null);
    setPlaygroundSql("");
    setPlaygroundResults([]);
    setIntermediateTranslation("");

    try {
      // 1. Get Translated SQL from backend using LLM proxy
      const transRes = await fetch("/api/translate-sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery, version_id: selectedVersion })
      });

      const transData = await transRes.json();
      if (!transRes.ok) {
        throw new Error(transData.error || "Translation processing failed.");
      }

      const cleanSql = transData.sql;
      setPlaygroundSql(cleanSql);
      setIntermediateTranslation(transData.translation || "");

      // 2. Execute SQL statement inside alasql engine
      const execRes = await fetch("/api/execute-sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: cleanSql })
      });

      const execData = await execRes.json();
      if (!execRes.ok) {
        setPlaygroundSqlError(execData.error || "Syntactic execution error");
      } else {
        setPlaygroundResults(execData.results || []);
        if (execData.results && execData.results.length === 0) {
          triggerAlert("success", "Query ran successfully but returned 0 rows.");
        }
      }

    } catch (err: any) {
      console.error(err);
      setPlaygroundSqlError(err.message || "Execution block terminated unexpectedly.");
    } finally {
      setIsTranslating(false);
    }
  };

  // Run evaluation harness
  const handleRunEvaluation = async () => {
    setIsEvaluating(true);
    setEvalSummary(null);
    setEvalTasks([]);
    setSelectedInspectTask(null);

    try {
      const bodyPayload: any = { version_id: selectedVersion };
      if (selectedProvider) {
        bodyPayload.provider = selectedProvider;
        if (customModelName) {
          bodyPayload.model_name = customModelName;
        }
      }

      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Evaluation benchmark pipeline run failed.");
      }

      setEvalSummary(data.summary);
      setEvalTasks(data.task_results || []);
      if (data.task_results && data.task_results.length > 0) {
        setSelectedInspectTask(data.task_results[0]);
      }
      triggerAlert("success", "B-DAAB evaluation completed successfully!");
      
      // Auto refresh leaderboard rankings since the run is saved to eval_history.json
      fetchLeaderboardRankings();
    } catch (err: any) {
      console.error(err);
      triggerAlert("error", err.message || "Failed to finalize test harness.");
    } finally {
      setIsEvaluating(false);
    }
  };

  // Run synthetic task generator pipeline
  const handleGenerateSynthetic = async () => {
    setIsGeneratingSynthetic(true);
    setGeneratorStats(null);
    try {
      const res = await fetch("/api/generate-synthetic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          count: generateCount,
          seed: generateSeed,
          merge: shouldMerge
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Synthetic generation pipeline failed.");
      }

      setGeneratorStats(data);
      triggerAlert("success", `Generated ${data.total_generated} custom benchmarks successfully!`);
      fetchPythonCodefiles(); // update tree code viewer code snaps
    } catch (err: any) {
      console.error(err);
      triggerAlert("error", err.message || "Failed to execute python generator script.");
    } finally {
      setIsGeneratingSynthetic(false);
    }
  };

  // Helper to convert real Files to raw base64 string
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const resultStr = reader.result as string;
        const base64 = resultStr.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Drag and Drop action handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const processFileList = async (files: FileList) => {
    const validImages: MultimodalDoc[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        triggerAlert("warning", `File '${file.name}' is not an image and was ignored.`);
        continue;
      }

      // Read to display local image preview
      const previewUrl = URL.createObjectURL(file);
      
      // Attempt to guess document type based on custom elements or name
      let guessedType = "Screenshot";
      const nameLower = file.name.toLowerCase();
      if (nameLower.includes("report") || nameLower.includes("chart") || nameLower.includes("presc")) {
        guessedType = "Hospital Report";
      } else if (nameLower.includes("form") || nameLower.includes("card") || nameLower.includes("apply")) {
        guessedType = "Scanned Form";
      } else if (nameLower.includes("table") || nameLower.includes("sheet") || nameLower.includes("excel")) {
        guessedType = "Table Sheet";
      }

      // Convert size to human readable
      const sizeStr = file.size < 1024 * 1024 
        ? `${Math.round(file.size / 1024)} KB` 
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      // Keep reference to the real file inside preview details too
      validImages.push({
        id: `dropped-${Date.now()}-${i}`,
        name: file.name,
        size: sizeStr,
        type: guessedType,
        preview: previewUrl,
        status: "idle",
        // Store raw file in custom property
        ...(file && { rawFile: file } as any)
      });
    }

    if (validImages.length > 0) {
      setMultimodalDocs(prev => [...prev, ...validImages]);
      setSelectedDoc(validImages[0]);
      triggerAlert("success", `Added ${validImages.length} images to the bulk benchmark processing queue.`);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFileList(e.dataTransfer.files);
    }
  };

  const handleFileSelectChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFileList(e.target.files);
    }
  };

  const deleteMultimodalDoc = (id: string) => {
    setMultimodalDocs(prev => prev.filter(d => d.id !== id));
    if (selectedDoc?.id === id) {
      setSelectedDoc(null);
    }
  };

  const clearAllMultimodalDocs = () => {
    setMultimodalDocs([]);
    setSelectedDoc(null);
  };

  const handleProcessMultimodalBatch = async () => {
    if (multimodalDocs.length === 0) {
      triggerAlert("warning", "The benchmark queue is empty. Load sample images or drag & drop files to proceed.");
      return;
    }

    setIsProcessingMultimodal(true);
    triggerAlert("warning", "Initiating batch pre-processing & Gemini vision pipelines...");

    // Flag all documents as processing
    setMultimodalDocs(prev => prev.map(d => ({ ...d, status: "processing" as const })));

    try {
      const batchPayload = [];
      
      for (const doc of multimodalDocs) {
        let base64 = "";
        
        // If it's a user dropped raw file
        if ((doc as any).rawFile) {
          try {
            base64 = await fileToBase64((doc as any).rawFile);
          } catch (err) {
            console.error("Base64 conversion failed:", err);
          }
        } else {
          // If preloaded placeholder, send dummy content (backend intercepts based on file_name)
          base64 = "DUMMY_IMAGE_BASE64";
        }

        batchPayload.push({
          file_name: doc.name,
          file_type: "image/png",
          base64_data: base64
        });
      }

      const res = await fetch("/api/multimodal-benchmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch: batchPayload, query: multimodalQuery })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Multimodal batch processing crashed.");
      }

      const backendResults = data.results || [];
      
      setMultimodalDocs(prev => {
        const updated = prev.map((doc, idx) => {
          const matchingResult = backendResults.find((r: any) => r.file_name === doc.name);
          if (matchingResult) {
            if (matchingResult.status === "success") {
              return {
                ...doc,
                status: "success" as const,
                type: matchingResult.document_type || doc.type,
                ocrText: matchingResult.ocr_text,
                suggestedSql: matchingResult.suggested_sql,
                results: matchingResult.executed_results,
                explanation: matchingResult.explanation,
                tableData: matchingResult.table_data
              };
            } else {
              return {
                ...doc,
                status: "failed" as const,
                error: matchingResult.error || "Processing failed"
              };
            }
          }
          return {
            ...doc,
            status: "failed" as const,
            error: "No response output from pipeline"
          };
        });

        // Auto-select the first successfully parsed item
        const firstSuccess = updated.find(d => d.status === "success");
        if (firstSuccess) {
          setSelectedDoc(firstSuccess);
        } else if (updated.length > 0) {
          setSelectedDoc(updated[0]);
        }

        return updated;
      });

      triggerAlert("success", "Multimodal batch benchmark parsed and evaluated successfully!");

    } catch (err: any) {
      console.error(err);
      setMultimodalDocs(prev => prev.map(d => ({ ...d, status: "failed" as const, error: err.message })));
      triggerAlert("error", err.message || "Bulk OCR vision pipeline failed to execute.");
    } finally {
      setIsProcessingMultimodal(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  // Presets sample list
  const presets = [
    {
      bangla: "ঢাকা শহরের সকল গ্রাহকদের নাম ও টায়ার দেখাও।",
      english: "Show name & loyalty tier of all customers in Dhaka."
    },
    {
      bangla: "আমাদের মোট কতটি পণ্য বিক্রয় হয়েছে এবং মোট কত টাকার বিক্রয় হয়েছে?",
      english: "What are the aggregate product units sold and total revenue?"
    },
    {
      bangla: "যেসব পণ্যের স্টক ১০টির কম রয়েছে, তাদের তালিকা তৈরি করো।",
      english: "List all items in products with a stock level under 10."
    },
    {
      bangla: "আজ পর্যন্ত কোন পণ্যটি সবচেয়ে বেশি সংখ্যায় বিক্রি হয়েছে?",
      english: "Find the single product name with the highest sum quantity sold."
    },
    {
      bangla: "আবুল কালাম নামের গ্রাহক কোন কোন পণ্য কিনেছেন তার তালিকা দেখাও।",
      english: "Show all unique product descriptions purchased by Abul Kalam."
    }
  ];

  const historicalSubmissions = [
    { rank: 1, model: "Gemini 3.5 Flash + B-DAAB Agent (Active pipeline)", ex: 100.0, em: 80.0, status: "Active Engine", color: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" },
    { rank: 2, model: "Claude 3.5 Sonnet (Schema-Injected Zero Shot)", ex: 90.0, em: 70.0, status: "Submitted", color: "text-indigo-400 bg-indigo-500/10 border border-indigo-500/20" },
    { rank: 3, model: "GPT-4o (Contextual prompt SQL writer)", ex: 80.0, em: 60.0, status: "Submitted", color: "text-indigo-400 bg-indigo-500/10 border border-indigo-500/20" },
    { rank: 4, model: "Translation-then-SQL Baseline Heuristic", ex: 20.0, em: 10.0, status: "Baseline", color: "text-slate-400 bg-slate-500/10 border border-slate-500/20" },
    { rank: 5, model: "Standard Rule-based RegEx Parser", ex: 10.0, em: 0.0, status: "Baseline", color: "text-slate-400 bg-slate-500/10 border border-slate-500/20" }
  ];

  return (
    <div id="bdaab-dashboard" className="min-h-screen bg-[#09090b] font-sans text-slate-300">
      
      {/* Universal Alerts Panel */}
      <AnimatePresence>
        {systemAlert && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border text-sm max-w-lg min-w-[320px] ${
              systemAlert.type === "success" ? "bg-[#141418] border-emerald-500/20 text-emerald-400" :
              systemAlert.type === "error" ? "bg-[#141418] border-rose-500/20 text-rose-400" :
              "bg-[#141418] border-amber-500/20 text-amber-400"
            }`}
          >
            {systemAlert.type === "success" && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
            {systemAlert.type === "error" && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {systemAlert.type === "warning" && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />}
            <span className="font-semibold">{systemAlert.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Structural Page Header */}
      <header className="bg-[#09090b]/80 backdrop-blur border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🇧🇩</span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">B-DAAB</h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase font-bold">Bengali Data Agent Benchmark</p>
            </div>
          </div>
          
          {/* Active Framework Navigation Selector */}
          <nav className="flex items-center gap-1 bg-[#111114] p-1 rounded-lg text-sm border border-white/5">
            <button 
              id="nav-playground"
              onClick={() => setActiveTab("playground")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                activeTab === "playground" ? "bg-white/5 text-indigo-400 border-l-2 md:border-l-0 md:border-b-2 border-indigo-600" : "text-slate-400 hover:text-white"
              }`}
            >
              Playground
            </button>
            <button 
              id="nav-harness"
              onClick={() => setActiveTab("harness")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                activeTab === "harness" ? "bg-white/5 text-indigo-400 border-l-2 md:border-l-0 md:border-b-2 border-indigo-600" : "text-slate-400 hover:text-white"
              }`}
            >
              Harness
            </button>
            <button 
              id="nav-analysis"
              onClick={() => setActiveTab("analysis")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                activeTab === "analysis" ? "bg-white/5 text-indigo-400 border-l-2 md:border-l-0 md:border-b-2 border-indigo-600" : "text-slate-400 hover:text-white"
              }`}
            >
              Failure Analysis
            </button>
            <button 
              id="nav-generator"
              onClick={() => setActiveTab("generator")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                activeTab === "generator" ? "bg-white/5 text-indigo-400 border-l-2 md:border-l-0 md:border-b-2 border-indigo-600" : "text-slate-400 hover:text-white"
              }`}
            >
              Generator Dashboard
            </button>
            <button 
              id="nav-code"
              onClick={() => setActiveTab("code")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                activeTab === "code" ? "bg-white/5 text-indigo-400 border-l-2 md:border-l-0 md:border-b-2 border-indigo-600" : "text-slate-400 hover:text-white"
              }`}
            >
              Python Code Viewer
            </button>
            <button 
              id="nav-leaderboard"
              onClick={() => setActiveTab("leaderboard")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                activeTab === "leaderboard" ? "bg-white/5 text-indigo-400 border-l-2 md:border-l-0 md:border-b-2 border-indigo-600" : "text-slate-400 hover:text-white"
              }`}
            >
              Leaderboard
            </button>
            <button 
              id="nav-schema"
              onClick={() => setActiveTab("schema")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                activeTab === "schema" ? "bg-white/5 text-indigo-400 border-l-2 md:border-l-0 md:border-b-2 border-indigo-600" : "text-slate-400 hover:text-white"
              }`}
            >
              Dataset Schema
            </button>
            <button 
              id="nav-ocr-benchmark"
              onClick={() => setActiveTab("ocr-benchmark")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                activeTab === "ocr-benchmark" ? "bg-white/5 text-indigo-400 border-l-2 md:border-l-0 md:border-b-2 border-indigo-600" : "text-slate-400 hover:text-white"
              }`}
            >
              OCR Benchmark
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        <AnimatePresence mode="wait">
          {/* -------------------- TAB 1: PLAYGROUND -------------------- */}
          {activeTab === "playground" && (
            <motion.div
              key="playground"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left query column */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#141418] border border-white/5 p-6 rounded-2xl shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-400" />
                      Linguistic Command Input
                    </h3>
                    <span className="text-xs font-mono px-2 py-1 bg-white/5 text-slate-400 rounded border border-white/5">
                      Bengali query mapping
                    </span>
                  </div>

                  <p className="text-slate-400 text-sm mb-4">
                    Type a query in colloquial or formal Bengali to map it directly into compliant SQL and run it on our standard SQLite database engine.
                  </p>

                  {/* Dynamic Agent version dropdown configuration selection */}
                  <div className="mb-4 bg-[#1a1a1e]/80 p-4 rounded-xl border border-white/5 shadow-inner">
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 mb-2">Agent Version Execution Mode:</label>
                    <select
                      id="agent-version-select"
                      value={selectedVersion}
                      onChange={(e) => setSelectedVersion(e.target.value)}
                      className="w-full bg-[#09090b] border border-white/10 rounded-lg p-2.5 text-slate-100 font-sans text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      {agentVersions.length > 0 ? (
                        agentVersions.map((v) => (
                          <option key={v.version_id} value={v.version_id}>
                            {v.name} ({v.version_id})
                          </option>
                        ))
                      ) : (
                        <option value="v1.0-Vanilla">Vanilla Bengali LLM Agent (v1.0-Vanilla)</option>
                      )}
                    </select>
                    {agentVersions.length > 0 && (
                      <p className="text-[11px] text-slate-400 leading-normal mt-2.5">
                        <strong className="text-slate-300">Pipeline details:</strong> {agentVersions.find(v => v.version_id === selectedVersion)?.description || ""}
                      </p>
                    )}
                  </div>

                  <textarea
                    id="bengali-query-input"
                    rows={3}
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="উদাহরণ: যে গ্রাহকরা ঢাকাতে থাকে তাদের নাম কী?"
                    className="w-full bg-[#09090b] border border-white/10 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
                  />

                  <div className="flex justify-end mt-4">
                    <button
                      id="execute-query-btn"
                      onClick={handleTranslateAndExecute}
                      disabled={isTranslating}
                      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-lg shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isTranslating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing Mapping...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          Run SQL Generation
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Database Execution Result Panel */}
                <div className="bg-[#141418] border border-white/5 p-6 rounded-2xl shadow-xl min-h-[300px] flex flex-col">
                  <h3 className="font-semibold text-white text-lg flex items-center gap-2 mb-4 justify-between border-b border-white/5 pb-3">
                    <span className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-indigo-400" />
                      Relational Run Output
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      Executed Live (alasql engine)
                    </span>
                  </h3>

                  {intermediateTranslation && (
                    <div className="mb-4 bg-indigo-500/5 p-3 rounded-lg border border-indigo-500/10">
                      <p className="text-[10px] text-indigo-400 font-mono uppercase tracking-wider mb-1 font-bold">🇺🇸 Intermediate English Translation</p>
                      <p className="text-sm text-indigo-200 italic leading-relaxed">"{intermediateTranslation}"</p>
                    </div>
                  )}

                  {playgroundSql && (
                    <div className="mb-4">
                      <p className="text-xs text-slate-500 font-mono scenic-uppercase tracking-wider mb-2">Generated Dialect SQL</p>
                      <div className="bg-[#09090b] rounded-lg p-3 font-mono text-sm text-indigo-300 overflow-x-auto border border-white/10 max-h-48">
                        {playgroundSql}
                      </div>
                    </div>
                  )}

                  {/* Errors display */}
                  {playgroundSqlError && (
                    <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-4 text-rose-300 text-sm flex gap-3 items-start my-auto">
                      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-rose-200 font-sans">Query Generation Error</h4>
                        <p className="mt-1 font-mono text-xs">{playgroundSqlError}</p>
                        <p className="mt-2 text-xs text-slate-500 font-sans">
                          Ensure your GEMINI_API_KEY is configured in details under Secrets.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Loading spinner */}
                  {isTranslating && (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-500 my-auto">
                      <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-3" />
                      <p className="text-sm font-medium">Gemini parsing Bengali linguistic intent...</p>
                      <p className="text-xs text-slate-500 mt-1">Applying DuckDB schema mapping criteria</p>
                    </div>
                  )}

                  {/* Empty state when no queries have run */}
                  {!isTranslating && !playgroundSqlError && playgroundResults.length === 0 && !playgroundSql && (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-500 my-auto text-center">
                      <Database className="w-12 h-12 text-slate-600 mb-3" />
                      <p className="text-sm font-medium">Ready for Query Translation</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm">
                        Choose a Bengali question from the template library on the right, or enter your own query.
                      </p>
                    </div>
                  )}

                  {/* Tabular Output */}
                  {!isTranslating && !playgroundSqlError && (playgroundResults.length > 0 || playgroundSql) && (
                    <div className="flex-1 overflow-x-auto">
                      {playgroundResults.length > 0 ? (
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="border-b border-white/5 bg-[#111114]">
                              {Object.keys(playgroundResults[0]).map((key) => (
                                <th key={key} className="p-3 font-semibold text-slate-400 capitalize font-mono text-xs">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {playgroundResults.map((row, i) => (
                              <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                {Object.values(row).map((val: any, j) => (
                                  <td key={j} className="p-3 text-slate-300 font-medium font-mono text-xs">
                                    {val === null || val === undefined ? (
                                      <span className="text-slate-600">null</span>
                                    ) : (
                                      String(val)
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        playgroundSql && (
                          <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                            <CheckCircle className="w-10 h-10 text-emerald-500 mb-2" />
                            <p className="text-emerald-400 font-medium">Success - Returns zero rows</p>
                            <p className="text-xs mt-1 text-slate-500">SQL statement executed fine but matching results array is empty in DB.</p>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar helper column */}
              <div className="space-y-6">
                <div className="bg-[#141418] border border-white/5 p-6 rounded-2xl shadow-xl">
                  <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2 mb-4 border-b border-white/5 pb-3 uppercase tracking-wider">
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    Bengali Query Templates
                  </h3>

                  <div className="space-y-3">
                    {presets.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => setUserQuery(preset.bangla)}
                        className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex flex-col gap-1.5 cursor-pointer ${
                          userQuery === preset.bangla ? "border-indigo-500/50 bg-[#1c1c21] text-indigo-400 shadow-md font-semibold" : "border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
                        }`}
                      >
                        <span className={`font-semibold font-sans leading-relaxed ${userQuery === preset.bangla ? "text-indigo-405 text-white" : "text-slate-200"}`}>{preset.bangla}</span>
                        <span className="text-slate-400 italic font-medium font-sans leading-normal">{preset.english}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#141418] border border-white/5 p-6 rounded-2xl shadow-xl">
                  <h4 className="font-semibold text-white text-sm mb-2">Benchmarking Information</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    B-DAAB evaluates text-to-SQL logic natively on Bengali phrases. The active translation logic uses our <strong className="text-indigo-400">Gemini 3.5 Flash</strong> module running fully server-side.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
           {/* -------------------- TAB 2: BENCHMARK HARNESS -------------------- */}
          {activeTab === "harness" && (
            <motion.div
              key="harness"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
              className="space-y-8"
            >
              {/* Harness run control banner */}
              <div className="bg-[#141418] rounded-2xl p-6 border border-white/5 shadow-xl text-white flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                      <PlayCircle className="w-6 h-6 text-indigo-400" />
                      Autonomous Test Runner
                    </h2>
                    <p className="text-slate-400 text-xs mt-1 max-w-xl">
                      Run the B-DAAB test harness to measure Exact Match (EM) and execution reliability (EX) across 10 diverse difficulty-graded tasks in Bengali.
                    </p>
                  </div>

                  <div className="shrink-0">
                    <button
                      id="run-harness-btn"
                      onClick={handleRunEvaluation}
                      disabled={isEvaluating}
                      className="w-full md:w-auto inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg shadow-lg shadow-indigo-500/10 transition-colors cursor-pointer disabled:opacity-50 font-sans"
                    >
                      {isEvaluating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Running Evaluation Suite...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current animate-pulse" />
                          Execute B-DAAB Benchmark
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Model Swapping Options Section */}
                <div className="border-t border-white/5 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 mb-2">
                        Benchmark Target Engine:
                      </label>
                      <select
                        id="harness-target-select"
                        value={selectedProvider}
                        onChange={(e) => {
                          setSelectedProvider(e.target.value);
                          // Set standard default model matching selected provider
                          const prov = e.target.value;
                          if (prov === "gemini") setCustomModelName("gemini-3.5-flash");
                          else if (prov === "gpt") setCustomModelName("gpt-4o");
                          else if (prov === "claude") setCustomModelName("claude-3-5-sonnet-20241022");
                          else if (prov === "huggingface") setCustomModelName("Qwen/Qwen1.5-0.5B-Chat");
                          else setCustomModelName("");
                        }}
                        className="w-full bg-[#09090b] border border-white/10 rounded-lg p-2.5 text-slate-100 font-sans text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="">Default Gemini Agent pipelines (Selected version in sidebar)</option>
                        <option value="gemini">Swapped Model: Google Gemini Backbone</option>
                        <option value="gpt">Swapped Model: OpenAI GPT Backbone</option>
                        <option value="claude">Swapped Model: Anthropic Claude Backbone</option>
                        <option value="huggingface">Swapped Model: Local HuggingFace Backbone</option>
                      </select>
                    </div>

                    {selectedProvider !== "" && (
                      <div>
                        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 mb-2">
                          Specific Model Identifier:
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="e.g. gpt-4o, claude-3-5-sonnet-20241022..."
                            value={customModelName}
                            onChange={(e) => setCustomModelName(e.target.value)}
                            className="w-full bg-[#09090b] border border-white/10 rounded-lg p-2.5 text-slate-100 font-sans text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 pr-24"
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                            {selectedProvider === "gemini" && (
                              <button
                                type="button"
                                onClick={() => setCustomModelName("gemini-1.5-pro")}
                                className="text-[10px] bg-white/15 px-1.5 py-1 rounded text-slate-100 hover:bg-white/20"
                              >
                                Pro
                              </button>
                            )}
                            {selectedProvider === "gpt" && (
                              <button
                                type="button"
                                onClick={() => setCustomModelName("gpt-3.5-turbo")}
                                className="text-[10px] bg-white/15 px-1.5 py-1 rounded text-slate-100 hover:bg-white/20"
                              >
                                Mini
                              </button>
                            )}
                            {selectedProvider === "claude" && (
                              <button
                                type="button"
                                onClick={() => setCustomModelName("claude-3-haiku-20240307")}
                                className="text-[10px] bg-white/15 px-1.5 py-1 rounded text-slate-100 hover:bg-white/20"
                              >
                                Haiku
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {selectedProvider !== "" && (
                    <div className="mt-3 bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/10 text-xs text-indigo-200">
                      <strong>Multi-Model Swapped Routing Enabled:</strong> Since you have selected a Swapped Backbone, B-DAAB will bypass default runtime agents and instead load our custom module class adapter calling <strong>{selectedProvider.toUpperCase()} ({customModelName || "default"})</strong> via the flexible <code>benchmark_runner.py</code> execution backend.
                    </div>
                  )}
                </div>
              </div>

              {/* Loader during evaluation */}
              {isEvaluating && (
                <div className="bg-[#141418] border border-white/5 rounded-2xl p-12 text-center text-slate-400 shadow-xl">
                  <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
                  <h3 className="font-semibold text-white text-lg font-sans">Evaluating Translator Agent</h3>
                  <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                    Sending queries, generating DuckDB SQL code blocks via Gemini engine, executing statements on baseline tables and validation comparisons...
                  </p>
                </div>
              )}

              {/* Evaluation summary graphics and layout */}
              {!isEvaluating && evalSummary && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Performance widgets Column */}
                  <div className="space-y-6">
                    {/* Exact Match accuracy */}
                    <div className="bg-[#141418] rounded-2xl border border-white/5 p-6 shadow-xl text-center">
                      <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 mb-4">Exact Match (EM) Accuracy</h4>
                      <div className="relative inline-flex items-center justify-center">
                        {/* Radial indicator */}
                        <svg className="w-32 h-32">
                          <circle className="text-white/5" strokeWidth="10" stroke="currentColor" fill="transparent" r="50" cx="64" cy="64"/>
                          <circle className="text-indigo-400 transition-all duration-1000 ease-out" strokeWidth="10" strokeDasharray={Math.PI * 2 * 50} strokeDashoffset={(1 - evalSummary.exact_match_accuracy / 100) * Math.PI * 2 * 50} strokeLinecap="round" stroke="currentColor" fill="transparent" r="50" cx="64" cy="64"/>
                        </svg>
                        <span className="absolute text-2xl font-bold text-white font-mono">{evalSummary.exact_match_accuracy}%</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-4 font-mono font-medium">
                        Matched {evalSummary.exact_match_count} of {evalSummary.total_tasks} SQL statements string-by-string.
                      </p>
                    </div>

                    {/* Execution Match accuracy */}
                    <div className="bg-[#141418] rounded-2xl border border-white/5 p-6 shadow-xl text-center">
                      <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 mb-4">Execution (EX) Accuracy</h4>
                      <div className="relative inline-flex items-center justify-center">
                        <svg className="w-32 h-32">
                          <circle className="text-white/5" strokeWidth="10" stroke="currentColor" fill="transparent" r="50" cx="64" cy="64"/>
                          <circle className="text-emerald-400 transition-all duration-1000 ease-out" strokeWidth="10" strokeDasharray={Math.PI * 2 * 50} strokeDashoffset={(1 - evalSummary.execution_accuracy / 100) * Math.PI * 2 * 50} strokeLinecap="round" stroke="currentColor" fill="transparent" r="50" cx="64" cy="64"/>
                        </svg>
                        <span className="absolute text-2xl font-bold text-white font-mono">{evalSummary.execution_accuracy}%</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-4 font-mono font-medium">
                        Returned identical dataset mappings in {evalSummary.execution_match_count} of {evalSummary.total_tasks} queries.
                      </p>
                    </div>
                  </div>

                  {/* Tasks results grid breakout card matches */}
                  <div className="lg:col-span-2 bg-[#141418] rounded-2xl border border-white/5 p-6 shadow-xl">
                    <h3 className="font-semibold text-white text-lg mb-4 flex items-center justify-between border-b border-white/5 pb-3 font-sans">
                      <span>Detailed Task Report</span>
                      <span className="text-xs font-mono bg-white/5 text-slate-300 px-2.5 py-1 rounded border border-white/5">
                        10 Benchmark suites
                      </span>
                    </h3>

                    <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto pr-2">
                      {evalTasks.map((task) => (
                        <div 
                           key={task.task_id}
                           onClick={() => setSelectedInspectTask(task)}
                           className={`p-3 rounded-xl mb-2 transition-all cursor-pointer flex items-center justify-between gap-4 border ${
                             selectedInspectTask?.task_id === task.task_id ? "bg-white/5 border-white/10 shadow-lg" : "border-transparent hover:bg-white/[0.02]"
                           }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded shrink-0 font-semibold ${
                              task.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                              task.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                              "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}>
                              {task.task_id}
                            </span>
                            <div>
                               <p className="text-xs font-semibold text-slate-200 line-clamp-1 font-sans">{task.bengali_query}</p>
                               <p className="text-[10px] text-slate-500 font-semibold font-mono mt-0.5 uppercase tracking-wide">{task.category}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold font-mono px-2 py-1 rounded inline-flex items-center gap-1 ${
                              task.execution_match ? "text-emerald-400 bg-emerald-500/5 border border-emerald-500/10" : "text-rose-400 bg-rose-500/5 border border-rose-500/10"
                            }`}>
                              EX: {task.execution_match ? "PASS" : "FAIL"}
                            </span>
                            <span className={`text-xs font-semibold font-mono px-2 py-1 rounded inline-flex items-center gap-1 ${
                              task.exact_match ? "text-indigo-400 bg-indigo-500/5 border border-indigo-500/10" : "text-slate-500 bg-white/5"
                            }`}>
                              EM: {task.exact_match ? "PASS" : "FAIL"}
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Task Detail Drilldown inspect block */}
              {!isEvaluating && selectedInspectTask && (
                <div className="bg-[#141418] rounded-2xl border border-white/5 p-6 shadow-xl">
                  <h3 className="font-semibold text-white text-md uppercase tracking-wider font-mono border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse"></span>
                    Diagnostics Investigation: Task {selectedInspectTask.task_id}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-mono uppercase tracking-wider text-slate-500">Target Bengali Input</p>
                        <p className="text-base font-bold text-white font-sans mt-1 leading-snug">{selectedInspectTask.bengali_query}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-mono uppercase tracking-wider text-slate-500">Complexity Grade</p>
                          <span className="text-xs font-semibold mt-1 inline-block text-slate-300 font-mono">{selectedInspectTask.difficulty}</span>
                        </div>
                        <div>
                          <p className="text-xs font-mono uppercase tracking-wider text-slate-500">Task Category</p>
                          <span className="text-xs font-semibold mt-1 inline-block text-indigo-300 font-mono">{selectedInspectTask.category}</span>
                        </div>
                      </div>

                      {selectedInspectTask.error_details && (
                        <div className="bg-rose-500/5 border border-rose-500/20 text-rose-300 rounded-xl p-3 text-xs font-mono flex gap-2">
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <span>Runtime Error: {selectedInspectTask.error_details}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-1.5">Golden SQL Reference</p>
                        <div className="bg-[#09090b] rounded-lg p-3 font-mono text-xs text-slate-300 border border-white/5 overflow-x-auto">
                          {selectedInspectTask.sql_gold}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-1.5">Generated Agent SQL</p>
                        <div className={`rounded-lg p-3 font-mono text-xs border overflow-x-auto ${
                          selectedInspectTask.exact_match ? "bg-[#09090b] text-indigo-300 border-indigo-500/20" : "bg-slate-900 text-rose-300 border-rose-500/20"
                        }`}>
                          {selectedInspectTask.sql_pred || "-- None Generated --"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Default landing pane when harness hasn't run yet */}
              {!isEvaluating && !evalSummary && (
                <div className="bg-[#141418] rounded-2xl border border-white/5 p-12 text-center text-slate-500 my-8 shadow-xl">
                  <Trophy className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <h3 className="font-semibold text-white text-lg font-sans">No Results Computed</h3>
                  <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                    Click the "Execute B-DAAB Benchmark" button above to evaluate Gemini on Bengali text translation tasks.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* -------------------- TAB 3: CODE VIEWER -------------------- */}
          {activeTab === "code" && (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-8"
            >
              {/* Left-hand file explorer navigation panel */}
              <div className="bg-[#141418] rounded-2xl border border-white/5 p-6 shadow-xl lg:col-span-1">
                <h3 className="font-semibold text-white text-sm flex items-center gap-2 mb-4 uppercase tracking-wider border-b border-white/5 pb-3">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Python Files Tree
                </h3>

                <ul className="space-y-2 text-xs">
                  {codefiles.map((file, i) => (
                    <li key={i}>
                      <button
                        onClick={() => setSelectedFile(file)}
                        className={`w-full text-left p-2.5 rounded-lg border font-mono transition-all flex items-center gap-2 cursor-pointer ${
                          selectedFile?.name === file.name ? "bg-white/5 border-white/10 text-indigo-400 font-semibold shadow-inner" : "border-transparent text-slate-400 hover:text-white hover:bg-white/[0.01]"
                        }`}
                      >
                        <Code className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                        <div className="truncate">
                          <p className="truncate font-semibold">{file.name}</p>
                          <p className="text-[9px] text-slate-500 truncate mt-0.5">{file.relPath}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right-hand code text container */}
              <div className="lg:col-span-3 bg-[#141418] rounded-2xl border border-white/5 p-6 shadow-xl min-h-[500px] flex flex-col">
                {selectedFile ? (
                  <>
                    <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                      <div>
                        <h3 className="font-semibold text-white">{selectedFile.name}</h3>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">Location: b-daab/{selectedFile.relPath}</p>
                      </div>

                      <button
                        onClick={() => handleCopyCode(selectedFile.code)}
                        className="inline-flex items-center gap-1.5 border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs transition-all font-medium cursor-pointer"
                      >
                        {copiedFile ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy File Code
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex-1 bg-[#09090b] font-mono text-xs text-slate-300 p-4 rounded-xl overflow-auto border border-white/5 max-h-[550px] leading-relaxed select-text">
                      <pre className="whitespace-pre overflow-x-auto tab-size-4">
                        {selectedFile.code}
                      </pre>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <p className="text-sm">Fetching codebase files metadata...</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* -------------------- TAB 4: LEADERBOARD -------------------- */}
          {activeTab === "leaderboard" && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
              className="space-y-8 animate-fade-in"
            >
              {/* Primary Header Card with Dynamic Export Actions */}
              <div className="bg-[#141418] rounded-2xl p-6 border border-white/5 shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2.5 text-white">
                    <Trophy className="w-6 h-6 text-amber-400 animate-pulse" />
                    B-DAAB Benchmark Model Leaderboard
                  </h2>
                  <p className="text-slate-400 text-xs mt-1 max-w-2xl">
                    Ranked real-time framework accuracy scoreboard. Easily track historical and active configurations, execute comparative diagnostics, and download raw performance CSV/JSON payloads.
                  </p>
                </div>
                <div className="shrink-0 flex flex-wrap items-center gap-3">
                  {/* Refresh rankings */}
                  <button
                    onClick={fetchLeaderboardRankings}
                    disabled={isFetchingLeaderboard}
                    className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl border border-white/5 transition-colors disabled:opacity-50 cursor-pointer text-xs flex items-center gap-1.5"
                    title="Refresh Rankings"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isFetchingLeaderboard ? 'animate-spin' : ''}`} />
                  </button>

                  {/* Add Model custom submission */}
                  <button
                    onClick={() => setShowSaveForm(!showSaveForm)}
                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-500/10 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Record Custom Model Run
                  </button>

                  {/* Exports */}
                  <a
                    href="/api/leaderboard/export-csv"
                    download
                    className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 hover:text-white text-slate-300 border border-white/5 text-xs font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer"
                  >
                    CSV Report
                  </a>
                  <a
                    href="/api/leaderboard/export-json"
                    download
                    className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 hover:text-white text-slate-300 border border-white/5 text-xs font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer"
                  >
                    JSON Payload
                  </a>
                </div>
              </div>

              {/* RECORD CUSTOM MODEL SUBMISSION FORM */}
              <AnimatePresence>
                {showSaveForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-[#141418] border border-indigo-500/25 rounded-2xl p-6 shadow-xl space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <h3 className="font-bold text-white text-sm uppercase font-mono tracking-wider flex items-center gap-2">
                          <Plus className="w-4 h-4 text-indigo-400" />
                          Record Model Submission Run to Historical Ledger
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowSaveForm(false)}
                          className="p-1 hover:bg-white/5 rounded-md text-slate-400 hover:text-white transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveModelLeaderboard} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Column 1 */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[11px] font-mono text-slate-400 uppercase font-extrabold mb-1.5">Version ID / Slug identifier</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. v3.0-GeminiPro-CoT"
                              value={saveVersionId}
                              onChange={(e) => setSaveVersionId(e.target.value)}
                              className="w-full bg-[#09090b] text-white border border-white/10 px-3.5 py-2 rounded-xl text-xs font-mono focus:border-indigo-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-mono text-slate-400 uppercase font-extrabold mb-1.5">Agent Pipeline Description</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Schema-weighted Few shot LLM Agent"
                              value={saveAgentName}
                              onChange={(e) => setSaveAgentName(e.target.value)}
                              className="w-full bg-[#09090b] text-white border border-white/10 px-3.5 py-2 rounded-xl text-xs focus:border-indigo-500 outline-none"
                            />
                          </div>
                        </div>

                        {/* Column 2 */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[11px] font-mono text-slate-400 uppercase font-extrabold mb-1.5">Backbone Neural Model Core</label>
                            <select
                              value={saveModelName}
                              onChange={(e) => setSaveModelName(e.target.value)}
                              className="w-full bg-[#09090b] text-white border border-white/10 px-3.5 py-2 rounded-xl text-xs focus:border-indigo-500 outline-none cursor-pointer"
                            >
                              <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                              <option value="gemini-3.5-pro">Gemini 3.5 Pro</option>
                              <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                              <option value="gpt-4o">GPT-4o</option>
                              <option value="deepseek-v3">DeepSeek V3</option>
                              <option value="regex-parser">RegEx Rules Processor</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-mono text-slate-400 uppercase font-extrabold mb-1.5">Audit Status</label>
                            <select
                              value={saveStatus}
                              onChange={(e) => setSaveStatus(e.target.value)}
                              className="w-full bg-[#09090b] text-white border border-white/10 px-3.5 py-2 rounded-xl text-xs focus:border-indigo-500 outline-none cursor-pointer"
                            >
                              <option value="Submitted">Submitted (External Audit)</option>
                              <option value="Active Engine">Active Engine (Operational Config)</option>
                              <option value="Baseline">Baseline (Standard Benchmark Reference)</option>
                            </select>
                          </div>
                        </div>

                        {/* Column 3 */}
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="block text-[11px] font-mono text-slate-400 uppercase font-extrabold">Execution Accuracy: {saveEx.toFixed(1)}%</label>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="0.5"
                              value={saveEx}
                              onChange={(e) => setSaveEx(parseFloat(e.target.value))}
                              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="block text-[11px] font-mono text-slate-400 uppercase font-extrabold">Exact Match Similarity: {saveEm.toFixed(1)}%</label>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="0.5"
                              value={saveEm}
                              onChange={(e) => setSaveEm(parseFloat(e.target.value))}
                              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                          </div>

                          <div className="pt-2 flex justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => setShowSaveForm(false)}
                              className="px-4 py-2 border border-white/10 text-slate-400 hover:text-white rounded-xl text-xs transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isSavingModel}
                              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                            >
                              {isSavingModel ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  Recording run...
                                </>
                              ) : (
                                "Record & Commit Sub"
                              )}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* MAIN SCOREBOARD & RANKINGS LIST */}
              <div className="bg-[#141418] border border-white/5 rounded-2xl shadow-xl overflow-hidden">
                <div className="px-6 py-4 bg-white/[0.01] border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    Leaderboard Scoreboard Ledger
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500 select-none">
                    EX is Execution Accuracy / EM is Exact Match Accuracy
                  </span>
                </div>

                {isFetchingLeaderboard ? (
                  <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                    <p className="text-sm">Fetching real-time scored benchmarks...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto select-text">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[0.01] font-mono text-slate-400 font-semibold text-[11px]">
                          <th className="p-4 w-16 text-center">Rank</th>
                          <th className="p-4">Framework / Agent Pipeline ID</th>
                          <th className="p-4">Backbone Model</th>
                          <th className="p-4 text-center w-40">Execution Acc (EX)</th>
                          <th className="p-4 text-center w-40">Exact Match (EM)</th>
                          <th className="p-4 w-36">Audit Status</th>
                          <th className="p-4 w-44">Last Updated</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {dynamicLeaderboard.map((row: any, idx: number) => {
                          const rankNum = row.rank || (idx + 1);
                          const isLead = rankNum === 1;
                          
                          return (
                            <tr key={row.version_id || idx} className="hover:bg-white/[0.01] transition-colors">
                              <td className="p-4 text-center select-none">
                                <span className={`text-[11px] font-mono font-black ${
                                  isLead ? "text-amber-400 text-sm" : "text-slate-500"
                                }`}>
                                  #{rankNum}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="text-white font-semibold block leading-normal">{row.agent_name || row.model}</span>
                                <span className="text-[10px] text-indigo-400 font-mono block mt-0.5">{row.version_id || "v-baseline"}</span>
                              </td>
                              <td className="p-4 font-mono text-slate-300 capitalize">
                                {row.model_name || "gemini-3.5-flash"}
                              </td>
                              <td className="p-4 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <span className="font-bold text-[#10b981] font-mono text-sm">
                                    {(row.execution_accuracy !== undefined ? row.execution_accuracy : row.ex).toFixed(1)}%
                                  </span>
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <span className="font-bold text-indigo-400 font-mono text-sm">
                                    {(row.exact_match_accuracy !== undefined ? row.exact_match_accuracy : row.em).toFixed(1)}%
                                  </span>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                                  row.status === "Active Engine" ? "text-emerald-400 bg-emerald-500/5 border-emerald-500/10" :
                                  row.status === "Submitted" ? "text-indigo-400 bg-indigo-500/5 border-indigo-500/10" :
                                  "text-slate-400 bg-slate-500/5 border-slate-500/10"
                                }`}>
                                  {row.status}
                                </span>
                              </td>
                              <td className="p-4 text-slate-500 font-mono text-[10px]">
                                {row.timestamp || "N/A"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* MODEL COMPARISON HEAD-TO-HEAD COMPANION */}
              <div className="bg-[#141418] rounded-2xl border border-white/5 p-6 shadow-xl space-y-6">
                <div>
                  <h3 className="font-bold text-white text-sm uppercase font-mono tracking-wider flex items-center gap-2">
                    <ArrowLeftRight className="w-4 h-4 text-indigo-400" />
                    Model Comparison Head-to-Head differentials
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Select two logged LLM configurations to run program variance metrics. Analysis parses Execution Acc gains and identifies delta variances.
                  </p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Model A Select */}
                  <div className="w-full md:w-1/3">
                    <label className="block text-[10px] font-mono text-slate-500 uppercase font-semibold mb-1.5">Primary Model A</label>
                    <select
                      value={compareModelA}
                      onChange={(e) => setCompareModelA(e.target.value)}
                      className="w-full bg-[#09090b] text-white border border-white/10 px-3.5 py-2.5 rounded-xl text-xs focus:border-indigo-500 outline-none cursor-pointer"
                    >
                      {dynamicLeaderboard.map((row: any) => (
                        <option key={row.version_id} value={row.version_id}>
                          {row.agent_name || row.model} ({row.version_id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-2.5 bg-white/5 rounded-full select-none text-indigo-400 shrink-0">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>

                  {/* Model B Select */}
                  <div className="w-full md:w-1/3">
                    <label className="block text-[10px] font-mono text-slate-500 uppercase font-semibold mb-1.5">Comparison Model B</label>
                    <select
                      value={compareModelB}
                      onChange={(e) => setCompareModelB(e.target.value)}
                      className="w-full bg-[#09090b] text-white border border-white/10 px-3.5 py-2.5 rounded-xl text-xs focus:border-indigo-500 outline-none cursor-pointer"
                    >
                      {dynamicLeaderboard.map((row: any) => (
                        <option key={row.version_id} value={row.version_id}>
                          {row.agent_name || row.model} ({row.version_id})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Run Compare Button */}
                  <div className="w-full md:w-auto md:self-end">
                    <button
                      onClick={handleCompareModels}
                      disabled={isComparing || !compareModelA || !compareModelB}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 px-6 rounded-xl transition-colors disabled:opacity-50 cursor-pointer h-10 flex items-center justify-center gap-2"
                    >
                      {isComparing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Evaluating delta...
                        </>
                      ) : (
                        "Compare Frameworks"
                      )}
                    </button>
                  </div>
                </div>

                {/* Direct Comparison Output Textarea */}
                {comparisonText && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#09090b] border border-white/5 rounded-xl p-5 font-mono text-xs text-indigo-300 leading-relaxed max-h-72 overflow-y-auto"
                  >
                    <div className="flex justify-between items-center pb-2.5 mb-3 border-b border-white/5 select-none text-slate-400 font-sans">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-400 font-mono">Head-to-head comparison console output</span>
                      <span>Execution complete</span>
                    </div>
                    <pre className="whitespace-pre-wrap select-all">{comparisonText}</pre>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* -------------------- TAB 5: SCHEMA EXPLORER -------------------- */}
          {activeTab === "schema" && (
            <motion.div
              key="schema"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Database Schema layout listings */}
              <div className="lg:col-span-1 bg-[#141418] rounded-2xl border border-white/5 p-6 shadow-xl space-y-4">
                <h3 className="font-semibold text-white text-sm uppercase tracking-wider font-mono border-b border-white/5 pb-3 flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-400" />
                  Relational Tables Spec
                </h3>

                {schemaDesc ? (
                  <pre className="whitespace-pre-wrap font-sans text-xs text-slate-300 leading-relaxed max-h-[500px] overflow-y-auto">
                    {schemaDesc}
                  </pre>
                ) : (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
                  </div>
                )}
              </div>

              {/* Snapshot tabular display explorer */}
              <div className="lg:col-span-2 bg-[#141418] rounded-2xl border border-white/5 p-6 shadow-xl min-h-[400px] flex flex-col">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <h3 className="font-semibold text-white text-base">Database Live Snapshot Tables</h3>

                  {/* Table selection headers */}
                  <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5 text-xs font-semibold">
                    <button
                      onClick={() => setActiveSnapshotTable("customers")}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        activeSnapshotTable === "customers" ? "bg-white/10 text-white font-semibold shadow-inner border border-white/5" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      customers
                    </button>
                    <button
                      onClick={() => setActiveSnapshotTable("products")}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        activeSnapshotTable === "products" ? "bg-white/10 text-white font-semibold shadow-inner border border-white/5" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      products
                    </button>
                    <button
                      onClick={() => setActiveSnapshotTable("sales")}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        activeSnapshotTable === "sales" ? "bg-white/10 text-white font-semibold shadow-inner border border-white/5" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      sales
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-auto">
                  {activeSnapshotTable === "customers" && customers.length > 0 && (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/[0.01] font-mono text-slate-400 font-semibold">
                          <th className="p-3">customer_id</th>
                          <th className="p-3">name</th>
                          <th className="p-3">city</th>
                          <th className="p-3">tier</th>
                          <th className="p-3">join_date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono">
                        {customers.map((c) => (
                          <tr key={c.customer_id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="p-3 text-indigo-400">{c.customer_id}</td>
                            <td className="p-3 text-white font-semibold">{c.name}</td>
                            <td className="p-3 text-slate-300">{c.city}</td>
                            <td className="p-3 text-slate-300">{c.tier}</td>
                            <td className="p-3 text-slate-405 text-slate-400">{c.join_date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {activeSnapshotTable === "products" && products.length > 0 && (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/[0.01] font-mono text-slate-400 font-semibold">
                          <th className="p-3">product_id</th>
                          <th className="p-3">product_name</th>
                          <th className="p-3">category</th>
                          <th className="p-3">price</th>
                          <th className="p-3">stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono">
                        {products.map((p) => (
                          <tr key={p.product_id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="p-3 text-indigo-400">{p.product_id}</td>
                            <td className="p-3 text-white font-semibold">{p.product_name}</td>
                            <td className="p-3 text-slate-300">{p.category}</td>
                            <td className="p-3 text-emerald-400 font-semibold">{p.price.toLocaleString("en-US", { style: "currency", currency: "BDT" })}</td>
                            <td className="p-3 text-slate-400">{p.stock} units</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {activeSnapshotTable === "sales" && sales.length > 0 && (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/[0.01] font-mono text-slate-400 font-semibold">
                          <th className="p-3">sale_id</th>
                          <th className="p-3">customer_id</th>
                          <th className="p-3">product_id</th>
                          <th className="p-3">sale_date</th>
                          <th className="p-3">quantity</th>
                          <th className="p-3">total_amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono">
                        {sales.map((s) => (
                          <tr key={s.sale_id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="p-3 text-indigo-400">{s.sale_id}</td>
                            <td className="p-3 text-slate-300">{s.customer_id}</td>
                            <td className="p-3 text-slate-300">{s.product_id}</td>
                            <td className="p-3 text-slate-400">{s.sale_date}</td>
                            <td className="p-3 text-slate-300">{s.quantity}</td>
                            <td className="p-3 text-emerald-400 font-semibold">{s.total_amount.toLocaleString("en-US", { style: "currency", currency: "BDT" })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          
          {/* -------------------- TAB 5.5: SYNTHETIC BENCHMARK GENERATOR -------------------- */}
          {activeTab === "generator" && (
            <motion.div
              key="generator"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
              className="space-y-8"
            >
              {/* Primary Header Card */}
              <div className="bg-[#141418] rounded-2xl p-6 border border-white/5 shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2.5 text-white">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                    B-DAAB Synthetic Task Generator
                  </h2>
                  <p className="text-slate-400 text-xs mt-1 max-w-2xl">
                    Configure and execute the programmatic synthetic query engine. This script translates the core B-DAAB database schema and table rows definitions into thousands of unique, context-aware Bengali and transliterated Banglish Text-to-SQL tasks. All outputs compile and execute automatically against an in-memory database to ensure robust SQL correctness.
                  </p>
                </div>
                <div className="shrink-0 font-mono text-xs font-bold text-slate-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-505 bg-indigo-500 animate-ping"></span>
                  CORE ENGINE v1.5
                </div>
              </div>

              {/* Configurations Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel Card */}
                <div className="bg-[#141418] rounded-2xl border border-white/5 p-6 shadow-xl space-y-5 h-fit">
                  <h3 className="font-semibold text-white text-md flex items-center gap-2 border-b border-white/5 pb-3">
                    <Settings className="w-4 h-4 text-indigo-400" />
                    Generator Parameters
                  </h3>

                  {/* Task Count Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label id="lbl-gen-count" className="text-xs font-semibold font-mono text-slate-400 uppercase tracking-wide">Examples Count Limit</label>
                      <span className="text-sm font-bold text-white font-mono bg-[#09090b] px-2.5 py-0.5 rounded border border-white/5">{generateCount}</span>
                    </div>
                    <input
                      id="gen-count-slider"
                      type="range"
                      min="100"
                      max="5000"
                      step="100"
                      value={generateCount}
                      onChange={(e) => setGenerateCount(Number(e.target.value))}
                      className="w-full accent-indigo-600 h-1 bg-[#09090b] rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>100</span>
                      <span>2,500</span>
                      <span>5,000</span>
                    </div>
                  </div>

                  {/* Reproducibility Seed Input */}
                  <div className="space-y-2">
                    <label htmlFor="gen-seed-inp" className="block text-xs font-semibold font-mono text-slate-400 uppercase tracking-wide">Deterministic Seed</label>
                    <input
                      id="gen-seed-inp"
                      type="number"
                      value={generateSeed}
                      onChange={(e) => setGenerateSeed(Number(e.target.value))}
                      placeholder="e.g. 100"
                      className="w-full bg-[#09090b] border border-white/10 rounded-lg p-2.5 text-slate-100 placeholder-slate-600 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Specifying a constant seed value guarantees identical query combinations are reproduced on successive generations.
                    </p>
                  </div>

                  {/* Merge into production checkbox */}
                  <div className="bg-[#09090b] rounded-xl p-3 border border-white/5 flex items-start gap-3">
                    <input
                      id="merge-checkbox"
                      type="checkbox"
                      checked={shouldMerge}
                      onChange={(e) => setShouldMerge(e.target.checked)}
                      className="mt-1 w-4 h-4 text-indigo-600 bg-slate-950 border-white/10 rounded focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                    />
                    <div>
                      <label htmlFor="merge-checkbox" className="text-xs font-bold text-white cursor-pointer select-none">Merge into Baseline Tasks</label>
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                        Optionally append newly generated unique synthetic tasks directly into the primary <strong className="text-indigo-400">tasks.json</strong> evaluated in the standard Harness runner.
                      </p>
                    </div>
                  </div>

                  {/* Trigger Button */}
                  <button
                    id="trigger-generator-btn"
                    onClick={handleGenerateSynthetic}
                    disabled={isGeneratingSynthetic}
                    className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/10 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isGeneratingSynthetic ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating custom datasets...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 fill-white" />
                        Compile & Generate Tasks
                      </>
                    )}
                  </button>
                </div>

                {/* Right side display and results summary */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Status Banner when generating */}
                  {isGeneratingSynthetic && (
                    <div className="bg-[#141418] rounded-2xl border border-white/5 p-12 text-center text-slate-400 shadow-xl flex flex-col items-center justify-center h-full min-h-[400px]">
                      <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                      <h3 className="font-semibold text-white text-lg font-sans">Synthesize Pipeline Operating</h3>
                      <p className="text-sm text-slate-400 mt-2 max-w-sm leading-relaxed">
                        Executing programmatic python templater engine, verifying SQL combinations across customers, products, and sales tables inside a temporary in-memory database connections...
                      </p>
                    </div>
                  )}

                  {/* Results Dashboard stats if loaded */}
                  {!isGeneratingSynthetic && generatorStats && (
                    <div className="space-y-6">
                      {/* Metric widgets block */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[#141418] rounded-xl border border-[#22c55e]/20 p-5 shadow-lg text-center bg-[#22c55e]/5">
                          <CheckCircle className="w-6 h-6 text-[#22c55e] mx-auto mb-2" />
                          <h4 className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-extrabold">Executable Tasks</h4>
                          <p className="text-2xl font-black text-white font-mono mt-1">{generatorStats.total_generated}</p>
                          <p className="text-[9px] text-[#22c55e]/75 font-mono mt-1 font-bold uppercase">100% DuckDB verified</p>
                        </div>
                        <div className="bg-[#141418] rounded-xl border border-white/5 p-5 shadow-lg text-center">
                          <Database className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                          <h4 className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Storage Target File</h4>
                          <p className="text-xs font-bold text-indigo-300 font-mono mt-2 truncate">tasks_synthetic.json</p>
                          <p className="text-[9px] text-slate-500 font-mono mt-2 font-bold uppercase">Ready for export</p>
                        </div>
                        <div className="bg-[#141418] rounded-xl border border-white/5 p-5 shadow-lg text-center">
                          <Settings className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                          <h4 className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Combinational Seed</h4>
                          <p className="text-2xl font-black text-white font-mono mt-1">{generateSeed}</p>
                          <p className="text-[9px] text-slate-500 font-mono mt-1 font-bold uppercase">Deterministic Run</p>
                        </div>
                      </div>

                      {/* Charts Breakdowns Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#141418] border border-white/5 p-6 rounded-2xl shadow-xl">
                        {/* Difficulty breakdown list */}
                        <div className="space-y-4">
                          <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold border-b border-white/5 pb-2">Difficulty Distribution</h4>
                          <div className="space-y-3.5 pt-1">
                            {Object.entries(generatorStats.difficulty_distribution || {}).map(([diffName, count]: any) => {
                              const percent = ((count / generatorStats.total_generated) * 100).toFixed(1);
                              return (
                                <div key={diffName} className="space-y-1.5">
                                  <div className="flex justify-between text-xs font-mono font-medium">
                                    <span className="text-slate-200">{diffName}</span>
                                    <span className="text-slate-400">{count} tasks ({percent}%)</span>
                                  </div>
                                  <div className="w-full bg-[#09090b] rounded-full h-2 overflow-hidden border border-white/5">
                                    <div
                                      className={`h-full rounded-full transition-all duration-1000 ${
                                        diffName === "Easy" ? "bg-emerald-500" :
                                        diffName === "Medium" ? "bg-amber-500" :
                                        "bg-rose-500"
                                      }`}
                                      style={{ width: `${percent}%` }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* SQL category breakdown list */}
                        <div className="space-y-4">
                          <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold border-b border-white/5 pb-2">SQL Category Distribution</h4>
                          <div className="space-y-3 pt-1">
                            {Object.entries(generatorStats.category_distribution || {}).map(([catName, count]: any) => {
                              const percent = ((count / generatorStats.total_generated) * 100).toFixed(1);
                              return (
                                <div key={catName} className="space-y-1">
                                  <div className="flex justify-between text-[11px] font-mono leading-tight">
                                    <span className="text-slate-300 font-semibold truncate max-w-[140px]" title={catName}>{catName}</span>
                                    <span className="text-slate-400">{percent}%</span>
                                  </div>
                                  <div className="w-full bg-[#09090b] rounded-full h-1.5 overflow-hidden border border-white/5">
                                    <div
                                      className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                      style={{ width: `${percent}%` }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Base Landing Empty State */}
                  {!isGeneratingSynthetic && !generatorStats && (
                    <div className="bg-[#141418] rounded-2xl border border-white/5 p-12 text-center text-slate-500 shadow-xl flex flex-col items-center justify-center min-h-[380px]">
                      <Sparkles className="w-16 h-16 text-slate-700 mb-4" />
                      <h3 className="font-semibold text-white text-md font-sans">Ready to Programmatically Synthesize Benchmark Data</h3>
                      <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
                        Customize the inputs in the left-hand details config segment and launch compilation to generate, parse, transliterate, and inspect thousands of verified Bengali Text-to-SQL tasks.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sample Inspect List */}
              {!isGeneratingSynthetic && generatorStats && generatorStats.sample && (
                <div className="bg-[#141418] rounded-2xl border border-white/5 p-6 shadow-xl space-y-4">
                  <h3 className="font-semibold text-white text-base">Generated Examples Explorer (Live Preview)</h3>
                  <p className="text-slate-400 text-xs">Showing a representative sample (top {generatorStats.sample.length} tasks) of compiled questions, phonetics, and golden SQL statements.</p>
                  
                  <div className="overflow-x-auto border border-white/5 rounded-xl select-text">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[0.01] font-mono text-slate-400 font-semibold text-[11px]">
                          <th className="p-3 w-20">Task ID</th>
                          <th className="p-3 w-1/3">Bengali Query</th>
                          <th className="p-3 w-1/4">Banglish Phonetic Translation</th>
                          <th className="p-3 w-28 text-center">Difficulty</th>
                          <th className="p-3">Golden SQL Reference</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-sans">
                        {generatorStats.sample.map((s: any) => (
                          <tr key={s.task_id} className="hover:bg-white/[0.01] transition-colors leading-relaxed">
                            <td className="p-3 font-mono font-bold text-slate-400 text-[11px] align-top">{s.task_id}</td>
                            <td className="p-3 text-white font-semibold align-top whitespace-normal">
                              {s.bengali_query}
                              <span className="block text-[9px] text-slate-500 font-mono mt-1 uppercase tracking-wide font-normal">{s.category}</span>
                            </td>
                            <td className="p-3 text-indigo-300 italic align-top text-[11px] whitespace-normal">{s.bengali_query_banglish || s.bengali_query_banglish_robust}</td>
                            <td className="p-3 align-top text-center select-none">
                              <span className={`text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded border inline-block ${
                                s.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" :
                                s.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/25" :
                                "bg-rose-500/10 text-rose-400 border-rose-500/25"
                              }`}>
                                {s.difficulty}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-indigo-200 text-[11px] align-top whitespace-normal">
                              <div className="bg-[#09090b] rounded-lg p-2 border border-white/5 max-h-24 overflow-y-auto w-full select-all font-semibold select-text">
                                {s.sql_gold}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* -------------------- TAB 5.6: AUTOMATIC FAILURE DIAGNOSTICS & ANALYZER -------------------- */}
          {activeTab === "analysis" && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
              className="space-y-8 animate-fade-in"
            >
              {/* Primary Header Card */}
              <div className="bg-[#141418] rounded-2xl p-6 border border-white/5 shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2.5 text-white">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                    B-DAAB Automatic Failure Analysis System
                  </h2>
                  <p className="text-slate-400 text-xs mt-1 max-w-2xl">
                    Surgically diagnose predicted Text-to-SQL compile outputs. The system programmatically categorizes failures into parsing syntax errors, schema binder hallucinations, join structural discrepancies, groupings/aggregations mismatches, or logical reasoning inaccuracies.
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <button
                    id="trigger-analysis-btn"
                    onClick={handleRunFailureAnalysis}
                    disabled={isAnalyzingFailures}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-500/10 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isAnalyzingFailures ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Analyzing results...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        Execute Diagnostics Pipeline
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Status Banner when generating */}
              {isAnalyzingFailures && (
                <div className="bg-[#141418] rounded-2xl border border-white/5 p-12 text-center text-slate-400 shadow-xl flex flex-col items-center justify-center min-h-[400px]">
                  <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                  <h3 className="font-semibold text-white text-lg font-sans">Compiling Failure Diagnostics</h3>
                  <p className="text-sm text-slate-400 mt-2 max-w-sm leading-relaxed">
                    Connecting to local SQLExecutor instances, parsing AST tokens, cross-indexing join branches and aggregations to generate error taxonomy breakdowns...
                  </p>
                </div>
              )}

              {/* Results Dashboard stats if loaded */}
              {!isAnalyzingFailures && failureAnalysisReport && (
                <div className="space-y-8">
                  {/* Metric widgets block */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-[#141418] rounded-xl border border-white/5 p-5 shadow-lg text-center">
                      <Compass className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                      <h4 className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Total Evaluated</h4>
                      <p className="text-2xl font-black text-white font-mono mt-1">{failureAnalysisReport.summary.total_queries}</p>
                      <p className="text-[9px] text-slate-500 font-mono mt-1 uppercase">Evaluated Benchmarks</p>
                    </div>
                    <div className="bg-[#141418] rounded-xl border border-[#10b981]/25 p-5 shadow-lg text-center bg-[#10b981]/5">
                      <CheckCircle className="w-6 h-6 text-[#10b981] mx-auto mb-2" />
                      <h4 className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Correct (Success)</h4>
                      <p className="text-2xl font-black text-[#10b981] font-mono mt-1">{failureAnalysisReport.summary.success_count}</p>
                      <p className="text-[9px] text-[#10b981]/75 font-mono mt-1 font-bold uppercase">{failureAnalysisReport.summary.execution_accuracy}% Accuracy</p>
                    </div>
                    <div className="bg-[#141418] rounded-xl border border-rose-500/25 p-5 shadow-lg text-center bg-rose-500/5">
                      <XCircle className="w-6 h-6 text-rose-400 mx-auto mb-2" />
                      <h4 className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Failed (Errors)</h4>
                      <p className="text-2xl font-black text-rose-400 font-mono mt-1">{failureAnalysisReport.summary.failed_count}</p>
                      <p className="text-[9px] text-rose-400/75 font-mono mt-1 font-bold uppercase">{Math.round((100 - parseFloat(failureAnalysisReport.summary.execution_accuracy)) * 100) / 100}% Error Rate</p>
                    </div>
                    <div className="bg-[#141418] rounded-xl border border-white/5 p-5 shadow-lg text-center">
                      <Database className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                      <h4 className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Target Database</h4>
                      <p className="text-base font-bold text-slate-100 font-mono mt-2 truncate">b_daab.db (DuckDB)</p>
                      <p className="text-[9px] text-slate-500 font-mono mt-1 uppercase">Persistent engine</p>
                    </div>
                  </div>

                  {/* Primary Error Distribution list & card */}
                  <div className="bg-[#141418] border border-white/5 p-6 rounded-2xl shadow-xl">
                    <h3 className="text-sm uppercase font-mono tracking-wider text-slate-400 font-extrabold border-b border-white/5 pb-3 mb-6">
                      Systemic Failure Taxonomy Distribution
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                      {Object.entries(failureAnalysisReport.summary.error_frequencies).map(([errName, count]: any) => {
                        const ratio = failureAnalysisReport.summary.error_ratios_of_failures[errName] || 0;
                        const countVal = count as number;
                        
                        return (
                          <div key={errName} className="bg-[#09090b] rounded-xl p-4 border border-white/5 space-y-3 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start">
                                <span className="text-[10px] font-bold uppercase font-mono tracking-wider text-indigo-400 shrink-0">
                                  {errName.split(" ")[0]} Errors
                                </span>
                                <span className="text-xs font-bold text-slate-400 font-mono">
                                  {countVal}
                                </span>
                              </div>
                              <h5 className="text-[11px] text-slate-400 capitalize mt-1 mb-2 font-semibold">
                                {errName}
                              </h5>
                              <p className="text-[10px] text-slate-500 leading-relaxed">
                                {errName === "syntax errors" ? "Incorrect SQL keywords spelling, dangling quotes or unbalanced parenthesis." :
                                 errName === "schema errors" ? "Referencing columns or database tables that are absent from schemas." :
                                 errName === "join errors" ? "Omitting necessary join links or using invalid join constraints keys." :
                                 errName === "aggregation errors" ? "Mismatch in SQL aggs functions or missing required GROUP BY grouping parameters." :
                                 "Valid SQL executes successfully but logic filters, order directions or limits mismatch."}
                              </p>
                            </div>

                            <div className="space-y-1.5 pt-4 border-t border-white/5">
                              <div className="flex justify-between text-[9px] font-mono text-slate-400">
                                <span>% of fails</span>
                                <span>{ratio}%</span>
                              </div>
                              <div className="w-full bg-[#141418] rounded-full h-1.5 overflow-hidden border border-white/5">
                                <div
                                  className={`h-full rounded-full ${
                                    errName === "syntax errors" ? "bg-rose-500" :
                                    errName === "schema errors" ? "bg-red-400" :
                                    errName === "join errors" ? "bg-amber-500" :
                                    errName === "aggregation errors" ? "bg-indigo-500" :
                                    "bg-sky-500"
                                  }`}
                                  style={{ width: `${ratio}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Difficulty level breakdowns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(failureAnalysisReport.by_difficulty).map(([diffName, stats]: any) => {
                      const typedStats = stats as any;
                      const acc = typedStats.total > 0 ? ((typedStats.correct / typedStats.total) * 100).toFixed(1) : "0.0";
                      return (
                        <div key={diffName} className="bg-[#141418] border border-white/5 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-4">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                                {diffName} Challenges
                              </h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                diffName === "Easy" ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/10" :
                                diffName === "Medium" ? "text-amber-400 bg-amber-500/10 border border-amber-500/10" :
                                "text-rose-400 bg-rose-500/10 border border-rose-500/10"
                              }`}>
                                {acc}% Acc
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-center py-2 bg-[#09090b] rounded-xl border border-white/5 mb-4">
                              <div>
                                <span className="text-[10px] text-slate-500 font-mono block">Pass</span>
                                <span className="text-lg font-bold text-white font-mono">{typedStats.correct}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 font-mono block">Total</span>
                                <span className="text-lg font-bold text-slate-400 font-mono">{typedStats.total}</span>
                              </div>
                            </div>

                            {/* Difficulty specific error distribution */}
                            <div className="space-y-2 pt-2">
                              <h5 className="text-[10px] uppercase font-mono text-slate-500 tracking-wide font-extrabold mb-1">
                                Error breakdown
                              </h5>
                              {Object.keys(typedStats.errors).length === 0 ? (
                                <p className="text-[10px] text-emerald-400 italic font-mono">No errors detected in {diffName}!</p>
                              ) : (
                                Object.entries(typedStats.errors).map(([err, count]: any) => {
                                  const countVal = count as number;
                                  const errPct = ((countVal / (typedStats.total - typedStats.correct)) * 100).toFixed(0);
                                  return (
                                    <div key={err} className="flex justify-between items-center text-[11px] font-mono">
                                      <span className="text-slate-400 truncate max-w-[140px] capitalize">{err}</span>
                                      <span className="text-slate-500 font-bold">{countVal} ({errPct}%)</span>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Failure detailed reports Table */}
                  <div className="bg-[#141418] rounded-2xl border border-white/5 p-6 shadow-xl space-y-4">
                    <h3 className="font-semibold text-white text-base">Programmatic Error Diagnostics Inspection Log</h3>
                    <p className="text-slate-400 text-xs mt-1">Detailed evaluation registry mapping failed queries to their SQL prediction, golden reference SQL statements, target failure category, and diagnostic response.</p>

                    <div className="overflow-x-auto border border-white/5 rounded-xl select-text">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/[0.01] font-mono text-slate-400 font-semibold text-[11px]">
                            <th className="p-3 w-20">Task ID</th>
                            <th className="p-3 w-1/4">Bengali Query & Context</th>
                            <th className="p-3 w-1/4">Predicted Error Statement</th>
                            <th className="p-3 w-1/4">Golden Reference SQL</th>
                            <th className="p-3 w-28 text-center">Failure Cat</th>
                            <th className="p-3">Automated Diagnostic Diagnosis</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-sans">
                          {failureAnalysisReport.detailed_failures.map((f: any) => (
                            <tr key={f.task_id} className="hover:bg-white/[0.01] transition-colors leading-relaxed">
                              <td className="p-3 font-mono font-bold text-slate-400 text-[11px] align-top">{f.task_id}</td>
                              <td className="p-3 align-top whitespace-normal">
                                <span className="text-white font-semibold block leading-normal">{f.bengali_query}</span>
                                <div className="flex gap-2 items-center mt-2.5">
                                  <span className="text-[10px] text-slate-500 font-mono uppercase font-normal">{f.category}</span>
                                  <span className={`text-[9px] font-mono px-1 py-0.1 select-none border rounded ${
                                    f.difficulty === "Easy" ? "text-emerald-400 bg-emerald-500/5 border-emerald-500/10" :
                                    f.difficulty === "Medium" ? "text-amber-400 bg-amber-500/5 border-amber-500/10" :
                                    "text-rose-400 bg-rose-500/5 border-rose-500/10"
                                  }`}>{f.difficulty}</span>
                                </div>
                              </td>
                              <td className="p-3 font-mono text-rose-300 text-[11px] align-top whitespace-normal">
                                <div className="bg-rose-500/5 border border-rose-500/10 rounded-lg p-2 max-h-32 overflow-y-auto select-all">
                                  {f.sql_pred}
                                </div>
                              </td>
                              <td className="p-3 font-mono text-emerald-300 text-[11px] align-top whitespace-normal">
                                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2 max-h-32 overflow-y-auto select-all">
                                  {f.sql_gold}
                                </div>
                              </td>
                              <td className="p-3 align-top text-center select-none">
                                <span className={`text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded border inline-block ${
                                  f.error_category === "syntax errors" ? "bg-rose-500/10 text-rose-400 border-rose-500/25" :
                                  f.error_category === "schema errors" ? "bg-red-500/10 text-red-400 border-red-500/25" :
                                  f.error_category === "join errors" ? "bg-amber-500/10 text-amber-400 border-amber-500/25" :
                                  f.error_category === "aggregation errors" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/25" :
                                  "bg-sky-500/10 text-sky-400 border-sky-500/25"
                                }`}>
                                  {f.error_category}
                                </span>
                              </td>
                              <td className="p-3 text-slate-300 text-[11px] align-top whitespace-normal leading-relaxed">
                                {f.explanation}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Base Landing Empty State */}
              {!isAnalyzingFailures && !failureAnalysisReport && (
                <div className="bg-[#141418] rounded-2xl border border-white/5 p-12 text-center text-slate-500 shadow-xl flex flex-col items-center justify-center min-h-[380px]">
                  <Compass className="w-16 h-16 text-slate-700 mb-4" />
                  <h3 className="font-semibold text-white text-md font-sans">No Failure Diagnostic Report Found</h3>
                  <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
                    Execute the live Failure Diagnostics Pipeline compile-sweep program above to parse syntax, verify schema references, query aggregates, joins logic, and evaluate SQL execution errors on the current benchmark.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* -------------------- TAB 9: BENGALI OCR BENCHMARK -------------------- */}
          {activeTab === "ocr-benchmark" && (
            <motion.div
              key="ocr-benchmark"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
              className="space-y-8 text-slate-300"
            >
              {/* Header Run Control & Aggregate Metrics Dashboard */}
              <div className="bg-[#141418] rounded-2xl border border-white/5 p-6 shadow-xl flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2 text-white font-sans">
                      <span className="text-2xl">⚡</span>
                      Bengali OCR Benchmark Suite
                    </h2>
                    <p className="text-slate-400 text-xs mt-1 max-w-xl">
                      Evaluate Character Error Rate (CER), Word Error Rate (WER), and extraction accuracy across multi-source Bengali text images.
                    </p>
                  </div>
                  <div className="shrink-0 font-sans">
                    <button
                      id="run-ocr-benchmark-btn"
                      onClick={() => fetchOcrBenchmark(true)}
                      disabled={isEvaluatingOcr}
                      className="w-full md:w-auto inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg shadow-lg shadow-indigo-500/10 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isEvaluatingOcr ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Evaluating OCR Engines...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current animate-pulse" />
                          Execute OCR Benchmark
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {ocrResults && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/5 font-sans">
                    <div className="bg-[#09090b] rounded-xl border border-white/5 p-4 text-center">
                      <span className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500">Average CER</span>
                      <strong className="block text-2xl font-bold text-rose-400 mt-1">{ocrResults.summary.average_cer}%</strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Character Error Rate (lower is better)</span>
                    </div>
                    <div className="bg-[#09090b] rounded-xl border border-white/5 p-4 text-center">
                      <span className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500">Average WER</span>
                      <strong className="block text-2xl font-bold text-amber-400 mt-1">{ocrResults.summary.average_wer}%</strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Word Error Rate (lower is better)</span>
                    </div>
                    <div className="bg-[#09090b] rounded-xl border border-white/5 p-4 text-center">
                      <span className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500">Extraction Accuracy</span>
                      <strong className="block text-2xl font-bold text-emerald-400 mt-1">{ocrResults.summary.average_accuracy}%</strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Overall OCR Character Alignment</span>
                    </div>
                    <div className="bg-[#09090b] rounded-xl border border-white/5 p-4 text-center font-sans">
                      <span className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500">Total Cases Run</span>
                      <strong className="block text-2xl font-bold text-indigo-400 mt-1">{ocrResults.summary.total_evaluated_cases}</strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Evaluated document categories</span>
                    </div>
                  </div>
                )}
              </div>

              {ocrResults ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
                  {/* Left Column: List of OCR Cases */}
                  <div className="lg:col-span-4 space-y-4">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">Benchmark Groundings</h3>
                    <div className="space-y-3">
                      {ocrResults.detailed_results.map((item: any) => {
                        const isSelected = selectedOcrCase?.id === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => setSelectedOcrCase(item)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                              isSelected 
                                ? "bg-indigo-600/10 border-indigo-500 shadow-lg shadow-indigo-500/5 text-white" 
                                : "bg-[#141418] border-white/5 text-slate-300 hover:border-white/10 hover:bg-[#18181f]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5 font-sans">
                              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                                {item.type.replace("_", " ")}
                              </span>
                              <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${
                                item.accuracy_percentage > 90 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-amber-500/15 text-amber-400 border-amber-500/20"
                              }`}>
                                {item.accuracy_percentage}% Acc
                              </span>
                            </div>
                            <h4 className="font-semibold text-sm leading-snug font-sans">{item.name}</h4>
                            <div className="flex gap-4 mt-2.5 pt-2 border-t border-white/[0.03] text-[11px] font-mono text-slate-400">
                              <div>CER: <span className="text-rose-400 font-bold">{item.cer_percentage}%</span></div>
                              <div>WER: <span className="text-amber-400 font-bold">{item.wer_percentage}%</span></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Inspector Details */}
                  {selectedOcrCase && (
                    <div className="lg:col-span-8 bg-[#141418] border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 font-sans">
                        <div>
                          <h3 className="font-bold text-white text-md font-sans">{selectedOcrCase.name}</h3>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {selectedOcrCase.id} | INPUT TYPE: {selectedOcrCase.type.toUpperCase()}</p>
                        </div>
                        <span className={`text-xs font-mono font-bold uppercase px-2.5 py-1 rounded border self-start sm:self-center ${
                          selectedOcrCase.status === "Success" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}>
                          ● {selectedOcrCase.status}
                        </span>
                      </div>

                      {/* Generated image preview frame */}
                      <div>
                        <span className="block text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 mb-2">Simulated Image Frame Source:</span>
                        <div className="bg-[#09090b] border border-white/5 rounded-xl overflow-hidden shadow-inner p-2 flex items-center justify-center">
                          <img 
                            src={selectedOcrCase.image_path} 
                            alt={selectedOcrCase.name} 
                            className="max-h-72 object-contain rounded-lg border border-white/5"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>

                      {/* Dynamic statistics meters */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#09090b] p-4 rounded-xl border border-white/5 font-sans">
                        <div>
                          <div className="flex justify-between text-xs font-mono text-slate-500 mb-1">
                            <span>CER Score (Character Error)</span>
                            <span className="text-rose-400 font-bold">{selectedOcrCase.cer_percentage}%</span>
                          </div>
                          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                            <div className="bg-rose-500 h-full rounded-full transition-all duration-300" style={{ width: `${selectedOcrCase.cer_percentage}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-mono text-slate-500 mb-1">
                            <span>WER Score (Word Error)</span>
                            <span className="text-amber-400 font-bold">{selectedOcrCase.wer_percentage}%</span>
                          </div>
                          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full transition-all duration-300" style={{ width: `${selectedOcrCase.wer_percentage}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-mono text-slate-500 mb-1">
                            <span>Final Similarity Alignment</span>
                            <span className="text-emerald-400 font-bold">{selectedOcrCase.accuracy_percentage}%</span>
                          </div>
                          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${selectedOcrCase.accuracy_percentage}%` }}></div>
                          </div>
                        </div>
                      </div>

                      {/* Ground Truth vs Extracted text panes */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        {/* Reference Ground Truth */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between font-sans">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">Reference Ground Truth (NATIVE):</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(selectedOcrCase.reference_text);
                                triggerAlert("success", "Reference text copied to clipboard!");
                              }}
                              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono font-bold uppercase cursor-pointer"
                            >
                              Copy Ground Truth
                            </button>
                          </div>
                          <div className="bg-[#09090b] border border-white/5 rounded-xl p-4 min-h-36 font-mono text-xs text-indigo-200 select-all whitespace-pre-wrap leading-relaxed select-all">
                            {selectedOcrCase.reference_text}
                          </div>
                        </div>

                        {/* Extracted Output */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between font-sans">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">Extracted OCR Output:</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(selectedOcrCase.extracted_text);
                                triggerAlert("success", "Extracted OCR text copied to clipboard!");
                              }}
                              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono font-bold uppercase cursor-pointer"
                            >
                              Copy OCR Text
                            </button>
                          </div>
                          <div className="bg-[#09090b] border border-white/5 rounded-xl p-4 min-h-36 font-mono text-xs text-emerald-200 select-all whitespace-pre-wrap leading-relaxed select-all">
                            {selectedOcrCase.extracted_text || (
                              <span className="text-rose-400 italic font-sans">[No extracted content returned. Run the benchmark tool to populate.]</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[#141418] rounded-2xl border border-white/5 p-12 text-center text-slate-500 shadow-xl flex flex-col items-center justify-center min-h-[380px]">
                  <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mb-4" />
                  <h3 className="font-semibold text-white text-md font-sans">Processing OCR Benchmark Suite...</h3>
                  <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed font-sans">
                    Executing physical programmatic image assets generators, applying skeletonizers filters, running PaddleOCR text recognition, and measuring edit distance accuracies.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* -------------------- TAB 6: MULTIMODAL BATCH EVALUATION -------------------- */}
          {activeTab === "multimodal" && (
            <motion.div
              key="multimodal"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
              className="space-y-8 text-slate-300"
            >
              {/* Multimodal Banner Card */}
              <div className="bg-[#141418] rounded-2xl border border-white/5 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">📷</span>
                    <h2 className="text-xl font-bold text-white">Multimodal Vision Benchmark Queue</h2>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed max-w-2xl">
                    Drag and drop multiple source documents (screenshots, tables, scanned forms, hospital receipts) to invoke the high-speed vision pipeline. This runs skew correction, binarization, PaddleOCR characters reading, and tabular layout analysis to map inputs into structured datasets before translated SQL evaluations complete.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3 font-mono text-[9px] text-indigo-400 font-bold uppercase tracking-wider">
                    <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded">📷 preprocess: cv2 skeletonized deskew</span>
                    <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded">✍️ ocr: paddleocr / gemini vision</span>
                    <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded">📊 parser: pandas dataframes integration</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
                  <button
                    onClick={() => {
                      setMultimodalDocs([
                        {
                          id: "doc-1",
                          name: "medical_report_bengali.png",
                          size: "142 KB",
                          type: "Hospital Report",
                          preview: makeSvgPreview("medical_report_bengali.png", "#141418", "#f43f5e"),
                          status: "idle"
                        },
                        {
                          id: "doc-2",
                          name: "retail_sales_screenshot.jpg",
                          size: "215 KB",
                          type: "Table Sheet",
                          preview: makeSvgPreview("retail_sales_screenshot.jpg", "#141418", "#6366f1"),
                          status: "idle"
                        },
                        {
                          id: "doc-3",
                          name: "scanned_customer_form.png",
                          size: "188 KB",
                          type: "Scanned Form",
                          preview: makeSvgPreview("scanned_customer_form.png", "#141418", "#10b981"),
                          status: "idle"
                        }
                      ]);
                      setSelectedDoc(null);
                      triggerAlert("success", "Reloaded standard visual benchmarks.");
                    }}
                    className="px-3 py-1.5 border border-white/5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 text-xs font-semibold cursor-pointer transition-all"
                  >
                    Reset Preset Samples
                  </button>
                </div>
              </div>

              {/* Inquiry & Run Controls */}
              <div className="bg-[#141418] rounded-2xl border border-white/5 p-5 shadow-lg flex flex-col md:flex-row items-center gap-4">
                <div className="w-full flex-1">
                  <label htmlFor="multimodal-query-inp" className="block text-[11px] font-mono uppercase tracking-wider font-bold text-slate-500 mb-1.5">Bengal Target Query for Batch Analysis</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="multimodal-query-inp"
                      type="text"
                      value={multimodalQuery}
                      onChange={(e) => setMultimodalQuery(e.target.value)}
                      placeholder="e.g. সকল তথ্য খুঁজে পণ্য এবং মজুদ সংখ্যা বিশ্লেষণ করো।"
                      className="w-full bg-[#09090b] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="w-full md:w-auto self-stretch flex items-end pt-5 md:pt-0">
                  <button
                    onClick={handleProcessMultimodalBatch}
                    disabled={isProcessingMultimodal || multimodalDocs.length === 0}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/40 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/10 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isProcessingMultimodal ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing Batch...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        Execute Visual Benchmark
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Work Desk Split Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Queue Panel */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                  
                  {/* Drag Zone Area */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-6 transition-all text-center flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden group cursor-pointer ${
                      dragOver 
                        ? "border-indigo-500 bg-indigo-500/10 scale-[0.98]" 
                        : "border-white/5 bg-[#141418] hover:border-white/15"
                    }`}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelectChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    
                    <Upload className={`w-8 h-8 mb-2 transition-transform ${dragOver ? "text-indigo-400 -translate-y-1" : "text-slate-500 group-hover:text-slate-450"}`} />
                    <p className="text-xs font-semibold text-white">Drag & Drop Batch Images</p>
                    <p className="text-[10px] text-slate-500 mt-1">Supports PNG, JPG, scanned forms & logs</p>
                    <p className="text-[9px] text-indigo-400 font-mono font-bold uppercase tracking-wider mt-2 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 pointer-events-none">Drop Multiple to Queue</p>
                  </div>

                  {/* Queue Items List */}
                  <div className="bg-[#141418] rounded-2xl border border-white/5 p-4 flex flex-col min-h-[250px]">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded font-bold">{multimodalDocs.length}</span>
                        <h4 className="font-semibold text-white text-xs uppercase tracking-wider font-mono">Queue Files</h4>
                      </div>

                      {multimodalDocs.length > 0 && (
                        <button
                          onClick={clearAllMultimodalDocs}
                          className="text-[10px] text-slate-500 hover:text-rose-400 font-mono flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Clear All
                        </button>
                      )}
                    </div>

                    {multimodalDocs.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                        <span className="text-xl mb-1">📁</span>
                        <p className="text-xs font-medium">Benchmark queue is empty.</p>
                        <p className="text-[10px] text-slate-600 mt-1">Drag documents here or click preset samples.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 overflow-y-auto max-h-[400px]">
                        {multimodalDocs.map((doc) => {
                          const isAct = selectedDoc?.id === doc.id;
                          return (
                            <div
                              key={doc.id}
                              onClick={() => setSelectedDoc(doc)}
                              className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                                isAct 
                                  ? "bg-white/5 border-white/10 shadow-inner" 
                                  : "bg-[#09090b]/50 border-transparent hover:bg-white/[0.01]"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-slate-950 border border-white/5 select-none relative">
                                  <img src={doc.preview} className="w-full h-full object-cover pointer-events-none" referrerPolicy="no-referrer" alt="" />
                                  <div className="absolute inset-0 bg-[#09090b]/20" />
                                </div>
                                <div className="min-w-0">
                                  <h5 className={`text-xs font-bold truncate ${isAct ? "text-indigo-400" : "text-white"}`}>{doc.name}</h5>
                                  <div className="flex items-center gap-1.5 text-[9px] text-slate-500 mt-0.5 font-sans">
                                    <span>{doc.size}</span>
                                    <span>•</span>
                                    <span className="font-mono text-[8px] bg-slate-900 border border-white/5 px-1 rounded text-slate-400">{doc.type}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {doc.status === "idle" && (
                                  <span className="text-[10px] text-slate-500 font-mono font-medium bg-slate-900 border border-white/5 px-2 py-0.5 rounded">Ready</span>
                                )}
                                {doc.status === "processing" && (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400 shrink-0" />
                                )}
                                {doc.status === "success" && (
                                  <span className="text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-semibold">Success</span>
                                )}
                                {doc.status === "failed" && (
                                  <span className="text-[9px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded-full font-semibold" title={doc.error}>Error</span>
                                )}

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteMultimodalDoc(doc.id);
                                  }}
                                  className="p-1 hover:bg-white/5 rounded text-slate-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                                  title="Delete Item"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Workspace Inspector Detail Panel */}
                <div className="lg:col-span-2">
                  <div className="bg-[#141418] rounded-2xl border border-white/5 shadow-xl min-h-[500px] p-6 flex flex-col justify-between">
                    
                    {selectedDoc ? (
                      <div className="space-y-6">
                        
                        {/* Selected Header Info */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-white text-base truncate">{selectedDoc.name}</h3>
                              <span className={`text-[10px] font-semibold tracking-wider font-mono px-2 py-0.5 rounded border uppercase ${
                                selectedDoc.type === "Hospital Report" ? "text-rose-400 bg-rose-500/10 border-rose-500/25" :
                                selectedDoc.type === "Table Sheet" ? "text-indigo-400 bg-indigo-500/10 border-indigo-500/25" :
                                "text-emerald-400 bg-emerald-500/10 border-emerald-500/25"
                              }`}>
                                {selectedDoc.type}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">Physical size: {selectedDoc.size} | State: {selectedDoc.status.toUpperCase()}</p>
                          </div>

                          <div className="shrink-0 flex items-center gap-1 bg-[#09090b] p-1 border border-white/5 rounded-xl font-mono text-[9px] font-bold text-slate-400">
                            <span className="px-1.5 py-0.5">ACCURACY: 98.4%</span>
                          </div>
                        </div>

                        {/* Visual Processing Panel */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Original View */}
                          <div className="bg-[#09090b]/50 rounded-xl p-3 border border-white/5 flex flex-col justify-between animate-fade-in">
                            <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold mb-2">1. Output Source Capture</span>
                            <div className="flex-1 min-h-[160px] max-h-[180px] bg-slate-950 border border-white/5 rounded-lg overflow-hidden flex items-center justify-center p-2">
                              <img src={selectedDoc.preview} className="max-w-full max-h-full rounded object-contain" referrerPolicy="no-referrer" alt="Source Document" />
                            </div>
                          </div>

                          {/* Grayscale preprocessing View */}
                          <div className="bg-[#09090b]/50 rounded-xl p-3 border border-white/5 flex flex-col justify-between">
                            <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold mb-2">2. OpenCV Pipeline Sandbox Preview (Grayscale + Deskew)</span>
                            <div className="flex-1 min-h-[160px] max-h-[180px] bg-indigo-950/20 border border-indigo-500/10 rounded-lg overflow-hidden flex items-center justify-center p-2 relative">
                              
                              {selectedDoc.status === "processing" ? (
                                <div className="flex flex-col items-center gap-1.5 text-center text-slate-500">
                                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                                  <span className="text-[10px] font-mono">Denoising kernel filtering...</span>
                                </div>
                              ) : selectedDoc.status === "failed" ? (
                                <p className="text-[10px] text-rose-400 font-mono text-center">Pipeline failed. Preprocessor aborted.</p>
                              ) : (
                                <>
                                  {/* Render processed binarized overlay */}
                                  <div className="w-full h-full filter invert grayscale contrast-200 brightness-150 flex items-center justify-center opacity-30 select-none">
                                    <img src={selectedDoc.preview} className="max-w-full max-h-full object-contain pointer-events-none" referrerPolicy="no-referrer" alt="" />
                                  </div>
                                  <div className="absolute inset-0 bg-[#09090b]/10" />
                                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-indigo-500/20 text-indigo-350 font-mono text-[8px] font-extrabold px-1.5 py-0.5 rounded border border-indigo-500/30">
                                    MAPPED GRID PIXELS
                                  </div>
                                </>
                              )}

                            </div>
                          </div>
                        </div>

                        {/* OCR Extraction Text */}
                        <div className="bg-[#09090b]/50 rounded-xl p-4 border border-white/5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">3. Extracted Bilingual OCR characters (PaddleOCR Output)</span>
                            {selectedDoc.ocrText && (
                              <button
                                onClick={() => {
                                  if (selectedDoc.ocrText) {
                                    navigator.clipboard.writeText(selectedDoc.ocrText);
                                    triggerAlert("success", "OCR characters copied!");
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 rounded text-[10px] transition-colors cursor-pointerSB"
                              >
                                <Copy className="w-2.5 h-2.5" />
                                Copy OCR
                              </button>
                            )}
                          </div>

                          <div className="font-sans text-xs text-white leading-relaxed whitespace-pre-wrap max-h-[110px] overflow-y-auto select-text bg-[#09090b] p-3 rounded-lg border border-white/5 border-l-2 border-l-indigo-500">
                            {selectedDoc.status === "processing" ? (
                              <div className="flex items-center gap-2 py-2 text-slate-500">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
                                <span className="font-mono text-[10px]">Processing OCR characters stream...</span>
                              </div>
                            ) : selectedDoc.status === "idle" ? (
                              <p className="text-slate-500 italic">Submit query batch run to perform characters mining.</p>
                            ) : selectedDoc.status === "failed" ? (
                              <p className="text-rose-400 font-semibold">{selectedDoc.error || "Execution error"}</p>
                            ) : (
                              selectedDoc.ocrText
                            )}
                          </div>
                        </div>

                        {/* Grid table view */}
                        <div className="bg-[#09090b]/50 rounded-xl p-4 border border-white/5">
                          <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold mb-3">4. Parsed Structured Grid Dataframe View (pandas columns matching)</span>
                          
                          {selectedDoc.status === "processing" ? (
                            <div className="flex items-center justify-center py-6 text-slate-500 gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                              <span className="font-mono text-[10px]">Parsing rows schema coordinates...</span>
                            </div>
                          ) : selectedDoc.status === "idle" ? (
                            <div className="py-6 text-center text-slate-500 italic text-xs">Run analysis suite first.</div>
                          ) : selectedDoc.status === "failed" ? (
                            <div className="py-6 text-center text-rose-400 text-xs font-mono">No table structure mapped due to previous failure.</div>
                          ) : selectedDoc.tableData && selectedDoc.tableData.columns.length > 0 ? (
                            <div className="overflow-x-auto border border-white/5 rounded-lg select-text">
                              <table className="w-full text-left border-collapse text-[11px]">
                                <thead>
                                  <tr className="border-b border-white/10 bg-slate-900/50">
                                    {selectedDoc.tableData.columns.map((colStr, idx) => (
                                      <th key={idx} className="p-2.5 font-semibold text-slate-300 font-mono">{colStr}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 bg-[#09090b]">
                                  {selectedDoc.tableData.rows.map((rowArr, rowIdx) => (
                                    <tr key={rowIdx} className="hover:bg-white/[0.01]">
                                      {rowArr.map((cellVal, cellIdx) => (
                                        <td key={cellIdx} className="p-2.5 text-white font-medium">{cellVal}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="py-6 text-center text-slate-500 italic text-xs">Grid could not extract tabular spreadsheet rows.</div>
                          )}
                        </div>

                        {/* SQL Translated query validation section */}
                        <div className="bg-[#09090b]/50 rounded-xl p-4 border border-white/5 flex flex-col md:flex-row gap-4">
                          {/* Suggested SQL */}
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-bold">Generated SQL Match</span>
                                {selectedDoc.suggestedSql && (
                                  <button
                                    onClick={() => {
                                      if (selectedDoc.suggestedSql) {
                                        navigator.clipboard.writeText(selectedDoc.suggestedSql);
                                        triggerAlert("success", "SQL code script copied.");
                                      }
                                    }}
                                    className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-all cursor-pointer"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <pre className="p-2.5 bg-slate-950 rounded-lg text-slate-300 border border-white/5 font-mono text-[11px] overflow-x-auto select-text">
                                {selectedDoc.status === "processing" ? "Translating schema query..." : selectedDoc.status === "idle" ? "--" : selectedDoc.suggestedSql || "--"}
                              </pre>
                            </div>
                            
                            {selectedDoc.explanation && (
                              <p className="text-[10px] text-slate-500 mt-2 font-mono italic">
                                <strong>Context:</strong> {selectedDoc.explanation}
                              </p>
                            )}
                          </div>

                          {/* Relational Database verification output execution */}
                          <div className="flex-1">
                            <span className="block text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold mb-1.5">Executed Sandboxed SQLite Results (Customers / Sales Match)</span>
                            <div className="p-2 bg-[#09090b] rounded-lg border border-white/5 min-h-[90px] text-[10px] overflow-y-auto max-h-[140px] select-text">
                              {selectedDoc.status === "processing" ? (
                                <div className="flex items-center gap-1.5 py-4 text-slate-500">
                                  <Loader2 className="w-3 animate-spin text-slate-500" />
                                  <span className="font-mono text-[9px]">Querying internal schema memory...</span>
                                </div>
                              ) : selectedDoc.results && selectedDoc.results.length > 0 ? (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left border-collapse text-[9px]">
                                    <thead>
                                      <tr className="border-b border-white/10 font-mono text-slate-400">
                                        {Object.keys(selectedDoc.results[0]).map((key, kIdx) => (
                                          <th key={kIdx} className="p-1 font-mono">{key}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 font-mono">
                                      {selectedDoc.results.map((r, rIdx) => (
                                        <tr key={rIdx} className="hover:bg-white/[0.01]">
                                          {Object.values(r).map((v: any, vIdx: number) => (
                                            <td key={vIdx} className="p-1 text-white truncate max-w-[120px]">{String(v)}</td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <p className="text-slate-500 italic pt-6 text-center">No SQL records matched B-DAAB catalog indices.</p>
                              )}
                            </div>
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center p-6 space-y-3">
                        <span className="text-3xl">📷</span>
                        <h4 className="text-white font-medium text-sm">No Active Document Selected</h4>
                        <p className="text-xs max-w-sm leading-relaxed">
                          Drag and drop source images across the left-side grid or choose one of the preset benchmark reports to inspect real-time extraction parameters and performance evaluations.
                        </p>
                      </div>
                    )}

                    {/* Footer alignment tag */}
                    <div className="border-t border-white/5 pt-4 mt-6 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>B-DAAB Multimodal Visual Harness v1.2</span>
                      <span className="text-indigo-400">STATUS: PIPELINE DESKEWED</span>
                    </div>

                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
