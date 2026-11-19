/* ====== ตำแหน่งที่วัดจากรูป 01png.png (พิกเซลบนภาพ 1672 x 941) ====== */
const SENSORS = [
  { name: "อุณหภูมิ", min: 10, max: 45,  cx: 351,    toggle: { x: 276,  w: 125 } },
  { name: "ความชื้น", min: 20, max: 100, cx: 674,    toggle: { x: 606,  w: 126 } },
  { name: "ค่าแสง",   min: 0,  max: 100, cx: 1017,   toggle: { x: 953,  w: 124 } },
  { name: "ระดับน้ำ", min: 0,  max: 100, cx: 1362.5, toggle: { x: 1297, w: 121 } }
];
const DIGIT_TOP = 394;      // ขอบบนของตัวเลข
const DIGIT_BOTTOM = 458;   // ขอบล่างของตัวเลข  (สูง 64px)
const TOGGLE_TOP = 589;     // ขอบบนของปุ่ม
const TOGGLE_H = 45;
const INTERVAL = 1500;      // ms อัปเดตค่าสุ่มเมื่อเปิดปุ่ม

const stage = document.getElementById("stage");
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

/* ---------- วางเวทีให้เท่ากับ background-size: cover ---------- */
function fit() {
  const k = Math.max(innerWidth / 1672, innerHeight / 941);
  stage.style.transform = `scale(${k}) translate(-836px, -470.5px)`;
}
addEventListener("resize", fit);

/* ---------- วัดขนาดฟอนต์ให้ตัวเลข "0" สูง 64px พอดี ---------- */
const ctx = document.createElement("canvas").getContext("2d");
let FS = 90, FA = 0, FD = 0, SX = 1;      // font-size, font ascent, font descent, ปรับความกว้างให้เท่ารูป
function calibrate() {
  const family = getComputedStyle(document.body).fontFamily; // ไม่ใช้ แต่กันไว้
  const css = '300 100px "Nunito", "Segoe UI", Arial, sans-serif';
  ctx.font = css;
  const m = ctx.measureText("0");
  const h100 = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
  FS = 100 * (DIGIT_BOTTOM - DIGIT_TOP) / h100;
  ctx.font = `300 ${FS}px "Nunito", "Segoe UI", Arial, sans-serif`;
  const z = ctx.measureText("0");
  FA = z.fontBoundingBoxAscent; FD = z.fontBoundingBoxDescent;
  // เลข "100" ในรูปกว้าง 143px -> ปรับความกว้างฟอนต์ให้เท่ากัน
  const h = ctx.measureText("100");
  SX = 143 / (h.actualBoundingBoxRight + h.actualBoundingBoxLeft);
  return z;
}

/* ---------- วางตัวเลขให้กึ่งกลาง "หมึก" ตรงตำแหน่งเดิม ---------- */
function place(el, text, cx) {
  el.textContent = text;
  ctx.font = `300 ${FS}px "Nunito", "Segoe UI", Arial, sans-serif`;
  const m = ctx.measureText(text);
  const inkW = m.actualBoundingBoxRight + m.actualBoundingBoxLeft;
  const x = cx - (inkW * SX) / 2 + m.actualBoundingBoxLeft * SX;  // จุดเริ่มข้อความ
  const z = ctx.measureText("0");
  const baseline = DIGIT_TOP + z.actualBoundingBoxAscent;  // เส้นฐานของตัวเลข
  const lineTop = baseline - ((FS - (FA + FD)) / 2 + FA);  // line-height:1
  el.style.fontSize = FS + "px";
  el.style.transform = `translate(${x}px, ${lineTop}px) scale(${SX}, 1)`;
  el.style.transformOrigin = "0 0";
}

/* ---------- สร้างตัวเลข + ปุ่ม ---------- */
const items = SENSORS.map((s, i) => {
  const val = document.createElement("div");
  val.className = "value";
  stage.appendChild(val);

  const t = document.createElement("button");
  t.className = "toggle";
  t.setAttribute("role", "switch");
  t.setAttribute("aria-checked", "false");
  t.setAttribute("aria-label", s.name);
  t.style.cssText = `left:${s.toggle.x}px; top:${TOGGLE_TOP}px; width:${s.toggle.w}px; height:${TOGGLE_H}px; --travel:${s.toggle.w - 43}px;`;
  t.innerHTML = '<span class="track"></span><span class="knob"></span>';
  stage.appendChild(t);

  const item = { s, val, t, timer: null };
  t.addEventListener("click", () => {
    const on = t.getAttribute("aria-checked") !== "true";
    t.setAttribute("aria-checked", on);
    clearInterval(item.timer);
    if (on) { update(item); item.timer = setInterval(() => update(item), INTERVAL); }
  });
  return item;
});

function update(item) { place(item.val, String(rand(item.s.min, item.s.max)), item.s.cx); }

function init() {
  calibrate();
  items.forEach(update);
  fit();
  stage.style.visibility = "visible";
}

// รอฟอนต์โหลดก่อนวัดตำแหน่ง
(document.fonts && document.fonts.load
  ? Promise.all([document.fonts.load('300 100px "Nunito"'), document.fonts.ready])
  : Promise.resolve()
).catch(() => {}).then(init);
