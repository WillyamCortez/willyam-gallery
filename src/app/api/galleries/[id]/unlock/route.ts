import { NextRequest, NextResponse } from "next/server";
import { mockGalleries } from "@/lib/mock-data";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { pin } = await request.json();
    const galleryIdOrSlug = params.id;

    // Busca galeria nos mocks ou no Supabase
    const gallery = mockGalleries.find(
      (g) => g.id === galleryIdOrSlug || g.slug === galleryIdOrSlug
    );

    if (!gallery) {
      return NextResponse.json({ error: "Galeria não encontrada" }, { status: 404 });
    }

    if (!gallery.access_pin || gallery.access_pin === pin) {
      const response = NextResponse.json({ success: true, authorized: true });
      // Define cookie seguro de sessão da galeria
      response.cookies.set(`gallery_access_${gallery.slug}`, "authorized", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 dias
        path: "/",
      });
      return response;
    }

    return NextResponse.json({ success: false, error: "PIN incorreto" }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
