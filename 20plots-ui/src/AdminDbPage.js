import React, { useState } from 'react';
import axios from 'axios';
import './AdminPage.css';

const AdminDbPage = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState([]);
    const [message, setMessage] = useState('');

    const handleSendQuery = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/admin/db`, { dbQueryString: input }, {
                headers: { Authorization: `Bearer ${window.localStorage.getItem('token')}` }
            });
            if (Array.isArray(response.data)) {
                setOutput(response.data);
                setMessage(''); // Clear any previous message
            } else {
                setMessage(response.data);
                setOutput([]); // Clear any previous output
            }
        } catch (error) {
            console.error('Error sending query:', error);
        }
    };

    return (
        <div>
            <div className="textarea-container">
                <label>SQL Command</label>
                <textarea className="admin-textarea" value={input} onChange={e => setInput(e.target.value)} />
            </div>
            <button onClick={handleSendQuery}>Execute</button>
            <div className="textarea-container">
                <label>Response</label>
                <div className="admin-table-container">
                    {message ? (
                        <p>{message}</p>
                    ) : (
                        <>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        {output.length > 0 && Object.keys(output[0]).map(key => <th key={key}>{key}</th>)}
                                    </tr>
                                </thead>
                            </table>
                            <div className="admin-table-body-container">
                                <table className="admin-table">
                                    <tbody>
                                        {output.map((row, index) => (
                                            <tr key={index}>
                                                {Object.values(row).map((value, valueIndex) => <td key={valueIndex}>{value}</td>)}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDbPage;
