export interface FrameGeometrySize {
  /** Size label as the manufacturer states it, e.g. 'M', '56', or 'S3'. */
  size: string
  stackMm: number
  reachMm: number
}

export interface BikeGeometryPreset {
  /** Matches a BikeModelPreset id in lib/bikes.ts */
  modelId: string
  sizes: FrameGeometrySize[]
  note?: string
}

function sizes(...rows: [string, number, number][]): FrameGeometrySize[] {
  return rows.map(([size, stackMm, reachMm]) => ({ size, stackMm, reachMm }))
}

export const BIKE_GEOMETRY: BikeGeometryPreset[] = [
  {
    modelId: 'giant-tcr-landevej',
    sizes: sizes(['XS', 517, 376], ['S', 528, 383], ['M', 545, 388], ['M/L', 562, 393], ['L', 581, 402], ['XL', 596, 412]),
  },
  {
    modelId: 'giant-revolt-gravel',
    sizes: sizes(['XS', 556, 381], ['S', 570, 381], ['M', 586, 387], ['M/L', 602, 391], ['L', 616, 397], ['XL', 630, 407]),
  },
  {
    modelId: 'giant-trancex-mtb',
    sizes: sizes(['S', 607, 439], ['M', 611, 457], ['L', 625, 480], ['XL', 639, 505]),
    note: 'Reach er justerbar ±5mm via headset flip-chip — tal viser neutral position',
  },
  {
    modelId: 'trek-madone-landevej',
    sizes: sizes(['XS', 507, 370], ['S', 530, 378], ['M', 546, 384], ['M/L', 562, 389], ['L', 582, 394], ['XL', 610, 402]),
    note: 'Nyeste generation (Gen 8) bruger bogstavstørrelser i stedet for cm-mål',
  },
  {
    modelId: 'trek-checkpoint-gravel',
    sizes: sizes(['XS', 535, 380], ['S', 556, 386], ['M', 579, 391], ['M/L', 601, 397], ['L', 620, 402], ['XL', 640, 408]),
    note: 'Nyeste generation bruger bogstavstørrelser i stedet for cm-mål',
  },
  {
    modelId: 'trek-fuelex-mtb',
    sizes: sizes(['S', 610, 431], ['M', 624, 460], ['L', 638, 485], ['XL', 651, 510], ['XXL', 665, 530]),
    note: 'Nyeste generation (Gen 7) har 5 størrelser (S-XXL), ikke 7 som tidligere',
  },
  {
    modelId: 'specialized-tarmacsl8-landevej',
    sizes: sizes(['44', 509, 366], ['49', 522, 375], ['52', 535, 380], ['54', 552, 384], ['56', 573, 395], ['58', 599, 402], ['61', 620, 408]),
  },
  {
    modelId: 'specialized-diverge4-gravel',
    sizes: sizes(['49', 563, 365], ['52', 578, 374], ['54', 592, 387], ['56', 610, 400], ['58', 634, 412], ['61', 659, 425]),
  },
  {
    modelId: 'specialized-stumpjumper15-mtb',
    sizes: sizes(['S1', 608, 400], ['S2', 618, 425], ['S3', 627, 450], ['S4', 640, 475], ['S5', 654, 500], ['S6', 667, 530]),
    note: 'Flip-chip geometri — tal viser standardindstillingen (mid headset/høj bundbrackethøjde)',
  },
  {
    modelId: 'merida-scultura-landevej',
    sizes: sizes(['3XS', 512, 373], ['XXS', 517, 377], ['XS', 529, 383], ['S', 542, 390], ['M', 557, 395], ['L', 571, 400], ['XL', 593, 409]),
  },
  {
    modelId: 'merida-silex-gravel',
    sizes: sizes(['XXS', 549, 378], ['XS', 570, 392], ['S', 588, 402], ['M', 607, 412], ['L', 626, 426], ['XL', 645, 441]),
  },
  {
    modelId: 'merida-ninetysix-mtb',
    sizes: sizes(['S', 595, 420], ['M', 595, 440], ['L', 605, 460], ['XL', 614, 480]),
    note: 'Standard Ninety-Six (120mm) — race-udgaven "RC" (100mm) har en kortere reach på samme størrelsesbetegnelser',
  },
  {
    modelId: 'cannondale-supersixevo-landevej',
    sizes: sizes(['44', 495, 373], ['48', 508, 376], ['50', 520, 379], ['52', 532, 383], ['54', 545, 387], ['56', 565, 393], ['58', 585, 398], ['61', 615, 404]),
    note: 'Nyeste generation har 8 størrelser (50 og 52 i stedet for kun 51)',
  },
  {
    modelId: 'cannondale-topstone-gravel',
    sizes: sizes(['XS', 554, 364], ['S', 564, 373], ['M', 579, 378], ['L', 597, 383], ['XL', 615, 389], ['XXL', 646, 397]),
  },
  {
    modelId: 'cannondale-scalpel-mtb',
    sizes: sizes(['S', 595, 425], ['M', 595, 450], ['L', 604, 475], ['XL', 613, 510]),
  },
  {
    modelId: 'scott-addictrc-landevej',
    sizes: sizes(['XXS', 501, 379], ['XS', 512, 386], ['S', 526, 392], ['M', 543, 395], ['L', 564, 403], ['XL', 584, 406], ['XXL', 604, 411]),
  },
  {
    modelId: 'scott-addictgravel-gravel',
    sizes: sizes(['XS', 519, 374], ['S', 544, 378], ['M', 565, 387], ['L', 590, 398], ['XL', 610, 406]),
  },
  {
    modelId: 'scott-spark-mtb',
    sizes: sizes(['S', 608, 410], ['M', 608, 440], ['L', 618, 470], ['XL', 627, 500]),
    note: 'Karbon race-udgaven "Spark RC" har let afvigende tal (2-6mm)',
  },
  {
    modelId: 'cervelo-r5-landevej',
    sizes: sizes(['48', 497, 363], ['51', 522, 371], ['54', 547, 380], ['56', 572, 389], ['58', 597, 398], ['61', 622, 407]),
  },
  {
    modelId: 'cervelo-aspero-gravel',
    sizes: sizes(['48', 505, 370], ['51', 530, 379], ['54', 555, 388], ['56', 580, 397], ['58', 605, 406], ['61', 630, 415]),
  },
  {
    modelId: 'cube-litening-landevej',
    sizes: sizes(['50', 514, 389], ['52', 524, 389], ['54', 542, 389], ['56', 563, 398], ['58', 580, 403], ['60', 594, 405]),
  },
  {
    modelId: 'cube-nuroad-gravel',
    sizes: sizes(['XS', 520, 388], ['S', 544, 388], ['M', 579, 393], ['L', 599, 392], ['XL', 623, 402]),
    note: 'Karbon C:62-udgaven — alu-udgaven (Pro/Race) har lidt andre tal',
  },
  {
    modelId: 'canyon-ultimate-landevej',
    sizes: sizes(['2XS', 498, 372], ['XS', 520, 378], ['S', 539, 390], ['M', 560, 393], ['L', 580, 401], ['XL', 606, 419], ['2XL', 624, 429]),
  },
  {
    modelId: 'canyon-grail-gravel',
    sizes: sizes(['2XS', 545, 372], ['XS', 556, 385], ['S', 573, 394], ['M', 591, 411], ['L', 613, 427], ['XL', 633, 435], ['2XL', 655, 454]),
  },
  {
    modelId: 'canyon-neuron-mtb',
    sizes: sizes(['XS', 587, 410], ['S', 596, 430], ['M', 626, 455], ['L', 639, 480], ['XL', 656, 510]),
  },
  {
    modelId: 'bianchi-oltre-landevej',
    sizes: sizes(['47', 470, 385], ['50', 478, 392], ['53', 504, 393], ['55', 520, 397], ['57', 536, 402], ['59', 555, 406]),
  },
  {
    modelId: 'wilier-filanteslr-landevej',
    sizes: sizes(['XS', 505, 374], ['S', 523, 380], ['M', 541, 386], ['L', 559, 393], ['XL', 577, 400], ['XXL', 595, 408]),
  },
]

export function geometryFor(modelId: string): BikeGeometryPreset | undefined {
  return BIKE_GEOMETRY.find((g) => g.modelId === modelId)
}

export function stackReachRatio(stackMm: number, reachMm: number): number {
  return stackMm / reachMm
}
