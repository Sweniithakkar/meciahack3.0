def create_chunks(text, chunk_size=1000, overlap=200):
    """
    Split large text into smaller overlapping chunks.

    chunk_size = maximum characters in each chunk
    overlap = characters repeated between consecutive chunks
    """
    chunks = []
    if not text:
        return chunks

    start = 0
    text_len = len(text)

    while start < text_len:
        end = start + chunk_size
        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start += chunk_size - overlap

    return chunks


if __name__ == "__main__":
    sample_text = """
    This is a sample legal document.
    It contains information about the agreement,
    termination, payment, notice period and liabilities.
    """

    chunks = create_chunks(sample_text)

    print("\n========== CHUNKS ==========\n")
    for i, chunk in enumerate(chunks, start=1):
        print(f"--- Chunk {i} ---")
        print(chunk)
        print()
