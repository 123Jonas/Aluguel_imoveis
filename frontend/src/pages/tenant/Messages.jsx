import React, { useState } from 'react';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  // Aqui você pode adicionar um useEffect para carregar as conversas do backend
  // useEffect(() => {
  //   // Carregar conversas
  // }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedConversation) {
      // Aqui você pode adicionar a lógica para enviar a mensagem ao backend
      console.log('Enviando mensagem:', {
        conversationId: selectedConversation.id,
        message: newMessage
      });
      setNewMessage('');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mensagens</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Lista de conversas */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-3 border-b">
            <h2 className="font-semibold">Conversas</h2>
          </div>
          <div className="h-[calc(100vh-250px)] overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Nenhuma conversa encontrada.</p>
              </div>
            ) : (
              <div>
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <h3 className="font-semibold">{conversation.propertyTitle}</h3>
                    <p className="text-sm text-gray-600">{conversation.landlordName}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Área de mensagens */}
        <div className="md:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          {selectedConversation ? (
            <>
              <div className="p-3 border-b">
                <h2 className="font-semibold">{selectedConversation.propertyTitle}</h2>
                <p className="text-sm text-gray-600">{selectedConversation.landlordName}</p>
              </div>
              <div className="h-[calc(100vh-350px)] overflow-y-auto p-4">
                {selectedConversation.messages?.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 ${
                      message.isMine ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block p-3 rounded-lg ${
                        message.isMine
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {message.content}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(message.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 p-2 border rounded"
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Enviar
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-600">
                Selecione uma conversa para ver as mensagens
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages; 