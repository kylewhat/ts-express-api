"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteState = exports.putState = exports.postState = exports.getState = void 0;
const getState = (req, res) => {
    const state = req.stateData;
    const { property } = req.params;
    const { contig } = req.query;
    const contigValue = contig === 'true' ? true : contig === 'false' ? false : undefined;
    res.send(`GET: State: ${state.name} (${state.code}), Property: ${property !== null && property !== void 0 ? property : 'none'}, Contig: ${contigValue !== null && contigValue !== void 0 ? contigValue : 'ignored'}`);
};
exports.getState = getState;
const postState = (req, res) => {
    const state = req.stateData;
    res.send(`POST: Creating resource for state ${state.code}`);
};
exports.postState = postState;
const putState = (req, res) => {
    const state = req.stateData;
    res.send(`PUT: Updating resource for state ${state.code}`);
};
exports.putState = putState;
const deleteState = (req, res) => {
    const state = req.stateData;
    res.send(`DELETE: Removing resource for state ${state.code}`);
};
exports.deleteState = deleteState;
