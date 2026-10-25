"""Author original motion examples; generated character source stays unmodified.
Requires Pillow, numpy and imageio-ffmpeg. No source-image editing is performed.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math, wave, subprocess
import numpy as np
import imageio_ffmpeg

W,H,FPS,DURATION=1280,720,30,12
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'public/assets/video'
OUT.mkdir(parents=True,exist_ok=True)
FF=imageio_ffmpeg.get_ffmpeg_exe()
FONT=Path('C:/Windows/Fonts/segoeui.ttf')
BOLD=Path('C:/Windows/Fonts/seguisb.ttf')
def font(size,bold=False):return ImageFont.truetype(str(BOLD if bold else FONT),size)
def ease(x):
 x=max(0,min(1,x));return 1-(1-x)**3
def txt(draw,xy,s,size,color,bold=False):draw.text(xy,s,font=font(size,bold),fill=color)

character=Image.open(ROOT/'assets-original/services/courier-character.png').convert('RGBA')
character.thumbnail((670,490),Image.Resampling.LANCZOS)
def business(t):
 im=Image.new('RGB',(W,H),'#f5eee5');d=ImageDraw.Draw(im)
 # Quiet moving route and geometric shopfronts; character is the generated artwork.
 for k in range(7):
  x=int((k*250-t*48)%1780)-250
  d.rounded_rectangle((x,407,x+170,590),radius=14,fill='#e8ded0')
  d.rounded_rectangle((x+22,430,x+148,472),radius=5,fill='#fdf7ee')
 d.rectangle((0,590,W,H),fill='#e0d4bf')
 d.line((0,621,W,621),fill='#acb69a',width=4)
 for k in range(12):
  x=int((k*140-t*160)%1680)-140;d.line((x,650,x+65,650),fill='#f5eee5',width=5)
 x=int(615-350*(1-ease(t/2)) + 10*math.sin(t*.9))
 y=int(183+3*math.sin(t*9))
 # Character remains intact and moves as one authored motion layer.
 im.paste(character,(x,y),character)
 d=ImageDraw.Draw(im)
 if t<5.5:
  offset=int(32*(1-ease(t/.8)))
  txt(d,(68,68+offset),'Ваш заказ',59,'#4f3428',True)
  txt(d,(68,140+offset),'уже в пути.',59,'#4f3428',True)
  txt(d,(71,239),'Маленькая история',25,'#68584e')
  txt(d,(71,275),'о бережной доставке.',25,'#68584e')
 else:
  offset=int(30*(1-ease((t-5.5)/.8)))
  txt(d,(68,68+offset),'Доставим',59,'#4f3428',True)
  txt(d,(68,140+offset),'бережно.',59,'#4f3428',True)
  txt(d,(71,239),'А вы занимайтесь',25,'#68584e')
  txt(d,(71,275),'любимым делом.',25,'#68584e')
 if t>9.2:
  # An arriving parcel becomes the final frame's graphic accent.
  yy=int(372+30*(1-ease((t-9.2)/.7)))
  d.rounded_rectangle((72,yy,425,yy+55),radius=10,fill='#753b29')
  txt(d,(94,yy+9),'БЕРЕЖНО — ДО ВАШЕЙ ДВЕРИ',19,'#fff8f1',True)
 return im

# Original electronic soundtrack, 100 BPM, not a copyrighted client song.
SR=44100
seconds=np.arange(SR*DURATION)/SR
audio=np.zeros(len(seconds),dtype=np.float64)
chords=[[130.813,164.814,195.998],[110,130.813,164.814],[87.307,110,130.813],[97.999,123.471,146.832]]
for beat in range(20):
 start=beat*.6;n=int(start*SR);length=min(int(.56*SR),len(audio)-n)
 if length<=0:continue
 a=np.arange(length)/SR
 f=chords[(beat//5)%4][beat%3]*2
 audio[n:n+length]+=.13*np.sin(2*np.pi*f*a)*np.exp(-a*7)
 length=min(int(.25*SR),len(audio)-n);a=np.arange(length)/SR
 if beat%2==0:audio[n:n+length]+=.18*np.sin(2*np.pi*(45*a+2*(1-np.exp(-a*25))))*np.exp(-a*20)
for k,ch in enumerate(chords):
 n=int(k*3*SR);length=min(3*SR,len(audio)-n);a=np.arange(length)/SR
 env=np.minimum(a/.2,1)*np.minimum((3-a)/.4,1)
 for f in ch:audio[n:n+length]+=.018*np.sin(2*np.pi*f*a)*env
audio*=np.minimum(seconds/.35,1)*np.minimum((DURATION-seconds)/.7,1)
pcm=(np.clip(audio,-.95,.95)*32767).astype('<i2')
music_path=ROOT/'artifacts/orbit-score.wav'
with wave.open(str(music_path),'wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(SR);f.writeframes(pcm.tobytes())
rng=np.random.default_rng(14);particles=rng.random((75,4))
def music(t):
 im=Image.new('RGB',(W,H),'#171d24');d=ImageDraw.Draw(im)
 beat=(t/.6)%1;pulse=math.exp(-beat*6)
 # Elliptic orbital traces rotate in three dimensions and react to the beat.
 for k in range(22):
  points=[];phase=t*.38+k*.105
  for a in np.linspace(0,math.tau,160):
   rr=155+k*7+5*pulse
   x=rr*math.cos(a);y=rr*.63*math.sin(a)
   xx=x*math.cos(phase)-y*math.sin(phase);yy=x*math.sin(phase)+y*math.cos(phase)
   points.append((W*.61+xx,H*.49+yy*.69))
  c=(int(157+4*k),int(101+2*k),int(65+3*k))
  d.line(points,fill=c,width=2 if k%3 else 3)
 for x,y,s,p in particles:
  theta=x*math.tau+t*(.08+s*.12);rad=115+y*350
  xx=780+rad*math.cos(theta);yy=360+rad*.58*math.sin(theta)
  r=1+s*2+pulse*1.3;d.ellipse((xx-r,yy-r,xx+r,yy+r),fill='#f5dfd0')
 txt(d,(68,90),'ОРБИТА',76,'#fff8f1',True)
 txt(d,(74,195),'Движение в ритме музыки',25,'#d7c0ad')
 for k in range(35):
  h=int(8+55*abs(math.sin(t*4.1+k*.43))*math.exp(-k/65)*(0.4+pulse))
  x=76+k*6;d.rounded_rectangle((x,575-h,x+3,575),radius=1,fill='#c6875f')
 txt(d,(74,610),'Музыка задаёт движение.',20,'#d7c0ad')
 return im

def render(name,fn,audio_path,poster):
 silent=ROOT/'artifacts'/f'{name}-silent.mp4'
 cmd=[FF,'-y','-f','rawvideo','-vcodec','rawvideo','-s',f'{W}x{H}','-pix_fmt','rgb24','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','fast','-crf','22','-pix_fmt','yuv420p',str(silent)]
 p=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=subprocess.DEVNULL)
 for n in range(FPS*DURATION):p.stdin.write(fn(n/FPS).tobytes())
 p.stdin.close();assert p.wait()==0
 subprocess.run([FF,'-y','-i',str(silent),'-i',str(audio_path),'-c:v','copy','-c:a','aac','-b:a','128k','-af','apad','-t',str(DURATION),'-movflags','+faststart',str(OUT/f'{name}.mp4')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 cover=Image.new('RGB',(1536,1024),'#f5eee5' if name=='business-story' else '#171d24')
 cover.paste(fn(2.8).resize((1536,864),Image.Resampling.LANCZOS),(0,80))
 cover.save(ROOT/'assets-original/services'/f'{poster}.png')
 fn(2.8).save(OUT/f'{name}-poster.jpg',quality=90)
 print(f'Rendered {name}: {DURATION}s, H264/AAC, 1280x720',flush=True)

render('business-story',business,ROOT/'artifacts/business-narration.wav','business-video')
render('music-film',music,music_path,'music-video')
