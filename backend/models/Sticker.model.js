// models/Sticker.model.js
import mongoose from "mongoose";

const stickerSchema = new mongoose.Schema({
    packId: {
        type: String,
        required: true
    },
    packName: {
        type: String,
        required: true
    },
    stickerId: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    emoji: {
        type: String,
        default: "😊"
    },
    isFree: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const stickerPackSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    stickers: [stickerSchema],
    isPremium: {
        type: Boolean,
        default: false
    },
    price: {
        type: Number,
        default: 0
    },
    downloads: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

export const Sticker = mongoose.model("Sticker", stickerSchema);
export const StickerPack = mongoose.model("StickerPack", stickerPackSchema);