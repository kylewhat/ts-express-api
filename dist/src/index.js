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
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const mongoose_1 = require("./db/mongoose");
const stateController_1 = require("./controllers/stateController");
require('dotenv').config();
const app = (0, express_1.default)();
const port = process.env.PORT || 80;
const statesData = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, 'data/states.json'), 'utf-8'));
// Middleware to validate state abbreviation
const validateState = (req, res, next) => {
    if (!req.params.state) {
        res.status(404).json({ error: 'State required.' });
    }
    const stateAbbreviation = req.params.state.toUpperCase();
    const state = statesData.find((s) => s.code === stateAbbreviation);
    if (!state) {
        res.status(404).json({ error: 'State not found or invalid state abbreviation.' });
    }
    req.stateData = state;
    next();
};
// Route that delegates to controller methods
app.all('/states/:state{/:property}', validateState, (req, res) => {
    switch (req.method) {
        case 'GET':
            return (0, stateController_1.getState)(req, res);
        case 'POST':
            return (0, stateController_1.postState)(req, res);
        case 'PUT':
            return (0, stateController_1.putState)(req, res);
        case 'DELETE':
            return (0, stateController_1.deleteState)(req, res);
        default:
            res.status(405).send('Method Not Allowed');
    }
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDatabase)();
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}))();
