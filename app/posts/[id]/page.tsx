// For TypeScript
import { prisma } from "@/lib/prisma";

type PostPageProps = {
  params: {
    id: string;
  };
};

export default async function PostPage({ params }: PostPageProps) {
  const post = await prisma.post.findUnique({
    where: {
      id: params.id,
    },
  });

  return (
    <div className="h-[90vh] w-full flex flex-col items-center justify-center text-black">
      <div>See single post</div>
      <div key={post?.id} className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold">{post?.title}</h2>
        <p className="text-gray-600">{post?.content}</p>
      </div>
    </div>
  );
}
