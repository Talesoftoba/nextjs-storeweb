import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { supabase } from "@/app/lib/supabase";
import { getServerSession } from "next-auth/next";

export const POST = async (req: NextRequest) => {
  try {
    // 1️⃣ Check user session
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Check if user is admin
    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3️⃣ Process form data (your existing code)
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = Number(formData.get("price"));
    const stock = Number(formData.get("stock"));
    const category = formData.get("category") as string;
    const imageFile = formData.get("image") as File | null;

    let imageUrl = "";

    if (imageFile && imageFile.size > 0) {
      const filePath = `images/${Date.now()}-${imageFile.name}`;
      const { data, error } = await supabase.storage
        .from("product-image")
        .upload(filePath, imageFile);

      if (error) throw error;

      const { data: publicData } = supabase.storage
        .from("product-image")
        .getPublicUrl(data.path);

      imageUrl = publicData.publicUrl;
    }

    const product = await db.product.create({
      data: { name, description, price, stock, category, image: imageUrl },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};