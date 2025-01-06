import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import UserLogin from './UserLogin';
import axios from 'axios';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

jest.mock('axios');

describe('UserLogin', () => {

    const DummyComponent = () => {
        return null;
    };

    const setup = () => {
        const utils = render(
            <MemoryRouter initialEntries={["/login"]}>
                <Routes>
                    <Route path="/" element={<DummyComponent />} />
                    <Route path="/login" element={<UserLogin />} />
                </Routes>
            </MemoryRouter>
        );
        const usernameInput = screen.getByLabelText(/username/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /login/i });

        return {
            ...utils,
            usernameInput,
            passwordInput,
            submitButton
        };
    };

    it('displays username and password fields', () => {
        setup();
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('handles successful login', async () => {
        axios.post.mockResolvedValueOnce({ data: 'fake-token' });
        const { usernameInput, passwordInput, submitButton } = setup();

        await act(async () => {
            fireEvent.change(usernameInput, { target: { value: 'john' } });
            fireEvent.change(passwordInput, { target: { value: 'password' } });
            fireEvent.click(submitButton);
        });

        expect(axios.post).toHaveBeenCalledWith(expect.any(String), { username: 'john', password: 'password' });
    });

    it('handles failed login', async () => {
        axios.post.mockRejectedValueOnce({ response: { status: 401 } });
        window.alert = jest.fn();
        const { usernameInput, passwordInput, submitButton } = setup();

        await act(async () => {
            fireEvent.change(usernameInput, { target: { value: 'john' } });
            fireEvent.change(passwordInput, { target: { value: 'wrong' } });
            fireEvent.click(submitButton);
        });

        expect(window.alert).toHaveBeenCalledWith('Invalid username or password');
    });
});
