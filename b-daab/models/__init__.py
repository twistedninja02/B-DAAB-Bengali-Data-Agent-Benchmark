from models.base_model import BaseSQLModel
from models.gemini_model import GeminiSQLModel
from models.gpt_model import GPTSQLModel
from models.claude_model import ClaudeSQLModel
from models.huggingface_model import HuggingFaceSQLModel

def get_model(provider_name: str, model_name: str = None) -> BaseSQLModel:
    p = provider_name.lower().strip()
    if p == "gemini":
        return GeminiSQLModel(model_name or "gemini-3.5-flash")
    elif p in ["gpt", "openai"]:
        return GPTSQLModel(model_name or "gpt-4o")
    elif p in ["claude", "anthropic"]:
        return ClaudeSQLModel(model_name or "claude-3-5-sonnet-20241022")
    elif p in ["huggingface", "local", "hf"]:
        return HuggingFaceSQLModel(model_name or "Qwen/Qwen1.5-0.5B-Chat")
    else:
        raise ValueError(f"Unknown provider: {provider_name}. Choose from: gemini, gpt, claude, huggingface.")
