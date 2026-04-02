// Workplace Personality Assessment
// Four types: Playful (P), Powerful (W), Perfect (F), Peaceful (C)
// Questions are written so no answer is obviously "correct"
// Answer options are shuffled per question

export const personalityTypes = {
  P: { label: 'Playful', subtitle: 'The Connector', color: '#E07B39' },
  W: { label: 'Powerful', subtitle: 'The Driver', color: '#C0392B' },
  F: { label: 'Perfect', subtitle: 'The Analyst', color: '#2980B9' },
  C: { label: 'Peaceful', subtitle: 'The Stabilizer', color: '#27AE60' },
}

export const questions = [
  {
    id: 1,
    text: "When you start a new project, your first instinct is to:",
    answers: [
      { text: "Make a detailed checklist and timeline before doing anything", type: "F" },
      { text: "Dive in and figure it out as you go", type: "W" },
      { text: "Talk to teammates and get everyone aligned first", type: "P" },
      { text: "Get a feel for what others expect before starting", type: "C" },
    ]
  },
  {
    id: 2,
    text: "A colleague is upset about something minor. You:",
    answers: [
      { text: "Take time to really hear them out and make them feel supported", type: "P" },
      { text: "Acknowledge it briefly, then redirect to solving the issue", type: "W" },
      { text: "Listen without judgment and let them process at their own pace", type: "C" },
      { text: "Try to identify what went wrong and suggest a fix", type: "F" },
    ]
  },
  {
    id: 3,
    text: "You feel most satisfied at work when:",
    answers: [
      { text: "Something was done to a very high standard", type: "F" },
      { text: "A goal was completed ahead of schedule", type: "W" },
      { text: "Everyone on the team feels good about the outcome", type: "C" },
      { text: "You connected with someone new and built rapport", type: "P" },
    ]
  },
  {
    id: 4,
    text: "At a team meeting, you are most likely to:",
    answers: [
      { text: "Push the group toward a decision and keep things moving", type: "W" },
      { text: "Ask questions and make sure all details are addressed", type: "F" },
      { text: "Energize the group and keep the vibe positive", type: "P" },
      { text: "Listen carefully and support whoever needs it", type: "C" },
    ]
  },
  {
    id: 5,
    text: "When you make a mistake at work, you tend to:",
    answers: [
      { text: "Analyze what went wrong so you can prevent it next time", type: "F" },
      { text: "Fix it fast and move on without dwelling on it", type: "W" },
      { text: "Talk it through with someone to process how you feel", type: "P" },
      { text: "Accept it, make it right quietly, and move forward", type: "C" },
    ]
  },
  {
    id: 6,
    text: "Your coworker does things differently than you would. You:",
    answers: [
      { text: "Adapt your approach to match theirs if it helps the team", type: "C" },
      { text: "Wonder if your way would produce better results", type: "F" },
      { text: "Try to find common ground and keep things collaborative", type: "P" },
      { text: "Step in if their approach is causing problems", type: "W" },
    ]
  },
  {
    id: 7,
    text: "When you get critical feedback, your gut reaction is:",
    answers: [
      { text: "To feel a little defensive but then really dig into whether it's valid", type: "F" },
      { text: "To want to understand the impact so you can adjust", type: "C" },
      { text: "To take it and quickly redirect energy toward doing better", type: "W" },
      { text: "To feel hurt at first but then try to see it as caring", type: "P" },
    ]
  },
  {
    id: 8,
    text: "In a fast-paced, chaotic day, you:",
    answers: [
      { text: "Stay calm and keep others steady", type: "C" },
      { text: "Thrive — you love the energy", type: "W" },
      { text: "Get stressed if things aren't organized", type: "F" },
      { text: "Look for moments to connect with teammates amid the chaos", type: "P" },
    ]
  },
  {
    id: 9,
    text: "When helping someone learn a new task, you tend to:",
    answers: [
      { text: "Walk them through every step carefully and check for understanding", type: "F" },
      { text: "Show them the big picture and let them figure out the details", type: "W" },
      { text: "Make it fun and be patient with their pace", type: "P" },
      { text: "Follow their lead on how they learn best", type: "C" },
    ]
  },
  {
    id: 10,
    text: "The thing you value most in a workplace is:",
    answers: [
      { text: "Clear goals and efficient processes", type: "W" },
      { text: "Accuracy, quality, and doing things right", type: "F" },
      { text: "Warmth, trust, and good relationships", type: "P" },
      { text: "Stability, fairness, and a calm environment", type: "C" },
    ]
  },
  {
    id: 11,
    text: "When a plan suddenly changes, you:",
    answers: [
      { text: "Quickly assess the new situation and pivot", type: "W" },
      { text: "Feel unsettled but adapt once you understand the new plan", type: "F" },
      { text: "Roll with it — flexibility is part of the job", type: "C" },
      { text: "Check in with the team to make sure everyone is okay with the change", type: "P" },
    ]
  },
  {
    id: 12,
    text: "A peer isn't pulling their weight. You:",
    answers: [
      { text: "Address it directly and tell them what needs to change", type: "W" },
      { text: "Wonder if there's something going on and gently check in", type: "P" },
      { text: "Quietly absorb some of the slack to keep things stable", type: "C" },
      { text: "Document the issue and think through the best approach carefully", type: "F" },
    ]
  },
  {
    id: 13,
    text: "Before sending an important message or document, you:",
    answers: [
      { text: "Proofread it at least twice and check every detail", type: "F" },
      { text: "Read it once and send it — momentum matters", type: "W" },
      { text: "Make sure the tone feels right and won't upset anyone", type: "C" },
      { text: "Ask yourself if it sounds warm and human, not robotic", type: "P" },
    ]
  },
  {
    id: 14,
    text: "You tend to be described by others as:",
    answers: [
      { text: "Warm, fun, and easy to be around", type: "P" },
      { text: "Reliable, calm, and low-drama", type: "C" },
      { text: "Sharp, thorough, and precise", type: "F" },
      { text: "Confident, decisive, and results-focused", type: "W" },
    ]
  },
  {
    id: 15,
    text: "When you have too much on your plate, you:",
    answers: [
      { text: "Prioritize ruthlessly and start cutting tasks", type: "W" },
      { text: "Make a detailed list and work through it methodically", type: "F" },
      { text: "Ask for help or delegate so the team carries it together", type: "P" },
      { text: "Stay quiet, keep going, and find a way to manage", type: "C" },
    ]
  },
  {
    id: 16,
    text: "In a conflict between two coworkers, your role tends to be:",
    answers: [
      { text: "The mediator who helps them find common ground", type: "C" },
      { text: "The one who helps everyone stay connected and feel heard", type: "P" },
      { text: "The one who cuts to the core of the issue and resolves it", type: "W" },
      { text: "The one who reviews what actually happened and finds a fair answer", type: "F" },
    ]
  },
  {
    id: 17,
    text: "The kind of work you find most energizing is:",
    answers: [
      { text: "Solving a complex problem with a lot of moving parts", type: "F" },
      { text: "Crossing things off a list and getting results fast", type: "W" },
      { text: "Collaborating closely with a team you trust", type: "P" },
      { text: "Supporting someone who really needs your help", type: "C" },
    ]
  },
  {
    id: 18,
    text: "When your manager gives you limited direction, you:",
    answers: [
      { text: "Ask clarifying questions before proceeding", type: "F" },
      { text: "Take initiative and run with it — you'll figure it out", type: "W" },
      { text: "Check in with a peer to see how they're interpreting it", type: "P" },
      { text: "Do your best with what you have and avoid overcomplicating it", type: "C" },
    ]
  },
  {
    id: 19,
    text: "You're most likely to get frustrated when:",
    answers: [
      { text: "Things are moving too slowly or people are being indecisive", type: "W" },
      { text: "Something was done carelessly and the quality shows it", type: "F" },
      { text: "There's tension in the team and nobody is talking about it", type: "P" },
      { text: "There is conflict and no one is making an effort to resolve it", type: "C" },
    ]
  },
  {
    id: 20,
    text: "Your ideal workday includes:",
    answers: [
      { text: "Clear wins, progress, and tangible results", type: "W" },
      { text: "Accurate, thorough work you feel proud of", type: "F" },
      { text: "Meaningful conversations and a sense of team connection", type: "P" },
      { text: "Predictable flow and a calm, cooperative environment", type: "C" },
    ]
  },
]

// Shuffle answer options for display (keeps type mapping intact)
export function shuffleAnswers(answers) {
  const shuffled = [...answers]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function calculatePersonality(responses) {
  const scores = { P: 0, W: 0, F: 0, C: 0 }
  responses.forEach(r => {
    if (r && scores[r] !== undefined) scores[r]++
  })
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  return {
    dominant: sorted[0][0],
    secondary: sorted[1][1] > 0 && sorted[1][1] >= sorted[0][1] - 2 ? sorted[1][0] : null,
    scores,
  }
}
