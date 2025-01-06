import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import axios from 'axios';
import './AdminPage.css';

const AdminAiPage = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [model, setModel] = useState('openai/gpt-4-32k'); // Add this line to manage the selected model

    const handleModelChange = (e) => setModel(e.target.value); // Add this function to handle model changes

    const handleSendQuery = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/admin/ai`, { userPrompt: input, model }, { // Include model in the request payload
                headers: { Authorization: `Bearer ${window.localStorage.getItem('token')}` }
            });
            setOutput(response.data);
        } catch (error) {
            console.error('Error sending query:', error);
        }
    };

    const customDarkStyle = {
        ...dark,
        hljs: {
            ...dark.hljs,
            background: 'black',
        },
    };

    const CodeBlock = ({ language, value }) => (
        <span className="code-block">
            <div className="code-block-header">
                <span>{language}</span>
                <button className="copy-code-button" onClick={() => navigator.clipboard.writeText(value)}>Copy</button>
            </div>
            <SyntaxHighlighter language={language} style={customDarkStyle}>
                {value}
            </SyntaxHighlighter>
        </span>
    );

    return (
        <div>
            <div className="textarea-container">
                <label>Model</label>
                <select value={model} onChange={handleModelChange}> {/* Add this dropdown for selecting the model */}
                    <option value="openai/gpt-4-32k">openai/gpt-4-32k</option>
                    <option value="openai/gpt-4">openai/gpt-4</option>
                    <option value="openai/gpt-3.5-turbo">openai/gpt-3.5-turbo</option>
                    <option value="openai/gpt-3.5-turbo-16k">openai/gpt-3.5-turbo-16k</option>
                </select>
            </div>
            <div className="textarea-container">
                <label>Input</label>
                <textarea className="admin-textarea" value={input} onChange={e => setInput(e.target.value)} />
            </div>
            <button onClick={handleSendQuery}>Send</button>
            <div className="textarea-container">
                <label>Output</label>
                <div className="admin-textarea">
                    <ReactMarkdown components={{
                        code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ?
                                <CodeBlock language={match[1]} value={String(children).replace(/\n$/, '')} {...props} /> :
                                <code className={className} {...props}>{children}</code>;
                        }
                    }} children={JSON.stringify(output, null, 2)} />
                </div>
            </div>
        </div>
    );
};

export default AdminAiPage;
