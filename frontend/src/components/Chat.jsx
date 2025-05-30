import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import { FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';
import { apiUrl } from '../config';
import { socket } from '../socket';
import '../styles/Chat.css';

const Chat = ({ propertyId, otherUserId, otherUserName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const chatId = `${propertyId}_${Math.min(otherUserId, localStorage.getItem('userId'))}_${Math.max(otherUserId, localStorage.getItem('userId'))}`;

  useEffect(() => {
    fetchMessages();

    // Conectar ao socket e entrar na sala do chat
    socket.emit('joinChat', chatId);

    // Ouvir novas mensagens
    socket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('newMessage');
      socket.emit('leaveChat', chatId);
    };
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/api/messages/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setMessages(response.data.data.messages);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      setError('Não foi possível carregar as mensagens. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${apiUrl}/api/messages`,
        {
          chatId,
          receiverId: otherUserId,
          propertyId,
          message: newMessage
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      socket.emit('sendMessage', {
        chatId,
        message: response.data.data.message
      });

      setNewMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setError('Não foi possível enviar a mensagem. Por favor, tente novamente.');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="chat-container">
        <div className="d-flex justify-content-center align-items-center h-100">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </Spinner>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {error && (
        <Alert variant="danger" className="m-2">
          {error}
        </Alert>
      )}

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="text-center text-muted py-4">
            <p>Nenhuma mensagem ainda. Comece a conversa!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`message ${
                message.senderId._id === localStorage.getItem('userId') ? 'sent' : 'received'
              }`}
            >
              <div className="message-content">
                <div className="message-sender">
                  {message.senderId.name}
                </div>
                <div className="message-text">
                  {message.message}
                </div>
                <div className="message-time">
                  {new Date(message.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <Form onSubmit={handleSendMessage} className="chat-input">
        <div className="d-flex">
          <Form.Control
            type="text"
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={!!error}
          />
          <Button type="submit" variant="primary" disabled={!!error}>
            <FaPaperPlane />
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Chat; 