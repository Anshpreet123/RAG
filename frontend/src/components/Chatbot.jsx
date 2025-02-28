import { useState } from "react";
import axios from "axios";
import { FaPaperPlane } from "react-icons/fa";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");

  const sendMessage = async () => {
    if (!query.trim()) return;

    const newMessages = [...messages, { text: query, sender: "user" }];
    setMessages(newMessages);
    setQuery("");

    try {
      const response = await axios.post("http://localhost:8000/query", { query });
      setMessages([...newMessages, { text: response.data.response, sender: "bot" }]);
      console.log(response.data.response);
    } catch (error) {
      console.error("Error fetching response:", error);
    }
  };

  return (
    <div className="flex flex-col h-[400px] border p-4 rounded-md">
      <div className="flex-1 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`p-2 my-1 rounded-md ${msg.sender === "user" ? "bg-blue-500 text-white self-end" : "bg-gray-200"}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex mt-2">
        <input className="flex-1 p-2 border rounded-md" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask a question..." />
        <button onClick={sendMessage} className="ml-2 p-2 bg-blue-500 text-white rounded-md">
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
