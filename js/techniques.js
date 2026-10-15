/** Timing, animation, and source metadata. User-facing copy lives in locales/*.json. */
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
      "reviewed": "2026-10-14",
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
        }
      ]
    }
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
    }
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
    "maxCycles": 12,
    "defaultCycles": 6,
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
    }
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
    "maxCycles": 20,
    "defaultCycles": 10,
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
    }
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
        "name": "Recovery Breath",
        "duration": 15,
        "type": "recovery"
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
    }
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
        "type": "shallow"
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
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = techniques;
}
