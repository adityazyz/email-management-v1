"use server"
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

//   console.log("Creating post with title:", title, "and content:", content);
  
  try {
    await prisma.post.create({
      data: {
        title,
        slug:title.replace(/\s+/g, '-').toLowerCase(), // simple slug generation
        content,
        published: false, // default to not published
      },
    });
    
    // Revalidate the page to show the new post
    revalidatePath("/posts"); // or whatever your page path is
  } catch (error) {
    console.error("Error creating post:", error);
    throw new Error("Failed to create post");
  }
}

export async function updatePost(formData: FormData, id: string) {
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    
    try {
        await prisma.post.update({
        where: { id },
        data: {
            title,
            slug: title.replace(/\s+/g, '-').toLowerCase(), // simple slug generation
            content,
        },
        });
        
        // Revalidate the page to show the updated post
        revalidatePath(`/posts/${id}`); // or whatever your page path is
    } catch (error) {
        console.error("Error updating post:", error);
        throw new Error("Failed to update post");
    }
    }

export async function deletePost(id: string) {
    try {
        await prisma.post.delete({
            where: { id },
        });
        
        // Revalidate the page to show the updated post list
        revalidatePath("/posts"); // or whatever your page path is
    } catch (error) {
        console.error("Error deleting post:", error);
        throw new Error("Failed to delete post");
    }
}