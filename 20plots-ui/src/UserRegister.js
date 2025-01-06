import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, TextField, Button, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { styled } from '@mui/system';

const StyledCard = styled(Card)({
  maxWidth: 345,
  margin: '0 auto',
  marginTop: 50,
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

const RegisterText = styled(Typography)({
  fontFamily: 'Calligraffitti, cursive',
});

const BetaTesterForm = styled('form')({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '10px',
  marginTop: '20px',
});

const BetaTesterInput = styled(TextField)({
  flexGrow: 1,
});

const BetaTesterButton = styled(Button)({
  color: '#fff',
  backgroundColor: '#3f51b5', 
  padding: '10px 20px', 
  '&:hover': {
    backgroundColor: '#303f9f',
  },
  '&:active': {
    backgroundColor: '#283593',
  },
});

const UserRegister = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [registrationKey, setRegistrationKey] = useState('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState('');

  const validateEmail = email => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setErrorDialogMessage('Invalid email address.');
      setErrorDialogOpen(true);
      return;
    }
    if (password !== confirmPassword) {
      setErrorDialogMessage('Passwords do not match.');
      setErrorDialogOpen(true);
      return;
    }
    try {
      const serverUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await axios.post(`${serverUrl}/api/register`, { username, password, email, registrationKey });
      console.log(response.data);
      navigate("/login?registered=true"); // pass a state object with the navigation
    } catch (error) {
      console.log(error);
      const message = error.response ? (error.response.data.message || 'An error occurred during registration.') : 'Could not reach the server.';
      setErrorDialogMessage(message);
      setErrorDialogOpen(true);
    }
  };

  return (
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
        <Form onSubmit={handleRegister}>
          <RegisterText variant="h6" align="center" gutterBottom>
            Register now and be inspired!
          </RegisterText>
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
          <TextField
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            error={password !== confirmPassword && password !== '' && confirmPassword !== ''}
            helperText={password !== confirmPassword && password !== '' && confirmPassword !== '' && "Passwords do not match"}
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Registration Key"
            value={registrationKey}
            onChange={e => setRegistrationKey(e.target.value)}
            required
          />
          <div className="form-container">
            Want to be a beta tester? Join our waitlist for registration keys:
            <BetaTesterForm action="https://formspree.io/f/maylavkd" method="POST">
              <input type="hidden" name="website_info" value="20plots" />
              <BetaTesterInput
                type="email"
                name="_replyto"
                placeholder="Your email"
                required
              />
              <input type="hidden" name="_subject" value="New beta testing request" />
              <BetaTesterButton type="submit">
                Join Waitlist
              </BetaTesterButton>
            </BetaTesterForm>
          </div>
          <StyledButton type="submit" variant="contained" color="primary" disabled={password !== confirmPassword || password === '' || confirmPassword === ''}>
            Register
          </StyledButton>
          <Typography align="center">
            Already have an account? <Link to="/login">Login</Link>
          </Typography>
        </Form>
      </CardContent>
      <Dialog
        open={errorDialogOpen}
        onClose={() => setErrorDialogOpen(false)}
      >
        <DialogTitle>{"Registration Error"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {errorDialogMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorDialogOpen(false)}>
            Dismiss
          </Button>
        </DialogActions>
      </Dialog>
    </StyledCard>
  );
};

export default UserRegister;
