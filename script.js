// Script do Chatbot - Versão Corrigida e Funcional

// Referências aos elementos HTML da interface
const welcomeScreen = document.getElementById('welcome-screen');
const chatScreen = document.getElementById('chat-screen');
const startButton = document.getElementById('start-button');
const secondaryStartButton = document.getElementById('secondary-start-button');
const chatContainer = document.getElementById('chat-container');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const botStatusElement = document.getElementById('bot-status');

// Estado inicial do chatbot
let state = {
    step: 0,
    data: {},
    errorCount: 0,
    completed: false,
    lastInteraction: Date.now()
};

// Variações de resposta do bot
const responseVariations = {
    invalid: [
        'Ops, sua resposta não ficou muito clara. 🤔 Para continuarmos, por favor, utilize os botões *SIM* ou *NÃO* abaixo. Agradeço sua compreensão!',
        'Hum, não consegui entender o que você quis dizer. 😕 Tente de novo, por favor, usando os botões *SIM* ou *NÃO*!',
        'Desculpe, não compreendi. 😅 Vamos lá de novo? Responda com *SIM* ou *NÃO*.'
    ],
    recebeBolsaFamiliaCaixaTem: [ 
        'Olá! 👋 Para iniciar sua simulação de empréstimo, me diga: você recebe o benefício *Bolsa Família* pelo aplicativo *Caixa Tem*?',
        'Oi! 😊 Primeiro, para sua simulação: você é beneficiário(a) do *Bolsa Família* e o recebe através do app *Caixa Tem*?'
    ],
    jaFezEmprestimo: [
        '*Passo 2 de 3:*\nÓtimo, estamos avançando! ✨ Para entender melhor seu perfil, preciso saber: você já realizou alguma *operação de crédito* (como empréstimo pessoal, consignado, financiamento, etc.) anteriormente?',
        '*Próximo passo (2/3):*\nQuase lá! 🚀 Me informe: você possui alguma *operação de crédito ativa* ou já realizou uma no passado (seja um financiamento ou outro tipo de empréstimo)?'
    ],
    pedirBancoAntigo: [
        '*Passo 2.5 de 3:*\nCerto! 😊 E em qual *banco ou instituição financeira* você realizou essa operação de crédito anterior? (Ex.: Banco do Brasil, Bradesco, Itaú, Santander, etc.)\n\nPor favor, digite o *nome completo* da instituição. Isso nos ajuda a otimizar sua simulação.',
        '*Só mais um detalhe (2.5/3):*\nPerfeito! Qual foi o *banco ou financeira* onde você fez seu último empréstimo ou financiamento? (Ex.: Caixa, Crefisa, BMG, etc.)\n\nMe diga o *nome completo*!'
    ],
    pedirCpf: [
        '*Último Passo (3 de 3):*\nEstamos quase no fim! 🎉 Para finalizarmos seu pré-cadastro e simulação, por favor, digite *apenas os 11 números* do seu *CPF*.\n\n🔒 Fique tranquilo(a), seus dados estão totalmente seguros e serão utilizados apenas para esta simulação!',
        '*Reta Final! (3/3):*\nPara concluirmos sua simulação, preciso do seu *CPF*. Por favor, envie *somente os 11 números*, sem pontos, traços ou outros caracteres especiais.\n\n🔒 Sua segurança e privacidade são nossa prioridade!'
    ],
    pedirWhatsapp: [
        'Para finalizar e nossa equipe te contatar:\n\nPor favor, informe seu número de WhatsApp com DDD para contato. Assim, podemos te apresentar as melhores condições!',
        'Último passo! Para nossa equipe entrar em contato e te passar os detalhes da sua simulação, me informe seu número de WhatsApp completo (com o DDD). Ficaremos aguardando!'
    ],
    finalSuccess: [
        '🎉 Parabéns! Seu pré-cadastro foi enviado com sucesso e estamos analisando as melhores opções para você!\n\nUm de nossos analistas entrará em contato em breve no seu WhatsApp para dar continuidade. Agradecemos a confiança e estamos animados para te ajudar! 😊',
        '✅ Tudo pronto! Seus dados foram registrados com sucesso e sua simulação está em andamento.\n\nNossa equipe já foi notificada e um analista entrará em contato com você via WhatsApp em breve para os próximos passos. Fique atento(a) às novidades! 😉'
    ],
    noCaixaTem: [
        'Ah, entendi! 😔 Para prosseguir com esta modalidade de empréstimo, é *essencial* ser beneficiário(a) do Bolsa Família e recebê-lo pelo aplicativo *Caixa Tem*. Infelizmente, não consigo seguir com a simulação agora. Agradecemos seu interesse! 📱',
        'Olá! 📲 Parece que você não é beneficiário(a) do Bolsa Família ou não o recebe via *Caixa Tem*. Para esta simulação, essa é uma condição. Agradecemos seu interesse e compreensão! 😊'
    ],
    crefisaReject: [
        'Oi! 😔 No momento, não conseguimos prosseguir com simulações relacionadas à *Crefisa* ou outras financeiras com operações semelhantes, pois nosso foco é em outras oportunidades de crédito. Agradecemos muito seu interesse e estamos à disposição para outras opções no futuro! 🚀'
    ],
    cpfInvalid: [
        'Hum... o CPF que você digitou parece inválido. 😕 Por favor, envie *apenas os 11 números* do seu CPF, sem pontos ou traços. Verifique com atenção, por favor, para que possamos continuar!',
        'Parece que há um erro no formato do CPF. ❌ Lembre-se, preciso de *apenas os 11 dígitos*, sem caracteres especiais. Pode tentar novamente? É importante para sua simulação.'
    ],
    whatsappInvalid: [
        'Hmm, esse número de WhatsApp não parece estar completo ou no formato certo. 📲 Por favor, digite seu número de WhatsApp com o DDD, por exemplo: *11987654321*. Precisamos do número correto para entrar em contato!',
        'Por favor, digite um número de WhatsApp válido, incluindo o DDD (ex: 21999998888). Assim podemos garantir que nossa equipe consiga te encontrar para finalizar o processo.'
    ],
    errorGeneric: [
        'Ops! 😥 Aconteceu um imprevisto aqui do meu lado e não consegui processar sua mensagem. Por favor, tente novamente mais tarde.',
        'Ah, não! 😟 Um erro inesperado ocorreu. Não se preocupe, já estou verificando! Por favor, aguarde um pouco e tente de novo.'
    ]
};

// Funções auxiliares
function addMessageToChat(message, isUser = false) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-message');
    msgDiv.classList.add(isUser ? 'user-message' : 'bot-message');
    msgDiv.innerHTML = message.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function getRandomResponse(type) {
    const variations = responseVariations[type];
    if (variations && Array.isArray(variations) && variations.length > 0) {
        return variations[Math.floor(Math.random() * variations.length)];
    }
    return responseVariations.errorGeneric[0];
}

function isValidCPF(cpf) {
    cpf = String(cpf).replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let sum = 0;
    let remainder;
    
    for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    sum = 0;
    
    for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    return true;
}

function simulateTyping(callback, minDelay = 1000, maxDelay = 2500) {
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('typing-indicator');
    typingIndicator.innerHTML = 'Amélia está digitando<span>...</span>';
    chatContainer.appendChild(typingIndicator);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    if (botStatusElement) {
        botStatusElement.textContent = 'Digitando...';
    }

    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

    setTimeout(() => {
        typingIndicator.remove();
        if (botStatusElement) {
            botStatusElement.textContent = 'Online';
        }
        callback();
    }, delay);
}

function displayQuickReplyButtons(options) {
    if (messageInput) {
        messageInput.classList.add('hidden');
        messageInput.disabled = true;
    }
    if (sendButton) {
        sendButton.classList.add('hidden');
        sendButton.disabled = true;
    }

    const buttonsWrapper = document.createElement('div');
    buttonsWrapper.classList.add('quick-reply-options');

    options.forEach(optionText => {
        const button = document.createElement('button');
        button.classList.add('quick-reply-button');
        button.textContent = optionText;
        button.dataset.value = optionText.toLowerCase();
        buttonsWrapper.appendChild(button);
    });

    chatContainer.appendChild(buttonsWrapper);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function hideQuickReplyButtons() {
    const oldButtonsWrappers = chatContainer.querySelectorAll('.quick-reply-options');
    oldButtonsWrappers.forEach(wrapper => {
        wrapper.remove();
    });

    if (messageInput) {
        messageInput.classList.remove('hidden');
        messageInput.disabled = false;
    }
    if (sendButton) {
        sendButton.classList.remove('hidden');
        sendButton.disabled = false;
    }
}

function startChatFlow() {
    console.log('Iniciando fluxo do chat...');
    
    if (welcomeScreen) {
        welcomeScreen.classList.remove('active');
        welcomeScreen.classList.add('hidden');
    }
    if (chatScreen) {
        chatScreen.classList.add('active');
        chatScreen.classList.remove('hidden');
    }

    if (chatContainer) {
        chatContainer.innerHTML = '';
    }

    state = { step: 1, data: {}, errorCount: 0, completed: false, lastInteraction: Date.now() };
    localStorage.setItem('chatbotState', JSON.stringify(state));
    
    hideQuickReplyButtons();

    simulateTyping(() => {
        addMessageToChat(getRandomResponse('recebeBolsaFamiliaCaixaTem'));
        displayQuickReplyButtons(['Sim', 'Não']);
    });

    if (typeof fbq === 'function') {
        fbq('trackCustom', 'StartChatProcess', {
            content_name: 'Simular Emprestimo Bolsa Familia',
            content_category: 'Lead Generation',
            value: 1,
            currency: 'BRL'
        });
    }
}

async function processUserMessage(userMessage) {
    addMessageToChat(userMessage, true);
    if (messageInput) {
        messageInput.value = '';
    }

    const cleanedText = userMessage.trim().toLowerCase();

    if (state.completed) {
        const restartKeywords = ['reiniciar', 'recomeçar', 'inicio', 'começar', 'resetar'];
        if (restartKeywords.some(k => cleanedText.includes(k))) {
            state = { step: 1, data: {}, errorCount: 0, completed: false, lastInteraction: Date.now() };
            hideQuickReplyButtons();
            simulateTyping(() => {
                addMessageToChat('Ok, vamos começar de novo!');
                addMessageToChat(getRandomResponse('recebeBolsaFamiliaCaixaTem'));
                displayQuickReplyButtons(['Sim', 'Não']);
                localStorage.setItem('chatbotState', JSON.stringify(state));
            });
        }
        return;
    }

    if (state.errorCount >= 3) {
        simulateTyping(() => addMessageToChat('Muitas tentativas inválidas. Nossa equipe entrará em contato.'));
        state.completed = true;
        hideQuickReplyButtons();
        localStorage.setItem('chatbotState', JSON.stringify(state));
        return;
    }

    state.lastInteraction = Date.now();
    let responseToSend = '';

    switch (state.step) {
        case 1:
            if (cleanedText === 'sim') {
                state.data.recebeBolsaFamiliaCaixaTem = 'sim';
                state.step = 3;
                responseToSend = getRandomResponse('jaFezEmprestimo');
                simulateTyping(() => { 
                    addMessageToChat(responseToSend); 
                    displayQuickReplyButtons(['Sim', 'Não']); 
                });
            } else if (cleanedText === 'não') {
                state.data.recebeBolsaFamiliaCaixaTem = 'não';
                responseToSend = getRandomResponse('noCaixaTem');
                state.completed = true;
                simulateTyping(() => addMessageToChat(responseToSend));
            } else {
                state.errorCount++;
                responseToSend = getRandomResponse('invalid');
                simulateTyping(() => { 
                    addMessageToChat(responseToSend); 
                    displayQuickReplyButtons(['Sim', 'Não']); 
                });
            }
            break;

        case 3:
            if (cleanedText === 'sim') {
                state.data.emprestimoAnterior = 'sim';
                state.step = 4;
                responseToSend = getRandomResponse('pedirBancoAntigo');
                simulateTyping(() => { 
                    addMessageToChat(responseToSend); 
                    hideQuickReplyButtons(); 
                });
            } else if (cleanedText === 'não') {
                state.data.emprestimoAnterior = 'não';
                state.data.bancoAnterior = 'N/A';
                state.step = 5;
                responseToSend = getRandomResponse('pedirCpf');
                simulateTyping(() => { 
                    addMessageToChat(responseToSend); 
                    hideQuickReplyButtons(); 
                });
            } else {
                state.errorCount++;
                responseToSend = getRandomResponse('invalid');
                simulateTyping(() => { 
                    addMessageToChat(responseToSend); 
                    displayQuickReplyButtons(['Sim', 'Não']); 
                });
            }
            break;

        case 4:
            if (cleanedText.length < 2 || cleanedText.match(/^(sim|não)$/i)) {
                state.errorCount++;
                responseToSend = 'Por favor, digite o *nome* do banco ou financeira onde fez a operação de crédito anterior. Ex: Itaú, Bradesco, etc.';
                simulateTyping(() => addMessageToChat(responseToSend));
            } else if (cleanedText.includes('crefisa') || cleanedText.includes('credifisa') || cleanedText.includes('krefisa')) {
                state.data.bancoAnterior = cleanedText;
                responseToSend = getRandomResponse('crefisaReject');
                state.completed = true;
                simulateTyping(() => addMessageToChat(responseToSend));
            } else {
                state.data.bancoAnterior = cleanedText;
                state.step = 5;
                responseToSend = getRandomResponse('pedirCpf');
                simulateTyping(() => { 
                    addMessageToChat(responseToSend); 
                    hideQuickReplyButtons(); 
                });
            }
            break;

        case 5:
            const cpfInput = cleanedText.replace(/\D/g, '');
            if (!isValidCPF(cpfInput)) {
                state.errorCount++;
                responseToSend = getRandomResponse('cpfInvalid');
                simulateTyping(() => addMessageToChat(responseToSend));
            } else {
                state.data.cpf = cpfInput;
                state.data.cpfStatus = 'VALIDATED_LOCALLY';
                state.errorCount = 0;
                state.step = 6;
                responseToSend = getRandomResponse('pedirWhatsapp');
                simulateTyping(() => { 
                    addMessageToChat(responseToSend); 
                    hideQuickReplyButtons(); 
                });
            }
            break;

        case 6:
            const whatsappInput = cleanedText.replace(/\D/g, '');
            if (whatsappInput.length < 10 || whatsappInput.length > 11 || !/^\d+$/.test(whatsappInput)) {
                state.errorCount++;
                responseToSend = getRandomResponse('whatsappInvalid');
                simulateTyping(() => addMessageToChat(responseToSend));
            } else {
                state.data.whatsapp = whatsappInput;
                
                const isQualified = (state.data.recebeBolsaFamiliaCaixaTem === 'sim') &&
                                    (!state.data.bancoAnterior || !state.data.bancoAnterior.toLowerCase().includes('crefisa')) &&
                                    (state.data.cpfStatus === 'VALIDATED_LOCALLY');

                if (isQualified) {
                    simulateTyping(() => {
                        addMessageToChat('✅ Dados coletados! Enviando para nossa equipe...');
                        setTimeout(async () => {
                            try {
                                const res = await fetch('/.netlify/functions/sendToTelegram', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ leadData: state.data })
                                });
                                const result = await res.json();

                                if (result.success) {
                                    simulateTyping(() => addMessageToChat(getRandomResponse('finalSuccess')));
                                    if (typeof fbq === 'function') {
                                        fbq('track', 'Lead', {
                                            content_name: 'Lead Qualificado Bolsa Familia',
                                            content_category: 'Lead Generation',
                                            value: 1,
                                            currency: 'BRL'
                                        });
                                    }
                                } else {
                                    simulateTyping(() => addMessageToChat(getRandomResponse('errorGeneric')));
                                    console.error('Erro ao enviar lead para Telegram:', result.message);
                                }
                            } catch (error) {
                                console.error('Erro ao chamar Netlify Function para Telegram:', error);
                                simulateTyping(() => addMessageToChat(getRandomResponse('errorGeneric')));
                            }
                        }, 1000);
                    }, 500, 1000);
                } else {
                    responseToSend = "Sua solicitação foi processada. Em breve, entraremos em contato se houver uma oportunidade adequada ao seu perfil.";
                    simulateTyping(() => addMessageToChat(responseToSend));
                }
                state.completed = true;
            }
            break;

        default:
            responseToSend = 'Desculpe, não entendi. Por favor, digite *iniciar* para recomeçar.';
            state.errorCount++;
            simulateTyping(() => addMessageToChat(responseToSend));
            break;
    }

    localStorage.setItem('chatbotState', JSON.stringify(state));
}

// Event Listeners e Inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, configurando event listeners...');
    
    // Botões de iniciar conversa
    if (startButton) {
        startButton.addEventListener('click', () => {
            console.log('Botão principal clicado');
            startChatFlow();
        });
    }
    
    if (secondaryStartButton) {
        secondaryStartButton.addEventListener('click', () => {
            console.log('Botão secundário clicado');
            startChatFlow();
        });
    }

    // Botões de resposta rápida
    if (chatContainer) {
        chatContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('quick-reply-button')) {
                const value = event.target.dataset.value;
                if (event.target.closest('.quick-reply-options')) {
                    const currentButtonsWrapper = event.target.closest('.quick-reply-options');
                    if (currentButtonsWrapper) {
                        currentButtonsWrapper.remove();
                    }
                    processUserMessage(value);
                }
            }
        });
    }

    // Botão de enviar mensagem
    if (sendButton) {
        sendButton.addEventListener('click', () => {
            if (messageInput && messageInput.value.trim() !== '') {
                processUserMessage(messageInput.value);
            }
        });
    }

    // Enter no input
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && messageInput.value.trim() !== '') {
                processUserMessage(messageInput.value);
            }
        });
    }

    // Verificar estado salvo
    const savedState = localStorage.getItem('chatbotState');
    if (savedState) {
        state = JSON.parse(savedState);
        if (state.completed || (Date.now() - state.lastInteraction > (30 * 60 * 1000))) {
            if (welcomeScreen) welcomeScreen.classList.add('active');
            if (chatScreen) chatScreen.classList.add('hidden');
            state = { step: 0, data: {}, errorCount: 0, completed: false, lastInteraction: Date.now() };
            localStorage.removeItem('chatbotState');
        } else {
            if (welcomeScreen) welcomeScreen.classList.add('hidden');
            if (chatScreen) chatScreen.classList.add('active');
            addMessageToChat('Bem-vindo(a) de volta! 😊');
            
            if ([1, 3].includes(state.step)) {
                const questionKey = state.step === 1 ? 'recebeBolsaFamiliaCaixaTem' : 'jaFezEmprestimo';
                simulateTyping(() => {
                    addMessageToChat(getRandomResponse(questionKey));
                    displayQuickReplyButtons(['Sim', 'Não']);
                });
            } else if ([4, 5, 6].includes(state.step)) {
                const questionKeys = {4: 'pedirBancoAntigo', 5: 'pedirCpf', 6: 'pedirWhatsapp'};
                simulateTyping(() => {
                    addMessageToChat(getRandomResponse(questionKeys[state.step]));
                    hideQuickReplyButtons();
                });
            }
        }
    } else {
        if (welcomeScreen) welcomeScreen.classList.add('active');
        if (chatScreen) chatScreen.classList.add('hidden');
    }
    
    console.log('Event listeners configurados com sucesso!');
});

