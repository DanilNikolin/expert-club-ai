# Expert Club AI

**An agentic AI workflow engine for structured debate, adversarial analysis, and decision support.**

[Technical case study](https://www.danil-nikolin.dev/project/ai-expert-club) · [Portfolio](https://www.danil-nikolin.dev)

Expert Club AI explores a limitation of single-assistant systems: they often reinforce the user's assumptions instead of challenging them.

The application lets users assemble configurable AI experts with different cognitive styles, give them a shared brief, and run repeatable debates where agents critique competing positions. A separate judge agent analyzes the resulting discussion and produces an independent synthesis.

This is a completed research prototype and architectural showcase, not a commercial SaaS product.

## Core workflow

1. Define the problem through a guided concierge flow
2. Convert the conversation into a structured brief
3. Configure experts manually or generate a team with AI
4. Compile each expert's runtime persona
5. Run a streamed, turn-based debate
6. Preserve the discussion as structured session data
7. Ask an independent judge agent to analyze the result

## Key capabilities

- Configurable expert archetypes and behavioral traits
- AI-assisted expert team generation
- Shared immutable brief injected into every debate turn
- Turn-based multi-agent orchestration
- Runtime persona compilation from structured parameters
- Streamed responses with protocol-aware parsing
- Independent judge meta-agent
- Mid-session expert reconfiguration
- Persistent users, briefs, experts, discussions, and transcripts
- Multiple model providers behind a unified application workflow

## Architecture highlights

### Agents as data contracts

An expert is not a permanently running process. It is a structured configuration containing identity, domain perspective, archetype weights, and behavioral traits.

The active persona is compiled when a turn begins, which makes agents reproducible, editable, and independent from any specific model provider.

### Runtime persona compiler

Users configure experts through graded parameters rather than writing raw system prompts. The backend translates these values into model instructions using behavioral rules and heuristic ranges.

An immutable protocol layer is added separately so user-controlled personality settings cannot replace the debate format or system constraints.

### Structured debate protocol

Each turn follows an explicit orchestration flow:

- Select the active expert
- Reconstruct the shared context
- Compile the current persona
- Stream the model response
- Parse structured output
- Append the turn to the discussion
- Advance the debate state

This makes the interaction a repeatable workflow rather than an unstructured group chat.

### Concierge and brief pipeline

A dedicated pre-processing assistant clarifies the user's goal before the debate begins. The resulting brief becomes the semantic anchor shared by every expert, reducing drift across longer discussions.

### Independent judge agent

The judge operates outside the participant loop. It receives the completed discussion and produces a separate analysis of arguments, conflicts, blind spots, and possible conclusions.

### Bounded context

Discussion context is reconstructed for each request and truncated through a sliding window. This limits token growth and reduces the accumulation of irrelevant or contradictory history.

## Reliability considerations

- Malformed structured output falls back to raw text instead of breaking the interface
- Context size is bounded to control model cost
- Agent configuration is separated from the system protocol
- Server-side provider credentials are never exposed to the client
- The judge remains independent from debate participants
- Application state is persisted separately from stateless model calls

## Tech stack

| Layer | Technology |
| --- | --- |
| Application | Next.js App Router, React 19, TypeScript |
| Backend | Next.js API routes / Backend-for-Frontend |
| Data and authentication | Firebase Auth, Cloud Firestore |
| AI providers | OpenAI, DeepSeek, Google Gemini |
| Interaction | Streaming responses, structured output protocols |
| UI | Tailwind CSS, Lucide React |
| Deployment | Serverless runtime |

## Project status

Expert Club AI is feature-complete for its current research scope. It was built as a technical sandbox for evaluating multi-agent orchestration, runtime persona construction, streaming interfaces, and controlled LLM workflows.

## Local development

```bash
npm install
npm run dev
```

The application requires Firebase and AI-provider configuration through environment variables. Keep all private provider keys in local or deployment environment settings and never commit them to the repository.

---

Built end to end by [Danil Nikolin](https://www.danil-nikolin.dev).
