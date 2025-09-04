import { AudioClips, AUDIO_PATHS } from "./audio_constants.js";

export class AudioController
{
  private ctx = new AudioContext();
  private master_gain = this.ctx.createGain();

  private buffers = new Map<AudioClips, AudioBuffer>();
  private active_music: AudioBufferSourceNode | null = null;

  public is_music_enabled = true;
  public is_sounds_enabled = true;

  constructor()
  {
    this.master_gain.connect( this.ctx.destination );
  }

  private async load( clip: AudioClips ): Promise<AudioBuffer>
  {
    if ( this.buffers.has( clip ) )
    {
      return this.buffers.get( clip )!;
    }
    const resp = await fetch( AUDIO_PATHS[clip] );
    const array_buf = await resp.arrayBuffer();
    const audio_buf = await this.ctx.decodeAudioData( array_buf );
    this.buffers.set( clip, audio_buf );
    return audio_buf;
  }

  public async LoadAll()
  {
    for ( const clip of Object.values( AudioClips ) )
    {
      await this.load( clip );
    }
  }

  public async playMusic( clip: AudioClips, loop = true )
  {
    if ( !this.is_music_enabled ) return;

    this.stopMusic();

    const buf = await this.load( clip );
    const src = this.ctx.createBufferSource();
    src.buffer = buf;

    if ( loop )
    {
      src.loop = true;
      src.loopStart = 0;             
      src.loopEnd = buf.duration;    
    }

    src.connect( this.master_gain );
    src.start();

    this.active_music = src;
  }

  public stopMusic()
  {
    if ( this.active_music )
    {
      this.active_music.stop();
      this.active_music.disconnect();
      this.active_music = null;
    }
  }

  public async playSound( clip: AudioClips, loop = false )
  {
    if ( !this.is_sounds_enabled ) return;

    const buf = await this.load( clip );
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = loop;
    src.connect( this.master_gain );
    src.start();
  }

  public enableMusic( status: boolean, clip?: AudioClips )
  {
    this.is_music_enabled = status;
    if ( status && clip )
    {
      this.playMusic( clip, true );
    } else
    {
      this.stopMusic();
    }
  }

  public enableSounds( status: boolean )
  {
    this.is_sounds_enabled = status;
  }
}

export const audioController = new AudioController();
