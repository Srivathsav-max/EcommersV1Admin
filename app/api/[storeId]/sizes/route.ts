import { NextResponse } from "next/server";
import prismadb from '@/lib/prismadb';
import { getAdminSession } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    const body = await req.json();
    
    const { name, value } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!value) {
      return new NextResponse("Value is required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized - Store access denied", { status: 403 });
    }

    const size = await prismadb.size.create({
      data: {
        name,
        value,
        storeId: params.storeId,
      }
    });
  
    return NextResponse.json(size);
  } catch (error) {
    console.log('[SIZES_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const sizes = await prismadb.size.findMany({
      where: {
        storeId: params.storeId,
      }
    });

    console.log('Sizes fetched:', sizes); // Debug log
  
    return NextResponse.json({
      data: sizes
    });
  } catch (error) {
    console.log('[SIZES_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
