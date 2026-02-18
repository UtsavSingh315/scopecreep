export default async function Page({ params }) {
  const { user } = await params;
  console.log("user:", user);
  return <div>My Post: {user}</div>;
}
