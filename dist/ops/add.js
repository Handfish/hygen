"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = __importDefault(require("./result"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const chalk_1 = require("chalk");
const askForOverwrite = (prompter, to) => __awaiter(void 0, void 0, void 0, function* () {
    const { overwrite } = yield prompter.prompt({
        prefix: '',
        type: 'confirm',
        name: 'overwrite',
        message: chalk_1.red(`     exists: ${to}. Overwrite? (y/N): `),
    });
    return overwrite;
});
const getShouldSkip = (absTo, attributes, createPrompter) => __awaiter(void 0, void 0, void 0, function* () {
    const { to, unless_exists, force, skip_if } = attributes;
    const fileExists = yield fs_extra_1.default.exists(absTo);
    const shouldNotOverwrite = !force && unless_exists !== undefined && unless_exists === true;
    if (shouldNotOverwrite && fileExists) {
        return true;
    }
    const prompter = createPrompter();
    if (!process.env.HYGEN_OVERWRITE &&
        fileExists &&
        !(yield askForOverwrite(prompter, to)) ||
        skip_if === 'true') {
        return true;
    }
    return false;
});
const add = (action, args, { logger, cwd, createPrompter }) => __awaiter(void 0, void 0, void 0, function* () {
    const { attributes: { to, inject, force, from }, } = action;
    const result = result_1.default('add', to);
    if (!to || inject) {
        return result('ignored');
    }
    const absTo = path_1.default.resolve(cwd, to);
    const shouldSkip = yield getShouldSkip(absTo, action.attributes, createPrompter);
    if (shouldSkip) {
        logger.warn(`     skipped: ${to}`);
        return result('skipped');
    }
    if (from) {
        const from_path = path_1.default.join(args.templates, from);
        const file = fs_extra_1.default.readFileSync(from_path).toString();
        action.body = file;
    }
    if (!args.dry) {
        yield fs_extra_1.default.ensureDir(path_1.default.dirname(absTo));
        yield fs_extra_1.default.writeFile(absTo, action.body);
    }
    const pathToLog = process.env.HYGEN_OUTPUT_ABS_PATH ? absTo : to;
    logger.ok(`       ${force ? 'FORCED' : 'added'}: ${pathToLog}`);
    return result('added');
});
exports.default = add;
//# sourceMappingURL=add.js.map