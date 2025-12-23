import pdfplumber

with pdfplumber.open("AI Agency Brief.pdf") as pdf:
    with open("pdf_content.txt", "w", encoding="utf-8") as f:
        for i, page in enumerate(pdf.pages):
            f.write(f"\n=== PAGE {i+1} ===\n\n")
            text = page.extract_text()
            if text:
                f.write(text)
                f.write("\n")
print("Content saved to pdf_content.txt")
