import React, { useState } from 'react';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Aqui você pode adicionar um useEffect para carregar as mensagens do backend
  // useEffect(() => {
  //   // Carregar mensagens
  // }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      // Aqui você pode adicionar a lógica para enviar a mensagem ao backend
      console.log('Enviando mensagem:', newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mensagens</h1>
      
      <div className="bg-white rounded-lg shadow">
        {/* Lista de mensagens */}
        <div className="h-96 overflow-y-auto p-4 border-b">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Nenhuma mensagem encontrada.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="border rounded p-3">
                  {/* Conteúdo da mensagem */}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formulário de envio de mensagem */}
        <form onSubmit={handleSendMessage} className="p-4">
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
      </div>
    </div>
  );
};

export default Messages; 