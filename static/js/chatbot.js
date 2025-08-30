/**
 * HealthCare AI - Chatbot Implementation
 * Handles AI chat interface and interactions
 */

// Chatbot state
let chatHistory = [];
let isTyping = false;
let chatContainer = null;
let messageInput = null;
let sendButton = null;

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeChatbot();
    setupChatEventListeners();
    loadChatHistory();
});

/**
 * Initialize chatbot elements and state
 */
function initializeChatbot() {
    chatContainer = document.getElementById('chatMessages');
    messageInput = document.getElementById('messageInput');
    sendButton = document.getElementById('sendButton');
    
    if (!chatContainer || !messageInput || !sendButton) {
        console.error('Chatbot elements not found');
        return;
    }
    
    // Focus on input when page loads
    messageInput.focus();
    
    // Auto-scroll to bottom
    scrollToBottom();
}

/**
 * Setup event listeners for chat functionality
 */
function setupChatEventListeners() {
    // Chat form submission
    const chatForm = document.getElementById('chatForm');
    if (chatForm) {
        chatForm.addEventListener('submit', handleChatSubmit);
    }
    
    // Quick question buttons
    const quickQuestions = document.querySelectorAll('.quick-question');
    quickQuestions.forEach(button => {
        button.addEventListener('click', function() {
            const question = this.getAttribute('data-question');
            if (question) {
                sendMessage(question);
            }
        });
    });
    
    // Enter key in input
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleChatSubmit(e);
            }
        });
        
        // Show typing indicator when user is typing
        let typingTimer;
        messageInput.addEventListener('input', function() {
            clearTimeout(typingTimer);
            updateSendButton();
        });
    }
}

/**
 * Handle chat form submission
 */
function handleChatSubmit(e) {
    e.preventDefault();
    
    if (isTyping) return;
    
    const message = messageInput.value.trim();
    if (!message) return;
    
    sendMessage(message);
}

/**
 * Send a message to the chatbot
 */
async function sendMessage(message) {
    if (isTyping || !message.trim()) return;
    
    // Clear input and disable send button
    messageInput.value = '';
    updateSendButton();
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Send message to backend
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Hide typing indicator
        hideTypingIndicator();
        
        if (data.error) {
            addMessageToChat('Sorry, I encountered an error. Please try again.', 'bot', 'error');
        } else {
            addMessageToChat(data.response, 'bot');
        }
        
    } catch (error) {
        console.error('Chat API error:', error);
        hideTypingIndicator();
        
        let errorMessage = 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.';
        
        if (error.message.includes('401')) {
            errorMessage = 'Your session has expired. Please refresh the page and try again.';
        } else if (error.message.includes('500')) {
            errorMessage = 'I\'m experiencing some technical difficulties. Please try again later.';
        }
        
        addMessageToChat(errorMessage, 'bot', 'error');
    }
    
    // Re-focus on input
    messageInput.focus();
}

/**
 * Add message to chat interface
 */
function addMessageToChat(message, sender, type = 'normal') {
    if (!chatContainer) return;
    
    const messageId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const timestamp = new Date();
    const timeString = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Create message container
    const messageContainer = document.createElement('div');
    messageContainer.className = `message-container ${sender}-message slide-up`;
    messageContainer.id = messageId;
    
    // Create message content
    let messageHTML;
    
    if (sender === 'user') {
        messageHTML = `
            <div class="d-flex align-items-start justify-content-end">
                <div class="message-content me-3">
                    <div class="message-bubble user">
                        <p class="mb-0">${escapeHtml(message)}</p>
                    </div>
                    <small class="text-muted d-block text-end mt-1">${timeString}</small>
                </div>
                <div class="avatar-sm bg-primary rounded-circle flex-shrink-0">
                    <i class="fas fa-user text-white"></i>
                </div>
            </div>
        `;
    } else {
        const iconClass = type === 'error' ? 'fas fa-exclamation-triangle' : 'fas fa-robot';
        const bgClass = type === 'error' ? 'bg-danger' : 'bg-info';
        
        messageHTML = `
            <div class="d-flex align-items-start">
                <div class="avatar-sm ${bgClass} rounded-circle me-3 flex-shrink-0">
                    <i class="${iconClass} text-white"></i>
                </div>
                <div class="message-content">
                    <div class="message-bubble bot ${type === 'error' ? 'border border-danger' : ''}">
                        ${formatBotMessage(message)}
                    </div>
                    <small class="text-muted d-block mt-1">${timeString}</small>
                </div>
            </div>
        `;
    }
    
    messageContainer.innerHTML = messageHTML;
    chatContainer.appendChild(messageContainer);
    
    // Add to chat history
    chatHistory.push({
        id: messageId,
        message: message,
        sender: sender,
        timestamp: timestamp,
        type: type
    });
    
    // Save to local storage
    saveChatHistory();
    
    // Scroll to bottom
    scrollToBottom();
}

/**
 * Format bot messages with proper HTML
 */
function formatBotMessage(message) {
    // Escape HTML first
    let formatted = escapeHtml(message);
    
    // Convert line breaks to <br>
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Convert **bold** to <strong>
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *italic* to <em>
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert numbered lists
    formatted = formatted.replace(/^\d+\.\s/gm, '<br>$&');
    
    // Convert bullet points
    formatted = formatted.replace(/^[-•]\s/gm, '<br>• ');
    
    return `<p class="mb-0">${formatted}</p>`;
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
    if (isTyping) return;
    
    isTyping = true;
    updateSendButton();
    
    const typingContainer = document.createElement('div');
    typingContainer.className = 'message-container bot-message typing-indicator-container';
    typingContainer.id = 'typing-indicator';
    
    typingContainer.innerHTML = `
        <div class="d-flex align-items-start">
            <div class="avatar-sm bg-info rounded-circle me-3 flex-shrink-0">
                <i class="fas fa-robot text-white"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble bot">
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    chatContainer.appendChild(typingContainer);
    scrollToBottom();
}

/**
 * Hide typing indicator
 */
function hideTypingIndicator() {
    isTyping = false;
    updateSendButton();
    
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

/**
 * Update send button state
 */
function updateSendButton() {
    if (!sendButton || !messageInput) return;
    
    const hasMessage = messageInput.value.trim().length > 0;
    
    if (isTyping) {
        sendButton.disabled = true;
        sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    } else if (hasMessage) {
        sendButton.disabled = false;
        sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
    } else {
        sendButton.disabled = true;
        sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
    }
}

/**
 * Scroll chat to bottom
 */
function scrollToBottom() {
    if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

/**
 * Clear chat history
 */
function clearChat() {
    if (confirm('Are you sure you want to clear the chat history?')) {
        chatHistory = [];
        if (chatContainer) {
            // Keep only the welcome message
            const welcomeMessage = chatContainer.querySelector('.bot-message');
            chatContainer.innerHTML = '';
            if (welcomeMessage) {
                chatContainer.appendChild(welcomeMessage);
            }
        }
        saveChatHistory();
    }
}

/**
 * Save chat history to local storage
 */
function saveChatHistory() {
    try {
        // Only save the last 50 messages to prevent storage issues
        const recentHistory = chatHistory.slice(-50);
        localStorage.setItem('healthai_chat_history', JSON.stringify(recentHistory));
    } catch (error) {
        console.error('Error saving chat history:', error);
    }
}

/**
 * Load chat history from local storage
 */
function loadChatHistory() {
    try {
        const saved = localStorage.getItem('healthai_chat_history');
        if (saved) {
            const history = JSON.parse(saved);
            
            // Only restore history if it's from today
            const today = new Date().toDateString();
            const recentHistory = history.filter(msg => {
                const msgDate = new Date(msg.timestamp).toDateString();
                return msgDate === today;
            });
            
            if (recentHistory.length > 0) {
                chatHistory = recentHistory;
                // Note: We don't restore messages to UI to keep it clean
                // But we keep the history for context
            }
        }
    } catch (error) {
        console.error('Error loading chat history:', error);
    }
}

/**
 * Export chat conversation
 */
function exportChat() {
    if (chatHistory.length === 0) {
        alert('No chat history to export.');
        return;
    }
    
    let exportText = 'HealthCare AI - Chat Conversation\n';
    exportText += '=====================================\n\n';
    
    chatHistory.forEach(msg => {
        const timestamp = new Date(msg.timestamp).toLocaleString();
        const sender = msg.sender === 'user' ? 'You' : 'AI Assistant';
        exportText += `[${timestamp}] ${sender}: ${msg.message}\n\n`;
    });
    
    // Create and download file
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `healthcare-ai-chat-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Handle connection errors
 */
function handleConnectionError() {
    addMessageToChat(
        'I\'m having trouble connecting to the server. Please check your internet connection and try again.',
        'bot',
        'error'
    );
}

// Export functions for global use
window.HealthChatbot = {
    sendMessage,
    clearChat,
    exportChat,
    addMessageToChat,
    formatBotMessage
};

// Handle page visibility change to manage connection
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Page is hidden, potentially pause any ongoing requests
        if (isTyping) {
            hideTypingIndicator();
        }
    }
});

// Handle online/offline status
window.addEventListener('online', function() {
    if (chatContainer && !isTyping) {
        const statusMessage = document.createElement('div');
        statusMessage.className = 'text-center text-success small my-2';
        statusMessage.innerHTML = '<i class="fas fa-wifi me-1"></i>Connection restored';
        chatContainer.appendChild(statusMessage);
        
        setTimeout(() => statusMessage.remove(), 3000);
        scrollToBottom();
    }
});

window.addEventListener('offline', function() {
    if (chatContainer) {
        const statusMessage = document.createElement('div');
        statusMessage.className = 'text-center text-warning small my-2';
        statusMessage.innerHTML = '<i class="fas fa-wifi-slash me-1"></i>Connection lost - messages will be sent when online';
        chatContainer.appendChild(statusMessage);
        scrollToBottom();
    }
});
