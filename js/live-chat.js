/* ============================================
   RIOCITY - Live Chat Modal Logic
   Handles dynamic injection, visibility, and messaging
   ============================================ */

const LiveChat = {
    initialized: false,
    elements: {},

    // Initialize the chat modal (inject HTML)
    init() {
        if (this.initialized) return;

        // Inject CSS if not present
        if (!document.querySelector('link[href="css/live-chat.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'css/live-chat.css';
            document.head.appendChild(link);
        }

        // Create Modal HTML
        this.createModalHTML();

        // Cache elements
        this.elements = {
            modal: document.getElementById('chatModal'),
            messages: document.getElementById('chatMessages'),
            input: document.getElementById('chatInput'),
            sendBtn: document.getElementById('btnSend'),
            closeBtn: document.getElementById('btnCloseChat'),
            minimizeBtn: document.getElementById('btnMinimizeChat'),
            pills: document.querySelectorAll('.suggest-pill')
        };

        // Attach Event Listeners
        this.attachEvents();

        this.initialized = true;
    },

    createModalHTML() {
        const modalContainer = document.createElement('div');
        modalContainer.id = 'chatModal';
        modalContainer.className = 'chat-modal-container';
        modalContainer.innerHTML = `
            <div class="chat-header">
                <div class="chat-agent-info">
                    <img src="https://pksoftcdn.azureedge.net/media/image%207-202411081421034166.png" alt="RioCity Logo" class="chat-header-logo">
                    <div class="agent-details">
                        <h3>RioCity Support</h3>
                        <span class="agent-status-text">Online • Keeps it exciting!</span>
                    </div>
                </div>
                <div class="chat-header-actions">
                    <button class="chat-action-btn" id="btnMinimizeChat" title="Minimize"><i class="fas fa-minus"></i></button>
                    <button class="chat-action-btn" id="btnCloseChat" title="Close"><i class="fas fa-times"></i></button>
                </div>
            </div>

            <div class="chat-messages" id="chatMessages">
                <div class="chat-date-divider"><span class="chat-date-pill">Today</span></div>
                
                <!-- System Welcome -->
                <div class="message-wrapper system">
                    <div class="message-header"><span class="message-sender system">System</span></div>
                    <div class="message-bubble">
                        <div class="message-content">
                            <h4>Welcome to RioCity!</h4>
                            <p>🎰 The #1 trusted casino.</p>
                            <p>How can we help you win big today?</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="chat-input-area">
                <div class="suggested-pills-scroll" id="suggestedPills">
                    <button class="suggest-pill">I'm New Here</button>
                    <button class="suggest-pill">Deposit Help</button>
                    <button class="suggest-pill">Bonus Claim</button>
                    <button class="suggest-pill">Login Issue</button>
                </div>

                <div class="input-wrapper">
                    <button class="chat-tool-btn"><i class="fas fa-paperclip"></i></button>
                    <input type="text" class="chat-input" id="chatInput" placeholder="Type a message..." autocomplete="off">
                    <button class="chat-tool-btn"><i class="fas fa-smile"></i></button>
                    <button class="btn-send" id="btnSend"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        `;
        document.body.appendChild(modalContainer);
    },

    attachEvents() {
        // Close/Minimize
        if (this.elements.closeBtn) this.elements.closeBtn.addEventListener('click', () => this.close());
        if (this.elements.minimizeBtn) this.elements.minimizeBtn.addEventListener('click', () => this.close());

        // Send Message
        if (this.elements.sendBtn) this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        if (this.elements.input) this.elements.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Pills
        if (this.elements.pills) {
            this.elements.pills.forEach(pill => {
                pill.addEventListener('click', () => {
                    this.sendMessage(pill.textContent);
                });
            });
        }
    },

    open() {
        if (!this.initialized) this.init();
        // Small delay to ensure render
        setTimeout(() => {
            if (this.elements.modal) {
                this.elements.modal.classList.add('active');
                if (this.elements.input) this.elements.input.focus();
            }
        }, 10);

        // Use defined global function if available
        if (window.closeFloatingIcon) {
            // Logic to close other things if needed
        }
    },

    close() {
        if (this.elements.modal) {
            this.elements.modal.classList.remove('active');
        }
    },

    sendMessage(text = null) {
        const content = text || this.elements.input.value;
        if (!content || !content.trim()) return;

        this.appendMessage(content, 'user');
        if (this.elements.input) this.elements.input.value = '';
        this.scrollToBottom();

        this.simulateReply(content);
    },

    appendMessage(text, sender) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const div = document.createElement('div');
        div.className = `message-wrapper ${sender}`;
        const name = sender === 'user' ? 'You' : 'Sarah';

        div.innerHTML = `
            <div class="message-header">
                <span class="message-sender ${sender}">${name}</span>
                <span class="message-time">${time}</span>
            </div>
            <div class="message-bubble">${text}</div>
        `;
        this.elements.messages.appendChild(div);
        this.scrollToBottom();
    },

    scrollToBottom() {
        if (this.elements.messages) {
            this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
        }
    },

    simulateReply(userText) {
        // Simple auto-reply logic
        setTimeout(() => {
            let reply = "Thanks! An agent will join shortly.";
            const lower = userText.toLowerCase();

            if (lower.includes('deposit')) reply = "For deposits, please verify your account level first in the User Center.";
            else if (lower.includes('bonus')) reply = "Check our Promotions page for the latest 250% Welcome Bonus details!";
            else if (lower.includes('login')) reply = "If you're having trouble logging in, please try resetting your password.";

            this.appendMessage(reply, 'agent');
        }, 1200);
    }
};

// Expose globally
window.openLiveChatModal = () => LiveChat.open();
window.closeLiveChatModal = () => LiveChat.close();

// Check if we should auto-open (e.g. from hash)
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.hash === '#livechat') {
        LiveChat.open();
    }
});
