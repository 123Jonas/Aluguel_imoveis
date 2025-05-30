import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup, Alert, Spinner } from 'react-bootstrap';
import { FaPaperPlane, FaSearch, FaUserCircle } from 'react-icons/fa';
import axios from 'axios';
import { apiUrl } from '../../config';
import { socket } from '../../socket';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConversations();

    // Ouvir novas mensagens
    socket.on('newMessage', (message) => {
      if (selectedConversation && message.chatId === selectedConversation.chatId) {
        setSelectedConversation(prev => ({
          ...prev,
          messages: [...prev.messages, message]
        }));
      }
      // Atualizar a lista de conversas
      updateConversationList(message);
    });

    return () => {
      socket.off('newMessage');
    };
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/api/messages/landlord/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Verificar se as conversas têm todos os campos necessários
        const validConversations = response.data.data.conversations.map(conv => {
          // Log para debug
          console.log('Conversa recebida:', conv);

          return {
            chatId: conv.chatId,
            propertyId: conv.propertyId,
            tenantId: conv.tenantId,
            propertyTitle: conv.propertyTitle || 'Imóvel sem título',
            tenantName: conv.tenantName || 'Inquilino sem nome',
            lastMessage: conv.lastMessage || '',
            timestamp: conv.timestamp || new Date(),
            unread: conv.unread || false,
            messages: conv.messages || []
          };
        });

        setConversations(validConversations);
      } else {
        throw new Error(response.data.error || 'Erro ao carregar conversas');
      }
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
      setError('Não foi possível carregar as conversas. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const updateConversationList = (message) => {
    setConversations(prev => {
      const updatedConversations = prev.map(conv => {
        if (conv.chatId === message.chatId) {
          return {
            ...conv,
            lastMessage: message.message,
            timestamp: message.timestamp,
            unread: true
          };
        }
        return conv;
      });

      // Se a conversa não existir, criar uma nova
      if (!updatedConversations.find(conv => conv.chatId === message.chatId)) {
        updatedConversations.unshift({
          chatId: message.chatId,
          propertyTitle: message.propertyTitle,
          tenantName: message.senderName,
          lastMessage: message.message,
          timestamp: message.timestamp,
          unread: true,
          messages: [message]
        });
      }

      return updatedConversations;
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      // Verificar se todos os campos necessários estão presentes
      if (!selectedConversation.chatId || !selectedConversation.tenantId || !selectedConversation.propertyId) {
        setError('Dados da conversa incompletos. Por favor, recarregue a página e tente novamente.');
        return;
      }

      // Log para debug
      console.log('Enviando mensagem:', {
        chatId: selectedConversation.chatId,
        receiverId: selectedConversation.tenantId,
        propertyId: selectedConversation.propertyId,
        message: newMessage
      });

      const response = await axios.post(
        `${apiUrl}/api/messages`,
        {
          chatId: selectedConversation.chatId,
          receiverId: selectedConversation.tenantId,
          propertyId: selectedConversation.propertyId,
          message: newMessage.trim()
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Log da resposta
      console.log('Resposta do servidor:', response.data);

      if (response.data.success) {
      socket.emit('sendMessage', {
        chatId: selectedConversation.chatId,
        message: response.data.data.message
      });

        // Atualizar a conversa selecionada com a nova mensagem
        setSelectedConversation(prev => ({
          ...prev,
          messages: [...prev.messages, response.data.data.message],
          lastMessage: newMessage,
          timestamp: new Date()
        }));

      setNewMessage('');
      } else {
        throw new Error(response.data.error || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      if (error.response) {
        // O servidor respondeu com um status de erro
        console.error('Detalhes do erro:', error.response.data);
        setError(error.response.data.error || 'Erro ao enviar mensagem. Por favor, tente novamente.');
      } else if (error.request) {
        // A requisição foi feita mas não houve resposta
        setError('Não foi possível conectar ao servidor. Verifique sua conexão.');
      } else {
        // Erro na configuração da requisição
        setError('Erro ao enviar mensagem: ' + error.message);
      }
    }
  };

  const handleSelectConversation = async (conversation) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      // Verificar se a conversa tem todos os campos necessários
      if (!conversation.chatId || !conversation.tenantId || !conversation.propertyId) {
        console.error('Dados da conversa incompletos:', conversation);
        setError('Dados da conversa incompletos. Por favor, recarregue a página e tente novamente.');
        return;
      }

      // Se já temos as mensagens na conversa, use-as
      if (conversation.messages && conversation.messages.length > 0) {
        setSelectedConversation(conversation);
        // Marcar mensagens como lidas
        socket.emit('markAsRead', conversation.chatId);
        return;
      }

      // Caso contrário, busque as mensagens do servidor
      const response = await axios.get(`${apiUrl}/api/messages/landlord/messages/${conversation.chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
      setSelectedConversation({
        ...conversation,
          messages: response.data.data.messages || []
      });

      // Marcar mensagens como lidas
      socket.emit('markAsRead', conversation.chatId);
      } else {
        throw new Error(response.data.error || 'Erro ao carregar mensagens');
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      setError('Não foi possível carregar as mensagens. Por favor, tente novamente.');
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.tenantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container className="py-4">
        <div className="d-flex justify-content-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="g-4">
        {/* Lista de conversas */}
        <Col md={4} lg={3}>
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">Conversas</h5>
              <InputGroup className="mt-2">
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar conversas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="conversation-list" style={{ height: 'calc(100vh - 250px)', overflowY: 'auto' }}>
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted mb-0">Nenhuma conversa encontrada</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.chatId}
                      className={`conversation-item p-3 border-bottom cursor-pointer ${
                        selectedConversation?.chatId === conversation.chatId ? 'bg-light' : ''
                      }`}
                      onClick={() => handleSelectConversation(conversation)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-center">
                        <FaUserCircle className="fs-4 me-2 text-primary" />
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">{conversation.propertyTitle}</h6>
                            {conversation.unread && (
                              <span className="badge bg-primary rounded-pill">Nova</span>
                            )}
                          </div>
                          <p className="text-muted small mb-0">{conversation.tenantName}</p>
                          <p className="text-muted small mb-0 text-truncate">
                            {conversation.lastMessage}
                          </p>
                          <small className="text-muted">
                            {new Date(conversation.timestamp).toLocaleString()}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Área de mensagens */}
        <Col md={8} lg={9}>
          <Card className="h-100 shadow-sm">
            {error && (
              <Alert variant="danger" className="m-2">
                {error}
              </Alert>
            )}
            
            {selectedConversation ? (
              <>
                <Card.Header className="bg-white border-bottom">
                  <div className="d-flex align-items-center">
                    <FaUserCircle className="fs-4 me-2 text-primary" />
                    <div>
                      <h5 className="mb-0">{selectedConversation.propertyTitle}</h5>
                      <p className="text-muted small mb-0">{selectedConversation.tenantName}</p>
                    </div>
                  </div>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="messages-container p-4" style={{ height: 'calc(100vh - 350px)', overflowY: 'auto' }}>
                    {selectedConversation.messages.map((message, index) => (
                      <div
                        key={index}
                        className={`message-wrapper mb-3 ${
                          message.senderId._id === selectedConversation.tenantId ? 'text-start' : 'text-end'
                        }`}
                      >
                        <div
                          className={`message-bubble d-inline-block p-3 rounded-3 ${
                            message.senderId._id === selectedConversation.tenantId
                              ? 'bg-light text-dark'
                              : 'bg-primary text-white'
                          }`}
                          style={{ maxWidth: '75%' }}
                        >
                          <div className="message-sender small mb-1">
                            {message.senderId.name}
                          </div>
                          <div className="message-text">
                            {message.message}
                          </div>
                          <div
                            className={`message-time small mt-1 ${
                              message.senderId._id === selectedConversation.tenantId
                                ? 'text-muted'
                                : 'text-white-50'
                            }`}
                          >
                            {new Date(message.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
                <Card.Footer className="bg-white border-top">
                  <Form onSubmit={handleSendMessage}>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Digite sua mensagem..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                      />
                      <Button type="submit" variant="primary">
                        <FaPaperPlane />
                      </Button>
                    </InputGroup>
                  </Form>
                </Card.Footer>
              </>
            ) : (
              <div className="h-100 d-flex align-items-center justify-content-center">
                <div className="text-center text-muted">
                  <FaUserCircle className="fs-1 mb-3" />
                  <h5>Selecione uma conversa</h5>
                  <p className="mb-0">Escolha uma conversa para começar a trocar mensagens</p>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Messages; 