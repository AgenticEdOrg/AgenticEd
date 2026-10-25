/* AgenticEd Live — session listings for sessions.html and the homepage.
   Only add a session once the speaker has confirmed. Dates are ISO (YYYY-MM-DD), times include the zone.
   Example entry:
   {
     title: "How we evaluate agents in production",
     speaker: "Full Name",
     role: "Staff Engineer",
     company: "Company Name",
     photo: "images/speakers/full-name.jpg",   // optional
     date: "2026-11-20",
     time: "6:00 PM IST",
     format: "Industry Talk",                   // Industry Talk | Build-Along Lab | Educator Roundtable | Career Conversation
     level: "Intermediate",
     registerUrl: "https://...",                // upcoming sessions
     recordingUrl: "https://..."                // past sessions
   }
*/
window.AGENTICED_SESSIONS = {
  upcoming: [],
  past: []
};
