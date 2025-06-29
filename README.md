# Chatbot Bolsa Família - Deploy no Netlify

Este projeto é um chatbot para simulação de empréstimo do Bolsa Família, pronto para deploy manual no Netlify.

## Como fazer o deploy no Netlify

### 1. Preparar os arquivos
- Faça o download de todos os arquivos desta pasta
- Comprima todos os arquivos em um arquivo ZIP

### 2. Deploy no Netlify
1. Acesse [netlify.com](https://netlify.com) e faça login
2. Clique em "Sites" no menu lateral
3. Arraste e solte o arquivo ZIP na área "Deploy manually"
4. Aguarde o deploy ser concluído

### 3. Configurar variáveis de ambiente
Após o deploy, você precisa configurar as variáveis de ambiente para o Telegram:

1. No painel do Netlify, vá para "Site settings"
2. Clique em "Environment variables"
3. Adicione as seguintes variáveis:

```
TELEGRAM_BOT_TOKEN=SEU_TOKEN_DO_BOT_AQUI
TELEGRAM_CHAT_ID=SEU_CHAT_ID_AQUI
```

### 4. Como obter o Token do Bot e Chat ID

#### Token do Bot:
1. No Telegram, procure por @BotFather
2. Envie `/newbot` e siga as instruções
3. Copie o token fornecido

#### Chat ID:
1. Crie um grupo no Telegram ou use um chat existente
2. Adicione o bot ao grupo
3. Envie uma mensagem no grupo
4. Acesse: `https://api.telegram.org/bot[SEU_TOKEN]/getUpdates`
5. Procure pelo "chat":{"id": na resposta - esse é seu Chat ID

### 5. Testar o funcionamento
Após configurar as variáveis de ambiente:
1. Acesse seu site no Netlify
2. Teste o fluxo completo do chatbot
3. Verifique se as mensagens chegam no Telegram

## Estrutura do projeto

```
/
├── index.html          # Página principal
├── style.css           # Estilos do chatbot
├── script.js           # Lógica do chatbot
├── package.json        # Dependências do projeto
├── netlify/
│   └── functions/
│       └── sendToTelegram.js  # Função para enviar leads ao Telegram
└── README.md           # Este arquivo
```

## Funcionalidades

- Interface de chat responsiva
- Validação de CPF
- Qualificação de leads
- Envio automático para Telegram
- Integração com Facebook Pixel (opcional)

## Suporte

Se encontrar problemas:
1. Verifique se as variáveis de ambiente estão configuradas corretamente
2. Teste o bot do Telegram separadamente
3. Verifique os logs do Netlify em "Functions" > "sendToTelegram"

