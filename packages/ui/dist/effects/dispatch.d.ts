import { ActionResult, Effect } from '@lattice-php/core/generated';
import { EffectHandlerRegistry } from './registry.js';
export type ActionEffect = Effect;
export type ActionResponse = Partial<ActionResult>;
/**
 * Run each effect through its handler. Handlers default to the built-ins; the
 * Provider passes a merged registry that also includes consumer-registered
 * handlers. An effect with no handler is warned about (dev) and skipped.
 */
export declare function dispatchEffects(effects: ActionEffect[], handlers?: EffectHandlerRegistry): void;
export declare function dispatchActionError(error: unknown): void;
export declare function getActionEffects(effects: unknown): ActionEffect[];
/**
 * Structural guard for an effect on the wire. Intentionally open: it accepts any
 * object with a string `type`, not only the built-in types, so consumer-registered
 * effects pass through getActionEffects() and reach their handlers. Dispatch warns
 * on (and skips) a type with no registered handler.
 */
export declare function isActionEffect(effect: unknown): effect is ActionEffect;
