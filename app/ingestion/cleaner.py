"""Conservative text cleaning for extracted document pages and sections."""

import re
import unicodedata


class TextCleaner:
    """Provides conservative, syntax-preserving text normalization for RAG ingestion."""

    # Matches control characters except newline (\n), carriage return (\r), and tab (\t)
    CONTROL_CHAR_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
    
    # Matches Unicode Private Use Area characters (e.g. \uf0b7 bullet point artifacts from PDFs)
    PRIVATE_USE_RE = re.compile(r"[\ue000-\uf8ff]")
    
    # Matches words broken across line ends (e.g. 'archi-\ntecture' -> 'architecture')
    HYPHENATION_RE = re.compile(r"(\w+)-\n(\w+)")
    
    # Matches 3 or more consecutive newlines
    MULTIPLE_NEWLINES_RE = re.compile(r"\n{3,}")
    
    # Matches multiple horizontal whitespace (spaces/tabs) on the same line
    HORIZONTAL_WHITESPACE_RE = re.compile(r"[^\S\r\n]{2,}")

    @classmethod
    def clean(cls, text: str) -> str:
        """Cleans and normalizes extracted text conservatively.
        
        Args:
            text: Raw extracted text string.
            
        Returns:
            Normalized clean string.
        """
        if not text:
            return ""

        # 1. Normalize unicode characters (NFKC)
        cleaned = unicodedata.normalize("NFKC", text)

        # 2. Replace private use area characters (like \uf0b7) with standard bullet/space
        cleaned = cls.PRIVATE_USE_RE.sub("• ", cleaned)

        # 3. Remove null bytes and non-printable control characters
        cleaned = cls.CONTROL_CHAR_RE.sub("", cleaned)

        # 4. Standardize carriage returns to standard newlines
        cleaned = cleaned.replace("\r\n", "\n").replace("\r", "\n")

        # 5. Repair line-break hyphenations commonly found in PDFs
        cleaned = cls.HYPHENATION_RE.sub(r"\1\2", cleaned)

        # 6. Compress multiple horizontal spaces without destroying single indentation or newlines
        lines = cleaned.split("\n")
        cleaned_lines = [cls.HORIZONTAL_WHITESPACE_RE.sub(" ", line).strip() for line in lines]
        cleaned = "\n".join(cleaned_lines)

        # 7. Reduce 3+ consecutive newlines down to 2 to preserve paragraph boundaries
        cleaned = cls.MULTIPLE_NEWLINES_RE.sub("\n\n", cleaned)

        return cleaned.strip()
