#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
B-DAAB: Bengali Data Agent Benchmark - Automatic Model Leaderboard & Ranking System
Root Proxy wrapper that calls the main eval/leaderboard.py logic.
"""

import os
import sys

# Prepend current dir to sys.path to enable smooth evaluations
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

# Import and execute the central leaderboard system
from eval.leaderboard import main

if __name__ == "__main__":
    main()
