/* ============================================
   CHATBOT — Groq AI Integration
   ============================================ */

(function () {
  'use strict';

  const GROQ_MODEL = 'llama-3.3-70b-versatile';
  const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

  const SYSTEM_PROMPT = `You are the AI assistant for Suprit Das's freelancer portfolio website. You speak on behalf of Suprit. Be friendly, professional, concise, and helpful.

Here is Suprit's information:

**About:**
- Name: Suprit Das
- Role: Full-Stack Designer & Developer (Freelancer)
- Experience: 8+ years in design & development
- Projects Completed: 200+
- Happy Clients: 50+
- Design Awards: 15
- Location: Hyderabad, India
- Email: archersupritdas@gmail.com
- Phone: +91 9133023620
- LinkedIn: www.linkedin.com/in/suprit-das
- GitHub: https://github.com/suprit-06
- Appointment Availability: Weekdays 4 PM to 9 PM, Sundays 11 AM to 8 PM (IST)
- Response Time: Usually within 24 hours

**Services:**
1. UI/UX Design — Starting at ₹2,50,000 (user-centric interfaces, research-driven design)
2. Web Development — Starting at ₹4,00,000 (modern frameworks, clean code, scalable apps)
3. Brand Identity — Starting at ₹2,00,000 (logos, brand guides, cohesive systems)
4. Mobile Apps — Starting at ₹6,50,000 (React Native, Flutter, cross-platform)
5. Motion Design — Starting at ₹1,25,000 (micro-interactions, Lottie, CSS, WebGL)
6. Tech Consulting — ₹15,000/hour (tech stack guidance, architecture, digital transformation)

**Pricing Plans:**
- Starter: ₹2.5L/project — Landing page design, responsive dev, basic SEO, 2 revision rounds, 1 week delivery
- Professional: ₹6.5L/project (Most Popular) — Multi-page design system, full-stack dev, CMS integration, advanced animations, unlimited revisions, 3 week delivery
- Enterprise: Custom pricing — End-to-end product design, scalable architecture, team augmentation, priority support, dedicated Slack channel

**Notable Projects:**
1. NovaPay — Digital Banking Platform (Fintech, UI/UX, React) — Served 2M+ users, increased engagement by 40%
2. AuraFit — Wellness Tracker (Health, Mobile) — 100K+ downloads in first month
3. QuantumOS — SaaS Dashboard (SaaS, Full-Stack) — Enterprise analytics with real-time data
4. Echo Studio — Music Platform (Music, Branding) — Full brand identity & web platform
5. Verde — Sustainable Fashion (E-Commerce, Shopify) — 65% increase in conversions

**Client Testimonials:**
- Sarah Kim (CEO, NovaPay): Praised attention to detail and technical execution
- Marcus Rivera (Founder, AuraFit): Called Suprit a true partner who delivers beyond expectations
- Elena Petrova (CMO, Verde Fashion): 65% conversion rate increase, recommends highly

**Guidelines for responses:**
- Keep answers short (2-4 sentences max unless asked for detail)
- If asked about hiring or starting a project, direct them to the contact form on the site
- Be enthusiastic but not pushy
- Use emojis sparingly (1-2 per message max)
- If asked something unrelated to Suprit's services, politely redirect
- Never make up information not provided above`;

  var conversationHistory = [];
  var isOpen = false;
  var isSending = false;

  function getApiKey() {
    try {
      return localStorage.getItem('groq_api_key') || '';
    } catch (e) {
      return '';
    }
  }

  function setApiKey(key) {
    try {
      localStorage.setItem('groq_api_key', key);
    } catch (e) {
      console.warn('Could not save API key to localStorage');
    }
  }

  function init() {
    var toggleBtn = document.getElementById('chatbotToggle');
    var closeBtn = document.getElementById('chatbotClose');
    var chatForm = document.getElementById('chatbotForm');
    var apiSaveBtn = document.getElementById('chatbotApiSave');
    var suggestions = document.querySelectorAll('.chatbot__suggestion');

    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleChat();
    });

    closeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      closeChat();
    });

    chatForm.addEventListener('submit', function (e) {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit();
    });

    apiSaveBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      handleApiKeySave();
    });

    // Also allow Enter key on the API key input
    var apiKeyInput = document.getElementById('chatbotApiKey');
    if (apiKeyInput) {
      apiKeyInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleApiKeySave();
        }
      });
    }

    suggestions.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var msg = btn.getAttribute('data-msg');
        if (msg && !isSending) {
          hideSuggestions();
          sendMessage(msg);
        }
      });
    });

    console.log('[Chatbot] Initialized successfully');
  }

  function toggleChat() {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  }

  function openChat() {
    var chatWindow = document.getElementById('chatbotWindow');
    var chatIcon = document.querySelector('.chatbot__toggle-icon--chat');
    var closeIcon = document.querySelector('.chatbot__toggle-icon--close');
    var apiModal = document.getElementById('chatbotApiModal');

    isOpen = true;
    chatWindow.classList.add('chatbot__window--open');
    chatIcon.style.display = 'none';
    closeIcon.style.display = 'block';

    if (!getApiKey()) {
      apiModal.classList.add('chatbot__api-modal--visible');
      setTimeout(function () {
        var keyInput = document.getElementById('chatbotApiKey');
        if (keyInput) keyInput.focus();
      }, 400);
    } else {
      setTimeout(function () {
        var chatInput = document.getElementById('chatbotInput');
        if (chatInput) chatInput.focus();
      }, 400);
    }
  }

  function closeChat() {
    var chatWindow = document.getElementById('chatbotWindow');
    var chatIcon = document.querySelector('.chatbot__toggle-icon--chat');
    var closeIcon = document.querySelector('.chatbot__toggle-icon--close');
    var apiModal = document.getElementById('chatbotApiModal');

    isOpen = false;
    chatWindow.classList.remove('chatbot__window--open');
    chatIcon.style.display = 'block';
    closeIcon.style.display = 'none';
    apiModal.classList.remove('chatbot__api-modal--visible');
  }

  function handleApiKeySave() {
    var input = document.getElementById('chatbotApiKey');
    var key = input.value.trim();
    var modal = document.getElementById('chatbotApiModal');

    if (!key) {
      input.style.borderColor = '#ff4444';
      input.focus();
      return;
    }

    setApiKey(key);
    modal.classList.remove('chatbot__api-modal--visible');
    input.value = '';
    input.style.borderColor = '';

    appendMessage('bot', 'API key saved! 🎉 You\'re all set. Ask me anything about Suprit\'s services!');

    setTimeout(function () {
      var chatInput = document.getElementById('chatbotInput');
      if (chatInput) chatInput.focus();
    }, 300);

    console.log('[Chatbot] API key saved');
  }

  function handleSubmit() {
    var input = document.getElementById('chatbotInput');
    var msg = input.value.trim();
    if (!msg || isSending) return;

    input.value = '';
    sendMessage(msg);
  }

  function hideSuggestions() {
    var el = document.getElementById('chatbotSuggestions');
    if (el) el.style.display = 'none';
  }

  function sendMessage(text) {
    var apiKey = getApiKey();
    var apiModal = document.getElementById('chatbotApiModal');

    if (!apiKey) {
      apiModal.classList.add('chatbot__api-modal--visible');
      return;
    }

    if (isSending) return;
    isSending = true;

    appendMessage('user', text);
    hideSuggestions();

    conversationHistory.push({ role: 'user', content: text });

    var typingEl = showTypingIndicator();

    callGroq(apiKey, conversationHistory)
      .then(function (response) {
        removeTypingIndicator(typingEl);
        isSending = false;

        if (response) {
          appendMessage('bot', response);
          conversationHistory.push({ role: 'assistant', content: response });
        }
      })
      .catch(function (error) {
        removeTypingIndicator(typingEl);
        isSending = false;

        var errMsg = error.message || String(error);
        console.error('[Chatbot] Error:', errMsg);

        if (errMsg.indexOf('API_KEY_INVALID') !== -1 ||
            errMsg.indexOf('401') !== -1 ||
            errMsg.indexOf('403') !== -1) {
          appendMessage('bot', '❌ API key error. Please check your key and try again.');
          localStorage.removeItem('groq_api_key');
          setTimeout(function () {
            apiModal.classList.add('chatbot__api-modal--visible');
          }, 1500);
        } else if (errMsg.indexOf('429') !== -1 || errMsg.toLowerCase().indexOf('quota') !== -1) {
          appendMessage('bot', '⚠️ Quota exceeded for this API key. Please use a different key or wait a moment.');
          localStorage.removeItem('groq_api_key');
          setTimeout(function () {
            apiModal.classList.add('chatbot__api-modal--visible');
          }, 2000);
        } else {
          appendMessage('bot', '⚠️ Something went wrong. Please try again.');
        }

        // Remove the failed user message from history
        conversationHistory.pop();
      });
  }

  function callGroq(apiKey, history) {
    var messages = [{ role: 'system', content: SYSTEM_PROMPT }].concat(history);

    var body = {
      model: GROQ_MODEL,
      messages: messages,
      temperature: 0.7,
      max_tokens: 512,
      top_p: 0.9,
    };

    return fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify(body)
    })
    .then(function (res) {
      if (!res.ok) {
        return res.text().then(function (errorText) {
          throw new Error(res.status + ': ' + errorText);
        });
      }
      return res.json();
    })
    .then(function (data) {
      console.log('[Chatbot] API response:', data);

      if (data.choices &&
          data.choices.length > 0 &&
          data.choices[0].message &&
          data.choices[0].message.content) {
        return data.choices[0].message.content;
      }

      throw new Error('No valid response in API data');
    });
  }

  function appendMessage(sender, text) {
    var container = document.getElementById('chatbotMessages');
    if (!container) return;

    var div = document.createElement('div');
    div.className = 'chatbot__message chatbot__message--' + sender;

    if (sender === 'bot') {
      var formattedText = formatMarkdown(text);
      div.innerHTML =
        '<div class="chatbot__message-avatar">\u2726</div>' +
        '<div class="chatbot__message-bubble">' + formattedText + '</div>';
    } else {
      div.innerHTML =
        '<div class="chatbot__message-bubble">' + escapeHtml(text) + '</div>';
    }

    div.style.opacity = '0';
    div.style.transform = 'translateY(10px)';
    container.appendChild(div);

    // Trigger animation on next frame
    requestAnimationFrame(function () {
      div.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      div.style.opacity = '1';
      div.style.transform = 'translateY(0)';
    });

    // Scroll to bottom
    setTimeout(function () {
      container.scrollTop = container.scrollHeight;
    }, 50);
  }

  function showTypingIndicator() {
    var container = document.getElementById('chatbotMessages');
    if (!container) return null;

    var div = document.createElement('div');
    div.className = 'chatbot__message chatbot__message--bot chatbot__typing';
    div.innerHTML =
      '<div class="chatbot__message-avatar">\u2726</div>' +
      '<div class="chatbot__message-bubble chatbot__typing-bubble">' +
        '<span class="chatbot__typing-dot"></span>' +
        '<span class="chatbot__typing-dot"></span>' +
        '<span class="chatbot__typing-dot"></span>' +
      '</div>';
    container.appendChild(div);

    setTimeout(function () {
      container.scrollTop = container.scrollHeight;
    }, 50);

    return div;
  }

  function removeTypingIndicator(el) {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }

  function escapeHtml(str) {
    var temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }

  function formatMarkdown(text) {
    var html = escapeHtml(text);
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Inline code
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    return html;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
