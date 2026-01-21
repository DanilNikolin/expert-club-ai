# Agent / Expert Constructor Audit

## 1. Purpose of the Agent Constructor

The Agent Constructor exists to solve the problem of "generic assistant bias" in Large Language Models (LLMs). Instead of relying on a single static system prompt or a set of hardcoded role presets, the system dynamically compiles unique, constraint-based personas.

Architecturally, this shifts the responsibility of "who is speaking" from the prompt writer to a configuration model. It allows the application to:
1.  **Decouple Behavior from Instruction:** Users define *traits* (scalars), and the system translates these into *instructions* (vectors).
2.  **Enforce Protocol:** Regardless of the user's creative choices, the system injects immutable "operating system" rules (The "Dirty Realism" protocol) that the user cannot override.
3.  **Ensure Diversity:** By forcing graded, multi-dimensional configurations, the system prevents the collapse of all agents into a "helpful assistant" archetype.

## 2. Frontend Configuration Logic

The interface presents a control surface that abstracts prompt engineering into parametric inputs.

### continuous Parameters (Graded)
These parameters are presented as sliders or numeric inputs, implying a spectrum of behavior rather than binary states.

*   **Archetype Mix (0-100%)**: A 3-axis distribution summing to 100%.
    *   *Analyst*: Focus on logic, structure, and deconstruction.
    *   *Synthesizer*: Focus on combining ideas and finding patterns.
    *   *Resonator*: Focus on emotional impact and rhetorical weight.
*   **Specialization Mix (0-100%)**: A 7-axis distribution representing domain knowledge weight (e.g., "Product & Technologies", "Finance & Resources", "Law & Risks").
*   **Character Traits (1-10 Scale)**:
    *   *Constructiveness*: Destructive/Critical (1) <---> Constructive/Supportive (10).
    *   *Conformism*: Rebel (1) <---> Follower (10).
    *   *Conviction*: Fluid (1) <---> Dogmatic (10).
    *   *Openness to Data*: Denial (1) <---> Scientific/Adaptive (10).
*   **Temperature (0.1 - 2.0)**: Direct mapping to LLM generation randomness.

### Discrete Parameters (Boolean/Text)
*   **Perks (Toggle)**:
    *   *Humor*: Enables sarcasm/irony.
    *   *Contradiction Hunter*: Forces active search for logical fallacies.
*   **Identity**: Name (string).
*   **Context**: Custom Context (free-text string for unique backstory/experience).

## 3. Data Representation

The configured expert is not stored as a prompt. It is stored as a structured JSON object (`ConfiguredExpert`). This object is the source of truth passed between client and server.

**Structure:**
```typescript
type ConfiguredExpert = {
    id: string;
    name: string;
    model: string;                 // e.g., 'gpt-4o', 'gemini-1.5-pro'
    baseArchetype?: string;        // UI meta-data, not used in compilation
    archetypeMix: {                // Normalized to sum 100%
        analyst: number;
        synthesizer: number;
        resonator: number; 
    };
    specializations: {             // Normalized relative to importance
        'Product & Technologies': number;
        // ... mapped 1:1 to UI fields
    };
    character: {
        constructiveness: number;  // 1-10
        conformism: number;        // 1-10
        conviction: number;        // 1-10
        opennessToData: number;    // 1-10
        hasHumor: boolean;
        isContradictionHunter: boolean;
        temperature: number;       // 0.1-2.0
    };
    customContext: string;
    thinkingBudget?: number;       // Present in data, currently inert in pipeline
};
```

This data is persisted in Firestore (implied by `createdAt`/`userId` fields) for saved experts, but is also transiently passed in the API request body (`selectedExperts`) for run-time execution.

## 4. Prompt Compilation Pipeline (CORE)

The system does not use a static prompt template with simple slot-filling. It uses a conditional composition engine (`buildSystemPrompt` function) that translates scalars into nuanced behavioral instructions. A prompt is compiled **fresh for every single turn**.

### The Mapping Logic (Scalar -> Semantic)
The pipeline uses a look-up function `getNuancedDescription(value, scales)` to convert numbers into natural language blocks. This mapping is **heuristic and non-linear**.

#### 1. Archetypes & Specializations
Values are broken into percentage tiers (e.g., 0%, 1-20%, 81-100%).
*   *input*: `Analyst: 85%`
*   *compilation*: The system selects the `81-100` descriptor: *"This is your dominant, almost sole way of looking at the problem... All your conclusions must pass through the filter of this aspect."*

#### 2. Character Traits
Traits use specific 5-tier scales (1-2, 3-4, 5, 6-7, 8-10).
*   *input*: `Conformism: 2`
*   *compilation*: Maps to the `1-2` bucket: *"You are a fierce nonconformist and rebel. You challenge even basic rules... Group consensus means nothing to you."*

### Composition Order
The final system prompt is assembled linearly from these computed blocks:

1.  **WHO**: Identity injection (`name`).
2.  **CORE CONTEXT**: The debate brief (Global immutable state).
3.  **CUSTOM MISSION**: User-defined debate goal.
4.  **PROTOCOL**: System-level rules (Intensity, Consistency).
5.  **HOW (Thinking Style)**: Generated from `ArchetypeMix` buckets.
6.  **WHAT (Area of Expertise)**: Generated from `Specializations` buckets.
7.  **CONTEXT**: User's `customContext`.
8.  **CHARACTER**: Generated from `character` trait buckets + Perks (`hasHumor`, `isContradictionHunter`).
9.  **DOCTRINE**: The "Dirty Realism" protocol (see Safeguards).

### Conflict Resolution
There is no active AI-based conflict resolution agent. Conflicts are resolved by:
1.  **Explicit Instruction**: The Protocol section explicitly tells the model *"You are aware of the numerical values... The further the value is from the center, the brighter you must manifest this trait."*
2.  **Order of Precedence**: The "Dirty Realism" doctrine is appended *last*, strictly overriding any "polite" behaviors that might have been inferred from previous sections.

## 5. Runtime Behavior

### Just-In-Time Compilation
The persona is **stateless**. The system prompt is rebuilt from the `ConfiguredExpert` object at the exact moment the API route (`POST /api/debate`) is called.

*   **Frequency**: Once per turn (per expert message generation).
*   **Implication**: If the user modifies an expert's parameters in the UI mid-debate, the *very next response* will immediately reflect the new persona configuration, as the updated object is sent with the request.

### State Management
The API is RESTful/Streamed. It does not "remember" the expert's persona session-to-session on the server. The client is responsible for maintaining the state of the `ConfiguredExpert` and passing it back to the server for every thought cycle.

## 6. Boundaries & Safeguards

The system implements a hard distinction between "User Configuration" and "System Doctrine".

### Mutable (User Controlled)
*   Personality traits, tone, expertise, and bias.
*   Creative backstory (`customContext`).

### Immutable (System Controlled)
The following sections are hardcoded in the compilation pipeline and cannot be altered via UI:

1.  **Format Constraints**: The `[THOUGHTS]...[RESPONSE]` structure is legally binding. The system fails if tags are missing.
2.  **"Dirty Realism" Doctrine**: A strict set of behavioral overrides injected at the end of the prompt:
    *   *Brevity Rule*: "Maximum 3-5 sentences. No compromises."
    *   *Interaction Rule*: "Must be a REACTION, not a monologue."
    *   *Blind Spot Rule*: STRICTLY FORBIDDEN from mentioning system prompts or internal parameters.
3.  **Language Enforcement**: A critical override forcing both Thoughts and Responses to match the user's language, preventing "English default" leakage in internal monologues.

## 7. Why This Is Not “Just Prompt Engineering”

This system acts as a **Persona Compiler**, distinct from standard prompt engineering in three ways:

1.  **Abstraction Layer**: The prompt engineer works with text; the user works with *coefficients*. The system handles the translation. This allows distinct, consistent behaviors (e.g., "High Conviction") to be standardized across different runs and models, rather than relying on the user to write "Please be very stubborn."
2.  **Algorithmic Consistency**: By mapping scalars to fixed text blocks (`getNuancedDescription`), the system guarantees that two experts with `Conformism: 2` receive *identical* base instructions for that trait, reducing variance compared to natural language prompting.
3.  **Encapsulation**: The user designs the "Software" (The Expert), but the system enforces the "Kernel" (The Protocol). The user cannot accidentally prompt-engineer the agent into breaking the debate format because the formatting logic is decoupled from the persona logic and injected automatically at runtime.
