import React, { useState } from 'react';
import axios from 'axios';

const UploadPdf = () => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please upload a valid PDF file.');
      setFile(null);
    }
  };

  const handleProcess = async () => {
    if (!file) {
      setError('Please select a PDF file to upload.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://127.0.0.1:5001/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setResults(response.data);
      } else {
        setError('Failed to process the PDF file.');
      }
    } catch (err) {
      console.error('Error processing PDF:', err);
      setError('An error occurred while processing the PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChatQuery = async () => {
    if (!chatQuery.trim()) {
      setError('Please enter a query.');
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:5001/query', {
        query: chatQuery,
      });

      if (response.data.success) {
        setChatResponse(response.data);
        setChatHistory((prev) => [...prev, { query: chatQuery, response: response.data.response }]);
        setChatQuery('');
      } else {
        setError('Failed to get a response from the chatbot.');
      }
    } catch (err) {
      console.error('Error querying document:', err);
      setError('An error occurred while querying the document.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Document Intelligence
          </h1>
          <p className="text-gray-300 text-lg">Upload, analyze, and chat with your PDF documents</p>
        </div>
        
        <div className="bg-gray-800 bg-opacity-70 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
          {/* Main container with two sections */}
          <div className="md:flex">
            {/* Left section: Upload and Process */}
            <div className="md:w-1/2 p-8 border-r border-gray-700">
              <h2 className="text-2xl font-bold mb-6 text-blue-400">Upload Document</h2>
              
              <div className="mb-6">
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  
                  <div className="mb-3">
                    <label className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                      {file ? 'Change File' : 'Select PDF'}
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  {file && (
                    <p className="text-sm text-blue-300 mt-2">
                      Selected: {file.name}
                    </p>
                  )}
                  
                  {!file && (
                    <p className="text-sm text-gray-400">
                      Drag and drop or click to upload a PDF
                    </p>
                  )}
                </div>
                
                {error && (
                  <div className="mt-4 p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded-lg text-red-300 text-sm">
                    <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {error}
                  </div>
                )}
              </div>
              
              <button
                onClick={handleProcess}
                disabled={isProcessing || !file}
                className={`w-full py-3 px-6 rounded-lg font-medium flex items-center justify-center transition-all duration-300 ${
                  isProcessing || !file
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Document...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Process Document
                  </>
                )}
              </button>
            </div>
            
            {/* Right section: Results or Chat */}
            <div className="md:w-1/2 p-8">
              {results ? (
                <>
                  <h2 className="text-2xl font-bold mb-6 text-blue-400">Document Analysis</h2>
                  
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span className="text-green-400 font-medium">Successfully processed</span>
                    </div>
                    
                    <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4 mb-4">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm text-gray-300">Filename</p>
                          <p className="font-medium">{results.filename}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-300">Chunks</p>
                          <p className="font-medium">{results.chunks_processed}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Results Accordion */}
                    <div className="space-y-4">
                      <div className="border border-gray-700 rounded-lg overflow-hidden">
                        <details className="group">
                          <summary className="flex items-center justify-between p-4 bg-gray-800 cursor-pointer">
                            <h3 className="font-medium">Document Summary</h3>
                            <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </summary>
                          <div className="p-4 bg-gray-700 bg-opacity-30">
                            <p className="text-sm whitespace-pre-wrap">{results.summary}</p>
                          </div>
                        </details>
                      </div>
                      
                      <div className="border border-gray-700 rounded-lg overflow-hidden">
                        <details className="group">
                          <summary className="flex items-center justify-between p-4 bg-gray-800 cursor-pointer">
                            <h3 className="font-medium">Financial Terms</h3>
                            <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </summary>
                          <div className="p-4 bg-gray-700 bg-opacity-30">
                            <ul className="space-y-3">
                              {results.results.map((result, index) => (
                                <li key={index} className="border-b border-gray-700 pb-3 last:border-0 last:pb-0">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs px-2 py-1 bg-blue-900 rounded-full">Pages {result.pages}</span>
                                  </div>
                                  <pre className="text-sm whitespace-pre-wrap">{result.financial_terms}</pre>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </details>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chat Interface */}
                  <div className="mt-8 border-t border-gray-700 pt-6">
                    <h3 className="text-xl font-bold mb-4 text-blue-400">Chat with Document</h3>
                    
                    <div className="bg-gray-900 bg-opacity-60 rounded-lg p-2 mb-4 h-64 overflow-y-auto">
                      {chatHistory.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <div className="text-center">
                            <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                            </svg>
                            <p>Ask questions about your document</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {chatHistory.map((chat, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-end">
                                <div className="bg-blue-600 p-3 rounded-lg rounded-tr-none max-w-3/4 shadow">
                                  <p className="text-sm">{chat.query}</p>
                                </div>
                              </div>
                              <div className="flex justify-start">
                                <div className="bg-gray-700 p-3 rounded-lg rounded-tl-none max-w-3/4 shadow">
                                  <p className="text-sm">{chat.response}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex">
                      <input
                        type="text"
                        value={chatQuery}
                        onChange={(e) => setChatQuery(e.target.value)}
                        placeholder="Ask a question about the document..."
                        className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleChatQuery()}
                      />
                      <button
                        onClick={handleChatQuery}
                        className="p-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="mb-6">
                    <svg className="w-16 h-16 mx-auto mb-4 text-blue-500 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <h3 className="text-xl font-medium mb-2">Process a document</h3>
                    <p className="text-gray-400 max-w-sm mx-auto">
                      Upload a PDF document to analyze its content and chat with an AI assistant about its contents.
                    </p>
                  </div>
                  
                  <ul className="text-sm text-gray-400 space-y-2 mb-6 text-left">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                      <span>Extract key financial terms and concepts</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span>Generate comprehensive document summaries</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                      </svg>
                      <span>Chat with an AI about document content</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-center mt-6 text-gray-400 text-sm">
          <p>© 2025 Document Intelligence. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default UploadPdf;