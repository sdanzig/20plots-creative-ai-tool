import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardContent, TextField, Button, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/system';

const StyledCard = styled(Card)({
  maxWidth: 345,
  margin: '0 auto',
  marginTop: 50,
});

const InfoCard = styled(Card)({
  maxWidth: 345,
  margin: '0 auto',
  marginTop: 20,
});

const InfoCardHeader = styled(CardHeader)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const CloseButton = styled(IconButton)({
  color: 'gray',
});

const Logo = styled(Typography)({
  textAlign: 'center',
  padding: 15,
  fontSize: '3rem',
  fontWeight: 700,
  background: '-webkit-linear-gradient(white, gray)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textShadow: '0px 2px 2px rgba(255,255,255,0.5)',
});

const LogoSubtext = styled(Typography)({
  textAlign: 'center',
  fontSize: '0.8rem',
  fontWeight: 400,
  color: 'gray',
  marginTop: '-16px',
  '& a': {
    color: 'inherit',
    textDecoration: 'none',
  },
});

const Form = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
});

const StyledButton = styled(Button)({
  marginTop: '30px',
});

const LoginText = styled(Typography)({
  fontFamily: 'Calligraffitti, cursive',
});

const UserLogin = () => {
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showInfo, setShowInfo] = useState(!window.localStorage.getItem('hideInfoCard'));
  const navigate = useNavigate();

  const fromRegistration = searchParams.get("registered");

  useEffect(() => {
    window.localStorage.removeItem('token');
    axios.defaults.headers.common['Authorization'] = 'Bearer ';
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const serverUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await axios.post(`${serverUrl}/api/login`, { username, password });
      const token = response.data;
      window.localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${window.localStorage.getItem('token')}`;
      navigate('/');
    } catch (error) {
      console.log(error);
      if (error.response && error.response.status === 401) {
        window.localStorage.removeItem('token');
        axios.defaults.headers.common['Authorization'] = null;
      }
      setUsername('');
      setPassword('');
      alert('Invalid username or password');
    }
  };

  const handleInfoDismiss = () => {
    window.localStorage.setItem('hideInfoCard', 'true');
    setShowInfo(false);
  };

  return (
    <>
      <StyledCard>
        <CardHeader
          title={
            <>
              <Logo>20plots</Logo>
              <LogoSubtext>
                by <a href="https://sneakyghost.com" target="_blank" rel="noopener noreferrer" style={{ color: 'gray', textDecoration: 'underline' }}>Sneaky Ghost</a> Innovations
              </LogoSubtext>
            </>
          }
        />
        <CardContent>
          {fromRegistration && (
            <Typography variant="body1" color="primary" align="center" gutterBottom>
              Success! Now please try logging in.
            </Typography>
          )}
          <Form onSubmit={handleLogin}>
            <LoginText variant="h6" align="center" gutterBottom>
              Login to find your story
            </LoginText>
            <TextField
              label="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <StyledButton type="submit" variant="contained" color="primary">
              Login
            </StyledButton>
            <Typography align="center">
              Don't have an account? <Link to="/register">Register</Link>
            </Typography>
          </Form>
        </CardContent>
      </StyledCard>
      {showInfo && (
        <InfoCard>
          <InfoCardHeader
            title="What is this?"
            action={<CloseButton onClick={handleInfoDismiss}><CloseIcon /></CloseButton>}
            sx={{ pb: 0 }}
          />
          <CardContent>
            <Typography variant="body2">
              Welcome to a unique brainstorming tool for writers! This app curates personalized
              story plots based on the elements you provide. Feed in characters, anecdotes, concepts,
              locations, and dreams from your personal experiences and imagination. We then generate
              distinctive plots that might spark your creativity, woven with threads of your personal
              connection. To begin, simply start adding elements and then generate plots. Let your
              story unfold!
            </Typography>
          </CardContent>
        </InfoCard>
      )}
    </>
  );
};

export default UserLogin;
