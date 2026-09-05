import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const users = [
    { email: "alice@test.com", password: "TestPass123!", username: "alice", full_name: "Alice Sharma", skills: ["React", "TypeScript", "Node.js"], github: "alice" },
    { email: "bob@test.com", password: "TestPass123!", username: "bob", full_name: "Bob Patel", skills: ["Python", "Django", "PostgreSQL"], github: "bob" },
    { email: "charlie@test.com", password: "TestPass123!", username: "charlie", full_name: "Charlie Verma", skills: ["Go", "Docker", "Kubernetes"], github: "charlie" },
    { email: "diana@test.com", password: "TestPass123!", username: "diana", full_name: "Diana Gupta", skills: ["React", "Figma", "CSS"], github: "diana" },
    { email: "eve@test.com", password: "TestPass123!", username: "eve", full_name: "Eve Singh", skills: ["Rust", "WebAssembly", "C++"], github: "eve" },
  ];

  const results = [];

  for (const u of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.full_name },
    });
    if (error) {
      results.push({ email: u.email, error: error.message });
      continue;
    }
    await supabase.from("profiles").upsert({
      id: data.user.id,
      username: u.username,
      full_name: u.full_name,
      email: u.email,
      skills: u.skills,
      github_username: u.github,
    }, { onConflict: "id" });
    results.push({ email: u.email, ok: true, id: data.user.id });
  }

  return new Response(JSON.stringify(results, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
});
