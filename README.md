# Hybrid Deepfake Detection System

A web-based deepfake detection system that contrasts two lightweight specialized detectors against GPT-5.4 Vision — examining whether an API-accessible Vision-Language Model is a reliable alternative for everyday users.

Two categories of real-world deepfakes are targeted:
- **Face-swap & reenactment** → SBI (Self-Blended Images)
- **AI-synthesized / diffusion-generated** → DistilDIRE v2

GPT-5.4 Vision is included as a **comparative reference** using zero-shot prompting, not as part of the detection verdict.

## Project Status

### Implemented
- **Frontend**: React + Vite + Tailwind CSS — side-by-side VS layout (VLM vs Specialized Models)
- **Backend API**: FastAPI with `/api/v1/detect` endpoint
- **SBI Model**: EfficientNet-B4 fine-tuned on FFHQ + LFW + CelebA-HQ (AUC 98.73%)
- **DistilDIRE v2**: ConvNeXt-base with CLIP-LAION2B pretraining (AP 96.11%)
- **GPT-5.4 Vision**: Zero-shot comparative reference using Pirogov's logprobs normalization (ICML 2025)
- **Image Cropping**: Built-in crop tool before analysis
- **Independent Model Verdicts**: Each model targets a different manipulation type; no ensemble averaging
- **Docker Deployment**: Full containerized deployment with docker-compose

### Model Weights
Models run in "placeholder" mode if weight files are not present. Download model weights to enable full functionality:
- SBI: `backend/ml_models/deployment_package/models/sbi/`
- DistilDIRE: `backend/ml_models/deployment_package/models/distildire/`

## Architecture

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
│   │   ├── components/        # ImageUploader, CropModal, ResultDisplay, etc.
│   │   ├── services/          # API client
│   │   └── App.jsx
│   ├── package.json
│   ├── Dockerfile
│   └── vite.config.js
└── docker-compose.yml
```

## Models

| Model | Architecture | Input | Performance | Target |
|-------|-------------|-------|-------------|--------|
| **SBI** | EfficientNet-B4 | 380×380 | AUC 98.73%, Acc 94.83% | Face-swap & reenactment |
| **DistilDIRE v2** | ConvNeXt-base + CLIP | 224×224 | Acc 86.89%, AP 96.11% | AI-synthesized / diffusion images |
| **GPT-5.4 Vision** | VLM (API) | Auto-compressed | Comparative reference | Zero-shot general reasoning |

### Detection Strategy

Each specialized model runs independently. The image is flagged as fake if **any** specialized model exceeds its threshold:

- **SBI**: threshold 0.4839 (optimized for face-swap detection)
- **DistilDIRE**: threshold 0.50 (optimized for AI-generated image detection)
- **GPT-5.4 Vision**: threshold 0.65 — shown for comparison only, not used for the verdict

GPT confidence is derived from first-token logprobs normalization (Pirogov, ICML 2025):
```
P̃_fake = P(NO) / (P(NO) + P(YES))
```

## Setup

### Quick Start

```bash
# Set your OpenAI API key
echo "OPENAI_API_KEY=your_key_here" > backend/.env

# Start both services
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

**Prerequisites:** Python 3.11+, Node.js 16+, OpenAI API Key

```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env  # Add your OPENAI_API_KEY
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Usage

1. Open http://localhost:3000
2. Drag and drop an image or click to upload
3. Crop the image if needed, then confirm
4. View results — specialized model verdicts on the right, GPT comparison on the left

## Features

- **Drag & Drop Upload**: With automatic compression for images over 5MB
- **Image Cropping**: Crop before analysis using the built-in crop modal
- **VS Layout**: Side-by-side comparison of VLM output vs specialized detector output
- **Independent Verdicts**: SBI and DistilDIRE each give separate verdicts targeting different deepfake types
- **Confidence Scores**: Per-model confidence with clear interpretation (0.0 = real, 1.0 = fake)

## API

**POST** `/api/v1/detect` — accepts multipart/form-data with image file (PNG, JPG, JPEG, WEBP, max 20MB)

**Response:**
```json
{
  "is_fake": false,
  "models": {
    "sbi": { "is_fake": false, "confidence": 0.42, "status": "active" },
    "distildire": { "is_fake": false, "confidence": 0.31, "status": "active" },
    "chatgpt": { "is_fake": false, "confidence": 0.12, "status": "active" }
  }
}
```

Status values: `active`, `placeholder`, `error`

## Tech Stack

**Frontend:** React 19, Vite 7, Tailwind CSS 3, Axios, react-dropzone, react-easy-crop

**Backend:** FastAPI, PyTorch, OpenAI SDK, EfficientNet-PyTorch, timm + huggingface-hub

**Deployment:** Docker + Docker Compose

## GPU Support

Models auto-detect CUDA availability. CPU inference works but is slower (~1–2s per model). GPU reduces this to under 200ms.

## Model Weights

Download: [Google Drive](https://drive.google.com/file/d/17pou72RyAecPwZWBgw9syrDiP1C0dyXH/view?usp=sharing)

Extract `deployment_package.tar.gz` to `backend/ml_models/`

## Credits

### Datasets
- [Swappir Dataset](https://huggingface.co/datasets/Sumsub/Swappir) — LFW, CelebA-HQ, FairFace
- [FFHQ](https://github.com/NVlabs/ffhq-dataset)
- [Deepfake-Eval-2024](https://huggingface.co/datasets/nuriachandra/Deepfake-Eval-2024)
- [SimSwap](https://github.com/neuralchen/SimSwap)

### Code & Models
- [SBI](https://github.com/mapooon/SelfBlendedImages) — Shiohara & Yamasaki, CVPR 2022
- [DistilDIRE](https://arxiv.org/abs/2406.00856) — Lim et al., 2024
- [EfficientNet-PyTorch](https://github.com/lukemelas/EfficientNet-PyTorch)
- [ConvNeXt](https://github.com/facebookresearch/ConvNeXt)
- [timm](https://github.com/huggingface/pytorch-image-models)
- [OpenAI API](https://platform.openai.com/)

### References
- Pirogov & Artemev, *Visual Language Models as Zero-Shot Deepfake Detectors*, ICML 2025
- Pirogov & Artemev, *Evaluating Deepfake Detectors in the Wild*, 2025
- Castaneda et al., *Revisiting Simple Baselines for In-The-Wild Deepfake Detection*, 2025
- Chandra et al., *Deepfake-Eval-2024*, 2025
