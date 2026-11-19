/* ==========================================================================
   Ink — the renderer.
   A fixed WebGL layer behind the page draws pictures, ink drawings and type
   at the position of their DOM stand-ins, each with its own ink state.
   A second layer above the page carries the full-screen ink washes.
   ========================================================================== */
window.Ink = (function () {
  'use strict';

  var VERT = 'attribute vec2 a;uniform vec4 uRect;varying vec2 v;void main(){v=a;gl_Position=vec4(uRect.xy+a*uRect.zw,0.,1.);}';

  var FRAG_BACK = [
    'precision highp float;varying vec2 v;',
    'uniform sampler2D uT,uS,uN,uM;uniform int uMode;uniform vec2 uSize,uSeed;uniform vec4 uFit,uBox;',
    'uniform float uTime,uInk,uRev,uEdge,uAlpha,uLive,uFoil,uHasMask,uLine,uScrim,uSY,uDim,uTop;uniform vec3 uCol,uGold;',

    'vec4 picture(){',
    ' float a=uSize.x/uSize.y;vec2 q=v*vec2(a,1.);vec2 tuv=v*uFit.xy+uFit.zw;',
    ' if(uLive>0.){vec2 w=texture2D(uN,v*.9+vec2(uTime*.012,-uTime*.016)).rg-.5;tuv+=w*.009*uLive;}',
    ' vec3 real=texture2D(uT,tuv).rgb*(1.-uDim)*(1.-uScrim*smoothstep(uSY-.17,uSY+.05,v.y)*.86)*(1.-uTop*smoothstep(.56,.06,v.y)*.74);float sk=texture2D(uS,tuv).r;',
    ' float n1=texture2D(uN,q*.42+vec2(uTime*.002,0.)).r,n2=texture2D(uN,q*1.6).g,n3=texture2D(uN,q*6.).b;',
    ' float th=1.-uRev*1.32;float rv=smoothstep(th,th+.28,n1*.52+n2*.32+n3*.16);',
    ' float d=distance(q,uSeed*vec2(a,1.))+(n1-.5)*.66+(n2-.5)*.22+(n3-.5)*.06;',
    ' float R=uInk*(length(vec2(a,1.))+.72)-.05;',
    ' float f=smoothstep(R+.035,R-.05,d);',
    ' float wet=smoothstep(R+.06,R,d)*smoothstep(R-.2,R-.015,d)*step(.002,uInk)*(1.-smoothstep(.97,1.,uInk));',
    ' vec3 col=mix(real,uCol*(.7+.6*n2),wet*.78);',
    ' float skA=(1.-sk)*rv;',
    ' vec3 rgb=mix(uCol*skA,col,f);float al=f+(1.-f)*skA;',
    ' if(uEdge>0.){vec2 e=min(v,1.-v);float m=min(e.x*a,e.y);float vg=smoothstep(0.,uEdge,m+(n2-.5)*uEdge*.95+(n3-.5)*uEdge*.3);rgb*=vg;al*=vg;}',
    ' if(uHasMask>0.){vec2 m=(v-uBox.xy)/uBox.zw+(vec2(n3,n2)-.5)*.006;float k=texture2D(uM,m).r;float cut=smoothstep(.46,.54,k);',
    '  rgb*=cut;al*=cut;',
    '  if(uLine>0.){float ln=smoothstep(.34,.45,k)*(1.-smoothstep(.45,.5,k));rgb+=uGold*ln*uLine*(1.-al);al+=ln*uLine*(1.-al);}}',
    ' return vec4(rgb,al)*uAlpha;}',

    'vec4 drawing(){',
    ' float a=uSize.x/uSize.y;vec2 q=v*vec2(a,1.);vec4 t=texture2D(uT,v*uFit.xy+uFit.zw);',
    ' float n1=texture2D(uN,q*.55).r,n2=texture2D(uN,q*2.2).g,n3=texture2D(uN,q*7.).b;',
    ' float d=distance(q,uSeed*vec2(a,1.))+(n1-.5)*.45+(n2-.5)*.16+(n3-.5)*.05;',
    ' float R=uRev*(length(vec2(a,1.))+.5);float m=smoothstep(R,R-.1,d);',
    ' return vec4(t.rgb*t.a,t.a)*m*uAlpha;}',

    'vec4 lettering(){',
    ' float a=uSize.x/uSize.y;vec4 tx=texture2D(uT,v);float s=tx.r,b=min(tx.g*2.3,1.);',
    ' float n=texture2D(uN,v*vec2(a,1.)*.9).b,n2=texture2D(uN,v*vec2(a,1.)*3.1).g;',
    ' float th=1.04-uRev*1.28;float m=smoothstep(th-.13,th+.05,b*.82+(n-.5)*.2+(n2-.5)*.1+.1);',
    ' float al=s*m;float wet=1.-smoothstep(.72,1.,uRev);',
    ' al+=(1.-al)*b*m*wet*.34;',
    ' vec3 c=uCol;',
    ' if(uFoil>0.){float f=texture2D(uN,v*vec2(a,1.)*.7+vec2(uTime*.006,0.)).r;float sh=pow(.5+.5*sin((v.x*a-v.y)*2.6+uTime*.55+f*5.),8.);c=mix(uCol*.74,uCol*1.16,f)+sh*.32;}',
    ' return vec4(c*al,al)*uAlpha;}',

    'vec4 drape(){',
    ' float y=v.y,cx=abs(v.x-.5)*2.,p=uInk,tie=.74;',
    ' float t=smoothstep(0.,tie,y),up=pow(t,1.35);',
    ' float e=p*(.015+.9*up)*(1.-.05*smoothstep(tie,1.,y));',
    ' e*=1.+.01*sin(y*38.+v.x*7.)*p;',
    ' float d=cx-e;float u=clamp(d/max(1.-e,.001),0.,1.);',
    ' float gather=mix(u,pow(u,.72),p);',
    ' float tx=v.x<.5?.5*(1.-gather):.5+.5*gather;',
    ' vec3 c=texture2D(uT,vec2(tx,y)).rgb;',
    ' c*=1.85+.8*exp(-pow((v.x-.5)/.55,2.))*smoothstep(.02,.85,y);',
    ' c*=1.+.22*p*sin(u*34.+y*5.);',
    ' c*=1.-.46*exp(-pow((y-tie)/.075,2.))*p;',
    ' c*=mix(.34,1.,smoothstep(0.,.08+.1*p,d));',
    ' float rope=(1.-smoothstep(.004,.012,abs(y-tie)))*step(0.,d)*p*(1.-smoothstep(.1,.42,u));',
    ' float tw=.72+.28*sin(v.x*260.+y*140.);c=mix(c,vec3(.95,.74,.38)*tw,rope);',
    ' vec3 room=texture2D(uS,v*uFit.xy+uFit.zw).rgb;',
    ' float a=uSize.x/uSize.y;float r=length(vec2((v.x-.5)*a,y-.56));',
    ' room*=mix(.5,1.08,exp(-r*r*3.4));',
    ' room*=mix(1.,.62,smoothstep(.55,1.,y));',
    ' float m=smoothstep(-.004,.004,d);',
    ' return vec4(mix(room,c,m),1.)*uAlpha;}',

    'void main(){vec4 o;',
    ' if(uMode==1)o=picture();else if(uMode==2)o=drawing();else if(uMode==3)o=lettering();else if(uMode==4)o=drape();',
    ' else{vec2 q=v*vec2(uSize.x/uSize.y,1.);float n=texture2D(uN,q*.5+uTime*.002).r;o=vec4(uCol*(.8+.55*n),1.)*uAlpha;}',
    ' gl_FragColor=o;}'
  ].join('\n');

  var FRAG_FRONT = [
    'precision highp float;varying vec2 v;uniform sampler2D uN;uniform vec2 uRes,uSeed,uSeed2;uniform float uP,uTime;uniform vec3 uCol;',
    'float ease(float x){return x*x*(3.-2.*x);}',
    'void main(){float a=uRes.x/uRes.y;vec2 q=v*vec2(a,1.);',
    ' float n1=texture2D(uN,q*.36+vec2(uTime*.004,0.)).r,n2=texture2D(uN,q*1.35).g,n3=texture2D(uN,q*5.2).b;',
    ' float wob=(n1-.5)*.95+(n2-.5)*.3+(n3-.5)*.08;float M=length(vec2(max(a,.5),1.))+.85;float c=0.,w=0.;',
    ' if(uP>0.&&uP<2.){if(uP<=1.){float d=distance(q,uSeed*vec2(a,1.))+wob;float R=ease(uP)*M-.05;c=smoothstep(R+.03,R-.05,d);w=smoothstep(R+.05,R,d)*smoothstep(R-.22,R-.02,d);}',
    '  else{float d=distance(q,uSeed2*vec2(a,1.))+wob;float R=ease(uP-1.)*M-.05;c=1.-smoothstep(R+.03,R-.06,d);w=smoothstep(R-.06,R,d)*smoothstep(R+.24,R+.02,d);}}',
    ' float tone=texture2D(uN,q*.5+vec2(0.,uTime*.003)).g;vec3 ink=uCol*(.72+1.1*tone*tone)+w*.05;',
    ' gl_FragColor=vec4(ink*c,c);}'
  ].join('\n');

  function compile(gl, vs, fs) {
    var p = gl.createProgram();
    [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]].forEach(function (s) {
      var sh = gl.createShader(s[0]); gl.shaderSource(sh, s[1]); gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
      gl.attachShader(p, sh);
    });
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    gl.useProgram(p);
    var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) { var name = gl.getActiveUniform(p, i).name; u[name] = gl.getUniformLocation(p, name); }
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(p, 'a');
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    return u;
  }

  /* Tileable fractal noise in four independent channels. */
  function noiseData(S) {
    var data = new Uint8Array(S * S * 4);
    function layer(seedA, baseF) {
      var out = new Float32Array(S * S), f = baseF, amp = 1;
      for (var o = 0; o < 5; o++) {
        var lat = new Float32Array(f * f), i, x, y;
        for (i = 0; i < f * f; i++) { var r = Math.sin(i * 127.1 + seedA * 311.7 + o * 74.7) * 43758.5453; lat[i] = r - Math.floor(r); }
        for (y = 0; y < S; y++) for (x = 0; x < S; x++) {
          var fx = x / S * f, fy = y / S * f, ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
          tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty);
          var a = lat[iy % f * f + ix % f], b = lat[iy % f * f + (ix + 1) % f], c = lat[(iy + 1) % f * f + ix % f], d = lat[(iy + 1) % f * f + (ix + 1) % f];
          out[y * S + x] += amp * (a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty);
        }
        amp *= 0.55; f *= 2;
      }
      var lo = 1e9, hi = -1e9;
      for (var k = 0; k < out.length; k++) { lo = Math.min(lo, out[k]); hi = Math.max(hi, out[k]); }
      return out.map(function (v) { return (v - lo) / (hi - lo); });
    }
    var ch = [layer(1, 4), layer(2, 8), layer(3, 16), layer(4, 6)];
    for (var i = 0; i < S * S; i++) for (var c = 0; c < 4; c++) data[i * 4 + c] = ch[c][i] * 255;
    return data;
  }

  function hex(c) { var n = parseInt(c.slice(1), 16); return [(n >> 16) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; }

  var back, front, gl, fg, U, F, W = 1, H = 1;
  var items = [], active = [], cache = {}, stamp = 0, noiseB, noiseF, archTex, blank;
  var api = {
    bg: { a: 0, col: hex('#0d0809') },
    flood: { p: 0, sx: .5, sy: .5, sx2: .5, sy2: .5, col: hex('#120b0c') },
    ready: false
  };

  function texFrom(ctx, source, opts) {
    ctx.activeTexture(ctx.TEXTURE0); /* never disturb the arch mask held on unit 3 */
    var t = ctx.createTexture();
    ctx.bindTexture(ctx.TEXTURE_2D, t);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);
    var wrap = opts && opts.repeat ? ctx.REPEAT : ctx.CLAMP_TO_EDGE;
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, wrap);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, wrap);
    ctx.pixelStorei(ctx.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    if (opts && opts.raw) ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, opts.raw, opts.raw, 0, ctx.RGBA, ctx.UNSIGNED_BYTE, source);
    else ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, source);
    return t;
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, innerWidth < 900 ? 1.75 : 1.5);
    W = back.clientWidth; H = back.clientHeight;
    [back, front].forEach(function (c) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
    gl.viewport(0, 0, back.width, back.height);
    fg.viewport(0, 0, front.width, front.height);
  }

  /* -------- textures, loaded on demand and evicted when far away -------- */
  function load(url) {
    var e = cache[url];
    if (e) { e.used = ++stamp; return e; }
    e = cache[url] = { url: url, tex: null, w: 1, h: 1, used: ++stamp };
    fetch(url).then(function (r) { return r.blob(); })
      .then(function (b) {
        return window.createImageBitmap ? createImageBitmap(b, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' }) : new Promise(function (res) { var i = new Image(); i.onload = function () { res(i); }; i.src = URL.createObjectURL(b); });
      })
      .then(function (bmp) { e.w = bmp.width; e.h = bmp.height; e.tex = texFrom(gl, bmp); if (bmp.close) bmp.close(); })
      .catch(function () { delete cache[url]; });
    return e;
  }
  function evict(keep) {
    var limit = innerWidth < 900 ? 10 : 18;
    if (Object.keys(cache).length <= limit) return;
    Object.keys(cache).map(function (k) { return cache[k]; }).sort(function (a, b) { return a.used - b.used; })
      .forEach(function (e) {
        if (Object.keys(cache).length <= limit || keep[e.url] || !e.tex) return;
        gl.deleteTexture(e.tex); delete cache[e.url];
      });
  }

  /* -------- lettering: sharp type in red, a soft copy in green -------- */
  function runsOf(el) {
    var lines = [[]];
    (function walk(node) {
      node.childNodes.forEach(function (n) {
        if (n.nodeType === 3) { if (n.textContent.trim() || n.textContent === ' ') lines[lines.length - 1].push({ text: n.textContent.replace(/\s+/g, ' '), cs: getComputedStyle(n.parentElement) }); }
        else if (n.tagName === 'BR') lines.push([]);
        else if (n.nodeType === 1) walk(n);
      });
    })(el);
    return lines;
  }
  function fontOf(cs) { return cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily; }
  function paintShape(item, ctx, w, h) {
    var el = item.el;
    if (item.path) {
      var vb = el.getAttribute('data-vb').split(' ').map(Number), s = Math.min(w / vb[2], h / vb[3]);
      ctx.save(); ctx.translate((w - vb[2] * s) / 2 - vb[0] * s, (h - vb[3] * s) / 2 - vb[1] * s); ctx.scale(s, s);
      ctx.fill(item.path, 'evenodd'); ctx.restore();
      return;
    }
    var cs = getComputedStyle(el), lines = runsOf(el), lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.15;
    ctx.textBaseline = 'middle';
    var padY = (h - lines.length * lh) / 2;
    lines.forEach(function (line, i) {
      var width = 0, spaced = !('letterSpacing' in ctx);
      line.forEach(function (r) {
        ctx.font = fontOf(r.cs);
        var sp = parseFloat(r.cs.letterSpacing) || 0;
        if (!spaced) ctx.letterSpacing = sp + 'px';
        width += ctx.measureText(r.text).width + (spaced ? sp * r.text.length : 0);
      });
      var x = cs.textAlign === 'center' ? (w - width) / 2 : cs.textAlign === 'right' || cs.textAlign === 'end' ? w - width : 0;
      var y = padY + (i + .5) * lh;
      line.forEach(function (r) {
        ctx.font = fontOf(r.cs);
        var sp = parseFloat(r.cs.letterSpacing) || 0;
        if (!spaced) { ctx.letterSpacing = sp + 'px'; ctx.fillText(r.text, x, y); x += ctx.measureText(r.text).width; }
        else if (!sp) { ctx.fillText(r.text, x, y); x += ctx.measureText(r.text).width; }
        else r.text.split('').forEach(function (ch) { ctx.fillText(ch, x, y); x += ctx.measureText(ch).width + sp; });
      });
    });
  }
  function rasterise(item) {
    var el = item.el, w = el.offsetWidth, h = el.offsetHeight;
    if (!w || !h) return;
    var scale = Math.min(window.devicePixelRatio || 1, 2), size = parseFloat(getComputedStyle(el).fontSize) || 40;
    var pad = item.pad = Math.ceil(item.path ? 4 : size * .34), cw = w + pad * 2, ch = h + pad * 2;
    function make(color) {
      var c = document.createElement('canvas'); c.width = cw * scale; c.height = ch * scale;
      var x = c.getContext('2d'); x.scale(scale, scale); x.translate(pad, pad); x.fillStyle = color; paintShape(item, x, w, h); return c;
    }
    var base = make('#f00'), green = make('#0f0'), out = document.createElement('canvas'); out.width = base.width; out.height = base.height;
    var o = out.getContext('2d'); o.fillStyle = '#000'; o.fillRect(0, 0, out.width, out.height);
    o.globalCompositeOperation = 'lighter'; o.drawImage(base, 0, 0);
    var k = Math.max(2, Math.min(9, size / 14)) * scale;
    var small = document.createElement('canvas'); small.width = Math.max(2, out.width / k | 0); small.height = Math.max(2, out.height / k | 0);
    var s = small.getContext('2d'); s.imageSmoothingEnabled = true; s.imageSmoothingQuality = 'high'; s.drawImage(green, 0, 0, small.width, small.height);
    o.imageSmoothingEnabled = true; o.imageSmoothingQuality = 'high'; o.drawImage(small, 0, 0, out.width, out.height);
    if (item.tex) gl.deleteTexture(item.tex);
    item.tex = texFrom(gl, out);
  }

  function makeArch() {
    var S = 512, c = document.createElement('canvas'); c.width = c.height = S;
    var x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, S, S); x.fillStyle = '#fff';
    var m = 10, w = S - m * 2, spring = S * .2, lobes = 5, cx = w / 2, pts = [], i;
    for (i = 0; i <= lobes; i++) { var a = i / lobes * Math.PI / 2; pts.push([m + cx - cx * Math.pow(Math.cos(a), .82), m + spring - spring * Math.pow(Math.sin(a), 1.25)]); }
    function arc(p, q) {
      var dx = q[0] - p[0], dy = q[1] - p[1], len = Math.sqrt(dx * dx + dy * dy), r = len * .58, mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
      var off = Math.sqrt(Math.max(0, r * r - len * len / 4)), ccx = mx + dy / len * off, ccy = my - dx / len * off;
      x.arc(ccx, ccy, r, Math.atan2(p[1] - ccy, p[0] - ccx), Math.atan2(q[1] - ccy, q[0] - ccx), false);
    }
    x.beginPath(); x.moveTo(m, S); x.lineTo(m, m + spring);
    for (i = 0; i < lobes; i++) arc(pts[i], pts[i + 1]);
    for (i = lobes; i > 0; i--) arc([S - pts[i][0], pts[i][1]], [S - pts[i - 1][0], pts[i - 1][1]]);
    x.lineTo(S - m, S); x.closePath(); x.fill();
    var out = document.createElement('canvas'); out.width = out.height = 256;
    var ox = out.getContext('2d'); ox.imageSmoothingQuality = 'high'; ox.drawImage(c, 0, 0, 256, 256);
    return texFrom(gl, out);
  }

  /* -------- items -------- */
  function coverFit(ax, tw, th, px, py) {
    var at = tw / th;
    if (ax > at) { var sy = at / ax; return [1, sy, 0, (1 - sy) * py]; }
    var sx = ax / at; return [sx, 1, (1 - sx) * px, 0];
  }

  api.addPicture = function (el, o) {
    var it = { kind: 1, el: el, url: o.url, sketch: o.sketch, ink: o.ink == null ? 0 : o.ink, rev: o.rev == null ? 0 : o.rev, out: 0, alpha: o.alpha == null ? 1 : o.alpha,
      scrim: 0, sy: .58, top: 0, dim: o.dim || 0, seed: o.seed || [.5, .6], edge: o.edge || 0, live: o.live || 0, px: o.px == null ? .5 : o.px, py: o.py == null ? .5 : o.py, mask: !!o.mask, box: o.box || [0, 0, 1, 1], line: o.line || 0, half: o.half || 0, col: hex(o.col || '#241712') };
    el._ink = it; items.push(it); return it;
  };
  api.addDrawing = function (el, o) {
    var it = { kind: 2, el: el, url: o.url, rev: 0, out: 0, alpha: o.alpha == null ? 1 : o.alpha, seed: o.seed || [.5, 1], px: .5, py: o.py == null ? .5 : o.py };
    el._ink = it; items.push(it); return it;
  };
  api.addLettering = function (el, o) {
    var it = { kind: 3, el: el, rev: 0, out: 0, alpha: 1, col: hex(o.col || '#241712'), foil: o.foil ? 1 : 0, path: o.path ? new Path2D(o.path) : null };
    el._ink = it; items.push(it); rasterise(it); return it;
  };
  api.addDrape = function (el, o) {
    var it = { kind: 4, el: el, url: o.url, sketch: o.room, rev: 1, out: 0, alpha: 1, open: 0, seed: [.5, .5], px: .5, py: .5 };
    el._ink = it; items.push(it); return it;
  };
  api.setColor = function (it, c) { it.col = hex(c); };
  api.refreshType = function () { items.forEach(function (it) { if (it.kind === 3) rasterise(it); }); };
  api.setActive = function (list, ahead) {
    active = list;
    var keep = {};
    ahead.concat(list).forEach(function (it) {
      if (it.url) { load(it.url); keep[it.url] = 1; }
      if (it.sketch) { load(it.sketch); keep[it.sketch] = 1; }
    });
    evict(keep);
  };
  api.preload = function (urls, cb) {
    var entries = urls.map(load), tries = 0;
    (function poll() {
      var done = entries.filter(function (e) { return e.tex; }).length;
      if (cb) cb(done / entries.length);
      if (done < entries.length && tries++ < 200) setTimeout(poll, 100);
    })();
  };

  /* -------- frame -------- */
  function draw(t) {
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(U.uTime, t); gl.uniform2f(U.uSize, W, H);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, noiseB);
    if (api.bg.a > 0.002) {
      gl.uniform4f(U.uRect, -1, 1, 2, -2); gl.uniform1i(U.uMode, 0); gl.uniform1f(U.uAlpha, api.bg.a); gl.uniform3fv(U.uCol, api.bg.col);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    var cr = back.getBoundingClientRect();
    active.forEach(function (it) {
      var vis = it.rev * (1 - it.out);
      if (it.alpha < .003) return;
      if (it.kind !== 1 && vis < .003) return;
      if (it.kind === 1 && vis < .003 && it.ink < .003) return;
      var r = it.el.getBoundingClientRect();
      if (r.bottom < cr.top - 40 || r.top > cr.bottom + 40 || !r.width) return;
      var px = it.pad || 0, sx = r.width / (it.el.offsetWidth || r.width) || 1;
      var x = r.left - px * sx - cr.left, y = r.top - px * sx - cr.top, w = r.width + 2 * px * sx, h = r.height + 2 * px * sx;
      gl.uniform4f(U.uRect, 2 * x / W - 1, 1 - 2 * y / H, 2 * w / W, -2 * h / H);
      gl.uniform2f(U.uSize, w, h); gl.uniform1i(U.uMode, it.kind); gl.uniform1f(U.uAlpha, it.alpha);
      gl.uniform1f(U.uRev, vis);
      if (it.kind === 3) {
        if (!it.tex) return;
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, it.tex);
        gl.uniform3fv(U.uCol, it.col); gl.uniform1f(U.uFoil, it.foil);
      } else {
        var e = cache[it.url]; if (!e || !e.tex) return;
        var fit = coverFit(w / h * (it.half ? 2 : 1), e.w, e.h, it.px, it.py);
        if (it.half) { fit[0] /= 2; fit[2] = it.half < 0 ? fit[2] / 2 : .5 + fit[2] / 2; }
        gl.uniform4f(U.uFit, fit[0], fit[1], fit[2], fit[3]);
        gl.uniform2f(U.uSeed, it.seed[0], it.seed[1]);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, e.tex);
        if (it.kind === 4) {
          var rm = cache[it.sketch]; if (!rm || !rm.tex) return;
          var rf = coverFit(w / h, rm.w, rm.h, .5, .62);
          gl.uniform4f(U.uFit, rf[0], rf[1], rf[2], rf[3]);
          gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, rm.tex);
          gl.uniform1f(U.uInk, it.open);
        }
        if (it.kind === 1) {
          var sk = it.sketch && cache[it.sketch] && cache[it.sketch].tex;
          if (it.sketch && !sk && it.ink < .999) return;
          gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, sk || blank);
          gl.uniform1f(U.uScrim, it.scrim); gl.uniform1f(U.uSY, it.sy); gl.uniform1f(U.uTop, it.top); gl.uniform1f(U.uDim, it.dim); gl.uniform1f(U.uInk, it.ink); gl.uniform1f(U.uEdge, it.edge); gl.uniform1f(U.uLive, it.live);
          gl.uniform3fv(U.uCol, it.col);
          gl.uniform1f(U.uHasMask, it.mask ? 1 : 0); gl.uniform4fv(U.uBox, it.box); gl.uniform1f(U.uLine, it.line);
          gl.uniform3fv(U.uGold, [.72, .54, .25]);
        }
      }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    });

    /* the wash above the page */
    var f = api.flood;
    if (f.p > 0.001 && f.p < 1.999) {
      front.style.visibility = 'visible';
      fg.clearColor(0, 0, 0, 0); fg.clear(fg.COLOR_BUFFER_BIT);
      fg.uniform2f(F.uRes, W, H); fg.uniform1f(F.uP, f.p); fg.uniform1f(F.uTime, t);
      fg.uniform2f(F.uSeed, f.sx, f.sy); fg.uniform2f(F.uSeed2, f.sx2, f.sy2); fg.uniform3fv(F.uCol, f.col);
      fg.drawArrays(fg.TRIANGLE_STRIP, 0, 4);
    } else if (front.style.visibility !== 'hidden') {
      fg.clearColor(0, 0, 0, 0); fg.clear(fg.COLOR_BUFFER_BIT);
      front.style.visibility = 'hidden';
    }
  }

  api.init = function (backCanvas, frontCanvas) {
    back = backCanvas; front = frontCanvas;
    var opt = { alpha: true, premultipliedAlpha: true, antialias: false };
    gl = back.getContext('webgl', opt); fg = front.getContext('webgl', opt);
    if (!gl || !fg) return false;
    try { U = compile(gl, VERT, FRAG_BACK); F = compile(fg, VERT, FRAG_FRONT); } catch (e) { console.error(e); return false; }
    [gl, fg].forEach(function (c) { c.enable(c.BLEND); c.blendFunc(c.ONE, c.ONE_MINUS_SRC_ALPHA); });
    var nd = noiseData(256);
    noiseB = texFrom(gl, nd, { raw: 256, repeat: true }); noiseF = texFrom(fg, nd, { raw: 256, repeat: true });
    blank = texFrom(gl, new Uint8Array([255, 255, 255, 255]), { raw: 1 });
    archTex = makeArch();
    gl.uniform1i(U.uT, 0); gl.uniform1i(U.uS, 1); gl.uniform1i(U.uN, 2); gl.uniform1i(U.uM, 3);
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, archTex);
    resize();
    fg.uniform1i(F.uN, 0);
    fg.uniform4f(F.uRect, -1, 1, 2, -2);
    fg.activeTexture(fg.TEXTURE0); fg.bindTexture(fg.TEXTURE_2D, noiseF);
    addEventListener('resize', function () { resize(); clearTimeout(api._rt); api._rt = setTimeout(api.refreshType, 180); });
    var t0 = performance.now();
    (function loop(now) { requestAnimationFrame(loop); if (!document.hidden) draw((now - t0) / 1000); })(t0);
    api.ready = true;
    return true;
  };
  return api;
})();
