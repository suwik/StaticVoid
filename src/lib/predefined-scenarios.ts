export interface PredefinedScenario {
  id: string;
  title: string;
  situation: string;
  timeRemaining: number; // seconds left when session starts
  timeLimit: number; // total session length in seconds
  question: string;
  markScheme: string;
  essayContent: string;
}

const QUESTION = `Evaluate the view that TechCorp's decision to reduce its marketing budget by 30% was the primary cause of its declining market share over the past two years. [20 marks]`;

const MARK_SCHEME = `**Level 4 (16–20 marks):** Sustained analysis and well-supported evaluation. Candidate weighs competing causes, makes a reasoned judgement about the significance of the marketing budget cut relative to other factors, and reaches a clear, justified conclusion.

**Level 3 (11–15 marks):** Some analysis with chains of reasoning. Candidate explains how the budget cut affects market share but evaluation is limited or one-sided. Judgement present but not fully developed.

**Level 2 (6–10 marks):** Mostly descriptive explanation of factors. Limited or no evaluation. May identify multiple causes but does not weigh them.

**Level 1 (1–5 marks):** Simple identification of factors, largely undeveloped. Little or no use of business concepts.

**Assessment Focus:**
- AO1: Knowledge of marketing, competitive strategy, market share concepts
- AO2: Application to TechCorp's specific context
- AO3: Analysis — chains of reasoning linking budget cuts to outcomes
- AO4: Evaluation — judgement on primacy of cause, supported by reasoning`;

export const PREDEFINED_SCENARIOS: PredefinedScenario[] = [
  {
    id: "scenario-1-no-conclusion",
    title: "One Minute Left, No Conclusion",
    situation: "1:03 remaining — strong body paragraphs, essay just stops",
    timeRemaining: 63,
    timeLimit: 2700,
    question: QUESTION,
    markScheme: MARK_SCHEME,
    essayContent: `TechCorp's decision to cut its marketing budget by 30% is likely to have contributed significantly to its declining market share. Marketing expenditure directly funds brand awareness campaigns, customer acquisition, and competitive positioning. When this budget is reduced, TechCorp's visibility in the market falls relative to rivals who maintain or increase their spend. Consumers are less frequently exposed to TechCorp's products, meaning brand recall weakens and customers are more easily attracted to competitors' offerings. This is particularly damaging in a market where switching costs are low, as price-conscious consumers have little reason to remain loyal without ongoing promotional reinforcement.

However, it would be an oversimplification to identify the budget cut as the sole or even primary cause of TechCorp's declining market share. During the same period, two major competitors launched technologically superior products at competitive price points. Porter's five forces framework would suggest that the threat of rivalry intensified independently of TechCorp's marketing decisions. Even with a full marketing budget, it is questionable whether promotional spend alone can compensate for a genuine product gap. Research by the Ehrenberg-Bass Institute supports this, showing that advertising primarily maintains mental availability rather than reversing structural competitive disadvantage.

Furthermore, TechCorp's market share decline preceded the marketing budget cut by approximately six months, according to the case study data. This temporal sequence is significant: if the decline began before the budget reduction, then the cut cannot be the primary cause — at best it accelerated a trend already in motion. The underlying cause appears to be a failure in product development strategy, specifically TechCorp's delayed response to shifting consumer demand toward cloud-integrated devices. The marketing department was, in a sense, being asked to sell a product that no longer met consumer expectations.`,
  },
  {
    id: "scenario-2-no-evaluation",
    title: "Four Minutes, No Evaluation",
    situation: "3:47 remaining — three strong paragraphs, zero evaluation",
    timeRemaining: 227,
    timeLimit: 2700,
    question: QUESTION,
    markScheme: MARK_SCHEME,
    essayContent: `Marketing is an important business function that helps companies attract and retain customers. When TechCorp reduced its marketing budget by 30%, it had less money to spend on advertising, promotions, and brand campaigns. This meant that fewer customers were aware of TechCorp's products, and rivals with bigger marketing budgets could reach more potential buyers. As a result, TechCorp lost customers to competitors, which caused its market share to fall.

TechCorp's market share also declined because of changes in the market itself. New competitors entered the market and existing rivals invested in product innovation. TechCorp's products became less attractive compared to alternatives that offered better features at similar prices. Customers who might previously have chosen TechCorp switched to other brands, particularly younger consumers who prioritise technology specifications. This increased competition put further pressure on TechCorp's share of the market.

There were also internal problems at TechCorp that contributed to the decline. The company experienced difficulties in its supply chain, which caused delays in product launches. When new products were delayed, customers could not buy them even if they wanted to. TechCorp also had higher prices than some of its competitors, which made it harder to retain price-sensitive customers. These internal factors all played a role in reducing TechCorp's market share over the two-year period.`,
  },
  {
    id: "scenario-3-stuck",
    title: "Stuck, Clock Running",
    situation: "8:22 remaining — two paragraphs written, then stopped",
    timeRemaining: 502,
    timeLimit: 2700,
    question: QUESTION,
    markScheme: MARK_SCHEME,
    essayContent: `TechCorp's 30% reduction in marketing spend is a plausible explanation for its declining market share. Marketing underpins brand visibility and customer acquisition; cutting it reduces TechCorp's share of voice in the market. In competitive consumer technology markets, brand awareness is a key driver of purchase intention. Studies consistently show that brands with higher share of voice tend to gain or maintain market share, while those with lower share of voice tend to lose it. Reducing the marketing budget therefore likely weakened TechCorp's competitive position, particularly against rivals who maintained or grew their promotional activity during the same period.

That said, the relationship between marketing spend and market share is not straightforward. The effectiveness of marketing investment depends heavily on the quality of the product being promoted. If TechCorp's core product offering had become less competitive — through slower innovation, higher pricing, or weakened distribution — then additional marketing spend would have produced diminishing returns. The cut in budget may therefore reflect a deeper strategic problem rather than cause the market share decline in isolation.`,
  },
  {
    id: "scenario-4-describing",
    title: "Describing, Not Analysing",
    situation: "14:30 remaining — textbook paragraph, no application",
    timeRemaining: 870,
    timeLimit: 2700,
    question: QUESTION,
    markScheme: MARK_SCHEME,
    essayContent: `Market share is a measure of a company's sales as a percentage of the total sales in a market. It is calculated by dividing the company's sales by the total market sales and multiplying by 100. Market share is an important indicator of a company's competitive position in the market. A higher market share means that the company is selling more products relative to its competitors. Companies with high market share often benefit from economies of scale, which allow them to produce goods at a lower unit cost. Market share can be measured in terms of volume, which looks at the number of units sold, or in terms of value, which looks at the revenue generated. Businesses use market share data to assess how well they are performing against competitors and to identify whether their strategies are working effectively. Changes in market share over time can indicate whether a company is gaining or losing competitive advantage.`,
  },
];
