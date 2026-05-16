import sys

def extract_pdf_text(filepath):
    try:
        import PyPDF2
        with open(filepath, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
    except ImportError:
        pass
    return "Error"

if __name__ == "__main__":
    if len(sys.argv) > 1:
        text = extract_pdf_text(sys.argv[1])
        with open('pdf_output.txt', 'w', encoding='utf-8') as f:
            f.write(text)
    else:
        print("Usage: python read_pdf.py <filepath>")
