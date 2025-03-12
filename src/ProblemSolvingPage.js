import React, { useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import './ProblemSolvingPage.css';

const ProblemPage = () => {
  const [code, setCode] = useState('');
  const [result, setResult] = useState('');
  const [errors, setErrors] = useState([]);
  const [language, setLanguage] = useState('java');

  const problemDetails = {
    title: 'Reverse a String',
    description: 'Write a function that reverses a string.',
    input: 'hello',
    output: 'olleh'
  };

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleSubmit = async () => {
    setResult('');
    setErrors([]);

    try {
      let response;
      console.log('Selected language:', language);

      if (language === 'java') {
        response = await fetch('http://localhost:5000/run-java', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });
      } else if (language === 'cpp') {
        response = await fetch('http://localhost:5000/run-cpp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });
      }

      if (!response.ok) {
        const errorBody = await response.text();
        const formattedErrors = formatErrors(errorBody); // Use the correct function here
        setErrors(formattedErrors);
        return;
      }

      const data = await response.json();
      console.log('Server response:', data);

      if (data.error) {
        const formattedErrors = formatErrors(data.error);
        setErrors(formattedErrors);
      } else {
        setResult(`Output: \n${data.output}`);
      }
    } catch (error) {
      console.error('Error compiling code:', error);
      setErrors([{ message: error.message }]);
    }
  };

  // Function to parse and format error message
  const formatErrors = (errorString) => {
    const lines = errorString.split('\n');
    const formattedErrors = [];

    lines.forEach((line) => {
      const regex = /Main\.java:(\d+): error: (.+)/;
      const matches = line.match(regex);

      if (matches) {
        const [_, lineNum, errorMessage] = matches;
        formattedErrors.push({
          line: lineNum,
          message: errorMessage.trim().replace(/\\r\\n/g, ' ').replace(/\\n/g, ' ') // Clean up any unwanted escape sequences
        });
      }
    });

    return formattedErrors;
  };

  return (
    <div className="problem-container">
      <div className="problem-card">
        <h1>{problemDetails.title}</h1>
        <p className="description">{problemDetails.description}</p>

        <div className="example">
          <h3>Example:</h3>
          <p><strong>Input:</strong> {problemDetails.input}</p>
          <p><strong>Output:</strong> {problemDetails.output}</p>
        </div>

        <div className="language-buttons">
          <button
            className={language === 'java' ? 'active' : ''}
            onClick={() => setLanguage('java')}
          >
            Java
          </button>
          <button
            className={language === 'cpp' ? 'active' : ''}
            onClick={() => setLanguage('cpp')}
          >
            C++
          </button>
        </div>

        <div className="editor-container">
          <h3>Your Code:</h3>
          <MonacoEditor
            height="400px"
            language={language === 'java' ? 'java' : language === 'cpp' ? 'cpp' : 'javascript'}
            value={code}
            onChange={handleEditorChange}
            theme="vs-dark"
          />
        </div>

        <button className="submit-btn" onClick={handleSubmit}>Submit</button>

        {result && <div className="result"><h3>Result:</h3><pre>{result}</pre></div>}

        {errors.length > 0 && (
          <div className="error-table">
            <h3>Errors:</h3>
            <table>
              <thead>
                <tr>
                  <th>Line</th>
                  <th>Error Message</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((error, index) => (
                  <tr key={index}>
                    <td>{error.line}</td>
                    <td>{error.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemPage;
