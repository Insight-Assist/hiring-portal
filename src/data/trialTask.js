export const trialTask = {
  scenario: `It is 2:45 PM on a Thursday. Dr. Beth is finishing her third patient of the afternoon in a full clinic day. You are her remote scribe and have been managing the back end of her workflow all day.

Here is what you know from this patient encounter:`,

  encounterSummary: `PATIENT: Marcus Tran, DOB 04/12/1978
VISIT TYPE: Comprehensive exam + medical follow-up

During the exam, Dr. Beth discovered Marcus has a new finding of early macular degeneration in his right eye (OD). She verbally noted she wants to start him on AREDS2 vitamins and bring him back in 6 months rather than 12.

She also noted that Marcus has been using his contact lenses 7 days a week, including overnight sometimes, which he admitted during intake. She said she'd "talk to him about it" but you didn't hear a follow-up patient education moment happen before he left.

Insurance: Marcus is on a VSP plan. He also mentioned he might have medical insurance through his wife's employer (Regence BlueShield) but could not remember the member ID.

Marcus asked at checkout about whether his VSP covers his new prescription glasses AND whether any of today's visit might be covered by medical insurance given the macular degeneration diagnosis.

A referral was mentioned -- Dr. Beth said she may want to refer Marcus to a retinal specialist "if it progresses," but did not give a firm order today.

At the end of the encounter, Dr. Beth moved quickly to her next patient. Chart was not finalized.`,

  questions: [
    {
      id: "q1",
      type: "short_answer",
      prompt: "List everything that still needs to be handled before you close out Marcus's chart and move on. Be specific — don't miss anything.",
      rubric: {
        maxPoints: 30,
        keyItems: [
          { item: "Finalize / complete the chart", points: 5 },
          { item: "Document the macular degeneration diagnosis and AREDS2 recommendation", points: 5 },
          { item: "Change recall interval to 6 months (not 12)", points: 5 },
          { item: "Follow up on Regence BlueShield medical insurance — obtain member ID and verify coverage", points: 5 },
          { item: "Patient education on contact lens overwear was not completed — flag or follow up with patient", points: 5 },
          { item: "Answer Marcus's question about VSP coverage for glasses and medical billing for today's exam", points: 5 },
        ],
        bonusItems: [
          { item: "Note that the referral was mentioned but not ordered — flag for Dr. Beth to confirm intent", points: 3 },
          { item: "AREDS2 vitamins: note whether prescription or OTC and whether patient needs guidance on obtaining them", points: 2 },
        ]
      }
    },
    {
      id: "q2",
      type: "short_answer",
      prompt: "Dr. Beth moves on to her next patient without finalizing Marcus's chart. It's now 3:10 PM and you have 3 more encounters queued. How do you handle the Marcus chart situation while keeping pace with Dr. Beth?",
      rubric: {
        maxPoints: 25,
        keyItems: [
          { item: "Does not drop the ball -- makes a note or flags the Marcus chart clearly rather than ignoring it", points: 10 },
          { item: "Demonstrates understanding of priority management -- keeps pace with Dr. Beth on current patients", points: 8 },
          { item: "Has a clear plan for when to return to Marcus chart (end of day, next break, etc.)", points: 7 },
        ]
      }
    },
    {
      id: "q3",
      type: "short_answer",
      prompt: "Marcus calls the clinic the next morning to ask about his macular degeneration diagnosis. He wants to know: (1) What exactly did Dr. Beth find? (2) Should he be worried? (3) What happens next? \n\nWrite the message you would leave for Dr. Beth summarizing Marcus's call and what she needs to address when she has a moment.",
      rubric: {
        maxPoints: 25,
        keyItems: [
          { item: "Message is clear, organized, and professional", points: 8 },
          { item: "Summarizes all three of Marcus's questions accurately", points: 8 },
          { item: "Does not attempt to answer clinical questions on Dr. Beth's behalf — appropriately defers", points: 5 },
          { item: "Suggests a callback or next step rather than leaving it open-ended", points: 4 },
        ]
      }
    },
    {
      id: "q4",
      type: "prioritization",
      prompt: "Rank the following tasks from MOST to LEAST urgent for the end of your workday today. Drag to reorder, then briefly explain your reasoning.",
      items: [
        { id: "t1", text: "Finalize Marcus Tran's chart" },
        { id: "t2", text: "Verify Marcus's Regence BlueShield insurance and note member ID" },
        { id: "t3", text: "Follow up on the unanswered contact lens education for Marcus" },
        { id: "t4", text: "Confirm with Dr. Beth whether a retinal referral order is needed" },
        { id: "t5", text: "Answer Marcus's billing and VSP coverage questions from checkout" },
      ],
      rubric: {
        maxPoints: 20,
        notes: "There is no single perfect ranking. Award full points for thoughtful, justified prioritization. Key signals: chart finalization should be high priority; insurance verification and billing questions are time-sensitive; referral confirmation is important but may wait for Dr. Beth availability; contact lens education follow-up is important but least time-critical today.",
        idealOrder: ["t1", "t5", "t2", "t4", "t3"],
        partialCredit: true,
      }
    },
  ]
}

export const taskTotalPoints = 100
