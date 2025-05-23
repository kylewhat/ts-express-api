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
exports.getStateProperty = exports.getAllStates = exports.deleteState = exports.patchState = exports.postState = exports.getState = void 0;
const state_1 = __importDefault(require("../models/state"));
const states_json_1 = __importDefault(require("../data/states.json"));
const getState = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const state = req.stateData;
    const doc = yield state_1.default.findOne({ stateCode: state.code }).exec();
    const responseData = Object.assign({}, state);
    if ((doc === null || doc === void 0 ? void 0 : doc.funfacts) && doc.funfacts.length > 0) {
        responseData.funfacts = doc.funfacts;
    }
    return res.status(200).json(responseData);
});
exports.getState = getState;
const postState = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const state = req.stateData;
    const { funfacts } = req.body;
    if (!funfacts || funfacts.length === 0) {
        return res.status(400).json({ message: 'State fun facts value required' });
    }
    if (!Array.isArray(funfacts)) {
        return res.status(400).json({ message: 'State fun facts value must be an array' });
    }
    try {
        const existingState = yield state_1.default.findOne({ stateCode: state.code }).exec();
        if (existingState) {
            existingState.funfacts.push(...funfacts);
            yield existingState.save();
            return res.json(existingState);
        }
        else {
            const newState = new state_1.default({
                stateCode: state.code,
                funfacts
            });
            yield newState.save();
            return res.status(201).json(newState);
        }
    }
    catch (err) {
        return res.status(500).json({ error: 'Database error', details: err });
    }
});
exports.postState = postState;
const patchState = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const state = req.stateData;
    const index = (_a = req.body) === null || _a === void 0 ? void 0 : _a.index;
    const funfact = (_b = req.body) === null || _b === void 0 ? void 0 : _b.funfact;
    const staticState = states_json_1.default.find(s => s.code === state.code);
    // Validate inputs
    if (!index || typeof index !== 'number' || index < 1) {
        return res.status(400).json({ message: 'State fun fact index value required' });
    }
    if (!funfact || typeof funfact !== 'string') {
        return res.status(400).json({ message: 'State fun fact value required' });
    }
    try {
        const existingState = yield state_1.default.findOne({ stateCode: state.code }).exec();
        if (!existingState) {
            return res.status(404).json({ message: `No Fun Facts found for ${staticState.state}` });
        }
        const zeroBasedIndex = index - 1;
        if (zeroBasedIndex < 0 || zeroBasedIndex >= existingState.funfacts.length) {
            return res.status(400).json({ message: `No Fun Fact found at that index for ${staticState.state}` });
        }
        existingState.funfacts[zeroBasedIndex] = funfact;
        yield existingState.save();
        return res.json(existingState);
    }
    catch (err) {
        return res.status(500).json({ error: 'Database error', details: err });
    }
});
exports.patchState = patchState;
const deleteState = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const state = req.stateData;
    const index = (_a = req.body) === null || _a === void 0 ? void 0 : _a.index;
    const staticState = states_json_1.default.find(s => s.code === state.code);
    // Validate index
    if (!index || typeof index !== 'number' || index < 1) {
        return res.status(400).json({ message: 'State fun fact index value required' });
    }
    try {
        const existingState = yield state_1.default.findOne({ stateCode: state.code }).exec();
        if (!existingState || !Array.isArray(existingState.funfacts)) {
            return res.status(404).json({ message: `No Fun Facts found for ${staticState.state}` });
        }
        const zeroBasedIndex = index - 1;
        if (zeroBasedIndex < 0 || zeroBasedIndex >= existingState.funfacts.length) {
            return res.status(400).json({ message: `No Fun Fact found at that index for ${staticState.state}` });
        }
        // Remove funfact at the index
        existingState.funfacts.splice(zeroBasedIndex, 1);
        yield existingState.save();
        return res.json(existingState);
    }
    catch (err) {
        return res.status(500).json({ error: 'Database error', details: err });
    }
});
exports.deleteState = deleteState;
const getAllStates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dbStates = yield state_1.default.find();
        const funfactsMap = {};
        const { contig } = req.query;
        const contigValue = contig === 'true' ? true : contig === 'false' ? false : undefined;
        dbStates.forEach(({ stateCode, funfacts }) => {
            if (funfacts === null || funfacts === void 0 ? void 0 : funfacts.length) {
                funfactsMap[stateCode] = funfacts;
            }
        });
        let fullStates = states_json_1.default.map(state => (Object.assign(Object.assign({}, state), { funfacts: funfactsMap[state.code] || [] })));
        if (contigValue === true) {
            fullStates = fullStates.filter(s => s.code !== 'AK' && s.code !== 'HI');
        }
        else if (contigValue === false) {
            fullStates = fullStates.filter(s => s.code === 'AK' || s.code === 'HI');
        }
        return res.status(200).json(fullStates);
    }
    catch (err) {
        console.error('Error fetching states:', err);
        return;
        // return res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.getAllStates = getAllStates;
const getStateProperty = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const state = req.stateData;
        const staticState = states_json_1.default.find(s => s.code === state.code);
        const stateName = staticState.state;
        const property = (_a = req.prop) === null || _a === void 0 ? void 0 : _a.toUpperCase();
        switch (property) {
            case 'FUNFACT':
                const doc = yield state_1.default.findOne({ stateCode: state.code }).exec();
                const funfacts = (doc === null || doc === void 0 ? void 0 : doc.funfacts) || [];
                if (funfacts.length === 0) {
                    return res
                        .status(404)
                        .json({ message: `No Fun Facts found for ${staticState.state}` });
                }
                const randomFact = funfacts[Math.floor(Math.random() * funfacts.length)];
                return res.json({
                    funfact: randomFact
                });
            case 'CAPITAL':
                return res.status(200)
                    .json({
                    'state': staticState.state,
                    'capital': staticState.capital_city
                });
            case 'NICKNAME':
                return res.status(200)
                    .json({
                    'state': staticState.state,
                    'nickname': staticState.nickname
                });
            case 'POPULATION':
                return res.status(200)
                    .json({
                    'state': staticState.state,
                    'population': staticState.population.toLocaleString('en-US')
                });
            case 'ADMISSION':
                return res.status(200)
                    .json({
                    'state': staticState.state,
                    'admitted': staticState.admission_date
                });
            default:
                return res.status(405).send('Property not found');
        }
    }
    catch (err) {
        console.error('Error fetching states:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.getStateProperty = getStateProperty;
