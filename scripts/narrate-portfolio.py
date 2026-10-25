"""Natural Russian narration using the MIT-licensed Silero CIS base voice model.
Model/voice provenance: docs/expanded-portfolio-assets.md. CPU inference only.
"""
from pathlib import Path
import hashlib, subprocess, tempfile, wave
import numpy as np
import requests
import torch
import imageio_ffmpeg

ROOT=Path(__file__).resolve().parent.parent
CACHE=Path.home()/'.cache'/'silero'
MODEL=CACHE/'v5_cis_base.pt'
URL='https://models.silero.ai/models/tts/ru/v5_cis_base.pt'
MODEL_SHA256='ba41b18f6a707ad93605a162998865e7c087153d2e010a26dd02229dab0e672a'
TEXT='В+аш зак+аз уж+е в пут+и. Дост+авим б+ережно, чт+обы в+ы заним+ались люб+имым д+елом.'
OUTPUT=ROOT/'assets-original'/'audio'/'business-narration-neural.wav'
CACHE.mkdir(parents=True,exist_ok=True)
OUTPUT.parent.mkdir(parents=True,exist_ok=True)
if not MODEL.exists():
    response=requests.get(URL,stream=True,timeout=60)
    response.raise_for_status()
    partial=MODEL.with_suffix('.part')
    with partial.open('wb') as file:
        for chunk in response.iter_content(1048576):file.write(chunk)
    expected=response.headers.get('Content-Length')
    if expected and partial.stat().st_size!=int(expected):raise RuntimeError('Incomplete voice model download')
    partial.replace(MODEL)
if hashlib.sha256(MODEL.read_bytes()).hexdigest()!=MODEL_SHA256:
    raise RuntimeError('Voice model differs from the documented version')

torch.set_num_threads(4)
model=torch.package.PackageImporter(str(MODEL)).load_pickle('tts_models','model')
model.to(torch.device('cpu'))
with torch.inference_mode():
    audio=model.apply_tts(text=TEXT,speaker='ru_eduard',sample_rate=48000).detach().cpu().numpy()
with tempfile.TemporaryDirectory(prefix='sloy-narration-') as temp:
    raw=Path(temp)/'narration.wav'
    with wave.open(str(raw),'wb') as file:
        file.setnchannels(1);file.setsampwidth(2);file.setframerate(48000)
        file.writeframes((np.clip(audio,-1,1)*32767).astype('<i2').tobytes())
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-y','-i',str(raw),'-af',
                    'atempo=0.94,adelay=180,loudnorm=I=-17:TP=-1.5:LRA=7',
                    '-ar','48000','-ac','1',str(OUTPUT)],check=True,
                   stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
print(f'Neural Russian narration saved to {OUTPUT}')
