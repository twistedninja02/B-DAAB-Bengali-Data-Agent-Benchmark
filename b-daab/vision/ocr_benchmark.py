#!/usr/bin/env python3
import sys
import os
import json
import argparse
from datetime import datetime

try:
    import numpy as np
except ImportError:
    np = None

try:
    import cv2
except ImportError:
    cv2 = None

# Adjust python paths to allow importing from brother/parent directories
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from vision.ocr import BengaliMultimodalOCR

def levenshtein_distance(seq1, seq2):
    """Generic Levenshtein edit distance for characters or word tokens."""
    if len(seq1) < len(seq2):
        return levenshtein_distance(seq2, seq1)
    if len(seq2) == 0:
        return len(seq1)
    
    previous_row = range(len(seq2) + 1)
    for i, c1 in enumerate(seq1):
        current_row = [i + 1]
        for j, c2 in enumerate(seq2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
        
    return previous_row[-1]

def calculate_cer(predicted: str, reference: str) -> float:
    """Calculates Character Error Rate (CER)."""
    p = "".join(predicted.split())
    r = "".join(reference.split())
    if not r:
        return 0.0 if not p else 1.0
    dist = levenshtein_distance(p, r)
    return min(1.0, dist / len(r))

def calculate_wer(predicted: str, reference: str) -> float:
    """Calculates Word Error Rate (WER)."""
    p_words = predicted.strip().split()
    r_words = reference.strip().split()
    if not r_words:
        return 0.0 if not p_words else 1.0
    dist = levenshtein_distance(p_words, r_words)
    return min(1.0, dist / len(r_words))

def generate_mock_image(img_type: str, filepath: str) -> str:
    """
    Generates programmatic high-contrast PNG files containing structured bounding boxes
    and layouts mimicking native scanned forms, screenshots and generic images.
    """
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    if np is None or cv2 is None:
        print(f"[OCR Benchmark] Drawing disabled (numpy/cv2 missing). Generating 1x1 minimal transparent fallback PNG for task: {img_type}")
        import base64
        # Clean 1x1 transparent placeholder png
        minimal_png_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        with open(filepath, "wb") as f:
            f.write(base64.b64decode(minimal_png_b64))
        return filepath

    # 800x600 high contrast image
    img = np.ones((600, 800, 3), dtype=np.uint8) * 245 # Off-white background
    
    if img_type == "scanned_form":
        # Draw a tabular/form layout
        cv2.rectangle(img, (50, 50), (750, 550), (45, 45, 45), 2)
        # Header separator
        cv2.line(img, (50, 120), (750, 120), (45, 45, 45), 2)
        # Title box
        cv2.rectangle(img, (250, 20), (550, 70), (80, 80, 240), -1)
        # Table columns lines
        cv2.line(img, (350, 120), (350, 550), (120, 120, 120), 1)
        cv2.line(img, (550, 120), (550, 550), (120, 120, 120), 1)
        
    elif img_type == "screenshot":
        # Draw a modern mobile UI mockup
        # Outer screen frame
        cv2.rectangle(img, (200, 20), (600, 580), (85, 85, 95), 4)
        # Simulated Status Bar
        cv2.rectangle(img, (200, 20), (600, 55), (200, 200, 200), -1)
        cv2.circle(img, (230, 38), 6, (100, 100, 100), -1) # Camera hole
        # Battery indicators
        cv2.rectangle(img, (550, 30), (580, 45), (60, 200, 60), -1)
        # Dynamic search bar or buttons
        cv2.rectangle(img, (240, 100), (560, 150), (225, 225, 230), -1)
        cv2.rectangle(img, (240, 200), (560, 300), (255, 255, 255), -1)
        
    else: # general image
        # Draw scenic bounding vectors
        cv2.rectangle(img, (100, 80), (700, 520), (180, 100, 40), 3)
        # Banner background
        cv2.rectangle(img, (120, 180), (680, 300), (255, 220, 220), -1)

    # Output text tags to avoid empty artifacts
    font = cv2.FONT_HERSHEY_SIMPLEX
    cv2.putText(img, f"B-DAAB {img_type.upper()} WORKSPACE", (60, 40) if img_type != "screenshot" else (220, 90), font, 0.6, (50, 50, 50), 2)
    
    cv2.imwrite(filepath, img)
    return filepath

def main():
    parser = argparse.ArgumentParser(description="B-DAAB Multimodal Bengali OCR Benchmark Evaluation Runner")
    parser.add_argument("--action", type=str, default="run", choices=["run", "export-json"], help="Benchmark execution control task")
    parser.add_argument("--output", type=str, default=None, help="Output metrics json filepath")
    args = parser.parse_args()

    # Define standard Bengali OCR grounding test cases (Image, Scanned Form, Screenshot)
    benchmark_tasks = [
        {
            "id": "ocr-case-01",
            "name": "Standard Scanned Billing Form (মুদ্রিত রসিদ)",
            "type": "scanned_form",
            "filename": "scanned_form_sample.png",
            "reference_text": (
                "Name: Abul Kalam (গ্রাহকের নাম: আবুল কালাম)\n"
                "City: Dhaka (শহর: ঢাকা)\n"
                "Tier: Premium (টায়ার: প্রিমিয়াম)\n"
                "Bought Products: Keyboard, Hub (ক্রয়কৃত পণ্য: কিবোর্ড, হাব)\n"
                "Subtotal amount: 28,500 Taka (মোট পরিশোধিত মূল্য: ২৮,৫০০ টাকা)\n"
                "Transaction ID: TXN8876"
            )
        },
        {
            "id": "ocr-case-02",
            "name": "E-Commerce App Interface Screenshot (অ্যাপ চিত্র)",
            "type": "screenshot",
            "filename": "screenshot_sample.png",
            "reference_text": (
                "Name: Abul Kalam (গ্রাহকের নাম: আবুল কালাম)\n"
                "City: Dhaka (শহর: ঢাকা)\n"
                "Tier: Premium (টায়ার: প্রিমিয়াম)\n"
                "Bought Products: Keyboard, Hub (ক্রয়কৃত পণ্য: কিবোর্ড, হাব)\n"
                "Subtotal amount: 28,500 Taka (মোট পরিশোধিত মূল্য: ২৮,৫০০ টাকা)\n"
                "Transaction ID: TXN8876"
            )
        },
        {
            "id": "ocr-case-03",
            "name": "Scenic Handheld Camera Capture (ক্যামেরা চিত্র)",
            "type": "image",
            "filename": "image_sample.png",
            "reference_text": (
                "Name: Abul Kalam (গ্রাহকের নাম: আবুল কালাম)\n"
                "City: Dhaka (শহর: ঢাকা)\n"
                "Tier: Premium (টায়ার: প্রিমিয়াম)\n"
                "Bought Products: Keyboard, Hub (ক্রয়কৃত পণ্য: কিবোর্ড, হাব)\n"
                "Subtotal amount: 28,500 Taka (মোট পরিশোধিত মূল্য: ২৮,৫০০ টাকা)\n"
                "Transaction ID: TXN8876"
            )
        }
    ]

    assets_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "ocr_benchmark_assets")
    os.makedirs(assets_dir, exist_ok=True)

    print("=========================================================================")
    print(" B-DAAB BENGALI MULTIMODAL OCR EVALUATION SUITE RUNNER")
    print("=========================================================================")
    
    ocr_engine = BengaliMultimodalOCR()
    results = []
    
    total_cer = 0.0
    total_wer = 0.0
    total_acc = 0.0

    for task in benchmark_tasks:
        image_path = os.path.join(assets_dir, task["filename"])
        
        # 1. Generate PNG files directly to guarantee physical presence
        generate_mock_image(task["type"], image_path)
        
        print(f"\n[Running] ID: {task['id']} | Category: {task['type'].upper()} | {task['name']}")
        print(f" -> Source asset path: {image_path}")
        
        # 2. Extract Text via Multimodal OCR Engine
        try:
            extracted = ocr_engine.extract_text(image_path)
        except Exception as ex:
            print(f"[-] Critical extraction error: {ex}")
            extracted = ""

        # 3. Assess Error rates
        cer = calculate_cer(extracted, task["reference_text"])
        wer = calculate_wer(extracted, task["reference_text"])
        acc = max(0.0, 1.0 - cer) # Character similarity base accuracy

        total_cer += cer
        total_wer += wer
        total_acc += acc

        results.append({
            "id": task["id"],
            "name": task["name"],
            "type": task["type"],
            "image_path": f"/api/ocr-assets/{task['filename']}",
            "reference_text": task["reference_text"],
            "extracted_text": extracted,
            "cer_percentage": round(cer * 100, 2),
            "wer_percentage": round(wer * 100, 2),
            "accuracy_percentage": round(acc * 100, 2),
            "status": "Success" if acc > 0.8 else "Variance Flagged"
        })

        print(f" -> Character Error Rate (CER): {cer * 100:.2f}%")
        print(f" -> Word Error Rate (WER):      {wer * 100:.2f}%")
        print(f" -> Extraction Similarity:       {acc * 100:.2f}%")

    num_tasks = len(benchmark_tasks)
    avg_cer = total_cer / num_tasks
    avg_wer = total_wer / num_tasks
    avg_acc = total_acc / num_tasks

    summary = {
        "total_evaluated_cases": num_tasks,
        "average_cer": round(avg_cer * 100, 2),
        "average_wer": round(avg_wer * 100, 2),
        "average_accuracy": round(avg_acc * 100, 2),
        "execution_timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    payload = {
        "summary": summary,
        "detailed_results": results
    }

    # Write summary status to data directory permanently
    out_file = args.output
    if not out_file:
        out_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "ocr_benchmark_results.json")
    
    try:
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)
        print(f"\n[+] Successfully persisted OCR Scorecard database results: {out_file}")
    except Exception as io_err:
        print(f"[-] Could not write outputs: {io_err}")

    # Write standard delimiters for simple server stdout parsing
    print("\nOCR_BENCHMARK_RAW_JSON_START")
    print(json.dumps(payload, ensure_ascii=False))
    print("OCR_BENCHMARK_RAW_JSON_END")

if __name__ == "__main__":
    main()
