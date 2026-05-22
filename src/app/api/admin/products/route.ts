import { createClient } from "@supabase/supabase-js";

const productSelect = "id, name, slug, description, price, original_price, stock, image_url, age_range, brand, category_id, is_new, is_sale";

type ProductPayload = {
  name: string;
  slug: string;
  description: string | null;
  price: number;
  original_price: number | null;
  stock: number;
  image_url: string | null;
  age_range: string | null;
  brand: string | null;
  category_id: string | null;
  is_new: boolean;
  is_sale: boolean;
};

const getEnv = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return { error: "Missing Supabase environment variables." } as const;
  }

  return { supabaseUrl, supabaseAnonKey, serviceRoleKey } as const;
};

const getAccessToken = (request: Request) => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;
  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
};

const ensureAdmin = async (request: Request) => {
  const env = getEnv();
  if ("error" in env) {
    return { error: env.error, status: 500 } as const;
  }

  const token = getAccessToken(request);
  if (!token) {
    return { error: "Missing access token.", status: 401 } as const;
  }

  const authClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await authClient.auth.getUser(token);
  if (userError || !userData.user) {
    return { error: "Invalid session.", status: 401 } as const;
  }

  const adminClient = createClient(env.supabaseUrl, env.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  if (profileError) {
    return { error: profileError.message, status: 500 } as const;
  }

  if (profile?.role !== "admin") {
    return { error: "Forbidden", status: 403 } as const;
  }

  return { adminClient } as const;
};

export async function POST(request: Request) {
  const admin = await ensureAdmin(request);
  if ("error" in admin) {
    return Response.json({ message: admin.error }, { status: admin.status });
  }

  const body = (await request.json()) as { payload?: ProductPayload } | null;
  if (!body?.payload) {
    return Response.json({ message: "Missing payload." }, { status: 400 });
  }

  const { data, error } = await admin.adminClient
    .from("products")
    .insert(body.payload)
    .select(productSelect)
    .single();

  if (error || !data) {
    return Response.json({ message: error?.message || "Insert failed." }, { status: 400 });
  }

  return Response.json({ data });
}

export async function PUT(request: Request) {
  const admin = await ensureAdmin(request);
  if ("error" in admin) {
    return Response.json({ message: admin.error }, { status: admin.status });
  }

  const body = (await request.json()) as { id?: string; payload?: ProductPayload } | null;
  if (!body?.id || !body.payload) {
    return Response.json({ message: "Missing id or payload." }, { status: 400 });
  }

  const { data, error } = await admin.adminClient
    .from("products")
    .update(body.payload)
    .eq("id", body.id)
    .select(productSelect)
    .single();

  if (error || !data) {
    return Response.json({ message: error?.message || "Update failed." }, { status: 400 });
  }

  return Response.json({ data });
}

export async function DELETE(request: Request) {
  const admin = await ensureAdmin(request);
  if ("error" in admin) {
    return Response.json({ message: admin.error }, { status: admin.status });
  }

  const body = (await request.json()) as { id?: string } | null;
  if (!body?.id) {
    return Response.json({ message: "Missing id." }, { status: 400 });
  }

  const { error } = await admin.adminClient.from("products").delete().eq("id", body.id);
  if (error) {
    return Response.json({ message: error.message }, { status: 400 });
  }

  return Response.json({ success: true });
}
