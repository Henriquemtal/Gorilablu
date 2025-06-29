
// public/script.js - Versão Otimizada e Humanizada

// Referências aos elementos HTML da interface do chat
const chatContainer = document.getElementById('chat-container');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const botStatusElement = document.getElementById('bot-status'); // Elemento para status "Online" / "Digitando"

// Estado inicial do chatbot
let state = {
    step: 0, // 0: Início, 1: Recebe Caixa Tem, 2: Tem App Caixa Tem, 3: Já Fez Empréstimo, 4: Pedir Banco Antigo, 5: Pedir CPF, 6: Pedir WhatsApp
    data: {}, // Armazena as respostas do usuário (recebeCaixaTem, temCaixaTem, etc.)
    errorCount: 0, // Contador de erros para respostas inválidas
    completed: false, // Flag para indicar se o fluxo foi concluído
    lastInteraction: Date.now() // Timestamp da última interação para controle de inatividade
};

// Variações de resposta do bot para cada pergunta ou situação
const responseVariations = {
    invalid: [
        'Ops, sua resposta não ficou clara. 🤔 Poderia tentar novamente? Por favor, use *1* para SIM ou *2* para NÃO.',
        'Hum, não consegui entender o que você quis dizer. 😕 Tente de novo, por favor, com *1* para SIM ou *2* para NÃO.',
        'Desculpe, não compreendi. 😅 Vamos lá de novo? Responda com *1* para SIM ou *2* para NÃO.'
    ],
    start: [
        'Olá! 👋 Que bom te ver por aqui! Sou a Amélia, sua assistente para analisar oportunidades financeiras. Para começarmos, digite "iniciar".',
        'Oi! 😊 Sou a Amélia, estou aqui para te ajudar a encontrar as melhores oportunidades financeiras. Para dar o primeiro passo, é só digitar "começar".',
        'Seja bem-vindo(a)! 🚀 Sou a Amélia, sua assistente virtual. Digite "iniciar" para descobrir como posso te ajudar com suas finanças!'
    ],
    recebeCaixaTem: [
        '*Passo 1 de 3:*\nPara darmos início à sua análise de crédito, preciso saber: você recebe algum benefício pelo aplicativo *Caixa Tem*?\n\nResponda com:\n✅ *1* ou *Sim* para SIM\n✅ *2* ou *Não* para NÃO',
        '*Primeiro passo (1/3):*\nOlá! 😊 Vamos começar sua avaliação. Você recebe algum benefício social ou trabalhista através do app *Caixa Tem*?\n\nUse:\n✅ *1* ou *Sim* para SIM\n✅ *2* ou *Não* para NÃO'
    ],
    temCaixaTem: [
        '*Passo 1.5 de 3:*\nEntendi! 😊 Para seguirmos, o aplicativo *Caixa Tem* está instalado no seu celular?\n\nMe diga:\n✅ *1* ou *Sim* para SIM\n✅ *2* ou *Não* para NÃO',
        '*Pequeno detalhe (1.5/3):*\nPerfeito! 📱 Agora me confirme: o app *Caixa Tem* já está baixado e instalado no seu dispositivo?\n\nResponda:\n✅ *1* ou *Sim* para SIM\n✅ *2* ou *Não* para NÃO'
    ],
    jaFezEmprestimo: [
        '*Passo 2 de 3:*\nÓtimo, estamos avançando! ✨ Você já realizou alguma *operação de crédito* anteriormente, como empréstimo pessoal ou consignado?\n\nPor favor, responda:\n✅ *1* ou *Sim* para SIM\n✅ *2* ou *Não* para NÃO',
        '*Próximo passo (2/3):*\nQuase lá! 🚀 Me informe: você possui alguma *operação de crédito ativa* ou já realizou uma no passado (financiamento, empréstimo)?\n\nResponda:\n✅ *1* ou *Sim* para SIM\n✅ *2* ou *Não* para NÃO'
    ],
    pedirBancoAntigo: [
        '*Passo 2.5 de 3:*\nCerto! 😊 E em qual *banco ou financeira* você realizou essa operação de crédito anterior? (Ex.: Banco do Brasil, Bradesco, Itaú, etc.)\n\nPor favor, digite o *nome completo* da instituição.',
        '*Só mais um detalhe (2.5/3):*\nPerfeito! Qual foi o *banco ou financeira* onde você fez seu último empréstimo ou financiamento? (Ex.: Santander, Caixa, Crefisa, etc.)\n\nMe diga o *nome completo*!'
    ],
    pedirCpf: [
        '*Último Passo (3 de 3):*\nEstamos quase no fim! 🎉 Para finalizar seu pré-cadastro, por favor, digite *apenas os 11 números* do seu *CPF*.\n\n🔒 Fique tranquilo(a), seus dados estão seguros conosco!',
        '*Reta Final! (3/3):*\nPara concluirmos, preciso do seu *CPF*. Por favor, envie *somente os 11 números*, sem pontos ou traços.\n\n🔒 Sua segurança é nossa prioridade!'
    ],
    pedirWhatsapp: [
        'Excelente! ✨ Para que um de nossos analistas entre em contato com você o mais rápido possível e dê continuidade ao seu pré-cadastro, por favor, digite seu número de *WhatsApp* (incluindo o DDD, ex: 11987654321).',
        'Quase lá! ✅ Agora, para nossa equipe entrar em contato, me informe seu número de *WhatsApp* completo (com o DDD, ex: 21987654321).\n\nAssim, podemos te ajudar rapidamente!'
    ],
    finalSuccess: [
        '🎉 Parabéns! Seu pré-cadastro foi enviado com sucesso!\n\nUm de nossos analistas entrará em contato em breve no seu WhatsApp para dar continuidade. Agradecemos a confiança e estamos animados para te ajudar! 😊',
        '✅ Tudo pronto! Seus dados foram registrados com sucesso.\n\nNossa equipe já foi notificada e um analista entrará em contato com você via WhatsApp em breve para os próximos passos. Fique atento(a)! 😉'
    ],
    noCaixaTem: [
        'Ah, entendi! 😔 Para continuarmos o processo, é necessário ter o aplicativo *Caixa Tem* instalado no seu celular. Por favor, baixe o app na loja de aplicativos e volte aqui quando estiver pronto. Estamos te esperando! 📱',
        'Olá! 📲 Parece que você ainda não tem o *Caixa Tem*. Para prosseguir com essa análise, a instalação do app é essencial. Baixe-o e retorne para continuarmos sua solicitação. Agradecemos o interesse! 😊'
    ],
    crefisaReject: [
        'Oi! 😔 No momento, não conseguimos prosseguir com solicitações relacionadas à *Crefisa* ou financeiras semelhantes, pois nosso foco é em outras oportunidades. Agradecemos muito seu interesse e estamos à disposição para outras opções no futuro! 🚀',
        'Olá! 😅 Entendi que você fez uma operação com a *Crefisa* (ou similar). Infelizmente, essa modalidade está fora do nosso alcance por enquanto. Obrigado por nos contatar, e qualquer novidade, te avisamos. Fique à vontade para voltar! 😊'
    ],
    cpfInvalid: [
        'Hum... o CPF que você digitou parece inválido. 😕 Por favor, envie *apenas os 11 números* do seu CPF, sem pontos ou traços. Verifique com atenção, por favor!',
        'Parece que há um erro no formato do CPF. ❌ Lembre-se, preciso de *apenas os 11 dígitos*, sem caracteres especiais. Pode tentar novamente?'
    ],
    whatsappInvalid: [
        'Hmm, esse número de WhatsApp não parece estar completo ou no formato certo. 📲 Por favor, digite seu número de WhatsApp com o DDD, por exemplo: *11987654321*.'
    ],
    errorGeneric: [
        'Ops! 😥 Aconteceu um imprevisto aqui do meu lado e não consegui processar sua mensagem. Por favor, tente novamente mais tarde. Se o problema persistir, entre em contato com nosso suporte técnico.',
        'Ah, não! 😟 Um erro inesperado ocorreu. Por favor, espere um pouco e tente de novo. Se precisar de ajuda imediata, nossa equipe está pronta para te atender!'
    ],
    alreadyCompleted: [
        'Olá! 😊 Que bom te ver de novo! Seu pré-cadastro já foi concluído conosco. Um de nossos analistas entrará em contato em breve. Se precisar de algo urgente, entre em contato diretamente com nossa equipe ou digite "reiniciar" se quiser começar um novo processo. Agradecemos a confiança!',
        'Oi! 🚀 Seu pré-cadastro já foi finalizado. Estamos processando seus dados e um analista entrará em contato com você via WhatsApp em breve para os próximos passos. Fique atento(a)! 😊'
    ],
    errorLimit: [
        'Parece que estamos com dificuldade para nos entender. 🤔 Para garantir o melhor atendimento, um de nossos especialistas pode entrar em contato para ajudar diretamente. Se preferir, tente novamente mais tarde, digitando "iniciar".',
        'Poxa! 😥 Muitas tentativas inválidas. Para sua comodidade, nosso sistema vai registrar um pedido de contato e um de nossos atendentes falará com você. Agradeço sua paciência!'
    ],
    sessionExpired: [
        '⏳ Sua sessão expirou por inatividade. Para sua segurança, o processo foi reiniciado. Digite *iniciar* para recomeçar o atendimento.',
        '🔁 Fiquei um tempo sem sua resposta e a sessão expirou. Não se preocupe! É só digitar *começar* para darmos continuidade ao seu atendimento.'
    ]
};

// ==================================================
// Funções Auxiliares da Interface
// ==================================================

/**
 * Adiciona uma mensagem ao contêiner do chat.
 * @param {string} message O texto da mensagem.
 * @param {boolean} isUser Indica se a mensagem é do usuário (true) ou do bot (false).
 */
function addMessageToChat(message, isUser = false) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-message');
    msgDiv.classList.add(isUser ? 'user-message' : 'bot-message');
    // Converte negrito de Markdown para HTML <strong>
    msgDiv.innerHTML = message.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    chatContainer.appendChild(msgDiv);
    // Rolagem automática para a última mensagem
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

/**
 * Seleciona uma variação de resposta aleatória para um dado tipo.
 * @param {string} type O tipo da resposta (chave no `responseVariations`).
 * @returns {string} A string da resposta selecionada.
 */
function getRandomResponse(type) {
    const variations = responseVariations[type];
    if (variations && Array.isArray(variations) && variations.length > 0) {
        return variations[Math.floor(Math.random() * variations.length)];
    }
    console.warn(`[getRandomResponse] Aviso: Variações inválidas ou não encontradas para o tipo: ${type}`);
    return responseVariations.errorGeneric[0];
}

/**
 * Valida um CPF. Retorna true se válido, false caso contrário.
 * Esta é uma validação de formato e dígitos, não consulta órgãos externos.
 * @param {string} cpf O CPF a ser validado.
 * @returns {boolean} True se o CPF é válido, false caso contrário.
 */
function isValidCPF(cpf) {
    cpf = String(cpf).replace(/\D/g, ''); // Remove caracteres não numéricos
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false; // Verifica tamanho e se todos os dígitos são iguais
    let sum = 0;
    let remainder;
    // Validação do primeiro dígito verificador
    for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    sum = 0;
    // Validação do segundo dígito verificador
    for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    return true;
}

/**
 * Simula a digitação do bot antes de enviar a resposta.
 * @param {Function} callback Função a ser chamada após a simulação de digitação.
 * @param {number} minDelay Mínimo de milissegundos para a digitação.
 * @param {number} maxDelay Máximo de milissegundos para a digitação.
 */
function simulateTyping(callback, minDelay = 1000, maxDelay = 2500) {
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('typing-indicator');
    typingIndicator.innerHTML = 'Amélia está digitando<span>...</span>';
    chatContainer.appendChild(typingIndicator);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    botStatusElement.textContent = 'Digitando...'; // Altera o status no cabeçalho

    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

    setTimeout(() => {
        typingIndicator.remove(); // Remove o indicador de digitação
        botStatusElement.textContent = 'Online'; // Retorna o status para "Online"
        callback(); // Chama a função que adiciona a mensagem real do bot
    }, delay);
}

// ==================================================
// Lógica Principal do Chatbot
// ==================================================

/**
 * Processa a mensagem do usuário e determina a próxima ação do bot.
 * @param {string} userMessage O mensagem digitada pelo usuário.
 */
async function processUserMessage(userMessage) {
    // Adiciona a mensagem do usuário ao chat UI imediatamente
    addMessageToChat(userMessage, true);
    // Limpa o input após enviar
    messageInput.value = '';

    const cleanedText = userMessage.trim().toLowerCase();

    // Se o fluxo já foi concluído, verifica se o usuário quer reiniciar
    if (state.completed) {
        const restartKeywords = ['reiniciar', 'recomeçar', 'inicio', 'começar', 'resetar'];
        if (restartKeywords.some(k => cleanedText.includes(k))) {
            state = { step: 1, data: {}, errorCount: 0, completed: false, lastInteraction: Date.now() };
            simulateTyping(() => {
                addMessageToChat('Ok, vamos começar de novo!');
                addMessageToChat(getRandomResponse('recebeCaixaTem'));
                localStorage.setItem('chatbotState', JSON.stringify(state)); // Salva o novo estado
            });
        } else {
            simulateTyping(() => addMessageToChat(getRandomResponse('alreadyCompleted')));
        }
        return;
    }

    // Controle de erros: se o usuário errar muitas vezes, encerra o fluxo.
    if (state.errorCount >= 3) {
        simulateTyping(() => addMessageToChat(getRandomResponse('errorLimit')));
        state.completed = true;
        localStorage.setItem('chatbotState', JSON.stringify(state));
        return;
    }

    state.lastInteraction = Date.now(); // Atualiza o timestamp da última interação

    let responseToSend = ''; // Mensagem que o bot vai enviar
    let advanceStep = true; // Flag para controlar se o passo do fluxo avança

    switch (state.step) {
        case 0: // Passo inicial: Espera por "iniciar" ou similar
            const startKeywords = ['iniciar', 'começar', 'oi', 'ola', 'olá', 'bom dia', 'boa tarde', 'boa noite', 'sim', 'quero', 'tenho interesse'];
            if (startKeywords.some(k => cleanedText.includes(k))) {
                state.step = 1; // Avança para o primeiro passo real
                state.errorCount = 0; // Reseta erros ao iniciar um novo fluxo
                responseToSend = getRandomResponse('recebeCaixaTem');
            } else {
                responseToSend = getRandomResponse('start'); // Repete a mensagem inicial
                advanceStep = false; // Não avança o passo se não for um comando de início
            }
            break;

        case 1: // Pergunta: Recebe benefício Caixa Tem?
            if (cleanedText === '1' || cleanedText.match(/^s(im)?$/i)) {
                state.data.recebeCaixaTem = 'sim';
                state.data.temCaixaTem = 'sim'; // Se recebe, assume que tem o app
                state.step = 3; // Pula para a pergunta sobre empréstimo anterior
                responseToSend = getRandomResponse('jaFezEmprestimo');
            } else if (cleanedText === '2' || cleanedText.match(/^n(ao)?(ão)?$/i)) {
                state.data.recebeCaixaTem = 'não';
                state.step = 2; // Vai para a pergunta se tem o app Caixa Tem
                responseToSend = getRandomResponse('temCaixaTem');
            } else {
                state.errorCount++;
                responseToSend = getRandomResponse('invalid') + '\n' + getRandomResponse('recebeCaixaTem');
                advanceStep = false; // Permanece no mesmo passo
            }
            break;

        case 2: // Pergunta: Tem o aplicativo Caixa Tem instalado? (só se respondeu 'não' ao "recebe")
            if (cleanedText === '1' || cleanedText.match(/^s(im)?$/i)) {
                state.data.temCaixaTem = 'sim';
                state.step = 3; // Vai para a pergunta sobre empréstimo anterior
                responseToSend = getRandomResponse('jaFezEmprestimo');
            } else if (cleanedText === '2' || cleanedText.match(/^n(ao)?(ão)?$/i)) {
                state.data.temCaixaTem = 'não';
                responseToSend = getRandomResponse('noCaixaTem');
                state.completed = true; // Encerra o fluxo (não qualificado)
            } else {
                state.errorCount++;
                responseToSend = getRandomResponse('invalid') + '\n' + getRandomResponse('temCaixaTem');
                advanceStep = false; // Permanece no mesmo passo
            }
            break;

        case 3: // Pergunta: Já fez empréstimo anteriormente?
            if (cleanedText === '1' || cleanedText.match(/^s(im)?$/i)) {
                state.data.emprestimoAnterior = 'sim';
                state.step = 4; // Vai para a pergunta sobre o banco anterior
                responseToSend = getRandomResponse('pedirBancoAntigo');
            } else if (cleanedText === '2' || cleanedText.match(/^n(ao)?(ão)?$/i)) {
                state.data.emprestimoAnterior = 'não';
                state.data.bancoAnterior = 'N/A'; // Não se aplica
                state.step = 5; // Vai para a pergunta do CPF
                responseToSend = getRandomResponse('pedirCpf');
            }
            else {
                state.errorCount++;
                responseToSend = getRandomResponse('invalid') + '\n' + getRandomResponse('jaFezEmprestimo');
                advanceStep = false; // Permanece no mesmo passo
            }
            break;

        case 4: // Pergunta: Qual banco ou financeira anterior?
            const bancoInput = cleanedText;
            if (bancoInput.length < 2 || bancoInput.match(/^(1|2|sim|nao|não)$/i)) { // Validação básica para evitar respostas de sim/não
                state.errorCount++;
                responseToSend = 'Por favor, digite o *nome* do banco ou financeira onde fez a operação de crédito anterior. Ex: Itaú, Bradesco, etc.';
                advanceStep = false;
            } else if (bancoInput.includes('crefisa') || bancoInput.includes('credifisa') || bancoInput.includes('krefisa')) {
                state.data.bancoAnterior = bancoInput; // Armazena mesmo que seja Crefisa para registro
                responseToSend = getRandomResponse('crefisaReject');
                state.completed = true; // Encerra o fluxo (não qualificado)
            } else {
                state.data.bancoAnterior = bancoInput;
                state.step = 5; // Vai para a pergunta do CPF
                responseToSend = getRandomResponse('pedirCpf');
            }
            break;

        case 5: // Pergunta: Pedir CPF (APENAS VALIDAÇÃO LOCAL)
            const cpfInput = cleanedText.replace(/\D/g, ''); // Remove caracteres não numéricos

            if (!isValidCPF(cpfInput)) { // Usa apenas a validação local
                state.errorCount++;
                responseToSend = getRandomResponse('cpfInvalid');
                advanceStep = false; // Permanece no mesmo passo
            } else {
                state.data.cpf = cpfInput;
                state.data.cpfStatus = 'VALIDATED_LOCALLY'; // Define um status claro para validação local
                state.errorCount = 0; // Reseta erros após sucesso
                state.step = 6; // Vai para a pergunta do WhatsApp
                responseToSend = getRandomResponse('pedirWhatsapp');
            }
            break;

        case 6: // Pergunta: Pedir WhatsApp e finalizar o fluxo
            const whatsappInput = cleanedText.replace(/\D/g, ''); // Remove não-dígitos

            // Validação básica do número de WhatsApp (10 ou 11 dígitos, apenas números)
            if (whatsappInput.length < 10 || whatsappInput.length > 11 || !/^\d+$/.test(whatsappInput)) {
                state.errorCount++;
                responseToSend = getRandomResponse('whatsappInvalid');
                advanceStep = false; // Permanece no mesmo passo
            } else {
                state.data.whatsapp = whatsappInput;
                
                // CRITÉRIOS DE QUALIFICAÇÃO ANTES DE ENVIAR PARA O TELEGRAM:
                // 1. Tem o app Caixa Tem (ou recebe benefício)
                // 2. Não mencionou Crefisa no banco anterior
                // 3. CPF foi validado localmente (seção 5)
                const isQualified = (state.data.temCaixaTem === 'sim' || state.data.recebeCaixaTem === 'sim') &&
                                    (!state.data.bancoAnterior || !state.data.bancoAnterior.toLowerCase().includes('crefisa')) &&
                                    (state.data.cpfStatus === 'VALIDATED_LOCALLY'); // Garante que o CPF foi validado localmente

                if (isQualified) {
                    addMessageToChat('✅ Dados coletados! Enviando para nossa equipe...');
                    try {
                        // Envia os dados do lead qualificado para a Netlify Function (que enviará para o Telegram)
                        const res = await fetch('/.netlify/functions/sendToTelegram', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ leadData: state.data })
                        });
                        const result = await res.json();

                        if (result.success) {
                            responseToSend = getRandomResponse('finalSuccess');
                        } else {
                            responseToSend = getRandomResponse('errorGeneric'); // Erro no envio para Telegram
                            console.error('Erro ao enviar lead para Telegram:', result.message);
                        }
                    } catch (error) {
                        console.error('Erro ao chamar Netlify Function para Telegram:', error);
                        responseToSend = getRandomResponse('errorGeneric');
                    }
                } else {
                    // O lead não atendeu aos critérios de qualificação (ex: não tem Caixa Tem ou é Crefisa)
                    console.log("Lead não qualificado. Não enviado para o Telegram.");
                    responseToSend = "Sua solicitação foi processada. Em breve, entraremos em contato se houver uma oportunidade adequada ao seu perfil.";
                }
                state.completed = true; // Finaliza o fluxo
            }
            break;

        default:
            responseToSend = 'Desculpe, não entendi. Por favor, digite *iniciar* para recomeçar.';
            state.errorCount++; // Incrementa erro em caso de passo desconhecido
            advanceStep = false;
            break;
    }

    // Simula a digitação antes de mostrar a resposta do bot
    simulateTyping(() => {
        addMessageToChat(responseToSend);
        // Salva o estado atual no localStorage para persistência (se o usuário recarregar a página)
        localStorage.setItem('chatbotState', JSON.stringify(state));
    });
}

// ==================================================
// Event Listeners e Inicialização
// ==================================================

// Evento de clique no botão de enviar
sendButton.addEventListener('click', () => {
    if (messageInput.value.trim() !== '') {
        processUserMessage(messageInput.value);
    }
});

// Evento de tecla (Enter) no input de mensagem
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && messageInput.value.trim() !== '') {
        processUserMessage(messageInput.value);
    }
});

// Ao carregar a página, tenta restaurar o estado ou inicia a conversa
document.addEventListener('DOMContentLoaded', () => {
    const savedState = localStorage.getItem('chatbotState');
    if (savedState) {
        state = JSON.parse(savedState);
        // Se o fluxo foi concluído anteriormente, mostra a mensagem de conclusão
        if (state.completed) {
            addMessageToChat(getRandomResponse('alreadyCompleted'));
        } else if (Date.now() - state.lastInteraction > (30 * 60 * 1000)) { // 30 minutos de inatividade
            addMessageToChat(getRandomResponse('sessionExpired'));
            state = { step: 0, data: {}, errorCount: 0, completed: false, lastInteraction: Date.now() }; // Reseta o estado
            localStorage.removeItem('chatbotState'); // Limpa o estado salvo
        } else {
            // Se não concluído e não expirado, retoma a pergunta do passo atual.
            addMessageToChat('Bem-vindo(a) de volta! 😊');
            if (state.step === 0) { // Se estava no passo 0 (inicial), repete a mensagem de início
                addMessageToChat(getRandomResponse('start'));
            } else { // Caso contrário, repete a pergunta do passo atual
                let currentStepQuestionKey;
                switch (state.step) {
                    case 1: currentStepQuestionKey = 'recebeCaixaTem'; break;
                    case 2: currentStepQuestionKey = 'temCaixaTem'; break;
                    case 3: currentStepQuestionKey = 'jaFezEmprestimo'; break;
                    case 4: currentStepQuestionKey = 'pedirBancoAntigo'; break;
                    case 5: currentStepQuestionKey = 'pedirCpf'; break;
                    case 6: currentStepQuestionKey = 'pedirWhatsapp'; break;
                    default: currentStepQuestionKey = 'start'; // Fallback
                }
                addMessageToChat(getRandomResponse(currentStepQuestionKey));
            }
        }
    } else {
        // Se não há estado salvo, o chat já começa com a mensagem inicial no HTML.
        // A primeira interação do usuário com 'iniciar' irá mover o step para 1.
    }
});

