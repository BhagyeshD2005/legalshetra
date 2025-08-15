
import { type AnalyzeEvidenceInput } from "@/ai/types";

// NOTE: This contains empty data URIs as placeholders.
// In a real scenario, these would be populated with Base64 encoded file data.
export const sampleEvidenceInput: AnalyzeEvidenceInput = {
    caseContext: "A property sale dispute where the agreed price and date of the agreement are under contention. The seller claims the price was ₹55 Lakhs and the agreement was signed on Jan 18. The buyer's witness claims it was ₹50 Lakhs on Jan 15.",
    evidenceFiles: [
        {
            fileName: "sale_agreement_scan.pdf",
            fileType: "application/pdf",
            dataUri: "data:application/pdf;base64," // Placeholder
        },
        {
            fileName: "witness_statement.mp3",
            fileType: "audio/mpeg",
            dataUri: "data:audio/mpeg;base64," // Placeholder
        }
    ]
};
