import { parseArgsStringToArgv } from 'string-argv';
import parser from 'yargs-parser';

function argParserMiddleware() {
  const text = this.msg.text
  const args = parseArgsStringToArgv(text)
  const command = args.shift().substring(1) // remove the leading "/"
  const parsedArgs = parser(args)
  this.command = command
  this.args = parsedArgs
  this.rawArgs = args.join(' ')
}


export default argParserMiddleware