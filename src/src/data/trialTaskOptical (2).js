export const trialTaskOptical = {
  scenario: `A patient named Sandra comes to the optical dispensary after her comprehensive exam. She has a new glasses prescription and is ready to pick out frames and lenses. You pull up her VSP insurance benefits and review the practice's retail price list below.`,

  benefitsSummary: `SANDRA'S VSP BENEFITS — Current Plan Year
---------------------------------------------------
Frame Allowance:              $150.00
Single Vision Lenses:         Covered in full
Lens Enhancements:            20% off retail
Anti-Reflective (AR) Coating: 20% off retail
Copay (exam):                 $10.00 (already collected today)
Frame Frequency:              Every 24 months — ELIGIBLE
Lens Frequency:               Every 12 months — ELIGIBLE

RETAIL PRICES AT NEWPORT VISION SOURCE
---------------------------------------------------
Frame selected by Sandra:     $289.00
Single vision lenses:         $120.00
Anti-reflective (AR) coating:  $85.00
Blue light filter:             $45.00
Scratch-resistant coating:     $30.00`,

  questions: [
    {
      id: 'q1',
      type: 'calculation',
      prompt: "Using Sandra's VSP benefits, calculate her out-of-pocket cost for the frame and single vision lenses only (no add-ons). Show your math.",
      rubric: {
        maxPoints: 35,
        answer: { frameOOP: 139.00, lensOOP: 0, total: 139.00 },
        keyItems: [
          { item: 'Frame: $289.00 minus $150.00 allowance = $139.00 out of pocket', points: 15 },
          { item: 'Lenses: $0.00 out of pocket (covered in full by VSP)', points: 10 },
          { item: 'Correct total: $139.00', points: 10 },
        ],
      }
    },
    {
      id: 'q2',
      type: 'calculation',
      prompt: "Sandra wants to add anti-reflective coating. What is her new total out-of-pocket for the frame, single vision lenses, AND AR coating? Show your math.",
      rubric: {
        maxPoints: 30,
        answer: { frameOOP: 139.00, lensOOP: 0, arOOP: 68.00, total: 207.00 },
        keyItems: [
          { item: 'AR coating: $85.00 x 20% = $17.00 discount → $68.00 out of pocket', points: 15 },
          { item: 'Correct total: $139.00 + $0.00 + $68.00 = $207.00', points: 15 },
        ],
      }
    },
    {
      id: 'q3',
      type: 'short_answer',
      prompt: `Sandra says: "I'm not sure if the anti-reflective coating is worth the extra cost. I mostly work on a computer and I drive at night a lot." How would you respond to help her decide? Write out what you would say to her.`,
      rubric: {
        maxPoints: 35,
        keyItems: [
          { item: 'Acknowledges her specific lifestyle (computer use, night driving)', points: 10 },
          { item: 'Explains how AR coating directly helps with those activities (reduces glare, eye strain, headlight halos)', points: 15 },
          { item: 'Tone is warm, helpful, and consultative — not pushy or scripted', points: 10 },
        ],
        bonusItems: [
          { item: 'Mentions the VSP discount to make the add-on feel more accessible', points: 5 },
        ]
      }
    },
  ]
}

export const taskTotalPointsOptical = 100
