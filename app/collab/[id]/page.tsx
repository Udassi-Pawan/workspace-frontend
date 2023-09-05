import Tiptap from "../../components/Tiptap";

export default function Home({ params }: { params: { id: string } }) {
  console.log(params.id);
  return <Tiptap id={params.id} />;
}
