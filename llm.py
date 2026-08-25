import os
import sys
import ollama
target_dir = os.path.join(os.path.dirname(__file__), "backend", "rag")
if target_dir not in sys.path:
    sys.path.insert(0, target_dir)

from llm import main

if __name__ == "__main__":
    main()
