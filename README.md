# WhatsApp OpenAI Bot

A WhatsApp bot powered by OpenAI's GPT technology that enables automated conversations and AI-assisted interactions.

## Features

- WhatsApp message handling
- OpenAI GPT integration
- Automated responses
- Simple configuration

## Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/wabot.git
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your credentials
```

## Configuration

Add your credentials in the `.env` file:

- WHATSAPP_TOKEN='token whatsapp'
- WHATSAPP_PHONE_NUMBER_ID='id whatsapp'
- SELF_PHONE_NUMBER='numéro whatsapp'
- WHATSAPP_VERIFY_TOKEN='token de vérification'
- OPENAI_API_KEY='clé openai'

## Usage

Run the bot:

```bash
npm start
```

## License

MIT License

## Contributing

Pull requests are welcome. For major changes, please open an issue first.