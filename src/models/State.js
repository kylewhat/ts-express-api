"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var stateSchema = new mongoose_1.Schema({
    stateCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    funfacts: {
        type: [String]
    }
});
exports.default = mongoose_1.default.model('State', stateSchema);
