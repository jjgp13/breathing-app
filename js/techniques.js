/** Protocol and source metadata; copy lives in locales/*.json. */
const techniques = {
  "box": {
    "id": "box",
    "icon": "🔲",
    "color": "#64b5f6",
    "phases": [
      {
        "name": "Inhale",
        "duration": 4,
        "type": "inhale"
      },
      {
        "name": "Hold",
        "duration": 4,
        "type": "hold"
      },
      {
        "name": "Exhale",
        "duration": 4,
        "type": "exhale"
      },
      {
        "name": "Hold",
        "duration": 4,
        "type": "hold"
      }
    ],
    "animation": "box",
    "maxCycles": 10,
    "defaultCycles": 4,
    "research": {
      "reviewed": "2026-10-15",
      "sources": [
        {
          "title": "Balban et al. — Brief structured respiration practices",
          "year": 2023,
          "url": "https://pubmed.ncbi.nlm.nih.gov/36630953/"
        },
        {
          "title": "Marchant et al. — Square, 4-7-8, and six breaths per minute",
          "year": 2025,
          "url": "https://pubmed.ncbi.nlm.nih.gov/39864026/"
        },
        {
          "title": "Riedl et al. — One-minute cyclic sighing and box breathing pilot",
          "year": 2026,
          "url": "https://pubmed.ncbi.nlm.nih.gov/42002307/"
        }
      ]
    },
    "advanced": false
  },
  "fourSevenEight": {
    "id": "fourSevenEight",
    "icon": "🌙",
    "color": "#9c7cf4",
    "phases": [
      {
        "name": "Inhale",
        "duration": 4,
        "type": "inhale"
      },
      {
        "name": "Hold",
        "duration": 7,
        "type": "hold"
      },
      {
        "name": "Exhale",
        "duration": 8,
        "type": "exhale"
      }
    ],
    "animation": "arc",
    "maxCycles": 20,
    "defaultCycles": 4,
    "research": {
      "reviewed": "2026-10-14",
      "sources": [
        {
          "title": "Vierra et al. — Immediate effects of 4-7-8 breathing",
          "year": 2022,
          "url": "https://pubmed.ncbi.nlm.nih.gov/35822447/"
        },
        {
          "title": "Marchant et al. — Square, 4-7-8, and six breaths per minute",
          "year": 2025,
          "url": "https://pubmed.ncbi.nlm.nih.gov/39864026/"
        }
      ]
    },
    "advanced": false
  },
  "diaphragmatic": {
    "id": "diaphragmatic",
    "icon": "🫁",
    "color": "#4db6ac",
    "phases": [
      {
        "name": "Inhale",
        "duration": 5,
        "type": "inhale"
      },
      {
        "name": "Exhale",
        "duration": 5,
        "type": "exhale"
      }
    ],
    "animation": "belly",
    "maxCycles": 60,
    "defaultCycles": 18,
    "research": {
      "reviewed": "2026-10-14",
      "sources": [
        {
          "title": "Ma et al. — Diaphragmatic breathing, attention, and stress",
          "year": 2017,
          "url": "https://pubmed.ncbi.nlm.nih.gov/28626434/"
        },
        {
          "title": "Hopper et al. — Diaphragmatic breathing and stress: review",
          "year": 2019,
          "url": "https://pubmed.ncbi.nlm.nih.gov/31436595/"
        }
      ]
    },
    "advanced": false
  },
  "resonance": {
    "id": "resonance",
    "icon": "🌊",
    "color": "#7986cb",
    "phases": [
      {
        "name": "Inhale",
        "duration": 5.5,
        "type": "inhale"
      },
      {
        "name": "Exhale",
        "duration": 5.5,
        "type": "exhale"
      }
    ],
    "animation": "wave",
    "maxCycles": 55,
    "defaultCycles": 16,
    "research": {
      "reviewed": "2026-10-14",
      "sources": [
        {
          "title": "Shao et al. — Slow breathing: meta-analysis of 31 studies",
          "year": 2024,
          "url": "https://doi.org/10.1007/s12671-023-02294-2"
        },
        {
          "title": "Shaffer & Meehan — Resonance frequency assessment",
          "year": 2020,
          "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC7578229/"
        },
        {
          "title": "Goessl et al. — HRV biofeedback, stress, and anxiety",
          "year": 2017,
          "url": "https://pubmed.ncbi.nlm.nih.gov/28478782/"
        }
      ]
    },
    "advanced": false
  },
  "wimHof": {
    "id": "wimHof",
    "icon": "🔥",
    "color": "#ff7043",
    "phases": [
      {
        "name": "Power Breaths (30x)",
        "duration": 45,
        "type": "power",
        "subBreaths": 30
      },
      {
        "name": "Retention Hold",
        "duration": 60,
        "type": "retention"
      },
      {
        "name": "Recovery inhale",
        "duration": 3,
        "type": "inhale"
      },
      {
        "name": "Optional hold",
        "duration": 15,
        "type": "hold"
      }
    ],
    "animation": "power",
    "maxCycles": 4,
    "defaultCycles": 3,
    "research": {
      "reviewed": "2026-10-14",
      "sources": [
        {
          "title": "Almahayni & Hammond — Wim Hof Method: systematic review",
          "year": 2024,
          "url": "https://doi.org/10.1371/journal.pone.0286933"
        }
      ]
    },
    "advanced": true
  },
  "buteyko": {
    "id": "buteyko",
    "icon": "🎯",
    "color": "#26a69a",
    "phases": [
      {
        "name": "Light Inhale",
        "duration": 3,
        "type": "inhale"
      },
      {
        "name": "Light Exhale",
        "duration": 3,
        "type": "exhale"
      },
      {
        "name": "Control Pause",
        "duration": 20,
        "type": "hold"
      },
      {
        "name": "Shallow Breathing",
        "duration": 30,
        "type": "easy"
      }
    ],
    "animation": "gauge",
    "maxCycles": 6,
    "defaultCycles": 4,
    "research": {
      "reviewed": "2026-10-14",
      "sources": [
        {
          "title": "Santino et al. — Breathing exercises for adults with asthma",
          "year": 2020,
          "url": "https://www.cochrane.org/evidence/CD001277_breathing-exercises-asthma"
        }
      ]
    },
    "advanced": true
  },
  "cyclicSighing": {
    "id": "cyclicSighing",
    "icon": "🍃",
    "color": "#8ddfc4",
    "phases": [
      {
        "duration": 3,
        "type": "inhale",
        "volumeFrom": 0,
        "volumeTo": 0.72
      },
      {
        "duration": 1,
        "type": "topUp",
        "volumeFrom": 0.72,
        "volumeTo": 1
      },
      {
        "duration": 6,
        "type": "exhale"
      }
    ],
    "animation": "bloom",
    "maxCycles": 60,
    "defaultCycles": 30,
    "research": {
      "reviewed": "2026-10-15",
      "sources": [
        {
          "title": "Balban et al. — Brief structured respiration practices",
          "year": 2023,
          "url": "https://pubmed.ncbi.nlm.nih.gov/36630953/"
        },
        {
          "title": "Riedl et al. — One-minute cyclic sighing and box breathing pilot",
          "year": 2026,
          "url": "https://pubmed.ncbi.nlm.nih.gov/42002307/"
        }
      ]
    },
    "advanced": false
  },
  "extendedExhale": {
    "id": "extendedExhale",
    "icon": "🌅",
    "color": "#dbc19b",
    "phases": [
      {
        "duration": 4,
        "type": "inhale"
      },
      {
        "duration": 6,
        "type": "exhale"
      }
    ],
    "animation": "bloom",
    "maxCycles": 60,
    "defaultCycles": 18,
    "research": {
      "reviewed": "2026-10-14",
      "sources": [
        {
          "title": "Marchant et al. — Square, 4-7-8, and six breaths per minute",
          "year": 2025,
          "url": "https://pubmed.ncbi.nlm.nih.gov/39864026/"
        },
        {
          "title": "Meehan & Shaffer — Do longer exhalations increase HRV?",
          "year": 2024,
          "url": "https://pubmed.ncbi.nlm.nih.gov/38507210/"
        }
      ]
    },
    "advanced": false
  },
  "humming": {
    "id": "humming",
    "icon": "🎵",
    "color": "#b7b4e9",
    "phases": [
      {
        "duration": 4,
        "type": "inhale"
      },
      {
        "duration": 6,
        "type": "hum"
      }
    ],
    "animation": "bloom",
    "maxCycles": 60,
    "defaultCycles": 18,
    "research": {
      "reviewed": "2026-10-14",
      "sources": [
        {
          "title": "Woo & Kim — Slow-paced breathing and humming: pilot study",
          "year": 2025,
          "url": "https://pubmed.ncbi.nlm.nih.gov/40482984/"
        }
      ]
    },
    "advanced": false
  }
};
if (typeof module !== 'undefined') module.exports = techniques;
