# app.py
from flask import Flask, request, render_template, jsonify
import os
from werkzeug.utils import secure_filename
import PyPDF2  # Changed from fitz to PyPDF2
import google.generativeai as genai
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
import tempfile
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Google Generative AI
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Create uploads folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize global variables for conversation chain
conversation_chain = None
chat_history = []

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() == 'pdf'

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF file in chunks of 2-3 pages"""
    with open(pdf_path, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        page_chunks = []
        
        # Process PDF in chunks of 3 pages
        chunk_size = 3
        num_pages = len(reader.pages)
        for i in range(0, num_pages, chunk_size):
            chunk_text = ""
            end_idx = min(i + chunk_size, num_pages)
            
            for page_num in range(i, end_idx):
                page = reader.pages[page_num]
                chunk_text += page.extract_text()
            
            if chunk_text.strip():
                page_chunks.append({
                    "text": chunk_text,
                    "pages": f"{i+1}-{end_idx}"
                })
        
    return page_chunks

def process_pdf_with_langchain(pdf_chunks):
    """Process PDF chunks using LangChain and create a vector store"""
    # Text splitter for creating smaller chunks for embedding
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=100
    )
    
    # Process all chunks
    all_texts = []
    for chunk in pdf_chunks:
        texts = text_splitter.split_text(chunk["text"])
        all_texts.extend(texts)
    
    # Create embeddings using the 384-dimensional model
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        google_api_key=GOOGLE_API_KEY
    )
    
    # Create vector store from the chunks
    vector_store = FAISS.from_texts(all_texts, embeddings)
    
    return vector_store

def setup_conversation_chain(vector_store):
    """Set up the RAG conversation chain"""
    global conversation_chain, chat_history
    
    # Initialize the LLM
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-pro",
        google_api_key=GOOGLE_API_KEY,
        temperature=0.2
    )
    
    # Create memory for conversation history
    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True
    )
    
    # Create the conversation chain
    conversation_chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=vector_store.as_retriever(search_kwargs={"k": 3}),
        memory=memory
    )
    
    chat_history = []

def extract_financial_terms(text_chunk):
    """Extract financial terms from a chunk of text using Gemini"""
    model = genai.GenerativeModel('gemini-1.5-pro')
    
    prompt = f"""
    Extract key financial terms, metrics, and important information from the following text.
    Organize them into categories like financial metrics, regulatory terms, industry-specific terminology, etc.
    Focus only on extracting financial and business-relevant terminology:
    
    TEXT:
    {text_chunk}
    """
    
    response = model.generate_content(prompt)
    return response.text

def summarize_document(pdf_chunks):
    """Generate a summary of the entire document using Gemini"""
    # Combine all chunks into a condensed representation
    combined_text = "\n\n".join([f"Pages {chunk['pages']}: " + chunk['text'][:500] + "..." for chunk in pdf_chunks])
    
    model = genai.GenerativeModel('gemini-1.5-pro')
    
    prompt = f"""
    Summarize this financial document, highlighting key points, financial metrics, trends, and important 
    information. Focus on extracting the most crucial financial insights and presenting them clearly:
    
    DOCUMENT:
    {combined_text}
    """
    
    response = model.generate_content(prompt)
    return response.text


@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Process the PDF
        try:
            pdf_chunks = extract_text_from_pdf(file_path)
            
            # Extract financial terms from each chunk
            results = []
            for chunk in pdf_chunks:
                financial_terms = extract_financial_terms(chunk["text"])
                results.append({
                    "pages": chunk["pages"],
                    "financial_terms": financial_terms
                })
            
            # Create vector store for RAG
            vector_store = process_pdf_with_langchain(pdf_chunks)
            
            # Set up conversation chain for RAG
            setup_conversation_chain(vector_store)
            
            # Generate overall summary
            summary = summarize_document(pdf_chunks)
            
            return jsonify({
                'success': True,
                'filename': filename,
                'chunks_processed': len(pdf_chunks),
                'results': results,
                'summary': summary
            })
        
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/query', methods=['POST'])
def query_document():
    global conversation_chain, chat_history
    
    if not conversation_chain:
        return jsonify({'error': 'No document has been processed yet'}), 400
    
    data = request.json
    query = data.get('query')
    
    if not query:
        return jsonify({'error': 'No query provided'}), 400
    
    try:
        # Process the query using the RAG system
        response = conversation_chain({"question": query, "chat_history": chat_history})
        
        # Update chat history
        chat_history.append((query, response["answer"]))
        
        return jsonify({
            'success': True,
            'query': query,
            'response': response["answer"],
            'sources': response.get("source_documents", [])
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True,port=5001)