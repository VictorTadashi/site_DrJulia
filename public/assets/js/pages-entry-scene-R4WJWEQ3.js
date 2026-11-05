"use client";import{a as fr,b as hr}from"./pages-chunk-A6DVP5S3.js";import{b as vt}from"./pages-chunk-7AGWJLQ6.js";var Qr=vt(fr());var $r=vt(fr());var gt=`varying vec2 vUv;
void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,dr=`
uniform float uSeparation;
uniform float uBrainEntry;
uniform float uAssembly;
uniform float uReburst;
uniform float uSpatial;
uniform float uReturnLogo;
float separation(float p){
 float extended=clamp(uSeparation-1.,0.,1.);
 return smoothstep(.68,.735,p)*(1.-smoothstep(mix(.745,.79,extended),mix(.805,.87,extended),p));
}
float orbit(float p){return 6.283185*smoothstep(.69,.90,p);}
vec3 separatePart(vec3 point,float piece,float amount,float time){
 vec3 travel=vec3(0.);
 if(piece<.5)travel=vec3(-.30,.07,-.035);
 else if(piece<1.5)travel=vec3(.30,.07,.035);
 else if(piece<2.5)travel=vec3(0.,-.105,-.22);
 else if(piece<3.5)travel=vec3(0.,-.19,.015);
 else if(piece<4.5)travel=vec3(0.,.055,.13);
 else travel=vec3(0.,-.115,.19);
float phase=time*.48+piece*1.7;
 vec3 drift=vec3(sin(phase),cos(phase*.83),sin(phase*.71))*.043;
 return point+(travel+drift)*amount*uSeparation;
}
float sceneScale(float base,float aspect,float amount){
 float wide=smoothstep(.6,1.2,aspect);
 float containment=mix(.27,.12,wide)+(uSeparation-1.)*.45*(1.-wide);
 return base/(1.+amount*containment);
}
`,qe=`
vec3 finiteNormal(vec3 v){return v*inversesqrt(max(dot(v,v),.00000001));}
mat3 turnY(float a){return mat3(cos(a),0.,-sin(a),0.,1.,0.,sin(a),0.,cos(a));}
mat3 turnX(float a){return mat3(1.,0.,0.,0.,cos(a),sin(a),0.,-sin(a),cos(a));}
${dr}
float logoForm(vec3 seed,float p){return mix(smoothstep(.185+seed.z*.014,.285,p),smoothstep(.1+seed.z*.04,.92,uAssembly),uBrainEntry);}
float brainMorph(vec3 seed,float p){return mix(smoothstep(.515+seed.z*.018,.615+seed.z*.018,p),1.,uBrainEntry)*(1.-clamp(uReturnLogo,0.,1.));}
float logoBurst(float p){return smoothstep(.425,.515,p)*(1.-smoothstep(.53,.635,p))*(1.-uBrainEntry);}
mat3 particleRotation(float p,float morph,float time,vec2 pointer){
 return turnY(orbit(p)-1.05*morph+pointer.x*.035+sin(time*.25)*separation(p)*.055)*turnX(-.08*morph+pointer.y*.018);
}
vec3 particleTarget(vec3 brainSource,vec3 logo,vec3 normal,vec3 seed,float piece,float p,float time,float base,float aspect,vec2 pointer){
 float morph=brainMorph(seed,p),forming=logoForm(seed,p),explode=separation(p),burst=logoBurst(p);
 // An opening vortex crosses the viewport instead of dwelling in a perfect ring.
 float angle=seed.x*6.283185+seed.z*8.4+time*(.12+seed.y*.10)-p*9.;
 // Dispersao reduzida depois da pupila (13/10): raio 1.70->1.45, profundidade 3.9->2.4.
 float radius=(.18+sqrt(seed.y)*1.45)*(1.-smoothstep(.14,.24,p)*.27);
 vec3 stream=vec3(cos(angle)*radius*max(1.,aspect),sin(angle)*radius*.48,(seed.z-.5)*2.4);
 stream.y+=sin(cos(angle)*2.2+time*.22-p*7.)*.46;
 float phase=time*.72+seed.y*6.283185;
 vec3 curl=vec3(sin(phase+brainSource.y*5.),cos(phase*.83+seed.z*3.),sin(phase*.7+2.));
 vec3 brain=separatePart(brainSource,piece,explode,time);
 // Sparse excursions have a continuous envelope: points leave and return without popping.
 float excursion=pow(clamp(.5+.5*sin(time*.55+seed.y*19.),0.,1.),5.);
 float roaming=step(.87,seed.x)*(.16+explode*.84)*excursion;
 brain+=(normal*(.06+seed.y*.12)+curl*.065)*roaming;
 brain+=curl*.004;
 // The second release is driven by scroll after the original orbit has finished.
 // Its zero state is exactly the original anatomy; no targets or colors are replaced.
 float reburst=clamp(uReburst,0.,1.)*morph*uSpatial;
 vec3 releaseDirection=finiteNormal(brainSource+normal*.18+curl*.075+vec3(.0001));
 brain+=reburst*(releaseDirection*(1.10+seed.y*.95)+curl*.055);
 brain+=separatePart(vec3(0.),piece,reburst*.45,time);
 vec3 settled=mix(logo,brain,morph);
 float arc=sin(morph*3.141593);
 settled+=vec3(-logo.y,logo.x,.16+seed.z*.16)*arc*.38+normal*arc*.08;
 vec3 direction=finiteNormal(vec3(logo.xy,(seed.z-.5)*.85)+vec3(.001));
 vec3 flight=direction*burst*(1.10+seed.y*.95);
 float swirl=burst*(.75+sin(time*.34+seed.z*6.)*.12);
 flight.xy=mat2(cos(swirl),sin(swirl),-sin(swirl),cos(swirl))*flight.xy;
 settled+=flight+curl*burst*.10;
 settled+=curl*.006*forming*(1.-morph);
 vec3 pos=particleRotation(p,morph,time,pointer)*mix(stream,settled,forming);
 float scale=sceneScale(base,aspect,explode)*mix(1.,mix(.90,1.16,smoothstep(.6,1.2,aspect)),morph);
 return pos*scale+vec3(0.,.18*forming,0.);
}
`,Kt=`
precision highp float;
varying vec2 vUv;
uniform sampler2D uPhoto;
uniform sampler2D uParticles;
uniform float uParticlePresence;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uTime;
uniform float uProgress;
uniform float uVelocity;
uniform vec4 uRipples[8];
uniform vec4 uJourney;
float hash(vec2 p){return fract(sin(dot(p,vec2(41.93,289.17)))*43758.5453123);}
float veil(vec2 p,float phase,float width){
 float line=p.y+sin(p.x*1.45+phase)*.23+sin(p.x*2.65-phase*.7)*.055;
 return exp(-line*line/width);
}
void main(){
 vec2 uv=vUv;float aspect=uResolution.x/uResolution.y;
 vec2 space=(uv-.5)*vec2(aspect,1.);
 float p=uProgress,t=uTime*.035;
 // Smooth, unbounded veils have no cell edges or rectangular noise patches.
 // Layers climb at different rates while the stage itself remains pinned.
 float descent=uJourney.z*uJourney.w;
 vec2 far=space+vec2(uPointer.x*.007,-p*.12-uPointer.y*.005-descent*.24);
 vec2 middle=space+vec2(uPointer.x*.014,-p*.31-uPointer.y*.010-descent*.61);
 vec2 near=space+vec2(uPointer.x*.027,-p*.58-uPointer.y*.017-descent*1.13);
 float a=veil(far+vec2(-.3,.08),t+1.3,.07);
 float b=veil(middle+vec2(.2,.18),-t*1.3+3.,.025);
 float c=veil(near+vec2(-.4,.43),t*.7+5.,.012);
 // Travel changes only the position of the original light profile and veils.
 // Every palette coefficient below is the unmodified source value.
 vec2 glowSpace=space-(uJourney.xy-.5)*vec2(aspect,1.)*uJourney.w;
 float centerGlow=exp(-dot(glowSpace*vec2(.75,1.),glowSpace*vec2(.75,1.))*2.4);
 vec3 atmosphere=vec3(.018,.052,.065)+vec3(.014,.035,.038)*centerGlow;
 atmosphere+=vec3(.034,.115,.107)*a*.45+vec3(.065,.110,.076)*b*.28+vec3(.030,.068,.077)*c*.20;
 atmosphere*=1.-smoothstep(.3,1.4,length(space))*.30;

 // All triggers share a wave equation and cap. Cursor events cannot stack into a stronger wave.
 vec2 displacement=vec2(0.);float strongest=0.;
 for(int i=0;i<8;i++){
  float age=uTime-uRipples[i].z;
  vec2 delta=(uv-uRipples[i].xy)*vec2(aspect,1.);
  float d=length(delta),front=d-age*.31;
  float envelope=exp(-front*front*90.)*exp(-age*.55)*smoothstep(0.,.09,age)*step(age,6.);
  float wave=sin(front*42.)*envelope*uRipples[i].w;
  if(abs(wave)>abs(strongest)){
   strongest=wave;
   displacement=normalize(delta+vec2(.0001))/vec2(aspect,1.)*wave*mix(.022,.0026,smoothstep(.14,.28,p));
  }
 }
 // A quiet wake continues into the particle field after the iris disappears.
 float d=length(space),entry=smoothstep(.10,.18,p)*(1.-smoothstep(.30,.48,p))*(1.-uJourney.w);
 float wake=sin(d*26.-(p-.12)*18.-uTime*.55)*exp(-d*2.6)*entry;
 displacement+=normalize(space+vec2(.0001))/vec2(aspect,1.)*wake*.0016;
 atmosphere+=vec3(.038,.092,.080)*(strongest*.45+wake*.23);
 atmosphere+=vec3(.025,.067,.068)*centerGlow*uVelocity*.08;

 // A small static lift clears the mobile headline; zoom and ripples keep this same pivot.
 float cover=aspect/(1200./673.);
 vec2 pupil=vec2(.555,.756);
 float approach=smoothstep(.025,.18,p);
 float initialZoom=mix(1.18,1.08,smoothstep(.6,1.3,aspect));
 float zoom=initialZoom*exp(approach*4.65);
 vec2 eyeCenter=vec2(.5,mix(.62,.66,smoothstep(.6,1.3,aspect)));
 vec2 sampleUv=uv+displacement-eyeCenter;
 if(cover<1.)sampleUv.x*=cover;
 else sampleUv.y/=cover;
 sampleUv=sampleUv/zoom+pupil;
 float chroma=length(displacement)*.007/zoom;
 // Blend the extended edge into the scene instead of enlarging the source to hide it.
 vec2 safeUv=clamp(sampleUv,.002,.998);
 float edge=smoothstep(.002,.06,sampleUv.x)*(1.-smoothstep(.94,.998,sampleUv.x));
 edge*=smoothstep(.002,.07,sampleUv.y)*(1.-smoothstep(.975,.998,sampleUv.y));
 vec3 photo=texture2D(uPhoto,safeUv).rgb;
 photo.r=texture2D(uPhoto,clamp(safeUv+vec2(chroma,0.),.002,.998)).r;
 photo.b=texture2D(uPhoto,clamp(safeUv-vec2(chroma,0.),.002,.998)).b;
 photo=mix(atmosphere,photo,edge);
 photo+=strongest*.028;
 float shade=mix(.22,.88,smoothstep(.18,.83,uv.y));
 photo*=mix(shade,.86,smoothstep(.02,.10,p));
 photo=mix(photo,photo*vec3(.78,.97,1.02),.20);
 // Enter a soft aperture before the source photograph runs out of iris resolution.
 float apertureRadius=.027*zoom;
 float irisDistance=length((uv-eyeCenter)*vec2(aspect,1.));
 float aperture=(1.-smoothstep(apertureRadius*.82,apertureRadius*1.16,irisDistance))*smoothstep(.045,.10,p);
 photo=mix(photo,atmosphere*.65,aperture);
 float transition=smoothstep(.13,.205,p);
 vec3 color=mix(photo,atmosphere,transition);
 // The wave distorts the incoming field too, rather than ending at the crossfade.
 vec2 fieldUv=clamp(uv+displacement*mix(.35,1.,transition),.001,.999);
 color+=texture2D(uParticles,fieldUv).rgb*uParticlePresence;
 // The atmosphere rises after the brain has completed all three turns.
 float lift=smoothstep(.955,1.,p),edgeY=mix(-.1,1.1,lift);
 float white=1.-smoothstep(edgeY-.025,edgeY+.025,uv.y);
 color=mix(color,vec3(.980392,.980392,.968627),white);
 float grain=(hash(gl_FragCoord.xy)-.5)*.005;
 gl_FragColor=vec4(max(color+grain,vec3(0.)),1.);
}`,vr=`
attribute vec3 aLogo;attribute vec3 aBrain;attribute vec3 aSeed;attribute vec3 aNormal;
attribute float aPiece;attribute float aCavity;
attribute vec2 aStateUv;
uniform float uTime;uniform float uProgress;uniform float uScale;uniform float uAspect;uniform float uVelocity;
uniform vec2 uPointer;
uniform sampler2D uState;uniform float uDynamics;uniform float uRepel;uniform float uDefocus;uniform float uStretch;uniform float uGain;
uniform float uLightningPhase;uniform float uLightningGate;uniform float uViewportHeight;uniform float uDive;
varying vec2 vUv;varying vec3 vColor;varying float vAlpha;varying float vSoft;
${qe}
void main(){
 vUv=uv;float p=uProgress;
 float morph=brainMorph(aSeed,p);
 float explode=separation(p);
 float forming=logoForm(aSeed,p),burst=logoBurst(p);
 float roaming=step(.87,aSeed.x)*(.16+explode*.84);
 mat3 rotation=particleRotation(p,morph,uTime,uPointer);
 float scale=sceneScale(uScale,uAspect,explode)*mix(1.,mix(.90,1.16,smoothstep(.6,1.2,uAspect)),morph);
 vec3 target=particleTarget(aBrain,aLogo,aNormal,aSeed,aPiece,p,uTime,uScale,uAspect,uPointer);
 vec3 pos=mix(target,texture2D(uState,aStateUv).xyz,uDynamics);
 vec4 view=modelViewMatrix*vec4(pos,1.);
 // Keep the cerebral release exact; a rare cohort also gives the opening logo depth.
 float release=clamp(uReburst,0.,1.)*morph*uSpatial;
 float nearGrain=smoothstep(.96,.995,aSeed.x);
 float logoRelease=clamp(burst*(1.-morph)*forming*uSpatial,0.,1.);
 float logoGrain=logoRelease*nearGrain;
 float visualRelease=max(release,logoGrain);
 float releaseEnvelope=smoothstep(0.,.025,visualRelease);
 float releaseNear=mix(1.3,.20,clamp(uDive,0.,1.));
 view.z=mix(view.z,min(-releaseNear,view.z+nearGrain*(release*1.4+logoRelease*.8)),releaseEnvelope);
 // Analytic repulsion remains available on devices without floating-point render targets.
 vec4 projected=projectionMatrix*view;
 float perspectiveDepth=projected.w<0.?min(projected.w,-.0001):max(projected.w,.0001);
 vec2 delta=(projected.xy/perspectiveDepth-vec2(uPointer.x,-uPointer.y))*vec2(uAspect,1.);
 vec2 repel=normalize(delta+vec2(.001))*exp(-dot(delta,delta)/.052)*uRepel;
 view.xy+=repel*.125*(1.-uDynamics);
 float depth=clamp((pos.z+.7)/1.4,0.,1.);
 float defocus=((1.-forming)*abs(pos.z)*.0024+morph*abs(pos.z-.15)*.0013)*uDefocus;
 float size=(mix(.0051,.0028,forming)+aSeed.z*aSeed.z*mix(.0068,.0051,forming)+defocus)*mix(.78,1.25,depth)*scale;
 float releaseSize=min(.041,.006+aSeed.z*aSeed.z*.010+nearGrain*.024)*scale;
 size=mix(size,releaseSize,visualRelease);
 float stretchX=1.+burst*.65+uVelocity*mix(.35,.09,forming)*uStretch;
 // Limit the rare nearest billboards in screen pixels, leaving the normal scene exact.
 float pixelLimit=mix(12.,18.,smoothstep(.6,1.2,uAspect));
 pixelLimit=mix(pixelLimit,mix(10.,16.,smoothstep(.6,1.2,uAspect)),logoGrain);
 float sizeLimit=pixelLimit*2.*max(releaseNear,-view.z)/(projectionMatrix[1][1]*max(1.,uViewportHeight)*max(1.,stretchX));
 size=mix(size,min(size,sizeLimit),releaseEnvelope);
 vec2 billboard=position.xy*size;
 billboard.x*=stretchX;
 view.xy+=billboard;
 gl_Position=projectionMatrix*view;
 // A shallow embossed normal gives the logo the same key/rim light as the anatomy.
 // Its original XY silhouette and the anatomical normals remain untouched.
 float dome=sqrt(1.-clamp(dot(aLogo.xy,aLogo.xy)*1.4,0.,1.));
 vec3 logoNormal=normalize(vec3(aLogo.xy*.90,.30+dome*.35+aLogo.z*.55));
 vec3 n=finiteNormal(rotation*mix(aNormal,logoNormal,(1.-morph)*uSpatial));
 float front=smoothstep(-.3,.65,n.z);
 float key=max(0.,dot(n,normalize(vec3(-.55,.85,1.))));
 float rim=pow(clamp(1.-abs(n.z),0.,1.),2.5);
 float volumetric=mix(morph,forming,uSpatial);
 float light=mix(.72+aSeed.y*.28,.46+key*.75+rim*.48,volumetric);
 light*=mix(1.,1.-aCavity*.50,morph);
 float tone=clamp(pos.y*.85+.52,0.,1.);
 vColor=mix(vec3(.30,.69,.73),vec3(.87,.89,.69),tone)*light;
 vColor+=vec3(.50,.62,.48)*pow(aSeed.z,32.);
 vColor*=mix(.6,1.25,smoothstep(.12,.94,aSeed.y));
 // Slow continuous light currents, never per-frame random flicker.
 float currentPhase=mix(uTime*.60+p*8.,uLightningPhase,uSpatial);
 float current=pow(clamp(.5+.5*sin(dot(aBrain,vec3(9.,12.,5.))-currentPhase),0.,1.),8.);
 vColor*=1.18+current*morph*.28*mix(1.,uLightningGate,uSpatial);
 float arrival=mix(p,mix(.14,.335,uAssembly),uBrainEntry);
 vAlpha=smoothstep(.115,.19,arrival)*(.50+depth*.37)*mix(1.,.50+front*.50,morph);
 vAlpha*=mix(1.35,1.,smoothstep(.6,1.2,uAspect));
 float streamDensity=.78*step(.28,fract(aSeed.x*71.+aSeed.y*29.));
 vAlpha*=mix(streamDensity,1.,forming);
 vAlpha*=mix(1.,.65,roaming);
 // Restraint belongs to the pupil's incoming field; the assembled logo keeps its original light.
 vColor*=mix(.90,1.,forming);
 vAlpha*=1.-smoothstep(.935,.985,p);
 // Modo leve: compensa o brilho perdido (sem bloom e com menos particulas) sem custo de pixel.
 vAlpha*=uGain;
 vSoft=mix(defocus*50.,.45+.45*nearGrain,release);
 vSoft=mix(vSoft,.45+.45*nearGrain,logoGrain);
 vColor*=1.+.35*logoGrain;
 vAlpha*=1.+.08*logoGrain;
}`,Qt=`
precision highp float;
varying vec2 vUv;varying vec3 vColor;varying float vAlpha;varying float vSoft;
uniform float uObjectPresence;
void main(){float d=length(vUv-.5)*2.;if(d>1.)discard;
float core=exp(-d*d*mix(11.,3.7,clamp(vSoft,0.,1.)));float halo=exp(-d*d*2.)*.045;
float alpha=(core+halo)*(1.-smoothstep(.7,1.,d))*vAlpha;
gl_FragColor=vec4(vColor,alpha*uObjectPresence);}`,gr=`
attribute vec3 aSeed;
uniform float uTime;uniform float uProgress;uniform float uAspect;uniform float uVelocity;uniform float uStretch;
uniform vec4 uJourney;
uniform vec2 uPointer;
varying vec2 vUv;varying vec3 vColor;varying float vAlpha;varying float vSoft;
void main(){
 vUv=uv;
 float layer=fract(aSeed.z+uProgress*.32+uTime*.007+uJourney.z*uJourney.w*.65);
 float z=mix(-5.,1.9,layer),distance=4.-z;
 float vertical=fract(aSeed.y+uProgress*(.055+layer*.13)+uTime*.002+uJourney.z*uJourney.w*(.14+layer*.25));
 vec2 screen=vec2(aSeed.x-.5,vertical-.5);
 screen.x+=sin(aSeed.y*6.+uTime*.055+uProgress*1.4)*.022;
 screen+=uPointer*vec2(-.006,.006)*layer;
 vec3 pos=vec3(screen.x*distance*.79*uAspect,screen.y*distance*.79,z);
 vec4 view=modelViewMatrix*vec4(pos,1.);
 float rare=smoothstep(.96,1.,aSeed.x);
 float entrance=1.-smoothstep(.185,.285,uProgress);
 float size=mix(.003,.009,layer)+rare*layer*layer*mix(.032,.016,entrance);
 view.xy+=position.xy*size*vec2(1.,1.+uVelocity*.25*uStretch);
 gl_Position=projectionMatrix*view;
 float depthFade=smoothstep(0.,.13,layer)*(1.-smoothstep(.85,1.,layer));
 float edgeFade=smoothstep(0.,.06,vertical)*(1.-smoothstep(.94,1.,vertical));
 vAlpha=smoothstep(.09,.27,uProgress)*depthFade*edgeFade*mix(.17,.38,layer)*mix(1.,.40,rare);
 vAlpha*=mix(1.,.80,entrance);
 vAlpha*=1.-smoothstep(.905,.95,mix(uProgress,.335,uJourney.w));
 vColor=mix(vec3(.22,.48,.49),vec3(.60,.69,.49),aSeed.z);
 vSoft=rare*.8+layer*.2;
}`,eo=`
attribute float aPiece;attribute vec3 aNormal;attribute float aCavity;
uniform float uTime;uniform float uProgress;uniform float uScale;uniform float uAspect;uniform float uOcclusion;uniform vec2 uPointer;
varying vec3 vNormal;varying float vReveal;varying float vCavity;varying float vPiece;
mat3 turnY(float a){return mat3(cos(a),0.,-sin(a),0.,1.,0.,sin(a),0.,cos(a));}
mat3 turnX(float a){return mat3(1.,0.,0.,0.,cos(a),sin(a),0.,-sin(a),cos(a));}
${dr}
void main(){
 float explode=separation(uProgress);
 vec3 p=separatePart(position,aPiece,explode,uTime);
 p*=mix(1.,smoothstep(.58,.635,uProgress),uOcclusion);
 mat3 rotation=turnY(orbit(uProgress)-1.05+uPointer.x*.035+sin(uTime*.25)*explode*.055)*turnX(-.08+uPointer.y*.018);
 p=rotation*p;vNormal=normalize(rotation*aNormal);vReveal=smoothstep(.635,.675,uProgress)*(1.-smoothstep(.935,.985,uProgress));vCavity=aCavity;vPiece=aPiece;
 vReveal*=mix(1.,smoothstep(.82,1.,uAssembly),uBrainEntry);
 vReveal*=1.-clamp(uReturnLogo,0.,1.);
 float scale=sceneScale(uScale,uAspect,explode)*mix(.90,1.16,smoothstep(.6,1.2,uAspect));
 vec4 view=modelViewMatrix*vec4(p*scale+vec3(0.,.18*uSpatial,0.),1.);view.y+=.18*(1.-uSpatial);
 gl_Position=projectionMatrix*view;
 gl_Position.z+=.0015*gl_Position.w*uOcclusion;
}`,br=`
precision highp float;varying vec3 vNormal;varying float vReveal;varying float vCavity;varying float vPiece;
uniform float uReburst;uniform float uObjectPresence;
void main(){
 vec3 n=vNormal*inversesqrt(max(dot(vNormal,vNormal),.00000001));
 float rim=pow(clamp(1.-abs(n.z),0.,1.),2.5),key=max(0.,dot(n,normalize(vec3(-.55,.85,1.))));
 float inner=step(2.5,vPiece),front=smoothstep(-.2,.65,n.z);
 vec3 color=mix(vec3(.18,.43,.44),vec3(.69,.78,.60),clamp(rim*.65+inner*.4,0.,1.));
 color*=1.-vCavity*.48;
 float alpha=(.045+key*.06+rim*.17+inner*.045)*vReveal*(.6+front*.4);
 alpha*=1.-smoothstep(.015,.16,uReburst);
 gl_FragColor=vec4(color,alpha*uObjectPresence);
}`;var ba=`
precision highp float;
uniform sampler2D uPrevious,uBrain,uLogo,uNormal,uSeed;
uniform vec2 uSize,uPointer;
uniform mat4 uProjection,uModelView;
uniform float uTime,uProgress,uScale,uAspect,uRepel,uDelta,uReset,uCount;
${qe}
void main(){
 float row=mod(gl_FragCoord.y,uSize.y);
 if(floor(row)*uSize.x+floor(gl_FragCoord.x)>=uCount){gl_FragColor=vec4(0.);return;}
 vec2 dataUv=vec2(gl_FragCoord.x,row)/uSize;
 vec2 positionUv=vec2(dataUv.x,dataUv.y*.5);
 vec4 source=texture2D(uBrain,dataUv);
 vec3 seed=texture2D(uSeed,dataUv).xyz;
 vec3 goal=particleTarget(source.xyz,texture2D(uLogo,dataUv).xyz,texture2D(uNormal,dataUv).xyz,seed,source.w,uProgress,uTime,uScale,uAspect,uPointer);
 // Repulsion is evaluated in screen space, then spring attraction restores the silhouette.
 vec4 clip=uProjection*uModelView*vec4(goal,1.);
 float perspectiveDepth=clip.w<0.?min(clip.w,-.0001):max(clip.w,.0001);
 vec2 delta=(clip.xy/perspectiveDepth-vec2(uPointer.x,-uPointer.y))*vec2(uAspect,1.);
 float falloff=exp(-dot(delta,delta)/.052)*uRepel;
 vec2 direction=normalize(delta+vec2(.0001));
 goal.xy+=direction*.13*falloff;
 goal.z+=falloff*.05;
 vec4 previous=texture2D(uPrevious,positionUv);
 vec3 oldPosition=previous.xyz;
 vec3 oldVelocity=texture2D(uPrevious,positionUv+vec2(0.,.5)).xyz;
 float morph=brainMorph(seed,uProgress);
 float stiffness=mix(90.,170.,morph)*mix(.82,1.15,seed.y);
 float omega=sqrt(stiffness),damping=mix(.74,.88,morph);
 float frequency=omega*sqrt(1.-damping*damping),t=uDelta;
 float envelope=exp(-damping*omega*t),c=cos(frequency*t),s=sin(frequency*t);
 vec3 distance=oldPosition-goal;
 vec3 nextPosition=goal+envelope*(distance*c+(oldVelocity+damping*omega*distance)*(s/frequency));
 vec3 nextVelocity=envelope*(oldVelocity*c-(damping*omega*oldVelocity+omega*omega*distance)*(s/frequency));
 float reset=max(uReset,1.-step(.5,previous.w));
 nextPosition=mix(nextPosition,goal,reset);nextVelocity*=1.-reset;
 gl_FragColor=vec4(gl_FragCoord.y<uSize.y?nextPosition:nextVelocity,1.);
}`;function xr(e,o,r,t,i,a){let p=Math.ceil(t/256),m=new Float32Array(t*2);for(let C=0;C<t;C++)m[C*2]=(C%256+.5)/256,m[C*2+1]=(Math.floor(C/256)+.5)/(p*2);if(!o.extensions.has("EXT_color_buffer_float"))return{uv:m,enabled:!1,texture:null,step:(C,c)=>null,reset:()=>{},dispose:()=>{}};let s=[],d=(C,c)=>{let E=new Float32Array(256*p*4);for(let Z=0;Z<t;Z++)E.set(C.subarray(Z*3,Z*3+3),Z*4),E[Z*4+3]=c?c[Z]:1;let k=new e.DataTexture(E,256,p,e.RGBAFormat,e.FloatType);return k.minFilter=e.NearestFilter,k.magFilter=e.NearestFilter,k.needsUpdate=!0,s.push(k),k},A={type:e.FloatType,format:e.RGBAFormat,minFilter:e.NearestFilter,magFilter:e.NearestFilter,depthBuffer:!1,stencilBuffer:!1},h=new e.WebGLRenderTarget(256,p*2,A),y=h.clone(),v={...a,uPrevious:{value:h.texture},uBrain:{value:d(i.brain,i.piece)},uLogo:{value:d(i.logo)},uNormal:{value:d(i.normal)},uSeed:{value:d(i.seed)},uSize:{value:new e.Vector2(256,p)},uProjection:{value:r.projectionMatrix},uDelta:{value:1/60},uReset:{value:1},uCount:{value:t}},P=new e.ShaderMaterial({uniforms:v,vertexShader:gt,fragmentShader:ba,depthTest:!1,depthWrite:!1,blending:e.NoBlending}),U=new e.PlaneGeometry(2,2),B=new e.Scene,J=new e.Camera;return B.add(new e.Mesh(U,P)),o.compile(B,J),{uv:m,enabled:!0,texture:h.texture,reset:()=>{v.uReset.value=1},step:(C,c)=>(v.uCount.value=c,v.uPrevious.value=h.texture,v.uDelta.value=Math.min(C,.05),o.setRenderTarget(y),o.render(B,J),[h,y]=[y,h],v.uReset.value=0,h.texture),dispose:()=>{h.dispose(),y.dispose(),s.forEach(C=>C.dispose()),P.dispose(),U.dispose()}}}var xa=["/data/cooking-obj/points.bin","/data/cooking-obj/surface.bin","/data/cooking-obj/indices.bin"],ya=["/data/cooking-obj/points-70k.pack","/data/cooking-obj/surface.pack","/data/cooking-obj/indices.pack"],wa=["/data/cooking-obj/points-40k.pack","/data/cooking-obj/surface-lite.pack","/data/cooking-obj/indices-lite.pack"],Pa=()=>typeof matchMedia=="function"&&(matchMedia("(pointer: coarse)").matches||innerWidth<768);async function yr(e,o){let r=await fetch(e,{signal:o});if(!r.ok)throw Error("Particle data");return r.arrayBuffer()}async function Ma(e){let o=new Uint8Array(e);if(o[0]!==31||o[1]!==139)return e;let r=new Blob([e]).stream().pipeThrough(new DecompressionStream("gzip"));return new Response(r).arrayBuffer()}function wr(e,o){let r=new Uint8Array(e),t=r.length/2,i=t/o,a=new Int16Array(t);for(let l=0;l<o;l++){let p=l*i,m=t+l*i;for(let s=0;s<i;s++)a[s*o+l]=(r[p+s]|r[m+s]<<8)<<16>>16}return a.buffer}function Sa(e){let o=new Uint8Array(e),r=o.length/4,t=new Uint32Array(r),i=0;for(let a=0;a<r;a++){let l=(o[a]|o[r+a]<<8|o[2*r+a]<<16|o[3*r+a]<<24)>>>0;i=i+(l>>>1^-(l&1))|0,t[a]=i>>>0}return t.buffer}async function Pr(e){if(typeof DecompressionStream<"u")try{let[o,r,t]=await Promise.all((Pa()?wa:ya).map(async i=>Ma(await yr(i,e))));return[wr(o,8),wr(r,8),Sa(t)]}catch(o){if(e.aborted)throw o}return Promise.all(xa.map(o=>yr(o,e)))}function Mr(e){let o=typeof process<"u"&&!1,r=t=>{e.dataset.webglFailure=t.statusMessage||"WebGL context creation failed"};o&&e.addEventListener("webglcontextcreationerror",r);try{let t=e.getContext("webgl2",{alpha:!0,depth:!0,stencil:!1,antialias:!1,premultipliedAlpha:!0,preserveDrawingBuffer:!1,powerPreference:"high-performance",failIfMajorPerformanceCaveat:!1}),i=t&&!t.isContextLost();return o&&(e.dataset.webglStatus=i?"available":t?"lost":"unavailable"),i?t:null}catch(t){return o&&(e.dataset.webglStatus="unavailable",e.dataset.webglFailure=t instanceof Error?t.message:"WebGL request failed"),null}finally{o&&e.removeEventListener("webglcontextcreationerror",r)}}function Sr(){let e=null,o=null;return{request(r,t,i){if(![r,t,i].every(Number.isFinite)||r<1||t<1||i<=0)return;let a={width:Math.round(r),height:Math.round(t),ratio:i};o=e&&e.width===a.width&&e.height===a.height&&e.ratio===a.ratio?null:a},apply(r){if(!o)return!1;let t=o;return o=null,r(t),e=t,!0}}}var Ar=[{bloom:!0,particles:4e4,dust:4500,composerRatio:1,gain:1},{bloom:!0,particles:4e4,dust:4500,composerRatio:.75,gain:1},{bloom:!1,particles:24e3,dust:2500,composerRatio:1,gain:1.6},{bloom:!1,particles:14e3,dust:1500,composerRatio:1,gain:1.6}];function Cr(e,o){if(typeof o=="number"&&o<4)return 2;let r=/Adreno\D*(\d{3})/i.exec(e);return/Apple.*GPU|Apple M\d|Mali-G7\d|Mali-G6\d0|Immortalis/i.test(e)||r&&Number(r[1])>=640?0:1}function Lr(){let e=0,o=0;return{sample(r,t){if(!t)return e=o=0,!1;if(r<=0||r>100||(o+=r,++e<40))return!1;let i=o/e>21;return e=o=0,i}}}var Fe=(e,o,r)=>{let t=Math.max(0,Math.min(1,(r-e)/(o-e)));return t*t*(3-2*t)};function $e(e,o){return Math.max(Fe(0,2.1,o),Fe(0,.18,e))}function bt(e,o,r=0){let t=$e(o,r);return e==="symbol-formation"?.14+.195*t:e==="brain-formation"?.675+.255*Fe(.12,.94,o):e==="immersion-formation"?.14+.195*t+.595*Fe(.35,.78,o):e==="symbol"?.335+.065*Fe(.25,.8,o):e==="brain"?.635+.295*o:o}function to(e,o){if(e.endsWith("-formation"))return .335;let r=bt(e,o);return e==="complete"?r:r+(1-r)*Fe(.93,1,o)}function zr(e,o){return e.endsWith("-formation")||e==="complete"?1:1-Fe(e==="brain"?.92:.65,1,o)}var Aa=e=>Math.max(0,Math.min(1,e));function Fr(e,o,r){return Aa((e-o*.92)/Math.max(1,r-o*.92))}var oo=e=>Math.max(0,Math.min(1,e)),ae=(e,o,r)=>{let t=oo((r-e)/(o-e));return t*t*t*(t*(t*6-15)+10)},Ke=()=>({x:0,y:0,z:0,rx:0,ry:0,rz:0,cameraX:0,cameraY:0,cameraZ:0,reburst:0}),ro=e=>ae(.24,.46,e)*(1-ae(.7,.96,e)),Ca=(e,o,r)=>{let t=oo((r-e)/(o-e));return t*t*(3-2*t)};function Er(e,o,r=Ke(),t=o?.46:1.6){let i=ae(0,1,oo(e)),a=i*Math.PI*2,l=o?0:ae(.75,1.45,t),p=ro(e),m=Math.sin(a),s=1-Math.cos(a),d=.6+.4*l,A=o?.1:1.3-.6*(1-Ca(.8,1.45,t));r.x=(.096+.204*l)*m*(1-.75*p)-A*p,r.y=-(.11+.05*l)*s+(.04+.04*l)*i,r.z=(.1+.18*l)*s+(.1+.24*l)*i,r.rx=(.46*m+.12*i)*d,r.ry=Math.PI*1.1*i*(.72+.28*l),r.rz=(-.26*s+.08*i)*d,r.cameraX=-.1*m*(.32+.68*l),r.cameraY=.06*m*d;let h=(.85+.85*l)*ae(0,.18,e)*(1-ae(.4,.65,e)),y=o?0:.35*(1-l)*i,v=.2*(1-l)*ae(.55,.72,e)*(1-ae(.86,1,e)),P=o?.28*ae(.72,.86,e)*(1-ae(.95,1,e)):0;return r.cameraZ=-(.08+.14*l)*s+(.08-.26*l)*i+h+y-v+(o?.3*p:0)-P,r.reburst=0,r}function Rr(e,o,r=Ke()){return r.x=r.y=r.z=r.rx=r.ry=r.rz=0,r.cameraX=r.cameraY=r.cameraZ=0,r.reburst=0,r}var xt=e=>Math.max(0,Math.min(1,e)),no=(e,o,r)=>{let t=xt((r-e)/(o-e));return t*t*(3-2*t)};function io(e){let o=xt(e);return .5*no(.55,.67,o)+.5*no(.67,.88,o)}var so=()=>({x:0,y:0,z:0,rx:0,ry:0,rz:0,cameraZ:0,center:0}),ao=(e,o,r)=>{let t=xt((r-e)/(o-e));return t*t*t*(t*(t*6-15)+10)};function Br(e,o,r,t=so()){let i=xt(e),a=ao(.025,.7,i),l=Math.sin(Math.PI*a),p=ao(.12,.65,i)*(1-no(.08,.68,o));t.rx=.36*Math.sin(a*Math.PI*2),t.ry=a*Math.PI*2,t.rz=-.22*l;let m=Math.sin(t.rx),s=Math.cos(t.rx),d=Math.sin(t.ry),A=Math.cos(t.ry),h=Math.sin(t.rz),y=Math.cos(t.rz);return t.x=.18*A*h,t.y=.18-.18*(s*y-m*d*h),t.z=-.18*(m*y+s*d*h)+(r?.38:.8)*p,t.cameraZ=-(r?.18:.3)*p,t.center=ao(.08,.58,i),t}function Tr(e,o,r){let t=8.24*Math.tan(38*Math.PI/360),i=Math.min(164,Math.max(144,o*.18)),a=Math.max(i+120,r-28),l=(i+a)/2,p=Math.min(1,(a-i)*t/o/1.18,e*.78*t/o/1.18);return{y:(.5-l/o)*t-.18,scale:p}}var Ir=e=>Math.max(0,Math.min(1,e));function lo(e){let o=Ir(e);return o===0||o===1?o:o+.005*Math.sin(o*Math.PI*8)}function Qe(e,o,r,t){let i=t?2.45:2.6,a=e<0?e/Math.max(1,o):lo(e/Math.max(1,r))*(i-1);return Ir((a+.85)/(i-.2))}var co=e=>Math.max(0,Math.min(1,e)),me=(e,o,r)=>{let t=co((r-e)/(o-e));return co(t*t*t*(t*(t*6-15)+10))},yt=()=>({center:0,dive:0,visibility:1,morph:0,pose:0,ambient:1,lightning:1,synapses:1});var uo=e=>co(e)*1.4166666666666667;function mo(e,o=yt()){let r=uo(e);return o.center=me(0,.18,r),o.dive=me(.18,.55,r)*(1-me(.5,.7,r)),o.visibility=1-me(.18,.5,r),o.morph=0,o.pose=0,o.ambient=1-.72*me(0,.18,r)+.72*me(.22,.58,r),o.lightning=1-me(0,.18,r),o.synapses=o.lightning,o}function Ur(e){let o=e/(Math.PI*2),r=o-Math.floor(o);return me(.72,.78,r)*(1-me(.82,.9,r))}var wt=e=>Math.max(0,Math.min(1,e)),Nr=(e,o,r)=>{let t=wt((r-e)/(o-e));return wt(t*t*t*(t*(t*6-15)+10))};function Dr(e){return Nr(.75,.92,e)}function Vr(e){return 1-Nr(.24,.42,e)}var Pt=-.2,kr=.205,po=e=>wt((e-Pt)/(kr-Pt)),fo=e=>[.055*Math.sin(e*Math.PI*1.6)*e+.025*e*e,Pt+(kr-Pt)*e,.016*Math.sin(e*Math.PI*.9)*e],La=(e,o,r,t,i)=>{let a=(1-i)**3,l=3*(1-i)**2*i,p=3*(1-i)*i*i,m=i**3;return[e[0]*a+o[0]*l+r[0]*p+t[0]*m,e[1]*a+o[1]*l+r[1]*p+t[1]*m,e[2]*a+o[2]*l+r[2]*p+t[2]*m]};function Gr(){let e=new Float32Array(2451),o=new Float32Array(817),r=new Float32Array(817*3),t=new Float32Array(817),i=new Float32Array(817),a=[-.14,-.086,-.025,.032,.094,.125],l=[.15,.125,.155,.11,.1,.065],p=[.08,.115,.077,.113,.068,.07],m=0,s=(d,A,h=d,y=0,v=0)=>{e.set(d,m*3),r.set(h,m*3),o[m]=wt(A),t[m]=y,i[m++]=v};for(let d=0;d<6;d++){for(let E=0;E<40;E++){let k=(d+E/39)/6;s(fo(k),k)}let A=d%2===0?-1:1,h=fo(po(a[d])),y=[h[0]+A*l[d],a[d]+p[d],h[2]+A*.012],v=y[0]-h[0],P=y[1]-h[1],U=Math.hypot(v,P),B=-P*A/U,J=Math.abs(v)/U,C=po(a[d]),c=Math.min(.9,po(y[1]));for(let E of[0,1]){let k=E===0?y:[h[0]+v*.82+B*.025,h[1]+P*.82+J*.025,y[2]-.016],Z=[h[0]+v*.22-B*.018,h[1]+P*.22-J*.018,h[2]+A*.012],Ct=[h[0]+v*.7+B*(.037+E*.015),h[1]+P*.7+J*(.037+E*.015),k[2]+.01];for(let we=0;we<48;we++){let ie=we/47,L=E===1&&we>=36&&we%3===0?1:0;s(La(h,Z,Ct,k,ie),C+(c-C)*ie,h,ie,L)}}}return s(fo(0),0),{positions:e,paths:o,roots:r,flex:t,flows:i}}var $a=Math.hypot(.028,.018,.024);var Or=`
vec3 organicCultivation(vec3 point,vec3 root,float flex,float path,vec3 seed,float time){
 float height=clamp((root.y+.20)/.405,0.,1.);
 float heightWeight=height*height*(.75+.25*height);
 vec3 spine=vec3(
  .019*sin(time*.43+height*2.4)+.006*sin(time*.23-height*3.8),
  .0025*sin(time*.31+height*2.2),
  .014*sin(time*.37+height*2.7+.6)+.005*cos(time*.19-height*3.1)
 )*heightWeight;
 float leafFlex=clamp(flex,0.,1.),bendWeight=leafFlex*(.45+.55*leafFlex);
 float branchPhase=seed.x*6.28318530718;
 float angleX=(.10*sin(time*.63+branchPhase)+.035*sin(time*.29-branchPhase*.5))*bendWeight;
 float angleY=.08*sin(time*.41-branchPhase+.65)*bendWeight;
 float angleZ=.06*sin(time*.53+branchPhase*.7+1.1)*bendWeight;
 vec3 local=point-root;
 vec3 bent=local*(1.+.018*sin(time*.48+branchPhase)*leafFlex);
 bent.yz=mat2(cos(angleX),sin(angleX),-sin(angleX),cos(angleX))*bent.yz;
 bent.xz=mat2(cos(angleY),-sin(angleY),sin(angleY),cos(angleY))*bent.xz;
 bent.xy=mat2(cos(angleZ),sin(angleZ),-sin(angleZ),cos(angleZ))*bent.xy;
 float wanderPhase=seed.y*6.28318530718+seed.z*3.7+path*2.1;
 float wanderWeight=leafFlex*leafFlex*(.35+.65*height);
 vec3 wander=vec3(
  .0015*sin(time*.27+wanderPhase),
  .0012*sin(time*.23+wanderPhase*1.3),
  .0020*sin(time*.19+wanderPhase*.7)
 )*wanderWeight;
 vec3 displacement=spine+bent-local+wander;
 displacement*=inversesqrt(1.+dot(displacement,displacement)/(.048*.048));
 return point+displacement;
}
vec3 floatingCultivation(vec3 seed,float time){
 float phase=seed.z*6.28318530718;
 float envelope=pow(clamp(.5+.5*sin(time*.36+phase),0.,1.),2.);
 return vec3(
  .028*sin(time*.30+phase),
  .018*cos(time*.25+seed.x*8.),
  .024*sin(time*.20+seed.y*5.)
 )*envelope;
}
`;var St=[.25,.22,.22],At=6,Mt=At*136+1;var Yr=e=>{let o=Math.hypot(...e.map((t,i)=>t/St[i])),r=o>.94?.94/o:1;return[e[0]*r,e[1]*r,e[2]*r]},et=(e,o,r)=>Yr([Math.cos(e)*St[0]*o,Math.sin(e)*St[1]*o,r*St[2]]),za=(e,o,r,t)=>{let i=(1-t)**2,a=2*(1-t)*t,l=t*t;return[e[0]*i+o[0]*a+r[0]*l,e[1]*i+o[1]*a+r[1]*l,e[2]*i+o[2]*a+r[2]*l]};function Fa(){let e=new Float32Array(Mt*3),o=new Float32Array(Mt),r=new Float32Array(Mt*3),t=new Float32Array(Mt),i=0,a=(l,p,m,s,d,A,h)=>{for(let y=0;y<s;y++){let v=y/(s-1),P=za(l,p,m,v),U=Math.sin(v*Math.PI),B=h*1.73+d*4.1,J=Yr([P[0]+Math.sin(v*37+B)*.009*U,P[1]+Math.sin(v*29-B)*.008*U,P[2]+Math.sin(v*31+B)*.006*U]);e.set(J,i*3),o[i]=d+(A-d)*v,r.set([(h+.5)/At,v,(i*37+h*13)%101/101],i*3),i++}};for(let l=0;l<At;l++){let p=l/At*Math.PI*2+.23,m=et(p+.65,.055,.035*Math.sin(p)),s=et(p,.4,Math.sin(p*2+.4)*.23),d=et(p-.22,.2,Math.sin(p*2)*.12);a(m,d,s,40,0,.42,l);for(let A of[-1,1]){let h=et(p+A*.27,.84,Math.sin(p*2+A*.55)*.46),y=et(p+A*.43,.62,Math.sin(p*2+A*.27)*.37);a(s,y,h,48,.42,1,l)}}return e.set([0,-.015,0],i*3),r.set([.5,.5,.5],i*3),t[i]=1,i++,{count:i,positions:e,paths:o,seeds:r,kinds:t}}var Ea=`
attribute vec3 aCorePosition;
attribute vec3 aSeed;
attribute float aPath;
attribute float aKind;
attribute vec3 aPlantPosition;
attribute float aPlantPath;
attribute vec3 aPlantRoot;
attribute float aPlantFlex;
attribute float aPlantFlow;
uniform float uTime,uProgress,uScale,uAspect;
uniform vec2 uPointer;
uniform float uLightningPhase,uLightningGate;
uniform float uCultivation,uSynapsePresence;
varying vec2 vUv;
varying vec3 vColor;
varying float vAlpha;
varying float vSoft;
varying float vCore;
${qe}
${Or}
void main(){
 vUv=uv;vCore=aKind;
 float morph=brainMorph(aSeed,uProgress),apart=separation(uProgress);
 float cultivation=clamp(uCultivation,0.,1.);
 float coreBlend=smoothstep(0.,.45,cultivation);
 float phase=fract(uLightningPhase/6.28318530718);
 // A wider single discharge lets the viewer read the branching light during the turn.
 float discharge=smoothstep(.10,.24,phase)*(1.-smoothstep(.76,.92,phase));
 float front=clamp((phase-.24)/.52,0.,1.);
 float deltaAlongPath=(aPath-front)/.16;
 float pulse=exp(-deltaAlongPath*deltaAlongPath);
 float activation=morph*uSpatial*smoothstep(.63,.70,uProgress);
 activation*=smoothstep(.82,1.,uAssembly);
 activation*=1.-.30*smoothstep(.02,.80,apart);
 activation*=1.-smoothstep(.01,.20,uReburst);
 activation*=uSynapsePresence;
 float scale=sceneScale(uScale,uAspect,apart)*mix(.90,1.16,smoothstep(.6,1.2,uAspect));
 vec3 core=particleRotation(uProgress,morph,uTime,uPointer)*aCorePosition;
 vec3 target=core*scale+vec3(0.,.18,0.);
 vec4 view=modelViewMatrix*vec4(target,1.);
 // Rooted flex and a small drifting tip cohort keep the luminous growth alive.
 vec4 plantAnchor=modelViewMatrix*vec4(0.,.18,0.,1.);
 vec3 organicPoint=aPlantPosition;
 if(cultivation>0.){
  organicPoint=organicCultivation(aPlantPosition,aPlantRoot,aPlantFlex,aPlantPath,aSeed,uTime);
  organicPoint+=floatingCultivation(aSeed,uTime)*aPlantFlow;
 }
 vec4 plantView=plantAnchor+vec4(organicPoint*scale,0.);
 view=mix(view,plantView,cultivation);
 float organicSize=mix(.007+aSeed.z*.0025,.0055+aSeed.z*.003,aPlantFlow);
 float branchSize=mix(.016+aSeed.z*.006,organicSize,cultivation);
 float coreSize=mix(.25+discharge*.06,.055,coreBlend);
 float size=mix(branchSize,coreSize,aKind)*scale;
 view.xy+=position.xy*size;
 gl_Position=projectionMatrix*view;
 vec3 sourceColor=mix(vec3(.30,.69,.73),vec3(.87,.89,.69),.28+aSeed.z*.52);
 // Local HDR energy crosses the existing bloom threshold, without raising the scene light.
 float plantDelta=(aPlantPath-front)/.16;
 float plantPulse=exp(-plantDelta*plantDelta);
 vec3 plantColor=mix(vec3(.30,.69,.73),vec3(.87,.89,.69),.30+aPlantPath*.50);
 vec3 neuralLight=sourceColor*mix(3.4+2.6*pulse,2.4+discharge*2.4,aKind);
 vec3 plantLight=plantColor*mix(1.8+.5*plantPulse,1.3,aKind);
 vColor=mix(neuralLight,plantLight,max(cultivation,aKind*coreBlend));
 float branchMask=1.-step(.5,mod(floor(aSeed.x*6.)+floor(uLightningPhase/6.28318530718),2.));
 float branchLight=branchMask*discharge*(.36+.64*pulse)*(.72+aSeed.z*.28);
 // All growth strands stay softly lit; detached details have a quieter emission.
 float plantReveal=smoothstep(aPlantPath-.08,aPlantPath+.05,cultivation*1.10);
 float plantBranch=plantReveal*(.44+.18*plantPulse)*mix(1.,.62,aPlantFlow);
 branchLight=mix(branchLight,plantBranch,cultivation);
 float coreLight=mix(.16+.32*discharge,.06,coreBlend);
 vAlpha=activation*mix(branchLight,coreLight,aKind);
 vSoft=0.;
}`,Ra=`
precision highp float;
uniform float uObjectPresence;
varying vec2 vUv;
varying vec3 vColor;
varying float vAlpha;
varying float vCore;
void main(){
 float radius=length(vUv-.5)*2.;
 if(radius>1.)discard;
 float sharp=exp(-radius*radius*4.5)+exp(-radius*radius*1.8)*.13;
 float soft=exp(-radius*radius*6.)*.72+exp(-radius*radius*2.)*.18;
 float profile=mix(sharp,soft,vCore)*(1.-smoothstep(.72,1.,radius));
 gl_FragColor=vec4(vColor,profile*vAlpha*uObjectPresence);
}`;function jr(e,o){let r=Fa(),t=Gr(),i=new e.PlaneGeometry(1,1),a=new e.InstancedBufferGeometry;a.index=i.index,a.attributes.position=i.attributes.position,a.attributes.uv=i.attributes.uv,a.setAttribute("aCorePosition",new e.InstancedBufferAttribute(r.positions,3)),a.setAttribute("aSeed",new e.InstancedBufferAttribute(r.seeds,3)),a.setAttribute("aPath",new e.InstancedBufferAttribute(r.paths,1)),a.setAttribute("aKind",new e.InstancedBufferAttribute(r.kinds,1)),a.setAttribute("aPlantPosition",new e.InstancedBufferAttribute(t.positions,3)),a.setAttribute("aPlantPath",new e.InstancedBufferAttribute(t.paths,1)),a.setAttribute("aPlantRoot",new e.InstancedBufferAttribute(t.roots,3)),a.setAttribute("aPlantFlex",new e.InstancedBufferAttribute(t.flex,1)),a.setAttribute("aPlantFlow",new e.InstancedBufferAttribute(t.flows,1)),a.instanceCount=r.count;let l=new e.ShaderMaterial({uniforms:{...o},vertexShader:Ea,fragmentShader:Ra,transparent:!0,depthTest:!1,depthWrite:!1,blending:e.AdditiveBlending}),p=new e.Mesh(a,l);p.name="brain-internal-synapses",p.frustumCulled=!1,p.renderOrder=2;let m=!1;return{mesh:p,dispose(){m||(m=!0,p.removeFromParent(),l.dispose(),a.dispose(),i.dispose())}}}function Ba(e){if(e.length<4)return!1;for(let o=0;o<e.length;o+=4)if(e[o]<=2&&e[o+1]<=2&&e[o+2]<=2)return!1;return!0}function Wr(){let e=!1,o=-1/0,r=0;return{shouldProbe(t){return r<3&&t-o>=.75},inspect(t,i,a=!1){return o=i,a?"fallback":Ba(t)?(r++,"present"):e?"fallback":(e=!0,o=-1/0,"retry")}}}var _r=(e,o,r)=>{let t=Math.max(0,Math.min(1,(r-e)/(o-e)));return t*t*(3-2*t)},Hr=e=>_r(0,.02,e),Xr=e=>.5-.14*_r(Qe(-.3,1,1,!0),Qe(0,1,1,!0),e);function Jr(e,o,r,t,i,a,l=.36){if(r>=821||t<=0||r/t>1.05||i<=0)return!1;let p=Math.min(1,Math.max(0,i));if(a.world.set(0,.18,0).applyQuaternion(o.quaternion).add(o.position),e.updateMatrixWorld(!0),a.view.copy(a.world).applyMatrix4(e.matrixWorldInverse),!Number.isFinite(a.view.z)||a.view.z>=-.1)return!1;let m=-a.view.z*Math.tan(e.fov*Math.PI/360);return a.delta.set(-a.view.x,m*(1-2*l)-a.view.y,0).applyQuaternion(e.quaternion),o.position.addScaledVector(a.delta,p),!0}var ho=e=>Math.max(0,Math.min(1,e)),Ve=(e,o,r)=>{let t=ho((r-e)/(o-e));return t*t*(3-2*t)},Zr=()=>({active:!1,progress:0,frame:{x:.5,y:.5,width:.5,height:.3}}),vo=()=>({sceneProgress:.14,presence:0,scale:0,x:0,y:0,pivotY:0});function go(e,o){if(!e||typeof e!="object")return!1;let r=e;if(typeof r.active!="boolean")return!1;if(!r.active)return o.active=!1,!0;let t=r.frame;return!Number.isFinite(r.progress)||!t||![t.x,t.y,t.width,t.height].every(Number.isFinite)||t.width<=0||t.height<=0?!1:(o.active=!0,o.progress=ho(r.progress),Object.assign(o.frame,t),!0)}function qr(e,o,r,t=vo()){let i=ho(e),a=.14+.195*Ve(.06,.52,i),l=Ve(.199,.285,a),p=Ve(.185,.285,a),m=Ve(.192,.285,a),s=1.63*(1-Ve(.14,.24,a)*.27),d=(1-l)*s*Math.max(1,r)+l*.596,A=(1-l)*(s*.48+.46)+l*.596,h=(1-l)*1.2+l*.09,y=.18*Math.max(Math.abs(l-m),Math.abs(p-m)),v=4.12,P=Math.tan(38*Math.PI/360),U=o.width*.88*r*P,B=o.height*.88*P;return t.sceneProgress=a,t.presence=Ve(0,.06,i),t.scale=Math.max(0,Math.min(v*U/(d+h*U),(v*B-y)/(A+h*B))),t.x=(o.x-.5)*v*P*2*r,t.y=(.5-o.y)*v*P*2,t.pivotY=.18*m,t}var ne=(e,o,r)=>{let t=Math.max(0,Math.min(1,(r-e)/(o-e)));return t*t*(3-2*t)};function Kr({paused:e,onReady:o,onProgress:r,sequence:t="complete"},i){(0,$r.useEffect)(()=>{let a=i.current,l=a?.closest(".ch-intro");if(!a||!l)return;let p=new AbortController,m=t.endsWith("-formation"),s=t==="immersion-formation",d=t==="symbol-formation",A=!1,h=!1,y=!1,v=0,P=()=>{},U=J=>{J.preventDefault(),y=!0,cancelAnimationFrame(v),v=0,o(!1)};a.addEventListener("webglcontextlost",U);async function B(){try{let cr=function(n){if(v=0,!(h||y||document.hidden||!it))try{or();let u=s?window.juliaScroll:void 0;u?.smooth&&Je();let z=ge?n-ge:0,w=ge?Math.min((n-ge)/1e3,.05):1/60;if(ge=n,T&&!yo&&pe<3&&na.sample(z,!e.current&&g>.02&&g<.95)&&ia(),e.current&&oe(),ue){let x=Math.min(1,(n-ue.began)/ue.duration),Q=x*x*x*(x*(x*6-15)+10);window.scrollTo({top:ue.from+(ue.to-ue.from)*Q,behavior:"instant"}),K=Math.max(0,Math.min(1,(window.scrollY-le)/Be)),x===1&&(ue=null)}e.current||(_+=w,Ie+=z?z/1e3:w);let D=m?16:T?12:8,ht=g-K,Ne=ce+D*ht,Ze=Math.exp(-D*w);if(g=K+(ht+Ne*w)*Ze,ce=(ce-D*Ne*w)*Ze,(g<0||g>1)&&(g=Math.max(0,Math.min(1,g)),ce=0),Math.abs(K-g)<5e-6&&Math.abs(ce)<1e-5&&(g=K,ce=0),s){e.current||(H=u?.smooth?_e:H+(_e-H)*(1-Math.exp(-w*7))),e.current||(He=io(Ue)),e.current||(O=u?.smooth?be:O+(be-O)*(1-Math.exp(-w*6)),Math.abs(be-O)<1e-5&&(O=be)),e.current||(R=u?.smooth?xe:R+(xe-R)*(1-Math.exp(-w*7)),Math.abs(xe-R)<1e-5&&(R=xe)),e.current||(be>=1?(H=_e,R=xe,O=1,jt||(j.reset(),jt=!0)):jt=!1),Rr(O,b<821,Y),Er(R,b<821,q,b/M),Br(Ue,lt,b<821||b/M<1.05,ee),mo(O,F),Re.value=F.visibility,e.current&&(Re.value=Math.min(Re.value,mo(be,oa).visibility)),Ut.value=F.dive,f.uReburst.value=Y.reburst,f.uReturnLogo.value=0,Se||(f.uDynamics.value=j.enabled?1:0),f.uCultivation.value=Dr(R),f.uSynapsePresence.value=Vr(uo(O))*F.synapses,Wo||Ce.set(.5+Math.cos(g*Math.PI*2.25)*.27,.68-Math.sin(g*Math.PI*1.6)*.18,g);let x=Ft.value,Q=1-Math.exp(-w*3.2);x.x+=(Ce.x-x.x)*Q,x.y+=(Ce.y-x.y)*Q,x.z+=(Ce.z-x.z)*Q;let V=ne(.02,.22,H);S.position.x=(-(x.x-.5)*.65+Y.cameraX+q.cameraX)*V,S.position.y=((b<768?-.2:-.09)-(x.y-.5)*.22+Y.cameraY+q.cameraY)*V,S.position.z=4.12+ee.cameraZ*(1-V)+(-Math.sin(x.z*Math.PI)*.15+Y.cameraZ+q.cameraZ)*V,S.lookAt(0,.08*V,0);let ye=b>=821?.68:0,fa=b>=821?.05:.48,ha=b>=821?.3*(1-ne(.8,1.45,b/M))*ne(.2,.35,H):0,De=1-V,da=Math.atan2(Math.sin(ee.ry),Math.cos(ee.ry));I.position.set((ye-ha)*V+Y.x+q.x+ee.x*De,(_o*(1-.84*ee.center)+ee.y)*De+fa*V+Y.y+q.y,Y.z+q.z+ee.z*De),I.rotation.set(Y.rx+q.rx+ee.rx*De,Y.ry+q.ry+da*De,Y.rz+q.rz+ee.rz*De),Jr(S,I,b,M,Hr(H),ra,Xr(H)),F.center>0&&(So.set(0,.18,0).applyQuaternion(I.quaternion),I.position.lerp(So.multiplyScalar(-1),F.center),S.position.x*=1-F.center,S.position.y*=1-F.center,S.position.z+=(4.12-3.64*F.dive-S.position.z)*F.center,S.lookAt(0,.08*V*(1-F.center),0));let $t=ro(R),va=Math.min(3,Math.floor(R*4))!==Math.min(3,Math.floor(ct*4)),ga=R===xe&&R!==ct;(Math.abs($t-$o)>1e-4||Math.abs(R-ct)>1e-4||Math.abs(O-Ko)>1e-4||va||ga)&&($o=$t,ct=R,Ko=O,window.dispatchEvent(new CustomEvent("julia:brain-pose",{detail:{crossing:$t,progress:R,finale:O}})))}if(!s&&!m&&!e.current&&(t==="complete"?g>.012&&g<.26:g<.93)&&_-Go>.42&&Math.abs(g-Oo)>.008){let x=Math.max(0,Math.min(1,(b/M-.6)/.7));Jt(.5,.62+.04*x*x*(3-2*x)),Go=_,Oo=g}m&&!s&&!e.current&&!A&&(Ie>=2.1||g>=.18)&&(Jt(.5,.52),A=!0);let re=s?.14+.195*Math.max($e(g,Ie),ne(0,.5,He))+.18*He+.16*ne(0,.24,H)+.255*ne(.24,.98,H):bt(t,g,m?Ie:_);if(he.uTime.value=_,he.uProgress.value=to(t,g),te.strength=.44*(.85+.15*ne(.185,.285,g)),f.uTime.value=_,f.uProgress.value=re,s){let x=ne(.02,.22,H),Q=Ho*(1-x)+Math.min(1.14-.26*ne(.42,.66,re),b/M*1.95)*x;if(f.uScale.value=Q,!e.current){let V=Math.PI*2*ne(.69,.9,re)+q.ry+Y.ry;f.uLightningPhase.value=V,f.uLightningGate.value=Ur(V)*F.lightning}se&&(se.mesh.visible=re>.63&&F.visibility>0&&F.morph<1)}f.uAssembly.value=m?$e(g,Ie):1,nt.visible=re>.58&&re<.985&&Re.value>=.999&&f.uAssembly.value>=.995&&f.uReburst.value<.015&&f.uReturnLogo.value<.015,tt.value=Math.min(1.6,Math.abs(ce)*7),e.current||f.uPointer.value.lerp(ut,1-Math.exp(-w*3));let ua=e.current?0:Math.exp(-Math.max(0,_-Vt-.35)*1.6)*Math.min(1,Math.max(0,(g-.14)/.08));f.uRepel.value+=(ua-f.uRepel.value)*(1-Math.exp(-w*7));let qt=g>=.995?0:Math.max(0,Math.min(1,(g-.09)/.1));he.uParticlePresence.value=t==="complete"?qt*qt*(3-2*qt):zr(t,g);let ze=s&&Xe.active;if(zo.value=s&&!ze?F.ambient:1,at.visible=!ze,ze?((!e.current||!_t)&&(Wt=Xe.progress),qr(Wt,Xe.frame,b/M,Ae),S.position.set(0,0,4.12),S.lookAt(0,0,0),I.rotation.set(0,0,0),I.position.set(Ae.x,Ae.y-Ae.pivotY,0),f.uProgress.value=Ae.sceneProgress,f.uScale.value=Ae.scale,f.uAssembly.value=1,f.uBrainEntry.value=0,f.uReturnLogo.value=0,f.uReburst.value=0,f.uLightningGate.value=0,f.uCultivation.value=0,f.uSynapsePresence.value=0,f.uDynamics.value=0,f.uPointer.value.set(0,0),f.uRepel.value=0,tt.value=0,Re.value=Ae.presence,Ut.value=0,nt.visible=!1,se&&(se.mesh.visible=!1)):_t&&j.reset(),_t=ze,s&&(a.dataset.closingProgress=ze?Wt.toFixed(4):"inactive"),L.setScissorTest(!1),S.updateMatrixWorld(!0),I.updateMatrixWorld(!0),s){if(de.matrix.identity(),!ze&&F.center>0){Eo.multiplyMatrices(S.matrixWorld,aa);for(let x=0;x<16;x++)de.matrix.elements[x]+=(Eo.elements[x]-de.matrix.elements[x])*F.center}de.matrixWorldNeedsUpdate=!0}if(f.uModelView.value.multiplyMatrices(S.matrixWorldInverse,I.matrixWorld),!Se&&(m||g<.995)&&!ze&&j.enabled&&(!kt||!e.current||Math.abs(ce)>1e-5||Math.abs(g-K)>1e-5)){let x=j.step(w,N.instanceCount);x&&(f.uState.value=x),kt=!0}if((t!=="complete"||g>.09)&&(m||g<.995)&&(G.render(w),he.uParticles.value=G.readBuffer.texture),L.setRenderTarget(null),L.setViewport(0,0,b,M),L.clear(),L.render(ot,Et),s&&jo.shouldProbe(n/1e3)){let x=L.getContext();Ot.fill(0);let Q=[[.08,.12],[.5,.08],[.92,.85],[.5,.5]];for(let ye=0;ye<Q.length;ye++)x.readPixels(Math.min(a.width-1,Math.floor(a.width*Q[ye][0])),Math.min(a.height-1,Math.floor(a.height*Q[ye][1])),1,1,x.RGBA,x.UNSIGNED_BYTE,Ot.subarray(ye*4,ye*4+4));let V=jo.inspect(Ot,n/1e3,x.isContextLost());if(V!=="present"){if(Gt=!1,o(!1),V==="fallback")throw Error("World framebuffer unavailable after analytic recovery");Se=!0,te.enabled=!1,f.uDynamics.value=0,Ht.request(b,M,1),G.setPixelRatio(1),G.setSize(b,M),a.dataset.recovery="analytic-no-bloom",X();return}}let dt=t==="brain"||m?0:Fr(window.scrollY-le,Be,je);e.current||(Te+=(dt-Te)*(1-Math.exp(-w*9)),Math.abs(dt-Te)<1e-4&&(Te=dt)),Zt++,r(g,Te),a.dataset.progress=g.toFixed(4),m&&(a.dataset.sceneProgress=re.toFixed(4),a.dataset.elapsed=Ie.toFixed(2),a.dataset.assembly=f.uAssembly.value.toFixed(4)),a.dataset.repel=f.uRepel.value.toFixed(3),s&&(a.dataset.spatialProgress=O.toFixed(4),a.dataset.spiralProgress=R.toFixed(4),a.dataset.heroTravel=Ue.toFixed(4),a.dataset.heroBurst=He.toFixed(4),a.dataset.heroCover=lt.toFixed(4),a.dataset.reburst=Y.reburst.toFixed(4),a.dataset.returnLogo=F.morph.toFixed(4),a.dataset.lightning=f.uLightningGate.value.toFixed(4)),Yo&&(Yo=!1,a.dataset.readyAt=performance.now().toFixed(0)),Gt||(Gt=!0,o(!0));let ma=Math.abs(ce)>1e-5||Math.abs(g-K)>1e-5,pa=f.uPointer.value.distanceToSquared(ut)>1e-6;ma||!e.current&&(m||g<.99999||pa||Te!==dt)?X():ge=0}catch(u){y=!0,cancelAnimationFrame(v),v=0,a.dataset.renderFailure=u instanceof Error?u.message:"Frame rendering failed",o(!1),P(),P=()=>{},console.warn("COOKING frame uses photographic fallback",u)}};var J=cr;let C=Mr(a);if(!C){y=!0,o(!1);return}let[c,E,k,{EffectComposer:Z},{RenderPass:Ct},{UnrealBloomPass:we}]=await Promise.all([import("./pages-three.module-ZPQM6EP3.js"),Promise.all([fetch("/data/symbol-points.bin",{signal:p.signal}).then(n=>{if(!n.ok)throw Error("Particle data");return n.arrayBuffer()}),d?Promise.resolve([new ArrayBuffer(0),new ArrayBuffer(0),new ArrayBuffer(0)]):Pr(p.signal)]).then(([n,u])=>[n,...u]),m?Promise.resolve(null):fetch("/imagens/cooking/olhar.d239b1cf5252.webp",{signal:p.signal}).then(n=>{if(!n.ok)throw Error("Photograph");return n.blob()}),import("./pages-EffectComposer-ADN2ZDY2.js"),import("./pages-RenderPass-TXWM4NCQ.js"),import("./pages-UnrealBloomPass-XK3BUACN.js")]);if(h||y)return;if(C.isContextLost()){y=!0,o(!1);return}let ie=k?await createImageBitmap(k,{imageOrientation:"flipY"}):null;if(h||y){ie?.close();return}if(C.isContextLost()){ie?.close(),y=!0,o(!1);return}let L=new c.WebGLRenderer({canvas:a,antialias:!1,alpha:!1,powerPreference:"high-performance"});L.autoClear=!1,L.setClearColor(532777,1),L.debug.onShaderError=(n,u,z,w)=>{let D=[n.getProgramInfoLog(u),n.getShaderInfoLog(z),n.getShaderInfoLog(w)].filter(Boolean).join(`
`);throw a.dataset.shaderFailure=D||"COOKING shader compilation failed",Error(a.dataset.shaderFailure)};let Pe=ie?new c.Texture(ie):new c.DataTexture(new Uint8Array([5,13,17,255]),1,1);Pe.needsUpdate=!0,Pe.minFilter=c.LinearFilter,Pe.magFilter=c.LinearFilter;let T=matchMedia("(pointer: coarse)").matches||innerWidth<768,bo=new URLSearchParams(location.search).has("debug"),Lt=bo?new URLSearchParams(location.search).get("tier"):null,xo=C.getExtension("WEBGL_debug_renderer_info"),ta=xo?String(C.getParameter(xo.UNMASKED_RENDERER_WEBGL)):"",pe=T?Cr(ta,navigator.deviceMemory):0,yo=T&&Lt!==null&&/^[0-3]$/.test(Lt);yo&&(pe=Number(Lt));let fe=()=>Ar[pe],zt=Array.from({length:8},()=>new c.Vector4(.5,.5,-100,0)),wo={value:new c.Vector2},tt={value:0},Ft={value:new c.Vector4(.7,.68,0,s?1:0)},he={uPhoto:{value:Pe},uParticles:{value:Pe},uParticlePresence:{value:0},uResolution:{value:new c.Vector2(1,1)},uTime:{value:0},uProgress:{value:0},uVelocity:tt,uPointer:wo,uRipples:{value:zt},uJourney:Ft},ot=new c.Scene,Et=new c.Camera,Po=new c.PlaneGeometry(2,2),Mo=new c.ShaderMaterial({uniforms:he,vertexShader:gt,fragmentShader:T?Kt.replace("for(int i=0;i<8;i++)","for(int i=0;i<4;i++)"):Kt,depthTest:!1,depthWrite:!1,blending:c.NoBlending});ot.add(new c.Mesh(Po,Mo));let rt=new c.Scene,S=new c.PerspectiveCamera(38,1,.1,20);S.position.z=4;let I=new c.Group;rt.add(I);let Y=Ke(),q=Ke(),ee=so(),F=yt(),oa=yt(),So=new c.Vector3,ra={world:new c.Vector3,view:new c.Vector3,delta:new c.Vector3},Me=new c.PlaneGeometry(1,1),N=new c.InstancedBufferGeometry;N.index=Me.index,N.attributes.position=Me.attributes.position,N.attributes.uv=Me.attributes.uv;let Ee=new Int16Array(E[1]),Rt=new DataView(E[0]),W=d?7e4:Math.min(7e4,Ee.length/8),Bt=new Float32Array(W*3),ke=new Float32Array(W*3),Tt=new Float32Array(W*3),Ge=new Float32Array(W*3),It=new Float32Array(W),Ao=new Float32Array(W);for(let n=0;n<W;n++){let u=Math.floor(n*(Ee.length/8)/W)*8;for(let w=0;w<3;w++){Bt[n*3+w]=d?0:Ee[u+w]/32767,Tt[n*3+w]=d?w===2?1:0:Ee[u+w+3]/32767;let D=Math.sin((n+1)*(12.9898+w*78.233))*43758.5453;Ge[n*3+w]=D-Math.floor(D)}It[n]=d?0:Math.round(Ee[u+7]/32767*10),Ao[n]=d?0:Ee[u+6]/32767;let z=n%(Rt.byteLength/4)*4;ke[n*3]=(Rt.getUint16(z,!0)/65535-.5)*1.18,ke[n*3+1]=-(Rt.getUint16(z+2,!0)/65535-.5)*1.18,ke[n*3+2]=(Ge[n*3+2]-.5)*(s?.18:.1)}for(let[n,u,z]of[["aBrain",Bt,3],["aLogo",ke,3],["aNormal",Tt,3],["aSeed",Ge,3],["aPiece",It,1],["aCavity",Ao,1]])N.setAttribute(n,new c.InstancedBufferAttribute(u,z));N.instanceCount=W;let f={uBrainEntry:{value:t==="brain-formation"?1:0},uAssembly:{value:m?0:1},uSeparation:{value:t==="brain-formation"||s?2:1},uReburst:{value:0},uReturnLogo:{value:0},uLightningPhase:{value:0},uLightningGate:{value:0},uCultivation:{value:0},uSynapsePresence:{value:1},uViewportHeight:{value:1},uSpatial:{value:s?1:0},uModelView:{value:new c.Matrix4},uDefocus:{value:T?.6:1},uStretch:{value:T?0:1},uGain:{value:T?fe().gain:1},uTime:{value:0},uProgress:{value:0},uScale:{value:2},uAspect:{value:1},uPointer:wo,uVelocity:tt,uOcclusion:{value:0},uRepel:{value:0},uState:{value:Pe},uDynamics:{value:0},uJourney:Ft},Re={value:1},Ut={value:0},Nt={...f,uObjectPresence:Re,uDive:Ut},j=xr(c,L,S,W,{brain:Bt,logo:ke,normal:Tt,seed:Ge,piece:It},f);N.setAttribute("aStateUv",new c.InstancedBufferAttribute(j.uv,2)),f.uDynamics.value=j.enabled?1:0,j.texture&&(f.uState.value=j.texture);let Co=new c.ShaderMaterial({uniforms:Nt,vertexShader:vr,fragmentShader:Qt,transparent:!0,depthTest:!0,depthWrite:!1,blending:c.AdditiveBlending}),Lo=new c.Mesh(N,Co);Lo.frustumCulled=!1,I.add(Lo);let $=new c.InstancedBufferGeometry;$.index=Me.index,$.attributes.position=Me.attributes.position,$.attributes.uv=Me.attributes.uv,$.setAttribute("aSeed",new c.InstancedBufferAttribute(Ge,3)),$.instanceCount=8e3;let zo={value:1},Fo=new c.ShaderMaterial({uniforms:{...f,uObjectPresence:zo},vertexShader:gr,fragmentShader:Qt,transparent:!0,depthTest:!1,depthWrite:!1,blending:c.AdditiveBlending}),de=new c.Mesh($,Fo);de.frustumCulled=!1,de.renderOrder=-2,rt.add(de);let aa=new c.Matrix4().makeTranslation(0,0,-4.12),Eo=new c.Matrix4;s&&(de.matrixAutoUpdate=!1);let Oe=new Int16Array(E[2]),Ye=Oe.length/8,Ro=new Float32Array(Ye*3),Bo=new Float32Array(Ye*3),To=new Float32Array(Ye),Io=new Float32Array(Ye);for(let n=0;n<Ye;n++){for(let u=0;u<3;u++)Ro[n*3+u]=Oe[n*8+u]/32767,Bo[n*3+u]=Oe[n*8+u+3]/32767;To[n]=Math.round(Oe[n*8+7]/32767*10),Io[n]=Oe[n*8+6]/32767}let ve=new c.BufferGeometry;ve.setIndex(new c.BufferAttribute(new Uint32Array(E[3]),1)),ve.setAttribute("position",new c.BufferAttribute(Ro,3)),ve.setAttribute("aNormal",new c.BufferAttribute(Bo,3)),ve.setAttribute("aPiece",new c.BufferAttribute(To,1)),ve.setAttribute("aCavity",new c.BufferAttribute(Io,1));let Uo=new c.ShaderMaterial({uniforms:Nt,vertexShader:eo,fragmentShader:br,transparent:!0,blending:c.AdditiveBlending,depthWrite:!1,depthTest:!0,side:c.DoubleSide}),at=new c.Mesh(ve,Uo);at.frustumCulled=!1,at.renderOrder=-1,d||I.add(at);let No=new c.ShaderMaterial({uniforms:{...f,uOcclusion:{value:1}},vertexShader:eo,fragmentShader:"void main(){gl_FragColor=vec4(0.);}",colorWrite:!1,depthWrite:!0,depthTest:!0,side:c.FrontSide}),nt=new c.Mesh(ve,No);nt.frustumCulled=!1,d||I.add(nt);let se=s?jr(c,Nt):null;se&&(I.add(se.mesh),se.mesh.visible=!1,a.dataset.synapseParticles=String(se.mesh.geometry.instanceCount));let G=new Z(L);G.renderToScreen=!1;let Do=new Ct(rt,S,void 0,new c.Color(0),0);G.addPass(Do);let te=new we(new c.Vector2(1,1),.44,.46,.32);te.enabled=T?fe().bloom:!0,G.addPass(te);let b=0,M=0,Vo=0,le=0,Be=1,je=1,K=0,g=0,Te=0,ce=0,ge=0,_=0,it=!0,Dt=0,ko=-1,Go=-1,Oo=0,Vt=-100,kt=!1,ue=null,Yo=!0,Ie=0,Gt=!1,jo=Wr(),Ot=new Uint8Array(16),Se=!1,We=0,st=1,_e=0,H=0,Wo=!1,lt=0,Ue=0,He=0,_o=.35,Ho=1,Xo=0,Jo=1,be=0,O=0,Yt=1,xe=0,R=0,Zo=innerWidth,qo=innerHeight,$o=-1,ct=-1,Ko=-1,jt=!1,Xe=Zr(),Ae=vo(),Wt=0,_t=!1;s&&go(window.juliaClosingPose,Xe);let Qo=n=>{s&&go(n.detail,Xe)&&X()},Ce=new c.Vector3(.7,.68,0),er=n=>{let u=n.detail;!s||!u||(typeof u.lightX=="number"&&(Ce.x=Math.max(0,Math.min(1,u.lightX))),typeof u.lightY=="number"&&(Ce.y=Math.max(0,Math.min(1,u.lightY))),typeof u.depth=="number"&&(Ce.z=Math.max(0,Math.min(1,u.depth))),Wo=!0,X())},tr=n=>{if(!s)return;let u=n.detail,z=u?.entry;typeof z=="number"&&(lt=Math.max(0,Math.min(1,z)),typeof u.progress=="number"&&(Ue=Math.max(0,Math.min(1,u.progress))),X())},Ht=Sr(),ut=new c.Vector2,Xt=new c.Vector2(-100,-100),X=()=>{!v&&!h&&!y&&!document.hidden&&it&&(v=requestAnimationFrame(cr))},Je=()=>{K=Math.max(0,Math.min(1,(window.scrollY-le)/Be)),_e=s?Qe(window.scrollY-We,qo,Yt,Zo<821):Math.max(0,Math.min(1,(window.scrollY-We+innerHeight*.85)/st));let n=document.getElementById("editorial-track")?.dataset,u=n?.heroEntry;u!==void 0&&(lt=Math.max(0,Math.min(1,Number(u)||0))),n?.heroProgress!==void 0&&(Ue=Math.max(0,Math.min(1,Number(n.heroProgress)||0))),be=Math.max(0,Math.min(1,(window.scrollY-Xo)/Jo)),xe=lo((window.scrollY-We)/Yt),it=window.scrollY<le+l.offsetHeight&&window.scrollY+innerHeight>le,it||(ge=0),X()},or=()=>Ht.apply(n=>{b=n.width,M=n.height,Vo=n.ratio,L.setPixelRatio(Se?1:Vo),L.setSize(b,M,!1),G.setPixelRatio(Se?1:T?fe().composerRatio:Math.min(devicePixelRatio||1,b<768?1.15:1.4)),G.setSize(b,M),he.uResolution.value.set(b,M),S.aspect=b/M,t!=="complete"&&(S.position.x=t==="symbol"&&b>=768?b<1e3?.5:.85:0,S.position.y=b<768?-.26:m?-.12:0),S.updateProjectionMatrix(),f.uAspect.value=b/M,f.uScale.value=Math.min(t==="brain-formation"?.88:m?1.14:1.3,b/M*1.95)*(t==="symbol"&&(M<720||b>=768&&b<1e3)?.8:1),f.uViewportHeight.value=M,a.dataset.resizes=String(Number(a.dataset.resizes||0)+1),N.instanceCount=Math.min(T?rr():b<768?4e4:7e4,W),a.dataset.particles=String(N.instanceCount),$.instanceCount=T?ar():b<768?4500:8e3,a.dataset.fieldParticles=String($.instanceCount)}),rr=()=>fe().particles,ar=()=>fe().dust,na=Lr(),ia=()=>{pe=Math.min(3,pe+1),a.dataset.tier=String(pe),te.enabled=!Se&&fe().bloom,f.uGain.value=fe().gain,N.instanceCount=Math.min(rr(),W),$.instanceCount=ar(),a.dataset.particles=String(N.instanceCount),a.dataset.fieldParticles=String($.instanceCount),G.setPixelRatio(Se?1:fe().composerRatio),G.setSize(b,M)},mt=()=>{let n=a.getBoundingClientRect();if(!n.width||!n.height)return;Zo=n.width,qo=n.height;let u=Math.min(devicePixelRatio||1,T?1.25:n.width<768?1.4:1.65);Ht.request(n.width,n.height,u),le=l.getBoundingClientRect().top+window.scrollY,je=Math.max(1,l.offsetHeight-n.height);let z=s?document.getElementById("brain-passage"):null,w=s?document.getElementById("atendimento"):null,D=s?document.getElementById("brain-finale"):null,ht=s?Math.max(1,Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--motion-scroll-scale"))||1):1,Ne=document.getElementById("intro"),Ze=Ne?.querySelector(".intro-copy");if(s&&Ne&&Ze){let re=Tr(n.width,n.height,Ze.getBoundingClientRect().top-Ne.getBoundingClientRect().top);_o=re.y,Ho=re.scale}We=z?z.getBoundingClientRect().top+window.scrollY:le+je*.44,st=z?Math.max(n.height,z.offsetHeight-n.height*.2):Math.max(n.height,je*.27),Yt=D?Math.max(1,D.offsetTop):z?Math.max(1,z.offsetHeight-n.height):st,Xo=D?D.getBoundingClientRect().top+window.scrollY:w?w.getBoundingClientRect().top+window.scrollY:We+st,Jo=D?n.height*Number(D.dataset.duration||3.4)*ht:Math.max(n.height,w?w.offsetHeight:n.height)+n.height*.1,Be=Math.max(1,je-(t==="brain"||m?0:2.1)*n.height),Je()},Jt=(n,u)=>{zt[Dt].set(n,u,_,s?1.2:1),Dt=(Dt+1)%(T?4:zt.length),a.dataset.ripples=String(Number(a.dataset.ripples||0)+1),X()},nr=n=>{if(s&&window.scrollY>innerHeight*.9||m&&!s||!b||!M||e.current||t==="complete"&&K>.26||n.target.closest("a,button,nav"))return;let u=a.getBoundingClientRect();Jt((n.clientX-u.left)/b,1-(n.clientY-u.top)/M),ko=_,Xt.set(n.clientX,n.clientY)},oe=()=>{ue=null},sa=(n,u)=>{e.current||K>=n||(ue={from:window.scrollY,to:le+Be*n,began:performance.now(),duration:u},X())},ir=n=>{let u=t==="complete"?.335:.72;n.detail?.keyboard?(window.scrollTo({top:le+Be*u,behavior:"instant"}),Je()):sa(u,2400)},sr=n=>{if(!(n.button!==0||e.current)&&(oe(),nr(n),!(!b||!M)&&!n.target.closest("a,button,nav"))){let u=a.getBoundingClientRect();ut.set(((n.clientX-u.left)/b-.5)*2,((n.clientY-u.top)/M-.5)*2),Vt=_}},lr=n=>{if(!s&&!(!b||!M)&&!n.target.closest("a,button,nav")&&(n.pointerType==="mouse"||n.pointerType==="touch")){let u=a.getBoundingClientRect();ut.set(((n.clientX-u.left)/b-.5)*2,((n.clientY-u.top)/M-.5)*2),Vt=_,_-ko>.42&&Math.hypot(n.clientX-Xt.x,n.clientY-Xt.y)>28&&nr(n),X()}},Zt=0,ur=performance.now(),Le=bo?document.createElement("output"):null;Le&&(Le.setAttribute("aria-label","Desempenho WebGL"),Le.style.cssText="position:fixed;bottom:8px;left:8px;z-index:10000;padding:8px 12px;background:#092329ed;color:#fff;font:12px/1.5 monospace;pointer-events:none;border-radius:6px;white-space:pre-line",document.body.append(Le));let la=Le?window.setInterval(()=>{let n=performance.now(),u=Math.round(Zt*1e3/(n-ur));Le.textContent=`${u} fps \xB7 n\xEDvel ${T?pe:"desktop"}
${N.instanceCount} part\xEDculas \xB7 ${a.width}\xD7${a.height}
DPR ${devicePixelRatio} \xB7 bloom ${te.enabled?"on":"off"}`,Zt=0,ur=n},500):0,mr=()=>{document.hidden?(cancelAnimationFrame(v),v=0,ge=0):X()},pt=new ResizeObserver(mt);pt.observe(l),pt.observe(a);let pr=s?document.querySelector("#intro .intro-copy"):null;pr&&pt.observe(pr),window.addEventListener("scroll",Je,{passive:!0}),window.addEventListener("resize",mt);let ft=s?window:l;ft.addEventListener("pointerdown",sr,{passive:!0}),ft.addEventListener("pointermove",lr,{passive:!0}),s&&(window.addEventListener("julia:journey",er),window.addEventListener("julia:hero-transition",tr),window.addEventListener("julia:closing-pose",Qo)),window.addEventListener("pointercancel",oe,{passive:!0}),window.addEventListener("blur",oe),window.addEventListener("cooking:motion",X),window.addEventListener("wheel",oe,{passive:!0}),window.addEventListener("keydown",oe),window.addEventListener("cooking:enter",ir),document.addEventListener("visibilitychange",mr),P=()=>{pt.disconnect(),window.removeEventListener("scroll",Je),window.removeEventListener("resize",mt),ft.removeEventListener("pointerdown",sr),ft.removeEventListener("pointermove",lr),document.removeEventListener("visibilitychange",mr),window.removeEventListener("julia:journey",er),window.removeEventListener("julia:hero-transition",tr),window.removeEventListener("julia:closing-pose",Qo),window.removeEventListener("pointercancel",oe),window.removeEventListener("blur",oe),window.removeEventListener("cooking:motion",X),window.removeEventListener("wheel",oe),window.removeEventListener("keydown",oe),window.removeEventListener("cooking:enter",ir),clearInterval(la),Le?.remove(),se?.dispose(),j.dispose(),Do.dispose(),te.dispose(),G.dispose(),Pe.dispose(),ie?.close(),N.dispose(),$.dispose(),ve.dispose(),Me.dispose(),Po.dispose(),Co.dispose(),Fo.dispose(),Uo.dispose(),No.dispose(),Mo.dispose(),L.dispose()},mt(),or(),g=K,H=_e,He=io(Ue),O=be,R=xe,f.uAssembly.value=m?$e(g,0):1,f.uProgress.value=bt(t,g),he.uProgress.value=to(t,g),L.compile(ot,Et),L.compile(rt,S),S.updateMatrixWorld(!0),I.updateMatrixWorld(!0),f.uModelView.value.multiplyMatrices(S.matrixWorldInverse,I.matrixWorld);let ca=te.enabled;if(te.enabled=!0,j.enabled){let n=j.step(.016666666666666666,N.instanceCount);n&&(f.uState.value=n)}G.render(1/60),he.uParticles.value=G.readBuffer.texture,L.setRenderTarget(null),L.render(ot,Et),te.enabled=ca,kt=!0,a.dataset.model=d?"symbol-points.bin":"Brain_Model.obj",a.dataset.revision=s?"immersive-julia-care-timing-v37":m?"standalone-formation-v2":"brain-one-slow-turn",a.dataset.dynamics=j.enabled?"gpu-spring":"analytic",a.dataset.tier=T?String(pe):"desktop"}catch(C){h||(y=!0,console.warn("COOKING entry uses photographic fallback",C),o(!1),P(),P=()=>{})}}return B(),()=>{h=!0,p.abort(),cancelAnimationFrame(v),a.removeEventListener("webglcontextlost",U),P()}},[o,r,e,t])}var ea=vt(hr());function Na(e){let o=(0,Qr.useRef)(null);return Kr(e,o),(0,ea.jsx)("canvas",{className:"ch-entry-canvas",ref:o,"aria-hidden":"true"})}export{Na as default};
