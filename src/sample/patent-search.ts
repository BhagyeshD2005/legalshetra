
import { type PatentSearchInput } from "@/ai/flows/patent-search";

export const samplePatentSearchInput: PatentSearchInput = {
    inventionDescription: `
I have invented a new type of drone for last-mile delivery in urban environments. 

Key features:
1.  **Quiet Propulsion System**: It uses magnetic levitation for its propellers instead of standard brushless motors. This makes it almost silent, which is ideal for residential deliveries.
2.  **Modular Payload Bay**: The drone has a standardized payload bay that can accept different pre-packaged containers for food, medicine, or documents. The containers lock in place with an electro-magnetic clamp.
3.  **Onboard AI for Dynamic Rerouting**: It has an onboard AI chip that processes real-time local weather and obstacle data (from its own sensors) to make immediate flight path adjustments, without needing to communicate back to a central server for every decision.
`
};
