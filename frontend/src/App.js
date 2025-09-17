import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import './App.css';

const AppContainer = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  color: #ff4d00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.4;
  padding: 20px;
  background-image: 
    linear-gradient(rgba(0, 255, 65, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 65, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
`;

const Header = styled.div`
  border: 1px solid #ff4d00;
  padding: 15px;
  margin-bottom: 20px;
  background: rgba(0, 255, 65, 0.05);
`;

const Title = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: normal;
  color: #ff4d00;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const Subtitle = styled.p`
  margin: 5px 0 0 0;
  color:rgb(255, 255, 255);
  font-size: 12px;
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.div`
  border: 1px solid #333;
  background: rgba(0, 0, 0, 0.7);
  padding: 15px;
`;

const PanelHeader = styled.div`
  color: #ff4d00;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 15px;
  padding-bottom: 5px;
  border-bottom: 1px solid #333;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 200px;
  background: #111;
  border: 1px solid #333;
  color: #ff4d00;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  padding: 10px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #ff4d00;
    box-shadow: 0 0 5px rgba(0, 255, 65, 0.3);
  }
  
  &::placeholder {
    color: #555;
  }
`;

const FileInput = styled.input`
  width: 100%;
  background: #111;
  border: 1px solid #333;
  color: #ff4d00;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  padding: 10px;
  margin-bottom: 10px;
  
  &:focus {
    outline: none;
    border-color: #ff4d00;
  }
`;

const Button = styled.button`
  background: #111;
  border: 1px solid #ff4d00;
  color: #ff4d00;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  padding: 10px 20px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 255, 65, 0.1);
    box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ResultsPanel = styled.div`
  border: 1px solid #333;
  background: rgba(0, 0, 0, 0.7);
  padding: 15px;
  grid-column: 1 / -1;
  margin-top: 20px;
`;

const ResultSection = styled.div`
  margin-bottom: 20px;
`;

const ResultTitle = styled.h3`
  color: #ff4d00;
  font-size: 14px;
  margin: 0 0 10px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ResultContent = styled.div`
  color: #ccc;
  font-size: 12px;
  line-height: 1.6;
`;

const ActionItem = styled.div`
  background: rgba(0, 255, 65, 0.05);
  border-left: 3px solid #ff4d00;
  padding: 10px;
  margin: 5px 0;
`;

const StatusBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #111;
  border-top: 1px solid #333;
  padding: 10px 20px;
  font-size: 11px;
  color:rgb(43, 255, 0);
`;

const LoadingSpinner = styled.div`
  color: #ff4d00;
  font-size: 12px;
  text-align: center;
  padding: 20px;
  
  &::after {
    content: '';
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid #333;
    border-top: 2px solid #ff4d00;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-left: 10px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  background: rgba(255, 68, 68, 0.1);
  border: 1px solid #ff4444;
  padding: 10px;
  margin: 10px 0;
  font-size: 12px;
`;

function App() {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Ready');
  const fileInputRef = useRef(null);

  const API_BASE_URL = 'http://localhost:3000';

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
        setSelectedFile(file);
        setError('');
        setStatus(`File selected: ${file.name}`);
      } else {
        setError('Please select a .txt or .md file');
        setSelectedFile(null);
      }
    }
  };

  const processText = async () => {
    if (!inputText.trim()) {
      setError('Please enter some meeting notes');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('Processing meeting notes...');

    try {
      const response = await axios.post(`${API_BASE_URL}/process-meeting`, {
        text: inputText,
        extractionOptions: {
          includeSummary: true,
          includeDecisions: true,
          includeActionItems: true,
          maxSummaryLength: 3
        }
      });

      setResults(response.data);
      setStatus('Processing completed successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process meeting notes');
      setStatus('Processing failed');
    } finally {
      setLoading(false);
    }
  };

  const processFile = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('Processing uploaded file...');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${API_BASE_URL}/process-meeting`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResults(response.data);
      setStatus('File processing completed successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process file');
      setStatus('File processing failed');
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setInputText('');
    setSelectedFile(null);
    setResults(null);
    setError('');
    setStatus('Ready');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <AppContainer>
      <Header>
        <Title>AI Meeting Minutes Extractor</Title>
        <Subtitle>Automated extraction of summaries, decisions, and action items</Subtitle>
      </Header>

      <MainContent>
        <Panel>
          <PanelHeader>Text Input</PanelHeader>
          <TextArea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your meeting notes here..."
          />
          <div style={{ marginTop: '10px' }}>
            <Button onClick={processText} disabled={loading || !inputText.trim()}>
              Process Text
            </Button>
          </div>
        </Panel>

        <Panel>
          <PanelHeader>File Upload</PanelHeader>
          <FileInput
            ref={fileInputRef}
            type="file"
            accept=".txt,.md"
            onChange={handleFileChange}
          />
          {selectedFile && (
            <div style={{ color: '#888', fontSize: '11px', marginBottom: '10px' }}>
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </div>
          )}
          <Button onClick={processFile} disabled={loading || !selectedFile}>
            Process File
          </Button>
        </Panel>
      </MainContent>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {loading && <LoadingSpinner>Processing...</LoadingSpinner>}

      {results && (
        <ResultsPanel>
          <PanelHeader>Extraction Results</PanelHeader>
          
          {results.summary && (
            <ResultSection>
              <ResultTitle>Summary</ResultTitle>
              <ResultContent>{results.summary}</ResultContent>
            </ResultSection>
          )}

          {results.decisions && results.decisions.length > 0 && (
            <ResultSection>
              <ResultTitle>Key Decisions</ResultTitle>
              <ResultContent>
                {results.decisions.map((decision, index) => (
                  <div key={index} style={{ marginBottom: '5px' }}>
                    • {decision}
                  </div>
                ))}
              </ResultContent>
            </ResultSection>
          )}

          {results.actionItems && results.actionItems.length > 0 && (
            <ResultSection>
              <ResultTitle>Action Items</ResultTitle>
              <ResultContent>
                {results.actionItems.map((item, index) => (
                  <ActionItem key={index}>
                    <div><strong>Task:</strong> {item.task}</div>
                    {item.owner && <div><strong>Owner:</strong> {item.owner}</div>}
                    {item.due && <div><strong>Due:</strong> {item.due}</div>}
                  </ActionItem>
                ))}
              </ResultContent>
            </ResultSection>
          )}

          <div style={{ marginTop: '20px' }}>
            <Button onClick={clearAll}>Clear All</Button>
          </div>
        </ResultsPanel>
      )}

      <StatusBar>
        Status: {status} | Backend: {API_BASE_URL} | Ready for operation
      </StatusBar>
    </AppContainer>
  );
}

export default App;