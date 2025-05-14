const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// Récupération du token API depuis les variables d'environnement
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Stockage de l'historique des conversations par utilisateur
const conversationHistory = {};

// Stockage des profils de personnalité par utilisateur
const userProfiles = {};

// Nombre maximum de messages à conserver dans l'historique par utilisateur
const MAX_HISTORY_LENGTH = 10;

/**
 * Génère un profil aléatoire pour le LLM
 * @returns {string} - Le prompt de personnalité généré
 */
function generateRandomProfile() {
  // Traits de personnalité
  const personalities = [
    'extraverti(e) et sociable',
    'introverti(e) et réfléchi(e)',
    'optimiste et énergique',
    'pragmatique et direct(e)',
    'créatif(ve) et rêveur(se)',
    'analytique et logique',
    'empathique et attentionné(e)',
    'sarcastique et taquin(e)',
    'réservé(e) et mystérieux(se)',
    'confiant(e) et ambitieux(se)'
  ];
  
  // Styles de communication
  const communicationStyles = [
    'utilise beaucoup d\'emojis',
    'écrit des messages concis',
    'utilise parfois des abréviations (mdr, jsp, etc.)',
    'écrit en phrases complètes et bien structurées',
    'utilise rarement la ponctuation',
    'pose souvent des questions en retour',
    'partage facilement des anecdotes personnelles',
    'envoie parfois juste des réactions brèves',
    'prend son temps pour répondre aux questions importantes',
    'change parfois de sujet brusquement'
  ];
  
  // Intérêts
  const interests = [
    'la musique',
    'les voyages',
    'la cuisine',
    'les films et séries',
    'la littérature',
    'le sport',
    'l\'art',
    'la technologie',
    'la nature',
    'la photographie'
  ];
  
  // Sélection aléatoire
  const personality = personalities[Math.floor(Math.random() * personalities.length)];
  const style = communicationStyles[Math.floor(Math.random() * communicationStyles.length)];
  const interest1 = interests[Math.floor(Math.random() * interests.length)];
  let interest2 = interests[Math.floor(Math.random() * interests.length)];
  while (interest2 === interest1) {
    interest2 = interests[Math.floor(Math.random() * interests.length)];
  }
  
  // Génération du prompt
  return `Tu es une personne ${personality}. Dans tes conversations WhatsApp, tu ${style}. 
Tu t'intéresses particulièrement à ${interest1} et ${interest2}. 
Réponds naturellement comme un humain, sans te soucier de la grammaire ou de l'orthographe.
Occasionnellement (environ 30% du temps), envoie plusieurs messages consécutifs pour donner l'impression d'une conversation réelle (sépare tes idées avec le marqueur [NOUVEAU_MESSAGE]).
Reste cohérent avec ta personnalité, mais adapte-toi au ton de la conversation. Renvoie des messages très très courts 5 mots max et directs`;
}

/**
 * Obtient une réponse du LLM en fonction du message d'entrée et du contexte de conversation
 * @param {string} message - Le message reçu auquel le LLM doit répondre
 * @param {string} userId - Identifiant unique de l'utilisateur pour maintenir son contexte
 * @returns {Promise<string[]>} - Un tableau de réponses générées par le LLM
 */
async function getLLMResponse(message, userId = 'default') {
  try {
    // Vérification que la clé API est définie
    if (!OPENAI_API_KEY) {
      console.error("Clé API OpenAI manquante dans le fichier .env");
      return ["Je ne peux pas répondre pour le moment, une erreur de configuration est survenue."];
    }

    // Initialisation de l'historique pour cet utilisateur s'il n'existe pas
    if (!conversationHistory[userId]) {
      conversationHistory[userId] = [];
    }
    
    // Génération d'un profil aléatoire pour cet utilisateur s'il n'en a pas encore
    if (!userProfiles[userId]) {
      userProfiles[userId] = generateRandomProfile();
      console.log(`Nouveau profil généré pour ${userId}: ${userProfiles[userId]}`);
    }

    // Construction des messages avec le contexte de conversation
    const messages = [
      {
        "role": "system",
        "content": userProfiles[userId]
      },
      // Ajout de l'historique de conversation
      ...conversationHistory[userId],
      // Ajout du nouveau message de l'utilisateur
      {
        "role": "user",
        "content": message
      }
    ];

    // Appel à l'API OpenAI
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        "model": "gpt-4.1-mini",
        "messages": messages,
        "max_tokens": 150, // Augmenté pour permettre des réponses plus longues ou multiples
        "temperature": 0.9,
        "top_p": 0.9,
        "frequency_penalty": 0.4,
        "presence_penalty": 0.5
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );

    const assistantReplyRaw = response.data.choices[0].message.content.trim();
    
    // Division de la réponse en plusieurs messages si nécessaire
    const assistantReplies = assistantReplyRaw.split("[NOUVEAU_MESSAGE]").map(msg => msg.trim()).filter(msg => msg.length > 0);
    
    // Mise à jour de l'historique avec le nouveau message de l'utilisateur et la réponse complète
    conversationHistory[userId].push(
      { "role": "user", "content": message },
      { "role": "assistant", "content": assistantReplyRaw.replace(/\[NOUVEAU_MESSAGE\]/g, " ") }
    );
    
    // Limitation de la taille de l'historique
    if (conversationHistory[userId].length > MAX_HISTORY_LENGTH * 2) {
      // Garder les messages les plus récents en supprimant les plus anciens
      conversationHistory[userId] = conversationHistory[userId].slice(-MAX_HISTORY_LENGTH * 2);
    }

    return assistantReplies.length > 0 ? assistantReplies : ["..."];
  } catch (error) {
    console.error("Erreur lors de l'appel au LLM:", error.response?.data || error.message);
    return ["Désolé, je suis occupé."];
  }
}

/**
 * Efface l'historique de conversation pour un utilisateur spécifique
 * @param {string} userId - Identifiant unique de l'utilisateur
 */
function clearConversationHistory(userId = 'default') {
  if (conversationHistory[userId]) {
    conversationHistory[userId] = [];
    // Réinitialiser également le profil pour générer une nouvelle personnalité
    userProfiles[userId] = null;
    return true;
  }
  return false;
}

module.exports = { getLLMResponse, clearConversationHistory };
