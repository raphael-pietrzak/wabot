# WhatsApp OpenAI Bot

A WhatsApp bot powered by OpenAI's GPT technology that enables automated conversations and AI-assisted interactions.

## Features

- WhatsApp message handling
- OpenAI GPT integration
- Automated responses
- Simple configuration
- Docker support for easy deployment

## Configuration

The bot requires the following environment variables in an `.env` file:

- `WHATSAPP_TOKEN` - WhatsApp authentication token
- `WHATSAPP_PHONE_NUMBER_ID` - Your WhatsApp phone number ID
- `SELF_PHONE_NUMBER` - Your WhatsApp phone number
- `WHATSAPP_VERIFY_TOKEN` - WhatsApp verification token
- `OPENAI_API_KEY` - OpenAI API key

## Option 1: Local Installation

### Prerequisites

- Node.js (v16 or newer)
- npm

### Installation Steps

1. Clone the repository
   ```bash
   git clone https://github.com/raphael-pietrzak/wabot.git
   cd wabot
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure your environment
   ```bash
   cp .env.example .env
   # Edit the .env file with your credentials
   ```

4. Launch the application
   ```bash
   npm start
   ```

## Option 2: Docker Installation

### Prerequisites

- Docker
- Docker Compose

### Using Docker Compose (recommended)

1. Clone the repository
   ```bash
   git clone https://github.com/raphael-pietrzak/wabot.git
   cd wabot
   ```

2. Configure your environment
   ```bash
   cp .env.example .env
   # Edit the .env file with your credentials
   ```

3. Launch with Docker Compose
   ```bash
   docker-compose up -d
   ```

4. View logs
   ```bash
   docker-compose logs -f
   ```

5. Stop the container
   ```bash
   docker-compose down
   ```

### Manually with Docker

1. Clone the repository and configure `.env` as shown above

2. Build the Docker image
   ```bash
   docker build -t wabot .
   ```

3. Run the container
   ```bash
   docker run -p 3000:3000 --env-file .env -d wabot
   ```

## Development

To run in development mode with automatic reload:
```bash
npm run dev
```

## License

MIT License

## Contributing

Pull requests are welcome. For major changes, please open an issue first.