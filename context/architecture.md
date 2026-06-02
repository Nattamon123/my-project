# Architecture Context

## Stack

| Layer     | Technology                  | Role                                     |
| --------- | --------------------------- | ---------------------------------------- |
| Framework | Next.js (App Router)        | Frontend UI and Hosting                  |
| API       | Hono + TypeScript           | Backend API & WebSocket Server           |
| UI        | Tailwind + Canvas 2D (HTML5)| Styling and High-performance Animation   |
| Database  | Supabase (PostgreSQL)       | Global State & Knowledge Base Storage    |
| Queue     | Redis (Pub/Sub)             | Message Queue between Room 3 and Room 2  |

## System Boundaries
- `src/agents/war-room` — [ห้อง 1] รับผิดชอบระบบ Multi-Agent Setup, Prompts, และลอจิกการดีเบต (Sandbox ห้ามยุ่งกับห้องอื่น)
- `src/pipeline/stocks` — [ห้อง 2 & 3] รับผิดชอบระบบ Ingestion ดึงข่าว คัดกรอง คิวใน Redis และคำนวณราคาหุ้น
- `src/components/canvas` — รับผิดชอบ Render Loop 60fps, Sprite Animation ของบอท และ Canvas Mouse Hit Detection

## Storage Model
- **Supabase (PostgreSQL)**: เก็บประวัติการดีเบตของห้อง 1 (`war_room_sessions`), ข้อมูลข่าวสารแยกหมวดหมู่ของห้อง 3 (`news_feeds`), และสถานะราคาหุ้นของห้อง 2 (`stock_metrics`)
- **Redis (In-Memory)**: ทำหน้าที่เป็น Message Queue วิ่งส่งดาต้าระหว่างท่อส่งข่าวสาร (Room 3 -> Room 2)

## Invariants
1. **Isolation Rule**: โค้ดในส่วน `src/agents/war-room` ห้าม Import หรือมี Dependency ร่วมกับ `src/pipeline/stocks` เด็ดขาด
2. **Throttling Rule**: เมื่อห้องใดอยู่ในสถานะ Idle ลูปหลังบ้านต้องปรับความถี่ให้ช้าลงเพื่อเซฟโควตา API และ Token
3. **Token Limit Rule**: ห้อง 1 การดีเบตต้องจบภายใน 2 รอบ (สูงสุด 6 ข้อความต่อรอบการทำงาน) ห้ามลูปไม่มีสิ้นสุด
4. **State-Driven UI**: Canvas หน้าบ้านห้ามคำนวณลอจิกของบอทเอง ต้องวาดตาม State ที่ได้รับจาก WebSocket เท่านั้น