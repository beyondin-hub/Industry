import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { areaForPath, homeForRole, roleFromUser } from "@/lib/auth";

/**
 * Refresca la sesión de Supabase y aplica protección de rutas por rol.
 * Si no hay configuración (modo demo), pasa de largo sin tocar nada — el
 * prototipo sigue abierto con datos demo.
 */
export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let response = NextResponse.next({ request });
  if (!url || !key) return response; // modo demo: sin guardas

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const area = areaForPath(path);

  if (area) {
    // Ruta protegida.
    if (!user) {
      const login = request.nextUrl.clone();
      login.pathname = "/login";
      login.searchParams.set("next", path);
      return NextResponse.redirect(login);
    }
    const role = roleFromUser(user);
    // admin puede entrar a todo; los demás solo a su área.
    if (role !== "admin" && role !== area) {
      const home = request.nextUrl.clone();
      home.pathname = homeForRole(role);
      home.search = "";
      return NextResponse.redirect(home);
    }
  }

  return response;
}
