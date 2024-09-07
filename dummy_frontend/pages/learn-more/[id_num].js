import React from 'react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import { styled } from '@mui/system';
import { motion, useAnimation } from 'framer-motion';
import "next/router"
const ChatContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: 600,
  height: 400,
  overflowY: 'auto',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const MessageBubble = styled(Box)(({ theme, isUser }) => ({
  maxWidth: '70%',
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(1),
  backgroundColor: isUser ? theme.palette.primary.main : theme.palette.grey[200],
  color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  alignSelf: isUser ? 'flex-end' : 'flex-start',
}));

const AnimatedText = ({ text }) => {
  const controls = useAnimation();
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text[index]);
        index++;
      } else {
        clearInterval(timer);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [text]);

  useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
  }, [displayedText, controls]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      transition={{ duration: 0.5 }}
    >
      {displayedText}
    </motion.div>
  );
};

export default function LearnMorePage() {
  const [messages, setMessages] = useState([]);
  const router = useRouter();
  const { id_num } = router.query;
  const [input, setInput] = useState('');
  const chatContainerRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const response = await axios.post('/api/chat', { message: input });
      const botMessage = { text: response.data.message, isUser: false };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Learn More
      </Typography>
      <ChatContainer ref={chatContainerRef}>
        {messages.map((message, index) => (
          <MessageBubble key={index} isUser={message.isUser}>
            {message.isUser ? (
              message.text
            ) : (
              <AnimatedText text={message.text} />
            )}
          </MessageBubble>
        ))}
      </ChatContainer>
      <Box sx={{ display: 'flex' }}>
        <TextField
          fullWidth
          variant="outlined"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message here..."
        />
        <Button variant="contained" onClick={sendMessage} sx={{ ml: 1 }}>
          Send
        </Button>
      </Box>
    </Box>
  );
}