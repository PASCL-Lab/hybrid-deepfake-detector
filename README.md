# Hybrid Deepfake Detection System

A web-based deepfake detection system combining three AI models — SBI (Self-Blended Images), DistilDIRE, and GPT-5.4 Vision — each targeting a distinct class of facial manipulation.

## Project Status

### Implemented
- **Frontend**: React + Vite + Tailwind CSS (black & white minimalist design)
- **Backend API**: FastAPI with `/api/v1/detect` endpoint
- **GPT-5.4 Vision**: Zero-shot deepfake detection using Pirogov's logprobs normalization method (ICML 2025)
- **SBI Model**: EfficientNet-B4 fine-tuned on FFHQ + LFW + CelebA-HQ (AUC 98.73%)
- **DistilDIRE Model**: ConvNeXt-base with CLIP-LAION2B pretraining (AP 96.11%)
- **Independent Model Verdicts**: Each model targets different manipulation types; no ensemble averaging
- **Docker Deployment**: Full containerized deployment with docker-compose

### Model Availability
Models run in "placeholder" mode if weight files are not present. Download model weights to enable full functionality:
- SBI: `backend/ml_models/deployment_package/models/sbi/`
- DistilDIRE: `backend/ml_models/deployment_package/models/distildire/`

## Project Architecture

```
├── backend/                     # FastAPI Backend
│   ├── app/
│   │   ├── api/v1/endpoints/   # Detection endpoint
│   │   ├── models/             # ML Model Loaders
│   │   │   ├── sbi_model.py
│   │   │   ├── distildire_model.py
│   │   │   └── chatgpt_vision.py
│   │   ├── services/           # Detection orchestration
│   │   ├── ml_inference/       # Model architectures
│   │   │   ├── sbi/           # SBI detector architecture
│   │   │   └── improved_model.py  # DistilDIRE v2
│   │   └── core/               # Configuration
│   ├── ml_models/              # Model weight files
│   │   └── deployment_package/models/
│   │       ├── sbi/           # SBI weights
│   │       └── distildire/    # DistilDIRE weights
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/        # ImageUploader, ResultDisplay
│   │   ├── services/          # API client
│   │   └── App.jsx
│   ├── package.json
│   ├── Dockerfile
│   └── vite.config.js
└── docker-compose.yml          # Container orchestration
```

## Models

| Model | Architecture | Input Size | Performance |
|-------|-------------|------------|-------------|
| **SBI** | EfficientNet-B4 | 380×380 | AUC 98.73%, Acc 94.83% — targets face-swap & reenactment |
| **DistilDIRE v2** | ConvNeXt-base + CLIP | 224×224 | Acc 86.89%, AP 96.11% — targets AI-synthesized images |
| **GPT-5.4 Vision** | GPT-5.4 (VLM) | Auto-compressed | Zero-shot — targets general manipulation & artifacts |

### Detection Strategy

Each model runs independently and targets a different manipulation type. The image is flagged as fake if **any** model exceeds its per-model threshold:

- **SBI**: threshold 0.4839 (optimized for face-swap detection)
- **DistilDIRE**: threshold 0.50 (optimized for AI-generated image detection)
- **GPT-5.4 Vision**: threshold 0.65 — confidence derived from first-token logprobs normalization (Pirogov, ICML 2025): `P̃_fake = P(NO) / (P(NO) + P(YES))`

## Setup

### Quick Start (Recommended)

```bash
# Set your OpenAI API key
echo "OPENAI_API_KEY=your_key_here" > backend/.env

# Start both frontend and backend
./start.sh
```

### Docker

```bash
echo "OPENAI_API_KEY=your_key_here" > backend/.env
docker-compose up -d --build
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Manual Setup

#### Prerequisites
- Python 3.11+
- Node.js 16+
- OpenAI API Key

#### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # Add your OPENAI_API_KEY
uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:3000

## Usage

1. Open http://localhost:3000 in your browser
2. Drag and drop an image or click to upload
3. Wait for AI analysis
4. View detection results with confidence scores

## Features

- **Drag & Drop Upload**: Intuitive image upload interface
- **Automatic Compression**: Images up to 20MB are automatically compressed to optimize API calls
- **Real-time Detection**: Instant analysis using GPT-4o Vision
- **Detailed Results**: Confidence scores from each model
- **Responsive Design**: Clean black & white minimalist UI

## API Endpoint

**POST** `/api/v1/detect`

- **Input**: Image file (PNG, JPG, JPEG, WEBP, max 20MB)
- **Processing**: Auto-compressed to ~5MB for optimal API performance

**Response:**
```json
{
  "is_fake": false,
  "models": {
    "sbi": {
      "is_fake": false,
      "confidence": 0.42,
      "status": "active"
    },
    "distildire": {
      "is_fake": false,
      "confidence": 0.31,
      "status": "active"
    },
    "chatgpt": {
      "is_fake": false,
      "confidence": 0.12,
      "status": "active"
    }
  }
}
```

**Status Values:** `active`, `placeholder`, `error`

**Confidence Interpretation:** 0.0 = definitely real, 1.0 = definitely fake

## Tech Stack

**Frontend:**
- React 19 + Vite 7
- Tailwind CSS 3
- Axios + React Dropzone

**Backend:**
- FastAPI + Uvicorn
- PyTorch (CPU/GPU)
- OpenAI Python SDK
- EfficientNet-PyTorch (SBI)
- timm + huggingface-hub (DistilDIRE)

**Deployment:**
- Docker + Docker Compose

## GPU Support

Models auto-detect CUDA availability. For GPU inference:
- Local: Install PyTorch with CUDA support
- AWS: Use g4dn.xlarge or similar GPU instances

## Model Weights

Download: [Google Drive](https://drive.google.com/file/d/17pou72RyAecPwZWBgw9syrDiP1C0dyXH/view?usp=sharing)

Extract `deployment_package.tar.gz` to `backend/ml_models/`

## Credits

### Datasets
- [Swappir Dataset](https://huggingface.co/datasets/Sumsub/Swappir) - LFW, CelebA-HQ, FairFace
- [FFHQ](https://github.com/NVlabs/ffhq-dataset)
- [Deepfake-Eval-2024](https://huggingface.co/datasets/nuriachandra/Deepfake-Eval-2024)
- [SimSwap](https://github.com/neuralchen/SimSwap)
- [Roop](https://github.com/s0md3v/roop)

### Code & Pretrained Models
- [EfficientNet-PyTorch](https://github.com/lukemelas/EfficientNet-PyTorch)
- [RetinaFace](https://github.com/ternaus/retinaface)
- [ConvNeXt](https://github.com/facebookresearch/ConvNeXt)
- [timm](https://github.com/huggingface/pytorch-image-models)
- [OpenAI API](https://platform.openai.com/)
