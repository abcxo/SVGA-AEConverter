/// <reference path="../declear/ae.declare.ts" />
/// <reference path="../declear/svga.declare.ts" />
/// <reference path="../converter/converter.ts" />
/// <reference path="../writer/writer.ts" />

/**
 * Author: Pony Cui
 * Date: 2016.08.01
 * Dev: TypeScript 1.8
 * Env: After Effects CC 2015
 * Build: npm install & npm start
 */

let thisConverter = new Converter(app);
let thisWriter = new Writer(thisConverter);
thisWriter.write()