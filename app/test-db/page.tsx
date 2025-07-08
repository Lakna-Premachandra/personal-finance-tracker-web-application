'use client';

import { useState, useEffect } from 'react';

export default function TestDB() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-db');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Connection test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
      
      {loading ? (
        <div className="mb-4">
          <span className="px-3 py-1 rounded bg-yellow-100 text-yellow-800">
            🔄 Testing connection...
          </span>
        </div>
      ) : (
        <div className="mb-4">
          <span className={`px-3 py-1 rounded ${
            result?.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {result?.success ? '✅ Connected' : '❌ Failed'}
          </span>
        </div>
      )}

      {result && (
        <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
      
      <div className="mt-4">
        <button 
          onClick={testConnection}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Again'}
        </button>
      </div>
    </div>
  );
}