export var AudioClips;
(function (AudioClips) {
    AudioClips["PUT_SMALL"] = "put_small";
    AudioClips["PUT_BIG"] = "put_big";
    AudioClips["PICK_SMALL"] = "pick_small";
    AudioClips["PICK_BIG"] = "pick_big";
    AudioClips["DROP"] = "drop";
    AudioClips["MAIN_MUSIC"] = "main_music";
    AudioClips["COMBO1"] = "combo1";
    AudioClips["COMBO2"] = "combo2";
    AudioClips["COMBO3"] = "combo3";
    AudioClips["LOSE"] = "lose";
})(AudioClips || (AudioClips = {}));
export const AUDIO_PATHS = {
    [AudioClips.PUT_SMALL]: "assets/sounds/small_piece_put.wav",
    [AudioClips.PUT_BIG]: "assets/sounds/big_piece_put.wav",
    [AudioClips.PICK_SMALL]: "assets/sounds/pick_small.wav",
    [AudioClips.PICK_BIG]: "assets/sounds/pick_big.wav",
    [AudioClips.DROP]: "assets/sounds/drop_piece.wav",
    [AudioClips.MAIN_MUSIC]: "assets/sounds/hip_hop_music_loop_ready.mp3",
    [AudioClips.COMBO1]: "assets/sounds/combo_1.flac",
    [AudioClips.COMBO2]: "assets/sounds/combo_2.wav",
    [AudioClips.COMBO3]: "assets/sounds/combo_3.wav",
    [AudioClips.LOSE]: "assets/sounds/lose.wav",
};
