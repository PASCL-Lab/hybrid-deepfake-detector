# Hybrid Deepfake Detector

> A web-based ensemble that contrasts two specialized vision detectors with a Vision-Language Model for accessible, real-world deepfake detection.

## Overview

The Hybrid Deepfake Detector is a research artifact that benchmarks two lightweight, task-specialized deepfake detectors against an API-accessible Vision-Language Model (VLM) to investigate whether everyday users can rely on commercial VLMs for credible deepfake screening. The system orchestrates three independent detectors — Self-Blended Images (SBI) for face-swap and reenactment artifacts, DistilDIRE v2 for AI-synthesized / diffusion-generated images, and a zero-shot GPT Vision reference — and exposes them through a FastAPI service with a React + Vite frontend. Each specialized model emits an independent verdict; the VLM is included as a comparative baseline rather than as part of the final decision. The repository ships the model loaders, the inference orchestration, a Dockerized backend, the React UI with cropping and side-by-side comparison, and deployment scripts.

## Research Context

The system implements the evaluation methodology proposed in Pirogov & Artemev, *Visual Language Models as Zero-Shot Deepfake Detectors* (ICML 2025), using first-token logprob normalization (`P̃_fake = P(NO) / (P(NO) + P(YES))`) to derive calibrated VLM scores, and integrates established specialized detectors from Shiohara & Yamasaki (SBI, CVPR 2022) and Lim et al. (DistilDIRE, 2024).

## Features

- Independent specialized verdicts for face-swap (SBI) and AI-synthesized imagery (DistilDIRE v2)
- Zero-shot GPT Vision baseline using log-probability normalization for calibrated confidence
- Drag-and-drop upload with automatic compression for files over 5 MB
- Built-in cropping modal for region-of-interest analysis prior to inference
- Side-by-side VS layout comparing the VLM reference against specialized detectors
- Containerized deployment via Docker Compose with health checks for both services

## Architecture

The detection backend exposes a single `/api/v1/detect` endpoint that fans an uploaded image out to three independent models:

- **SBI** — EfficientNet-B4 fine-tuned on FFHQ + LFW + CelebA-HQ self-blended pairs, 380x380 input, decision threshold 0.4839 (reported AUC 98.73%, accuracy 94.83%).
- **DistilDIRE v2** — ConvNeXt-base initialized from CLIP-LAION2B weights for diffusion-image discrimination, 224x224 input, threshold 0.50 (reported accuracy 86.89%, AP 96.11%).
- **GPT Vision** — OpenAI Vision API queried with a zero-shot prompt; the fake probability is reconstructed from first-token logprobs and shown for reference only.

An image is flagged as fake if **any** specialized model exceeds its threshold; ensemble averaging is intentionally avoided because each detector targets a different manipulation family. Models auto-detect CUDA and fall back to a "placeholder" mode when weights are absent so the API surface remains testable without the full deployment bundle.

## Tech Stack

- **Backend:** Python 3.11+, FastAPI, PyTorch, timm, EfficientNet-PyTorch, OpenAI SDK
- **Frontend:** React 19, Vite 7, Tailwind CSS 3, Axios, react-dropzone, react-easy-crop
- **Deployment:** Docker, Docker Compose, Nginx (frontend), Uvicorn (backend)

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 16+
- Docker and Docker Compose (for the containerized path)
- An OpenAI API key with Vision access
- (Optional) CUDA-capable GPU for sub-200 ms inference

### Installation

```bash
git clone https://github.com/PASCL-Lab/hybrid-deepfake-detector.git
cd hybrid-deepfake-detector
echo "OPENAI_API_KEY=your_key_here" > backend/.env
```

Model weights are distributed separately; extract `deployment_package.tar.gz` into `backend/ml_models/` so that the `sbi/` and `distildire/` directories sit under `backend/ml_models/deployment_package/models/`.

### Running

#### Inference / API (Docker)

```bash
docker-compose up -d --build
```

The frontend is then available on `http://localhost:3000`, the API on `http://localhost:8000`, and interactive docs on `http://localhost:8000/docs`.

#### Inference / API (manual)

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

#### Quick start script

```bash
./start.sh   # launches backend + frontend with logs in /tmp
./stop.sh    # stops both processes
```

## Project Structure

```
backend/
  app/
    api/v1/endpoints/    # /api/v1/detect FastAPI route
    models/              # SBI, DistilDIRE, ChatGPT Vision loaders
    services/            # Detection orchestration
    ml_inference/        # SBI architecture and DistilDIRE v2 model
    core/                # Settings / configuration
  ml_models/             # Model weight directory (gitignored)
  Dockerfile
frontend/
  src/
    components/          # ImageUploader, CropModal, ResultDisplay
    services/            # API client
  Dockerfile
  nginx.conf
docker-compose.yml
start.sh / stop.sh
```

## License

This project is the intellectual property of **PASCL Lab**. All rights reserved.

Unauthorized copying, distribution, modification, or use of this codebase, in whole or in part, is strictly prohibited without prior written permission from PASCL Lab.

(c) 2026 PASCL Lab. All rights reserved.
