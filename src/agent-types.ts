// ── Agent kind ──

export const AgentKind = {
  boss: 'boss',
  persistent: 'persistent',
  on_demand: 'on-demand',
} as const;

export type AgentKind = (typeof AgentKind)[keyof typeof AgentKind];

// ── Agent status ──

export const AgentStatus = {
  active: 'active',
  paused: 'paused',
  stopped: 'stopped',
} as const;

export type AgentStatus = (typeof AgentStatus)[keyof typeof AgentStatus];

// ── Execution mode ──

export const ExecutionMode = {
  run_to_completion: 'run-to-completion',
  interactive: 'interactive',
} as const;

export type ExecutionMode = (typeof ExecutionMode)[keyof typeof ExecutionMode];

// ── Agent event types ──

export const AgentEventType = {
  agent_created: 'agent_created',
  agent_started: 'agent_started',
  agent_stopped: 'agent_stopped',
  agent_paused: 'agent_paused',
  run_started: 'run_started',
  run_completed: 'run_completed',
  run_failed: 'run_failed',
  interactive_waiting: 'interactive_waiting',
  interactive_responded: 'interactive_responded',
} as const;

export type AgentEventType = (typeof AgentEventType)[keyof typeof AgentEventType];

// ── Core agent info ──

export interface AgentInfo {
  id: string;
  name: string;
  kind: AgentKind;
  status: AgentStatus;
  description: string | null;
  default_workflow_path: string | null;
  execution_mode: ExecutionMode;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

// ── Agent CRUD request/response ──

export interface AgentCreateRequest {
  name: string;
  kind: AgentKind;
  description?: string;
  default_workflow_path?: string;
  execution_mode?: ExecutionMode;
}

export interface AgentCreateResponse {
  agent: AgentInfo;
}

export interface AgentUpdateRequest {
  name?: string;
  description?: string;
  default_workflow_path?: string;
  execution_mode?: ExecutionMode;
  status?: AgentStatus;
}

// ── Interactive prompt/response ──

export interface InteractivePrompt {
  type: 'interactive_prompt';
  agent_id: string;
  prompt_id: string;
  question: string;
  context?: string;
  options?: string[];
}

export interface InteractiveResponse {
  type: 'interactive_response';
  agent_id: string;
  prompt_id: string;
  response: string;
}

// ── Agent event (for event log) ──

export interface AgentEvent {
  type: 'agent_event';
  agent_id: string;
  event: AgentEventType;
  run_id?: string;
  data?: Record<string, unknown>;
  timestamp: string; // ISO 8601
}

// ── Decrypted message types (inside encrypted envelope) ──

export type DecryptedMessageType =
  | 'chat'
  | 'interactive_prompt'
  | 'interactive_response'
  | 'agent_event'
  | 'approval_request'
  | 'approval_response';

// ── Decrypted message payloads ──

export interface ChatMessage {
  type: 'chat';
  text: string;
  agent_id?: string;
}

export interface ApprovalRequest {
  type: 'approval_request';
  approval_id: string;
  agent_id?: string;
  description: string;
  tool_name?: string;
  tool_input?: Record<string, unknown>;
}

export interface ApprovalResponse {
  type: 'approval_response';
  approval_id: string;
  decision: 'approved' | 'denied' | 'approved_session';
}

// ── Union of all decrypted payload types ──

export type DecryptedPayload =
  | ChatMessage
  | InteractivePrompt
  | InteractiveResponse
  | AgentEvent
  | ApprovalRequest
  | ApprovalResponse;
