// src/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
// import dbConnect from "@/lib/mongoose";
// import User from "@/models/User";
import { successResponse, errorResponse } from "@/utils/apiResponse";

export async function GET(req: NextRequest) {
  // await dbConnect();
  try {
    // const users = await User.find({});
    return NextResponse.json(
      successResponse({ id: 11 }, "Users fetched successfully")
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(errorResponse("Failed to fetch users"), {
      status: 500
    });
  }
}

export async function POST(req: NextRequest) {
  // await dbConnect();

  try {
    const { name, email, age } = await req.json();
    // const newUser = new User({ name, email, age });
    // const savedUser = await newUser.save();
    return NextResponse.json(
      successResponse({ id: 222 }, "User created successfully"),
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(errorResponse("Failed to create user"), {
      status: 500
    });
  }
}
