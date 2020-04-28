/*
 * the engine interface defines how the application being managed by the server
 * deals with state transitions as users join, leave, and otherwise interact.
 * it also encodes the way the game requires information to be hidden.
 *
 * we would like to establish this commutative diagram:
 *
 *  Intent
 *     |    \
 *     |     \
 *  listen     predict
 *     |               \____________
 *     |                            |
 *     v                            v
 *  Action ---redact_action-----> Effect
 *     |                            |
 *     |                            |
 *   apply                     apply_client
 *     |                            |
 *     v                            v
 *   State ------redact------> ClientState
 *
 * the types State and Action define the game state and possible transitions,
 * respectively; while ClientState and Effect define the state and possible
 * transitions as they are visible by a particular user.  both an Action and
 * its Effect arise from a user's Intent.
 *
 * the functions redact and redact_action define the mapping from the globally-
 * knowledgeable State and Action to their client-side counterparts.  protocol
 * actions should be viewed as if they redact to themselves.
 *
 * the functions apply and apply_client define the way that actions affect a
 * given game state.
 *
 * however, because all JS objects are mutable, and there is no nice way to
 * impose immutability, we instead combine the listen, apply, and redact_action
 * functions into a single function called larp (the p stands for potato):
 *
 *  Intent
 *     |    \
 *     |     \
 *     |       predict
 *     |               \____________
 *      \                           |
 *       \                          v
 *       larp ---(per-client)---> Effect
 *        /                         |
 *       /                          |
 *      /                      apply_client
 *     |                            |
 *     v                            v
 *   State ------redact------> ClientState
 */

import { ProtocolAction, User, UserID } from 'protocol/protocol.ts'
import { Result } from 'utils/result.ts'

import { Codec } from 'io-ts/lib/Codec'

export interface Engine<
  Config,
  Intent,
  State,
  Action,
  ClientState,
  Effect,
  UpdateError
> {
  // codecs for all the type parameters
  Config: Codec<Config>;
  Intent: (state: null | State | ClientState) => Codec<Intent>;
  State: (state: null | State | ClientState) => Codec<State>;
  ClientState: (state: null | State | ClientState) => Codec<ClientState>;
  Action: (state: null | State | ClientState) => Codec<Action>;
  Effect: (state: null | State | ClientState) => Codec<Effect>;
  UpdateError: Codec<UpdateError>;

  // generate the initial engine state
  init: (options: Config) => State;

  // listen, apply, redact_action, potato.
  //
  // lifts a client-generated intent into an action, applies that action to the
  // input state, and produces an output state along with per-client redacted
  // effects.
  larp: (
    state: State,
    intent: Intent,
    who: User,
    clients: User[],
  ) => Result<
    [State, Record<UserID, Effect>],
    UpdateError
  >;

  // predict the outcome of an intent based on the client state; return null if
  // the outcome is unknown
  predict: (
    state: ClientState,
    intent: Intent,
    me: User
  ) => null | Result<Effect, UpdateError>;

  // same as apply, on the client side
  apply_client: (
    state: ClientState,
    effect: Effect | ProtocolAction,
    me: User
  ) => Result<ClientState, UpdateError>;

  // redact a server state into a client-side state for the given recipient
  redact: (state: State, who: User) => ClientState;
};
