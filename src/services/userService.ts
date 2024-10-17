import { get, post } from "@/lib/axios";

// 获取用户列表
export const fetchUsers = async () => {
  try {
    const response = await get("/user/delete");
    return response.data;
  } catch (error) {
    console.error("Error fetching users", error);
    throw error;
  }
};
