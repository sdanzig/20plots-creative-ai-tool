import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, NavLink, Routes, Navigate, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button, styled } from '@mui/material';
import { useAuth, AuthProvider } from './AuthProvider';
import axios from 'axios';
import { SnackbarProvider, useSnackbar } from 'notistack';
import PlotPage from './PlotPage';
import ElementsPage from './ElementsPage';
import AdminAiPage from './AdminAiPage';
import AdminDbPage from './AdminDbPage';
import UserLogin from './UserLogin';
import UserRegister from './UserRegister';
import './App.css';

const StyledLogoutButton = styled(Button)({
  textTransform: 'none'
});

const AppProvider = () => {
  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={4000}>
      <App />
    </SnackbarProvider>
  );
}

const App = () => {
  const [generating, setGenerating] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    document.title = "20plots";

    let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = 'https://sneakyghost.com/favicon.ico';
    document.getElementsByTagName('head')[0].appendChild(link);
  }, []);

  useEffect(() => {
    const fetchNewlyGeneratedPlots = async () => {
      const serverUrl = process.env.REACT_APP_BACKEND_URL;
      try {
        const response = await axios.post(`${serverUrl}/api/plots/announcements`);
        const plotAnnouncements = response.data;
        if (plotAnnouncements.length > 0) {
          for (let i = 0; i < plotAnnouncements.length; i++) {
            if (plotAnnouncements[i].generationError) {
              enqueueSnackbar('Error generating plot: ' + plotAnnouncements[i].generationError, { variant: 'error', autoHideDuration: 3000 });
            } else {
              enqueueSnackbar('Plot "' + plotAnnouncements[i].plot.title + '" has been added to your plot list.', { variant: 'success', autoHideDuration: 3000 });
            }
          }
          setGenerating(false);
          localStorage.removeItem("isGenerating");
        }
      } catch (error) {
        console.error('Error fetching newly generated plots:', error);
      }
    };

    const intervalId = setInterval(() => {
      if (generating) {
        fetchNewlyGeneratedPlots();
      }
    }, 5000); // check every 5 seconds

    return () => clearInterval(intervalId);
  }, [generating, enqueueSnackbar]);

  const AuthWrapper = ({ children }) => {
    const auth = useAuth();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(!!window.localStorage.getItem('token'));
    const [userIsAdmin, setUserIsAdmin] = useState(false);

    useEffect(() => {
      const token = window.localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    }, []);

    useEffect(() => {
      const updateLoggedInStatus = () => {
        const token = window.localStorage.getItem('token');
        const loggedIn = !!token;

        // If the user is not logged in and the flag is still in local storage, remove it
        if (!loggedIn && localStorage.getItem("isGenerating")) {
          localStorage.removeItem("isGenerating");
          setGenerating(false); // Also stop generating
        } else if (loggedIn && localStorage.getItem("isGenerating")) {
          // If the user is logged in and the flag is in local storage, start generation
          setGenerating(true);
        }

        setIsLoggedIn(loggedIn);

        if (!loggedIn) {
          navigate('/login');
        }
      };

      // Update logged in status immediately on mount
      updateLoggedInStatus();

      // Listen to storage event on window
      window.addEventListener('storage', updateLoggedInStatus);
      axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin`, {
        headers: { Authorization: `Bearer ${window.localStorage.getItem('token')}` },
      })
        .then(response => {
          setUserIsAdmin(response.data);
        })
        .catch(error => {
          console.error('Error checking admin status:', error);
        });
      // Cleanup listener on unmount
      return () => {
        window.removeEventListener('storage', updateLoggedInStatus);
      };
    }, [navigate]);


    const handleLogout = () => {
      localStorage.removeItem("isGenerating");
      setGenerating(false); // Also stop generating
      if (auth) {
        auth.logout();
        navigate('/login');
      }
    };

    const Footer = () => (
      <div className="footer">
        <div className="footer__left">
          <p>&copy; 2023 Sneaky Ghost Innovations.</p>
        </div>
        <div className="footer__right">
          <p>Use at your own risk. No guarantees are offered regarding product stability or performance.</p>
          <p>Your data will not be used for marketing purposes or sold to third parties.</p>
        </div>
      </div>
    );

    return isLoggedIn ? (
      <>
        <AppBar position="static" elevation={10}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, fontSize: '1.5rem' }} className="metallic-text">
              20plots
            </Typography>
            <NavLink to="/plots" className={({ isActive }) => isActive ? "link plotsButton activeLink" : "link plotsButton"}>Plots</NavLink>
            <NavLink to="/elements" style={{ marginRight: userIsAdmin ? '80px' : '0px' }} className={({ isActive }) => isActive ? "link activeLink" : "link"}>Elements</NavLink>
            {isLoggedIn && userIsAdmin && (
              <>
                <NavLink to="/admin-ai" className={({ isActive }) => isActive ? "link activeLink aiButton" : "link"}>Admin AI</NavLink>
                <NavLink to="/admin-db" className={({ isActive }) => isActive ? "link activeLink" : "link"}>Admin DB</NavLink>
              </>
            )}
            <StyledLogoutButton style={{ color: "white", marginLeft: userIsAdmin ? '100px' : '200px' }} onClick={handleLogout}>Logout</StyledLogoutButton>          </Toolbar>
        </AppBar>
        {children}
        <Footer />
      </>
    ) : null;
  };

  return (
    <Router>
      <AuthProvider>
        <Container maxWidth="md">
          <Routes>
            <Route path="/login" element={<UserLogin />} />
            <Route path="/register" element={<UserRegister />} />
            <Route path="/*" element={
              <AuthWrapper>
                <Routes>
                  <Route path="/" element={<Navigate to="/plots" replace />} />
                  <Route path="/plots" element={<PlotPage setGenerating={setGenerating} />} />
                  <Route path="/elements" element={<ElementsPage />} />
                  <Route path="/admin-ai" element={<AdminAiPage />} />
                  <Route path="/admin-db" element={<AdminDbPage />} />
                </Routes>
              </AuthWrapper>
            } />
          </Routes>
        </Container>
      </AuthProvider>
    </Router>
  );
}

export default AppProvider;
