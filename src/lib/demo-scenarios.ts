import type { InterventionType } from "./types";

export interface DemoNudge {
  type: InterventionType;
  message: string;
  paragraphIndex: number;
}

export interface DemoScenario {
  id: string;
  title: string;
  subtitle: string;
  question: string;
  markScheme: string;
  timeLimit: number; // total session time in seconds
  timeRemaining: number; // seconds left on the clock when demo starts
  essayContent: string;
  nudge: DemoNudge;
  /** Fallback nudge shown after delaySeconds if no AI nudge has fired */
  fallbackNudge?: DemoNudge & { delaySeconds: number };
}

const BUSINESS_QUESTION =
  "Evaluate the extent to which TechCorp's decision to expand into the Asian market was a strategic success. Use the data provided and your own business knowledge.";

const BUSINESS_MARK_SCHEME = `AO1 Knowledge (2 marks): Key business terms used accurately (e.g. market share, competitive advantage, economies of scale).
AO2 Application (4 marks): Points are applied specifically to TechCorp's situation using case study data (revenue figures, market share %, competitor actions).
AO3 Analysis (6 marks): Chains of reasoning that explain HOW and WHY factors affected TechCorp. Cause → effect → consequence logic.
AO4 Evaluation (8 marks): Judgements on significance, weigh factors against each other, consider short-term vs long-term, arrive at a justified conclusion. Top band requires a SUSTAINED judgement — not just "on the other hand."`;

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "one-minute-no-conclusion",
    title: "One Minute Left, No Conclusion",
    subtitle: "Strong body paragraphs but the essay just... stops. No conclusion, no judgement.",
    question: BUSINESS_QUESTION,
    markScheme: BUSINESS_MARK_SCHEME,
    timeLimit: 20 * 60, // 20 minutes
    timeRemaining: 63, // 1:03 left
    essayContent: `TechCorp's expansion into the Asian market represented a significant strategic shift for the company. Having dominated the European market with a 34% market share, the board saw Asia as the next growth frontier, particularly given the region's rapidly growing middle class and increasing demand for tech products.

One key factor in the success of the expansion was TechCorp's ability to leverage economies of scale. By increasing production volume to serve the Asian market, the company reduced its average unit cost by 18%, which allowed it to price competitively against local rivals like AsiaElec who had the advantage of established distribution networks. This cost advantage was particularly important in the first 18 months when brand recognition was low and price sensitivity among consumers was high.

However, the expansion was not without significant challenges. TechCorp lost 12% of its European market share during the expansion period, as management attention and R&D resources were redirected towards adapting products for Asian consumer preferences. The company's flagship X-Series product saw a 22% decline in European sales, which competitor VoltTech exploited by launching a directly competing product. This suggests that the opportunity cost of the Asian expansion was substantial and may have permanently weakened TechCorp's competitive position in its home market.

Furthermore, cultural differences proved more challenging than anticipated. TechCorp's marketing campaigns, which had been highly effective in Europe, failed to resonate with Asian consumers. The company was forced to hire local marketing teams at considerable expense, increasing its marketing budget by 40%. While this eventually led to improved brand perception, the initial missteps cost the company an estimated $12 million in wasted advertising spend and delayed market penetration by approximately 8 months.`,
    nudge: {
      type: "time_priority",
      message:
        "One minute left. Don't start a new point. Don't write a summary. You have four strong paragraphs but zero judgement — just answer the question directly: was the expansion a strategic success? Get your verdict down now.",
      paragraphIndex: 3,
    },
  },
  {
    id: "four-minutes-no-evaluation",
    title: "Four Minutes, No Evaluation",
    subtitle: "Three solid paragraphs of analysis, but not a single evaluative judgement anywhere.",
    question: BUSINESS_QUESTION,
    markScheme: BUSINESS_MARK_SCHEME,
    timeLimit: 20 * 60,
    timeRemaining: 227, // 3:47 left
    essayContent: `TechCorp's expansion into the Asian market was driven by the potential for significant revenue growth. The Asian tech market was growing at 15% annually compared to just 3% in Europe, meaning that TechCorp needed to enter this market to maintain its long-term growth trajectory. The company invested $45 million in establishing manufacturing facilities in Vietnam and distribution centres in Singapore, South Korea, and Japan.

The expansion allowed TechCorp to achieve economies of scale that reduced its unit costs by 18%. By increasing total production volume from 2.3 million to 3.8 million units per year, the company spread its fixed costs across a larger output. This made TechCorp more price competitive in both Asian and European markets, as the lower unit costs meant higher profit margins even when pricing aggressively against local competitors like AsiaElec.

The move into Asia also created significant supply chain risks. TechCorp became dependent on a single semiconductor supplier in Taiwan, which accounted for 60% of its chip requirements. When a typhoon disrupted production at this facility for three weeks, TechCorp's Asian operations were forced to halt, costing an estimated $8 million in lost revenue. This concentration of supply chain risk demonstrated a vulnerability that the company had not adequately planned for prior to the expansion.`,
    nudge: {
      type: "evaluation_depth",
      message:
        "You've got under 4 minutes and there's no evaluation anywhere — just analysis. Drop whatever you're writing. Pick your strongest point and challenge it: was the expansion WORTH it given the risks? One evaluative paragraph gets you into the top mark band.",
      paragraphIndex: 2,
    },
    fallbackNudge: {
      delaySeconds: 40,
      type: "structure_drift",
      message:
        "Your supply chain paragraph is strong analysis, but it's sitting in isolation. How does this risk connect back to whether the expansion was a strategic SUCCESS? Link the argument to your overall judgement.",
      paragraphIndex: 2,
    },
  },
  {
    id: "stuck-clock-running",
    title: "Stuck, Clock Running",
    subtitle: "Nothing typed for 50 seconds. Two paragraphs written. The cursor just blinks.",
    question: BUSINESS_QUESTION,
    markScheme: BUSINESS_MARK_SCHEME,
    timeLimit: 20 * 60,
    timeRemaining: 502, // 8:22 left
    essayContent: `TechCorp's decision to expand into the Asian market can be evaluated by examining both the financial outcomes and the strategic positioning it achieved. The company's revenue from Asian operations reached $28 million in the first year, exceeding the initial forecast of $20 million by 40%. This strong performance was driven by high demand for TechCorp's X-Series product, which gained 8% market share within 12 months of launch.

However, this growth came at a cost to TechCorp's European operations. The reallocation of R&D resources to develop Asia-specific product variants meant that the European product line received fewer updates. As a result, competitor VoltTech was able to close the technology gap and capture 12% of TechCorp's European market share. The question is whether the gains in Asia outweigh these European losses.`,
    nudge: {
      type: "time_priority",
      message:
        "You've stopped writing with 8 minutes left and only two paragraphs down. Don't wait for the perfect sentence — what's the next argument against the expansion? Just start writing, you can tidy the wording later.",
      paragraphIndex: 1,
    },
    fallbackNudge: {
      delaySeconds: 35,
      type: "evidence_lacking",
      message:
        "You mention VoltTech captured 12% of TechCorp's European market share — but what was the financial impact? Can you put a number on what that 12% cost TechCorp in revenue or profit? Examiners reward specific data.",
      paragraphIndex: 1,
    },
  },
  {
    id: "describing-not-analyzing",
    title: "Describing, Not Analyzing",
    subtitle: "A textbook paragraph explaining what market share means instead of using it.",
    question: BUSINESS_QUESTION,
    markScheme: BUSINESS_MARK_SCHEME,
    timeLimit: 20 * 60,
    timeRemaining: 870, // 14:30 left
    essayContent: `Market share refers to the percentage of total sales in a market that is captured by a particular company or product. It is calculated by dividing a company's sales revenue by the total revenue of the market and multiplying by 100. Market share is an important measure of competitive position because it indicates how well a company is performing relative to its rivals. A company with a high market share typically benefits from economies of scale, greater brand recognition, and stronger bargaining power with suppliers. Conversely, a decline in market share can signal that a company is losing its competitive advantage, which may lead to lower profitability and reduced investor confidence over time.`,
    nudge: {
      type: "evaluation_depth",
      message:
        "This reads like a textbook definition. The examiner already knows what market share is — what does losing 12% of it mean for TechCorp specifically? How does it affect their competitive position against VoltTech? Apply it to the case.",
      paragraphIndex: 0,
    },
    fallbackNudge: {
      delaySeconds: 45,
      type: "application_missing",
      message:
        "You've explained the theory of economies of scale and brand recognition in general. But TechCorp had specific numbers — 34% European market share, 18% cost reduction. Use THEIR data to make your argument concrete.",
      paragraphIndex: 0,
    },
  },
];
