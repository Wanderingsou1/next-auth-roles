import { redirect } from "next/navigation";
import RegisterPage from "./RegisterPage";
import {supabaseServer} from "@/lib/supabaseServer";

export default async function Register() {

  const supabase = await supabaseServer();

  const {data: {session},} = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return <RegisterPage />;
}