var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Logger } from "./logger.js";
export class Dependency {
    constructor(name) {
        this.name = name;
        this.readyPromise = new Promise((resolve) => this.resolve = resolve);
        this.logger = new Logger(`Dependency.${name}`);
    }
    static awaitMultiple(...dependencies) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(dependencies.map(d => d.await()));
        });
    }
    ready() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.trace(`Ready state triggered`);
            this.resolve();
        });
    }
    await() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.readyPromise;
        });
    }
}
//# sourceMappingURL=dependency.js.map