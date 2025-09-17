import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock axios before importing
jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
}));

import axios from 'axios';
import App from './App';

const mockedAxios = axios;

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render', () => {
    test('renders main title and subtitle', () => {
      render(<App />);
      
      expect(screen.getByText('AI Meeting Minutes Extractor')).toBeInTheDocument();
      expect(screen.getByText('Automated extraction of summaries, decisions, and action items')).toBeInTheDocument();
    });

    test('renders input panels', () => {
      render(<App />);
      
      expect(screen.getByText('Text Input')).toBeInTheDocument();
      expect(screen.getByText('File Upload')).toBeInTheDocument();
    });

    test('renders textarea with placeholder', () => {
      render(<App />);
      
      expect(screen.getByPlaceholderText('Paste your meeting notes here...')).toBeInTheDocument();
    });

    test('renders process buttons', () => {
      render(<App />);
      
      expect(screen.getByText('Process Text')).toBeInTheDocument();
      expect(screen.getByText('Process File')).toBeInTheDocument();
    });

    test('renders status bar with initial status', () => {
      render(<App />);
      
      expect(screen.getByText(/Status: Ready/)).toBeInTheDocument();
      expect(screen.getByText(/Backend: http:\/\/localhost:3000/)).toBeInTheDocument();
    });
  });

  describe('Text Input Functionality', () => {
    test('enables process button when text is entered', () => {
      render(<App />);
      
      const textarea = screen.getByPlaceholderText('Paste your meeting notes here...');
      const processButton = screen.getByText('Process Text');
      
      expect(processButton).toBeDisabled();
      
      fireEvent.change(textarea, { target: { value: 'Test meeting notes' } });
      
      expect(processButton).not.toBeDisabled();
    });

    test('processes text successfully', async () => {
      const mockResponse = {
        data: {
          timestamp: '2025-09-17T15:20:32.357Z',
          processed: true,
          summary: 'Test summary',
          decisions: ['Test decision'],
          actionItems: [
            {
              task: 'Test task',
              owner: 'John',
              due: 'Tomorrow'
            }
          ]
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      render(<App />);
      
      const textarea = screen.getByPlaceholderText('Paste your meeting notes here...');
      const processButton = screen.getByText('Process Text');
      
      fireEvent.change(textarea, { target: { value: 'Test meeting notes' } });
      fireEvent.click(processButton);
      
      // Check loading state
      expect(screen.getByText('Processing...')).toBeInTheDocument();
      
      // Wait for results
      await waitFor(() => {
        expect(screen.getByText('Extraction Results')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Test summary')).toBeInTheDocument();
      expect(screen.getByText('• Test decision')).toBeInTheDocument();
      expect(screen.getByText('Test task')).toBeInTheDocument();
    });

    test('handles API error gracefully', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          data: {
            error: 'API Error'
          }
        }
      });

      render(<App />);
      
      const textarea = screen.getByPlaceholderText('Paste your meeting notes here...');
      const processButton = screen.getByText('Process Text');
      
      fireEvent.change(textarea, { target: { value: 'Test meeting notes' } });
      fireEvent.click(processButton);
      
      await waitFor(() => {
        expect(screen.getByText('API Error')).toBeInTheDocument();
      });
    });
  });

  describe('File Upload Functionality', () => {
    test('accepts valid file types', () => {
      render(<App />);
      
      const fileInput = document.querySelector('input[type="file"]');
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      expect(screen.getByText(/Selected: test.txt/)).toBeInTheDocument();
    });

    test('rejects invalid file types', () => {
      render(<App />);
      
      const fileInput = document.querySelector('input[type="file"]');
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      expect(screen.getByText('Please select a .txt or .md file')).toBeInTheDocument();
    });
  });

  describe('Clear Functionality', () => {
    test('clears all data when clear button is clicked', async () => {
      const mockResponse = {
        data: {
          timestamp: '2025-09-17T15:20:32.357Z',
          processed: true,
          summary: 'Test summary',
          decisions: ['Test decision'],
          actionItems: []
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      render(<App />);
      
      const textarea = screen.getByPlaceholderText('Paste your meeting notes here...');
      const processButton = screen.getByText('Process Text');
      
      // Add text and process
      fireEvent.change(textarea, { target: { value: 'Test meeting notes' } });
      fireEvent.click(processButton);
      
      await waitFor(() => {
        expect(screen.getByText('Test summary')).toBeInTheDocument();
      });
      
      // Click clear button
      const clearButton = screen.getByText('Clear All');
      fireEvent.click(clearButton);
      
      // Check that everything is cleared
      expect(textarea.value).toBe('');
      expect(screen.queryByText('Test summary')).not.toBeInTheDocument();
      expect(screen.getByText(/Status: Ready/)).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    test('shows loading spinner during processing', async () => {
      // Create a promise that we can control
      let resolvePromise;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockedAxios.post.mockReturnValueOnce(promise);

      render(<App />);
      
      const textarea = screen.getByPlaceholderText('Paste your meeting notes here...');
      const processButton = screen.getByText('Process Text');
      
      fireEvent.change(textarea, { target: { value: 'Test meeting notes' } });
      fireEvent.click(processButton);
      
      // Check loading state
      expect(screen.getByText('Processing...')).toBeInTheDocument();
      expect(processButton).toBeDisabled();
      
      // Resolve the promise
      resolvePromise({
        data: {
          timestamp: '2025-09-17T15:20:32.357Z',
          processed: true,
          summary: 'Test summary',
          decisions: [],
          actionItems: []
        }
      });
      
      await waitFor(() => {
        expect(screen.queryByText('Processing...')).not.toBeInTheDocument();
      });
    });
  });
});