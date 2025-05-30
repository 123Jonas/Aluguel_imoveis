import { io } from 'socket.io-client';
import { apiUrl } from './config';

export const socket = io(apiUrl, {
  auth: {
    token: localStorage.getItem('token')
  },
  autoConnect: false,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000
});

// Reconectar automaticamente quando o token mudar
socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
  if (error.message === 'Token não fornecido') {
    // Não tente reconectar se não houver token
    return;
  }
  if (error.message === 'Authentication error') {
    const token = localStorage.getItem('token');
    if (token) {
      socket.auth.token = token;
      socket.connect();
    }
  }
});

// Eventos de conexão
socket.on('connect', () => {
  console.log('Socket connected successfully');
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
  if (reason === 'io server disconnect') {
    // O servidor forçou a desconexão, tente reconectar
    socket.connect();
  }
});

socket.on('reconnect', (attemptNumber) => {
  console.log('Socket reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_error', (error) => {
  console.error('Socket reconnection error:', error);
});

socket.on('reconnect_failed', () => {
  console.error('Socket failed to reconnect');
}); 