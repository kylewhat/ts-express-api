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
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const mongoose_1 = require("./db/mongoose");
const stateController_1 = require("./controllers/stateController");
require('dotenv').config();
const app = (0, express_1.default)();
const port = process.env.PORT || 80;
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json());
const statesData = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, 'data/states.json'), 'utf-8'));
// Middleware to validate state abbreviation
const validateState = (req, res, next) => {
    if (!req.params.state) {
        return next();
    }
    const stateAbbreviation = req.params.state.toUpperCase();
    const state = statesData.find((s) => s.code === stateAbbreviation);
    if (!state) {
        res.status(404).json({ message: 'Invalid state abbreviation parameter' });
        return;
    }
    if (req.params.prop) {
        req.prop = req.params.prop;
    }
    req.stateData = state;
    next();
};
app.get('/', (req, res) => {
    return res.sendFile(path_1.default.join(__dirname, 'views', 'index.html'));
});
// Route that delegates to controller methods
app.all('/states{/:state}{/:prop}', validateState, (req, res) => {
    switch (req.method) {
        case 'GET':
            if (!req.stateData) {
                (0, stateController_1.getAllStates)(req, res);
                return;
            }
            if (req.prop) {
                (0, stateController_1.getStateProperty)(req, res);
                return;
            }
            (0, stateController_1.getState)(req, res);
            return;
        case 'POST':
            (0, stateController_1.postState)(req, res);
            return;
        case 'PATCH':
            (0, stateController_1.patchState)(req, res);
            return;
        case 'DELETE':
            (0, stateController_1.deleteState)(req, res);
            return;
        default:
            res.status(405).send('Method Not Allowed');
            return;
    }
});
// Catch all other routes
app.use((req, res) => {
    const accept = req.headers.accept || '';
    if (accept.includes('*/*') || accept.includes('text/html')) {
        res.status(404).sendFile(path_1.default.join(__dirname, 'views', '404.html'));
    }
    else if (accept.includes('application/json')) {
        res.status(404).json({ error: '404 Not Found' });
    }
    else {
        res.status(404).type('text').send('404 Not Found');
    }
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDatabase)();
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}))();
