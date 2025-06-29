// functions/sendToTelegram.js
const axios = require('axios'); // Importa a biblioteca Axios para fazer requisições HTTP

/**
 * Netlify Function para enviar leads qualificados para o Telegram.
 * O TOKEN do bot e o CHAT_ID do Telegram DEVEM ser configurados como variáveis de ambiente na Netlify.
 */
exports.handler = async function(event, context) {
    // Garante que a função só responde a requisições POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Extrai os dados do lead do corpo da requisição
        const { leadData } = JSON.parse(event.body);

        // Acessa as variáveis de ambiente configuradas na Netlify
        // ESTES VALORES SÃO FORNECIDOS PELA NETLIFY, NÃO FICAM AQUI NO CÓDIGO!
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

        // Validação essencial: verifica se os tokens estão configurados
        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            console.error('Erro de configuração: TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID não definidos nas variáveis de ambiente da Netlify.');
            return {
                statusCode: 500, // Retorna 500 se as variáveis de ambiente não estiverem configuradas
                body: JSON.stringify({ success: false, message: 'Erro de configuração interna do Telegram. Variáveis de ambiente ausentes.' })
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

        // Tenta fazer a requisição POST para a API do Telegram
        await axios.post(telegramUrl, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown' // Permite o uso de negrito no Telegram
        });

        console.log('Lead enviado com sucesso para o Telegram.');

        return {
            statusCode: 200, // Sucesso na comunicação com o Telegram
            body: JSON.stringify({ success: true, message: 'Lead enviado para o Telegram.' })
        };

    } catch (error) {
        // Captura e loga erros durante a comunicação com a API do Telegram
        console.error('Erro ao processar o lead ou enviar para o Telegram:', error.message);

        let errorMessage = 'Erro desconhecido ao enviar para o Telegram.';
        let errorStatus = 500; // Default para erro interno

        if (error.response) {
            // Erro retornado pela API do Telegram (ex: token inválido, chat_id errado)
            errorStatus = error.response.status; // Pode ser 400, 401, 404 da API do Telegram
            errorMessage = `Erro da API do Telegram: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
            console.error('Resposta de erro detalhada da API do Telegram:', error.response.data);
        } else if (error.request) {
            // A requisição foi feita, mas não houve resposta (ex: rede offline)
            errorMessage = 'Sem resposta da API do Telegram. Verifique sua conexão ou a disponibilidade da API.';
        } else {
            // Outros erros na configuração da requisição
            errorMessage = `Erro ao configurar requisição para Telegram: ${error.message}`;
        }

        return {
            statusCode: errorStatus, // Retorna o status de erro real da API ou 500
            body: JSON.stringify({ success: false, message: errorMessage })
        };
    }
};

