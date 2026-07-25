import base64


def detect_image_mime_type(file_buffer: bytes) -> str:
    """Detect common image formats from their file signature."""
    if file_buffer.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if file_buffer.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if file_buffer.startswith(b"RIFF") and file_buffer[8:12] == b"WEBP":
        return "image/webp"
    if file_buffer.startswith(b"BM"):
        return "image/bmp"
    return "image/jpeg"


def encode_image_to_base64(file_buffer: bytes, mime_type: str | None = None) -> str:
    """
    Encodes binary image data to a Base64 string suitable for data URIs.
    """
    mime_type = mime_type or detect_image_mime_type(file_buffer)
    base64_str = base64.b64encode(file_buffer).decode("utf-8")
    return f"data:{mime_type};base64,{base64_str}"
