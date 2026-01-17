import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import RegisterPage from "./RegisterPage";

export default async function Register() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;

  if (token) {
    redirect("/dashboard");
  }

  return <RegisterPage />;
}