"use server";

import { db } from "../lib/db";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";

type SignupState ={
   error?: string;
}

export async function signupAction( 
   prevState:SignupState,
   formData:FormData
    ):Promise<SignupState>{
     const email = formData.get("email")?.toString().toLowerCase();
     const password = formData.get("password")?.toString();

     if (!email || !password){
        return {error:"Email and Password are required"};
     }

     const existing = await db.user.findUnique({ where:{email}});
     if (existing) {
      return{error:"User already exists"};
     }

     const hashed = await bcrypt.hash(password,10);

     await db.user.create({
        data:{email,password:hashed}
     });

     //Redirect to login after successful signup
     redirect("/login");
}
