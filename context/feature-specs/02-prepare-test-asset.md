อ่าน gemini.md 
# Specification: Canvas 2D Tileset Assembly Engine (Room 1)

## **todo
- [ ] **Analyze and Map Grid Coordinates**: ทำการสแกนไฟล์รูปภาพ `/asset` เพื่อวัดและระบุตำแหน่งพิกเซล $X, Y$, Width, Height เชิงสัดส่วนลงในระบบตาราง Grid ขนาด 64x64 พิกเซล
- [ ] **Generate `data/tileset-asset.json`**: สร้างไฟล์คอนฟิกูเรชันกลาง (Asset Atlas Configuration) เพื่อจัดเก็บข้อมูลพิกัดสไลซ์รูปภาพทั้งหมด ห้ามทิ้งค่า Hardcode พิกเซลไว้ในโค้ดดิบ
- [ ] **Develop `src/components/canvas/room-1.tsx`**: พัฒนา Next.js Client Component ควบคุมลูปเรนเดอร์ Canvas 2D ที่ความเร็ว 60fps
- [ ] **Implement Layered Rendering Layout Matrix**: เขียนลอจิกอ่านอาเรย์ 2 มิติ (2D Layout Matrix Array) เพื่อปูพื้นไม้ วาดขอบพรม และประกอบเสาผนังออฟฟิศตามสเปกโครงสร้างห้องทำงาน

## **warning
- **AI Art Scale Distortion**: เนื่องจากไฟล์ภาพ `ภ.png` ถูกสร้างขึ้นมาจาก Generative AI สัดส่วนพิกเซลของเส้นตารางและไอเทมบางชิ้นจะไม่ตรงล็อก Grid 64px เป๊ะๆ (มีอาการ Pixel Drift) ตัวโค้ดต้องออกแบบโครงสร้างให้รองรับการปรับแต่งชดเชยระยะ (Fine-tune Boundary Offset) ในไฟล์ JSON ได้ง่าย
- **Z-Index Clipping (Door & Wall Height)**: ชิ้นส่วนโครงสร้างประเภทประตูและผนังในรูปภาพมีสัดส่วนความสูงเกิน 1 บล็อกมาตรฐาน ($64 \times 128\text{px}$) ลอจิก Canvas ต้องใช้วิธีเรนเดอร์เรียงลำดับจากบนลงล่าง (Row-by-Row Rendering) เพื่อป้องกันไม่ให้ภาพเลเยอร์พื้นหลังไปทับส่วนหัวของสิ่งก่อสร้าง
- **Canvas State Pollution**: การสั่งสั่งคำสั่ง `ctx.drawImage` ซ้ำๆ 60 ครั้งต่อวินาทีโดยไม่จัดการสเกลหน่วยความจำ อาจทำให้เกิดอาการ Frame-rate Drop (Lag) ต้องมีระบบเคลียร์ล้างหน้าจอและหน่วยความจำทุกครั้งที่ Unmount Component

## **features
- **Bi-Dimensional Matrix Grid Parser**: แปลงข้อมูลตัวเลขใน Array 2 มิติให้กลายเป็นฉากแผนผังออฟฟิศจำลองโดยอัตโนมัติ ช่วยให้ผู้พัฒนาสามารถขยายขนาดหรือปรับเปลี่ยนผังห้องได้ง่ายๆ ในอนาคต
- **Native Frame-Rate Synchronization**: ผูกลูปการวาดภาพเข้ากับระบบ `requestAnimationFrame` ของเบราว์เซอร์โดยตรง เพื่อการันตีความลื่นไหลระดับ 60fps ตามประสิทธิภาพหน้าจอจริงของผู้ใช้งาน
- **Responsive Canvas Aspect Ratio**: ตัวคานวาสสามารถคำนวณและสเกลขนาดภาพให้แสดงผลอยู่กึ่งกลาง (Center-aligned Frame) ภายในกล่อง UI Container เสมอ



## **checklist
- [ ] ไฟล์ `data/tileset-asset.json` มีโครงสร้างจัดเก็บที่แยกแยะชื่อชิ้นส่วน และระบุค่าพิกัด `x`, `y`, `w`, `h` ของแต่ละไทล์ครบถ้วน
- [ ] มีการประกาศ Type Interface ป้องกัน Type Error ตอนที่ดึงวัตถุจาก JSON เข้ามาใช้ในไฟล์ `.tsx`
- [ ] ลอจิกการเรนเดอร์ใน `room-1.tsx` แยกเลเยอร์ในการวาดภาพชัดเจน (Floor Base Layer ➡️ Object/Structure Layer)
- [ ] มีการเขียนฟังก์ชันล้างหน่วยความจำ (Clean-up Function) เพื่อสั่ง `cancelAnimationFrame` ทุกครั้งที่ Component Unmount ป้องกันปัญหา Memory Leak
- run build โดยไม่มี error