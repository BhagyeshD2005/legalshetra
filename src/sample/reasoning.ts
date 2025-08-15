
import { type ReasonAboutScenarioInput } from "@/ai/flows/reason-about-scenario";

export const sampleReasoningInput: ReasonAboutScenarioInput = {
    scenario: "A tenant has been living in a residential property in Delhi for 3 years under a rental agreement that expired 1 year ago. The tenant has continued to pay rent monthly via bank transfer, and the landlord has accepted it without objection. The landlord has now sent a notice asking the tenant to vacate the premises within 15 days, citing the expired agreement.",
    question: "Is the 15-day notice to vacate legally valid under Delhi's tenancy laws, considering the tenant has been paying rent after the agreement's expiration?"
};
