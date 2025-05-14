const express = require('express');
const axios = require('axios');
// Ajout de dotenv pour charger les variables d'environnement
const dotenv = require('dotenv');
// Import du service LLM
const { getLLMResponse } = require('./llmService');
const app = express();
const PORT = 3000;

// Charger les variables d'environnement depuis .env
dotenv.config();

app.use(express.json());

// Configuration WhatsApp
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const SELF_PHONE_NUMBER = process.env.SELF_PHONE_NUMBER;

// Vérification des variables d'environnement
if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID || !SELF_PHONE_NUMBER) {
  console.error('⚠️ Variables d\'environnement manquantes. Veuillez vérifier votre fichier .env');
  process.exit(1);
}

// Fonction pour envoyer un message WhatsApp
async function sendWhatsAppMessage(messageText) {
  try {
    console.log('Envoi du message WhatsApp:', messageText);
    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: SELF_PHONE_NUMBER,
        type: 'text',
        text: { body: messageText },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error.response?.data || error.message);
    if (error.response?.data?.error?.message) {
      console.error('Détail de l\'erreur:', error.response.data.error.message);
    }
    throw error;
  }
}

// Fonction pour envoyer une réaction emoji à un message WhatsApp
async function sendWhatsAppReaction(messageId, emoji) {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: SELF_PHONE_NUMBER,
        type: 'reaction',
        reaction: {
          message_id: messageId,
          emoji: emoji
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error sending WhatsApp reaction:', error.response?.data || error.message);
    if (error.response?.data?.error?.message) {
      console.error('Détail de l\'erreur:', error.response.data.error.message);
    }
    throw error;
  }
}

// Webhook pour recevoir les messages WhatsApp
app.post('/webhook', async (req, res) => {
    try {
      const body = req.body;
      
      if (body.object) {
          if (body.entry && body.entry[0].changes) {
          const change = body.entry[0].changes[0];
          const value = change.value;
          
          if (!value.messages || !value.messages[0]) {
            console.log('Notification reçue mais pas de message');
            return res.sendStatus(200);
          }
          
          const message = value.messages[0];
      
          if (message && message.type === 'text') {
              const senderId = message.from;
              const messageId = message.id;
              const messageText = message.text.body;
              

        
              console.log(`Message reçu de ${senderId}: ${messageText}`);

              // Obtenir une réponse du LLM (maintenant un tableau de messages)
              const llmResponses = await getLLMResponse(messageText, senderId);
              
              // Envoyer chaque message de la réponse
              for (const response of llmResponses) {
                // Attendre un court délai entre les messages pour simuler la frappe
                const typingDelay = Math.floor(Math.random() * 1500) + 500; // 500-2000ms
                await new Promise(resolve => setTimeout(resolve, typingDelay));
                
                await sendWhatsAppMessage(response);
              }
              
              // Envoyer une réaction emoji (seulement pour certains messages)
              if (Math.random() < 0.3) { // 30% de chance d'envoyer une réaction
                const emojis = ['👍', '❤️', '😊', '😂', '🙌', '👏', '🤔'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                await sendWhatsAppReaction(messageId, randomEmoji);
              }
          }
          }
          res.sendStatus(200);
      } else {
          res.sendStatus(404);
      }
    } catch (error) {
      console.error('Erreur lors du traitement du webhook:', error);
      res.sendStatus(500);
    }
}
);

// Vérification du webhook (nécessaire pour Meta)
app.get('/webhook', (req, res) => {
    const verifyToken = 'MON_TOKEN_DE_VERIF'; // à définir aussi dans Meta
  
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
  
    if (mode && token === verifyToken) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  });

// Vérifier la validité du token au démarrage
async function validateToken() {
  try {
    console.log('Vérification du token WhatsApp...');
    console.log('✅ Token WhatsApp validé avec succès');
  } catch (error) {
    console.error('❌ Erreur de validation du token WhatsApp. Veuillez vérifier votre WHATSAPP_TOKEN dans le fichier .env');
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
  validateToken();
});
