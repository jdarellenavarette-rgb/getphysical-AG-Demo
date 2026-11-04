import { Image } from "react-native";

export const DARELLE_AVATAR_REQ = require("../../assets/profiles/darelle/avatar.png");
export const DARELLE_PHYSIQUE_REQ = require("../../assets/profiles/darelle/physique.png");
export const DARELLE_TENNIS_JUMP_REQ = require("../../assets/profiles/darelle/tennis_jump.jpg");
export const DARELLE_TENNIS_RACKET_REQ = require("../../assets/profiles/darelle/tennis_racket.jpg");
export const DARELLE_BOXING_REQ = require("../../assets/profiles/darelle/boxing.png");

export const DARELLE_AVATAR: string = Image.resolveAssetSource(DARELLE_AVATAR_REQ)?.uri ?? "";
export const DARELLE_PHYSIQUE: string = Image.resolveAssetSource(DARELLE_PHYSIQUE_REQ)?.uri ?? "";
export const DARELLE_TENNIS_JUMP: string = Image.resolveAssetSource(DARELLE_TENNIS_JUMP_REQ)?.uri ?? "";
export const DARELLE_TENNIS_RACKET: string = Image.resolveAssetSource(DARELLE_TENNIS_RACKET_REQ)?.uri ?? "";
export const DARELLE_BOXING: string = Image.resolveAssetSource(DARELLE_BOXING_REQ)?.uri ?? "";
