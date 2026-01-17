import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;

  if(token) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}