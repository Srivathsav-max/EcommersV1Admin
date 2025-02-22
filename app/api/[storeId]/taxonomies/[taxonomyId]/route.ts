import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { taxonomyId: string, storeId: string } }
) {
  try {
    if (!params.taxonomyId) {
      return new NextResponse("Taxonomy ID is required", { status: 400 });
    }

    // First verify the taxonomy belongs to the store
    const taxonomy = await prismadb.taxonomy.findFirst({
      where: {
        id: params.taxonomyId,
        AND: {
          storeId: params.storeId
        }
      },
      include: {
        taxons: {
          where: {
            parentId: null // Only get root level taxons
          },
          include: {
            children: {
              include: {
                children: true
              }
            }
          }
        }
      }
    });

    if (!taxonomy) {
      return new NextResponse("Taxonomy not found", { status: 404 });
    }
  
    return NextResponse.json(taxonomy);
  } catch (error) {
    console.log('[TAXONOMY_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string, taxonomyId: string } }
) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!params.taxonomyId) {
      return new NextResponse("Taxonomy ID is required", { status: 400 });
    }

    const taxonomy = await prismadb.taxonomy.update({
      where: {
        id: params.taxonomyId
      },
      data: {
        name
      }
    });

    return NextResponse.json(taxonomy);
  } catch (error) {
    console.log('[TAXONOMY_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string, taxonomyId: string } }
) {
  try {
    if (!params.taxonomyId) {
      return new NextResponse("Taxonomy ID is required", { status: 400 });
    }

    const taxonomy = await prismadb.taxonomy.delete({
      where: {
        id: params.taxonomyId
      }
    });

    return NextResponse.json(taxonomy);
  } catch (error) {
    console.log('[TAXONOMY_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
