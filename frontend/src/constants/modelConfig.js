export const MODEL_CONFIG = {
  sbi: {
    key: 'sbi',
    title: 'Face Swap & Reenactment Detection',
    shortTitle: 'SBI',
    icon: 'face',
    accentColor: '#E65100',
    accentColorLight: '#FFF3E0',
    description: 'Identifies blending artifacts around facial regions caused by face-swap or reenactment techniques. A high score suggests the face may have been replaced or animated using another identity.',
    resultSubtitle: 'Identifies blending artifacts from face-swapped or reenacted facial regions'
  },
  distildire: {
    key: 'distildire',
    title: 'AI Diffusion-Generated Image Detection',
    shortTitle: 'DistilDIRE',
    icon: 'sparkles',
    accentColor: '#6A1B9A',
    accentColorLight: '#F3E5F5',
    description: 'Detects images fully synthesized by diffusion-based AI models such as Stable Diffusion or Midjourney. A high score suggests the image was generated rather than photographed.',
    resultSubtitle: 'Measures how closely the image matches outputs from diffusion-based generative models'
  },
  chatgpt: {
    key: 'chatgpt',
    title: 'General Deepfake & Manipulation Detection',
    shortTitle: 'GPT Vision',
    icon: 'shield',
    accentColor: '#00695C',
    accentColorLight: '#E0F2F1',
    description: 'Analyzes broader signs of AI manipulation including noise inconsistencies, unnatural textures, and compression artifacts. Catches manipulations not covered by the above detectors.',
    resultSubtitle: 'Analyzes noise patterns, compression artifacts, and texture inconsistencies'
  }
};

// Per-model optimal thresholds
export const THRESHOLD = {
  sbi: 0.4839,
  distildire: 0.5,
  chatgpt: 0.65,
};

export const COLORS = {
  fake: {
    primary: '#E53935',
    background: '#FFEBEE',
    dark: '#B71C1C'
  },
  real: {
    primary: '#43A047',
    background: '#E8F5E9',
    dark: '#1B5E20'
  }
};
