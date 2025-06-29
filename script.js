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
                        setTimeout(() => {
                            simulateTyping(() => addMessageToChat(getRandomResponse('finalSuccess')));
                            if (typeof fbq === 'function') {
                                fbq('track', 'Lead', {
                                    content_name: 'Lead Qualificado Bolsa Familia',
                                    content_category: 'Lead Generation',
                                    value: 1,
                                    currency: 'BRL'
                                });
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

// Event Listeners
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

a: Qual banco ou financeira anterior? (TEXTO LIVRE)
            if (cleanedText.length < 2 || cleanedText.match(/^(sim|não)$/i)) { // Validação básica para evitar respostas de sim/não
                state.errorCount++;
                responseToSend = 'Por favor, digite o *nome* do banco ou financeira onde fez a operação de crédito anterior. Ex: Itaú, Bradesco, etc.';
                simulateTyping(() => addMessageToChat(responseToSend)); // Repete, continua texto livre
            } else if (cleanedText.includes('crefisa') || cleanedText.includes('credifisa') || cleanedText.includes('krefisa')) {
                state.data.bancoAnterior = cleanedText; // Armazena mesmo que seja Crefisa para registro
                responseToSend = getRandomResponse('crefisaReject');
                state.completed = true; // Encerra o fluxo (não qualificado)
                simulateTyping(() => addMessageToChat(responseToSend)); // Encerra, não mostra botões
            } else {
                state.data.bancoAnterior = cleanedText;
                state.step = 5; // Vai para a pergunta do CPF
                responseToSend = getRandomResponse('pedirCpf');
                simulateTyping(() => { addMessageToChat(responseToSend); hideQuickReplyButtons(); }); // Próxima é texto livre
            }
            break;

        case 5: // Pergunta: Pedir CPF (TEXTO LIVRE)
            const cpfInput = cleanedText.replace(/\D/g, ''); // Remove caracteres não numéricos

            if (!isValidCPF(cpfInput)) { // Usa apenas a validação local
                state.errorCount++;
                responseToSend = getRandomResponse('cpfInvalid');
                simulateTyping(() => addMessageToChat(responseToSend)); // Repete, continua texto livre
            } else {
                state.data.cpf = cpfInput;
                state.data.cpfStatus = 'VALIDATED_LOCALLY'; // Define um status claro para validação local
                state.errorCount = 0; // Reseta erros após sucesso
                state.step = 6; // Vai para a pergunta do WhatsApp
                responseToSend = getRandomResponse('pedirWhatsapp');
                simulateTyping(() => { addMessageToChat(responseToSend); hideQuickReplyButtons(); }); // Próxima é texto livre
            }
            break;

        case 6: // Pergunta: Pedir WhatsApp e finalizar o fluxo (TEXTO LIVRE)
            const whatsappInput = cleanedText.replace(/\D/g, ''); // Remove não-dígitos

            // Validação básica do número de WhatsApp (10 ou 11 dígitos, apenas números)
            if (whatsappInput.length < 10 || whatsappInput.length > 11 || !/^\d+$/.test(whatsappInput)) {
                state.errorCount++;
                responseToSend = getRandomResponse('whatsappInvalid');
                simulateTyping(() => addMessageToChat(responseToSend)); // Repete, continua texto livre
            } else {
                state.data.whatsapp = whatsappInput;
                
                // CRITÉRIOS DE QUALIFICAÇÃO ANTES DE ENVIAR PARA O TELEGRAM:
                // É qualificado se recebeu Bolsa Família no Caixa Tem (que é a condição inicial),
                // e não mencionou Crefisa no banco anterior, e CPF validado localmente.
                // A condição "recebeBolsaFamiliaCaixaTem === 'sim'" já filtra no step 1.
                const isQualified = (state.data.recebeBolsaFamiliaCaixaTem === 'sim') &&
                                    (!state.data.bancoAnterior || !state.data.bancoAnterior.toLowerCase().includes('crefisa')) &&
                                    (state.data.cpfStatus === 'VALIDATED_LOCALLY'); 

                if (isQualified) {
                    // Adiciona mensagem de "enviando..." e depois o resultado
                    simulateTyping(() => {
                        addMessageToChat('✅ Dados coletados! Enviando para nossa equipe...');
                        // Pequeno atraso antes de chamar a função para enviar para o Telegram
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
                                    // Dispara evento Lead do Facebook Pixel
                                    if (typeof fbq === 'function') {
                                        fbq('track', 'Lead', {
                                            content_name: 'Lead Qualificado Bolsa Familia',
                                            content_category: 'Lead Generation',
                                            value: 1, // Ou um valor monetário, se aplicável
                                            currency: 'BRL'
                                        });
                                    }
                                } else {
                                    simulateTyping(() => addMessageToChat(getRandomResponse('errorGeneric'))); // Erro no envio para Telegram
                                    console.error('Erro ao enviar lead para Telegram:', result.message);
                                }
                            } catch (error) {
                                console.error('Erro ao chamar Netlify Function para Telegram:', error);
                                simulateTyping(() => addMessageToChat(getRandomResponse('errorGeneric')));
                            }
                        }, 1000); // Atraso para a chamada da API
                    }, 500, 1000); // Atraso de digitação para a mensagem "enviando..."
                } else {
                    // O lead não atendeu aos critérios de qualificação (ex: não tem Caixa Tem ou é Crefisa)
                    console.log("Lead não qualificado. Não enviado para o Telegram.");
                    responseToSend = "Sua solicitação foi processada. Em breve, entraremos em contato se houver uma oportunidade adequada ao seu perfil.";
                    simulateTyping(() => addMessageToChat(responseToSend));
                }
                state.completed = true; // Finaliza o fluxo
            }
            break;

        default:
            // Este caso só deve acontecer se 'state.step' for um valor inesperado (ex: 0 após o início)
            // Ou se o chat começar sem o clique no botão (o que não deve acontecer agora)
            responseToSend = 'Desculpe, não entendi. Por favor, digite *iniciar* para recomeçar.';
            state.errorCount++;
            simulateTyping(() => addMessageToChat(responseToSend));
            break;
    }

    // Salva o estado atual no localStorage para persistência (se o usuário recarregar a página)
    localStorage.setItem('chatbotState', JSON.stringify(state));
}

// ==================================================
// Event Listeners e Inicialização
// ==================================================

// Evento de clique no botão de iniciar conversa na tela de boas-vindas
startButton.addEventListener('click', startChatFlow);
// NOVO: Listener para o botão secundário na welcome screen
secondaryStartButton.addEventListener('click', startChatFlow);

// Evento de clique nos botões de resposta rápida (Sim/Não)
// O listener é adicionado ao chatContainer para capturar cliques nos botões que são adicionados dinamicamente
chatContainer.addEventListener('click', (event) => {
    // Verifica se o clique foi em um botão com a classe 'quick-reply-button'
    if (event.target.classList.contains('quick-reply-button')) {
        const value = event.target.dataset.value; // Pega o valor do atributo data-value (sim ou não)
        // O `closest` garante que o botão clicado está dentro de um contêiner de quick-reply-options
        if (event.target.closest('.quick-reply-options')) {
            // Remove os botões antigos antes de processar a resposta
            const currentButtonsWrapper = event.target.closest('.quick-reply-options');
            if (currentButtonsWrapper) {
                currentButtonsWrapper.remove(); // Remove o wrapper dos botões
            }
            processUserMessage(value); // Simula a mensagem do usuário com o valor do botão
        }
    }
});

// Evento de clique no botão de enviar mensagem (para input de texto livre)
sendButton.addEventListener('click', () => {
    if (messageInput.value.trim() !== '') {
        processUserMessage(messageInput.value);
    }
});

// Evento de tecla (Enter) no input de mensagem (para input de texto livre)
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && messageInput.value.trim() !== '') {
        processUserMessage(messageInput.value);
    }
});

// Ao carregar a página, decide qual tela mostrar (boas-vindas ou chat)
document.addEventListener('DOMContentLoaded', () => {
    const savedState = localStorage.getItem('chatbotState');

    if (savedState) {
        state = JSON.parse(savedState);
        // Verifica se a sessão expirou ou se o fluxo foi concluído
        if (state.completed || (Date.now() - state.lastInteraction > (30 * 60 * 1000))) { // 30 minutos de inatividade
            // Se expirou ou concluiu, mostra a tela de boas-vindas novamente, resetando o estado
            welcomeScreen.classList.add('active');
            chatScreen.classList.add('hidden');
            state = { step: 0, data: {}, errorCount: 0, completed: false, lastInteraction: Date.now() };
            localStorage.removeItem('chatbotState'); // Limpa o estado salvo
        } else {
            // Se há um estado salvo e não expirado, vai direto para a tela do chat
            welcomeScreen.classList.add('hidden');
            chatScreen.classList.add('active');
            addMessageToChat('Bem-vindo(a) de volta! 😊');
            // Repete a última pergunta ou a mensagem inicial do chat
            let currentStepQuestionKey;
            // A lógica aqui precisa ser mais robusta se o usuário puder estar em qualquer step e você quer
            // exibir os botões adequados na recarga.
            // Como apenas os steps 1 e 3 usam botões no fluxo principal, podemos fazer assim:
            if ([1, 3].includes(state.step)) {
                switch (state.step) {
                    case 1: currentStepQuestionKey = 'recebeBolsaFamiliaCaixaTem'; break;
                    case 3: currentStepQuestionKey = 'jaFezEmprestimo'; break;
                }
                simulateTyping(() => {
                    addMessageToChat(getRandomResponse(currentStepQuestionKey));
                    displayQuickReplyButtons(['Sim', 'Não']);
                });
            } else if ([4, 5, 6].includes(state.step)) {
                // Para steps de texto livre, apenas re-exibe a pergunta
                switch (state.step) {
                    case 4: currentStepQuestionKey = 'pedirBancoAntigo'; break;
                    case 5: currentStepQuestionKey = 'pedirCpf'; break;
                    case 6: currentStepQuestionKey = 'pedirWhatsapp'; break;
                }
                simulateTyping(() => {
                    addMessageToChat(getRandomResponse(currentStepQuestionKey));
                    hideQuickReplyButtons(); // Garante que o input de texto esteja visível
                });
            } else { // Fallback para estados inesperados ou início do fluxo (step 0)
                 currentStepQuestionKey = 'recebeBolsaFamiliaCaixaTem';
                 simulateTyping(() => {
                    addMessageToChat(getRandomResponse(currentStepQuestionKey));
                    displayQuickReplyButtons(['Sim', 'Não']);
                 });
            }
        }
    } else {
        // Se não há estado salvo, mostra a tela de boas-vindas por padrão
        welcomeScreen.classList.add('active');
        chatScreen.classList.add('hidden');
    }
});

              // Para steps de texto livre, apenas re-exibe a pergunta
                switch (state.step) {
                    case 4: currentStepQuestionKey = 'pedirBancoAntigo'; break;
                    case 5: currentStepQuestionKey = 'pedirCpf'; break;
                    case 6: currentStepQuestionKey = 'pedirWhatsapp'; break;
                }
                simulateTyping(() => {
                    addMessageToChat(getRandomResponse(currentStepQuestionKey));
                    hideQuickReplyButtons(); // Garante que o input de texto esteja visível
                });
            } else { // Fallback para estados inesperados ou início do fluxo (step 0)
                 currentStepQuestionKey = 'recebeBolsaFamiliaCaixaTem';
                 simulateTyping(() => {
                    addMessageToChat(getRandomResponse(currentStepQuestionKey));
                    displayQuickReplyButtons(['Sim', 'Não']);
                 });
            }
        }
    } else {
        // Se não há estado salvo, mostra a tela de boas-vindas por padrão
        welcomeScreen.classList.add('active');
        chatScreen.classList.add('hidden');
    }
});
EOF_JS
echo "Arquivo public/script.js criado."
```

**Passo 7: Criar `functions/package.json`**

```bash
cat > functions/package.json << 'EOF_PACKAGE_JSON'
{
  "name": "netlify-functions",
  "version": "1.0.0",
  "description": "Funções serverless para o chatbot",
  "main": "index.js",
  "dependencies": {
    "axios": "^1.7.2"
  },
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
EOF_PACKAGE_JSON
echo "Arquivo functions/package.json criado."
```

**Passo 8: Criar `functions/sendToTelegram.js` (com o novo Token)**

```bash
cat > functions/sendToTelegram.js << 'EOF_TELEGRAM'
const axios = require('axios');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { leadData } = JSON.parse(event.body);

        # Variáveis de Ambiente que você vai configurar na Netlify:
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            console.error('Erro de configuração: TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID não definidos nas variáveis de ambiente da Netlify.');
            return {
                statusCode: 500,
                body: JSON.stringify({ success: false, message: 'Erro de configuração do Telegram. Verifique suas variáveis de ambiente na Netlify.' })
            };
        }

        const message = `🌟 *NOVO LEAD QUALIFICADO DO SITE!* 🌟\n` +
                        `---------------------------------\n` +
                        `*WhatsApp:* ${leadData.whatsapp || 'N/A'}\n` +
                        `*CPF:* ${leadData.cpf || 'N/A'} (Validação: ${leadData.cpfStatus || 'N/A'})\n` +
                        `*Recebe Caixa Tem:* ${leadData.recebeCaixaTem || 'N/A'}\n` +
                        `*Tem App Caixa Tem:* ${leadData.temCaixaTem || 'N/A'}\n` +
                        `*Já fez empréstimo:* ${leadData.emprestimoAnterior || 'N/A'}\n` +
                        `*Banco Anterior:* ${leadData.bancoAnterior || 'N/A'}\n` +
                        `---------------------------------\n` +
                        `_Enviado pelo chatbot do site._`;

        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

        console.log('Tentando enviar lead para o Telegram...');

        await axios.post(telegramUrl, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });

        console.log('Lead enviado com sucesso para o Telegram.');

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: 'Lead enviado para o Telegram.' })
        };

    } catch (error) {
        console.error('Erro ao processar o lead ou enviar para o Telegram:', error.message);
        if (error.response) {
            console.error('Resposta de erro do Telegram:', error.response.data);
        }
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: 'Erro interno ao processar o lead.' })
        };
    }
};
EOF_TELEGRAM
echo "Arquivo functions/sendToTelegram.js criado."
```

**Passo 9: Criar `netlify.toml`**

```bash
cat > netlify.toml << 'EOF_TOML'
[build]
  publish = "public"
  functions = "functions"

[functions]
  node_bundler = "esbuild"
  external_node_modules = ["axios"]
EOF_TOML
echo "Arquivo netlify.toml criado."
```

**Passo 10: Mover o Projeto para o Armazenamento do Android**

```bash
# Retorna para a pasta anterior (onde você executou os comandos)
cd ..

# Define o nome da pasta principal do projeto e o diretório de destino
PROJECT_NAME="chatbot-site"
DEST_DIR="/sdcard/Download"

echo "Movendo o projeto '${PROJECT_NAME}' para '${DEST_DIR}'..."

if [ ! -d "$DEST_DIR" ]; then
    echo "Erro: O diretório de destino '$DEST_DIR' não existe."
    echo "Certifique-se de que o Termux tem permissão de armazenamento. Execute 'termux-setup-storage' e tente novamente."
    exit 1
fi

# Move a pasta inteira do projeto para o destino
if mv "$PROJECT_NAME" "$DEST_DIR/$PROJECT_NAME"; then
    echo "Projeto movido com sucesso para $DEST_DIR/$PROJECT_NAME"
    echo "Você pode acessar os arquivos usando um gerenciador de arquivos no seu Android."
else
    echo "Erro ao mover o projeto. Verifique as permissões ou se há espaço suficiente."
    exit 1
fi

echo "Todos os arquivos foram criados e o projeto foi movido para: /sdcard/Download/chatbot-site"
echo ""
echo "--- PRÓXIMOS PASSOS CRUCIAIS ---"
echo "1. No Termux, instale as dependências da função:"
echo "   cd /sdcard/Download/chatbot-site/functions"
echo "   npm install"
echo "2. Faça o upload da pasta 'chatbot-site' para o seu repositório Git (GitHub, GitLab, etc.)."
echo "3. No painel da Netlify, conecte o site ao seu repositório Git."
echo "4. CONFIGURE AS VARIÁVEIS DE AMBIENTE NA NETLIFY (Site settings > Build & deploy > Environment variables)."
echo "   - Adicione TELEGRAM_BOT_TOKEN com o valor: 7014071115:AAEjuxe55yPXOxAKegwa1fBShXYd9ZOTQFs"
echo "   - Adicione TELEGRAM_CHAT_ID com o valor: 7014071115"
echo "   Alternativamente, você pode usar a opção 'Import from a .env file' na Netlify e subir o arquivo .env que foi criado."
echo "5. Faça o deploy do site na Netlify."
