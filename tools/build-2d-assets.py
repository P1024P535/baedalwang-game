"""Repack supplied art; recover damaged sheet cuts without drawing new pixels."""
import sys,json,math
from pathlib import Path
import numpy as np
from scipy import ndimage
from PIL import Image,ImageDraw

sources=Path(sys.argv[1]);unpacked=Path(sys.argv[2]);vans=Path(sys.argv[3]);out=Path('assets/world-2d');out.mkdir(parents=True,exist_ok=True)
def clean(im,white=False):
    a=np.array(im.convert('RGBA'))
    if white:
        rgb=a[:,:,:3].astype(int)
        bg=(rgb.min(2)>205)&((rgb.max(2)-rgb.min(2))<30)
        seed=np.zeros(bg.shape,bool);seed[0]=bg[0];seed[-1]=bg[-1];seed[:,0]=bg[:,0];seed[:,-1]=bg[:,-1]
        mask=ndimage.binary_propagation(seed,mask=bg);a[mask,3]=0
    mask=a[:,:,3]>45
    labels,n=ndimage.label(mask)
    if not n:raise ValueError('empty asset')
    sizes=np.bincount(labels.ravel());sizes[0]=0;main=int(sizes.argmax())
    # Keep the main connected drawing and edge antialiasing, remove neighboring scraps.
    keep=ndimage.binary_dilation(labels==main,iterations=2)
    a[~keep,3]=0;a[a[:,:,3]==0,:3]=0
    im=Image.fromarray(a);return im.crop(im.getbbox())

items=[]
def add(key,im,group,white=False):items.append((key,clean(im,white),group))
sheet=Image.open(next(sources.glob('오렌지*'))).convert('RGBA')
order=['front','right','back','left']
for vehicle,row in [(0,0),(1,1),(2,2),(3,3),(4,4),(5,5),(7,7)]:
    for col,direction in enumerate(order):
        box=(round(col*sheet.width/4),round(row*sheet.height/8),round((col+1)*sheet.width/4),round((row+1)*sheet.height/8))
        pose=sheet.crop(box)
        if vehicle==7 and direction=='right':pose=pose.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        add(f'vehicle/{vehicle}/{direction}',pose,'vehicles')
van=Image.open(next(vans.glob('귀여운 흰색 배달*'))).convert('RGBA')
for col,row,d in [(0,0,'front'),(1,0,'right'),(0,1,'back'),(1,1,'left')]:
    add(f'vehicle/6/{d}',van.crop((col*van.width//2,row*van.height//2,(col+1)*van.width//2,(row+1)*van.height//2)),'vehicles')
for vehicle,prefix,folder in [(8,'logistics','baedalwang_logistics_4directions(1)'),(9,'helicopter','baedalwang_helicopter_spaceship_8sprites(1)'),(10,'spaceship','baedalwang_helicopter_spaceship_8sprites(1)')]:
    for d in order:
        # Dedicated ZIP side labels describe character-relative rather than screen direction.
        actual={'left':'right','right':'left'}.get(d,d)
        add(f'vehicle/{vehicle}/{d}',Image.open(unpacked/folder/f'{prefix}_{actual}.png'),'vehicles')
for p in sorted((unpacked/'baedalwang_buildings_12_png(1)').glob('*.png')):add('shop/'+p.stem,Image.open(p),'buildings')
for p in sorted((unpacked/'baedalwang_region_40_png_assets(1)').glob('building_*.png')):add('development/'+p.stem,Image.open(p),'buildings')

env=Image.open(next(sources.glob('배달왕 2D 게임 맵*'))).convert('RGBA')
def boxes(kind,xs,y0,y1):
    for i,(x0,x1) in enumerate(xs):add(f'env/{kind}_{i+1:02}',env.crop((x0,y0,x1,y1)),'environment',True)
boxes('road',[(16,178),(189,330),(338,478),(486,623),(634,773),(781,915)],153,315)
boxes('intersection',[(17,198),(208,372),(379,557),(566,743),(753,910)],398,583)
boxes('ground',[(20,144),(151,273),(281,400),(407,526),(533,655),(661,781),(786,910)],673,797)
boxes('terrain',[(16,146),(152,278),(285,409),(413,535),(540,665),(669,796),(800,914)],895,990)
boxes('tree',[(945,1066),(1068,1184),(1186,1306),(1308,1419),(1420,1535)],145,291)
boxes('nature',[(946,1053),(1055,1149),(1151,1246),(1247,1324),(1325,1404),(1405,1468),(1469,1535)],303,381)
boxes('street',[(947,1027),(1030,1112),(1115,1214),(1217,1295),(1297,1408),(1410,1532)],390,556)
boxes('furniture',[(944,1075),(1081,1215),(1221,1324),(1331,1427),(1435,1511)],563,666)
boxes('decoration',[(945,1049),(1053,1165),(1169,1265),(1268,1335),(1340,1433),(1438,1520)],684,762)
boxes('facility',[(938,1034),(1038,1239),(1242,1341),(1347,1441),(1444,1534)],789,972)

manifest={'version':1,'assets':{},'groups':{}}
for group,cell,cols in [('vehicles',192,4),('buildings',256,8),('environment',192,8)]:
    rows=[it for it in items if it[2]==group];atlas=Image.new('RGBA',(cell*cols,cell*math.ceil(len(rows)/cols)))
    maxsizes={}
    if group=='vehicles':
        for key,im,_ in rows:
            vid=key.split('/')[1];maxsizes[vid]=max(maxsizes.get(vid,0),*im.size)
    for i,(key,im,_) in enumerate(rows):
        scale=(cell-12)/(maxsizes[key.split('/')[1]] if group=='vehicles' else max(im.size))
        im=im.resize((max(1,round(im.width*scale)),max(1,round(im.height*scale))),Image.Resampling.LANCZOS)
        x=i%cols*cell+(cell-im.width)//2;y=i//cols*cell+cell-6-im.height
        atlas.paste(im,(x,y));manifest['assets'][key]={'sheet':group,'rect':[x,y,im.width,im.height]}
    atlas.save(out/(group+'.webp'),quality=92,method=6);manifest['groups'][group]={'src':'assets/world-2d/'+group+'.webp','count':len(rows),'width':atlas.width,'height':atlas.height}
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,separators=(',',':')))
contact=Image.new('RGB',(1000,math.ceil(len(items)/10)*115),'#dce8ec');draw=ImageDraw.Draw(contact)
for i,(key,im,_) in enumerate(items):
    a=im.copy();a.thumbnail((94,91));x=i%10*100;y=i//10*115;contact.paste(a,(x+(100-a.width)//2,y),a);draw.text((x+2,y+94),key.split('/')[-1][:15],fill='black')
Path('docs/screenshots').mkdir(parents=True,exist_ok=True);contact.save('docs/screenshots/full-graphics-asset-audit.jpg')
print(json.dumps({'assets':len(items),'groups':manifest['groups']},ensure_ascii=False))
