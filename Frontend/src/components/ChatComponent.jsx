import React, { useState, useEffect, useRef } from "react";
import "./ChatComponent.css";

const ChatComponent = () => {
  const [popup, setPopup] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showInitialGreeting, setShowInitialGreeting] = useState(true);

  const handlePopup = () => {
    setPopup(!popup);
  };

  const handleQuestionChange = (event) => {
    setQuestion(event.target.value);
  };

  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmitChatForm = async (event) => {
    event.preventDefault();

    const newMessages = [...messages, { text: question, type: "question" }];
    setMessages(newMessages);
    setQuestion("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/hallo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: question }),
      });

      const data = await response.text();
      setIsLoading(false);
      setAnswer(data);
      setMessages([...newMessages, { text: data, type: "answer" }]);
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
    }
  };

  if (popup) {
    return (
      <div className="container">
      <div className="container-header">
        <button type="button" className="exit-button" onClick={handlePopup}>
          X
        </button>
        <img
          src={isLoading ? "sticker/hmmm.png" : "sticker/sticker.png"}
          alt="Example Image"
          className="image"
        />
        Terrera AG Support Bot
      </div>
      <div className="container-chat" ref={chatRef}>
        {showInitialGreeting && (
          <div className="answer">
            Hallo ich bin der Terrera AG Support Bot. Wie kann ich dir helfen?
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={message.type === "question" ? "question" : "answer"}
          >
            {message.text}
          </div>
        ))}

        {isLoading && <div className="loading"></div>}
        <div className="overlay top-overlay"></div>
        <div className="overlay bottom-overlay"></div>
      </div>
      <form className="form" onSubmit={handleSubmitChatForm}>
        <input
          className="input"
          type="text"
          placeholder="Bitte gebe deine Frage ein..."
          value={question}
          onChange={handleQuestionChange}
        />
        <button className="submit" type="submit">
          Absenden
        </button>
      </form>
    </div>
    );
  }
  return (
    <div className="popup" onClick={handlePopup}>
      <img
        src="sticker/hallo.png"
        alt="Example Image"
        className="image-popup"
      />
    </div>
  );
};

export default ChatComponent;
