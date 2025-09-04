export enum AudioClips
{
  PUT_SMALL = "put_small",
  PUT_BIG = "put_big",
  PICK_SMALL = "pick_small",
  PICK_BIG = "pick_big",
  DROP = "drop",
  MAIN_MUSIC = "main_music",
  COMBO1 = "combo1",
  COMBO2 = "combo2",
  COMBO3 = "combo3",
  LOSE = "lose",
}

export const AUDIO_PATHS: Record<AudioClips, string> = {
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
