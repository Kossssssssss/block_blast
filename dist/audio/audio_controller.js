import { AudioClips, AUDIO_PATHS } from "./audio_constants.js";
export class AudioController {
    constructor() {
        this.ctx = new AudioContext();
        this.master_gain = this.ctx.createGain();
        this.buffers = new Map();
        this.active_music = null;
        this.is_music_enabled = true;
        this.is_sounds_enabled = true;
        this.master_gain.connect(this.ctx.destination);
    }
    async load(clip) {
        if (this.buffers.has(clip)) {
            return this.buffers.get(clip);
        }
        const resp = await fetch(AUDIO_PATHS[clip]);
        const array_buf = await resp.arrayBuffer();
        const audio_buf = await this.ctx.decodeAudioData(array_buf);
        this.buffers.set(clip, audio_buf);
        return audio_buf;
    }
    async LoadAll() {
        for (const clip of Object.values(AudioClips)) {
            await this.load(clip);
        }
    }
    async playMusic(clip, loop = true) {
        if (!this.is_music_enabled)
            return;
        this.stopMusic();
        const buf = await this.load(clip);
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        if (loop) {
            src.loop = true;
            src.loopStart = 0;
            src.loopEnd = buf.duration;
        }
        src.connect(this.master_gain);
        src.start();
        this.active_music = src;
    }
    stopMusic() {
        if (this.active_music) {
            this.active_music.stop();
            this.active_music.disconnect();
            this.active_music = null;
        }
    }
    async playSound(clip, loop = false) {
        if (!this.is_sounds_enabled)
            return;
        const buf = await this.load(clip);
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        src.loop = loop;
        src.connect(this.master_gain);
        src.start();
    }
    enableMusic(status, clip) {
        this.is_music_enabled = status;
        if (status && clip) {
            this.playMusic(clip, true);
        }
        else {
            this.stopMusic();
        }
    }
    enableSounds(status) {
        this.is_sounds_enabled = status;
    }
}
export const audioController = new AudioController();
