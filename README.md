# TwinMind - AI Second Brain Chrome Extension

## 🧠 Product Vision

TwinMind is an AI-powered "second brain" that captures all user interactions, comprehends personal context, and delivers real-time insights. Unlike traditional AI assistants, TwinMind **amplifies human memory and cognition** rather than replacing it, acting as a seamless cognitive extension.

## 🎯 Core Objectives

- **Context Capture**: Passively collect browser interactions, audio, and visual data
- **Intelligent Comprehension**: Process and understand personal context across all captured data
- **Real-Time Insights**: Deliver actionable intelligence at the moment of need
- **Privacy-First**: Secure, user-controlled data with transparent permissions
- **Seamless Integration**: Non-intrusive extension that works alongside user workflows

## 🏗️ Architecture Overview

### Frontend (Chrome Extension)
- **Manifest V3** Chrome Extension architecture
- **React + TypeScript** for popup and options UI
- **Background Service Worker** for continuous context capture
- **Content Scripts** for webpage interaction monitoring
- **Chrome APIs**: tabs, storage, permissions, audio capture

### Backend (Google Cloud Platform)
- **Cloud Functions**: Serverless API endpoints for data processing
- **Cloud Run**: Containerized services for AI/ML inference
- **Cloud SQL/Firestore**: Persistent storage for user data and context
- **Pub/Sub**: Event-driven architecture for real-time processing
- **Cloud Storage**: Large file storage (audio, screenshots)
- **Secret Manager**: Secure API key and credentials management

### AI/ML Pipeline
- Natural language processing for text understanding
- Audio transcription and analysis
- Visual context extraction from screenshots
- Contextual embedding generation
- Real-time inference for insights delivery

## 🚀 Key Features

### Phase 1: Core Extension
- [x] Manifest V3 setup
- [ ] Background context capture (browsing history, active tabs)
- [ ] Basic popup UI with React
- [ ] Local storage for captured data
- [ ] Options page for settings

### Phase 2: Data Collection
- [ ] Passive audio capture with permissions
- [ ] Screenshot capture at key moments
- [ ] Form input tracking (with user consent)
- [ ] Time-based activity logging
- [ ] Secure data transmission to backend

### Phase 3: Backend Infrastructure
- [ ] RESTful API setup on Cloud Functions
- [ ] Database schema design (Cloud SQL/Firestore)
- [ ] Authentication and user management
- [ ] Data encryption and privacy controls
- [ ] Pub/Sub event pipeline

### Phase 4: AI Integration
- [ ] Text processing and NLP
- [ ] Audio transcription service
- [ ] Context embedding generation
- [ ] Similarity search for relevant memories
- [ ] Real-time insight generation

### Phase 5: Advanced Features
- [ ] Proactive suggestions
- [ ] Cross-session context linking
- [ ] Personalized knowledge graph
- [ ] Export and data portability
- [ ] Multi-device sync

## 🛠️ Technology Stack

### Frontend
- **React 18+** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Chrome Extension APIs** - Browser integration

### Backend
- **Node.js/TypeScript** - Runtime
- **Express** - API framework
- **Google Cloud Functions** - Serverless compute
- **Google Cloud Run** - Container services
- **Cloud SQL (PostgreSQL)** - Relational database
- **Firestore** - NoSQL document store
- **Pub/Sub** - Message queue
- **Cloud Storage** - Object storage

### AI/ML
- **OpenAI API** - Language models
- **Google Speech-to-Text** - Audio transcription
- **Google Vision API** - Image analysis
- **Vector Database** - Embedding search (Pinecone/Weaviate)

### DevOps
- **GitHub Actions** - CI/CD
- **Docker** - Containerization
- **Terraform** - Infrastructure as Code
- **Cloud Monitoring** - Observability

## 📁 Project Structure

```
twinmind-assignment/
├── extension/                 # Chrome extension source
│   ├── src/
│   │   ├── background/       # Service worker
│   │   ├── content/          # Content scripts
│   │   ├── popup/            # Popup UI (React)
│   │   ├── options/          # Options page (React)
│   │   ├── components/       # Shared React components
│   │   └── utils/            # Utility functions
│   ├── public/               # Static assets
│   ├── manifest.json         # Extension manifest
│   └── package.json
├── backend/                   # Backend services
│   ├── functions/            # Cloud Functions
│   ├── services/             # Cloud Run services
│   ├── shared/               # Shared code
│   └── infrastructure/       # Terraform configs
├── docs/                      # Documentation
├── tests/                     # Test suites
└── README.md
```

## 🔒 Security & Privacy

- **End-to-end encryption** for sensitive data
- **Granular permissions** - users control what's captured
- **Local-first storage** with optional cloud sync
- **GDPR/CCPA compliance** ready
- **Regular security audits** and penetration testing
- **Open-source transparency** for community review

## 📊 Success Metrics

- **Capture Accuracy**: >95% of relevant context captured
- **Insight Relevance**: User rating >4.5/5
- **Response Time**: <500ms for real-time insights
- **Data Privacy**: Zero security breaches
- **User Retention**: >80% after 30 days
- **Performance**: <50MB memory footprint

## 🧪 Development Workflow

1. **Local Development**: Hot-reload extension development
2. **Testing**: Unit, integration, and E2E tests
3. **Code Review**: Mandatory peer review for all PRs
4. **Staging**: Deploy to test environment on GCP
5. **Production**: Gradual rollout with monitoring
6. **Monitoring**: Real-time alerts and error tracking

## 🎓 Team Standards

- Write **clean, documented, testable code**
- Follow **React and TypeScript best practices**
- Implement **comprehensive error handling**
- Optimize for **performance and scalability**
- Prioritize **user experience and accessibility**
- Maintain **high code coverage** (>80%)

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- Chrome browser
- GCP account (for backend)
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/tanish-hrk/Twinmind-Assignment.git
cd Twinmind-Assignment

# Install extension dependencies
cd extension
npm install

# Build extension
npm run build

# Load in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the extension/dist folder
```

### Backend Setup

```bash
# Install backend dependencies
cd backend
npm install

# Configure GCP credentials
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Deploy functions
npm run deploy
```

## 📚 Documentation

- [Architecture Deep Dive](./docs/architecture.md)
- [Extension Development Guide](./docs/extension-dev.md)
- [Backend API Reference](./docs/api-reference.md)
- [Security Guidelines](./docs/security.md)
- [Contributing Guide](./docs/contributing.md)

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](./docs/contributing.md) and [Code of Conduct](./docs/code-of-conduct.md).

## 📄 License

[MIT License](./LICENSE)

## 🌟 Acknowledgments

Built by a team with experience from:
- Google X (moonshot projects)
- Wall Street (revenue generation)
- Nobel Prize-winning science
- Successful startup scaling

Backed by leading Silicon Valley VCs.

---

**TwinMind** - Amplifying human intelligence, one interaction at a time.