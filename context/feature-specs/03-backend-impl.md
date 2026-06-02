# Feature Specification: Backend Core & Message Queue Implementation (03-backend-impl)

## **todo
- [ ] **Initialize Hono App with WebSocket Support**: เซ็ตอัปโครงสร้างโปรเจกต์ Hono Server ร่วมกับโมดูล Node.js HTTP เพื่อเปิดสิทธิ์การใช้งาน WebSockets (`@hono/node-ws`)
- [ ] **Implement ioredis Queue Infrastructure**: สร้างระบบท่อส่งข้อมูลกลาง (Message Queue) แยกเป็น 2 แชนเนลหลัก: `queue:raw_news` และ `queue:processed_signals`
- [ ] **Develop Dynamic Room Throttle Logic**: เขียนลอจิกควบคุมความถี่ (Rate Limiter / Interval Controller) ที่ปรับเปลี่ยนความเร็วการ Fetch/Process ตามสถานะ `Active` หรือ `Idle` ของแต่ละห้องที่ส่งมาจากหน้าบ้าน
- [ ] **Build Room 1 Agent Debate Orchestrator**: พัฒนาคลาสควบคุมสำหรับ Multi-Agent (War Room) กำหนดลูปการดึงประวัติการคุยจาก Supabase และล็อกรอบการดีเบตสูงสุดไว้ที่ 2 รอบ (Max 6 messages)
- [ ] **Set Up Supabase Client Persistence Layer**: เชื่อมต่อฐานข้อมูล Supabase เพื่อทำหน้าที่เป็น Global Shared Memory จัดเก็บผลลัพธ์จากทุกห้องผ่าน Connection Pool

## **warning
- **WebSocket Connection Pollution (Ghost Clients)**: การเปิด-ปิดเบราว์เซอร์หรือสลับหน้าจอของหน้าบ้านอาจทำให้เกิด Connection ค้างที่หลังบ้าน (Memory Leak) ต้องเขียนลอจิกดักจับ `ws.on('close')` เพื่อทำลาย Instance และล้าง State เสมอ
- **Token Bleeding (Infinite AI Loop)**: เอเจนท์ในห้อง 1 อาจพ่นข้อความวนลูปหากไม่มีตัวคุมคิว ห้ามปล่อยให้เอเจนท์ยิงหากันตรงๆ ต้องใช้หลังบ้านเป็น Moderator คุม State และนับ Request Count เสมอ
- **Redis Connection Starvation**: การใช้ `ioredis` เชื่อมต่อทั้งระบบ Queue และระบบจำลองราคาหุ้นพร้อมกัน อาจทำให้ Connection เต็ม ต้องแยก Instance ระหว่าง `redisClient` (ทั่วไป) และ `redisSubscriber` (สำหรับดักฟัง Pub/Sub)

## **features
- **State-Driven Active/Idle Throttling**: ระบบประหยัด Token อัจฉริยะ หลังบ้านจะปรับลดความถี่ในการทำงานของ Background Workers ลง 80% ทันทีเมื่อหน้าบ้านส่งสัญญาณ `room_idle` เพื่อเซฟโควตา Free Tier API
- **Cross-Room Shared Memory Database**: ระบบคลังสมองส่วนกลางที่ใช้ Supabase เป็นตัวกลาง บอททุกห้องสามารถสืบค้น (Query) และอัปเดตสถานะงานของกันและกันได้โดยไม่เกิดสภาวะข้อมูลขัดแย้ง (Race Conditions)
- **Token-by-Token Live Streaming**: ระบบพ่นข้อมูลคำพูดของเอเจนท์ในห้อง 1 แบบ Stream สด (Chunk-by-Chunk) ผ่าน WebSocket ทำให้หน้าบ้านสามารถวาดกล่องคำพูดบอทแบบเรียลไทม์ได้โดยไม่เกิดอาการหน่วง

## **technology
- **Backend Runtime**: Hono Framework running on Node.js with TypeScript Strict Mode (`strict: true`)
- **Real-time Engine**: `@hono/node-ws` (Native WebSocket integration for Hono)
- **Message Queue & Pub/Sub**: `ioredis` (Enterprise-grade Redis client with Auto-Reconnect and Offline Queue)
- **Persistence & Shared Memory**: Supabase (PostgreSQL) via Official `@supabase/supabase-js` client
- **AI Inference Fallback Wrapper**: Google AI Studio (Gemini 3.1 Flash-Lite) as Primary SDK, Groq SDK (Llama 3.1 8B) as Secondary Fallback API

## **checklist
- [ ] สคริปต์เชื่อมต่อใน `src/lib/redis.ts` มีการแยก Instance ของ Client และ Subscriber ชัดเจน
- [ ] ลอจิกการวนลูปดีเบตในห้อง 1 มีระบบ Hard-cap เคาน์เตอร์นับจำนวนรอบ (`currentRound >= 2`) เพื่อตัดวงจรป้องกัน Token แตก
- [ ] โค้ดหลังบ้านไม่มีการใช้ฟังก์ชันที่ทำงานค้างแบบระยะยาว (Long-lived Background Work) นอกขอบเขตของ Worker Queue ตามกฎของ `architecture.md`
- [ ] โครงสร้าง JSON Payload ที่พ่นออกทาง WebSocket มีรูปแบบที่แน่นอน (`{ room: string, event: string, status: string, data: any }`) เพื่อให้หน้าบ้าน Canvas 2D นำไปจับคู่วาดภาพได้ทันที
- [ ] ระบบมีการตรวจสอบสิทธิ์และดักจับ Error Code `429 Too Many Requests` จาก AI API เพื่อสั่งให้ระบบสลับหัวจ่าย (Fallback Manager) ทำงานโดยที่ระบบ Pipeline รวมไม่หยุดชะงัก