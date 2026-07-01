/**
 * Ambient globals for Lime Technology JS/TS projects.
 *
 * Cloudflare Workers runtime types and a handful of legacy webGUI globals that
 * appear in Unraid front-end code. Kept here so every preset shares one source
 * of truth instead of re-declaring them per repo.
 */

/** Cloudflare Workers runtime + platform bindings. */
export const cloudflareWorkerGlobals = {
	KVNamespace: "readonly",
	CfProperties: "readonly",
	Env: "readonly",
	ExecutionContext: "readonly",
	D1Database: "readonly",
	D1PreparedStatement: "readonly",
	D1Result: "readonly",
	R2Bucket: "readonly",
	R2Object: "readonly",
	DurableObjectNamespace: "readonly",
	DurableObjectStub: "readonly",
	DurableObjectState: "readonly",
	Queue: "readonly",
	Fetcher: "readonly",
	ScheduledController: "readonly",
	MessageBatch: "readonly",
};

/** Legacy Unraid webGUI globals referenced by embedded front-end code. */
export const webguiGlobals = {
	openPlugin: "readonly",
	openBox: "readonly",
	openChanges: "readonly",
	FeedbackButton: "readonly",
	flashBackup: "readonly",
	confirmDowngrade: "readonly",
	downloadDiagnostics: "readonly",
};
