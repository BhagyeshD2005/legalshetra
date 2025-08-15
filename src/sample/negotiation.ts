
import { type NegotiationSupportInput } from "@/ai/types";

export const sampleNegotiationInput: NegotiationSupportInput = {
    currentClause: "The Service Provider's total liability under this Agreement shall be unlimited.",
    myGoal: "Limit our liability to the total value of the contract, which is $50,000.",
    opponentPosition: "They are insisting on unlimited liability, citing the critical nature of the service we provide.",
    opponentStyle: "aggressive",
    context: "This is the final clause preventing the deal from closing. The relationship with the client is new but important for future business."
};
