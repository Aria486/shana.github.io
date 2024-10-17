"use client";
import React, { useEffect, useState } from "react";
import { Loading } from "@/components";
import { fetchUsers } from "@/services";

export const Dashboard = () => {
  const [users, setUsers] = useState([]);

  const getUsers = async () => {
    try {
      const data = await fetchUsers();
      // setUsers(data);
      console.log(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  useEffect(() => {
    void getUsers();
  }, []);
  return (
    <div>
      coming soon dashboard
      <Loading />
    </div>
  );
};
