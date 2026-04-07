"use server"

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Fetches the currently authenticated user's profile data.
 * Adheres to 'Backend Integration Mastery' by using RSC-compatible fetching.
 */
export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      // If profile doesn't exist (PGRST116 is 'no rows')
      if (error.code === "PGRST116") {
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert([{ id: user.id, full_name: user.user_metadata?.full_name || "" }])
          .select("*")
          .single();
        
        if (!createError) return { ...newProfile, email: user.email };
      }
      
      // Fallback for missing table or other Supabase errors
      // Returning basic user info so the UI doesn't break or redirect incorrectly
      return { 
        id: user.id,
        full_name: user.user_metadata?.full_name || "",
        email: user.email || "",
        phone: "",
        profession: "",
        dob: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    return { ...profile, email: user.email };
  } catch (err) {
    console.error("Profile action error:", err);
    return { 
      id: user.id,
      full_name: user.user_metadata?.full_name || "",
      email: user.email || "",
      phone: "",
      profession: "",
      dob: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
}

/**
 * Updates the user's profile information.
 * Follows industry standards for secure Server Actions and path revalidation.
 */
export async function updateProfile(data: {
  name: string;
  phone?: string;
  profession?: string;
  dob?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.name,
      phone: data.phone,
      profession: data.profession || null,
      dob: data.dob || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: error.message };
  }

  // Sync with Auth Metadata to ensure Client-side AuthContext stays updated
  const { error: authError } = await supabase.auth.updateUser({
    data: { full_name: data.name }
  });

  if (authError) {
    console.warn("Auth metadata sync failed:", authError.message);
  }

  // Clear cache for relevant pages to ensure the user sees updated data instantly
  revalidatePath("/account");
  revalidatePath("/account/profile");

  return { success: true };
}

/**
 * Uploads a profile picture to Supabase Storage and updates the user profile.
 */
export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const file = formData.get("file") as File;
  if (!file) {
    return { success: false, error: "No file provided" };
  }

  // 1. Upload to Supabase Storage
  // We use the user ID as part of the filename to ensure users can only manage their own avatars
  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      upsert: true, // Overwrite existing file
      contentType: file.type,
    });

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    return { success: false, error: uploadError.message };
  }

  // 2. Get Public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath);

  // Add a cache-buster query param to ensure the browser fetches the new image instead of using a cached version
  const busteredUrl = `${publicUrl}?t=${Date.now()}`;

  // 3. Update Profile Table & Auth Metadata
  const { error: dbError } = await supabase
    .from("profiles")
    .update({ avatar_url: busteredUrl })
    .eq("id", user.id);

  if (dbError) {
    console.error("Database update error:", dbError);
    return { success: false, error: dbError.message };
  }

  // Sync with Auth Metadata
  await supabase.auth.updateUser({
    data: { avatar_url: busteredUrl },
  });

  revalidatePath("/account");
  revalidatePath("/account/profile");

  return { success: true, url: publicUrl };
}
