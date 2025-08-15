
import { type DraftLegalDocumentInput } from "@/ai/types";

export const sampleDraftingInput: DraftLegalDocumentInput = {
    documentType: 'contract',
    prompt: 'Draft a simple freelance software development agreement. Parties: "Client Corp" and "Dev Freelancer". Project: "E-commerce Website". Payment: "Fixed price of $10,000, paid 50% upfront and 50% on completion". Timeline: "2 months". IP Rights: "All IP developed will be owned by Client Corp upon full payment".',
    tone: 'neutral',
    jurisdiction: 'delhi'
};
