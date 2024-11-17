import { createSlice } from "@reduxjs/toolkit"; // นำเข้า `createSlice` จาก Redux Toolkit ซึ่งช่วยให้สร้าง reducers และ actions ได้ง่ายขึ้น

export const adminSlice = createSlice({
  name: "admin",
  initialState: null, // ค่าเริ่มต้นของ state คือ `null`
  reducers: {
    setAdmin: (state, action) => {  // reducer ชื่อ `setAdmin` ใช้สำหรับตั้งค่า admin
      return action.payload; // คืนค่าข้อมูลจาก action.payload เพื่ออัปเดต state
    },
    deleteAdmin: () => { // reducer ชื่อ `deleteAdmin` ใช้สำหรับลบข้อมูล admin
      return null; // คืนค่า `null` เพื่อเคลียร์ค่า state
    },
  },
});

export const { setAdmin, deleteAdmin } = adminSlice.actions; // ส่งออก actions ที่สร้างจาก reducers (`setAdmin` และ `deleteAdmin`)

export default adminSlice.reducer; // ส่งออก reducer ของ slice นี้ เพื่อให้ store ใช้ในการจัดการ state