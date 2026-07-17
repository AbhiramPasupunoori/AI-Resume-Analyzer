import re
from decimal import Decimal, ROUND_HALF_UP
from functools import lru_cache

import numpy as np
from django.conf import settings
from sentence_transformers import SentenceTransformer


MODEL_NAME = getattr(
    settings,
    "SENTENCE_TRANSFORMER_MODEL",
    "sentence-transformers/all-MiniLM-L6-v2",
)


class SemanticSimilarityError(Exception):
    """Raised when semantic similarity cannot be calculated."""


@lru_cache(maxsize=1)
def get_similarity_model() -> SentenceTransformer:
    """
    Load the Sentence Transformer model once and reuse it.

    The lru_cache prevents the application from loading a new copy
    of the model for every analysis request.
    """

    try:
        return SentenceTransformer(MODEL_NAME)

    except Exception as error:
        raise SemanticSimilarityError(
            "The semantic-similarity model could not be loaded."
        ) from error


def normalize_text(text: str) -> str:
    """Normalize whitespace before creating embeddings."""

    if not text:
        return ""

    text = text.replace("\x00", " ")
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def split_text_into_chunks(
    text: str,
    maximum_words: int = 150,
) -> list[str]:
    """
    Split a long resume or job description into smaller chunks.

    Each chunk is encoded separately. The chunk embeddings are then
    averaged into one document-level embedding.
    """

    normalized_text = normalize_text(text)

    if not normalized_text:
        return []

    words = normalized_text.split()

    return [
        " ".join(
            words[index:index + maximum_words]
        )
        for index in range(
            0,
            len(words),
            maximum_words,
        )
    ]


def create_document_embedding(
    text: str,
) -> np.ndarray:
    """
    Create one normalized embedding for a complete document.
    """

    chunks = split_text_into_chunks(text)

    if not chunks:
        raise SemanticSimilarityError(
            "Cannot create an embedding from empty text."
        )

    model = get_similarity_model()

    try:
        chunk_embeddings = model.encode(
            chunks,
            convert_to_numpy=True,
            normalize_embeddings=True,
            show_progress_bar=False,
        )

    except Exception as error:
        raise SemanticSimilarityError(
            "The document embedding could not be created."
        ) from error

    document_embedding = np.mean(
        chunk_embeddings,
        axis=0,
    )

    embedding_length = np.linalg.norm(
        document_embedding
    )

    if embedding_length == 0:
        raise SemanticSimilarityError(
            "The generated document embedding was empty."
        )

    return document_embedding / embedding_length


def calculate_semantic_similarity(
    resume_text: str,
    job_description_text: str,
) -> dict[str, float]:
    """
    Calculate semantic similarity between a resume and job description.

    Returns:
        similarity: decimal between 0 and 1
        percentage: percentage between 0 and 100
    """

    if not normalize_text(resume_text):
        raise SemanticSimilarityError(
            "The resume text is empty."
        )

    if not normalize_text(job_description_text):
        raise SemanticSimilarityError(
            "The job-description text is empty."
        )

    resume_embedding = create_document_embedding(
        resume_text
    )

    job_embedding = create_document_embedding(
        job_description_text
    )

    similarity = float(
        np.dot(
            resume_embedding,
            job_embedding,
        )
    )

    # Cosine similarity can theoretically be negative.
    # For this scoring system, keep the result between 0 and 1.
    similarity = max(
        0.0,
        min(similarity, 1.0),
    )

    return {
        "similarity": round(similarity, 4),
        "percentage": round(
            similarity * 100,
            2,
        ),
    }


def calculate_semantic_score(
    similarity: float,
) -> Decimal:
    """
    Convert similarity from 0–1 into a score out of 25.

    Example:
        0.80 similarity = 20 out of 25.
    """

    bounded_similarity = max(
        0.0,
        min(float(similarity), 1.0),
    )

    score = (
        Decimal(str(bounded_similarity))
        * Decimal("25")
    )

    return score.quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )