import React, { createContext, useContext, useState, useEffect } from 'react';

// Create an AuthContext
const AuthContext = createContext();

// Create an AuthProvider which holds the state and functions related to authentication
export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const login = (token) => {
        localStorage.setItem('token', token);
        setIsLoggedIn(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
    };

    const contextValue = {
        isLoggedIn,
        logout,
        login
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}


// Create a useAuth hook that will be used within the component that wants to access auth data
export function useAuth() {
    return useContext(AuthContext);
}
