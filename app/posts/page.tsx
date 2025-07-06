import { createPost } from "@/actions/actions";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function PostPage() {
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: "asc",
    },
    where: {
      published: false,
    },
  });

  return (
    <div className="h-full overflow-scroll mt-20 w-full flex flex-col items-start justify-center text-black px-24">
      see all the posts
      {posts.map((post) => (
        <div
          key={post.id}
          className="p-4 border-b border-gray-
200"
        >
          <h2 className="text-xl font-bold">{post.title}</h2>
          <p className="text-gray-600">{post.content}</p>
          <Link className="text-white bg-blue-400 " href={`posts/${post.id}`}>
            see it
          </Link>
        </div>
      ))}
      <h1 className="text-xl mt-10">add a post </h1>
      <form action={createPost} className="mt-5">
        <div className="mb-5"> 
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Content
          </label>
          <textarea
            id="content"
            name="content"
            className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
