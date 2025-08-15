
import { type CrossExaminationPrepInput } from "@/ai/types";

export const sampleCrossExaminationInput: CrossExaminationPrepInput = {
    witnessStatement: "I saw the blue car run the red light at approximately 10:00 PM. I was standing on the corner of Main Street and First Avenue. The street was well-lit, and I had a clear view of the intersection. The blue car did not slow down at all before entering the intersection. The impact was very loud.",
    evidenceSummary: "1. Police report states the accident occurred at 10:15 PM. 2. A CCTV footage from a nearby store shows the intersection, but the view is partially obscured by a tree. 3. The weather report indicates it was raining heavily at the time of the incident. 4. Our client (driving the other car) states the light was green in their direction.",
    myRole: "defense",
    simulationRole: "witness"
};
