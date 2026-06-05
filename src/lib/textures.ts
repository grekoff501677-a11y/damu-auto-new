// Procedural CSS textures for the Macro-Zoom demo (no assets needed).
// Original = dense, uniform, precise weave. Counterfeit = irregular, coarse, uneven.

export const TEXTURE_ORIGINAL_FILTER =
  // tight, even pleated-paper weave
  `repeating-linear-gradient(45deg, #1b2a20 0 3px, #21362a 3px 6px),
   repeating-linear-gradient(-45deg, rgba(0,230,118,0.06) 0 3px, transparent 3px 6px)`

export const TEXTURE_FAKE_FILTER =
  // loose, blotchy, irregular fibres
  `radial-gradient(circle at 20% 30%, rgba(120,80,60,0.5) 0 6px, transparent 7px),
   radial-gradient(circle at 70% 60%, rgba(90,60,50,0.5) 0 9px, transparent 10px),
   radial-gradient(circle at 45% 80%, rgba(110,70,55,0.4) 0 5px, transparent 6px),
   repeating-linear-gradient(50deg, #2a2420 0 5px, #322a24 5px 11px)`

export const TEXTURE_ORIGINAL_FLUID =
  // uniform dense fluid (consistent density)
  `repeating-linear-gradient(0deg, rgba(56,189,248,0.18) 0 2px, rgba(56,189,248,0.10) 2px 4px),
   linear-gradient(180deg, #0e2630, #0a1a22)`

export const TEXTURE_FAKE_FLUID =
  // separated / cloudy fake fluid
  `radial-gradient(circle at 30% 40%, rgba(180,170,90,0.35) 0 14px, transparent 16px),
   radial-gradient(circle at 75% 65%, rgba(150,140,80,0.30) 0 18px, transparent 20px),
   linear-gradient(180deg, #2a2812, #1a1809)`
