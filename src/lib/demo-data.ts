import { 
    FileSearch, 
    FileText, 
    BrainCircuit, 
    DraftingCompass, 
    TrendingUp, 
    Handshake, 
    Swords, 
    Component,
    Camera,
    FolderKanban,
    Bot
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface DemoMode {
  mode: string;
  icon: LucideIcon;
  sampleInput: string;
  sampleOutput: string;
  tryThisLink: string;
}

export const demoData: DemoMode[] = [
  {
    mode: 'Orchestrate AI',
    icon: Component,
    sampleInput: `Objective: Research precedents for contract disputes involving force majeure due to floods in Mumbai, then draft a legal notice to the defaulting party.`,
    sampleOutput: `<strong>Plan Created (3 Steps):</strong>
1.  <span class="text-green-500">[Done]</span> Research precedents...
2.  <span class="text-green-500">[Done]</span> Draft legal notice...
3.  <span class="text-yellow-500">[Active]</span> Review for risks...

<strong>Result:</strong> Generated a 3-page legal notice with citations from recent Bombay High Court rulings.`,
    tryThisLink: '/research?mode=orchestrate'
  },
  {
    mode: 'AI Legal Research',
    icon: FileSearch,
    sampleInput: `Query: Recent Supreme Court judgments after 2020 related to anticipatory bail under Section 438 of the CrPC for economic offenses.`,
    sampleOutput: `<strong>Top Case:</strong>
<em>Siddharth v. State of U.P., (2021)</em>
<strong>Summary:</strong> The Supreme Court held that arrest should be the last resort, especially in cases where the accused is cooperating with the investigation...
<strong>Key Principle:</strong> Emphasized individual liberty and cautioned against mechanical arrests.`,
    tryThisLink: '/research?mode=research'
  },
  {
    mode: 'Document Review',
    icon: FileText,
    sampleInput: `Contract Snippet: ...The Lessee shall be responsible for all damages, without limit. The notice period for termination is 7 days for either party. This agreement is governed by the laws of India.`,
    sampleOutput: `<strong><span class="text-red-500">High Risk:</span> Unlimited Liability</strong>
- Clause imposes uncapped liability on the Lessee.
- Recommendation: Cap liability to annual rent value.

<strong><span class="text-yellow-500">Medium Risk:</span> Short Notice Period</strong>
- 7 days is unusually short for termination.
- Recommendation: Extend to at least 30 days.`,
    tryThisLink: '/research?mode=analyzer'
  },
  {
    mode: 'Predictive Analytics',
    icon: TrendingUp,
    sampleInput: `Case Summary: A civil suit in Delhi High Court. Landlord claims 6 months unpaid rent. Tenant claims failure to make essential repairs. Judge is known to be pro-tenant.`,
    sampleOutput: `<strong>Win Probability for Tenant: 68%</strong>
<strong>Key Factors:</strong>
- Judge's pro-tenant history (High Impact).
- Lack of repair evidence from landlord (Medium Impact).
<strong>Strategy:</strong> File photographic evidence of disrepair and records of communication with the landlord.`,
    tryThisLink: '/research?mode=prediction'
  },
  {
    mode: 'Negotiation Mode',
    icon: Handshake,
    sampleInput: `My Goal: Limit our liability to the contract value.
Opponent's Position: They want us to accept unlimited liability.
Context: Final stages of a large software deal.`,
    sampleOutput: `<strong>Suggested Alternative Clause:</strong>
"The Service Provider's total liability...shall not exceed the total fees paid in the preceding <em>twelve (12)</em> months."

<strong>Talking Point:</strong> "This aligns our risk with the annual value of our partnership, which is a standard industry practice for SaaS agreements."`,
    tryThisLink: '/research?mode=negotiation'
  },
  {
    mode: 'Cross-Examination Prep',
    icon: Swords,
    sampleInput: `Witness Statement: "I saw the accused leave at 10:00 PM. The street was well-lit."
Your Evidence: Security footage shows exit at 9:45 PM. City maintenance log shows streetlights were out.`,
    sampleOutput: `<strong>Inconsistency 1: Time</strong>
- Statement: 10:00 PM
- Evidence: 9:45 PM
<strong>Question:</strong> "You mentioned being sure about the time. Could your watch have been 15 minutes fast?"

<strong>Inconsistency 2: Lighting</strong>
- Statement: "Well-lit street"
- Evidence: Streetlights were non-functional.
<strong>Question:</strong> "How were you able to get a clear view if the official city records show the lights were out?"`,
    tryThisLink: '/research?mode=cross-examination'
  },
   {
    mode: 'Evidence Analysis',
    icon: Camera,
    sampleInput: `Task: Analyze attached photograph of a damaged vehicle for a motor accident claim. Extract details like license plate, extent of damage, and any visible external factors.`,
    sampleOutput: `<strong>Analysis Complete:</strong>
- <strong>License Plate:</strong> MH 12 AB 3456
- <strong>Damage Assessment:</strong> Severe impact to the front-left bumper and headlight assembly. Moderate denting on the driver-side door.
- <strong>External Factors:</strong> Wet road surface visible, suggesting rain. No other vehicles in immediate vicinity.`,
    tryThisLink: '/research?mode=evidence'
  },
  {
    mode: 'Client Portfolio',
    icon: FolderKanban,
    sampleInput: `Client Name: Rajesh Kumar
Case Type: Property Dispute
Task: Summarize current status and list pending actions.`,
    sampleOutput: `<strong>Client: Rajesh Kumar</strong>
<strong>Case:</strong> Kumar vs. Sharma Properties
<strong>Status:</strong> Awaiting hearing date from Delhi High Court.
<strong>Pending Actions:</strong>
1. File updated affidavit (Deadline: 15 July 2024).
2. Follow up with opposing counsel on discovery requests.
3. Prepare client for pre-hearing conference.`,
    tryThisLink: '/research?mode=portfolio'
  },
  {
    mode: 'Auto Mode',
    icon: Bot,
    sampleInput: `Today's Schedule:
- 10 AM: Client Meeting (Sunita Singh)
- 2 PM: Hearing (Patel v. Gupta)
- 4 PM: Draft Contract (Innovate LLC)`,
    sampleOutput: `<strong>Automated Actions:</strong>
- <strong>9:30 AM:</strong> Generated pre-meeting brief for Sunita Singh's case.
- <strong>1:30 PM:</strong> Summarized key arguments and recent precedents for Patel v. Gupta hearing.
- <strong>3:45 PM:</strong> Pulled up standard templates and client notes for Innovate LLC contract.`,
    tryThisLink: '/research?mode=auto'
  },
  {
    mode: 'Reasoning Mode',
    icon: BrainCircuit,
    sampleInput: `Scenario: Builder failed to deliver an apartment for six months, citing 'unexpected monsoons'.
Question: Is the 'act of God' defense valid for a monsoon delay in India?`,
    sampleOutput: `<strong>Legal Reasoning:</strong>
1.  <strong>Fact:</strong> Monsoons are a predictable, annual weather phenomenon in India, not an "unexpected" event.
2.  <strong>Principle:</strong> An 'act of God' must be an unforeseeable, natural event.
3.  <strong>Application:</strong> Since monsoons are foreseeable, they do not typically qualify as an act of God for contractual delays.
<strong>Conclusion:</strong> The builder's defense is unlikely to be valid.`,
    tryThisLink: '/research?mode=reasoning'
  }
];
