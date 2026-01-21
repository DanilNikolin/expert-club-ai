Project Audit & Technical Analysis

Project: Expert Club AI
Document type: Full System Technical Audit
Audience: Senior / Staff Engineers, Tech Leads, Architects

1. Product Purpose & Problem Space
Problem Being Solved

The system addresses a structural weakness of single-assistant AI tools: confirmation bias and shallow validation.
Instead of reinforcing user assumptions, it intentionally introduces structured intellectual conflict.

The core idea is not “better answers”, but better thinking under pressure.

Product Type

Agentic AI Workflow Engine
This is not a chatbot and not a simple multi-prompt wrapper. It is a system that:

simulates multiple conflicting expert perspectives,

enforces cognitive discipline through protocolized reasoning,

orchestrates debates as repeatable computational processes.

Target Users

Founders and entrepreneurs

Product managers and strategists

Users who already know what they think, but want to know where it breaks

2. System Overview & Architecture
Architectural Style

Monolithic Backend-for-Frontend (BFF) built on Next.js App Router

The system intentionally avoids microservices to keep:

iteration speed high,

agent logic co-located,

prompt evolution tightly controlled.

Core Components

Frontend: React 19, streaming-first UI

Backend: Next.js API Routes (Serverless / Edge-compatible)

Database: Firebase Firestore (NoSQL)

Authentication: Firebase Auth

AI Providers: OpenAI, DeepSeek, Google Gemini

High-Level Data Flow

User configures Experts (personas)

User starts a discussion

Frontend sends context + speaker to /api/debate

Backend compiles a dynamic system prompt

LLM response is streamed

Backend parses protocol tags in real time

Frontend renders Thoughts vs Speech separately

Completed runs are persisted in Firestore

3. Agent Orchestration Model
Agent Definition (Code-Level)

An Agent is a stateless, data-driven contract, not a running process.

Defined by ConfiguredExpert:

Identity: name, model

Cognitive structure: archetype mix (Analyst / Synthesizer / Resonator)

Domain bias: specialization weights

Psychological constraints: conviction, conformism, constructiveness

Instruction compiler: dynamic system prompt generator

Execution Model

An agent exists only for one HTTP request

Each request = one cognitive turn

No agent memory exists outside the provided context

Key Distinction

This is not multi-chat.
Each turn recompiles a mathematically distinct personality, not just a role description.

4. Conversation State Management
Source of Truth

Live discussion: client-side React state

Persistence: Firestore

The server is intentionally stateless.

Context Reconstruction

For every turn:

System prompt is rebuilt

Brief (idea) is re-injected

History is truncated via a sliding window (MAX_MSGS = 30)

This avoids:

runaway token growth

degraded relevance

hallucination amplification

Explicit Exclusions

No server-side session memory

No cross-run contamination

No implicit agent continuity

5. Frontend Architecture (Streaming-First UI)
Core Challenge

The UI is designed around partial, unordered, long-running streams.

Key Responsibilities

Consume SSE streams

Separate [THOUGHTS] from [RESPONSE]

Render incrementally without layout thrashing

Maintain state consistency during long streams

Notable Complexity

Avoiding flicker while appending tokens

Handling premature stream termination

Syncing UI state when the backend emits errors mid-stream

This is non-trivial React state orchestration, not a chat UI.

6. Backend & API Design
Key API Routes

/api/debate
Core agent engine:

prompt compilation

model selection

stream parsing

SSE emission

/api/judge
Meta-agent that evaluates the full discussion and produces structured analysis.

/api/chat-configurator
Conversational expert-builder that modifies agent parameters interactively.

Critical Observation

Business logic lives inside API routes.
This trades testability for velocity — acceptable at MVP stage, but a known debt.

7. LLM Integration & Output Control
Prompt Architecture

Dirty Realism Protocol

Explicit behavioral constraints

Mandatory structured output:

[THOUGHTS]... [THOUGHT_END]
[RESPONSE]... [RESPONSE_END]

Reliability Strategy

Models are trusted for content

Models are not trusted for structure

Stream Parsing

A custom state machine:

ignores garbage output

detects malformed tags

recovers partial responses

guarantees UI never stalls silently

Failure Handling

Broken tags → RAW fallback

Stream failure → SSE error event

Missing closures → forced buffer flush

8. Data Model & Persistence
Firestore Structure

users/{userId}

customExperts

briefs

discussions/{discussionId}

metadata

runs/{runId} (full transcripts)

Security

Firestore rules enforce user ownership

Validation is handled at application layer (TypeScript)

Firestore was chosen because:

expert schemas are deeply nested

persona structures are dynamic

relational modeling would be brittle

9. Security & Abuse Considerations
Prompt Injection

User input is embedded, not leading

System protocols are appended after user content

Still vulnerable to sophisticated injection (acknowledged risk)

Protocol Integrity

Persona enforcement is soft (prompt-based)

No external moderation layer

Input Safety

Prompt sanitization

UI-safe name slugification

10. Engineering Trade-offs & Risks
Known Risks

Token cost grows non-linearly with debate depth

Monolithic agent core limits testability

Stream parsing is inherently fragile

Firestore querying flexibility is limited

Client-side state is complex and failure-prone

Conscious Trade-offs

Velocity > perfect abstraction

Stateless server > complex session memory

Streaming UX > implementation complexity

11. Explicit Non-Goals

Tool calling / execution agents

Long-term agent memory

Multi-tenant API keys

Autonomous agent loops

These are future directions, not oversights.

12. Conclusion

Expert Club AI is not a demo chatbot.
It is an experimental cognitive system that treats LLMs as unreliable but powerful components inside a controlled architecture.

The core strength of the project is not the UI, nor the models, but the discipline imposed on reasoning itself.