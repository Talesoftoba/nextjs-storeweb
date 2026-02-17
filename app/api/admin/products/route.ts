import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { supabase } from "@/app/lib/supabase";

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = Number(formData.get("price"));
    const stock = Number(formData.get("stock"));
    const category = formData.get("category") as string;
    const imageFile = formData.get("image") as File | null;

    let imageUrl = "";

    if (imageFile && imageFile.size > 0) {
      console.log("Uploading file to Supabase...");
      const filePath = `images/${Date.now()}-${imageFile.name}`;
      const { data, error } = await supabase.storage
        .from("product-image") // your bucket name
        .upload(filePath, imageFile);

      if (error) {
        console.error("Supabase upload error:", error.message);
        throw error;
      }

      console.log("Getting public URL...");
      const { data: publicData } = supabase.storage
        .from("product-image")
        .getPublicUrl(data.path);

      imageUrl = publicData.publicUrl;
      console.log("Image URL:", imageUrl);
    }

    console.log("Creating product in database...");
    
    const product = await db.product.create({
      data: { name, description, price, stock, category, image: imageUrl },
    });

    console.log("Product created:", product);
    return NextResponse.json(product, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Product creation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};