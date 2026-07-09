import re

# Maximum length for a single ingredient name
MAX_INGREDIENT_LENGTH = 100

# Patterns that indicate prompt injection attempts
INJECTION_PATTERNS = [
    r'(?i)\b(ignore|disregard|forget)\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|rules?)\b',
    r'(?i)\b(system|assistant|user)\s*:\s*',
    r'(?i)\boutput\s*:\s*',
    r'(?i)\bnew\s+instructions?\s*:',
    r'(?i)\]\s*\(.*?\)',  # Markdown link injection
    r'(?i)\boverride\b',
    r'(?i)\byou\s+are\s+now\b',
    r'(?i)\bpretend\b',
    r'(?i)\bact\s+as\b',
]

def sanitize_ingredient(ingredient: str) -> str:
    """
    Sanitizes a single ingredient name to prevent prompt injection.
    
    - Strips whitespace
    - Truncates to MAX_INGREDIENT_LENGTH
    - Removes/escapes characters that break string formatting
    - Flags potential injection patterns
    """
    if not ingredient or not isinstance(ingredient, str):
        return ""
    
    # Strip and truncate
    ingredient = ingredient.strip()
    if len(ingredient) > MAX_INGREDIENT_LENGTH:
        ingredient = ingredient[:MAX_INGREDIENT_LENGTH]
    
    # Remove curly braces to prevent .format() breakage
    ingredient = ingredient.replace("{", "(").replace("}", ")")
    
    # Check for injection patterns and sanitize
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, ingredient):
            # Replace suspicious content with safe placeholder
            ingredient = re.sub(pattern, "[removed]", ingredient, flags=re.IGNORECASE)
    
    return ingredient


def sanitize_ingredient_list(ingredients: list[str]) -> list[str]:
    """
    Sanitizes a full list of ingredient names.
    Returns cleaned list with empty/invalid entries removed.
    """
    if not ingredients:
        return []
    
    cleaned = []
    for ing in ingredients:
        sanitized = sanitize_ingredient(ing)
        if sanitized:  # Skip empty/fully-sanitized entries
            cleaned.append(sanitized)
    
    return cleaned


def sanitize_user_text(text: str, max_length: int = 5000) -> str:
    """
    Sanitizes free-form user text (e.g., from voice transcription).
    Removes curly braces and truncates.
    """
    if not text:
        return ""
    
    text = text.strip()
    if len(text) > max_length:
        text = text[:max_length]
    
    # Remove curly braces
    text = text.replace("{", "(").replace("}", ")")
    
    return text
