import type { Message } from 'node-telegram-bot-api';
import { parseArgsStringToArgv } from 'string-argv';
import parser from 'yargs-parser';
import errorHandler from './error.middleware.js';

interface DefaultParsedContext {
  msg: Message;
  chatId: number;
  shouldStop: boolean;
  command: string;
  rawArgs: string;
  args: ReturnType<typeof parser>;
}

type MaybePromise<T = void> = T | Promise<T>;

type TelegramHandler<TContext extends DefaultParsedContext = DefaultParsedContext> = (
  this: TContext,
  message: Message,
  ...extraArgs: unknown[]
) => MaybePromise<unknown>;

type TelegramMiddleware<TContext extends DefaultParsedContext = DefaultParsedContext> = (
  this: TContext,
  message: Message,
  ...extraArgs: unknown[]
) => MaybePromise<void>;

interface MiddlewareFactory<TContext extends DefaultParsedContext = DefaultParsedContext> {
  (handler: TelegramHandler<TContext>): (message: Message, ...extraArgs: unknown[]) => Promise<void>;
  use: (middleware: TelegramMiddleware<TContext>) => MiddlewareFactory<TContext>;
}

function createDefaultParsedContext(message: Message): DefaultParsedContext {
  const text = message.text ?? '';
  const argv = parseArgsStringToArgv(text);

  const commandArg = argv.shift() ?? '';
  const command = commandArg.startsWith('/') ? commandArg.substring(1) : commandArg;
  const args = parser(argv);

  return {
    msg: message,
    chatId: message.chat.id,
    shouldStop: false,
    command,
    rawArgs: argv.join(' '),
    args,
  };
}

function defaultParserMiddleware<TContext extends DefaultParsedContext = DefaultParsedContext>(
  stack: TelegramMiddleware<TContext>[] = [],
): MiddlewareFactory<TContext> {
  const wrapper = ((handler: TelegramHandler<TContext>) => {
    return async (message: Message, ...extraArgs: unknown[]) => {
      const context = createDefaultParsedContext(message) as TContext;

      for (const middleware of stack) {
        await middleware.call(context, message, ...extraArgs);
        if (context.shouldStop) {
          return;
        }
      }
      try{
        await handler.call(context, message, ...extraArgs);
      }
      catch (error) {
        errorHandler(error, context);
      }
    };
  }) as MiddlewareFactory<TContext>;

  wrapper.use = (middleware: TelegramMiddleware<TContext>) =>
    defaultParserMiddleware([...stack, middleware]);

  return wrapper;
}

export type { DefaultParsedContext, TelegramHandler, TelegramMiddleware, MiddlewareFactory };
export default defaultParserMiddleware;